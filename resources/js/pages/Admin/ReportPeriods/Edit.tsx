import { Head, useForm, Link } from '@inertiajs/react';
import {
    Save,
    ArrowLeft,
    AlertCircle,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    Info,
    Edit2,
    Sparkles,
    CalendarDays,
} from 'lucide-react';
import { useState } from 'react';
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
    period: Period;
    flash?: {
        success?: string;
        error?: string;
    };
}

const MONTHS = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
];

export default function Edit({ period, flash }: Props) {
    const formatDateInput = (dateString: string) => {
        if (!dateString) {
            return '';
        }

        try {
            return dateString.split('T')[0];
        } catch {
            return dateString;
        }
    };

    const { data, setData, put, processing, errors } = useForm({
        start_date: formatDateInput(period?.start_date),
        end_date: formatDateInput(period?.end_date),
        is_active: period?.is_active ?? true,
        message: period?.message || '',
    });

    const [successMessage, setSuccessMessage] = useState<string | null>(
        flash?.success || null,
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(
        flash?.error || null,
    );

    const monthDisplay =
        period?.month_name ||
        MONTHS.find((m) => m.value === period?.month)?.label ||
        `Mes ${period?.month}`;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/report-periods/${period.id}`, {
            preserveScroll: true,
            onSuccess: (page) => {
                const flashData = page.props.flash as
                    { success?: string; error?: string } | undefined;

                if (flashData?.success) {
                    setSuccessMessage(flashData.success);
                    setTimeout(() => setSuccessMessage(null), 5000);
                }
            },
            onError: (errs) => {
                const errorMsg =
                    Object.values(errs)[0] || 'Error al actualizar el período.';
                setErrorMessage(errorMsg);
                setTimeout(() => setErrorMessage(null), 5000);
            },
        });
    };

    return (
        <div className="min-h-screen p-4 md:p-6">
            <Head title={`Editar Período - ${monthDisplay} ${period?.year}`} />

            <div className="mx-auto w-full max-w-4xl space-y-6">
                {/* ===== HEADER ===== */}
                <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 p-6 text-white shadow-xl md:p-8">
                    <div className="relative flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-purple-200 backdrop-blur-md">
                                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                                <span>Edición de Período Oficial</span>
                            </div>
                            <h1 className="text-xl font-black tracking-tight text-white md:text-2xl">
                                {monthDisplay} {period?.year}
                            </h1>
                            <p className="text-xs text-slate-300 md:text-sm">
                                Modifica las fechas límites de recepción y notas
                                visibles para los directores.
                            </p>
                        </div>

                        <Link
                            href="/admin/report-periods"
                            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Volver a la lista</span>
                        </Link>
                    </div>
                </div>

                {/* ===== ALERTAS ===== */}
                {successMessage && (
                    <div className="flex animate-in items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 fade-in dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span className="flex-1 font-medium">
                            {successMessage}
                        </span>
                    </div>
                )}

                {errorMessage && (
                    <div className="flex animate-in items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 fade-in dark:border-rose-800/50 dark:bg-rose-950/40 dark:text-rose-300">
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                        <span className="flex-1 font-medium">
                            {errorMessage}
                        </span>
                    </div>
                )}

                {/* ===== FORMULARIO ===== */}
                <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm md:p-8 dark:border-white/10 dark:bg-slate-800/60">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {errors && Object.keys(errors).length > 0 && (
                            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/20 dark:bg-rose-500/10">
                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                                <div>
                                    <p className="text-xs font-bold text-rose-700 dark:text-rose-400">
                                        Corrige los siguientes errores:
                                    </p>
                                    <ul className="mt-1 space-y-0.5 text-xs text-rose-600 dark:text-rose-400">
                                        {Object.values(errors).map(
                                            (error, index) => (
                                                <li key={index}>• {error}</li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Rango de Fechas */}
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-neutral-300">
                                    <Clock className="h-4 w-4 text-indigo-500" />
                                    <span>Fecha de Apertura (Inicio)</span>
                                    <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) =>
                                        setData('start_date', e.target.value)
                                    }
                                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-xs text-gray-900 transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-slate-900/50 dark:text-white"
                                    required
                                />
                                {errors.start_date && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.start_date}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-neutral-300">
                                    <Calendar className="h-4 w-4 text-indigo-500" />
                                    <span>Fecha Límite (Cierre)</span>
                                    <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) =>
                                        setData('end_date', e.target.value)
                                    }
                                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-xs text-gray-900 transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-slate-900/50 dark:text-white"
                                    required
                                />
                                {errors.end_date && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.end_date}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Switch de Estado Activo */}
                        <div className="rounded-2xl border border-gray-200/60 bg-gray-50/80 p-4 dark:border-white/5 dark:bg-slate-900/40">
                            <label className="flex cursor-pointer items-center gap-3.5">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) =>
                                        setData('is_active', e.target.checked)
                                    }
                                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                    <span className="block text-xs font-bold text-gray-900 dark:text-white">
                                        Período habilitado
                                    </span>
                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                        Si está desmarcado, los directores no
                                        podrán enviar reportes para este mes
                                        aunque estén dentro de las fechas.
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Mensaje */}
                        <div>
                            <label className="mb-2 block flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-neutral-300">
                                <Info className="h-4 w-4 text-indigo-500" />
                                <span>Mensaje / Aviso para los directores</span>
                            </label>
                            <textarea
                                value={data.message}
                                onChange={(e) =>
                                    setData('message', e.target.value)
                                }
                                placeholder="Ej: Recuerde registrar su conformidad antes del cierre del plazo oficial..."
                                rows={3}
                                className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-xs text-gray-900 transition-all outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-slate-900/50 dark:text-white"
                            />
                            {errors.message && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {errors.message}
                                </p>
                            )}
                        </div>

                        {/* Botones de acción */}
                        <div className="flex flex-wrap items-center gap-3 border-t border-gray-200/80 pt-4 dark:border-white/10">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 hover:shadow-indigo-500/40 active:scale-[0.98] disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        <span>Guardando cambios...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        <span>Guardar Cambios</span>
                                    </>
                                )}
                            </button>

                            <Link
                                href="/admin/report-periods"
                                className="rounded-2xl border border-gray-300 bg-gray-100 px-5 py-3 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10"
                            >
                                Cancelar
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Períodos de Envío', href: '/admin/report-periods' },
        { title: 'Editar Período', href: '#' },
    ],
};
