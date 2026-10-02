<?php

use App\Models\User;

test('user formatFullName preserves paternal maternal and first names', function () {
    $formatted = User::formatFullName('Pérez', 'García', 'Juan Carlos');
    $user = new User(['name' => $formatted]);

    expect($user->name)->toBe('Pérez García Juan Carlos')
        ->and($user->last_name)->toBe('Pérez')
        ->and($user->second_last_name)->toBe('García')
        ->and($user->first_name)->toBe('Juan Carlos');
});

test('user formatFullName without maternal surname keeps it empty without shifting to first name', function () {
    $formatted = User::formatFullName('Pérez', '', 'Juan Carlos');
    $user = new User(['name' => $formatted]);

    expect($user->name)->toBe('Pérez Juan Carlos')
        ->and($user->last_name)->toBe('Pérez')
        ->and($user->second_last_name)->toBe('')
        ->and($user->first_name)->toBe('Juan Carlos');
});

test('user formatFullName handles compound surnames correctly', function () {
    $formatted = User::formatFullName('De La Cruz', 'Cueva De Casio', 'María José');
    $user = new User(['name' => $formatted]);

    expect($user->name)->toBe('De La Cruz Cueva De Casio María José')
        ->and($user->last_name)->toBe('De La Cruz')
        ->and($user->second_last_name)->toBe('Cueva De Casio')
        ->and($user->first_name)->toBe('María José');
});

test('user array serialization appends name parts', function () {
    $formatted = User::formatFullName('Sánchez', 'Torres', 'Ana Lucía');
    $user = new User(['name' => $formatted]);

    $data = $user->toArray();

    expect($data)->toHaveKeys(['name', 'last_name', 'second_last_name', 'first_name'])
        ->and($data['last_name'])->toBe('Sánchez')
        ->and($data['second_last_name'])->toBe('Torres')
        ->and($data['first_name'])->toBe('Ana Lucía')
        ->and($data['name'])->toBe('Sánchez Torres Ana Lucía');
});

test('user handles legacy names fallback gracefully', function () {
    $user = new User(['name' => 'QUISPE MAMANI PEDRO']);

    expect($user->name)->toBe('QUISPE MAMANI PEDRO')
        ->and($user->last_name)->toBe('QUISPE')
        ->and($user->second_last_name)->toBe('MAMANI')
        ->and($user->first_name)->toBe('PEDRO');
});
