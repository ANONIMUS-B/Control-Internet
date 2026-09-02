<?php

namespace App\Http\Controllers;

use App\Models\MonthlyReport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use ZipArchive;
use Illuminate\Support\Str;

class BulkExportController extends Controller
{
    /**
     * Mostrar vista de exportación masiva
     */
    public function index(Request $request)
    {
        // ✅ PROTECCIÓN DE RUTA - Verificar rol
        $user = $request->user();
        if (!in_array($user->role, ['admin', 'specialist', 'super_admin'])) {
            return redirect()->route('dashboard')->with('error', 'No tienes permiso para acceder a esta sección.');
        }

        $query = MonthlyReport::with(['institution', 'user']);

        // ✅ Si es director, solo ver sus instituciones
        if ($user->role === 'director') {
            $institutionIds = $user->institutions()->pluck('educational_institutions.id');
            $query->whereIn('institution_id', $institutionIds);
        }

        // ✅ FILTROS POR MES, AÑO Y ESTADO
        if ($request->filled('month')) {
            $query->where('month', (int) $request->month);
        }

        if ($request->filled('year')) {
            $query->where('year', (int) $request->year);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // ✅ Ordenar por fecha de creación
        $reports = $query->orderBy('created_at', 'desc')->get();

        // ✅ Meses en español
        $months = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
        ];

        return inertia('Reports/BulkExport', [
            'reports' => $reports,
            'months' => $months,
            'currentYear' => date('Y'),
            'filters' => [
                'month' => $request->input('month'),
                'year' => $request->input('year'),
                'status' => $request->input('status'),
            ],
        ]);
    }

    /**
     * Exportar reportes seleccionados a ZIP
     */
    public function export(Request $request)
    {
        // ✅ PROTECCIÓN DE RUTA - Verificar rol
        $user = $request->user();
        if (!in_array($user->role, ['admin', 'specialist', 'super_admin'])) {
            return redirect()->route('dashboard')->with('error', 'No tienes permiso para acceder a esta sección.');
        }

        $request->validate([
            'report_ids' => 'required|array|min:1',
            'report_ids.*' => 'exists:monthly_reports,id',
        ]);

        $reportIds = $request->report_ids;
        
        // ✅ Obtener reportes con todas las relaciones
        $reports = MonthlyReport::with(['institution', 'user', 'evidences'])
            ->whereIn('id', $reportIds)
            ->get();

        if ($reports->isEmpty()) {
            return back()->with('error', 'No se encontraron reportes para exportar.');
        }

        // ✅ CREAR DIRECTORIO TEMPORAL
        $tempDir = storage_path('app/temp');
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0777, true);
        }

        $uniqueDir = $tempDir . '/' . uniqid();
        mkdir($uniqueDir, 0777, true);

        $months = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
        ];

        $stateLabels = [
            'operative' => 'OPERATIVO',
            'intermittent' => 'INTERMITENTE',
            'no_service' => 'SIN SERVICIO'
        ];

        // ✅ CARGAR LA IMAGEN DEL HEADER UNA SOLA VEZ (base64)
        $headerLogoBase64 = $this->getHeaderLogoBase64();

        $pdfFiles = [];
        $errors = [];

        foreach ($reports as $index => $report) {
            try {
                // ✅ Recargar relaciones para asegurar datos frescos
                $report->load(['institution', 'user', 'evidences']);
                $report->month_name = $months[$report->month] ?? $report->month;

                // Evidencias en base64
                $evidenciasBase64 = [];
                if ($report->evidences && $report->evidences->count() > 0) {
                    foreach ($report->evidences as $evidence) {
                        $path = storage_path('app/public/' . $evidence->file_path);
                        if (file_exists($path)) {
                            $type = pathinfo($path, PATHINFO_EXTENSION);
                            $data = file_get_contents($path);
                            $evidenciasBase64[] = 'data:image/' . $type . ';base64,' . base64_encode($data);
                        }
                    }
                }

                // Firma en base64
                $signatureBase64 = null;
                if ($report->user && $report->user->hasSignature()) {
                    $path = storage_path('app/public/' . $report->user->signature_path);
                    if (file_exists($path)) {
                        $type = pathinfo($path, PATHINFO_EXTENSION);
                        $data = file_get_contents($path);
                        $signatureBase64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
                    }
                }

                // ✅ GENERAR PDF
                $pdf = Pdf::loadView('pdf.reporte_conformidad', [
                    'report' => $report,
                    'evidenciasBase64' => $evidenciasBase64,
                    'signatureBase64' => $signatureBase64,
                    'stateLabels' => $stateLabels,
                    'headerLogoBase64' => $headerLogoBase64,
                ]);

                $pdf->setPaper('A4', 'portrait');
                $pdf->setOptions([
                    'defaultFont' => 'Times New Roman',
                    'isHtml5ParserEnabled' => true,
                    'isRemoteEnabled' => true,
                    'chroot' => [
                        storage_path('app/public'),
                        public_path(),
                    ],
                ]);

                // ✅ Guardar PDF con nombre único
                $filename = 'REPORTE_' . ($report->institution->modular_code ?? '000') . '_' . $report->month . '_' . $report->year . '_' . $report->id . '.pdf';
                $pdfPath = $uniqueDir . '/' . $filename;
                file_put_contents($pdfPath, $pdf->output());
                $pdfFiles[] = $pdfPath;
                
                Log::info('PDF generado: ' . $filename);
                
            } catch (\Exception $e) {
                $errorMsg = 'Error en reporte ID ' . $report->id . ': ' . $e->getMessage();
                $errors[] = $errorMsg;
                Log::error($errorMsg);
                continue;
            }
        }

        // ✅ Verificar si se generaron archivos
        if (empty($pdfFiles)) {
            return back()->with('error', 'No se pudieron generar los PDFs. ' . implode('; ', $errors));
        }

        // ✅ CREAR ZIP
        $zipFileName = 'reportes_' . now()->format('Y-m-d_H-i') . '.zip';
        $zipPath = $tempDir . '/' . $zipFileName;

        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === TRUE) {
            foreach ($pdfFiles as $file) {
                if (file_exists($file)) {
                    $zip->addFile($file, basename($file));
                }
            }
            $zip->close();
        }

        // ✅ VERIFICAR QUE EL ZIP EXISTE
        if (!file_exists($zipPath) || filesize($zipPath) === 0) {
            return back()->with('error', 'Error al crear el archivo ZIP.');
        }

        // ✅ LIMPIAR ARCHIVOS TEMPORALES
        $response = response()->download($zipPath, $zipFileName)->deleteFileAfterSend(true);

        register_shutdown_function(function () use ($uniqueDir) {
            if (file_exists($uniqueDir)) {
                $files = glob($uniqueDir . '/*');
                foreach ($files as $file) {
                    if (is_file($file)) {
                        @unlink($file);
                    }
                }
                @rmdir($uniqueDir);
            }
        });

        return $response;
    }

    /**
     * Obtener la imagen del header en base64
     */
    private function getHeaderLogoBase64(): ?string
    {
        $headerPath = public_path('images/logos_header.png');
        
        if (file_exists($headerPath)) {
            $type = pathinfo($headerPath, PATHINFO_EXTENSION);
            $data = file_get_contents($headerPath);
            return 'data:image/' . $type . ';base64,' . base64_encode($data);
        }
        
        // ✅ Si no existe, intentar con otra ruta
        $headerPath = storage_path('app/public/images/logos_header.png');
        if (file_exists($headerPath)) {
            $type = pathinfo($headerPath, PATHINFO_EXTENSION);
            $data = file_get_contents($headerPath);
            return 'data:image/' . $type . ';base64,' . base64_encode($data);
        }

        return null;
    }
}