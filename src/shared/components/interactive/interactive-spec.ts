import { z } from 'zod';

const rangeSchema = z.object({
  min: z.coerce.number().finite(),
  max: z.coerce.number().finite(),
  step: z.coerce.number().finite(),
});

const trigFunctionSchema = z.enum(['sin', 'cos', 'tan']);

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

export interface QuadraticExplorerSpec {
  type: 'quadratic_explorer';
  title: string;
  params: {
    a: number;
    b: number;
    c: number;
  };
  ranges: {
    a: { min: number; max: number; step: number };
    b: { min: number; max: number; step: number };
    c: { min: number; max: number; step: number };
  };
}

export interface LinearExplorerSpec {
  type: 'linear_explorer';
  title: string;
  params: {
    slope: number;
    intercept: number;
  };
  ranges: {
    slope: { min: number; max: number; step: number };
    intercept: { min: number; max: number; step: number };
  };
}

export interface TrigExplorerSpec {
  type: 'trig_explorer';
  title: string;
  function: z.infer<typeof trigFunctionSchema>;
  params: {
    amplitude: number;
    frequency: number;
    phase: number;
    offset: number;
  };
  ranges: {
    amplitude: { min: number; max: number; step: number };
    frequency: { min: number; max: number; step: number };
    phase: { min: number; max: number; step: number };
    offset: { min: number; max: number; step: number };
  };
}

export type SingleInteractiveSpec = QuadraticExplorerSpec | LinearExplorerSpec | TrigExplorerSpec;

export interface ComparisonSeriesSpec {
  id: string;
  label?: string;
  color?: string;
  spec: SingleInteractiveSpec;
}

export interface ComparisonExplorerSpec {
  type: 'comparison_explorer';
  title: string;
  mode: 'overlay';
  series: [ComparisonSeriesSpec, ComparisonSeriesSpec];
}

export type InteractiveSpec = SingleInteractiveSpec | ComparisonExplorerSpec;

const DEFAULT_RANGES = {
  a: { min: -5, max: 5, step: 0.1 },
  b: { min: -10, max: 10, step: 0.1 },
  c: { min: -10, max: 10, step: 0.1 },
};
const DEFAULT_TRIG_RANGES = {
  amplitude: { min: -5, max: 5, step: 0.1 },
  frequency: { min: -5, max: 5, step: 0.1 },
  phase: { min: -6.283, max: 6.283, step: 0.1 },
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

    const firstSpec = parseSingleInteractiveSpec(firstRaw.spec ?? firstRaw);
    const secondSpec = parseSingleInteractiveSpec(secondRaw.spec ?? secondRaw);
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

  return parseSingleInteractiveSpec(parsed);
};
