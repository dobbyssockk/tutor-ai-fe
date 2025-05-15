import { ConversationsContext } from '@/context/ConversationsContext';
import { useContext } from 'react';

const useConversations = () => {
  const context = useContext(ConversationsContext);
  if (!context) {
    throw new Error('useConversations must be used within a ConversationsProvider');
  }
  return context;
};

export default useConversations;
