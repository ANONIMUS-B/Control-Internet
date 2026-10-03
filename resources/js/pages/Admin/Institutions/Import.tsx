import { Head, useForm, Link, router } from '@inertiajs/react';
import {
    Upload,
    X,
    CheckCircle,
    AlertCircle,
    FileSpreadsheet,
    ArrowLeft,
    Download,
    FileText,
} from 'lucide-react';
import { useState } from 'react';
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
    const [successMessage, setSuccessMessage] = useState<string | null>(
        flash?.success || null,
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(
        flash?.error || null,
    );

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
                'text/csv',
            ];

            if (
                !validTypes.includes(file.type) &&
                !file.name.endsWith('.csv') &&
                !file.name.endsWith('.xlsx') &&
                !file.name.endsWith('.xls')
            ) {
                setErrorMessage(
                    'El archivo debe ser Excel (.xlsx, .xls) o CSV (.csv).',
                );

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

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];

        if (file) {
            const fakeEvent = {
                target: { files: [file] },
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            handleFileChange(fakeEvent);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.file) {
            setErrorMessage('Debes seleccionar un archivo para importar.');

            return;
        }

        post('/institutions/importar', {
            onSuccess: (page) => {
                const flashData = page.props.flash as
                    { success?: string; error?: string } | undefined;

                if (flashData?.success) {
                    setSuccessMessage(flashData.success);
                } else {
                    setSuccessMessage(
                        '✅ Importación completada exitosamente.',
                    );
                }

                reset();
                setPreview(null);

                setTimeout(() => setSuccessMessage(null), 5000);

                setTimeout(() => {
                    router.visit('/institutions', {
                        preserveScroll: true,
                    });
                }, 1500);
            },
            onError: (errors) => {
                const errorMsg = errors.file || 'Error al importar el archivo.';
                setErrorMessage(errorMsg);
                setTimeout(() => setErrorMessage(null), 5000);
            },
        });
    };

    const clearFile = () => {
        setData('file', null);
        setPreview(null);
    };

    const downloadTemplate = () => {
        window.location.href = '/institutions/plantilla';
    };

    return (
        <>
            <Head title="Importar Instituciones" />

            <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                <div className="mx-auto w-full max-w-4xl space-y-4">
                    {/* ===== HEADER ===== */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl border border-blue-200 bg-blue-100 p-2 dark:border-blue-500/20 dark:bg-blue-500/20">
                                    <FileSpreadsheet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h1 className="text-[11px] font-bold text-gray-900 dark:text-white">
                                        Importar Instituciones
                                    </h1>
                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                        Importa instituciones desde un archivo
                                        Excel o CSV
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/institutions"
                                className="flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 text-[11px] font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:border-white/20 dark:hover:bg-white/10"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Volver
                            </Link>
                        </div>
                    </div>

                    {/* ===== MENSAJES ===== */}
                    {successMessage && (
                        <div className="flex animate-in items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-[11px] dark:border-emerald-800 dark:bg-emerald-950/30">
                            <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                            <p className="font-medium text-emerald-700 dark:text-emerald-400">
                                {successMessage}
                            </p>
                            <button
                                type="button"
                                onClick={() => setSuccessMessage(null)}
                                className="ml-auto rounded-lg p-1 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-800/50"
                            >
                                <X className="h-3.5 w-3.5 text-emerald-500" />
                            </button>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="flex animate-in items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-[11px] dark:border-rose-800 dark:bg-rose-950/30">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-500" />
                            <p className="font-medium text-rose-700 dark:text-rose-400">
                                {errorMessage}
                            </p>
                            <button
                                type="button"
                                onClick={() => setErrorMessage(null)}
                                className="ml-auto rounded-lg p-1 transition-colors hover:bg-rose-100 dark:hover:bg-rose-800/50"
                            >
                                <X className="h-3.5 w-3.5 text-rose-500" />
                            </button>
                        </div>
                    )}

                    {/* ===== FORMULARIO ===== */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                        <form onSubmit={submit} className="space-y-4">
                            {/* ===== INSTRUCCIONES ===== */}
                            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
                                <h3 className="text-[11px] font-semibold text-blue-800 dark:text-blue-300">
                                    Instrucciones:
                                </h3>
                                <ul className="mt-2 list-inside list-disc space-y-1 text-[11px] text-blue-700 dark:text-blue-400">
                                    <li>
                                        El archivo debe tener los encabezados en
                                        la primera fila
                                    </li>
                                    <li>
                                        <strong>
                                            Todos los campos son opcionales
                                        </strong>{' '}
                                        - Importa solo los datos que tengas
                                        disponibles
                                    </li>
                                    <li>
                                        Si el código modular ya existe, la
                                        institución se actualizará
                                    </li>
                                    <li>
                                        Si el código local ya existe, la
                                        institución se actualizará
                                    </li>
                                    <li>
                                        Formatos soportados:{' '}
                                        <strong>.xlsx</strong>,{' '}
                                        <strong>.xls</strong>,{' '}
                                        <strong>.csv</strong>
                                    </li>
                                    <li>
                                        Tamaño máximo: <strong>10MB</strong>
                                    </li>
                                </ul>
                            </div>

                            {/* ===== ÁREA DE DROP/UPLOAD ===== */}
                            <div
                                className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ${
                                    preview
                                        ? 'border-emerald-300 bg-emerald-50/20 dark:border-emerald-700 dark:bg-emerald-500/5'
                                        : dragActive
                                          ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-500/10'
                                          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/10 dark:border-white/10 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/5'
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
                                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                                    disabled={processing}
                                />

                                <div className="p-6 text-center md:p-8">
                                    {preview ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="rounded-full border border-emerald-200 bg-emerald-100 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/20">
                                                <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-medium text-gray-700 dark:text-neutral-300">
                                                    {preview}
                                                </p>
                                                <p className="mt-1 text-[11px] text-gray-400 dark:text-neutral-500">
                                                    Haz clic o arrastra para
                                                    cambiar el archivo
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={clearFile}
                                                className="absolute -top-2 -right-2 rounded-full bg-rose-500 p-1.5 text-white shadow-lg transition-colors hover:bg-rose-600"
                                                title="Quitar archivo"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3">
                                            <div
                                                className={`rounded-full p-4 transition-colors ${
                                                    dragActive
                                                        ? 'bg-blue-200 dark:bg-blue-800'
                                                        : 'bg-blue-100 dark:bg-blue-500/20'
                                                }`}
                                            >
                                                <Upload
                                                    className={`h-6 w-6 ${
                                                        dragActive
                                                            ? 'text-blue-700 dark:text-blue-300'
                                                            : 'text-blue-600 dark:text-blue-400'
                                                    }`}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-medium text-gray-700 dark:text-neutral-300">
                                                    {dragActive
                                                        ? 'Suelta tu archivo aquí'
                                                        : 'Arrastra o haz clic para subir tu archivo'}
                                                </p>
                                                <p className="mt-1 text-[11px] text-gray-400 dark:text-neutral-500">
                                                    Excel (.xlsx, .xls) o CSV
                                                    (.csv) - max 10MB
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {errors.file && (
                                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-500/20 dark:bg-rose-500/10">
                                    <p className="flex items-center gap-2 text-[11px] text-rose-600 dark:text-rose-400">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.file}
                                    </p>
                                </div>
                            )}

                            {/* ===== BOTONES ===== */}
                            <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-4 dark:border-white/10">
                                <button
                                    type="submit"
                                    disabled={!data.file || processing}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-[11px] font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:from-blue-600 hover:to-indigo-700 hover:shadow-blue-500/40 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {processing ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            Importando...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4" />
                                            Importar Instituciones
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={downloadTemplate}
                                    className="flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-4 py-2.5 text-[11px] font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:border-white/20 dark:hover:bg-white/10"
                                >
                                    <Download className="h-4 w-4" />
                                    Descargar Plantilla
                                </button>

                                <Link
                                    href="/institutions"
                                    className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-[11px] font-medium text-rose-600 transition-all hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                                >
                                    <X className="h-4 w-4" />
                                    Cancelar
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* ===== PASOS ===== */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                            <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                                1
                            </div>
                            <p className="mt-1 text-[11px] text-gray-500 dark:text-neutral-400">
                                Descarga la plantilla
                            </p>
                        </div>
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                            <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                                2
                            </div>
                            <p className="mt-1 text-[11px] text-gray-500 dark:text-neutral-400">
                                Completa los datos en Excel/CSV
                            </p>
                            <p className="mt-0.5 text-[10px] text-gray-400 dark:text-neutral-500">
                                (Todos los campos son opcionales)
                            </p>
                        </div>
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                ✓
                            </div>
                            <p className="mt-1 text-[11px] text-gray-500 dark:text-neutral-400">
                                Sube y importa
                            </p>
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
        { title: 'Instituciones', href: '/institutions' },
        { title: 'Importar', href: '#' },
    ],
};
