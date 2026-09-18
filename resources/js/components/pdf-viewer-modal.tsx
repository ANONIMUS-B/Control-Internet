import { useState, useEffect } from 'react';
import { 
    X, 
    Download, 
    ExternalLink, 
    FileText, 
    Loader2, 
    Maximize2, 
    Minimize2,
    RefreshCw
} from 'lucide-react';

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

    if (!isOpen || !pdfUrl) return null;

    const handleReload = () => {
        setIsLoading(true);
        setKey(prev => prev + 1);
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div 
                className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden transition-all duration-300 w-full ${
                    isFullscreen ? 'h-full max-w-none rounded-none' : 'max-w-5xl h-[92vh]'
                }`}
            >
                {/* Header del Modal */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-200 dark:border-white/10 bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400 truncate">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Acciones del visor */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={handleReload}
                            className="p-2 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-white/10 rounded-xl transition-all"
                            title="Recargar documento"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>

                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-white/10 rounded-xl transition-all"
                            title="Abrir en nueva pestaña"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>

                        <a
                            href={pdfUrl}
                            download={downloadFileName || 'documento.pdf'}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-medium transition-all shadow-md shadow-rose-600/20 active:scale-95"
                            title="Descargar archivo"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Descargar</span>
                        </a>

                        <button
                            type="button"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-2 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-white/10 rounded-xl transition-all hidden md:block"
                            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-200/80 dark:hover:bg-white/10 rounded-xl transition-all ml-1"
                            title="Cerrar (Esc)"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Contenedor del PDF */}
                <div className="relative flex-1 bg-neutral-900/95 dark:bg-black overflow-hidden">
                    {isLoading && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
                            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse">
                                <Loader2 className="w-7 h-7 animate-spin" />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-semibold text-gray-800 dark:text-neutral-200">
                                    Generando y cargando documento...
                                </p>
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-0.5">
                                    Esto puede tomar un par de segundos
                                </p>
                            </div>
                        </div>
                    )}

                    <iframe
                        key={key}
                        src={pdfUrl}
                        className="w-full h-full border-0"
                        title="Visor de PDF"
                        onLoad={() => setIsLoading(false)}
                    />
                </div>

                {/* Footer del Modal */}
                <div className="px-4 py-2 bg-gray-50 dark:bg-slate-800/60 border-t border-gray-200 dark:border-white/10 flex items-center justify-between text-[11px] text-gray-500 dark:text-neutral-400">
                    <span className="truncate">Presiona <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-neutral-300 font-mono text-[10px]">Esc</kbd> para salir</span>
                    <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 flex items-center gap-1"
                    >
                        <span>¿Problemas al ver el documento? Ábrelo directamente</span>
                    </a>
                </div>
            </div>
        </div>
    );
}

