import { useEffect, useMemo, useRef, useState } from 'react';

import type {
  InteractiveSpec,
  QuadraticExplorerSpec,
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
    const sign = value < 0 ? ' − ' : first ? '' : ' + ';
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
  return (
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
      <span className="w-16 text-right font-medium text-sm">{formatNumber(value)}</span>
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

const InteractiveRenderer = ({ spec }: InteractiveRendererProps) => {
  if (spec.type === 'quadratic_explorer') {
    return <QuadraticExplorer spec={spec} />;
  }

  return <TrigExplorer spec={spec} />;
};

export default InteractiveRenderer;
