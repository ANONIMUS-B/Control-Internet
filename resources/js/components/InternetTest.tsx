// resources/js/components/InternetTest.tsx

import { useState } from 'react';
import { Wifi, Activity, Server, Globe, Loader2, XCircle, X, Zap, Clock, Award } from 'lucide-react';

interface TestResult {
    download: number;
    upload: number;
    ping: number;
    jitter: number;
    isp: string;
    server: string;
    server_location: string;
    timestamp: string;
    note?: string;
}

interface InternetTestProps {
    onResult?: (result: TestResult) => void;
    onClose?: () => void;
}

export default function InternetTest({ onResult, onClose }: InternetTestProps) {
    const [isTesting, setIsTesting] = useState(false);
    const [result, setResult] = useState<TestResult | null>(null);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const runTest = async () => {
        setIsTesting(true);
        setProgress(0);
        setResult(null);
        setError(null);

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) {
                    clearInterval(progressInterval);
                    return 95;
                }
                return prev + 10;
            });
        }, 400);

        try {
            const response = await fetch('/speedtest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            clearInterval(progressInterval);
            setProgress(100);

            if (!response.ok) {
                throw new Error('Error al realizar la prueba');
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Error en la prueba');
            }

            setResult(data);
            if (onResult) {
                onResult(data);
            }

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Error al realizar la prueba');
        } finally {
            setIsTesting(false);
        }
    };

    const formatSpeed = (speed: number) => {
        if (speed < 1) return `${(speed * 1024).toFixed(0)} Kbps`;
        return `${speed.toFixed(1)} Mbps`;
    };

    const getQualityColor = (download: number) => {
        if (download >= 50) return 'text-emerald-600 dark:text-emerald-400';
        if (download >= 20) return 'text-blue-600 dark:text-blue-400';
        if (download >= 5) return 'text-amber-600 dark:text-amber-400';
        return 'text-rose-600 dark:text-rose-400';
    };

    const getQualityLabel = (download: number) => {
        if (download >= 50) return 'Excelente';
        if (download >= 20) return 'Buena';
        if (download >= 5) return 'Regular';
        return 'Mala';
    };

    const getPingColor = (ping: number) => {
        if (ping < 50) return 'text-emerald-600 dark:text-emerald-400';
        if (ping < 100) return 'text-blue-600 dark:text-blue-400';
        if (ping < 200) return 'text-amber-600 dark:text-amber-400';
        return 'text-rose-600 dark:text-rose-400';
    };

    return (
        <div className="bg-white dark:bg-neutral-900/80 rounded-2xl shadow-xl border border-sidebar-border/70 dark:border-sidebar-border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
                        <Wifi className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-neutral-800 dark:text-white">Speedtest</h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Prueba de velocidad de internet</p>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-neutral-500" />
                    </button>
                )}
            </div>

            {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800 mb-4">
                    <div className="flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                        <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
                    </div>
                </div>
            )}

            {result && result.download > 0 && (
                <div className="space-y-4 mb-4">
                    {/* Velocidad de descarga */}
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/30 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">📥 Descarga</p>
                                <p className={`text-2xl font-bold ${getQualityColor(result.download)}`}>
                                    {formatSpeed(result.download)}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                result.download >= 20 
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' 
                                    : result.download >= 5
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                            }`}>
                                {getQualityLabel(result.download)}
                            </span>
                        </div>
                    </div>

                    {/* Velocidad de subida y ping */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/30 dark:from-emerald-950/30 dark:to-emerald-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">📤 Subida</p>
                            <p className="text-lg font-bold text-neutral-800 dark:text-white">
                                {formatSpeed(result.upload)}
                            </p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/30 dark:from-purple-950/30 dark:to-purple-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">📶 Ping</p>
                            <p className={`text-lg font-bold ${getPingColor(result.ping)}`}>
                                {result.ping.toFixed(0)} ms
                            </p>
                        </div>
                    </div>

                    {/* Información del servidor */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                            <Server className="w-3.5 h-3.5" />
                            <span className="truncate">{result.server}</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                            <Globe className="w-3.5 h-3.5" />
                            <span className="truncate">{result.server_location || result.isp}</span>
                        </div>
                    </div>

                    {result.note && (
                        <div className="text-center text-[10px] text-amber-600 dark:text-amber-400">
                            ℹ️ {result.note}
                        </div>
                    )}

                    <div className="text-center text-[10px] text-neutral-400 dark:text-neutral-500 border-t border-neutral-200/50 dark:border-neutral-700/50 pt-2">
                        Prueba realizada: {new Date(result.timestamp).toLocaleString()}
                    </div>
                </div>
            )}

            {/* Botón de prueba */}
            <button
                onClick={runTest}
                disabled={isTesting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white font-medium py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
                {isTesting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Probando... {progress}%</span>
                    </>
                ) : (
                    <>
                        <Zap className="w-5 h-5" />
                        <span className="font-semibold">{result ? '🔄 Volver a probar' : '🚀 Iniciar Speedtest'}</span>
                    </>
                )}
            </button>

            {/* Barra de progreso */}
            {isTesting && (
                <div className="mt-4 space-y-2">
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-neutral-500 dark:text-neutral-400">
                        <span>
                            {progress < 30 ? '🔍 Buscando servidor...' :
                             progress < 60 ? '📥 Probando descarga...' :
                             progress < 90 ? '📤 Probando subida...' :
                             '✅ Finalizando...'}
                        </span>
                        <span>{progress}%</span>
                    </div>
                </div>
            )}

            {/* Mensaje informativo */}
            {!result && !isTesting && !error && (
                <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                    <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Prueba de velocidad con servidores Speedtest para resultados precisos
                    </p>
                </div>
            )}
        </div>
    );
}