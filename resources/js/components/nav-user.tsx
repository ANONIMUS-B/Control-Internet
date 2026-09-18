import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';
import Notifications from './Notifications';

export function NavUser() {
    const { auth, notifications, unreadCount } = usePage().props as any;
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    const isCollapsed = state === 'collapsed';

    if (!auth?.user) {
        return null;
    }

    return (
        <div className={`flex ${isCollapsed ? 'flex-col items-center justify-center gap-2 w-full' : 'items-center gap-2 w-full'}`}>
            {/* NOTIFICACIONES */}
            <div className={isCollapsed ? 'flex justify-center w-full' : ''}>
                <Notifications 
                    notifications={notifications || []}
                    unreadCount={unreadCount || 0}
                />
            </div>

            {/* MENÚ DE USUARIO */}
            <SidebarMenu className={isCollapsed ? 'w-auto' : 'flex-1'}>
                <SidebarMenuItem className={isCollapsed ? 'flex justify-center' : ''}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center"
                                data-test="sidebar-menu-button"
                            >
                                <UserInfo user={auth.user} />
                                <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-56 rounded-lg"
                            align={isCollapsed ? 'center' : 'end'}
                            side={
                                isMobile
                                    ? 'bottom'
                                    : isCollapsed
                                      ? 'right'
                                      : 'top'
                            }
                            sideOffset={8}
                        >
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </div>
    );
}