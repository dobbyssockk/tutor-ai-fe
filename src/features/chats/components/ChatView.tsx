import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

import Error from '@/shared/components/Error';
import Loader from '@/shared/components/Loader';
import MarkdownRenderer from '@/shared/components/MarkdownRenderer';

import { useGetChat, useSendMessage } from '@/features/chats/hooks/useChat';

import ChatInput from '@/features/chats/components/ChatInput';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  ChatBubbleAction,
  ChatBubbleActionWrapper,
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from '@/features/chats/components/chat/chat-bubble';
import { ChatMessageList } from '@/features/chats/components/chat/chat-message-list';
import { Button } from '@/shared/components/ui/button';

const INTERACTIVE_GUARDRAIL_TEXT =
  'Я могу показать интерактивные материалы: графики функций (линейные, квадратичные, тригонометрические), сравнение двух функций, таймлайны по теме и медиа-галерею (фото/видео из открытых источников).';

const graphSuggestions = [
  {
    label: 'Линейный график',
    prompt: 'Построй интерактивный график линейной функции y = 2x + 1',
  },
  {
    label: 'Квадратичный график',
    prompt: 'Построй интерактивный график квадратичной функции y = x^2 - 4x + 3',
  },
  {
    label: 'Тригонометрический график',
    prompt: 'Построй интерактивный график функции y = sin(x)',
  },
  {
    label: 'Сравнить функции',
    prompt: 'Сравни на одном интерактивном графике функции y = sin(x) и y = cos(x)',
  },
];

type GraphSuggestionListProps = {
  disabled: boolean;
  onSelect: (prompt: string) => void;
};

type AutoPromptField = {
  label: string;
  value: string;
};

const GraphSuggestionList = ({ disabled, onSelect }: GraphSuggestionListProps) => (
  <div className="flex flex-wrap gap-2">
    {graphSuggestions.map((suggestion) => (
      <Button
        key={suggestion.label}
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        className="h-8 rounded-full border-border/70 bg-secondary/40 px-3 text-xs hover:bg-secondary"
        onClick={() => onSelect(suggestion.prompt)}
      >
        {suggestion.label}
      </Button>
    ))}
  </div>
);

const NextMessageSuggestionList = ({
  disabled,
  suggestions,
  onSelect,
}: {
  disabled: boolean;
  suggestions: string[];
  onSelect: (prompt: string) => void;
}) => (
  <div className="flex flex-wrap gap-2">
    {suggestions.map((suggestion) => (
      <Button
        key={suggestion}
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        className="h-8 rounded-full border-border/70 bg-secondary/40 px-3 text-xs hover:bg-secondary"
        onClick={() => onSelect(suggestion)}
      >
        {suggestion}
      </Button>
    ))}
  </div>
);

const copyToClipboard = async (value: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
};

const stripMarkdownMarkers = (value: string) =>
  value
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\*\*/g, '')
    .trim();

const parseLabeledLine = (line: string): AutoPromptField | null => {
  const normalized = line.replace(/^\s*[-*]\s+/, '').trim();
  const boldMatch = normalized.match(/^\*\*([^:*]+):\*\*\s*(.+)$/);
  if (boldMatch) {
    return {
      label: stripMarkdownMarkers(boldMatch[1]),
      value: stripMarkdownMarkers(boldMatch[2]),
    };
  }

  const plainMatch = normalized.match(/^([^:]{2,40}):\s*(.+)$/);
  if (plainMatch) {
    return {
      label: stripMarkdownMarkers(plainMatch[1]),
      value: stripMarkdownMarkers(plainMatch[2]),
    };
  }

  return null;
};

const parseAutoPrompt = (value: string) => {
  const lines = value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const firstLine = lines[0] ?? '';

  if (firstLine.startsWith('### Наставник по дисциплине:')) {
    const discipline = firstLine.replace(/^###\s*Наставник по дисциплине:\s*/, '').trim();
    const fields: AutoPromptField[] = [];

    for (const line of lines.slice(1)) {
      const parsed = parseLabeledLine(line);
      if (parsed) fields.push(parsed);
    }

    return {
      kind: 'lesson' as const,
      title: 'Авто-промпт урока',
      subtitle: discipline,
      fields,
    };
  }

  if (firstLine === '### Разбор ошибок' || firstLine === '### Итоги теста') {
    const sections = value
      .split(/(?=^####\s+)/gm)
      .map((section) => section.trim())
      .filter(Boolean);
    const intro = stripMarkdownMarkers(
      sections[0]
        .split('\n')
        .filter((line) => !line.startsWith('###'))
        .join('\n')
    );

    const mistakes = sections
      .slice(1)
      .map((section) => {
        const sectionLines = section
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);
        const title = stripMarkdownMarkers(sectionLines[0] ?? '');
        const fields = sectionLines
          .slice(1)
          .map(parseLabeledLine)
          .filter((field): field is AutoPromptField => Boolean(field));
        return { title, fields };
      })
      .filter((section) => section.title || section.fields.length);

    return {
      kind: 'review' as const,
      title: firstLine.replace(/^###\s*/, ''),
      intro,
      mistakes,
    };
  }

  return null;
};

const AutoPromptRenderer = ({ text }: { text: string }) => {
  const prompt = parseAutoPrompt(text);
  if (!prompt) return <MarkdownRenderer text={text} />;

  if (prompt.kind === 'lesson') {
    return (
      <div className="space-y-2 text-[13px] leading-snug">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {prompt.title}
          </div>
          <div className="text-sm font-semibold leading-tight">{prompt.subtitle}</div>
        </div>

        <div className="grid gap-1.5 md:grid-cols-2">
          {prompt.fields.map((field) => (
            <div
              key={field.label}
              className={field.value.length > 80 ? 'grid gap-0.5 md:col-span-2' : 'grid gap-0.5'}
            >
              <div className="text-[11px] font-medium leading-tight text-muted-foreground">
                {field.label}
              </div>
              <div className="text-[13px] leading-snug">{field.value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 text-[13px] leading-snug">
      <div className="space-y-0.5">
        <div className="text-sm font-semibold leading-tight">{prompt.title}</div>
        {prompt.intro ? (
          <div className="text-[12px] leading-snug text-muted-foreground">
            {prompt.intro}
          </div>
        ) : null}
      </div>

      {prompt.mistakes.map((mistake) => (
        <div key={mistake.title} className="space-y-1.5 border-t border-border/50 pt-2 first:border-t-0 first:pt-0">
          <div className="text-[13px] font-semibold leading-tight">{mistake.title}</div>
          <div className="grid gap-1.5">
            {mistake.fields.map((field) => (
              <div key={field.label} className="grid gap-0.5">
                <div className="text-[11px] font-medium leading-tight text-muted-foreground">
                  {field.label}
                </div>
                <div className="text-[13px] leading-snug">{field.value}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const SUGGESTIONS_BLOCK_RE = /```suggestions\s*([\s\S]*?)```/i;
const SERVICE_BLOCK_RE = /```(?:interactive|geometry|suggestions)\s*[\s\S]*?```/gi;
const VISUAL_SERVICE_BLOCK_RE = /```(?:interactive|geometry)\s*[\s\S]*?```/gi;

const sanitizeSuggestion = (value: unknown) => {
  if (typeof value !== 'string') return null;
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length < 3) return null;
  return normalized.slice(0, 140);
};

const parseMessageSuggestions = (value: string) => {
  const match = value.match(SUGGESTIONS_BLOCK_RE);
  if (!match?.[1]) return [];

  try {
    const parsed = JSON.parse(match[1]);
    const items = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === 'object' && 'suggestions' in parsed
        ? (parsed as { suggestions?: unknown }).suggestions
        : [];

    if (!Array.isArray(items)) return [];

    return items
      .map(sanitizeSuggestion)
      .filter((item): item is string => Boolean(item))
      .slice(0, 4);
  } catch {
    return match[1]
      .split('\n')
      .map((line) => line.replace(/^[-*\d.)\s]+/, ''))
      .map(sanitizeSuggestion)
      .filter((item): item is string => Boolean(item))
      .slice(0, 4);
  }
};

const inferMessageSuggestions = (value: string) => {
  const text = getMessageTextWithoutServiceBlocks(value);
  const lower = text.toLowerCase();
  const suggestions: string[] = [];

  const add = (suggestion: string) => {
    if (!suggestions.includes(suggestion)) {
      suggestions.push(suggestion);
    }
  };

  if (/(есть ли вопросы|есть вопросы|дай знать|хочешь|предложения|как тебе|если.*непонятно)/i.test(lower)) {
    add('Объясни проще');
    add('Дай пример');
  }

  if (/(контрольн|вопрос|проверь|тест|практик)/i.test(lower)) {
    add('Проверь меня вопросом');
  }

  if (/(домашн|задани|упражнен|практик)/i.test(lower)) {
    add('Разбери домашнее задание');
  }

  if (/(пример|промпт|формул|алгоритм|нейросет|график|процент|функц)/i.test(lower)) {
    add('Покажи еще один пример');
  }

  if (/(сравн|отличи|разниц|тип|вид)/i.test(lower)) {
    add('Сравни варианты');
  }

  return suggestions.slice(0, 4);
};

const getMessageSuggestions = (value: string) => {
  const explicitSuggestions = parseMessageSuggestions(value);
  return explicitSuggestions.length
    ? explicitSuggestions
    : inferMessageSuggestions(value);
};

const getMessageTextWithoutServiceBlocks = (value: string) =>
  value
    .replace(SERVICE_BLOCK_RE, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const getMessageServiceBlocks = (value: string) =>
  value.match(VISUAL_SERVICE_BLOCK_RE)?.join('\n\n') ?? '';

const getCopyableMessageText = (value: string) =>
  getMessageTextWithoutServiceBlocks(value);

const ChatView = () => {
  const [text, setText] = useState(''); // for input
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
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
              const hasAutoPrompt = isUser && Boolean(parseAutoPrompt(outputText));
              const hasGraphSuggestions =
                !isUser && outputText.includes(INTERACTIVE_GUARDRAIL_TEXT);
              const messageSuggestions = !isUser && !hasGraphSuggestions
                ? getMessageSuggestions(outputText)
                : [];
              const textWithoutServiceBlocks = hasInteractive
                ? getMessageTextWithoutServiceBlocks(outputText)
                : getMessageTextWithoutServiceBlocks(outputText);
              const serviceBlocks = hasInteractive
                ? getMessageServiceBlocks(outputText)
                : '';
              const messageClassName = hasAutoPrompt
                ? 'max-w-[760px]'
                : undefined;
              const messageBubble = (
                <ChatBubble
                  variant={variant}
                  className={hasInteractive ? 'max-w-full w-full' : hasAutoPrompt ? 'max-w-[82%]' : undefined}
                >
                  <ChatBubbleAvatar fallback={isUser ? 'Я' : 'ИИ'} />
                  {hasInteractive ? (
                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                      {textWithoutServiceBlocks ? (
                        <ChatBubbleMessage variant={variant}>
                          <MarkdownRenderer text={textWithoutServiceBlocks} />
                          <ChatBubbleActionWrapper
                            variant={variant}
                            className="left-2 right-auto top-2 z-10 translate-x-0 translate-y-0"
                          >
                            <ChatBubbleAction
                              type="button"
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
                              onClick={() => handleCopyMessage(id, outputText)}
                            />
                          </ChatBubbleActionWrapper>
                        </ChatBubbleMessage>
                      ) : null}
                      {serviceBlocks ? <MarkdownRenderer text={serviceBlocks} /> : null}
                    </div>
                  ) : (
                    <ChatBubbleMessage
                      variant={variant}
                      className={messageClassName}
                    >
                      {hasAutoPrompt ? (
                        <AutoPromptRenderer text={outputText} />
                      ) : (
                        <MarkdownRenderer text={textWithoutServiceBlocks} />
                      )}
                      <ChatBubbleActionWrapper
                        variant={variant}
                        className="left-2 right-auto top-2 z-10 translate-x-0 translate-y-0"
                      >
                        <ChatBubbleAction
                          type="button"
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
                          onClick={() => handleCopyMessage(id, outputText)}
                        />
                      </ChatBubbleActionWrapper>
                    </ChatBubbleMessage>
                  )}
                </ChatBubble>
              );

              if (!hasGraphSuggestions && !messageSuggestions.length) {
                return (
                  <div key={id} className="flex w-full flex-col">
                    {messageBubble}
                  </div>
                );
              }

              return (
                <div key={id} className="flex w-full flex-col items-start">
                  {messageBubble}
                  {messageSuggestions.length ? (
                    <div className="ml-12 mt-2 max-w-[70%]">
                      <NextMessageSuggestionList
                        disabled={isPending}
                        suggestions={messageSuggestions}
                        onSelect={handleSuggestionSelect}
                      />
                    </div>
                  ) : null}
                  {hasGraphSuggestions ? (
                    <div className="ml-12 mt-2 max-w-[60%]">
                      <GraphSuggestionList
                        disabled={isPending}
                        onSelect={handleSuggestionSelect}
                      />
                    </div>
                  ) : null}
                </div>
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
        ref={inputRef}
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
