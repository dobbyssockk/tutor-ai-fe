import React from 'react';

import { CornerDownLeft, Loader2 } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { ChatInput as ShadcnInput } from '@/features/chats/components/chat/chat-input';

interface ChatInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  loading: boolean;
  onClick: () => void;
}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ onClick, loading, className, ...props }, ref) => {
    return (
      <div
        className={cn(
          'w-xs sm:w-xl md:w-3xl lg:w-4xl rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1 absolute bottom-8 left-[50%] -translate-x-[50%]',
          className
        )}
      >
        <ShadcnInput
          ref={ref}
          className="min-h-14 resize-none rounded-lg !bg-transparent border-0 p-3 shadow-none focus-visible:ring-0"
          placeholder="Введите сообщение..."
          {...props}
        />

        <div className="flex items-center p-3 pt-2">
          {loading ? (
            <Button size="sm" className="ml-auto gap-1.5" disabled>
              Получаем ответ
              <Loader2 className="animate-spin" />
            </Button>
          ) : (
            <Button size="sm" className="ml-auto gap-1.5" onClick={onClick}>
              Отправить
              <CornerDownLeft className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    );
  }
);

export default ChatInput;
