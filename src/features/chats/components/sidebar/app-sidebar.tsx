import * as React from 'react';
import { Icon, IconProps, IconRobot } from '@tabler/icons-react';

import { NavMain } from '@/features/chats/components/sidebar/nav-main';
import { NavUser } from '@/features/chats/components/sidebar/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/components/ui/sidebar';

import { Link } from 'react-router-dom';

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: UserType;
  navMainItems: NavItem[];
  onDeleteItem: (id: string) => void;
  onRenameItem: (id: string, title: string) => void;
  onDeleteAll?: () => void;
  onSignOut: () => void;
};

type UserType = {
  email: string;
  displayName?: string | null;
  avatar: string;
};

type NavItem = {
  id: string;
  title: string;
  date: string;
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
};

export function AppSidebar({
  user,
  navMainItems,
  onDeleteItem,
  onRenameItem,
  onDeleteAll,
  onSignOut,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/dashboard">
                <IconRobot className="!size-5" />
                <span className="text-base font-semibold tracking-wide">
                  Назад к панели
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={navMainItems}
          onClick={onDeleteItem}
          onRename={onRenameItem}
          onDeleteAll={onDeleteAll}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onSignOut={onSignOut} />
      </SidebarFooter>
    </Sidebar>
  );
}
