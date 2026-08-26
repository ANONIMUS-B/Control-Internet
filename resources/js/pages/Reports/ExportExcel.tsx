// resources/js/Pages/Reports/ExportExcel.tsx

import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { 
    FileSpreadsheet, 
    Download, 
    CalendarDays, 
    Building2, 
    Filter,
    ArrowLeft,
    AlertCircle,
    Loader2
} from 'lucide-react';

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
    filters 
}: ExportExcelProps) {
    const [selectedMonth, setSelectedMonth] = useState<string>(filters.month || '');
    const [selectedYear, setSelectedYear] = useState<string>(filters.year || String(currentYear));
    const [selectedStatus, setSelectedStatus] = useState<string>(filters.status || '');
    const [selectedInstitution, setSelectedInstitution] = useState<string>(filters.institution_id || '');
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);

    // ✅ Exportar con filtros usando Formulario HTML
    const exportToExcel = () => {
        setIsExporting(true);
        setProgress(0);

        // Simular progreso
        const interval = setInterval(() => {
            setProgress(prev => {
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
        csrfInput.value = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        form.appendChild(csrfInput);

        // Agregar filtros
        const filters = [
            { name: 'month', value: selectedMonth },
            { name: 'year', value: selectedYear },
            { name: 'status', value: selectedStatus },
            { name: 'institution_id', value: selectedInstitution },
        ];

        filters.forEach(filter => {
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
        if (!confirm('¿Exportar TODOS los reportes? Puede tomar unos segundos.')) return;

        setIsExporting(true);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress(prev => {
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

    const hasFilters = selectedMonth || selectedYear || selectedStatus || selectedInstitution;

    return (
        <>
            <Head title="Exportar Reportes a Excel" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="max-w-7xl mx-auto w-full space-y-6">

                    {/* Encabezado */}
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-3">
                                <Link href="/reportes" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold text-neutral-800 dark:text-white">
                                        📊 Exportar Reportes a Excel
                                    </h1>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Selecciona filtros para exportar reportes en formato Excel
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta de información */}
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                Exporta tus reportes en formato Excel (.xlsx)
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                Puedes filtrar por mes, año, estado e institución educativa.
                            </p>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="bg-white dark:bg-neutral-900/80 rounded-2xl p-6 shadow-lg border border-sidebar-border/70">
                        <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-4">
                            Filtros de Exportación
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                    Mes
                                </label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full border rounded-xl px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                >
                                    <option value="">Todos los meses</option>
                                    {Object.entries(months).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                    Año
                                </label>
                                <input
                                    type="number"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="w-full border rounded-xl px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                    min={2020}
                                    max={currentYear + 1}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                    Estado
                                </label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full border rounded-xl px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                >
                                    <option value="">Todos los estados</option>
                                    {Object.entries(statuses).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                    Institución
                                </label>
                                <select
                                    value={selectedInstitution}
                                    onChange={(e) => setSelectedInstitution(e.target.value)}
                                    className="w-full border rounded-xl px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                >
                                    <option value="">Todas las IE</option>
                                    {institutions.map((inst) => (
                                        <option key={inst.id} value={String(inst.id)}>
                                            {inst.name} ({inst.modular_code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Botones de exportación */}
                        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                            <button
                                onClick={exportToExcel}
                                disabled={isExporting}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                {isExporting ? 'Exportando...' : 'Exportar con Filtros'}
                            </button>

                            <button
                                onClick={exportAll}
                                disabled={isExporting}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download className="w-4 h-4" />
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
                                    className="flex items-center gap-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
                                >
                                    <Filter className="w-4 h-4" />
                                    Limpiar Filtros
                                </button>
                            )}
                        </div>

                        {/* Barra de progreso */}
                        {isExporting && (
                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Generando Excel...
                                    </span>
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                        {progress}%
                                    </span>
                                </div>
                                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5 overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                    {progress < 50 ? 'Preparando datos...' : 
                                     progress < 80 ? 'Generando archivo...' : 
                                     'Finalizando...'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Información de columnas */}
                    <div className="bg-white dark:bg-neutral-900/80 rounded-2xl p-6 shadow-lg border border-sidebar-border/70">
                        <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-4">
                            📋 Columnas del Excel
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <span className="font-medium">ID</span>
                            </div>
                            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <span className="font-medium">Institución</span>
                            </div>
                            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <span className="font-medium">Código Modular</span>
                            </div>
                            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <span className="font-medium">Distrito</span>
                            </div>
                            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <span className="font-medium">Nivel</span>
                            </div>
                            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <span className="font-medium">Mes</span>
                            </div>
                            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <span className="font-medium">Año</span>
                            </div>
                            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <span className="font-medium">N° Oficio</span>
                            </div>
                            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <span className="font-medium">Estado</span>
                            </div>
                            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <span className="font-medium">Servicio</span>
                            </div>
                            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <span className="font-medium">Director</span>
                            </div>
                            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <span className="font-medium">DNI Director</span>
                            </div>
                            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <span className="font-medium">Fecha Creación</span>
                            </div>
                            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <span className="font-medium">Fecha Envío</span>
                            </div>
                            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <span className="font-medium">Observaciones UPDI</span>
                            </div>
                            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
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
        { title: 'Exportar Excel', href: '#' }
    ],
};