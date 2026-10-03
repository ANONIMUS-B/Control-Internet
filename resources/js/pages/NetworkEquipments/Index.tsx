import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Search,
    Wifi,
    Download,
    Upload,
    Filter,
    X,
    CheckCircle2,
    XCircle,
    Package,
    Server,
    Building2,
    Edit2,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import EditEquipmentModal from '@/components/EditEquipmentModal';
import { Pagination } from '@/components/Pagination';
import { dashboard } from '@/routes';

interface Equipment {
    id: number;
    local_code: string;
    institution_name: string;
    level: string;
    description: string;
    brand: string;
    model: string;
    mac_address: string;
    status: string;
    is_active: boolean;
}

interface Props {
    equipments: {
        data: Equipment[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
    stats: {
        total: number;
        operative: number;
        by_brand: Array<{ brand: string; total: number }>;
    };
    filters: {
        search?: string;
        status?: string;
        sort?: string;
        direction?: string;
        per_page?: number;
    };
    institutionCount?: number;
}

export default function Index({
    equipments,
    stats,
    filters,
    institutionCount = 0,
}: Props) {
    const { props } = usePage();
    const user = props.auth?.user;
    const isSuperAdmin = user?.role === 'super_admin';
    const isAdmin = user?.role === 'admin';
    const isDirector = user?.role === 'director';

    // ✅ Pueden editar y eliminar: super_admin y admin
    const canManage = isSuperAdmin || isAdmin;

    const [search, setSearch] = useState<string>(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState<string>(
        filters.status || '',
    );
    const [perPage, setPerPage] = useState<number>(filters.per_page || 15);
    const [showFilters, setShowFilters] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const applyFilters = () => {
        router.get(
            '/equipos-red',
            {
                search: search,
                status: selectedStatus,
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
        setSelectedStatus('');
        setPerPage(15);
        router.get(
            '/equipos-red',
            { per_page: 15 },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleExport = () => {
        router.get(
            '/equipos-red/exportar',
            {},
            {
                preserveScroll: true,
            },
        );
    };

    // ✅ Eliminar equipo
    const deleteEquipment = (id: number, name: string) => {
        if (!confirm(`¿Estás seguro de eliminar el equipo "${name || id}"?`)) {
            return;
        }

        router.delete(`/equipos-red/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload();
            },
        });
    };

    const hasActiveFilters = search || selectedStatus;

    const inputClass =
        'w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 px-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-500';

    const getStatusColor = (status: string) => {
        if (status === 'OPERATIVO') {
            return 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400';
        }

        return 'border-rose-200 dark:border-rose-500/20 bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400';
    };

    const getBrandIcon = (brand: string) => {
        if (brand.toLowerCase().includes('tp-link')) {
            return '🟢';
        }

        if (brand.toLowerCase().includes('ubiquiti')) {
            return '🔵';
        }

        if (brand.toLowerCase().includes('starlink')) {
            return '🛰️';
        }

        if (brand.toLowerCase().includes('mikrotik')) {
            return '🔴';
        }

        return '📡';
    };

    return (
        <>
            <Head title="Equipos de Red" />

            <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                <div className="mx-auto w-full max-w-7xl space-y-4">
                    {/* ===== HEADER ===== */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl border border-purple-200 bg-purple-100 p-2 dark:border-purple-500/20 dark:bg-purple-500/20">
                                    <Wifi className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h1 className="text-[11px] font-bold text-gray-900 dark:text-white">
                                        Equipos de Red
                                    </h1>
                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                        Inventario de routers, antenas y equipos
                                        de conectividad
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isDirector && (
                                    <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 dark:border-blue-500/20 dark:bg-blue-500/10">
                                        <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                        <span className="text-[11px] text-blue-600 dark:text-blue-400">
                                            {institutionCount} institución(es)
                                            asignada(s)
                                        </span>
                                    </div>
                                )}
                                {isSuperAdmin && (
                                    <Link
                                        href="/equipos-red/importar"
                                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-[11px] font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/40 active:scale-95"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Importar
                                    </Link>
                                )}
                                {/* <button
                                    onClick={handleExport}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95"
                                >
                                    <Download className="w-4 h-4" />
                                    Exportar
                                </button> */}
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-[11px] font-medium transition-all ${
                                        showFilters || hasActiveFilters
                                            ? 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400'
                                            : 'border-gray-300 bg-gray-100 text-gray-700 hover:border-gray-400 hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:border-white/20 dark:hover:bg-white/10'
                                    }`}
                                >
                                    <Filter className="h-4 w-4" />
                                    Filtros
                                    {hasActiveFilters && (
                                        <span className="h-2 w-2 animate-pulse rounded-full bg-purple-600" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ===== TARJETAS DE ESTADÍSTICAS ===== */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {[
                            {
                                label: 'Total Equipos',
                                value: stats.total,
                                icon: Server,
                                bgColor: 'bg-purple-100 dark:bg-purple-500/20',
                                iconColor:
                                    'text-purple-600 dark:text-purple-400',
                                borderColor:
                                    'border-purple-200 dark:border-purple-500/20',
                            },
                            {
                                label: 'Equipos Operativos',
                                value: stats.operative,
                                icon: CheckCircle2,
                                bgColor:
                                    'bg-emerald-100 dark:bg-emerald-500/20',
                                iconColor:
                                    'text-emerald-600 dark:text-emerald-400',
                                borderColor:
                                    'border-emerald-200 dark:border-emerald-500/20',
                            },
                            {
                                label: 'Marcas Registradas',
                                value: stats.by_brand?.length || 0,
                                icon: Package,
                                bgColor: 'bg-indigo-100 dark:bg-indigo-500/20',
                                iconColor:
                                    'text-indigo-600 dark:text-indigo-400',
                                borderColor:
                                    'border-indigo-200 dark:border-indigo-500/20',
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
                                        className={`${stat.bgColor} rounded-xl border p-2.5 ${stat.borderColor}`}
                                    >
                                        <stat.icon
                                            className={`${stat.iconColor} h-4 w-4`}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ===== MENSAJE PARA DIRECTOR SIN INSTITUCIONES ===== */}
                    {isDirector && institutionCount === 0 && (
                        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-950/30">
                            <div className="flex flex-col items-center gap-3">
                                <Building2 className="h-12 w-12 text-amber-500" />
                                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                    No tienes instituciones asignadas
                                </p>
                                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                                    Contacta al administrador para que te asigne
                                    una institución educativa.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ===== FILTROS ===== */}
                    {showFilters && (
                        <div className="animate-in rounded-2xl border border-gray-200 bg-white p-4 shadow-sm duration-200 slide-in-from-top dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-800 dark:text-slate-200">
                                    <Filter className="h-3.5 w-3.5 text-purple-600" />
                                    Filtros de Búsqueda
                                </h3>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-1 text-[11px] text-rose-600 transition-colors hover:text-rose-700 dark:text-rose-400"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                        Limpiar filtros
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                <div className="relative col-span-2">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
                                    <input
                                        type="text"
                                        placeholder="Buscar institución, código, marca, MAC..."
                                        className={`${inputClass} pl-9`}
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </div>

                                <select
                                    value={selectedStatus}
                                    onChange={(e) =>
                                        setSelectedStatus(e.target.value)
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Todos los estados</option>
                                    <option value="OPERATIVO">OPERATIVO</option>
                                    <option value="INOPERATIVO">
                                        INOPERATIVO
                                    </option>
                                    <option value="MANTENIMIENTO">
                                        MANTENIMIENTO
                                    </option>
                                </select>

                                <select
                                    value={perPage}
                                    onChange={(e) =>
                                        setPerPage(Number(e.target.value))
                                    }
                                    className={inputClass}
                                >
                                    <option value={10}>10 por pág.</option>
                                    <option value={15}>15 por pág.</option>
                                    <option value={25}>25 por pág.</option>
                                    <option value={50}>50 por pág.</option>
                                </select>

                                <button
                                    onClick={applyFilters}
                                    className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2.5 text-[11px] font-medium text-white shadow-lg shadow-purple-500/20 transition-all hover:scale-105 hover:from-purple-600 hover:to-purple-700 hover:shadow-purple-500/40 active:scale-95 md:col-span-1"
                                >
                                    <Search className="h-4 w-4" />
                                    Aplicar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== TABLA DE EQUIPOS ===== */}
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px]">
                                <thead className="bg-gray-50 dark:bg-white/5">
                                    <tr>
                                        <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Cód. Local
                                        </th>
                                        <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Institución
                                        </th>
                                        <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Descripción
                                        </th>
                                        <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Marca / Modelo
                                        </th>
                                        <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            MAC
                                        </th>
                                        <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Estado
                                        </th>
                                        <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                    {equipments?.data &&
                                    equipments.data.length > 0 ? (
                                        equipments.data.map((equipment) => (
                                            <tr
                                                key={equipment.id}
                                                className="transition-colors hover:bg-gray-50 dark:hover:bg-white/10"
                                            >
                                                <td className="px-4 py-3 font-mono text-[11px] font-medium text-gray-900 dark:text-white">
                                                    {equipment.local_code ||
                                                        '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {equipment.institution_name ||
                                                            '-'}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 dark:text-neutral-400">
                                                        {equipment.level || ''}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-neutral-300">
                                                    {equipment.description ||
                                                        '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-base">
                                                            {getBrandIcon(
                                                                equipment.brand,
                                                            )}
                                                        </span>
                                                        <div>
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {equipment.brand ||
                                                                    '-'}
                                                            </span>
                                                            <span className="block text-[10px] text-gray-500 dark:text-neutral-400">
                                                                {equipment.model ||
                                                                    '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-[11px] text-gray-600 dark:text-neutral-300">
                                                    {equipment.mac_address ||
                                                        '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${getStatusColor(equipment.status)}`}
                                                    >
                                                        {equipment.status ||
                                                            'OPERATIVO'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        {/* ✅ Botones de Editar y Eliminar (solo admin y super_admin) */}
                                                        {canManage && (
                                                            <>
                                                                <button
                                                                    onClick={() =>
                                                                        setEditingId(
                                                                            equipment.id,
                                                                        )
                                                                    }
                                                                    className="rounded-lg border border-blue-200 bg-blue-100 p-1.5 text-blue-700 transition-all hover:scale-110 hover:bg-blue-200 active:scale-95 dark:border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400 dark:hover:bg-blue-500/25"
                                                                    title="Editar"
                                                                >
                                                                    <Edit2 className="h-3.5 w-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        deleteEquipment(
                                                                            equipment.id,
                                                                            equipment.institution_name ||
                                                                                equipment.local_code,
                                                                        )
                                                                    }
                                                                    className="rounded-lg border border-rose-200 bg-rose-100 p-1.5 text-rose-700 transition-all hover:scale-110 hover:bg-rose-200 active:scale-95 dark:border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-400 dark:hover:bg-rose-500/25"
                                                                    title="Eliminar"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="py-16 text-center"
                                            >
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="rounded-full border border-gray-200 bg-gray-100 p-6 dark:border-white/10 dark:bg-white/5">
                                                        <Wifi className="h-16 w-16 text-gray-400 dark:text-neutral-600" />
                                                    </div>
                                                    <p className="text-[11px] font-medium text-gray-900 dark:text-white">
                                                        {isDirector &&
                                                        institutionCount === 0
                                                            ? 'No tienes instituciones asignadas'
                                                            : 'No se encontraron equipos'}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                                        {isDirector &&
                                                        institutionCount === 0
                                                            ? 'Contacta al administrador para que te asigne una institución.'
                                                            : 'Intenta cambiando los criterios de búsqueda o importa nuevos registros.'}
                                                    </p>
                                                    {isSuperAdmin && (
                                                        <Link
                                                            href="/equipos-red/importar"
                                                            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-[11px] font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/40 active:scale-95"
                                                        >
                                                            <Upload className="h-4 w-4" />
                                                            Importar equipos
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {equipments?.links && equipments.links.length > 3 && (
                            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                                <Pagination links={equipments.links} />
                            </div>
                        )}
                    </div>

                    {equipments?.total > 0 && (
                        <div className="text-center text-[11px] text-gray-500 dark:text-neutral-400">
                            Mostrando {equipments.data?.length || 0} de{' '}
                            {equipments.total} equipos
                            {equipments.last_page > 1 &&
                                ` · Página ${equipments.current_page} de ${equipments.last_page}`}
                        </div>
                    )}
                </div>
            </div>

            {/* ===== MODAL DE EDICIÓN ===== */}
            {editingId && (
                <EditEquipmentModal
                    equipmentId={editingId}
                    onClose={() => setEditingId(null)}
                />
            )}
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Equipos de Red', href: '#' },
    ],
};
