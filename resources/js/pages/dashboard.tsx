import { Head, usePage, router } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { useState, useEffect } from 'react';
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
    X
} from 'lucide-react';

export default function Dashboard() {
    const currentYear = new Date().getFullYear();
    const { props } = usePage();
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
        if (!confirm(`¿Estás seguro de ${maintenanceMode ? 'DESACTIVAR' : 'ACTIVAR'} el modo mantenimiento?\n\n${maintenanceMode ? '🔓 Todos los usuarios podrán acceder nuevamente.' : '🔒 Solo el Super Admin podrá acceder al sistema.'}`)) return;

        setLoading(true);
        const url = maintenanceMode ? '/maintenance/disable' : '/maintenance/enable';
        
        router.post(url, {}, {
            onSuccess: () => {
                setMaintenanceMode(!maintenanceMode);
                setLoading(false);
                setShowModal(false);
                router.reload();
            },
            onError: () => {
                setLoading(false);
                alert('❌ Error al cambiar el estado del modo mantenimiento.');
            }
        });
    };

    return (
        <>
            <Head title="Dashboard" />
            <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                
                {/* ===== BOTÓN DE MANTENIMIENTO (SOLO SUPER ADMIN) ===== */}
                {isSuperAdmin && (
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl mb-4">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${maintenanceMode ? 'bg-amber-100 dark:bg-amber-500/20' : 'bg-emerald-100 dark:bg-emerald-500/20'} border ${maintenanceMode ? 'border-amber-200 dark:border-amber-500/20' : 'border-emerald-200 dark:border-emerald-500/20'}`}>
                                    <Construction className={`w-5 h-5 ${maintenanceMode ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                                </div>
                                <div>
                                    <h3 className="text-[11px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        Modo Mantenimiento
                                        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${maintenanceMode ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' : 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'}`}>
                                            {maintenanceMode ? '🔒 ACTIVADO' : '🔓 DESACTIVADO'}
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
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-[11px] font-medium transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 ${
                                    maintenanceMode
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/20 hover:shadow-emerald-500/40'
                                        : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/20 hover:shadow-amber-500/40'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Cargando...
                                    </>
                                ) : (
                                    <>
                                        {maintenanceMode ? (
                                            <>
                                                <PowerOff className="w-4 h-4" />
                                                Desactivar Mantenimiento
                                            </>
                                        ) : (
                                            <>
                                                <Power className="w-4 h-4" />
                                                Activar Mantenimiento
                                            </>
                                        )}
                                    </>
                                )}
                            </button>
                        </div>

                        {maintenanceMode && (
                            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20">
                                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                    <AlertCircle className="w-4 h-4" />
                                    <p className="text-[11px] font-medium">
                                        🔒 El sistema está en modo mantenimiento. Solo el Super Admin puede acceder.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ========================================== */}
                {/* SECCIÓN INFORMATIVA COMPLETA */}
                {/* ========================================== */}
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                    
                    {/* ===== ENCABEZADO ===== */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20">
                                <Wifi className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-[11px] font-bold text-gray-900 dark:text-white">
                                    Sistema de Conformidad de Internet
                                </h1>
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                    Gestión de reportes mensuales para instituciones educativas
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-full border border-blue-200 dark:border-blue-500/20">
                            <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300">
                                Versión 1.0
                            </span>
                        </div>
                    </div>

                    {/* ===== TARJETAS DE FUNCIONALIDADES ===== */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-500/10 dark:to-blue-600/5 p-4 border border-blue-200/50 dark:border-blue-500/20 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 dark:bg-blue-800/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="relative">
                                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl w-fit mb-2.5 border border-blue-200 dark:border-blue-500/20">
                                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-[11px] font-semibold text-gray-900 dark:text-white">Reportes Mensuales</h3>
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1 leading-relaxed">
                                    Los directores registran el estado del servicio de internet cada mes
                                </p>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/10 dark:to-emerald-600/5 p-4 border border-emerald-200/50 dark:border-emerald-500/20 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-200/30 dark:bg-emerald-800/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="relative">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl w-fit mb-2.5 border border-emerald-200 dark:border-emerald-500/20">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className="text-[11px] font-semibold text-gray-900 dark:text-white">Validación UPDI</h3>
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1 leading-relaxed">
                                    El equipo de UPDI revisa, observa o aprueba los reportes enviados
                                </p>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-500/10 dark:to-purple-600/5 p-4 border border-purple-200/50 dark:border-purple-500/20 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/30 dark:bg-purple-800/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="relative">
                                <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-xl w-fit mb-2.5 border border-purple-200 dark:border-purple-500/20">
                                    <FileSignature className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="text-[11px] font-semibold text-gray-900 dark:text-white">Firma Digital</h3>
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1 leading-relaxed">
                                    Los directores firman digitalmente los reportes de conformidad
                                </p>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-500/10 dark:to-amber-600/5 p-4 border border-amber-200/50 dark:border-amber-500/20 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200/30 dark:bg-amber-800/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="relative">
                                <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-xl w-fit mb-2.5 border border-amber-200 dark:border-amber-500/20">
                                    <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <h3 className="text-[11px] font-semibold text-gray-900 dark:text-white">Gestión IE</h3>
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1 leading-relaxed">
                                    Administración de instituciones educativas y asignación de directores
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ===== ESTADÍSTICAS RÁPIDAS ===== */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg border border-blue-200 dark:border-blue-500/20">
                                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400">Total Reportes</p>
                                <p className="text-[11px] font-bold text-gray-900 dark:text-white">0</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                            <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg border border-amber-200 dark:border-amber-500/20">
                                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400">Pendientes</p>
                                <p className="text-[11px] font-bold text-gray-900 dark:text-white">0</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400">Aprobados</p>
                                <p className="text-[11px] font-bold text-gray-900 dark:text-white">0</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                            <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-lg border border-rose-200 dark:border-rose-500/20">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400">Observados</p>
                                <p className="text-[11px] font-bold text-gray-900 dark:text-white">0</p>
                            </div>
                        </div>
                    </div>

                    {/* ===== PIE INFORMATIVO ===== */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-full text-[11px] font-medium text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                                    <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                                    UGEL Ambo
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-full text-[11px] font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 bg-emerald-600 dark:bg-emerald-400 rounded-full"></span>
                                    Sistema Operativo
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-500/10 rounded-full text-[11px] font-medium text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                                    <span className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full"></span>
                                    Versión 1.0
                                </span>
                            </div>
                            <div className="flex flex-col items-center md:items-end gap-0.5">
                                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-neutral-400">
                                    <Code className="w-3.5 h-3.5" />
                                    <span>Desarrollado por</span>
                                    <span className="font-semibold text-gray-700 dark:text-neutral-300">Jordan Brandon Ayala Romero</span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-neutral-500">
                                    <Mail className="w-3 h-3" />
                                    <span>{currentYear} · Todos los derechos reservados</span>
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
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};