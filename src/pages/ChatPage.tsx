import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

const ChatPage = () => {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col justify-center items-center gap-4 p-4 md:gap-6 md:p-6">
              <div>
                user: Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                Dolorem nesciunt amet quis dolores labore!
              </div>
              <div>
                bot: Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                Dolorem nesciunt amet quis dolores labore!
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ChatPage;
