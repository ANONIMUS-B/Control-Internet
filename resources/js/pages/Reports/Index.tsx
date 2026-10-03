import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Plus,
    FileText,
    CheckCircle2,
    Clock,
    FileDown,
    CalendarDays,
    AlertCircle,
    Pencil,
    Search,
    X,
    Building2,
    Filter,
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
    EyeOff,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { MissingSignatureAlert } from '@/components/missing-signature-alert';
import { Pagination } from '@/components/Pagination';
import { PdfViewerModal } from '@/components/pdf-viewer-modal';
import type { FormattedPeriod } from '@/components/period-countdown-card';
import { PeriodCountdownCard } from '@/components/period-countdown-card';
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
    activePeriods?: FormattedPeriod[];
}

export default function Index({
    reports,
    filters,
    institutions,
    months,
    statuses,
    currentYear,
    activePeriods = [],
}: IndexProps) {
    // ✅ Obtener el usuario desde usePage
    const { props } = usePage();
    const user = props.auth?.user;
    const userRole = user?.role || 'director';

    // ✅ Pueden aprobar/observar: super_admin, admin, specialist
    const canModerate = ['super_admin', 'admin', 'specialist'].includes(
        userRole,
    );
    // ✅ Solo super_admin puede observar después de estar aprobado
    const isSuperAdmin = userRole === 'super_admin';

    const [selectedMonth, setSelectedMonth] = useState<string>(
        filters.month || '',
    );
    const [selectedYear, setSelectedYear] = useState<string>(
        filters.year || String(currentYear),
    );
    const [selectedStatus, setSelectedStatus] = useState<string>(
        filters.status || '',
    );
    const [selectedInstitution, setSelectedInstitution] = useState<string>(
        filters.institution_id || '',
    );
    const [perPage, setPerPage] = useState<number>(filters.per_page || 10);
    const [showFilters, setShowFilters] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [comment, setComment] = useState('');
    const [reportToObserve, setReportToObserve] = useState<number | null>(null);
    const [previewPdfModal, setPreviewPdfModal] = useState<{
        isOpen: boolean;
        url: string | null;
        title: string;
        subtitle: string;
    }>({
        isOpen: false,
        url: null,
        title: '',
        subtitle: '',
    });

    const applyFilters = () => {
        router.get(
            '/reportes',
            {
                month: selectedMonth,
                year: selectedYear,
                status: selectedStatus,
                institution_id: selectedInstitution,
                per_page: perPage,
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
        setSelectedStatus('');
        setSelectedInstitution('');
        setPerPage(10);

        router.get(
            '/reportes',
            {
                per_page: 10,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // ✅ Funciones para aprobar y observar
    const handleApprove = (id: number) => {
        if (!confirm('¿Estás seguro de aprobar este reporte?')) {
            return;
        }

        router.post(
            `/reportes/${id}/aprobar`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload();
                },
            },
        );
    };

    const handleObserve = () => {
        if (!reportToObserve || !comment.trim()) {
            return;
        }

        router.post(
            `/reportes/${reportToObserve}/observar`,
            {
                admin_comments: comment,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setReportToObserve(null);
                    setComment('');
                    router.reload();
                },
            },
        );
    };

    const stats = useMemo(() => {
        const data = reports?.data || [];

        return {
            total: reports?.total || data.length,
            pending: data.filter((r) => r.status === 'pending').length,
            approved: data.filter((r) => r.status === 'approved').length,
            observed: data.filter((r) => r.status === 'observed').length,
            rejected: data.filter((r) => r.status === 'rejected').length,
            approvalRate:
                reports?.total > 0
                    ? Math.round(
                          (data.filter((r) => r.status === 'approved').length /
                              reports.total) *
                              100,
                      )
                    : 0,
        };
    }, [reports]);

    const hasActiveFilters =
        selectedMonth || selectedStatus || selectedInstitution;

    const statusColors: Record<string, string> = {
        approved:
            'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25',
        observed:
            'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25',
        pending:
            'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/25',
        rejected:
            'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/25',
    };

    const statusIcons: Record<string, any> = {
        approved: CheckCircle2,
        observed: AlertCircle,
        pending: Clock,
        rejected: FileText,
    };

    const serviceStateColors: Record<string, string> = {
        operative:
            'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
        intermittent:
            'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
        no_service:
            'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
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

    const trend =
        stats.total > 0
            ? stats.approved / stats.total > 0.5
                ? {
                      icon: TrendingUp,
                      color: 'text-emerald-600 dark:text-emerald-400',
                      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
                      label: 'Alta aprobación',
                      border: 'border-emerald-200 dark:border-emerald-500/20',
                  }
                : {
                      icon: TrendingDown,
                      color: 'text-amber-600 dark:text-amber-400',
                      bg: 'bg-amber-50 dark:bg-amber-500/10',
                      label: 'Baja aprobación',
                      border: 'border-amber-200 dark:border-amber-500/20',
                  }
            : {
                  icon: Minus,
                  color: 'text-neutral-500',
                  bg: 'bg-neutral-100 dark:bg-neutral-500/10',
                  label: 'Sin datos',
                  border: 'border-neutral-200 dark:border-neutral-500/20',
              };

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
            badge: 'Total',
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
            badge: 'Pendiente',
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
            badge: 'Aprobado',
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
            badge: 'Observado',
        },
    ];

    return (
        <>
            <Head title="Gestión de Conformidades" />

            <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
                    {/* ===== HEADER ===== */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                            <div>
                                <div className="mb-1 flex items-center gap-3">
                                    <div className="rounded-xl border border-blue-200 bg-blue-100 p-2 dark:border-blue-500/20 dark:bg-blue-500/20">
                                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h1 className="text-[11px] font-bold tracking-tight text-gray-900 dark:text-white">
                                        Gestión de Conformidades
                                    </h1>
                                    <span className="rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-[11px] text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-300">
                                        {reports.total} total
                                    </span>
                                </div>
                                <p className="ml-12 text-[11px] text-gray-500 dark:text-neutral-400">
                                    Administra y da seguimiento a los reportes
                                    mensuales
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="group relative flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 text-[11px] font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-200 md:px-4 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:border-white/20 dark:hover:bg-white/10"
                                >
                                    <Filter className="h-4 w-4 transition-transform group-hover:rotate-12" />
                                    <span className="hidden sm:inline">
                                        Filtros
                                    </span>
                                    {hasActiveFilters && (
                                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 animate-pulse rounded-full bg-blue-500 ring-2 ring-blue-500/20"></span>
                                    )}
                                </button>

                                <Link
                                    href="/reportes/exportar-lote"
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 px-3 py-2 text-[11px] font-medium text-white shadow-lg shadow-purple-500/20 transition-all hover:scale-105 hover:from-purple-600 hover:to-purple-700 hover:shadow-purple-500/40 active:scale-95 md:px-4"
                                >
                                    <Package className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        Exportar Lote
                                    </span>
                                </Link>

                                <Link
                                    href="/reportes/nuevo"
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-2 text-[11px] font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/40 active:scale-95 md:px-4"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        Nuevo Reporte
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* ===== ALERTA DE FIRMA DIGITAL FALTANTE ===== */}
                    <MissingSignatureAlert />

                    {/* ===== ALERTA DE PLAZO / CONTADOR DE DÍAS RESTANTES ===== */}
                    <PeriodCountdownCard
                        periods={activePeriods}
                        showAction={userRole === 'director'}
                    />

                    {/* ===== TARJETAS DE ESTADÍSTICAS ===== */}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                        {statCards.map((stat) => {
                            const Icon = stat.icon;
                            const percentage =
                                stats.total > 0
                                    ? (stat.value / stats.total) * 100
                                    : 0;

                            return (
                                <div
                                    key={stat.id}
                                    className="group relative rounded-2xl border border-gray-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-lg md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:hover:border-white/20 dark:hover:shadow-2xl"
                                    onMouseEnter={() => setHoveredCard(stat.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    <div className="relative flex items-start justify-between">
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-medium text-gray-500 dark:text-neutral-400">
                                                {stat.label}
                                            </p>
                                            <p className="text-[11px] font-bold text-gray-900 dark:text-white">
                                                {stat.value}
                                            </p>
                                        </div>

                                        <div
                                            className={`rounded-xl p-2.5 ${stat.iconBg} border ${stat.borderColor} transition-transform duration-300 group-hover:scale-110`}
                                        >
                                            <Icon
                                                className={`${stat.iconColor} h-4 w-4 md:h-5 md:w-5`}
                                            />
                                        </div>
                                    </div>

                                    <div className="relative mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/5">
                                        <div
                                            className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-1000 ease-out`}
                                            style={{
                                                width:
                                                    hoveredCard === stat.id
                                                        ? `${Math.min(percentage + 20, 100)}%`
                                                        : `${percentage}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ===== TENDENCIA Y RESUMEN ===== */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 md:col-span-2 dark:border-white/10 dark:bg-slate-800/50">
                            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`rounded-xl p-2 ${trend.bg} border ${trend.border}`}
                                    >
                                        <TrendIcon
                                            className={`h-4 w-4 ${trend.color}`}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-medium text-gray-500 dark:text-neutral-400">
                                            Tasa de aprobación
                                        </p>
                                        <p className="text-[11px] font-bold text-gray-900 dark:text-white">
                                            {stats.approvalRate}%
                                            <span className="ml-2 text-[11px] font-normal text-gray-500 dark:text-neutral-400">
                                                ({trend.label})
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex w-full items-center justify-around gap-4 sm:w-auto sm:justify-end">
                                    <div className="text-center">
                                        <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                            Aprobados
                                        </p>
                                        <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                            {stats.approved}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                            Pendientes
                                        </p>
                                        <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                            {stats.pending}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                            Observados
                                        </p>
                                        <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                                            {stats.observed}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl border border-indigo-200 bg-indigo-100 p-2 dark:border-indigo-500/20 dark:bg-indigo-500/20">
                                    <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium text-gray-500 dark:text-neutral-400">
                                        Estado general
                                    </p>
                                    <p className="text-[11px] font-bold text-gray-900 dark:text-white">
                                        {stats.approvalRate > 70
                                            ? 'Excelente'
                                            : stats.approvalRate > 40
                                              ? 'Regular'
                                              : 'Crítico'}
                                    </p>
                                </div>
                            </div>
                            <div
                                className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                                    stats.approvalRate > 70
                                        ? 'border border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400'
                                        : stats.approvalRate > 40
                                          ? 'border border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400'
                                          : 'border border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400'
                                }`}
                            >
                                {stats.approvalRate > 70
                                    ? '✅ Estable'
                                    : stats.approvalRate > 40
                                      ? '⚠️ Atención'
                                      : '🚨 Urgente'}
                            </div>
                        </div>
                    </div>

                    {/* ===== FILTROS COLAPSABLES ===== */}
                    {showFilters && (
                        <div className="animate-in rounded-2xl border border-gray-200 bg-white p-4 shadow-lg duration-300 slide-in-from-top md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-[11px] font-semibold text-gray-700 dark:text-neutral-300">
                                    <div className="rounded-lg border border-blue-200 bg-blue-100 p-1.5 dark:border-blue-500/20 dark:bg-blue-500/20">
                                        <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    Filtros avanzados
                                </h3>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                                    >
                                        <X className="h-3 w-3" />
                                        Limpiar filtros
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 transition-all focus-within:border-blue-500/50 focus-within:shadow-lg focus-within:shadow-blue-500/10 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                                    <CalendarDays className="h-4 w-4 text-gray-400 dark:text-neutral-400" />
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) =>
                                            setSelectedMonth(e.target.value)
                                        }
                                        className="w-full border-0 bg-transparent text-[11px] text-gray-900 capitalize outline-none focus:ring-0 dark:text-white [&>option]:bg-white dark:[&>option]:bg-slate-800"
                                    >
                                        <option value="">
                                            Todos los meses
                                        </option>
                                        {Object.entries(months).map(
                                            ([key, value]) => (
                                                <option key={key} value={key}>
                                                    {value}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>

                                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 transition-all focus-within:border-blue-500/50 focus-within:shadow-lg focus-within:shadow-blue-500/10 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                                    <input
                                        type="number"
                                        value={selectedYear}
                                        onChange={(e) =>
                                            setSelectedYear(e.target.value)
                                        }
                                        className="w-full border-0 bg-transparent text-[11px] text-gray-900 placeholder-gray-400 outline-none focus:ring-0 dark:text-white dark:placeholder-neutral-500"
                                        placeholder="Año"
                                    />
                                </div>

                                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 transition-all focus-within:border-blue-500/50 focus-within:shadow-lg focus-within:shadow-blue-500/10 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                                    <Filter className="h-4 w-4 text-gray-400 dark:text-neutral-400" />
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) =>
                                            setSelectedStatus(e.target.value)
                                        }
                                        className="w-full border-0 bg-transparent text-[11px] text-gray-900 outline-none focus:ring-0 dark:text-white [&>option]:bg-white dark:[&>option]:bg-slate-800"
                                    >
                                        <option value="">
                                            Todos los estados
                                        </option>
                                        {Object.entries(statuses).map(
                                            ([key, value]) => (
                                                <option key={key} value={key}>
                                                    {value}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>

                                {institutions && institutions.length > 0 && (
                                    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 transition-all focus-within:border-blue-500/50 focus-within:shadow-lg focus-within:shadow-blue-500/10 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                                        <Building2 className="h-4 w-4 text-gray-400 dark:text-neutral-400" />
                                        <select
                                            value={selectedInstitution}
                                            onChange={(e) =>
                                                setSelectedInstitution(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full truncate border-0 bg-transparent text-[11px] text-gray-900 outline-none focus:ring-0 dark:text-white [&>option]:bg-white dark:[&>option]:bg-slate-800"
                                        >
                                            <option value="">
                                                Todas las IE
                                            </option>
                                            {institutions.map((inst) => (
                                                <option
                                                    key={inst.id}
                                                    value={String(inst.id)}
                                                >
                                                    {inst.name} (
                                                    {inst.modular_code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 transition-all hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                                    <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                                        Mostrar:
                                    </span>
                                    <select
                                        value={perPage}
                                        onChange={(e) =>
                                            setPerPage(Number(e.target.value))
                                        }
                                        className="w-full border-0 bg-transparent text-[11px] text-gray-900 outline-none focus:ring-0 dark:text-white [&>option]:bg-white dark:[&>option]:bg-slate-800"
                                    >
                                        <option value={10}>10</option>
                                        <option value={15}>15</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>

                                <button
                                    onClick={applyFilters}
                                    className="col-span-1 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-[11px] font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:from-blue-600 hover:to-indigo-700 hover:shadow-blue-500/40 active:scale-95 sm:col-span-2 lg:col-span-1"
                                >
                                    <Search className="mr-1 inline h-4 w-4" />
                                    Aplicar filtros
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== TABLA ===== */}
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px]">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5">
                                        <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-gray-600 uppercase md:px-6 dark:text-neutral-400">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-3.5 w-3.5" />
                                                Institución / Período
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-gray-600 uppercase md:px-6 dark:text-neutral-400">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-3.5 w-3.5" />
                                                N° Oficio
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-gray-600 uppercase md:px-6 dark:text-neutral-400">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-3.5 w-3.5" />
                                                Estado
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-gray-600 uppercase md:px-6 dark:text-neutral-400">
                                            <div className="flex items-center gap-2">
                                                <Zap className="h-3.5 w-3.5" />
                                                Servicio
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-right text-[11px] font-semibold tracking-wider text-gray-600 uppercase md:px-6 dark:text-neutral-400">
                                            <div className="flex items-center justify-end gap-2">
                                                <Eye className="h-3.5 w-3.5" />
                                                Acciones
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                    {reports?.data &&
                                    reports.data.length > 0 ? (
                                        reports.data.map((report, index) => {
                                            const StatusIcon =
                                                statusIcons[report.status] ||
                                                FileText;
                                            const statusColor =
                                                statusColors[report.status] ||
                                                'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-neutral-400 border-gray-200 dark:border-white/10';
                                            const serviceClass =
                                                serviceStateColors[
                                                    report.service_state
                                                ] ||
                                                'text-neutral-600 dark:text-neutral-400';
                                            const serviceLabel =
                                                serviceStateLabels[
                                                    report.service_state
                                                ] || report.service_state;

                                            return (
                                                <tr
                                                    key={report.id}
                                                    className={`group transition-all duration-300 hover:bg-gray-50 dark:hover:bg-white/10 ${
                                                        index % 2 === 0
                                                            ? 'bg-white dark:bg-transparent'
                                                            : 'bg-gray-50/50 dark:bg-white/5'
                                                    }`}
                                                >
                                                    <td className="px-4 py-3 md:px-6 md:py-4">
                                                        <div className="flex flex-wrap items-center gap-2 font-medium text-gray-900 dark:text-white">
                                                            {getInstitutionName(
                                                                report,
                                                            )}
                                                            {getModularCode(
                                                                report,
                                                            ) && (
                                                                <span className="rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[11px] font-normal text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400">
                                                                    {getModularCode(
                                                                        report,
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500 dark:text-neutral-400">
                                                            <CalendarDays className="h-3 w-3" />
                                                            {getMonthName(
                                                                report,
                                                            )}{' '}
                                                            {getYear(report)}
                                                            <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-neutral-600"></span>
                                                            <span className="text-gray-400 dark:text-neutral-500">
                                                                Creado:{' '}
                                                                {new Date(
                                                                    report.created_at,
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 md:px-6 md:py-4">
                                                        <span className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-1 font-mono text-[11px] text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
                                                            {getOfficeNumber(
                                                                report,
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 md:px-6 md:py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${statusColor}`}
                                                            >
                                                                <StatusIcon className="h-3 w-3" />
                                                                {statuses[
                                                                    report
                                                                        .status
                                                                ] ||
                                                                    report.status ||
                                                                    'Desconocido'}
                                                            </span>
                                                            {report.status ===
                                                                'observed' &&
                                                                report.admin_comments && (
                                                                    <div className="group relative">
                                                                        <AlertCircle className="h-4 w-4 cursor-help text-amber-600 transition-transform hover:scale-110 dark:text-amber-400" />
                                                                        <div className="pointer-events-none absolute left-0 z-50 mt-2 w-64 rounded-2xl border border-gray-200 bg-white p-3 text-[11px] text-gray-900 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:shadow-2xl">
                                                                            <div className="flex items-start gap-2">
                                                                                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                                                                                <span>
                                                                                    {
                                                                                        report.admin_comments
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 md:px-6 md:py-4">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium ${serviceClass}`}
                                                        >
                                                            {serviceLabel}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right md:px-6 md:py-4">
                                                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                                                            {/* ✅ Botones de aprobar/observar para moderadores */}
                                                            {canModerate &&
                                                                report.status ===
                                                                    'pending' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleApprove(
                                                                                    report.id,
                                                                                )
                                                                            }
                                                                            className="rounded-xl border border-emerald-200 bg-emerald-100 p-2 text-emerald-700 transition-all hover:scale-110 hover:bg-emerald-200 active:scale-95 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                                                                            title="Aprobar"
                                                                        >
                                                                            <CheckCircle2 className="h-4 w-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() =>
                                                                                setReportToObserve(
                                                                                    report.id,
                                                                                )
                                                                            }
                                                                            className="rounded-xl border border-amber-200 bg-amber-100 p-2 text-amber-700 transition-all hover:scale-110 hover:bg-amber-200 active:scale-95 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
                                                                            title="Observar"
                                                                        >
                                                                            <AlertCircle className="h-4 w-4" />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            {canModerate &&
                                                                report.status ===
                                                                    'observed' && (
                                                                    <button
                                                                        onClick={() =>
                                                                            handleApprove(
                                                                                report.id,
                                                                            )
                                                                        }
                                                                        className="rounded-xl border border-emerald-200 bg-emerald-100 p-2 text-emerald-700 transition-all hover:scale-110 hover:bg-emerald-200 active:scale-95 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                                                                        title="Aprobar después de corrección"
                                                                    >
                                                                        <CheckCircle2 className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                            {/* ✅ Solo el super_admin puede observar un oficio ya aprobado */}
                                                            {isSuperAdmin &&
                                                                report.status ===
                                                                    'approved' && (
                                                                    <button
                                                                        onClick={() =>
                                                                            setReportToObserve(
                                                                                report.id,
                                                                            )
                                                                        }
                                                                        className="rounded-xl border border-amber-200 bg-amber-100 p-2 text-amber-700 transition-all hover:scale-110 hover:bg-amber-200 active:scale-95 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
                                                                        title="Observar oficio aprobado (Reabrir para corrección)"
                                                                    >
                                                                        <AlertCircle className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                            {report.status ===
                                                                'observed' && (
                                                                <Link
                                                                    href={`/reportes/${report.id}/editar`}
                                                                    className="rounded-xl border border-amber-200 bg-amber-100 p-2 text-amber-700 transition-all hover:scale-110 hover:bg-amber-200 active:scale-95 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
                                                                    title="Corregir reporte"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Link>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setPreviewPdfModal(
                                                                        {
                                                                            isOpen: true,
                                                                            url: `/reportes/${report.id}/pdf`,
                                                                            title: `Oficio de Conformidad - ${getOfficeNumber(report)}`,
                                                                            subtitle: `${getInstitutionName(report)} • ${getMonthName(report)} ${getYear(report)}`,
                                                                        },
                                                                    )
                                                                }
                                                                className="rounded-xl border border-blue-200 bg-blue-100 p-2 text-blue-700 transition-all hover:scale-110 hover:bg-blue-200 active:scale-95 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                                                                title="Visualizar documento en pantalla"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                            <a
                                                                href={`/reportes/${report.id}/pdf`}
                                                                target="_blank"
                                                                className="rounded-xl border border-rose-200 bg-rose-100 p-2 text-rose-700 transition-all hover:scale-110 hover:bg-rose-200 active:scale-95 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                                                                title="Descargar / Abrir en pestaña"
                                                            >
                                                                <FileDown className="h-4 w-4" />
                                                            </a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="py-16 text-center"
                                            >
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="rounded-full border border-gray-200 bg-gray-100 p-6 dark:border-white/10 dark:bg-white/5">
                                                        <FileText className="h-16 w-16 text-gray-400 dark:text-neutral-600" />
                                                    </div>
                                                    <p className="text-[11px] font-medium text-gray-900 dark:text-white">
                                                        No hay registros
                                                    </p>
                                                    <p className="max-w-sm text-[11px] text-gray-500 dark:text-neutral-400">
                                                        No se encontraron
                                                        reportes con los filtros
                                                        seleccionados.
                                                        <br />
                                                        <span className="text-gray-400 dark:text-neutral-500">
                                                            Intenta ajustar los
                                                            filtros o crea un
                                                            nuevo reporte.
                                                        </span>
                                                    </p>
                                                    <Link
                                                        href="/reportes/nuevo"
                                                        className="mt-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-[11px] font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/40 active:scale-95"
                                                    >
                                                        <Plus className="h-4 w-4" />
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
                            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                                <Pagination links={reports.links} />
                            </div>
                        )}
                    </div>

                    {/* ===== FOOTER ===== */}
                    {reports?.total > 0 && (
                        <div className="flex flex-col items-center justify-between gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[11px] text-gray-500 sm:flex-row md:px-6 dark:border-white/10 dark:bg-slate-800/50 dark:text-neutral-400">
                            <div className="flex items-center gap-2">
                                <Layers className="h-4 w-4 text-gray-400 dark:text-neutral-500" />
                                <span>
                                    Mostrando{' '}
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {reports.data?.length || 0}
                                    </span>{' '}
                                    de{' '}
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {reports.total}
                                    </span>{' '}
                                    reportes
                                </span>
                            </div>
                            {reports.last_page > 1 && (
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-400 dark:text-neutral-500">
                                        Página
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {reports.current_page}
                                    </span>
                                    <span className="text-gray-400 dark:text-neutral-500">
                                        de
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {reports.last_page}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ===== MODAL DE OBSERVACIÓN ===== */}
            {reportToObserve && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-800">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-[11px] font-bold text-gray-900 dark:text-white">
                                Registrar Observación
                            </h2>
                            <button
                                onClick={() => setReportToObserve(null)}
                                className="rounded-xl p-2 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                            >
                                <X className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                            </button>
                        </div>
                        {reports?.data?.find(
                            (r: any) => r.id === reportToObserve,
                        )?.status === 'approved' && (
                            <div className="mb-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                                <span>
                                    Este oficio ya estaba aprobado. Al registrar
                                    la observación, su estado cambiará a{' '}
                                    <strong>Observado</strong> para que el
                                    director pueda corregirlo.
                                </span>
                            </div>
                        )}
                        <textarea
                            autoFocus
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="h-32 w-full resize-none rounded-xl border-2 border-gray-200 bg-white p-4 text-[11px] text-gray-900 transition-all outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-neutral-500"
                            placeholder="Motivo de la observación..."
                        />
                        <div className="mt-4 flex justify-end gap-3">
                            <button
                                onClick={() => setReportToObserve(null)}
                                className="rounded-xl border border-gray-300 bg-gray-100 px-4 py-2.5 text-[11px] font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:border-white/20 dark:hover:bg-white/10"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleObserve}
                                disabled={!comment.trim()}
                                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-[11px] font-medium text-white shadow-lg shadow-amber-500/20 transition-all hover:scale-105 hover:from-amber-600 hover:to-orange-700 hover:shadow-amber-500/40 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                Enviar Observación
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== MODAL DE PREVISUALIZACIÓN DE PDF ===== */}
            <PdfViewerModal
                isOpen={previewPdfModal.isOpen}
                onClose={() =>
                    setPreviewPdfModal((prev) => ({ ...prev, isOpen: false }))
                }
                pdfUrl={previewPdfModal.url}
                title={previewPdfModal.title}
                subtitle={previewPdfModal.subtitle}
                downloadFileName="Oficio_Conformidad.pdf"
            />
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Mis Reportes', href: '#' },
    ],
};
