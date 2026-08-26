<?php

namespace App\Http\Controllers;

use App\Models\MonthlyReport;
use App\Models\EducationalInstitution;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminStatisticsController extends Controller
{
    public function index(Request $request)
    {
        // ✅ Verificar permisos (solo super_admin)
        $user = $request->user();
        if (!in_array($user->role, ['super_admin'])) {
            return redirect()->route('dashboard')->with('error', 'No tienes permiso para acceder a esta sección.');
        }

        // ✅ Obtener filtros
        $selectedMonth = $request->input('month');
        $selectedYear = $request->input('year', date('Y'));

        // ✅ 1. Estadísticas generales de reportes (con filtros)
        $query = MonthlyReport::query();
        
        if ($selectedMonth) {
            $query->where('month', (int) $selectedMonth);
        }
        if ($selectedYear) {
            $query->where('year', (int) $selectedYear);
        }

        $totalReports = $query->count();
        $pendingReports = (clone $query)->where('status', 'pending')->count();
        $approvedReports = (clone $query)->where('status', 'approved')->count();
        $observedReports = (clone $query)->where('status', 'observed')->count();
        $rejectedReports = (clone $query)->where('status', 'rejected')->count();

        // ✅ 2. Reportes por mes (últimos 12 meses o filtrados)
        $reportsByMonthQuery = MonthlyReport::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('YEAR(created_at) as year'),
            DB::raw('COUNT(*) as total'),
            DB::raw('SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved'),
            DB::raw('SUM(CASE WHEN status = "observed" THEN 1 ELSE 0 END) as observed'),
            DB::raw('SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending')
        );

        if ($selectedMonth) {
            $reportsByMonthQuery->where('month', (int) $selectedMonth);
        }
        if ($selectedYear) {
            $reportsByMonthQuery->where('year', (int) $selectedYear);
        }

        $reportsByMonth = $reportsByMonthQuery
            ->groupBy(DB::raw('MONTH(created_at)'), DB::raw('YEAR(created_at)'))
            ->orderBy(DB::raw('YEAR(created_at)'), 'asc')
            ->orderBy(DB::raw('MONTH(created_at)'), 'asc')
            ->limit(12)
            ->get();

        $months = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
        ];

        $reportsByMonthFormatted = $reportsByMonth->map(function ($item) use ($months) {
            return [
                'month' => $months[$item->month] . ' ' . $item->year,
                'total' => (int) $item->total,
                'approved' => (int) $item->approved,
                'observed' => (int) $item->observed,
                'pending' => (int) $item->pending,
            ];
        });

        // Si no hay datos, mostrar meses con ceros
        if ($reportsByMonthFormatted->isEmpty()) {
            $reportsByMonthFormatted = collect([]);
            $startMonth = $selectedMonth ? (int) $selectedMonth : 1;
            $startYear = (int) $selectedYear;
            
            for ($i = 0; $i < 12; $i++) {
                $month = $startMonth + $i;
                $year = $startYear;
                if ($month > 12) {
                    $month = $month - 12;
                    $year++;
                }
                if ($year > date('Y') + 1) break;
                
                $reportsByMonthFormatted->push([
                    'month' => $months[$month] . ' ' . $year,
                    'total' => 0,
                    'approved' => 0,
                    'observed' => 0,
                    'pending' => 0,
                ]);
            }
        }

        // ✅ 3. Reportes por institución (top 10) con filtros
        $topInstitutionsQuery = MonthlyReport::select(
            'institution_id',
            DB::raw('COUNT(*) as total')
        )
        ->with('institution:id,name,modular_code,district,level');

        if ($selectedMonth) {
            $topInstitutionsQuery->where('month', (int) $selectedMonth);
        }
        if ($selectedYear) {
            $topInstitutionsQuery->where('year', (int) $selectedYear);
        }

        $topInstitutions = $topInstitutionsQuery
            ->groupBy('institution_id')
            ->orderBy(DB::raw('COUNT(*)'), 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->institution_id,
                    'name' => $item->institution->name ?? 'Sin institución',
                    'modular_code' => $item->institution->modular_code ?? 'N/A',
                    'district' => $item->institution->district ?? 'N/A',
                    'level' => $item->institution->level ?? 'N/A',
                    'total' => (int) $item->total,
                ];
            });

        // ✅ 4. Instituciones por nivel (activas)
        $institutionsByLevel = EducationalInstitution::select(
            'level',
            DB::raw('COUNT(*) as count')
        )
        ->where('is_active', true)
        ->groupBy('level')
        ->get()
        ->map(function ($item) {
            return [
                'level' => $item->level ?? 'No especificado',
                'count' => (int) $item->count,
            ];
        });

        if ($institutionsByLevel->isEmpty()) {
            $institutionsByLevel = collect([
                ['level' => 'Inicial', 'count' => 0],
                ['level' => 'Primaria', 'count' => 0],
                ['level' => 'Secundaria', 'count' => 0],
                ['level' => 'CEBA', 'count' => 0],
            ]);
        }

        // ✅ 5. Usuarios por rol
        $usersByRole = User::select('role', DB::raw('COUNT(*) as count'))
            ->groupBy('role')
            ->get()
            ->map(function ($item) {
                return [
                    'role' => $item->role ?? 'Sin rol',
                    'count' => (int) $item->count,
                ];
            });

        // ✅ 6. Instituciones sin reporte (NUEVO)
        $institutionsWithReports = MonthlyReport::select('institution_id')
            ->where('year', (int) $selectedYear);
        
        if ($selectedMonth) {
            $institutionsWithReports->where('month', (int) $selectedMonth);
        }
        
        $institutionIdsWithReports = $institutionsWithReports->distinct()->pluck('institution_id')->toArray();

        $institutionsWithoutReport = EducationalInstitution::where('is_active', true)
            ->whereNotIn('id', $institutionIdsWithReports)
            ->get(['id', 'name', 'modular_code', 'district', 'level'])
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'modular_code' => $item->modular_code,
                    'district' => $item->district ?? 'N/A',
                    'level' => $item->level ?? 'N/A',
                ];
            });

        // ✅ 7. Instituciones con reportes pendientes (NUEVO)
        $pendingInstitutionsQuery = MonthlyReport::select('institution_id')
            ->where('status', 'pending')
            ->where('year', (int) $selectedYear);
        
        if ($selectedMonth) {
            $pendingInstitutionsQuery->where('month', (int) $selectedMonth);
        }
        
        $pendingInstitutionIds = $pendingInstitutionsQuery->distinct()->pluck('institution_id')->toArray();

        $pendingInstitutions = EducationalInstitution::where('is_active', true)
            ->whereIn('id', $pendingInstitutionIds)
            ->get(['id', 'name', 'modular_code', 'district', 'level'])
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'modular_code' => $item->modular_code,
                    'district' => $item->district ?? 'N/A',
                    'level' => $item->level ?? 'N/A',
                ];
            });

        // ✅ 8. Directores con firma digital
        $directorsWithSignature = User::where('role', 'director')
            ->where('signature_active', true)
            ->whereNotNull('signature_path')
            ->count();

        $directorsWithoutSignature = User::where('role', 'director')
            ->where(function ($q) {
                $q->where('signature_active', false)
                  ->orWhereNull('signature_path');
            })
            ->count();

        // ✅ 9. Resumen de estados del sistema
        $statusSummary = [
            'total_reports' => $totalReports,
            'pending' => $pendingReports,
            'approved' => $approvedReports,
            'observed' => $observedReports,
            'rejected' => $rejectedReports,
            'total_institutions' => EducationalInstitution::where('is_active', true)->count(),
            'total_users' => User::count(),
            'directors_with_signature' => $directorsWithSignature,
            'directors_without_signature' => $directorsWithoutSignature,
        ];

        // ✅ 10. Reportes por estado para gráfico de dona
        $reportsByStatus = [
            ['status' => 'Pendientes', 'count' => $pendingReports],
            ['status' => 'Aprobados', 'count' => $approvedReports],
            ['status' => 'Observados', 'count' => $observedReports],
            ['status' => 'Rechazados', 'count' => $rejectedReports],
        ];

        // ✅ 11. Reportes por distrito (top 5)
        $reportsByDistrictQuery = MonthlyReport::select(
            'educational_institutions.district',
            DB::raw('COUNT(*) as total')
        )
        ->join('educational_institutions', 'monthly_reports.institution_id', '=', 'educational_institutions.id');

        if ($selectedMonth) {
            $reportsByDistrictQuery->where('monthly_reports.month', (int) $selectedMonth);
        }
        if ($selectedYear) {
            $reportsByDistrictQuery->where('monthly_reports.year', (int) $selectedYear);
        }

        $reportsByDistrict = $reportsByDistrictQuery
            ->groupBy('educational_institutions.district')
            ->orderBy(DB::raw('COUNT(*)'), 'desc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'district' => $item->district ?? 'N/A',
                    'total' => (int) $item->total,
                ];
            });

        // ✅ 12. Meses disponibles para filtros
        $availableMonths = MonthlyReport::select('month', 'year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get()
            ->map(function ($item) use ($months) {
                return [
                    'value' => $item->month,
                    'label' => $months[$item->month] . ' ' . $item->year,
                ];
            });

        return Inertia::render('Admin/Statistics', [
            'stats' => [
                'reportsByMonth' => $reportsByMonthFormatted,
                'topInstitutions' => $topInstitutions,
                'institutionsByLevel' => $institutionsByLevel,
                'usersByRole' => $usersByRole,
                'reportsByStatus' => $reportsByStatus,
                'reportsByDistrict' => $reportsByDistrict,
                'statusSummary' => $statusSummary,
                'institutionsWithoutReport' => $institutionsWithoutReport,
                'pendingInstitutions' => $pendingInstitutions,
            ],
            'filters' => [
                'month' => $selectedMonth,
                'year' => $selectedYear,
            ],
            'months' => $months,
            'currentYear' => date('Y'),
            'availableMonths' => $availableMonths,
        ]);
    }

    /**
     * Exportar estadísticas a Excel
     */
    public function export(Request $request)
    {
        // ✅ Verificar permisos
        $user = $request->user();
        if (!in_array($user->role, ['super_admin'])) {
            return redirect()->route('dashboard')->with('error', 'No tienes permiso para exportar.');
        }

        // TODO: Implementar exportación a Excel con los filtros aplicados
        return back()->with('info', 'Exportación en desarrollo.');
    }
}