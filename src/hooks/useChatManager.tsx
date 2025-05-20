import { useGenerateResponseGPT } from './useGenerateResponseGPT';
import useConversations from './useConversations';
import useConversation from './useConversation';

const useChatManager = (id: string | undefined) => {
  const { loading, generateGPT } = useGenerateResponseGPT();
  const { addMessages } = useConversations();
  const { conversation } = useConversation(id);

  const sendMessage = async (text: string) => {
    if (!id) return;
    if (!text) return;

    const prevMsgId = conversation?.messages
      .slice()
      .reverse()
      .find((item) => item.id)?.id;

    addMessages(id, [
      {
        role: 'user',
        output_text: text,
        created_at: new Date().toISOString(),
      },
    ]);

    const response = await generateGPT(text, prevMsgId);

    if (!response) return 'Error';

    addMessages(id, [
      {
        id: response.id,
        role: 'assistant',
        output_text: response.output_text,
        created_at: new Date().toISOString(),
      },
    ]);
  };

  return { loading, sendMessage };
};

export default useChatManager;
