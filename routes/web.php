<?php

use App\Http\Controllers\AdminStatisticsController;
use App\Http\Controllers\BulkExportController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\InternetTestController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\ReportPeriodConfigController;
use App\Http\Controllers\ReportPeriodController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SignatureController;
use App\Http\Controllers\SimpleSpeedtestController;
use App\Http\Controllers\SpeedtestCaptureController;
use App\Http\Controllers\SpeedtestCliController;
use App\Http\Controllers\SpeedtestController;
use App\Http\Controllers\SpeedtestOoklaController;
use App\Http\Controllers\SpeedtestRealController;
use App\Http\Controllers\UserManagementController;

Route::inertia('/', 'welcome')->name('home');

// ==========================================
// 🆕 RUTAS DE MANTENIMIENTO (FUERA DEL MIDDLEWARE)
// ==========================================
Route::get('/mantenimiento', [MaintenanceController::class, 'index'])->name('maintenance');
Route::post('/maintenance/enable', [MaintenanceController::class, 'enable'])->name('maintenance.enable');
Route::post('/maintenance/disable', [MaintenanceController::class, 'disable'])->name('maintenance.disable');
Route::get('/maintenance/status', [MaintenanceController::class, 'status'])->name('maintenance.status');

// ==========================================
// ✅ TODAS LAS RUTAS PROTEGIDAS CON MIDDLEWARE DE MANTENIMIENTO
// ==========================================
Route::middleware(['auth', 'verified', 'maintenance'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    
    // ==========================================
    // RUTAS PARA LA GESTIÓN DE REPORTES MENSUALES
    // ==========================================
    Route::get('/reportes', [ReportController::class, 'index'])->name('reports.index');
    
    // ✅ RUTAS DE CREACIÓN/EDICIÓN CON RESTRICCIÓN DE FECHAS
    Route::middleware(['report.period'])->group(function () {
        Route::get('/reportes/nuevo', [ReportController::class, 'create'])->name('reports.create');
        Route::post('/reportes', [ReportController::class, 'store'])->name('reports.store');
        Route::get('/reportes/{report}/editar', [ReportController::class, 'edit'])->name('reports.edit');
        Route::put('/reportes/{report}', [ReportController::class, 'update'])->name('reports.update');
    });
    
    // ✅ RUTAS DE SOLO LECTURA (SIN RESTRICCIÓN)
    Route::get('/reportes/{report}/pdf', [ReportController::class, 'downloadPdf'])->name('reports.pdf');
    Route::delete('/evidencias/{evidence}', [ReportController::class, 'destroyEvidence'])->name('evidences.destroy');

    // ==========================================
    // EXPORTAR PDFs EN LOTE
    // ==========================================
    Route::get('/reportes/exportar-lote', [BulkExportController::class, 'index'])->name('reports.bulk-export');
    Route::post('/reportes/exportar-lote', [BulkExportController::class, 'export'])->name('reports.bulk-export.download');

    // ==========================================
    // PANEL DE LA UPDI (ADMINISTRACIÓN)
    // ==========================================
    Route::get('/updi/dashboard', [ReportController::class, 'adminIndex'])->name('admin.index');
    Route::post('/reportes/{report}/aprobar', [ReportController::class, 'approve'])->name('reports.approve');
    Route::post('/reportes/{report}/observar', [ReportController::class, 'observe'])->name('reports.observe');

    // ==========================================
    // GESTIÓN DE INSTITUCIONES EDUCATIVAS
    // ==========================================
    Route::get('/institutions', [InstitutionController::class, 'index'])->name('institutions.index');
    Route::post('/institutions', [InstitutionController::class, 'store'])->name('institutions.store');
    Route::put('/institutions/{institution}', [InstitutionController::class, 'update'])->name('institutions.update');
    Route::delete('/institutions/{institution}', [InstitutionController::class, 'destroy'])->name('institutions.destroy');
    Route::patch('/institutions/{institution}/toggle', [InstitutionController::class, 'toggle'])->name('institutions.toggle');

    // ==========================================
    // GESTIÓN DE USUARIOS Y ASIGNACIÓN DE DIRECTORES
    // ==========================================
    Route::get('/usuarios/asignar', [UserController::class, 'index'])->name('users.assign');
    Route::post('/usuarios/{user}/asignar', [UserController::class, 'assign'])->name('users.assign.save');

    // ==========================================
    // RUTAS DE FIRMA DIGITAL
    // ==========================================
    Route::get('/firma', [SignatureController::class, 'index'])->name('signature.index');
    Route::post('/firma/upload', [SignatureController::class, 'upload'])->name('signature.upload');
    Route::delete('/firma/eliminar', [SignatureController::class, 'destroy'])->name('signature.destroy');
    Route::get('/firma/preview', [SignatureController::class, 'preview'])->name('signature.preview');
    Route::get('/firma/status', [SignatureController::class, 'status'])->name('signature.status');

    // ==========================================
    // ESTADÍSTICAS GENERALES (SOLO ADMIN)
    // ==========================================
    Route::get('/admin/estadisticas', [AdminStatisticsController::class, 'index'])->name('admin.statistics');
    Route::get('/admin/estadisticas/exportar', [AdminStatisticsController::class, 'export'])->name('admin.statistics.export');

    // ==========================================
    // GESTIÓN DE USUARIOS Y PERÍODOS (ADMIN)
    // ==========================================
    Route::prefix('admin')->group(function () {
        // ==========================================
        // GESTIÓN DE USUARIOS
        // ==========================================
        Route::get('/usuarios', [UserManagementController::class, 'index'])->name('admin.users.index');
        Route::post('/usuarios', [UserManagementController::class, 'store'])->name('admin.users.store');
        Route::put('/usuarios/{user}', [UserManagementController::class, 'update'])->name('admin.users.update');
        Route::delete('/usuarios/{user}', [UserManagementController::class, 'destroy'])->name('admin.users.destroy');
        Route::post('/usuarios/{user}/rol', [UserManagementController::class, 'changeRole'])->name('admin.users.change-role');
        Route::post('/usuarios/{user}/toggle', [UserManagementController::class, 'toggleActive'])->name('admin.users.toggle');
        Route::post('/usuarios/{user}/assign', [UserManagementController::class, 'assignInstitutions'])->name('admin.users.assign');
        Route::post('/usuarios/{user}/reset-signature', [UserManagementController::class, 'resetSignature'])->name('admin.users.reset-signature');
        
        // IMPORTAR USUARIOS MASIVO (SUPER ADMIN)
        Route::get('/usuarios/importar', [UserManagementController::class, 'importIndex'])->name('admin.users.import');
        Route::post('/usuarios/importar', [UserManagementController::class, 'import'])->name('admin.users.import.store');
        Route::get('/usuarios/plantilla', [UserManagementController::class, 'downloadTemplate'])->name('admin.users.import.template');
        
        // ==========================================
        // ✅ CONFIGURACIÓN DE PERÍODOS POR MES (NUEVO SISTEMA)
        // ==========================================
        Route::get('/report-periods', [ReportPeriodController::class, 'index'])
            ->name('admin.report-periods.index')
            ->middleware(['user.active']);
        
        Route::get('/report-periods/create', [ReportPeriodController::class, 'create'])
            ->name('admin.report-periods.create')
            ->middleware(['user.active']);
        
        Route::post('/report-periods', [ReportPeriodController::class, 'store'])
            ->name('admin.report-periods.store')
            ->middleware(['user.active']);
        
        Route::get('/report-periods/{period}/edit', [ReportPeriodController::class, 'edit'])
            ->name('admin.report-periods.edit')
            ->middleware(['user.active']);
        
        Route::put('/report-periods/{period}', [ReportPeriodController::class, 'update'])
            ->name('admin.report-periods.update')
            ->middleware(['user.active']);
        
        Route::delete('/report-periods/{period}', [ReportPeriodController::class, 'destroy'])
            ->name('admin.report-periods.destroy')
            ->middleware(['user.active']);
    });

    // ==========================================
    // NOTIFICACIONES
    // ==========================================
    Route::get('/notificaciones', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notificaciones/{id}/leer', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notificaciones/leer-todas', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::delete('/notificaciones/{id}', [NotificationController::class, 'delete'])->name('notifications.delete');
    Route::delete('/notificaciones/eliminar-todas', [NotificationController::class, 'deleteAll'])->name('notifications.delete-all');

    // ==========================================
    // EXPORTAR REPORTES EN EXCEL
    // ==========================================
    Route::get('/reportes/exportar-excel', [ExportController::class, 'index'])->name('reports.export-excel');
    Route::post('/reportes/exportar-excel', [ExportController::class, 'export'])->name('reports.export-excel.download');
    Route::get('/reportes/exportar-todos', [ExportController::class, 'exportAll'])->name('reports.export-all');

    // ==========================================
    // IMPORTAR INSTITUCIONES MASIVO
    // ==========================================
    Route::get('/institutions/importar', [InstitutionController::class, 'importIndex'])->name('institutions.import');
    Route::post('/institutions/importar', [InstitutionController::class, 'import'])->name('institutions.import.store');
    Route::get('/institutions/plantilla', [InstitutionController::class, 'downloadTemplate'])->name('institutions.import.template');
});

require __DIR__.'/settings.php';