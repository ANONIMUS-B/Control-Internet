import { Head, usePage, router } from '@inertiajs/react';
import {
    Wifi,
    FileText,
    ShieldCheck,
    FileSignature,
    Building2,
    Users,
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingUp,
    Calendar,
    Award,
    Code,
    Mail,
    Construction,
    Power,
    PowerOff,
    X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { MissingSignatureAlert } from '@/components/missing-signature-alert';
import { dashboard } from '@/routes';

// ✅ DEFINIR LA INTERFAZ DE LOS PROPS
interface PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string; // ✅ Asegurar que role existe
            [key: string]: any;
        } | null;
    };
    [key: string]: any;
}

export default function Dashboard() {
    const currentYear = new Date().getFullYear();
    // ✅ SOLUCIÓN: Usar type assertion para evitar el error
    const { props } = usePage() as { props: PageProps };
    const user = props.auth?.user;
    const isSuperAdmin = user?.role === 'super_admin';

    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const checkMaintenanceStatus = async () => {
        try {
            const response = await fetch('/maintenance/status');
            const data = await response.json();
            setMaintenanceMode(data.maintenance_mode);
        } catch (error) {
            console.error('Error checking maintenance status:', error);
        }
    };

    useEffect(() => {
        if (isSuperAdmin) {
            checkMaintenanceStatus();
        }
    }, [isSuperAdmin]);

    const toggleMaintenance = async () => {
        if (
            !confirm(
                `¿Estás seguro de ${maintenanceMode ? 'DESACTIVAR' : 'ACTIVAR'} el modo mantenimiento?\n\n${maintenanceMode ? '🔓 Todos los usuarios podrán acceder nuevamente.' : '🔒 Solo el Super Admin podrá acceder al sistema.'}`,
            )
        ) {
            return;
        }

        setLoading(true);
        const url = maintenanceMode
            ? '/maintenance/disable'
            : '/maintenance/enable';

        router.post(
            url,
            {},
            {
                onSuccess: () => {
                    setMaintenanceMode(!maintenanceMode);
                    setLoading(false);
                    setShowModal(false);
                    router.reload();
                },
                onError: () => {
                    setLoading(false);
                    alert(
                        '❌ Error al cambiar el estado del modo mantenimiento.',
                    );
                },
            },
        );
    };

    return (
        <>
            <Head title="Panel Principal" />
            <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                {/* ===== BOTÓN DE MANTENIMIENTO (SOLO SUPER ADMIN) ===== */}
                {isSuperAdmin && (
                    <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`rounded-xl p-2.5 ${maintenanceMode ? 'bg-amber-100 dark:bg-amber-500/20' : 'bg-emerald-100 dark:bg-emerald-500/20'} border ${maintenanceMode ? 'border-amber-200 dark:border-amber-500/20' : 'border-emerald-200 dark:border-emerald-500/20'}`}
                                >
                                    <Construction
                                        className={`h-5 w-5 ${maintenanceMode ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                                    />
                                </div>
                                <div>
                                    <h3 className="flex items-center gap-2 text-[11px] font-bold text-gray-900 dark:text-white">
                                        Modo Mantenimiento 23
                                        <span
                                            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${maintenanceMode ? 'border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400' : 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400'}`}
                                        >
                                            {maintenanceMode
                                                ? '🔒 ACTIVADO'
                                                : '🔓 DESACTIVADO'}
                                        </span>
                                    </h3>
                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                        {maintenanceMode
                                            ? '⚠️ Solo el Super Admin puede acceder al sistema'
                                            : '✅ Todos los usuarios pueden acceder normalmente'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={toggleMaintenance}
                                disabled={loading}
                                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-medium text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:hover:scale-100 ${
                                    maintenanceMode
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700 hover:shadow-emerald-500/40'
                                        : 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/20 hover:from-amber-600 hover:to-orange-700 hover:shadow-amber-500/40'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Cargando...
                                    </>
                                ) : (
                                    <>
                                        {maintenanceMode ? (
                                            <>
                                                <PowerOff className="h-4 w-4" />
                                                Desactivar Mantenimiento
                                            </>
                                        ) : (
                                            <>
                                                <Power className="h-4 w-4" />
                                                Activar Mantenimiento
                                            </>
                                        )}
                                    </>
                                )}
                            </button>
                        </div>

                        {maintenanceMode && (
                            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                    <AlertCircle className="h-4 w-4" />
                                    <p className="text-[11px] font-medium">
                                        🔒 El sistema está en modo
                                        mantenimiento. Solo el Super Admin puede
                                        acceder.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ===== ALERTA DE FIRMA DIGITAL FALTANTE ===== */}
                <MissingSignatureAlert className="mb-4" />

                {/* ========================================== */}
                {/* SECCIÓN INFORMATIVA COMPLETA */}
                {/* ========================================== */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                    {/* ===== ENCABEZADO ===== */}
                    <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 shadow-lg shadow-blue-500/20">
                                <Wifi className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-[11px] font-bold text-gray-900 dark:text-white">
                                    Sistema de Conformidad de Internet
                                </h1>
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                    Gestión de reportes mensuales para
                                    instituciones educativas
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 dark:border-blue-500/20 dark:bg-blue-500/10">
                            <Award className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300">
                                Versión 1.0
                            </span>
                        </div>
                    </div>

                    {/* ===== TARJETAS DE FUNCIONALIDADES ===== */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="group relative overflow-hidden rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-blue-500/20 dark:from-blue-500/10 dark:to-blue-600/5">
                            <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-blue-200/30 blur-2xl transition-transform duration-500 group-hover:scale-150 dark:bg-blue-800/20"></div>
                            <div className="relative">
                                <div className="mb-2.5 w-fit rounded-xl border border-blue-200 bg-blue-100 p-2 dark:border-blue-500/20 dark:bg-blue-500/20">
                                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-[11px] font-semibold text-gray-900 dark:text-white">
                                    Reportes Mensuales
                                </h3>
                                <p className="mt-1 text-[11px] leading-relaxed text-gray-500 dark:text-neutral-400">
                                    Los directores registran el estado del
                                    servicio de internet cada mes
                                </p>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-500/20 dark:from-emerald-500/10 dark:to-emerald-600/5">
                            <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-emerald-200/30 blur-2xl transition-transform duration-500 group-hover:scale-150 dark:bg-emerald-800/20"></div>
                            <div className="relative">
                                <div className="mb-2.5 w-fit rounded-xl border border-emerald-200 bg-emerald-100 p-2 dark:border-emerald-500/20 dark:bg-emerald-500/20">
                                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className="text-[11px] font-semibold text-gray-900 dark:text-white">
                                    Validación UPDI
                                </h3>
                                <p className="mt-1 text-[11px] leading-relaxed text-gray-500 dark:text-neutral-400">
                                    El equipo de UPDI revisa, observa o aprueba
                                    los reportes enviados
                                </p>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-2xl border border-purple-200/50 bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-purple-500/20 dark:from-purple-500/10 dark:to-purple-600/5">
                            <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-purple-200/30 blur-2xl transition-transform duration-500 group-hover:scale-150 dark:bg-purple-800/20"></div>
                            <div className="relative">
                                <div className="mb-2.5 w-fit rounded-xl border border-purple-200 bg-purple-100 p-2 dark:border-purple-500/20 dark:bg-purple-500/20">
                                    <FileSignature className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="text-[11px] font-semibold text-gray-900 dark:text-white">
                                    Firma Digital
                                </h3>
                                <p className="mt-1 text-[11px] leading-relaxed text-gray-500 dark:text-neutral-400">
                                    Los directores firman digitalmente los
                                    reportes de conformidad
                                </p>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-amber-500/20 dark:from-amber-500/10 dark:to-amber-600/5">
                            <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-amber-200/30 blur-2xl transition-transform duration-500 group-hover:scale-150 dark:bg-amber-800/20"></div>
                            <div className="relative">
                                <div className="mb-2.5 w-fit rounded-xl border border-amber-200 bg-amber-100 p-2 dark:border-amber-500/20 dark:bg-amber-500/20">
                                    <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <h3 className="text-[11px] font-semibold text-gray-900 dark:text-white">
                                    Gestión IE
                                </h3>
                                <p className="mt-1 text-[11px] leading-relaxed text-gray-500 dark:text-neutral-400">
                                    Administración de instituciones educativas y
                                    asignación de directores
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ===== ESTADÍSTICAS RÁPIDAS ===== */}
                    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5">
                            <div className="rounded-lg border border-blue-200 bg-blue-100 p-2 dark:border-blue-500/20 dark:bg-blue-500/20">
                                <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                    Total Reportes
                                </p>
                                <p className="text-[11px] font-bold text-gray-900 dark:text-white">
                                    0
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5">
                            <div className="rounded-lg border border-amber-200 bg-amber-100 p-2 dark:border-amber-500/20 dark:bg-amber-500/20">
                                <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                    Pendientes
                                </p>
                                <p className="text-[11px] font-bold text-gray-900 dark:text-white">
                                    0
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5">
                            <div className="rounded-lg border border-emerald-200 bg-emerald-100 p-2 dark:border-emerald-500/20 dark:bg-emerald-500/20">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                    Aprobados
                                </p>
                                <p className="text-[11px] font-bold text-gray-900 dark:text-white">
                                    0
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5">
                            <div className="rounded-lg border border-rose-200 bg-rose-100 p-2 dark:border-rose-500/20 dark:bg-rose-500/20">
                                <AlertCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                    Observados
                                </p>
                                <p className="text-[11px] font-bold text-gray-900 dark:text-white">
                                    0
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ===== PIE INFORMATIVO ===== */}
                    <div className="mt-4 border-t border-gray-200 pt-4 dark:border-white/10">
                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-medium text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                                    UGEL Ambo
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                                    Sistema Operativo
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-[11px] font-medium text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-purple-600 dark:bg-purple-400"></span>
                                    Versión 1.0
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-0.5 md:items-end">
                                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-neutral-400">
                                    <Code className="h-3.5 w-3.5" />
                                    <span>Desarrollado por</span>
                                    <span className="font-semibold text-gray-700 dark:text-neutral-300">
                                        Jordan Brandon Ayala Romero
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-neutral-500">
                                    <Mail className="h-3 w-3" />
                                    <span>
                                        {currentYear} · Todos los derechos
                                        reservados
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Panel Principal',
            href: dashboard(),
        },
    ],
};
