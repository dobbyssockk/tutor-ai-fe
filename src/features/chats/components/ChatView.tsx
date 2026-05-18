import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import Error from '@/shared/components/Error';
import Loader from '@/shared/components/Loader';

import { useGetChat, useSendMessage } from '@/features/chats/hooks/useChat';

import ChatInput from '@/features/chats/components/ChatInput';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from './chat/chat-bubble';
import { ChatMessageList } from './chat/chat-message-list';
import ChatMessage from './chat/ChatMessage';
import { copyToClipboard, getCopyableMessageText } from './chat/clipboard-utils';

const ChatView = () => {
  const [text, setText] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [scrollKey, setScrollKey] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { id: chatId } = useParams();

  const { data: chatData, isLoading: isChatLoading, isError } = useGetChat(chatId);
  const { mutate, isPending } = useSendMessage(chatId!);

  useEffect(() => {
    setScrollKey((prev) => prev + 1);
  }, [chatId]);

  if (isChatLoading) return <Loader />;
  if (isError) return <Error />;
  if (!chatData?.chat.messages) return <Loader />;

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

  const handleSuggestionSelect = (prompt: string) => {
    setText(prompt);
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(prompt.length, prompt.length);
    });
  };

  const handleCopyMessage = async (id: string, outputText: string) => {
    try {
      const copyableText = getCopyableMessageText(outputText);
      if (!copyableText) {
        toast.error('В сообщении нет текста для копирования');
        return;
      }
      await copyToClipboard(copyableText);
      setCopiedMessageId(id);
      window.setTimeout(() => {
        setCopiedMessageId((currentId) => (currentId === id ? null : currentId));
      }, 1200);
    } catch {
      toast.error('Не удалось скопировать сообщение');
    }
  };

  const messages = chatData.chat.messages;
  const isInitializing = messages.length === 1;

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex-1 min-h-0">
        <ChatMessageList
          className="pb-40 max-w-4xl mx-auto"
          childPadding="py-5"
          forceScrollOnChange
          scrollKey={`${chatId}-${scrollKey}-${messages.length}-${isPending}`}
        >
          {isInitializing ? (
            <>
              <ChatBubble variant="sent">
                <ChatBubbleAvatar fallback="Я" />
                <ChatBubbleMessage variant="sent">
                  {messages[0].outputText}
                </ChatBubbleMessage>
              </ChatBubble>
              <div className="flex space-x-4 items-end">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-12 w-[250px]" />
              </div>
            </>
          ) : (
            messages.map(({ id, role, outputText }) => (
              <ChatMessage
                key={id}
                id={id}
                role={role}
                outputText={outputText}
                copiedMessageId={copiedMessageId}
                isPending={isPending}
                onCopy={handleCopyMessage}
                onSuggestionSelect={handleSuggestionSelect}
              />
            ))
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
        ref={inputRef}
        loading={isPending || isInitializing}
        disabled={isPending || isInitializing}
        value={text}
        onClick={handleSend}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e)}
      />
    </div>
  );
};

export default ChatView;
