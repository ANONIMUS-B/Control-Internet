import { useState } from 'react';
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
    Trash2
} from 'lucide-react';
import { Pagination } from '@/components/Pagination';
import { dashboard } from '@/routes';
import EditEquipmentModal from '@/components/EditEquipmentModal';

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

export default function Index({ equipments, stats, filters, institutionCount = 0 }: Props) {
    const { props } = usePage();
    const user = props.auth?.user;
    const isSuperAdmin = user?.role === 'super_admin';
    const isAdmin = user?.role === 'admin';
    const isDirector = user?.role === 'director';
    
    // ✅ Pueden editar y eliminar: super_admin y admin
    const canManage = isSuperAdmin || isAdmin;
    
    const [search, setSearch] = useState<string>(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState<string>(filters.status || '');
    const [perPage, setPerPage] = useState<number>(filters.per_page || 15);
    const [showFilters, setShowFilters] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const applyFilters = () => {
        router.get('/equipos-red', {
            search: search,
            status: selectedStatus,
            per_page: perPage,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedStatus('');
        setPerPage(15);
        router.get('/equipos-red', { per_page: 15 }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExport = () => {
        router.get('/equipos-red/exportar', {}, {
            preserveScroll: true,
        });
    };

    // ✅ Eliminar equipo
    const deleteEquipment = (id: number, name: string) => {
        if (!confirm(`¿Estás seguro de eliminar el equipo "${name || id}"?`)) return;
        
        router.delete(`/equipos-red/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload();
            }
        });
    };

    const hasActiveFilters = search || selectedStatus;

    const inputClass = "w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 px-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-500";

    const getStatusColor = (status: string) => {
        if (status === 'OPERATIVO') {
            return 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400';
        }
        return 'border-rose-200 dark:border-rose-500/20 bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400';
    };

    const getBrandIcon = (brand: string) => {
        if (brand.toLowerCase().includes('tp-link')) return '🟢';
        if (brand.toLowerCase().includes('ubiquiti')) return '🔵';
        if (brand.toLowerCase().includes('starlink')) return '🛰️';
        if (brand.toLowerCase().includes('mikrotik')) return '🔴';
        return '📡';
    };

    return (
        <>
            <Head title="Equipos de Red" />

            <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                <div className="max-w-7xl mx-auto w-full space-y-4">

                    {/* ===== HEADER ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-xl border border-purple-200 dark:border-purple-500/20">
                                    <Wifi className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h1 className="text-[11px] font-bold text-gray-900 dark:text-white">
                                        Equipos de Red
                                    </h1>
                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                        Inventario de routers, antenas y equipos de conectividad
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isDirector && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-full border border-blue-200 dark:border-blue-500/20">
                                        <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                        <span className="text-[11px] text-blue-600 dark:text-blue-400">
                                            {institutionCount} institución(es) asignada(s)
                                        </span>
                                    </div>
                                )}
                                {isSuperAdmin && (
                                    <Link
                                        href="/equipos-red/importar"
                                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95"
                                    >
                                        <Upload className="w-4 h-4" />
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
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-medium transition-all border-2 ${
                                        showFilters || hasActiveFilters
                                            ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-400'
                                            : 'bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-gray-400 dark:hover:border-white/20'
                                    }`}
                                >
                                    <Filter className="w-4 h-4" />
                                    Filtros
                                    {hasActiveFilters && (
                                        <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ===== TARJETAS DE ESTADÍSTICAS ===== */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: 'Total Equipos', value: stats.total, icon: Server, bgColor: 'bg-purple-100 dark:bg-purple-500/20', iconColor: 'text-purple-600 dark:text-purple-400', borderColor: 'border-purple-200 dark:border-purple-500/20' },
                            { label: 'Equipos Operativos', value: stats.operative, icon: CheckCircle2, bgColor: 'bg-emerald-100 dark:bg-emerald-500/20', iconColor: 'text-emerald-600 dark:text-emerald-400', borderColor: 'border-emerald-200 dark:border-emerald-500/20' },
                            { label: 'Marcas Registradas', value: stats.by_brand?.length || 0, icon: Package, bgColor: 'bg-indigo-100 dark:bg-indigo-500/20', iconColor: 'text-indigo-600 dark:text-indigo-400', borderColor: 'border-indigo-200 dark:border-indigo-500/20' }
                        ].map((stat, index) => (
                            <div key={index} className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-2xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] font-medium text-gray-500 dark:text-neutral-400">{stat.label}</p>
                                        <p className="text-[11px] font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                    </div>
                                    <div className={`${stat.bgColor} p-2.5 rounded-xl border ${stat.borderColor}`}>
                                        <stat.icon className={`${stat.iconColor} w-4 h-4`} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ===== MENSAJE PARA DIRECTOR SIN INSTITUCIONES ===== */}
                    {isDirector && institutionCount === 0 && (
                        <div className="p-6 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800 rounded-2xl text-center">
                            <div className="flex flex-col items-center gap-3">
                                <Building2 className="w-12 h-12 text-amber-500" />
                                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                    No tienes instituciones asignadas
                                </p>
                                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                                    Contacta al administrador para que te asigne una institución educativa.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ===== FILTROS ===== */}
                    {showFilters && (
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm dark:shadow-2xl animate-in slide-in-from-top duration-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-800 dark:text-slate-200">
                                    <Filter className="w-3.5 h-3.5 text-purple-600" />
                                    Filtros de Búsqueda
                                </h3>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-[11px] text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Limpiar filtros
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                <div className="col-span-2 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Buscar institución, código, marca, MAC..."
                                        className={`${inputClass} pl-9`}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">Todos los estados</option>
                                    <option value="OPERATIVO">OPERATIVO</option>
                                    <option value="INOPERATIVO">INOPERATIVO</option>
                                    <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                                </select>

                                <select
                                    value={perPage}
                                    onChange={(e) => setPerPage(Number(e.target.value))}
                                    className={inputClass}
                                >
                                    <option value={10}>10 por pág.</option>
                                    <option value={15}>15 por pág.</option>
                                    <option value={25}>25 por pág.</option>
                                    <option value={50}>50 por pág.</option>
                                </select>

                                <button
                                    onClick={applyFilters}
                                    className="col-span-2 md:col-span-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 active:scale-95"
                                >
                                    <Search className="w-4 h-4" />
                                    Aplicar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== TABLA DE EQUIPOS ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px]">
                                <thead className="bg-gray-50 dark:bg-white/5">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-[11px]">Cód. Local</th>
                                        <th className="px-4 py-3 font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-[11px]">Institución</th>
                                        <th className="px-4 py-3 font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-[11px]">Descripción</th>
                                        <th className="px-4 py-3 font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-[11px]">Marca / Modelo</th>
                                        <th className="px-4 py-3 font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-[11px]">MAC</th>
                                        <th className="px-4 py-3 font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-[11px]">Estado</th>
                                        <th className="px-4 py-3 font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-[11px]">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                    {equipments?.data && equipments.data.length > 0 ? (
                                        equipments.data.map((equipment) => (
                                            <tr key={equipment.id} className="hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                                                <td className="px-4 py-3 font-mono text-[11px] font-medium text-gray-900 dark:text-white">
                                                    {equipment.local_code || '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {equipment.institution_name || '-'}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 dark:text-neutral-400">
                                                        {equipment.level || ''}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-neutral-300">
                                                    {equipment.description || '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-base">{getBrandIcon(equipment.brand)}</span>
                                                        <div>
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {equipment.brand || '-'}
                                                            </span>
                                                            <span className="text-gray-500 dark:text-neutral-400 text-[10px] block">
                                                                {equipment.model || '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-[11px] text-gray-600 dark:text-neutral-300">
                                                    {equipment.mac_address || '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${getStatusColor(equipment.status)}`}>
                                                        {equipment.status || 'OPERATIVO'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        {/* ✅ Botones de Editar y Eliminar (solo admin y super_admin) */}
                                                        {canManage && (
                                                            <>
                                                                <button
                                                                    onClick={() => setEditingId(equipment.id)}
                                                                    className="p-1.5 bg-blue-100 dark:bg-blue-500/15 hover:bg-blue-200 dark:hover:bg-blue-500/25 text-blue-700 dark:text-blue-400 rounded-lg transition-all border border-blue-200 dark:border-blue-500/20 hover:scale-110 active:scale-95"
                                                                    title="Editar"
                                                                >
                                                                    <Edit2 className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteEquipment(equipment.id, equipment.institution_name || equipment.local_code)}
                                                                    className="p-1.5 bg-rose-100 dark:bg-rose-500/15 hover:bg-rose-200 dark:hover:bg-rose-500/25 text-rose-700 dark:text-rose-400 rounded-lg transition-all border border-rose-200 dark:border-rose-500/20 hover:scale-110 active:scale-95"
                                                                    title="Eliminar"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="p-6 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10">
                                                        <Wifi className="w-16 h-16 text-gray-400 dark:text-neutral-600" />
                                                    </div>
                                                    <p className="text-[11px] font-medium text-gray-900 dark:text-white">
                                                        {isDirector && institutionCount === 0 
                                                            ? 'No tienes instituciones asignadas' 
                                                            : 'No se encontraron equipos'}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                                        {isDirector && institutionCount === 0 
                                                            ? 'Contacta al administrador para que te asigne una institución.' 
                                                            : 'Intenta cambiando los criterios de búsqueda o importa nuevos registros.'}
                                                    </p>
                                                    {isSuperAdmin && (
                                                        <Link
                                                            href="/equipos-red/importar"
                                                            className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95"
                                                        >
                                                            <Upload className="w-4 h-4" />
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
                            <div className="border-t border-gray-200 dark:border-white/10 px-4 py-3 bg-gray-50 dark:bg-white/5">
                                <Pagination links={equipments.links} />
                            </div>
                        )}
                    </div>

                    {equipments?.total > 0 && (
                        <div className="text-center text-[11px] text-gray-500 dark:text-neutral-400">
                            Mostrando {equipments.data?.length || 0} de {equipments.total} equipos
                            {equipments.last_page > 1 && ` · Página ${equipments.current_page} de ${equipments.last_page}`}
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
        { title: 'Equipos de Red', href: '#' }
    ],
};