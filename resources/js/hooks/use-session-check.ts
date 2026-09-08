// resources/js/hooks/use-session-check.ts
import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export function useSessionCheck() {
    const { props } = usePage();
    const user = props.auth?.user;

    useEffect(() => {
        // ✅ Verificar si hay error de sesión
        const checkSessionError = () => {
            if (user && document.body.innerHTML.trim() === '') {
                console.log('🔄 Página en blanco detectada, recargando...');
                window.location.reload();
            }
        };

        // ✅ Escuchar errores de carga
        const handleError = (e: ErrorEvent) => {
            if (e.message?.includes('session') || 
                e.message?.includes('csrf') || 
                e.message?.includes('token') ||
                e.message?.includes('startTime')) {
                console.log('🔄 Error de sesión detectado, recargando...');
                window.location.reload();
            }
        };

        // ✅ Escuchar errores de Inertia
        const handleInertiaError = (e: CustomEvent) => {
            if (e.detail?.response?.status === 419) {
                console.log('🔄 CSRF token mismatch, recargando...');
                window.location.reload();
            }
        };

        const timeoutId = setTimeout(checkSessionError, 500);

        window.addEventListener('error', handleError);
        window.addEventListener('inertia:error', handleInertiaError as EventListener);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('error', handleError);
            window.removeEventListener('inertia:error', handleInertiaError as EventListener);
        };
    }, [user]);
}