import MarkdownRenderer from '@/shared/components/MarkdownRenderer';

type AutoPromptField = {
  label: string;
  value: string;
};

const stripMarkdownMarkers = (value: string) =>
  value
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\*\*/g, '')
    .trim();

const parseLabeledLine = (line: string): AutoPromptField | null => {
  const normalized = line.replace(/^\s*[-*]\s+/, '').trim();
  const boldMatch = normalized.match(/^\*\*([^:*]+):\*\*\s*(.+)$/);
  if (boldMatch) {
    return {
      label: stripMarkdownMarkers(boldMatch[1]),
      value: stripMarkdownMarkers(boldMatch[2]),
    };
  }

  const plainMatch = normalized.match(/^([^:]{2,40}):\s*(.+)$/);
  if (plainMatch) {
    return {
      label: stripMarkdownMarkers(plainMatch[1]),
      value: stripMarkdownMarkers(plainMatch[2]),
    };
  }

  return null;
};

type LessonPrompt = {
  kind: 'lesson';
  title: string;
  subtitle: string;
  fields: AutoPromptField[];
};

type ReviewPrompt = {
  kind: 'review';
  title: string;
  intro: string;
  mistakes: { title: string; fields: AutoPromptField[] }[];
};

type ParsedAutoPrompt = LessonPrompt | ReviewPrompt;

export const parseAutoPrompt = (value: string): ParsedAutoPrompt | null => {
  const lines = value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const firstLine = lines[0] ?? '';

  if (firstLine.startsWith('### Наставник по дисциплине:')) {
    const discipline = firstLine.replace(/^###\s*Наставник по дисциплине:\s*/, '').trim();
    const fields: AutoPromptField[] = [];

    for (const line of lines.slice(1)) {
      const parsed = parseLabeledLine(line);
      if (parsed) fields.push(parsed);
    }

    return { kind: 'lesson', title: 'Авто-промпт урока', subtitle: discipline, fields };
  }

  if (firstLine === '### Разбор ошибок' || firstLine === '### Итоги теста') {
    const sections = value
      .split(/(?=^####\s+)/gm)
      .map((section) => section.trim())
      .filter(Boolean);
    const intro = stripMarkdownMarkers(
      sections[0]
        .split('\n')
        .filter((line) => !line.startsWith('###'))
        .join('\n')
    );

    const mistakes = sections
      .slice(1)
      .map((section) => {
        const sectionLines = section
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);
        const title = stripMarkdownMarkers(sectionLines[0] ?? '');
        const fields = sectionLines
          .slice(1)
          .map(parseLabeledLine)
          .filter((field): field is AutoPromptField => Boolean(field));
        return { title, fields };
      })
      .filter((section) => section.title || section.fields.length);

    return {
      kind: 'review',
      title: firstLine.replace(/^###\s*/, ''),
      intro,
      mistakes,
    };
  }

  return null;
};

const AutoPromptRenderer = ({ text }: { text: string }) => {
  const prompt = parseAutoPrompt(text);
  if (!prompt) return <MarkdownRenderer text={text} />;

  if (prompt.kind === 'lesson') {
    return (
      <div className="space-y-2 text-[13px] leading-snug">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {prompt.title}
          </div>
          <div className="text-sm font-semibold leading-tight">{prompt.subtitle}</div>
        </div>

        <div className="grid gap-1.5 md:grid-cols-2">
          {prompt.fields.map((field) => (
            <div
              key={field.label}
              className={field.value.length > 80 ? 'grid gap-0.5 md:col-span-2' : 'grid gap-0.5'}
            >
              <div className="text-[11px] font-medium leading-tight text-muted-foreground">
                {field.label}
              </div>
              <div className="text-[13px] leading-snug">{field.value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 text-[13px] leading-snug">
      <div className="space-y-0.5">
        <div className="text-sm font-semibold leading-tight">{prompt.title}</div>
        {prompt.intro ? (
          <div className="text-[12px] leading-snug text-muted-foreground">
            {prompt.intro}
          </div>
        ) : null}
      </div>

      {prompt.mistakes.map((mistake) => (
        <div
          key={mistake.title}
          className="space-y-1.5 border-t border-border/50 pt-2 first:border-t-0 first:pt-0"
        >
          <div className="text-[13px] font-semibold leading-tight">{mistake.title}</div>
          <div className="grid gap-1.5">
            {mistake.fields.map((field) => (
              <div key={field.label} className="grid gap-0.5">
                <div className="text-[11px] font-medium leading-tight text-muted-foreground">
                  {field.label}
                </div>
                <div className="text-[13px] leading-snug">{field.value}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AutoPromptRenderer;
