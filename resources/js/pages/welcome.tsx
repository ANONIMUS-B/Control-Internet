import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import {
    Wifi,
    FileText,
    ShieldCheck,
    FileSignature,
    LogIn,
    ArrowRight,
    CheckCircle2,
    Lock,
    Phone,
    Globe,
    MousePointer2,
    Check,
} from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Conformidad del Servicio de Internet - UGEL Ambo" />

            {/* Contenedor Principal: Paleta fiel al diseño de referencia (Lavanda pastel, ciruela profundo, azul rey y oro cálido) */}
            <div className="relative flex min-h-screen w-full flex-col justify-between overflow-x-hidden bg-[#EFE5F4] text-[#341242] selection:bg-[#1E5CD9] selection:text-white lg:h-screen lg:max-h-screen lg:overflow-hidden">
                {/* Elementos decorativos de fondo sutiles en lavanda suave */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                >
                    {/* Resplandor superior en lavanda luminosa */}
                    <div className="absolute -top-32 left-1/2 h-[380px] w-[750px] -translate-x-1/2 rounded-full bg-gradient-to-b from-white/70 via-[#E4D0EC]/60 to-transparent blur-3xl" />

                    {/* Resplandor lateral suave */}
                    <div className="absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-[#D8BCE4]/40 blur-3xl" />
                    <div className="absolute bottom-24 -left-20 h-72 w-72 rounded-full bg-[#EBDCF0]/60 blur-3xl" />
                </div>

                {/* Contenido centrado y contenido dentro de la pantalla */}
                <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between p-3 sm:p-5 lg:py-4">
                    {/* Header Institucional */}
                    <header className="w-full">
                        <nav className="flex items-center justify-between gap-4 rounded-2xl border border-[#D8C0E2] bg-white/85 px-4 py-2.5 shadow-sm backdrop-blur-md">
                            {/* Identidad con Logo Circular Oficial */}
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img
                                        src="/Logo-Circular.png"
                                        alt="Escudo UGEL Ambo"
                                        className="h-10 w-10 rounded-full object-cover shadow-sm ring-2 ring-[#1E5CD9]/50"
                                    />
                                    <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black tracking-tight text-[#341242]">
                                            UGEL Ambo
                                        </span>
                                        <span className="rounded-full border border-[#D5B8DF] bg-[#F2E5F7] px-2 py-0.5 text-[10px] font-bold text-[#4D2757]">
                                            UPDI
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-medium text-[#6B4B7A]">
                                        Conectividad & Conformidad Digital
                                    </p>
                                </div>
                            </div>

                            {/* Acceso Superior */}
                            <div className="flex items-center gap-2">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="group inline-flex items-center gap-2 rounded-xl bg-[#1E5CD9] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#1748B0] hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#1E5CD9] focus-visible:outline-none sm:text-sm"
                                    >
                                        <span>Panel Principal</span>
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                ) : (
                                    <Link
                                        href={login()}
                                        className="group inline-flex items-center gap-2 rounded-xl border border-[#D8C0E2] bg-white px-3.5 py-1.5 text-xs font-bold text-[#1E5CD9] shadow-xs transition-all duration-200 hover:border-[#1E5CD9] hover:bg-[#F0F5FF] focus-visible:ring-2 focus-visible:ring-[#1E5CD9] focus-visible:outline-none sm:text-sm"
                                    >
                                        <LogIn className="h-4 w-4 transition-transform group-hover:scale-110" />
                                        <span>Acceder</span>
                                    </Link>
                                )}
                            </div>
                        </nav>
                    </header>

                    {/* Cuerpo Principal en Dos Columnas */}
                    <main className="my-auto grid items-center gap-6 py-3 lg:grid-cols-12 lg:gap-8">
                        {/* Lado Izquierdo: Titular, Información y Botón Estilo "Clik Aquí" */}
                        <div className="space-y-3.5 lg:col-span-7">
                            {/* Chip Institucional Superior */}
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#D5B8DF] bg-white/90 px-3.5 py-1 text-xs font-semibold text-[#4D2757] shadow-xs backdrop-blur-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                </span>
                                <span>
                                    UGEL Ambo · Sistema Oficial de Conectividad
                                </span>
                            </div>

                            {/* Titular Idéntico al Banner de Referencia */}
                            <div className="space-y-1.5">
                                <h1 className="text-3xl font-black tracking-tight text-[#341242] italic sm:text-4xl lg:text-[40px] lg:leading-[1.12]">
                                    CONFORMIDAD DEL <br />
                                    <span className="font-black text-[#1E5CD9] not-italic drop-shadow-xs">
                                        SERVICIO DE INTERNET
                                    </span>
                                </h1>
                                <p className="max-w-xl text-xs leading-relaxed font-medium text-[#5C3D6A] sm:text-[13px]">
                                    Plataforma oficial para la emisión,
                                    validación técnica UPDI y suscripción
                                    digital mensual del servicio de internet de
                                    las Instituciones Educativas de la provincia
                                    de Ambo.
                                </p>
                            </div>

                            {/* EL BOTÓN ESTRELLA: Inspirado en la insignia "Clik Aquí" de la imagen de referencia */}
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#1E5CD9] via-[#2563EB] to-[#1D4ED8] p-1.5 pr-6 text-white shadow-lg shadow-blue-600/30 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-600/40 active:scale-[0.98]"
                                    >
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1E5CD9] shadow-sm">
                                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-[10px] font-bold tracking-wider text-blue-100 uppercase">
                                                Sesión Iniciada
                                            </span>
                                            <span className="text-sm font-black text-white">
                                                Ir al Panel Principal
                                            </span>
                                        </div>
                                        <span className="ml-2 rounded-full bg-[#FEC93B] px-3.5 py-1 text-xs font-black text-[#1E3A8A] shadow-xs">
                                            Ingresar
                                        </span>
                                    </Link>
                                ) : (
                                    <Link
                                        href={login()}
                                        className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#1E5CD9] via-[#2563EB] to-[#1748B0] p-1.5 pr-5 text-white shadow-xl ring-4 shadow-blue-600/30 ring-white/90 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-blue-600/45 active:scale-[0.98]"
                                    >
                                        {/* Ícono de Acceso Circular */}
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1E5CD9] shadow-md transition-transform group-hover:rotate-[-6deg]">
                                            <LogIn className="h-5 w-5 stroke-[2.5]" />
                                        </div>

                                        {/* Texto Iniciar Sesión */}
                                        <div className="flex flex-col text-left">
                                            <span className="text-[10px] font-bold tracking-wider text-blue-100 uppercase">
                                                Acceso Seguro
                                            </span>
                                            <span className="text-sm font-black tracking-tight text-white sm:text-base">
                                                Iniciar Sesión
                                            </span>
                                        </div>

                                        {/* Insignia Dorada 'Clik Aquí' con Puntero */}
                                        <div className="relative ml-1 flex items-center gap-1.5 rounded-full bg-gradient-to-b from-[#FFE270] to-[#FEC93B] px-3.5 py-1.5 text-xs font-black text-[#1E3A8A] shadow-sm transition-transform group-hover:scale-105">
                                            <span>Clik Aquí</span>
                                            <MousePointer2 className="h-3.5 w-3.5 fill-[#1E3A8A] text-[#1E3A8A] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                        </div>
                                    </Link>
                                )}

                                {/* Etiqueta de confianza */}
                                <div className="flex items-center gap-2 rounded-full border border-[#D5B8DF] bg-white/70 px-3.5 py-2 text-xs font-semibold text-[#4D2757] shadow-xs backdrop-blur-xs">
                                    <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                                    <span>
                                        Directores IE y Especialistas UPDI
                                    </span>
                                </div>
                            </div>

                            {/* 3 Módulos de Procesos Rápidos */}
                            <div className="grid grid-cols-3 gap-2.5 pt-1">
                                <div className="rounded-xl border border-[#D8C0E2] bg-white/80 p-3 shadow-xs transition-all hover:bg-white">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#1E5CD9]">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#341242]">
                                                Reporte
                                            </p>
                                            <p className="text-[10px] text-[#6B4B7A]">
                                                Mensual
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-[#D8C0E2] bg-white/80 p-3 shadow-xs transition-all hover:bg-white">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#341242]">
                                                Validación
                                            </p>
                                            <p className="text-[10px] text-[#6B4B7A]">
                                                UPDI Ambo
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-[#D8C0E2] bg-white/80 p-3 shadow-xs transition-all hover:bg-white">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-[#4D2757]">
                                            <FileSignature className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#341242]">
                                                Firma
                                            </p>
                                            <p className="text-[10px] text-[#6B4B7A]">
                                                Digital
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lado Derecho: Composición 3D interactiva inspirada en la ventana, checklist y router de la imagen */}
                        <div className="lg:col-span-5">
                            <div className="relative space-y-3">
                                {/* 1. Ventana de Navegador estilo la imagen de referencia */}
                                <div className="overflow-hidden rounded-2xl border border-[#D5B8DF] bg-white shadow-xl shadow-[#4D2757]/10">
                                    {/* Barra de cabecera azul rey con 3 botones de control */}
                                    <div className="flex items-center justify-between bg-[#1E5CD9] px-4 py-2.5 text-white">
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]" />
                                            <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                                            <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F]" />
                                        </div>
                                        <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-medium text-white">
                                            <Lock className="h-3 w-3" />
                                            <span>
                                                internet.ugelambo.edu.pe
                                            </span>
                                        </div>
                                        <div className="w-10" />
                                    </div>

                                    {/* Cuerpo del documento con Checklist */}
                                    <div className="space-y-3 p-4">
                                        {/* Encabezado con Globo Terráqueo y Sello de Validación */}
                                        <div className="flex items-center justify-between border-b border-purple-100 pb-2.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1E5CD9]">
                                                    <Globe className="h-5 w-5 stroke-[2]" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xs font-bold text-[#341242]">
                                                        Auditoría de Red y
                                                        Conectividad
                                                    </h3>
                                                    <p className="text-[10px] text-[#6B4B7A]">
                                                        UGEL Ambo · Región
                                                        Huánuco
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                                <Check className="h-3 w-3" />
                                                Verificado
                                            </span>
                                        </div>

                                        {/* Lista de Comprobación como en la imagen */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2.5 rounded-lg bg-[#FAF5FC] p-2 text-xs">
                                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1E5CD9] text-white">
                                                    <Check className="h-3 w-3 stroke-[3]" />
                                                </div>
                                                <span className="font-semibold text-[#341242]">
                                                    Acta mensual emitida y
                                                    firmada por Dirección IE
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2.5 rounded-lg bg-[#FAF5FC] p-2 text-xs">
                                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1E5CD9] text-white">
                                                    <Check className="h-3 w-3 stroke-[3]" />
                                                </div>
                                                <span className="font-semibold text-[#341242]">
                                                    Velocidad de internet y
                                                    latencia verificadas
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2.5 rounded-lg bg-[#FAF5FC] p-2 text-xs">
                                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1E5CD9] text-white">
                                                    <Check className="h-3 w-3 stroke-[3]" />
                                                </div>
                                                <span className="font-semibold text-[#341242]">
                                                    Visto Bueno y Conformidad
                                                    técnica UPDI aprobada
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Router Institucional como en el gráfico de referencia */}
                                <div className="flex items-center justify-between rounded-xl border border-slate-700/60 bg-[#1C2237] p-3 text-white shadow-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[#252E4B] text-cyan-400">
                                            <Wifi className="h-5 w-5 animate-pulse" />
                                            {/* LED verde de encendido */}
                                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-white">
                                                    Router Institucional
                                                </span>
                                                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                                    En línea
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-300">
                                                Fibra Óptica · Ancho de Banda
                                                Garantizado
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="rounded bg-[#283252] px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-400">
                                            100 Mbps
                                        </span>
                                        <p className="mt-0.5 text-[9px] text-slate-400">
                                            Simétrico
                                        </p>
                                    </div>
                                </div>

                                {/* 3. Mesa de ayuda y contacto */}
                                <div className="flex items-center justify-between rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-2 text-xs font-semibold text-[#92400E] shadow-xs">
                                    <span className="flex items-center gap-1.5">
                                        <Phone className="h-3.5 w-3.5 text-[#D97706]" />
                                        Mesa de Ayuda UPDI: 925 523 419
                                    </span>
                                    <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-bold text-[#B45309]">
                                        Lun - Vie
                                    </span>
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* Footer Estilo Onda Ciruela Idéntico al Banner Inferior de la Imagen */}
                    <footer className="w-full pt-1">
                        <div className="flex flex-col items-center justify-between gap-1.5 rounded-2xl border border-[#582E63] bg-gradient-to-r from-[#3C164D] via-[#4D2757] to-[#361345] px-5 py-2.5 text-white shadow-md sm:flex-row">
                            <p className="text-xs font-medium text-purple-100">
                                © {new Date().getFullYear()} UGEL Ambo ·{' '}
                                <span className="font-bold text-white">
                                    Jordan Brandon Ayala Romero
                                </span>
                            </p>
                            <p className="text-[11px] text-purple-200">
                                Unidad de Gestión Educativa Local · Sistema de
                                Conformidad de Internet
                            </p>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
