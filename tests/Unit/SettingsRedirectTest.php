<?php

use Illuminate\Database\ConnectionResolverInterface;
use Illuminate\Database\Eloquent\Model;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    $this->originalConnectionResolver = Model::getConnectionResolver();
    $blockedResolver = Mockery::mock(ConnectionResolverInterface::class);
    $blockedResolver->shouldNotReceive('connection');
    Model::setConnectionResolver($blockedResolver);
    $this->withoutMiddleware();
});

afterEach(function () {
    Model::setConnectionResolver($this->originalConnectionResolver);
});

test('settings redirect preserves its previous methods and destination without database access', function (string $method) {
    $this->call($method, '/settings')
        ->assertStatus(302)
        ->assertRedirect('/settings/profile');
})->with(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);
