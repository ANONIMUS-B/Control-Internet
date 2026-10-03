import { Head, useForm, router, Link } from '@inertiajs/react';
import {
    Search,
    Edit2,
    Trash2,
    Plus,
    X,
    Building2,
    Upload,
    Filter,
    CheckCircle2,
    XCircle,
    RotateCcw,
    UserCheck,
    AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Pagination } from '@/components/Pagination';
import { dashboard } from '@/routes';

interface UserMinimal {
    id: number;
    name: string;
    email: string;
}

interface Institution {
    id: number;
    modular_code: string;
    local_code: string;
    name: string;
    level: string;
    type_management: string;
    department: string;
    province: string;
    district: string;
    ugel: string;
    populated_center: string;
    address: string;
    is_active: boolean;
    users?: UserMinimal[];
}

interface Filters {
    search?: string;
    level?: string;
    type_management?: string;
    district?: string;
    is_active?: string;
    assigned_status?: string;
    per_page?: number;
}

interface InstitutionStats {
    total: number;
    active: number;
    inactive: number;
    assigned?: number;
    unassigned?: number;
}

interface Props {
    institutions: {
        data: Institution[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
    filters: Filters;
    districts: string[];
    levels: string[];
    typeManagements: string[];
    stats?: InstitutionStats;
}

export default function Institutions({
    institutions,
    filters,
    districts,
    levels,
    typeManagements,
    stats: serverStats,
}: Props) {
    const [search, setSearch] = useState<string>(filters.search || '');
    const [selectedLevel, setSelectedLevel] = useState<string>(
        filters.level || '',
    );
    const [selectedTypeManagement, setSelectedTypeManagement] =
        useState<string>(filters.type_management || '');
    const [selectedDistrict, setSelectedDistrict] = useState<string>(
        filters.district || '',
    );
    const [selectedStatus, setSelectedStatus] = useState<string>(
        filters.is_active || '',
    );
    const [selectedAssignedStatus, setSelectedAssignedStatus] =
        useState<string>(filters.assigned_status || '');
    const [perPage, setPerPage] = useState<number>(filters.per_page || 15);
    const [editing, setEditing] = useState<Institution | null>(null);
    const hasInitialFilters = Boolean(
        filters.search ||
        filters.level ||
        filters.type_management ||
        filters.district ||
        filters.is_active ||
        filters.assigned_status,
    );
    const [showFilters, setShowFilters] = useState(hasInitialFilters);

    const { data, setData, post, reset, processing, errors } = useForm({
        modular_code: '',
        local_code: '',
        name: '',
        level: '',
        type_management: '',
        department: 'Huánuco',
        province: 'Ambo',
        district: '',
        ugel: 'UGEL Ambo',
        populated_center: '',
        address: '',
    });

    const applyFilters = () => {
        router.get(
            '/institutions',
            {
                search: search,
                level: selectedLevel,
                type_management: selectedTypeManagement,
                district: selectedDistrict,
                is_active: selectedStatus,
                assigned_status: selectedAssignedStatus,
                per_page: perPage,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedLevel('');
        setSelectedTypeManagement('');
        setSelectedDistrict('');
        setSelectedStatus('');
        setSelectedAssignedStatus('');
        setPerPage(15);

        router.get(
            '/institutions',
            {
                per_page: 15,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/institutions', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                router.reload();
            },
        });
    };

    const deleteInstitution = (id: number) => {
        if (!confirm('¿Desea eliminar esta institución?')) {
            return;
        }

        router.visit(`/institutions/${id}`, {
            method: 'delete',
            preserveScroll: true,
            onSuccess: () => {
                router.reload();
            },
        });
    };

    const toggleActive = (id: number, currentStatus: boolean) => {
        const action = currentStatus ? 'desactivar' : 'activar';

        if (!confirm(`¿Desea ${action} esta institución?`)) {
            return;
        }

        router.visit(`/institutions/${id}/toggle`, {
            method: 'patch',
            preserveScroll: true,
            onSuccess: () => {
                router.reload();
            },
        });
    };

    const stats = serverStats ?? {
        total: institutions?.total || 0,
        active: institutions?.data?.filter((i) => i.is_active).length || 0,
        inactive: institutions?.data?.filter((i) => !i.is_active).length || 0,
        assigned:
            institutions?.data?.filter((i) => i.users && i.users.length > 0)
                .length || 0,
        unassigned:
            institutions?.data?.filter((i) => !i.users || i.users.length === 0)
                .length || 0,
    };

    const hasActiveFilters =
        search ||
        selectedLevel ||
        selectedTypeManagement ||
        selectedDistrict ||
        selectedStatus ||
        selectedAssignedStatus;

    const inputClass =
        'w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 px-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-500';
    const labelClass =
        'block text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-1.5';

    return (
        <>
            <Head title="Instituciones Educativas" />

            <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                <div className="mx-auto w-full max-w-7xl space-y-4">
                    {/* ===== HEADER ===== */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl border border-indigo-200 bg-indigo-100 p-2 dark:border-indigo-500/20 dark:bg-indigo-500/20">
                                    <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h1 className="text-[11px] font-bold text-gray-900 dark:text-white">
                                        Instituciones Educativas
                                    </h1>
                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                        Registro y administración centralizada
                                        de locales e instituciones
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/institutions/importar"
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-[11px] font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/40 active:scale-95"
                                >
                                    <Upload className="h-4 w-4" />
                                    Importar
                                </Link>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-[11px] font-medium transition-all ${
                                        showFilters || hasActiveFilters
                                            ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400'
                                            : 'border-gray-300 bg-gray-100 text-gray-700 hover:border-gray-400 hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:border-white/20 dark:hover:bg-white/10'
                                    }`}
                                >
                                    <Filter className="h-4 w-4" />
                                    Filtros
                                    {hasActiveFilters && (
                                        <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-600 dark:bg-indigo-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ===== TARJETAS DE ESTADÍSTICAS ===== */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                label: 'Total Registros',
                                value: stats.total,
                                icon: Building2,
                                bgColor: 'bg-indigo-100 dark:bg-indigo-500/20',
                                iconColor:
                                    'text-indigo-600 dark:text-indigo-400',
                                borderColor:
                                    'border-indigo-200 dark:border-indigo-500/20',
                            },
                            {
                                label: 'Asignadas a Director',
                                value: stats.assigned ?? 0,
                                icon: UserCheck,
                                bgColor:
                                    'bg-emerald-100 dark:bg-emerald-500/20',
                                iconColor:
                                    'text-emerald-600 dark:text-emerald-400',
                                borderColor:
                                    'border-emerald-200 dark:border-emerald-500/20',
                            },
                            {
                                label: 'Faltan por Asignar',
                                value: stats.unassigned ?? 0,
                                icon: AlertCircle,
                                bgColor: 'bg-amber-100 dark:bg-amber-500/20',
                                iconColor: 'text-amber-600 dark:text-amber-400',
                                borderColor:
                                    'border-amber-200 dark:border-amber-500/20',
                            },
                            {
                                label: 'Instituciones Activas',
                                value: stats.active,
                                icon: CheckCircle2,
                                bgColor: 'bg-blue-100 dark:bg-blue-500/20',
                                iconColor: 'text-blue-600 dark:text-blue-400',
                                borderColor:
                                    'border-blue-200 dark:border-blue-500/20',
                            },
                        ].map((stat, index) => (
                            <div
                                key={index}
                                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] font-medium text-gray-500 dark:text-neutral-400">
                                            {stat.label}
                                        </p>
                                        <p className="text-[11px] font-bold text-gray-900 dark:text-white">
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div
                                        className={`${stat.bgColor} rounded-xl border p-2.5 ${stat.borderColor}`}
                                    >
                                        <stat.icon
                                            className={`${stat.iconColor} h-4 w-4`}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ===== FORMULARIO DE REGISTRO ===== */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                        <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 dark:border-white/10">
                            <Plus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-[11px] font-semibold text-gray-900 dark:text-white">
                                Registrar Nueva Institución
                            </h2>
                        </div>

                        <form onSubmit={submit}>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label className={labelClass}>
                                        Código Modular
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={data.modular_code}
                                        onChange={(e) =>
                                            setData(
                                                'modular_code',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Ej: 1234567"
                                    />
                                    {errors.modular_code && (
                                        <p className="mt-1 text-[11px] text-rose-500">
                                            {errors.modular_code}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Código Local
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={data.local_code}
                                        onChange={(e) =>
                                            setData(
                                                'local_code',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Ej: LOC001"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Nivel</label>
                                    <select
                                        className={inputClass}
                                        value={data.level}
                                        onChange={(e) =>
                                            setData('level', e.target.value)
                                        }
                                    >
                                        <option value="">Seleccione...</option>
                                        <option value="Inicial">Inicial</option>
                                        <option value="Primaria">
                                            Primaria
                                        </option>
                                        <option value="Secundaria">
                                            Secundaria
                                        </option>
                                        <option value="Inicial y Primaria">
                                            Inicial y Primaria
                                        </option>
                                        <option value="Primaria y Secundaria">
                                            Primaria y Secundaria
                                        </option>
                                        <option value="Inicial, Primaria y Secundaria">
                                            Inicial, Primaria y Secundaria
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Tipo de Gestión
                                    </label>
                                    <select
                                        className={inputClass}
                                        value={data.type_management}
                                        onChange={(e) =>
                                            setData(
                                                'type_management',
                                                e.target.value,
                                            )
                                        }
                                    >
                                        <option value="">Seleccione...</option>
                                        <option value="Pública">Pública</option>
                                        <option value="Privada">Privada</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2 lg:col-span-2">
                                    <label className={labelClass}>
                                        Nombre de IE
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="Nombre completo de la institución"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Departamento
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={data.department}
                                        onChange={(e) =>
                                            setData(
                                                'department',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Provincia
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={data.province}
                                        onChange={(e) =>
                                            setData('province', e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Distrito
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={data.district}
                                        onChange={(e) =>
                                            setData('district', e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>UGEL</label>
                                    <input
                                        className={inputClass}
                                        value={data.ugel}
                                        onChange={(e) =>
                                            setData('ugel', e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Centro Poblado
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={data.populated_center}
                                        onChange={(e) =>
                                            setData(
                                                'populated_center',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <div className="md:col-span-2 lg:col-span-1">
                                    <label className={labelClass}>
                                        Dirección
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={data.address}
                                        onChange={(e) =>
                                            setData('address', e.target.value)
                                        }
                                        placeholder="Dirección completa"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    disabled={processing}
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2.5 text-[11px] font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 hover:from-indigo-600 hover:to-indigo-700 hover:shadow-indigo-500/40 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    <Plus className="h-4 w-4" />
                                    Registrar Institución
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ===== FILTROS AVANZADOS ===== */}
                    {showFilters && (
                        <div className="animate-in rounded-2xl border border-gray-200 bg-white p-4 shadow-sm duration-200 slide-in-from-top dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                            {/* Cabecera del panel de filtros */}
                            <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                        <Filter className="h-3.5 w-3.5" />
                                    </div>
                                    <div>
                                        <h3 className="text-[11px] font-semibold text-gray-800 dark:text-slate-200">
                                            Filtros de Búsqueda
                                        </h3>
                                    </div>
                                </div>
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                        Limpiar filtros
                                    </button>
                                )}
                            </div>

                            {/* Controles en cuadrícula equilibrada */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                {/* Fila 1 */}
                                <div className="relative sm:col-span-2">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
                                    <input
                                        type="text"
                                        placeholder="Buscar código modular, nombre o código local..."
                                        className={`${inputClass} pl-9`}
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                applyFilters();
                                            }
                                        }}
                                    />
                                </div>

                                <div>
                                    <select
                                        value={selectedAssignedStatus}
                                        onChange={(e) =>
                                            setSelectedAssignedStatus(
                                                e.target.value,
                                            )
                                        }
                                        className={`${inputClass} ${selectedAssignedStatus ? 'border-indigo-500 font-semibold dark:border-indigo-400' : ''}`}
                                    >
                                        <option value="">
                                            Todas las IEs (Asignación)
                                        </option>
                                        <option value="assigned">
                                            ✅ Solo Asignadas
                                        </option>
                                        <option value="unassigned">
                                            ⚠️ Faltan por asignar
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <select
                                        value={selectedLevel}
                                        onChange={(e) =>
                                            setSelectedLevel(e.target.value)
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            Todos los niveles
                                        </option>
                                        {levels.map((level) => (
                                            <option key={level} value={level}>
                                                {level}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Fila 2 */}
                                <div>
                                    <select
                                        value={selectedTypeManagement}
                                        onChange={(e) =>
                                            setSelectedTypeManagement(
                                                e.target.value,
                                            )
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            Todas las gestiones
                                        </option>
                                        {typeManagements.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <select
                                        value={selectedDistrict}
                                        onChange={(e) =>
                                            setSelectedDistrict(e.target.value)
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            Todos los distritos
                                        </option>
                                        {districts.map((district) => (
                                            <option
                                                key={district}
                                                value={district}
                                            >
                                                {district}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) =>
                                            setSelectedStatus(e.target.value)
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            Todos los estados
                                        </option>
                                        <option value="true">Activos</option>
                                        <option value="false">Inactivos</option>
                                    </select>
                                </div>

                                <div>
                                    <select
                                        value={perPage}
                                        onChange={(e) =>
                                            setPerPage(Number(e.target.value))
                                        }
                                        className={inputClass}
                                    >
                                        <option value={10}>
                                            10 por página
                                        </option>
                                        <option value={15}>
                                            15 por página
                                        </option>
                                        <option value={25}>
                                            25 por página
                                        </option>
                                        <option value={50}>
                                            50 por página
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {/* Barra de acción inferior */}
                            <div className="mt-3 flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-3 sm:flex-row dark:border-white/5">
                                <div className="text-[11px] text-gray-500 dark:text-neutral-400">
                                    {hasActiveFilters ? (
                                        <span className="inline-flex items-center gap-1.5 font-medium text-indigo-600 dark:text-indigo-400">
                                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
                                            Filtros activos aplicados
                                        </span>
                                    ) : (
                                        <span>
                                            Filtre las instituciones según los
                                            criterios seleccionados
                                        </span>
                                    )}
                                </div>
                                <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 text-[11px] font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:border-white/20 dark:hover:bg-white/10"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                            Limpiar
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={applyFilters}
                                        className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-2 text-[11px] font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 hover:from-indigo-600 hover:to-indigo-700 hover:shadow-indigo-500/40 active:scale-95"
                                    >
                                        <Search className="h-3.5 w-3.5" />
                                        Filtrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== TABLA DE INSTITUCIONES ===== */}
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px]">
                                <thead className="bg-gray-50 dark:bg-white/5">
                                    <tr>
                                        <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Cód. Modular
                                        </th>
                                        <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Cód. Local
                                        </th>
                                        <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Nombre de la IE
                                        </th>
                                        <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Nivel
                                        </th>
                                        <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Gestión
                                        </th>
                                        <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Distrito
                                        </th>
                                        <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Estado
                                        </th>
                                        <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Asignación
                                        </th>
                                        <th className="px-4 py-3 text-center text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-neutral-400">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                    {institutions?.data &&
                                    institutions.data.length > 0 ? (
                                        institutions.data.map((institution) => (
                                            <tr
                                                key={institution.id}
                                                className="transition-colors hover:bg-gray-50 dark:hover:bg-white/10"
                                            >
                                                <td className="px-4 py-3 font-mono text-[11px] font-medium text-gray-900 dark:text-white">
                                                    {institution.modular_code ||
                                                        '-'}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-[11px] font-medium text-gray-900 dark:text-white">
                                                    {institution.local_code ||
                                                        '-'}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                                    {institution.name}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-400">
                                                        {institution.level ||
                                                            'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-neutral-300">
                                                    {
                                                        institution.type_management
                                                    }
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-neutral-300">
                                                    {institution.district}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                                                            institution.is_active
                                                                ? 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400'
                                                                : 'border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-400'
                                                        }`}
                                                    >
                                                        {institution.is_active
                                                            ? 'Activo'
                                                            : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {institution.users &&
                                                    institution.users.length >
                                                        0 ? (
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="inline-flex w-fit items-center gap-1 rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400">
                                                                <UserCheck className="h-3 w-3 flex-shrink-0" />
                                                                Asignada
                                                            </span>
                                                            <span
                                                                className="max-w-[150px] truncate text-[10px] font-medium text-gray-600 dark:text-neutral-300"
                                                                title={institution.users
                                                                    .map(
                                                                        (u) =>
                                                                            u.name,
                                                                    )
                                                                    .join(', ')}
                                                            >
                                                                {institution.users
                                                                    .map(
                                                                        (u) =>
                                                                            u.name,
                                                                    )
                                                                    .join(', ')}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex w-fit items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400">
                                                            <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                                            Falta asignar
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                toggleActive(
                                                                    institution.id,
                                                                    institution.is_active,
                                                                )
                                                            }
                                                            className={`rounded-xl border p-2 transition-all hover:scale-110 active:scale-95 ${
                                                                institution.is_active
                                                                    ? 'border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-200 dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:hover:bg-amber-500/25'
                                                                    : 'border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:hover:bg-emerald-500/25'
                                                            }`}
                                                            title={
                                                                institution.is_active
                                                                    ? 'Desactivar'
                                                                    : 'Activar'
                                                            }
                                                        >
                                                            <RotateCcw className="h-4 w-4" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setEditing(
                                                                    institution,
                                                                )
                                                            }
                                                            className="rounded-xl border border-indigo-200 bg-indigo-100 p-2 text-indigo-700 transition-all hover:scale-110 hover:bg-indigo-200 active:scale-95 dark:border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-400 dark:hover:bg-indigo-500/25"
                                                            title="Editar"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                deleteInstitution(
                                                                    institution.id,
                                                                )
                                                            }
                                                            className="rounded-xl border border-rose-200 bg-rose-100 p-2 text-rose-700 transition-all hover:scale-110 hover:bg-rose-200 active:scale-95 dark:border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-400 dark:hover:bg-rose-500/25"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={9}
                                                className="py-16 text-center"
                                            >
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="rounded-full border border-gray-200 bg-gray-100 p-6 dark:border-white/10 dark:bg-white/5">
                                                        <Building2 className="h-16 w-16 text-gray-400 dark:text-neutral-600" />
                                                    </div>
                                                    <p className="text-[11px] font-medium text-gray-900 dark:text-white">
                                                        No se encontraron
                                                        instituciones
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                                        Intenta cambiando los
                                                        criterios de búsqueda o
                                                        importa nuevos
                                                        registros.
                                                    </p>
                                                    <Link
                                                        href="/institutions/importar"
                                                        className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-[11px] font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/40 active:scale-95"
                                                    >
                                                        <Upload className="h-4 w-4" />
                                                        Importar instituciones
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {institutions?.links &&
                            institutions.links.length > 3 && (
                                <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                                    <Pagination links={institutions.links} />
                                </div>
                            )}
                    </div>

                    {institutions?.total > 0 && (
                        <div className="text-center text-[11px] text-gray-500 dark:text-neutral-400">
                            Mostrando {institutions.data?.length || 0} de{' '}
                            {institutions.total} instituciones
                            {institutions.last_page > 1 &&
                                ` · Página ${institutions.current_page} de ${institutions.last_page}`}
                        </div>
                    )}
                </div>
            </div>

            {editing && (
                <EditModal
                    institution={editing}
                    onClose={() => setEditing(null)}
                />
            )}
        </>
    );
}

Institutions.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Instituciones', href: '#' },
    ],
};

// ============================================
// COMPONENTE EDIT MODAL
// ============================================

function EditModal({
    institution,
    onClose,
}: {
    institution: Institution;
    onClose: () => void;
}) {
    const { data, setData, put, processing, errors } = useForm({
        modular_code: institution.modular_code ?? '',
        local_code: institution.local_code ?? '',
        name: institution.name ?? '',
        level: institution.level ?? '',
        type_management: institution.type_management ?? '',
        department: institution.department ?? 'Huánuco',
        province: institution.province ?? 'Ambo',
        district: institution.district ?? '',
        ugel: institution.ugel ?? 'UGEL Ambo',
        populated_center: institution.populated_center ?? '',
        address: institution.address ?? '',
    });

    const updateInstitution = (e: React.FormEvent) => {
        e.preventDefault();

        put(`/institutions/${institution.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
        });
    };

    const inputClass =
        'w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 px-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-500';
    const labelClass =
        'block text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-1.5';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <form
                onSubmit={updateInstitution}
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-slate-800"
            >
                <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3 dark:border-white/10">
                    <h2 className="text-[11px] font-bold text-gray-900 dark:text-white">
                        Editar Institución Educativa
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                    >
                        <X className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>Código Modular</label>
                        <input
                            className={inputClass}
                            value={data.modular_code}
                            onChange={(e) =>
                                setData('modular_code', e.target.value)
                            }
                        />
                        {errors.modular_code && (
                            <p className="mt-1 text-[11px] text-rose-500">
                                {errors.modular_code}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>Código Local</label>
                        <input
                            className={inputClass}
                            value={data.local_code}
                            onChange={(e) =>
                                setData('local_code', e.target.value)
                            }
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className={labelClass}>Nombre de IE</label>
                        <input
                            className={inputClass}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Nivel</label>
                        <select
                            className={inputClass}
                            value={data.level}
                            onChange={(e) => setData('level', e.target.value)}
                        >
                            <option value="">Seleccione...</option>
                            <option value="Inicial">Inicial</option>
                            <option value="Primaria">Primaria</option>
                            <option value="Secundaria">Secundaria</option>
                            <option value="Inicial y Primaria">
                                Inicial y Primaria
                            </option>
                            <option value="Primaria y Secundaria">
                                Primaria y Secundaria
                            </option>
                            <option value="Inicial, Primaria y Secundaria">
                                Inicial, Primaria y Secundaria
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>Tipo de Gestión</label>
                        <select
                            className={inputClass}
                            value={data.type_management}
                            onChange={(e) =>
                                setData('type_management', e.target.value)
                            }
                        >
                            <option value="">Seleccione...</option>
                            <option value="Pública">Pública</option>
                            <option value="Privada">Privada</option>
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>Departamento</label>
                        <input
                            className={inputClass}
                            value={data.department}
                            onChange={(e) =>
                                setData('department', e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Provincia</label>
                        <input
                            className={inputClass}
                            value={data.province}
                            onChange={(e) =>
                                setData('province', e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Distrito</label>
                        <input
                            className={inputClass}
                            value={data.district}
                            onChange={(e) =>
                                setData('district', e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <label className={labelClass}>UGEL</label>
                        <input
                            className={inputClass}
                            value={data.ugel}
                            onChange={(e) => setData('ugel', e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className={labelClass}>Centro Poblado</label>
                        <input
                            className={inputClass}
                            value={data.populated_center}
                            onChange={(e) =>
                                setData('populated_center', e.target.value)
                            }
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className={labelClass}>Dirección</label>
                        <input
                            className={inputClass}
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                        />
                    </div>
                </div>

                <div className="mt-5 flex justify-end gap-2 border-t border-gray-200 pt-3 dark:border-white/10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-gray-300 bg-gray-100 px-4 py-2.5 text-[11px] font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:border-white/20 dark:hover:bg-white/10"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2.5 text-[11px] font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 hover:from-indigo-600 hover:to-indigo-700 hover:shadow-indigo-500/40 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {processing ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
}
