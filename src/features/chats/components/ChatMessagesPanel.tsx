import { memo, type RefObject } from 'react';

import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from '@/features/chats/components/chat/chat-bubble';
import { ChatMessageList } from '@/features/chats/components/chat/chat-message-list';
import ChatMessage from '@/features/chats/components/chat/ChatMessage';
import type { Message } from '@/features/chats/types';

type ChatMessagesPanelProps = {
  chatId: string | undefined;
  scrollKey: number;
  messages: Message[];
  isInitializing: boolean;
  isPending: boolean;
  copiedMessageId: string | null;
  scrollListRef: RefObject<HTMLDivElement | null>;
  onCopy: (id: string, outputText: string) => void;
  onSuggestionSelect: (prompt: string) => void;
};

const ChatMessagesPanel = memo(function ChatMessagesPanel({
  chatId,
  scrollKey,
  messages,
  isInitializing,
  isPending,
  copiedMessageId,
  scrollListRef,
  onCopy,
  onSuggestionSelect,
}: ChatMessagesPanelProps) {
  return (
    <ChatMessageList
      ref={scrollListRef}
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
            onCopy={onCopy}
            onSuggestionSelect={onSuggestionSelect}
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
  );
});

ChatMessagesPanel.displayName = 'ChatMessagesPanel';

export default ChatMessagesPanel;
