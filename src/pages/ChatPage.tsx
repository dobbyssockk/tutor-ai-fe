import { useEffect, useState } from 'react';
import useGenerateResponseGPT from '@/hooks/useGenerateResponseGPT';

// shadcn
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from '@/components/ui/chat/chat-bubble';
import { ChatMessageList } from '@/components/ui/chat/chat-message-list';
import { ChatInput } from '@/components/ui/chat/chat-input';

// icons
import { CornerDownLeft } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const ChatPage = () => {
  const [text, setText] = useState('');
  const { messages, setMessages, loading, generateGPT } =
    useGenerateResponseGPT();

  useEffect(() => {
    const savedMessages = localStorage.getItem('messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []); // only on the first render

  const handleClick = () => {
    generateGPT(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleClick();
      setText('');
    }
  };

  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <AppSidebar variant="inset" />

      <SidebarInset className="relative flex flex-col h-screen overflow-hidden">
        <SiteHeader title="Algebra" />

        <div className="@container/main w-full flex-1 overflow-y-auto">
          <div>
            <ChatMessageList
              className="pb-40 max-w-4xl mx-auto"
              childPadding={'py-5'}
            >
              {messages &&
                messages.map(({ role, output_text }) => {
                  if (role === 'user') {
                    return (
                      <ChatBubble variant="sent">
                        <ChatBubbleAvatar fallback="US" />
                        <ChatBubbleMessage variant="sent">
                          {output_text}
                        </ChatBubbleMessage>
                      </ChatBubble>
                    );
                  }

                  if (role === 'assistant') {
                    return (
                      <ChatBubble variant="received">
                        <ChatBubbleAvatar fallback="AI" />
                        <ChatBubbleMessage variant="received">
                          {output_text}
                        </ChatBubbleMessage>
                      </ChatBubble>
                    );
                  }
                })}

              {loading ? (
                <ChatBubble variant="received">
                  <ChatBubbleAvatar fallback="AI" />
                  <ChatBubbleMessage isLoading />
                </ChatBubble>
              ) : null}
            </ChatMessageList>
          </div>

          <div className="absolute bottom-8 left-[50%] -translate-x-[50%]  w-4xl rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1">
            <ChatInput
              disabled={loading}
              value={text}
              placeholder="Type your message here..."
              className="min-h-14 resize-none rounded-lg !bg-transparent border-0 p-3 shadow-none focus-visible:ring-0"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e)}
            />

            <div className="flex items-center p-3 pt-2">
              {loading ? (
                <Button size="sm" className="ml-auto gap-1.5" disabled>
                  Getting response
                  <Loader2 className="animate-spin" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="ml-auto gap-1.5"
                  onClick={handleClick}
                >
                  Send message
                  <CornerDownLeft className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ChatPage;
