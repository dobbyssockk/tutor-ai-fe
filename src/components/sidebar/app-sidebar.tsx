import * as React from 'react';
import { IconMessages, IconRobot } from '@tabler/icons-react';

import { NavMain } from '@/components/sidebar/nav-main';
import { NavUser } from '@/components/sidebar/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { Link } from 'react-router-dom';
import useConversations from '@/hooks/useConversations';
import { Conversation } from '@/context/ConversationsContext';
import useAuthStore from '@/modules/auth/store';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user);
  const { conversations, removeConversation } = useConversations();

  const mappedData = (arr: Conversation[]) => {
    const data = arr.map((item) => {
      const date = new Date(item.updated_at);
      const formattedDate = `${date.getDate()}.${
        date.getMonth() + 1
      }.${date.getFullYear()}`;

      return {
        id: item.id,
        date: formattedDate,
        timestamp: date.getTime(),
        title: item.title,
        icon: IconMessages,
      };
    });

    const sortedData = data.sort((a, b) => b.timestamp - a.timestamp);

    return sortedData;
  };

  const data = {
    user: {
      email: user?.email || '-',
      username: user?.username || '-',
      avatar: '/avatars/shadcn.jpg',
    },
    navMain: mappedData(conversations),
  };

  const handleDelete = (id: string) => {
    removeConversation(id);
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
              <Link to="/chat">
                <IconRobot className="!size-5" />
                <span className="text-base font-semibold tracking-wide">
                  Tutor AI
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} onClick={handleDelete} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
