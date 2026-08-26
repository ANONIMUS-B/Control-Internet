// resources/js/components/SimpleSpeedtest.tsx

import { useState } from 'react';
import { Wifi, Loader2, X, Zap, Award, Server, Globe } from 'lucide-react';

interface SpeedtestResult {
    download: number;
    upload: number;
    ping: number;
    isp: string;
    server: string;
    location: string;
    timestamp: string;
}

interface SimpleSpeedtestProps {
    onResult?: (result: SpeedtestResult) => void;
    onClose?: () => void;
}

export default function SimpleSpeedtest({ onResult, onClose }: SimpleSpeedtestProps) {
    const [testing, setTesting] = useState(false);
    const [result, setResult] = useState<SpeedtestResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const runTest = async () => {
        setTesting(true);
        setError(null);

        try {
            const response = await fetch('/speedtest/simple', {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error('Error en la prueba');
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Error');
            }

            setResult(data.data);
            if (onResult) onResult(data.data);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error');
        } finally {
            setTesting(false);
        }
    };

    const formatSpeed = (speed: number) => {
        if (!speed || speed < 0) return '0.0';
        if (speed < 1) return `${(speed * 1024).toFixed(0)} Kbps`;
        return `${speed.toFixed(1)} Mbps`;
    };

    const getQuality = (download: number) => {
        if (download >= 50) return { label: 'Excelente', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' };
        if (download >= 20) return { label: 'Buena', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' };
        if (download >= 5) return { label: 'Regular', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' };
        return { label: 'Mala', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30' };
    };

    const quality = result ? getQuality(result.download) : { label: '', color: '', bg: '' };

    return (
        <div className="bg-white dark:bg-neutral-900/80 rounded-2xl shadow-xl border border-sidebar-border/70 dark:border-sidebar-border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/25">
                        <Wifi className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-neutral-800 dark:text-white">Speedtest</h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Prueba simple</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
                        <X className="w-5 h-5 text-neutral-500" />
                    </button>
                )}
            </div>

            {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800 mb-4">
                    <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
                </div>
            )}

            {result && (
                <div className="space-y-4 mb-4">
                    <div className={`p-5 ${quality.bg} rounded-xl border text-center`}>
                        <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">📥 DESCARGA</p>
                        <p className={`text-4xl font-bold ${quality.color}`}>
                            {formatSpeed(result.download)}
                        </p>
                        <span className={`inline-block px-3 py-1 mt-1 rounded-full text-xs font-medium ${quality.bg} ${quality.color}`}>
                            {quality.label}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 text-center">
                            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">📤 SUBIDA</p>
                            <p className="text-xl font-bold text-neutral-800 dark:text-white">
                                {formatSpeed(result.upload)}
                            </p>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200/50 dark:border-purple-800/50 text-center">
                            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">📶 PING</p>
                            <p className="text-xl font-bold text-neutral-800 dark:text-white">
                                {result.ping ? `${result.ping.toFixed(0)} ms` : 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50">
                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                            <Server className="w-3.5 h-3.5" />
                            <span className="truncate">{result.server}</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                            <Globe className="w-3.5 h-3.5" />
                            <span className="truncate">{result.location}</span>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={runTest}
                disabled={testing}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50"
            >
                {testing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Probando...
                    </>
                ) : (
                    <>
                        <Zap className="w-5 h-5" />
                        {result ? 'Volver a probar' : 'Iniciar Speedtest'}
                    </>
                )}
            </button>

            {!result && !testing && !error && (
                <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                    <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Prueba simple sin instalaciones
                    </p>
                </div>
            )}
        </div>
    );
}