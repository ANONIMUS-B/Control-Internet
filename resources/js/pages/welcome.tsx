import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import { register } from '@/routes';
import { 
    Wifi, 
    FileText, 
    ShieldCheck, 
    FileSignature, 
    Building2,
    ChevronRight,
    Sparkles,
    Award,
    CheckCircle2,
    ArrowRight,
    Rocket,
    Zap,
    Users,
    BarChart3,
    Globe,
    Mail,
    Phone
} from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Bienvenido - Conformidad de Internet" />
            <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/30 p-6 lg:justify-center lg:p-8 dark:from-neutral-950 dark:via-indigo-950/20 dark:to-purple-950/20">
                
                {/* Header con navegación */}
                <header className="mb-8 w-full max-w-6xl">
                    <nav className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-lg shadow-purple-500/25">
                                <Wifi className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-sm font-bold text-neutral-800 dark:text-white">
                                Conformidad de Internet
                            </span>
                            <span className="text-[10px] font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 px-2 py-0.5 rounded-full shadow-sm shadow-purple-500/20">
                                v1.0
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] transition-all duration-300"
                                >
                                    Dashboard
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="text-sm font-medium text-neutral-600 hover:text-purple-600 dark:text-neutral-400 dark:hover:text-purple-400 transition-colors px-4 py-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/30"
                                    >
                                        Iniciar Sesión
                                    </Link>
                                    {/* <Link
                                        href={register()}
                                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] transition-all duration-300"
                                    >
                                        Registrarse
                                        <ArrowRight className="w-4 h-4" />
                                    </Link> */}
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                <div className="w-full max-w-6xl">
                    <main className="grid lg:grid-cols-2 gap-8 items-center">
                        
                        {/* Lado izquierdo - Contenido */}
                        <div className="space-y-8">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-pink-950/40 rounded-full border border-purple-200 dark:border-purple-800">
                                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                <span className="text-xs font-medium bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Sistema Operativo · UGEL Ambo
                                </span>
                            </div>

                            {/* Título principal */}
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white leading-tight">
                                    Conformidad de
                                    <span className="block text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text">
                                        Internet
                                    </span>
                                </h1>
                                <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    Plataforma de gestión de reportes mensuales para instituciones educativas. 
                                    Simplifica el proceso de conformidad y seguimiento del servicio de internet.
                                </p>
                            </div>

                            {/* Estadísticas rápidas coloridas */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 backdrop-blur-sm rounded-2xl border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all group">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">100+</div>
                                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Instituciones</p>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 backdrop-blur-sm rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all group">
                                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">12</div>
                                    <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">Meses reportados</p>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 backdrop-blur-sm rounded-2xl border border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all group">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">98%</div>
                                    <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">Efectividad</p>
                                </div>
                            </div>

                            {/* Features coloridos */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50 to-blue-100/30 dark:from-blue-950/30 dark:to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-200/50 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 transition-all group">
                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:scale-110 transition-transform shadow-md shadow-blue-500/25">
                                        <FileText className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-neutral-800 dark:text-white">Reportes</p>
                                        <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70">Mensuales</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-emerald-50 to-emerald-100/30 dark:from-emerald-950/30 dark:to-emerald-900/20 backdrop-blur-sm rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all group">
                                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg group-hover:scale-110 transition-transform shadow-md shadow-emerald-500/25">
                                        <ShieldCheck className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-neutral-800 dark:text-white">Validación</p>
                                        <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">UPDI</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-purple-50 to-purple-100/30 dark:from-purple-950/30 dark:to-purple-900/20 backdrop-blur-sm rounded-xl border border-purple-200/50 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600 transition-all group">
                                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg group-hover:scale-110 transition-transform shadow-md shadow-purple-500/25">
                                        <FileSignature className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-neutral-800 dark:text-white">Firma</p>
                                        <p className="text-[10px] text-purple-600/70 dark:text-purple-400/70">Digital</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-amber-50 to-amber-100/30 dark:from-amber-950/30 dark:to-amber-900/20 backdrop-blur-sm rounded-xl border border-amber-200/50 dark:border-amber-800/50 hover:border-amber-400 dark:hover:border-amber-600 transition-all group">
                                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg group-hover:scale-110 transition-transform shadow-md shadow-amber-500/25">
                                        <Building2 className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-neutral-800 dark:text-white">Gestión</p>
                                        <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">IE</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer colorido */}
                            <div className="flex items-center gap-4 pt-4 border-t border-purple-200/30 dark:border-purple-800/30">
                                <div className="flex items-center gap-2">
                                    <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                        UGEL Ambo
                                    </span>
                                </div>
                                <div className="w-px h-4 bg-purple-300 dark:bg-purple-700"></div>
                                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                                    {new Date().getFullYear()} · Jordan Brandon Ayala Romero
                                </span>
                            </div>
                        </div>

                        {/* Lado derecho - Hero visual colorido */}
                        <div className="relative">
                            <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 lg:p-12 shadow-2xl shadow-purple-500/30 overflow-hidden">
                                {/* Efectos de fondo */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl"></div>
                                
                                <div className="relative text-center">
                                    {/* Icono central con animación */}
                                    <div className="w-28 h-28 mx-auto mb-8 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl animate-bounce-slow">
                                        <Wifi className="w-14 h-14 text-white" />
                                    </div>
                                    
                                    <h2 className="text-3xl font-bold text-white mb-3">
                                        Conformidad de Internet
                                    </h2>
                                    <p className="text-blue-200/90 text-sm mb-6">
                                        Unidad de Gestión Educativa Local Ambo
                                    </p>
                                    
                                    {/* Badges coloridos */}
                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                        <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white text-xs border border-white/10 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3 h-3 text-yellow-300" />
                                            Sistema Operativo
                                        </span>
                                        <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white text-xs border border-white/10 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3 h-3 text-yellow-300" />
                                            Versión 1.0
                                        </span>
                                        <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white text-xs border border-white/10 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3 h-3 text-yellow-300" />
                                            UGEL Ambo
                                        </span>
                                    </div>

                                    {/* Línea decorativa */}
                                    <div className="mt-6 flex items-center justify-center gap-2">
                                        <span className="w-12 h-0.5 bg-white/20 rounded-full"></span>
                                        <span className="text-[10px] text-white/50 font-medium tracking-wider">CONFORMIDAD DIGITAL</span>
                                        <span className="w-12 h-0.5 bg-white/20 rounded-full"></span>
                                    </div>

                                    {/* Stats pequeños */}
                                    <div className="mt-4 flex items-center justify-center gap-6 text-white/80 text-xs">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3 text-yellow-300" />
                                            100+ IE
                                        </span>
                                        <span className="w-px h-4 bg-white/10"></span>
                                        <span className="flex items-center gap-1">
                                            <BarChart3 className="w-3 h-3 text-yellow-300" />
                                            98% efectividad
                                        </span>
                                        <span className="w-px h-4 bg-white/10"></span>
                                        <span className="flex items-center gap-1">
                                            <Rocket className="w-3 h-3 text-yellow-300" />
                                            v1.0
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Elementos decorativos flotantes */}
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-pink-400/20 rounded-full blur-2xl animate-pulse"></div>
                            <div className="absolute -top-4 -left-4 w-20 h-20 bg-blue-400/20 rounded-full blur-2xl animate-pulse delay-700"></div>
                            <div className="absolute top-1/2 -right-6 w-12 h-12 bg-yellow-400/10 rounded-full blur-xl"></div>
                        </div>
                    </main>
                </div>
            </div>

            <style>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
            `}</style>
        </>
    );
}