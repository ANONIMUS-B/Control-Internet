<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\EducationalInstitution;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    // app/Http/Controllers/UserController.php

public function index(Request $request)
{
    // ✅ PROTECCIÓN - Solo admin, specialist, super_admin
    $authUser = $request->user();
    if (!in_array($authUser->role, ['admin', 'specialist', 'super_admin'])) {
        return redirect()   ->route('dashboard')->with('error', 'No tienes permiso para acceder a esta sección.');
    }

    $query = User::with('institutions');

    // ✅ EXCLUIR SOLO SUPER_ADMIN (permitir admin, specialist, director, executive, etc)
    $query->where('role', '!=', 'super_admin');

    // ✅ Buscar por nombre o email
    if ($request->filled('search')) {
        $search = $request->search;
        $query->where(function ($q) use ($search) {
            $q->where('name', 'LIKE', "%{$search}%")
              ->orWhere('email', 'LIKE', "%{$search}%")
              ->orWhere('dni', 'LIKE', "%{$search}%");
        });
    }

    // ✅ Filtrar por rol
    if ($request->filled('role')) {
        $query->where('role', $request->role);
    }

    // ✅ Filtrar por institución asignada
    if ($request->filled('institution_id')) {
        $query->whereHas('institutions', function ($q) use ($request) {
            $q->where('educational_institution_id', (int) $request->institution_id);
        });
    }

    // ✅ Filtrar usuarios con/sin firma digital
    if ($request->filled('has_signature')) {
        if ($request->has_signature === 'true') {
            $query->where('signature_active', true)
                  ->whereNotNull('signature_path');
        } else {
            $query->where(function ($q) {
                $q->where('signature_active', false)
                  ->orWhereNull('signature_path');
            });
        }
    }

    // ✅ Ordenar
    $sortField = $request->input('sort', 'name');
    $sortDirection = $request->input('direction', 'asc');
    $query->orderBy($sortField, $sortDirection);

    // ✅ PAGINACIÓN (10 por defecto)
    $perPage = (int) $request->input('per_page', 10);
    $users = $query->paginate($perPage)->withQueryString();

    // ✅ Datos para filtros
    $institutions = EducationalInstitution::orderBy('name')->get(['id', 'name', 'modular_code']);
    
    // ✅ Roles disponibles (EXCLUYENDO super_admin)
    $roles = [
        'admin' => 'Administrador',
        'specialist' => 'Especialista UPDI',
        'supervisor' => 'Supervisor',
        'director' => 'Director',
        'executive' => 'Ejecutivo',
    ];

    return inertia('Admin/Users/Assign', [
        'users' => $users,
        'institutions' => $institutions,
        'filters' => [
            'search' => $request->input('search'),
            'role' => $request->input('role'),
            'institution_id' => $request->input('institution_id'),
            'has_signature' => $request->input('has_signature'),
            'sort' => $sortField,
            'direction' => $sortDirection,
            'per_page' => $perPage,
        ],
        'roles' => $roles,
    ]);
}

    /**
     * Asignar instituciones a un usuario.
     * ✅ SOLO ADMIN, SPECIALIST, SUPER_ADMIN
     */
    public function assign(Request $request, User $user)
    {
        // ✅ PROTECCIÓN - Solo admin, specialist, super_admin
        $authUser = $request->user();
        if (!in_array($authUser->role, ['admin', 'specialist', 'super_admin'])) {
            return back()->with('error', 'No tienes permiso para asignar instituciones.');
        }

        // ✅ Validar que las instituciones existan
        $institutionIds = $request->input('institution_ids', []);
        
        if (!empty($institutionIds)) {
            $validIds = EducationalInstitution::whereIn('id', $institutionIds)->pluck('id')->toArray();
            $user->institutions()->sync($validIds);
        } else {
            $user->institutions()->detach();
        }
        
        return back()->with('success', 'Asignación actualizada correctamente.');
    }

    /**
     * Cambiar el rol de un usuario.
     * ✅ SOLO ADMIN, SUPER_ADMIN (specialist no puede cambiar roles)
     */
    public function changeRole(Request $request, User $user)
    {
        // ✅ PROTECCIÓN - Solo admin y super_admin (specialist no puede cambiar roles)
        $authUser = $request->user();
        if (!$authUser || !in_array($authUser->role, ['admin', 'super_admin'])) {
            return back()->with('error', 'No tienes permiso para cambiar roles. Solo los administradores pueden hacerlo.');
        }

        $request->validate([
            'role' => 'required|in:admin,specialist,supervisor,director,executive',
        ]);

        $user->update(['role' => $request->role]);

        return back()->with('success', 'Rol actualizado correctamente.');
    }

    /**
     * Resetear firma digital de un usuario.
     * ✅ SOLO ADMIN, SUPER_ADMIN
     */
    public function resetSignature(Request $request, User $user)
    {
        // ✅ PROTECCIÓN - Solo admin y super_admin
        $authUser = $request->user();
        if (!$authUser || !in_array($authUser->role, ['admin', 'super_admin'])) {
            return back()->with('error', 'No tienes permiso para realizar esta acción.');
        }

        $user->deleteSignature();

        return back()->with('success', 'Firma digital del usuario eliminada correctamente.');
    }

    /**
     * Obtener usuarios para selects (API).
     * ✅ Cualquier usuario autenticado puede consultar (para selects)
     */
    public function list(Request $request)
    {
        $query = User::where('role', 'director');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'LIKE', "%{$search}%");
        }

        return response()->json($query->orderBy('name')->get(['id', 'name', 'email']));
    }

    /**
     * Obtener instituciones asignadas a un usuario (API).
     * ✅ SOLO ADMIN, SPECIALIST, SUPER_ADMIN
     */
    public function getUserInstitutions(Request $request, User $user)
    {
        // ✅ PROTECCIÓN - Solo admin, specialist, super_admin
        $authUser = $request->user();
        if (!in_array($authUser->role, ['admin', 'specialist', 'super_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para ver esta información.'
            ], 403);
        }

        return response()->json($user->institutions);
    }

    /**
     * Obtener estadísticas de usuarios.
     * ✅ SOLO ADMIN, SUPER_ADMIN (specialist no puede ver estadísticas completas)
     */
    public function stats(Request $request)
    {
        // ✅ PROTECCIÓN - Solo admin y super_admin
        $authUser = $request->user();
        if (!$authUser || !in_array($authUser->role, ['admin', 'super_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para ver esta información.'
            ], 403);
        }

        $total = User::count();
        $byRole = User::select('role', DB::raw('count(*) as total'))
            ->groupBy('role')
            ->pluck('total', 'role');

        $withSignature = User::where('signature_active', true)
            ->whereNotNull('signature_path')
            ->count();

        $withoutSignature = User::where(function ($q) {
            $q->where('signature_active', false)
              ->orWhereNull('signature_path');
        })->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'by_role' => $byRole,
                'with_signature' => $withSignature,
                'without_signature' => $withoutSignature,
            ]
        ]);
    }
}