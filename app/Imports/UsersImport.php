<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class UsersImport implements ToCollection, WithHeadingRow
{
    protected $imported = 0;

    protected $skipped = 0;

    protected $alreadyExistingCount = 0;

    protected $errors = [];

    protected $processedDnis = [];

    protected $repeatedUsers = [];

    protected $roleMap = [
        'administrador' => 'admin',
        'especialista' => 'specialist',
        'supervisor' => 'supervisor',
        'director' => 'director',
        'ejecutivo' => 'executive',
    ];

    public function collection(Collection $collection)
    {
        Log::info('=== INICIO IMPORTACIÓN USUARIOS ===');
        Log::info('Filas en el archivo: '.$collection->count());

        foreach ($collection as $index => $row) {
            // ✅ Verificar si la fila está vacía
            $isEmpty = true;
            foreach ($row as $value) {
                if (! empty($value) && ! is_null($value)) {
                    $isEmpty = false;
                    break;
                }
            }

            if ($isEmpty) {
                Log::info('Fila '.($index + 1).' está vacía, omitiendo');

                continue;
            }

            $rowData = is_array($row) ? $row : (method_exists($row, 'toArray') ? $row->toArray() : (array) $row);
            Log::info('Fila '.($index + 1).' datos: '.json_encode($rowData));

            // ✅ Obtener DNI y normalizar (completar ceros si Excel quitó el cero inicial)
            $rawDni = trim((string) ($row['dni'] ?? $row['d_n_i'] ?? $row['documento'] ?? $row['nro_documento'] ?? ''));

            if (empty($rawDni)) {
                $this->errors[] = 'Fila '.($index + 1).': DNI es obligatorio';
                $this->skipped++;
                Log::error('❌ Fila '.($index + 1).': DNI vacío');

                continue;
            }

            // DNI peruano a 8 dígitos con ceros iniciales si fue acortado por Excel
            $cleanDni = (is_numeric($rawDni) && strlen($rawDni) <= 8)
                ? str_pad($rawDni, 8, '0', STR_PAD_LEFT)
                : $rawDni;

            // ✅ Si el DNI ya se encuentra en los datos subidos o en el archivo actual, NO LO SUBIR
            $dniVariants = array_unique(array_filter([
                $rawDni,
                $cleanDni,
                ltrim($rawDni, '0'),
            ]));

            $existingUser = User::where(function ($query) use ($dniVariants) {
                foreach ($dniVariants as $variant) {
                    $query->orWhere('dni', $variant);
                }
            })->first(['name', 'dni']);

            $dniAlreadyInBatch = in_array($cleanDni, $this->processedDnis, true) || in_array($rawDni, $this->processedDnis, true);

            if ($existingUser || $dniAlreadyInBatch) {
                $this->alreadyExistingCount++;
                $this->skipped++;

                // Nombre completo desde el Excel o desde la base de datos
                $rowFullName = trim(
                    ($row['last_name'] ?? $row['apellido_paterno'] ?? '').' '.
                    ($row['second_last_name'] ?? $row['apellido_materno'] ?? '').' '.
                    ($row['first_name'] ?? $row['nombres'] ?? $row['nombre'] ?? '')
                );
                $rowFullName = preg_replace('/\s+/', ' ', $rowFullName);

                $displayName = ! empty($existingUser?->name)
                    ? $existingUser->name
                    : (! empty($rowFullName) ? $rowFullName : 'Sin nombre');

                $this->repeatedUsers[] = [
                    'dni' => $cleanDni,
                    'name' => $displayName,
                    'row' => $index + 1,
                    'reason' => $existingUser ? 'Ya registrado en la base de datos' : 'Duplicado en el mismo archivo',
                ];

                Log::info('ℹ️ Fila '.($index + 1).": DNI '{$cleanDni}' ({$displayName}) ya existe. No se vuelve a subir.");

                continue;
            }

            // ✅ Validar campos obligatorios restantes
            $lastName = trim((string) ($row['last_name'] ?? $row['apellido_paterno'] ?? ''));
            if (empty($lastName)) {
                $this->errors[] = 'Fila '.($index + 1).': Apellido Paterno es obligatorio';
                $this->skipped++;
                Log::error('❌ Fila '.($index + 1).': last_name vacío');

                continue;
            }

            $secondLastName = trim((string) ($row['second_last_name'] ?? $row['apellido_materno'] ?? ''));

            $firstName = trim((string) ($row['first_name'] ?? $row['nombres'] ?? $row['nombre'] ?? ''));
            if (empty($firstName)) {
                $this->errors[] = 'Fila '.($index + 1).': Nombres es obligatorio';
                $this->skipped++;
                Log::error('❌ Fila '.($index + 1).': first_name vacío');

                continue;
            }

            $email = trim((string) ($row['email'] ?? $row['correo'] ?? ''));
            if (empty($email)) {
                $this->errors[] = 'Fila '.($index + 1).': Email es obligatorio';
                $this->skipped++;
                Log::error('❌ Fila '.($index + 1).': email vacío');

                continue;
            }

            // ✅ Verificar si el email ya existe
            if (User::where('email', $email)->exists()) {
                $this->errors[] = 'Fila '.($index + 1).": Email '{$email}' ya existe";
                $this->skipped++;
                Log::error('❌ Fila '.($index + 1).': Email duplicado '.$email);

                continue;
            }

            // ✅ Normalizar y validar rol
            $rawRole = strtolower(trim((string) ($row['role'] ?? $row['rol'] ?? '')));
            $role = $this->roleMap[$rawRole] ?? $rawRole;

            if (empty($role)) {
                $this->errors[] = 'Fila '.($index + 1).': Rol es obligatorio';
                $this->skipped++;
                Log::error('❌ Fila '.($index + 1).': role vacío');

                continue;
            }

            $validRoles = ['admin', 'specialist', 'supervisor', 'director', 'executive', 'super_admin'];
            if (! in_array($role, $validRoles, true)) {
                $this->errors[] = 'Fila '.($index + 1).": Rol '{$role}' no es válido. Usa: admin, specialist, supervisor, director, executive";
                $this->skipped++;
                Log::error('❌ Fila '.($index + 1).': Rol inválido '.$role);

                continue;
            }

            try {
                $password = 'Ugel'.$cleanDni.'*';

                $fullName = trim($lastName.' '.$secondLastName.' '.$firstName);
                $fullName = preg_replace('/\s+/', ' ', $fullName);

                $user = User::create([
                    'name' => $fullName,
                    'email' => $email,
                    'dni' => $cleanDni,
                    'role' => $role,
                    'password' => Hash::make($password),
                    'is_active' => true,
                ]);

                $this->processedDnis[] = $cleanDni;
                $this->processedDnis[] = $rawDni;
                $this->imported++;
                Log::info('✅ Usuario creado: '.$user->email.' (DNI: '.$cleanDni.', ID: '.$user->id.')');

            } catch (\Exception $e) {
                $this->skipped++;
                $this->errors[] = 'Fila '.($index + 1).': '.$e->getMessage();
                Log::error('❌ EXCEPCIÓN: '.$e->getMessage());
            }
        }

        Log::info('=== FIN IMPORTACIÓN ===');
        Log::info('✅ Importados: '.$this->imported);
        Log::info('ℹ️ Omitidos por DNI ya existente: '.$this->alreadyExistingCount);
        Log::info('❌ Omitidos en total: '.$this->skipped);
        Log::info('📋 Errores: '.json_encode($this->errors));
    }

    public function getImportedCount(): int
    {
        return $this->imported;
    }

    public function getSkippedCount(): int
    {
        return $this->skipped;
    }

    public function getAlreadyExistingCount(): int
    {
        return $this->alreadyExistingCount;
    }

    public function getRepeatedUsers(): array
    {
        return $this->repeatedUsers;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}
