// resources/js/components/Notifications.tsx

import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Bell, X, CheckCircle, AlertCircle, Info, AlertTriangle, Check, Trash2 } from 'lucide-react';

interface Notification {
    id: number;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
    type_icon: string;
    type_color: string;
}

interface NotificationsProps {
    notifications: Notification[];
    unreadCount: number;
}

export default function Notifications({ notifications, unreadCount }: NotificationsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState<Notification[]>(notifications);
    const [count, setCount] = useState(unreadCount);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setItems(notifications);
        setCount(unreadCount);
    }, [notifications, unreadCount]);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const panelWidth = 384;
            const panelHeight = 400;
            const spaceAbove = rect.top;
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceRight = window.innerWidth - rect.right;
            const spaceLeft = rect.left;
            
            let leftPosition = 0;
            if (spaceRight > panelWidth) {
                leftPosition = rect.right + 8;
            } else if (spaceLeft > panelWidth) {
                leftPosition = rect.left - panelWidth - 8;
            } else {
                leftPosition = Math.max(8, window.innerWidth - panelWidth - 8);
            }
            
            let topPosition = 0;
            if (spaceBelow > panelHeight || spaceBelow > spaceAbove) {
                topPosition = rect.top;
            } else {
                topPosition = rect.bottom - panelHeight;
            }
            
            topPosition = Math.max(8, Math.min(window.innerHeight - panelHeight - 8, topPosition));
            
            setPosition({
                top: topPosition,
                left: leftPosition,
            });
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node) && 
                buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getTypeIcon = (type: string) => {
        const icons = {
            info: <Info className="w-5 h-5 text-blue-500" />,
            success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
            error: <AlertCircle className="w-5 h-5 text-rose-500" />,
        };
        return icons[type as keyof typeof icons] || icons.info;
    };

    const markAsRead = (id: number) => {
        router.post(`/notificaciones/${id}/leer`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setItems(items.map(item => 
                    item.id === id ? { ...item, is_read: true } : item
                ));
                setCount(prev => Math.max(0, prev - 1));
            }
        });
    };

    const markAllAsRead = () => {
        if (count === 0) return;

        router.post('/notificaciones/leer-todas', {}, {
            preserveScroll: true,
            onSuccess: () => {
                setItems(items.map(item => ({ ...item, is_read: true })));
                setCount(0);
            }
        });
    };

    // ✅ ELIMINAR UNA NOTIFICACIÓN CON router.visit
    const deleteNotification = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        
        router.visit(`/notificaciones/${id}`, {
            method: 'delete',
            preserveScroll: true,
            onSuccess: () => {
                setItems(items.filter(item => item.id !== id));
                const deletedItem = items.find(item => item.id === id);
                if (deletedItem && !deletedItem.is_read) {
                    setCount(prev => Math.max(0, prev - 1));
                }
            },
            onError: (errors) => {
                console.error('Error al eliminar notificación:', errors);
                alert('Error al eliminar la notificación.');
            }
        });
    };

    // ✅ ELIMINAR TODAS LAS NOTIFICACIONES CON router.visit
    const deleteAllNotifications = () => {
        if (items.length === 0) return;
        if (!confirm('¿Eliminar todas las notificaciones?')) return;

        router.visit('/notificaciones/eliminar-todas', {
            method: 'delete',
            preserveScroll: true,
            onSuccess: () => {
                setItems([]);
                setCount(0);
                router.reload();
            },
            onError: (errors) => {
                console.error('Error al eliminar notificaciones:', errors);
                alert('Error al eliminar las notificaciones.');
            }
        });
    };

    // ✅ MANEJO DE CLIC EN NOTIFICACIÓN
    const handleNotificationClick = (notification: Notification) => {
        if (isLoading) return;
        
        if (notification.is_read) {
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        
        router.post(`/notificaciones/${notification.id}/leer`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setItems(items.map(item => 
                    item.id === notification.id ? { ...item, is_read: true } : item
                ));
                setCount(prev => Math.max(0, prev - 1));
                
                if (notification.link) {
                    router.get(notification.link);
                }
                setIsOpen(false);
                setIsLoading(false);
            },
            onError: () => {
                setIsLoading(false);
            }
        });
    };

    return (
        <div className="relative inline-block">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
                <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                {count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {count > 9 ? '9+' : count}
                    </span>
                )}
            </button>

            {isOpen && (
                <div 
                    ref={panelRef}
                    className="fixed w-80 sm:w-96 max-h-[450px] overflow-hidden bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 z-[99999]"
                    style={{ 
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                        animation: 'slideIn 0.15s ease-out',
                    }}
                >
                    <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
                        <h3 className="font-bold text-neutral-800 dark:text-white flex items-center gap-2">
                            Notificaciones
                            {items.length > 0 && (
                                <span className="text-xs bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 px-2 py-0.5 rounded-full">
                                    {items.length}
                                </span>
                            )}
                        </h3>
                        <div className="flex items-center gap-1">
                            {count > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 px-2 py-1 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                                    title="Marcar todas como leídas"
                                >
                                    <Check className="w-3 h-3" />
                                    Leer todas
                                </button>
                            )}
                           
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 text-neutral-500" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-[350px]">
                        {items.length === 0 ? (
                            <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                                <Bell className="w-12 h-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
                                <p>No tienes notificaciones</p>
                            </div>
                        ) : (
                            items.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`group p-4 border-b border-neutral-100 dark:border-neutral-800 transition-colors cursor-pointer ${
                                        !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50 dark:hover:bg-blue-950/40' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                                    }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {getTypeIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-neutral-800 dark:text-white">
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                                                {new Date(notification.created_at).toLocaleString('es-ES')}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0 flex items-start gap-1">
                                            {!notification.is_read && (
                                                <span className="w-2 h-2 bg-blue-500 rounded-full inline-block mt-1.5"></span>
                                            )}
                                            <button
                                                onClick={(e) => deleteNotification(notification.id, e)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-all text-neutral-400 hover:text-rose-500"
                                                title="Eliminar"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-8px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                    }
                }
            `}</style>
        </div>
    );
}