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
    Info,
    Edit2,
    Calendar as CalendarIcon,
    Pencil,
    Eye,
    EyeOff,
    CalendarRange
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

export default function Edit({ period, flash }: Props) {
    const defaultPeriod = {
        id: 0,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        month_name: 'Enero',
        start_date: '',
        end_date: '',
        date_range: '',
        is_active: true,
        message: '',
        created_by: 0,
        updated_by: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    const currentPeriod = period || defaultPeriod;

    const { data, setData, put, processing, errors } = useForm({
        start_date: currentPeriod.start_date || '',
        end_date: currentPeriod.end_date || '',
        is_active: currentPeriod.is_active ?? true,
        message: currentPeriod.message || '',
    });

    const [successMessage, setSuccessMessage] = useState<string | null>(flash?.success || null);
    const [errorMessage, setErrorMessage] = useState<string | null>(flash?.error || null);
    const [showPreview, setShowPreview] = useState(true);

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

    const currentMonth = months.find(m => m.value === currentPeriod.month);
    const monthDisplay = currentMonth ? currentMonth.label : currentPeriod.month_name;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/report-periods/${currentPeriod.id}`, {
            preserveScroll: true,
            onSuccess: (page) => {
                const flashData = page.props.flash as { success?: string; error?: string } | undefined;
                if (flashData?.success) {
                    setSuccessMessage(flashData.success);
                    setTimeout(() => setSuccessMessage(null), 5000);
                }
            },
            onError: (errors) => {
                const errorMsg = Object.values(errors)[0] || 'Error al actualizar el período.';
                setErrorMessage(errorMsg);
                setTimeout(() => setErrorMessage(null), 5000);
            }
        });
    };

    const getMonthColor = (month: number) => {
        const colors = [
            'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/25',
            'bg-pink-100 dark:bg-pink-500/15 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-500/25',
            'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/25',
            'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/25',
            'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/25',
            'bg-cyan-100 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/25',
            'bg-teal-100 dark:bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/25',
            'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25',
            'bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/25',
            'bg-lime-100 dark:bg-lime-500/15 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-500/25',
            'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25',
            'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/25',
        ];
        return colors[month - 1] || colors[0];
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'No definida';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const formatDateInput = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        } catch {
            return dateString;
        }
    };

    const getDaysRemaining = () => {
        if (!data.start_date || !data.end_date) return 0;
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return diff + 1;
    };

    const daysRemaining = getDaysRemaining();

    return (
        <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
            <Head title={`Editar Período - ${monthDisplay} ${currentPeriod.year}`} />

            <div className="max-w-4xl mx-auto w-full space-y-4">

                {/* ===== HEADER ===== */}
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-xl border border-purple-200 dark:border-purple-500/20">
                                <Edit2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h1 className="text-[11px] font-bold text-gray-900 dark:text-white">
                                    Editar Período
                                </h1>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${getMonthColor(currentPeriod.month)}`}>
                                        <CalendarIcon className="w-3.5 h-3.5" />
                                        {monthDisplay} {currentPeriod.year}
                                    </span>
                                    <span className="text-[11px] text-gray-500 dark:text-neutral-400 flex items-center gap-1">
                                        <CalendarRange className="w-3.5 h-3.5" />
                                        {currentPeriod.date_range || `${formatDate(currentPeriod.start_date)} - ${formatDate(currentPeriod.end_date)}`}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Link
                            href="/admin/report-periods"
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-neutral-300 rounded-xl text-[11px] font-medium transition-all border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver a la lista
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    
                    {/* ===== FORMULARIO ===== */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                            <form onSubmit={handleSubmit} className="space-y-4">

                                {errors && Object.keys(errors).length > 0 && (
                                    <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl flex items-start gap-3">
                                        <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[11px] font-medium text-rose-700 dark:text-rose-400">
                                                Error al actualizar el período
                                            </p>
                                            <ul className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 space-y-0.5">
                                                {Object.values(errors).map((error, index) => (
                                                    <li key={index}>• {error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* Información del período */}
                                <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <label className="text-[11px] font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                                                    Mes
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${getMonthColor(currentPeriod.month)}`}>
                                                        {monthDisplay}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="text-[11px] font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                                                    Año
                                                </label>
                                                <p className="text-[11px] font-medium text-gray-900 dark:text-white">
                                                    {currentPeriod.year}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-[11px] text-gray-400 dark:text-neutral-500">
                                            ID: #{currentPeriod.id}
                                        </div>
                                    </div>
                                </div>

                                {/* Fechas */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                                            Fecha de inicio <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={formatDateInput(data.start_date)}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                            className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 px-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                            required
                                        />
                                        {errors.start_date && (
                                            <p className="text-rose-500 text-[11px] mt-1">{errors.start_date}</p>
                                        )}
                                        <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1">
                                            Fecha actual: {formatDate(data.start_date)}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                            Fecha de fin <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={formatDateInput(data.end_date)}
                                            onChange={(e) => setData('end_date', e.target.value)}
                                            className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 px-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                            required
                                        />
                                        {errors.end_date && (
                                            <p className="text-rose-500 text-[11px] mt-1">{errors.end_date}</p>
                                        )}
                                        <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1">
                                            Fecha actual: {formatDate(data.end_date)}
                                        </p>
                                    </div>
                                </div>

                                {/* Estado Activo */}
                                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-white/20 focus:ring-blue-500"
                                        />
                                        <div className="flex-1">
                                            <span className="text-[11px] font-medium text-gray-900 dark:text-white">
                                                {data.is_active ? '✅ Período activo' : '⛔ Período inactivo'}
                                            </span>
                                            <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                                {data.is_active 
                                                    ? 'Los directores podrán enviar reportes dentro de este período'
                                                    : 'Los directores NO podrán enviar reportes en este período'
                                                }
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                {/* Mensaje */}
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

                                {/* Botones */}
                                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Actualizando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Actualizar Período
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
                    </div>

                    {/* ===== PANEL LATERAL ===== */}
                    <div className="lg:col-span-1 space-y-4">
                        
                        {/* Resumen del Período */}
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm dark:shadow-2xl">
                            <h3 className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                                <CalendarDays className="w-4 h-4" />
                                Resumen del Período
                            </h3>
                            <div className="space-y-2 text-[11px]">
                                <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl border border-purple-200 dark:border-purple-500/20">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="w-3.5 h-3.5 text-purple-500" />
                                            <span className="text-gray-500 dark:text-neutral-400">Mes / Año</span>
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${getMonthColor(currentPeriod.month)}`}>
                                            {monthDisplay} {currentPeriod.year}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                                    <span className="text-gray-500 dark:text-neutral-400">Días de período</span>
                                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                        {daysRemaining} días
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                                    <span className="text-gray-500 dark:text-neutral-400">Estado</span>
                                    <span className={`font-medium ${data.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {data.is_active ? '✅ Activo' : '⛔ Inactivo'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Previsualización */}
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm dark:shadow-2xl">
                            <h3 className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Previsualización
                            </h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] text-gray-500 dark:text-neutral-400">Inicio</span>
                                        <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                                            {formatDate(data.start_date)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[11px] text-gray-500 dark:text-neutral-400">Fin</span>
                                        <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                                            {formatDate(data.end_date)}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-center text-[11px] text-gray-500 dark:text-neutral-400">
                                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                        {daysRemaining} días de período
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Auditoría */}
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm dark:shadow-2xl">
                            <h3 className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Auditoría
                            </h3>
                            <div className="space-y-2 text-[11px] text-gray-500 dark:text-neutral-400">
                                <div className="flex justify-between p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                                    <span className="font-medium">Creado</span>
                                    <span>{currentPeriod.created_at ? new Date(currentPeriod.created_at).toLocaleString('es-ES') : 'No disponible'}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                                    <span className="font-medium">Actualizado</span>
                                    <span>{currentPeriod.updated_at ? new Date(currentPeriod.updated_at).toLocaleString('es-ES') : 'No disponible'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Ayuda */}
                        <div className="bg-purple-50 dark:bg-purple-500/10 rounded-2xl border border-purple-200 dark:border-purple-500/20 p-4">
                            <div className="flex items-start gap-3">
                                <Info className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                                        ¿Qué puedes modificar?
                                    </h4>
                                    <ul className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 space-y-1 list-disc list-inside">
                                        <li><strong>Fechas:</strong> Cambia el rango permitido</li>
                                        <li><strong>Estado:</strong> Activa o desactiva el período</li>
                                        <li><strong>Mensaje:</strong> Personaliza el mensaje</li>
                                        <li>El mes y año no se modifican</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Períodos de Envío', href: '/admin/report-periods' },
        { title: 'Editar', href: '#' }
    ],
};