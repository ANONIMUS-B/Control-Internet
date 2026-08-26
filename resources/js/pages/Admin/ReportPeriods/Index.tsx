import { useState, useMemo } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { 
    CalendarDays, 
    Plus, 
    Edit2, 
    Trash2, 
    CheckCircle2, 
    XCircle, 
    AlertCircle,
    Search,
    Filter,
    X,
    Clock,
    RefreshCw,
    Settings2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { dashboard } from '@/routes';

interface Period {
    id: number;
    month: number;
    year: number;
    month_name: string;
    start_date: string;
    end_date: string;
    date_range: string;
    is_active: boolean;
    message: string | null;
    created_by: number;
    updated_by: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    periods: Period[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Index({ periods = [], flash }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [successMessage, setSuccessMessage] = useState<string | null>(flash?.success || null);
    const [errorMessage, setErrorMessage] = useState<string | null>(flash?.error || null);

    const periodsArray = Array.isArray(periods) ? periods : [];

    const stats = useMemo(() => {
        const data = periodsArray;
        return {
            total: data.length,
            active: data.filter(p => p?.is_active === true).length,
            inactive: data.filter(p => p?.is_active === false).length,
        };
    }, [periodsArray]);

    const filteredPeriods = useMemo(() => {
        return periodsArray.filter(period => {
            if (!period) return false;
            
            const monthName = period.month_name || '';
            const yearStr = period.year?.toString() || '';
            const dateRange = period.date_range || '';
            const searchLower = searchTerm.toLowerCase();
            
            const matchesSearch = 
                monthName.toLowerCase().includes(searchLower) ||
                yearStr.includes(searchLower) ||
                dateRange.includes(searchLower);
                
            const matchesFilter = filterActive === 'all' || 
                                 (filterActive === 'active' && period.is_active === true) ||
                                 (filterActive === 'inactive' && period.is_active === false);
            
            return matchesSearch && matchesFilter;
        });
    }, [periodsArray, searchTerm, filterActive]);

    const totalPages = Math.ceil(filteredPeriods.length / itemsPerPage);
    const paginatedPeriods = filteredPeriods.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getMonthColor = (month: number) => {
        const colors = [
            'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/25',
            'bg-pink-100 dark:bg-pink-500/15 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-500/25',
            'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/25',
            'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/25',
            'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/25',
            'bg-cyan-100 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/25',
            'bg-teal-100 dark:bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/25',
            'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25',
            'bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/25',
            'bg-lime-100 dark:bg-lime-500/15 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-500/25',
            'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25',
            'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/25',
        ];
        return colors[month - 1] || colors[0];
    };

    const deletePeriod = (id: number, monthName: string, year: number) => {
        if (!confirm(`¿Eliminar período de ${monthName} ${year}?`)) return;
        
        router.delete(`/admin/report-periods/${id}`, {
            preserveScroll: true,
            onSuccess: () => router.reload()
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterActive('all');
        setCurrentPage(1);
    };

    const formatDateShort = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    };

    return (
        <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
            <Head title="Períodos de Envío" />

            <div className="max-w-7xl mx-auto w-full space-y-4">

                {/* ===== HEADER ===== */}
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-xl border border-purple-200 dark:border-purple-500/20">
                                <CalendarDays className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h1 className="text-[11px] font-bold text-gray-900 dark:text-white">
                                    Períodos de Envío
                                </h1>
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400 flex items-center gap-1">
                                    <Settings2 className="w-3.5 h-3.5" />
                                    Configuración avanzada por mes
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/admin/report-periods/create"
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            Nuevo
                        </Link>
                    </div>
                </div>

                {/* ===== TARJETAS DE ESTADÍSTICAS ===== */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total', value: stats.total, icon: CalendarDays, bgColor: 'bg-purple-100 dark:bg-purple-500/20', iconColor: 'text-purple-600 dark:text-purple-400', borderColor: 'border-purple-200 dark:border-purple-500/20' },
                        { label: 'Activos', value: stats.active, icon: CheckCircle2, bgColor: 'bg-emerald-100 dark:bg-emerald-500/20', iconColor: 'text-emerald-600 dark:text-emerald-400', borderColor: 'border-emerald-200 dark:border-emerald-500/20' },
                        { label: 'Inactivos', value: stats.inactive, icon: XCircle, bgColor: 'bg-rose-100 dark:bg-rose-500/20', iconColor: 'text-rose-600 dark:text-rose-400', borderColor: 'border-rose-200 dark:border-rose-500/20' }
                    ].map((stat, index) => (
                        <div key={index} className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">{stat.label}</p>
                                    <p className="text-[11px] font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                </div>
                                <div className={`${stat.bgColor} p-2 rounded-xl border ${stat.borderColor}`}>
                                    <stat.icon className={`${stat.iconColor} w-4 h-4`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ===== MENSAJES ===== */}
                {successMessage && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-[11px] animate-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <p className="font-medium text-emerald-700 dark:text-emerald-400">{successMessage}</p>
                        <button onClick={() => setSuccessMessage(null)} className="ml-auto hover:bg-emerald-100 dark:hover:bg-emerald-800/50 p-1 rounded-lg transition-colors">
                            <X className="w-3.5 h-3.5 text-emerald-500" />
                        </button>
                    </div>
                )}

                {errorMessage && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2 text-[11px] animate-in">
                        <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        <p className="font-medium text-rose-700 dark:text-rose-400">{errorMessage}</p>
                        <button onClick={() => setErrorMessage(null)} className="ml-auto hover:bg-rose-100 dark:hover:bg-rose-800/50 p-1 rounded-lg transition-colors">
                            <X className="w-3.5 h-3.5 text-rose-500" />
                        </button>
                    </div>
                )}

                {/* ===== FILTROS ===== */}
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm dark:shadow-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex-1 min-w-[140px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 pl-9 pr-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-500"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                        </div>

                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl px-3 py-2 border border-gray-200 dark:border-white/10 transition-all focus-within:border-blue-500/50">
                            <Filter className="text-gray-400 dark:text-neutral-400 w-4 h-4" />
                            <select 
                                value={filterActive} 
                                onChange={(e) => { setFilterActive(e.target.value); setCurrentPage(1); }}
                                className="bg-transparent border-0 text-[11px] focus:ring-0 min-w-[80px] text-gray-900 dark:text-white [&>option]:bg-white dark:[&>option]:bg-slate-800 outline-none"
                            >
                                <option value="all">Todos</option>
                                <option value="active">Activos</option>
                                <option value="inactive">Inactivos</option>
                            </select>
                        </div>

                        {(searchTerm || filterActive !== 'all') && (
                            <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-neutral-300 rounded-xl text-[11px] font-medium transition-all border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20">
                                <RefreshCw className="w-4 h-4" />
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>

                {/* ===== TABLA ===== */}
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px]">
                            <thead className="bg-gray-50 dark:bg-white/5">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-[11px]">Mes / Año</th>
                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-[11px]">Período</th>
                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-[11px]">Estado</th>
                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-[11px]">Mensaje</th>
                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-[11px] text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                {paginatedPeriods.length > 0 ? (
                                    paginatedPeriods.map((period) => (
                                        <tr key={period.id} className="hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl text-[11px] font-bold border ${getMonthColor(period.month)}`}>
                                                        {period.month}
                                                    </span>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white text-[11px]">
                                                            {period.month_name}
                                                        </div>
                                                        <div className="text-[11px] text-gray-500 dark:text-neutral-400">
                                                            {period.year}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500" />
                                                    <span className="text-[11px] text-gray-700 dark:text-neutral-300">
                                                        {formatDateShort(period.start_date)} - {formatDateShort(period.end_date)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                                                    period.is_active 
                                                        ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25' 
                                                        : 'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/25'
                                                }`}>
                                                    {period.is_active ? (
                                                        <><CheckCircle2 className="w-3 h-3" /> Activo</>
                                                    ) : (
                                                        <><XCircle className="w-3 h-3" /> Inactivo</>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-[11px] text-gray-500 dark:text-neutral-400 line-clamp-1 max-w-[180px] block">
                                                    {period.message || (
                                                        <span className="text-gray-400 dark:text-neutral-500 italic">Sin mensaje</span>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Link
                                                        href={`/admin/report-periods/${period.id}/edit`}
                                                        className="p-2 bg-blue-100 dark:bg-blue-500/15 hover:bg-blue-200 dark:hover:bg-blue-500/25 text-blue-700 dark:text-blue-400 rounded-xl transition-all border border-blue-200 dark:border-blue-500/20 hover:scale-110 active:scale-95"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => deletePeriod(period.id, period.month_name, period.year)}
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
                                        <td colSpan={5} className="py-16 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="p-6 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10">
                                                    <CalendarDays className="w-16 h-16 text-gray-400 dark:text-neutral-600" />
                                                </div>
                                                <p className="text-[11px] font-medium text-gray-900 dark:text-white">No hay períodos configurados</p>
                                                <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                                    {searchTerm || filterActive !== 'all' 
                                                        ? 'No se encontraron períodos con los filtros aplicados'
                                                        : 'Comienza creando tu primer período de envío'
                                                    }
                                                </p>
                                                {!searchTerm && filterActive === 'all' && (
                                                    <Link
                                                        href="/admin/report-periods/create"
                                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95 mt-2"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Crear primer período
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ===== PAGINACIÓN ===== */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10">
                            <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                                {filteredPeriods.length} períodos
                            </span>
                            <div className="flex items-center gap-0.5">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                                                currentPage === pageNum
                                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                                                    : 'hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-neutral-400'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ===== FOOTER ===== */}
                {filteredPeriods.length > 0 && (
                    <div className="text-center text-[11px] text-gray-500 dark:text-neutral-400">
                        Mostrando {paginatedPeriods.length} de {filteredPeriods.length} períodos
                        {filteredPeriods.length !== periodsArray.length && ` (${periodsArray.length} total)`}
                    </div>
                )}
            </div>
        </div>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Períodos de Envío', href: '#' }
    ],
};