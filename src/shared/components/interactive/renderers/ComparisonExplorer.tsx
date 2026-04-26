import { useEffect, useMemo, useRef, useState } from 'react';

import type { ComparisonExplorerSpec } from '@/shared/components/interactive/interactive-spec';
import { SliderRow } from './shared-ui';
import {
  buildSingleEquationText,
  chooseGridStep,
  evaluateFunctionAt,
  formatNumber,
} from './shared-utils';

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

export default ComparisonExplorer;
