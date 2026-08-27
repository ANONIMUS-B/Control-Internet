import { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';

interface Equipment {
    id: number;
    local_code: string;
    institution_name: string;
    level: string;
    description: string;
    brand: string;
    model: string;
    mac_address: string;
    status: string;
}

interface EditEquipmentModalProps {
    equipmentId: number;
    onClose: () => void;
}

export default function EditEquipmentModal({ equipmentId, onClose }: EditEquipmentModalProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [equipment, setEquipment] = useState<Equipment | null>(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        local_code: '',
        institution_name: '',
        level: '',
        description: '',
        brand: '',
        model: '',
        mac_address: '',
        status: 'OPERATIVO',
    });

    // ✅ Cargar los datos del equipo
    useEffect(() => {
        const fetchEquipment = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await fetch(`/equipos-red/${equipmentId}`);
                
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                
                const result = await response.json();
                
                if (result.success && result.data) {
                    const eq = result.data;
                    setEquipment(eq);
                    setData({
                        local_code: eq.local_code || '',
                        institution_name: eq.institution_name || '',
                        level: eq.level || '',
                        description: eq.description || '',
                        brand: eq.brand || '',
                        model: eq.model || '',
                        mac_address: eq.mac_address || '',
                        status: eq.status || 'OPERATIVO',
                    });
                } else {
                    setError('No se pudieron cargar los datos del equipo.');
                }
            } catch (error) {
                console.error('Error al cargar el equipo:', error);
                setError('Error al cargar los datos. Intenta nuevamente.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchEquipment();
    }, [equipmentId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        put(`/equipos-red/${equipmentId}`, {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                router.reload();
            },
            onError: (errors) => {
                console.error('Errores de validación:', errors);
            }
        });
    };

    const inputClass = "w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 px-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-500";
    const labelClass = "block text-[11px] font-semibold text-gray-700 dark:text-neutral-300 mb-1.5";

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-white/10">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                    <p className="text-center text-[11px] text-gray-500 dark:text-neutral-400 mt-2">Cargando equipo...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-white/10 max-w-md w-full">
                    <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-4">
                        <AlertCircle className="w-6 h-6" />
                        <h3 className="text-[11px] font-bold">Error</h3>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-neutral-300 mb-4">{error}</p>
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-medium transition-all"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <form onSubmit={handleSubmit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-white/10">
                    <h2 className="text-[11px] font-bold text-gray-900 dark:text-white">
                        Editar Equipo de Red
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-500 dark:text-neutral-400" />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>Código Local</label>
                        <input
                            className={inputClass}
                            value={data.local_code}
                            onChange={(e) => setData('local_code', e.target.value)}
                            placeholder="Código local"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Institución</label>
                        <input
                            className={inputClass}
                            value={data.institution_name}
                            onChange={(e) => setData('institution_name', e.target.value)}
                            placeholder="Nombre de la institución"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Nivel</label>
                        <input
                            className={inputClass}
                            value={data.level}
                            onChange={(e) => setData('level', e.target.value)}
                            placeholder="Nivel educativo"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Estado</label>
                        <select
                            className={inputClass}
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                        >
                            <option value="OPERATIVO">OPERATIVO</option>
                            <option value="INOPERATIVO">INOPERATIVO</option>
                            <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className={labelClass}>Descripción <span className="text-rose-500">*</span></label>
                        <input
                            className={inputClass}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Descripción del equipo"
                        />
                        {errors.description && (
                            <p className="mt-1 text-[11px] text-rose-500">{errors.description}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>Marca <span className="text-rose-500">*</span></label>
                        <input
                            className={inputClass}
                            value={data.brand}
                            onChange={(e) => setData('brand', e.target.value)}
                            placeholder="Marca del equipo"
                        />
                        {errors.brand && (
                            <p className="mt-1 text-[11px] text-rose-500">{errors.brand}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>Modelo <span className="text-rose-500">*</span></label>
                        <input
                            className={inputClass}
                            value={data.model}
                            onChange={(e) => setData('model', e.target.value)}
                            placeholder="Modelo del equipo"
                        />
                        {errors.model && (
                            <p className="mt-1 text-[11px] text-rose-500">{errors.model}</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className={labelClass}>MAC Address</label>
                        <input
                            className={inputClass}
                            value={data.mac_address}
                            onChange={(e) => setData('mac_address', e.target.value)}
                            placeholder="Dirección MAC"
                        />
                        {errors.mac_address && (
                            <p className="mt-1 text-[11px] text-rose-500">{errors.mac_address}</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-gray-200 dark:border-white/10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-neutral-300 rounded-xl text-[11px] font-medium transition-all border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl text-[11px] font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {processing ? (
                            <><Loader2 className="w-4 h-4 animate-spin inline mr-1" /> Guardando...</>
                        ) : (
                            <><Save className="w-4 h-4 inline mr-1" /> Guardar Cambios</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}