<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Provider extends Model
{
    protected $fillable = [
        'name',
        'contract_number',
        'is_active',
        'contracted_speed_mbps',
        'contact_info',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'contracted_speed_mbps' => 'integer',
    ];

    // Relación: Un proveedor puede brindar servicio a muchas instituciones
    public function educationalInstitutions(): HasMany
    {
        return $this->hasMany(EducationalInstitution::class, 'current_provider_id');
    }
}