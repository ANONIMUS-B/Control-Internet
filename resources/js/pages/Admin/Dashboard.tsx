import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    CheckCircle2, AlertCircle, FileDown, Search, User, Building2, X, CalendarDays,
    Filter, Clock, FileText
} from 'lucide-react';
import { Pagination } from '@/components/Pagination';
import { dashboard } from '@/routes';

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
        email: string;
    };
}

interface Filters {
    status?: string;
    month?: string;
    year?: string;
    institution_id?: string;
    per_page?: number;
}

interface AdminDashboardProps {
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

export default function AdminDashboard({ 
    reports, 
    filters, 
    institutions, 
    months, 
    statuses,
    currentYear 
}: AdminDashboardProps) {
    const [selectedMonth, setSelectedMonth] = useState<string>(filters.month || '');
    const [selectedYear, setSelectedYear] = useState<string>(filters.year || String(currentYear));
    const [selectedStatus, setSelectedStatus] = useState<string>(filters.status || '');
    const [selectedInstitution, setSelectedInstitution] = useState<string>(filters.institution_id || '');
    const [perPage, setPerPage] = useState<number>(filters.per_page || 10);
    const [comment, setComment] = useState('');
    const [reportToObserve, setReportToObserve] = useState<number | null>(null);

    const applyFilters = () => {
        router.get('/updi/dashboard', {
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
        
        router.get('/updi/dashboard', {
            per_page: 10,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const stats = useMemo(() => {
        const data = reports?.data || [];
        return {
            total: reports?.total || data.length,
            pending: data.filter(r => r?.status === 'pending').length,
            approved: data.filter(r => r?.status === 'approved').length,
            observed: data.filter(r => r?.status === 'observed').length,
            rejected: data.filter(r => r?.status === 'rejected').length,
        };
    }, [reports]);

    const statsArr = [stats.total, stats.pending, stats.approved, stats.observed];
    const maxStat = Math.max(...statsArr, 1);

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

    const getInstitutionName = (report: Report) => {
        return report?.institution?.name || 'IE no asignada';
    };

    const getUserName = (report: Report) => {
        return report?.user?.name || 'Sin director';
    };

    const getOfficeNumber = (report: Report) => {
        return report?.office_number || 'Sin asignar';
    };

    const getMonthName = (report: Report) => {
        return months[report?.month] || report?.month || '---';
    };

    const getYear = (report: Report) => {
        return report?.year || '---';
    };

    const getStatusText = (report: Report) => {
        return statuses[report?.status] || report?.status || 'Desconocido';
    };

    const getStatusIcon = (report: Report) => {
        return statusIcons[report?.status] || FileText;
    };

    const getStatusColor = (report: Report) => {
        return statusColors[report?.status] || 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-neutral-400 border-gray-200 dark:border-white/10';
    };

    return (
        <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
            <Head title="Panel de Gestión UPDI" />

            <div className="max-w-7xl mx-auto w-full space-y-4">

                {/* ===== HEADER ===== */}
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-[11px] font-bold text-gray-900 dark:text-white">
                                Panel de Gestión UPDI
                            </h1>
                            <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                Validación técnica de conformidades mensuales.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ===== TARJETAS DE ESTADÍSTICAS ===== */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Reportes', value: stats.total, icon: FileText, gradient: 'from-blue-500 to-indigo-500', bgColor: 'bg-blue-100 dark:bg-blue-500/20', iconColor: 'text-blue-600 dark:text-blue-400', borderColor: 'border-blue-200 dark:border-blue-500/20' },
                        { label: 'Pendientes', value: stats.pending, icon: Clock, gradient: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-100 dark:bg-amber-500/20', iconColor: 'text-amber-600 dark:text-amber-400', borderColor: 'border-amber-200 dark:border-amber-500/20' },
                        { label: 'Aprobados', value: stats.approved, icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-500', bgColor: 'bg-emerald-100 dark:bg-emerald-500/20', iconColor: 'text-emerald-600 dark:text-emerald-400', borderColor: 'border-emerald-200 dark:border-emerald-500/20' },
                        { label: 'Observados', value: stats.observed, icon: AlertCircle, gradient: 'from-rose-500 to-pink-500', bgColor: 'bg-rose-100 dark:bg-rose-500/20', iconColor: 'text-rose-600 dark:text-rose-400', borderColor: 'border-rose-200 dark:border-rose-500/20' }
                    ].map((stat, index) => (
                        <div key={index} className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-2xl">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-[11px] font-medium text-gray-500 dark:text-neutral-400">{stat.label}</p>
                                    <p className="text-[11px] font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                </div>
                                <div className={`${stat.bgColor} p-2.5 rounded-xl border ${stat.borderColor}`}>
                                    <stat.icon className={`${stat.iconColor} w-4 h-4`} />
                                </div>
                            </div>
                            <div className="mt-3 h-1 w-full bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-500`} style={{ width: `${(stat.value / maxStat) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* ===== FILTROS ===== */}
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm dark:shadow-2xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl px-3 py-2 border border-gray-200 dark:border-white/10 transition-all focus-within:border-blue-500/50">
                                <CalendarDays className="text-gray-400 dark:text-neutral-400 w-4 h-4" />
                                <select 
                                    value={selectedMonth} 
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="bg-transparent border-0 text-[11px] focus:ring-0 capitalize min-w-[100px] text-gray-900 dark:text-white [&>option]:bg-white dark:[&>option]:bg-slate-800 outline-none"
                                >
                                    <option value="">Todos los meses</option>
                                    {Object.entries(months).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl px-3 py-2 border border-gray-200 dark:border-white/10 transition-all focus-within:border-blue-500/50">
                                <input 
                                    type="number" 
                                    value={selectedYear} 
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="bg-transparent border-0 text-[11px] w-20 focus:ring-0 text-gray-900 dark:text-white outline-none"
                                    placeholder="Año"
                                />
                            </div>

                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl px-3 py-2 border border-gray-200 dark:border-white/10 transition-all focus-within:border-blue-500/50">
                                <Filter className="text-gray-400 dark:text-neutral-400 w-4 h-4" />
                                <select 
                                    value={selectedStatus} 
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="bg-transparent border-0 text-[11px] focus:ring-0 min-w-[120px] text-gray-900 dark:text-white [&>option]:bg-white dark:[&>option]:bg-slate-800 outline-none"
                                >
                                    <option value="">Todos los estados</option>
                                    {Object.entries(statuses).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl px-3 py-2 border border-gray-200 dark:border-white/10 transition-all focus-within:border-blue-500/50">
                                <Building2 className="text-gray-400 dark:text-neutral-400 w-4 h-4" />
                                <select 
                                    value={selectedInstitution} 
                                    onChange={(e) => setSelectedInstitution(e.target.value)}
                                    className="bg-transparent border-0 text-[11px] focus:ring-0 min-w-[150px] max-w-[200px] truncate text-gray-900 dark:text-white [&>option]:bg-white dark:[&>option]:bg-slate-800 outline-none"
                                >
                                    <option value="">Todas las IE</option>
                                    {institutions.map((inst) => (
                                        <option key={inst.id} value={String(inst.id)}>
                                            {inst.name} ({inst.modular_code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl px-3 py-2 border border-gray-200 dark:border-white/10 transition-all">
                                <span className="text-[11px] text-gray-500 dark:text-neutral-400">Mostrar:</span>
                                <select 
                                    value={perPage} 
                                    onChange={(e) => setPerPage(Number(e.target.value))}
                                    className="bg-transparent border-0 text-[11px] focus:ring-0 w-16 text-gray-900 dark:text-white [&>option]:bg-white dark:[&>option]:bg-slate-800 outline-none"
                                >
                                    <option value={10}>10</option>
                                    <option value={15}>15</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <button
                                onClick={applyFilters}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95"
                            >
                                <Search className="w-4 h-4" />
                                Filtrar
                            </button>
                            {(selectedMonth || selectedStatus || selectedInstitution) && (
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

                {/* ===== TABLA DE REPORTES ===== */}
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px]">
                            <thead className="bg-gray-50 dark:bg-white/5">
                                <tr>
                                    <th className="px-4 md:px-6 py-3 text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Institución / Director</th>
                                    <th className="px-4 md:px-6 py-3 text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">N° Oficio / Período</th>
                                    <th className="px-4 md:px-6 py-3 text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Estado</th>
                                    <th className="px-4 md:px-6 py-3 text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                {reports?.data && reports.data.length > 0 ? (
                                    reports.data.map((report) => {
                                        const StatusIcon = getStatusIcon(report);
                                        const statusColor = getStatusColor(report);
                                        const statusText = getStatusText(report);
                                        const institutionName = getInstitutionName(report);
                                        const userName = getUserName(report);
                                        const officeNumber = getOfficeNumber(report);
                                        const monthName = getMonthName(report);
                                        const yearNum = getYear(report);
                                        
                                        return (
                                            <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                                                <td className="px-4 md:px-6 py-3 md:py-4">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {institutionName}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500 dark:text-neutral-400 flex items-center gap-1">
                                                        <User className="w-3 h-3" /> 
                                                        {userName}
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-6 py-3 md:py-4">
                                                    <div className="text-[11px] text-gray-600 dark:text-neutral-300">
                                                        {officeNumber}
                                                    </div>
                                                    <div className="text-[11px] text-gray-400 dark:text-neutral-500">
                                                        {monthName} {yearNum}
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-6 py-3 md:py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${statusColor}`}>
                                                        <StatusIcon className="w-3 h-3" /> 
                                                        {statusText}
                                                    </span>
                                                    {report?.status === 'observed' && report?.admin_comments && (
                                                        <div className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
                                                            <span className="font-medium">Obs:</span> {report.admin_comments}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <a 
                                                            href={`/reportes/${report.id}/pdf`} 
                                                            target="_blank" 
                                                            className="p-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-all border border-gray-200 dark:border-white/10 hover:scale-110 active:scale-95"
                                                            title="Descargar PDF"
                                                        >
                                                            <FileDown className="w-4 h-4 text-gray-600 dark:text-neutral-400" />
                                                        </a>
                                                        {report?.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(report.id)}
                                                                    className="p-2 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 rounded-xl transition-all border border-emerald-200 dark:border-emerald-500/20 hover:scale-110 active:scale-95"
                                                                    title="Aprobar"
                                                                >
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => setReportToObserve(report.id)}
                                                                    className="p-2 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-500/20 rounded-xl transition-all border border-amber-200 dark:border-amber-500/20 hover:scale-110 active:scale-95"
                                                                    title="Observar"
                                                                >
                                                                    <AlertCircle className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                        {report?.status === 'observed' && (
                                                            <button
                                                                onClick={() => handleApprove(report.id)}
                                                                className="p-2 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 rounded-xl transition-all border border-emerald-200 dark:border-emerald-500/20 hover:scale-110 active:scale-95"
                                                                title="Aprobar después de corrección"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-16 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="p-6 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10">
                                                    <FileText className="w-16 h-16 text-gray-400 dark:text-neutral-600" />
                                                </div>
                                                <p className="text-[11px] font-medium text-gray-900 dark:text-white">No hay registros</p>
                                                <p className="text-[11px] text-gray-500 dark:text-neutral-400">No se encontraron reportes con los filtros seleccionados.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {reports?.links && reports.links.length > 3 && (
                        <div className="border-t border-gray-200 dark:border-white/10 px-4 py-3 bg-gray-50 dark:bg-white/5">
                            <Pagination 
                                links={reports.links} 
                            />
                        </div>
                    )}
                </div>

                {/* ===== INFORMACIÓN DE PAGINACIÓN ===== */}
                {reports?.total > 0 && (
                    <div className="text-center text-[11px] text-gray-500 dark:text-neutral-400">
                        Mostrando {reports.data?.length || 0} de {reports.total} reportes
                        {reports.last_page > 1 && ` - Página ${reports.current_page} de ${reports.last_page}`}
                    </div>
                )}
            </div>

            {/* ===== MODAL DE OBSERVACIÓN ===== */}
            {reportToObserve && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-white/10">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-[11px] font-bold text-gray-900 dark:text-white">Registrar Observación</h2>
                            <button 
                                onClick={() => setReportToObserve(null)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-400 dark:text-neutral-500" />
                            </button>
                        </div>
                        <textarea
                            autoFocus
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full h-32 rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all p-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none resize-none"
                            placeholder="Motivo de la observación..."
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setReportToObserve(null)}
                                className="px-4 py-2 text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl text-[11px] font-medium transition-all border border-gray-200 dark:border-white/10"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleObserve}
                                disabled={!comment.trim()}
                                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                Enviar Observación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() }, 
        { title: 'Panel UPDI', href: '#' }
    ],
};