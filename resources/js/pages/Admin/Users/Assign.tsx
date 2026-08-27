// resources/js/Pages/Admin/Users/Assign.tsx

import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, X, User, Building2, UserCog, Filter, CheckCircle, AlertCircle } from 'lucide-react';
import { Pagination } from '@/components/Pagination';
import { dashboard } from '@/routes';

interface User {
    id: number;
    name: string;
    email: string;
    dni: string | null;
    role: string;
    institutions: Array<{
        id: number;
        name: string;
        modular_code: string;
    }>;
    signature_active: boolean;
    signature_path: string | null;
}

interface Institution {
    id: number;
    name: string;
    modular_code: string;
}

interface Filters {
    search?: string;
    role?: string;
    institution_id?: string;
    has_signature?: string;
    per_page?: number;
}

interface AssignProps {
    users: {
        data: User[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
    institutions: Institution[];
    filters: Filters;
    roles: Record<string, string>;
}

export default function Assign({ users, institutions, filters, roles }: AssignProps) {
    const [search, setSearch] = useState<string>(filters.search || '');
    const [selectedRole, setSelectedRole] = useState<string>(filters.role || '');
    const [selectedInstitution, setSelectedInstitution] = useState<string>(filters.institution_id || '');
    const [hasSignature, setHasSignature] = useState<string>(filters.has_signature || '');
    const [perPage, setPerPage] = useState<number>(filters.per_page || 10);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchInstitution, setSearchInstitution] = useState('');

    const applyFilters = () => {
        router.get('/usuarios/asignar', {
            search: search,
            role: selectedRole,
            institution_id: selectedInstitution,
            has_signature: hasSignature,
            per_page: perPage,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedRole('');
        setSelectedInstitution('');
        setHasSignature('');
        setPerPage(10);
        
        router.get('/usuarios/asignar', {
            per_page: 10,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const toggleInstitution = (user: User, institutionId: number) => {
        const currentIds = user.institutions.map((i) => i.id);
        const newIds = currentIds.includes(institutionId)
            ? currentIds.filter((id) => id !== institutionId)
            : [...currentIds, institutionId];

        router.post(`/usuarios/${user.id}/asignar`, 
            { institution_ids: newIds },
            { 
                preserveScroll: true, 
                preserveState: true,
                onSuccess: () => {
                    const updatedUser = {
                        ...user,
                        institutions: institutions.filter(i => newIds.includes(i.id))
                    };
                    setSelectedUser(updatedUser);
                }
            }
        );
    };

    // ✅ Filtrar instituciones con validación segura para name
    const filteredInstitutions = institutions.filter(i => {
        // Si no hay usuario seleccionado, mostrar todas las instituciones
        if (!selectedUser) return true;
        
        const searchTerm = searchInstitution.toLowerCase();
        const institutionName = i.name || ''; // ✅ Si name es null/undefined, usar cadena vacía
        const modularCode = i.modular_code || ''; // ✅ Si modular_code es null/undefined, usar cadena vacía
        
        return institutionName.toLowerCase().includes(searchTerm) ||
               modularCode.includes(searchTerm);
    });

    const stats = {
        total: users?.total || 0,
        withSignature: users?.data?.filter(u => u && u.signature_active).length || 0,
        withoutSignature: users?.data?.filter(u => u && !u.signature_active).length || 0,
    };

    const roleLabels: Record<string, string> = {
        super_admin: 'Super Administrador',
        admin: 'Administrador',
        specialist: 'Especialista UPDI',
        supervisor: 'Supervisor',
        director: 'Director',
    };

    const roleColors: Record<string, string> = {
        super_admin: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/25',
        admin: 'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/25',
        specialist: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/25',
        supervisor: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25',
        director: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25',
    };

    return (
        <>
            <Head title="Asignar Directores" />

            <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                <div className="max-w-7xl mx-auto w-full space-y-4">

                    {/* ===== HEADER ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-[11px] font-bold text-gray-900 dark:text-white">
                                    Gestión de Accesos a IE
                                </h1>
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                    Asignación de directores a instituciones educativas
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ===== TARJETAS DE ESTADÍSTICAS ===== */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: 'Total Usuarios', value: stats.total, icon: User, bgColor: 'bg-blue-100 dark:bg-blue-500/20', iconColor: 'text-blue-600 dark:text-blue-400', borderColor: 'border-blue-200 dark:border-blue-500/20' },
                            { label: 'Con Firma Digital', value: stats.withSignature, icon: CheckCircle, bgColor: 'bg-emerald-100 dark:bg-emerald-500/20', iconColor: 'text-emerald-600 dark:text-emerald-400', borderColor: 'border-emerald-200 dark:border-emerald-500/20' },
                            { label: 'Sin Firma Digital', value: stats.withoutSignature, icon: AlertCircle, bgColor: 'bg-amber-100 dark:bg-amber-500/20', iconColor: 'text-amber-600 dark:text-amber-400', borderColor: 'border-amber-200 dark:border-amber-500/20' }
                        ].map((stat, index) => (
                            <div key={index} className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-2xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] font-medium text-gray-500 dark:text-neutral-400">{stat.label}</p>
                                        <p className="text-[11px] font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                    </div>
                                    <div className={`${stat.bgColor} p-2.5 rounded-xl border ${stat.borderColor}`}>
                                        <stat.icon className={`${stat.iconColor} w-4 h-4`} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ===== FILTROS ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm dark:shadow-2xl">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre, email o DNI..."
                                        className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 pl-9 pr-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-500"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all px-3 py-2 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                >
                                    <option value="">Todos los roles</option>
                                    {Object.entries(roles).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>

                                <select
                                    value={selectedInstitution}
                                    onChange={(e) => setSelectedInstitution(e.target.value)}
                                    className="rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all px-3 py-2 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                >
                                    <option value="">Todas las IE</option>
                                    {institutions.map((inst) => (
                                        <option key={inst.id} value={String(inst.id)}>
                                            {inst.name} ({inst.modular_code})
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={hasSignature}
                                    onChange={(e) => setHasSignature(e.target.value)}
                                    className="rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all px-3 py-2 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                >
                                    <option value="">Todos</option>
                                    <option value="true">Con Firma Digital</option>
                                    <option value="false">Sin Firma Digital</option>
                                </select>

                                <select
                                    value={perPage}
                                    onChange={(e) => setPerPage(Number(e.target.value))}
                                    className="rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all px-3 py-2 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
                                >
                                    <option value={10}>10</option>
                                    <option value={15}>15</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <button
                                    onClick={applyFilters}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95"
                                >
                                    <Search className="w-4 h-4" />
                                    Filtrar
                                </button>
                                {(search || selectedRole || selectedInstitution || hasSignature) && (
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-neutral-300 rounded-xl text-[11px] font-medium transition-all border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                                    >
                                        <X className="w-4 h-4" />
                                        Limpiar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ===== TABLA DE USUARIOS ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-[11px]">
                                <thead className="bg-gray-50 dark:bg-white/5">
                                    <tr>
                                        <th className="p-3 text-left text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Usuario</th>
                                        <th className="p-3 text-left text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Rol</th>
                                        <th className="p-3 text-left text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">IEs Asignadas</th>
                                        <th className="p-3 text-left text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Firma</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users?.data && users.data.length > 0 ? (
                                        users.data.map((user) => (
                                            <tr 
                                                key={user.id} 
                                                className="border-t border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                                            >
                                                <td className="p-3">
                                                    <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                                                    <div className="text-[11px] text-gray-500 dark:text-neutral-400">{user.email}</div>
                                                    {user.dni && (
                                                        <div className="text-[11px] text-gray-400 dark:text-neutral-500">DNI: {user.dni}</div>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded-full text-[11px] font-medium border ${roleColors[user.role] || 'bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-400 border-neutral-200 dark:border-white/10'}`}>
                                                        {roleLabels[user.role] || user.role}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.institutions && user.institutions.length > 0 ? (
                                                            user.institutions.map((inst) => (
                                                                <span 
                                                                    key={inst.id} 
                                                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full text-[10px] border border-blue-200 dark:border-blue-500/20 max-w-[200px]"
                                                                    title={inst.name || ''}
                                                                >
                                                                    <Building2 className="w-3 h-3 flex-shrink-0" />
                                                                    <span className="truncate">{inst.name || 'Sin nombre'}</span>
                                                                    <span className="text-[9px] text-blue-400 dark:text-blue-500 flex-shrink-0">({inst.modular_code || 'N/A'})</span>
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-[11px] text-gray-400 dark:text-neutral-500">Sin asignar</span>
                                                        )}
                                                    </div>
                                                    {user.institutions && user.institutions.length > 0 && (
                                                        <div className="mt-1 text-[10px] text-gray-400 dark:text-neutral-500">
                                                            {user.institutions.length} institución(es) asignada(s)
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-1 rounded-full text-[11px] font-medium border ${user.signature_active ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25' : 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25'}`}>
                                                            {user.signature_active ? '✅ Activa' : '❌ Sin firma'}
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setSearchInstitution('');
                                                            }}
                                                            className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 hover:bg-blue-200 dark:hover:bg-blue-500/30 text-blue-700 dark:text-blue-400 rounded-lg text-[10px] font-medium transition-colors border border-blue-200 dark:border-blue-500/20"
                                                        >
                                                            Asignar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="p-6 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10">
                                                        <UserCog className="w-16 h-16 text-gray-400 dark:text-neutral-600" />
                                                    </div>
                                                    <p className="text-[11px] font-medium text-gray-900 dark:text-white">No hay usuarios</p>
                                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">No se encontraron usuarios con los filtros seleccionados.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {users?.links && users.links.length > 3 && (
                            <div className="border-t border-gray-200 dark:border-white/10 px-4 py-3 bg-gray-50 dark:bg-white/5">
                                <Pagination links={users.links} />
                            </div>
                        )}
                    </div>

                    {users?.total > 0 && (
                        <div className="text-center text-[11px] text-gray-500 dark:text-neutral-400">
                            Mostrando {users.data?.length || 0} de {users.total} usuarios
                            {users.last_page > 1 && ` - Página ${users.current_page} de ${users.last_page}`}
                        </div>
                    )}
                </div>
            </div>

            {/* ===== MODAL DE ASIGNACIÓN ===== */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10">
                        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200 dark:border-white/10">
                            <div>
                                <h2 className="text-[11px] font-bold text-gray-900 dark:text-white">
                                    Asignar IEs para: {selectedUser.name}
                                </h2>
                                <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                    {selectedUser.email}
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedUser(null)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-500 dark:text-neutral-400" />
                            </button>
                        </div>

                        <div className="p-4 md:p-6">
                            {/* ===== IEs actualmente asignadas ===== */}
                            {selectedUser && (
                                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20">
                                    <p className="text-[10px] font-medium text-blue-700 dark:text-blue-300 mb-2">
                                        IEs actualmente asignadas:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedUser.institutions && selectedUser.institutions.length > 0 ? (
                                            selectedUser.institutions.map((inst) => (
                                                <span 
                                                    key={inst.id} 
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full text-[10px] border border-blue-200 dark:border-blue-500/20"
                                                    title={inst.name || ''}
                                                >
                                                    <Building2 className="w-3 h-3" />
                                                    <span className="truncate max-w-[120px]">{inst.name || 'Sin nombre'}</span>
                                                    <span className="text-[9px] text-blue-400 dark:text-blue-500">({inst.modular_code || 'N/A'})</span>
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[11px] text-gray-400 dark:text-neutral-500">No tiene instituciones asignadas</span>
                                        )}
                                    </div>
                                    {selectedUser.institutions && selectedUser.institutions.length > 0 && (
                                        <div className="mt-2 text-[10px] text-blue-600 dark:text-blue-400">
                                            Total: {selectedUser.institutions.length} institución(es)
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ===== Buscador ===== */}
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 w-4 h-4" />
                                <input 
                                    placeholder="Buscar IE por nombre o código..." 
                                    className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 pl-9 pr-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-500"
                                    value={searchInstitution}
                                    onChange={(e) => setSearchInstitution(e.target.value)}
                                />
                            </div>

                            {/* ===== Lista de instituciones ===== */}
                            <div className="max-h-80 overflow-y-auto border-2 border-gray-200 dark:border-white/10 rounded-xl divide-y divide-gray-200 dark:divide-white/5">
                                {filteredInstitutions.length > 0 ? (
                                    filteredInstitutions.map((ie) => {
                                        // ✅ Verificar que selectedUser existe antes de acceder a institutions
                                        const isAssigned = selectedUser && selectedUser.institutions && 
                                            selectedUser.institutions.some((u) => u.id === ie.id);
                                        
                                        return (
                                            <label 
                                                key={ie.id} 
                                                className={`flex items-center gap-3 p-3 hover:bg-blue-50 dark:hover:bg-blue-500/10 cursor-pointer transition-colors ${isAssigned ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''}`}
                                            >
                                                <input 
                                                    type="checkbox"
                                                    checked={isAssigned || false}
                                                    onChange={() => toggleInstitution(selectedUser, ie.id)}
                                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-white/20 focus:ring-blue-500"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-medium text-gray-900 dark:text-white truncate">
                                                        {ie.name || 'Sin nombre'}
                                                        {isAssigned && (
                                                            <span className="ml-2 text-[10px] text-blue-600 dark:text-blue-400 font-normal">
                                                                (Asignada)
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                                        Código: {ie.modular_code || 'N/A'}
                                                    </p>
                                                </div>
                                                {isAssigned && (
                                                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                                )}
                                            </label>
                                        );
                                    })
                                ) : (
                                    <div className="p-6 text-center text-gray-500 dark:text-neutral-400">
                                        <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-neutral-600" />
                                        <p className="text-[11px]">No se encontraron instituciones</p>
                                    </div>
                                )}
                            </div>

                            {/* ===== Resumen ===== */}
                            <div className="mt-4 flex items-center justify-between text-[11px] text-gray-500 dark:text-neutral-400">
                                <span>{selectedUser.institutions ? selectedUser.institutions.length : 0} instituciones asignadas</span>
                                <span className="text-gray-400 dark:text-neutral-500">
                                    {filteredInstitutions.length} instituciones disponibles
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end p-4 md:p-6 border-t border-gray-200 dark:border-white/10">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Assign.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() }, 
        { title: 'Asignar Directores', href: '#' }
    ],
};