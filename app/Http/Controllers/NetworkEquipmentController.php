<?php

namespace App\Http\Controllers;

use App\Models\NetworkEquipment;
use App\Models\EducationalInstitution;
use App\Imports\NetworkEquipmentsImport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class NetworkEquipmentController extends Controller
{
    /**
     * Mostrar lista de equipos de red
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = NetworkEquipment::query();

        // ✅ Si es director, mostrar solo sus instituciones
        if ($user->role === 'director') {
            $institutionCodes = DB::table('institution_user')
                ->join('educational_institutions', 'educational_institutions.id', '=', 'institution_user.educational_institution_id')
                ->where('institution_user.user_id', $user->id)
                ->pluck('educational_institutions.local_code')
                ->toArray();
            
            $institutionCount = count($institutionCodes);
            
            if (empty($institutionCodes)) {
                return Inertia::render('NetworkEquipments/Index', [
                    'equipments' => [
                        'data' => [],
                        'links' => [],
                        'total' => 0,
                        'per_page' => 15,
                        'current_page' => 1,
                        'last_page' => 1,
                    ],
                    'stats' => [
                        'total' => 0,
                        'operative' => 0,
                        'by_brand' => [],
                    ],
                    'filters' => [
                        'search' => $request->input('search'),
                        'status' => $request->input('status'),
                        'sort' => $request->input('sort', 'institution_name'),
                        'direction' => $request->input('direction', 'asc'),
                        'per_page' => 15,
                    ],
                    'institutionCount' => 0,
                ]);
            }
            
            $query->whereIn('local_code', $institutionCodes);
        }

        // ✅ Guardar copia de la consulta para estadísticas
        $statsQuery = clone $query;

        // ✅ Filtros
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('institution_name', 'LIKE', "%{$search}%")
                  ->orWhere('local_code', 'LIKE', "%{$search}%")
                  ->orWhere('brand', 'LIKE', "%{$search}%")
                  ->orWhere('model', 'LIKE', "%{$search}%")
                  ->orWhere('mac_address', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // ✅ Ordenar
        $sortField = $request->input('sort', 'institution_name');
        $sortDirection = $request->input('direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        $perPage = (int) $request->input('per_page', 15);
        $equipments = $query->paginate($perPage)->withQueryString();

        // ✅ Estadísticas
        if ($request->filled('search')) {
            $search = $request->search;
            $statsQuery->where(function ($q) use ($search) {
                $q->where('institution_name', 'LIKE', "%{$search}%")
                  ->orWhere('local_code', 'LIKE', "%{$search}%")
                  ->orWhere('brand', 'LIKE', "%{$search}%")
                  ->orWhere('model', 'LIKE', "%{$search}%")
                  ->orWhere('mac_address', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $statsQuery->where('status', $request->status);
        }

        $stats = [
            'total' => $statsQuery->count(),
            'operative' => (clone $statsQuery)->where('status', 'OPERATIVO')->count(),
            'by_brand' => (clone $statsQuery)->select('brand', DB::raw('count(*) as total'))
                ->groupBy('brand')
                ->get(),
        ];

        // ✅ Obtener conteo de instituciones para el director
        $institutionCount = 0;
        if ($user->role === 'director') {
            $institutionCount = DB::table('institution_user')
                ->where('user_id', $user->id)
                ->count();
        }

        return Inertia::render('NetworkEquipments/Index', [
            'equipments' => $equipments,
            'stats' => $stats,
            'filters' => [
                'search' => $request->input('search'),
                'status' => $request->input('status'),
                'sort' => $sortField,
                'direction' => $sortDirection,
                'per_page' => $perPage,
            ],
            'institutionCount' => $institutionCount,
        ]);
    }

    /**
     * Mostrar vista de importación (solo super_admin)
     */
    public function importIndex(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'super_admin') {
            return redirect()->route('network-equipments.index')->with('error', 'No tienes permiso para importar equipos. Solo el Super Administrador puede hacerlo.');
        }

        return Inertia::render('NetworkEquipments/Import', [
            'templateUrl' => route('network-equipments.import.template'),
        ]);
    }

    /**
     * Procesar importación de equipos (solo super_admin)
     */
    public function import(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'super_admin') {
            return redirect()->route('network-equipments.index')->with('error', 'No tienes permiso para importar equipos. Solo el Super Administrador puede hacerlo.');
        }

        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
        ]);

        try {
            $file = $request->file('file');
            
            Log::info('=== INICIO IMPORTACIÓN EQUIPOS DE RED ===');
            Log::info('Nombre del archivo: ' . $file->getClientOriginalName());
            Log::info('Tamaño: ' . $file->getSize() . ' bytes');

            $import = new NetworkEquipmentsImport();
            Excel::import($import, $file);

            $imported = $import->getImportedCount();
            $skipped = $import->getSkippedCount();
            $errors = $import->getErrors();

            Log::info('Equipos importados: ' . $imported);
            Log::info('Filas omitidas: ' . $skipped);
            Log::info('Errores: ' . json_encode($errors));

            if ($imported > 0) {
                $message = "✅ Se importaron {$imported} equipos correctamente.";
                if ($skipped > 0) {
                    $message .= " {$skipped} filas fueron omitidas.";
                }
                if (!empty($errors)) {
                    $message .= " Detalles: " . implode('; ', $errors);
                }
                return redirect()->route('network-equipments.index')->with('success', $message);
            } else {
                return redirect()->route('network-equipments.import')->with('error', '❌ No se importó ningún equipo. Verifica que el archivo tenga datos válidos y que los códigos locales existan en el sistema.');
            }

        } catch (\Exception $e) {
            Log::error('ERROR IMPORT EQUIPOS: ' . $e->getMessage());
            Log::error('LINEA: ' . $e->getLine());
            Log::error('ARCHIVO: ' . $e->getFile());
            
            return redirect()->route('network-equipments.import')->with('error', '❌ Error al importar: ' . $e->getMessage());
        }
    }

    /**
     * Descargar plantilla para equipos (solo super_admin)
     */
    public function downloadTemplate(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'super_admin') {
            return redirect()->route('network-equipments.index')->with('error', 'No tienes permiso para descargar la plantilla. Solo el Super Administrador puede hacerlo.');
        }

        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $headers = [
            'codigo_local',
            'descripcion',
            'marca',
            'modelo',
            'mac',
            'estado'
        ];

        $headerStyle = [
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4F46E5'],
            ],
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
            ],
        ];

        $col = 1;
        foreach ($headers as $header) {
            $sheet->setCellValueByColumnAndRow($col, 1, $header);
            $sheet->getColumnDimensionByColumn($col)->setWidth(30);
            $col++;
        }

        $sheet->getStyle('A1:F1')->applyFromArray($headerStyle);

        $row = 2;
        $sheet->setCellValueByColumnAndRow(1, $row, '1');
        $sheet->setCellValueByColumnAndRow(2, $row, 'ONU/Router GPON doble banda');
        $sheet->setCellValueByColumnAndRow(3, $row, 'TP-Link');
        $sheet->setCellValueByColumnAndRow(4, $row, 'XC220-G3');
        $sheet->setCellValueByColumnAndRow(5, $row, 'B8:FB:B3:58:FE:42');
        $sheet->setCellValueByColumnAndRow(6, $row, 'OPERATIVO');

        $exampleStyle = [
            'font' => [
                'color' => ['rgb' => '666666'],
                'size' => 10,
            ],
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    'color' => ['rgb' => 'CCCCCC'],
                ],
            ],
        ];
        $sheet->getStyle('A2:F2')->applyFromArray($exampleStyle);

        $sheet->getStyle('A2')->getFill()
            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()->setRGB('FFF3CD');

        $sheet->setCellValue('A4', 'INSTRUCCIONES:');
        $sheet->setCellValue('A5', '1. El campo "codigo_local" es OBLIGATORIO (resaltado en amarillo)');
        $sheet->setCellValue('A6', '2. El sistema buscará automáticamente el nombre y nivel de la IE');
        $sheet->setCellValue('A7', '3. Si el código local no existe en el sistema, el equipo NO se importará');
        $sheet->setCellValue('A8', '4. Si la MAC coincide, el equipo se actualizará');
        $sheet->setCellValue('A9', '5. Estados permitidos: OPERATIVO, INOPERATIVO, MANTENIMIENTO');
        $sheet->setCellValue('A10', '6. Guarda el archivo en formato .xlsx');
        $sheet->setCellValue('A11', '7. Elimina la fila de ejemplo antes de cargar tus datos');

        $sheet->getStyle('A4')->getFont()->setBold(true)->setSize(11);
        $sheet->getStyle('A4:A11')->getFont()->setSize(10);
        $sheet->getStyle('A4:A11')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT);

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        
        return response()->stream(
            function () use ($writer) {
                $writer->save('php://output');
            },
            200,
            [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="plantilla_equipos_red.xlsx"',
            ]
        );
    }

    /**
     * Exportar equipos a Excel (para directores, solo sus instituciones)
     */
    public function export(Request $request)
    {
        $user = $request->user();
        $query = NetworkEquipment::query();

        if ($user->role === 'director') {
            $institutionCodes = DB::table('institution_user')
                ->join('educational_institutions', 'educational_institutions.id', '=', 'institution_user.educational_institution_id')
                ->where('institution_user.user_id', $user->id)
                ->pluck('educational_institutions.local_code')
                ->toArray();
            
            if (empty($institutionCodes)) {
                return back()->with('error', 'No tienes instituciones asignadas para exportar.');
            }
            
            $query->whereIn('local_code', $institutionCodes);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('institution_name', 'LIKE', "%{$search}%")
                  ->orWhere('local_code', 'LIKE', "%{$search}%")
                  ->orWhere('brand', 'LIKE', "%{$search}%")
                  ->orWhere('model', 'LIKE', "%{$search}%")
                  ->orWhere('mac_address', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $equipments = $query->orderBy('institution_name')->get();

        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $headers = ['Código Local', 'Institución', 'Nivel', 'Descripción', 'Marca', 'Modelo', 'MAC', 'Estado'];

        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
            'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['rgb' => '4F46E5']],
        ];

        $col = 1;
        foreach ($headers as $header) {
            $sheet->setCellValueByColumnAndRow($col, 1, $header);
            $sheet->getColumnDimensionByColumn($col)->setWidth(25);
            $col++;
        }

        $sheet->getStyle('A1:H1')->applyFromArray($headerStyle);

        $row = 2;
        foreach ($equipments as $equipment) {
            $sheet->setCellValueByColumnAndRow(1, $row, $equipment->local_code ?? '');
            $sheet->setCellValueByColumnAndRow(2, $row, $equipment->institution_name ?? '');
            $sheet->setCellValueByColumnAndRow(3, $row, $equipment->level ?? '');
            $sheet->setCellValueByColumnAndRow(4, $row, $equipment->description ?? '');
            $sheet->setCellValueByColumnAndRow(5, $row, $equipment->brand ?? '');
            $sheet->setCellValueByColumnAndRow(6, $row, $equipment->model ?? '');
            $sheet->setCellValueByColumnAndRow(7, $row, $equipment->mac_address ?? '');
            $sheet->setCellValueByColumnAndRow(8, $row, $equipment->status ?? '');
            $row++;
        }

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        
        return response()->stream(
            function () use ($writer) {
                $writer->save('php://output');
            },
            200,
            [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="inventario_equipos_red.xlsx"',
            ]
        );
    }

    /**
     * Obtener equipos por institución (API - para selects)
     */
    public function getByInstitution(Request $request, $localCode)
    {
        $user = $request->user();
        $query = NetworkEquipment::where('local_code', $localCode);

        if ($user->role === 'director') {
            $institutionCodes = DB::table('institution_user')
                ->join('educational_institutions', 'educational_institutions.id', '=', 'institution_user.educational_institution_id')
                ->where('institution_user.user_id', $user->id)
                ->pluck('educational_institutions.local_code')
                ->toArray();
            
            if (!in_array($localCode, $institutionCodes)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permiso para ver los equipos de esta institución.'
                ], 403);
            }
        }

        $equipments = $query->orderBy('description')->get();

        return response()->json([
            'success' => true,
            'data' => $equipments,
        ]);
    }

    /**
     * Obtener un equipo específico (API - para editar)
     */
    public function show(Request $request, NetworkEquipment $equipment)
    {
        $user = $request->user();
        
        // ✅ Verificar permisos
        if (!in_array($user->role, ['super_admin', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para ver este equipo.'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $equipment,
        ]);
    }

    /**
     * Actualizar un equipo de red (solo super_admin y admin)
     */
    public function update(Request $request, NetworkEquipment $equipment)
    {
        $user = $request->user();
        if (!in_array($user->role, ['super_admin', 'admin'])) {
            return redirect()->route('network-equipments.index')->with('error', 'No tienes permiso para editar equipos.');
        }

        $validated = $request->validate([
            'local_code' => 'nullable|string|max:20',
            'institution_name' => 'nullable|string|max:255',
            'level' => 'nullable|string|max:100',
            'description' => 'required|string|max:255',
            'brand' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'mac_address' => 'nullable|string|max:50',
            'status' => 'required|string|max:50|in:OPERATIVO,INOPERATIVO,MANTENIMIENTO',
        ]);

        $equipment->update($validated);

        return back()->with('success', '✅ Equipo actualizado correctamente.');
    }

    /**
     * Eliminar un equipo de red (solo super_admin y admin)
     */
    public function destroy(Request $request, NetworkEquipment $equipment)
    {
        $user = $request->user();
        if (!in_array($user->role, ['super_admin', 'admin'])) {
            return redirect()->route('network-equipments.index')->with('error', 'No tienes permiso para eliminar equipos.');
        }

        $equipment->delete();

        return back()->with('success', '🗑️ Equipo eliminado correctamente.');
    }
}