import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { 
    Calendar, 
    Save, 
    ArrowLeft, 
    Info, 
    CheckCircle, 
    AlertCircle,
    X,
    Clock,
    CalendarDays,
    MessageSquare,
    Settings2,
    Shield,
    Users,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon
} from 'lucide-react';

interface Props {
    startDay: number;
    endDay: number;
    isEnabled: boolean;
    message: string | null;
    selectedMonth?: number;
    selectedYear?: number;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function ReportPeriodConfig({ 
    startDay, 
    endDay, 
    isEnabled, 
    message, 
    selectedMonth,
    selectedYear,
    flash 
}: Props) {
    const currentDate = new Date();
    const [currentMonth, setCurrentMonth] = useState<number>(selectedMonth || currentDate.getMonth() + 1);
    const [currentYear, setCurrentYear] = useState<number>(selectedYear || currentDate.getFullYear());

    const { data, setData, post, processing, errors } = useForm({
        start_day: startDay,
        end_day: endDay,
        enabled: isEnabled,
        message: message || '',
        month: currentMonth,
        year: currentYear,
    });

    const [successMessage, setSuccessMessage] = useState<string | null>(flash?.success || null);
    const [errorMessage, setErrorMessage] = useState<string | null>(flash?.error || null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/report-period', {
            onSuccess: (page) => {
                const flashData = page.props.flash as { success?: string; error?: string } | undefined;
                if (flashData?.success) {
                    setSuccessMessage(flashData.success);
                    setTimeout(() => setSuccessMessage(null), 5000);
                }
            },
            onError: (errors) => {
                const errorMsg = Object.values(errors)[0] || 'Error al guardar la configuración.';
                setErrorMessage(errorMsg);
                setTimeout(() => setErrorMessage(null), 5000);
            }
        });
    };

    const prevMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
        setData('month', currentMonth === 1 ? 12 : currentMonth - 1);
        setData('year', currentMonth === 1 ? currentYear - 1 : currentYear);
    };

    const nextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
        setData('month', currentMonth === 12 ? 1 : currentMonth + 1);
        setData('year', currentMonth === 12 ? currentYear + 1 : currentYear);
    };

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month - 1, 1).getDay();
    };

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const isWithinPeriod = (day: number) => {
        return data.enabled && day >= data.start_day && day <= data.end_day;
    };

    const getDayColor = (day: number) => {
        if (!data.enabled) return 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-neutral-500';
        if (day >= data.start_day && day <= data.end_day) {
            return 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20 font-bold';
        }
        return 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-neutral-400';
    };

    const getDayClass = (day: number) => {
        const base = 'text-center py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 ';
        const color = getDayColor(day);
        return base + color;
    };

    return (
        <>
            <Head title="Configurar Período de Envío" />

            <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                <div className="max-w-5xl mx-auto w-full space-y-4">
                    
                    {/* ===== HEADER ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-xl border border-purple-200 dark:border-purple-500/20">
                                    <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h1 className="text-[11px] font-bold text-gray-900 dark:text-white">
                                        Configurar Período de Envío
                                    </h1>
                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 flex items-center gap-2 mt-0.5">
                                        <Shield className="w-3.5 h-3.5 text-purple-500" />
                                        Solo disponible para Super Administradores
                                    </p>
                                </div>
                            </div>
                            <Link 
                                href="/dashboard" 
                                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-neutral-300 rounded-xl text-[11px] font-medium transition-all border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Volver al Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* ===== MENSAJES ===== */}
                    {successMessage && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-[11px] animate-in">
                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <p className="font-medium text-emerald-700 dark:text-emerald-400">{successMessage}</p>
                            <button 
                                onClick={() => setSuccessMessage(null)} 
                                className="ml-auto hover:bg-emerald-100 dark:hover:bg-emerald-800/50 p-1 rounded-lg transition-colors"
                            >
                                <X className="w-3.5 h-3.5 text-emerald-500" />
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
                                <X className="w-3.5 h-3.5 text-rose-500" />
                            </button>
                        </div>
                    )}

                    {/* ===== CONTENIDO PRINCIPAL ===== */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        
                        {/* ===== PANEL DE CONFIGURACIÓN ===== */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    
                                    {/* Estado de la restricción */}
                                    <div className="p-4 bg-blue-50 dark:bg-blue-500/5 rounded-xl border border-blue-200 dark:border-blue-500/20">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={data.enabled}
                                                    onChange={(e) => setData('enabled', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-300 dark:bg-white/10 rounded-full peer peer-checked:bg-blue-600 transition-all duration-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                                            </div>
                                            <div>
                                                <span className="text-[11px] font-medium text-gray-900 dark:text-white">
                                                    {data.enabled ? '✅ Restricción activa' : '⛔ Restricción desactivada'}
                                                </span>
                                                <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                                    {data.enabled 
                                                        ? 'Los directores solo podrán enviar reportes en el período seleccionado'
                                                        : 'Los directores podrán enviar reportes en cualquier fecha'
                                                    }
                                                </p>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Configuración de días */}
                                    {data.enabled && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                                                    Día de inicio
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={data.start_day}
                                                        onChange={(e) => {
                                                            const val = Math.min(28, Math.max(1, parseInt(e.target.value) || 1));
                                                            setData('start_day', val);
                                                        }}
                                                        min={1}
                                                        max={28}
                                                        className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 px-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                                    />
                                                </div>
                                                {errors.start_day && (
                                                    <p className="text-rose-500 text-[11px] mt-1">{errors.start_day}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                                                    <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
                                                    Día de fin
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={data.end_day}
                                                        onChange={(e) => {
                                                            const val = Math.min(31, Math.max(1, parseInt(e.target.value) || 1));
                                                            setData('end_day', val);
                                                        }}
                                                        min={1}
                                                        max={31}
                                                        className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 px-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                                    />
                                                </div>
                                                {errors.end_day && (
                                                    <p className="text-rose-500 text-[11px] mt-1">{errors.end_day}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Mensaje personalizado */}
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                                            <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                                            Mensaje personalizado (opcional)
                                        </label>
                                        <textarea
                                            value={data.message}
                                            onChange={(e) => setData('message', e.target.value)}
                                            placeholder="Ej: El período de envío de reportes es del 1 al 10 de cada mes..."
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

                                    {/* Botón guardar */}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Guardando configuración...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Guardar Configuración
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* ===== PANEL LATERAL - CALENDARIO E INFORMACIÓN ===== */}
                        <div className="lg:col-span-1 space-y-4">
                            
                            {/* Calendario */}
                            <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm dark:shadow-2xl">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300 flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4" />
                                        Previsualización
                                    </h3>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={prevMonth}
                                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-neutral-400" />
                                        </button>
                                        <span className="text-[11px] font-medium text-gray-700 dark:text-neutral-300 min-w-[80px] text-center">
                                            {monthNames[currentMonth - 1]} {currentYear}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={nextMonth}
                                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4 text-gray-500 dark:text-neutral-400" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-7 gap-1">
                                    {dayNames.map((day, i) => (
                                        <div key={i} className="text-center text-[10px] font-semibold text-gray-400 dark:text-neutral-500 py-1">
                                            {day}
                                        </div>
                                    ))}
                                    {Array.from({ length: firstDay }, (_, i) => (
                                        <div key={`empty-${i}`} className="text-center py-1.5"></div>
                                    ))}
                                    {days.map((day) => (
                                        <div
                                            key={day}
                                            className={getDayClass(day)}
                                        >
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Leyenda */}
                                <div className="mt-3 flex items-center justify-center gap-4 text-[11px]">
                                    <span className="flex items-center gap-1.5 text-gray-500 dark:text-neutral-400">
                                        <span className="w-3 h-3 rounded bg-gradient-to-br from-blue-500 to-indigo-500 inline-block"></span>
                                        Días permitidos
                                    </span>
                                    <span className="flex items-center gap-1.5 text-gray-500 dark:text-neutral-400">
                                        <span className="w-3 h-3 rounded bg-gray-200 dark:bg-white/5 inline-block"></span>
                                        Días no permitidos
                                    </span>
                                </div>
                            </div>

                            {/* Información de configuración actual */}
                            <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm dark:shadow-2xl">
                                <h3 className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                                    <Settings2 className="w-4 h-4" />
                                    Configuración actual
                                </h3>
                                <div className="space-y-2 text-[11px]">
                                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                                        <span className="text-gray-500 dark:text-neutral-400">Estado</span>
                                        <span className={`font-medium ${isEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                            {isEnabled ? '✅ Activo' : '⛔ Inactivo'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                                        <span className="text-gray-500 dark:text-neutral-400">Período</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {startDay} - {endDay}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                                        <span className="text-gray-500 dark:text-neutral-400">Mes</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {monthNames[currentMonth - 1]} {currentYear}
                                        </span>
                                    </div>
                                    {message && (
                                        <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                                            <span className="text-gray-500 dark:text-neutral-400 block mb-1">Mensaje</span>
                                            <span className="text-[11px] text-gray-700 dark:text-neutral-300">
                                                {message}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg border border-purple-200 dark:border-purple-500/20">
                                        <Users className="w-4 h-4 text-purple-500" />
                                        <span className="text-[11px] text-purple-600 dark:text-purple-400">
                                            Afecta a todos los directores del sistema
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Información de seguridad */}
                            <div className="bg-purple-50 dark:bg-purple-500/10 rounded-2xl border border-purple-200 dark:border-purple-500/20 p-4">
                                <div className="flex items-start gap-3">
                                    <Shield className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                                            Acceso restringido
                                        </h4>
                                        <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-1">
                                            Esta configuración solo está disponible para el Super Administrador. 
                                            Los cambios se aplican inmediatamente a todos los directores.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

ReportPeriodConfig.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Configurar Período', href: '#' }
    ],
};