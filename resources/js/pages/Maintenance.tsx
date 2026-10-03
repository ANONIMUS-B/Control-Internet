import { Head, router } from '@inertiajs/react';
import {
    Wifi,
    Clock,
    Construction,
    Shield,
    Zap,
    RefreshCw,
    Mail,
    Phone,
    MapPin,
    Sparkles,
    LogOut,
} from 'lucide-react';

export default function Maintenance() {
    const handleLogout = () => {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            router.post('/logout');
        }
    };

    return (
        <>
            <Head title="Sitio en Mantenimiento" />

            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-6">
                {/* ===== EFECTOS DE FONDO ===== */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-blue-500/10 blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-purple-500/10 blur-3xl delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-3xl"></div>

                    {/* Puntos decorativos */}
                    <div className="absolute top-20 left-10 h-2 w-2 animate-ping rounded-full bg-blue-400/30"></div>
                    <div className="absolute right-10 bottom-20 h-3 w-3 animate-ping rounded-full bg-purple-400/30 delay-700"></div>
                    <div className="absolute top-1/3 right-1/4 h-1.5 w-1.5 animate-ping rounded-full bg-cyan-400/30 delay-500"></div>
                    <div className="absolute bottom-1/3 left-1/4 h-2 w-2 animate-ping rounded-full bg-pink-400/30 delay-300"></div>
                </div>

                {/* ===== TARJETA PRINCIPAL ===== */}
                <div className="relative w-full max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-2xl md:p-8">
                    <div className="flex flex-col items-center gap-6 md:flex-row md:gap-8">
                        {/* ===== COLUMNA IZQUIERDA ===== */}
                        <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
                            {/* Icono */}
                            <div className="relative mb-3 md:mb-4">
                                <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 opacity-30 blur-2xl"></div>
                                <div className="animate-bounce-slow relative rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 p-3 shadow-2xl shadow-yellow-500/20 md:p-4">
                                    <Construction className="h-12 w-12 text-white md:h-14 md:w-14" />
                                </div>
                            </div>

                            <h1 className="mb-1 text-2xl font-bold text-white md:mb-2 md:text-4xl">
                                🔧 Mantenimiento
                            </h1>
                            <p className="max-w-xs text-xs text-white/60 md:text-sm">
                                Estamos mejorando nuestro sistema para brindarte
                                una mejor experiencia.
                            </p>
                            <p className="mt-1 text-[10px] text-white/30 md:text-xs">
                                <Sparkles className="mr-1 inline h-3 w-3" />
                                Volveremos muy pronto
                            </p>

                            {/* Botón Cerrar Sesión */}
                            <button
                                onClick={handleLogout}
                                className="mt-3 flex items-center gap-2 rounded-xl border border-white/5 bg-white/10 px-4 py-2 text-[11px] font-medium text-white/70 transition-all hover:border-white/10 hover:bg-white/20 hover:text-white md:mt-4 md:px-5 md:py-2.5"
                            >
                                <LogOut className="h-4 w-4" />
                                Cerrar Sesión
                            </button>
                        </div>

                        {/* ===== COLUMNA DERECHA ===== */}
                        <div className="w-full flex-1">
                            {/* Grid de características */}
                            <div className="mb-3 grid grid-cols-3 gap-2 md:mb-4 md:gap-3">
                                <div className="group rounded-xl border border-white/5 bg-white/5 p-2.5 text-center backdrop-blur-sm transition-all hover:bg-white/10 md:p-3">
                                    <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-110 md:h-10 md:w-10">
                                        <Clock className="h-4 w-4 text-white md:h-5 md:w-5" />
                                    </div>
                                    <p className="text-[10px] font-medium text-white/70 md:text-xs">
                                        Pronto regresamos
                                    </p>
                                    <p className="text-[8px] text-white/30 md:text-[10px]">
                                        Estamos trabajando
                                    </p>
                                </div>

                                <div className="group rounded-xl border border-white/5 bg-white/5 p-2.5 text-center backdrop-blur-sm transition-all hover:bg-white/10 md:p-3">
                                    <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20 transition-transform group-hover:scale-110 md:h-10 md:w-10">
                                        <Shield className="h-4 w-4 text-white md:h-5 md:w-5" />
                                    </div>
                                    <p className="text-[10px] font-medium text-white/70 md:text-xs">
                                        Mejorando seguridad
                                    </p>
                                    <p className="text-[8px] text-white/30 md:text-[10px]">
                                        Protegiendo tus datos
                                    </p>
                                </div>

                                <div className="group rounded-xl border border-white/5 bg-white/5 p-2.5 text-center backdrop-blur-sm transition-all hover:bg-white/10 md:p-3">
                                    <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/20 transition-transform group-hover:scale-110 md:h-10 md:w-10">
                                        <Zap className="h-4 w-4 text-white md:h-5 md:w-5" />
                                    </div>
                                    <p className="text-[10px] font-medium text-white/70 md:text-xs">
                                        Optimizando velocidad
                                    </p>
                                    <p className="text-[8px] text-white/30 md:text-[10px]">
                                        Más rápido que antes
                                    </p>
                                </div>
                            </div>

                            {/* Barra de progreso */}
                            <div className="mb-2 md:mb-3">
                                <div className="mb-0.5 flex justify-between text-[9px] text-white/40 md:mb-1 md:text-[10px]">
                                    <span>Progreso</span>
                                    <span className="text-white/60">78%</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                                    <div className="animate-shimmer h-full w-[78%] rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                                </div>
                                <p className="mt-1 text-center text-[9px] text-white/30 md:text-[10px]">
                                    <RefreshCw className="mr-1 inline h-3 w-3 animate-spin" />
                                    Actualizando sistema...
                                </p>
                            </div>

                            {/* Contacto */}
                            <div className="border-t border-white/10 pt-2.5 md:pt-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-[10px] text-white/40 md:text-xs">
                                        ¿Necesitas asistencia?
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 text-[9px] text-white/30 md:gap-4 md:text-[10px]">
                                        <span className="flex cursor-pointer items-center gap-1 transition-colors hover:text-white/60">
                                            <Mail className="h-3 w-3" />
                                            ayalaromerojordanbrandon@gmail.com
                                        </span>
                                        <span className="flex cursor-pointer items-center gap-1 transition-colors hover:text-white/60">
                                            <Phone className="h-3 w-3" />
                                            925523419
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5 text-[8px] text-white/20 md:gap-2 md:text-[9px]">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-2.5 w-2.5" />
                                            UGEL Ambo
                                        </span>
                                        <span className="h-0.5 w-0.5 rounded-full bg-white/10"></span>
                                        <span className="flex items-center gap-1">
                                            <Wifi className="h-2.5 w-2.5" />
                                            Conformidad
                                        </span>
                                        <span className="h-0.5 w-0.5 rounded-full bg-white/10"></span>
                                        <span>v1.0</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 2.5s ease-in-out infinite;
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s ease-in-out infinite;
                    background-size: 200% 100%;
                }
            `}</style>
        </>
    );
}

Maintenance.layout = false;
