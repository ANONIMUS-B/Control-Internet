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
    Users
} from "lucide-react";
import { dashboard } from '@/routes';

interface ImportProps {
    flash?: {
        success?: string;
        error?: string;
    };
    templateUrl?: string;
    institutions: Array<{ id: number; name: string; modular_code: string }>;
    roles: Record<string, string>;
}

export default function Import({ flash, templateUrl, institutions, roles }: ImportProps) {
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

        post('/admin/usuarios/importar', {
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
                    router.visit('/admin/usuarios', {
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
        window.location.href = '/admin/usuarios/plantilla';
    };

    return (
        <>
            <Head title="Importar Usuarios" />

            <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                <div className="max-w-4xl mx-auto w-full space-y-4">

                    {/* ===== HEADER ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-xl border border-purple-200 dark:border-purple-500/20">
                                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h1 className="text-[11px] font-bold text-gray-900 dark:text-white">
                                        Importar Usuarios
                                    </h1>
                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                        Importa usuarios desde un archivo Excel o CSV
                                    </p>
                                </div>
                            </div>
                            <Link 
                                href="/admin/usuarios" 
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
                            <button 
                                type="button"
                                onClick={() => setSuccessMessage(null)} 
                                className="ml-auto hover:bg-emerald-100 dark:hover:bg-emerald-800/50 p-1 rounded-lg transition-colors"
                            >
                                <X className="w-3.5 h-3.5 text-emerald-500" />
                            </button>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-[11px] animate-in">
                            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                            <p className="font-medium text-rose-700 dark:text-rose-400">{errorMessage}</p>
                            <button 
                                type="button"
                                onClick={() => setErrorMessage(null)} 
                                className="ml-auto hover:bg-rose-100 dark:hover:bg-rose-800/50 p-1 rounded-lg transition-colors"
                            >
                                <X className="w-3.5 h-3.5 text-rose-500" />
                            </button>
                        </div>
                    )}

                    {/* ===== FORMULARIO ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                        <form onSubmit={submit} className="space-y-4">

                            {/* ===== INFORMACIÓN IMPORTANTE ===== */}
                            <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-xl border border-purple-200 dark:border-purple-500/20">
                                <h3 className="text-[11px] font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Información importante:
                                </h3>
                                <ul className="text-[11px] text-purple-700 dark:text-purple-400 mt-2 space-y-1 list-disc list-inside">
                                    <li>La contraseña se genera automáticamente: <strong>Ugel + DNI + *</strong></li>
                                    <li>Ejemplo: DNI 12345678 → Contraseña: <strong>Ugel12345678*</strong></li>
                                    <li>Campos obligatorios: <strong>DNI, Apellido Paterno, Nombres, Email, Rol</strong></li>
                                    <li>Campos opcionales: <strong>Apellido Materno</strong></li>
                                    <li>Roles válidos: <strong>admin, specialist, supervisor, director, executive</strong></li>
                                    <li>También puedes usar roles en español: <strong>administrador, especialista, supervisor, director, ejecutivo</strong></li>
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
                                                <p className="text-[11px] font-medium text-gray-700 dark:text-neutral-300">
                                                    {preview}
                                                </p>
                                                <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1">
                                                    Haz clic o arrastra para cambiar el archivo
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={clearFile}
                                                className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full hover:bg-rose-600 transition-colors shadow-lg"
                                                title="Quitar archivo"
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
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Importando...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            Importar Usuarios
                                        </>
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
                                    href="/admin/usuarios"
                                    className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-[11px] font-medium transition-all border border-rose-200 dark:border-rose-500/20"
                                >
                                    <X className="w-4 h-4" />
                                    Cancelar
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* ===== EJEMPLO DE FORMATO ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm dark:shadow-2xl">
                        <h3 className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-2">📋 Formato del archivo:</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[11px]">
                                <thead>
                                    <tr className="bg-purple-50 dark:bg-purple-500/10">
                                        <th className="p-2 text-left font-medium text-purple-700 dark:text-purple-300">DNI</th>
                                        <th className="p-2 text-left font-medium text-purple-700 dark:text-purple-300">Apellido Paterno</th>
                                        <th className="p-2 text-left font-medium text-purple-700 dark:text-purple-300">Apellido Materno</th>
                                        <th className="p-2 text-left font-medium text-purple-700 dark:text-purple-300">Nombres</th>
                                        <th className="p-2 text-left font-medium text-purple-700 dark:text-purple-300">Email</th>
                                        <th className="p-2 text-left font-medium text-purple-700 dark:text-purple-300">Rol</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t border-purple-100 dark:border-purple-500/20">
                                        <td className="p-2 font-mono">12345678</td>
                                        <td className="p-2">Pérez</td>
                                        <td className="p-2">García</td>
                                        <td className="p-2">Juan Carlos</td>
                                        <td className="p-2">juan@ugelambo.gob.pe</td>
                                        <td className="p-2">
                                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-[11px] border border-emerald-200 dark:border-emerald-500/20">
                                                director
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="border-t border-purple-100 dark:border-purple-500/20">
                                        <td className="p-2 font-mono">87654321</td>
                                        <td className="p-2">Rodríguez</td>
                                        <td className="p-2"></td>
                                        <td className="p-2">María</td>
                                        <td className="p-2">maria@ugelambo.gob.pe</td>
                                        <td className="p-2">
                                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full text-[11px] border border-blue-200 dark:border-blue-500/20">
                                                especialista
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-2">
                            * La contraseña se genera automáticamente: <strong className="text-gray-600 dark:text-neutral-300">Ugel + DNI + *</strong>
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1">
                            * Roles válidos: <strong className="text-gray-600 dark:text-neutral-300">admin, specialist, supervisor, director, executive</strong>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

Import.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Gestión de Usuarios', href: '/admin/usuarios' },
        { title: 'Importar', href: '#' }
    ],
};