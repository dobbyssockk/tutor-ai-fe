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

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === 'function') {
    ref(value);
  } else {
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  (
    {
      className,
      children,
      smooth = false,
      isEnabledScrollToBottom = false,
      childPadding,
      forceScrollOnChange = false,
      scrollKey,
      ...props
    },
    forwardedRef
  ) => {
    const { scrollRef, isAtBottom, scrollToBottom, disableAutoScroll } =
      useAutoScroll({
        smooth,
        contentSignature: scrollKey,
      });

    const forwardedRefLatest = React.useRef(forwardedRef);
    forwardedRefLatest.current = forwardedRef;

    const setScrollNode = React.useCallback(
      (node: HTMLDivElement | null) => {
        scrollRef.current = node;
        assignRef(forwardedRefLatest.current, node);
      },
      [scrollRef]
    );

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
          className={`flex flex-col w-full h-full overflow-y-auto overflow-x-hidden p-4 [overflow-anchor:none] ${className}`}
          ref={setScrollNode}
          onWheel={disableAutoScroll}
          onTouchMove={disableAutoScroll}
          {...props}
        >
          <div className={`flex flex-col gap-6 [overflow-anchor:none] ${childPadding}`}>
            {children}
          </div>
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
  }
);

ChatMessageList.displayName = 'ChatMessageList';

export { ChatMessageList };
