export const INTERACTIVE_GUARDRAIL_TEXT =
  'Я могу показать интерактивные материалы: графики функций (линейные, квадратичные, тригонометрические), сравнение двух функций, таймлайны по теме и медиа-галерею (фото/видео из открытых источников).';

export const SUGGESTIONS_BLOCK_RE = /```suggestions\s*([\s\S]*?)```/i;
export const SERVICE_BLOCK_RE = /```(?:interactive|geometry|suggestions)\s*[\s\S]*?```/gi;
export const VISUAL_SERVICE_BLOCK_RE = /```(?:interactive|geometry)\s*[\s\S]*?```/gi;

const sanitizeSuggestion = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length < 3) return null;
  return normalized.slice(0, 140);
};

export const getMessageTextWithoutServiceBlocks = (value: string) =>
  value
    .replace(SERVICE_BLOCK_RE, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export const getMessageServiceBlocks = (value: string) =>
  value.match(VISUAL_SERVICE_BLOCK_RE)?.join('\n\n') ?? '';

const parseMessageSuggestions = (value: string): string[] => {
  const match = value.match(SUGGESTIONS_BLOCK_RE);
  if (!match?.[1]) return [];

  try {
    const parsed = JSON.parse(match[1]);
    const items = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === 'object' && 'suggestions' in parsed
        ? (parsed as { suggestions?: unknown }).suggestions
        : [];

    if (!Array.isArray(items)) return [];

    return items
      .map(sanitizeSuggestion)
      .filter((item): item is string => Boolean(item))
      .slice(0, 4);
  } catch {
    return match[1]
      .split('\n')
      .map((line) => line.replace(/^[-*\d.)\s]+/, ''))
      .map(sanitizeSuggestion)
      .filter((item): item is string => Boolean(item))
      .slice(0, 4);
  }
};

const inferMessageSuggestions = (value: string): string[] => {
  const text = getMessageTextWithoutServiceBlocks(value);
  const lower = text.toLowerCase();
  const suggestions: string[] = [];

  const add = (suggestion: string) => {
    if (!suggestions.includes(suggestion)) {
      suggestions.push(suggestion);
    }
  };

  if (/(есть ли вопросы|есть вопросы|дай знать|хочешь|предложения|как тебе|если.*непонятно)/i.test(lower)) {
    add('Объясни проще');
    add('Дай пример');
  }

  if (/(контрольн|вопрос|проверь|тест|практик)/i.test(lower)) {
    add('Проверь меня вопросом');
  }

  if (/(домашн|задани|упражнен|практик)/i.test(lower)) {
    add('Разбери домашнее задание');
  }

  if (/(пример|промпт|формул|алгоритм|нейросет|график|процент|функц)/i.test(lower)) {
    add('Покажи еще один пример');
  }

  if (/(сравн|отличи|разниц|тип|вид)/i.test(lower)) {
    add('Сравни варианты');
  }

  return suggestions.slice(0, 4);
};

export const getMessageSuggestions = (value: string): string[] => {
  const explicitSuggestions = parseMessageSuggestions(value);
  return explicitSuggestions.length ? explicitSuggestions : inferMessageSuggestions(value);
};
