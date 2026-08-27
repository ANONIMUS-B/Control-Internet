<?php

namespace App\Imports;

use App\Models\NetworkEquipment;
use App\Models\EducationalInstitution;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Support\Facades\Log;

class NetworkEquipmentsImport implements ToModel, WithHeadingRow, SkipsOnError, SkipsOnFailure, WithBatchInserts, WithChunkReading
{
    use Importable;

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

        // ✅ Usar caché para evitar múltiples consultas
        if (isset($this->institutionCache[$localCode])) {
            return $this->institutionCache[$localCode];
        }

        $institution = EducationalInstitution::where('local_code', $localCode)->first();

        $this->institutionCache[$localCode] = $institution;

        return $institution;
    }

    public function model(array $row)
    {
        // ✅ Validar que tenga al menos descripcion o marca
        if (empty($row['descripcion']) && empty($row['marca']) && empty($row['modelo'])) {
            $this->skippedCount++;
            Log::info('Fila omitida: sin datos de equipo');
            return null;
        }

        // ✅ Buscar institución por código local
        $institution = null;
        $localCode = null;

        // Buscar en diferentes posibles nombres de columna
        $localCodeFields = ['codigo_de_local', 'codigo_local', 'local_code', 'codigo'];
        foreach ($localCodeFields as $field) {
            if (!empty($row[$field])) {
                $localCode = $row[$field];
                break;
            }
        }

        if ($localCode) {
            $institution = $this->getInstitutionByLocalCode($localCode);
        }

        // ✅ Datos del equipo
        $data = [
            'local_code' => $localCode,
            'institution_name' => $institution ? $institution->name : ($row['ie'] ?? null),
            'level' => $institution ? $institution->level : ($row['nivel'] ?? null),
            'description' => $row['descripcion'] ?? null,
            'brand' => $row['marca'] ?? null,
            'model' => $row['modelo'] ?? null,
            'mac_address' => $row['mac'] ?? null,
            'status' => $row['estado'] ?? 'OPERATIVO',
            'is_active' => true,
        ];

        // ✅ Si no hay nombre de institución y no hay código local, omitir
        if (empty($data['institution_name']) && empty($data['local_code'])) {
            $this->skippedCount++;
            Log::info('Fila omitida: sin institución ni código local');
            return null;
        }

        // ✅ Buscar si ya existe un equipo con la misma MAC
        $existing = null;
        if (!empty($data['mac_address'])) {
            $existing = NetworkEquipment::where('mac_address', $data['mac_address'])->first();
        }

        // ✅ Si no encuentra por MAC, buscar por local_code y descripción
        if (!$existing && $localCode && $data['description']) {
            $existing = NetworkEquipment::where('local_code', $localCode)
                ->where('description', $data['description'])
                ->first();
        }

        if ($existing) {
            // ✅ Actualizar equipo existente
            $existing->update($data);
            $this->importedCount++;
            Log::info('Equipo actualizado: ' . ($data['mac_address'] ?? 'sin MAC') . ' - ' . ($data['institution_name'] ?? 'sin IE'));
            return null;
        } else {
            // ✅ Crear nuevo equipo
            $this->importedCount++;
            Log::info('Equipo creado: ' . ($data['mac_address'] ?? 'sin MAC') . ' - ' . ($data['institution_name'] ?? 'sin IE'));
            return new NetworkEquipment($data);
        }
    }

    public function onError(\Throwable $e)
    {
        $this->errors[] = $e->getMessage();
        Log::error('Error en importación de equipos: ' . $e->getMessage());
    }

    public function onFailure(\Maatwebsite\Excel\Validators\Failure ...$failures)
    {
        foreach ($failures as $failure) {
            $this->errors[] = "Fila {$failure->row()}: " . implode(', ', $failure->errors());
            $this->skippedCount++;
        }
    }

    public function batchSize(): int
    {
        return 100;
    }

    public function chunkSize(): int
    {
        return 100;
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