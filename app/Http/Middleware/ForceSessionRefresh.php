<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ForceSessionRefresh
{
    public function handle(Request $request, Closure $next)
    {
        // ✅ Si la sesión está corrupta, regenerar automáticamente
        if ($request->session()->isStarted()) {
            try {
                // Verificar si la sesión tiene datos válidos
                $token = $request->session()->get('_token');
                
                // Si no hay token y no es una petición de login, regenerar
                if ($token === null && !$request->is('login*') && !$request->is('logout*')) {
                    $request->session()->regenerate();
                    $request->session()->regenerateToken();
                }
            } catch (\Exception $e) {
                // Si hay cualquier error, regenerar sesión
                $request->session()->regenerate();
                $request->session()->regenerateToken();
            }
        }

        return $next($request);
    }
}