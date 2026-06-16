import { Outlet, useLocation, useParams } from 'react-router-dom';

import SidebarContainer from '@/features/chats/components/SidebarContainer';
import { SiteHeader } from '@/features/chats/components/sidebar/site-header';
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';
import { useGetChat } from '@/features/chats/hooks/useChat';

const ChatPage = () => {
  const location = useLocation();
  const { id: chatId } = useParams();
  const { data } = useGetChat(chatId);

  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <SidebarContainer variant="inset" />

      <SidebarInset className="relative flex flex-col h-screen overflow-hidden">
        <SiteHeader title={data?.chat.title || 'Чат'} />

        <div className="@container/main w-full flex-1 min-h-0 overflow-hidden">
          {/* <NoChatSelected /> or <ChatView /> if chat selected */}
          <Outlet key={location.pathname} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ChatPage;
