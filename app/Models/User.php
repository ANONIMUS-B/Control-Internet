<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
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
 * @property bool $is_active // ✅ Agregar esta propiedad
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read string $last_name
 * @property-read string $second_last_name
 * @property-read string $first_name
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
    'is_active',              // ✅ Agregar este campo
])]
#[Hidden([
    'password',
    'two_factor_secret',
    'two_factor_recovery_codes',
    'remember_token',
    'pin',
])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'last_name',
        'second_last_name',
        'first_name',
    ];

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
     */
    public function hasSignature(): bool
    {
        return $this->signature_active &&
               $this->signature_path &&
               Storage::disk('public')->exists($this->signature_path);
    }

    /**
     * Obtener la URL de la firma.
     */
    public function getSignatureUrlAttribute(): ?string
    {
        if ($this->hasSignature()) {
            return '/storage/'.ltrim($this->signature_path, '/').'?v='.($this->signature_updated_at?->timestamp ?? time());
        }

        return null;
    }

    /**
     * Obtener la firma en base64 para el PDF y vista previa garantizada.
     */
    public function getSignatureBase64Attribute(): ?string
    {
        if ($this->hasSignature()) {
            $path = Storage::disk('public')->path($this->signature_path);
            if (file_exists($path)) {
                $type = pathinfo($path, PATHINFO_EXTENSION);
                $data = file_get_contents($path);

                return 'data:image/'.$type.';base64,'.base64_encode($data);
            }
        }

        return null;
    }

    /**
     * Obtener el nombre del archivo de la firma.
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
     */
    public function getSignatureSizeAttribute(): ?string
    {
        if ($this->signature_path && Storage::disk('public')->exists($this->signature_path)) {
            $bytes = Storage::disk('public')->size($this->signature_path);
            $units = ['B', 'KB', 'MB', 'GB'];

            for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
                $bytes /= 1024;
            }

            return round($bytes, 2).' '.$units[$i];
        }

        return null;
    }

    /**
     * Eliminar la firma digital.
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
     */
    public function getSignatureHtmlAttribute(): ?string
    {
        if ($this->hasSignature()) {
            return '<img src="'.$this->signature_base64.'" alt="Firma Digital" style="max-height: 80px; max-width: 200px; object-fit: contain;" />';
        }

        return null;
    }

    /**
     * Verificar si la firma está vigente (menos de 1 año).
     */
    public function isSignatureValid(): bool
    {
        if (! $this->signature_active || ! $this->signature_updated_at) {
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
     * Obtener el nombre del usuario limpio (sin delimitadores internos).
     */
    public function getNameAttribute(?string $value): string
    {
        if ($value === null) {
            return '';
        }

        return trim(str_replace("\u{200B}", '', $value));
    }

    /**
     * Obtener las partes desglosadas del nombre del usuario.
     *
     * @return array{last_name: string, second_last_name: string, first_name: string}
     */
    public function getNameParts(): array
    {
        $rawName = (string) ($this->attributes['name'] ?? '');

        // 1. Si contiene el delimitador invisible \u{200B}
        if (str_contains($rawName, "\u{200B}")) {
            $parts = explode("\u{200B}", $rawName);

            return [
                'last_name' => trim($parts[0] ?? ''),
                'second_last_name' => trim($parts[1] ?? ''),
                'first_name' => trim(implode(' ', array_slice($parts, 2))),
            ];
        }

        // 2. Si contiene coma (ej: "PEREZ GARCIA, JUAN CARLOS")
        if (str_contains($rawName, ',')) {
            [$surnames, $firstNames] = explode(',', $rawName, 2);
            $sParts = array_values(array_filter(preg_split('/\s+/', trim($surnames)) ?: []));
            if (count($sParts) <= 1) {
                return [
                    'last_name' => $sParts[0] ?? '',
                    'second_last_name' => '',
                    'first_name' => trim($firstNames),
                ];
            }

            return [
                'last_name' => $sParts[0],
                'second_last_name' => implode(' ', array_slice($sParts, 1)),
                'first_name' => trim($firstNames),
            ];
        }

        // 3. Fallback para nombres legados sin delimitador
        $words = array_values(array_filter(preg_split('/\s+/', trim($rawName)) ?: []));
        $count = count($words);

        if ($count === 0) {
            return ['last_name' => '', 'second_last_name' => '', 'first_name' => ''];
        }

        if ($count === 1) {
            return ['last_name' => $words[0], 'second_last_name' => '', 'first_name' => ''];
        }

        if ($count === 2) {
            return ['last_name' => $words[0], 'second_last_name' => '', 'first_name' => $words[1]];
        }

        if ($count === 3) {
            return ['last_name' => $words[0], 'second_last_name' => $words[1], 'first_name' => $words[2]];
        }

        return [
            'last_name' => $words[0],
            'second_last_name' => $words[1],
            'first_name' => implode(' ', array_slice($words, 2)),
        ];
    }

    /**
     * Obtener el apellido paterno.
     */
    public function getLastNameAttribute(): string
    {
        return $this->getNameParts()['last_name'];
    }

    /**
     * Obtener el apellido materno.
     */
    public function getSecondLastNameAttribute(): string
    {
        return $this->getNameParts()['second_last_name'];
    }

    /**
     * Obtener los nombres.
     */
    public function getFirstNameAttribute(): string
    {
        return $this->getNameParts()['first_name'];
    }

    /**
     * Construir el nombre completo estructurado con delimitadores invisibles.
     */
    public static function formatFullName(string $lastName, ?string $secondLastName, string $firstName): string
    {
        $lastName = trim($lastName);
        $secondLastName = trim($secondLastName ?? '');
        $firstName = trim($firstName);

        if ($lastName === '' && $secondLastName === '') {
            return $firstName;
        }

        if ($secondLastName !== '') {
            return "{$lastName}\u{200B} {$secondLastName}\u{200B} {$firstName}";
        }

        return "{$lastName}\u{200B}\u{200B} {$firstName}";
    }

    /**
     * Obtener el estado de la firma como texto.
     */
    public function getSignatureStatusAttribute(): string
    {
        if (! $this->hasSignature()) {
            return 'Sin firma';
        }

        if (! $this->isSignatureValid()) {
            return 'Vencida';
        }

        return 'Activa';
    }

    /**
     * Obtener el color del estado de la firma.
     */
    public function getSignatureStatusColorAttribute(): string
    {
        return match ($this->signature_status) {
            'Activa' => 'emerald',
            'Vencida' => 'amber',
            default => 'neutral',
        };
    }

    /**
     * Scope: Filtrar usuarios con firma activa.
     *
     * @param  Builder  $query
     * @return Builder
     */
    public function scopeWithActiveSignature($query)
    {
        return $query->where('signature_active', true)
            ->whereNotNull('signature_path');
    }

    /**
     * Scope: Filtrar usuarios sin firma.
     *
     * @param  Builder  $query
     * @return Builder
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
     * @param  Builder  $query
     * @return Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Filtrar usuarios inactivos.
     *
     * @param  Builder  $query
     * @return Builder
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }
}
