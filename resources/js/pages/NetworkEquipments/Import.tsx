import { useState } from "react";
import { Head, useForm, Link, router } from "@inertiajs/react";
import { 
    Upload, 
    X, 
    CheckCircle, 
    AlertCircle, 
    FileSpreadsheet,
    ArrowLeft,
    Download,
    FileText,
    Wifi
} from "lucide-react";
import { dashboard } from '@/routes';

interface ImportProps {
    flash?: {
        success?: string;
        error?: string;
    };
    templateUrl?: string;
}

export default function Import({ flash, templateUrl }: ImportProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null as File | null,
    });

    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(flash?.success || null);
    const [errorMessage, setErrorMessage] = useState<string | null>(flash?.error || null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setErrorMessage('El archivo no debe pesar más de 10MB.');
                return;
            }

            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
                'text/csv'
            ];
            if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
                setErrorMessage('El archivo debe ser Excel (.xlsx, .xls) o CSV (.csv).');
                return;
            }

            setData('file', file);
            setPreview(file.name);
            setErrorMessage(null);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
            handleFileChange(fakeEvent);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!data.file) {
            setErrorMessage('Debes seleccionar un archivo para importar.');
            return;
        }

        post('/equipos-red/importar', {
            onSuccess: (page) => {
                const flashData = page.props.flash as { success?: string; error?: string } | undefined;
                
                if (flashData?.success) {
                    setSuccessMessage(flashData.success);
                } else {
                    setSuccessMessage('✅ Importación completada exitosamente.');
                }
                
                reset();
                setPreview(null);
                
                setTimeout(() => setSuccessMessage(null), 5000);
                
                setTimeout(() => {
                    router.visit('/equipos-red', {
                        preserveScroll: true,
                    });
                }, 1500);
            },
            onError: (errors) => {
                const errorMsg = errors.file || 'Error al importar el archivo.';
                setErrorMessage(errorMsg);
                setTimeout(() => setErrorMessage(null), 5000);
            }
        });
    };

    const clearFile = () => {
        setData('file', null);
        setPreview(null);
    };

    const downloadTemplate = () => {
        window.location.href = '/equipos-red/plantilla';
    };

    return (
        <>
            <Head title="Importar Equipos de Red" />

            <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                <div className="max-w-4xl mx-auto w-full space-y-4">

                    {/* ===== HEADER ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-xl border border-purple-200 dark:border-purple-500/20">
                                    <Wifi className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h1 className="text-[11px] font-bold text-gray-900 dark:text-white">
                                        Importar Equipos de Red
                                    </h1>
                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                        Importa routers, antenas y equipos de conectividad desde Excel o CSV
                                    </p>
                                </div>
                            </div>
                            <Link 
                                href="/equipos-red" 
                                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-neutral-300 rounded-xl text-[11px] font-medium transition-all border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Volver
                            </Link>
                        </div>
                    </div>

                    {/* ===== MENSAJES ===== */}
                    {successMessage && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-[11px] animate-in">
                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <p className="font-medium text-emerald-700 dark:text-emerald-400">{successMessage}</p>
                            <button onClick={() => setSuccessMessage(null)} className="ml-auto hover:bg-emerald-100 dark:hover:bg-emerald-800/50 p-1 rounded-lg transition-colors">
                                <X className="w-3.5 h-3.5 text-emerald-500" />
                            </button>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-[11px] animate-in">
                            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                            <p className="font-medium text-rose-700 dark:text-rose-400">{errorMessage}</p>
                            <button onClick={() => setErrorMessage(null)} className="ml-auto hover:bg-rose-100 dark:hover:bg-rose-800/50 p-1 rounded-lg transition-colors">
                                <X className="w-3.5 h-3.5 text-rose-500" />
                            </button>
                        </div>
                    )}

                    {/* ===== FORMULARIO ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                        <form onSubmit={submit} className="space-y-4">

                            {/* ===== INSTRUCCIONES ===== */}
                            <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-xl border border-purple-200 dark:border-purple-500/20">
                                <h3 className="text-[11px] font-semibold text-purple-800 dark:text-purple-300">Instrucciones:</h3>
                                <ul className="text-[11px] text-purple-700 dark:text-purple-400 mt-2 space-y-1 list-disc list-inside">
                                    <li>El archivo debe tener los encabezados en la primera fila</li>
                                    <li><strong>Campo obligatorio:</strong> <span className="bg-yellow-100 dark:bg-yellow-900/30 px-1.5 py-0.5 rounded text-yellow-800 dark:text-yellow-300 font-medium">codigo_local</span> (código local de la institución)</li>
                                    <li>El sistema buscará automáticamente el <strong>nombre</strong> y <strong>nivel</strong> de la IE</li>
                                    <li>Si el código local no existe en el sistema, el equipo <strong>NO se importará</strong></li>
                                    <li>Campos opcionales: descripcion, marca, modelo, mac, estado</li>
                                    <li>Si la MAC coincide, el equipo se actualizará</li>
                                    <li>Formatos soportados: <strong>.xlsx</strong>, <strong>.xls</strong>, <strong>.csv</strong></li>
                                    <li>Tamaño máximo: <strong>10MB</strong></li>
                                </ul>
                            </div>

                            {/* ===== ÁREA DE DROP/UPLOAD ===== */}
                            <div 
                                className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ${
                                    preview 
                                        ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/20 dark:bg-emerald-500/5' 
                                        : dragActive
                                            ? 'border-purple-500 bg-purple-50/30 dark:bg-purple-500/10'
                                            : 'border-gray-300 dark:border-white/10 hover:border-purple-400 dark:hover:border-purple-500/40 hover:bg-purple-50/10 dark:hover:bg-purple-500/5'
                                }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    disabled={processing}
                                />
                                
                                <div className="p-6 md:p-8 text-center">
                                    {preview ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-emerald-100 dark:bg-emerald-500/20 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                                                <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-medium text-gray-700 dark:text-neutral-300">{preview}</p>
                                                <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1">Haz clic o arrastra para cambiar el archivo</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={clearFile}
                                                className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full hover:bg-rose-600 transition-colors shadow-lg"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className={`p-4 rounded-full transition-colors ${
                                                dragActive ? 'bg-purple-200 dark:bg-purple-800' : 'bg-purple-100 dark:bg-purple-500/20'
                                            }`}>
                                                <Upload className={`w-6 h-6 ${
                                                    dragActive ? 'text-purple-700 dark:text-purple-300' : 'text-purple-600 dark:text-purple-400'
                                                }`} />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-medium text-gray-700 dark:text-neutral-300">
                                                    {dragActive ? 'Suelta tu archivo aquí' : 'Arrastra o haz clic para subir tu archivo'}
                                                </p>
                                                <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1">
                                                    Excel (.xlsx, .xls) o CSV (.csv) - max 10MB
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {errors.file && (
                                <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-200 dark:border-rose-500/20">
                                    <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.file}
                                    </p>
                                </div>
                            )}

                            {/* ===== BOTONES ===== */}
                            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                                <button
                                    type="submit"
                                    disabled={!data.file || processing}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {processing ? (
                                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Importando...</>
                                    ) : (
                                        <><Upload className="w-4 h-4" /> Importar Equipos</>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={downloadTemplate}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-neutral-300 rounded-xl text-[11px] font-medium transition-all border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                                >
                                    <Download className="w-4 h-4" />
                                    Descargar Plantilla
                                </button>

                                <Link
                                    href="/equipos-red"
                                    className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-[11px] font-medium transition-all border border-rose-200 dark:border-rose-500/20"
                                >
                                    <X className="w-4 h-4" />
                                    Cancelar
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* ===== PASOS ===== */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 text-center shadow-sm dark:shadow-2xl">
                            <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400">1</div>
                            <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1">Descarga la plantilla</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 text-center shadow-sm dark:shadow-2xl">
                            <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400">2</div>
                            <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1">Completa los datos en Excel/CSV</p>
                            <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-0.5">(Solo <span className="font-medium text-yellow-600 dark:text-yellow-400">codigo_local</span> es obligatorio)</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 text-center shadow-sm dark:shadow-2xl">
                            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">✓</div>
                            <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1">Sube y importa</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Import.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Equipos de Red', href: '/equipos-red' },
        { title: 'Importar', href: '#' }
    ],
};