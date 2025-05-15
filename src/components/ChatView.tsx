import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useConversation from '@/hooks/useConversation';
import useChatManager from '@/hooks/useChatManager';
import MarkdownRenderer from './MarkdownRenderer';

// shadcn
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from '@/components/ui/chat/chat-bubble';
import { ChatMessageList } from '@/components/ui/chat/chat-message-list';
import ChatInput from '@/components/ChatInput';

const ChatView = () => {
  const [text, setText] = useState(''); // for input
  const { id } = useParams();
  const { loading, sendMessage } = useChatManager(id);
  const { conversation } = useConversation(id);
  const navigate = useNavigate();

  useEffect(() => {
    if (!conversation) {
      navigate('/chat');
    }
  }, [conversation, navigate]);

  if (!conversation) return <div>No conversation...</div>; // avoid error "'conversation' is possibly 'undefined'"

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(text);
      setText('');
    }
  };

  return (
    <>
      <div>
        <ChatMessageList
          className="pb-40 max-w-4xl mx-auto"
          childPadding={'py-5'}
        >
          {conversation.messages.length === 1 ? (
            <>
              <ChatBubble variant="sent">
                <ChatBubbleAvatar fallback="US" />
                <ChatBubbleMessage variant="sent">
                  {conversation.messages[0].output_text}
                </ChatBubbleMessage>
              </ChatBubble>

              <div className="flex space-x-4 items-end">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-12 w-[250px]" />
              </div>
            </>
          ) : (
            conversation.messages.map(({ role, output_text }, idx) => {
              const isUser = role === 'user';
              const variant = isUser ? 'sent' : 'received';
              return (
                <ChatBubble key={idx} variant={variant}>
                  <ChatBubbleAvatar fallback={isUser ? 'US' : 'AI'} />
                  <ChatBubbleMessage variant={variant}>
                    {isUser ? (
                      output_text
                    ) : (
                      <MarkdownRenderer text={output_text} />
                    )}
                  </ChatBubbleMessage>
                </ChatBubble>
              );
            })
          )}

          {loading ? (
            <ChatBubble key="loading" variant="received">
              <ChatBubbleAvatar fallback="AI" />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          ) : null}
        </ChatMessageList>
      </div>

      <ChatInput
        loading={loading || conversation.messages.length === 1}
        disabled={loading || conversation.messages.length === 1}
        value={text}
        onClick={() => sendMessage(text)}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e)}
      />
    </>
  );
};

export default ChatView;
