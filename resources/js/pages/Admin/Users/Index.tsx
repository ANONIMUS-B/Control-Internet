import { Head, useForm, router, Link } from '@inertiajs/react';
import {
    Search,
    X,
    User,
    Building2,
    UserCog,
    Filter,
    CheckCircle,
    AlertCircle,
    Edit2,
    Trash2,
    Plus,
    Eye,
    EyeOff,
    RefreshCw,
    Save,
    Key,
    UserCheck,
    UserX,
    FileSignature,
    Upload,
    FileSpreadsheet,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { Pagination } from '@/components/Pagination';
import { dashboard } from '@/routes';

interface RepeatedUser {
    dni: string;
    name: string;
    row: number;
    reason?: string;
}

interface ImportSummary {
    imported: number;
    not_imported: number;
    already_existing: number;
    repeated_users: RepeatedUser[];
    errors: string[];
}

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
    last_name?: string;
    second_last_name?: string;
    first_name?: string;
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

interface UserStats {
    total: number;
    active: number;
    inactive: number;
    withSignature: number;
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
    stats?: UserStats;
    flash?: {
        success?: string;
        error?: string;
        import_summary?: ImportSummary;
    };
}

export default function UserManagement({
    users,
    institutions,
    filters,
    roles,
    stats: serverStats,
    flash,
}: UserManagementProps) {
    const [importSummary, setImportSummary] = useState<ImportSummary | null>(
        flash?.import_summary || null,
    );
    const [flashSuccess, setFlashSuccess] = useState<string | null>(
        flash?.success || null,
    );
    const [flashError, setFlashError] = useState<string | null>(
        flash?.error || null,
    );
    const [search, setSearch] = useState<string>(filters.search || '');
    const [selectedRole, setSelectedRole] = useState<string>(
        filters.role || '',
    );
    const [selectedInstitution, setSelectedInstitution] = useState<string>(
        filters.institution_id || '',
    );
    const [hasSignature, setHasSignature] = useState<string>(
        filters.has_signature || '',
    );
    const [selectedStatus, setSelectedStatus] = useState<string>(
        filters.is_active || '',
    );
    const [perPage, setPerPage] = useState<number>(filters.per_page || 10);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showAssignModal, setShowAssignModal] = useState<User | null>(null);
    const [selectedInstitutions, setSelectedInstitutions] = useState<number[]>(
        [],
    );
    const [showPassword, setShowPassword] = useState(false);

    const buildFullName = (
        lastName: string,
        secondLastName: string,
        firstName: string,
    ) => {
        const parts = [lastName, secondLastName, firstName].filter(Boolean);

        return parts.join(' ').trim();
    };

    const applyFilters = () => {
        router.get(
            '/admin/usuarios',
            {
                search: search,
                role: selectedRole,
                institution_id: selectedInstitution,
                has_signature: hasSignature,
                is_active: selectedStatus,
                per_page: perPage,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedRole('');
        setSelectedInstitution('');
        setHasSignature('');
        setSelectedStatus('');
        setPerPage(10);

        router.get(
            '/admin/usuarios',
            {
                per_page: 10,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const changeRole = (userId: number, role: string) => {
        if (!confirm(`¿Desea cambiar el rol de este usuario?`)) {
            return;
        }

        router.post(
            `/admin/usuarios/${userId}/rol`,
            { role },
            {
                preserveScroll: true,
                onSuccess: () => router.reload(),
            },
        );
    };

    const toggleActive = (user: User) => {
        const action = user.is_active ? 'desactivar' : 'activar';

        if (!confirm(`¿Está seguro de ${action} al usuario "${user.name}"?`)) {
            return;
        }

        router.post(
            `/admin/usuarios/${user.id}/toggle`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload();
                },
                onError: (errors) => {
                    console.error('Error al cambiar estado:', errors);
                    alert('Error al cambiar el estado del usuario');
                },
            },
        );
    };

    const deleteUser = (userId: number, userName: string) => {
        if (!confirm(`¿Está seguro de eliminar al usuario "${userName}"?`)) {
            return;
        }

        router.delete(`/admin/usuarios/${userId}`, {
            preserveScroll: true,
            onSuccess: () => router.reload(),
        });
    };

    const resetSignature = (userId: number) => {
        if (
            !confirm(
                '¿Está seguro de eliminar la firma digital de este usuario?',
            )
        ) {
            return;
        }

        router.post(
            `/admin/usuarios/${userId}/reset-signature`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => router.reload(),
            },
        );
    };

    const openAssignModal = (user: User) => {
        setShowAssignModal(user);
        // ✅ Asegurar que selectedInstitutions se actualice con las instituciones actuales del usuario
        const currentInstitutionIds = user.institutions
            ? user.institutions.map((i) => i.id)
            : [];
        setSelectedInstitutions(currentInstitutionIds);
    };

    const saveAssignments = () => {
        if (!showAssignModal) {
            return;
        }

        router.post(
            `/admin/usuarios/${showAssignModal.id}/assign`,
            {
                institution_ids: selectedInstitutions,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowAssignModal(null);
                    router.reload();
                },
            },
        );
    };

    const roleColors: Record<string, string> = {
        super_admin:
            'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/25',
        admin: 'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/25',
        specialist:
            'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/25',
        supervisor:
            'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25',
        director:
            'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25',
        executive:
            'bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-400 border-neutral-200 dark:border-white/10',
    };

    const stats = serverStats ?? {
        total: users?.total || 0,
        active: users?.data?.filter((u) => u.is_active).length || 0,
        inactive: users?.data?.filter((u) => !u.is_active).length || 0,
        withSignature:
            users?.data?.filter((u) => u.signature_active).length || 0,
    };

    return (
        <>
            <Head title="Gestión de Usuarios" />

            <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                <div className="mx-auto w-full max-w-7xl space-y-4">
                    {/* ===== HEADER ===== */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
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
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2.5 text-[11px] font-medium text-white shadow-lg shadow-purple-500/20 transition-all hover:scale-105 hover:from-purple-600 hover:to-purple-700 hover:shadow-purple-500/40 active:scale-95"
                                >
                                    <Upload className="h-4 w-4" />
                                    Importar
                                </Link>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-[11px] font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:from-blue-600 hover:to-indigo-700 hover:shadow-blue-500/40 active:scale-95"
                                >
                                    <Plus className="h-4 w-4" />
                                    Nuevo Usuario
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ===== RESUMEN DETALLADO DE IMPORTACIÓN ===== */}
                    {importSummary && (
                        <div className="animate-in rounded-2xl border-2 border-indigo-200 bg-white p-4 shadow-md duration-300 slide-in-from-top dark:border-indigo-500/30 dark:bg-slate-800/90 dark:shadow-2xl">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-lg bg-indigo-100 p-1.5 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                                            <FileSpreadsheet className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-[12px] font-bold text-gray-900 dark:text-white">
                                                Resultado de la Importación de
                                                Usuarios
                                            </h3>
                                            <p className="text-[10px] text-gray-500 dark:text-neutral-400">
                                                Resumen de registros procesados
                                                desde el archivo
                                            </p>
                                        </div>
                                    </div>

                                    {/* Indicadores numéricos principales */}
                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-400">
                                            <CheckCircle className="h-3.5 w-3.5" />
                                            {importSummary.imported}{' '}
                                            {importSummary.imported === 1
                                                ? 'usuario importado'
                                                : 'usuarios importados'}
                                        </span>

                                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-400">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {importSummary.not_imported}{' '}
                                            {importSummary.not_imported === 1
                                                ? 'no importado'
                                                : 'no importados'}
                                        </span>

                                        {importSummary.already_existing > 0 && (
                                            <span className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/15 dark:text-blue-400">
                                                <Users className="h-3.5 w-3.5" />
                                                {importSummary.already_existing}{' '}
                                                {importSummary.already_existing ===
                                                1
                                                    ? 'se repitió (DNI ya registrado)'
                                                    : 'se repitieron (DNI ya registrado)'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setImportSummary(null)}
                                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-neutral-200"
                                    title="Cerrar resumen"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Detalle de quiénes se repitieron */}
                            {importSummary.repeated_users &&
                                importSummary.repeated_users.length > 0 && (
                                    <div className="mt-3 border-t border-gray-100 pt-3 dark:border-white/5">
                                        <div className="mb-2 flex items-center justify-between">
                                            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-800 dark:text-neutral-200">
                                                <Users className="h-3.5 w-3.5 text-indigo-500" />
                                                ¿Quiénes se repitieron y NO se
                                                volvieron a subir? (
                                                {
                                                    importSummary.repeated_users
                                                        .length
                                                }
                                                ):
                                            </p>
                                        </div>
                                        <div className="max-h-56 space-y-1.5 divide-y divide-gray-100 overflow-y-auto pr-1 dark:divide-white/5">
                                            {importSummary.repeated_users.map(
                                                (item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex flex-col justify-between gap-1 rounded-xl border border-gray-100 bg-gray-50/70 p-2 text-[11px] sm:flex-row sm:items-center sm:gap-4 dark:border-white/5 dark:bg-white/5"
                                                    >
                                                        <div className="flex min-w-0 items-center gap-2">
                                                            <span className="flex-shrink-0 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
                                                                DNI: {item.dni}
                                                            </span>
                                                            <span className="truncate font-semibold text-gray-900 dark:text-white">
                                                                {item.name}
                                                            </span>
                                                        </div>
                                                        <span className="flex-shrink-0 text-[10px] text-gray-500 dark:text-neutral-400">
                                                            {item.reason ||
                                                                'DNI ya registrado en el sistema'}{' '}
                                                            (Fila {item.row})
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Otros errores de validación si existen */}
                            {importSummary.errors &&
                                importSummary.errors.length > 0 && (
                                    <div className="mt-3 border-t border-gray-100 pt-2 text-[10px] text-rose-600 dark:border-white/5 dark:text-rose-400">
                                        <span className="font-semibold">
                                            Otros errores en el archivo (
                                            {importSummary.errors.length}):{' '}
                                        </span>
                                        {importSummary.errors
                                            .slice(0, 3)
                                            .join('; ')}
                                        {importSummary.errors.length > 3 &&
                                            ` ... (${importSummary.errors.length - 3} adicionales)`}
                                    </div>
                                )}
                        </div>
                    )}

                    {/* Mensaje Flash de éxito estándar si no hay resumen de importación */}
                    {!importSummary && flashSuccess && (
                        <div className="flex animate-in items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-[11px] dark:border-emerald-800 dark:bg-emerald-950/30">
                            <div className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-400">
                                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                                <p>{flashSuccess}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFlashSuccess(null)}
                                className="rounded-lg p-1 text-emerald-600 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-800/50"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}

                    {/* Mensaje Flash de error */}
                    {flashError && (
                        <div className="flex animate-in items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-[11px] dark:border-rose-800 dark:bg-rose-950/30">
                            <div className="flex items-center gap-2 font-medium text-rose-700 dark:text-rose-400">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <p>{flashError}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFlashError(null)}
                                className="rounded-lg p-1 text-rose-600 transition-colors hover:bg-rose-100 dark:hover:bg-rose-800/50"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}

                    {/* ===== TARJETAS DE ESTADÍSTICAS ===== */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        {[
                            {
                                label: 'Total Usuarios',
                                value: stats.total,
                                icon: User,
                                bgColor: 'bg-blue-100 dark:bg-blue-500/20',
                                iconColor: 'text-blue-600 dark:text-blue-400',
                                borderColor:
                                    'border-blue-200 dark:border-blue-500/20',
                            },
                            {
                                label: 'Activos',
                                value: stats.active,
                                icon: UserCheck,
                                bgColor:
                                    'bg-emerald-100 dark:bg-emerald-500/20',
                                iconColor:
                                    'text-emerald-600 dark:text-emerald-400',
                                borderColor:
                                    'border-emerald-200 dark:border-emerald-500/20',
                            },
                            {
                                label: 'Inactivos',
                                value: stats.inactive,
                                icon: UserX,
                                bgColor: 'bg-rose-100 dark:bg-rose-500/20',
                                iconColor: 'text-rose-600 dark:text-rose-400',
                                borderColor:
                                    'border-rose-200 dark:border-rose-500/20',
                            },
                            {
                                label: 'Con Firma Digital',
                                value: stats.withSignature,
                                icon: FileSignature,
                                bgColor: 'bg-purple-100 dark:bg-purple-500/20',
                                iconColor:
                                    'text-purple-600 dark:text-purple-400',
                                borderColor:
                                    'border-purple-200 dark:border-purple-500/20',
                            },
                        ].map((stat, index) => (
                            <div
                                key={index}
                                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] font-medium text-gray-500 dark:text-neutral-400">
                                            {stat.label}
                                        </p>
                                        <p className="text-[11px] font-bold text-gray-900 dark:text-white">
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div
                                        className={`${stat.bgColor} rounded-xl border p-2 ${stat.borderColor}`}
                                    >
                                        <stat.icon
                                            className={`${stat.iconColor} h-4 w-4`}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ===== FILTROS ===== */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                            <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
                                <div className="relative min-w-[200px] flex-1">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre, email o DNI..."
                                        className="w-full rounded-xl border-2 border-gray-200 bg-white py-2 pr-3 pl-9 text-[11px] text-gray-900 transition-all outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-neutral-500"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </div>

                                <select
                                    value={selectedRole}
                                    onChange={(e) =>
                                        setSelectedRole(e.target.value)
                                    }
                                    className="rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-[11px] text-gray-900 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                                >
                                    <option value="">Todos los roles</option>
                                    {Object.entries(roles).map(
                                        ([key, value]) => (
                                            <option key={key} value={key}>
                                                {value}
                                            </option>
                                        ),
                                    )}
                                </select>

                                <select
                                    value={selectedInstitution}
                                    onChange={(e) =>
                                        setSelectedInstitution(e.target.value)
                                    }
                                    className="rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-[11px] text-gray-900 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                                >
                                    <option value="">Todas las IE</option>
                                    {institutions.map((inst) => (
                                        <option
                                            key={inst.id}
                                            value={String(inst.id)}
                                        >
                                            {inst.name} ({inst.modular_code})
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={hasSignature}
                                    onChange={(e) =>
                                        setHasSignature(e.target.value)
                                    }
                                    className="rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-[11px] text-gray-900 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                                >
                                    <option value="">Todas las firmas</option>
                                    <option value="true">Con Firma</option>
                                    <option value="false">Sin Firma</option>
                                </select>

                                <select
                                    value={selectedStatus}
                                    onChange={(e) =>
                                        setSelectedStatus(e.target.value)
                                    }
                                    className="rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-[11px] text-gray-900 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                                >
                                    <option value="">Todos los estados</option>
                                    <option value="true">Activos</option>
                                    <option value="false">Inactivos</option>
                                </select>

                                <select
                                    value={perPage}
                                    onChange={(e) =>
                                        setPerPage(Number(e.target.value))
                                    }
                                    className="rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-[11px] text-gray-900 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                                >
                                    <option value={10}>10</option>
                                    <option value={15}>15</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            <div className="flex w-full items-center gap-2 md:w-auto">
                                <button
                                    onClick={applyFilters}
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-[11px] font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:from-blue-600 hover:to-indigo-700 hover:shadow-blue-500/40 active:scale-95"
                                >
                                    <Search className="h-4 w-4" />
                                    Filtrar
                                </button>
                                {(search ||
                                    selectedRole ||
                                    selectedInstitution ||
                                    hasSignature ||
                                    selectedStatus) && (
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-4 py-2.5 text-[11px] font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:border-white/20 dark:hover:bg-white/10"
                                    >
                                        <X className="h-4 w-4" />
                                        Limpiar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ===== TABLA DE USUARIOS ===== */}
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-[11px]">
                                <thead className="bg-gray-50 dark:bg-white/5">
                                    <tr>
                                        <th className="p-3 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Usuario
                                        </th>
                                        <th className="p-3 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Rol
                                        </th>
                                        <th className="p-3 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            IEs Asignadas
                                        </th>
                                        <th className="p-3 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Estado
                                        </th>
                                        <th className="p-3 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Firma
                                        </th>
                                        <th className="p-3 text-center text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users?.data && users.data.length > 0 ? (
                                        users.data.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="border-t border-gray-200 transition-colors hover:bg-gray-50 dark:border-white/5 dark:hover:bg-white/10"
                                            >
                                                <td className="p-3">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500 dark:text-neutral-400">
                                                        {user.email}
                                                    </div>
                                                    {user.dni && (
                                                        <div className="text-[11px] text-gray-400 dark:text-neutral-500">
                                                            DNI: {user.dni}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) =>
                                                            changeRole(
                                                                user.id,
                                                                e.target.value,
                                                            )
                                                        }
                                                        className={`rounded-full border-0 px-2 py-1 text-[11px] font-medium ${roleColors[user.role] || 'bg-neutral-100 text-neutral-700 dark:bg-white/5 dark:text-neutral-400'}`}
                                                    >
                                                        {Object.entries(
                                                            roles,
                                                        ).map(
                                                            ([key, value]) => (
                                                                <option
                                                                    key={key}
                                                                    value={key}
                                                                    className="bg-white dark:bg-slate-900 dark:text-white"
                                                                >
                                                                    {value}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        {user.institutions &&
                                                        user.institutions
                                                            .length > 0 ? (
                                                            user.institutions
                                                                .slice(0, 2)
                                                                .map((inst) => {
                                                                    const displayName =
                                                                        inst.name ||
                                                                        inst.modular_code ||
                                                                        'IE sin nombre';

                                                                    return (
                                                                        <span
                                                                            key={
                                                                                inst.id
                                                                            }
                                                                            className="inline-flex max-w-[200px] items-center gap-1 rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-[11px] text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400"
                                                                            title={
                                                                                inst.name
                                                                                    ? `${inst.name}${inst.modular_code ? ` (${inst.modular_code})` : ''}`
                                                                                    : inst.modular_code ||
                                                                                      ''
                                                                            }
                                                                        >
                                                                            <Building2 className="h-3 w-3 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                                                                            <span className="truncate">
                                                                                {
                                                                                    displayName
                                                                                }
                                                                            </span>
                                                                            {inst.modular_code &&
                                                                                inst.name && (
                                                                                    <span className="flex-shrink-0 text-[9px] opacity-75">
                                                                                        (
                                                                                        {
                                                                                            inst.modular_code
                                                                                        }
                                                                                        )
                                                                                    </span>
                                                                                )}
                                                                        </span>
                                                                    );
                                                                })
                                                        ) : (
                                                            <span className="text-[11px] text-gray-400 dark:text-neutral-500">
                                                                Sin asignar
                                                            </span>
                                                        )}
                                                        {user.institutions &&
                                                            user.institutions
                                                                .length > 2 && (
                                                                <span
                                                                    className="flex-shrink-0 rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400"
                                                                    title={user.institutions
                                                                        .slice(
                                                                            2,
                                                                        )
                                                                        .map(
                                                                            (
                                                                                i,
                                                                            ) =>
                                                                                i.name ||
                                                                                i.modular_code,
                                                                        )
                                                                        .join(
                                                                            ', ',
                                                                        )}
                                                                >
                                                                    +
                                                                    {user
                                                                        .institutions
                                                                        .length -
                                                                        2}
                                                                </span>
                                                            )}
                                                        <button
                                                            onClick={() =>
                                                                openAssignModal(
                                                                    user,
                                                                )
                                                            }
                                                            className="flex-shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-2 py-0.5 text-[11px] font-medium text-white shadow-sm transition-all hover:scale-105"
                                                        >
                                                            Asignar
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span
                                                            className={`rounded-full border px-2 py-1 text-[11px] font-medium ${user.is_active ? 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-400' : 'border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/15 dark:text-rose-400'}`}
                                                        >
                                                            {user.is_active
                                                                ? '✅ Activo'
                                                                : '❌ Inactivo'}
                                                        </span>
                                                        <button
                                                            onClick={() =>
                                                                toggleActive(
                                                                    user,
                                                                )
                                                            }
                                                            className={`rounded-full px-2 py-1 text-[11px] transition-all ${
                                                                user.is_active
                                                                    ? 'border border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200 dark:border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-400 dark:hover:bg-rose-500/25'
                                                                    : 'border border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:hover:bg-emerald-500/25'
                                                            }`}
                                                        >
                                                            {user.is_active
                                                                ? 'Desactivar'
                                                                : 'Activar'}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <span
                                                        className={`rounded-full border px-2 py-1 text-[11px] font-medium ${user.signature_active ? 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-400' : 'border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-400'}`}
                                                    >
                                                        {user.signature_active
                                                            ? '✅ Activa'
                                                            : '❌ Sin firma'}
                                                    </span>
                                                    {user.signature_active && (
                                                        <button
                                                            onClick={() =>
                                                                resetSignature(
                                                                    user.id,
                                                                )
                                                            }
                                                            className="ml-2 text-[11px] text-rose-600 hover:underline dark:text-rose-400"
                                                        >
                                                            Resetear
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex justify-center gap-1.5">
                                                        <button
                                                            onClick={() =>
                                                                setEditingUser(
                                                                    user,
                                                                )
                                                            }
                                                            className="rounded-xl border border-blue-200 bg-blue-100 p-2 text-blue-700 transition-all hover:scale-110 hover:bg-blue-200 active:scale-95 dark:border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400 dark:hover:bg-blue-500/25"
                                                            title="Editar"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                deleteUser(
                                                                    user.id,
                                                                    user.name,
                                                                )
                                                            }
                                                            className="rounded-xl border border-rose-200 bg-rose-100 p-2 text-rose-700 transition-all hover:scale-110 hover:bg-rose-200 active:scale-95 dark:border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-400 dark:hover:bg-rose-500/25"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-16 text-center"
                                            >
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="rounded-full border border-gray-200 bg-gray-100 p-6 dark:border-white/10 dark:bg-white/5">
                                                        <UserCog className="h-16 w-16 text-gray-400 dark:text-neutral-600" />
                                                    </div>
                                                    <p className="text-[11px] font-medium text-gray-900 dark:text-white">
                                                        No hay usuarios
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                                        No se encontraron
                                                        usuarios con los filtros
                                                        seleccionados.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {users?.links && users.links.length > 3 && (
                            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                                <Pagination links={users.links} />
                            </div>
                        )}
                    </div>

                    {users?.total > 0 && (
                        <div className="text-center text-[11px] text-gray-500 dark:text-neutral-400">
                            Mostrando {users.data?.length || 0} de {users.total}{' '}
                            usuarios
                            {users.last_page > 1 &&
                                ` - Página ${users.current_page} de ${users.last_page}`}
                        </div>
                    )}
                </div>
            </div>

            {/* ===== MODALES ===== */}
            {showCreateModal && (
                <UserModal
                    key="user-create"
                    type="create"
                    institutions={institutions}
                    roles={roles}
                    onClose={() => setShowCreateModal(false)}
                />
            )}

            {editingUser && (
                <UserModal
                    key={`user-edit-${editingUser.id}`}
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
        { title: 'Gestión de Usuarios', href: '#' },
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
    onClose,
}: {
    type: 'create' | 'edit';
    user?: User;
    institutions: Institution[];
    roles: Record<string, string>;
    onClose: () => void;
}) {
    const parseFullName = (fullName: string) => {
        if (!fullName) {
            return { lastName: '', secondLastName: '', firstName: '' };
        }

        if (fullName.includes('\u200B')) {
            const parts = fullName.split('\u200B');

            return {
                lastName: (parts[0] || '').trim(),
                secondLastName: (parts[1] || '').trim(),
                firstName: parts.slice(2).join(' ').trim(),
            };
        }

        if (fullName.includes(',')) {
            const [surnames, firstNames] = fullName.split(',');
            const sParts = (surnames || '').trim().split(/\s+/).filter(Boolean);

            if (sParts.length <= 1) {
                return {
                    lastName: sParts[0] || '',
                    secondLastName: '',
                    firstName: (firstNames || '').trim(),
                };
            }

            return {
                lastName: sParts[0],
                secondLastName: sParts.slice(1).join(' '),
                firstName: (firstNames || '').trim(),
            };
        }

        const parts = fullName.trim().split(/\s+/).filter(Boolean);

        if (parts.length === 0) {
            return { lastName: '', secondLastName: '', firstName: '' };
        }

        if (parts.length === 1) {
            return { lastName: parts[0], secondLastName: '', firstName: '' };
        }

        if (parts.length === 2) {
            return {
                lastName: parts[0],
                secondLastName: '',
                firstName: parts[1],
            };
        }

        if (parts.length === 3) {
            return {
                lastName: parts[0],
                secondLastName: parts[1],
                firstName: parts[2],
            };
        }

        return {
            lastName: parts[0] || '',
            secondLastName: parts[1] || '',
            firstName: parts.slice(2).join(' ') || '',
        };
    };

    const getDefaultNameParts = () => {
        if (!user) {
            return { lastName: '', secondLastName: '', firstName: '' };
        }

        if (user.last_name !== undefined && user.first_name !== undefined) {
            return {
                lastName: user.last_name || '',
                secondLastName: user.second_last_name || '',
                firstName: user.first_name || '',
            };
        }

        return parseFullName(user.name || '');
    };

    const nameParts = getDefaultNameParts();

    const buildFullName = (
        lastName: string,
        secondLastName: string,
        firstName: string,
    ) => {
        const lName = (lastName || '').trim();
        const sName = (secondLastName || '').trim();
        const fName = (firstName || '').trim();

        if (lName === '' && sName === '') {
            return fName;
        }

        if (sName !== '') {
            return `${lName}\u200B ${sName}\u200B ${fName}`;
        }

        return `${lName}\u200B\u200B ${fName}`;
    };

    const { data, setData, post, put, transform, processing, errors } = useForm(
        {
            name: user?.name || '',
            last_name: nameParts.lastName,
            second_last_name: nameParts.secondLastName,
            first_name: nameParts.firstName,
            email: user?.email || '',
            dni: user?.dni || '',
            role: user?.role || 'director',
            password: '',
            password_confirmation: '',
            institution_ids: user?.institutions
                ? user.institutions.map((i) => i.id)
                : [],
        },
    );

    transform((formData) => ({
        ...formData,
        name: buildFullName(
            formData.last_name,
            formData.second_last_name,
            formData.first_name,
        ),
    }));

    const [showPassword, setShowPassword] = useState(false);
    const [searchInstitutions, setSearchInstitutions] = useState('');

    const updateName = (
        field: 'last_name' | 'second_last_name' | 'first_name',
        value: string,
    ) => {
        setData(field, value);
    };

    // ✅ Filtrar instituciones con validación segura
    const filteredInstitutions = institutions.filter((inst) => {
        if (!inst) {
            return false;
        }

        const name = inst.name || '';
        const modularCode = inst.modular_code || '';
        const searchTerm = searchInstitutions.toLowerCase();

        return (
            name.toLowerCase().includes(searchTerm) ||
            modularCode.toLowerCase().includes(searchTerm)
        );
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

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

    const inputClass =
        'w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all px-3 py-2 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-500';
    const labelClass =
        'text-[11px] font-semibold text-gray-700 dark:text-neutral-300';
    const errorClass = 'text-rose-500 text-[11px] mt-1';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-800">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-[11px] font-bold text-gray-900 dark:text-white">
                        {type === 'create'
                            ? 'Crear Nuevo Usuario'
                            : 'Editar Usuario'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                    >
                        <X className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className={labelClass}>
                                Apellido Paterno{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.last_name}
                                onChange={(e) =>
                                    updateName('last_name', e.target.value)
                                }
                                className={inputClass}
                                placeholder="Ej: Pérez"
                                required
                            />
                            {errors.last_name && (
                                <p className={errorClass}>{errors.last_name}</p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>
                                Apellido Materno
                            </label>
                            <input
                                type="text"
                                value={data.second_last_name}
                                onChange={(e) =>
                                    updateName(
                                        'second_last_name',
                                        e.target.value,
                                    )
                                }
                                className={inputClass}
                                placeholder="Ej: García"
                            />
                            {errors.second_last_name && (
                                <p className={errorClass}>
                                    {errors.second_last_name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>
                                Nombres <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.first_name}
                                onChange={(e) =>
                                    updateName('first_name', e.target.value)
                                }
                                className={inputClass}
                                placeholder="Ej: Juan Carlos"
                                required
                            />
                            {errors.first_name && (
                                <p className={errorClass}>
                                    {errors.first_name}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className={labelClass}>Email *</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                className={inputClass}
                                required
                            />
                            {errors.email && (
                                <p className={errorClass}>{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>DNI</label>
                            <input
                                type="text"
                                value={data.dni}
                                onChange={(e) => setData('dni', e.target.value)}
                                className={inputClass}
                                maxLength={8}
                                placeholder="12345678"
                            />
                            {errors.dni && (
                                <p className={errorClass}>{errors.dni}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className={labelClass}>Rol *</label>
                            <select
                                value={data.role}
                                onChange={(e) =>
                                    setData('role', e.target.value)
                                }
                                className={inputClass}
                                required
                            >
                                {Object.entries(roles).map(([key, value]) => (
                                    <option key={key} value={key}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                            {errors.role && (
                                <p className={errorClass}>{errors.role}</p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>
                                {type === 'create'
                                    ? 'Contraseña *'
                                    : 'Nueva Contraseña (opcional)'}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    className={inputClass}
                                    required={type === 'create'}
                                    minLength={8}
                                    placeholder={
                                        type === 'create'
                                            ? 'Mínimo 8 caracteres'
                                            : 'Dejar vacío para mantener'
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className={errorClass}>{errors.password}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>
                            Instituciones Asignadas
                        </label>

                        <div className="relative mt-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
                            <input
                                type="text"
                                placeholder="Buscar institución por nombre o código..."
                                value={searchInstitutions}
                                onChange={(e) =>
                                    setSearchInstitutions(e.target.value)
                                }
                                className={`${inputClass} pl-9`}
                            />
                            {searchInstitutions && (
                                <button
                                    onClick={() => setSearchInstitutions('')}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border-2 border-gray-200 p-2 dark:border-white/10">
                            {filteredInstitutions.length > 0 ? (
                                filteredInstitutions.map((inst) => {
                                    if (!inst) {
                                        return null;
                                    }

                                    const instName = inst.name || 'Sin nombre';
                                    const instCode = inst.modular_code || 'N/A';

                                    return (
                                        <label
                                            key={inst.id}
                                            className="flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors hover:bg-blue-50 dark:hover:bg-blue-500/10"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={data.institution_ids.includes(
                                                    inst.id,
                                                )}
                                                onChange={(e) => {
                                                    const ids = e.target.checked
                                                        ? [
                                                              ...data.institution_ids,
                                                              inst.id,
                                                          ]
                                                        : data.institution_ids.filter(
                                                              (id) =>
                                                                  id !==
                                                                  inst.id,
                                                          );
                                                    setData(
                                                        'institution_ids',
                                                        ids,
                                                    );
                                                }}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-white/20"
                                            />
                                            <span className="min-w-0 flex-1 text-[11px] break-words text-gray-900 dark:text-white">
                                                {instName}
                                            </span>
                                            {inst.modular_code && (
                                                <span className="shrink-0 text-[11px] text-gray-400 dark:text-neutral-500">
                                                    ({inst.modular_code})
                                                </span>
                                            )}
                                            {data.institution_ids.includes(
                                                inst.id,
                                            ) && (
                                                <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            )}
                                        </label>
                                    );
                                })
                            ) : (
                                <div className="p-4 text-center text-[11px] text-gray-500 dark:text-neutral-400">
                                    No se encontraron instituciones
                                </div>
                            )}
                        </div>

                        <div className="mt-1 text-[11px] text-gray-500 dark:text-neutral-400">
                            {data.institution_ids.length} institución(es)
                            seleccionada(s)
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border-2 border-gray-200 px-4 py-2 text-[11px] font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/5"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-[11px] font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:from-blue-600 hover:to-indigo-700 hover:shadow-blue-500/40 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                        >
                            <Save className="h-4 w-4" />
                            {processing
                                ? 'Guardando...'
                                : type === 'create'
                                  ? 'Crear Usuario'
                                  : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ============================================
// MODAL DE ASIGNACIÓN - CORREGIDO
// ============================================

function AssignModal({
    user,
    institutions,
    selectedIds,
    onSelect,
    onSave,
    onClose,
}: {
    user: User;
    institutions: Institution[];
    selectedIds: number[];
    onSelect: (ids: number[]) => void;
    onSave: () => void;
    onClose: () => void;
}) {
    const [search, setSearch] = useState('');

    // ✅ Filtrar instituciones con validación segura
    const filtered = institutions.filter((i) => {
        if (!i) {
            return false;
        }

        const name = i.name || '';
        const modularCode = i.modular_code || '';
        const searchTerm = search.toLowerCase();

        return (
            name.toLowerCase().includes(searchTerm) ||
            modularCode.includes(searchTerm)
        );
    });

    const selectedCount = selectedIds ? selectedIds.length : 0;

    // ✅ Función segura para toggle
    const handleToggle = (id: number) => {
        if (!selectedIds) {
            onSelect([id]);

            return;
        }

        const newIds = selectedIds.includes(id)
            ? selectedIds.filter((i) => i !== id)
            : [...selectedIds, id];
        onSelect(newIds);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-800">
                <div className="mb-4 flex flex-shrink-0 items-center justify-between">
                    <div>
                        <h2 className="text-[11px] font-bold text-gray-900 dark:text-white">
                            Asignar Instituciones
                        </h2>
                        <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                            {user ? user.name : 'Usuario'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                    >
                        <X className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                    </button>
                </div>

                <div className="relative mb-4 flex-shrink-0">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Buscar institución por nombre o código..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border-2 border-gray-200 bg-white py-2.5 pr-4 pl-10 text-[11px] text-gray-900 transition-all outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-neutral-500"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="flex-1 divide-y divide-gray-200 overflow-y-auto rounded-xl border-2 border-gray-200 dark:divide-white/5 dark:border-white/10">
                    {filtered.length > 0 ? (
                        filtered.map((inst) => {
                            if (!inst) {
                                return null;
                            }

                            const isChecked = selectedIds
                                ? selectedIds.includes(inst.id)
                                : false;

                            return (
                                <label
                                    key={inst.id}
                                    className="flex cursor-pointer items-center gap-3 p-3 transition-colors hover:bg-blue-50 dark:hover:bg-blue-500/10"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleToggle(inst.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-white/20"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-medium break-words text-gray-900 dark:text-white">
                                            {inst.name || 'Sin nombre'}
                                        </p>
                                        <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                            {inst.modular_code
                                                ? `Código: ${inst.modular_code}`
                                                : 'Sin código modular'}
                                        </p>
                                    </div>
                                    {isChecked && (
                                        <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    )}
                                </label>
                            );
                        })
                    ) : (
                        <div className="p-8 text-center text-gray-500 dark:text-neutral-400">
                            <Building2 className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-neutral-600" />
                            <p className="text-[11px]">
                                No se encontraron instituciones
                            </p>
                            <p className="text-[11px]">
                                Prueba con otro término de búsqueda
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex flex-shrink-0 items-center justify-between border-t border-gray-200 pt-4 dark:border-white/10">
                    <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                        {selectedCount} institución(es) seleccionada(s)
                    </span>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="rounded-xl border-2 border-gray-200 px-4 py-2 text-[11px] font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/5"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onSave}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-[11px] font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:from-blue-600 hover:to-indigo-700 hover:shadow-blue-500/40 active:scale-95"
                        >
                            <Save className="h-4 w-4" />
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
