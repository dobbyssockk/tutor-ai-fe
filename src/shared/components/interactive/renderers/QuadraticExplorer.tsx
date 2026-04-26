import { useEffect, useMemo, useRef, useState } from 'react';

import type { QuadraticExplorerSpec } from '@/shared/components/interactive/interactive-spec';
import { InfoCard, SliderRow } from './shared-ui';
import {
  buildEquationText,
  formatNumber,
  toNumber,
} from './shared-utils';

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

export default QuadraticExplorer;
