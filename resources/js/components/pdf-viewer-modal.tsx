import {
    X,
    Download,
    ExternalLink,
    FileText,
    Loader2,
    Maximize2,
    Minimize2,
    RefreshCw,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface PdfViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    pdfUrl: string | null;
    title?: string;
    subtitle?: string;
    downloadFileName?: string;
}

export function PdfViewerModal({
    isOpen,
    onClose,
    pdfUrl,
    title = 'Vista Previa del Oficio',
    subtitle,
    downloadFileName,
}: PdfViewerModalProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [key, setKey] = useState(0);

    // Resetear loading cuando cambia la URL
    useEffect(() => {
        if (isOpen && pdfUrl) {
            setIsLoading(true);
        }
    }, [pdfUrl, isOpen]);

    // Cerrar con Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !pdfUrl) {
        return null;
    }

    const handleReload = () => {
        setIsLoading(true);
        setKey((prev) => prev + 1);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/70 p-2 backdrop-blur-sm duration-200 fade-in sm:p-4 md:p-6"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className={`flex w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all duration-300 dark:border-white/10 dark:bg-slate-900 ${
                    isFullscreen
                        ? 'h-full max-w-none rounded-none'
                        : 'h-[92vh] max-w-5xl'
                }`}
            >
                {/* Header del Modal */}
                <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/80 px-4 py-3.5 backdrop-blur sm:px-6 dark:border-white/10 dark:bg-slate-800/80">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="shrink-0 rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-600 dark:text-rose-400">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="truncate text-sm font-bold text-gray-900 dark:text-white">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="truncate text-[11px] text-gray-500 dark:text-neutral-400">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Acciones del visor */}
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                        <button
                            type="button"
                            onClick={handleReload}
                            className="rounded-xl p-2 text-gray-500 transition-all hover:bg-gray-200/60 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
                            title="Recargar documento"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>

                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl p-2 text-gray-500 transition-all hover:bg-gray-200/60 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
                            title="Abrir en nueva pestaña"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>

                        <a
                            href={pdfUrl}
                            download={downloadFileName || 'documento.pdf'}
                            className="hidden items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-medium text-white shadow-md shadow-rose-600/20 transition-all hover:bg-rose-700 active:scale-95 sm:flex"
                            title="Descargar archivo"
                        >
                            <Download className="h-3.5 w-3.5" />
                            <span>Descargar</span>
                        </a>

                        <button
                            type="button"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="hidden rounded-xl p-2 text-gray-500 transition-all hover:bg-gray-200/60 hover:text-gray-900 md:block dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
                            title={
                                isFullscreen
                                    ? 'Salir de pantalla completa'
                                    : 'Pantalla completa'
                            }
                        >
                            {isFullscreen ? (
                                <Minimize2 className="h-4 w-4" />
                            ) : (
                                <Maximize2 className="h-4 w-4" />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="ml-1 rounded-xl p-2 text-gray-400 transition-all hover:bg-gray-200/80 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
                            title="Cerrar (Esc)"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Contenedor del PDF */}
                <div className="relative flex-1 overflow-hidden bg-neutral-900/95 dark:bg-black">
                    {isLoading && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/90 backdrop-blur-sm dark:bg-slate-900/90">
                            <div className="animate-pulse rounded-2xl bg-rose-500/10 p-3 text-rose-600 dark:text-rose-400">
                                <Loader2 className="h-7 w-7 animate-spin" />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-semibold text-gray-800 dark:text-neutral-200">
                                    Generando y cargando documento...
                                </p>
                                <p className="mt-0.5 text-[11px] text-gray-500 dark:text-neutral-400">
                                    Esto puede tomar un par de segundos
                                </p>
                            </div>
                        </div>
                    )}

                    <iframe
                        key={key}
                        src={pdfUrl}
                        className="h-full w-full border-0"
                        title="Visor de PDF"
                        onLoad={() => setIsLoading(false)}
                    />
                </div>

                {/* Footer del Modal */}
                <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2 text-[11px] text-gray-500 dark:border-white/10 dark:bg-slate-800/60 dark:text-neutral-400">
                    <span className="truncate">
                        Presiona{' '}
                        <kbd className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-[10px] text-gray-700 dark:bg-white/10 dark:text-neutral-300">
                            Esc
                        </kbd>{' '}
                        para salir
                    </span>
                    <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 underline underline-offset-2 hover:text-rose-600 dark:hover:text-rose-400"
                    >
                        <span>
                            ¿Problemas al ver el documento? Ábrelo directamente
                        </span>
                    </a>
                </div>
            </div>
        </div>
    );
}
