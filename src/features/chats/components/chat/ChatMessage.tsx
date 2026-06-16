import { memo } from 'react';
import { Check, Copy } from 'lucide-react';

import MarkdownRenderer from '@/shared/components/MarkdownRenderer';
import {
  ChatBubble,
  ChatBubbleAction,
  ChatBubbleActionWrapper,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from './chat-bubble';
import AutoPromptRenderer, { parseAutoPrompt } from './AutoPromptRenderer';
import { GraphSuggestionList, NextMessageSuggestionList } from './SuggestionLists';
import {
  INTERACTIVE_GUARDRAIL_TEXT,
  getMessageSuggestions,
  getMessageServiceBlocks,
  getMessageTextWithoutServiceBlocks,
} from './message-utils';

type ChatMessageProps = {
  id: string;
  role: string;
  outputText: string;
  copiedMessageId: string | null;
  isPending: boolean;
  onCopy: (id: string, outputText: string) => void;
  onSuggestionSelect: (prompt: string) => void;
};

const CopyAction = ({
  id,
  outputText,
  copiedMessageId,
  onCopy,
  variant,
}: {
  id: string;
  outputText: string;
  copiedMessageId: string | null;
  onCopy: (id: string, outputText: string) => void;
  variant: 'sent' | 'received';
}) => (
  <ChatBubbleActionWrapper
    variant={variant}
    className="left-2 right-auto top-2 z-10 translate-x-0 translate-y-0"
  >
    <ChatBubbleAction
      type="button"
      tabIndex={-1}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onCopy(id, outputText);
      }}
      icon={
        copiedMessageId === id ? (
          <Check className="size-4" />
        ) : (
          <Copy className="size-4" />
        )
      }
      aria-label="Скопировать сообщение"
      title="Скопировать сообщение"
      className="h-8 w-8 rounded-full border bg-background text-muted-foreground shadow-sm hover:text-foreground"
    />
  </ChatBubbleActionWrapper>
);

const ChatMessage = memo(function ChatMessage(props: ChatMessageProps) {
  const {
    id,
    role,
    outputText,
    copiedMessageId,
    isPending,
    onCopy,
    onSuggestionSelect,
  } = props;
  const isUser = role === 'user';
  const variant = isUser ? 'sent' : ('received' as const);

  const hasInteractive = !isUser && /```interactive\s*[\s\S]*?```/i.test(outputText);
  const hasAutoPrompt = isUser && Boolean(parseAutoPrompt(outputText));
  const hasGraphSuggestions = !isUser && outputText.includes(INTERACTIVE_GUARDRAIL_TEXT);
  const messageSuggestions =
    !isUser && !hasGraphSuggestions ? getMessageSuggestions(outputText) : [];

  const textWithoutServiceBlocks = getMessageTextWithoutServiceBlocks(outputText);
  const serviceBlocks = hasInteractive ? getMessageServiceBlocks(outputText) : '';

  const messageBubble = (
    <ChatBubble
      variant={variant}
      className={
        hasInteractive ? 'max-w-full w-full' : hasAutoPrompt ? 'max-w-[82%]' : undefined
      }
    >
      <ChatBubbleAvatar fallback={isUser ? 'Я' : 'ИИ'} />
      {hasInteractive ? (
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {textWithoutServiceBlocks ? (
            <ChatBubbleMessage variant={variant}>
              <MarkdownRenderer text={textWithoutServiceBlocks} />
              <CopyAction
                id={id}
                outputText={outputText}
                copiedMessageId={copiedMessageId}
                onCopy={onCopy}
                variant={variant}
              />
            </ChatBubbleMessage>
          ) : null}
          {serviceBlocks ? <MarkdownRenderer text={serviceBlocks} /> : null}
        </div>
      ) : (
        <ChatBubbleMessage
          variant={variant}
          className={hasAutoPrompt ? 'max-w-[760px]' : undefined}
        >
          {hasAutoPrompt ? (
            <AutoPromptRenderer text={outputText} />
          ) : (
            <MarkdownRenderer text={textWithoutServiceBlocks} />
          )}
          <CopyAction
            id={id}
            outputText={outputText}
            copiedMessageId={copiedMessageId}
            onCopy={onCopy}
            variant={variant}
          />
        </ChatBubbleMessage>
      )}
    </ChatBubble>
  );

  if (!hasGraphSuggestions && !messageSuggestions.length) {
    return <div className="flex w-full flex-col">{messageBubble}</div>;
  }

  return (
    <div className="flex w-full flex-col items-start">
      {messageBubble}
      {messageSuggestions.length ? (
        <div className="ml-12 mt-2 max-w-[70%]">
          <NextMessageSuggestionList
            disabled={isPending}
            suggestions={messageSuggestions}
            onSelect={onSuggestionSelect}
          />
        </div>
      ) : null}
      {hasGraphSuggestions ? (
        <div className="ml-12 mt-2 max-w-[60%]">
          <GraphSuggestionList disabled={isPending} onSelect={onSuggestionSelect} />
        </div>
      ) : null}
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
