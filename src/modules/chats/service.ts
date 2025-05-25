import customAxios from '@/lib/axios';
import { ChatResponse, ChatsResponse, MessageResponse } from './types';

export const getChats = async (): Promise<ChatsResponse> => {
  const { data } = await customAxios.get('/chats');
  return data;
};

export const getChat = async (chatId: string): Promise<ChatResponse> => {
  const { data } = await customAxios.get(`/chats/${chatId}`);
  return data;
};

export const createChat = async (input: string): Promise<ChatResponse> => {
  const { data } = await customAxios.post('/chats', { input });
  return data;
};

export const deleteChat = (chatId: string) =>
  customAxios.delete(`/chats/${chatId}`);

export const createMessage = async (
  chatId: string,
  input: string
): Promise<MessageResponse> => {
  const { data } = await customAxios.post(`/chats/${chatId}/messages`, {
    input,
  });
  return data;
};
