import { useEffect, useState } from 'react';

import { formatNumber } from './shared-utils';

export const SliderRow = ({
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

export const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border bg-muted/40 px-3 py-2">
    <p className="text-[11px] text-muted-foreground">{label}</p>
    <p className="text-sm font-medium">{value}</p>
  </div>
);
