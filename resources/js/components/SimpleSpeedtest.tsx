// resources/js/components/SimpleSpeedtest.tsx

import { Wifi, Loader2, X, Zap, Award, Server, Globe } from 'lucide-react';
import { useState } from 'react';

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

export default function SimpleSpeedtest({
    onResult,
    onClose,
}: SimpleSpeedtestProps) {
    const [testing, setTesting] = useState(false);
    const [result, setResult] = useState<SpeedtestResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const runTest = async () => {
        setTesting(true);
        setError(null);

        try {
            const response = await fetch('/speedtest/simple', {
                headers: {
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
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

            if (onResult) {
                onResult(data.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error');
        } finally {
            setTesting(false);
        }
    };

    const formatSpeed = (speed: number) => {
        if (!speed || speed < 0) {
            return '0.0';
        }

        if (speed < 1) {
            return `${(speed * 1024).toFixed(0)} Kbps`;
        }

        return `${speed.toFixed(1)} Mbps`;
    };

    const getQuality = (download: number) => {
        if (download >= 50) {
            return {
                label: 'Excelente',
                color: 'text-emerald-600 dark:text-emerald-400',
                bg: 'bg-emerald-50 dark:bg-emerald-950/30',
            };
        }

        if (download >= 20) {
            return {
                label: 'Buena',
                color: 'text-blue-600 dark:text-blue-400',
                bg: 'bg-blue-50 dark:bg-blue-950/30',
            };
        }

        if (download >= 5) {
            return {
                label: 'Regular',
                color: 'text-amber-600 dark:text-amber-400',
                bg: 'bg-amber-50 dark:bg-amber-950/30',
            };
        }

        return {
            label: 'Mala',
            color: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-rose-50 dark:bg-rose-950/30',
        };
    };

    const quality = result
        ? getQuality(result.download)
        : { label: '', color: '', bg: '' };

    return (
        <div className="w-full max-w-md rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-xl dark:border-sidebar-border dark:bg-neutral-900/80">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 shadow-lg shadow-blue-500/25">
                        <Wifi className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-neutral-800 dark:text-white">
                            Speedtest
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Prueba simple
                        </p>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                        <X className="h-5 w-5 text-neutral-500" />
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-950/30">
                    <p className="text-sm text-rose-700 dark:text-rose-400">
                        {error}
                    </p>
                </div>
            )}

            {result && (
                <div className="mb-4 space-y-4">
                    <div
                        className={`p-5 ${quality.bg} rounded-xl border text-center`}
                    >
                        <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                            📥 DESCARGA
                        </p>
                        <p className={`text-4xl font-bold ${quality.color}`}>
                            {formatSpeed(result.download)}
                        </p>
                        <span
                            className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${quality.bg} ${quality.color}`}
                        >
                            {quality.label}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-emerald-200/50 bg-emerald-50 p-4 text-center dark:border-emerald-800/50 dark:bg-emerald-950/30">
                            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                📤 SUBIDA
                            </p>
                            <p className="text-xl font-bold text-neutral-800 dark:text-white">
                                {formatSpeed(result.upload)}
                            </p>
                        </div>
                        <div className="rounded-xl border border-purple-200/50 bg-purple-50 p-4 text-center dark:border-purple-800/50 dark:bg-purple-950/30">
                            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                📶 PING
                            </p>
                            <p className="text-xl font-bold text-neutral-800 dark:text-white">
                                {result.ping
                                    ? `${result.ping.toFixed(0)} ms`
                                    : 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-xl border border-neutral-200/50 bg-neutral-50 p-3 text-xs dark:border-neutral-700/50 dark:bg-neutral-800/50">
                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                            <Server className="h-3.5 w-3.5" />
                            <span className="truncate">{result.server}</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                            <Globe className="h-3.5 w-3.5" />
                            <span className="truncate">{result.location}</span>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={runTest}
                disabled={testing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
            >
                {testing ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Probando...
                    </>
                ) : (
                    <>
                        <Zap className="h-5 w-5" />
                        {result ? 'Volver a probar' : 'Iniciar Speedtest'}
                    </>
                )}
            </button>

            {!result && !testing && !error && (
                <div className="mt-4 rounded-xl border border-blue-200/50 bg-blue-50/50 p-3 dark:border-blue-800/50 dark:bg-blue-950/20">
                    <p className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                        <Award className="h-4 w-4" />
                        Prueba simple sin instalaciones
                    </p>
                </div>
            )}
        </div>
    );
}
