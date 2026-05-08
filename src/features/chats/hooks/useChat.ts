import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getChat, createMessage } from '@/features/chats/services';
import { ChatResponse, MessageResponse } from '../types';
import { queryKeys } from '@/shared/lib/queryKeys';

const sortChatMessages = (data: ChatResponse): ChatResponse => ({
  chat: {
    ...data.chat,
    messages: [...data.chat.messages].sort((a, b) => {
      const dateDiff =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (dateDiff !== 0) return dateDiff;
      if (a.role !== b.role) return a.role === 'user' ? -1 : 1;
      return a.id.localeCompare(b.id);
    }),
  },
});

export const useGetChat = (chatId: string | undefined) => {
  const queryFn = async () => {
    if (!chatId) throw new Error('chatId is required');
    return getChat(chatId);
  };

  return useQuery({
    queryKey: queryKeys.chats.detail(chatId),
    queryFn,
    select: sortChatMessages,
    enabled: Boolean(chatId),
    retry: false,
  });
};

export const useSendMessage = (chatId: string) => {
  const qc = useQueryClient();
  const chatDetailKey = queryKeys.chats.detail(chatId);

  return useMutation<
    MessageResponse,
    Error,
    string,
    { previous?: ChatResponse }
  >({
    mutationFn: (input) => createMessage(chatId, input),

    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: chatDetailKey });

      const previous = qc.getQueryData<ChatResponse>(chatDetailKey);

      qc.setQueryData<ChatResponse>(chatDetailKey, (old) => {
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
        qc.setQueryData(chatDetailKey, context.previous);
      }
    },

    onSuccess: ({ user, assistant }) => {
      qc.setQueryData<ChatResponse>(chatDetailKey, (old) => {
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
