<?php

namespace App\Http\Controllers;

use App\Models\ReportPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportPeriodController extends Controller
{
    /**
     * Mostrar lista de períodos configurados
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'super_admin') {
            abort(403, 'No tienes permiso para acceder a esta sección.');
        }

        $periods = ReportPeriod::orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get();

        return Inertia::render('Admin/ReportPeriods/Index', [
            'periods' => $periods,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Mostrar formulario para crear un período
     */
    public function create(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'super_admin') {
            abort(403, 'No tienes permiso para acceder a esta sección.');
        }

        return Inertia::render('Admin/ReportPeriods/Create');
    }

    /**
     * Guardar un nuevo período
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'super_admin') {
            abort(403, 'No tienes permiso para realizar esta acción.');
        }

        $validated = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000|max:2100',
            'start_date' => 'required|date|before_or_equal:end_date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'message' => 'nullable|string|max:500',
        ]);

        // ✅ Verificar que no exista un período para este mes/año
        $exists = ReportPeriod::where('month', $validated['month'])
            ->where('year', $validated['year'])
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'month' => 'Ya existe un período configurado para este mes y año.'
            ]);
        }

        $period = ReportPeriod::create([
            'month' => $validated['month'],
            'year' => $validated['year'],
            'start_date' => Carbon::parse($validated['start_date']),
            'end_date' => Carbon::parse($validated['end_date']),
            'is_active' => $validated['is_active'] ?? true,
            'message' => $validated['message'] ?? null,
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);

        // ✅ Limpiar caché
        Cache::forget('report_period_' . $period->month . '_' . $period->year);

        return redirect()->route('admin.report-periods.index')
            ->with('success', "✅ Período configurado correctamente para {$period->month_name} {$period->year}.");
    }

    /**
     * Mostrar formulario para editar un período
     */
    public function edit(Request $request, ReportPeriod $period)
    {
        $user = $request->user();
        if ($user->role !== 'super_admin') {
            abort(403, 'No tienes permiso para acceder a esta sección.');
        }

        return Inertia::render('Admin/ReportPeriods/Edit', [
            'period' => $period,
        ]);
    }

    /**
     * Actualizar un período
     */
    public function update(Request $request, ReportPeriod $period)
    {
        $user = $request->user();
        if ($user->role !== 'super_admin') {
            abort(403, 'No tienes permiso para realizar esta acción.');
        }

        $validated = $request->validate([
            'start_date' => 'required|date|before_or_equal:end_date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'message' => 'nullable|string|max:500',
        ]);

        $period->update([
            'start_date' => Carbon::parse($validated['start_date']),
            'end_date' => Carbon::parse($validated['end_date']),
            'is_active' => $validated['is_active'] ?? true,
            'message' => $validated['message'] ?? null,
            'updated_by' => $user->id,
        ]);

        // ✅ Limpiar caché
        Cache::forget('report_period_' . $period->month . '_' . $period->year);

        return redirect()->route('admin.report-periods.index')
            ->with('success', "✅ Período actualizado correctamente para {$period->month_name} {$period->year}.");
    }

    /**
     * Eliminar un período
     */
    public function destroy(Request $request, ReportPeriod $period)
    {
        $user = $request->user();
        if ($user->role !== 'super_admin') {
            abort(403, 'No tienes permiso para realizar esta acción.');
        }

        $monthName = $period->month_name;
        $year = $period->year;

        // ✅ Limpiar caché
        Cache::forget('report_period_' . $period->month . '_' . $period->year);

        $period->delete();

        return redirect()->route('admin.report-periods.index')
            ->with('success', "🗑️ Período eliminado correctamente para {$monthName} {$year}.");
    }

    /**
     * Obtener período configurado para un mes/año específico
     */
    public function getPeriod($month, $year)
    {
        $cacheKey = 'report_period_' . $month . '_' . $year;
        
        return Cache::remember($cacheKey, 3600, function () use ($month, $year) {
            return ReportPeriod::where('month', $month)
                ->where('year', $year)
                ->where('is_active', true)
                ->first();
        });
    }
}