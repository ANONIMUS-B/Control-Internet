// resources/js/Pages/Reports/ExportExcel.tsx

import { Head, Link, router } from '@inertiajs/react';
import {
    FileSpreadsheet,
    Download,
    CalendarDays,
    Building2,
    Filter,
    ArrowLeft,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import { useState } from 'react';
import { dashboard } from '@/routes';

interface ExportExcelProps {
    institutions: Array<{ id: number; name: string; modular_code: string }>;
    months: Record<number, string>;
    statuses: Record<string, string>;
    currentYear: number;
    filters: {
        month?: string;
        year?: string;
        status?: string;
        institution_id?: string;
    };
}

export default function ExportExcel({
    institutions,
    months,
    statuses,
    currentYear,
    filters,
}: ExportExcelProps) {
    const [selectedMonth, setSelectedMonth] = useState<string>(
        filters.month || '',
    );
    const [selectedYear, setSelectedYear] = useState<string>(
        filters.year || String(currentYear),
    );
    const [selectedStatus, setSelectedStatus] = useState<string>(
        filters.status || '',
    );
    const [selectedInstitution, setSelectedInstitution] = useState<string>(
        filters.institution_id || '',
    );
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);

    // ✅ Exportar con filtros usando Formulario HTML
    const exportToExcel = () => {
        setIsExporting(true);
        setProgress(0);

        // Simular progreso
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(interval);

                    return 90;
                }

                return prev + 10;
            });
        }, 300);

        // ✅ Crear formulario para descarga
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/reportes/exportar-excel';

        // Token CSRF
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value =
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content') || '';
        form.appendChild(csrfInput);

        // Agregar filtros
        const filters = [
            { name: 'month', value: selectedMonth },
            { name: 'year', value: selectedYear },
            { name: 'status', value: selectedStatus },
            { name: 'institution_id', value: selectedInstitution },
        ];

        filters.forEach((filter) => {
            if (filter.value) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = filter.name;
                input.value = String(filter.value);
                form.appendChild(input);
            }
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        // Simular finalización
        setTimeout(() => {
            clearInterval(interval);
            setProgress(100);
            setTimeout(() => {
                setIsExporting(false);
                setProgress(0);
            }, 1000);
        }, 2000);
    };

    // ✅ Exportar todos usando GET
    const exportAll = () => {
        if (
            !confirm('¿Exportar TODOS los reportes? Puede tomar unos segundos.')
        ) {
            return;
        }

        setIsExporting(true);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(interval);

                    return 90;
                }

                return prev + 5;
            });
        }, 200);

        // ✅ Usar window.location para descarga directa
        window.location.href = '/reportes/exportar-todos';

        setTimeout(() => {
            clearInterval(interval);
            setProgress(100);
            setTimeout(() => {
                setIsExporting(false);
                setProgress(0);
            }, 1000);
        }, 2000);
    };

    const hasFilters =
        selectedMonth || selectedYear || selectedStatus || selectedInstitution;

    return (
        <>
            <Head title="Exportar Reportes a Excel" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mx-auto w-full max-w-7xl space-y-6">
                    {/* Encabezado */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/reportes"
                                    className="rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold text-neutral-800 dark:text-white">
                                        📊 Exportar Reportes a Excel
                                    </h1>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Selecciona filtros para exportar
                                        reportes en formato Excel
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta de información */}
                    <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        <div>
                            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                Exporta tus reportes en formato Excel (.xlsx)
                            </p>
                            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                                Puedes filtrar por mes, año, estado e
                                institución educativa.
                            </p>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-lg dark:bg-neutral-900/80">
                        <h3 className="mb-4 text-lg font-bold text-neutral-800 dark:text-white">
                            Filtros de Exportación
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Mes
                                </label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) =>
                                        setSelectedMonth(e.target.value)
                                    }
                                    className="w-full rounded-xl border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                >
                                    <option value="">Todos los meses</option>
                                    {Object.entries(months).map(
                                        ([key, value]) => (
                                            <option key={key} value={key}>
                                                {value}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Año
                                </label>
                                <input
                                    type="number"
                                    value={selectedYear}
                                    onChange={(e) =>
                                        setSelectedYear(e.target.value)
                                    }
                                    className="w-full rounded-xl border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                    min={2020}
                                    max={currentYear + 1}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Estado
                                </label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) =>
                                        setSelectedStatus(e.target.value)
                                    }
                                    className="w-full rounded-xl border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                >
                                    <option value="">Todos los estados</option>
                                    {Object.entries(statuses).map(
                                        ([key, value]) => (
                                            <option key={key} value={key}>
                                                {value}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Institución
                                </label>
                                <select
                                    value={selectedInstitution}
                                    onChange={(e) =>
                                        setSelectedInstitution(e.target.value)
                                    }
                                    className="w-full rounded-xl border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                >
                                    <option value="">Todas las IE</option>
                                    {institutions.map((inst) => (
                                        <option
                                            key={inst.id}
                                            value={String(inst.id)}
                                        >
                                            {inst.name} ({inst.modular_code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Botones de exportación */}
                        <div className="mt-6 flex flex-wrap gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
                            <button
                                onClick={exportToExcel}
                                disabled={isExporting}
                                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                {isExporting
                                    ? 'Exportando...'
                                    : 'Exportar con Filtros'}
                            </button>

                            <button
                                onClick={exportAll}
                                disabled={isExporting}
                                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Download className="h-4 w-4" />
                                Exportar Todos
                            </button>

                            {hasFilters && (
                                <button
                                    onClick={() => {
                                        setSelectedMonth('');
                                        setSelectedYear(String(currentYear));
                                        setSelectedStatus('');
                                        setSelectedInstitution('');
                                    }}
                                    className="flex items-center gap-2 rounded-xl bg-neutral-200 px-6 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                                >
                                    <Filter className="h-4 w-4" />
                                    Limpiar Filtros
                                </button>
                            )}
                        </div>

                        {/* Barra de progreso */}
                        {isExporting && (
                            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Generando Excel...
                                    </span>
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                        {progress}%
                                    </span>
                                </div>
                                <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                    <div
                                        className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                                    {progress < 50
                                        ? 'Preparando datos...'
                                        : progress < 80
                                          ? 'Generando archivo...'
                                          : 'Finalizando...'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Información de columnas */}
                    <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-lg dark:bg-neutral-900/80">
                        <h3 className="mb-4 text-lg font-bold text-neutral-800 dark:text-white">
                            📋 Columnas del Excel
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                            <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800">
                                <span className="font-medium">ID</span>
                            </div>
                            <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800">
                                <span className="font-medium">Institución</span>
                            </div>
                            <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800">
                                <span className="font-medium">
                                    Código Modular
                                </span>
                            </div>
                            <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800">
                                <span className="font-medium">Distrito</span>
                            </div>
                            <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800">
                                <span className="font-medium">Nivel</span>
                            </div>
                            <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800">
                                <span className="font-medium">Mes</span>
                            </div>
                            <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800">
                                <span className="font-medium">Año</span>
                            </div>
                            <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800">
                                <span className="font-medium">N° Oficio</span>
                            </div>
                            <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800">
                                <span className="font-medium">Estado</span>
                            </div>
                            <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800">
                                <span className="font-medium">Servicio</span>
                            </div>
                            <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800">
                                <span className="font-medium">Director</span>
                            </div>
                            <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800">
                                <span className="font-medium">
                                    DNI Director
                                </span>
                            </div>
                            <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800">
                                <span className="font-medium">
                                    Fecha Creación
                                </span>
                            </div>
                            <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800">
                                <span className="font-medium">Fecha Envío</span>
                            </div>
                            <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800">
                                <span className="font-medium">
                                    Observaciones UPDI
                                </span>
                            </div>
                            <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800">
                                <span className="font-medium">Notas</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

ExportExcel.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Reportes', href: '/reportes' },
        { title: 'Exportar Excel', href: '#' },
    ],
};
