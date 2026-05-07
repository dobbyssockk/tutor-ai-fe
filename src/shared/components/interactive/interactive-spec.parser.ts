import { z } from 'zod';

import type {
  ChartInteractiveSpec,
  InteractiveSpec,
  InteractiveSubject,
  SingleInteractiveSpec,
} from '@/shared/components/interactive/interactive-spec.types';


const rangeSchema = z.object({
  min: z.coerce.number().finite(),
  max: z.coerce.number().finite(),
  step: z.coerce.number().finite(),
});

const trigFunctionSchema = z.enum(['sin', 'cos', 'tan']);
const subjectSchema = z.enum(['biology', 'literature', 'history', 'general']);

const quadraticRawSchema = z.object({
  type: z.literal('quadratic_explorer'),
  title: z.string().trim().min(1).max(120).optional(),
  params: z.object({
    a: z.coerce.number().finite(),
    b: z.coerce.number().finite(),
    c: z.coerce.number().finite(),
  }),
  ranges: z
    .object({
      a: rangeSchema.optional(),
      b: rangeSchema.optional(),
      c: rangeSchema.optional(),
    })
    .optional(),
});

const linearRawSchema = z.object({
  type: z.literal('linear_explorer'),
  title: z.string().trim().min(1).max(120).optional(),
  params: z.object({
    slope: z.coerce.number().finite(),
    intercept: z.coerce.number().finite(),
  }),
  ranges: z
    .object({
      slope: rangeSchema.optional(),
      intercept: rangeSchema.optional(),
    })
    .optional(),
});

const trigRawSchema = z.object({
  type: z.literal('trig_explorer'),
  title: z.string().trim().min(1).max(120).optional(),
  function: trigFunctionSchema,
  params: z.object({
    amplitude: z.coerce.number().finite(),
    frequency: z.coerce.number().finite(),
    phase: z.coerce.number().finite(),
    offset: z.coerce.number().finite(),
  }),
  ranges: z
    .object({
      amplitude: rangeSchema.optional(),
      frequency: rangeSchema.optional(),
      phase: rangeSchema.optional(),
      offset: rangeSchema.optional(),
    })
    .optional(),
});

const comparisonRawSchema = z.object({
  type: z.literal('comparison_explorer'),
  title: z.string().trim().min(1).max(120).optional(),
  mode: z.literal('overlay').optional(),
  series: z
    .array(
      z
        .object({
          id: z.string().trim().min(1).max(40).optional(),
          label: z.string().trim().min(1).max(120).optional(),
          color: z.string().trim().min(1).max(40).optional(),
          spec: z.unknown().optional(),
        })
        .passthrough()
    )
    .min(2),
});

const timelineStepRawSchema = z.object({
  id: z.string().trim().min(1).max(40).optional(),
  title: z.string().trim().min(1).max(120),
  details: z.string().trim().min(1).max(600).optional(),
  period: z.string().trim().min(1).max(80).optional(),
  imageQuery: z.string().trim().min(1).max(120).optional(),
  imageCaption: z.string().trim().min(1).max(400).optional(),
  keyPoints: z.array(z.string().trim().min(1).max(180)).max(8).optional(),
  outcomes: z.array(z.string().trim().min(1).max(180)).max(6).optional(),
  terms: z.array(z.string().trim().min(1).max(60)).max(10).optional(),
  commonMistake: z.string().trim().min(1).max(400).optional(),
  checkQuestion: z.string().trim().min(1).max(400).optional(),
  checkAnswer: z.string().trim().min(1).max(400).optional(),
});

const timelineRawSchema = z.object({
  type: z.literal('timeline_explorer'),
  title: z.string().trim().min(1).max(120).optional(),
  subject: subjectSchema.optional(),
  steps: z.array(timelineStepRawSchema).min(2).max(12),
  initialStepId: z.string().trim().min(1).max(40).optional(),
});

const mediaGalleryRawSchema = z.object({
  type: z.literal('media_gallery_explorer'),
  title: z.string().trim().min(1).max(120).optional(),
  subject: subjectSchema.optional(),
  query: z.string().trim().min(1).max(120),
  mediaType: z.enum(['image', 'video']).optional(),
  limit: z.coerce.number().finite().optional(),
});


const DEFAULT_RANGES = {
  a: { min: -5, max: 5, step: 0.1 },
  b: { min: -10, max: 10, step: 0.1 },
  c: { min: -10, max: 10, step: 0.1 },
};
const DEFAULT_TRIG_RANGES = {
  amplitude: { min: -5, max: 5, step: 0.1 },
  frequency: { min: -5, max: 5, step: 0.1 },
  phase: { min: -6.2832, max: 6.2832, step: 0.1 },
  offset: { min: -10, max: 10, step: 0.1 },
};

const toNumber = (value: number, digits = 3) => Number(value.toFixed(digits));

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const normalizeRange = (
  range: z.infer<typeof rangeSchema> | undefined,
  fallback: { min: number; max: number; step: number }
) => {
  if (!range) return fallback;

  const min = toNumber(range.min);
  const max = toNumber(range.max);
  const step = toNumber(range.step);
  if (min >= max) return fallback;
  if (step <= 0 || step > max - min) return fallback;

  return { min, max, step };
};

const sanitizeColor = (value: unknown) => {
  if (typeof value !== 'string') return undefined;
  const color = value.trim();
  if (!color || color.length > 40) return undefined;
  return color;
};

const normalizeSubject = (value: unknown): InteractiveSubject | undefined => {
  if (typeof value !== 'string') return undefined;
  const lowered = value.trim().toLowerCase();
  if (!lowered) return undefined;
  if (/(биолог|biology|bio)/i.test(lowered)) return 'biology';
  if (/(литерат|literature|book|poem|author)/i.test(lowered)) return 'literature';
  if (/(истор|history)/i.test(lowered)) return 'history';
  return 'general';
};

const MEDIA_QUERY_STOP_WORDS = new Set([
  'about',
  'display',
  'find',
  'for',
  'gallery',
  'give',
  'image',
  'images',
  'photo',
  'photos',
  'please',
  'show',
  'video',
  'videos',
  'галерею',
  'галереи',
  'галерея',
  'изображение',
  'изображения',
  'картинка',
  'картинки',
  'картинку',
  'медиа',
  'мне',
  'найди',
  'о',
  'об',
  'открытых',
  'пж',
  'пожалуйста',
  'покажи',
  'показ',
  'показать',
  'подбери',
  'по',
  'про',
  'тема',
  'теме',
  'фото',
  'фотографии',
  'фотографию',
  'видео',
]);

const sanitizeMediaQueryText = (value: string) =>
  value
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => {
      if (!token) return false;
      return !MEDIA_QUERY_STOP_WORDS.has(token.toLowerCase());
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);

const parseSingleInteractiveSpec = (parsed: unknown): SingleInteractiveSpec | null => {
  const typed = z
    .object({ type: z.string() })
    .passthrough()
    .safeParse(parsed);

  if (!typed.success) return null;

  if (typed.data.type === 'quadratic_explorer') {
    const result = quadraticRawSchema.safeParse(parsed);
    if (!result.success) return null;

    const { params, ranges } = result.data;
    const a = clamp(toNumber(params.a), -100, 100);
    const b = clamp(toNumber(params.b), -100, 100);
    const c = clamp(toNumber(params.c), -100, 100);
    if (Math.abs(a) < 1e-9) {
      return {
        type: 'linear_explorer',
        title: result.data.title || 'Интерактивная линейная функция',
        params: { slope: b, intercept: c },
        ranges: {
          slope: normalizeRange(ranges?.b, DEFAULT_RANGES.b),
          intercept: normalizeRange(ranges?.c, DEFAULT_RANGES.c),
        },
      };
    }

    return {
      type: 'quadratic_explorer',
      title: result.data.title || 'Интерактивная квадратичная функция',
      params: { a, b, c },
      ranges: {
        a: normalizeRange(ranges?.a, DEFAULT_RANGES.a),
        b: normalizeRange(ranges?.b, DEFAULT_RANGES.b),
        c: normalizeRange(ranges?.c, DEFAULT_RANGES.c),
      },
    };
  }

  if (typed.data.type === 'linear_explorer') {
    const result = linearRawSchema.safeParse(parsed);
    if (!result.success) return null;

    const slope = clamp(toNumber(result.data.params.slope), -100, 100);
    const intercept = clamp(toNumber(result.data.params.intercept), -100, 100);

    return {
      type: 'linear_explorer',
      title: result.data.title || 'Интерактивная линейная функция',
      params: { slope, intercept },
      ranges: {
        slope: normalizeRange(result.data.ranges?.slope, DEFAULT_RANGES.b),
        intercept: normalizeRange(result.data.ranges?.intercept, DEFAULT_RANGES.c),
      },
    };
  }

  if (typed.data.type === 'trig_explorer') {
    const result = trigRawSchema.safeParse(parsed);
    if (!result.success) return null;

    return {
      type: 'trig_explorer',
      title: result.data.title || 'Интерактивная тригонометрическая функция',
      function: result.data.function,
      params: {
        amplitude: clamp(toNumber(result.data.params.amplitude), -100, 100),
        frequency: clamp(toNumber(result.data.params.frequency), -20, 20),
        phase: clamp(toNumber(result.data.params.phase), -20, 20),
        offset: clamp(toNumber(result.data.params.offset), -100, 100),
      },
      ranges: {
        amplitude: normalizeRange(result.data.ranges?.amplitude, DEFAULT_TRIG_RANGES.amplitude),
        frequency: normalizeRange(result.data.ranges?.frequency, DEFAULT_TRIG_RANGES.frequency),
        phase: normalizeRange(result.data.ranges?.phase, DEFAULT_TRIG_RANGES.phase),
        offset: normalizeRange(result.data.ranges?.offset, DEFAULT_TRIG_RANGES.offset),
      },
    };
  }

  if (typed.data.type === 'timeline_explorer') {
    const result = timelineRawSchema.safeParse(parsed);
    if (!result.success) return null;

    const steps = result.data.steps.map((step, index) => ({
      id: step.id || `step_${index + 1}`,
      title: step.title,
      details: step.details,
      period: step.period,
      imageQuery: step.imageQuery,
      imageCaption: step.imageCaption,
      keyPoints: step.keyPoints,
      outcomes: step.outcomes,
      terms: step.terms,
      commonMistake: step.commonMistake,
      checkQuestion: step.checkQuestion,
      checkAnswer: step.checkAnswer,
    }));
    const initialStepId =
      result.data.initialStepId && steps.some((step) => step.id === result.data.initialStepId)
        ? result.data.initialStepId
        : steps[0]?.id || 'step_1';

    return {
      type: 'timeline_explorer',
      title: result.data.title || 'Интерактивный таймлайн',
      subject: result.data.subject,
      steps,
      initialStepId,
    };
  }

  if (typed.data.type === 'media_gallery_explorer') {
    const result = mediaGalleryRawSchema.safeParse(parsed);
    if (!result.success) return null;

    const clampedLimit = result.data.limit == null ? 6 : Math.round(clamp(result.data.limit, 3, 12));
    const plainQuery = result.data.query.trim();
    const cleanedQuery = sanitizeMediaQueryText(plainQuery);

    return {
      type: 'media_gallery_explorer',
      title: result.data.title || 'Медиа-галерея по теме',
      subject: result.data.subject,
      query: cleanedQuery || plainQuery,
      mediaType: result.data.mediaType || 'image',
      limit: clampedLimit,
    };
  }

  return null;
};

const parseChartInteractiveSpec = (parsed: unknown): ChartInteractiveSpec | null => {
  const spec = parseSingleInteractiveSpec(parsed);
  if (!spec) return null;
  if (spec.type === 'quadratic_explorer') return spec;
  if (spec.type === 'linear_explorer') return spec;
  if (spec.type === 'trig_explorer') return spec;
  return null;
};

export const parseInteractiveSpec = (rawJson: string): InteractiveSpec | null => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return null;
  }

  const typed = z
    .object({ type: z.string() })
    .passthrough()
    .safeParse(parsed);
  if (!typed.success) return null;

  if (typed.data.type === 'comparison_explorer') {
    const result = comparisonRawSchema.safeParse(parsed);
    if (!result.success) return null;

    const firstRaw = result.data.series[0];
    const secondRaw = result.data.series[1];
    if (!firstRaw || !secondRaw) return null;

    const firstSpec = parseChartInteractiveSpec(firstRaw.spec ?? firstRaw);
    const secondSpec = parseChartInteractiveSpec(secondRaw.spec ?? secondRaw);
    if (!firstSpec || !secondSpec) return null;

    const firstId = firstRaw.id || 'f1';
    const secondId = secondRaw.id || 'f2';

    return {
      type: 'comparison_explorer',
      title: result.data.title || 'Сравнение двух функций',
      mode: 'overlay',
      series: [
        {
          id: firstId,
          label: firstRaw.label || firstSpec.title,
          color: sanitizeColor(firstRaw.color),
          spec: firstSpec,
        },
        {
          id: secondId,
          label: secondRaw.label || secondSpec.title,
          color: sanitizeColor(secondRaw.color),
          spec: secondSpec,
        },
      ],
    };
  }

  const single = parseSingleInteractiveSpec(parsed);
  if (single) return single;

  if (typeof parsed === 'object' && parsed) {
    const fallback = parsed as Record<string, unknown>;
    if (Array.isArray(fallback.steps) || Array.isArray(fallback.events)) {
      const normalized = parseSingleInteractiveSpec({
        ...fallback,
        type: 'timeline_explorer',
        steps: fallback.steps ?? fallback.events,
        subject: normalizeSubject(fallback.subject ?? fallback.discipline),
      });
      if (normalized) return normalized;
    }

    if (typeof fallback.query === 'string' || typeof fallback.search === 'string') {
      const normalized = parseSingleInteractiveSpec({
        ...fallback,
        type: 'media_gallery_explorer',
        query: fallback.query ?? fallback.search,
        subject: normalizeSubject(fallback.subject ?? fallback.discipline),
      });
      if (normalized) return normalized;
    }
  }

  return null;
};
