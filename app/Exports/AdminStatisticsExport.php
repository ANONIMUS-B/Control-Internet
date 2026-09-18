<?php

namespace App\Exports;

use App\Models\EducationalInstitution;
use App\Models\MonthlyReport;
use App\Models\User;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AdminStatisticsExport implements WithMultipleSheets
{
    protected ?int $month;

    protected int $year;

    public function __construct(?int $month = null, ?int $year = null)
    {
        $this->month = $month;
        $this->year = $year ?: (int) date('Y');
    }

    public function sheets(): array
    {
        return [
            new StatisticsSummarySheet($this->month, $this->year),
            new InstitutionsWithoutReportSheet($this->month, $this->year),
            new PendingReportsSheet($this->month, $this->year),
        ];
    }
}

/**
 * HOJA 1: RESUMEN DE ESTADÍSTICAS
 */
class StatisticsSummarySheet implements FromArray, ShouldAutoSize, WithStyles, WithTitle
{
    protected ?int $month;

    protected int $year;

    public function __construct(?int $month, int $year)
    {
        $this->month = $month;
        $this->year = $year;
    }

    public function title(): string
    {
        return 'Resumen General';
    }

    public function array(): array
    {
        $months = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre',
        ];

        $monthText = $this->month ? ($months[$this->month] ?? $this->month) : 'Todos los meses';

        // 1. Totales de reportes
        $query = MonthlyReport::query()->where('year', $this->year);
        if ($this->month) {
            $query->where('month', $this->month);
        }

        $totalReports = (clone $query)->count();
        $approved = (clone $query)->where('status', 'approved')->count();
        $observed = (clone $query)->where('status', 'observed')->count();
        $pending = (clone $query)->where('status', 'pending')->count();
        $rejected = (clone $query)->where('status', 'rejected')->count();

        // 2. Calidad de Servicio (operative, intermittent, no_service)
        $operative = (clone $query)->where('service_state', 'operative')->count();
        $intermittent = (clone $query)->where('service_state', 'intermittent')->count();
        $noService = (clone $query)->where('service_state', 'no_service')->count();

        // 3. Totales institucionales
        $totalInstitutions = EducationalInstitution::where('is_active', true)->count();
        $institutionsWithReport = (clone $query)->distinct('institution_id')->count('institution_id');
        $institutionsWithoutReport = max(0, $totalInstitutions - $institutionsWithReport);
        $complianceRate = $totalInstitutions > 0 ? round(($institutionsWithReport / $totalInstitutions) * 100, 1) : 0;

        // 4. Firmas digitales
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

        return [
            ['REPORTE EJECUTIVO DE ESTADÍSTICAS GENERALES DE CONFORMIDAD'],
            ['Período:', $monthText.' '.$this->year],
            ['Fecha de Generación:', date('d/m/Y H:i')],
            [''],
            ['INDICADOR', 'CANTIDAD / VALOR', 'DESCRIPCIÓN / PORCENTAJE'],
            ['Total de Instituciones Activas', $totalInstitutions, 'I.E. registradas en el sistema'],
            ['Instituciones que Reportaron', $institutionsWithReport, $complianceRate.'% de cobertura general'],
            ['Instituciones Sin Reporte (Omisas)', $institutionsWithoutReport, round(100 - $complianceRate, 1).'% pendiente'],
            ['Tasa Global de Cumplimiento', $complianceRate.'%', 'Porcentaje alcanzado'],
            [''],
            ['ESTADO ADMINISTRATIVO DE REPORTES', '', ''],
            ['Total de Reportes Registrados', $totalReports, '100% de envíos'],
            ['Reportes Aprobados (UPDI)', $approved, $totalReports > 0 ? round(($approved / $totalReports) * 100, 1).'%' : '0%'],
            ['Reportes Observados', $observed, $totalReports > 0 ? round(($observed / $totalReports) * 100, 1).'%' : '0%'],
            ['Reportes Pendientes de Revisión', $pending, $totalReports > 0 ? round(($pending / $totalReports) * 100, 1).'%' : '0%'],
            ['Reportes Rechazados', $rejected, $totalReports > 0 ? round(($rejected / $totalReports) * 100, 1).'%' : '0%'],
            [''],
            ['ESTADO DEL SERVICIO DE INTERNET REPORTADO', '', ''],
            ['Servicio Operativo', $operative, $totalReports > 0 ? round(($operative / $totalReports) * 100, 1).'%' : '0%'],
            ['Servicio Intermitente', $intermittent, $totalReports > 0 ? round(($intermittent / $totalReports) * 100, 1).'%' : '0%'],
            ['Sin Servicio / Interrumpido', $noService, $totalReports > 0 ? round(($noService / $totalReports) * 100, 1).'%' : '0%'],
            [''],
            ['FIRMA DIGITAL DE DIRECTORES', '', ''],
            ['Directores con Firma Activa', $directorsWithSignature, 'Firma cargada y validada'],
            ['Directores sin Firma Activa', $directorsWithoutSignature, 'Pendiente de registrar firma'],
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => '1E3A8A']]],
            5 => ['font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']], 'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '2563EB']]],
            11 => ['font' => ['bold' => true, 'size' => 11, 'color' => ['rgb' => '1E3A8A']]],
            18 => ['font' => ['bold' => true, 'size' => 11, 'color' => ['rgb' => '1E3A8A']]],
            23 => ['font' => ['bold' => true, 'size' => 11, 'color' => ['rgb' => '1E3A8A']]],
        ];
    }
}

/**
 * HOJA 2: INSTITUCIONES SIN REPORTE (OMISAS)
 */
class InstitutionsWithoutReportSheet implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected ?int $month;

    protected int $year;

    public function __construct(?int $month, int $year)
    {
        $this->month = $month;
        $this->year = $year;
    }

    public function title(): string
    {
        return 'Instituciones Sin Reporte';
    }

    public function collection()
    {
        $query = MonthlyReport::select('institution_id')->where('year', $this->year);
        if ($this->month) {
            $query->where('month', $this->month);
        }

        $reportedIds = $query->distinct()->pluck('institution_id')->toArray();

        return EducationalInstitution::with(['users' => function ($q) {
            $q->where('role', 'director');
        }])
            ->where('is_active', true)
            ->whereNotIn('id', $reportedIds)
            ->orderBy('name', 'asc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nombre de la Institución Educativa',
            'Código Modular',
            'Código Local',
            'Distrito',
            'Nivel Educativo',
            'Director Asignado',
            'DNI Director',
            'Teléfono Director',
            'Estado Reporte',
        ];
    }

    public function map($institution): array
    {
        $director = $institution->users->first();

        return [
            $institution->id,
            $institution->name,
            $institution->modular_code,
            $institution->local_code ?? 'N/A',
            $institution->district ?? 'N/A',
            $institution->level ?? 'N/A',
            $director?->name ?? 'SIN DIRECTOR ASIGNADO',
            $director?->dni ?? 'N/A',
            $director?->phone ?? 'N/A',
            'SIN REPORTE ENVIADO',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']], 'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'DC2626']]],
        ];
    }
}

/**
 * HOJA 3: REPORTES PENDIENTES DE REVISIÓN
 */
class PendingReportsSheet implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected ?int $month;

    protected int $year;

    public function __construct(?int $month, int $year)
    {
        $this->month = $month;
        $this->year = $year;
    }

    public function title(): string
    {
        return 'Reportes Pendientes';
    }

    public function collection()
    {
        $query = MonthlyReport::with(['institution', 'user'])
            ->where('status', 'pending')
            ->where('year', $this->year);

        if ($this->month) {
            $query->where('month', $this->month);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function headings(): array
    {
        return [
            'ID Reporte',
            'Institución Educativa',
            'Código Modular',
            'Distrito',
            'Nivel',
            'Mes',
            'Año',
            'N° Oficio',
            'Estado del Servicio',
            'Director Responsable',
            'Fecha de Envío',
        ];
    }

    public function map($report): array
    {
        $months = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre',
        ];

        $serviceLabels = [
            'operative' => 'Operativo',
            'intermittent' => 'Intermitente',
            'no_service' => 'Sin Servicio',
        ];

        return [
            $report->id,
            $report->institution?->name ?? 'N/A',
            $report->institution?->modular_code ?? 'N/A',
            $report->institution?->district ?? 'N/A',
            $report->institution?->level ?? 'N/A',
            $months[$report->month] ?? $report->month,
            $report->year,
            $report->office_number ?? 'N/A',
            $serviceLabels[$report->service_state] ?? $report->service_state,
            $report->user?->name ?? 'N/A',
            $report->created_at?->format('d/m/Y H:i') ?? 'N/A',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']], 'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'D97706']]],
        ];
    }
}
