<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\EducationalInstitution;
use App\Imports\UsersImport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class UserManagementController extends Controller
{
    /**
     * Listado de usuarios con paginación y filtros.
     * ✅ SOLO ADMIN, SUPER_ADMIN
     */
    public function index(Request $request)
    {
        // ✅ PROTECCIÓN - Solo admin y super_admin
        $authUser = $request->user();
        if (!in_array($authUser->role, ['admin', 'super_admin'])) {
            return redirect()->route('dashboard')->with('error', 'No tienes permiso para acceder a esta sección.');
        }

        $query = User::with('institutions');

        // ✅ ADMIN no ve a SUPER_ADMIN
        if ($authUser->role === 'admin') {
            $query->where('role', '!=', 'super_admin');
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhere('dni', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            if ($authUser->role === 'admin' && $request->role === 'super_admin') {
                // Ignorar
            } else {
                $query->where('role', $request->role);
            }
        }

        if ($request->filled('institution_id')) {
            $query->whereHas('institutions', function ($q) use ($request) {
                $q->where('educational_institution_id', (int) $request->institution_id);
            });
        }

        if ($request->filled('has_signature')) {
            if ($request->has_signature === 'true') {
                $query->where('signature_active', true)->whereNotNull('signature_path');
            } else {
                $query->where(function ($q) {
                    $q->where('signature_active', false)->orWhereNull('signature_path');
                });
            }
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->is_active === 'true' ? 1 : 0);
        }

        $sortField = $request->input('sort', 'name');
        $sortDirection = $request->input('direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        $perPage = (int) $request->input('per_page', 10);
        $users = $query->paginate($perPage)->withQueryString();

        $institutions = EducationalInstitution::orderBy('name')->get(['id', 'name', 'modular_code']);
        
        // ✅ Roles disponibles (sin executive)
        $roles = [
            'super_admin' => 'Super Administrador',
            'admin' => 'Administrador',
            'specialist' => 'Especialista UPDI',
            'supervisor' => 'Supervisor',
            'director' => 'Director',
        ];

        if ($authUser->role === 'admin') {
            unset($roles['super_admin']);
        }

        return inertia('Admin/Users/Index', [
            'users' => $users,
            'institutions' => $institutions,
            'filters' => [
                'search' => $request->input('search'),
                'role' => $request->input('role'),
                'institution_id' => $request->input('institution_id'),
                'has_signature' => $request->input('has_signature'),
                'is_active' => $request->input('is_active'),
                'sort' => $sortField,
                'direction' => $sortDirection,
                'per_page' => $perPage,
            ],
            'roles' => $roles,
            'authUserRole' => $authUser->role,
        ]);
    }

    /**
     * Crear un nuevo usuario.
     * ✅ SOLO ADMIN, SUPER_ADMIN
     */
    public function store(Request $request)
    {
        // ✅ PROTECCIÓN - Solo admin y super_admin
        $authUser = $request->user();
        if (!in_array($authUser->role, ['admin', 'super_admin'])) {
            return redirect()->route('dashboard')->with('error', 'No tienes permiso para crear usuarios.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'dni' => 'nullable|string|max:8|unique:users,dni',
            'role' => 'required|in:admin,specialist,supervisor,director',
            'password' => 'required|string|min:8',
        ]);

        if ($authUser->role === 'admin' && $request->role === 'super_admin') {
            return back()->with('error', 'No tienes permiso para crear un Super Administrador.');
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'dni' => $request->dni,
            'role' => $request->role,
            'password' => Hash::make($request->password),
            'is_active' => true,
        ]);

        if ($request->filled('institution_ids')) {
            $user->institutions()->sync($request->institution_ids);
        }

        return back()->with('success', 'Usuario creado correctamente.');
    }

    /**
     * Actualizar un usuario.
     * ✅ SOLO ADMIN, SUPER_ADMIN
     */
    public function update(Request $request, User $user)
    {
        // ✅ PROTECCIÓN - Solo admin y super_admin
        $authUser = $request->user();
        if (!in_array($authUser->role, ['admin', 'super_admin'])) {
            return redirect()->route('dashboard')->with('error', 'No tienes permiso para actualizar usuarios.');
        }

        if ($authUser->role === 'admin' && $user->role === 'super_admin') {
            return back()->with('error', 'No tienes permiso para modificar un Super Administrador.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'dni' => 'nullable|string|max:8|unique:users,dni,' . $user->id,
            'role' => 'required|in:admin,specialist,supervisor,director',
        ]);

        if ($authUser->role === 'admin' && $request->role === 'super_admin') {
            return back()->with('error', 'No tienes permiso para asignar el rol Super Administrador.');
        }

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'dni' => $request->dni,
            'role' => $request->role,
        ]);

        if ($request->filled('password')) {
            $request->validate(['password' => 'min:8']);
            $user->update(['password' => Hash::make($request->password)]);
        }

        if ($request->has('institution_ids')) {
            $user->institutions()->sync($request->institution_ids ?? []);
        }

        return back()->with('success', 'Usuario actualizado correctamente.');
    }

    /**
     * Cambiar el rol de un usuario.
     * ✅ SOLO ADMIN, SUPER_ADMIN
     */
    public function changeRole(Request $request, User $user)
    {
        // ✅ PROTECCIÓN - Solo admin y super_admin
        $authUser = $request->user();
        if (!in_array($authUser->role, ['admin', 'super_admin'])) {
            return redirect()->route('dashboard')->with('error', 'No tienes permiso para cambiar roles.');
        }

        if ($authUser->role === 'admin') {
            if ($user->role === 'super_admin') {
                return back()->with('error', 'No tienes permiso para modificar un Super Administrador.');
            }
            if ($request->role === 'super_admin') {
                return back()->with('error', 'No tienes permiso para asignar el rol Super Administrador.');
            }
        }

        $request->validate([
            'role' => 'required|in:admin,specialist,supervisor,director',
        ]);

        $user->update(['role' => $request->role]);

        return back()->with('success', 'Rol actualizado correctamente.');
    }

    /**
     * Activar/Desactivar un usuario.
     * ✅ SOLO ADMIN, SUPER_ADMIN
     */
    public function toggleActive(Request $request, User $user)
    {
        // ✅ PROTECCIÓN - Solo admin y super_admin
        $authUser = $request->user();
        if (!in_array($authUser->role, ['admin', 'super_admin'])) {
            return redirect()->route('dashboard')->with('error', 'No tienes permiso para realizar esta acción.');
        }

        if ($authUser->role === 'admin' && $user->role === 'super_admin') {
            return back()->with('error', 'No tienes permiso para desactivar un Super Administrador.');
        }

        $user->update(['is_active' => !$user->is_active]);
        
        $status = $user->is_active ? 'activado' : 'desactivado';
        return back()->with('success', "Usuario {$status} correctamente.");
    }

    /**
     * Eliminar un usuario.
     * ✅ SOLO ADMIN, SUPER_ADMIN
     */
    public function destroy(Request $request, User $user)
    {
        // ✅ PROTECCIÓN - Solo admin y super_admin
        $authUser = $request->user();
        if (!in_array($authUser->role, ['admin', 'super_admin'])) {
            return redirect()->route('dashboard')->with('error', 'No tienes permiso para eliminar usuarios.');
        }

        if ($user->id === $authUser->id) {
            return back()->with('error', 'No puedes eliminar tu propio usuario.');
        }

        if ($authUser->role === 'admin' && $user->role === 'super_admin') {
            return back()->with('error', 'No tienes permiso para eliminar un Super Administrador.');
        }

        if ($user->reports()->count() > 0) {
            return back()->with('error', 'No se puede eliminar el usuario porque tiene reportes asociados.');
        }

        $user->delete();
        return back()->with('success', 'Usuario eliminado correctamente.');
    }

    /**
     * Resetear firma digital de un usuario.
     * ✅ SOLO ADMIN, SUPER_ADMIN
     */
    public function resetSignature(Request $request, User $user)
    {
        // ✅ PROTECCIÓN - Solo admin y super_admin
        $authUser = $request->user();
        if (!in_array($authUser->role, ['admin', 'super_admin'])) {
            return redirect()->route('dashboard')->with('error', 'No tienes permiso para realizar esta acción.');
        }

        if ($authUser->role === 'admin' && $user->role === 'super_admin') {
            return back()->with('error', 'No tienes permiso para resetear la firma de un Super Administrador.');
        }

        $user->deleteSignature();
        return back()->with('success', 'Firma digital eliminada correctamente.');
    }

    /**
     * Asignar instituciones a un usuario.
     * ✅ SOLO ADMIN, SUPER_ADMIN
     */
    public function assignInstitutions(Request $request, User $user)
    {
        // ✅ PROTECCIÓN - Solo admin y super_admin
        $authUser = $request->user();
        if (!in_array($authUser->role, ['admin', 'super_admin'])) {
            return redirect()->route('dashboard')->with('error', 'No tienes permiso para asignar instituciones.');
        }

        if ($authUser->role === 'admin' && $user->role === 'super_admin') {
            return back()->with('error', 'No tienes permiso para asignar instituciones a un Super Administrador.');
        }

        $institutionIds = $request->input('institution_ids', []);
        
        if (!empty($institutionIds)) {
            $validIds = EducationalInstitution::whereIn('id', $institutionIds)->pluck('id')->toArray();
            $user->institutions()->sync($validIds);
        } else {
            $user->institutions()->detach();
        }
        
        return back()->with('success', 'Instituciones asignadas correctamente.');
    }

    /**
     * Mostrar vista de importación de usuarios.
     * ✅ SOLO SUPER_ADMIN
     */
    public function importIndex(Request $request)
    {
        // ✅ Solo super_admin puede acceder
        $authUser = $request->user();
        if ($authUser->role !== 'super_admin') {
            return redirect()->route('dashboard')->with('error', 'No tienes permiso para acceder a esta sección.');
        }

        $institutions = EducationalInstitution::orderBy('name')->get(['id', 'name', 'modular_code']);
        
        $roles = [
            'admin' => 'Administrador',
            'specialist' => 'Especialista UPDI',
            'supervisor' => 'Supervisor',
            'director' => 'Director',
            'executive' => 'Ejecutivo',
        ];

        return inertia('Admin/Users/Import', [
            'institutions' => $institutions,
            'roles' => $roles,
            'templateUrl' => route('admin.users.import.template'),
        ]);
    }

    /**
     * Importar usuarios masivamente.
     * ✅ SOLO SUPER_ADMIN
     */
    public function import(Request $request)
    {
        // ✅ Solo super_admin puede importar usuarios
        $authUser = $request->user();
        if ($authUser->role !== 'super_admin') {
            return redirect()->route('dashboard')->with('error', 'No tienes permiso para importar usuarios.');
        }

        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:5120',
        ]);

        try {
            $import = new UsersImport();
            Excel::import($import, $request->file('file'));

            $imported = $import->getImportedCount();
            $skipped = $import->getSkippedCount();
            $errors = $import->getErrors();

            $message = "✅ Se importaron {$imported} usuarios correctamente.";

            if ($skipped > 0) {
                $message .= " {$skipped} filas fueron omitidas.";
            }

            if (!empty($errors)) {
                $message .= " Detalles: " . implode('; ', $errors);
            }

            return redirect()->route('admin.users.index')->with('success', $message);

        } catch (\Exception $e) {
            return back()->with('error', '❌ Error al importar: ' . $e->getMessage());
        }
    }

    /**
     * Descargar plantilla de importación de usuarios (simplificada)
     */
    public function downloadTemplate()
    {
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // ✅ Encabezados EXACTOS (6 columnas)
        $headers = [
            'dni',
            'last_name',
            'second_last_name',
            'first_name',
            'email',
            'role'
        ];

        // ✅ Estilo para encabezados
        $headerStyle = [
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => '7c3aed'],
            ],
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    'color' => ['rgb' => '000000'],
                ],
            ],
        ];

        // ✅ Estilo para columnas obligatorias (fondo amarillo)
        $requiredStyle = [
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'FFF3CD'],
            ],
        ];

        // ✅ Columnas y encabezados
        $col = 1;
        foreach ($headers as $header) {
            $sheet->setCellValueByColumnAndRow($col, 1, $header);
            $sheet->getColumnDimensionByColumn($col)->setWidth(25);
            $col++;
        }

        // ✅ Aplicar estilo a encabezados
        $sheet->getStyle('A1:F1')->applyFromArray($headerStyle);

        // ✅ Aplicar fondo amarillo a columnas obligatorias (A, B, D, E, F)
        $requiredColumns = ['A', 'B', 'D', 'E', 'F']; // dni, last_name, first_name, email, role
        foreach ($requiredColumns as $colLetter) {
            $sheet->getStyle($colLetter . '1')->applyFromArray($requiredStyle);
        }

        // ✅ Datos de ejemplo (fila 2)
        $row = 2;
        $sheet->setCellValueByColumnAndRow(1, $row, '12345678');
        $sheet->setCellValueByColumnAndRow(2, $row, 'Pérez');
        $sheet->setCellValueByColumnAndRow(3, $row, 'García');
        $sheet->setCellValueByColumnAndRow(4, $row, 'Juan Carlos');
        $sheet->setCellValueByColumnAndRow(5, $row, 'juan.perez@ugelambo.gob.pe');
        $sheet->setCellValueByColumnAndRow(6, $row, 'director');

        // ✅ Estilo para los datos de ejemplo
        $exampleStyle = [
            'font' => [
                'color' => ['rgb' => '666666'],
                'size' => 10,
            ],
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    'color' => ['rgb' => 'CCCCCC'],
                ],
            ],
        ];
        $sheet->getStyle('A2:F2')->applyFromArray($exampleStyle);

        // ✅ Agregar instrucciones
        $sheet->setCellValue('A4', 'INSTRUCCIONES:');
        $sheet->setCellValue('A5', '1. DNI: 8 dígitos (obligatorio)');
        $sheet->setCellValue('A6', '2. last_name: Apellido Paterno (obligatorio)');
        $sheet->setCellValue('A7', '3. second_last_name: Apellido Materno (opcional)');
        $sheet->setCellValue('A8', '4. first_name: Nombres (obligatorio)');
        $sheet->setCellValue('A9', '5. email: Correo electrónico (obligatorio)');
        $sheet->setCellValue('A10', '6. role: admin, specialist, supervisor, director, executive (obligatorio)');
        $sheet->setCellValue('A11', '   - También puedes usar: administrador, especialista, supervisor, director, ejecutivo');
        $sheet->setCellValue('A12', '7. Contraseña generada automáticamente: Ugel + DNI + * (ej: Ugel12345678*)');
        $sheet->setCellValue('A13', '8. Elimina la fila de ejemplo antes de cargar tus datos');

        $sheet->getStyle('A4')->getFont()->setBold(true)->setSize(11);
        $sheet->getStyle('A4:A13')->getFont()->setSize(10);
        $sheet->getStyle('A4:A13')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT);

        // ✅ Descargar archivo
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        
        return response()->stream(
            function () use ($writer) {
                $writer->save('php://output');
            },
            200,
            [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="plantilla_usuarios.xlsx"',
            ]
        );
    }
        
}