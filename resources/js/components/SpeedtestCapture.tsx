// resources/js/components/SpeedtestCapture.tsx

import { useState } from 'react';
import { 
    Camera, 
    Loader2, 
    Download, 
    X, 
    CheckCircle2, 
    AlertCircle,
    Wifi,
    Clock,
    Server,
    FileImage
} from 'lucide-react';

interface SpeedtestData {
    download: string;
    upload: string;
    ping: string;
    isp: string;
    timestamp: string;
    image_url: string;
}

export default function SpeedtestCapture() {
    const [isCapturing, setIsCapturing] = useState(false);
    const [result, setResult] = useState<SpeedtestData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('');

    const captureSpeedtest = async () => {
        setIsCapturing(true);
        setError(null);
        setStatus('🚀 Iniciando captura...');

        try {
            setStatus('🌐 Conectando a Speedtest.net...');
            
            const response = await fetch('/speedtest/capture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Error en la captura');
            }

            setResult(data.data);
            setStatus('✅ ¡Captura completada!');
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al capturar');
            setStatus('❌ Error en la captura');
        } finally {
            setIsCapturing(false);
        }
    };

    const formatSpeed = (value: string) => {
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        return num.toFixed(1);
    };

    return (
        <div className="bg-white dark:bg-neutral-900/80 rounded-2xl shadow-xl border border-sidebar-border/70 dark:border-sidebar-border p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25">
                        <Wifi className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-neutral-800 dark:text-white">
                            Speedtest Automático
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Captura automática de Speedtest.net
                        </p>
                    </div>
                </div>
            </div>

            {status && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                    <div className="flex items-center gap-2">
                        {isCapturing ? (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                        <p className="text-sm text-blue-700 dark:text-blue-300">{status}</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800 mb-4">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
                    </div>
                </div>
            )}

            <button
                onClick={captureSpeedtest}
                disabled={isCapturing}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-800 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]"
            >
                {isCapturing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Capturando...
                    </>
                ) : (
                    <>
                        <Camera className="w-5 h-5" />
                        Capturar Speedtest
                    </>
                )}
            </button>

            {result && (
                <div className="mt-4 space-y-4">
                    <div className="border rounded-xl overflow-hidden bg-black/5 dark:bg-white/5">
                        <img 
                            src={result.image_url} 
                            alt="Speedtest Result" 
                            className="w-full h-auto max-h-[300px] object-contain"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200/50 dark:border-blue-800/50 text-center">
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">📥 Descarga</p>
                            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                                {formatSpeed(result.download)} Mbps
                            </p>
                        </div>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 text-center">
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">📤 Subida</p>
                            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                                {formatSpeed(result.upload)} Mbps
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200/50 dark:border-purple-800/50 text-center">
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">📶 Ping</p>
                            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                                {formatSpeed(result.ping)} ms
                            </p>
                        </div>
                    </div>

                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <Server className="w-4 h-4 text-neutral-500" />
                            <span className="text-neutral-600 dark:text-neutral-400">ISP:</span>
                            <span className="font-medium text-neutral-800 dark:text-white">{result.isp}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-neutral-500" />
                            <span className="text-neutral-400 dark:text-neutral-500">
                                {new Date(result.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <a
                            href={result.image_url}
                            download
                            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all"
                        >
                            <Download className="w-4 h-4" />
                            Descargar
                        </a>
                        <button
                            onClick={() => setResult(null)}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <FileImage className="w-4 h-4" />
                    El sistema abrirá Speedtest.net automáticamente y capturará los resultados
                </p>
            </div>
        </div>
    );
}