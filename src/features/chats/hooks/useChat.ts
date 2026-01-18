import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getChat, createMessage } from '@/features/chats/services';
import { ChatResponse, MessageResponse } from '../types';

export const useGetChat = (chatId: string | undefined) => {
  return useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => getChat(chatId!),
    enabled: !!chatId,
    retry: false,
  });
};

export const useSendMessage = (chatId: string) => {
  const qc = useQueryClient();
  return useMutation<
    MessageResponse,
    Error,
    string,
    { previous?: ChatResponse }
  >({
    mutationFn: (input) => createMessage(chatId, input),

    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ['chat', chatId] });

      const previous = qc.getQueryData<ChatResponse>(['chat', chatId]);

      qc.setQueryData<ChatResponse>(['chat', chatId], (old) => {
        if (!old) return old;

        return {
          chat: {
            ...old.chat,
            messages: [
              ...old.chat.messages,
              {
                id: `temp-${Date.now()}`,
                role: 'user',
                outputText: input,
                chatId,
                createdAt: new Date().toISOString(),
              },
            ],
          },
        };
      });

      return { previous };
    },

    onError: (_err, _input, context) => {
      if (context?.previous) {
        qc.setQueryData(['chat', chatId], context.previous);
      }
    },

    onSuccess: ({ user, assistant }) => {
      qc.setQueryData<ChatResponse>(['chat', chatId], (old) => {
        if (!old) return old;

        return {
          chat: {
            ...old.chat,
            messages: [
              ...old.chat.messages.filter((m) => !m.id.startsWith('temp-')),
              user,
              assistant,
            ],
          },
        };
      });
    },
  });
};
