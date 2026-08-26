<?php

namespace App\Http\Controllers;

use App\Models\EducationalInstitution;
use App\Imports\InstitutionsImport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Log;

class InstitutionController extends Controller
{
    /**
     * Display a listing of the resource with pagination and filters.
     */
    public function index(Request $request)
    {
        $query = EducationalInstitution::query();

        // ✅ Búsqueda por nombre, código modular o distrito
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('modular_code', 'LIKE', "%{$search}%")
                  ->orWhere('district', 'LIKE', "%{$search}%")
                  ->orWhere('local_code', 'LIKE', "%{$search}%");
            });
        }

        // ✅ Filtrar por nivel
        if ($request->filled('level')) {
            $query->where('level', $request->level);
        }

        // ✅ Filtrar por tipo de gestión
        if ($request->filled('type_management')) {
            $query->where('type_management', $request->type_management);
        }

        // ✅ Filtrar por distrito
        if ($request->filled('district')) {
            $query->where('district', $request->district);
        }

        // ✅ Filtrar por estado (activo/inactivo)
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->is_active === 'true' ? 1 : 0);
        }

        // ✅ Ordenar
        $sortField = $request->input('sort', 'name');
        $sortDirection = $request->input('direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        // ✅ PAGINACIÓN (15 por defecto)
        $perPage = (int) $request->input('per_page', 15);
        $institutions = $query->paginate($perPage)->withQueryString();

        // ✅ Datos para filtros (selects)
        $districts = EducationalInstitution::distinct()->pluck('district')->sort()->values();
        $levels = EducationalInstitution::distinct()->pluck('level')->sort()->values();
        $typeManagements = EducationalInstitution::distinct()->pluck('type_management')->sort()->values();

        return inertia('Admin/Institutions/Index', [
            'institutions' => $institutions,
            'filters' => [
                'search' => $request->input('search'),
                'level' => $request->input('level'),
                'type_management' => $request->input('type_management'),
                'district' => $request->input('district'),
                'is_active' => $request->input('is_active'),
                'sort' => $sortField,
                'direction' => $sortDirection,
                'per_page' => $perPage,
            ],
            'districts' => $districts,
            'levels' => $levels,
            'typeManagements' => $typeManagements,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'modular_code' => 'required|string|max:10|unique:educational_institutions,modular_code',
            'local_code' => 'nullable|string|max:20',
            'name' => 'required|string|max:150',
            'level' => 'required|string|max:50',
            'type_management' => 'required|string|max:100',
            'department' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'district' => 'required|string|max:100',
            'ugel' => 'nullable|string|max:100',
            'populated_center' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:255',
        ]);

        // Asignar valores por defecto
        $validated['department'] = $validated['department'] ?? 'Huánuco';
        $validated['province'] = $validated['province'] ?? 'Ambo';
        $validated['ugel'] = $validated['ugel'] ?? 'UGEL Ambo';
        $validated['is_active'] = true;

        EducationalInstitution::create($validated);
        
        return back()->with('success', 'IE registrada correctamente.');
    }

    public function show(EducationalInstitution $institution)
    {
        // Cargar relaciones
        $institution->load(['currentProvider', 'monthlyReports' => function ($query) {
            $query->orderBy('created_at', 'desc')->limit(5);
        }]);

        return inertia('Admin/Institutions/Show', [
            'institution' => $institution,
            'stats' => [
                'totalReports' => $institution->monthlyReports()->count(),
                'pendingReports' => $institution->monthlyReports()->where('status', 'pending')->count(),
                'approvedReports' => $institution->monthlyReports()->where('status', 'approved')->count(),
                'observedReports' => $institution->monthlyReports()->where('status', 'observed')->count(),
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, EducationalInstitution $institution)
    {
        $validated = $request->validate([
            'modular_code' => 'required|string|max:10|unique:educational_institutions,modular_code,' . $institution->id,
            'local_code' => 'nullable|string|max:20',
            'name' => 'required|string|max:150',
            'level' => 'required|string|max:50',
            'type_management' => 'required|string|max:100',
            'department' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'district' => 'required|string|max:100',
            'ugel' => 'nullable|string|max:100',
            'populated_center' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:255',
        ]);

        $institution->update($validated);
        
        return back()->with('success', 'Institución actualizada correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EducationalInstitution $institution)
    {
        // ✅ Verificar si la institución tiene reportes asociados
        if ($institution->monthlyReports()->count() > 0) {
            return back()->with('error', 'No se puede eliminar la institución porque tiene reportes asociados.');
        }

        $institution->delete();
        return back()->with('success', 'Institución eliminada correctamente.');
    }

    /**
     * Obtener instituciones para selects (API)
     */
    public function list(Request $request)
    {
        $query = EducationalInstitution::where('is_active', true);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'LIKE', "%{$search}%");
        }

        return response()->json($query->orderBy('name')->get(['id', 'name', 'modular_code']));
    }

    /**
     * Exportar instituciones a Excel (opcional)
     */
    public function export(Request $request)
    {
        // Esto se implementará cuando agreguemos la exportación
        return back()->with('info', 'Exportación en desarrollo.');
    }

    /**
     * Activar/Desactivar una institución.
     */
    public function toggle(EducationalInstitution $institution)
    {
        $institution->update(['is_active' => !$institution->is_active]);
        
        $status = $institution->is_active ? 'activada' : 'desactivada';
        return back()->with('success', "Institución {$status} correctamente.");
    }

    // ==========================================
    // ✅ NUEVOS MÉTODOS PARA IMPORTACIÓN MASIVA
    // ==========================================

    /**
     * Mostrar vista de importación masiva
     * ✅ SOLO SUPER_ADMIN
     */
    public function importIndex(Request $request)
    {
        // ✅ PROTECCIÓN - Solo super_admin
        $user = $request->user();
        if ($user->role !== 'super_admin') {
            return redirect()->route('institutions.index')->with('error', 'No tienes permiso para acceder a esta sección. Solo el Super Administrador puede importar instituciones.');
        }

        return Inertia::render('Admin/Institutions/Import', [
            'templateUrl' => route('institutions.import.template'),
        ]);
    }

    /**
     * Procesar la importación masiva
     * ✅ SOLO SUPER_ADMIN
     */
    public function import(Request $request)
    {
        // ✅ PROTECCIÓN - Solo super_admin
        $user = $request->user();
        if ($user->role !== 'super_admin') {
            return redirect()->route('institutions.index')->with('error', 'No tienes permiso para realizar esta acción. Solo el Super Administrador puede importar instituciones.');
        }

        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:5120',
        ]);

        try {
            $file = $request->file('file');
            
            Log::info('=== INICIO IMPORTACIÓN ===');
            Log::info('Nombre del archivo: ' . $file->getClientOriginalName());
            Log::info('Tamaño: ' . $file->getSize() . ' bytes');
            Log::info('Tipo MIME: ' . $file->getMimeType());

            $import = new InstitutionsImport();
            Excel::import($import, $file);

            $imported = $import->getImportedCount();
            $skipped = $import->getSkippedCount();
            $errors = $import->getErrors();

            Log::info('Importados: ' . $imported);
            Log::info('Omitidos: ' . $skipped);
            Log::info('Errores: ' . json_encode($errors));

            if ($imported > 0) {
                $message = "✅ Se importaron {$imported} instituciones correctamente.";
                if ($skipped > 0) {
                    $message .= " {$skipped} filas fueron omitidas.";
                }
                if (!empty($errors)) {
                    $message .= " Detalles: " . implode('; ', $errors);
                }
                return redirect()->route('institutions.index')->with('success', $message);
            } else {
                return redirect()->route('institutions.import')->with('error', '❌ No se importó ninguna institución. Verifica que el archivo tenga datos válidos.');
            }

        } catch (\Exception $e) {
            Log::error('ERROR IMPORT: ' . $e->getMessage());
            Log::error('LINEA: ' . $e->getLine());
            Log::error('ARCHIVO: ' . $e->getFile());
            
            return redirect()->route('institutions.import')->with('error', '❌ Error al importar: ' . $e->getMessage());
        }
    }

    /**
     * Descargar plantilla de importación en Excel
     * ✅ SOLO SUPER_ADMIN
     */
    public function downloadTemplate(Request $request)
    {
        // ✅ PROTECCIÓN - Solo super_admin
        $user = $request->user();
        if ($user->role !== 'super_admin') {
            return redirect()->route('institutions.index')->with('error', 'No tienes permiso para descargar esta plantilla. Solo el Super Administrador puede hacerlo.');
        }

        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // ✅ Encabezados en INGLÉS (para que coincida con el import)
        $headers = [
            'modular_code',
            'local_code',
            'name',
            'level',
            'type_management',
            'department',
            'province',
            'district',
            'ugel',
            'populated_center',
            'address'
        ];

        // ✅ Estilo para encabezados
        $headerStyle = [
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => '1a56db'],
            ],
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    'color' => ['rgb' => '000000'],
                ],
            ],
        ];

        // ✅ Columnas y encabezados
        $col = 1;
        foreach ($headers as $key => $label) {
            $sheet->setCellValueByColumnAndRow($col, 1, $label);
            $sheet->getColumnDimensionByColumn($col)->setWidth(25);
            $col++;
        }

        // ✅ Aplicar estilo a encabezados
        $sheet->getStyle('A1:K1')->applyFromArray($headerStyle);

        // ✅ Datos de ejemplo (fila 2)
        $row = 2;
        $sheet->setCellValueByColumnAndRow(1, $row, '1234567');
        $sheet->setCellValueByColumnAndRow(2, $row, 'LOC001');
        $sheet->setCellValueByColumnAndRow(3, $row, 'I.E. N° 30001 "San Martín"');
        $sheet->setCellValueByColumnAndRow(4, $row, 'Secundaria');
        $sheet->setCellValueByColumnAndRow(5, $row, 'Pública');
        $sheet->setCellValueByColumnAndRow(6, $row, 'Huánuco');
        $sheet->setCellValueByColumnAndRow(7, $row, 'Ambo');
        $sheet->setCellValueByColumnAndRow(8, $row, 'Ambo');
        $sheet->setCellValueByColumnAndRow(9, $row, 'UGEL Ambo');
        $sheet->setCellValueByColumnAndRow(10, $row, 'San Martín');
        $sheet->setCellValueByColumnAndRow(11, $row, 'Jr. San Martín N° 123');

        // ✅ Estilo para los datos de ejemplo
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
        $sheet->getStyle('A2:K2')->applyFromArray($exampleStyle);

        // ✅ Color amarillo para columnas obligatorias
        $requiredColumns = ['A', 'C', 'H']; // modular_code, name, district
        
        foreach ($requiredColumns as $colLetter) {
            $sheet->getStyle($colLetter . '2')->getFill()
                ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                ->getStartColor()->setRGB('FFF3CD');
        }

        // ✅ Instrucciones
        $sheet->setCellValue('A4', 'INSTRUCCIONES:');
        $sheet->setCellValue('A5', '1. Las columnas en AMARILLO son OBLIGATORIAS (*)');
        $sheet->setCellValue('A6', '2. Elimina la fila de ejemplo antes de cargar tus datos');
        $sheet->setCellValue('A7', '3. No modifiques los nombres de las columnas');
        $sheet->setCellValue('A8', '4. Guarda el archivo en formato .xlsx');
        
        $sheet->getStyle('A4')->getFont()->setBold(true)->setSize(11);
        $sheet->getStyle('A4:A8')->getFont()->setSize(10);
        $sheet->getStyle('A4:A8')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT);

        // ✅ Descargar archivo
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        
        return response()->stream(
            function () use ($writer) {
                $writer->save('php://output');
            },
            200,
            [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="plantilla_instituciones.xlsx"',
            ]
        );
    }
}