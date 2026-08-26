<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class EducationalInstitution extends Model
{
    protected $fillable = [
        'modular_code',
        'name',
        'district',
        'populated_center',
        'current_provider_id',
        'is_active',
        'local_code',
        'level',
        'type_management',
        'department',
        'province',
        'ugel',
        'address'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relación con el proveedor actual
    public function currentProvider(): BelongsTo
    {
        return $this->belongsTo(Provider::class, 'current_provider_id');
    }

    // Relación con usuarios (directores)
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'institution_user');
    }

    // Relación con reportes mensuales - AGREGAR ESTO
    public function monthlyReports(): HasMany
    {
        return $this->hasMany(MonthlyReport::class, 'institution_id');
    }
}