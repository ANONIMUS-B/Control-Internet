<?php

namespace App\Http\Controllers;

use App\Models\MonthlyReport;
use App\Models\EducationalInstitution;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use App\Models\ReportEvidence;
use Illuminate\Database\QueryException;
use App\Helpers\ReportHelper;
use App\Models\ReportPeriod;

class ReportController extends Controller
{
    protected ReportService $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Listado de reportes para directores y admins
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = MonthlyReport::with(['institution', 'user'])->latest();

        if ($user->role === 'director') {
            $institutionIds = $user->institutions()->pluck('educational_institutions.id');
            $query->whereIn('institution_id', $institutionIds);
        }

        if ($request->filled('month')) {
            $query->where('month', (int) $request->month);
        }

        if ($request->filled('year')) {
            $query->where('year', (int) $request->year);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('institution_id') && in_array($user->role, ['admin', 'specialist'])) {
            $query->where('institution_id', (int) $request->institution_id);
        }

        $perPage = (int) $request->input('per_page', 10);
        $reports = $query->paginate($perPage)->withQueryString();

        $institutions = EducationalInstitution::orderBy('name')->get(['id', 'name', 'modular_code']);
        
        $months = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
        ];

        $statuses = [
            'pending' => 'Pendiente',
            'observed' => 'Observado',
            'approved' => 'Aprobado',
            'rejected' => 'Rechazado'
        ];

        return Inertia::render('Reports/Index', [
            'reports' => $reports,
            'filters' => [
                'month' => $request->input('month'),
                'year' => $request->input('year'),
                'status' => $request->input('status'),
                'institution_id' => $request->input('institution_id'),
                'per_page' => $perPage,
            ],
            'institutions' => $institutions,
            'months' => $months,
            'statuses' => $statuses,
            'currentYear' => date('Y'),
        ]);
    }

 public function create(Request $request)
{
    $user = $request->user();
    
    $institutions = $user->institutions;
    
    $reportedMonths = [];
    foreach ($institutions as $institution) {
        $reported = MonthlyReport::where('institution_id', $institution->id)
            ->where('year', date('Y'))
            ->pluck('month')
            ->toArray();
        $reportedMonths[$institution->id] = $reported;
    }

    $currentMonth = date('n');
    $currentYear = date('Y');
    $today = date('Y-m-d');
    
    // ✅ Obtener TODOS los períodos activos que estén vigentes
    $availablePeriods = ReportPeriod::where('is_active', true)
        ->where('year', $currentYear)
        ->where('start_date', '<=', $today)
        ->where('end_date', '>=', $today)
        ->orderBy('month', 'asc')
        ->get();

    // ✅ Si no hay períodos vigentes, obtener los activos
    if ($availablePeriods->isEmpty()) {
        $availablePeriods = ReportPeriod::where('is_active', true)
            ->where('year', $currentYear)
            ->orderBy('month', 'asc')
            ->get();
    }

    // ✅ Agregar el nombre del mes a cada período
    $months = [
        1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
        5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
        9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
    ];
    
    foreach ($availablePeriods as $period) {
        $period->month_name = $months[$period->month] ?? $period->month;
    }

    // ✅ Obtener el primer período para compatibilidad
    $reportPeriod = $availablePeriods->first();

    return Inertia::render('Reports/Create', [
        'month' => $currentMonth,
        'year' => $currentYear,
        'myInstitutions' => $institutions,
        'reportedMonths' => $reportedMonths,
        'months' => $months,
        'currentYear' => $currentYear,
        'reportPeriod' => $reportPeriod,
        'availablePeriods' => $availablePeriods, // ✅ Pasar la lista completa
    ]);
}

    /**
     * Guardar un nuevo reporte
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $allowedIds = $user->institutions()->pluck('educational_institutions.id')->toArray();

        $validatedData = $request->validate([
            'educational_institution_id' => 'required|in:' . implode(',', $allowedIds),
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000|max:' . (date('Y') + 1),
            'service_state' => 'required|in:operative,intermittent,no_service',
            'office_number' => 'nullable|string|max:50',
            'evidences' => 'nullable|array',
            'evidences.*' => 'image|mimes:jpeg,png,jpg',
        ]);

        try {
            $report = $user->reports()->create([
                'institution_id' => $validatedData['educational_institution_id'],
                'month' => $validatedData['month'],
                'year' => $validatedData['year'],
                'service_state' => $validatedData['service_state'],
                'office_number' => $validatedData['office_number'],
                'notes' => null,
                'status' => 'pending',
                'submitted_at' => now(),
            ]);

            // ✅ Registrar historial de creación
            ReportHelper::logHistory($report, 'created', [
                'service_state' => $validatedData['service_state'],
                'office_number' => $validatedData['office_number'],
                'month' => $validatedData['month'],
                'year' => $validatedData['year'],
            ]);

            // ✅ Notificar a admins
            $institution = EducationalInstitution::find($validatedData['educational_institution_id']);
            ReportHelper::notifyAdmins(
                'info',
                '📄 Nuevo reporte creado',
                "El director {$user->name} ha creado un nuevo reporte para {$institution->name}",
                $report->id,
                "/updi/dashboard"
            );

            // Subir evidencias
            if ($request->hasFile('evidences')) {
                foreach ($request->file('evidences') as $file) {
                    $path = $file->store('evidences', 'public');
                    $report->evidences()->create(['file_path' => $path]);
                }
            }

            return redirect()->route('reports.index')->with('success', 'Reporte generado con éxito.');

        } catch (QueryException $e) {
            if ($e->getCode() == 23000 || str_contains($e->getMessage(), 'Duplicate entry')) {
                return back()->withErrors([
                    'educational_institution_id' => 'Ya existe un reporte para esta institución en el mes ' . 
                        date('F', mktime(0, 0, 0, $validatedData['month'], 1)) . 
                        ' de ' . $validatedData['year'] . '.'
                ])->withInput();
            }
            throw $e;
        }
    }

    /**
     * Descargar PDF del reporte
     */
    public function downloadPdf(MonthlyReport $report)
    {
        $report->load(['institution', 'user', 'evidences']);
        
        $months = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
        ];
        $report->month_name = $months[$report->month] ?? $report->month;

        // ✅ Cargar imagen de cabecera como Base64
        $headerLogoPath = public_path('images/logos_header.png');
        $headerLogoBase64 = null;
        if (file_exists($headerLogoPath)) {
            $type = pathinfo($headerLogoPath, PATHINFO_EXTENSION);
            $data = file_get_contents($headerLogoPath);
            $headerLogoBase64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
        }

        $evidenciasBase64 = [];
        if ($report->evidences && $report->evidences->count() > 0) {
            foreach ($report->evidences as $evidence) {
                $path = storage_path('app/public/' . $evidence->file_path);
                if (file_exists($path)) {
                    $type = pathinfo($path, PATHINFO_EXTENSION);
                    $data = file_get_contents($path);
                    $evidenciasBase64[] = 'data:image/' . $type . ';base64,' . base64_encode($data);
                }
            }
        }

        $signatureBase64 = null;
        if ($report->user && $report->user->hasSignature()) {
            $path = storage_path('app/public/' . $report->user->signature_path);
            if (file_exists($path)) {
                $type = pathinfo($path, PATHINFO_EXTENSION);
                $data = file_get_contents($path);
                $signatureBase64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
            }
        }

        $stateLabels = [
            'operative' => 'OPERATIVO',
            'intermittent' => 'INTERMITENTE',
            'no_service' => 'SIN SERVICIO'
        ];

        $pdf = Pdf::loadView('pdf.reporte_conformidad', [
            'report' => $report,
            'headerLogoBase64' => $headerLogoBase64, // ✅ Enviar base64 a la vista
            'evidenciasBase64' => $evidenciasBase64,
            'signatureBase64' => $signatureBase64,
            'stateLabels' => $stateLabels,
        ]);
        
        $pdf->setPaper('A4', 'portrait');
        
        $pdf->setOptions([
            'defaultFont' => 'Times New Roman',
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
            'chroot' => [
                public_path(),
                storage_path('app/public'),
            ],
        ]);

        return $pdf->stream('OFICIO_CONFORMIDAD_' . $report->institution->modular_code . '_' . $report->month . '_' . $report->year . '.pdf');
    }

    /**
     * Formulario para editar un reporte
     */
    public function edit($id)
    {
        $report = MonthlyReport::with(['evidences', 'user', 'institution'])
            ->with(['history' => function ($query) {
                $query->with('user')->orderBy('created_at', 'desc');
            }])
            ->findOrFail($id);
        
        return inertia('Reports/Edit', [
            'report' => $report,
            'history' => $report->history,
        ]);
    }

    /**
     * Actualizar un reporte
     */
    public function update(Request $request, $id)
    {
        $report = MonthlyReport::findOrFail($id);
        $oldData = $report->getAttributes();
        
        $request->validate([
            'service_state' => 'required',
            'office_number' => 'required',
            'evidences.*' => 'image|mimes:jpeg,jpg,png',
        ]);

        $report->update([
            'service_state' => $request->service_state,
            'office_number' => $request->office_number,
            'notes' => $request->notes,
            'status' => 'pending',
            'admin_comments' => null,
            'submitted_at' => now(),
        ]);

        // ✅ Registrar historial de actualización
        $changes = [];
        foreach (['service_state', 'office_number', 'notes'] as $field) {
            if (($oldData[$field] ?? '') != ($request->$field ?? '')) {
                $changes[$field] = [
                    'old' => $oldData[$field] ?? 'N/A',
                    'new' => $request->$field ?? 'N/A',
                ];
            }
        }

        if (!empty($changes)) {
            ReportHelper::logHistory($report, 'updated', $changes);
        }

        // ✅ Notificar a admins
        ReportHelper::notifyAdmins(
            'warning',
            '🔄 Reporte actualizado',
            "El director ha actualizado el reporte después de una observación",
            $report->id,
            "/updi/dashboard"
        );

        // Subir nuevas evidencias si existen
        if ($request->hasFile('evidences')) {
            foreach ($request->file('evidences') as $file) {
                $path = $file->store('evidences/' . $report->id, 'public');
                $report->evidences()->create(['file_path' => $path]);
            }
        }

        return redirect()->route('reports.index')->with('success', 'Correcciones enviadas exitosamente.');
    }

    /**
     * Eliminar una evidencia
     */
    public function destroyEvidence(ReportEvidence $evidence)
    {
        $user = request()->user();
        
        if (!$user) {
            return back()->with('error', 'Debes iniciar sesión para realizar esta acción.');
        }

        $report = $evidence->report;

        if ($report->user_id !== $user->id) {
            if (!in_array($user->role, ['admin', 'specialist'])) {
                return back()->with('error', 'No tienes permiso para eliminar esta evidencia.');
            }
        }

        if (!in_array($report->status, ['pending', 'observed'])) {
            return back()->with('error', 'No se puede eliminar evidencias de un reporte aprobado o rechazado.');
        }

        if (Storage::disk('public')->exists($evidence->file_path)) {
            Storage::disk('public')->delete($evidence->file_path);
        }

        $evidence->delete();

        return back()->with('success', 'Evidencia eliminada correctamente.');
    }

    /**
     * Panel de administración UPDI con paginación
     */
    public function adminIndex(Request $request)
    {
        $query = MonthlyReport::with(['user', 'institution'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('month')) {
            $query->where('month', (int) $request->month);
        }

        if ($request->filled('year')) {
            $query->where('year', (int) $request->year);
        }

        if ($request->filled('institution_id')) {
            $query->where('institution_id', (int) $request->institution_id);
        }

        $perPage = (int) $request->input('per_page', 10);
        $reports = $query->paginate($perPage)->withQueryString();

        $institutions = EducationalInstitution::orderBy('name')->get(['id', 'name', 'modular_code']);
        
        $months = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
        ];

        $statuses = [
            'pending' => 'Pendiente',
            'observed' => 'Observado',
            'approved' => 'Aprobado',
            'rejected' => 'Rechazado'
        ];

        return inertia('Admin/Dashboard', [
            'reports' => $reports,
            'filters' => [
                'status' => $request->input('status'),
                'month' => $request->input('month'),
                'year' => $request->input('year'),
                'institution_id' => $request->input('institution_id'),
                'per_page' => $perPage,
            ],
            'institutions' => $institutions,
            'months' => $months,
            'statuses' => $statuses,
            'currentYear' => date('Y'),
        ]);
    }

    /**
     * Aprobar un reporte
     */
    public function approve($id)
    {
        $report = MonthlyReport::findOrFail($id);
        $oldStatus = $report->status;
        
        $report->update([
            'status' => 'approved',
            'admin_comments' => null
        ]);

        // ✅ Registrar historial de aprobación
        ReportHelper::logHistory($report, 'approved', [
            'old_status' => $oldStatus,
            'new_status' => 'approved',
        ]);

        // ✅ Notificar al director
        $director = $report->user;
        $institution = $report->institution;
        
        if ($director) {
            ReportHelper::notify(
                $director->id,
                'success',
                '✅ Reporte aprobado',
                "Tu reporte para {$institution->name} ha sido aprobado por UPDI",
                $report->id,
                "/reportes"
            );
        }

        return back()->with('success', 'Reporte aprobado correctamente.');
    }

    /**
     * Observar un reporte
     */
    public function observe(Request $request, $id)
    {
        $request->validate(['admin_comments' => 'required|string|min:5']);
        
        $report = MonthlyReport::findOrFail($id);
        $oldStatus = $report->status;
        
        $report->update([
            'status' => 'observed',
            'admin_comments' => $request->admin_comments,
        ]);

        // ✅ Registrar historial de observación
        ReportHelper::logHistory(
            $report,
            'observed',
            [
                'old_status' => $oldStatus,
                'new_status' => 'observed',
                'comments' => $request->admin_comments,
            ],
            $request->admin_comments
        );

        // ✅ Notificar al director con link a edición
        $director = $report->user;
        $institution = $report->institution;
        
        if ($director) {
            ReportHelper::notify(
                $director->id,
                'warning',
                '⚠️ Reporte observado',
                "Tu reporte para {$institution->name} ha sido observado. Por favor, realiza las correcciones necesarias.",
                $report->id,
                "/reportes/{$report->id}/editar",
                ['comments' => $request->admin_comments]
            );
        }

        return back()->with('success', 'Observación enviada al director.');
    }
}