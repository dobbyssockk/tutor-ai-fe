import { useEffect, useMemo, useRef, useState } from 'react';

import type { LinearExplorerSpec } from '@/shared/components/interactive/interactive-spec';
import { InfoCard, SliderRow } from './shared-ui';
import {
  buildEquationText,
  chooseGridStep,
  formatNumber,
  toNumber,
} from './shared-utils';

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

export default LinearExplorer;
