<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\ReportPeriod;
use Carbon\Carbon;
use Symfony\Component\HttpFoundation\Response;

class CheckReportSubmissionPeriod
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if ($user) {
            // ✅ SUPER_ADMIN, ADMIN, SPECIALIST siempre pueden enviar
            $allowedRoles = ['super_admin', 'admin', 'specialist'];
            
            if (in_array($user->role, $allowedRoles)) {
                return $next($request);
            }

            // ✅ Solo verificar para directores
            if ($user->role === 'director') {
                $today = Carbon::now();
                
                // ✅ Buscar períodos activos vigentes (fecha actual dentro del rango)
                $activePeriods = ReportPeriod::where('is_active', true)
                    ->where('start_date', '<=', $today)
                    ->where('end_date', '>=', $today)
                    ->get();

                // ✅ Si hay períodos activos, permitir el acceso
                if ($activePeriods->count() > 0) {
                    return $next($request);
                }

                // ✅ Si no hay períodos vigentes, pero hay períodos activos futuros o pasados
                // permitir también (para que puedan ver el formulario)
                $anyActivePeriods = ReportPeriod::where('is_active', true)->get();
                
                if ($anyActivePeriods->count() > 0) {
                    return $next($request);
                }

                // ✅ Si no hay ningún período configurado, bloquear con mensaje
                return redirect()->route('reports.index')->with('error', 
                    '⛔ No hay períodos de envío configurados. Contacta al administrador.'
                );
            }
        }

        return $next($request);
    }
}