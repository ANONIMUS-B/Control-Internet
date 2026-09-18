import { useState } from 'react';
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
    CalendarDays
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
        if (!dateString) return '';
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

    const [successMessage, setSuccessMessage] = useState<string | null>(flash?.success || null);
    const [errorMessage, setErrorMessage] = useState<string | null>(flash?.error || null);

    const monthDisplay = period?.month_name || MONTHS.find(m => m.value === period?.month)?.label || `Mes ${period?.month}`;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/report-periods/${period.id}`, {
            preserveScroll: true,
            onSuccess: (page) => {
                const flashData = page.props.flash as { success?: string; error?: string } | undefined;
                if (flashData?.success) {
                    setSuccessMessage(flashData.success);
                    setTimeout(() => setSuccessMessage(null), 5000);
                }
            },
            onError: (errs) => {
                const errorMsg = Object.values(errs)[0] || 'Error al actualizar el período.';
                setErrorMessage(errorMsg);
                setTimeout(() => setErrorMessage(null), 5000);
            }
        });
    };

    return (
        <div className="p-4 md:p-6 min-h-screen">
            <Head title={`Editar Período - ${monthDisplay} ${period?.year}`} />

            <div className="max-w-4xl mx-auto w-full space-y-6">

                {/* ===== HEADER ===== */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 p-6 md:p-8 text-white shadow-xl border border-indigo-500/20">
                    <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-purple-200">
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>Edición de Período Oficial</span>
                            </div>
                            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                                {monthDisplay} {period?.year}
                            </h1>
                            <p className="text-xs md:text-sm text-slate-300">
                                Modifica las fechas límites de recepción y notas visibles para los directores.
                            </p>
                        </div>

                        <Link
                            href="/admin/report-periods"
                            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-all duration-200"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Volver a la lista</span>
                        </Link>
                    </div>
                </div>

                {/* ===== ALERTAS ===== */}
                {successMessage && (
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-medium flex-1">{successMessage}</span>
                    </div>
                )}

                {errorMessage && (
                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-2xl flex items-center gap-3 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="font-medium flex-1">{errorMessage}</span>
                    </div>
                )}

                {/* ===== FORMULARIO ===== */}
                <div className="bg-white dark:bg-slate-800/60 rounded-3xl border border-gray-200/80 dark:border-white/10 p-6 md:p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {errors && Object.keys(errors).length > 0 && (
                            <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-rose-700 dark:text-rose-400">
                                        Corrige los siguientes errores:
                                    </p>
                                    <ul className="text-xs text-rose-600 dark:text-rose-400 mt-1 space-y-0.5">
                                        {Object.values(errors).map((error, index) => (
                                            <li key={index}>• {error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Rango de Fechas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-2 flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-indigo-500" />
                                    <span>Fecha de Apertura (Inicio)</span>
                                    <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    className="w-full rounded-2xl border border-gray-200 dark:border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all py-2.5 px-4 text-xs bg-gray-50/50 dark:bg-slate-900/50 text-gray-900 dark:text-white outline-none"
                                    required
                                />
                                {errors.start_date && (
                                    <p className="text-rose-500 text-xs mt-1">{errors.start_date}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-2 flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-indigo-500" />
                                    <span>Fecha Límite (Cierre)</span>
                                    <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    className="w-full rounded-2xl border border-gray-200 dark:border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all py-2.5 px-4 text-xs bg-gray-50/50 dark:bg-slate-900/50 text-gray-900 dark:text-white outline-none"
                                    required
                                />
                                {errors.end_date && (
                                    <p className="text-rose-500 text-xs mt-1">{errors.end_date}</p>
                                )}
                            </div>
                        </div>

                        {/* Switch de Estado Activo */}
                        <div className="p-4 bg-gray-50/80 dark:bg-slate-900/40 rounded-2xl border border-gray-200/60 dark:border-white/5">
                            <label className="flex items-center gap-3.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                    <span className="text-xs font-bold text-gray-900 dark:text-white block">
                                        Período habilitado
                                    </span>
                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                        Si está desmarcado, los directores no podrán enviar reportes para este mes aunque estén dentro de las fechas.
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Mensaje */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-2 flex items-center gap-1.5">
                                <Info className="w-4 h-4 text-indigo-500" />
                                <span>Mensaje / Aviso para los directores</span>
                            </label>
                            <textarea
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                placeholder="Ej: Recuerde registrar su conformidad antes del cierre del plazo oficial..."
                                rows={3}
                                className="w-full rounded-2xl border border-gray-200 dark:border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all py-2.5 px-4 text-xs bg-gray-50/50 dark:bg-slate-900/50 text-gray-900 dark:text-white outline-none resize-none placeholder:text-gray-400"
                            />
                            {errors.message && (
                                <p className="text-rose-500 text-xs mt-1">{errors.message}</p>
                            )}
                        </div>

                        {/* Botones de acción */}
                        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200/80 dark:border-white/10">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Guardando cambios...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Guardar Cambios</span>
                                    </>
                                )}
                            </button>

                            <Link
                                href="/admin/report-periods"
                                className="px-5 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-neutral-300 rounded-2xl text-xs font-semibold transition-all border border-gray-300 dark:border-white/10"
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
        { title: 'Editar Período', href: '#' }
    ],
};