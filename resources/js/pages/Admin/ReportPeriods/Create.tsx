import { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { 
    CalendarDays, 
    Save, 
    ArrowLeft, 
    AlertCircle,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    Info
} from 'lucide-react';
import { dashboard } from '@/routes';

interface Props {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Create({ flash }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        start_date: '',
        end_date: '',
        is_active: true,
        message: '',
    });

    const [successMessage, setSuccessMessage] = useState<string | null>(flash?.success || null);
    const [errorMessage, setErrorMessage] = useState<string | null>(flash?.error || null);

    const months = [
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

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/report-periods', {
            preserveScroll: true,
            onSuccess: (page) => {
                const flashData = page.props.flash as { success?: string; error?: string } | undefined;
                if (flashData?.success) {
                    setSuccessMessage(flashData.success);
                    setTimeout(() => setSuccessMessage(null), 5000);
                }
            },
            onError: (errors) => {
                const errorMsg = Object.values(errors)[0] || 'Error al guardar el período.';
                setErrorMessage(errorMsg);
                setTimeout(() => setErrorMessage(null), 5000);
            }
        });
    };

    return (
        <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
            <Head title="Crear Período de Envío" />

            <div className="max-w-3xl mx-auto w-full space-y-4">

                {/* ===== HEADER ===== */}
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-xl border border-purple-200 dark:border-purple-500/20">
                                <CalendarDays className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h1 className="text-[11px] font-bold text-gray-900 dark:text-white">
                                    Crear Período de Envío
                                </h1>
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                    Configura fechas personalizadas para un mes específico
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/admin/report-periods"
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-neutral-300 rounded-xl text-[11px] font-medium transition-all border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver
                        </Link>
                    </div>
                </div>

                {/* ===== MENSAJES ===== */}
                {successMessage && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-[11px] animate-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <p className="font-medium text-emerald-700 dark:text-emerald-400">{successMessage}</p>
                        <button 
                            onClick={() => setSuccessMessage(null)} 
                            className="ml-auto hover:bg-emerald-100 dark:hover:bg-emerald-800/50 p-1 rounded-lg transition-colors"
                        >
                            <XCircle className="w-3.5 h-3.5 text-emerald-500" />
                        </button>
                    </div>
                )}

                {errorMessage && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-[11px] animate-in">
                        <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        <p className="font-medium text-rose-700 dark:text-rose-400">{errorMessage}</p>
                        <button 
                            onClick={() => setErrorMessage(null)} 
                            className="ml-auto hover:bg-rose-100 dark:hover:bg-rose-800/50 p-1 rounded-lg transition-colors"
                        >
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        </button>
                    </div>
                )}

                {/* ===== FORMULARIO ===== */}
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {errors && Object.keys(errors).length > 0 && (
                            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl flex items-start gap-3">
                                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[11px] font-medium text-rose-700 dark:text-rose-400">
                                        Error al guardar el período
                                    </p>
                                    <ul className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 space-y-0.5">
                                        {Object.values(errors).map((error, index) => (
                                            <li key={index}>• {error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* ===== MES Y AÑO ===== */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-1.5">
                                    Mes <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.month}
                                    onChange={(e) => setData('month', parseInt(e.target.value))}
                                    className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 px-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                >
                                    {months.map((month) => (
                                        <option key={month.value} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.month && (
                                    <p className="text-rose-500 text-[11px] mt-1">{errors.month}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-1.5">
                                    Año <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.year}
                                    onChange={(e) => setData('year', parseInt(e.target.value))}
                                    className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 px-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                >
                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                                {errors.year && (
                                    <p className="text-rose-500 text-[11px] mt-1">{errors.year}</p>
                                )}
                            </div>
                        </div>

                        {/* ===== FECHAS ===== */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                                    Fecha de inicio <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 px-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                    required
                                />
                                {errors.start_date && (
                                    <p className="text-rose-500 text-[11px] mt-1">{errors.start_date}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                    Fecha de fin <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 px-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                    required
                                />
                                {errors.end_date && (
                                    <p className="text-rose-500 text-[11px] mt-1">{errors.end_date}</p>
                                )}
                            </div>
                        </div>

                        {/* ===== ESTADO ACTIVO ===== */}
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-white/20 focus:ring-blue-500"
                                />
                                <div>
                                    <span className="text-[11px] font-medium text-gray-900 dark:text-white">
                                        Período activo
                                    </span>
                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                        Los directores podrán enviar reportes dentro de este período
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* ===== MENSAJE ===== */}
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5 text-blue-500" />
                                Mensaje personalizado (opcional)
                            </label>
                            <textarea
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                placeholder="Ej: El período de envío para este mes es del 26 de junio al 3 de julio..."
                                rows={3}
                                className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 px-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white resize-none outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-500"
                            />
                            {errors.message && (
                                <p className="text-rose-500 text-[11px] mt-1">{errors.message}</p>
                            )}
                            <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1">
                                Este mensaje se mostrará a los directores cuando intenten enviar fuera del período
                            </p>
                        </div>

                        {/* ===== BOTONES ===== */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Crear Período
                                    </>
                                )}
                            </button>

                            <Link
                                href="/admin/report-periods"
                                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-neutral-300 rounded-xl text-[11px] font-medium transition-all border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                            >
                                Cancelar
                            </Link>
                        </div>
                    </form>
                </div>

                {/* ===== INFORMACIÓN DE AYUDA ===== */}
                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex-shrink-0 border border-blue-200 dark:border-blue-500/20">
                            <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                                ¿Cómo funcionan los períodos?
                            </h4>
                            <ul className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 space-y-1 list-disc list-inside">
                                <li>Cada mes puede tener fechas de inicio y fin personalizadas</li>
                                <li>Los directores solo podrán enviar reportes dentro del período configurado</li>
                                <li>Puedes tener períodos que crucen entre meses (ej: 26 junio - 3 julio)</li>
                                <li>Desactiva un período si no quieres que los directores envíen ese mes</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Create.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Períodos de Envío', href: '/admin/report-periods' },
        { title: 'Crear', href: '#' }
    ],
};