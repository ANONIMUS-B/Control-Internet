<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NetworkEquipment extends Model
{
    // ✅ Especificar el nombre de la tabla explícitamente
    protected $table = 'network_equipments';

    protected $fillable = [
        'local_code',
        'institution_name',
        'level',
        'description',
        'brand',
        'model',
        'mac_address',
        'status',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Relación con la institución educativa
     */
    public function institution(): BelongsTo
    {
        return $this->belongsTo(EducationalInstitution::class, 'local_code', 'local_code');
    }

    /**
     * Scope para equipos activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para equipos operativos
     */
    public function scopeOperative($query)
    {
        return $query->where('status', 'OPERATIVO');
    }
}