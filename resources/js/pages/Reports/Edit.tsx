import { Head, useForm, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { dashboard } from '@/routes';
import { 
    ArrowLeft, 
    Save, 
    AlertCircle, 
    Trash2, 
    Upload, 
    X,
    CheckCircle,
    Loader2,
    FileText,
    Calendar,
    Building2,
    Shield,
    Image as ImageIcon,
    Pencil,
    History
} from 'lucide-react';
import ReportHistory from '@/components/ReportHistory';

interface Evidence {
    id: number;
    file_path: string;
}

interface HistoryItem {
    id: number;
    action: string;
    action_label: string;
    action_color: string;
    changes: Record<string, { old: any; new: any }> | null;
    comment: string | null;
    user: {
        name: string;
    };
    created_at: string;
}

interface EditReportProps {
    report: {
        id: number;
        service_state: 'operative' | 'intermittent' | 'no_service';
        office_number: string;
        notes: string | null;
        admin_comments: string | null;
        evidences: Evidence[];
        status: string;
        history?: HistoryItem[];
        institution?: {
            name: string;
            modular_code: string;
        };
        month?: number;
        year?: number;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Edit({ report, flash }: EditReportProps) {
    // ✅ Asegurar que office_number nunca sea null
    const { data, setData, post, processing } = useForm({
        _method: 'PUT',
        service_state: 'operative',
        office_number: report.office_number || '', // ✅ Valor por defecto vacío
        notes: report.notes || '',
        evidences: [] as File[],
    });

    const [previews, setPreviews] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(flash?.error || null);
    const [successMessage, setSuccessMessage] = useState<string | null>(flash?.success || null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setData('evidences', [...data.evidences, ...filesArray]);
            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            setPreviews([...previews, ...newPreviews]);
        }
    };

    const deleteEvidence = (evidenceId: number) => {
        if (!confirm('¿Eliminar esta evidencia?')) return;

        router.delete(`/evidencias/${evidenceId}`, {
            onSuccess: (page) => {
                const flashData = page.props.flash as { success?: string; error?: string } | undefined;
                if (flashData?.success) {
                    setSuccessMessage(flashData.success);
                    setTimeout(() => setSuccessMessage(null), 5000);
                }
                router.reload();
            },
            onError: (errors) => {
                const errorMessages = Object.values(errors).join(', ');
                setErrorMessage(errorMessages);
                setTimeout(() => setErrorMessage(null), 5000);
            }
        });
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        if (data.evidences.length === 0) {
            post(`/reportes/${report.id}`, {
                onSuccess: (page) => {
                    const flashData = page.props.flash as { success?: string; error?: string } | undefined;
                    if (flashData?.success) setSuccessMessage(flashData.success);
                    else setSuccessMessage('✅ Reporte actualizado');
                    setTimeout(() => setSuccessMessage(null), 5000);
                },
                onError: (errors) => {
                    const errorMessages = Object.values(errors).join(', ');
                    setErrorMessage(errorMessages);
                    setTimeout(() => setErrorMessage(null), 5000);
                }
            });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 10;
            });
        }, 300);

        post(`/reportes/${report.id}`, {
            onSuccess: (page) => {
                clearInterval(interval);
                setUploadProgress(100);
                setTimeout(() => {
                    setIsUploading(false);
                    setUploadProgress(0);
                    const flashData = page.props.flash as { success?: string; error?: string } | undefined;
                    if (flashData?.success) setSuccessMessage(flashData.success);
                    else setSuccessMessage('✅ Reporte actualizado');
                    setTimeout(() => setSuccessMessage(null), 5000);
                }, 500);
            },
            onError: (errors) => {
                clearInterval(interval);
                setIsUploading(false);
                setUploadProgress(0);
                const errorMessages = Object.values(errors).join(', ');
                setErrorMessage(errorMessages);
                setTimeout(() => setErrorMessage(null), 5000);
            }
        });
    };

    const canEdit = report.status === 'pending' || report.status === 'observed';

    const statusColors: Record<string, string> = {
        pending: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/25',
        observed: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25',
        approved: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25',
        rejected: 'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/25',
    };

    const statusLabels: Record<string, string> = {
        pending: 'Pendiente',
        observed: 'Observado',
        approved: 'Aprobado',
        rejected: 'Rechazado',
    };

    if (!canEdit) {
        return (
            <>
                <Head title="Corregir Reporte" />
                <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                    <div className="max-w-4xl mx-auto w-full">
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-8 text-center shadow-sm dark:shadow-2xl">
                            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                            <h2 className="text-[11px] font-bold text-gray-900 dark:text-white">No se puede editar</h2>
                            <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-2">
                                Este reporte ya está {statusLabels[report.status]?.toLowerCase()} y no puede ser modificado.
                            </p>
                            <Link href="/reportes" className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95">
                                <ArrowLeft className="w-4 h-4" /> Volver
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Corregir Reporte" />

            <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                <div className="max-w-4xl mx-auto w-full space-y-4">
                    
                    {/* ===== HEADER ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl border border-blue-200 dark:border-blue-500/20">
                                    <Pencil className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-[11px] font-bold text-gray-900 dark:text-white">Corregir Reporte</h2>
                                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 dark:text-neutral-400">
                                        <span className="flex items-center gap-1">
                                            <Building2 className="w-3.5 h-3.5" />
                                            {report.institution?.name || 'Sin IE'}
                                        </span>
                                        <span className="w-1 h-1 bg-gray-300 dark:bg-neutral-600 rounded-full"></span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {report.month ? months[report.month - 1] : ''} {report.year}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusColors[report.status]}`}>
                                            {statusLabels[report.status] || report.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Link href="/reportes" className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-neutral-300 rounded-xl text-[11px] font-medium transition-all border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20">
                                <ArrowLeft className="w-3.5 h-3.5" /> Volver
                            </Link>
                        </div>
                    </div>

                    {/* ===== MENSAJES ===== */}
                    {successMessage && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-[11px] animate-in">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            <p className="text-emerald-700 dark:text-emerald-400">{successMessage}</p>
                            <button onClick={() => setSuccessMessage(null)} className="ml-auto text-emerald-500 hover:text-emerald-700">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2 text-[11px] animate-in">
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                            <p className="text-rose-700 dark:text-rose-400">{errorMessage}</p>
                            <button onClick={() => setErrorMessage(null)} className="ml-auto text-rose-500 hover:text-rose-700">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}

                    {/* ===== OBSERVACIÓN UPDI ===== */}
                    {report.admin_comments && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 rounded-2xl flex gap-3 border border-amber-200 dark:border-amber-800">
                            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300">Observación:</p>
                                <p className="text-[11px] text-amber-700 dark:text-amber-400">{report.admin_comments}</p>
                            </div>
                        </div>
                    )}

                    {/* ===== FORMULARIO ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                        <form onSubmit={submit} className="space-y-4">
                            
                            {/* ===== ESTADO DEL SERVICIO ===== */}
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                                        Servicio: <span className="font-bold">OPERATIVO</span>
                                    </span>
                                    <span className="text-[11px] text-emerald-500 dark:text-emerald-400 ml-auto">
                                        (Fijo)
                                    </span>
                                </div>
                            </div>

                            {/* ===== N° OFICIO ===== */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-blue-500" /> N° Oficio
                                </label>
                                <input 
                                    type="text" 
                                    value={data.office_number || ''} // ✅ Corregido: valor nunca null
                                    onChange={(e) => setData('office_number', e.target.value)} 
                                    className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 px-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-500"
                                    placeholder="OFICIO N° 045-2026-DIR-IE"
                                />
                            </div>

                            {/* ===== EVIDENCIAS EXISTENTES ===== */}
                            {report.evidences.length > 0 && (
                                <div>
                                    <p className="text-[11px] font-semibold text-gray-500 dark:text-neutral-400 mb-2">
                                        📷 Evidencias ({report.evidences.length})
                                    </p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {report.evidences.map((ev) => (
                                            <div key={ev.id} className="relative group">
                                                <img 
                                                    src={`/storage/${ev.file_path}`} 
                                                    className="h-16 w-full object-cover rounded-xl border border-gray-200 dark:border-white/10" 
                                                    alt="Evidencia" 
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => deleteEvidence(ev.id)}
                                                    className="absolute -top-1 -right-1 bg-rose-500 hover:bg-rose-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ===== NUEVAS EVIDENCIAS ===== */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                                    <ImageIcon className="w-3.5 h-3.5 text-blue-500" /> Agregar fotos
                                </label>
                                <div className={`relative rounded-xl border-2 border-dashed transition-all ${
                                    previews.length > 0 ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/20 dark:bg-emerald-500/5' : 'border-gray-300 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/40 hover:bg-blue-50/10 dark:hover:bg-blue-500/5'
                                }`}>
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                        onChange={handleFileChange} 
                                    />
                                    <div className="p-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Upload className={`w-4 h-4 ${previews.length > 0 ? 'text-emerald-500' : 'text-blue-500'}`} />
                                            <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                                {previews.length > 0 ? `${previews.length} imágenes` : 'Arrastra o haz clic'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {previews.length > 0 && (
                                    <div className="mt-2 grid grid-cols-4 gap-2">
                                        {previews.map((url, index) => (
                                            <div key={index} className="relative">
                                                <img src={url} className="h-16 w-full object-cover rounded-xl border border-gray-200 dark:border-white/10" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newPreviews = previews.filter((_, i) => i !== index);
                                                        const newEvidences = data.evidences.filter((_, i) => i !== index);
                                                        setPreviews(newPreviews);
                                                        setData('evidences', newEvidences);
                                                    }}
                                                    className="absolute -top-1 -right-1 bg-rose-500 hover:bg-rose-600 text-white p-0.5 rounded-full shadow-lg"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ===== BARRA DE PROGRESO ===== */}
                            {isUploading && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Subiendo...
                                        </span>
                                        <span className="font-bold text-blue-600 dark:text-blue-400">{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-200 dark:bg-white/5 rounded-full mt-1 overflow-hidden">
                                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                </div>
                            )}

                            {/* ===== BOTÓN GUARDAR ===== */}
                            <button 
                                type="submit" 
                                disabled={processing || isUploading} 
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {processing || isUploading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                                ) : (
                                    <><Save className="w-4 h-4" /> Guardar Correcciones</>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* ===== HISTORIAL ===== */}
                    {report.history && report.history.length > 0 && (
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                            <div className="flex items-center gap-2 mb-3">
                                <History className="w-4 h-4 text-gray-500 dark:text-neutral-400" />
                                <h3 className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300">Historial</h3>
                            </div>
                            <ReportHistory history={report.history} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }, { title: 'Corregir Reporte', href: '#' }],
};