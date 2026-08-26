<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaintenanceController extends Controller
{
    /**
     * Mostrar página de mantenimiento (SIN layout del sistema)
     */
    public function index()
    {
        return Inertia::render('Maintenance', [
            'maintenance' => true,
        ]);
    }

    /**
     * Activar modo mantenimiento (SOLO SUPER_ADMIN)
     */
    public function enable(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'super_admin') {
            return back()->with('error', 'No tienes permiso para realizar esta acción.');
        }

        User::query()->update(['maintenance_mode' => true]);

        return back()->with('success', '✅ Modo mantenimiento ACTIVADO.');
    }

    /**
     * Desactivar modo mantenimiento (SOLO SUPER_ADMIN)
     */
    public function disable(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'super_admin') {
            return back()->with('error', 'No tienes permiso para realizar esta acción.');
        }

        User::query()->update(['maintenance_mode' => false]);

        return back()->with('success', '✅ Modo mantenimiento DESACTIVADO.');
    }

    /**
     * Verificar estado del modo mantenimiento
     */
    public function status()
    {
        $maintenanceMode = User::where('maintenance_mode', true)->exists();

        return response()->json([
            'maintenance_mode' => $maintenanceMode,
        ]);
    }
}