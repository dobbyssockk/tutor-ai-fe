import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import Error from '@/shared/components/Error';
import Loader from '@/shared/components/Loader';

import { useGetChat, useSendMessage } from '@/features/chats/hooks/useChat';

import ChatComposer, { type ChatComposerHandle } from '@/features/chats/components/ChatComposer';
import ChatMessagesPanel from '@/features/chats/components/ChatMessagesPanel';
import { copyToClipboard, getCopyableMessageText } from './chat/clipboard-utils';

const ChatView = () => {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [scrollKey, setScrollKey] = useState(0);
  const scrollListRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<ChatComposerHandle>(null);
  const { id: chatId } = useParams();

  const { data: chatData, isLoading: isChatLoading, isError } = useGetChat(chatId);
  const { mutate, isPending } = useSendMessage(chatId!);

  useEffect(() => {
    setScrollKey((prev) => prev + 1);
    setCopiedMessageId(null);
  }, [chatId]);

  const handleSuggestionSelect = useCallback((prompt: string) => {
    composerRef.current?.applySuggestion(prompt);
  }, []);

  const handleCopyMessage = useCallback(async (id: string, outputText: string) => {
    try {
      const copyableText = getCopyableMessageText(outputText);
      if (!copyableText) {
        toast.error('В сообщении нет текста для копирования');
        return;
      }
      const listEl = scrollListRef.current;
      const scrollTopBefore = listEl?.scrollTop ?? 0;
      await copyToClipboard(copyableText);
      flushSync(() => {
        setCopiedMessageId(id);
      });
      const restore = () => {
        const el = scrollListRef.current;
        if (el) el.scrollTop = scrollTopBefore;
      };
      restore();
      window.requestAnimationFrame(restore);
      window.setTimeout(() => {
        setCopiedMessageId((currentId) => (currentId === id ? null : currentId));
      }, 1200);
    } catch {
      toast.error('Не удалось скопировать сообщение');
    }
  }, []);

  const handleSendMessage = useCallback(
    (trimmed: string) => {
      mutate(trimmed);
    },
    [mutate]
  );

  if (isChatLoading) return <Loader />;
  if (isError) return <Error />;
  if (!chatData?.chat.messages) return <Loader />;

  const messages = chatData.chat.messages;
  const isInitializing = messages.length === 1;

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex-1 min-h-0">
        <ChatMessagesPanel
          chatId={chatId}
          scrollKey={scrollKey}
          messages={messages}
          isInitializing={isInitializing}
          isPending={isPending}
          copiedMessageId={copiedMessageId}
          scrollListRef={scrollListRef}
          onCopy={handleCopyMessage}
          onSuggestionSelect={handleSuggestionSelect}
        />
      </div>

      <ChatComposer
        key={chatId ?? 'no-chat'}
        ref={composerRef}
        scrollListRef={scrollListRef}
        loading={isPending || isInitializing}
        disabled={isPending || isInitializing}
        onSend={handleSendMessage}
      />
    </div>
  );
};

export default ChatView;
