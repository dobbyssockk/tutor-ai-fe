import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Trash2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import type {
  AssessmentCreateResponse,
  AssessmentSummary,
} from '@/features/assessments/types';
import type { Goal, GoalTopic } from '@/features/goals/types';

const PASSING_SCORE = 70;
const MAX_VISIBLE_TOPICS = 3;

const getTopicStatusLabel = (status: GoalTopic['status']) => {
  if (status === 'in_progress') {
    return { label: 'Текущая тема', className: 'bg-sky-500/10 text-sky-300' };
  }
  if (status === 'done') {
    return {
      label: 'Завершено',
      className: 'bg-emerald-500/10 text-emerald-300',
    };
  }
  return {
    label: 'Запланировано',
    className: 'bg-muted/40 text-muted-foreground',
  };
};

const getAssessmentState = (assessment?: AssessmentSummary) => {
  const lastAttempt = assessment?.lastAttempt ?? null;
  const lastScore =
    typeof lastAttempt?.score === 'number' ? lastAttempt.score : null;
  const needsRetake = lastScore !== null && lastScore < PASSING_SCORE;
  const passesRequired = assessment?.passesRequired ?? 1;
  const passesCompleted = assessment?.passesCompleted ?? 0;
  const needsExtraPass = passesRequired > 1 && passesCompleted < passesRequired;
  const assessmentResultDate = lastAttempt?.completedAt
    ? new Date(lastAttempt.completedAt)
    : null;
  const canStartAssessment = assessment ? assessment.canStart : true;

  return {
    lastAttempt,
    lastScore,
    needsRetake,
    needsExtraPass,
    passesRequired,
    passesCompleted,
    assessmentResultDate,
    canStartAssessment,
  };
};

const getAssessmentButtonLabel = ({
  isCreatingForTopic,
  isStartingAssessment,
  needsExtraPass,
  needsRetake,
  lastAttempt,
}: {
  isCreatingForTopic: boolean;
  isStartingAssessment: boolean;
  needsExtraPass: boolean;
  needsRetake: boolean;
  lastAttempt: AssessmentSummary['lastAttempt'] | null;
}) => {
  if (isCreatingForTopic) return 'Генерируем...';
  if (isStartingAssessment) return 'Запускаем...';
  if (needsExtraPass) return 'Пройти ещё тест';
  if (needsRetake || lastAttempt) return 'Перепройти тест';
  return 'Начать тест';
};

type GoalCardProps = {
  goal: Goal;
  assessmentsByTopic: Map<string, AssessmentSummary>;
  onDeleteGoal: (goalId: string) => void;
  onStartLesson: (payload: { goalId: string; topicId: string }) => void;
  onCreateTopicAssessment: (
    payload: { goalId: string; topicId: string; regenerate?: boolean },
    options?: {
      onSuccess?: (data: AssessmentCreateResponse) => void;
      onSettled?: () => void;
    }
  ) => void;
  onStartAssessment: (assessmentId: string) => void;
  isStartingLesson: boolean;
  isStartingAssessment: boolean;
  isCreatingAssessment: boolean;
};

const GoalCard = ({
  goal,
  assessmentsByTopic,
  onDeleteGoal,
  onStartLesson,
  onCreateTopicAssessment,
  onStartAssessment,
  isStartingLesson,
  isStartingAssessment,
  isCreatingAssessment,
}: GoalCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTopicsExpanded, setIsTopicsExpanded] = useState(false);
  const [creatingTopicId, setCreatingTopicId] = useState<string | null>(null);

  const topics = useMemo(() => goal.topics ?? [], [goal.topics]);
  const orderedTopics = useMemo(() => {
    const rank = { in_progress: 0, locked: 1, done: 2 } as const;
    return [...topics].sort((a, b) => {
      const rankA = rank[a.status] ?? 3;
      const rankB = rank[b.status] ?? 3;
      if (rankA !== rankB) return rankA - rankB;
      return a.order - b.order;
    });
  }, [topics]);
  const totalTopics = topics.length;
  const completedTopics = topics.filter(
    (topic) => topic.status === 'done'
  ).length;
  const progressPct = totalTopics
    ? Math.round((completedTopics / totalTopics) * 100)
    : 0;
  const visibleTopics = isTopicsExpanded
    ? orderedTopics
    : orderedTopics.slice(0, MAX_VISIBLE_TOPICS);
  const now = Date.now();

  return (
    <div className="space-y-4 rounded-lg border bg-background/60 p-4">
      <div
        className="flex items-start justify-between gap-4 cursor-pointer"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-semibold text-foreground break-words">
            {goal.title}
          </p>
          {goal.description ? (
            <p className="text-sm text-muted-foreground break-words">
              {goal.description}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {goal.currentLevel ? (
              <span>Уровень: {goal.currentLevel}</span>
            ) : null}
            {goal.targetLevel ? <span>Цель: {goal.targetLevel}</span> : null}
            {goal.minutesPerDay ? (
              <span>{goal.minutesPerDay} мин/день</span>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            Добавлено {new Date(goal.createdAt).toLocaleDateString('ru-RU')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={isExpanded ? 'Свернуть' : 'Развернуть'}
            onClick={(event) => {
              event.stopPropagation();
              setIsExpanded((prev) => !prev);
            }}
          >
            <ChevronDown
              className={`h-5 w-5 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </Button>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full border p-[3px] shadow-sm ${
              progressPct >= 100
                ? 'border-emerald-500/60 bg-emerald-500/15'
                : 'border-primary/30 bg-primary/10'
            }`}
            aria-label={`Прогресс ${progressPct}%`}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex h-full w-full items-center justify-center rounded-full text-xs font-semibold text-primary"
              style={{
                background: `conic-gradient(hsl(var(--primary)) ${
                  progressPct * 3.6
                }deg, hsl(var(--primary) / 0.15) 0deg)`,
              }}
            >
              {progressPct}%
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Удалить цель"
                onClick={(event) => event.stopPropagation()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить эту цель?</AlertDialogTitle>
                <AlertDialogDescription>
                  Это действие нельзя отменить. Цель и программа будут удалены.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteGoal(goal.id);
                  }}
                >
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {isExpanded ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              Программа обучения
            </p>
          </div>
          {visibleTopics.length > 0 ? (
            <div className="space-y-2">
              {visibleTopics.map((topic, index) => {
                const status = getTopicStatusLabel(topic.status);
                const dueAt = topic.dueAt ? new Date(topic.dueAt) : null;
                const isLate =
                  topic.status === 'in_progress' &&
                  dueAt &&
                  dueAt.getTime() < now;
                const assessment = assessmentsByTopic.get(topic.id);
                const {
                  lastAttempt,
                  lastScore,
                  needsRetake,
                  needsExtraPass,
                  passesRequired,
                  passesCompleted,
                  assessmentResultDate,
                  canStartAssessment,
                } = getAssessmentState(assessment);
                const remainingPasses = Math.max(
                  passesRequired - passesCompleted,
                  0
                );
                const isCreatingForTopic =
                  isCreatingAssessment && creatingTopicId === topic.id;
                const disableAssessmentButton =
                  !topic.lessonChatId ||
                  isStartingAssessment ||
                  isCreatingForTopic ||
                  (!lastAttempt && assessment && !canStartAssessment);
                const isAlternate = index % 2 === 1;

                return (
                  <div
                    key={topic.id}
                    className={`rounded-xl border p-4 shadow-sm transition ${
                      topic.status === 'done'
                        ? isAlternate
                          ? 'bg-muted/25 border-border/40 opacity-70'
                          : 'bg-background/40 border-border/40 opacity-70'
                        : isAlternate
                        ? 'bg-muted/30'
                        : 'bg-background/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-3">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Тема {topic.order}
                          </p>
                          <p className="text-base font-semibold text-foreground">
                            {topic.title}
                          </p>
                          {topic.summary ? (
                            <p className="text-sm text-muted-foreground">
                              {topic.summary}
                            </p>
                          ) : null}
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Подтемы
                          </p>
                          {topic.subtopics && topic.subtopics.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {topic.subtopics.slice(0, 6).map((subtopic) => (
                                <span
                                  key={subtopic}
                                  className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground"
                                >
                                  {subtopic}
                                </span>
                              ))}
                              {topic.subtopics.length > 6 ? (
                                <span className="text-xs text-muted-foreground">
                                  …
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Подтемы не указаны.
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span>Длительность: {topic.durationWeeks} нед.</span>
                          {assessment ? (
                            assessment.recentAttempts &&
                            assessment.recentAttempts.length > 0 ? (
                              <div className="flex flex-wrap items-center gap-2">
                                {assessment.recentAttempts.map((attempt) => {
                                  const passed = attempt.score >= PASSING_SCORE;
                                  return (
                                    <Link
                                      key={attempt.id}
                                      to={`/assessments/attempts/${attempt.id}/results`}
                                      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                                        passed
                                          ? 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                                          : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                                      }`}
                                    >
                                      {passed
                                        ? 'Тест пройден'
                                        : 'Тест не пройден'}
                                      <span className="text-[11px]">
                                        {attempt.score}%
                                      </span>
                                      <span className="text-[11px] text-muted-foreground">
                                        ·{' '}
                                        {new Date(
                                          attempt.completedAt
                                        ).toLocaleDateString('ru-RU')}
                                      </span>
                                    </Link>
                                  );
                                })}
                              </div>
                            ) : lastAttempt ? (
                              <Link
                                to={`/assessments/attempts/${lastAttempt.id}/results`}
                                className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                                  needsRetake
                                    ? 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                                    : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                                }`}
                              >
                                {needsRetake
                                  ? 'Тест не пройден'
                                  : 'Тест пройден'}
                                <span className="text-[11px]">
                                  {lastScore ?? 0}%
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  ·{' '}
                                  {assessmentResultDate?.toLocaleDateString(
                                    'ru-RU'
                                  )}
                                </span>
                              </Link>
                            ) : (
                              <span>Тест создан для темы.</span>
                            )
                          ) : null}
                        </div>
                      </div>
                      <div className="shrink-0 text-right space-y-1">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            status.className
                          } ${
                            topic.status === 'done'
                              ? '!text-emerald-300 !bg-emerald-500/20 opacity-100'
                              : ''
                          }`}
                        >
                          {status.label}
                        </span>
                        {topic.status === 'in_progress' && dueAt ? (
                          <p
                            className={`text-[11px] mt-2 ${
                              isLate ? 'text-rose-400' : 'text-muted-foreground'
                            }`}
                          >
                            Дедлайн: {dueAt.toLocaleDateString('ru-RU')}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    {topic.status === 'in_progress' ? (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isStartingLesson}
                          onClick={() =>
                            onStartLesson({
                              goalId: goal.id,
                              topicId: topic.id,
                            })
                          }
                        >
                          {isStartingLesson
                            ? 'Открываем...'
                            : topic.lessonChatId
                            ? 'Перейти к уроку'
                            : 'Начать урок'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={disableAssessmentButton}
                          onClick={() => {
                            if (!topic.lessonChatId) return;
                            setCreatingTopicId(topic.id);
                            onCreateTopicAssessment(
                              {
                                goalId: goal.id,
                                topicId: topic.id,
                                regenerate: Boolean(lastAttempt),
                              },
                              {
                                onSuccess: (data) =>
                                  onStartAssessment(data.assessment.id),
                                onSettled: () => setCreatingTopicId(null),
                              }
                            );
                          }}
                          title={
                            topic.lessonChatId
                              ? undefined
                              : 'Сначала начните урок'
                          }
                        >
                          {getAssessmentButtonLabel({
                            isCreatingForTopic,
                            isStartingAssessment,
                            needsExtraPass,
                            needsRetake,
                            lastAttempt,
                          })}
                        </Button>
                        {isLate ? (
                          <span className="text-xs text-rose-400">
                            {remainingPasses <= 1
                              ? 'Дедлайн пропущен — следующая тема заблокирована, нужно сдать еще 1 тест'
                              : `Дедлайн пропущен — следующая тема заблокирована, нужно сдать ${remainingPasses} теста`}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                    {topic.status === 'done' && topic.lessonChatId ? (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/chat/${topic.lessonChatId}`}>
                            Перейти к уроку
                          </Link>
                        </Button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
              {topics.length > MAX_VISIBLE_TOPICS ? (
                <div className="flex justify-center pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsTopicsExpanded((prev) => !prev)}
                  >
                    {isTopicsExpanded ? 'Скрыть' : 'Показать еще'}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed bg-background/60 p-4 text-sm text-muted-foreground">
              Программа будет доступна после генерации.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default GoalCard;
