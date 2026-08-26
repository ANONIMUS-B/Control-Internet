import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { BarChart, DoughnutChart, LineChart } from '@/components/Charts';
import { 
    FileText, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    Building2, 
    Users,
    TrendingUp,
    TrendingDown,
    Minus,
    UserCog,
    School,
    Wifi,
    Download,
    Filter,
    Search,
    X,
    CalendarDays,
    Calendar,
    ChevronDown,
    ChevronUp,
    Eye,
    EyeOff,
    Printer,
    RefreshCw,
    Mail,
    UserCheck,
    UserX
} from 'lucide-react';

interface StatisticsProps {
    stats: {
        reportsByMonth: Array<{
            month: string;
            total: number;
            approved: number;
            observed: number;
            pending: number;
        }>;
        topInstitutions: Array<{
            id: number;
            name: string;
            modular_code: string;
            district: string;
            level: string;
            total: number;
            last_report?: string;
        }>;
        institutionsByLevel: Array<{
            level: string;
            count: number;
        }>;
        usersByRole: Array<{
            role: string;
            count: number;
        }>;
        reportsByStatus: Array<{
            status: string;
            count: number;
        }>;
        reportsByDistrict: Array<{
            district: string;
            total: number;
        }>;
        statusSummary: {
            total_reports: number;
            pending: number;
            approved: number;
            observed: number;
            rejected: number;
            total_institutions: number;
            total_users: number;
            directors_with_signature: number;
            directors_without_signature: number;
        };
        institutionsWithoutReport?: Array<{
            id: number;
            name: string;
            modular_code: string;
            district: string;
            level: string;
            last_report?: string;
        }>;
        pendingInstitutions?: Array<{
            id: number;
            name: string;
            modular_code: string;
            district: string;
            level: string;
        }>;
    };
    filters?: {
        month?: string;
        year?: string;
        status?: string;
    };
    months: Record<number, string>;
    currentYear: number;
}

export default function Statistics({ stats, filters = {}, months, currentYear }: StatisticsProps) {
    const [selectedMonth, setSelectedMonth] = useState<string>(filters.month || '');
    const [selectedYear, setSelectedYear] = useState<string>(filters.year || String(currentYear));
    const [showInstitutionsWithoutReport, setShowInstitutionsWithoutReport] = useState(true);
    const [showPendingInstitutions, setShowPendingInstitutions] = useState(true);

    const applyFilters = () => {
        router.get('/admin/estadisticas', {
            month: selectedMonth,
            year: selectedYear,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSelectedMonth('');
        setSelectedYear(String(currentYear));
        router.get('/admin/estadisticas', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExport = () => {
        router.get('/admin/estadisticas/exportar', {
            month: selectedMonth,
            year: selectedYear,
        });
    };

    const pendingStats = useMemo(() => {
        const total = stats.statusSummary.total_institutions || 0;
        const withReports = stats.topInstitutions.length || 0;
        const withoutReports = stats.institutionsWithoutReport?.length || 0;
        const withPending = stats.pendingInstitutions?.length || 0;
        return { total, withReports, withoutReports, withPending };
    }, [stats]);

    const barChartData = {
        labels: stats.reportsByMonth.map(item => item.month),
        datasets: [
            {
                label: 'Total Reportes',
                data: stats.reportsByMonth.map(item => item.total),
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2,
            },
            {
                label: 'Aprobados',
                data: stats.reportsByMonth.map(item => item.approved),
                backgroundColor: 'rgba(16, 185, 129, 0.6)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 2,
            },
            {
                label: 'Observados',
                data: stats.reportsByMonth.map(item => item.observed),
                backgroundColor: 'rgba(245, 158, 11, 0.6)',
                borderColor: 'rgb(245, 158, 11)',
                borderWidth: 2,
            },
            {
                label: 'Pendientes',
                data: stats.reportsByMonth.map(item => item.pending || 0),
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
                borderDash: [5, 5],
            },
        ],
    };

    const doughnutData = {
        labels: stats.reportsByStatus.map(item => item.status),
        datasets: [
            {
                data: stats.reportsByStatus.map(item => item.count),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                ],
                borderColor: [
                    'rgb(59, 130, 246)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(239, 68, 68)',
                ],
                borderWidth: 2,
            },
        ],
    };

    const lineChartData = {
        labels: stats.reportsByMonth.map(item => item.month),
        datasets: [
            {
                label: 'Tendencia de Reportes',
                data: stats.reportsByMonth.map(item => item.total),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const institutionsBarData = {
        labels: stats.institutionsByLevel.map(item => item.level),
        datasets: [
            {
                label: 'Instituciones por Nivel',
                data: stats.institutionsByLevel.map(item => item.count),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.6)',
                    'rgba(16, 185, 129, 0.6)',
                    'rgba(245, 158, 11, 0.6)',
                    'rgba(139, 92, 246, 0.6)',
                    'rgba(236, 72, 153, 0.6)',
                ],
                borderColor: [
                    'rgb(59, 130, 246)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(139, 92, 246)',
                    'rgb(236, 72, 153)',
                ],
                borderWidth: 2,
            },
        ],
    };

    const roleLabels: Record<string, string> = {
        admin: 'Administrador',
        specialist: 'Especialista UPDI',
        supervisor: 'Supervisor',
        director: 'Director',
        executive: 'Ejecutivo',
        super_admin: 'Super Admin',
    };

    const statusLabels: Record<string, string> = {
        pending: 'Pendiente',
        approved: 'Aprobado',
        observed: 'Observado',
        rejected: 'Rechazado',
    };

    const statusColors: Record<string, string> = {
        pending: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/25',
        approved: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25',
        observed: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25',
        rejected: 'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/25',
    };

    const roleColors: Record<string, string> = {
        admin: 'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/25',
        specialist: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/25',
        supervisor: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25',
        director: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25',
        executive: 'bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-400 border-neutral-200 dark:border-white/10',
        super_admin: 'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/25',
    };

    return (
        <>
            <Head title="Estadísticas Generales" />

            <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                <div className="max-w-7xl mx-auto w-full space-y-4">
                    
                    {/* ===== HEADER ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-[11px] font-bold text-gray-900 dark:text-white">
                                    📊 Estadísticas Generales
                                </h1>
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                    Panel de administración con métricas del sistema
                                </p>
                            </div>
                            <button
                                onClick={applyFilters}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Actualizar
                            </button>
                        </div>
                    </div>

                    {/* ===== FILTROS ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm dark:shadow-2xl">
                        <div className="flex flex-wrap items-center gap-3">
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
                                <Calendar className="text-gray-400 dark:text-neutral-400 w-4 h-4" />
                                <input 
                                    type="number" 
                                    value={selectedYear} 
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="bg-transparent border-0 text-[11px] w-20 focus:ring-0 text-gray-900 dark:text-white outline-none"
                                    placeholder="Año"
                                />
                            </div>

                            <button
                                onClick={applyFilters}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95"
                            >
                                <Filter className="w-4 h-4" />
                                Filtrar
                            </button>

                            {(selectedMonth || selectedYear !== String(currentYear)) && (
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

                    {/* ===== RESUMEN GENERAL ===== */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[
                            { label: 'Total Reportes', value: stats.statusSummary.total_reports, icon: FileText, bgColor: 'bg-blue-100 dark:bg-blue-500/20', iconColor: 'text-blue-600 dark:text-blue-400', borderColor: 'border-blue-200 dark:border-blue-500/20' },
                            { label: 'Pendientes', value: stats.statusSummary.pending, icon: Clock, bgColor: 'bg-amber-100 dark:bg-amber-500/20', iconColor: 'text-amber-600 dark:text-amber-400', borderColor: 'border-amber-200 dark:border-amber-500/20' },
                            { label: 'Aprobados', value: stats.statusSummary.approved, icon: CheckCircle2, bgColor: 'bg-emerald-100 dark:bg-emerald-500/20', iconColor: 'text-emerald-600 dark:text-emerald-400', borderColor: 'border-emerald-200 dark:border-emerald-500/20' },
                            { label: 'Observados', value: stats.statusSummary.observed, icon: AlertCircle, bgColor: 'bg-rose-100 dark:bg-rose-500/20', iconColor: 'text-rose-600 dark:text-rose-400', borderColor: 'border-rose-200 dark:border-rose-500/20' },
                            { label: 'Rechazados', value: stats.statusSummary.rejected, icon: AlertCircle, bgColor: 'bg-red-100 dark:bg-red-500/20', iconColor: 'text-red-600 dark:text-red-400', borderColor: 'border-red-200 dark:border-red-500/20' },
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

                    {/* ===== INSTITUCIONES ===== */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Instituciones', value: stats.statusSummary.total_institutions, icon: Building2, bgColor: 'bg-purple-100 dark:bg-purple-500/20', iconColor: 'text-purple-600 dark:text-purple-400', borderColor: 'border-purple-200 dark:border-purple-500/20' },
                            { label: 'Con Reportes', value: pendingStats.withReports, icon: CheckCircle2, bgColor: 'bg-emerald-100 dark:bg-emerald-500/20', iconColor: 'text-emerald-600 dark:text-emerald-400', borderColor: 'border-emerald-200 dark:border-emerald-500/20' },
                            { label: 'Sin Reportes', value: pendingStats.withoutReports, icon: AlertCircle, bgColor: 'bg-rose-100 dark:bg-rose-500/20', iconColor: 'text-rose-600 dark:text-rose-400', borderColor: 'border-rose-200 dark:border-rose-500/20' },
                            { label: 'Con Pendientes', value: pendingStats.withPending, icon: Clock, bgColor: 'bg-amber-100 dark:bg-amber-500/20', iconColor: 'text-amber-600 dark:text-amber-400', borderColor: 'border-amber-200 dark:border-amber-500/20' },
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

                    {/* ===== INSTITUCIONES SIN REPORTE ===== */}
                    {stats.institutionsWithoutReport && stats.institutionsWithoutReport.length > 0 && (
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-[11px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-rose-500" />
                                    Instituciones Sin Reporte ({stats.institutionsWithoutReport.length})
                                </h3>
                                <button
                                    onClick={() => setShowInstitutionsWithoutReport(!showInstitutionsWithoutReport)}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    {showInstitutionsWithoutReport ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                            </div>
                            {showInstitutionsWithoutReport && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-[11px]">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-white/10">
                                                <th className="text-left py-2 font-semibold text-gray-500 dark:text-neutral-400">#</th>
                                                <th className="text-left py-2 font-semibold text-gray-500 dark:text-neutral-400">Institución</th>
                                                <th className="text-left py-2 font-semibold text-gray-500 dark:text-neutral-400">Código Modular</th>
                                                <th className="text-left py-2 font-semibold text-gray-500 dark:text-neutral-400">Distrito</th>
                                                <th className="text-left py-2 font-semibold text-gray-500 dark:text-neutral-400">Nivel</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.institutionsWithoutReport.map((inst, index) => (
                                                <tr key={index} className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                    <td className="py-2 text-gray-500 dark:text-neutral-400">{index + 1}</td>
                                                    <td className="py-2 font-medium text-gray-900 dark:text-white">{inst.name}</td>
                                                    <td className="py-2 text-gray-500 dark:text-neutral-400">{inst.modular_code}</td>
                                                    <td className="py-2 text-gray-500 dark:text-neutral-400">{inst.district}</td>
                                                    <td className="py-2">
                                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded-full text-[11px] border border-gray-200 dark:border-white/10">
                                                            {inst.level}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== INSTITUCIONES CON PENDIENTES ===== */}
                    {stats.pendingInstitutions && stats.pendingInstitutions.length > 0 && (
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-[11px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-500" />
                                    Instituciones con Reportes Pendientes ({stats.pendingInstitutions.length})
                                </h3>
                                <button
                                    onClick={() => setShowPendingInstitutions(!showPendingInstitutions)}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    {showPendingInstitutions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                            </div>
                            {showPendingInstitutions && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-[11px]">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-white/10">
                                                <th className="text-left py-2 font-semibold text-gray-500 dark:text-neutral-400">#</th>
                                                <th className="text-left py-2 font-semibold text-gray-500 dark:text-neutral-400">Institución</th>
                                                <th className="text-left py-2 font-semibold text-gray-500 dark:text-neutral-400">Código Modular</th>
                                                <th className="text-left py-2 font-semibold text-gray-500 dark:text-neutral-400">Distrito</th>
                                                <th className="text-left py-2 font-semibold text-gray-500 dark:text-neutral-400">Nivel</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.pendingInstitutions.map((inst, index) => (
                                                <tr key={index} className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                    <td className="py-2 text-gray-500 dark:text-neutral-400">{index + 1}</td>
                                                    <td className="py-2 font-medium text-gray-900 dark:text-white">{inst.name}</td>
                                                    <td className="py-2 text-gray-500 dark:text-neutral-400">{inst.modular_code}</td>
                                                    <td className="py-2 text-gray-500 dark:text-neutral-400">{inst.district}</td>
                                                    <td className="py-2">
                                                        <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full text-[11px] border border-amber-200 dark:border-amber-500/20">
                                                            {inst.level}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== GRÁFICOS ===== */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                            <h3 className="text-[11px] font-bold text-gray-900 dark:text-white mb-4">
                                📊 Reportes por Mes
                            </h3>
                            <BarChart data={barChartData} height={280} />
                        </div>

                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                            <h3 className="text-[11px] font-bold text-gray-900 dark:text-white mb-4">
                                🎯 Distribución de Estados
                            </h3>
                            <DoughnutChart data={doughnutData} height={280} />
                        </div>
                    </div>

                    {/* ===== SEGUNDA FILA DE GRÁFICOS ===== */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                            <h3 className="text-[11px] font-bold text-gray-900 dark:text-white mb-4">
                                📈 Tendencia de Reportes
                            </h3>
                            <LineChart data={lineChartData} height={280} />
                        </div>

                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                            <h3 className="text-[11px] font-bold text-gray-900 dark:text-white mb-4">
                                🏫 Instituciones por Nivel
                            </h3>
                            <BarChart data={institutionsBarData} height={280} />
                        </div>
                    </div>

                    {/* ===== TABLAS DE DATOS ===== */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Top Instituciones */}
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                            <h3 className="text-[11px] font-bold text-gray-900 dark:text-white mb-4">
                                🏆 Top 10 Instituciones con más Reportes
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-[11px]">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-white/10">
                                            <th className="text-left py-2 font-semibold text-gray-500 dark:text-neutral-400">#</th>
                                            <th className="text-left py-2 font-semibold text-gray-500 dark:text-neutral-400">Institución</th>
                                            <th className="text-left py-2 font-semibold text-gray-500 dark:text-neutral-400">Distrito</th>
                                            <th className="text-right py-2 font-semibold text-gray-500 dark:text-neutral-400">Reportes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.topInstitutions.map((inst, index) => (
                                            <tr key={index} className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="py-2 text-gray-500 dark:text-neutral-400">{index + 1}</td>
                                                <td className="py-2 font-medium text-gray-900 dark:text-white">{inst.name}</td>
                                                <td className="py-2 text-gray-500 dark:text-neutral-400">{inst.district}</td>
                                                <td className="py-2 text-right font-bold text-blue-600 dark:text-blue-400">{inst.total}</td>
                                            </tr>
                                        ))}
                                        {stats.topInstitutions.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="py-4 text-center text-gray-500 dark:text-neutral-400">No hay datos disponibles</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Reportes por Distrito */}
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                            <h3 className="text-[11px] font-bold text-gray-900 dark:text-white mb-4">
                                📍 Reportes por Distrito
                            </h3>
                            <div className="space-y-3">
                                {stats.reportsByDistrict.map((item, index) => {
                                    const max = stats.reportsByDistrict[0]?.total || 1;
                                    const percentage = (item.total / max) * 100;
                                    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500'];
                                    return (
                                        <div key={index}>
                                            <div className="flex justify-between text-[11px]">
                                                <span className="font-medium text-gray-900 dark:text-white">{item.district}</span>
                                                <span className="font-bold text-blue-600 dark:text-blue-400">{item.total}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-white/5 rounded-full h-1.5 mt-1">
                                                <div 
                                                    className={`${colors[index % colors.length]} h-1.5 rounded-full transition-all duration-500`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                                {stats.reportsByDistrict.length === 0 && (
                                    <p className="text-center text-gray-500 dark:text-neutral-400">No hay datos disponibles</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ===== USUARIOS POR ROL ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                        <h3 className="text-[11px] font-bold text-gray-900 dark:text-white mb-4">
                            👥 Usuarios por Rol
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {stats.usersByRole.map((item, index) => {
                                const colorClass = roleColors[item.role] || roleColors.executive;
                                return (
                                    <div key={index} className={`p-4 rounded-xl border ${colorClass}`}>
                                        <p className="text-[11px] font-medium">{roleLabels[item.role] || item.role}</p>
                                        <p className="text-[11px] font-bold">{item.count}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ===== RESUMEN DE ESTADOS ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                        <h3 className="text-[11px] font-bold text-gray-900 dark:text-white mb-4">
                            📋 Resumen de Estados de Reportes
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(statusLabels).map(([key, label]) => {
                                const count = stats.statusSummary[key as keyof typeof stats.statusSummary] || 0;
                                return (
                                    <div key={key} className={`px-3 py-1.5 rounded-full border ${statusColors[key]}`}>
                                        <span className="text-[11px] font-medium">{label}:</span>
                                        <span className="ml-1 text-[11px] font-bold">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ===== FOOTER ===== */}
                    <div className="text-center text-[11px] text-gray-400 dark:text-neutral-500 py-4 border-t border-gray-200 dark:border-white/10">
                        <p>Datos actualizados al {new Date().toLocaleString('es-ES')}</p>
                    </div>
                </div>
            </div>
        </>
    );
}

Statistics.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Estadísticas Generales', href: '#' }
    ],
};