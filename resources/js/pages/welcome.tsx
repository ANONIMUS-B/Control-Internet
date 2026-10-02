import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import {
    Wifi,
    FileText,
    ShieldCheck,
    FileSignature,
    Building2,
    LogIn,
    ArrowRight,
    CheckCircle2,
    Lock,
    Phone,
    Sparkles,
    BarChart3,
    Activity,
} from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Bienvenido - Conformidad de Internet · UGEL Ambo" />

            <div className="relative flex min-h-screen w-full flex-col justify-between overflow-x-hidden bg-[#070b14] text-slate-100 selection:bg-blue-500 selection:text-white">
                {/* Malla de fondo estilo IA (Micro-Grid Cyber) y Auroras sutiles */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                >
                    {/* Aurora superior */}
                    <div className="absolute -top-40 left-1/2 h-[420px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-600/25 via-indigo-600/15 to-transparent blur-3xl" />

                    {/* Luz ambiental esmeralda suave abajo a la izquierda */}
                    <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

                    {/* Trama de micro-cuadrícula sutil moderna */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] bg-[size:32px_32px]" />
                </div>

                <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
                    {/* Header Estilo Cyber-Glass */}
                    <header className="w-full">
                        <nav className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 shadow-lg shadow-black/20 backdrop-blur-xl">
                            {/* Identidad UGEL Ambo */}
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img
                                        src="/Logo-Circular.png"
                                        alt="Escudo UGEL Ambo"
                                        className="h-9 w-9 rounded-full object-cover shadow-md ring-2 shadow-blue-500/20 ring-blue-500/40"
                                    />
                                    <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#070b14] bg-emerald-400" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold tracking-tight text-white">
                                            UGEL Ambo
                                        </span>
                                        <span className="rounded-full border border-blue-500/30 bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                                            v1.0 AI
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400">
                                        Conformidad de Internet
                                    </p>
                                </div>
                            </div>

                            {/* Botón de Iniciar Sesión en Navbar */}
                            <div className="flex items-center gap-3">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition-all duration-200 hover:shadow-blue-500/50 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none sm:text-sm"
                                    >
                                        <span>Panel Principal</span>
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                ) : (
                                    <Link
                                        href={login()}
                                        className="group inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur-md transition-all duration-200 hover:border-blue-400/50 hover:bg-white/15 hover:shadow-md hover:shadow-blue-500/10 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none sm:text-sm"
                                    >
                                        <LogIn className="h-4 w-4 text-blue-400 transition-transform group-hover:scale-110" />
                                        <span>Iniciar Sesión</span>
                                    </Link>
                                )}
                            </div>
                        </nav>
                    </header>

                    {/* Contenido Principal en dos columnas */}
                    <main className="my-auto grid items-center gap-6 py-4 lg:grid-cols-12 lg:gap-10">
                        {/* Lado izquierdo: Presentación y Acción Principal */}
                        <div className="space-y-4 lg:col-span-7">
                            {/* Badge Inteligente de Estado */}
                            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-medium text-blue-300 shadow-sm shadow-blue-500/10 backdrop-blur-md">
                                <Sparkles className="h-3.5 w-3.5 animate-pulse text-blue-400" />
                                <span>
                                    UGEL Ambo · Sistema Inteligente de
                                    Conectividad
                                </span>
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            </div>

                            {/* Título Principal de Alto Impacto */}
                            <div className="space-y-2">
                                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[42px] lg:leading-[1.14]">
                                    Control Digital de{' '}
                                    <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                                        Internet Educativo
                                    </span>
                                </h1>
                                <p className="max-w-xl text-xs leading-relaxed text-slate-300 sm:text-sm">
                                    Plataforma automatizada para la emisión de
                                    reportes mensuales, validación técnica de
                                    ancho de banda UPDI y firma digital para
                                    instituciones educativas de Ambo.
                                </p>
                            </div>

                            {/* DESTACADO: Botón principal de Iniciar Sesión con Efecto Shimmer */}
                            <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:items-center">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/50 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none active:scale-[0.98]"
                                    >
                                        <span>Acceder al Panel Principal</span>
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                ) : (
                                    <Link
                                        href={login()}
                                        className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/35 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/50 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none active:scale-[0.98]"
                                    >
                                        {/* Efecto de destello (Shimmer beam) */}
                                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                                        <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/20 shadow-inner transition-transform group-hover:scale-110">
                                            <LogIn className="h-3.5 w-3.5 text-white" />
                                        </div>
                                        <span className="tracking-wide">
                                            Iniciar Sesión en la Plataforma
                                        </span>
                                        <ArrowRight className="h-4 w-4 text-blue-200 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                )}

                                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-slate-300 backdrop-blur-md sm:max-w-xs">
                                    <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                                    <span>
                                        Acceso seguro para Directores y Personal
                                        UPDI
                                    </span>
                                </div>
                            </div>

                            {/* Métricas HUD Estilo Cyber */}
                            <div className="grid grid-cols-3 gap-2.5 pt-1">
                                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center shadow-inner backdrop-blur-md transition-all hover:border-blue-500/30">
                                    <div className="text-lg font-bold text-white sm:text-xl">
                                        100+
                                    </div>
                                    <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                                        Instituciones
                                    </p>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center shadow-inner backdrop-blur-md transition-all hover:border-blue-500/30">
                                    <div className="text-lg font-bold text-white sm:text-xl">
                                        12
                                    </div>
                                    <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                                        Meses de gestión
                                    </p>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center shadow-inner backdrop-blur-md transition-all hover:border-blue-500/30">
                                    <div className="text-lg font-bold text-emerald-400 sm:text-xl">
                                        100%
                                    </div>
                                    <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                                        Validación digital
                                    </p>
                                </div>
                            </div>

                            {/* 4 Módulos Centrales */}
                            <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
                                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-2 transition-colors hover:border-blue-500/30">
                                    <FileText className="h-4 w-4 shrink-0 text-blue-400" />
                                    <span className="text-xs font-medium text-slate-300">
                                        Reportes
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-2 transition-colors hover:border-blue-500/30">
                                    <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                                    <span className="text-xs font-medium text-slate-300">
                                        Validación UPDI
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-2 transition-colors hover:border-blue-500/30">
                                    <FileSignature className="h-4 w-4 shrink-0 text-indigo-400" />
                                    <span className="text-xs font-medium text-slate-300">
                                        Firma Digital
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-2 transition-colors hover:border-blue-500/30">
                                    <Building2 className="h-4 w-4 shrink-0 text-amber-400" />
                                    <span className="text-xs font-medium text-slate-300">
                                        Directorio IE
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Lado derecho: Consola de Monitoreo HUD Estilo IA */}
                        <div className="lg:col-span-5">
                            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-slate-900/80 to-[#0c1222]/90 p-5 shadow-2xl shadow-blue-950/60 backdrop-blur-2xl sm:p-6">
                                {/* Resplandor de esquina decorativo */}
                                <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" />

                                {/* Cabecera de la Consola */}
                                <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 ring-1 ring-blue-500/30">
                                            <Wifi className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-bold tracking-wide text-white">
                                                Consola de Conformidad
                                            </h2>
                                            <p className="text-xs text-slate-400">
                                                Nodo UPDI UGEL Ambo
                                            </p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                                        En Vivo
                                    </span>
                                </div>

                                {/* Cuerpo interactivo: Telemetría de Red y Acceso */}
                                <div className="space-y-3 py-3.5">
                                    <div className="rounded-xl border border-white/10 bg-black/30 p-3.5">
                                        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                                            <span className="flex items-center gap-1.5 font-medium text-slate-300">
                                                <Activity className="h-3.5 w-3.5 text-blue-400" />
                                                Telemetría de Red Activa
                                            </span>
                                            <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-blue-300">
                                                PING 9.4 ms
                                            </span>
                                        </div>
                                        <div className="space-y-1.5 font-mono text-xs">
                                            <div className="flex items-center justify-between text-slate-300">
                                                <span className="font-sans text-slate-400">
                                                    Speedtest Integrado
                                                </span>
                                                <span className="font-semibold text-emerald-400">
                                                    100 Mbps Simétrico
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-slate-300">
                                                <span className="font-sans text-slate-400">
                                                    Cifrado de Firma
                                                </span>
                                                <span className="font-semibold text-blue-400">
                                                    SHA-256 Validado
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botón de acceso directo secundario en la tarjeta */}
                                    {auth.user ? (
                                        <Link
                                            href={dashboard()}
                                            className="group flex w-full items-center justify-between rounded-xl border border-blue-500/30 bg-blue-500/10 p-2.5 text-xs font-semibold text-blue-300 transition-all hover:bg-blue-500/20"
                                        >
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                                <span>
                                                    Sesión activa como{' '}
                                                    {auth.user.name}
                                                </span>
                                            </div>
                                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                        </Link>
                                    ) : (
                                        <Link
                                            href={login()}
                                            className="group flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-xs font-semibold text-slate-200 transition-all hover:border-blue-500/40 hover:bg-white/[0.08]"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Lock className="h-4 w-4 text-blue-400" />
                                                <span>
                                                    Acceso institucional o
                                                    Passkey
                                                </span>
                                            </div>
                                            <span className="flex items-center gap-1 font-medium text-blue-400">
                                                Ingresar
                                                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                            </span>
                                        </Link>
                                    )}
                                </div>

                                {/* Pie de la consola */}
                                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Phone className="h-3 w-3 text-slate-500" />
                                        Mesa de Ayuda UPDI: 925523419
                                    </span>
                                    <span className="font-mono text-[10px] text-slate-400">
                                        TLS 1.3 SECURED
                                    </span>
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* Footer Institucional Compacto */}
                    <footer className="w-full border-t border-white/10 pt-3">
                        <div className="flex flex-col items-center justify-between gap-1 text-xs text-slate-400 sm:flex-row">
                            <p>
                                © {new Date().getFullYear()} UGEL Ambo · Jordan
                                Brandon Ayala Romero
                            </p>
                            <p className="text-[11px] text-slate-500">
                                Sistema Inteligente de Gestión y Conformidad de
                                Internet
                            </p>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
