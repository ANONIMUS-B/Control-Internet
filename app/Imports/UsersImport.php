<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log; // ✅ IMPORTADO

class UsersImport implements ToCollection, WithHeadingRow
{
    protected $imported = 0;
    protected $skipped = 0;
    protected $errors = [];

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
        Log::info('Filas en el archivo: ' . $collection->count());

        foreach ($collection as $index => $row) {
            // ✅ Verificar si la fila está vacía
            $isEmpty = true;
            foreach ($row as $value) {
                if (!empty($value) && !is_null($value)) {
                    $isEmpty = false;
                    break;
                }
            }

            if ($isEmpty) {
                Log::info('Fila ' . ($index + 1) . ' está vacía, omitiendo');
                continue;
            }

            Log::info('Fila ' . ($index + 1) . ' datos: ' . json_encode($row->toArray()));

            // ✅ Validar campos requeridos
            $role = strtolower($row['role'] ?? '');
            $role = $this->roleMap[$role] ?? $role;

            if (empty($row['dni'])) {
                $this->errors[] = "Fila " . ($index + 1) . ": DNI es obligatorio";
                $this->skipped++;
                Log::error('❌ Fila ' . ($index + 1) . ': DNI vacío');
                continue;
            }

            if (empty($row['last_name'])) {
                $this->errors[] = "Fila " . ($index + 1) . ": Apellido Paterno es obligatorio";
                $this->skipped++;
                Log::error('❌ Fila ' . ($index + 1) . ': last_name vacío');
                continue;
            }

            if (empty($row['first_name'])) {
                $this->errors[] = "Fila " . ($index + 1) . ": Nombres es obligatorio";
                $this->skipped++;
                Log::error('❌ Fila ' . ($index + 1) . ': first_name vacío');
                continue;
            }

            if (empty($row['email'])) {
                $this->errors[] = "Fila " . ($index + 1) . ": Email es obligatorio";
                $this->skipped++;
                Log::error('❌ Fila ' . ($index + 1) . ': email vacío');
                continue;
            }

            if (empty($row['role'])) {
                $this->errors[] = "Fila " . ($index + 1) . ": Rol es obligatorio";
                $this->skipped++;
                Log::error('❌ Fila ' . ($index + 1) . ': role vacío');
                continue;
            }

            // ✅ Verificar si el DNI ya existe
            if (User::where('dni', $row['dni'])->exists()) {
                $this->errors[] = "Fila " . ($index + 1) . ": DNI '{$row['dni']}' ya existe";
                $this->skipped++;
                Log::error('❌ Fila ' . ($index + 1) . ': DNI duplicado ' . $row['dni']);
                continue;
            }

            // ✅ Verificar si el email ya existe
            if (User::where('email', $row['email'])->exists()) {
                $this->errors[] = "Fila " . ($index + 1) . ": Email '{$row['email']}' ya existe";
                $this->skipped++;
                Log::error('❌ Fila ' . ($index + 1) . ': Email duplicado ' . $row['email']);
                continue;
            }

            // ✅ Verificar que el rol sea válido
            $validRoles = ['admin', 'specialist', 'supervisor', 'director', 'executive'];
            if (!in_array($role, $validRoles)) {
                $this->errors[] = "Fila " . ($index + 1) . ": Rol '{$role}' no es válido. Usa: admin, specialist, supervisor, director, executive";
                $this->skipped++;
                Log::error('❌ Fila ' . ($index + 1) . ': Rol inválido ' . $role);
                continue;
            }

            try {
                $password = 'Ugel' . $row['dni'] . '*';
                Log::info('🔑 Contraseña generada: ' . $password);

                $fullName = trim(
                    ($row['last_name'] ?? '') . ' ' . 
                    ($row['second_last_name'] ?? '') . ' ' . 
                    ($row['first_name'] ?? '')
                );
                $fullName = preg_replace('/\s+/', ' ', $fullName);
                Log::info('📝 Nombre completo: ' . $fullName);

                $user = User::create([
                    'name' => $fullName,
                    'email' => $row['email'],
                    'dni' => $row['dni'],
                    'role' => $role,
                    'password' => Hash::make($password),
                    'is_active' => true,
                ]);

                $this->imported++;
                Log::info('✅ Usuario creado: ' . $user->email . ' (ID: ' . $user->id . ')');

            } catch (\Exception $e) {
                $this->skipped++;
                $this->errors[] = "Fila " . ($index + 1) . ": " . $e->getMessage();
                Log::error('❌ EXCEPCIÓN: ' . $e->getMessage());
            }
        }

        Log::info('=== FIN IMPORTACIÓN ===');
        Log::info('✅ Importados: ' . $this->imported);
        Log::info('❌ Omitidos: ' . $this->skipped);
        Log::info('📋 Errores: ' . json_encode($this->errors));
    }

    public function getImportedCount(): int
    {
        return $this->imported;
    }

    public function getSkippedCount(): int
    {
        return $this->skipped;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}