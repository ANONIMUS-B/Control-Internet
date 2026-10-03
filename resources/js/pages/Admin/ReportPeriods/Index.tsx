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
    ChevronRight,
    LayoutGrid,
    List,
    Sparkles,
    Flame,
    Info,
    Calendar,
    ArrowUpRight,
    SlidersHorizontal,
    Check,
} from 'lucide-react';
import { useState, useMemo } from 'react';
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

const MONTH_NAMES = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
];

const MONTH_GRADIENTS = [
    'from-rose-500 to-pink-600', // Ene
    'from-pink-500 to-rose-600', // Feb
    'from-amber-500 to-orange-600', // Mar
    'from-orange-500 to-amber-600', // Abr
    'from-emerald-500 to-teal-600', // May
    'from-teal-500 to-cyan-600', // Jun
    'from-cyan-500 to-blue-600', // Jul
    'from-blue-500 to-indigo-600', // Ago
    'from-indigo-500 to-purple-600', // Sep
    'from-purple-500 to-fuchsia-600', // Oct
    'from-fuchsia-500 to-pink-600', // Nov
    'from-violet-500 to-purple-600', // Dic
];

export default function Index({ periods = [], flash }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = viewMode === 'grid' ? 9 : 10;
    const [successMessage, setSuccessMessage] = useState<string | null>(
        flash?.success || null,
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(
        flash?.error || null,
    );

    const periodsArray = Array.isArray(periods) ? periods : [];

    // Fechas actuales para calcular vigencia
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Computar estados dinámicos para cada período
    const enrichedPeriods = useMemo(() => {
        return periodsArray.map((period) => {
            const startStr = period.start_date
                ? period.start_date.split('T')[0]
                : '';
            const endStr = period.end_date ? period.end_date.split('T')[0] : '';

            const isCurrent =
                period.is_active && todayStr >= startStr && todayStr <= endStr;
            const isUpcoming = period.is_active && todayStr < startStr;
            const isPast = todayStr > endStr;

            // Calcular días restantes
            let daysRemaining = 0;

            if (isCurrent && endStr) {
                const diffTime =
                    new Date(endStr).getTime() - new Date(todayStr).getTime();
                daysRemaining = Math.max(
                    0,
                    Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
                );
            } else if (isUpcoming && startStr) {
                const diffTime =
                    new Date(startStr).getTime() - new Date(todayStr).getTime();
                daysRemaining = Math.max(
                    0,
                    Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
                );
            }

            // Duración total del período
            let durationDays = 0;

            if (startStr && endStr) {
                const diffTime =
                    new Date(endStr).getTime() - new Date(startStr).getTime();
                durationDays = Math.max(
                    1,
                    Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1,
                );
            }

            // Porcentaje transcurrido
            let progressPercent = 0;

            if (isCurrent && startStr && endStr) {
                const total =
                    new Date(endStr).getTime() - new Date(startStr).getTime();
                const passed =
                    new Date(todayStr).getTime() - new Date(startStr).getTime();
                progressPercent =
                    total > 0
                        ? Math.min(
                              100,
                              Math.max(5, Math.round((passed / total) * 100)),
                          )
                        : 0;
            } else if (isPast) {
                progressPercent = 100;
            }

            return {
                ...period,
                start_date_clean: startStr,
                end_date_clean: endStr,
                is_current: isCurrent,
                is_upcoming: isUpcoming,
                is_past: isPast,
                days_remaining: daysRemaining,
                duration_days: durationDays,
                progress_percent: progressPercent,
            };
        });
    }, [periodsArray, todayStr]);

    // Años únicos presentes en los períodos
    const availableYears = useMemo(() => {
        const yearsSet = new Set(
            periodsArray.map((p) => p.year).filter(Boolean),
        );

        return Array.from(yearsSet).sort((a, b) => b - a);
    }, [periodsArray]);

    // Estadísticas
    const stats = useMemo(() => {
        return {
            total: enrichedPeriods.length,
            active: enrichedPeriods.filter((p) => p.is_current).length,
            upcoming: enrichedPeriods.filter((p) => p.is_upcoming).length,
            inactiveOrClosed: enrichedPeriods.filter(
                (p) => !p.is_active || p.is_past,
            ).length,
        };
    }, [enrichedPeriods]);

    // Filtrado
    const filteredPeriods = useMemo(() => {
        return enrichedPeriods.filter((period) => {
            if (!period) {
                return false;
            }

            const monthName =
                period.month_name || MONTH_NAMES[period.month - 1] || '';
            const yearStr = period.year?.toString() || '';
            const searchLower = searchTerm.toLowerCase();

            const matchesSearch =
                monthName.toLowerCase().includes(searchLower) ||
                yearStr.includes(searchLower) ||
                (period.message &&
                    period.message.toLowerCase().includes(searchLower));

            let matchesStatus = true;

            if (filterStatus === 'current') {
                matchesStatus = period.is_current;
            } else if (filterStatus === 'upcoming') {
                matchesStatus = period.is_upcoming;
            } else if (filterStatus === 'active') {
                matchesStatus = period.is_active;
            } else if (filterStatus === 'closed') {
                matchesStatus = !period.is_active || period.is_past;
            }

            const matchesYear =
                selectedYear === 'all' ||
                period.year.toString() === selectedYear;

            return matchesSearch && matchesStatus && matchesYear;
        });
    }, [enrichedPeriods, searchTerm, filterStatus, selectedYear]);

    const totalPages = Math.ceil(filteredPeriods.length / itemsPerPage);
    const paginatedPeriods = filteredPeriods.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    const deletePeriod = (id: number, monthName: string, year: number) => {
        if (
            !confirm(
                `¿Eliminar período de ${monthName} ${year}? Esta acción no se puede deshacer.`,
            )
        ) {
            return;
        }

        router.delete(`/admin/report-periods/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMessage('Período eliminado correctamente.');
                setTimeout(() => setSuccessMessage(null), 4000);
            },
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterStatus('all');
        setSelectedYear('all');
        setCurrentPage(1);
    };

    const formatDateReadable = (dateStr: string) => {
        if (!dateStr) {
            return '';
        }

        const parts = dateStr.split('-');

        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }

        const d = new Date(dateStr);

        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    return (
        <div className="min-h-screen p-4 md:p-6">
            <Head title="Períodos por Mes" />

            <div className="mx-auto w-full max-w-7xl space-y-6">
                {/* ===== HERO / ENCABEZADO MODERNO ===== */}
                <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 p-6 text-white shadow-xl md:p-8">
                    <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-blue-500/10 blur-2xl" />

                    <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-purple-200 backdrop-blur-md">
                                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                                <span>Administración de Plazos UPDI</span>
                            </div>
                            <h1 className="text-xl font-extrabold tracking-tight text-white md:text-2xl">
                                Períodos de Conformidad por Mes
                            </h1>
                            <p className="max-w-2xl text-xs leading-relaxed text-slate-300 md:text-sm">
                                Define y controla las ventanas de tiempo en las
                                que los directores pueden enviar los oficios de
                                conformidad de servicio de internet.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/admin/report-periods/create"
                                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:scale-105 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 hover:shadow-indigo-500/50 active:scale-95"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Nuevo Período</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ===== MÉTRICAS / KPI CARDS ===== */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                    {/* Total */}
                    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-white/10 dark:bg-slate-800/60">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500 dark:text-neutral-400">
                                Total Períodos
                            </span>
                            <div className="rounded-xl border border-purple-100 bg-purple-50 p-2 text-purple-600 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400">
                                <CalendarDays className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-gray-900 dark:text-white">
                                {stats.total}
                            </span>
                            <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                                registrados
                            </span>
                        </div>
                        <div className="mt-2 text-[10px] text-gray-400 dark:text-neutral-500">
                            Cobertura anual de oficios
                        </div>
                    </div>

                    {/* Vigentes / En recepción */}
                    <div className="rounded-2xl border border-emerald-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-emerald-500/20 dark:bg-slate-800/60">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                En Curso Ahora
                            </span>
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-2 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                                <Flame className="h-4 w-4 animate-pulse" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                {stats.active}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-500" />
                                Abierto
                            </span>
                        </div>
                        <div className="mt-2 text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
                            Recepción activa de directores
                        </div>
                    </div>

                    {/* Próximos */}
                    <div className="rounded-2xl border border-blue-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-blue-500/20 dark:bg-slate-800/60">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                                Próximos a Abrir
                            </span>
                            <div className="rounded-xl border border-blue-100 bg-blue-50 p-2 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                                <Clock className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                {stats.upcoming}
                            </span>
                            <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                                programados
                            </span>
                        </div>
                        <div className="mt-2 text-[10px] text-blue-600/80 dark:text-blue-400/80">
                            Agendados para fechas futuras
                        </div>
                    </div>

                    {/* Finalizados / Inactivos */}
                    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-white/10 dark:bg-slate-800/60">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500 dark:text-neutral-400">
                                Cerrados / Inactivos
                            </span>
                            <div className="rounded-xl bg-gray-100 p-2 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400">
                                <XCircle className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-gray-700 dark:text-neutral-300">
                                {stats.inactiveOrClosed}
                            </span>
                            <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                                concluidos
                            </span>
                        </div>
                        <div className="mt-2 text-[10px] text-gray-400 dark:text-neutral-500">
                            Plazo vencido o desactivado
                        </div>
                    </div>
                </div>

                {/* ===== ALERTAS FLASH ===== */}
                {successMessage && (
                    <div className="flex animate-in items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 shadow-sm duration-300 fade-in slide-in-from-top dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span className="flex-1 font-medium">
                            {successMessage}
                        </span>
                        <button
                            onClick={() => setSuccessMessage(null)}
                            className="rounded-lg p-1 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-800/50"
                        >
                            <X className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        </button>
                    </div>
                )}

                {errorMessage && (
                    <div className="flex animate-in items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 shadow-sm duration-300 fade-in slide-in-from-top dark:border-rose-800/50 dark:bg-rose-950/40 dark:text-rose-300">
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                        <span className="flex-1 font-medium">
                            {errorMessage}
                        </span>
                        <button
                            onClick={() => setErrorMessage(null)}
                            className="rounded-lg p-1 transition-colors hover:bg-rose-100 dark:hover:bg-rose-800/50"
                        >
                            <X className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                        </button>
                    </div>
                )}

                {/* ===== BARRA DE CONTROL: FILTROS + SELECTOR DE VISTA ===== */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-sm md:p-4 dark:border-white/10 dark:bg-slate-800/60">
                    <div className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
                        {/* Buscador */}
                        <div className="relative min-w-[200px] flex-1">
                            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
                            <input
                                type="text"
                                placeholder="Buscar por mes, año o mensaje..."
                                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pr-9 pl-10 text-xs text-gray-900 transition-all outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-slate-900/50 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Filtros tipo pills */}
                        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                            {[
                                { id: 'all', label: 'Todos' },
                                { id: 'current', label: '🟢 En Curso' },
                                { id: 'upcoming', label: '🔵 Próximos' },
                                { id: 'closed', label: '⚪ Concluidos' },
                            ].map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => {
                                        setFilterStatus(filter.id);
                                        setCurrentPage(1);
                                    }}
                                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                                        filterStatus === filter.id
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10'
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            ))}

                            {/* Selector de Año */}
                            {availableYears.length > 1 && (
                                <select
                                    value={selectedYear}
                                    onChange={(e) => {
                                        setSelectedYear(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="rounded-xl border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 outline-none dark:border-white/10 dark:bg-white/5 dark:text-neutral-300"
                                >
                                    <option value="all">Todos los años</option>
                                    {availableYears.map((year) => (
                                        <option
                                            key={year}
                                            value={year.toString()}
                                        >
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {(searchTerm ||
                                filterStatus !== 'all' ||
                                selectedYear !== 'all') && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium text-rose-600 transition-all hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                    title="Limpiar filtros"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    <span>Limpiar</span>
                                </button>
                            )}
                        </div>

                        {/* Toggle Grid vs Table */}
                        <div className="flex shrink-0 items-center gap-1 self-end rounded-xl border border-gray-200 bg-gray-50 p-1 lg:self-auto dark:border-white/10 dark:bg-slate-900/50">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                                    viewMode === 'grid'
                                        ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400'
                                        : 'text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white'
                                }`}
                                title="Vista en tarjetas"
                            >
                                <LayoutGrid className="h-3.5 w-3.5" />
                                <span>Tarjetas</span>
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                                    viewMode === 'table'
                                        ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400'
                                        : 'text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white'
                                }`}
                                title="Vista en tabla"
                            >
                                <List className="h-3.5 w-3.5" />
                                <span>Tabla</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ===== CONTENIDO: VISTA TARJETAS (GRID) ===== */}
                {viewMode === 'grid' ? (
                    paginatedPeriods.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
                            {paginatedPeriods.map((period) => {
                                const gradient =
                                    MONTH_GRADIENTS[
                                        (period.month - 1) %
                                            MONTH_GRADIENTS.length
                                    ];

                                return (
                                    <div
                                        key={period.id}
                                        className={`group relative overflow-hidden rounded-3xl border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-800/60 ${
                                            period.is_current
                                                ? 'border-emerald-300 ring-1 shadow-emerald-500/5 ring-emerald-500/20 dark:border-emerald-500/30'
                                                : period.is_upcoming
                                                  ? 'border-blue-200 dark:border-blue-500/20'
                                                  : 'border-gray-200/80 dark:border-white/10'
                                        }`}
                                    >
                                        {/* Luz decorativa superior */}
                                        <div
                                            className={`h-1.5 w-full bg-gradient-to-r ${gradient}`}
                                        />

                                        <div className="space-y-4 p-5">
                                            {/* Cabecera de la tarjeta */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${gradient} flex shrink-0 flex-col items-center justify-center text-white shadow-md shadow-indigo-500/10`}
                                                    >
                                                        <span className="text-[10px] font-bold tracking-wider uppercase">
                                                            {MONTH_NAMES[
                                                                period.month - 1
                                                            ]?.substring(0, 3)}
                                                        </span>
                                                        <span className="text-sm leading-none font-black">
                                                            {period.month
                                                                .toString()
                                                                .padStart(
                                                                    2,
                                                                    '0',
                                                                )}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-bold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                                                            {period.month_name ||
                                                                MONTH_NAMES[
                                                                    period.month -
                                                                        1
                                                                ]}
                                                        </h3>
                                                        <p className="text-xs font-medium text-gray-500 dark:text-neutral-400">
                                                            Año fiscal{' '}
                                                            {period.year}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Badge de estado */}
                                                <div>
                                                    {period.is_current ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-400">
                                                            <span className="relative flex h-1.5 w-1.5">
                                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                            </span>
                                                            En curso
                                                        </span>
                                                    ) : period.is_upcoming ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/15 dark:text-blue-400">
                                                            <Clock className="h-3 w-3" />
                                                            Próximo
                                                        </span>
                                                    ) : period.is_active ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400">
                                                            Finalizado
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-100 px-2.5 py-1 text-[11px] font-medium text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/15 dark:text-rose-400">
                                                            <XCircle className="h-3 w-3" />
                                                            Inactivo
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Fechas de vigencia */}
                                            <div className="space-y-2 rounded-2xl border border-gray-200/60 bg-gray-50/80 p-3 dark:border-white/5 dark:bg-slate-900/40">
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-1.5 font-medium text-gray-600 dark:text-neutral-300">
                                                        <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                                                        <span>Vigencia:</span>
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-gray-900 dark:text-white">
                                                        {formatDateReadable(
                                                            period.start_date_clean,
                                                        )}{' '}
                                                        -{' '}
                                                        {formatDateReadable(
                                                            period.end_date_clean,
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-neutral-400">
                                                    <span>
                                                        Duración:{' '}
                                                        {period.duration_days}{' '}
                                                        días
                                                    </span>
                                                    {period.is_current && (
                                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                            {period.days_remaining ===
                                                            0
                                                                ? '¡Vence hoy!'
                                                                : `Quedan ${period.days_remaining} días`}
                                                        </span>
                                                    )}
                                                    {period.is_upcoming && (
                                                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                            Abre en{' '}
                                                            {
                                                                period.days_remaining
                                                            }{' '}
                                                            días
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Barra de progreso si está en curso */}
                                                {period.is_current && (
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-700">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
                                                            style={{
                                                                width: `${period.progress_percent}%`,
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Mensaje adicional si existe */}
                                            {period.message ? (
                                                <div className="flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50/50 p-2.5 text-xs text-indigo-900 dark:border-indigo-900/30 dark:bg-indigo-950/20 dark:text-indigo-300">
                                                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" />
                                                    <span className="line-clamp-2 leading-relaxed">
                                                        {period.message}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="px-1 text-[11px] text-gray-400 italic dark:text-neutral-500">
                                                    Sin observaciones
                                                    personalizadas
                                                </div>
                                            )}

                                            {/* Acciones */}
                                            <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-white/5">
                                                <Link
                                                    href={`/admin/report-periods/${period.id}/edit`}
                                                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200/80 bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                    <span>Editar</span>
                                                </Link>

                                                <button
                                                    onClick={() =>
                                                        deletePeriod(
                                                            period.id,
                                                            period.month_name,
                                                            period.year,
                                                        )
                                                    }
                                                    className="rounded-xl border border-transparent p-2 text-gray-400 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:border-rose-800 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                                                    title="Eliminar período"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-white/10 dark:bg-slate-800/50">
                            <div className="mx-auto max-w-md space-y-4">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-500 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                                    <CalendarDays className="h-8 w-8" />
                                </div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    No se encontraron períodos
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-neutral-400">
                                    {searchTerm ||
                                    filterStatus !== 'all' ||
                                    selectedYear !== 'all'
                                        ? 'Intenta ajustar tus términos de búsqueda o cambiar los filtros seleccionados.'
                                        : 'Aún no se han configurado períodos de entrega de oficios. Comienza agregando uno.'}
                                </p>
                                <div className="pt-2">
                                    {searchTerm ||
                                    filterStatus !== 'all' ||
                                    selectedYear !== 'all' ? (
                                        <button
                                            onClick={clearFilters}
                                            className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-200 dark:bg-white/5 dark:text-neutral-300"
                                        >
                                            Restablecer filtros
                                        </button>
                                    ) : (
                                        <Link
                                            href="/admin/report-periods/create"
                                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700"
                                        >
                                            <Plus className="h-4 w-4" />
                                            <span>Crear Primer Período</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                ) : (
                    /* ===== VISTA DE TABLA DETALLADA ===== */
                    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-slate-800/60">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-gray-200 bg-gray-50/80 text-[10px] font-semibold tracking-wider text-gray-500 uppercase dark:border-white/10 dark:bg-slate-900/60 dark:text-neutral-400">
                                    <tr>
                                        <th className="px-5 py-3.5">
                                            Mes / Año
                                        </th>
                                        <th className="px-5 py-3.5">
                                            Vigencia Oficial
                                        </th>
                                        <th className="px-5 py-3.5">Estado</th>
                                        <th className="px-5 py-3.5">
                                            Duración
                                        </th>
                                        <th className="px-5 py-3.5">
                                            Mensaje al Director
                                        </th>
                                        <th className="px-5 py-3.5 text-right">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {paginatedPeriods.length > 0 ? (
                                        paginatedPeriods.map((period) => {
                                            const gradient =
                                                MONTH_GRADIENTS[
                                                    (period.month - 1) %
                                                        MONTH_GRADIENTS.length
                                                ];

                                            return (
                                                <tr
                                                    key={period.id}
                                                    className="transition-colors hover:bg-indigo-50/30 dark:hover:bg-white/5"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={`h-9 w-9 rounded-xl bg-gradient-to-br ${gradient} flex shrink-0 items-center justify-center text-xs font-black text-white shadow-sm`}
                                                            >
                                                                {period.month
                                                                    .toString()
                                                                    .padStart(
                                                                        2,
                                                                        '0',
                                                                    )}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-gray-900 dark:text-white">
                                                                    {period.month_name ||
                                                                        MONTH_NAMES[
                                                                            period.month -
                                                                                1
                                                                        ]}
                                                                </div>
                                                                <div className="text-[11px] font-medium text-gray-500 dark:text-neutral-400">
                                                                    Año{' '}
                                                                    {
                                                                        period.year
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-neutral-300">
                                                            <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                                                            <span>
                                                                {formatDateReadable(
                                                                    period.start_date_clean,
                                                                )}{' '}
                                                                -{' '}
                                                                {formatDateReadable(
                                                                    period.end_date_clean,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        {period.is_current ? (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-400">
                                                                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-500" />
                                                                En curso (
                                                                {
                                                                    period.days_remaining
                                                                }
                                                                d)
                                                            </span>
                                                        ) : period.is_upcoming ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/15 dark:text-blue-400">
                                                                Próximo
                                                            </span>
                                                        ) : period.is_active ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400">
                                                                Concluido
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-100 px-2.5 py-0.5 text-[11px] font-medium text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/15 dark:text-rose-400">
                                                                Inactivo
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 text-gray-600 dark:text-neutral-400">
                                                        {period.duration_days}{' '}
                                                        días
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className="line-clamp-1 max-w-[220px] text-gray-600 dark:text-neutral-400">
                                                            {period.message || (
                                                                <span className="text-gray-400 italic">
                                                                    Sin mensaje
                                                                </span>
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Link
                                                                href={`/admin/report-periods/${period.id}/edit`}
                                                                className="rounded-lg bg-gray-100 p-1.5 text-gray-600 transition-all hover:bg-indigo-100 hover:text-indigo-600 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-300"
                                                                title="Editar"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() =>
                                                                    deletePeriod(
                                                                        period.id,
                                                                        period.month_name,
                                                                        period.year,
                                                                    )
                                                                }
                                                                className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-12 text-center text-gray-500 dark:text-neutral-400"
                                            >
                                                No se encontraron períodos con
                                                los filtros aplicados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ===== PAGINACIÓN ===== */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between rounded-2xl border border-gray-200/80 bg-white p-4 text-xs dark:border-white/10 dark:bg-slate-800/60">
                        <span className="text-gray-500 dark:text-neutral-400">
                            Mostrando {paginatedPeriods.length} de{' '}
                            {filteredPeriods.length} períodos
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                disabled={currentPage === 1}
                                className="rounded-lg border border-gray-200 p-1.5 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:hover:bg-white/5"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1,
                            ).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${
                                        currentPage === page
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-neutral-300 dark:hover:bg-white/5'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(totalPages, p + 1),
                                    )
                                }
                                disabled={currentPage === totalPages}
                                className="rounded-lg border border-gray-200 p-1.5 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:hover:bg-white/5"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Períodos de Conformidad', href: '#' },
    ],
};
