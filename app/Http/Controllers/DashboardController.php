<?php

namespace App\Http\Controllers;

use App\Models\MonthlyReport;
use App\Models\ReportPeriod;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $summaries = [];

        if ($user->role === 'director') {
            $periods = ReportPeriod::current()->orderByDesc('start_date')->orderByDesc('id')->get();

            if ($periods->isNotEmpty()) {
                $reports = MonthlyReport::query()
                    ->whereIn('institution_id', $user->institutions()->select('educational_institutions.id'))
                    ->join('report_periods', function ($join) {
                        $join->on('monthly_reports.month', '=', 'report_periods.month')
                            ->on('monthly_reports.year', '=', 'report_periods.year');
                    })
                    ->whereIn('report_periods.id', $periods->modelKeys())
                    ->selectRaw('report_periods.id as period_id, monthly_reports.status, count(*) as total')
                    ->groupBy('report_periods.id', 'monthly_reports.status')
                    ->get()
                    ->groupBy('period_id');

                $summaries = $periods->map(function (ReportPeriod $period) use ($reports): array {
                    $counts = $reports->get($period->id, collect())->pluck('total', 'status');

                    return [
                        'month' => $period->month_name,
                        'year' => $period->year,
                        'endDate' => $period->end_date->format('d/m/Y'),
                        'pending' => (int) ($counts['pending'] ?? 0),
                        'observed' => (int) ($counts['observed'] ?? 0),
                        'approved' => (int) ($counts['approved'] ?? 0),
                        'rejected' => (int) ($counts['rejected'] ?? 0),
                    ];
                })->all();
            }
        }

        return Inertia::render('dashboard', ['reportSummaries' => $summaries]);
    }
}
