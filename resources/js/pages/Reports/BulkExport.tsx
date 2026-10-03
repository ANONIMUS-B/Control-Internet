import { Head, Link, router } from '@inertiajs/react';
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
    Printer,
} from 'lucide-react';
import { useState } from 'react';
import { dashboard } from '@/routes';

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

export default function BulkExport({
    reports,
    months,
    currentYear,
    filters = {},
    flash,
}: BulkExportProps) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>(
        filters.status || 'all',
    );
    const [monthFilter, setMonthFilter] = useState<string>(filters.month || '');
    const [yearFilter, setYearFilter] = useState<string>(
        filters.year || String(currentYear),
    );
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [successMessage, setSuccessMessage] = useState<string | null>(
        flash?.success || null,
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(
        flash?.error || null,
    );

    const filteredReports = reports.filter((report) => {
        const matchesSearch =
            report.institution?.name
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
            report.institution?.modular_code
                ?.toLowerCase()
                .includes(search.toLowerCase());
        const matchesStatus =
            statusFilter === 'all' || report.status === statusFilter;
        const matchesMonth =
            !monthFilter || report.month === parseInt(monthFilter);
        const matchesYear = report.year === parseInt(yearFilter);

        return matchesSearch && matchesStatus && matchesMonth && matchesYear;
    });

    const selectAll = () => {
        if (selectedIds.length === filteredReports.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredReports.map((r) => r.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((i) => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const applyFilters = () => {
        router.get(
            '/reportes/exportar-lote',
            {
                month: monthFilter,
                year: yearFilter,
                status: statusFilter !== 'all' ? statusFilter : '',
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const clearFilters = () => {
        setMonthFilter('');
        setYearFilter(String(currentYear));
        setStatusFilter('all');
        setSearch('');

        router.get(
            '/reportes/exportar-lote',
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
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
            setProgress((prev) => {
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
        csrfInput.value =
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content') || '';
        form.appendChild(csrfInput);

        // Agregar los IDs seleccionados
        selectedIds.forEach((id) => {
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
        approved:
            'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25',
        observed:
            'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25',
        pending:
            'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/25',
        rejected:
            'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/25',
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
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic',
    ];

    const selectedCount = selectedIds.length;
    const totalCount = filteredReports.length;

    return (
        <>
            <Head title="Exportar Reportes en Lote" />

            <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                <div className="mx-auto w-full max-w-7xl space-y-4">
                    {/* ===== HEADER ===== */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/reportes"
                                    className="rounded-xl border border-gray-200 p-2 transition-colors hover:bg-gray-100 dark:border-white/10 dark:hover:bg-white/5"
                                >
                                    <ArrowLeft className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                                </Link>
                                <div className="rounded-xl border border-purple-200 bg-purple-100 p-2 dark:border-purple-500/20 dark:bg-purple-500/20">
                                    <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h1 className="text-[11px] font-bold text-gray-900 dark:text-white">
                                        Exportar Lote
                                    </h1>
                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                        {totalCount} reportes disponibles
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={exportSelected}
                                disabled={selectedCount === 0 || isExporting}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-[11px] font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:from-blue-600 hover:to-indigo-700 hover:shadow-blue-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {isExporting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Exportando...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4" />
                                        Exportar ({selectedCount})
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ===== MENSAJES ===== */}
                    {successMessage && (
                        <div className="flex animate-in items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-[11px] dark:border-emerald-800 dark:bg-emerald-950/30">
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                            <p className="font-medium text-emerald-700 dark:text-emerald-400">
                                {successMessage}
                            </p>
                            <button
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
                                onClick={() => setErrorMessage(null)}
                                className="ml-auto rounded-lg p-1 transition-colors hover:bg-rose-100 dark:hover:bg-rose-800/50"
                            >
                                <X className="h-3.5 w-3.5 text-rose-500" />
                            </button>
                        </div>
                    )}

                    {/* ===== BARRA DE PROGRESO ===== */}
                    {isExporting && (
                        <div className="animate-in rounded-2xl border border-gray-200 bg-white p-4 shadow-sm slide-in-from-top dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="flex items-center gap-2 text-gray-600 dark:text-neutral-400">
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                    Generando PDFs...
                                </span>
                                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                                    {progress}%
                                </span>
                            </div>
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/5">
                                <div
                                    className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* ===== FILTROS ===== */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative min-w-[120px] flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
                                <input
                                    type="text"
                                    placeholder="Buscar IE..."
                                    className="w-full rounded-xl border-2 border-gray-200 bg-white py-2 pr-3 pl-9 text-[11px] text-gray-900 transition-all outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-neutral-500"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 transition-all focus-within:border-blue-500/50 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                                <CalendarDays className="h-4 w-4 text-gray-400 dark:text-neutral-400" />
                                <select
                                    value={monthFilter}
                                    onChange={(e) =>
                                        setMonthFilter(e.target.value)
                                    }
                                    className="min-w-[70px] border-0 bg-transparent text-[11px] text-gray-900 outline-none focus:ring-0 dark:text-white [&>option]:bg-white dark:[&>option]:bg-slate-800"
                                >
                                    <option value="">Mes</option>
                                    {Object.entries(months).map(
                                        ([key, value]) => (
                                            <option key={key} value={key}>
                                                {value}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 transition-all focus-within:border-blue-500/50 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                                <input
                                    type="number"
                                    value={yearFilter}
                                    onChange={(e) =>
                                        setYearFilter(e.target.value)
                                    }
                                    className="w-16 border-0 bg-transparent text-[11px] text-gray-900 outline-none focus:ring-0 dark:text-white"
                                    placeholder="Año"
                                />
                            </div>

                            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 transition-all focus-within:border-blue-500/50 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                                <Filter className="h-4 w-4 text-gray-400 dark:text-neutral-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value)
                                    }
                                    className="min-w-[80px] border-0 bg-transparent text-[11px] text-gray-900 outline-none focus:ring-0 dark:text-white [&>option]:bg-white dark:[&>option]:bg-slate-800"
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
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-[11px] font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:from-blue-600 hover:to-indigo-700 hover:shadow-blue-500/40 active:scale-95"
                            >
                                <Search className="h-4 w-4" /> Filtrar
                            </button>

                            {(monthFilter ||
                                statusFilter !== 'all' ||
                                search) && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-4 py-2.5 text-[11px] font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:border-white/20 dark:hover:bg-white/10"
                                >
                                    <X className="h-4 w-4" /> Limpiar
                                </button>
                            )}
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-white/10">
                            <button
                                onClick={selectAll}
                                className="flex items-center gap-2 text-[11px] text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                {selectedCount === totalCount &&
                                totalCount > 0 ? (
                                    <>
                                        <CheckSquare className="h-4 w-4" />{' '}
                                        Deseleccionar todos
                                    </>
                                ) : (
                                    <>
                                        <Square className="h-4 w-4" />{' '}
                                        Seleccionar todos
                                    </>
                                )}
                            </button>
                            <div className="text-[11px] text-gray-500 dark:text-neutral-400">
                                {selectedCount} de {totalCount} seleccionados
                            </div>
                        </div>
                    </div>

                    {/* ===== TABLA ===== */}
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-[11px]">
                                <thead className="bg-gray-50 dark:bg-white/5">
                                    <tr>
                                        <th className="w-10 px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    selectedCount ===
                                                        totalCount &&
                                                    totalCount > 0
                                                }
                                                onChange={selectAll}
                                                className="h-4 w-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-white/20 dark:bg-slate-900"
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Institución
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Período
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            N° Oficio
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Estado
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Director
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                    {filteredReports.length > 0 ? (
                                        filteredReports.map((report) => {
                                            const StatusIcon =
                                                statusIcons[report.status];

                                            return (
                                                <tr
                                                    key={report.id}
                                                    className="transition-colors hover:bg-gray-50 dark:hover:bg-white/10"
                                                >
                                                    <td className="px-4 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.includes(
                                                                report.id,
                                                            )}
                                                            onChange={() =>
                                                                toggleSelect(
                                                                    report.id,
                                                                )
                                                            }
                                                            className="h-4 w-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-white/20 dark:bg-slate-900"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-[11px] font-medium text-gray-900 dark:text-white">
                                                            {report.institution
                                                                ?.name?.length >
                                                            30
                                                                ? report.institution?.name?.substring(
                                                                      0,
                                                                      30,
                                                                  ) + '...'
                                                                : report
                                                                      .institution
                                                                      ?.name ||
                                                                  'Sin IE'}
                                                        </div>
                                                        <div className="text-[11px] text-gray-500 dark:text-neutral-400">
                                                            {report.institution
                                                                ?.modular_code ||
                                                                ''}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-[11px] text-gray-600 dark:text-neutral-300">
                                                        {
                                                            monthNames[
                                                                report.month - 1
                                                            ]
                                                        }{' '}
                                                        {report.year}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-[11px] text-gray-600 dark:text-neutral-300">
                                                        {report.office_number ||
                                                            '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium ${statusColors[report.status]}`}
                                                        >
                                                            <StatusIcon className="h-3 w-3" />
                                                            {
                                                                statusLabels[
                                                                    report
                                                                        .status
                                                                ]
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-[11px] text-gray-600 dark:text-neutral-300">
                                                        {report.user?.name ||
                                                            'Sin director'}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-16 text-center"
                                            >
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="rounded-full border border-gray-200 bg-gray-100 p-6 dark:border-white/10 dark:bg-white/5">
                                                        <FileText className="h-16 w-16 text-gray-400 dark:text-neutral-600" />
                                                    </div>
                                                    <p className="text-[11px] font-medium text-gray-900 dark:text-white">
                                                        No hay reportes
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                                        No se encontraron
                                                        reportes con los filtros
                                                        seleccionados.
                                                    </p>
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
                        <div className="flex flex-col items-center justify-between gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[11px] text-gray-500 sm:flex-row dark:border-white/10 dark:bg-slate-800/50 dark:text-neutral-400">
                            <span>{totalCount} reporte(s) encontrados</span>
                            <span className="flex items-center gap-2">
                                <Printer className="h-4 w-4" />
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
        { title: 'Exportar Lote', href: '#' },
    ],
};
