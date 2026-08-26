import { useState } from 'react';
import { 
    Wifi, 
    Activity, 
    Server, 
    Globe, 
    Loader2, 
    XCircle, 
    X, 
    Zap, 
    Clock, 
    Award,
    TrendingUp,
    CheckCircle,
    MapPin,
    Signal,
    Gauge
} from 'lucide-react';

interface TestResult {
    download: number;
    upload: number;
    ping: number;
    jitter: number;
    isp: string;
    server: string;
    server_location: string;
    server_host: string;
    timestamp: string;
    resultId: string;
    download_units: string;
    upload_units: string;
    ping_units: string;
    technology?: string;
    provisioned_download?: number;
    provisioned_upload?: number;
    is_throttled?: boolean;
}

interface SpeedtestRealProps {
    onResult?: (result: TestResult) => void;
    onClose?: () => void;
}

export default function SpeedtestReal({ onResult, onClose }: SpeedtestRealProps) {
    const [isTesting, setIsTesting] = useState(false);
    const [result, setResult] = useState<TestResult | null>(null);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<string>('');

    const runTest = async () => {
        setIsTesting(true);
        setProgress(0);
        setResult(null);
        setError(null);
        setStep('🔍 Conectando al servidor...');

        try {
            // ✅ Obtener la IP del usuario
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            const userIp = ipData.ip;

            // ✅ Obtener el puerto (simulado)
            const port = Math.floor(Math.random() * (65535 - 1024) + 1024);

            // ✅ Llamar a la API de Ookla
            const response = await fetch('/speedtest-ookla', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    ipv4: userIp,
                    port: port,
                }),
            });

            if (!response.ok) {
                throw new Error('Error al realizar la prueba');
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Error en la prueba');
            }

            // ✅ Simular progreso para mejor experiencia visual
            setProgress(100);
            setStep('✅ Prueba completada');

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

    const getQualityBg = (download: number) => {
        if (download >= 50) return 'bg-emerald-100 dark:bg-emerald-950/50';
        if (download >= 20) return 'bg-blue-100 dark:bg-blue-950/50';
        if (download >= 5) return 'bg-amber-100 dark:bg-amber-950/50';
        return 'bg-rose-100 dark:bg-rose-950/50';
    };

    const getQualityLabel = (download: number) => {
        if (download >= 50) return 'Excelente';
        if (download >= 20) return 'Buena';
        if (download >= 5) return 'Regular';
        return 'Mala';
    };

    const getPingColor = (ping: number) => {
        if (ping < 30) return 'text-emerald-600 dark:text-emerald-400';
        if (ping < 60) return 'text-blue-600 dark:text-blue-400';
        if (ping < 100) return 'text-amber-600 dark:text-amber-400';
        return 'text-rose-600 dark:text-rose-400';
    };

    const getPingBg = (ping: number) => {
        if (ping < 30) return 'bg-emerald-100 dark:bg-emerald-950/50';
        if (ping < 60) return 'bg-blue-100 dark:bg-blue-950/50';
        if (ping < 100) return 'bg-amber-100 dark:bg-amber-950/50';
        return 'bg-rose-100 dark:bg-rose-950/50';
    };

    const getPingLabel = (ping: number) => {
        if (ping < 30) return 'Excelente';
        if (ping < 60) return 'Buena';
        if (ping < 100) return 'Regular';
        return 'Mala';
    };

    // ✅ Función para obtener el icono de tecnología
    const getTechnologyIcon = (tech: string) => {
        if (!tech) return <Signal className="w-3.5 h-3.5" />;
        if (tech.includes('docsis')) return <Signal className="w-3.5 h-3.5" />;
        if (tech.includes('fttp') || tech.includes('fiber')) return <Signal className="w-3.5 h-3.5" />;
        if (tech.includes('5g')) return <Signal className="w-3.5 h-3.5" />;
        return <Signal className="w-3.5 h-3.5" />;
    };

    // ✅ Función para obtener la etiqueta de tecnología
    const getTechnologyLabel = (tech: string) => {
        if (!tech) return 'No disponible';
        const labels: Record<string, string> = {
            'docsis-2.0': 'DOCSIS 2.0',
            'docsis-3.0': 'DOCSIS 3.0',
            'docsis-3.1': 'DOCSIS 3.1',
            'docsis-4.0': 'DOCSIS 4.0',
            'docsis': 'DOCSIS',
            'fttp': 'FTTP (Fibra)',
            'adsl': 'ADSL',
            'vdsl': 'VDSL',
            'sdsl': 'SDSL',
            'dsl': 'DSL',
            'copper': 'Cobre',
            'leo-satellite': 'Satélite LEO',
            'satellite': 'Satélite',
            'fixed-cellular-5g': '5G Fijo',
            'fixed-cellular-4g': '4G Fijo',
            'fixed-cellular-3g': '3G Fijo',
            'fixed-cellular': 'Cellular Fijo',
            'mobile-cellular': 'Cellular Móvil',
        };
        return labels[tech] || tech;
    };

    return (
        <div className="bg-white dark:bg-neutral-900/80 rounded-2xl shadow-2xl border border-sidebar-border/70 dark:border-sidebar-border p-6 w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/25">
                        <Wifi className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-neutral-800 dark:text-white flex items-center gap-2">
                            Speedtest
                            <span className="text-[10px] font-medium bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                Ookla
                            </span>
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Prueba de velocidad real</p>
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

            {/* Error */}
            {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800 mb-4">
                    <div className="flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                        <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
                    </div>
                </div>
            )}

            {/* Resultados */}
            {result && result.download > 0 && (
                <div className="space-y-4 mb-4">
                    {/* ID del resultado */}
                    {result.resultId && (
                        <div className="text-center text-[10px] text-neutral-400 dark:text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 py-1 rounded-lg">
                            ID: {result.resultId}
                        </div>
                    )}

                    {/* Velocidad de descarga - Principal */}
                    <div className={`p-5 ${getQualityBg(result.download)} rounded-xl border border-blue-200/50 dark:border-blue-800/50 text-center relative overflow-hidden`}>
                        <div className="absolute top-2 right-2">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
                                result.download >= 20 
                                    ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400' 
                                    : result.download >= 5
                                        ? 'bg-amber-200 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400'
                                        : 'bg-rose-200 text-rose-800 dark:bg-rose-950/50 dark:text-rose-400'
                            }`}>
                                {getQualityLabel(result.download)}
                            </span>
                        </div>
                        <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">📥 DESCARGA</p>
                        <p className={`text-4xl font-bold ${getQualityColor(result.download)}`}>
                            {formatSpeed(result.download)}
                        </p>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Mbps</p>
                    </div>

                    {/* Subida y ping */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className={`p-4 ${getQualityBg(result.upload)} rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 text-center`}>
                            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">📤 SUBIDA</p>
                            <p className="text-xl font-bold text-neutral-800 dark:text-white">
                                {formatSpeed(result.upload)}
                            </p>
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Mbps</p>
                        </div>
                        <div className={`p-4 ${getPingBg(result.ping)} rounded-xl border border-purple-200/50 dark:border-purple-800/50 text-center`}>
                            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">📶 PING</p>
                            <p className={`text-xl font-bold ${getPingColor(result.ping)}`}>
                                {result.ping.toFixed(0)} ms
                            </p>
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                {getPingLabel(result.ping)}
                            </p>
                        </div>
                    </div>

                    {/* Información del servidor */}
                    <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50">
                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                            <Server className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{result.server || 'Desconocido'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                            <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{result.server_location || result.isp || 'Global'}</span>
                        </div>
                        {result.technology && (
                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 col-span-2">
                                {getTechnologyIcon(result.technology)}
                                <span>Tecnología: {getTechnologyLabel(result.technology)}</span>
                            </div>
                        )}
                        {result.is_throttled !== undefined && (
                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 col-span-2">
                                <Gauge className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>Throttling: {result.is_throttled ? '⚠️ Activo' : '✅ No detectado'}</span>
                            </div>
                        )}
                    </div>

                    {/* Velocidad contratada (si está disponible) */}
                    {result.provisioned_download && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200/50 dark:border-blue-800/50 text-center">
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                Velocidad contratada: {result.provisioned_download} Mbps descarga / {result.provisioned_upload || 'N/A'} Mbps subida
                            </p>
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
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-800 text-white font-medium py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
                {isTesting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{step || 'Probando...'} {progress}%</span>
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
                            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-neutral-500 dark:text-neutral-400">
                        <span>{step || 'Probando...'}</span>
                        <span>{progress}%</span>
                    </div>
                </div>
            )}

            {/* Mensaje informativo */}
            {!result && !isTesting && !error && (
                <div className="mt-4 p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                    <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Prueba de velocidad con tecnología Ookla para resultados precisos
                    </p>
                </div>
            )}
        </div>
    );
}