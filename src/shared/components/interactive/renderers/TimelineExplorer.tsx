import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { TimelineExplorerSpec } from '@/shared/components/interactive/interactive-spec';
import {
  TIMELINE_SUBJECT_QUERY_HINTS,
  TimelineImagePreviewState,
  TimelineMediaState,
  fetchWikimediaImage,
  getSubjectLabel,
} from './shared-utils';

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

export default TimelineExplorer;
