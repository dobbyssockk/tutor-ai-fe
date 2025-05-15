import { ReactNode, useState, useEffect } from 'react';
import { ConversationsContext } from './ConversationsContext';
import { Message } from './ConversationsContext';
import { Conversation } from './ConversationsContext';

const ConversationsProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const storedConversations = localStorage.getItem('conversations');
    return storedConversations ? JSON.parse(storedConversations) : [];
  });

  useEffect(() => {
    if (conversations) {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  const addConversation = (id: string, text: string) => {
    setConversations((prevConversations) => [
      ...prevConversations,
      {
        id,
        title: `Chat ${prevConversations.length + 1}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [
          {
            role: 'user',
            output_text: text,
            created_at: new Date().toISOString(),
          },
        ],
      },
    ]);
  };

  const addMessages = (id: string, newMessages: Message[]) => {
    setConversations((prevConversations) => {
      return prevConversations.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            updated_at: new Date().toISOString(),
            messages: [...item.messages, ...newMessages],
          };
        }
        return item;
      });
    });
  };

  const removeConversation = (id: string) => {
    setConversations((prevConversations) => {
      const filtered = prevConversations.filter((item) => item.id !== id);
      return filtered;
    });
  };

  return (
    <ConversationsContext.Provider
      value={{
        conversations,
        setConversations,
        addConversation,
        addMessages,
        removeConversation,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
};

export default ConversationsProvider;
