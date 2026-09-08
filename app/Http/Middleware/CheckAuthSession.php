<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckAuthSession
{
    public function handle(Request $request, Closure $next)
    {
        // ✅ Si el usuario está autenticado pero la sesión no tiene token, cerrar sesión
        if (Auth::check()) {
            try {
                // Verificar que la sesión sea válida
                if (!$request->session()->has('_token')) {
                    Auth::logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();
                    return redirect()->route('login')->with('error', 'Tu sesión expiró. Por favor, inicia sesión nuevamente.');
                }
            } catch (\Exception $e) {
                // Si hay error, cerrar sesión
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                return redirect()->route('login')->with('error', 'Error de sesión. Por favor, inicia sesión nuevamente.');
            }
        }

        return $next($request);
    }
}