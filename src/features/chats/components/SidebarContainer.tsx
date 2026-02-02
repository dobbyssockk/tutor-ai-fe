import { useMemo } from 'react';
import { IconMessages } from '@tabler/icons-react';

import { AppSidebar } from './sidebar/app-sidebar';
import useAuthStore from '@/features/auth/store';
import { useDeleteAllChats, useDeleteChat, useGetChats } from '@/features/chats/hooks/useChats';

const SidebarContainer = ({
  variant,
}: {
  variant: 'sidebar' | 'floating' | 'inset' | undefined;
}) => {
  const { user, signOut } = useAuthStore();
  const { data } = useGetChats();
  const { mutate } = useDeleteChat();
  const { mutate: deleteAllChats } = useDeleteAllChats();

  const navMainItems = useMemo(() => {
    if (!data?.chats) return [];
    return data.chats.map((chat) => ({
      id: chat.id,
      title: chat.title,
      date: new Date(chat.updatedAt).toLocaleDateString('ru-RU'),
      icon: IconMessages,
    }));
  }, [data]);

  const handleDelete = (id: string) => mutate(id);
  const hasChats = (data?.chats?.length ?? 0) > 0;

  const sidebarData = {
    user: {
      email: user?.email ?? '-',
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
      onDeleteAll={hasChats ? deleteAllChats : undefined}
      onSignOut={signOut}
    />
  );
};

export default SidebarContainer;
