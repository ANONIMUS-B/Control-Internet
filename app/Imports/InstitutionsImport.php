<?php

namespace App\Imports;

use App\Models\EducationalInstitution;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Log;

class InstitutionsImport implements ToCollection, WithHeadingRow
{
    protected $imported = 0;
    protected $skipped = 0;
    protected $errors = [];

    /**
     * Procesar la colección de filas del Excel.
     * Inserta cada fila directamente sin verificar duplicados.
     */
    public function collection(Collection $collection)
    {
        if ($collection->isEmpty()) {
            $this->errors[] = 'El archivo no contiene datos.';
            return;
        }

        foreach ($collection as $index => $row) {
            try {
                // Saltar filas totalmente vacías
                if ($this->isEmptyRow($row)) {
                    $this->skipped++;
                    Log::info('Fila omitida: vacía', ['fila' => $index + 2]);
                    continue;
                }

                // Obtener datos de la fila
                $modularCode     = $this->getValue($row, 'modular_code');
                $localCode       = $this->getValue($row, 'local_code');
                $name            = $this->getValue($row, 'name');
                $district        = $this->getValue($row, 'district');
                $level           = $this->getValue($row, 'level');
                $typeManagement  = $this->getValue($row, 'type_management') ?? 'Pública';
                $department      = $this->getValue($row, 'department') ?? 'Huánuco';
                $province        = $this->getValue($row, 'province') ?? 'Ambo';
                $ugel            = $this->getValue($row, 'ugel') ?? 'UGEL Ambo';
                $populatedCenter = $this->getValue($row, 'populated_center');
                $address         = $this->getValue($row, 'address');

                // Si no cuenta con nombre, omitir
                if (empty($name)) {
                    $this->skipped++;
                    Log::info('Fila omitida: sin nombre de institución', ['fila' => $index + 2]);
                    continue;
                }

                // Datos a guardar
                $data = [
                    'modular_code'     => !empty($modularCode) ? $modularCode : null,
                    'local_code'       => !empty($localCode) ? $localCode : null,
                    'name'             => $name,
                    'level'            => !empty($level) ? $level : null,
                    'type_management'  => $typeManagement,
                    'department'       => $department,
                    'province'         => $province,
                    'district'         => !empty($district) ? $district : null,
                    'ugel'             => $ugel,
                    'populated_center' => !empty($populatedCenter) ? $populatedCenter : null,
                    'address'          => !empty($address) ? $address : null,
                    'is_active'        => true,
                ];

                // Crear siempre un nuevo registro
                $institution = EducationalInstitution::create($data);
                $this->imported++;

                Log::info('Institución CREADA', [
                    'id'           => $institution->id,
                    'modular_code' => $modularCode,
                    'local_code'   => $localCode,
                    'nombre'       => $name,
                ]);

            } catch (\Exception $e) {
                $this->skipped++;
                $errorMsg = "Fila " . ($index + 2) . ": " . $e->getMessage();
                $this->errors[] = $errorMsg;
                Log::error('Error en importación', [
                    'fila'  => $index + 2,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    protected function isEmptyRow($row): bool
    {
        $keys = ['modular_code', 'local_code', 'name', 'district', 'level'];
        foreach ($keys as $key) {
            $value = $this->getValue($row, $key);
            if (!empty($value)) {
                return false;
            }
        }
        return true;
    }

    protected function getValue($row, string $key)
    {
        return isset($row[$key]) ? trim((string) $row[$key]) : null;
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