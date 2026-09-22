<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportPeriod extends Model
{
    protected $fillable = [
        'month',
        'year',
        'start_date',
        'end_date',
        'is_active',
        'message',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Relación con el usuario que creó el período
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relación con el usuario que actualizó el período
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Verificar si una fecha está dentro del período
     */
    public function isDateWithinPeriod($date = null): bool
    {
        if (! $this->is_active) {
            return false;
        }

        $date = $date ? Carbon::parse($date) : Carbon::now();
        $start = Carbon::parse($this->start_date)->startOfDay();
        $end = Carbon::parse($this->end_date)->endOfDay();

        return $date->between($start, $end);
    }

    /**
     * Scope para períodos activos y vigentes para una fecha
     */
    public function scopeCurrent($query, $date = null)
    {
        $dateStr = ($date ? Carbon::parse($date) : Carbon::now())->toDateString();

        return $query->where('is_active', true)
            ->whereDate('start_date', '<=', $dateStr)
            ->whereDate('end_date', '>=', $dateStr);
    }

    /**
     * Obtener el nombre del mes en español
     */
    public function getMonthNameAttribute(): string
    {
        $months = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre',
        ];

        return $months[$this->month] ?? (string) $this->month;
    }

    /**
     * Obtener el rango de fechas formateado
     */
    public function getDateRangeAttribute(): string
    {
        return $this->start_date->format('d/m/Y').' - '.$this->end_date->format('d/m/Y');
    }
}
