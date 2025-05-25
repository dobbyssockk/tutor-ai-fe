export type Message = {
  id: string;
  role: 'user' | 'assistant';
  outputText: string;
  createdAt: string;
  chatId: string;
};

export type Chat = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export type ChatsResponse = {
  chats: Chat[];
};

export type ChatResponse = {
  chat: {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    messages: Message[];
  };
};

export type MessageResponse = {
  user: {
    id: string;
    role: 'user';
    outputText: string;
    chatId: string;
    createdAt: string;
  };
  assistant: {
    id: string;
    role: 'assistant';
    outputText: string;
    chatId: string;
    createdAt: string;
  };
};
