<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportHistory extends Model
{
    protected $fillable = [
        'monthly_report_id',
        'user_id',
        'action',
        'changes',
        'comment',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'changes' => 'array',
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(MonthlyReport::class, 'monthly_report_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Accesor para obtener el nombre de la acción en español
    public function getActionLabelAttribute(): string
    {
        $labels = [
            'created' => 'Creación',
            'updated' => 'Actualización',
            'approved' => 'Aprobación',
            'observed' => 'Observación',
            'rejected' => 'Rechazo',
            'status_changed' => 'Cambio de estado',
            'submitted' => 'Envío',
        ];

        return $labels[$this->action] ?? $this->action;
    }

    // Accesor para obtener el color de la acción
    public function getActionColorAttribute(): string
    {
        $colors = [
            'created' => 'bg-blue-100 text-blue-700',
            'updated' => 'bg-amber-100 text-amber-700',
            'approved' => 'bg-emerald-100 text-emerald-700',
            'observed' => 'bg-rose-100 text-rose-700',
            'rejected' => 'bg-red-100 text-red-700',
            'status_changed' => 'bg-purple-100 text-purple-700',
            'submitted' => 'bg-indigo-100 text-indigo-700',
        ];

        return $colors[$this->action] ?? 'bg-neutral-100 text-neutral-700';
    }
}