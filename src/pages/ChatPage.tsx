import { Outlet, useParams } from 'react-router-dom';

import SidebarContainer from '@/components/SidebarContainer';
import { SiteHeader } from '@/components/sidebar/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useGetChat } from '@/modules/chats/hooks/useChat';

const ChatPage = () => {
  const { id: chatId } = useParams();
  const { data } = useGetChat(chatId);

  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <SidebarContainer variant="inset" />

      <SidebarInset className="relative flex flex-col h-screen overflow-hidden">
        <SiteHeader title={data?.chat.title || 'Chat'} />

        <div className="@container/main w-full flex-1 overflow-y-auto">
          {/* <NoChatSelected /> or <ChatView /> if chat selected */}
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ChatPage;
