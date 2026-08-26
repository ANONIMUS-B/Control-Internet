<?php

namespace App\Exports;

use App\Models\MonthlyReport;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ReportsExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $query = MonthlyReport::with(['institution', 'user']);

        // ✅ Aplicar filtros
        if (!empty($this->filters['month'])) {
            $query->where('month', $this->filters['month']);
        }

        if (!empty($this->filters['year'])) {
            $query->where('year', $this->filters['year']);
        }

        if (!empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }

        if (!empty($this->filters['institution_id'])) {
            $query->where('institution_id', $this->filters['institution_id']);
        }

        return $query->orderBy('created_at', 'desc');
    }

    public function headings(): array
    {
        return [
            'ID',
            'Institución',
            'Código Modular',
            'Distrito',
            'Nivel',
            'Mes',
            'Año',
            'N° Oficio',
            'Estado',
            'Servicio',
            'Director',
            'DNI Director',
            'Fecha Creación',
            'Fecha Envío',
            'Observaciones UPDI',
            'Notas',
        ];
    }

    public function map($report): array
    {
        $months = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
        ];

        $statusLabels = [
            'pending' => 'Pendiente',
            'approved' => 'Aprobado',
            'observed' => 'Observado',
            'rejected' => 'Rechazado'
        ];

        $serviceLabels = [
            'operative' => 'Operativo',
            'intermittent' => 'Intermitente',
            'no_service' => 'Sin Servicio'
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
            $statusLabels[$report->status] ?? $report->status,
            $serviceLabels[$report->service_state] ?? $report->service_state,
            $report->user?->name ?? 'N/A',
            $report->user?->dni ?? 'N/A',
            $report->created_at?->format('d/m/Y H:i') ?? 'N/A',
            $report->submitted_at?->format('d/m/Y H:i') ?? 'N/A',
            $report->admin_comments ?? 'N/A',
            $report->notes ?? 'N/A',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 11]],
            'A' => ['width' => 10],
            'B' => ['width' => 35],
            'C' => ['width' => 18],
            'D' => ['width' => 20],
            'E' => ['width' => 18],
            'F' => ['width' => 15],
            'G' => ['width' => 10],
            'H' => ['width' => 20],
            'I' => ['width' => 15],
            'J' => ['width' => 15],
            'K' => ['width' => 25],
            'L' => ['width' => 15],
            'M' => ['width' => 20],
            'N' => ['width' => 20],
            'O' => ['width' => 40],
            'P' => ['width' => 40],
        ];
    }
}