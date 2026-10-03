import { Link } from '@inertiajs/react';
import {
    Clock,
    AlertTriangle,
    CheckCircle2,
    ArrowRight,
    Info,
    Calendar,
    Flame,
} from 'lucide-react';

export interface FormattedPeriod {
    id: number;
    month: number;
    month_name: string;
    year: number;
    start_date: string;
    end_date: string;
    start_date_formatted: string;
    end_date_formatted: string;
    is_active?: boolean;
    message: string | null;
    is_current: boolean;
    is_upcoming: boolean;
    is_past: boolean;
    days_remaining: number;
    progress_percentage: number;
}

interface PeriodCountdownCardProps {
    periods?: FormattedPeriod[];
    compact?: boolean;
    showAction?: boolean;
}

export function PeriodCountdownCard({
    periods = [],
    compact = false,
    showAction = true,
}: PeriodCountdownCardProps) {
    if (!periods || periods.length === 0) {
        return null;
    }

    // Seleccionar el período prioritario: el actual activo, o el próximo más cercano
    const activePeriod =
        periods.find((p) => p.is_current) ||
        periods.find((p) => p.is_upcoming) ||
        periods[0];

    if (!activePeriod) {
        return null;
    }

    const {
        month_name,
        year,
        start_date_formatted,
        end_date_formatted,
        message,
        is_current,
        is_upcoming,
        is_past,
        days_remaining,
        progress_percentage,
    } = activePeriod;

    // Determinar niveles de urgencia
    const isCritical = is_current && days_remaining <= 2;
    const isWarning = is_current && days_remaining > 2 && days_remaining <= 5;
    const isNormal = is_current && days_remaining > 5;

    // Estilos según el estado
    let badgeBg =
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20';
    let progressGradient = 'from-emerald-500 to-teal-600';
    let cardBorder = 'border-emerald-200/80 dark:border-emerald-500/20';
    let cardBg =
        'bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 dark:from-emerald-950/20 dark:via-slate-900/50 dark:to-teal-950/10';

    if (isCritical) {
        badgeBg =
            'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border-rose-200 dark:border-rose-500/30';
        progressGradient = 'from-rose-500 to-red-600';
        cardBorder =
            'border-rose-300 dark:border-rose-500/30 shadow-rose-500/5';
        cardBg =
            'bg-gradient-to-br from-rose-50/60 via-white to-red-50/40 dark:from-rose-950/25 dark:via-slate-900/50 dark:to-red-950/15';
    } else if (isWarning) {
        badgeBg =
            'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-500/30';
        progressGradient = 'from-amber-500 to-orange-600';
        cardBorder =
            'border-amber-300 dark:border-amber-500/30 shadow-amber-500/5';
        cardBg =
            'bg-gradient-to-br from-amber-50/60 via-white to-orange-50/30 dark:from-amber-950/20 dark:via-slate-900/50 dark:to-orange-950/10';
    } else if (is_upcoming) {
        badgeBg =
            'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-blue-200 dark:border-blue-500/30';
        progressGradient = 'from-blue-500 to-indigo-600';
        cardBorder = 'border-blue-200 dark:border-blue-500/20';
        cardBg =
            'bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-blue-950/20 dark:via-slate-900/50 dark:to-indigo-950/10';
    } else if (is_past) {
        badgeBg =
            'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300 border-gray-200 dark:border-white/10';
        progressGradient = 'from-gray-400 to-gray-500';
        cardBorder = 'border-gray-200 dark:border-white/10';
        cardBg = 'bg-white dark:bg-slate-800/40';
    }

    if (compact) {
        return (
            <div
                className={`rounded-xl border p-3 ${cardBorder} ${cardBg} shadow-sm transition-all`}
            >
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        {isCritical ? (
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                            </span>
                        ) : (
                            <Clock
                                className={`h-3.5 w-3.5 ${isCritical ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-emerald-500'}`}
                            />
                        )}
                        <span className="text-[11px] font-semibold text-gray-900 dark:text-white">
                            {month_name} {year}:
                        </span>
                        <span className="text-[11px] text-gray-600 dark:text-neutral-300">
                            {is_current ? (
                                days_remaining === 0 ? (
                                    <strong className="text-rose-600 dark:text-rose-400">
                                        ¡Hoy es el último día!
                                    </strong>
                                ) : (
                                    <>
                                        Quedan{' '}
                                        <strong
                                            className={
                                                isCritical
                                                    ? 'text-rose-600 dark:text-rose-400'
                                                    : isWarning
                                                      ? 'text-amber-600 dark:text-amber-400'
                                                      : 'text-emerald-600 dark:text-emerald-400'
                                            }
                                        >
                                            {days_remaining}{' '}
                                            {days_remaining === 1
                                                ? 'día'
                                                : 'días'}
                                        </strong>{' '}
                                        para enviar (cierra el{' '}
                                        {end_date_formatted})
                                    </>
                                )
                            ) : is_upcoming ? (
                                <>
                                    Inicia en {days_remaining} días (
                                    {start_date_formatted})
                                </>
                            ) : (
                                <>Período finalizado el {end_date_formatted}</>
                            )}
                        </span>
                    </div>
                    <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${badgeBg}`}
                    >
                        {is_current
                            ? '🟢 En recepción'
                            : is_upcoming
                              ? '🔵 Próximo'
                              : '⚪ Concluido'}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`relative overflow-hidden rounded-2xl border ${cardBorder} ${cardBg} p-4 shadow-sm transition-all duration-300 md:p-5`}
        >
            {/* Fondo decorativo */}
            <div className="pointer-events-none absolute top-0 right-0 -mt-6 -mr-6 h-32 w-32 rounded-full bg-current opacity-[0.03] blur-2xl" />

            <div className="relative flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                {/* Lado izquierdo: Ícono y Datos del período */}
                <div className="flex items-start gap-3.5 sm:items-center">
                    <div
                        className={`shrink-0 rounded-xl p-2.5 ${
                            isCritical
                                ? 'bg-rose-100 text-rose-600 ring-2 ring-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400'
                                : isWarning
                                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                                  : is_upcoming
                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                                    : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                        }`}
                    >
                        {isCritical ? (
                            <Flame className="h-5 w-5 animate-pulse" />
                        ) : isWarning ? (
                            <AlertTriangle className="h-5 w-5" />
                        ) : (
                            <Clock className="h-5 w-5" />
                        )}
                    </div>

                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xs font-bold text-gray-900 md:text-sm dark:text-white">
                                Período de Conformidad: {month_name} {year}
                            </h3>
                            <span
                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${badgeBg}`}
                            >
                                {is_current && (
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span
                                            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${isCritical ? 'bg-rose-400' : 'bg-emerald-400'} opacity-75`}
                                        ></span>
                                        <span
                                            className={`relative inline-flex h-1.5 w-1.5 rounded-full ${isCritical ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                        ></span>
                                    </span>
                                )}
                                {is_current
                                    ? 'Plazo Abierto'
                                    : is_upcoming
                                      ? 'Próxima Apertura'
                                      : 'Plazo Concluido'}
                            </span>
                        </div>

                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-600 dark:text-neutral-300">
                            <span className="inline-flex items-center gap-1 font-medium">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                Plazo oficial: {start_date_formatted} al{' '}
                                {end_date_formatted}
                            </span>
                            {is_current && (
                                <span className="hidden text-gray-400 sm:inline dark:text-neutral-500">
                                    •
                                </span>
                            )}
                            {is_current && (
                                <span
                                    className={`font-semibold ${
                                        isCritical
                                            ? 'text-rose-600 dark:text-rose-400'
                                            : isWarning
                                              ? 'text-amber-600 dark:text-amber-400'
                                              : 'text-emerald-700 dark:text-emerald-300'
                                    }`}
                                >
                                    {days_remaining === 0
                                        ? '⚠️ ¡Hoy vence el plazo de recepción!'
                                        : `⏳ Quedan ${days_remaining} ${days_remaining === 1 ? 'día restante' : 'días restantes'}`}
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Lado derecho: Acción rápida */}
                {showAction && is_current && (
                    <div className="flex w-full shrink-0 items-center gap-2 md:w-auto">
                        <Link
                            href="/reportes/nuevo"
                            className={`flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r px-3.5 py-2 text-[11px] font-medium text-white shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95 md:w-auto ${progressGradient}`}
                        >
                            <span>Registrar Reporte de {month_name}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                )}
            </div>

            {/* Barra de progreso de tiempo transcurrido */}
            {is_current && (
                <div className="mt-3.5 border-t border-gray-200/60 pt-3 dark:border-white/5">
                    <div className="mb-1.5 flex items-center justify-between text-[10px] font-medium text-gray-500 dark:text-neutral-400">
                        <span>Inicio: {start_date_formatted}</span>
                        <span>
                            {progress_percentage}% del plazo transcurrido
                        </span>
                        <span>Cierre: {end_date_formatted}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-800">
                        <div
                            className={`h-full bg-gradient-to-r ${progressGradient} rounded-full transition-all duration-500`}
                            style={{
                                width: `${Math.min(100, Math.max(5, progress_percentage))}%`,
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Mensaje adicional configurado por el Administrador */}
            {message && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-gray-200/70 bg-white/70 p-2.5 text-[11px] text-gray-700 dark:border-white/5 dark:bg-black/20 dark:text-neutral-300">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                    <span>{message}</span>
                </div>
            )}
        </div>
    );
}
