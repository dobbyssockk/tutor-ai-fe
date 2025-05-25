import { useState } from 'react';

import { MessageSquareDashed } from 'lucide-react';

import ChatInput from '@/components/ChatInput';
import { useCreateChat } from '@/modules/chats/hooks/useChats';

const NoChatSelected = () => {
  const [text, setText] = useState(''); // for input

  const { mutate, isPending } = useCreateChat();

  const handleSend = () => {
    if (!text.trim()) return;
    mutate(text);
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
        <p className="text-lg font-medium">No chat selected yet.</p>
        <p className="text-sm opacity-70">
          Kinda like an empty div... waiting to be filled.
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
