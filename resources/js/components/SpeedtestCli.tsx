// resources/js/components/SpeedtestCli.tsx

import { useState } from 'react';
import { 
    Wifi, 
    Activity, 
    Server, 
    Globe, 
    Loader2, 
    X, 
    Zap, 
    Award,
    Clock
} from 'lucide-react';

interface SpeedtestResult {
    download: number;
    upload: number;
    ping: number;
    isp: string;
    server: string;
    location: string;
    timestamp: string;
    raw_output?: string;
}

interface SpeedtestCliProps {
    onResult?: (result: SpeedtestResult) => void;
    onClose?: () => void;
}

export default function SpeedtestCli({ onResult, onClose }: SpeedtestCliProps) {
    const [isTesting, setIsTesting] = useState(false);
    const [result, setResult] = useState<SpeedtestResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<string>('');

    const runTest = async () => {
        setIsTesting(true);
        setError(null);
        setResult(null);
        setStep('🔍 Conectando...');

        try {
            setStep('📡 Buscando servidor...');
            
            const response = await fetch('/speedtest/cli', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al realizar la prueba');
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Error en la prueba');
            }

            setStep('✅ Prueba completada');
            
            // ✅ Asegurar que los datos tengan valores por defecto
            const resultData: SpeedtestResult = {
                download: typeof data.data?.download === 'number' ? data.data.download : 0,
                upload: typeof data.data?.upload === 'number' ? data.data.upload : 0,
                ping: typeof data.data?.ping === 'number' ? data.data.ping : 0,
                isp: data.data?.isp || 'Proveedor local',
                server: data.data?.server || 'Servidor Speedtest',
                location: data.data?.location || 'Desconocida',
                timestamp: data.data?.timestamp || new Date().toISOString(),
                raw_output: data.data?.raw_output || '',
            };
            
            setResult(resultData);
            
            if (onResult) {
                onResult(resultData);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al realizar la prueba');
            setStep('❌ Error');
        } finally {
            setIsTesting(false);
        }
    };

    // ✅ Función para formatear velocidad
    const formatSpeed = (speed: any) => {
        const num = parseFloat(speed);
        if (isNaN(num) || num === 0) return 'N/A';
        if (num < 1) return `${(num * 1024).toFixed(0)} Kbps`;
        return `${num.toFixed(1)} Mbps`;
    };

    // ✅ Función para obtener color de calidad
    const getQualityColor = (download: any) => {
        const num = parseFloat(download);
        if (isNaN(num) || num === 0) return 'text-neutral-500 dark:text-neutral-400';
        if (num >= 50) return 'text-emerald-600 dark:text-emerald-400';
        if (num >= 20) return 'text-blue-600 dark:text-blue-400';
        if (num >= 5) return 'text-amber-600 dark:text-amber-400';
        return 'text-rose-600 dark:text-rose-400';
    };

    // ✅ Función para obtener label de calidad
    const getQualityLabel = (download: any) => {
        const num = parseFloat(download);
        if (isNaN(num) || num === 0) return 'Sin datos';
        if (num >= 50) return 'Excelente';
        if (num >= 20) return 'Buena';
        if (num >= 5) return 'Regular';
        return 'Mala';
    };

    // ✅ Función para obtener background de calidad
    const getQualityBg = (download: any) => {
        const num = parseFloat(download);
        if (isNaN(num) || num === 0) return 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700';
        if (num >= 50) return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800';
        if (num >= 20) return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
        if (num >= 5) return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800';
        return 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800';
    };

    // ✅ Función para obtener color de ping
    const getPingColor = (ping: any) => {
        const num = parseFloat(ping);
        if (isNaN(num) || num === 0) return 'text-neutral-500 dark:text-neutral-400';
        if (num < 30) return 'text-emerald-600 dark:text-emerald-400';
        if (num < 60) return 'text-blue-600 dark:text-blue-400';
        if (num < 100) return 'text-amber-600 dark:text-amber-400';
        return 'text-rose-600 dark:text-rose-400';
    };

    // ✅ Función para obtener background de ping
    const getPingBg = (ping: any) => {
        const num = parseFloat(ping);
        if (isNaN(num) || num === 0) return 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700';
        if (num < 30) return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800';
        if (num < 60) return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
        if (num < 100) return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800';
        return 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800';
    };

    // ✅ Función para obtener color de estado
    const getStatusColor = (value: any) => {
        const num = parseFloat(value);
        if (isNaN(num) || num === 0) return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400';
        if (num >= 50) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400';
        if (num >= 20) return 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400';
        if (num >= 5) return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400';
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400';
    };

    return (
        <div className="bg-white dark:bg-neutral-900/80 rounded-2xl shadow-xl border border-sidebar-border/70 dark:border-sidebar-border p-6 w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/25">
                        <Wifi className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-neutral-800 dark:text-white">Speedtest</h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Prueba de velocidad CLI</p>
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

            {/* Estado de la prueba */}
            {step && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                    <div className="flex items-center gap-2">
                        {isTesting ? (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        ) : (
                            <Award className="w-4 h-4 text-emerald-600" />
                        )}
                        <p className="text-sm text-blue-700 dark:text-blue-300">{step}</p>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800 mb-4">
                    <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
                </div>
            )}

            {/* Resultados */}
            {result && (
                <div className="space-y-4 mb-4">
                    {/* Velocidad de descarga */}
                    <div className={`p-5 ${getQualityBg(result.download)} rounded-xl border text-center`}>
                        <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">📥 DESCARGA</p>
                        <p className={`text-4xl font-bold ${getQualityColor(result.download)}`}>
                            {formatSpeed(result.download)}
                        </p>
                        <span className={`inline-block px-3 py-1 mt-1 rounded-full text-xs font-medium ${getStatusColor(result.download)}`}>
                            {getQualityLabel(result.download)}
                        </span>
                    </div>

                    {/* Subida y ping */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 text-center">
                            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">📤 SUBIDA</p>
                            <p className="text-xl font-bold text-neutral-800 dark:text-white">
                                {formatSpeed(result.upload)}
                            </p>
                        </div>
                        <div className={`p-4 ${getPingBg(result.ping)} rounded-xl border text-center`}>
                            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">📶 PING</p>
                            <p className={`text-xl font-bold ${getPingColor(result.ping)}`}>
                                {parseFloat(String(result.ping)) > 0 ? `${parseFloat(String(result.ping)).toFixed(0)} ms` : 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Información del servidor */}
                    <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50">
                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                            <Server className="w-3.5 h-3.5" />
                            <span className="truncate">{result.server || 'Desconocido'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                            <Globe className="w-3.5 h-3.5" />
                            <span className="truncate">{result.location || result.isp || 'Global'}</span>
                        </div>
                    </div>

                    <div className="text-center text-[10px] text-neutral-400 dark:text-neutral-500 border-t border-neutral-200/50 dark:border-neutral-700/50 pt-2">
                        Prueba realizada: {result.timestamp ? new Date(result.timestamp).toLocaleString() : new Date().toLocaleString()}
                    </div>
                </div>
            )}

            {/* Botón de prueba */}
            <button
                onClick={runTest}
                disabled={isTesting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-800 text-white font-medium py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
                {isTesting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Probando...</span>
                    </>
                ) : (
                    <>
                        <Zap className="w-5 h-5" />
                        <span className="font-semibold">{result ? '🔄 Volver a probar' : '🚀 Iniciar Speedtest'}</span>
                    </>
                )}
            </button>

            {/* Mensaje informativo */}
            {!result && !isTesting && !error && (
                <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                    <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Prueba de velocidad con speedtest-cli para resultados precisos
                    </p>
                </div>
            )}
        </div>
    );
}