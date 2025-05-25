import { useMemo } from 'react';
import { IconMessages } from '@tabler/icons-react';

import { AppSidebar } from './sidebar/app-sidebar';
import useAuthStore from '@/modules/auth/store';
import { useDeleteChat, useGetChats } from '@/modules/chats/hooks/useChats';

const SidebarContainer = ({
  variant,
}: {
  variant: 'sidebar' | 'floating' | 'inset' | undefined;
}) => {
  const { user, logout } = useAuthStore();
  const { data } = useGetChats();
  const { mutate } = useDeleteChat();

  const navMainItems = useMemo(() => {
    if (!data?.chats) return [];
    return data.chats.map((chat) => ({
      id: chat.id,
      title: chat.title,
      date: new Date(chat.updatedAt).toLocaleDateString(),
      icon: IconMessages,
    }));
  }, [data]);

  const handleDelete = (id: string) => mutate(id);

  const sidebarData = {
    user: {
      email: user?.email ?? '-',
      username: user?.username ?? '-',
      avatar: '/avatars/shadcn.jpg',
    },
    navMainItems,
  };

  return (
    <AppSidebar
      variant={variant}
      user={sidebarData.user}
      navMainItems={sidebarData.navMainItems}
      onDeleteItem={handleDelete}
      onLogout={logout}
    />
  );
};

export default SidebarContainer;
