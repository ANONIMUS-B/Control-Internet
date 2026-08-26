<?php

namespace App\Helpers;

use App\Models\ReportHistory;
use App\Models\Notification;
use App\Models\MonthlyReport;
use App\Models\User;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Auth;

class ReportHelper
{
    /**
     * Registrar historial de cambios
     */
    public static function logHistory(
        MonthlyReport $report,
        string $action,
        ?array $changes = null,
        ?string $comment = null
    ): void {
        $user = Auth::user();
        $userId = $user ? $user->id : null;

        ReportHistory::create([
            'monthly_report_id' => $report->id,
            'user_id' => $userId,
            'action' => $action,
            'changes' => $changes,
            'comment' => $comment,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }

    /**
     * Crear notificación para un usuario
     */
    public static function notify(
        int $userId,
        string $type,
        string $title,
        string $message,
        ?int $reportId = null,
        ?string $link = null,
        ?array $data = null
    ): void {
        Notification::create([
            'user_id' => $userId,
            'monthly_report_id' => $reportId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'link' => $link,
            'data' => $data,
        ]);
    }

    /**
     * Notificar a todos los admins y specialists
     */
    public static function notifyAdmins(
        string $type,
        string $title,
        string $message,
        ?int $reportId = null,
        ?string $link = null,
        ?array $data = null
    ): void {
        $admins = User::whereIn('role', ['admin', 'specialist'])->get();

        foreach ($admins as $admin) {
            self::notify(
                $admin->id,
                $type,
                $title,
                $message,
                $reportId,
                $link,
                $data
            );
        }
    }

    /**
     * Notificar a los directores de una institución específica
     */
    public static function notifyDirectors(
        int $institutionId,
        string $type,
        string $title,
        string $message,
        ?int $reportId = null,
        ?string $link = null,
        ?array $data = null
    ): void {
        $directors = User::where('role', 'director')
            ->whereHas('institutions', function ($query) use ($institutionId) {
                $query->where('educational_institution_id', $institutionId);
            })
            ->get();

        foreach ($directors as $director) {
            self::notify(
                $director->id,
                $type,
                $title,
                $message,
                $reportId,
                $link,
                $data
            );
        }
    }

    /**
     * Obtener notificaciones no leídas de un usuario
     */
    public static function getUnreadNotifications(int $userId)
    {
        return Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Obtener todas las notificaciones de un usuario
     */
    public static function getNotifications(int $userId, int $limit = 50)
    {
        return Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Obtener el historial de un reporte
     */
    public static function getReportHistory(int $reportId)
    {
        return ReportHistory::where('monthly_report_id', $reportId)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();
    }
}