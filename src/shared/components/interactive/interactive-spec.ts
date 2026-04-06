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

export type InteractiveSpec = QuadraticExplorerSpec | TrigExplorerSpec;

const DEFAULT_RANGES = {
  a: { min: -5, max: 5, step: 0.1 },
  b: { min: -10, max: 10, step: 0.1 },
  c: { min: -10, max: 10, step: 0.1 },
};
const LOCKED_A_RANGE = { min: 0, max: 0, step: 1 };

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

  if (typed.data.type === 'quadratic_explorer') {
    const result = quadraticRawSchema.safeParse(parsed);
    if (!result.success) return null;

    const { params, ranges } = result.data;
    const a = clamp(toNumber(params.a), -100, 100);
    const b = clamp(toNumber(params.b), -100, 100);
    const c = clamp(toNumber(params.c), -100, 100);

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
      type: 'quadratic_explorer',
      title: result.data.title || 'Интерактивная линейная функция',
      params: { a: 0, b: slope, c: intercept },
      ranges: {
        a: LOCKED_A_RANGE,
        b: normalizeRange(result.data.ranges?.slope, DEFAULT_RANGES.b),
        c: normalizeRange(result.data.ranges?.intercept, DEFAULT_RANGES.c),
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
