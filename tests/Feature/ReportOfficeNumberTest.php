<?php

use App\Models\EducationalInstitution;
use App\Models\ReportPeriod;
use App\Models\User;

test('directors must enter an office number to submit a report', function (?string $officeNumber) {
    $this->travelTo(now()->setDate(2026, 11, 4)->startOfDay());
    $director = User::factory()->create(['role' => 'director']);
    $institution = EducationalInstitution::create(['name' => 'Institución asignada']);
    $director->institutions()->attach($institution);
    ReportPeriod::create(['month' => 10, 'year' => 2026, 'start_date' => '2026-10-26', 'end_date' => '2026-11-08', 'is_active' => true]);

    $this->actingAs($director)->post(route('reports.store'), [
        'educational_institution_id' => $institution->id,
        'month' => 10,
        'year' => 2026,
        'service_state' => 'operative',
        'office_number' => $officeNumber,
    ])->assertSessionHasErrors('office_number');

    $this->assertDatabaseCount('monthly_reports', 0);
})->with([null, '', '   ']);

test('directors can submit a report with an office number', function () {
    $this->travelTo(now()->setDate(2026, 11, 4)->startOfDay());
    $director = User::factory()->create(['role' => 'director']);
    $institution = EducationalInstitution::create(['name' => 'Institución asignada']);
    $director->institutions()->attach($institution);
    ReportPeriod::create(['month' => 10, 'year' => 2026, 'start_date' => '2026-10-26', 'end_date' => '2026-11-08', 'is_active' => true]);

    $this->actingAs($director)->post(route('reports.store'), [
        'educational_institution_id' => $institution->id,
        'month' => 10,
        'year' => 2026,
        'service_state' => 'operative',
        'office_number' => '039',
    ])->assertRedirect(route('reports.index'))->assertSessionHasNoErrors();

    $this->assertDatabaseHas('monthly_reports', [
        'institution_id' => $institution->id,
        'office_number' => '039',
    ]);
});
