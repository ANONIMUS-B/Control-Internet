import { Link, usePage } from '@inertiajs/react';
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
} from 'lucide-react';
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
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import { useState } from 'react';

interface MenuItem {
    title: string;
    icon?: any;
    href?: string;
    items?: MenuItem[];
    isSection?: boolean;
}

export function AppSidebar() {
    const { props } = usePage();
    const user = props.auth?.user;
    const userRole = user?.role || 'director';
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    // ✅ Estado para submenús abiertos
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        'Gestión': true,
        'Instituciones': true,
        
    });

    const toggleSection = (title: string) => {
        if (isCollapsed) return; // No permitir toggle en modo colapsado
        setOpenSections(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    // ✅ Definir los items según el rol con estructura de menú
    const getMenuItems = (role: string): MenuItem[] => {
        const baseItems: MenuItem[] = [
            {
                title: 'Dashboard',
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

        if (role === 'super_admin') {
            return [
                ...baseItems,
                {
                    title: 'Panel UPDI',
                    href: '/updi/dashboard',
                    icon: ShieldCheck,
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
            const isOpen = openSections[item.title] || false;
            const Icon = item.icon;

            // ✅ En modo colapsado, mostrar solo el icono
            if (isCollapsed) {
                return (
                    <div key={item.title} className="relative group">
                        <Link
                            href={item.items[0]?.href || '#'}
                            className="flex items-center justify-center rounded-lg px-2 py-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-100 transition-colors"
                            title={item.title}
                        >
                            {Icon && <Icon className="h-5 w-5" />}
                        </Link>
                        {/* Tooltip al hacer hover */}
                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover:block">
                            <div className="bg-neutral-800 text-white text-[11px] px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                                {item.title}
                            </div>
                        </div>
                    </div>
                );
            }

            // ✅ Modo expandido
            return (
                <div key={item.title} className="mb-1">
                    <button
                        onClick={() => toggleSection(item.title)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[11px] font-medium text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            {Icon && <Icon className="h-4 w-4" />}
                            <span>{item.title}</span>
                        </div>
                        {isOpen ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                        )}
                    </button>
                    
                    {isOpen && (
                        <div className="ml-2 mt-0.5 space-y-0.5 border-l-2 border-neutral-200/60 pl-3 dark:border-neutral-700/60">
                            {item.items.map((subItem) => {
                                const SubIcon = subItem.icon;
                                return (
                                    <Link
                                        key={subItem.title}
                                        href={subItem.href || '#'}
                                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-100 transition-colors"
                                    >
                                        {SubIcon && <SubIcon className="h-3.5 w-3.5" />}
                                        <span>{subItem.title}</span>
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
        
        if (isCollapsed) {
            return (
                <Link
                    key={item.title}
                    href={item.href || '#'}
                    className="flex items-center justify-center rounded-lg px-2 py-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-100 transition-colors relative group"
                    title={item.title}
                >
                    {Icon && <Icon className="h-5 w-5" />}
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover:block">
                        <div className="bg-neutral-800 text-white text-[11px] px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                            {item.title}
                        </div>
                    </div>
                </Link>
            );
        }

        return (
            <Link
                key={item.title}
                href={item.href || '#'}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-100 transition-colors"
            >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item.title}</span>
            </Link>
        );
    };

    return (
        <Sidebar collapsible="icon" variant="inset" className="text-[11px]">
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

            <SidebarContent className={`px-2 py-2 text-[11px] ${isCollapsed ? 'items-center' : ''}`}>
                <nav className={`space-y-1 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
                    {menuItems.map((item) => renderMenuItem(item))}
                </nav>
            </SidebarContent>

            <SidebarFooter className="text-[11px]">
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}