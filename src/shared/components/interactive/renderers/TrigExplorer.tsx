import { useEffect, useMemo, useRef, useState } from 'react';

import type { TrigExplorerSpec } from '@/shared/components/interactive/interactive-spec';
import { InfoCard, SliderRow } from './shared-ui';
import {
  buildTrigEquationText,
  chooseGridStep,
  formatNumber,
  toNumber,
} from './shared-utils';

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

export default TrigExplorer;
