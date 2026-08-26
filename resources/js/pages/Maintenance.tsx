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
    LogOut
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

            <div className="fixed inset-0 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6 overflow-hidden z-50">
                
                {/* ===== EFECTOS DE FONDO ===== */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
                    
                    {/* Puntos decorativos */}
                    <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400/30 rounded-full animate-ping"></div>
                    <div className="absolute bottom-20 right-10 w-3 h-3 bg-purple-400/30 rounded-full animate-ping delay-700"></div>
                    <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-cyan-400/30 rounded-full animate-ping delay-500"></div>
                    <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-pink-400/30 rounded-full animate-ping delay-300"></div>
                </div>

                {/* ===== TARJETA PRINCIPAL ===== */}
                <div className="relative max-w-5xl w-full bg-white/5 backdrop-blur-2xl rounded-3xl p-6 md:p-8 shadow-2xl border border-white/10">
                    
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                        
                        {/* ===== COLUMNA IZQUIERDA ===== */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
                            {/* Icono */}
                            <div className="relative mb-3 md:mb-4">
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                                <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 p-3 md:p-4 rounded-2xl shadow-2xl shadow-yellow-500/20 animate-bounce-slow">
                                    <Construction className="w-12 h-12 md:w-14 md:h-14 text-white" />
                                </div>
                            </div>

                            <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2">
                                🔧 Mantenimiento
                            </h1>
                            <p className="text-white/60 text-xs md:text-sm max-w-xs">
                                Estamos mejorando nuestro sistema para brindarte una mejor experiencia.
                            </p>
                            <p className="text-white/30 text-[10px] md:text-xs mt-1">
                                <Sparkles className="w-3 h-3 inline mr-1" />
                                Volveremos muy pronto
                            </p>

                            {/* Botón Cerrar Sesión */}
                            <button
                                onClick={handleLogout}
                                className="mt-3 md:mt-4 flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all border border-white/5 hover:border-white/10 text-[11px] font-medium"
                            >
                                <LogOut className="w-4 h-4" />
                                Cerrar Sesión
                            </button>
                        </div>

                        {/* ===== COLUMNA DERECHA ===== */}
                        <div className="flex-1 w-full">
                            
                            {/* Grid de características */}
                            <div className="grid grid-cols-3 gap-2 md:gap-3 mb-3 md:mb-4">
                                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2.5 md:p-3 text-center border border-white/5 hover:bg-white/10 transition-all group">
                                    <div className="w-8 h-8 md:w-10 md:h-10 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-1 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                        <Clock className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                    </div>
                                    <p className="text-white/70 text-[10px] md:text-xs font-medium">Pronto regresamos</p>
                                    <p className="text-white/30 text-[8px] md:text-[10px]">Estamos trabajando</p>
                                </div>

                                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2.5 md:p-3 text-center border border-white/5 hover:bg-white/10 transition-all group">
                                    <div className="w-8 h-8 md:w-10 md:h-10 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-1 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                        <Shield className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                    </div>
                                    <p className="text-white/70 text-[10px] md:text-xs font-medium">Mejorando seguridad</p>
                                    <p className="text-white/30 text-[8px] md:text-[10px]">Protegiendo tus datos</p>
                                </div>

                                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2.5 md:p-3 text-center border border-white/5 hover:bg-white/10 transition-all group">
                                    <div className="w-8 h-8 md:w-10 md:h-10 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-1 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                                        <Zap className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                    </div>
                                    <p className="text-white/70 text-[10px] md:text-xs font-medium">Optimizando velocidad</p>
                                    <p className="text-white/30 text-[8px] md:text-[10px]">Más rápido que antes</p>
                                </div>
                            </div>

                            {/* Barra de progreso */}
                            <div className="mb-2 md:mb-3">
                                <div className="flex justify-between text-[9px] md:text-[10px] text-white/40 mb-0.5 md:mb-1">
                                    <span>Progreso</span>
                                    <span className="text-white/60">78%</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-[78%] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-shimmer"></div>
                                </div>
                                <p className="text-[9px] md:text-[10px] text-white/30 text-center mt-1">
                                    <RefreshCw className="w-3 h-3 inline mr-1 animate-spin" />
                                    Actualizando sistema...
                                </p>
                            </div>

                            {/* Contacto */}
                            <div className="border-t border-white/10 pt-2.5 md:pt-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-white/40 text-[10px] md:text-xs">
                                        ¿Necesitas asistencia?
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-white/30 text-[9px] md:text-[10px]">
                                        <span className="flex items-center gap-1 hover:text-white/60 transition-colors cursor-pointer">
                                            <Mail className="w-3 h-3" />
                                            ayalaromerojordanbrandon@gmail.com
                                        </span>
                                        <span className="flex items-center gap-1 hover:text-white/60 transition-colors cursor-pointer">
                                            <Phone className="w-3 h-3" />
                                            925523419
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-white/20 text-[8px] md:text-[9px]">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-2.5 h-2.5" />
                                            UGEL Ambo
                                        </span>
                                        <span className="w-0.5 h-0.5 bg-white/10 rounded-full"></span>
                                        <span className="flex items-center gap-1">
                                            <Wifi className="w-2.5 h-2.5" />
                                            Conformidad
                                        </span>
                                        <span className="w-0.5 h-0.5 bg-white/10 rounded-full"></span>
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