import { useState } from 'react';

import { MessageSquareDashed } from 'lucide-react';

import ChatInput from '@/features/chats/components/ChatInput';
import { useCreateChat } from '@/features/chats/hooks/useChats';

const NoChatSelected = () => {
  const [text, setText] = useState(''); // for input

  const { mutate, isPending } = useCreateChat();

  const handleSend = () => {
    const normalizedText = text.trim();
    if (!normalizedText) return;
    mutate(normalizedText, {
      onSuccess: () => setText(''),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground px-4">
        <MessageSquareDashed className="w-10 h-10 mb-4 text-muted" />
        <p className="text-lg font-medium">Чат пока не выбран.</p>
        <p className="text-sm opacity-70">
          Похоже на пустой экран... ждет, когда его заполнят.
        </p>
      </div>
      <ChatInput
        loading={isPending}
        disabled={isPending}
        value={text}
        onClick={handleSend}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e)}
      />
    </>
  );
};

export default NoChatSelected;
