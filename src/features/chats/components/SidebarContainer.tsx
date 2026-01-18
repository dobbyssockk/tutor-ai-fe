import { useMemo } from 'react';
import { IconMessages } from '@tabler/icons-react';

import { AppSidebar } from './sidebar/app-sidebar';
import useAuthStore from '@/features/auth/store';
import { useDeleteChat, useGetChats } from '@/features/chats/hooks/useChats';

const SidebarContainer = ({
  variant,
}: {
  variant: 'sidebar' | 'floating' | 'inset' | undefined;
}) => {
  const { user, signOut } = useAuthStore();
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
      displayName: user?.displayName ?? null,
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
      onSignOut={signOut}
    />
  );
};

export default SidebarContainer;
