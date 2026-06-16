import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import ChatInput from '@/features/chats/components/ChatInput';

export type ChatComposerHandle = {
  applySuggestion: (prompt: string) => void;
};

type ChatComposerProps = {
  scrollListRef: React.RefObject<HTMLDivElement | null>;
  disabled: boolean;
  loading: boolean;
  onSend: (text: string) => void;
};

const ChatComposer = forwardRef<ChatComposerHandle, ChatComposerProps>(
  function ChatComposer({ scrollListRef, disabled, loading, onSend }, ref) {
    const [text, setText] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(
      ref,
      () => ({
        applySuggestion: (prompt: string) => {
          const list = scrollListRef.current;
          const savedScrollTop = list?.scrollTop ?? 0;
          setText(prompt);
          window.requestAnimationFrame(() => {
            const restoreListScroll = () => {
              const el = scrollListRef.current;
              if (el) el.scrollTop = savedScrollTop;
            };
            restoreListScroll();
            const el = inputRef.current;
            if (el) {
              el.focus({ preventScroll: true });
              el.setSelectionRange(prompt.length, prompt.length);
            }
            restoreListScroll();
            window.requestAnimationFrame(restoreListScroll);
          });
        },
      }),
      [scrollListRef]
    );

    const handleSend = useCallback(() => {
      const trimmed = text.trim();
      if (!trimmed) return;
      onSend(trimmed);
      setText('');
    }, [text, onSend]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      },
      [handleSend]
    );

    return (
      <ChatInput
        ref={inputRef}
        loading={loading}
        disabled={disabled}
        value={text}
        onClick={handleSend}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    );
  }
);

ChatComposer.displayName = 'ChatComposer';

export default ChatComposer;
