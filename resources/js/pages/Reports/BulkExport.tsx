import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { 
    FileText, 
    Download, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    Search,
    X,
    FileDown,
    ArrowLeft,
    Loader2,
    CalendarDays,
    Filter,
    Package,
    CheckSquare,
    Square,
    Zap,
    Printer
} from 'lucide-react';

interface Report {
    id: number;
    month: number;
    year: number;
    office_number: string | null;
    status: 'pending' | 'observed' | 'approved' | 'rejected';
    institution: {
        id: number;
        name: string;
        modular_code: string;
    };
    user: {
        name: string;
    };
}

interface BulkExportProps {
    reports: Report[];
    months: Record<number, string>;
    currentYear: number;
    filters?: {
        month?: string;
        year?: string;
        status?: string;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function BulkExport({ reports, months, currentYear, filters = {}, flash }: BulkExportProps) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>(filters.status || 'all');
    const [monthFilter, setMonthFilter] = useState<string>(filters.month || '');
    const [yearFilter, setYearFilter] = useState<string>(filters.year || String(currentYear));
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [successMessage, setSuccessMessage] = useState<string | null>(flash?.success || null);
    const [errorMessage, setErrorMessage] = useState<string | null>(flash?.error || null);

    const filteredReports = reports.filter(report => {
        const matchesSearch = report.institution?.name?.toLowerCase().includes(search.toLowerCase()) ||
                             report.institution?.modular_code?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
        const matchesMonth = !monthFilter || report.month === parseInt(monthFilter);
        const matchesYear = report.year === parseInt(yearFilter);
        return matchesSearch && matchesStatus && matchesMonth && matchesYear;
    });

    const selectAll = () => {
        if (selectedIds.length === filteredReports.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredReports.map(r => r.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const applyFilters = () => {
        router.get('/reportes/exportar-lote', {
            month: monthFilter,
            year: yearFilter,
            status: statusFilter !== 'all' ? statusFilter : '',
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setMonthFilter('');
        setYearFilter(String(currentYear));
        setStatusFilter('all');
        setSearch('');
        
        router.get('/reportes/exportar-lote', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const exportSelected = () => {
        if (selectedIds.length === 0) {
            alert('Selecciona al menos un reporte para exportar.');
            return;
        }

        if (!confirm(`¿Exportar ${selectedIds.length} reporte(s) en PDF?`)) {
            return;
        }

        setIsExporting(true);
        setProgress(0);

        // ✅ Simular progreso
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 10;
            });
        }, 300);

        // ✅ Crear formulario y enviar
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/reportes/exportar-lote';
        
        // Agregar token CSRF
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        form.appendChild(csrfInput);

        // Agregar los IDs seleccionados
        selectedIds.forEach(id => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'report_ids[]';
            input.value = String(id);
            form.appendChild(input);
        });

        document.body.appendChild(form);
        
        // ✅ Enviar el formulario y manejar la respuesta
        form.submit();

        // ✅ Finalizar la simulación de progreso
        setTimeout(() => {
            clearInterval(interval);
            setProgress(100);
            setTimeout(() => {
                setIsExporting(false);
                setProgress(0);
            }, 2000);
        }, 3000);
    };

    const statusColors: Record<string, string> = {
        approved: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25',
        observed: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25',
        pending: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/25',
        rejected: 'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/25',
    };

    const statusIcons: Record<string, any> = {
        approved: CheckCircle2,
        observed: AlertCircle,
        pending: Clock,
        rejected: AlertCircle,
    };

    const statusLabels: Record<string, string> = {
        approved: 'Aprobado',
        observed: 'Observado',
        pending: 'Pendiente',
        rejected: 'Rechazado',
    };

    const monthNames = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    const selectedCount = selectedIds.length;
    const totalCount = filteredReports.length;

    return (
        <>
            <Head title="Exportar Reportes en Lote" />

            <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                <div className="max-w-7xl mx-auto w-full space-y-4">

                    {/* ===== HEADER ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Link href="/reportes" className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors border border-gray-200 dark:border-white/10">
                                    <ArrowLeft className="w-4 h-4 text-gray-500 dark:text-neutral-400" />
                                </Link>
                                <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-xl border border-purple-200 dark:border-purple-500/20">
                                    <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h1 className="text-[11px] font-bold text-gray-900 dark:text-white">Exportar Lote</h1>
                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                        {totalCount} reportes disponibles
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={exportSelected}
                                disabled={selectedCount === 0 || isExporting}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                            >
                                {isExporting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Exportando...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Exportar ({selectedCount})
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ===== MENSAJES ===== */}
                    {successMessage && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-[11px] animate-in">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
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

                    {/* ===== BARRA DE PROGRESO ===== */}
                    {isExporting && (
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-2xl animate-in slide-in-from-top">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-gray-600 dark:text-neutral-400 flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                    Generando PDFs...
                                </span>
                                <span className="font-bold text-blue-600 dark:text-blue-400 text-[11px]">{progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 dark:bg-white/5 rounded-full mt-2 overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* ===== FILTROS ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative flex-1 min-w-[120px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar IE..."
                                    className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 pl-9 pr-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-500"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl px-3 py-2 border border-gray-200 dark:border-white/10 transition-all focus-within:border-blue-500/50">
                                <CalendarDays className="text-gray-400 dark:text-neutral-400 w-4 h-4" />
                                <select 
                                    value={monthFilter} 
                                    onChange={(e) => setMonthFilter(e.target.value)}
                                    className="bg-transparent border-0 text-[11px] focus:ring-0 min-w-[70px] text-gray-900 dark:text-white [&>option]:bg-white dark:[&>option]:bg-slate-800 outline-none"
                                >
                                    <option value="">Mes</option>
                                    {Object.entries(months).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl px-3 py-2 border border-gray-200 dark:border-white/10 transition-all focus-within:border-blue-500/50">
                                <input 
                                    type="number" 
                                    value={yearFilter} 
                                    onChange={(e) => setYearFilter(e.target.value)}
                                    className="bg-transparent border-0 text-[11px] w-16 focus:ring-0 text-gray-900 dark:text-white outline-none"
                                    placeholder="Año"
                                />
                            </div>

                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl px-3 py-2 border border-gray-200 dark:border-white/10 transition-all focus-within:border-blue-500/50">
                                <Filter className="text-gray-400 dark:text-neutral-400 w-4 h-4" />
                                <select 
                                    value={statusFilter} 
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="bg-transparent border-0 text-[11px] focus:ring-0 min-w-[80px] text-gray-900 dark:text-white [&>option]:bg-white dark:[&>option]:bg-slate-800 outline-none"
                                >
                                    <option value="all">Todos</option>
                                    <option value="pending">Pendientes</option>
                                    <option value="approved">Aprobados</option>
                                    <option value="observed">Observados</option>
                                    <option value="rejected">Rechazados</option>
                                </select>
                            </div>

                            <button
                                onClick={applyFilters}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95"
                            >
                                <Search className="w-4 h-4" /> Filtrar
                            </button>

                            {(monthFilter || statusFilter !== 'all' || search) && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-neutral-300 rounded-xl text-[11px] font-medium transition-all border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                                >
                                    <X className="w-4 h-4" /> Limpiar
                                </button>
                            )}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
                            <button
                                onClick={selectAll}
                                className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 transition-colors"
                            >
                                {selectedCount === totalCount && totalCount > 0 ? (
                                    <><CheckSquare className="w-4 h-4" /> Deseleccionar todos</>
                                ) : (
                                    <><Square className="w-4 h-4" /> Seleccionar todos</>
                                )}
                            </button>
                            <div className="text-[11px] text-gray-500 dark:text-neutral-400">
                                {selectedCount} de {totalCount} seleccionados
                            </div>
                        </div>
                    </div>

                    {/* ===== TABLA ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-[11px]">
                                <thead className="bg-gray-50 dark:bg-white/5">
                                    <tr>
                                        <th className="px-4 py-3 text-center w-10">
                                            <input 
                                                type="checkbox"
                                                checked={selectedCount === totalCount && totalCount > 0}
                                                onChange={selectAll}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-white/20 focus:ring-blue-500 focus:ring-2 bg-white dark:bg-slate-900"
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-[11px]">
                                            Institución
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-[11px]">
                                            Período
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-[11px]">
                                            N° Oficio
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-[11px]">
                                            Estado
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-[11px]">
                                            Director
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                    {filteredReports.length > 0 ? (
                                        filteredReports.map((report) => {
                                            const StatusIcon = statusIcons[report.status];
                                            return (
                                                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                                                    <td className="px-4 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.includes(report.id)}
                                                            onChange={() => toggleSelect(report.id)}
                                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-white/20 focus:ring-blue-500 focus:ring-2 bg-white dark:bg-slate-900"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-gray-900 dark:text-white text-[11px]">
                                                            {report.institution?.name?.length > 30 ? report.institution?.name?.substring(0, 30) + '...' : report.institution?.name || 'Sin IE'}
                                                        </div>
                                                        <div className="text-[11px] text-gray-500 dark:text-neutral-400">{report.institution?.modular_code || ''}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 dark:text-neutral-300 text-[11px]">
                                                        {monthNames[report.month - 1]} {report.year}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 dark:text-neutral-300 text-[11px] font-mono">
                                                        {report.office_number || '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border ${statusColors[report.status]}`}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {statusLabels[report.status]}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 dark:text-neutral-300 text-[11px]">
                                                        {report.user?.name || 'Sin director'}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="p-6 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10">
                                                        <FileText className="w-16 h-16 text-gray-400 dark:text-neutral-600" />
                                                    </div>
                                                    <p className="text-[11px] font-medium text-gray-900 dark:text-white">No hay reportes</p>
                                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">No se encontraron reportes con los filtros seleccionados.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ===== FOOTER ===== */}
                    {totalCount > 0 && (
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl px-4 py-3 border border-gray-200 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-gray-500 dark:text-neutral-400">
                            <span>{totalCount} reporte(s) encontrados</span>
                            <span className="flex items-center gap-2">
                                <Printer className="w-4 h-4" />
                                {selectedCount} seleccionados
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

BulkExport.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Reportes', href: '/reportes' },
        { title: 'Exportar Lote', href: '#' }
    ],
};