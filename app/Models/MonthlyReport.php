<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MonthlyReport extends Model
{
    protected $table = 'monthly_reports';

    protected $fillable = [
        'institution_id',
        'user_id',
        'month',
        'year',
        'office_number',
        'status',
        'service_state',
        'notes',
        'admin_comments',
        'submitted_at',
    ];

    protected $casts = [
        'institution_id' => 'integer',
        'user_id' => 'integer',
        'month' => 'integer',
        'year' => 'integer',
        'submitted_at' => 'datetime',
    ];

    /**
     * Relación: Un reporte tiene muchas evidencias.
     */
    public function evidences(): HasMany
    {
        return $this->hasMany(ReportEvidence::class, 'monthly_report_id');
    }

    /**
     * Relación: Un reporte pertenece a una institución.
     */
    public function institution(): BelongsTo
    {
        return $this->belongsTo(EducationalInstitution::class, 'institution_id');
    }

    /**
     * Relación: Un reporte pertenece a un usuario (director).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * ✅ NUEVA RELACIÓN: Un reporte tiene muchas entradas de historial.
     */
    public function history(): HasMany
    {
        return $this->hasMany(ReportHistory::class, 'monthly_report_id');
    }
}