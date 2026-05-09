import { useEffect, useMemo, useState } from 'react';

import type { TimelineExplorerSpec } from '@/shared/components/interactive/interactive-spec';
import {
  getSubjectLabel,
} from './shared-utils';

const TimelineExplorer = ({ spec }: { spec: TimelineExplorerSpec }) => {
  const [activeStepId, setActiveStepId] = useState(spec.initialStepId);
  const [visitedStepIds, setVisitedStepIds] = useState<string[]>([spec.initialStepId]);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);

  useEffect(() => {
    setActiveStepId(spec.initialStepId);
    setVisitedStepIds([spec.initialStepId]);
    setIsAnswerVisible(false);
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

    </div>
  );
};

export default TimelineExplorer;
