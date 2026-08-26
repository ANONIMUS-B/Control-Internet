import { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { 
    Search, X, User, Building2, UserCog, Filter, 
    CheckCircle, AlertCircle, Edit2, Trash2, Plus,
    Eye, EyeOff, RefreshCw, Save, Key, UserCheck,
    UserX, FileSignature, Upload
} from 'lucide-react';
import { Pagination } from '@/components/Pagination';
import { dashboard } from '@/routes';

interface User {
    id: number;
    name: string;
    email: string;
    dni: string | null;
    role: string;
    is_active: boolean;
    signature_active: boolean;
    signature_path: string | null;
    institutions: Array<{
        id: number;
        name: string;
        modular_code: string;
    }>;
    created_at: string;
}

interface Institution {
    id: number;
    name: string;
    modular_code: string;
}

interface Filters {
    search?: string;
    role?: string;
    institution_id?: string;
    has_signature?: string;
    is_active?: string;
    per_page?: number;
}

interface UserManagementProps {
    users: {
        data: User[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
    institutions: Institution[];
    filters: Filters;
    roles: Record<string, string>;
}

export default function UserManagement({ users, institutions, filters, roles }: UserManagementProps) {
    const [search, setSearch] = useState<string>(filters.search || '');
    const [selectedRole, setSelectedRole] = useState<string>(filters.role || '');
    const [selectedInstitution, setSelectedInstitution] = useState<string>(filters.institution_id || '');
    const [hasSignature, setHasSignature] = useState<string>(filters.has_signature || '');
    const [selectedStatus, setSelectedStatus] = useState<string>(filters.is_active || '');
    const [perPage, setPerPage] = useState<number>(filters.per_page || 10);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showAssignModal, setShowAssignModal] = useState<User | null>(null);
    const [selectedInstitutions, setSelectedInstitutions] = useState<number[]>([]);
    const [showPassword, setShowPassword] = useState(false);

    const buildFullName = (lastName: string, secondLastName: string, firstName: string) => {
        const parts = [lastName, secondLastName, firstName].filter(Boolean);
        return parts.join(' ').trim();
    };

    const applyFilters = () => {
        router.get('/admin/usuarios', {
            search: search,
            role: selectedRole,
            institution_id: selectedInstitution,
            has_signature: hasSignature,
            is_active: selectedStatus,
            per_page: perPage,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedRole('');
        setSelectedInstitution('');
        setHasSignature('');
        setSelectedStatus('');
        setPerPage(10);
        
        router.get('/admin/usuarios', {
            per_page: 10,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const changeRole = (userId: number, role: string) => {
        if (!confirm(`¿Desea cambiar el rol de este usuario?`)) return;

        router.post(`/admin/usuarios/${userId}/rol`, { role }, {
            preserveScroll: true,
            onSuccess: () => router.reload(),
        });
    };

    const toggleActive = (user: User) => {
        const action = user.is_active ? 'desactivar' : 'activar';
        if (!confirm(`¿Está seguro de ${action} al usuario "${user.name}"?`)) return;

        router.post(`/admin/usuarios/${user.id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload();
            },
            onError: (errors) => {
                console.error('Error al cambiar estado:', errors);
                alert('Error al cambiar el estado del usuario');
            }
        });
    };

    const deleteUser = (userId: number, userName: string) => {
        if (!confirm(`¿Está seguro de eliminar al usuario "${userName}"?`)) return;

        router.delete(`/admin/usuarios/${userId}`, {
            preserveScroll: true,
            onSuccess: () => router.reload(),
        });
    };

    const resetSignature = (userId: number) => {
        if (!confirm('¿Está seguro de eliminar la firma digital de este usuario?')) return;

        router.post(`/admin/usuarios/${userId}/reset-signature`, {}, {
            preserveScroll: true,
            onSuccess: () => router.reload(),
        });
    };

    const openAssignModal = (user: User) => {
        setShowAssignModal(user);
        setSelectedInstitutions(user.institutions.map(i => i.id));
    };

    const saveAssignments = () => {
        if (!showAssignModal) return;

        router.post(`/admin/usuarios/${showAssignModal.id}/assign`, {
            institution_ids: selectedInstitutions,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowAssignModal(null);
                router.reload();
            },
        });
    };

    const roleColors: Record<string, string> = {
        super_admin: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/25',
        admin: 'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/25',
        specialist: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/25',
        supervisor: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25',
        director: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25',
        executive: 'bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-400 border-neutral-200 dark:border-white/10',
    };

    const stats = {
        total: users?.total || 0,
        active: users?.data?.filter(u => u.is_active).length || 0,
        inactive: users?.data?.filter(u => !u.is_active).length || 0,
        withSignature: users?.data?.filter(u => u.signature_active).length || 0,
    };

    return (
        <>
            <Head title="Gestión de Usuarios" />

            <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                <div className="max-w-7xl mx-auto w-full space-y-4">

                    {/* ===== HEADER ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-[11px] font-bold text-gray-900 dark:text-white">
                                    👥 Gestión de Usuarios
                                </h1>
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                    Administración de usuarios, roles y permisos
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/admin/usuarios/importar"
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 active:scale-95"
                                >
                                    <Upload className="w-4 h-4" />
                                    Importar
                                </Link>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95"
                                >
                                    <Plus className="w-4 h-4" />
                                    Nuevo Usuario
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ===== TARJETAS DE ESTADÍSTICAS ===== */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Usuarios', value: stats.total, icon: User, bgColor: 'bg-blue-100 dark:bg-blue-500/20', iconColor: 'text-blue-600 dark:text-blue-400', borderColor: 'border-blue-200 dark:border-blue-500/20' },
                            { label: 'Activos', value: stats.active, icon: UserCheck, bgColor: 'bg-emerald-100 dark:bg-emerald-500/20', iconColor: 'text-emerald-600 dark:text-emerald-400', borderColor: 'border-emerald-200 dark:border-emerald-500/20' },
                            { label: 'Inactivos', value: stats.inactive, icon: UserX, bgColor: 'bg-rose-100 dark:bg-rose-500/20', iconColor: 'text-rose-600 dark:text-rose-400', borderColor: 'border-rose-200 dark:border-rose-500/20' },
                            { label: 'Con Firma Digital', value: stats.withSignature, icon: FileSignature, bgColor: 'bg-purple-100 dark:bg-purple-500/20', iconColor: 'text-purple-600 dark:text-purple-400', borderColor: 'border-purple-200 dark:border-purple-500/20' },
                        ].map((stat, index) => (
                            <div key={index} className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-2xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] font-medium text-gray-500 dark:text-neutral-400">{stat.label}</p>
                                        <p className="text-[11px] font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                    </div>
                                    <div className={`${stat.bgColor} p-2 rounded-xl border ${stat.borderColor}`}>
                                        <stat.icon className={`${stat.iconColor} w-4 h-4`} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ===== FILTROS ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm dark:shadow-2xl">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre, email o DNI..."
                                        className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 pl-9 pr-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-500"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all px-3 py-2 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                >
                                    <option value="">Todos los roles</option>
                                    {Object.entries(roles).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>

                                <select
                                    value={selectedInstitution}
                                    onChange={(e) => setSelectedInstitution(e.target.value)}
                                    className="rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all px-3 py-2 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                >
                                    <option value="">Todas las IE</option>
                                    {institutions.map((inst) => (
                                        <option key={inst.id} value={String(inst.id)}>
                                            {inst.name} ({inst.modular_code})
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={hasSignature}
                                    onChange={(e) => setHasSignature(e.target.value)}
                                    className="rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all px-3 py-2 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                >
                                    <option value="">Todas las firmas</option>
                                    <option value="true">Con Firma</option>
                                    <option value="false">Sin Firma</option>
                                </select>

                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all px-3 py-2 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                >
                                    <option value="">Todos los estados</option>
                                    <option value="true">Activos</option>
                                    <option value="false">Inactivos</option>
                                </select>

                                <select
                                    value={perPage}
                                    onChange={(e) => setPerPage(Number(e.target.value))}
                                    className="rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all px-3 py-2 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                >
                                    <option value={10}>10</option>
                                    <option value={15}>15</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <button
                                    onClick={applyFilters}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95"
                                >
                                    <Search className="w-4 h-4" />
                                    Filtrar
                                </button>
                                {(search || selectedRole || selectedInstitution || hasSignature || selectedStatus) && (
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-neutral-300 rounded-xl text-[11px] font-medium transition-all border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                                    >
                                        <X className="w-4 h-4" />
                                        Limpiar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ===== TABLA DE USUARIOS ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-[11px]">
                                <thead className="bg-gray-50 dark:bg-white/5">
                                    <tr>
                                        <th className="p-3 text-left text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Usuario</th>
                                        <th className="p-3 text-left text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Rol</th>
                                        <th className="p-3 text-left text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">IEs Asignadas</th>
                                        <th className="p-3 text-left text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Estado</th>
                                        <th className="p-3 text-left text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Firma</th>
                                        <th className="p-3 text-center text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users?.data && users.data.length > 0 ? (
                                        users.data.map((user) => (
                                            <tr key={user.id} className="border-t border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                                                <td className="p-3">
                                                    <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                                                    <div className="text-[11px] text-gray-500 dark:text-neutral-400">{user.email}</div>
                                                    {user.dni && (
                                                        <div className="text-[11px] text-gray-400 dark:text-neutral-500">DNI: {user.dni}</div>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => changeRole(user.id, e.target.value)}
                                                        className={`px-2 py-1 rounded-full text-[11px] font-medium border-0 ${roleColors[user.role] || 'bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-400'}`}
                                                    >
                                                        {Object.entries(roles).map(([key, value]) => (
                                                            <option key={key} value={key} className="bg-white dark:bg-slate-900 dark:text-white">
                                                                {value}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.institutions.length > 0 ? (
                                                            user.institutions.slice(0, 2).map((inst) => (
                                                                <span key={inst.id} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full text-[11px] border border-blue-200 dark:border-blue-500/20">
                                                                    {inst.modular_code}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-[11px] text-gray-400 dark:text-neutral-500">Sin asignar</span>
                                                        )}
                                                        {user.institutions.length > 2 && (
                                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-neutral-400 rounded-full text-[11px] border border-gray-200 dark:border-white/10">
                                                                +{user.institutions.length - 2}
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => openAssignModal(user)}
                                                            className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-[11px] font-medium hover:scale-105 transition-all shadow-sm"
                                                        >
                                                            Asignar
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={`px-2 py-1 rounded-full text-[11px] font-medium border ${user.is_active ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25' : 'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/25'}`}>
                                                            {user.is_active ? '✅ Activo' : '❌ Inactivo'}
                                                        </span>
                                                        <button
                                                            onClick={() => toggleActive(user)}
                                                            className={`text-[11px] px-2 py-1 rounded-full transition-all ${
                                                                user.is_active 
                                                                    ? 'bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20' 
                                                                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                                                            }`}
                                                        >
                                                            {user.is_active ? 'Desactivar' : 'Activar'}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded-full text-[11px] font-medium border ${user.signature_active ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25' : 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25'}`}>
                                                        {user.signature_active ? '✅ Activa' : '❌ Sin firma'}
                                                    </span>
                                                    {user.signature_active && (
                                                        <button
                                                            onClick={() => resetSignature(user.id)}
                                                            className="ml-2 text-[11px] text-rose-600 dark:text-rose-400 hover:underline"
                                                        >
                                                            Resetear
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex justify-center gap-1.5">
                                                        <button
                                                            onClick={() => setEditingUser(user)}
                                                            className="p-2 bg-blue-100 dark:bg-blue-500/15 hover:bg-blue-200 dark:hover:bg-blue-500/25 text-blue-700 dark:text-blue-400 rounded-xl transition-all border border-blue-200 dark:border-blue-500/20 hover:scale-110 active:scale-95"
                                                            title="Editar"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteUser(user.id, user.name)}
                                                            className="p-2 bg-rose-100 dark:bg-rose-500/15 hover:bg-rose-200 dark:hover:bg-rose-500/25 text-rose-700 dark:text-rose-400 rounded-xl transition-all border border-rose-200 dark:border-rose-500/20 hover:scale-110 active:scale-95"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="p-6 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10">
                                                        <UserCog className="w-16 h-16 text-gray-400 dark:text-neutral-600" />
                                                    </div>
                                                    <p className="text-[11px] font-medium text-gray-900 dark:text-white">No hay usuarios</p>
                                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">No se encontraron usuarios con los filtros seleccionados.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {users?.links && users.links.length > 3 && (
                            <div className="border-t border-gray-200 dark:border-white/10 px-4 py-3 bg-gray-50 dark:bg-white/5">
                                <Pagination links={users.links} />
                            </div>
                        )}
                    </div>

                    {users?.total > 0 && (
                        <div className="text-center text-[11px] text-gray-500 dark:text-neutral-400">
                            Mostrando {users.data?.length || 0} de {users.total} usuarios
                            {users.last_page > 1 && ` - Página ${users.current_page} de ${users.last_page}`}
                        </div>
                    )}
                </div>
            </div>

            {/* ===== MODALES ===== */}
            {showCreateModal && (
                <UserModal
                    type="create"
                    institutions={institutions}
                    roles={roles}
                    onClose={() => setShowCreateModal(false)}
                />
            )}

            {editingUser && (
                <UserModal
                    type="edit"
                    user={editingUser}
                    institutions={institutions}
                    roles={roles}
                    onClose={() => setEditingUser(null)}
                />
            )}

            {showAssignModal && (
                <AssignModal
                    user={showAssignModal}
                    institutions={institutions}
                    selectedIds={selectedInstitutions}
                    onSelect={setSelectedInstitutions}
                    onSave={saveAssignments}
                    onClose={() => setShowAssignModal(null)}
                />
            )}
        </>
    );
}

UserManagement.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Gestión de Usuarios', href: '#' }
    ],
};

// ============================================
// MODAL DE USUARIO (Crear/Editar)
// ============================================

function UserModal({ 
    type, 
    user, 
    institutions, 
    roles, 
    onClose 
}: { 
    type: 'create' | 'edit';
    user?: User;
    institutions: Institution[];
    roles: Record<string, string>;
    onClose: () => void;
}) {
    const parseFullName = (fullName: string) => {
        if (!fullName) return { lastName: '', secondLastName: '', firstName: '' };
        
        const parts = fullName.trim().split(' ');
        if (parts.length === 1) {
            return { lastName: parts[0], secondLastName: '', firstName: '' };
        } else if (parts.length === 2) {
            return { lastName: parts[0], secondLastName: '', firstName: parts[1] };
        } else {
            return { 
                lastName: parts[0], 
                secondLastName: parts[1], 
                firstName: parts.slice(2).join(' ') 
            };
        }
    };

    const getUserNameParts = () => {
        if (!user) return { lastName: '', secondLastName: '', firstName: '' };
        
        if (user.last_name !== undefined && user.first_name !== undefined) {
            return {
                lastName: user.last_name || '',
                secondLastName: user.second_last_name || '',
                firstName: user.first_name || ''
            };
        }
        
        return parseFullName(user.name || '');
    };

    const nameParts = getUserNameParts();

    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name || '',
        last_name: nameParts.lastName,
        second_last_name: nameParts.secondLastName,
        first_name: nameParts.firstName,
        email: user?.email || '',
        dni: user?.dni || '',
        role: user?.role || 'director',
        password: '',
        password_confirmation: '',
        institution_ids: user?.institutions.map(i => i.id) || [],
    });

    const [showPassword, setShowPassword] = useState(false);
    const [searchInstitutions, setSearchInstitutions] = useState('');

    const buildFullName = (lastName: string, secondLastName: string, firstName: string) => {
        const parts = [lastName, secondLastName, firstName].filter(Boolean);
        return parts.join(' ').trim();
    };

    const updateName = (field: 'last_name' | 'second_last_name' | 'first_name', value: string) => {
        const newData = { ...data, [field]: value };
        newData.name = buildFullName(
            field === 'last_name' ? value : data.last_name,
            field === 'second_last_name' ? value : data.second_last_name,
            field === 'first_name' ? value : data.first_name
        );
        setData(newData);
    };

    const filteredInstitutions = institutions.filter(inst =>
        inst.name.toLowerCase().includes(searchInstitutions.toLowerCase()) ||
        inst.modular_code.toLowerCase().includes(searchInstitutions.toLowerCase())
    );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const finalData = {
            ...data,
            name: buildFullName(data.last_name, data.second_last_name, data.first_name)
        };
        setData(finalData);

        if (type === 'create') {
            post('/admin/usuarios', {
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        } else {
            put(`/admin/usuarios/${user?.id}`, {
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[11px] font-bold text-gray-900 dark:text-white">
                        {type === 'create' ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                        <X className="w-4 h-4 text-gray-500 dark:text-neutral-400" />
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300">
                                Apellido Paterno <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.last_name}
                                onChange={(e) => updateName('last_name', e.target.value)}
                                className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all px-3 py-2 mt-1 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                placeholder="Ej: Pérez"
                                required
                            />
                            {errors.last_name && <p className="text-rose-500 text-[11px] mt-1">{errors.last_name}</p>}
                        </div>

                        <div>
                            <label className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300">
                                Apellido Materno
                            </label>
                            <input
                                type="text"
                                value={data.second_last_name}
                                onChange={(e) => updateName('second_last_name', e.target.value)}
                                className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all px-3 py-2 mt-1 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                placeholder="Ej: García"
                            />
                            {errors.second_last_name && <p className="text-rose-500 text-[11px] mt-1">{errors.second_last_name}</p>}
                        </div>

                        <div>
                            <label className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300">
                                Nombres <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.first_name}
                                onChange={(e) => updateName('first_name', e.target.value)}
                                className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all px-3 py-2 mt-1 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                placeholder="Ej: Juan Carlos"
                                required
                            />
                            {errors.first_name && <p className="text-rose-500 text-[11px] mt-1">{errors.first_name}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300">Email *</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all px-3 py-2 mt-1 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                required
                            />
                            {errors.email && <p className="text-rose-500 text-[11px] mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300">DNI</label>
                            <input
                                type="text"
                                value={data.dni}
                                onChange={(e) => setData('dni', e.target.value)}
                                className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all px-3 py-2 mt-1 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                maxLength={8}
                                placeholder="12345678"
                            />
                            {errors.dni && <p className="text-rose-500 text-[11px] mt-1">{errors.dni}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300">Rol *</label>
                            <select
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all px-3 py-2 mt-1 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                required
                            >
                                {Object.entries(roles).map(([key, value]) => (
                                    <option key={key} value={key}>{value}</option>
                                ))}
                            </select>
                            {errors.role && <p className="text-rose-500 text-[11px] mt-1">{errors.role}</p>}
                        </div>

                        <div>
                            <label className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300">
                                {type === 'create' ? 'Contraseña *' : 'Nueva Contraseña (opcional)'}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all px-3 py-2 mt-1 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                    required={type === 'create'}
                                    minLength={8}
                                    placeholder={type === 'create' ? 'Mínimo 8 caracteres' : 'Dejar vacío para mantener'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-rose-500 text-[11px] mt-1">{errors.password}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300">
                            Instituciones Asignadas
                        </label>
                        
                        <div className="relative mt-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar institución por nombre o código..."
                                value={searchInstitutions}
                                onChange={(e) => setSearchInstitutions(e.target.value)}
                                className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pl-9 pr-4 py-2 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-500"
                            />
                            {searchInstitutions && (
                                <button
                                    onClick={() => setSearchInstitutions('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="max-h-40 overflow-y-auto border-2 border-gray-200 dark:border-white/10 rounded-xl p-2 mt-2">
                            {filteredInstitutions.length > 0 ? (
                                filteredInstitutions.map((inst) => (
                                    <label key={inst.id} className="flex items-center gap-2 p-2 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={data.institution_ids.includes(inst.id)}
                                            onChange={(e) => {
                                                const ids = e.target.checked
                                                    ? [...data.institution_ids, inst.id]
                                                    : data.institution_ids.filter(id => id !== inst.id);
                                                setData('institution_ids', ids);
                                            }}
                                            className="rounded border-gray-300 dark:border-white/20 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-[11px] flex-1 text-gray-900 dark:text-white">{inst.name}</span>
                                        <span className="text-[11px] text-gray-400 dark:text-neutral-500">({inst.modular_code})</span>
                                        {data.institution_ids.includes(inst.id) && (
                                            <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        )}
                                    </label>
                                ))
                            ) : (
                                <div className="p-4 text-center text-[11px] text-gray-500 dark:text-neutral-400">
                                    No se encontraron instituciones
                                </div>
                            )}
                        </div>

                        <div className="mt-1 text-[11px] text-gray-500 dark:text-neutral-400">
                            {data.institution_ids.length} institución(es) seleccionada(s)
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-[11px] font-medium text-gray-700 dark:text-neutral-300"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'Guardando...' : type === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ============================================
// MODAL DE ASIGNACIÓN
// ============================================

function AssignModal({ 
    user, 
    institutions, 
    selectedIds, 
    onSelect, 
    onSave, 
    onClose 
}: {
    user: User;
    institutions: Institution[];
    selectedIds: number[];
    onSelect: (ids: number[]) => void;
    onSave: () => void;
    onClose: () => void;
}) {
    const [search, setSearch] = useState('');

    const filtered = institutions.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.modular_code.toLowerCase().includes(search.toLowerCase())
    );

    const selectedCount = selectedIds.length;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-white/10">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div>
                        <h2 className="text-[11px] font-bold text-gray-900 dark:text-white">Asignar Instituciones</h2>
                        <p className="text-[11px] text-gray-500 dark:text-neutral-400">{user.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                        <X className="w-4 h-4 text-gray-500 dark:text-neutral-400" />
                    </button>
                </div>

                <div className="relative mb-4 flex-shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar institución por nombre o código..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2.5 pl-10 pr-4 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-500"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto border-2 border-gray-200 dark:border-white/10 rounded-xl divide-y divide-gray-200 dark:divide-white/5">
                    {filtered.length > 0 ? (
                        filtered.map((inst) => (
                            <label key={inst.id} className="flex items-center gap-3 p-3 hover:bg-blue-50 dark:hover:bg-blue-500/10 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(inst.id)}
                                    onChange={() => {
                                        const newIds = selectedIds.includes(inst.id)
                                            ? selectedIds.filter(id => id !== inst.id)
                                            : [...selectedIds, inst.id];
                                        onSelect(newIds);
                                    }}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-white/20 focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                    <p className="text-[11px] font-medium text-gray-900 dark:text-white">{inst.name}</p>
                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">Código: {inst.modular_code}</p>
                                </div>
                                {selectedIds.includes(inst.id) && (
                                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                )}
                            </label>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500 dark:text-neutral-400">
                            <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-neutral-600" />
                            <p className="text-[11px]">No se encontraron instituciones</p>
                            <p className="text-[11px]">Prueba con otro término de búsqueda</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-white/10 flex-shrink-0">
                    <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                        {selectedCount} institución(es) seleccionada(s)
                    </span>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-[11px] font-medium text-gray-700 dark:text-neutral-300"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onSave}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}