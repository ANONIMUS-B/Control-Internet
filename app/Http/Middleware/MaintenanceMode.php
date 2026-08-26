<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MaintenanceMode
{
    public function handle(Request $request, Closure $next)
    {
        // ✅ Verificar si el modo mantenimiento está activo
        $maintenanceMode = \App\Models\User::where('maintenance_mode', true)->exists();

        if ($maintenanceMode) {
            $user = Auth::user();

            // ✅ Si el usuario es SUPER_ADMIN, permitir acceso
            if ($user && $user->role === 'super_admin') {
                return $next($request);
            }

            // ✅ Si el usuario está autenticado pero NO es SUPER_ADMIN, redirigir
            if ($user) {
                return redirect()->route('maintenance');
            }

            // ✅ Si no está autenticado, redirigir a mantenimiento
            return redirect()->route('maintenance');
        }

        return $next($request);
    }
}