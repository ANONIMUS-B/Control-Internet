<?php

namespace App\Imports;

use App\Models\NetworkEquipment;
use App\Models\EducationalInstitution;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Log;

class NetworkEquipmentsImport implements ToCollection, WithHeadingRow
{
    protected $importedCount = 0;
    protected $skippedCount = 0;
    protected $errors = [];
    protected $institutionCache = [];

    /**
     * Obtener institución por código local con caché
     */
    protected function getInstitutionByLocalCode($localCode)
    {
        if (empty($localCode)) {
            return null;
        }

        $localCodeStr = trim((string) $localCode);

        if (isset($this->institutionCache[$localCodeStr])) {
            return $this->institutionCache[$localCodeStr];
        }

        $institution = EducationalInstitution::where('local_code', $localCodeStr)->first();
        $this->institutionCache[$localCodeStr] = $institution;

        return $institution;
    }

    public function collection(Collection $collection)
    {
        if ($collection->isEmpty()) {
            $this->errors[] = 'El archivo Excel no contiene datos.';
            return;
        }

        foreach ($collection as $index => $row) {
            try {
                // Obtener datos de la fila con limpieza
                $localCode   = $this->getValue($row, ['codigo_local', 'codigo_de_local', 'local_code', 'codigo']);
                $description = $this->getValue($row, ['descripcion', 'description']);
                $brand       = $this->getValue($row, ['marca', 'brand']);
                $model       = $this->getValue($row, ['modelo', 'model']);
                $mac         = $this->getValue($row, ['mac', 'mac_address', 'direccion_mac']);
                $status      = $this->getValue($row, ['estado', 'status']) ?? 'OPERATIVO';

                // Omitir si la fila viene completamente vacía
                if (empty($localCode) && empty($description) && empty($brand) && empty($mac)) {
                    $this->skippedCount++;
                    continue;
                }

                // Buscar institución para autocompletar nombre y nivel
                $institution = $this->getInstitutionByLocalCode($localCode);
                $institutionName = $institution ? $institution->name : ($this->getValue($row, ['ie', 'institucion']) ?? 'IE Local ' . ($localCode ?? 'S/C'));
                $level = $institution ? $institution->level : $this->getValue($row, ['nivel', 'level']);

                $data = [
                    'local_code'       => !empty($localCode) ? (string)$localCode : null,
                    'institution_name' => $institutionName,
                    'level'            => !empty($level) ? $level : null,
                    'description'      => !empty($description) ? $description : 'Equipo de Red',
                    'brand'            => !empty($brand) ? $brand : 'Genérico',
                    'model'            => !empty($model) ? $model : '-',
                    'mac_address'      => !empty($mac) ? $mac : null,
                    'status'           => strtoupper($status),
                    'is_active'        => true,
                ];

                // Crear el registro directamente
                NetworkEquipment::create($data);
                $this->importedCount++;

            } catch (\Exception $e) {
                $this->skippedCount++;
                $errorMsg = "Fila " . ($index + 2) . ": " . $e->getMessage();
                $this->errors[] = $errorMsg;
                Log::error('Error importando equipo de red', [
                    'fila'  => $index + 2,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Obtener valor seguro buscando entre posibles alias de columna
     */
    protected function getValue($row, $keys)
    {
        if (is_string($keys)) {
            $keys = [$keys];
        }

        foreach ($keys as $key) {
            if (isset($row[$key]) && trim((string)$row[$key]) !== '') {
                return trim((string)$row[$key]);
            }
        }

        return null;
    }

    public function getImportedCount(): int
    {
        return $this->importedCount;
    }

    public function getSkippedCount(): int
    {
        return $this->skippedCount;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}