<?php

namespace App\Imports;

use App\Models\EducationalInstitution;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class InstitutionsImport implements ToCollection, WithHeadingRow
{
    protected $imported = 0;
    protected $skipped = 0;
    protected $errors = [];

    public function collection(Collection $collection)
    {
        foreach ($collection as $row) {
            // ✅ Intentar crear directamente
            try {
                $existing = EducationalInstitution::where('modular_code', $row['modular_code'])->first();

                if (!$existing) {
                    EducationalInstitution::create([
                        'modular_code' => $row['modular_code'],
                        'local_code' => $row['local_code'] ?? null,
                        'name' => $row['name'],
                        'level' => $row['level'] ?? null,
                        'type_management' => $row['type_management'] ?? 'Pública',
                        'department' => $row['department'] ?? 'Huánuco',
                        'province' => $row['province'] ?? 'Ambo',
                        'district' => $row['district'],
                        'ugel' => $row['ugel'] ?? 'UGEL Ambo',
                        'populated_center' => $row['populated_center'] ?? null,
                        'address' => $row['address'] ?? null,
                        'is_active' => true,
                    ]);
                    $this->imported++;
                } else {
                    $existing->update([
                        'name' => $row['name'] ?? $existing->name,
                        'district' => $row['district'] ?? $existing->district,
                        'is_active' => true,
                    ]);
                    $this->imported++;
                }
            } catch (\Exception $e) {
                $this->skipped++;
                $this->errors[] = $e->getMessage();
            }
        }
    }

    public function getImportedCount(): int { return $this->imported; }
    public function getSkippedCount(): int { return $this->skipped; }
    public function getErrors(): array { return $this->errors; }
}