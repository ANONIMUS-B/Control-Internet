<?php

namespace App\Policies;

use App\Models\MonthlyReport;
use App\Models\User;

class MonthlyReportPolicy
{
    /**
     * ¿Quién puede ver la lista general de reportes?
     */
    public function viewAny(User $user): bool
    {
        // Todos pueden acceder a la vista, pero los controladores filtrarán la información que ven
        return true; 
    }

    /**
     * ¿Quién puede ver el detalle de un reporte específico?
     */
    public function view(User $user, MonthlyReport $monthlyReport): bool
    {
        // Admin, Especialista y Director de UGEL (Ejecutivo) tienen acceso de lectura global[cite: 1]
        if (in_array($user->role, ['admin', 'specialist', 'executive'])) {
            return true;
        }

        // Un Director de I.E. solo puede ver el reporte si pertenece a su propia institución asignada[cite: 1]
        return $user->role === 'director' && $user->institution_id === $monthlyReport->institution_id;
    }

    /**
     * ¿Quién puede crear un nuevo reporte?
     */
    public function create(User $user): bool
    {
        // Solo los Directores de I.E. pueden enviar los formularios mensuales[cite: 1]
        return $user->role === 'director';
    }

    /**
     * ¿Quién puede modificar o subsanar un reporte existente?
     */
    public function update(User $user, MonthlyReport $monthlyReport): bool
    {
        // Si el reporte ya fue aprobado por la UPDI, se bloquea la edición para todos
        if ($monthlyReport->status === 'approved') {
            return false;
        }

        // Un Director solo puede modificarlo si está en estado 'pending' (borrador) o 'observed' (para subsanar)[cite: 1]
        return $user->role === 'director' 
            && $user->institution_id === $monthlyReport->institution_id
            && in_array($monthlyReport->status, ['pending', 'observed']);
    }
}