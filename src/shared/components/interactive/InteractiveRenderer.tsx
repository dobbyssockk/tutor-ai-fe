import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type {
  ChartInteractiveSpec,
  ComparisonExplorerSpec,
  InteractiveSpec,
  LinearExplorerSpec,
  MediaGalleryExplorerSpec,
  QuadraticExplorerSpec,
  TimelineExplorerSpec,
  TrigExplorerSpec,
} from '@/shared/components/interactive/interactive-spec';

type InteractiveRendererProps = {
  spec: InteractiveSpec;
};

const toNumber = (value: number, digits = 3) => Number(value.toFixed(digits));

const formatNumber = (value: number, digits = 2) => {
  const rounded = Number(value.toFixed(digits));
  return Number.isInteger(rounded) ? `${rounded}` : `${rounded}`;
};

const chooseGridStep = (span: number) => {
  const target = span / 8;
  const options = [0.2, 0.5, 1, 2, 5, 10, 20, 50];
  return options.find((option) => option >= target) ?? 100;
};

const buildEquationText = (a: number, b: number, c: number) => {
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

const buildTrigEquationText = (
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

const evaluateFunctionAt = (spec: ChartInteractiveSpec, x: number) => {
  if (spec.type === 'quadratic_explorer') {
    return spec.params.a * x * x + spec.params.b * x + spec.params.c;
  }
  if (spec.type === 'linear_explorer') {
    return spec.params.slope * x + spec.params.intercept;
  }
  const trigFn = spec.function === 'cos' ? Math.cos : spec.function === 'tan' ? Math.tan : Math.sin;
  return spec.params.amplitude * trigFn(spec.params.frequency * x + spec.params.phase) + spec.params.offset;
};

const buildSingleEquationText = (spec: ChartInteractiveSpec) => {
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

const SUBJECT_LABELS: Record<
  NonNullable<TimelineExplorerSpec['subject']>,
  string
> = {
  biology: 'Биология',
  literature: 'Литература',
  history: 'История',
  general: 'Общий предмет',
};

const getSubjectLabel = (
  subject: TimelineExplorerSpec['subject'] | MediaGalleryExplorerSpec['subject']
) => {
  if (!subject) return null;
  return SUBJECT_LABELS[subject] ?? 'Общий предмет';
};

const stripHtml = (raw?: string | null) => {
  if (!raw) return '';
  return raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
};

type WikimediaMediaItem = {
  id: string;
  title: string;
  url: string;
  pageUrl: string;
  mime?: string;
  description?: string;
  license?: string;
};

type TimelineMediaState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  item?: WikimediaMediaItem;
};

type TimelineImagePreviewState = {
  url: string;
  alt: string;
  caption: string;
  pageUrl: string;
};

const parseWikimediaMedia = (payload: unknown): WikimediaMediaItem[] => {
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
      return {
        id: String(page.pageid ?? index + 1),
        title: cleanTitle,
        url: imageInfo.url,
        pageUrl: imageInfo.descriptionurl,
        mime: imageInfo.mime,
        description: stripHtml(imageInfo.extmetadata?.ImageDescription?.value),
        license: stripHtml(imageInfo.extmetadata?.LicenseShortName?.value),
      } satisfies WikimediaMediaItem;
    })
    .filter((item): item is WikimediaMediaItem => Boolean(item));
};

const TIMELINE_SUBJECT_QUERY_HINTS: Record<
  NonNullable<TimelineExplorerSpec['subject']>,
  string
> = {
  biology: 'biology diagram',
  literature: 'book illustration portrait',
  history: 'historical painting archive',
  general: 'educational illustration',
};

const fetchWikimediaImage = async (query: string, signal: AbortSignal) => {
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

const GALLERY_LIMIT_OPTIONS = [4, 6, 8, 10, 12] as const;

const normalizeGalleryLimitOption = (value: number) =>
  GALLERY_LIMIT_OPTIONS.reduce((best, option) =>
    Math.abs(option - value) < Math.abs(best - value) ? option : best
  );

const MEDIA_COMMAND_WORDS_RE =
  /\b(покажи|показать|покажи|найди|подбери|нужн[аоы]?|дай|мне|please|show|find|display|image|images|photo|picture|video|галерея|изображение|изображения|фото|картинка|картинки)\b/gi;

const MEDIA_FILLER_WORDS_RE =
  /\b(по|теме|про|о|about|for|the|a|an)\b/gi;

const toEnglishBiologyQuery = (source: string) => {
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

const buildMediaSearchCandidates = (
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

const SliderRow = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) => {
  const [draftValue, setDraftValue] = useState(String(value));

  useEffect(() => {
    setDraftValue(String(value));
  }, [value]);

  const parseDraftValue = (raw: string) => {
    const normalized = raw.replace(',', '.').trim();
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const clampValue = (next: number) => Math.min(max, Math.max(min, next));

  const parsedDraftValue = parseDraftValue(draftValue);
  const isOutOfRange =
    parsedDraftValue !== null &&
    (parsedDraftValue < min || parsedDraftValue > max);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <span className="w-28 text-xs text-muted-foreground">{label}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-1.5 flex-1 accent-indigo-600"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={draftValue}
          aria-invalid={isOutOfRange}
          onChange={(event) => {
            const raw = event.target.value;
            setDraftValue(raw);
            const parsed = parseDraftValue(raw);
            if (parsed === null || parsed < min || parsed > max) return;
            onChange(parsed);
          }}
          onBlur={() => {
            const parsed = parseDraftValue(draftValue);
            if (parsed === null) {
              setDraftValue(String(value));
              return;
            }
            const clamped = clampValue(parsed);
            onChange(clamped);
            setDraftValue(String(clamped));
          }}
          className={`h-7 w-16 rounded-md border bg-background px-1.5 py-0 text-right font-medium text-xs ${
            isOutOfRange
              ? 'border-destructive text-destructive'
              : ''
          }`}
        />
      </div>
      {isOutOfRange ? (
        <p className="ml-auto text-[11px] text-destructive">
          Диапазон: {formatNumber(min)}..{formatNumber(max)}
        </p>
      ) : null}
    </div>
  );
};

const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border bg-muted/40 px-3 py-2">
    <p className="text-[11px] text-muted-foreground">{label}</p>
    <p className="text-sm font-medium">{value}</p>
  </div>
);

const QuadraticExplorer = ({ spec }: { spec: QuadraticExplorerSpec }) => {
  const [a, setA] = useState(spec.params.a);
  const [b, setB] = useState(spec.params.b);
  const [c, setC] = useState(spec.params.c);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setA(spec.params.a);
    setB(spec.params.b);
    setC(spec.params.c);
  }, [spec.params.a, spec.params.b, spec.params.c]);

  const equation = useMemo(() => buildEquationText(a, b, c), [a, b, c]);

  const samplePoints = useMemo(() => {
    const centerX = Math.abs(a) > 1e-9 ? -b / (2 * a) : 0;
    const xs = [-2, -1, 0, 1, 2].map((offset) => toNumber(centerX + offset, 2));
    const uniqueXs = Array.from(new Set(xs));

    return uniqueXs.map((x) => ({
      x,
      y: toNumber(a * x * x + b * x + c, 2),
    }));
  }, [a, b, c]);

  const mathInfo = useMemo(() => {
    if (Math.abs(a) < 1e-9) {
      const root = Math.abs(b) > 1e-9 ? -c / b : null;
      return {
        vertex: '—',
        axis: '—',
        discriminant: '—',
        roots:
          root !== null
            ? `x = ${formatNumber(root)}`
            : Math.abs(c) < 1e-9
              ? 'вся ось OX'
              : 'нет',
      };
    }

    const xv = -b / (2 * a);
    const yv = a * xv * xv + b * xv + c;
    const discriminant = b * b - 4 * a * c;

    let roots = 'нет (D < 0)';
    if (Math.abs(discriminant) < 1e-9) {
      roots = `x = ${formatNumber(xv)} (касание)`;
    } else if (discriminant > 0) {
      const d = Math.sqrt(discriminant);
      const x1 = (-b - d) / (2 * a);
      const x2 = (-b + d) / (2 * a);
      roots = `x₁ = ${formatNumber(x1)}, x₂ = ${formatNumber(x2)}`;
    }

    return {
      vertex: `(${formatNumber(xv)}, ${formatNumber(yv)})`,
      axis: `x = ${formatNumber(xv)}`,
      discriminant: `D = ${formatNumber(discriminant)}`,
      roots,
    };
  }, [a, b, c]);

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 640;
      const height = canvas.clientHeight || 380;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const xv = Math.abs(a) > 1e-9 ? -b / (2 * a) : 0;
      const yv = Math.abs(a) > 1e-9 ? a * xv * xv + b * xv + c : c;

      let xMin = xv - 8;
      let xMax = xv + 8;
      let yMin = yv - 6;
      let yMax = yv + 10;

      if (Math.abs(a) < 1e-9) {
        xMin = -10;
        xMax = 10;
        yMin = -10;
        yMax = 10;
      } else if (a < 0) {
        yMin = yv - 10;
        yMax = yv + 6;
      }

      const sx = width / (xMax - xMin);
      const sy = height / (yMax - yMin);
      const tx = (x: number) => (x - xMin) * sx;
      const ty = (y: number) => height - (y - yMin) * sy;

      const gridColor = 'rgba(0,0,0,0.08)';
      const axisColor = 'rgba(0,0,0,0.34)';
      const textColor = 'rgba(0,0,0,0.55)';
      const curveColor = '#534AB7';
      const vertexColor = '#D85A30';
      const rootColor = '#1D9E75';

      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.7;
      for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += 1) {
        ctx.beginPath();
        ctx.moveTo(tx(x), 0);
        ctx.lineTo(tx(x), height);
        ctx.stroke();
      }
      for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y += 1) {
        ctx.beginPath();
        ctx.moveTo(0, ty(y));
        ctx.lineTo(width, ty(y));
        ctx.stroke();
      }

      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 1.2;
      if (yMin <= 0 && yMax >= 0) {
        ctx.beginPath();
        ctx.moveTo(0, ty(0));
        ctx.lineTo(width, ty(0));
        ctx.stroke();
      }
      if (xMin <= 0 && xMax >= 0) {
        ctx.beginPath();
        ctx.moveTo(tx(0), 0);
        ctx.lineTo(tx(0), height);
        ctx.stroke();
      }

      ctx.fillStyle = textColor;
      ctx.font = '11px system-ui';
      ctx.textAlign = 'center';
      for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += 1) {
        if (x === 0) continue;
        const py = yMin <= 0 && yMax >= 0 ? ty(0) + 14 : height - 6;
        ctx.fillText(String(x), tx(x), py);
      }

      ctx.textAlign = 'right';
      for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y += 1) {
        if (y === 0) continue;
        const px = xMin <= 0 && xMax >= 0 ? tx(0) - 6 : 20;
        ctx.fillText(String(y), px, ty(y) + 4);
      }

      ctx.strokeStyle = curveColor;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      const steps = 420;
      for (let i = 0; i <= steps; i += 1) {
        const x = xMin + ((xMax - xMin) * i) / steps;
        const y = a * x * x + b * x + c;
        const px = tx(x);
        const py = ty(y);
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();

      if (Math.abs(a) > 1e-9) {
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tx(xv), 0);
        ctx.lineTo(tx(xv), height);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const drawDot = (x: number, y: number, color: string, radius: number) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(tx(x), ty(y), radius, 0, Math.PI * 2);
        ctx.fill();
      };

      if (Math.abs(a) > 1e-9) {
        drawDot(xv, yv, vertexColor, 5.5);
        ctx.fillStyle = vertexColor;
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText(`(${formatNumber(xv)}, ${formatNumber(yv)})`, tx(xv) + 10, ty(yv) - 8);

        const discriminant = b * b - 4 * a * c;
        if (discriminant > 0) {
          const d = Math.sqrt(discriminant);
          const x1 = (-b - d) / (2 * a);
          const x2 = (-b + d) / (2 * a);
          drawDot(x1, 0, rootColor, 5);
          drawDot(x2, 0, rootColor, 5);
        } else if (Math.abs(discriminant) < 1e-9) {
          drawDot(xv, 0, rootColor, 5);
        }
      } else if (Math.abs(b) > 1e-9) {
        const root = -c / b;
        drawDot(root, 0, rootColor, 5);
      }

      for (const point of samplePoints) {
        drawDot(point.x, point.y, '#2563eb', 4);
      }
    };

    draw();
    window.addEventListener('resize', draw);
    return () => {
      window.removeEventListener('resize', draw);
    };
  }, [a, b, c, samplePoints]);

  return (
    <div className="space-y-4 rounded-xl border bg-background px-4 py-4">
      <h3 className="text-center text-base font-semibold">{spec.title}</h3>

      <p className="text-center text-base font-medium tracking-tight">{equation}</p>

      <div className="space-y-2">
        <SliderRow
          label="a (кривизна)"
          value={a}
          min={spec.ranges.a.min}
          max={spec.ranges.a.max}
          step={spec.ranges.a.step}
          onChange={setA}
        />
        <SliderRow
          label="b (наклон)"
          value={b}
          min={spec.ranges.b.min}
          max={spec.ranges.b.max}
          step={spec.ranges.b.step}
          onChange={setB}
        />
        <SliderRow
          label="c (сдвиг)"
          value={c}
          min={spec.ranges.c.min}
          max={spec.ranges.c.max}
          step={spec.ranges.c.step}
          onChange={setC}
        />
      </div>

      <canvas
        ref={canvasRef}
        className="h-[380px] w-full rounded-lg border border-border/70 bg-white"
      />

      <div className="grid gap-2 sm:grid-cols-2">
        <InfoCard label="Вершина" value={mathInfo.vertex} />
        <InfoCard label="Дискриминант" value={mathInfo.discriminant} />
        <InfoCard label="Корни" value={mathInfo.roots} />
        <InfoCard label="Ось симметрии" value={mathInfo.axis} />
      </div>

      <InfoCard
        label="Опорные точки"
        value={samplePoints
          .map((point) => `(${formatNumber(point.x)}, ${formatNumber(point.y)})`)
          .join(' · ')}
      />
    </div>
  );
};

const LinearExplorer = ({ spec }: { spec: LinearExplorerSpec }) => {
  const [slope, setSlope] = useState(spec.params.slope);
  const [intercept, setIntercept] = useState(spec.params.intercept);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setSlope(spec.params.slope);
    setIntercept(spec.params.intercept);
  }, [spec.params.slope, spec.params.intercept]);

  const equation = useMemo(() => buildEquationText(0, slope, intercept), [slope, intercept]);

  const samplePoints = useMemo(() => {
    const centerX = Math.abs(slope) > 1e-9 ? -intercept / slope : 0;
    const xs = [-2, -1, 0, 1, 2].map((offset) => toNumber(centerX + offset, 2));
    const uniqueXs = Array.from(new Set(xs));

    return uniqueXs.map((x) => ({
      x,
      y: toNumber(slope * x + intercept, 2),
    }));
  }, [intercept, slope]);

  const linearInfo = useMemo(() => {
    const root =
      Math.abs(slope) > 1e-9
        ? `x = ${formatNumber(-intercept / slope)}`
        : Math.abs(intercept) < 1e-9
          ? 'вся ось OX'
          : 'нет';

    return {
      slope: formatNumber(slope),
      yIntercept: `(0, ${formatNumber(intercept)})`,
      root,
    };
  }, [intercept, slope]);

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 640;
      const height = canvas.clientHeight || 380;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const xMin = -10;
      const xMax = 10;
      const y1 = slope * xMin + intercept;
      const y2 = slope * xMax + intercept;
      const baseMin = Math.min(y1, y2, 0, intercept);
      const baseMax = Math.max(y1, y2, 0, intercept);
      const span = Math.max(baseMax - baseMin, 6);
      const padding = Math.max(2, span * 0.3);
      let yMin = baseMin - padding;
      let yMax = baseMax + padding;

      if (!Number.isFinite(yMin) || !Number.isFinite(yMax) || Math.abs(yMax - yMin) < 1e-9) {
        yMin = -10;
        yMax = 10;
      }

      const sx = width / (xMax - xMin);
      const sy = height / (yMax - yMin);
      const tx = (x: number) => (x - xMin) * sx;
      const ty = (y: number) => height - (y - yMin) * sy;

      const gridColor = 'rgba(0,0,0,0.08)';
      const axisColor = 'rgba(0,0,0,0.34)';
      const textColor = 'rgba(0,0,0,0.55)';

      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.7;
      for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += 1) {
        ctx.beginPath();
        ctx.moveTo(tx(x), 0);
        ctx.lineTo(tx(x), height);
        ctx.stroke();
      }

      const yStep = chooseGridStep(yMax - yMin);
      for (
        let y = Math.floor(yMin / yStep) * yStep;
        y <= yMax + 1e-9;
        y += yStep
      ) {
        ctx.beginPath();
        ctx.moveTo(0, ty(y));
        ctx.lineTo(width, ty(y));
        ctx.stroke();
      }

      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 1.2;
      if (yMin <= 0 && yMax >= 0) {
        ctx.beginPath();
        ctx.moveTo(0, ty(0));
        ctx.lineTo(width, ty(0));
        ctx.stroke();
      }
      if (xMin <= 0 && xMax >= 0) {
        ctx.beginPath();
        ctx.moveTo(tx(0), 0);
        ctx.lineTo(tx(0), height);
        ctx.stroke();
      }

      ctx.fillStyle = textColor;
      ctx.font = '11px system-ui';
      ctx.textAlign = 'center';
      for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += 1) {
        if (x === 0) continue;
        const py = yMin <= 0 && yMax >= 0 ? ty(0) + 14 : height - 6;
        ctx.fillText(String(x), tx(x), py);
      }

      ctx.textAlign = 'right';
      for (
        let y = Math.floor(yMin / yStep) * yStep;
        y <= yMax + 1e-9;
        y += yStep
      ) {
        if (Math.abs(y) < 1e-9) continue;
        const px = xMin <= 0 && xMax >= 0 ? tx(0) - 6 : 24;
        ctx.fillText(formatNumber(y), px, ty(y) + 4);
      }

      ctx.strokeStyle = '#534AB7';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      const steps = 420;
      for (let i = 0; i <= steps; i += 1) {
        const x = xMin + ((xMax - xMin) * i) / steps;
        const y = slope * x + intercept;
        const px = tx(x);
        const py = ty(y);
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();

      const drawDot = (x: number, y: number, color: string, radius: number) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(tx(x), ty(y), radius, 0, Math.PI * 2);
        ctx.fill();
      };

      if (Math.abs(slope) > 1e-9) {
        drawDot(-intercept / slope, 0, '#1D9E75', 5);
      }

      for (const point of samplePoints) {
        drawDot(point.x, point.y, '#2563eb', 4);
      }
    };

    draw();
    window.addEventListener('resize', draw);
    return () => {
      window.removeEventListener('resize', draw);
    };
  }, [intercept, samplePoints, slope]);

  return (
    <div className="space-y-4 rounded-xl border bg-background px-4 py-4">
      <h3 className="text-center text-base font-semibold">{spec.title}</h3>
      <p className="text-center text-base font-medium tracking-tight">{equation}</p>

      <div className="space-y-2">
        <SliderRow
          label="k (наклон)"
          value={slope}
          min={spec.ranges.slope.min}
          max={spec.ranges.slope.max}
          step={spec.ranges.slope.step}
          onChange={setSlope}
        />
        <SliderRow
          label="b (сдвиг)"
          value={intercept}
          min={spec.ranges.intercept.min}
          max={spec.ranges.intercept.max}
          step={spec.ranges.intercept.step}
          onChange={setIntercept}
        />
      </div>

      <canvas
        ref={canvasRef}
        className="h-[380px] w-full rounded-lg border border-border/70 bg-white"
      />

      <div className="grid gap-2 sm:grid-cols-2">
        <InfoCard label="Наклон (k)" value={linearInfo.slope} />
        <InfoCard label="Пересечение с OY" value={linearInfo.yIntercept} />
        <InfoCard label="Корень" value={linearInfo.root} />
      </div>

      <InfoCard
        label="Опорные точки"
        value={samplePoints
          .map((point) => `(${formatNumber(point.x)}, ${formatNumber(point.y)})`)
          .join(' · ')}
      />
    </div>
  );
};

const ComparisonExplorer = ({ spec }: { spec: ComparisonExplorerSpec }) => {
  const [series, setSeries] = useState(spec.series);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialSeriesRef = useRef(spec.series);

  useEffect(() => {
    setSeries(spec.series);
    initialSeriesRef.current = spec.series;
  }, [spec.series]);

  const hasTrig = useMemo(
    () => series.some((item) => item.spec.type === 'trig_explorer'),
    [series]
  );

  const xDomain = useMemo(() => {
    if (hasTrig) {
      return { min: -2 * Math.PI, max: 2 * Math.PI };
    }
    return { min: -10, max: 10 };
  }, [hasTrig]);

  const updateQuadraticParam = (index: number, key: 'a' | 'b' | 'c', value: number) => {
    setSeries((prev) => {
      const next = [...prev] as typeof prev;
      const current = next[index];
      if (!current || current.spec.type !== 'quadratic_explorer') return prev;
      next[index] = {
        ...current,
        spec: {
          ...current.spec,
          params: {
            ...current.spec.params,
            [key]: value,
          },
        },
      };
      return next;
    });
  };

  const updateLinearParam = (index: number, key: 'slope' | 'intercept', value: number) => {
    setSeries((prev) => {
      const next = [...prev] as typeof prev;
      const current = next[index];
      if (!current || current.spec.type !== 'linear_explorer') return prev;
      next[index] = {
        ...current,
        spec: {
          ...current.spec,
          params: {
            ...current.spec.params,
            [key]: value,
          },
        },
      };
      return next;
    });
  };

  const updateTrigParam = (
    index: number,
    key: 'amplitude' | 'frequency' | 'phase' | 'offset',
    value: number
  ) => {
    setSeries((prev) => {
      const next = [...prev] as typeof prev;
      const current = next[index];
      if (!current || current.spec.type !== 'trig_explorer') return prev;
      next[index] = {
        ...current,
        spec: {
          ...current.spec,
          params: {
            ...current.spec.params,
            [key]: value,
          },
        },
      };
      return next;
    });
  };

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 640;
      const height = canvas.clientHeight || 380;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const xMin = xDomain.min;
      const xMax = xDomain.max;
      const total = 1400;
      const values: number[] = [];

      for (const item of series) {
        for (let i = 0; i <= total; i += 1) {
          const x = xMin + ((xMax - xMin) * i) / total;
          const y = evaluateFunctionAt(item.spec, x);
          if (Number.isFinite(y) && Math.abs(y) <= 200) {
            values.push(y);
          }
        }
      }

      const minY = values.length ? Math.min(...values) : -10;
      const maxY = values.length ? Math.max(...values) : 10;
      const spanY = Math.max(maxY - minY, 2);
      const yPadding = Math.max(1, spanY * 0.2);
      const yMin = minY - yPadding;
      const yMax = maxY + yPadding;

      const sx = width / (xMax - xMin);
      const sy = height / (yMax - yMin);
      const tx = (x: number) => (x - xMin) * sx;
      const ty = (y: number) => height - (y - yMin) * sy;

      const formatPiLabel = (x: number) => {
        const half = Math.round((x / Math.PI) * 2);
        if (Math.abs((x / Math.PI) * 2 - half) > 1e-6) return formatNumber(x);
        if (half === 0) return '0';
        const sign = half < 0 ? '−' : '';
        const absHalf = Math.abs(half);
        if (absHalf === 1) return `${sign}π/2`;
        if (absHalf === 2) return `${sign}π`;
        if (absHalf % 2 === 0) return `${sign}${absHalf / 2}π`;
        return `${sign}${absHalf}π/2`;
      };

      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 0.7;

      if (hasTrig) {
        for (let x = xMin; x <= xMax + 1e-9; x += Math.PI / 2) {
          ctx.beginPath();
          ctx.moveTo(tx(x), 0);
          ctx.lineTo(tx(x), height);
          ctx.stroke();
        }
      } else {
        for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += 1) {
          ctx.beginPath();
          ctx.moveTo(tx(x), 0);
          ctx.lineTo(tx(x), height);
          ctx.stroke();
        }
      }

      const yStep = chooseGridStep(yMax - yMin);
      for (
        let y = Math.floor(yMin / yStep) * yStep;
        y <= yMax + 1e-9;
        y += yStep
      ) {
        ctx.beginPath();
        ctx.moveTo(0, ty(y));
        ctx.lineTo(width, ty(y));
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 1.2;
      if (yMin <= 0 && yMax >= 0) {
        ctx.beginPath();
        ctx.moveTo(0, ty(0));
        ctx.lineTo(width, ty(0));
        ctx.stroke();
      }
      if (xMin <= 0 && xMax >= 0) {
        ctx.beginPath();
        ctx.moveTo(tx(0), 0);
        ctx.lineTo(tx(0), height);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'center';
      if (hasTrig) {
        for (let x = xMin; x <= xMax + 1e-9; x += Math.PI / 2) {
          if (Math.abs(x) < 1e-9) continue;
          ctx.fillText(
            formatPiLabel(x),
            tx(x),
            yMin <= 0 && yMax >= 0 ? ty(0) + 14 : height - 6
          );
        }
      } else {
        for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += 1) {
          if (x === 0) continue;
          const py = yMin <= 0 && yMax >= 0 ? ty(0) + 14 : height - 6;
          ctx.fillText(String(x), tx(x), py);
        }
      }

      ctx.textAlign = 'right';
      for (
        let y = Math.floor(yMin / yStep) * yStep;
        y <= yMax + 1e-9;
        y += yStep
      ) {
        if (Math.abs(y) < 1e-9) continue;
        const px = xMin <= 0 && xMax >= 0 ? tx(0) - 6 : 24;
        ctx.fillText(formatNumber(y), px, ty(y) + 4);
      }

      const jumpLimit = (yMax - yMin) * 1.5;
      series.forEach((item, index) => {
        const color = item.color || (index === 0 ? '#1d4ed8' : '#dc2626');
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.6;
        ctx.beginPath();

        let penDown = false;
        let prevY: number | null = null;
        for (let i = 0; i <= total; i += 1) {
          const x = xMin + ((xMax - xMin) * i) / total;
          const y = evaluateFunctionAt(item.spec, x);
          const invalid = !Number.isFinite(y) || Math.abs(y) > 200;
          const hasJump = prevY !== null && Math.abs(y - prevY) > jumpLimit;

          if (invalid || hasJump) {
            penDown = false;
            prevY = invalid ? null : y;
            continue;
          }

          const px = tx(x);
          const py = ty(y);
          if (!penDown) {
            ctx.moveTo(px, py);
            penDown = true;
          } else {
            ctx.lineTo(px, py);
          }
          prevY = y;
        }
        ctx.stroke();
      });
    };

    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [hasTrig, series, xDomain.max, xDomain.min]);

  return (
    <div className="space-y-4 rounded-xl border bg-background px-4 py-4">
      <h3 className="text-center text-base font-semibold">{spec.title}</h3>

      <div className="grid gap-3 lg:grid-cols-2">
        {series.map((item, index) => {
          const seriesColor = item.color || (index === 0 ? '#1d4ed8' : '#dc2626');
          const initialSpec = initialSeriesRef.current[index]?.spec ?? item.spec;
          const initialEquation = buildSingleEquationText(initialSpec);
          const currentEquation = buildSingleEquationText(item.spec);
          const isEquationChanged = initialEquation !== currentEquation;
          const rawLabel = item.label?.trim();
          const isEquationLabel = Boolean(rawLabel && /^y\s*=/i.test(rawLabel));
          const title = !isEquationLabel && rawLabel ? rawLabel : `Функция ${index + 1}`;
          return (
            <div key={item.id} className="space-y-2 rounded-lg border bg-muted/20 px-3 py-3">
              <p className="text-sm font-semibold" style={{ color: seriesColor }}>
                {title}
              </p>
              {isEquationChanged ? (
                <>
                  <p className="text-sm text-muted-foreground">Заданная: {initialEquation}</p>
                  <p className="text-sm text-muted-foreground">Текущая: {currentEquation}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Функция: {currentEquation}</p>
              )}

              {item.spec.type === 'quadratic_explorer' && (
                <div className="space-y-2">
                  <SliderRow
                    label="кривизна"
                    value={item.spec.params.a}
                    min={item.spec.ranges.a.min}
                    max={item.spec.ranges.a.max}
                    step={item.spec.ranges.a.step}
                    onChange={(value) => updateQuadraticParam(index, 'a', value)}
                  />
                  <SliderRow
                    label="наклон"
                    value={item.spec.params.b}
                    min={item.spec.ranges.b.min}
                    max={item.spec.ranges.b.max}
                    step={item.spec.ranges.b.step}
                    onChange={(value) => updateQuadraticParam(index, 'b', value)}
                  />
                  <SliderRow
                    label="сдвиг"
                    value={item.spec.params.c}
                    min={item.spec.ranges.c.min}
                    max={item.spec.ranges.c.max}
                    step={item.spec.ranges.c.step}
                    onChange={(value) => updateQuadraticParam(index, 'c', value)}
                  />
                </div>
              )}

              {item.spec.type === 'linear_explorer' && (
                <div className="space-y-2">
                  <SliderRow
                    label="наклон"
                    value={item.spec.params.slope}
                    min={item.spec.ranges.slope.min}
                    max={item.spec.ranges.slope.max}
                    step={item.spec.ranges.slope.step}
                    onChange={(value) => updateLinearParam(index, 'slope', value)}
                  />
                  <SliderRow
                    label="сдвиг"
                    value={item.spec.params.intercept}
                    min={item.spec.ranges.intercept.min}
                    max={item.spec.ranges.intercept.max}
                    step={item.spec.ranges.intercept.step}
                    onChange={(value) => updateLinearParam(index, 'intercept', value)}
                  />
                </div>
              )}

              {item.spec.type === 'trig_explorer' && (
                <div className="space-y-2">
                  <SliderRow
                    label="амплитуда"
                    value={item.spec.params.amplitude}
                    min={item.spec.ranges.amplitude.min}
                    max={item.spec.ranges.amplitude.max}
                    step={item.spec.ranges.amplitude.step}
                    onChange={(value) => updateTrigParam(index, 'amplitude', value)}
                  />
                  <SliderRow
                    label="частота"
                    value={item.spec.params.frequency}
                    min={item.spec.ranges.frequency.min}
                    max={item.spec.ranges.frequency.max}
                    step={item.spec.ranges.frequency.step}
                    onChange={(value) => updateTrigParam(index, 'frequency', value)}
                  />
                  <SliderRow
                    label="фаза"
                    value={item.spec.params.phase}
                    min={item.spec.ranges.phase.min}
                    max={item.spec.ranges.phase.max}
                    step={item.spec.ranges.phase.step}
                    onChange={(value) => updateTrigParam(index, 'phase', value)}
                  />
                  <SliderRow
                    label="сдвиг"
                    value={item.spec.params.offset}
                    min={item.spec.ranges.offset.min}
                    max={item.spec.ranges.offset.max}
                    step={item.spec.ranges.offset.step}
                    onChange={(value) => updateTrigParam(index, 'offset', value)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <canvas
        ref={canvasRef}
        className="h-[420px] w-full rounded-lg border border-border/70 bg-white"
      />
    </div>
  );
};

const TrigExplorer = ({ spec }: { spec: TrigExplorerSpec }) => {
  const [amplitude, setAmplitude] = useState(spec.params.amplitude);
  const [frequency, setFrequency] = useState(spec.params.frequency);
  const [phase, setPhase] = useState(spec.params.phase);
  const [offset, setOffset] = useState(spec.params.offset);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setAmplitude(spec.params.amplitude);
    setFrequency(spec.params.frequency);
    setPhase(spec.params.phase);
    setOffset(spec.params.offset);
  }, [spec.params.amplitude, spec.params.frequency, spec.params.phase, spec.params.offset]);

  const trigFn = useMemo(() => {
    if (spec.function === 'cos') return Math.cos;
    if (spec.function === 'tan') return Math.tan;
    return Math.sin;
  }, [spec.function]);

  const equation = useMemo(
    () => buildTrigEquationText(spec.function, amplitude, frequency, phase, offset),
    [amplitude, frequency, offset, phase, spec.function]
  );

  const samplePoints = useMemo(() => {
    const xs = [-Math.PI, -Math.PI / 2, 0, Math.PI / 2, Math.PI];
    return xs
      .map((x) => {
        const y = amplitude * trigFn(frequency * x + phase) + offset;
        if (!Number.isFinite(y) || Math.abs(y) > 120) return null;
        return { x: toNumber(x, 2), y: toNumber(y, 2) };
      })
      .filter((point): point is { x: number; y: number } => point !== null);
  }, [amplitude, frequency, offset, phase, trigFn]);

  const trigInfo = useMemo(() => {
    const periodBase = spec.function === 'tan' ? Math.PI : 2 * Math.PI;
    const period = Math.abs(frequency) < 1e-9 ? null : periodBase / Math.abs(frequency);
    const y0 = amplitude * trigFn(phase) + offset;

    return {
      period: period === null ? '∞ (B = 0)' : formatNumber(period, 3),
      amplitude:
        spec.function === 'tan' ? '— (не ограничено)' : formatNumber(Math.abs(amplitude)),
      midline: `y = ${formatNumber(offset)}`,
      valueAtZero:
        Number.isFinite(y0) && Math.abs(y0) <= 120 ? formatNumber(y0) : 'не определено',
    };
  }, [amplitude, frequency, offset, phase, spec.function, trigFn]);

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 640;
      const height = canvas.clientHeight || 380;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const xMin = -2 * Math.PI;
      const xMax = 2 * Math.PI;
      const values: number[] = [];
      const total = 1200;
      for (let i = 0; i <= total; i += 1) {
        const x = xMin + ((xMax - xMin) * i) / total;
        const y = amplitude * trigFn(frequency * x + phase) + offset;
        if (Number.isFinite(y) && Math.abs(y) <= 120) {
          values.push(y);
        }
      }

      const minY = values.length ? Math.min(...values) : offset - 2;
      const maxY = values.length ? Math.max(...values) : offset + 2;
      const spanY = Math.max(maxY - minY, 2);
      const yPadding = Math.max(1, spanY * 0.2);
      const yMin = minY - yPadding;
      const yMax = maxY + yPadding;

      const sx = width / (xMax - xMin);
      const sy = height / (yMax - yMin);
      const tx = (x: number) => (x - xMin) * sx;
      const ty = (y: number) => height - (y - yMin) * sy;

      const formatPiLabel = (x: number) => {
        const half = Math.round((x / Math.PI) * 2);
        if (Math.abs((x / Math.PI) * 2 - half) > 1e-6) return formatNumber(x);
        if (half === 0) return '0';
        const sign = half < 0 ? '−' : '';
        const absHalf = Math.abs(half);
        if (absHalf === 1) return `${sign}π/2`;
        if (absHalf === 2) return `${sign}π`;
        if (absHalf % 2 === 0) return `${sign}${absHalf / 2}π`;
        return `${sign}${absHalf}π/2`;
      };

      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 0.7;

      for (let x = xMin; x <= xMax + 1e-9; x += Math.PI / 2) {
        ctx.beginPath();
        ctx.moveTo(tx(x), 0);
        ctx.lineTo(tx(x), height);
        ctx.stroke();
      }

      const yStep = chooseGridStep(yMax - yMin);
      for (
        let y = Math.floor(yMin / yStep) * yStep;
        y <= yMax + 1e-9;
        y += yStep
      ) {
        ctx.beginPath();
        ctx.moveTo(0, ty(y));
        ctx.lineTo(width, ty(y));
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 1.2;
      if (yMin <= 0 && yMax >= 0) {
        ctx.beginPath();
        ctx.moveTo(0, ty(0));
        ctx.lineTo(width, ty(0));
        ctx.stroke();
      }
      if (xMin <= 0 && xMax >= 0) {
        ctx.beginPath();
        ctx.moveTo(tx(0), 0);
        ctx.lineTo(tx(0), height);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'center';
      for (let x = xMin; x <= xMax + 1e-9; x += Math.PI / 2) {
        if (Math.abs(x) < 1e-9) continue;
        ctx.fillText(
          formatPiLabel(x),
          tx(x),
          yMin <= 0 && yMax >= 0 ? ty(0) + 14 : height - 6
        );
      }

      ctx.textAlign = 'right';
      for (
        let y = Math.floor(yMin / yStep) * yStep;
        y <= yMax + 1e-9;
        y += yStep
      ) {
        if (Math.abs(y) < 1e-9) continue;
        const px = xMin <= 0 && xMax >= 0 ? tx(0) - 6 : 24;
        ctx.fillText(formatNumber(y), px, ty(y) + 4);
      }

      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      let penDown = false;
      let prevY: number | null = null;
      const jumpLimit = (yMax - yMin) * 1.5;
      for (let i = 0; i <= total; i += 1) {
        const x = xMin + ((xMax - xMin) * i) / total;
        const y = amplitude * trigFn(frequency * x + phase) + offset;

        const invalid = !Number.isFinite(y) || Math.abs(y) > 120;
        const hasJump = prevY !== null && Math.abs(y - prevY) > jumpLimit;

        if (invalid || hasJump) {
          penDown = false;
          prevY = invalid ? null : y;
          continue;
        }

        const px = tx(x);
        const py = ty(y);
        if (!penDown) {
          ctx.moveTo(px, py);
          penDown = true;
        } else {
          ctx.lineTo(px, py);
        }
        prevY = y;
      }
      ctx.stroke();

      for (const point of samplePoints) {
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.arc(tx(point.x), ty(point.y), 4, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [amplitude, frequency, offset, phase, samplePoints, trigFn]);

  return (
    <div className="space-y-4 rounded-xl border bg-background px-4 py-4">
      <h3 className="text-center text-base font-semibold">{spec.title}</h3>
      <p className="text-center text-base font-medium tracking-tight">{equation}</p>

      <div className="space-y-2">
        <SliderRow
          label="A (амплитуда)"
          value={amplitude}
          min={spec.ranges.amplitude.min}
          max={spec.ranges.amplitude.max}
          step={spec.ranges.amplitude.step}
          onChange={setAmplitude}
        />
        <SliderRow
          label="B (частота)"
          value={frequency}
          min={spec.ranges.frequency.min}
          max={spec.ranges.frequency.max}
          step={spec.ranges.frequency.step}
          onChange={setFrequency}
        />
        <SliderRow
          label="C (фаза)"
          value={phase}
          min={spec.ranges.phase.min}
          max={spec.ranges.phase.max}
          step={spec.ranges.phase.step}
          onChange={setPhase}
        />
        <SliderRow
          label="D (сдвиг)"
          value={offset}
          min={spec.ranges.offset.min}
          max={spec.ranges.offset.max}
          step={spec.ranges.offset.step}
          onChange={setOffset}
        />
      </div>

      <canvas
        ref={canvasRef}
        className="h-[380px] w-full rounded-lg border border-border/70 bg-white"
      />

      <div className="grid gap-2 sm:grid-cols-2">
        <InfoCard label="Функция" value={spec.function} />
        <InfoCard label="Период" value={trigInfo.period} />
        <InfoCard label="Амплитуда" value={trigInfo.amplitude} />
        <InfoCard label="Средняя линия" value={trigInfo.midline} />
        <InfoCard label="y(0)" value={trigInfo.valueAtZero} />
      </div>

      <InfoCard
        label="Опорные точки"
        value={
          samplePoints.length
            ? samplePoints
                .map((point) => `(${formatNumber(point.x)}, ${formatNumber(point.y)})`)
                .join(' · ')
            : 'нет в видимой области'
        }
      />
    </div>
  );
};

const TimelineExplorer = ({ spec }: { spec: TimelineExplorerSpec }) => {
  const [activeStepId, setActiveStepId] = useState(spec.initialStepId);
  const [visitedStepIds, setVisitedStepIds] = useState<string[]>([spec.initialStepId]);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const [timelineMedia, setTimelineMedia] = useState<Record<string, TimelineMediaState>>({});
  const [imagePreview, setImagePreview] = useState<TimelineImagePreviewState | null>(null);
  const timelineMediaRef = useRef<Record<string, TimelineMediaState>>({});

  useEffect(() => {
    setActiveStepId(spec.initialStepId);
    setVisitedStepIds([spec.initialStepId]);
    setIsAnswerVisible(false);
    setTimelineMedia({});
    setImagePreview(null);
  }, [spec.initialStepId, spec.steps]);

  const activeIndex = useMemo(() => {
    const found = spec.steps.findIndex((step) => step.id === activeStepId);
    return found >= 0 ? found : 0;
  }, [activeStepId, spec.steps]);

  const activeStep = spec.steps[activeIndex] ?? spec.steps[0];
  const subjectLabel = getSubjectLabel(spec.subject);
  const visitedCount = useMemo(
    () => spec.steps.filter((step) => visitedStepIds.includes(step.id)).length,
    [spec.steps, visitedStepIds]
  );
  const progressPercent = useMemo(
    () => Math.round((visitedCount / Math.max(spec.steps.length, 1)) * 100),
    [spec.steps.length, visitedCount]
  );

  useEffect(() => {
    if (!activeStepId) return;
    setVisitedStepIds((prev) => (prev.includes(activeStepId) ? prev : [...prev, activeStepId]));
    setIsAnswerVisible(false);
  }, [activeStepId]);

  useEffect(() => {
    timelineMediaRef.current = timelineMedia;
  }, [timelineMedia]);

  const activeMedia = activeStep ? timelineMedia[activeStep.id] : undefined;

  const buildStepMediaQueries = useCallback(
    (step: TimelineExplorerSpec['steps'][number]) => {
      const explicitQuery = (step.imageQuery || '').trim();
      const subjectHint =
        TIMELINE_SUBJECT_QUERY_HINTS[spec.subject ?? 'general'] ||
        TIMELINE_SUBJECT_QUERY_HINTS.general;
      const candidates = [
        explicitQuery,
        `${step.title} ${subjectHint}`,
        `${spec.title} ${step.title} ${subjectHint}`,
        step.title,
      ];

      return Array.from(
        new Set(
          candidates
            .map((query) => (query || '').trim())
            .filter((query) => query.length >= 3)
        )
      ).slice(0, 4);
    },
    [spec.subject, spec.title]
  );

  const activeStepQueries = useMemo(() => {
    if (!activeStep) return [];
    return buildStepMediaQueries(activeStep);
  }, [activeStep, buildStepMediaQueries]);

  useEffect(() => {
    if (!activeStep) return;
    if (!activeStepQueries.length) return;
    const state = timelineMediaRef.current[activeStep.id];
    if (state) return;

    const stepId = activeStep.id;
    const controller = new AbortController();
    let didTimeout = false;
    const timeoutId = window.setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, 10000);

    setTimelineMedia((prev) => {
      if (prev[stepId]) return prev;
      const next = {
        ...prev,
        [stepId]: { status: 'loading' as const },
      };
      timelineMediaRef.current = next;
      return next;
    });

    const loadStepMedia = async () => {
      try {
        for (const query of activeStepQueries) {
          const item = await fetchWikimediaImage(query, controller.signal);
          if (item) {
            setTimelineMedia((prev) => {
              const next = {
                ...prev,
                [stepId]: { status: 'ready' as const, item },
              };
              timelineMediaRef.current = next;
              return next;
            });
            return;
          }
        }

        setTimelineMedia((prev) => {
          const next = {
            ...prev,
            [stepId]: { status: 'error' as const },
          };
          timelineMediaRef.current = next;
          return next;
        });
      } catch (error) {
        if (controller.signal.aborted && !didTimeout) return;
        setTimelineMedia((prev) => {
          const next = {
            ...prev,
            [stepId]: { status: 'error' as const },
          };
          timelineMediaRef.current = next;
          return next;
        });
        console.error(error);
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    loadStepMedia();
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [activeStep, activeStepQueries]);

  const goToStep = (index: number) => {
    const bounded = Math.max(0, Math.min(spec.steps.length - 1, index));
    const next = spec.steps[bounded];
    if (next) setActiveStepId(next.id);
  };

  return (
    <div className="space-y-4 rounded-xl border bg-background px-4 py-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">{spec.title}</h3>
          {subjectLabel ? (
            <p className="text-xs text-muted-foreground">{subjectLabel}</p>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          Этап {activeIndex + 1}/{spec.steps.length}
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            Прогресс: {visitedCount} из {spec.steps.length}
          </span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground/60 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-2">
          {spec.steps.map((step, index) => {
            const isActive = step.id === activeStep?.id;
            const isVisited = visitedStepIds.includes(step.id);
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStepId(step.id)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  isActive
                    ? 'border-border bg-muted text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  {isVisited ? '✓' : `${index + 1}.`} {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeStep ? (
        <section className="space-y-4 rounded-lg border bg-muted/20 px-4 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-base font-semibold">{activeStep.title}</p>
              <p className="text-xs text-muted-foreground">
                Шаг {activeIndex + 1} из {spec.steps.length}
              </p>
            </div>
            {activeStep.period ? (
              <span className="rounded-full border bg-background px-2 py-0.5 text-xs text-muted-foreground">
                {activeStep.period}
              </span>
            ) : null}
          </div>

          {activeStepQueries.length && activeMedia?.status ? (
            <div className="space-y-2 rounded-md border bg-background px-3 py-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Иллюстрация этапа
              </p>
              {activeMedia.status === 'loading' ? (
                <p className="text-sm text-muted-foreground">Подбираю изображение из Wikimedia...</p>
              ) : null}
              {activeMedia.status === 'ready' && activeMedia.item ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() =>
                      setImagePreview({
                        url: activeMedia.item?.url || '',
                        alt: activeStep.imageCaption || activeMedia.item?.title || 'Иллюстрация',
                        caption:
                          activeStep.imageCaption ||
                          activeMedia.item?.description ||
                          activeMedia.item?.title ||
                          '',
                        pageUrl: activeMedia.item?.pageUrl || '',
                      })
                    }
                    className="group relative w-full overflow-hidden rounded-md border bg-muted cursor-zoom-in"
                  >
                    <img
                      src={activeMedia.item.url}
                      alt={activeStep.imageCaption || activeMedia.item.title}
                      loading="lazy"
                      className="h-52 w-full object-contain transition-transform duration-200 group-hover:scale-[1.02] md:h-64"
                    />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/45 px-3 text-center text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                      Нажмите, чтобы открыть полностью
                    </div>
                  </button>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="line-clamp-2">
                      {activeStep.imageCaption || activeMedia.item.description || activeMedia.item.title}
                    </span>
                    <a
                      href={activeMedia.item.pageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2 hover:text-foreground"
                    >
                      Источник
                    </a>
                  </div>
                </div>
              ) : null}
              {activeMedia.status === 'error' ? (
                <p className="text-sm text-muted-foreground">
                  Не удалось подобрать изображение для этого шага.
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Что происходит
            </p>
            <p className="text-sm leading-relaxed text-foreground/90">
              {activeStep.details || 'Описание шага не задано.'}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Ключевые признаки
              </p>
              {activeStep.keyPoints?.length ? (
                <ul className="list-disc space-y-1 pl-4 text-sm text-foreground/90">
                  {activeStep.keyPoints.map((point, index) => (
                    <li key={`${activeStep.id}-kp-${index}`}>{point}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Нет дополнительных пунктов.</p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Результат этапа
              </p>
              {activeStep.outcomes?.length ? (
                <ul className="list-disc space-y-1 pl-4 text-sm text-foreground/90">
                  {activeStep.outcomes.map((point, index) => (
                    <li key={`${activeStep.id}-out-${index}`}>{point}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Результат не указан.</p>
              )}
            </div>
          </div>

          {activeStep.terms?.length ? (
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Термины
              </p>
              <div className="flex flex-wrap gap-2">
                {activeStep.terms.map((term, index) => (
                  <span
                    key={`${activeStep.id}-term-${index}`}
                    className="rounded-full border bg-background px-2 py-0.5 text-xs"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {activeStep.commonMistake ? (
            <div className="space-y-1 rounded-md border bg-background px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Частая ошибка
              </p>
              <p className="text-sm text-foreground/90">{activeStep.commonMistake}</p>
            </div>
          ) : null}

          {activeStep.checkQuestion ? (
            <div className="space-y-2 rounded-md border bg-background px-3 py-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Проверь себя
              </p>
              <p className="text-sm text-foreground/90">{activeStep.checkQuestion}</p>
              {activeStep.checkAnswer ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsAnswerVisible((prev) => !prev)}
                    className="rounded-md border px-3 py-1.5 text-xs"
                  >
                    {isAnswerVisible ? 'Скрыть ответ' : 'Показать ответ'}
                  </button>
                  {isAnswerVisible ? (
                    <p className="rounded-md border bg-muted/20 px-2 py-2 text-sm text-foreground/90">
                      {activeStep.checkAnswer}
                    </p>
                  ) : null}
                </>
              ) : null}
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => goToStep(activeIndex - 1)}
              disabled={activeIndex <= 0}
              className="rounded-md border px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
            >
              Назад
            </button>
            <span className="text-xs text-muted-foreground">
              Этап {activeIndex + 1}/{spec.steps.length}
            </span>
            <button
              type="button"
              onClick={() => goToStep(activeIndex + 1)}
              disabled={activeIndex >= spec.steps.length - 1}
              className="rounded-md border px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
            >
              Далее
            </button>
          </div>
        </section>
      ) : null}

      {imagePreview ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setImagePreview(null)}
        >
          <div
            className="relative w-full max-w-6xl space-y-2"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setImagePreview(null)}
              className="ml-auto block rounded-md border border-white/30 bg-black/40 px-3 py-1 text-xs text-white"
            >
              Закрыть
            </button>
            <img
              src={imagePreview.url}
              alt={imagePreview.alt}
              className="max-h-[82vh] w-full rounded-md border border-white/25 bg-black object-contain"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/85">
              <span className="line-clamp-2">{imagePreview.caption}</span>
              <a
                href={imagePreview.pageUrl}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-white"
              >
                Источник
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const MediaGalleryExplorer = ({ spec }: { spec: MediaGalleryExplorerSpec }) => {
  const [queryInput, setQueryInput] = useState(spec.query);
  const [query, setQuery] = useState(spec.query);
  const [mediaType, setMediaType] = useState<'image' | 'video'>(spec.mediaType);
  const [limit, setLimit] = useState(normalizeGalleryLimitOption(spec.limit));
  const [items, setItems] = useState<WikimediaMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQueryInput(spec.query);
    setQuery(spec.query);
    setMediaType(spec.mediaType);
    setLimit(normalizeGalleryLimitOption(spec.limit));
  }, [spec.limit, spec.mediaType, spec.query]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const normalized = queryInput.trim();
      if (!normalized) return;
      setQuery(normalized);
    }, 260);

    return () => window.clearTimeout(timeoutId);
  }, [queryInput]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      setItems([]);
      setError('Введите поисковый запрос.');
      return;
    }

    const controller = new AbortController();
    const candidates = buildMediaSearchCandidates(normalizedQuery, spec.subject);

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        for (const candidate of candidates) {
          const params = new URLSearchParams({
            action: 'query',
            format: 'json',
            origin: '*',
            generator: 'search',
            gsrnamespace: '6',
            gsrlimit: String(Math.max(3, Math.min(12, Math.round(limit)))),
            gsrsearch:
              mediaType === 'video'
                ? `${candidate} filetype:video`
                : candidate,
            prop: 'imageinfo',
            iiprop: 'url|mime|extmetadata',
            iiurlwidth: '1200',
          });

          const response = await fetch(
            `https://commons.wikimedia.org/w/api.php?${params.toString()}`,
            { signal: controller.signal }
          );
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const json = (await response.json()) as unknown;
          const parsed = parseWikimediaMedia(json).slice(0, limit);
          if (parsed.length) {
            setItems(parsed);
            return;
          }
        }

        setItems([]);
        setError('По этому запросу пока ничего не найдено.');
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        setItems([]);
        setError('Не удалось загрузить медиа из Wikimedia Commons.');
        console.error(fetchError);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => controller.abort();
  }, [limit, mediaType, query, spec.subject]);

  const subjectLabel = getSubjectLabel(spec.subject);

  return (
    <div className="space-y-4 rounded-xl border bg-background px-4 py-4">
      <div className="space-y-1 text-center">
        <h3 className="text-base font-semibold">{spec.title}</h3>
        {subjectLabel ? (
          <p className="text-xs text-muted-foreground">{subjectLabel}</p>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Поисковый запрос</span>
          <input
            type="text"
            value={queryInput}
            onChange={(event) => setQueryInput(event.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            placeholder="например, animal cell"
          />
        </label>
        <label className="flex flex-col gap-1 md:justify-self-end">
          <span className="text-xs text-muted-foreground">Тип</span>
          <select
            value={mediaType}
            onChange={(event) => setMediaType(event.target.value as 'image' | 'video')}
            className="h-9 w-full min-w-[170px] rounded-md border bg-background px-2 text-sm"
          >
            <option value="image">Фото</option>
            <option value="video">Видео</option>
          </select>
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Количество</p>
        <div className="flex flex-wrap gap-2">
          {GALLERY_LIMIT_OPTIONS.map((option) => {
            const isActive = option === limit;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setLimit(option)}
                className={`rounded-md border px-3 py-1.5 text-xs transition ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-500/15 text-indigo-200'
                    : 'border-border bg-background text-muted-foreground hover:border-indigo-300'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Загрузка медиа...</p>
      ) : null}
      {!isLoading && error ? (
        <p className="text-sm text-muted-foreground">{error}</p>
      ) : null}

      {!isLoading && items.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const isVideo =
              mediaType === 'video' ||
              (item.mime ? item.mime.toLowerCase().startsWith('video/') : false);
            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-lg border bg-muted/20"
              >
                {isVideo ? (
                  <video
                    src={item.url}
                    controls
                    className="h-40 w-full bg-black object-cover"
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.title}
                    loading="lazy"
                    className="h-40 w-full object-cover"
                  />
                )}
                <div className="space-y-1 px-3 py-2">
                  <p className="line-clamp-2 text-sm font-medium">{item.title}</p>
                  {item.license ? (
                    <p className="text-[11px] text-muted-foreground">
                      Лицензия: {item.license}
                    </p>
                  ) : null}
                  <a
                    href={item.pageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-700 underline-offset-2 hover:underline"
                  >
                    Открыть источник
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

const InteractiveRenderer = ({ spec }: InteractiveRendererProps) => {
  if (spec.type === 'comparison_explorer') {
    return <ComparisonExplorer spec={spec} />;
  }

  if (spec.type === 'quadratic_explorer') {
    return <QuadraticExplorer spec={spec} />;
  }

  if (spec.type === 'linear_explorer') {
    return <LinearExplorer spec={spec} />;
  }

  if (spec.type === 'timeline_explorer') {
    return <TimelineExplorer spec={spec} />;
  }

  if (spec.type === 'media_gallery_explorer') {
    return <MediaGalleryExplorer spec={spec} />;
  }

  return <TrigExplorer spec={spec} />;
};

export default InteractiveRenderer;
