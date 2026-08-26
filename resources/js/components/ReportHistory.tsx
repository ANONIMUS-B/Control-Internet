import React from 'react';
import { Clock, CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';

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

interface ReportHistoryProps {
    history: HistoryItem[];
}

export default function ReportHistory({ history }: ReportHistoryProps) {
    if (!history || history.length === 0) {
        return (
            <div className="text-center text-sm text-gray-500 dark:text-neutral-400 py-4">
                No hay historial de cambios
            </div>
        );
    }

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'approved':
                return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'observed':
                return <AlertCircle className="w-4 h-4 text-amber-500" />;
            case 'rejected':
                return <XCircle className="w-4 h-4 text-rose-500" />;
            case 'created':
                return <Info className="w-4 h-4 text-blue-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getActionColor = (color: string) => {
        const colors: Record<string, string> = {
            blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
            green: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
            amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
            rose: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800',
            gray: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700',
        };
        return colors[color] || colors.gray;
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="space-y-3">
            {history.map((item) => {
                const actionColor = getActionColor(item.action_color);
                const hasChanges = item.changes && Object.keys(item.changes).length > 0;

                return (
                    <div
                        key={item.id}
                        className={`p-3 rounded-xl border ${actionColor}`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                                {getActionIcon(item.action)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium">
                                        {item.action_label || item.action}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-neutral-400">
                                        por {item.user?.name || 'Sistema'}
                                    </span>
                                    <span className="text-xs text-gray-400 dark:text-neutral-500">
                                        {formatDate(item.created_at)}
                                    </span>
                                </div>

                                {item.comment && (
                                    <p className="text-sm text-gray-600 dark:text-neutral-300 mt-1">
                                        {item.comment}
                                    </p>
                                )}

                                {hasChanges && (
                                    <div className="mt-2 space-y-1 text-xs">
                                        {Object.entries(item.changes || {}).map(([key, value]) => {
                                            // ✅ Verificar que value existe y tiene old y new
                                            if (!value || typeof value !== 'object') return null;
                                            
                                            const oldValue = value.old ?? 'N/A';
                                            const newValue = value.new ?? 'N/A';
                                            
                                            return (
                                                <div key={key} className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-600 dark:text-neutral-400">
                                                        {key.replace(/_/g, ' ')}:
                                                    </span>
                                                    <span className="text-gray-500 dark:text-neutral-500 line-through">
                                                        {typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue)}
                                                    </span>
                                                    <span className="text-gray-400 dark:text-neutral-600">→</span>
                                                    <span className="text-gray-700 dark:text-neutral-300 font-medium">
                                                        {typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}