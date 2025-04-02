import * as React from 'react';
import { IconMessages, IconRobot } from '@tabler/icons-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import chatsData from '../chatsData.json';
import useAuth from '@/hooks/useAuth';

const { conversations } = chatsData;

const mappedData = (arr) =>
  arr.map((item) => ({
    title: item.title,
    url: '#',
    icon: IconMessages,
  }));

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  const data = {
    user: {
      name: user.name,
      email: user.email,
      avatar: '/avatars/shadcn.jpg',
    },
    navMain: mappedData(conversations),
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconRobot className="!size-5" />
                <span className="text-base font-semibold tracking-wide">
                  Tutor AI
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
