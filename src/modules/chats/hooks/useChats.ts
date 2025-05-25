import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { createChat, deleteChat, getChats } from '@/modules/chats/service';
import { Chat } from '@/modules/chats/types';

export const useGetChats = () =>
  useQuery({ queryKey: ['chats'], queryFn: getChats });

export const useCreateChat = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createChat,
    onSuccess: (data) => {
      const { chat } = data;
      navigate(`/chat/${chat.id}`);
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
