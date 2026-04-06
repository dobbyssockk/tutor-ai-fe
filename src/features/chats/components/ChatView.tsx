import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Error from '@/shared/components/Error';
import Loader from '@/shared/components/Loader';
import MarkdownRenderer from '@/shared/components/MarkdownRenderer';

import { useGetChat, useSendMessage } from '@/features/chats/hooks/useChat';

import ChatInput from '@/features/chats/components/ChatInput';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from '@/features/chats/components/chat/chat-bubble';
import { ChatMessageList } from '@/features/chats/components/chat/chat-message-list';

const ChatView = () => {
  const [text, setText] = useState(''); // for input
  const { id: chatId } = useParams();

  const {
    data: chatData,
    isLoading: isChatLoading,
    isError,
  } = useGetChat(chatId);
  const { mutate, isPending } = useSendMessage(chatId!);
  const [scrollKey, setScrollKey] = useState(0);

  useEffect(() => {
    setScrollKey((prev) => prev + 1);
  }, [chatId]);

  if (isChatLoading) return <Loader />;
  if (isError) return <Error />;
  if (!chatData?.chat.messages) return <Loader />; // avoid error "'chatData.chat.messages' is possibly 'undefined'"

  const handleSend = () => {
    if (!text.trim()) return;
    mutate(text);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex-1 min-h-0">
        <ChatMessageList
          className="pb-40 max-w-4xl mx-auto"
          childPadding={'py-5'}
          forceScrollOnChange
          scrollKey={`${chatId}-${scrollKey}-${chatData.chat.messages.length}-${isPending}`}
        >
          {chatData.chat.messages.length === 1 ? (
            <>
              <ChatBubble variant="sent">
                <ChatBubbleAvatar fallback="Я" />
                <ChatBubbleMessage variant="sent">
                  {chatData.chat.messages[0].outputText}
                </ChatBubbleMessage>
              </ChatBubble>

              <div className="flex space-x-4 items-end">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-12 w-[250px]" />
              </div>
            </>
          ) : (
            chatData.chat.messages.map(({ id, role, outputText }) => {
              const isUser = role === 'user';
              const variant = isUser ? 'sent' : 'received';
              const hasInteractive =
                !isUser && /```interactive\s*[\s\S]*?```/i.test(outputText);

              return (
                <ChatBubble
                  key={id}
                  variant={variant}
                  className={hasInteractive ? 'max-w-full w-full' : undefined}
                >
                  <ChatBubbleAvatar fallback={isUser ? 'Я' : 'ИИ'} />
                  <ChatBubbleMessage
                    variant={variant}
                    className={hasInteractive ? 'w-full max-w-full bg-transparent p-0' : undefined}
                  >
                    <MarkdownRenderer text={outputText} />
                  </ChatBubbleMessage>
                </ChatBubble>
              );
            })
          )}

          {isPending ? (
            <ChatBubble key="loading" variant="received">
              <ChatBubbleAvatar fallback="ИИ" />
              <ChatBubbleMessage isLoading={isPending} />
            </ChatBubble>
          ) : null}
        </ChatMessageList>
      </div>

      <ChatInput
        loading={isPending || chatData.chat.messages.length === 1}
        disabled={isPending || chatData.chat.messages.length === 1}
        value={text}
        onClick={handleSend} // send message
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e)}
      />
    </div>
  );
};

export default ChatView;
