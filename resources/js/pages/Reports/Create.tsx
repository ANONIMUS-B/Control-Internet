import { Head, useForm, Link } from '@inertiajs/react';
import { FormEvent, useState, useEffect, useRef } from 'react';
import { dashboard } from '@/routes';
import { 
    ArrowLeft, Save, Upload, X, 
    CheckCircle, AlertCircle, Calendar, 
    Building2, FileText, Camera, 
    ChevronRight, Trash2,
    School, Loader2, ClipboardPaste,
    ChevronLeft, ChevronRight as ChevronRightIcon,
    Clock, CalendarDays, Info, Sparkles,
    Shield, Image as ImageIcon,
    Award, Users
} from 'lucide-react';

interface Institution {
    id: number;
    name: string;
    modular_code: string;
    level: string;
}

interface ReportPeriod {
    id: number;
    month: number;
    year: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
    message: string | null;
    month_name?: string;
}

interface CreateReportProps {
    month: number;
    year: number;
    myInstitutions: Institution[];
    reportedMonths: Record<number, number[]>;
    months: Record<number, string>;
    currentYear: number;
    reportPeriod?: ReportPeriod | null;
    availablePeriods?: ReportPeriod[];
}

export default function Create({ 
    month, 
    year, 
    myInstitutions, 
    reportedMonths,
    months: monthsList,
    currentYear,
    reportPeriod,
    availablePeriods = []
}: CreateReportProps) {
    const [selectedMonth, setSelectedMonth] = useState<number>(month);
    const [selectedYear] = useState<number>(year);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentMonth = new Date().getMonth() + 1;
    const currentYearDate = new Date().getFullYear();
    const today = new Date();

    const { data, setData, post, processing, errors, reset } = useForm({
        month: month,
        year: year,
        educational_institution_id: myInstitutions.length > 0 ? myInstitutions[0].id : null,
        service_state: 'operative',
        office_number: '',
        evidences: [] as File[],
    });

    const [previews, setPreviews] = useState<string[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(
        myInstitutions.length > 0 ? myInstitutions[0] : null
    );
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (availablePeriods && availablePeriods.length > 0) {
            const firstPeriod = availablePeriods[0];
            setSelectedMonth(firstPeriod.month);
            setData('month', firstPeriod.month);
            setData('year', firstPeriod.year);
        } else if (reportPeriod && reportPeriod.is_active) {
            setSelectedMonth(reportPeriod.month);
            setData('month', reportPeriod.month);
            setData('year', reportPeriod.year);
        }
    }, [availablePeriods, reportPeriod]);

    const isPeriodValid = (period: ReportPeriod) => {
        if (!period || !period.is_active) return false;
        const todayStr = today.toISOString().split('T')[0];
        return todayStr >= period.start_date && todayStr <= period.end_date;
    };

    const isSelectedMonthInPeriod = (monthNum: number, yearNum: number) => {
        if (availablePeriods && availablePeriods.length > 0) {
            return availablePeriods.some(p => p.month === monthNum && p.year === yearNum && p.is_active);
        }
        if (reportPeriod && reportPeriod.is_active) {
            return reportPeriod.month === monthNum && reportPeriod.year === yearNum;
        }
        return true;
    };

    const isFutureMonth = (month: number, year: number) => {
        if (year > currentYearDate) return true;
        if (year === currentYearDate && month > currentMonth) return true;
        return false;
    };

    const isMonthReported = (institutionId: number | null, month: number, year: number) => {
        if (!institutionId) return false;
        if (year !== currentYearDate) return false;
        const reported = reportedMonths[institutionId] || [];
        return reported.includes(month);
    };

    const getAvailableMonths = (institutionId: number | null) => {
        if (!institutionId) return [];
        
        const reported = reportedMonths[institutionId] || [];
        let available: number[] = [];

        if (availablePeriods && availablePeriods.length > 0) {
            available = availablePeriods
                .filter(p => p.is_active)
                .map(p => p.month)
                .filter(month => {
                    const isReported = reported.includes(month);
                    const isFuture = isFutureMonth(month, currentYearDate);
                    return !isReported && !isFuture;
                });
        } else if (reportPeriod && reportPeriod.is_active) {
            const periodMonth = reportPeriod.month;
            const isReported = reported.includes(periodMonth);
            const isFuture = isFutureMonth(periodMonth, reportPeriod.year);
            if (!isReported && !isFuture) {
                available = [periodMonth];
            }
        } else {
            available = Object.keys(monthsList)
                .map(m => parseInt(m))
                .filter(m => {
                    const isReported = reported.includes(m);
                    const isFuture = isFutureMonth(m, selectedYear);
                    return !isReported && !isFuture;
                });
        }

        return available.map(m => String(m));
    };

    const goToPreviousMonth = () => {
        const available = getAvailableMonths(data.educational_institution_id).map(Number);
        if (available.length === 0) return;
        const currentIndex = available.indexOf(selectedMonth);
        if (currentIndex > 0) {
            const newMonth = available[currentIndex - 1];
            setSelectedMonth(newMonth);
            setData('month', newMonth);
        }
    };

    const goToNextMonth = () => {
        const available = getAvailableMonths(data.educational_institution_id).map(Number);
        if (available.length === 0) return;
        const currentIndex = available.indexOf(selectedMonth);
        if (currentIndex < available.length - 1) {
            const newMonth = available[currentIndex + 1];
            setSelectedMonth(newMonth);
            setData('month', newMonth);
        }
    };

    const isCurrentPeriodValid = () => {
        if (!reportPeriod) return true;
        if (!reportPeriod.is_active) return true;
        return isPeriodValid(reportPeriod);
    };

    useEffect(() => {
        const institutionId = data.educational_institution_id;
        if (institutionId) {
            const available = getAvailableMonths(institutionId);
            if (available.length > 0 && !available.includes(String(selectedMonth))) {
                setSelectedMonth(parseInt(available[0]));
                setData('month', parseInt(available[0]));
            } else if (available.length === 0) {
                setSelectedMonth(0);
                setData('month', 0);
            }
        }
    }, [data.educational_institution_id, selectedYear]);

    useEffect(() => {
        const institution = myInstitutions.find(inst => inst.id === data.educational_institution_id);
        setSelectedInstitution(institution || null);
    }, [data.educational_institution_id, myInstitutions]);

    useEffect(() => {
        return () => previews.forEach(url => URL.revokeObjectURL(url));
    }, [previews]);

    const handlePaste = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    if (file.size > 10 * 1024 * 1024) {
                        setErrorMessage('La imagen no debe pesar más de 10MB.');
                        return;
                    }

                    setData('evidences', [...data.evidences, file]);
                    
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        if (event.target?.result) {
                            setPreviews([...previews, event.target.result as string]);
                        }
                    };
                    reader.readAsDataURL(file);
                    setErrorMessage(null);
                }
                break;
            }
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setData('evidences', [...data.evidences, ...filesArray]);
            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            setPreviews([...previews, ...newPreviews]);
        }
    };

    const removeFile = (index: number) => {
        const newEvidences = data.evidences.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        setData('evidences', newEvidences);
        setPreviews(newPreviews);
        URL.revokeObjectURL(previews[index]);
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
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const filesArray = Array.from(e.dataTransfer.files);
            setData('evidences', [...data.evidences, ...filesArray]);
            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            setPreviews([...previews, ...newPreviews]);
        }
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        if (!data.month || data.month === 0) {
            setErrorMessage('Debes seleccionar un mes.');
            return;
        }

        if (!isSelectedMonthInPeriod(data.month, data.year)) {
            setErrorMessage('Este mes no está dentro del período de envío configurado.');
            return;
        }

        if (isFutureMonth(selectedMonth, selectedYear)) {
            setErrorMessage('No puedes generar reportes para meses futuros.');
            return;
        }

        setData('month', selectedMonth);
        setData('year', selectedYear);

        if (data.evidences.length === 0) {
            post('/reportes', {
                onSuccess: () => {
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 3000);
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

        post('/reportes', {
            onSuccess: () => {
                clearInterval(interval);
                setUploadProgress(100);
                setTimeout(() => {
                    setIsUploading(false);
                    setUploadProgress(0);
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 3000);
                }, 500);
            },
            onError: () => {
                clearInterval(interval);
                setIsUploading(false);
                setUploadProgress(0);
            }
        });
    };

    const getMonthName = (month: number) => {
        return monthsList[month] || '';
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const canCreateReport = () => {
        if (!reportPeriod) return true;
        if (!reportPeriod.is_active) return true;
        return isCurrentPeriodValid();
    };

    const availableMonthsList = getAvailableMonths(data.educational_institution_id);

    if (myInstitutions.length === 0) {
        return (
            <>
                <Head title="Nuevo Reporte" />
                <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                    <div className="max-w-5xl mx-auto w-full">
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-8 text-center shadow-sm dark:shadow-2xl">
                            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                            <h2 className="text-[11px] font-bold text-gray-900 dark:text-white">No tienes instituciones asignadas</h2>
                            <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-2">Contacta al administrador para que te asigne una institución.</p>
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
            <Head title="Nuevo Reporte" />
            
            <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                <div className="max-w-5xl mx-auto w-full space-y-4">
                    
                    {/* ===== HEADER CON EFECTO GLASS ===== */}
                    <div className="relative overflow-hidden bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl border border-blue-200 dark:border-blue-500/20">
                                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h1 className="text-[11px] font-bold text-gray-900 dark:text-white">Nuevo Reporte</h1>
                                    <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-neutral-400">
                                        <Calendar className="w-3 h-3" />
                                        <span>{availablePeriods?.length || 'Selecciona'} mes(es) disponibles</span>
                                    </div>
                                </div>
                            </div>
                            <Link href="/reportes" className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-neutral-300 rounded-xl text-[11px] font-medium transition-all border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20">
                                <ArrowLeft className="w-3.5 h-3.5" /> Volver
                            </Link>
                        </div>
                    </div>

                    {/* ===== PERIODOS ACTIVOS ===== */}
                    {availablePeriods && availablePeriods.length > 0 && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                            <div className="flex flex-wrap items-center gap-2 text-[11px]">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                <span className="font-medium text-emerald-700 dark:text-emerald-300">Períodos activos:</span>
                                {availablePeriods.map((p, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-white/60 dark:bg-black/20 rounded-full text-gray-600 dark:text-neutral-300 border border-emerald-200 dark:border-emerald-800">
                                        {p.month_name} {p.year}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== FORMULARIO ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                        <form onSubmit={submit} className="space-y-4">
                            
                            {/* ===== INSTITUCIÓN ===== */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                                    <School className="w-3.5 h-3.5 text-blue-500" /> IE <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.educational_institution_id ?? ''}
                                    onChange={(e) => {
                                        const id = e.target.value ? parseInt(e.target.value) : null;
                                        setData('educational_institution_id', id);
                                        if (id) {
                                            const available = getAvailableMonths(id);
                                            if (available.length > 0) {
                                                const newMonth = parseInt(available[0]);
                                                setSelectedMonth(newMonth);
                                                setData('month', newMonth);
                                            } else {
                                                setSelectedMonth(0);
                                                setData('month', 0);
                                            }
                                        }
                                    }}
                                    className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 px-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                >
                                    <option value="">Selecciona</option>
                                    {myInstitutions.map((inst) => (
                                        <option key={inst.id} value={inst.id}>
                                            {inst.name} {inst.modular_code ? `(${inst.modular_code})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.educational_institution_id && (
                                    <p className="text-rose-500 text-[11px] mt-1">{errors.educational_institution_id}</p>
                                )}
                            </div>

                            {/* ===== MES ===== */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-blue-500" /> Mes <span className="text-rose-500">*</span>
                                </label>
                                
                                {availableMonthsList.length > 0 ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={goToPreviousMonth}
                                            disabled={availableMonthsList.indexOf(String(selectedMonth)) <= 0}
                                            className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-40 transition-all border border-gray-200 dark:border-white/10"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <select
                                            value={selectedMonth}
                                            onChange={(e) => {
                                                const month = parseInt(e.target.value);
                                                setSelectedMonth(month);
                                                setData('month', month);
                                            }}
                                            className="flex-1 rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 px-3 text-[11px] font-medium bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-center outline-none"
                                        >
                                            {availableMonthsList.map((monthKey) => {
                                                const monthNum = parseInt(monthKey);
                                                const isReported = isMonthReported(data.educational_institution_id, monthNum, selectedYear);
                                                return (
                                                    <option key={monthKey} value={monthKey}>
                                                        {getMonthName(monthNum)} {selectedYear}
                                                        {isReported ? ' ✅' : ''}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={goToNextMonth}
                                            disabled={availableMonthsList.indexOf(String(selectedMonth)) >= availableMonthsList.length - 1}
                                            className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-40 transition-all border border-gray-200 dark:border-white/10"
                                        >
                                            <ChevronRightIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-center text-[11px] text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                        ⚠️ No hay meses disponibles
                                    </div>
                                )}
                            </div>

                            {/* ===== ESTADO DEL SERVICIO ===== */}
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                                        Servicio: <span className="font-bold">OPERATIVO</span>
                                    </span>
                                </div>
                            </div>

                            {/* ===== N° OFICIO ===== */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-blue-500" /> N° Oficio
                                </label>
                                <input
                                    type="text"
                                    value={data.office_number}
                                    onChange={(e) => setData('office_number', e.target.value)}
                                    placeholder="OFICIO N° 045-2026-DIR-IE..."
                                    className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 px-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-500"
                                />
                                {errors.office_number && (
                                    <p className="text-rose-500 text-[11px] mt-1">{errors.office_number}</p>
                                )}
                            </div>

                            {/* ===== EVIDENCIAS ===== */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                                    <ImageIcon className="w-3.5 h-3.5 text-blue-500" /> Evidencias <span className="text-gray-400 dark:text-neutral-500 font-normal">(10 max)</span>
                                </label>
                                
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('paste-area')?.focus()}
                                    className="text-[11px] text-purple-600 dark:text-purple-400 mb-1.5 hover:underline flex items-center gap-1"
                                >
                                    <ClipboardPaste className="w-3.5 h-3.5" /> Pegar (Ctrl+V)
                                </button>

                                <div
                                    id="paste-area"
                                    tabIndex={0}
                                    onPaste={handlePaste}
                                    className={`relative rounded-xl border-2 border-dashed transition-all min-h-[100px] ${
                                        dragActive ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-500/10' : 
                                        previews.length > 0 ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/20 dark:bg-emerald-500/5' : 
                                        'border-gray-300 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/40 hover:bg-blue-50/10 dark:hover:bg-blue-500/5'
                                    }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        disabled={processing}
                                        ref={fileInputRef}
                                    />
                                    <div className="p-4 text-center">
                                        <div className="flex flex-col items-center gap-1.5">
                                            {previews.length > 0 ? (
                                                <Camera className="w-6 h-6 text-emerald-500" />
                                            ) : (
                                                <Upload className="w-6 h-6 text-blue-500" />
                                            )}
                                            <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                                {previews.length > 0 ? `${previews.length} imágenes` : 'Arrastra o haz clic'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {previews.length > 0 && (
                                    <div className="mt-2 grid grid-cols-4 gap-2">
                                        {previews.map((url, index) => (
                                            <div key={index} className="relative group">
                                                <img src={url} className="w-full h-16 object-cover rounded-xl" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 hover:bg-rose-600 transition-all"
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
                                        <span className="text-blue-600 dark:text-blue-400">Subiendo... {uploadProgress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-200 dark:bg-white/5 rounded-full mt-1 overflow-hidden">
                                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                </div>
                            )}

                            {/* ===== BOTONES ===== */}
                            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200 dark:border-white/10">
                                <button
                                    type="submit"
                                    disabled={processing || isUploading || selectedMonth === 0 || availableMonthsList.length === 0}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {processing || isUploading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                                    ) : (
                                        <><Save className="w-4 h-4" /> Guardar Reporte</>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { reset(); setPreviews([]); }}
                                    className="px-4 py-2.5 text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl text-[11px] font-medium transition-all border border-gray-200 dark:border-white/10"
                                >
                                    Limpiar
                                </button>
                            </div>

                            {/* ===== ERRORES ===== */}
                            {errorMessage && (
                                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2 text-[11px]">
                                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-rose-700 dark:text-rose-400">{errorMessage}</p>
                                    <button onClick={() => setErrorMessage(null)} className="ml-auto text-rose-500 hover:text-rose-700">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}

                            {/* ===== NOTIFICACIÓN DE ÉXITO ===== */}
                            {showSuccess && (
                                <div className="fixed bottom-4 right-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-[11px] animate-in slide-in-from-right">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">¡Reporte guardado!</p>
                                        <p className="text-gray-500 dark:text-neutral-400">El reporte ha sido creado exitosamente.</p>
                                    </div>
                                    <button onClick={() => setShowSuccess(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() }, 
        { title: 'Nuevo Reporte', href: '#' }
    ],
};