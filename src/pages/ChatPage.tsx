import { Outlet, useParams } from 'react-router-dom';
import useConversation from '@/hooks/useConversation';

// shadcn
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SiteHeader } from '@/components/sidebar/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

const ChatPage = () => {
  const { id } = useParams();
  const { conversation } = useConversation(id);

  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <AppSidebar variant="inset" />

      <SidebarInset className="relative flex flex-col h-screen overflow-hidden">
        <SiteHeader title={conversation?.title || 'Chat'} />

        <div className="@container/main w-full flex-1 overflow-y-auto">
          {/* <NoChatSelected /> or <ChatView /> if chat selected */}
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ChatPage;
