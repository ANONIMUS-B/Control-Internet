import { useState } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { FileSignature, ArrowRight, X, AlertTriangle, Sparkles } from 'lucide-react';

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
    if (!user || user.role !== 'director' || user.has_signature || isDismissed) {
        return null;
    }

    if (compact) {
        return (
            <div className={`p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs shadow-sm flex items-center justify-between gap-3 ${className}`}>
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                        <FileSignature className="w-4 h-4" />
                    </div>
                    <span className="truncate">
                        <strong>Firma Digital pendiente:</strong> Tu oficio PDF saldrá sin firma hasta que la configures.
                    </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href="/firma"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] shadow-sm hover:scale-105 active:scale-95 transition-all"
                    >
                        <span>Configurar</span>
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                    {dismissible && (
                        <button
                            onClick={() => setIsDismissed(true)}
                            className="p-1 text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                            title="Descartar aviso"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-amber-100/30 dark:from-amber-950/40 dark:via-slate-900/60 dark:to-orange-950/20 border border-amber-300/80 dark:border-amber-500/30 p-5 shadow-md shadow-amber-500/5 transition-all duration-300 ${className}`}>
            {/* Decoración luminosa */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                    <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 ring-4 ring-amber-500/10 shrink-0">
                        <FileSignature className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                                <span>Firma Digital Pendiente de Configuración</span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-500/30">
                                    <AlertTriangle className="w-3 h-3" />
                                    Requerida
                                </span>
                            </h3>
                        </div>
                        <p className="text-xs text-amber-900/80 dark:text-amber-300/80 leading-relaxed max-w-2xl">
                            Aún no has registrado tu firma digital en el sistema. Configúrala en 1 minuto dibujándola o subiendo una imagen para que tus oficios de conformidad salgan firmados oficialmente.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto self-end md:self-auto shrink-0">
                    <Link
                        href="/firma"
                        className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-semibold shadow-md shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                        <span>Configurar mi Firma Ahora</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {dismissible && (
                        <button
                            onClick={() => setIsDismissed(true)}
                            className="p-2 text-amber-600 dark:text-amber-400 hover:text-amber-800 hover:bg-amber-200/50 dark:hover:bg-amber-900/30 rounded-xl transition-colors"
                            title="Ocultar aviso por ahora"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

