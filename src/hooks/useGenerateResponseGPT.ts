import { useEffect, useState } from 'react';
import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const client = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true,
});

interface Message {
  id?: string;
  role: string;
  output_text: string;
}

const useGenerateResponseGPT = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (messages.length !== 0) {
      localStorage.setItem('messages', JSON.stringify(messages));
    }
  }, [messages]);

  const generateGPT = async (text: string) => {
    if (!text || text.trim() === '') {
      setError("Input can't be empty.");
      return;
    }

    setLoading(true);
    setError('');
    setMessages([...messages, { role: 'user', output_text: text }]);

    // copy to reverse without mutation and find THE LAST message with id
    const previousId = messages
      .slice()
      .reverse()
      .find((msg) => msg.id)?.id;

    try {
      const response = await client.responses.create({
        model: 'gpt-4o',
        input: text,
        store: true,
        ...(previousId && { previous_response_id: previousId }),
      });

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: response.id,
          role: 'assistant',
          output_text: response.output_text,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown Error');
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: 'assistant',
          output_text: 'Sorry, try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };
  return { messages, setMessages, loading, error, setError, generateGPT };
};

export default useGenerateResponseGPT;
