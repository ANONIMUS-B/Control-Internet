// resources/js/layouts/app-layout.tsx
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';
import { useSessionCheck } from '@/hooks/use-session-check'; // ✅ Importar el hook

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    // ✅ Usar el hook de verificación de sesión
    useSessionCheck();

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
        </AppLayoutTemplate>
    );
}