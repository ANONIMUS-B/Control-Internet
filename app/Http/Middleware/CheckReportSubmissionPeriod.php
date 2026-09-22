<?php

namespace App\Http\Middleware;

use App\Models\ReportPeriod;
use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
                $todayStr = Carbon::today()->toDateString();

                // 1. Si es envío de nuevo reporte (POST /reportes):
                if ($request->isMethod('POST') && $request->routeIs('reports.store')) {
                    $month = (int) $request->input('month');
                    $year = (int) $request->input('year');

                    $validPeriod = ReportPeriod::where('is_active', true)
                        ->where('month', $month)
                        ->where('year', $year)
                        ->whereDate('start_date', '<=', $todayStr)
                        ->whereDate('end_date', '>=', $todayStr)
                        ->exists();

                    if (! $validPeriod) {
                        return back()->withErrors([
                            'month' => '⛔ El período para enviar el reporte de este mes ha finalizado o no está habilitado.',
                        ])->with('error', '⛔ No puedes enviar un reporte fuera del rango de fechas establecido por la administración.');
                    }

                    return $next($request);
                }

                // 2. Si es acceso al formulario de creación (GET /reportes/nuevo):
                if ($request->routeIs('reports.create')) {
                    $hasCurrentPeriod = ReportPeriod::where('is_active', true)
                        ->whereDate('start_date', '<=', $todayStr)
                        ->whereDate('end_date', '>=', $todayStr)
                        ->exists();

                    if (! $hasCurrentPeriod) {
                        $nextPeriod = ReportPeriod::where('is_active', true)
                            ->whereDate('start_date', '>', $todayStr)
                            ->orderBy('start_date', 'asc')
                            ->first();

                        $msg = '⛔ Actualmente no hay ningún período de entrega de reportes habilitado.';
                        if ($nextPeriod) {
                            $msg .= " El próximo período de recepción iniciará el {$nextPeriod->start_date->format('d/m/Y')}.";
                        } else {
                            $msg .= ' Por favor, contacta a la administración de la UPDI.';
                        }

                        return redirect()->route('reports.index')->with('error', $msg);
                    }
                }
            }
        }

        return $next($request);
    }
}
