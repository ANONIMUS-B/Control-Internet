<?php

use App\Http\Middleware\CheckReportSubmissionPeriod;
use App\Http\Middleware\CheckUserActive;
use App\Http\Middleware\ForceSessionRefresh;
use App\Http\Middleware\CheckAuthSession; // ✅ AGREGAR ESTA LÍNEA
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\MaintenanceMode;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // ✅ AGREGAR LOS ALIAS DE LOS MIDDLEWARES
        $middleware->alias([
            'maintenance' => MaintenanceMode::class,
            'user.active' => CheckUserActive::class,
            'report.period' => CheckReportSubmissionPeriod::class,
            'check.auth' => CheckAuthSession::class, // ✅ AGREGAR ESTA LÍNEA
        ]);

        // ✅ AGREGAR LOS MIDDLEWARES AL GRUPO WEB
        $middleware->web(append: [
            CheckUserActive::class,
            ForceSessionRefresh::class,      // ✅ Ya estaba
            CheckAuthSession::class,          // ✅ AGREGAR ESTA LÍNEA
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();