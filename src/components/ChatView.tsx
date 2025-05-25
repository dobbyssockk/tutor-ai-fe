import { useState } from 'react';
import { useParams } from 'react-router-dom';

import Error from './Error';
import Loader from './Loader';
import MarkdownRenderer from './MarkdownRenderer';

import { useGetChat } from '@/modules/chats/hooks/useChat';
import { useSendMessage } from '@/modules/chats/hooks/useChat';

import ChatInput from '@/components/ChatInput';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from '@/components/ui/chat/chat-bubble';
import { ChatMessageList } from '@/components/ui/chat/chat-message-list';

const ChatView = () => {
  const [text, setText] = useState(''); // for input
  const { id: chatId } = useParams();

  const {
    data: chatData,
    isLoading: isChatLoading,
    isError,
  } = useGetChat(chatId);
  const { mutate, isPending } = useSendMessage(chatId!);

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
    <>
      <div>
        <ChatMessageList
          className="pb-40 max-w-4xl mx-auto"
          childPadding={'py-5'}
        >
          {chatData.chat.messages.length === 1 ? (
            <>
              <ChatBubble variant="sent">
                <ChatBubbleAvatar fallback="US" />
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
              return (
                <ChatBubble key={id} variant={variant}>
                  <ChatBubbleAvatar fallback={isUser ? 'US' : 'AI'} />
                  <ChatBubbleMessage variant={variant}>
                    {isUser ? (
                      outputText
                    ) : (
                      <MarkdownRenderer text={outputText} />
                    )}
                  </ChatBubbleMessage>
                </ChatBubble>
              );
            })
          )}

          {isPending ? (
            <ChatBubble key="loading" variant="received">
              <ChatBubbleAvatar fallback="AI" />
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
    </>
  );
};

export default ChatView;
