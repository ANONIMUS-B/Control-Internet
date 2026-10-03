import { Link, usePage } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import {
    FileText,
    ShieldCheck,
    LayoutGrid,
    Building2,
    UserCog,
    FileSignature,
    Users,
    BarChart3,
    Upload,
    CalendarDays,
    Settings2,
    ChevronDown,
    ChevronRight,
    Wifi,
    Youtube,
} from 'lucide-react';
import { useState } from 'react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

interface MenuItem {
    title: string;
    icon?: any;
    href?: NonNullable<InertiaLinkProps['href']> | string;
    items?: MenuItem[];
    isSection?: boolean;
}

export function AppSidebar() {
    const { props } = usePage();
    const user = props.auth?.user;
    const userRole = user?.role || 'director';
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';
    const { isCurrentUrl } = useCurrentUrl();

    // Detectar si alguna ruta de las secciones está activa
    const isGestionActive = [
        '/admin/usuarios',
        '/usuarios/asignar',
        '/admin/usuarios/importar',
    ].some((href) => isCurrentUrl(href));
    const isInstitucionesActive = [
        '/institutions',
        '/institutions/importar',
        '/admin/report-periods',
    ].some((href) => isCurrentUrl(href));

    // ✅ Estado para submenús abiertos (elegante: mantiene abierta la sección relevante)
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        Gestión: isGestionActive || !isInstitucionesActive,
        Instituciones: isInstitucionesActive,
    });

    const toggleSection = (title: string) => {
        if (isCollapsed) {
            return;
        }

        setOpenSections((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    // ✅ Definir los items según el rol con estructura de menú
    const getMenuItems = (role: string): MenuItem[] => {
        // ✅ Items base para todos los usuarios (incluyendo director)
        const baseItems: MenuItem[] = [
            {
                title: 'Panel Principal',
                href: dashboard(),
                icon: LayoutGrid,
            },
            {
                title: 'Reportes Mensuales',
                href: '/reportes',
                icon: FileText,
            },
            {
                title: 'Mi Firma Digital',
                href: '/firma',
                icon: FileSignature,
            },
        ];

        // ✅ DIRECTOR - Puede ver sus equipos de red
        if (role === 'director') {
            return [
                ...baseItems,
                {
                    title: 'Equipos de Red',
                    href: '/equipos-red',
                    icon: Wifi,
                },
                {
                    title: 'Tutoriales',
                    href: '/tutoriales',
                    icon: Youtube,
                },
            ];
        }

        if (role === 'super_admin') {
            return [
                ...baseItems,
                {
                    title: 'Panel UPDI',
                    href: '/updi/dashboard',
                    icon: ShieldCheck,
                },
                {
                    title: 'Equipos de Red',
                    href: '/equipos-red',
                    icon: Wifi,
                },
                {
                    title: 'Estadísticas Generales',
                    href: '/admin/estadisticas',
                    icon: BarChart3,
                },
                {
                    title: 'Gestión',
                    icon: Users,
                    isSection: true,
                    items: [
                        {
                            title: 'Gestión de Usuarios',
                            href: '/admin/usuarios',
                            icon: Users,
                        },
                        {
                            title: 'Asignar Directores',
                            href: '/usuarios/asignar',
                            icon: UserCog,
                        },
                        {
                            title: 'Importar Usuarios',
                            href: '/admin/usuarios/importar',
                            icon: Upload,
                        },
                    ],
                },
                {
                    title: 'Instituciones',
                    icon: Building2,
                    isSection: true,
                    items: [
                        {
                            title: 'Instituciones',
                            href: '/institutions',
                            icon: Building2,
                        },
                        {
                            title: 'Importar Instituciones',
                            href: '/institutions/importar',
                            icon: Upload,
                        },
                        {
                            title: 'Períodos por Mes',
                            href: '/admin/report-periods',
                            icon: CalendarDays,
                        },
                    ],
                },
                {
                    title: 'Tutoriales',
                    href: '/tutoriales',
                    icon: Youtube,
                },
            ];
        }

        if (role === 'admin') {
            return [
                ...baseItems,
                {
                    title: 'Panel UPDI',
                    href: '/updi/dashboard',
                    icon: ShieldCheck,
                },
                {
                    title: 'Equipos de Red',
                    href: '/equipos-red',
                    icon: Wifi,
                },
                {
                    title: 'Gestión',
                    icon: Users,
                    isSection: true,
                    items: [
                        {
                            title: 'Gestión de Usuarios',
                            href: '/admin/usuarios',
                            icon: Users,
                        },
                        {
                            title: 'Asignar Directores',
                            href: '/usuarios/asignar',
                            icon: UserCog,
                        },
                    ],
                },
                {
                    title: 'Instituciones',
                    icon: Building2,
                    isSection: true,
                    items: [
                        {
                            title: 'Instituciones',
                            href: '/institutions',
                            icon: Building2,
                        },
                    ],
                },
                {
                    title: 'Tutoriales',
                    href: '/tutoriales',
                    icon: Youtube,
                },
            ];
        }

        if (role === 'specialist') {
            return [
                ...baseItems,
                {
                    title: 'Panel UPDI',
                    href: '/updi/dashboard',
                    icon: ShieldCheck,
                },
                {
                    title: 'Asignar Directores',
                    href: '/usuarios/asignar',
                    icon: UserCog,
                },
            ];
        }

        return baseItems;
    };

    const menuItems = getMenuItems(userRole);
    const footerNavItems: NavItem[] = [];

    // ✅ Renderizar items del menú
    const renderMenuItem = (item: MenuItem) => {
        if (item.isSection && item.items) {
            const isOpen = openSections[item.title] ?? false;
            const Icon = item.icon;
            const isChildActive = item.items.some(
                (subItem) => subItem.href && isCurrentUrl(subItem.href),
            );

            // ✅ En modo colapsado, mostrar solo el icono con tooltip
            if (isCollapsed) {
                return (
                    <div
                        key={item.title}
                        className="group relative flex w-full justify-center"
                    >
                        <Link
                            href={item.items[0]?.href || '#'}
                            className={cn(
                                'flex size-9 items-center justify-center rounded-lg transition-colors',
                                isChildActive
                                    ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white'
                                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-100',
                            )}
                            title={item.title}
                        >
                            {Icon && <Icon className="size-4" />}
                        </Link>
                        {/* Tooltip al hacer hover */}
                        <div className="absolute top-1/2 left-full z-50 ml-2 hidden -translate-y-1/2 group-hover:block">
                            <div className="rounded-md border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-xs whitespace-nowrap text-white shadow-lg">
                                {item.title}
                            </div>
                        </div>
                    </div>
                );
            }

            // ✅ Modo expandido - Menú desplegable elegante, suave y natural
            return (
                <div key={item.title} className="w-full">
                    <button
                        type="button"
                        onClick={() => toggleSection(item.title)}
                        className={cn(
                            'group flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-150 select-none',
                            isChildActive
                                ? 'font-semibold text-neutral-900 dark:text-white'
                                : 'text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-100',
                        )}
                    >
                        <div className="flex items-center gap-2.5">
                            {Icon && (
                                <Icon
                                    className={cn(
                                        'size-4 shrink-0 transition-colors',
                                        isChildActive
                                            ? 'text-primary dark:text-blue-400'
                                            : 'text-neutral-500 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-200',
                                    )}
                                />
                            )}
                            <span>{item.title}</span>
                        </div>
                        <ChevronDown
                            className={cn(
                                'size-3.5 shrink-0 text-neutral-400 transition-transform duration-200 dark:text-neutral-500',
                                !isOpen && '-rotate-90',
                            )}
                        />
                    </button>

                    {isOpen && (
                        <div className="relative mt-0.5 mb-1 ml-4 space-y-0.5 border-l border-neutral-200/80 py-0.5 pl-2.5 transition-all dark:border-neutral-800/80">
                            {item.items.map((subItem) => {
                                const SubIcon = subItem.icon;
                                const isActive = subItem.href
                                    ? isCurrentUrl(subItem.href)
                                    : false;

                                return (
                                    <Link
                                        key={subItem.title}
                                        href={subItem.href || '#'}
                                        className={cn(
                                            'group/sub relative flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-all duration-150',
                                            isActive
                                                ? 'bg-neutral-100 font-medium text-neutral-900 shadow-xs dark:bg-neutral-800/80 dark:text-white'
                                                : 'text-neutral-500 hover:bg-neutral-100/60 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/40 dark:hover:text-neutral-100',
                                        )}
                                    >
                                        {/* Indicador activo sutil en el borde izquierdo */}
                                        {isActive && (
                                            <span className="absolute top-1 bottom-1 -left-[11px] w-[2px] rounded-full bg-primary" />
                                        )}
                                        {SubIcon && (
                                            <SubIcon
                                                className={cn(
                                                    'size-3.5 shrink-0 transition-colors',
                                                    isActive
                                                        ? 'text-primary dark:text-blue-400'
                                                        : 'opacity-60 group-hover/sub:opacity-100',
                                                )}
                                            />
                                        )}
                                        <span className="truncate">
                                            {subItem.title}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }

        // ✅ Item normal
        const Icon = item.icon;
        const isActive = item.href ? isCurrentUrl(item.href) : false;

        if (isCollapsed) {
            return (
                <div
                    key={item.title}
                    className="group relative flex w-full justify-center"
                >
                    <Link
                        href={item.href || '#'}
                        className={cn(
                            'flex size-9 items-center justify-center rounded-lg transition-colors',
                            isActive
                                ? 'bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-white'
                                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-100',
                        )}
                        title={item.title}
                    >
                        {Icon && <Icon className="size-4" />}
                    </Link>
                    <div className="absolute top-1/2 left-full z-50 ml-2 hidden -translate-y-1/2 group-hover:block">
                        <div className="rounded-md border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-xs whitespace-nowrap text-white shadow-lg">
                            {item.title}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <Link
                key={item.title}
                href={item.href || '#'}
                className={cn(
                    'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-all duration-150',
                    isActive
                        ? 'bg-neutral-100 font-medium text-neutral-900 shadow-xs dark:bg-neutral-800/80 dark:text-white'
                        : 'text-neutral-600 hover:bg-neutral-100/70 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-100',
                )}
            >
                {Icon && (
                    <Icon
                        className={cn(
                            'size-4 shrink-0 transition-colors',
                            isActive
                                ? 'text-primary dark:text-blue-400'
                                : 'text-neutral-500 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-200',
                        )}
                    />
                )}
                <span className="truncate">{item.title}</span>
            </Link>
        );
    };

    return (
        <Sidebar collapsible="icon" variant="inset" className="text-xs">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent
                className={`px-2 py-2 ${isCollapsed ? 'items-center' : ''}`}
            >
                <nav
                    className={`w-full space-y-1 ${isCollapsed ? 'flex flex-col items-center' : ''}`}
                >
                    {menuItems.map((item) => renderMenuItem(item))}
                </nav>
            </SidebarContent>

            <SidebarFooter className="text-xs">
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
