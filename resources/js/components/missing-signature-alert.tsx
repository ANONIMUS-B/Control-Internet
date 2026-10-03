import { usePage, Link } from '@inertiajs/react';
import {
    FileSignature,
    ArrowRight,
    X,
    AlertTriangle,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';

interface MissingSignatureAlertProps {
    compact?: boolean;
    dismissible?: boolean;
    className?: string;
}

export function MissingSignatureAlert({
    compact = false,
    dismissible = true,
    className = '',
}: MissingSignatureAlertProps) {
    const { auth } = usePage().props as any;
    const user = auth?.user;

    const [isDismissed, setIsDismissed] = useState(false);

    // Solo mostrar para directores que no tengan firma registrada
    if (
        !user ||
        user.role !== 'director' ||
        user.has_signature ||
        isDismissed
    ) {
        return null;
    }

    if (compact) {
        return (
            <div
                className={`flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-3 text-xs text-amber-900 shadow-sm dark:border-amber-500/30 dark:from-amber-950/30 dark:to-orange-950/20 dark:text-amber-200 ${className}`}
            >
                <div className="flex min-w-0 items-center gap-2.5">
                    <div className="shrink-0 rounded-xl bg-amber-100 p-1.5 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                        <FileSignature className="h-4 w-4" />
                    </div>
                    <span className="truncate">
                        <strong>Firma Digital pendiente:</strong> Tu oficio PDF
                        saldrá sin firma hasta que la configures.
                    </span>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <Link
                        href="/firma"
                        className="inline-flex items-center gap-1 rounded-xl bg-amber-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm transition-all hover:scale-105 hover:bg-amber-700 active:scale-95"
                    >
                        <span>Configurar</span>
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                    {dismissible && (
                        <button
                            onClick={() => setIsDismissed(true)}
                            className="rounded-lg p-1 text-amber-500 transition-colors hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-900/30 dark:hover:text-amber-300"
                            title="Descartar aviso"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            className={`relative overflow-hidden rounded-3xl border border-amber-300/80 bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-amber-100/30 p-5 shadow-md shadow-amber-500/5 transition-all duration-300 dark:border-amber-500/30 dark:from-amber-950/40 dark:via-slate-900/60 dark:to-orange-950/20 ${className}`}
        >
            {/* Decoración luminosa */}
            <div className="pointer-events-none absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-amber-400/10 blur-2xl" />

            <div className="relative flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-start gap-3.5 sm:items-center">
                    <div className="shrink-0 rounded-2xl bg-amber-100 p-3 text-amber-600 ring-4 ring-amber-500/10 dark:bg-amber-500/20 dark:text-amber-400">
                        <FileSignature className="h-6 w-6" />
                    </div>

                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="flex items-center gap-1.5 text-sm font-bold text-amber-950 dark:text-amber-200">
                                <span>
                                    Firma Digital Pendiente de Configuración
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-200/80 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300">
                                    <AlertTriangle className="h-3 w-3" />
                                    Requerida
                                </span>
                            </h3>
                        </div>
                        <p className="max-w-2xl text-xs leading-relaxed text-amber-900/80 dark:text-amber-300/80">
                            Aún no has registrado tu firma digital en el
                            sistema. Configúrala en 1 minuto dibujándola o
                            subiendo una imagen para que tus oficios de
                            conformidad salgan firmados oficialmente.
                        </p>
                    </div>
                </div>

                <div className="flex w-full shrink-0 items-center gap-2.5 self-end md:w-auto md:self-auto">
                    <Link
                        href="/firma"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-amber-500/25 transition-all duration-200 hover:scale-105 hover:from-amber-600 hover:to-orange-700 hover:shadow-amber-500/40 active:scale-95 md:flex-initial"
                    >
                        <Sparkles className="h-3.5 w-3.5 text-amber-200" />
                        <span>Configurar mi Firma Ahora</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    {dismissible && (
                        <button
                            onClick={() => setIsDismissed(true)}
                            className="rounded-xl p-2 text-amber-600 transition-colors hover:bg-amber-200/50 hover:text-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/30"
                            title="Ocultar aviso por ahora"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
