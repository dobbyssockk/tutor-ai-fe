import type {
  ChartInteractiveSpec,
  MediaGalleryExplorerSpec,
  TimelineExplorerSpec,
  TrigExplorerSpec,
} from '@/shared/components/interactive/interactive-spec';

export const toNumber = (value: number, digits = 3) => Number(value.toFixed(digits));

export const formatNumber = (value: number, digits = 2) => {
  const rounded = Number(value.toFixed(digits));
  return Number.isInteger(rounded) ? `${rounded}` : `${rounded}`;
};

export const chooseGridStep = (span: number) => {
  const target = span / 8;
  const options = [0.2, 0.5, 1, 2, 5, 10, 20, 50];
  return options.find((option) => option >= target) ?? 100;
};

export const buildEquationText = (a: number, b: number, c: number) => {
  const withSign = (value: number, symbol: string, first = false) => {
    if (Math.abs(value) < 1e-9) return '';
    const abs = Math.abs(value);
    const coeff = abs === 1 && symbol ? '' : formatNumber(abs);
    const sign = value < 0 ? ' − ' : first ? ' ' : ' + ';
    return `${sign}${coeff}${symbol}`;
  };

  let expression = 'y =';

  if (Math.abs(a) > 1e-9) {
    expression += withSign(a, 'x²', true);
    expression += withSign(b, 'x');
    expression += withSign(c, '');
  } else if (Math.abs(b) > 1e-9) {
    expression += withSign(b, 'x', true);
    expression += withSign(c, '');
  } else {
    expression += ` ${formatNumber(c)}`;
  }

  return expression.trim();
};

export const buildTrigEquationText = (
  fn: TrigExplorerSpec['function'],
  amplitude: number,
  frequency: number,
  phase: number,
  offset: number
) => {
  const ampPart =
    Math.abs(amplitude) < 1e-9
      ? '0'
      : Math.abs(amplitude - 1) < 1e-9
        ? ''
        : Math.abs(amplitude + 1) < 1e-9
          ? '−'
          : formatNumber(amplitude);

  const freqPart =
    Math.abs(frequency - 1) < 1e-9
      ? 'x'
      : Math.abs(frequency + 1) < 1e-9
        ? '−x'
        : `${formatNumber(frequency)}x`;

  const phasePart =
    Math.abs(phase) < 1e-9
      ? ''
      : phase > 0
        ? ` + ${formatNumber(phase)}`
        : ` − ${formatNumber(Math.abs(phase))}`;

  const offsetPart =
    Math.abs(offset) < 1e-9
      ? ''
      : offset > 0
        ? ` + ${formatNumber(offset)}`
        : ` − ${formatNumber(Math.abs(offset))}`;

  return `y = ${ampPart}${fn}(${freqPart}${phasePart})${offsetPart}`
    .replace(/\s+/g, ' ')
    .trim();
};

export const evaluateFunctionAt = (spec: ChartInteractiveSpec, x: number) => {
  if (spec.type === 'quadratic_explorer') {
    return spec.params.a * x * x + spec.params.b * x + spec.params.c;
  }
  if (spec.type === 'linear_explorer') {
    return spec.params.slope * x + spec.params.intercept;
  }
  const trigFn = spec.function === 'cos' ? Math.cos : spec.function === 'tan' ? Math.tan : Math.sin;
  return spec.params.amplitude * trigFn(spec.params.frequency * x + spec.params.phase) + spec.params.offset;
};

export const buildSingleEquationText = (spec: ChartInteractiveSpec) => {
  if (spec.type === 'quadratic_explorer') {
    return buildEquationText(spec.params.a, spec.params.b, spec.params.c);
  }
  if (spec.type === 'linear_explorer') {
    return buildEquationText(0, spec.params.slope, spec.params.intercept);
  }
  return buildTrigEquationText(
    spec.function,
    spec.params.amplitude,
    spec.params.frequency,
    spec.params.phase,
    spec.params.offset
  );
};

export const SUBJECT_LABELS: Record<
  NonNullable<TimelineExplorerSpec['subject']>,
  string
> = {
  biology: 'Биология',
  literature: 'Литература',
  history: 'История',
  general: 'Общий предмет',
};

export const getSubjectLabel = (
  subject: TimelineExplorerSpec['subject'] | MediaGalleryExplorerSpec['subject']
) => {
  if (!subject) return null;
  return SUBJECT_LABELS[subject] ?? 'Общий предмет';
};

export const stripHtml = (raw?: string | null) => {
  if (!raw) return '';
  return raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
};

export type WikimediaMediaItem = {
  id: string;
  title: string;
  url: string;
  pageUrl: string;
  mime?: string;
  description?: string;
  license?: string;
};

export type TimelineMediaState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  item?: WikimediaMediaItem;
};

export type TimelineImagePreviewState = {
  url: string;
  alt: string;
  caption: string;
  pageUrl: string;
};

export const parseWikimediaMedia = (payload: unknown): WikimediaMediaItem[] => {
  if (!payload || typeof payload !== 'object') return [];
  const root = payload as {
    query?: {
      pages?: Record<
        string,
        {
          pageid?: number;
          title?: string;
          imageinfo?: Array<{
            url?: string;
            mime?: string;
            descriptionurl?: string;
            extmetadata?: {
              ImageDescription?: { value?: string };
              LicenseShortName?: { value?: string };
            };
          }>;
        }
      >;
    };
  };

  const pages = root.query?.pages;
  if (!pages) return [];

  return Object.values(pages)
    .map((page, index) => {
      const imageInfo = page.imageinfo?.[0];
      if (!imageInfo?.url || !imageInfo.descriptionurl) return null;

      const cleanTitle = (page.title || `Файл ${index + 1}`).replace(/^File:/i, '');
      const item: WikimediaMediaItem = {
        id: String(page.pageid ?? index + 1),
        title: cleanTitle,
        url: imageInfo.url,
        pageUrl: imageInfo.descriptionurl,
        mime: imageInfo.mime,
        description: stripHtml(imageInfo.extmetadata?.ImageDescription?.value),
        license: stripHtml(imageInfo.extmetadata?.LicenseShortName?.value),
      };
      return item;
    })
    .filter((item): item is WikimediaMediaItem => item !== null);
};

export const TIMELINE_SUBJECT_QUERY_HINTS: Record<
  NonNullable<TimelineExplorerSpec['subject']>,
  string
> = {
  biology: 'biology diagram',
  literature: 'book illustration portrait',
  history: 'historical painting archive',
  general: 'educational illustration',
};

export const fetchWikimediaImage = async (query: string, signal: AbortSignal) => {
  const normalized = query.trim();
  if (!normalized) return null;

  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'search',
    gsrnamespace: '6',
    gsrlimit: '10',
    gsrsearch: normalized,
    prop: 'imageinfo',
    iiprop: 'url|mime|extmetadata',
    iiurlwidth: '1400',
  });

  const response = await fetch(
    `https://commons.wikimedia.org/w/api.php?${params.toString()}`,
    { signal }
  );
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const payload = (await response.json()) as unknown;
  const item =
    parseWikimediaMedia(payload).find((entry) =>
      entry.mime ? entry.mime.startsWith('image/') : true
    ) ?? null;
  return item;
};

export const GALLERY_LIMIT_OPTIONS = [4, 6, 8, 10, 12] as const;

export const normalizeGalleryLimitOption = (value: number) =>
  GALLERY_LIMIT_OPTIONS.reduce((best, option) =>
    Math.abs(option - value) < Math.abs(best - value) ? option : best
  );

export const MEDIA_COMMAND_WORDS_RE =
  /\b(покажи|показать|покажи|найди|подбери|нужн[аоы]?|дай|мне|please|show|find|display|image|images|photo|picture|video|галерея|изображение|изображения|фото|картинка|картинки)\b/gi;

export const MEDIA_FILLER_WORDS_RE =
  /\b(по|теме|про|о|about|for|the|a|an)\b/gi;

export const toEnglishBiologyQuery = (source: string) => {
  const replacements: Array<[RegExp, string]> = [
    [/\bживотн\w*\s+клетк\w*\b/gi, 'animal cell'],
    [/\bрастительн\w*\s+клетк\w*\b/gi, 'plant cell'],
    [/\bстроени\w*\b/gi, 'structure'],
    [/\bклетк\w*\b/gi, 'cell'],
    [/\bядр\w*\b/gi, 'nucleus'],
    [/\bмембран\w*\b/gi, 'membrane'],
    [/\bорганоид\w*\b/gi, 'organelle'],
    [/\bцитоплазм\w*\b/gi, 'cytoplasm'],
    [/\bмитоз\w*\b/gi, 'mitosis'],
    [/\bхромосом\w*\b/gi, 'chromosome'],
  ];

  let next = source.toLowerCase();
  replacements.forEach(([pattern, value]) => {
    next = next.replace(pattern, value);
  });

  next = next
    .replace(/[а-яё]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return next;
};

export const buildMediaSearchCandidates = (
  rawQuery: string,
  subject?: TimelineExplorerSpec['subject'] | MediaGalleryExplorerSpec['subject']
) => {
  const initial = rawQuery.trim();
  const cleaned = initial
    .replace(MEDIA_COMMAND_WORDS_RE, ' ')
    .replace(MEDIA_FILLER_WORDS_RE, ' ')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const subjectHints: Record<
    NonNullable<MediaGalleryExplorerSpec['subject']>,
    string
  > = {
    biology: 'diagram',
    literature: 'illustration',
    history: 'archive',
    general: 'educational',
  };
  const hint = subjectHints[subject ?? 'general'];

  const englishBio = subject === 'biology' ? toEnglishBiologyQuery(cleaned || initial) : '';

  const candidates = [
    initial,
    cleaned,
    cleaned ? `${cleaned} ${hint}` : '',
    englishBio ? `${englishBio} diagram` : '',
    englishBio,
  ]
    .map((value) => value.trim())
    .filter((value) => value.length >= 2);

  return Array.from(new Set(candidates)).slice(0, 6);
};
