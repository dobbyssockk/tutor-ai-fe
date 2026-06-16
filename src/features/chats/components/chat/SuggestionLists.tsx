import { Button } from '@/shared/components/ui/button';

export const graphSuggestions = [
  {
    label: 'Линейный график',
    prompt: 'Построй интерактивный график линейной функции y = 2x + 1',
  },
  {
    label: 'Квадратичный график',
    prompt: 'Построй интерактивный график квадратичной функции y = x^2 - 4x + 3',
  },
  {
    label: 'Тригонометрический график',
    prompt: 'Построй интерактивный график функции y = sin(x)',
  },
  {
    label: 'Сравнить функции',
    prompt: 'Сравни на одном интерактивном графике функции y = sin(x) и y = cos(x)',
  },
];

type SuggestionListProps = {
  disabled: boolean;
  onSelect: (prompt: string) => void;
};

export const GraphSuggestionList = ({ disabled, onSelect }: SuggestionListProps) => (
  <div className="flex flex-wrap gap-2">
    {graphSuggestions.map((suggestion) => (
      <Button
        key={suggestion.label}
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        tabIndex={-1}
        className="h-8 rounded-full border-border/70 bg-secondary/40 px-3 text-xs hover:bg-secondary"
        onMouseDown={(e) => {
          e.preventDefault();
        }}
        onClick={() => onSelect(suggestion.prompt)}
      >
        {suggestion.label}
      </Button>
    ))}
  </div>
);

export const NextMessageSuggestionList = ({
  disabled,
  suggestions,
  onSelect,
}: SuggestionListProps & { suggestions: string[] }) => (
  <div className="flex flex-wrap gap-2">
    {suggestions.map((suggestion) => (
      <Button
        key={suggestion}
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        tabIndex={-1}
        className="h-8 rounded-full border-border/70 bg-secondary/40 px-3 text-xs hover:bg-secondary"
        onMouseDown={(e) => {
          e.preventDefault();
        }}
        onClick={() => onSelect(suggestion)}
      >
        {suggestion}
      </Button>
    ))}
  </div>
);
