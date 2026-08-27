import { useState, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { 
    Plus, FileText, CheckCircle2, Clock, FileDown, 
    CalendarDays, AlertCircle, 
    Pencil,
    Search, X, Building2, Filter,
    Package,
    TrendingUp,
    TrendingDown,
    Minus,
    Layers,
    Zap,
    Shield,
    Eye,
    MoreHorizontal,
    CheckCircle,
    EyeOff
} from 'lucide-react';
import { Pagination } from '@/components/Pagination';

interface Report {
    id: number;
    month: number;
    year: number;
    office_number: string | null;
    status: 'pending' | 'observed' | 'approved' | 'rejected';
    service_state: 'operative' | 'intermittent' | 'no_service';
    created_at: string;
    admin_comments?: string | null;
    institution?: { 
        id: number;
        name: string;
        modular_code: string;
    };
    user?: {
        id: number;
        name: string;
    };
}

interface Filters {
    month?: string;
    year?: string;
    status?: string;
    institution_id?: string;
    per_page?: number;
}

interface IndexProps {
    reports: {
        data: Report[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
    filters: Filters;
    institutions: Array<{ id: number; name: string; modular_code: string }>;
    months: Record<number, string>;
    statuses: Record<string, string>;
    currentYear: number;
}

export default function Index({ 
    reports, 
    filters, 
    institutions, 
    months, 
    statuses,
    currentYear 
}: IndexProps) {
    // ✅ Obtener el usuario desde usePage
    const { props } = usePage();
    const user = props.auth?.user;
    const userRole = user?.role || 'director';
    
    // ✅ Pueden aprobar/observar: super_admin, admin, specialist
    const canModerate = ['super_admin', 'admin', 'specialist'].includes(userRole);
    
    const [selectedMonth, setSelectedMonth] = useState<string>(filters.month || '');
    const [selectedYear, setSelectedYear] = useState<string>(filters.year || String(currentYear));
    const [selectedStatus, setSelectedStatus] = useState<string>(filters.status || '');
    const [selectedInstitution, setSelectedInstitution] = useState<string>(filters.institution_id || '');
    const [perPage, setPerPage] = useState<number>(filters.per_page || 10);
    const [showFilters, setShowFilters] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [comment, setComment] = useState('');
    const [reportToObserve, setReportToObserve] = useState<number | null>(null);

    const applyFilters = () => {
        router.get('/reportes', {
            month: selectedMonth,
            year: selectedYear,
            status: selectedStatus,
            institution_id: selectedInstitution,
            per_page: perPage,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSelectedMonth('');
        setSelectedYear(String(currentYear));
        setSelectedStatus('');
        setSelectedInstitution('');
        setPerPage(10);
        
        router.get('/reportes', {
            per_page: 10,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // ✅ Funciones para aprobar y observar
    const handleApprove = (id: number) => {
        if (!confirm('¿Estás seguro de aprobar este reporte?')) return;
        
        router.post(`/reportes/${id}/aprobar`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload();
            }
        });
    };

    const handleObserve = () => {
        if (!reportToObserve || !comment.trim()) return;

        router.post(`/reportes/${reportToObserve}/observar`, { 
            admin_comments: comment 
        }, { 
            preserveScroll: true,
            onSuccess: () => {
                setReportToObserve(null);
                setComment('');
                router.reload();
            }
        });
    };

    const stats = useMemo(() => {
        const data = reports?.data || [];
        return {
            total: reports?.total || data.length,
            pending: data.filter(r => r.status === 'pending').length,
            approved: data.filter(r => r.status === 'approved').length,
            observed: data.filter(r => r.status === 'observed').length,
            rejected: data.filter(r => r.status === 'rejected').length,
            approvalRate: reports?.total > 0 
                ? Math.round((data.filter(r => r.status === 'approved').length / reports.total) * 100)
                : 0
        };
    }, [reports]);

    const hasActiveFilters = selectedMonth || selectedStatus || selectedInstitution;

    const statusColors: Record<string, string> = {
        approved: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25',
        observed: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25',
        pending: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/25',
        rejected: 'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/25',
    };

    const statusIcons: Record<string, any> = {
        approved: CheckCircle2,
        observed: AlertCircle,
        pending: Clock,
        rejected: FileText,
    };

    const serviceStateColors: Record<string, string> = {
        operative: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
        intermittent: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
        no_service: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
    };

    const serviceStateLabels: Record<string, string> = {
        operative: 'Operativo',
        intermittent: 'Intermitente',
        no_service: 'Sin Servicio',
    };

    const getInstitutionName = (report: Report) => {
        return report?.institution?.name || 'Sin IE';
    };

    const getModularCode = (report: Report) => {
        return report?.institution?.modular_code || '';
    };

    const getMonthName = (report: Report) => {
        return months[report?.month] || report?.month || '---';
    };

    const getYear = (report: Report) => {
        return report?.year || '---';
    };

    const getOfficeNumber = (report: Report) => {
        return report?.office_number || 'Sin asignar';
    };

    const trend = stats.total > 0 ? (
        stats.approved / stats.total > 0.5 
            ? { icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', label: 'Alta aprobación', border: 'border-emerald-200 dark:border-emerald-500/20' }
            : { icon: TrendingDown, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', label: 'Baja aprobación', border: 'border-amber-200 dark:border-amber-500/20' }
    ) : { icon: Minus, color: 'text-neutral-500', bg: 'bg-neutral-100 dark:bg-neutral-500/10', label: 'Sin datos', border: 'border-neutral-200 dark:border-neutral-500/20' };

    const TrendIcon = trend.icon;

    const statCards = [
        { 
            id: 'total',
            label: 'Total Reportes', 
            value: stats.total, 
            icon: FileText, 
            gradient: 'from-blue-500 to-indigo-500',
            iconBg: 'bg-blue-100 dark:bg-blue-500/20',
            iconColor: 'text-blue-600 dark:text-blue-400',
            borderColor: 'border-blue-200 dark:border-blue-500/20',
            badge: 'Total'
        },
        { 
            id: 'pending',
            label: 'Pendientes', 
            value: stats.pending, 
            icon: Clock, 
            gradient: 'from-amber-500 to-orange-500',
            iconBg: 'bg-amber-100 dark:bg-amber-500/20',
            iconColor: 'text-amber-600 dark:text-amber-400',
            borderColor: 'border-amber-200 dark:border-amber-500/20',
            badge: 'Pendiente'
        },
        { 
            id: 'approved',
            label: 'Aprobados', 
            value: stats.approved, 
            icon: CheckCircle2, 
            gradient: 'from-emerald-500 to-teal-500',
            iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            borderColor: 'border-emerald-200 dark:border-emerald-500/20',
            badge: 'Aprobado'
        },
        { 
            id: 'observed',
            label: 'Observados', 
            value: stats.observed, 
            icon: AlertCircle, 
            gradient: 'from-rose-500 to-pink-500',
            iconBg: 'bg-rose-100 dark:bg-rose-500/20',
            iconColor: 'text-rose-600 dark:text-rose-400',
            borderColor: 'border-rose-200 dark:border-rose-500/20',
            badge: 'Observado'
        }
    ];

    return (
        <>
            <Head title="Gestión de Conformidades" />
            
            <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
                    
                    {/* ===== HEADER ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl border border-blue-200 dark:border-blue-500/20">
                                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h1 className="text-[11px] font-bold text-gray-900 dark:text-white tracking-tight">
                                        Gestión de Conformidades
                                    </h1>
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 rounded-full text-[11px] text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20">
                                        {reports.total} total
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400 ml-12">
                                    Administra y da seguimiento a los reportes mensuales
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="group relative flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-neutral-300 rounded-xl text-[11px] font-medium transition-all border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                                >
                                    <Filter className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                    <span className="hidden sm:inline">Filtros</span>
                                    {hasActiveFilters && (
                                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse ring-2 ring-blue-500/20"></span>
                                    )}
                                </button>
                                
                                <Link 
                                    href="/reportes/exportar-lote" 
                                    className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 active:scale-95"
                                >
                                    <Package className="w-4 h-4" /> 
                                    <span className="hidden sm:inline">Exportar Lote</span>
                                </Link>
                                
                                <Link 
                                    href="/reportes/nuevo" 
                                    className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95"
                                >
                                    <Plus className="w-4 h-4" /> 
                                    <span className="hidden sm:inline">Nuevo Reporte</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* ===== TARJETAS DE ESTADÍSTICAS ===== */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {statCards.map((stat) => {
                            const Icon = stat.icon;
                            const percentage = stats.total > 0 ? (stat.value / stats.total) * 100 : 0;
                            
                            return (
                                <div 
                                    key={stat.id}
                                    className="group relative bg-white dark:bg-slate-800/50 rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300 hover:shadow-lg dark:hover:shadow-2xl hover:-translate-y-0.5"
                                    onMouseEnter={() => setHoveredCard(stat.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    <div className="relative flex items-start justify-between">
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-medium text-gray-500 dark:text-neutral-400">{stat.label}</p>
                                            <p className="text-[11px] font-bold text-gray-900 dark:text-white">
                                                {stat.value}
                                            </p>
                                        </div>
                                        
                                        <div className={`p-2.5 rounded-xl ${stat.iconBg} border ${stat.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className={`${stat.iconColor} w-4 h-4 md:w-5 md:h-5`} />
                                        </div>
                                    </div>
                                    
                                    <div className="relative mt-3 h-1.5 w-full bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-1000 ease-out`}
                                            style={{ 
                                                width: hoveredCard === stat.id ? `${Math.min(percentage + 20, 100)}%` : `${percentage}%` 
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ===== TENDENCIA Y RESUMEN ===== */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                        <div className="md:col-span-2 bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-gray-200 dark:border-white/10">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${trend.bg} border ${trend.border}`}>
                                        <TrendIcon className={`w-4 h-4 ${trend.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-medium text-gray-500 dark:text-neutral-400">Tasa de aprobación</p>
                                        <p className="text-[11px] font-bold text-gray-900 dark:text-white">
                                            {stats.approvalRate}% 
                                            <span className="ml-2 text-[11px] text-gray-500 dark:text-neutral-400 font-normal">
                                                ({trend.label})
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 w-full sm:w-auto justify-around sm:justify-end">
                                    <div className="text-center">
                                        <p className="text-[11px] text-gray-500 dark:text-neutral-400">Aprobados</p>
                                        <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{stats.approved}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[11px] text-gray-500 dark:text-neutral-400">Pendientes</p>
                                        <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[11px] text-gray-500 dark:text-neutral-400">Observados</p>
                                        <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">{stats.observed}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-gray-200 dark:border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl border border-indigo-200 dark:border-indigo-500/20">
                                    <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium text-gray-500 dark:text-neutral-400">Estado general</p>
                                    <p className="text-[11px] font-bold text-gray-900 dark:text-white">
                                        {stats.approvalRate > 70 ? 'Excelente' : 
                                         stats.approvalRate > 40 ? 'Regular' : 'Crítico'}
                                    </p>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[11px] font-medium ${
                                stats.approvalRate > 70 ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' :
                                stats.approvalRate > 40 ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' :
                                'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                            }`}>
                                {stats.approvalRate > 70 ? '✅ Estable' : 
                                 stats.approvalRate > 40 ? '⚠️ Atención' : '🚨 Urgente'}
                            </div>
                        </div>
                    </div>

                    {/* ===== FILTROS COLAPSABLES ===== */}
                    {showFilters && (
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-2xl animate-in slide-in-from-top duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-700 dark:text-neutral-300 flex items-center gap-2 text-[11px]">
                                    <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-lg border border-blue-200 dark:border-blue-500/20">
                                        <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    Filtros avanzados
                                </h3>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-[11px] text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10 px-3 py-1.5 rounded-xl"
                                    >
                                        <X className="w-3 h-3" />
                                        Limpiar filtros
                                    </button>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl px-3 py-2.5 border border-gray-200 dark:border-white/10 transition-all focus-within:border-blue-500/50 focus-within:shadow-lg focus-within:shadow-blue-500/10">
                                    <CalendarDays className="text-gray-400 dark:text-neutral-400 w-4 h-4" />
                                    <select 
                                        value={selectedMonth} 
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="bg-transparent border-0 text-[11px] focus:ring-0 capitalize w-full text-gray-900 dark:text-white [&>option]:bg-white dark:[&>option]:bg-slate-800 outline-none"
                                    >
                                        <option value="">Todos los meses</option>
                                        {Object.entries(months).map(([key, value]) => (
                                            <option key={key} value={key}>{value}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl px-3 py-2.5 border border-gray-200 dark:border-white/10 transition-all focus-within:border-blue-500/50 focus-within:shadow-lg focus-within:shadow-blue-500/10">
                                    <input 
                                        type="number" 
                                        value={selectedYear} 
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="bg-transparent border-0 text-[11px] w-full focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 outline-none"
                                        placeholder="Año"
                                    />
                                </div>

                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl px-3 py-2.5 border border-gray-200 dark:border-white/10 transition-all focus-within:border-blue-500/50 focus-within:shadow-lg focus-within:shadow-blue-500/10">
                                    <Filter className="text-gray-400 dark:text-neutral-400 w-4 h-4" />
                                    <select 
                                        value={selectedStatus} 
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="bg-transparent border-0 text-[11px] focus:ring-0 w-full text-gray-900 dark:text-white [&>option]:bg-white dark:[&>option]:bg-slate-800 outline-none"
                                    >
                                        <option value="">Todos los estados</option>
                                        {Object.entries(statuses).map(([key, value]) => (
                                            <option key={key} value={key}>{value}</option>
                                        ))}
                                    </select>
                                </div>

                                {institutions && institutions.length > 0 && (
                                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl px-3 py-2.5 border border-gray-200 dark:border-white/10 transition-all focus-within:border-blue-500/50 focus-within:shadow-lg focus-within:shadow-blue-500/10">
                                        <Building2 className="text-gray-400 dark:text-neutral-400 w-4 h-4" />
                                        <select 
                                            value={selectedInstitution} 
                                            onChange={(e) => setSelectedInstitution(e.target.value)}
                                            className="bg-transparent border-0 text-[11px] focus:ring-0 w-full truncate text-gray-900 dark:text-white [&>option]:bg-white dark:[&>option]:bg-slate-800 outline-none"
                                        >
                                            <option value="">Todas las IE</option>
                                            {institutions.map((inst) => (
                                                <option key={inst.id} value={String(inst.id)}>
                                                    {inst.name} ({inst.modular_code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl px-3 py-2.5 border border-gray-200 dark:border-white/10 transition-all">
                                    <span className="text-[11px] text-gray-500 dark:text-neutral-400">Mostrar:</span>
                                    <select 
                                        value={perPage} 
                                        onChange={(e) => setPerPage(Number(e.target.value))}
                                        className="bg-transparent border-0 text-[11px] focus:ring-0 w-full text-gray-900 dark:text-white [&>option]:bg-white dark:[&>option]:bg-slate-800 outline-none"
                                    >
                                        <option value={10}>10</option>
                                        <option value={15}>15</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>

                                <button
                                    onClick={applyFilters}
                                    className="col-span-1 sm:col-span-2 lg:col-span-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95"
                                >
                                    <Search className="w-4 h-4 inline mr-1" />
                                    Aplicar filtros
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== TABLA ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px]">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                                        <th className="px-4 md:px-6 py-3 text-[11px] font-semibold text-gray-600 dark:text-neutral-400 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-3.5 h-3.5" />
                                                Institución / Período
                                            </div>
                                        </th>
                                        <th className="px-4 md:px-6 py-3 text-[11px] font-semibold text-gray-600 dark:text-neutral-400 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-3.5 h-3.5" />
                                                N° Oficio
                                            </div>
                                        </th>
                                        <th className="px-4 md:px-6 py-3 text-[11px] font-semibold text-gray-600 dark:text-neutral-400 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-3.5 h-3.5" />
                                                Estado
                                            </div>
                                        </th>
                                        <th className="px-4 md:px-6 py-3 text-[11px] font-semibold text-gray-600 dark:text-neutral-400 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-3.5 h-3.5" />
                                                Servicio
                                            </div>
                                        </th>
                                        <th className="px-4 md:px-6 py-3 text-[11px] font-semibold text-gray-600 dark:text-neutral-400 uppercase tracking-wider text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Eye className="w-3.5 h-3.5" />
                                                Acciones
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                    {reports?.data && reports.data.length > 0 ? (
                                        reports.data.map((report, index) => {
                                            const StatusIcon = statusIcons[report.status] || FileText;
                                            const statusColor = statusColors[report.status] || 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-neutral-400 border-gray-200 dark:border-white/10';
                                            const serviceClass = serviceStateColors[report.service_state] || 'text-neutral-600 dark:text-neutral-400';
                                            const serviceLabel = serviceStateLabels[report.service_state] || report.service_state;
                                            
                                            return (
                                                <tr 
                                                    key={report.id} 
                                                    className={`group hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-300 ${
                                                        index % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-gray-50/50 dark:bg-white/5'
                                                    }`}
                                                >
                                                    <td className="px-4 md:px-6 py-3 md:py-4">
                                                        <div className="font-medium text-gray-900 dark:text-white flex flex-wrap items-center gap-2">
                                                            {getInstitutionName(report)}
                                                            {getModularCode(report) && (
                                                                <span className="text-[11px] text-gray-500 dark:text-neutral-400 font-normal bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full border border-gray-200 dark:border-white/10">
                                                                    {getModularCode(report)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[11px] text-gray-500 dark:text-neutral-400 flex flex-wrap items-center gap-1.5 mt-0.5">
                                                            <CalendarDays className="w-3 h-3" />
                                                            {getMonthName(report)} {getYear(report)}
                                                            <span className="w-1 h-1 bg-gray-300 dark:bg-neutral-600 rounded-full"></span>
                                                            <span className="text-gray-400 dark:text-neutral-500">
                                                                Creado: {new Date(report.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 md:px-6 py-3 md:py-4">
                                                        <span className="text-[11px] font-mono text-gray-700 dark:text-neutral-300 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-lg border border-gray-200 dark:border-white/10">
                                                            {getOfficeNumber(report)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 md:px-6 py-3 md:py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border ${statusColor}`}>
                                                                <StatusIcon className="w-3 h-3" /> 
                                                                {statuses[report.status] || report.status || 'Desconocido'}
                                                            </span>
                                                            {report.status === 'observed' && report.admin_comments && (
                                                                <div className="group relative">
                                                                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 cursor-help hover:scale-110 transition-transform" />
                                                                    <div className="absolute left-0 mt-2 w-64 p-3 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-[11px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-2xl">
                                                                        <div className="flex items-start gap-2">
                                                                            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                                                            <span>{report.admin_comments}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 md:px-6 py-3 md:py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border ${serviceClass}`}>
                                                            {serviceLabel}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                            {/* ✅ Botones de aprobar/observar para moderadores */}
                                                            {canModerate && report.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleApprove(report.id)}
                                                                        className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 transition-all border border-emerald-200 dark:border-emerald-500/20 hover:scale-110 active:scale-95"
                                                                        title="Aprobar"
                                                                    >
                                                                        <CheckCircle2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setReportToObserve(report.id)}
                                                                        className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/10 hover:bg-amber-200 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 transition-all border border-amber-200 dark:border-amber-500/20 hover:scale-110 active:scale-95"
                                                                        title="Observar"
                                                                    >
                                                                        <AlertCircle className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {canModerate && report.status === 'observed' && (
                                                                <button
                                                                    onClick={() => handleApprove(report.id)}
                                                                    className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 transition-all border border-emerald-200 dark:border-emerald-500/20 hover:scale-110 active:scale-95"
                                                                    title="Aprobar después de corrección"
                                                                >
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            {report.status === 'observed' && (
                                                                <Link 
                                                                    href={`/reportes/${report.id}/editar`} 
                                                                    className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/10 hover:bg-amber-200 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 transition-all border border-amber-200 dark:border-amber-500/20 hover:scale-110 active:scale-95" 
                                                                    title="Corregir reporte"
                                                                >
                                                                    <Pencil className="w-4 h-4" />
                                                                </Link>
                                                            )}
                                                            <a 
                                                                href={`/reportes/${report.id}/pdf`} 
                                                                target="_blank" 
                                                                className="p-2 rounded-xl bg-rose-100 dark:bg-rose-500/10 hover:bg-rose-200 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 transition-all border border-rose-200 dark:border-rose-500/20 hover:scale-110 active:scale-95" 
                                                                title="Descargar PDF"
                                                            >
                                                                <FileDown className="w-4 h-4" />
                                                            </a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="p-6 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10">
                                                        <FileText className="w-16 h-16 text-gray-400 dark:text-neutral-600" />
                                                    </div>
                                                    <p className="text-[11px] font-medium text-gray-900 dark:text-white">No hay registros</p>
                                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 max-w-sm">
                                                        No se encontraron reportes con los filtros seleccionados.
                                                        <br />
                                                        <span className="text-gray-400 dark:text-neutral-500">Intenta ajustar los filtros o crea un nuevo reporte.</span>
                                                    </p>
                                                    <Link 
                                                        href="/reportes/nuevo" 
                                                        className="mt-2 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Crear primer reporte
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {reports?.links && reports.links.length > 3 && (
                            <div className="border-t border-gray-200 dark:border-white/10 px-4 py-3 bg-gray-50 dark:bg-white/5">
                                <Pagination links={reports.links} />
                            </div>
                        )}
                    </div>

                    {/* ===== FOOTER ===== */}
                    {reports?.total > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 dark:text-neutral-400 bg-white dark:bg-slate-800/50 rounded-2xl px-4 md:px-6 py-3 border border-gray-200 dark:border-white/10 gap-2">
                            <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-gray-400 dark:text-neutral-500" />
                                <span>
                                    Mostrando <span className="text-gray-900 dark:text-white font-medium">{reports.data?.length || 0}</span> de{' '}
                                    <span className="text-gray-900 dark:text-white font-medium">{reports.total}</span> reportes
                                </span>
                            </div>
                            {reports.last_page > 1 && (
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-400 dark:text-neutral-500">Página</span>
                                    <span className="text-gray-900 dark:text-white font-medium">{reports.current_page}</span>
                                    <span className="text-gray-400 dark:text-neutral-500">de</span>
                                    <span className="text-gray-900 dark:text-white font-medium">{reports.last_page}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ===== MODAL DE OBSERVACIÓN ===== */}
            {reportToObserve && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-white/10">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-[11px] font-bold text-gray-900 dark:text-white">Registrar Observación</h2>
                            <button 
                                onClick={() => setReportToObserve(null)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-500 dark:text-neutral-400" />
                            </button>
                        </div>
                        <textarea
                            autoFocus
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full h-32 rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all p-4 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none resize-none placeholder:text-gray-400 dark:placeholder:text-neutral-500"
                            placeholder="Motivo de la observación..."
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setReportToObserve(null)}
                                className="px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-neutral-300 rounded-xl text-[11px] font-medium transition-all border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleObserve}
                                disabled={!comment.trim()}
                                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                Enviar Observación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() }, 
        { title: 'Mis Reportes', href: '#' }
    ],
};