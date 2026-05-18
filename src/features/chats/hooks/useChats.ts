import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  createChat,
  deleteAllChats,
  deleteChat,
  getChats,
  renameChat,
} from '@/features/chats/services';
import { Chat, ChatResponse } from '@/features/chats/types';
import { queryKeys } from '@/shared/lib/queryKeys';
import { getApiErrorMessage } from '@/shared/lib/utils';

const toSidebarChatItem = (chat: Chat): Chat => ({
  id: chat.id,
  title: chat.title,
  createdAt: chat.createdAt,
  updatedAt: chat.updatedAt,
  userId: chat.userId,
});

export const useGetChats = () =>
  useQuery({ queryKey: queryKeys.chats.all, queryFn: getChats });

export const useCreateChat = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createChat,
    onSuccess: (data) => {
      const { chat } = data;

      // Optimistically add the new chat so it appears immediately in the sidebar
      qc.setQueryData<{ chats: Chat[] }>(queryKeys.chats.all, (old = { chats: [] }) => ({
        chats: [toSidebarChatItem(chat), ...old.chats],
      }));

      qc.setQueryData(queryKeys.chats.detail(chat.id), data);

      navigate(`/chat/${chat.id}`);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err) || 'Не удалось создать чат. Попробуйте еще раз.');
    },
  });
};

export const useDeleteAllChats = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: deleteAllChats,
    onSuccess: () => {
      qc.setQueryData(queryKeys.chats.all, { chats: [] });
      qc.invalidateQueries({ queryKey: queryKeys.chats.all });
      navigate('/chat');
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err) || 'Не удалось удалить все чаты. Попробуйте еще раз.');
    },
  });
};

export const useDeleteChat = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: deleteChat,
    onSuccess: (_, id) => {
      qc.setQueryData<{ chats: Chat[] }>(queryKeys.chats.all, (old = { chats: [] }) => ({
        chats: old.chats.filter((c) => c.id !== id),
      }));

      qc.invalidateQueries({ queryKey: queryKeys.chats.all });
      qc.invalidateQueries({ queryKey: queryKeys.chats.detail(id) });
      navigate('/chat');
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err) || 'Не удалось удалить чат. Попробуйте еще раз.');
    },
  });
};

export const useRenameChat = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      renameChat(id, title),
    onSuccess: (data, variables) => {
      qc.setQueryData<{ chats: Chat[] }>(queryKeys.chats.all, (old) => {
        if (!old) return old;
        return {
          chats: old.chats.map((chat) =>
            chat.id === variables.id
              ? { ...chat, title: data.chat.title, updatedAt: data.chat.updatedAt }
              : chat
          ),
        };
      });

      qc.setQueryData<ChatResponse>(queryKeys.chats.detail(variables.id), (old) =>
        old
          ? {
              chat: {
                ...old.chat,
                title: data.chat.title,
                updatedAt: data.chat.updatedAt,
              },
            }
          : old
      );
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err) || 'Не удалось переименовать чат. Попробуйте еще раз.');
    },
  });
};
