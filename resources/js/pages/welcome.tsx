import { Head, Link, usePage } from '@inertiajs/react';
import {
    Wifi,
    FileText,
    ShieldCheck,
    User,
    ChevronRight,
    CheckCircle2,
    Phone,
    Globe,
    Check,
    Star,
    BarChart2,
    PenLine,
} from 'lucide-react';
import { dashboard, login } from '@/routes';
import { index as reportsIndex } from '@/routes/reports';
import { index as signatureIndex } from '@/routes/signature';

export default function Welcome() {
    const { auth } = usePage().props;

    const reportUrl = auth.user ? reportsIndex() : login();
    const signatureUrl = auth.user ? signatureIndex() : login();

    return (
        <>
            <Head title="Conformidad del Servicio de Internet - UGEL Ambo" />

            {/* Contenedor Principal con Fondo Panorámico */}
            <div className="relative flex min-h-screen w-full flex-col justify-between overflow-x-hidden bg-[#EBF4FE] text-slate-800 selection:bg-[#0866F5] selection:text-white">
                {/* Capa de Fondo Panorámico (Paisaje educativo, montañas y ondas) */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                >
                    {/* Imagen de fondo panorámica */}
                    <div
                        className="absolute inset-0 bg-cover bg-top opacity-95 sm:bg-center"
                        style={{
                            backgroundImage: `url('/images/hero_landscape_bg.jpg')`,
                        }}
                    />

                    {/* Velo blanco/celeste suave en el centro para contraste óptimo */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/80 to-white/60 backdrop-blur-[0.5px]" />

                    {/* Resplandor ambiental */}
                    <div className="absolute top-1/3 left-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />

                    {/* Ondas decorativas Wi-Fi en la esquina superior derecha */}
                    <svg
                        className="absolute -top-6 -right-6 h-80 w-80 text-[#168BFF]/20"
                        viewBox="0 0 100 100"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                    >
                        <path d="M 12 36 A 48 48 0 0 1 88 36" />
                        <path d="M 26 50 A 32 32 0 0 1 74 50" />
                        <path d="M 38 64 A 16 16 0 0 1 62 64" />
                        <circle cx="50" cy="78" r="3.5" fill="currentColor" />
                    </svg>
                </div>

                {/* Contenido Centrado */}
                <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between p-3.5 sm:p-5 lg:p-6">
                    {/* A. Encabezado Institucional Flotante */}
                    <header className="w-full">
                        <nav className="flex items-center justify-between gap-4 rounded-2xl border border-white/95 bg-white/90 px-4 py-2.5 shadow-lg shadow-blue-900/5 backdrop-blur-md sm:rounded-full sm:px-6 sm:py-3">
                            {/* Identidad Institucional UGEL Ambo */}
                            <div className="flex items-center gap-3">
                                <div className="relative shrink-0">
                                    <img
                                        src="/Logo-Circular.png"
                                        alt="Logo Oficial UGEL Ambo"
                                        className="h-10 w-10 rounded-full object-contain shadow-xs ring-2 ring-blue-500/20 sm:h-11 sm:w-11"
                                    />
                                    <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#08BE80]" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black tracking-tight text-[#102A6B] sm:text-base">
                                            UGEL Ambo
                                        </span>
                                        <span className="rounded-full bg-[#7139F5] px-2.5 py-0.5 text-[10px] font-black tracking-wider text-white uppercase shadow-xs">
                                            UPDI
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-medium text-[#4B5E80] sm:text-xs">
                                        Conectividad & Conformidad Digital
                                    </p>
                                </div>
                            </div>

                            {/* Único botón de acceso a la derecha */}
                            <div className="flex items-center">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#0866F5] via-[#1277FF] to-[#168BFF] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/35 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/45 hover:brightness-105 active:scale-95 sm:px-6 sm:text-sm"
                                    >
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white">
                                            <User className="h-3.5 w-3.5 stroke-[2.5]" />
                                        </div>
                                        <span>Panel Principal</span>
                                        <ChevronRight className="h-4 w-4 stroke-[2.5] transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                ) : (
                                    <Link
                                        href={login()}
                                        className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#0866F5] via-[#1277FF] to-[#168BFF] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/35 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/45 hover:brightness-105 active:scale-95 sm:px-7 sm:text-sm"
                                    >
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#0866F5] shadow-xs">
                                            <User className="h-3.5 w-3.5 stroke-[2.5]" />
                                        </div>
                                        <span>Ingresar</span>
                                        <ChevronRight className="h-4 w-4 stroke-[2.5] transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                )}
                            </div>
                        </nav>
                    </header>

                    {/* B. Sección Principal (Hero) */}
                    <main className="my-auto grid items-center gap-6 py-4 lg:grid-cols-12 lg:gap-8">
                        {/* Columna Izquierda (lg:col-span-7) con Estudiante Anclada al Margen Izquierdo e Inferior */}
                        <div className="relative flex flex-col justify-between pb-2 lg:col-span-7 lg:min-h-[440px]">
                            {/* Estudiante en Pantallas de Escritorio/Tablet: Anclada a la esquina inferior izquierda con máscara de degradado en la base */}
                            <div className="pointer-events-none absolute bottom-0 left-0 z-10 hidden select-none sm:block sm:h-[400px] sm:w-[230px] lg:h-[460px] lg:w-[270px] xl:h-[490px] xl:w-[290px]">
                                <img
                                    src="/images/student_girl_hq.png"
                                    alt="Estudiante escolar de UGEL Ambo con tableta"
                                    className="h-full w-full [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)] object-contain object-bottom drop-shadow-2xl"
                                />
                            </div>

                            {/* Estudiante en Móviles (< 640px): Visible con degradado suave en la base */}
                            <div className="pointer-events-none relative mx-auto -mb-2 h-64 w-52 select-none sm:hidden">
                                <img
                                    src="/images/student_girl_hq.png"
                                    alt="Estudiante escolar de UGEL Ambo"
                                    className="h-full w-full [mask-image:linear-gradient(to_bottom,black_82%,transparent_100%)] object-contain object-bottom drop-shadow-xl"
                                />
                            </div>

                            {/* Bloque Superior: Insignia, Título y Descripción (con padding izquierdo en desktop para no tapar la niña) */}
                            <div className="relative z-20 space-y-3 text-center sm:space-y-3.5 sm:pl-[200px] sm:text-left lg:pl-[230px] xl:pl-[250px]">
                                {/* 1. Insignia oficial de conectividad */}
                                <div className="inline-flex w-fit items-center gap-2 self-center rounded-full border border-blue-200/90 bg-white/95 px-3.5 py-1 text-xs font-bold text-[#102A6B] shadow-xs backdrop-blur-xs sm:self-start">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#08BE80] opacity-75" />
                                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#08BE80]" />
                                    </span>
                                    <span>
                                        UGEL Ambo • Sistema Oficial de
                                        Conectividad
                                    </span>
                                </div>

                                {/* 2. Título principal en mayúsculas con Wi-Fi */}
                                <div className="space-y-1">
                                    <h1 className="text-3xl leading-[1.12] font-black tracking-tight sm:text-4xl lg:text-[42px]">
                                        <span className="block text-[#102A6B]">
                                            CONFORMIDAD DEL
                                        </span>
                                        <span className="block text-[#168BFF]">
                                            SERVICIO DE
                                        </span>
                                        <span className="mt-1.5 inline-flex items-center gap-2.5">
                                            <span className="rounded-xl bg-gradient-to-r from-[#7139F5] via-[#7B3FE4] to-[#8C52FF] px-4 py-1 font-black tracking-wider text-white shadow-xl shadow-[#7139F5]/40">
                                                INTERNET
                                            </span>
                                            <Wifi className="h-8 w-8 stroke-[2.75] text-[#168BFF]" />
                                        </span>
                                    </h1>
                                </div>

                                {/* 5. Descripción oficial */}
                                <p className="max-w-xl text-xs leading-relaxed font-medium text-[#334E68] sm:text-[13px]">
                                    Plataforma oficial para la emisión,
                                    validación técnica UPDI y suscripción
                                    digital mensual del servicio de internet de
                                    las Instituciones Educativas de la provincia
                                    de Ambo.
                                </p>
                            </div>

                            {/* D. Tres Tarjetas de Funcionalidades Horizontales */}
                            {/* En desktop inician en sm:pl-12 lg:pl-14 para solaparse suavemente con la base de la estudiante tal como en la Imagen 1 original */}
                            <div className="relative z-20 grid grid-cols-1 gap-2.5 pt-4 sm:grid-cols-3 sm:pl-10 lg:pl-14">
                                {/* Tarjeta 1: Reporte */}
                                <Link
                                    href={reportUrl}
                                    className="group flex items-center justify-between gap-2 rounded-2xl border border-blue-100/90 bg-white/95 p-3 shadow-md shadow-blue-900/5 transition-all duration-200 hover:scale-[1.02] hover:border-blue-200 hover:bg-white hover:shadow-lg"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#0866F5] transition-colors group-hover:bg-[#0866F5] group-hover:text-white">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-[#102A6B]">
                                                Reporte
                                            </p>
                                            <p className="text-[10px] font-medium text-slate-500">
                                                Mensual
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors group-hover:bg-blue-50 group-hover:text-[#0866F5]">
                                        <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
                                    </div>
                                </Link>

                                {/* Tarjeta 2: Validación */}
                                <Link
                                    href={reportUrl}
                                    className="group flex items-center justify-between gap-2 rounded-2xl border border-emerald-100/90 bg-white/95 p-3 shadow-md shadow-blue-900/5 transition-all duration-200 hover:scale-[1.02] hover:border-emerald-200 hover:bg-white hover:shadow-lg"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E6F8F0] text-[#08BE80] transition-colors group-hover:bg-[#08BE80] group-hover:text-white">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-[#102A6B]">
                                                Validación
                                            </p>
                                            <p className="text-[10px] font-medium text-slate-500">
                                                UPDI Ambo
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors group-hover:bg-emerald-50 group-hover:text-[#08BE80]">
                                        <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
                                    </div>
                                </Link>

                                {/* Tarjeta 3: Firma */}
                                <Link
                                    href={signatureUrl}
                                    className="group flex items-center justify-between gap-2 rounded-2xl border border-purple-100/90 bg-white/95 p-3 shadow-md shadow-blue-900/5 transition-all duration-200 hover:scale-[1.02] hover:border-purple-200 hover:bg-white hover:shadow-lg"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F3EEFF] text-[#7139F5] transition-colors group-hover:bg-[#7139F5] group-hover:text-white">
                                            <PenLine className="h-4 w-4" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-[#102A6B]">
                                                Firma
                                            </p>
                                            <p className="text-[10px] font-medium text-slate-500">
                                                Digital
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors group-hover:bg-purple-50 group-hover:text-[#7139F5]">
                                        <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Columna Derecha: Auditoría de Red, Router Institucional y Soporte (lg:col-span-5) */}
                        <div className="space-y-3.5 lg:col-span-5">
                            {/* C. Panel de Auditoría de Red y Conectividad */}
                            <div className="overflow-hidden rounded-2xl border border-blue-100/80 bg-white shadow-xl shadow-blue-950/5">
                                {/* Encabezado azul marino degradado */}
                                <div className="flex items-center justify-between bg-gradient-to-r from-[#0C1E4E] via-[#102A6B] to-[#123078] px-4 py-3.5 text-white sm:px-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/20 text-[#168BFF]">
                                            <Globe className="h-4.5 w-4.5 stroke-[2]" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold tracking-tight text-white sm:text-sm">
                                                Auditoría de Red y Conectividad
                                            </h3>
                                            <p className="text-[10px] font-normal text-blue-200/80 sm:text-xs">
                                                UGEL Ambo • Región Huánuco
                                            </p>
                                        </div>
                                    </div>
                                    {/* Indicador VERIFICADO verde */}
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#08BE80] px-3.5 py-1 text-[11px] font-extrabold text-white shadow-sm shadow-emerald-500/30">
                                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                                        VERIFICADO
                                    </span>
                                </div>

                                {/* Filas de verificación con estados */}
                                <div className="space-y-2.5 p-3.5 sm:p-4">
                                    {/* Fila 1 */}
                                    <div className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] p-2.5 transition-colors hover:bg-blue-50/40">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F5EEFD] text-[#7139F5]">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <span className="flex-1 text-xs font-semibold text-[#1E293B]">
                                            Acta mensual emitida y firmada por
                                            Dirección IE
                                        </span>
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#08BE80]" />
                                    </div>

                                    {/* Fila 2 */}
                                    <div className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] p-2.5 transition-colors hover:bg-blue-50/40">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EBF3FF] text-[#0866F5]">
                                            <BarChart2 className="h-4 w-4" />
                                        </div>
                                        <span className="flex-1 text-xs font-semibold text-[#1E293B]">
                                            Velocidad de internet y latencia
                                            verificadas
                                        </span>
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#08BE80]" />
                                    </div>

                                    {/* Fila 3 */}
                                    <div className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] p-2.5 transition-colors hover:bg-blue-50/40">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FFF0F0] text-[#EF4444]">
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                        <span className="flex-1 text-xs font-semibold text-[#1E293B]">
                                            Visto Bueno y Conformidad técnica
                                            UPDI aprobada
                                        </span>
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#08BE80]" />
                                    </div>

                                    {/* Fila 4 */}
                                    <div className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] p-2.5 transition-colors hover:bg-blue-50/40">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FFFBEB] text-[#F59E0B]">
                                            <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                                        </div>
                                        <span className="flex-1 text-xs font-semibold text-[#1E293B]">
                                            Cumplimiento de estándares de
                                            conectividad
                                        </span>
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#08BE80]" />
                                    </div>
                                </div>
                            </div>

                            {/* E. Panel de Estado del Router Institucional */}
                            <div className="flex items-center justify-between rounded-2xl border border-blue-900/40 bg-gradient-to-r from-[#081538] via-[#0C1F4E] to-[#0E2562] p-3 text-white shadow-xl shadow-blue-950/20 sm:p-3.5">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-600/25 text-[#168BFF]">
                                        <Wifi className="h-5 w-5 animate-pulse" />
                                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#08BE80] shadow-xs shadow-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-white sm:text-sm">
                                                Router Institucional
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#08BE80]">
                                                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-[#08BE80]" />
                                                En línea
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-normal text-blue-200/70 sm:text-[11px]">
                                            Fibra Óptica - Ancho de Banda
                                            Garantizado
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className="inline-block rounded-lg border border-blue-400/30 bg-[#0B2B62] px-3 py-1 font-mono text-xs font-black tracking-tight text-[#168BFF] shadow-xs sm:text-sm">
                                        100 Mbps
                                    </span>
                                    <p className="mt-0.5 text-[9px] font-bold tracking-wider text-blue-300/60 uppercase">
                                        Simétrico
                                    </p>
                                </div>
                            </div>

                            {/* F. Barra de Soporte Técnico */}
                            <div className="flex items-center justify-between rounded-2xl border border-[#FFBD26]/70 bg-[#FFFDF6] px-4 py-2.5 text-xs shadow-xs transition-colors hover:border-[#FFBD26] hover:bg-[#FFFDF0]">
                                <a
                                    href="tel:925523419"
                                    className="flex items-center gap-2 font-bold text-slate-800 transition-colors hover:text-[#B45309]"
                                >
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-[#D97706]">
                                        <Phone className="h-3.5 w-3.5" />
                                    </div>
                                    <span>Mesa de Ayuda UPDI: 925 523 419</span>
                                </a>
                                <span className="rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[10px] font-bold text-[#B45309] sm:text-xs">
                                    Lun - Vie
                                </span>
                            </div>
                        </div>
                    </main>

                    {/* G. Pie de Página (Footer) */}
                    <footer className="w-full pt-4">
                        <div className="relative overflow-hidden rounded-2xl border border-blue-900/50 bg-[#071333] px-5 py-3.5 text-white shadow-xl">
                            {/* Formas onduladas decorativas vectoriales en azul y violeta */}
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0 opacity-40"
                            >
                                <svg
                                    className="absolute -bottom-4 left-0 h-16 w-1/2 text-[#0866F5]"
                                    viewBox="0 0 600 120"
                                    preserveAspectRatio="none"
                                >
                                    <path
                                        d="M0,40 C150,10 350,90 600,30 L600,120 L0,120 Z"
                                        fill="currentColor"
                                    />
                                </svg>
                                <svg
                                    className="absolute right-0 -bottom-3 h-16 w-1/2 text-[#7139F5]"
                                    viewBox="0 0 600 120"
                                    preserveAspectRatio="none"
                                >
                                    <path
                                        d="M0,30 C200,90 400,10 600,40 L600,120 L0,120 Z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </div>

                            {/* Contenido en dos columnas */}
                            <div className="relative z-10 flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
                                <div>
                                    <p className="text-xs font-bold text-white">
                                        © 2026 UGEL Ambo
                                    </p>
                                    <p className="text-[11px] font-medium text-blue-200/80">
                                        Jordan Brandon Ayala Romero
                                    </p>
                                </div>

                                <div className="hidden h-7 w-[1px] bg-blue-800/60 sm:block" />

                                <div className="sm:text-right">
                                    <p className="text-xs font-bold text-white">
                                        Unidad de Gestión Educativa Local
                                    </p>
                                    <p className="text-[11px] font-medium text-blue-200/80">
                                        Sistema de Conformidad de Internet
                                    </p>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
