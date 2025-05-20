import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useGenerateResponseGPT } from './useGenerateResponseGPT';
import useConversations from './useConversations';

const useCreateConversation = () => {
  const { loading, generateGPT } = useGenerateResponseGPT();
  const { addConversation, addMessages } = useConversations();
  const navigate = useNavigate();

  const handleCreateConversation = async (text: string) => {
    const id = uuidv4();
    if (!text) return;

    addConversation(id, text);
    navigate(`/chat/${id}`);

    const response = await generateGPT(text);

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

  return { loading, handleCreateConversation };
};

export default useCreateConversation;
