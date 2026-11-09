<?php

use App\Models\EducationalInstitution;
use App\Models\MonthlyReport;
use App\Models\ReportPeriod;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('directors see current period reports only for their assigned institutions', function () {
    $this->travelTo(now()->setDate(2026, 11, 4)->startOfDay());
    $director = User::factory()->create(['role' => 'director']);
    $institution = EducationalInstitution::create(['name' => 'Institución asignada']);
    $otherInstitution = EducationalInstitution::create(['name' => 'Otra institución']);
    $director->institutions()->attach($institution);
    ReportPeriod::create(['month' => 10, 'year' => 2026, 'start_date' => '2026-10-26', 'end_date' => '2026-11-08', 'is_active' => true]);
    foreach ([[$institution, 'observed'], [$otherInstitution, 'approved']] as [$school, $status]) {
        MonthlyReport::create(['institution_id' => $school->id, 'user_id' => $director->id, 'month' => 10, 'year' => 2026, 'status' => $status, 'service_state' => 'operative']);
    }

    $this->actingAs($director)->get(route('dashboard'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->has('reportSummaries', 1)
        ->where('reportSummaries.0.month', 'Octubre')
        ->where('reportSummaries.0.endDate', '08/11/2026')
        ->where('reportSummaries.0.observed', 1)
        ->where('reportSummaries.0.approved', 0));
});

test('directors see each overlapping open period with its own report counts', function () {
    $this->travelTo(now()->setDate(2026, 11, 4)->startOfDay());
    $director = User::factory()->create(['role' => 'director']);
    $institution = EducationalInstitution::create(['name' => 'Institución asignada']);
    $director->institutions()->attach($institution);
    ReportPeriod::create(['month' => 10, 'year' => 2026, 'start_date' => '2026-10-26', 'end_date' => '2026-11-08', 'is_active' => true]);
    ReportPeriod::create(['month' => 11, 'year' => 2026, 'start_date' => '2026-11-01', 'end_date' => '2026-11-15', 'is_active' => true]);
    ReportPeriod::create(['month' => 9, 'year' => 2026, 'start_date' => '2026-11-01', 'end_date' => '2026-11-15', 'is_active' => false]);
    MonthlyReport::create(['institution_id' => $institution->id, 'user_id' => $director->id, 'month' => 10, 'year' => 2026, 'status' => 'observed', 'service_state' => 'operative']);
    MonthlyReport::create(['institution_id' => $institution->id, 'user_id' => $director->id, 'month' => 11, 'year' => 2026, 'status' => 'approved', 'service_state' => 'operative']);

    $this->actingAs($director)->get(route('dashboard'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->has('reportSummaries', 2)
        ->where('reportSummaries.0.month', 'Noviembre')
        ->where('reportSummaries.0.approved', 1)
        ->where('reportSummaries.0.observed', 0)
        ->where('reportSummaries.1.month', 'Octubre')
        ->where('reportSummaries.1.observed', 1)
        ->where('reportSummaries.1.approved', 0));
});

test('directors without an open period do not see a current report summary', function () {
    $director = User::factory()->create(['role' => 'director']);

    $this->actingAs($director)->get(route('dashboard'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->where('reportSummaries', []));
});

test('administrators can open the main and UPDI dashboards', function () {
    $administrator = User::factory()->create(['role' => 'admin']);

    $this->actingAs($administrator)->get(route('dashboard'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->where('reportSummaries', []));

    $this->actingAs($administrator)->get(route('admin.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Dashboard')
        ->has('reports.data')
        ->has('filters'));
});
