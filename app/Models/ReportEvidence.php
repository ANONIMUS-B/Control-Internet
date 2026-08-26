<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ReportEvidence extends Model
{
    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'monthly_report_id',
        'file_path'
    ];

    /**
     * Los atributos que deben ser convertidos a tipos nativos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'id' => 'integer',
        'monthly_report_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación: Una evidencia pertenece a un reporte mensual.
     *
     * @return BelongsTo
     */
    public function report(): BelongsTo
    {
        return $this->belongsTo(MonthlyReport::class, 'monthly_report_id');
    }

    /**
     * Relación: Obtener la institución a través del reporte.
     * 
     * NOTA: Esta relación usa hasOneThrough para llegar a EducationalInstitution
     * pasando por MonthlyReport.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOneThrough
     */
    public function institution()
    {
        return $this->hasOneThrough(
            EducationalInstitution::class,  // Modelo final al que queremos llegar
            MonthlyReport::class,           // Modelo intermedio
            'id',                           // Llave local en MonthlyReport (la que usamos para la relación con EducationalInstitution)
            'id',                           // Llave local en EducationalInstitution (la que usamos para la relación con MonthlyReport)
            'monthly_report_id',            // Llave foránea en ReportEvidence que apunta a MonthlyReport
            'institution_id'                // Llave foránea en MonthlyReport que apunta a EducationalInstitution
        );
    }

    /**
     * Versión simplificada: Obtener la institución a través del reporte.
     * Esta es una forma más directa y menos propensa a errores.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOneThrough
     */
    public function institutionSimplified()
    {
        // Usamos la relación report() para navegar a la institución
        return $this->hasOneThrough(
            EducationalInstitution::class,
            MonthlyReport::class,
            'id',                // Llave primaria en MonthlyReport
            'id',                // Llave primaria en EducationalInstitution
            'monthly_report_id', // Llave foránea en ReportEvidence (report_evidence.monthly_report_id)
            'institution_id'     // Llave foránea en MonthlyReport (monthly_reports.institution_id)
        );
    }

    /**
     * ACCESORES
     */
    
    /**
     * Obtener la URL completa de la imagen.
     *
     * @return string
     */
    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->file_path);
    }

    /**
     * Obtener el nombre del archivo.
     *
     * @return string
     */
    public function getFilenameAttribute(): string
    {
        return basename($this->file_path);
    }

    /**
     * Obtener el tamaño del archivo en formato legible.
     *
     * @return string|null
     */
    public function getFileSizeAttribute(): ?string
    {
        if (!Storage::disk('public')->exists($this->file_path)) {
            return null;
        }

        $bytes = Storage::disk('public')->size($this->file_path);
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * MÉTODOS ÚTILES
     */

    /**
     * Verificar si el archivo existe en el disco.
     *
     * @return bool
     */
    public function fileExists(): bool
    {
        return Storage::disk('public')->exists($this->file_path);
    }

    /**
     * Eliminar el archivo físico del disco.
     *
     * @return bool
     */
    public function deleteFile(): bool
    {
        if ($this->fileExists()) {
            return Storage::disk('public')->delete($this->file_path);
        }
        return false;
    }

    /**
     * Sobrescribir el método delete para eliminar también el archivo físico.
     *
     * @return bool|null
     */
    public function delete(): ?bool
    {
        $this->deleteFile();
        return parent::delete();
    }

    /**
     * SCOPES
     */

    /**
     * Filtrar evidencias por reporte.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $reportId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForReport($query, int $reportId)
    {
        return $query->where('monthly_report_id', $reportId);
    }
}