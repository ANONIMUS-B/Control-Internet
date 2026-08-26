<?php

namespace App\Services;

use App\Models\MonthlyReport;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Exception;

class ReportService
{
    /**
     * Crea un nuevo reporte mensual.
     */
    public function storeReport(array $data, User $user): MonthlyReport
    {
        return DB::transaction(function () use ($data, $user) {
            $report = MonthlyReport::create([
                'institution_id' => $user->institution_id, 
                'user_id' => $user->id,
                'month' => $data['month'],
                'year' => $data['year'],
                'office_number' => $data['office_number'] ?? null,
                'status' => 'pending', 
                'service_state' => $data['service_state'],
                'notes' => $data['notes'] ?? null,
            ]);

            return $report;
        });
    }

    /**
     * Actualiza o subsana un reporte existente.
     */
    public function updateReport(MonthlyReport $report, array $data): MonthlyReport
    {
        return DB::transaction(function () use ($report, $data) {
            $report->update([
                'office_number' => $data['office_number'] ?? $report->office_number,
                'service_state' => $data['service_state'] ?? $report->service_state,
                'notes' => $data['notes'] ?? $report->notes,
                'status' => 'pending', 
            ]);

            return $report;
        });
    }

    /**
     * Cambia el estado del reporte.
     */
    public function changeReportStatus(MonthlyReport $report, string $newStatus, ?string $notes = null): MonthlyReport
    {
        if (!in_array($newStatus, ['pending', 'observed', 'approved', 'rejected'])) {
            throw new Exception("Estado de revisión no válido.");
        }

        return DB::transaction(function () use ($report, $newStatus, $notes) {
            $report->update([
                'status' => $newStatus,
            ]);

            return $report;
        });
    }
}