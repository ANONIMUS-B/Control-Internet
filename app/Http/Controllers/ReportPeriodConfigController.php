<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ReportPeriodConfigController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user || $user->role !== 'super_admin') {
            abort(403, 'No tienes permiso para acceder a esta sección.');
        }

        $config = $this->getPeriodConfig();

        return Inertia::render('Admin/ReportPeriodConfig', [
            'startDay' => $config['start_day'],
            'endDay' => $config['end_day'],
            'isEnabled' => $config['enabled'],
            'message' => $config['message'] ?? null,
            'selectedMonth' => $config['month'] ?? date('n'),
            'selectedYear' => $config['year'] ?? date('Y'),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'super_admin') {
            abort(403, 'No tienes permiso para realizar esta acción.');
        }

        $request->validate([
            'start_day' => 'required|integer|min:1|max:28',
            'end_day' => 'required|integer|min:1|max:31|gte:start_day',
            'enabled' => 'required|boolean',
            'message' => 'nullable|string|max:500',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000|max:2100',
        ]);

        $this->savePeriodConfig(
            (int) $request->start_day,
            (int) $request->end_day,
            (bool) $request->enabled,
            $request->message,
            (int) $request->month,
            (int) $request->year,
            $user // ✅ Pasar el usuario autenticado
        );

        return redirect()->back()->with('success', '✅ Configuración del período de envío actualizada correctamente.');
    }

    protected function getPeriodConfig(): array
    {
        $config = Cache::get('report_period_config');

        if ($config) {
            return $config;
        }

        $config = [
            'start_day' => config('report.period.start_day', 1),
            'end_day' => config('report.period.end_day', 10),
            'enabled' => config('report.period.enabled', true),
            'message' => config('report.period.message', null),
            'month' => config('report.period.month', date('n')),
            'year' => config('report.period.year', date('Y')),
        ];

        Cache::forever('report_period_config', $config);

        return $config;
    }

    /**
     * Guardar la configuración del período
     * 
     * @param int $startDay
     * @param int $endDay
     * @param bool $enabled
     * @param string|null $message
     * @param int|null $month
     * @param int|null $year
     * @param \App\Models\User|null $user
     * @return void
     */
    protected function savePeriodConfig(
        int $startDay, 
        int $endDay, 
        bool $enabled, 
        ?string $message = null, 
        ?int $month = null, 
        ?int $year = null,
        $user = null // ✅ Recibir el usuario como parámetro
    ) {
        // ✅ Obtener nombre y email del usuario de manera segura
        $userName = $user ? $user->name : 'System';
        $userEmail = $user ? $user->email : 'system@system.com';

        $config = [
            'start_day' => $startDay,
            'end_day' => $endDay,
            'enabled' => $enabled,
            'message' => $message,
            'month' => $month ?? date('n'),
            'year' => $year ?? date('Y'),
            'updated_at' => now()->toDateTimeString(),
            'updated_by' => $userName,
        ];

        Cache::forever('report_period_config', $config);
        $this->saveConfigFile($config);

        Log::info('Configuración de período de envío actualizada', [
            'start_day' => $startDay,
            'end_day' => $endDay,
            'enabled' => $enabled,
            'month' => $month,
            'year' => $year,
            'updated_by' => $userEmail,
        ]);
    }

    protected function saveConfigFile(array $config)
    {
        $content = "<?php\n\nreturn [\n";
        $content .= "    'period' => [\n";
        $content .= "        'start_day' => {$config['start_day']},\n";
        $content .= "        'end_day' => {$config['end_day']},\n";
        $content .= "        'enabled' => " . ($config['enabled'] ? 'true' : 'false') . ",\n";
        $content .= "        'message' => " . ($config['message'] ? "'" . addslashes($config['message']) . "'" : 'null') . ",\n";
        $content .= "        'month' => {$config['month']},\n";
        $content .= "        'year' => {$config['year']},\n";
        $content .= "    ],\n";
        $content .= "];\n";

        file_put_contents(config_path('report.php'), $content);
    }
}