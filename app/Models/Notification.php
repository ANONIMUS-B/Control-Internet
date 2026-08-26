<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'monthly_report_id',
        'type',
        'title',
        'message',
        'link',
        'is_read',
        'read_at',
        'data',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'data' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(MonthlyReport::class, 'monthly_report_id');
    }

    // Accesor para obtener el color según el tipo
    public function getTypeColorAttribute(): string
    {
        $colors = [
            'info' => 'bg-blue-100 text-blue-700',
            'success' => 'bg-emerald-100 text-emerald-700',
            'warning' => 'bg-amber-100 text-amber-700',
            'error' => 'bg-rose-100 text-rose-700',
        ];

        return $colors[$this->type] ?? 'bg-neutral-100 text-neutral-700';
    }

    // Accesor para obtener el icono según el tipo
    public function getTypeIconAttribute(): string
    {
        $icons = [
            'info' => 'ℹ️',
            'success' => '✅',
            'warning' => '⚠️',
            'error' => '❌',
        ];

        return $icons[$this->type] ?? '📢';
    }

    // Scope para no leídas
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }
}