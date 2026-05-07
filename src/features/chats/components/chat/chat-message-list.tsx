import * as React from 'react';
import { ArrowDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAutoScroll } from '@/features/chats/hooks/useAutoScroll';

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  smooth?: boolean;
  isEnabledScrollToBottom?: boolean;
  childPadding?: string;
  forceScrollOnChange?: boolean;
  scrollKey?: string | number;
}

const ChatMessageList = ({
  className,
  children,
  smooth = false,
  isEnabledScrollToBottom = false,
  childPadding,
  forceScrollOnChange = false,
  scrollKey,
  ...props
}: ChatMessageListProps) => {
  const { scrollRef, isAtBottom, scrollToBottom, disableAutoScroll } =
    useAutoScroll({
      smooth,
      content: children,
    });

  React.useLayoutEffect(() => {
    if (!forceScrollOnChange) return;
    const element = scrollRef.current;
    if (!element) return;

    const scrollNow = () => {
      element.scrollTop = element.scrollHeight;
    };

    scrollNow();
    const t1 = window.setTimeout(scrollNow, 0);
    const t2 = window.setTimeout(scrollNow, 50);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [forceScrollOnChange, scrollKey, scrollRef]);

  return (
    <div className="relative w-full h-full">
      <div
        className={`flex flex-col w-full h-full p-4 overflow-y-auto overflow-x-hidden ${className}`}
        ref={scrollRef}
        onWheel={disableAutoScroll}
        onTouchMove={disableAutoScroll}
        {...props}
      >
        <div className={`flex flex-col gap-6 ${childPadding}`}>{children}</div>
      </div>

      {!isAtBottom && isEnabledScrollToBottom && (
        <Button
          onClick={() => {
            scrollToBottom(true);
          }}
          size="icon"
          variant="outline"
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 inline-flex rounded-full shadow-md"
          aria-label="Прокрутить вниз"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export { ChatMessageList };
