// resources/js/components/SpeedtestCapture.tsx

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
    FileImage,
} from 'lucide-react';
import { useState } from 'react';

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
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
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

        if (isNaN(num)) {
            return value;
        }

        return num.toFixed(1);
    };

    return (
        <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-xl dark:border-sidebar-border dark:bg-neutral-900/80">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-2 shadow-lg shadow-purple-500/25">
                        <Wifi className="h-6 w-6 text-white" />
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
                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
                    <div className="flex items-center gap-2">
                        {isCapturing ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        )}
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            {status}
                        </p>
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-800 dark:bg-rose-950/30">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-rose-600" />
                        <p className="text-sm text-rose-700 dark:text-rose-400">
                            {error}
                        </p>
                    </div>
                </div>
            )}

            <button
                onClick={captureSpeedtest}
                disabled={isCapturing}
                className="flex w-full transform items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 py-3 font-medium text-white transition-all hover:scale-[1.02] hover:from-blue-700 hover:via-indigo-700 hover:to-purple-800 active:scale-[0.98] disabled:opacity-50"
            >
                {isCapturing ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Capturando...
                    </>
                ) : (
                    <>
                        <Camera className="h-5 w-5" />
                        Capturar Speedtest
                    </>
                )}
            </button>

            {result && (
                <div className="mt-4 space-y-4">
                    <div className="overflow-hidden rounded-xl border bg-black/5 dark:bg-white/5">
                        <img
                            src={result.image_url}
                            alt="Speedtest Result"
                            className="h-auto max-h-[300px] w-full object-contain"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl border border-blue-200/50 bg-blue-50 p-3 text-center dark:border-blue-800/50 dark:bg-blue-950/30">
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                📥 Descarga
                            </p>
                            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                                {formatSpeed(result.download)} Mbps
                            </p>
                        </div>
                        <div className="rounded-xl border border-emerald-200/50 bg-emerald-50 p-3 text-center dark:border-emerald-800/50 dark:bg-emerald-950/30">
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                📤 Subida
                            </p>
                            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                                {formatSpeed(result.upload)} Mbps
                            </p>
                        </div>
                        <div className="rounded-xl border border-purple-200/50 bg-purple-50 p-3 text-center dark:border-purple-800/50 dark:bg-purple-950/30">
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                📶 Ping
                            </p>
                            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                                {formatSpeed(result.ping)} ms
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-neutral-200/50 bg-neutral-50 p-3 text-xs dark:border-neutral-700/50 dark:bg-neutral-800/50">
                        <div className="flex items-center gap-2">
                            <Server className="h-4 w-4 text-neutral-500" />
                            <span className="text-neutral-600 dark:text-neutral-400">
                                ISP:
                            </span>
                            <span className="font-medium text-neutral-800 dark:text-white">
                                {result.isp}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-neutral-500" />
                            <span className="text-neutral-400 dark:text-neutral-500">
                                {new Date(
                                    result.timestamp,
                                ).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <a
                            href={result.image_url}
                            download
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-all hover:bg-emerald-700"
                        >
                            <Download className="h-4 w-4" />
                            Descargar
                        </a>
                        <button
                            onClick={() => setResult(null)}
                            className="rounded-lg bg-rose-600 px-4 py-2 text-white transition-all hover:bg-rose-700"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
                <p className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                    <FileImage className="h-4 w-4" />
                    El sistema abrirá Speedtest.net automáticamente y capturará
                    los resultados
                </p>
            </div>
        </div>
    );
}
