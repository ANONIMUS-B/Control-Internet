import { Head, router } from '@inertiajs/react';
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
    UserX,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { BarChart, DoughnutChart, LineChart } from '@/components/Charts';
import { dashboard } from '@/routes';

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

export default function Statistics({
    stats,
    filters = {},
    months,
    currentYear,
}: StatisticsProps) {
    const [selectedMonth, setSelectedMonth] = useState<string>(
        filters.month || '',
    );
    const [selectedYear, setSelectedYear] = useState<string>(
        filters.year || String(currentYear),
    );
    const [showInstitutionsWithoutReport, setShowInstitutionsWithoutReport] =
        useState(true);
    const [showPendingInstitutions, setShowPendingInstitutions] =
        useState(true);

    const applyFilters = () => {
        router.get(
            '/admin/estadisticas',
            {
                month: selectedMonth,
                year: selectedYear,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const clearFilters = () => {
        setSelectedMonth('');
        setSelectedYear(String(currentYear));
        router.get(
            '/admin/estadisticas',
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleExport = () => {
        const params = new URLSearchParams();

        if (selectedMonth) {
            params.append('month', selectedMonth);
        }

        if (selectedYear) {
            params.append('year', selectedYear);
        }

        window.location.href = `/admin/estadisticas/exportar?${params.toString()}`;
    };

    const pendingStats = useMemo(() => {
        const total = stats.statusSummary.total_institutions || 0;
        const withReports = stats.topInstitutions.length || 0;
        const withoutReports = stats.institutionsWithoutReport?.length || 0;
        const withPending = stats.pendingInstitutions?.length || 0;

        return { total, withReports, withoutReports, withPending };
    }, [stats]);

    const barChartData = {
        labels: stats.reportsByMonth.map((item) => item.month),
        datasets: [
            {
                label: 'Total Reportes',
                data: stats.reportsByMonth.map((item) => item.total),
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2,
            },
            {
                label: 'Aprobados',
                data: stats.reportsByMonth.map((item) => item.approved),
                backgroundColor: 'rgba(16, 185, 129, 0.6)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 2,
            },
            {
                label: 'Observados',
                data: stats.reportsByMonth.map((item) => item.observed),
                backgroundColor: 'rgba(245, 158, 11, 0.6)',
                borderColor: 'rgb(245, 158, 11)',
                borderWidth: 2,
            },
            {
                label: 'Pendientes',
                data: stats.reportsByMonth.map((item) => item.pending || 0),
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
                borderDash: [5, 5],
            },
        ],
    };

    const doughnutData = {
        labels: stats.reportsByStatus.map((item) => item.status),
        datasets: [
            {
                data: stats.reportsByStatus.map((item) => item.count),
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
        labels: stats.reportsByMonth.map((item) => item.month),
        datasets: [
            {
                label: 'Tendencia de Reportes',
                data: stats.reportsByMonth.map((item) => item.total),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const institutionsBarData = {
        labels: stats.institutionsByLevel.map((item) => item.level),
        datasets: [
            {
                label: 'Instituciones por Nivel',
                data: stats.institutionsByLevel.map((item) => item.count),
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
        pending:
            'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/25',
        approved:
            'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25',
        observed:
            'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25',
        rejected:
            'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/25',
    };

    const roleColors: Record<string, string> = {
        admin: 'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/25',
        specialist:
            'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/25',
        supervisor:
            'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25',
        director:
            'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25',
        executive:
            'bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-400 border-neutral-200 dark:border-white/10',
        super_admin:
            'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/25',
    };

    return (
        <>
            <Head title="Estadísticas Generales" />

            <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                <div className="mx-auto w-full max-w-7xl space-y-4">
                    {/* ===== HEADER ===== */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                            <div>
                                <h1 className="text-[11px] font-bold text-gray-900 dark:text-white">
                                    📊 Estadísticas Generales
                                </h1>
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                    Panel de administración con métricas del
                                    sistema
                                </p>
                            </div>
                            <button
                                onClick={applyFilters}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-[11px] font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:from-blue-600 hover:to-indigo-700 hover:shadow-blue-500/40 active:scale-95"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Actualizar
                            </button>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-[11px] font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:from-emerald-600 hover:to-teal-700 hover:shadow-emerald-500/40 active:scale-95"
                                >
                                    <Download className="h-4 w-4" />
                                    Exportar a Excel
                                </button>
                                <button
                                    onClick={applyFilters}
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-[11px] font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:from-blue-600 hover:to-indigo-700 hover:shadow-blue-500/40 active:scale-95"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Actualizar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ===== FILTROS ===== */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 transition-all focus-within:border-blue-500/50 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                                <CalendarDays className="h-4 w-4 text-gray-400 dark:text-neutral-400" />
                                <select
                                    value={selectedMonth}
                                    onChange={(e) =>
                                        setSelectedMonth(e.target.value)
                                    }
                                    className="min-w-[100px] border-0 bg-transparent text-[11px] text-gray-900 capitalize outline-none focus:ring-0 dark:text-white [&>option]:bg-white dark:[&>option]:bg-slate-800"
                                >
                                    <option value="">Todos los meses</option>
                                    {Object.entries(months).map(
                                        ([key, value]) => (
                                            <option key={key} value={key}>
                                                {value}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 transition-all focus-within:border-blue-500/50 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                                <Calendar className="h-4 w-4 text-gray-400 dark:text-neutral-400" />
                                <input
                                    type="number"
                                    value={selectedYear}
                                    onChange={(e) =>
                                        setSelectedYear(e.target.value)
                                    }
                                    className="w-20 border-0 bg-transparent text-[11px] text-gray-900 outline-none focus:ring-0 dark:text-white"
                                    placeholder="Año"
                                />
                            </div>

                            <button
                                onClick={applyFilters}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-[11px] font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:from-blue-600 hover:to-indigo-700 hover:shadow-blue-500/40 active:scale-95"
                            >
                                <Filter className="h-4 w-4" />
                                Filtrar
                            </button>

                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-[11px] font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:from-emerald-600 hover:to-teal-700 hover:shadow-emerald-500/40 active:scale-95"
                            >
                                <Download className="h-4 w-4" />
                                Exportar Excel
                            </button>

                            {(selectedMonth ||
                                selectedYear !== String(currentYear)) && (
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

                    {/* ===== RESUMEN GENERAL ===== */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                        {[
                            {
                                label: 'Total Reportes',
                                value: stats.statusSummary.total_reports,
                                icon: FileText,
                                bgColor: 'bg-blue-100 dark:bg-blue-500/20',
                                iconColor: 'text-blue-600 dark:text-blue-400',
                                borderColor:
                                    'border-blue-200 dark:border-blue-500/20',
                            },
                            {
                                label: 'Pendientes',
                                value: stats.statusSummary.pending,
                                icon: Clock,
                                bgColor: 'bg-amber-100 dark:bg-amber-500/20',
                                iconColor: 'text-amber-600 dark:text-amber-400',
                                borderColor:
                                    'border-amber-200 dark:border-amber-500/20',
                            },
                            {
                                label: 'Aprobados',
                                value: stats.statusSummary.approved,
                                icon: CheckCircle2,
                                bgColor:
                                    'bg-emerald-100 dark:bg-emerald-500/20',
                                iconColor:
                                    'text-emerald-600 dark:text-emerald-400',
                                borderColor:
                                    'border-emerald-200 dark:border-emerald-500/20',
                            },
                            {
                                label: 'Observados',
                                value: stats.statusSummary.observed,
                                icon: AlertCircle,
                                bgColor: 'bg-rose-100 dark:bg-rose-500/20',
                                iconColor: 'text-rose-600 dark:text-rose-400',
                                borderColor:
                                    'border-rose-200 dark:border-rose-500/20',
                            },
                            {
                                label: 'Rechazados',
                                value: stats.statusSummary.rejected,
                                icon: AlertCircle,
                                bgColor: 'bg-red-100 dark:bg-red-500/20',
                                iconColor: 'text-red-600 dark:text-red-400',
                                borderColor:
                                    'border-red-200 dark:border-red-500/20',
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

                    {/* ===== INSTITUCIONES ===== */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                label: 'Total Instituciones',
                                value: stats.statusSummary.total_institutions,
                                icon: Building2,
                                bgColor: 'bg-purple-100 dark:bg-purple-500/20',
                                iconColor:
                                    'text-purple-600 dark:text-purple-400',
                                borderColor:
                                    'border-purple-200 dark:border-purple-500/20',
                            },
                            {
                                label: 'Con Reportes',
                                value: pendingStats.withReports,
                                icon: CheckCircle2,
                                bgColor:
                                    'bg-emerald-100 dark:bg-emerald-500/20',
                                iconColor:
                                    'text-emerald-600 dark:text-emerald-400',
                                borderColor:
                                    'border-emerald-200 dark:border-emerald-500/20',
                            },
                            {
                                label: 'Sin Reportes',
                                value: pendingStats.withoutReports,
                                icon: AlertCircle,
                                bgColor: 'bg-rose-100 dark:bg-rose-500/20',
                                iconColor: 'text-rose-600 dark:text-rose-400',
                                borderColor:
                                    'border-rose-200 dark:border-rose-500/20',
                            },
                            {
                                label: 'Con Pendientes',
                                value: pendingStats.withPending,
                                icon: Clock,
                                bgColor: 'bg-amber-100 dark:bg-amber-500/20',
                                iconColor: 'text-amber-600 dark:text-amber-400',
                                borderColor:
                                    'border-amber-200 dark:border-amber-500/20',
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

                    {/* ===== INSTITUCIONES SIN REPORTE ===== */}
                    {stats.institutionsWithoutReport &&
                        stats.institutionsWithoutReport.length > 0 && (
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="flex items-center gap-2 text-[11px] font-bold text-gray-900 dark:text-white">
                                        <AlertCircle className="h-4 w-4 text-rose-500" />
                                        Instituciones Sin Reporte (
                                        {stats.institutionsWithoutReport.length}
                                        )
                                    </h3>
                                    <button
                                        onClick={() =>
                                            setShowInstitutionsWithoutReport(
                                                !showInstitutionsWithoutReport,
                                            )
                                        }
                                        className="rounded-xl p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                                    >
                                        {showInstitutionsWithoutReport ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {showInstitutionsWithoutReport && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-[11px]">
                                            <thead>
                                                <tr className="border-b border-gray-200 dark:border-white/10">
                                                    <th className="py-2 text-left font-semibold text-gray-500 dark:text-neutral-400">
                                                        #
                                                    </th>
                                                    <th className="py-2 text-left font-semibold text-gray-500 dark:text-neutral-400">
                                                        Institución
                                                    </th>
                                                    <th className="py-2 text-left font-semibold text-gray-500 dark:text-neutral-400">
                                                        Código Modular
                                                    </th>
                                                    <th className="py-2 text-left font-semibold text-gray-500 dark:text-neutral-400">
                                                        Distrito
                                                    </th>
                                                    <th className="py-2 text-left font-semibold text-gray-500 dark:text-neutral-400">
                                                        Nivel
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.institutionsWithoutReport.map(
                                                    (inst, index) => (
                                                        <tr
                                                            key={index}
                                                            className="border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-white/5 dark:hover:bg-white/5"
                                                        >
                                                            <td className="py-2 text-gray-500 dark:text-neutral-400">
                                                                {index + 1}
                                                            </td>
                                                            <td className="py-2 font-medium text-gray-900 dark:text-white">
                                                                {inst.name}
                                                            </td>
                                                            <td className="py-2 text-gray-500 dark:text-neutral-400">
                                                                {
                                                                    inst.modular_code
                                                                }
                                                            </td>
                                                            <td className="py-2 text-gray-500 dark:text-neutral-400">
                                                                {inst.district}
                                                            </td>
                                                            <td className="py-2">
                                                                <span className="rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[11px] dark:border-white/10 dark:bg-white/5">
                                                                    {inst.level}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                    {/* ===== INSTITUCIONES CON PENDIENTES ===== */}
                    {stats.pendingInstitutions &&
                        stats.pendingInstitutions.length > 0 && (
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="flex items-center gap-2 text-[11px] font-bold text-gray-900 dark:text-white">
                                        <Clock className="h-4 w-4 text-amber-500" />
                                        Instituciones con Reportes Pendientes (
                                        {stats.pendingInstitutions.length})
                                    </h3>
                                    <button
                                        onClick={() =>
                                            setShowPendingInstitutions(
                                                !showPendingInstitutions,
                                            )
                                        }
                                        className="rounded-xl p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                                    >
                                        {showPendingInstitutions ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {showPendingInstitutions && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-[11px]">
                                            <thead>
                                                <tr className="border-b border-gray-200 dark:border-white/10">
                                                    <th className="py-2 text-left font-semibold text-gray-500 dark:text-neutral-400">
                                                        #
                                                    </th>
                                                    <th className="py-2 text-left font-semibold text-gray-500 dark:text-neutral-400">
                                                        Institución
                                                    </th>
                                                    <th className="py-2 text-left font-semibold text-gray-500 dark:text-neutral-400">
                                                        Código Modular
                                                    </th>
                                                    <th className="py-2 text-left font-semibold text-gray-500 dark:text-neutral-400">
                                                        Distrito
                                                    </th>
                                                    <th className="py-2 text-left font-semibold text-gray-500 dark:text-neutral-400">
                                                        Nivel
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.pendingInstitutions.map(
                                                    (inst, index) => (
                                                        <tr
                                                            key={index}
                                                            className="border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-white/5 dark:hover:bg-white/5"
                                                        >
                                                            <td className="py-2 text-gray-500 dark:text-neutral-400">
                                                                {index + 1}
                                                            </td>
                                                            <td className="py-2 font-medium text-gray-900 dark:text-white">
                                                                {inst.name}
                                                            </td>
                                                            <td className="py-2 text-gray-500 dark:text-neutral-400">
                                                                {
                                                                    inst.modular_code
                                                                }
                                                            </td>
                                                            <td className="py-2 text-gray-500 dark:text-neutral-400">
                                                                {inst.district}
                                                            </td>
                                                            <td className="py-2">
                                                                <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[11px] text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400">
                                                                    {inst.level}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                    {/* ===== GRÁFICOS ===== */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                            <h3 className="mb-4 text-[11px] font-bold text-gray-900 dark:text-white">
                                📊 Reportes por Mes
                            </h3>
                            <BarChart data={barChartData} height={280} />
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                            <h3 className="mb-4 text-[11px] font-bold text-gray-900 dark:text-white">
                                🎯 Distribución de Estados
                            </h3>
                            <DoughnutChart data={doughnutData} height={280} />
                        </div>
                    </div>

                    {/* ===== SEGUNDA FILA DE GRÁFICOS ===== */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                            <h3 className="mb-4 text-[11px] font-bold text-gray-900 dark:text-white">
                                📈 Tendencia de Reportes
                            </h3>
                            <LineChart data={lineChartData} height={280} />
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                            <h3 className="mb-4 text-[11px] font-bold text-gray-900 dark:text-white">
                                🏫 Instituciones por Nivel
                            </h3>
                            <BarChart data={institutionsBarData} height={280} />
                        </div>
                    </div>

                    {/* ===== TABLAS DE DATOS ===== */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {/* Top Instituciones */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                            <h3 className="mb-4 text-[11px] font-bold text-gray-900 dark:text-white">
                                🏆 Top 10 Instituciones con más Reportes
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-[11px]">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-white/10">
                                            <th className="py-2 text-left font-semibold text-gray-500 dark:text-neutral-400">
                                                #
                                            </th>
                                            <th className="py-2 text-left font-semibold text-gray-500 dark:text-neutral-400">
                                                Institución
                                            </th>
                                            <th className="py-2 text-left font-semibold text-gray-500 dark:text-neutral-400">
                                                Distrito
                                            </th>
                                            <th className="py-2 text-right font-semibold text-gray-500 dark:text-neutral-400">
                                                Reportes
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.topInstitutions.map(
                                            (inst, index) => (
                                                <tr
                                                    key={index}
                                                    className="border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-white/5 dark:hover:bg-white/5"
                                                >
                                                    <td className="py-2 text-gray-500 dark:text-neutral-400">
                                                        {index + 1}
                                                    </td>
                                                    <td className="py-2 font-medium text-gray-900 dark:text-white">
                                                        {inst.name}
                                                    </td>
                                                    <td className="py-2 text-gray-500 dark:text-neutral-400">
                                                        {inst.district}
                                                    </td>
                                                    <td className="py-2 text-right font-bold text-blue-600 dark:text-blue-400">
                                                        {inst.total}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                        {stats.topInstitutions.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="py-4 text-center text-gray-500 dark:text-neutral-400"
                                                >
                                                    No hay datos disponibles
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Reportes por Distrito */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                            <h3 className="mb-4 text-[11px] font-bold text-gray-900 dark:text-white">
                                📍 Reportes por Distrito
                            </h3>
                            <div className="space-y-3">
                                {stats.reportsByDistrict.map((item, index) => {
                                    const max =
                                        stats.reportsByDistrict[0]?.total || 1;
                                    const percentage = (item.total / max) * 100;
                                    const colors = [
                                        'bg-blue-500',
                                        'bg-emerald-500',
                                        'bg-amber-500',
                                        'bg-purple-500',
                                        'bg-rose-500',
                                    ];

                                    return (
                                        <div key={index}>
                                            <div className="flex justify-between text-[11px]">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {item.district}
                                                </span>
                                                <span className="font-bold text-blue-600 dark:text-blue-400">
                                                    {item.total}
                                                </span>
                                            </div>
                                            <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200 dark:bg-white/5">
                                                <div
                                                    className={`${colors[index % colors.length]} h-1.5 rounded-full transition-all duration-500`}
                                                    style={{
                                                        width: `${percentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                                {stats.reportsByDistrict.length === 0 && (
                                    <p className="text-center text-gray-500 dark:text-neutral-400">
                                        No hay datos disponibles
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ===== USUARIOS POR ROL ===== */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                        <h3 className="mb-4 text-[11px] font-bold text-gray-900 dark:text-white">
                            👥 Usuarios por Rol
                        </h3>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                            {stats.usersByRole.map((item, index) => {
                                const colorClass =
                                    roleColors[item.role] ||
                                    roleColors.executive;

                                return (
                                    <div
                                        key={index}
                                        className={`rounded-xl border p-4 ${colorClass}`}
                                    >
                                        <p className="text-[11px] font-medium">
                                            {roleLabels[item.role] || item.role}
                                        </p>
                                        <p className="text-[11px] font-bold">
                                            {item.count}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ===== RESUMEN DE ESTADOS ===== */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                        <h3 className="mb-4 text-[11px] font-bold text-gray-900 dark:text-white">
                            📋 Resumen de Estados de Reportes
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(statusLabels).map(
                                ([key, label]) => {
                                    const count =
                                        stats.statusSummary[
                                            key as keyof typeof stats.statusSummary
                                        ] || 0;

                                    return (
                                        <div
                                            key={key}
                                            className={`rounded-full border px-3 py-1.5 ${statusColors[key]}`}
                                        >
                                            <span className="text-[11px] font-medium">
                                                {label}:
                                            </span>
                                            <span className="ml-1 text-[11px] font-bold">
                                                {count}
                                            </span>
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    </div>

                    {/* ===== FOOTER ===== */}
                    <div className="border-t border-gray-200 py-4 text-center text-[11px] text-gray-400 dark:border-white/10 dark:text-neutral-500">
                        <p>
                            Datos actualizados al{' '}
                            {new Date().toLocaleString('es-ES')}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

Statistics.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Estadísticas Generales', href: '#' },
    ],
};
