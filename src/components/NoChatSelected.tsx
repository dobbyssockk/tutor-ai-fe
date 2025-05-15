import { useState } from 'react';
import useCreateConversation from '@/hooks/useCreateConversation';

// shadcn
import ChatInput from '@/components/ChatInput';

// icons
import { MessageSquareDashed } from 'lucide-react';

const NoChatSelected = () => {
  const [text, setText] = useState(''); // for input
  const { loading, handleCreateConversation } = useCreateConversation();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateConversation(text);
      setText('');
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
        loading={loading}
        disabled={loading}
        value={text}
        onClick={() => handleCreateConversation(text)}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e)}
      />
    </>
  );
};

export default NoChatSelected;
