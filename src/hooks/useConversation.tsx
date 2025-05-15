import useConversations from './useConversations';

const useConversation = (id: string | undefined) => {
  const { conversations } = useConversations();
  const conversation = conversations.find((item) => item.id === id);

  return { conversation };
};

export default useConversation;
