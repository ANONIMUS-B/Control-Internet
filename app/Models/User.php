<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string|null $dni
 * @property string $name
 * @property string $email
 * @property string $role
 * @property int|null $institution_id
 * @property string|null $digital_signature
 * @property string|null $pin
 * @property string|null $signature_path
 * @property bool $signature_active
 * @property string|null $signature_updated_at
 * @property bool $is_active                    // ✅ Agregar esta propiedad
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'name', 
    'email', 
    'password', 
    'dni', 
    'role', 
    'institution_id', 
    'digital_signature', 
    'pin', 
    'signature_path', 
    'signature_active', 
    'signature_updated_at',
    'is_active'              // ✅ Agregar este campo
])]
#[Hidden([
    'password', 
    'two_factor_secret', 
    'two_factor_recovery_codes', 
    'remember_token', 
    'pin'
])]
class User extends Authenticatable implements PasskeyUser
{
    
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'signature_active' => 'boolean',
            'signature_updated_at' => 'datetime',
            'is_active' => 'boolean',        // ✅ Agregar este cast
        ];
    }

    

    /**
     * Relación: Un usuario (director) pertenece a muchas instituciones educativas.
     */
    public function institutions(): BelongsToMany
    {
        return $this->belongsToMany(EducationalInstitution::class, 'institution_user');
    }

    /**
     * Relación: Un usuario tiene muchos reportes mensuales.
     */
    public function reports(): HasMany
    {
        return $this->hasMany(MonthlyReport::class, 'user_id');
    }

    // ==========================================
    // MÉTODOS DE FIRMA DIGITAL
    // ==========================================

    /**
     * Verificar si el usuario tiene firma digital activa.
     *
     * @return bool
     */
    public function hasSignature(): bool
    {
        return $this->signature_active && 
               $this->signature_path && 
               Storage::disk('public')->exists($this->signature_path);
    }

    /**
     * Obtener la URL de la firma.
     *
     * @return string|null
     */
    public function getSignatureUrlAttribute(): ?string
    {
        if ($this->hasSignature()) {
            return asset('storage/' . $this->signature_path);
        }
        return null;
    }

    /**
     * Obtener la firma en base64 para el PDF.
     *
     * @return string|null
     */
    public function getSignatureBase64Attribute(): ?string
    {
        if ($this->hasSignature()) {
            $path = Storage::disk('public')->path($this->signature_path);
            $type = pathinfo($path, PATHINFO_EXTENSION);
            $data = file_get_contents($path);
            return 'data:image/' . $type . ';base64,' . base64_encode($data);
        }
        return null;
    }

    /**
     * Obtener el nombre del archivo de la firma.
     *
     * @return string|null
     */
    public function getSignatureFilenameAttribute(): ?string
    {
        if ($this->signature_path) {
            return basename($this->signature_path);
        }
        return null;
    }

    /**
     * Obtener el tamaño del archivo de la firma en formato legible.
     *
     * @return string|null
     */
    public function getSignatureSizeAttribute(): ?string
    {
        if ($this->signature_path && Storage::disk('public')->exists($this->signature_path)) {
            $bytes = Storage::disk('public')->size($this->signature_path);
            $units = ['B', 'KB', 'MB', 'GB'];

            for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
                $bytes /= 1024;
            }

            return round($bytes, 2) . ' ' . $units[$i];
        }
        return null;
    }

    /**
     * Eliminar la firma digital.
     *
     * @return bool
     */
    public function deleteSignature(): bool
    {
        // Eliminar el archivo físico si existe
        if ($this->signature_path && Storage::disk('public')->exists($this->signature_path)) {
            Storage::disk('public')->delete($this->signature_path);
        }
        
        // Limpiar los campos de la firma
        $this->signature_path = null;
        $this->signature_active = false;
        $this->signature_updated_at = null;
        
        return $this->save();
    }

    /**
     * Actualizar la firma digital.
     *
     * @param string $path
     * @return bool
     */
    public function updateSignature(string $path): bool
    {
        // Eliminar la firma anterior si existe
        if ($this->signature_path && Storage::disk('public')->exists($this->signature_path)) {
            Storage::disk('public')->delete($this->signature_path);
        }
        
        // Actualizar los campos de la firma
        $this->signature_path = $path;
        $this->signature_active = true;
        $this->signature_updated_at = now();
        
        return $this->save();
    }

    /**
     * Obtener la firma como HTML para el PDF.
     *
     * @return string|null
     */
    public function getSignatureHtmlAttribute(): ?string
    {
        if ($this->hasSignature()) {
            return '<img src="' . $this->signature_base64 . '" alt="Firma Digital" style="max-height: 80px; max-width: 200px; object-fit: contain;" />';
        }
        return null;
    }

    /**
     * Verificar si la firma está vigente (menos de 1 año).
     *
     * @return bool
     */
    public function isSignatureValid(): bool
    {
        if (!$this->signature_active || !$this->signature_updated_at) {
            return false;
        }

        // ✅ CORREGIDO: Asegurar que sea un objeto Carbon
        $signatureDate = $this->signature_updated_at instanceof Carbon 
            ? $this->signature_updated_at 
            : Carbon::parse($this->signature_updated_at);
        
        // La firma es válida por 1 año
        $expirationDate = $signatureDate->addYear();
        return now()->lessThanOrEqualTo($expirationDate);
    }

    /**
     * Obtener el estado de la firma como texto.
     *
     * @return string
     */
    public function getSignatureStatusAttribute(): string
    {
        if (!$this->hasSignature()) {
            return 'Sin firma';
        }

        if (!$this->isSignatureValid()) {
            return 'Vencida';
        }

        return 'Activa';
    }

    /**
     * Obtener el color del estado de la firma.
     *
     * @return string
     */
    public function getSignatureStatusColorAttribute(): string
    {
        return match($this->signature_status) {
            'Activa' => 'emerald',
            'Vencida' => 'amber',
            default => 'neutral',
        };
    }

    /**
     * Scope: Filtrar usuarios con firma activa.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithActiveSignature($query)
    {
        return $query->where('signature_active', true)
                     ->whereNotNull('signature_path');
    }

    /**
     * Scope: Filtrar usuarios sin firma.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithoutSignature($query)
    {
        return $query->where(function ($q) {
            $q->where('signature_active', false)
              ->orWhereNull('signature_path');
        });
    }

    /**
     * Scope: Filtrar usuarios activos.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Filtrar usuarios inactivos.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    
}