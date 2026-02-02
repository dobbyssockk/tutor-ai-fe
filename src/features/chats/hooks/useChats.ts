import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { createChat, deleteAllChats, deleteChat, getChats } from '@/features/chats/services';
import { Chat } from '@/features/chats/types';

export const useGetChats = () =>
  useQuery({ queryKey: ['chats'], queryFn: getChats });

export const useCreateChat = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createChat,
    onSuccess: (data) => {
      const { chat } = data;

      // Optimistically add the new chat so it appears immediately in the sidebar
      qc.setQueryData<{ chats: Chat[] }>(['chats'], (old = { chats: [] }) => ({
        chats: [
          {
            id: chat.id,
            title: chat.title,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
            userId: chat.userId,
          },
          ...old.chats,
        ],
      }));

      qc.setQueryData(['chat', chat.id], data);

      navigate(`/chat/${chat.id}`);
    },
    onError: (err) => {
      console.error(err);
    },
  });
};

export const useDeleteAllChats = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: deleteAllChats,
    onSuccess: () => {
      qc.setQueryData(['chats'], { chats: [] });
      qc.invalidateQueries({ queryKey: ['chats'] });
      navigate('/chat');
    },
    onError: (err) => {
      console.error(err);
    },
  });
};


export const useDeleteChat = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: deleteChat,
    onSuccess: (_, id) => {
      qc.setQueryData<{ chats: Chat[] }>(['chats'], (old = { chats: [] }) => ({
        chats: old.chats.filter((c) => c.id !== id),
      }));

      qc.invalidateQueries({ queryKey: ['chats'] });
      qc.invalidateQueries({ queryKey: ['chat', id] });
      navigate('/chat');
    },
    onError: (err) => {
      console.error(err);
    },
  });
};
