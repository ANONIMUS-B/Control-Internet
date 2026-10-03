import { Head, useForm, router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import {
    Upload,
    X,
    CheckCircle,
    AlertCircle,
    Trash2,
    User,
    FileSignature,
    Calendar,
    Info,
    Eye,
    ArrowLeft,
    RefreshCw,
    Image as ImageIcon,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState, useRef, useEffect } from 'react';

interface SignatureProps {
    user: {
        id: number;
        name: string;
        email: string;
        signature_path: string | null;
        signature_active: boolean;
        signature_url: string | null;
        signature_base64?: string | null;
        signature_updated_at: string | null;
        has_signature: boolean;
        signature_status: string;
        signature_status_color: string;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Signature({ user, flash }: SignatureProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        signature: null as File | null,
    });

    // Fuente de la firma actualmente guardada en el servidor (prioriza base64 para evitar problemas de ruta/puerto)
    const activeSignatureSrc = user.signature_base64 || user.signature_url;

    // Estado para la vista previa del NUEVO archivo que el usuario selecciona
    const [selectedFilePreview, setSelectedFilePreview] = useState<
        string | null
    >(null);
    const [isChanging, setIsChanging] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(
        flash?.error || null,
    );
    const [successMessage, setSuccessMessage] = useState<string | null>(
        flash?.success || null,
    );
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 5000);

            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => setErrorMessage(null), 5000);

            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setErrorMessage('La imagen no debe pesar más de 2MB.');

                return;
            }

            if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
                setErrorMessage('La imagen debe ser PNG, JPG o JPEG.');

                return;
            }

            setData('signature', file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedFilePreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
            setErrorMessage(null);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];

        if (file) {
            const fakeEvent = {
                target: { files: [file] },
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            handleFileChange(fakeEvent);
        }
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        if (!data.signature) {
            setErrorMessage('Debes seleccionar una imagen para tu firma.');

            return;
        }

        post('/firma/upload', {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMessage(
                    '✅ Firma digital subida y guardada correctamente.',
                );
                setData('signature', null);
                setSelectedFilePreview(null);
                setIsChanging(false);

                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
            onError: (errs) => {
                const errorMsg = errs.signature || 'Error al subir la firma.';
                setErrorMessage(errorMsg);
            },
        });
    };

    const deleteSignature = () => {
        if (!confirm('¿Estás seguro de eliminar tu firma digital?')) {
            return;
        }

        router.delete('/firma/eliminar', {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedFilePreview(null);
                setIsChanging(false);
                setSuccessMessage('✅ Firma eliminada correctamente.');
            },
            onError: () => {
                setErrorMessage('❌ Error al eliminar la firma.');
            },
        });
    };

    const clearSelectedFile = () => {
        setData('signature', null);
        setSelectedFilePreview(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            Activa: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25',
            Vencida:
                'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25',
            'Sin firma':
                'bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/10',
        };

        return colors[status] || colors['Sin firma'];
    };

    const getStatusDotColor = (status: string) => {
        const colors: Record<string, string> = {
            Activa: 'bg-emerald-500',
            Vencida: 'bg-amber-500',
            'Sin firma': 'bg-neutral-400 dark:bg-neutral-600',
        };

        return colors[status] || colors['Sin firma'];
    };

    const hasSavedSignature = Boolean(user.has_signature && activeSignatureSrc);

    return (
        <>
            <Head title="Mi Firma Digital" />

            <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                <div className="mx-auto w-full max-w-6xl space-y-4">
                    {/* ===== HEADER ===== */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl border border-blue-200 bg-blue-100 p-2 dark:border-blue-500/20 dark:bg-blue-500/20">
                                    <FileSignature className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h1 className="text-[11px] font-bold text-gray-900 dark:text-white">
                                        Mi Firma Digital
                                    </h1>
                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                        Gestiona y visualiza la imagen de tu
                                        firma digital para los informes de
                                        conformidad en PDF
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/dashboard"
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
                                className="ml-auto rounded p-1 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-800/50"
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
                                className="ml-auto rounded p-1 transition-colors hover:bg-rose-100 dark:hover:bg-rose-800/50"
                            >
                                <X className="h-3.5 w-3.5 text-rose-500" />
                            </button>
                        </div>
                    )}

                    {/* ===== CONTENIDO PRINCIPAL ===== */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                        {/* ===== COLUMNA IZQUIERDA - INFORMACIÓN ===== */}
                        <div className="space-y-4 lg:col-span-2">
                            {/* Datos del Usuario */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl border border-blue-200 bg-blue-100 p-2 dark:border-blue-500/20 dark:bg-blue-500/20">
                                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[11px] font-medium text-gray-900 dark:text-white">
                                            {user.name}
                                        </p>
                                        <p className="truncate text-[11px] text-gray-500 dark:text-neutral-400">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Estado de la Firma */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                                <p className="mb-2 text-[11px] font-medium text-gray-600 dark:text-neutral-400">
                                    Estado de la firma:
                                </p>
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`h-2.5 w-2.5 rounded-full ${getStatusDotColor(user.signature_status)}`}
                                    />
                                    <span
                                        className={`rounded-full border px-3 py-1 text-[11px] font-medium ${getStatusColor(user.signature_status)}`}
                                    >
                                        {user.signature_status}
                                    </span>
                                </div>
                                {user.signature_updated_at && (
                                    <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500 dark:text-neutral-400">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>
                                            Actualizada:{' '}
                                            {user.signature_updated_at}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Estado de Firma Activa con Miniatura */}
                            {hasSavedSignature && (
                                <div className="space-y-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
                                    <div className="flex items-center gap-3">
                                        <Eye className="h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                                        <div>
                                            <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                                                Firma guardada y activa
                                            </p>
                                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                                Se estampará automáticamente en
                                                tus reportes PDF
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center rounded-xl border border-emerald-200 bg-white p-2.5 dark:border-emerald-800/60 dark:bg-slate-900">
                                        <img
                                            src={activeSignatureSrc!}
                                            alt="Miniatura Firma"
                                            className="max-h-16 max-w-full object-contain"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Recomendaciones */}
                            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                                <div className="flex items-start gap-3">
                                    <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <h4 className="text-[11px] font-semibold text-blue-800 dark:text-blue-300">
                                            Recomendaciones:
                                        </h4>
                                        <ul className="mt-2 list-inside list-disc space-y-1.5 text-[11px] text-blue-700 dark:text-blue-400">
                                            <li>
                                                Usa fondo blanco o transparente
                                                para la firma
                                            </li>
                                            <li>
                                                La imagen debe ser PNG, JPG o
                                                JPEG
                                            </li>
                                            <li>Tamaño máximo: 2MB</li>
                                            <li>
                                                Resolución recomendada:
                                                300x100px
                                            </li>
                                            <li>
                                                La firma es válida por 1 año
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ===== COLUMNA DERECHA - VISUALIZACIÓN Y SUBIDA ===== */}
                        <div className="space-y-4 lg:col-span-3">
                            {/* 1. SECCIÓN: FIRMA ACTUAL REGISTRADA (SI YA TIENE UNA) */}
                            {hasSavedSignature && (
                                <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                                    <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-white/10">
                                        <div className="flex items-center gap-2.5">
                                            <div className="rounded-lg bg-emerald-100 p-1.5 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                                <CheckCircle className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-[12px] font-bold text-gray-900 dark:text-white">
                                                    Tu Firma Digital Registrada
                                                </h3>
                                                <p className="text-[10px] text-gray-500 dark:text-neutral-400">
                                                    Esta es la imagen exacta de
                                                    la firma que actualmente
                                                    tienes guardada en el
                                                    sistema
                                                </p>
                                            </div>
                                        </div>
                                        <span className="flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-500/20 dark:text-emerald-400">
                                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                            Firma Visible
                                        </span>
                                    </div>

                                    {/* Visualizador grande de la imagen */}
                                    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700/60 dark:bg-slate-900/80">
                                        <div className="flex max-w-full items-center justify-center rounded-xl border border-gray-200 bg-white p-4 shadow-xs dark:bg-white">
                                            <img
                                                src={activeSignatureSrc!}
                                                alt="Firma Digital Guardada"
                                                className="max-h-36 max-w-full object-contain"
                                            />
                                        </div>
                                        <p className="mt-3 flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-neutral-400">
                                            <Eye className="h-3.5 w-3.5 text-blue-500" />
                                            Esta imagen se incluye en el pie de
                                            página de tus informes de
                                            conformidad PDF
                                        </p>
                                    </div>

                                    {/* Botones de acción para la firma guardada */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2 dark:border-white/5">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsChanging(!isChanging)
                                            }
                                            className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-[11px] font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                                        >
                                            <RefreshCw className="h-3.5 w-3.5" />
                                            {isChanging
                                                ? 'Cerrar formulario de cambio'
                                                : 'Cambiar / Subir nueva imagen'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={deleteSignature}
                                            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-[11px] font-medium text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Eliminar Firma
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 2. SECCIÓN: FORMULARIO DE SUBIDA (VISIBLE SI NO TIENE FIRMA O SI HACE CLIC EN CAMBIAR) */}
                            {(!hasSavedSignature || isChanging) && (
                                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                                    <div className="mb-4 border-b border-gray-200 pb-3 dark:border-white/10">
                                        <h3 className="flex items-center gap-2 text-[12px] font-bold text-gray-900 dark:text-white">
                                            <Upload className="h-4 w-4 text-blue-500" />
                                            {hasSavedSignature
                                                ? 'Subir una nueva imagen para reemplazar la firma'
                                                : 'Subir Imagen de tu Firma Digital'}
                                        </h3>
                                        <p className="mt-0.5 text-[10px] text-gray-500 dark:text-neutral-400">
                                            Selecciona o arrastra una imagen
                                            clara de tu firma
                                        </p>
                                    </div>

                                    <form
                                        onSubmit={submit}
                                        className="space-y-4"
                                    >
                                        {/* Área de Drop/Upload */}
                                        <div
                                            className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ${
                                                selectedFilePreview
                                                    ? 'border-emerald-300 bg-emerald-50/20 dark:border-emerald-700 dark:bg-emerald-500/5'
                                                    : isDragging
                                                      ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-500/10'
                                                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/10 dark:border-white/10 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/5'
                                            }`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                accept="image/png,image/jpeg,image/jpg"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                                                disabled={processing}
                                            />

                                            <div className="p-6 text-center md:p-8">
                                                {selectedFilePreview ? (
                                                    <div className="relative">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                                                                <img
                                                                    src={
                                                                        selectedFilePreview
                                                                    }
                                                                    alt="Nueva firma seleccionada"
                                                                    className="max-h-32 object-contain"
                                                                />
                                                            </div>
                                                            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                                ✓ Imagen
                                                                seleccionada
                                                                lista para subir
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={
                                                                clearSelectedFile
                                                            }
                                                            className="absolute -top-2 -right-2 z-20 rounded-full bg-rose-500 p-1.5 text-white shadow-lg transition-colors hover:bg-rose-600"
                                                            title="Quitar imagen seleccionada"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                        <p className="mt-1 text-[10px] text-gray-400 dark:text-neutral-500">
                                                            Haz clic o arrastra
                                                            para seleccionar
                                                            otra imagen
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div
                                                            className={`rounded-full p-4 transition-colors ${
                                                                isDragging
                                                                    ? 'bg-blue-200 dark:bg-blue-800'
                                                                    : 'bg-blue-100 dark:bg-blue-500/20'
                                                            }`}
                                                        >
                                                            <Upload
                                                                className={`h-6 w-6 ${
                                                                    isDragging
                                                                        ? 'text-blue-700 dark:text-blue-300'
                                                                        : 'text-blue-600 dark:text-blue-400'
                                                                }`}
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-medium text-gray-700 dark:text-neutral-300">
                                                                {isDragging
                                                                    ? 'Suelta tu imagen aquí'
                                                                    : 'Arrastra o haz clic para seleccionar tu firma'}
                                                            </p>
                                                            <p className="mt-1 text-[11px] text-gray-400 dark:text-neutral-500">
                                                                PNG, JPG o JPEG
                                                                (máx. 2MB)
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Botones de Acción */}
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                type="submit"
                                                disabled={
                                                    !data.signature ||
                                                    processing
                                                }
                                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-[11px] font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:from-blue-600 hover:to-indigo-700 hover:shadow-blue-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                                            >
                                                {processing ? (
                                                    <>
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                        Guardando firma...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="h-4 w-4" />
                                                        {hasSavedSignature
                                                            ? 'Guardar Nueva Firma'
                                                            : 'Subir y Guardar Firma'}
                                                    </>
                                                )}
                                            </button>

                                            {hasSavedSignature &&
                                                isChanging && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            clearSelectedFile();
                                                            setIsChanging(
                                                                false,
                                                            );
                                                        }}
                                                        className="rounded-xl border border-gray-300 bg-gray-100 px-4 py-2.5 text-[11px] font-medium text-gray-700 transition-all hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10"
                                                    >
                                                        Cancelar
                                                    </button>
                                                )}
                                        </div>

                                        {/* Feedback visual si seleccionó un archivo nuevo */}
                                        {selectedFilePreview && (
                                            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[11px] text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                                                <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                                                <span>
                                                    Haz clic en{' '}
                                                    <strong>
                                                        "
                                                        {hasSavedSignature
                                                            ? 'Guardar Nueva Firma'
                                                            : 'Subir y Guardar Firma'}
                                                        "
                                                    </strong>{' '}
                                                    para confirmar y registrar
                                                    la imagen.
                                                </span>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Signature.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Mi Firma Digital',
            href: '/firma',
        },
    ],
};
