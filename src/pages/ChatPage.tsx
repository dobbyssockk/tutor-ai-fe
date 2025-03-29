import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from '@/components/ui/chat/chat-bubble';
import { ChatMessageList } from '@/components/ui/chat/chat-message-list';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ChatInput } from '@/components/ui/chat/chat-input';
import { CornerDownLeft } from 'lucide-react';

const ChatPage = () => {
  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <AppSidebar variant="inset" />
      <SidebarInset className="relative flex flex-col h-screen overflow-hidden">
        <SiteHeader />
        <div className="@container/main w-full flex-1 overflow-y-auto">
          <div>
            <ChatMessageList
              className="pb-40 max-w-4xl mx-auto"
              childPadding={'py-5'}
            >
              <ChatBubble variant="sent">
                <ChatBubbleAvatar fallback="US" />
                <ChatBubbleMessage variant="sent">
                  What's the best way to memorize vocabulary for a foreign
                  language?
                </ChatBubbleMessage>
              </ChatBubble>

              <ChatBubble variant="received">
                <ChatBubbleAvatar fallback="AI" />
                <ChatBubbleMessage variant="received">
                  A great way to memorize vocabulary is by using spaced
                  repetition systems like flashcards, practicing in context, and
                  engaging with the language daily through reading or speaking.
                </ChatBubbleMessage>
              </ChatBubble>

              <ChatBubble variant="received">
                <ChatBubbleAvatar fallback="AI" />
                <ChatBubbleMessage isLoading />
              </ChatBubble>
            </ChatMessageList>
          </div>

          <div className="absolute bottom-12 left-[50%] -translate-x-[50%]  w-4xl rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1">
            <ChatInput
              placeholder="Type your message here..."
              className="min-h-14 resize-none rounded-lg !bg-transparent border-0 p-3 shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center p-3 pt-2">
              <Button size="sm" className="ml-auto gap-1.5">
                Send Message
                <CornerDownLeft className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ChatPage;
