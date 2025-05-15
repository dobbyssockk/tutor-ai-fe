import { createContext } from 'react';

export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  output_text: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  messages: Message[];
}

interface ConversationsContextType {
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  addConversation: (id: string, text: string) => void;
  addMessages: (id: string, newMessages: Message[]) => void;
  removeConversation: (id: string) => void;
}

export const ConversationsContext = createContext<
  ConversationsContextType | undefined
>(undefined);
