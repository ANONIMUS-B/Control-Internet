<?php

namespace App\Http\Controllers;

use App\Exports\ReportsExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;
use App\Models\MonthlyReport;
use App\Models\EducationalInstitution;


//Exportar Excel

class ExportController extends Controller
{
    /**
     * Vista de exportación
     */
    public function index(Request $request)
    {
        // ✅ PROTECCIÓN DE RUTA - Verificar rol
        $user = $request->user();
        if (!in_array($user->role, ['super_admin'])) {
            return redirect()->route('dashboard')->with('error', 'No tienes permiso para acceder a esta sección.');
        }

        // ✅ Obtener filtros disponibles
        $institutions = EducationalInstitution::orderBy('name')->get(['id', 'name', 'modular_code']);
        
        $months = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
        ];

        $statuses = [
            'pending' => 'Pendiente',
            'approved' => 'Aprobado',
            'observed' => 'Observado',
            'rejected' => 'Rechazado'
        ];

        return inertia('Reports/ExportExcel', [
            'institutions' => $institutions,
            'months' => $months,
            'statuses' => $statuses,
            'currentYear' => date('Y'),
            'filters' => [
                'month' => $request->input('month'),
                'year' => $request->input('year'),
                'status' => $request->input('status'),
                'institution_id' => $request->input('institution_id'),
            ],
        ]);
    }

    /**
     * Exportar a Excel
     */
    public function export(Request $request)
    {
        // ✅ PROTECCIÓN DE RUTA - Verificar rol
        $user = $request->user();
        if (!in_array($user->role, ['super_admin'])) {
            return redirect()->route('dashboard')->with('error', 'No tienes permiso para acceder a esta sección.');
        }

        $filters = $request->only(['month', 'year', 'status', 'institution_id']);
        
        $export = new ReportsExport($filters);
        
        $filename = 'reportes_' . now()->format('Y-m-d_H-i') . '.xlsx';
        
        return Excel::download($export, $filename);
    }

    /**
     * Exportar todos los reportes sin filtros
     */
    public function exportAll(Request $request)
    {
        // ✅ PROTECCIÓN DE RUTA - Verificar rol
        $user = $request->user();
        if (!in_array($user->role, ['super_admin'])) {
            return redirect()->route('dashboard')->with('error', 'No tienes permiso para acceder a esta sección.');
        }

        $export = new ReportsExport([]);
        
        $filename = 'todos_los_reportes_' . now()->format('Y-m-d_H-i') . '.xlsx';
        
        return Excel::download($export, $filename);
    }
}