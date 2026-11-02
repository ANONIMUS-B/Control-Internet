<?php

use App\Http\Controllers\InstitutionController;
use App\Http\Middleware\CheckUserActive;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\MaintenanceMode;
use App\Models\EducationalInstitution;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\ConnectionResolverInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    $this->originalConnectionResolver = Model::getConnectionResolver();
    $blockedResolver = Mockery::mock(ConnectionResolverInterface::class);
    $blockedResolver->shouldNotReceive('connection');
    Model::setConnectionResolver($blockedResolver);
});

afterEach(function () {
    Model::setConnectionResolver($this->originalConnectionResolver);
});

test('institution management permissions follow the administrative role matrix', function (string $role, bool $allowed, string $ability) {
    $user = new User(['role' => $role]);
    $institution = new EducationalInstitution;
    $subject = $ability === 'create' ? EducationalInstitution::class : $institution;

    expect(Gate::forUser($user)->allows($ability, $subject))->toBe($allowed);
})->with([
    'administrator' => ['admin', true],
    'super administrator' => ['super_admin', true],
    'director' => ['director', false],
    'specialist' => ['specialist', false],
    'supervisor' => ['supervisor', false],
    'legacy executive' => ['executive', false],
    'unknown role' => ['unknown', false],
])->with(['create', 'update', 'delete']);

test('institution write actions reject unauthorized users before accessing the database', function (?string $role, string $action) {
    if ($role !== null) {
        $this->actingAs(new User(['role' => $role]));
    }

    $controller = new InstitutionController;
    $institution = new EducationalInstitution(['name' => 'Institución de prueba']);
    $request = Request::create('/institutions', 'POST', ['name' => 'Cambio no autorizado']);

    $operation = match ($action) {
        'store' => fn () => $controller->store($request),
        'update' => fn () => $controller->update($request, $institution),
        'destroy' => fn () => $controller->destroy($institution),
        'toggle' => fn () => $controller->toggle($institution),
    };

    expect($operation)->toThrow(AuthorizationException::class);
    expect($institution->name)->toBe('Institución de prueba');
})->with([
    'director' => ['director'],
    'guest' => [null],
])->with(['store', 'update', 'destroy', 'toggle']);

test('institution write endpoints return 403 for a director', function (string $method, string $uri) {
    $this->withoutMiddleware([
        CheckUserActive::class,
        HandleInertiaRequests::class,
        MaintenanceMode::class,
    ]);
    $this->actingAs(new User(['role' => 'director']));
    $institution = new EducationalInstitution(['name' => 'Institución de prueba']);
    app('router')->bind('institution', fn () => $institution);

    $this->call($method, $uri, ['name' => 'Cambio no autorizado'])->assertForbidden();
})->with([
    'create' => ['POST', '/institutions'],
    'update' => ['PUT', '/institutions/1'],
    'delete' => ['DELETE', '/institutions/1'],
    'toggle' => ['PATCH', '/institutions/1/toggle'],
]);
