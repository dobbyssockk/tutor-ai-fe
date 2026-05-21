import { useMemo, useState } from 'react';
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
import GoalTopicCard from '@/features/dashboard/components/goal-card/GoalTopicCard';
import { MAX_VISIBLE_TOPICS } from '@/features/dashboard/components/goal-card/helpers';
import type { GoalCardProps } from '@/features/dashboard/components/goal-card/types';

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
  const completedTopics = topics.filter((topic) => topic.status === 'done').length;
  const progressPct = totalTopics
    ? Math.round((completedTopics / totalTopics) * 100)
    : 0;
  const visibleTopics = isTopicsExpanded
    ? orderedTopics
    : orderedTopics.slice(0, MAX_VISIBLE_TOPICS);
  const now = Date.now();

  return (
    <div className="min-w-0 space-y-4 rounded-lg border bg-background/60 p-3 sm:p-4">
      <div
        className="flex cursor-pointer flex-col gap-3 min-[360px]:flex-row min-[360px]:items-start min-[360px]:justify-between"
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
            {goal.currentLevel ? <span>Уровень: {goal.currentLevel}</span> : null}
            {goal.targetLevel ? <span>Цель: {goal.targetLevel}</span> : null}
            {goal.minutesPerDay ? <span>{goal.minutesPerDay} мин/день</span> : null}
          </div>
          <p className="text-sm text-muted-foreground">
            Добавлено {new Date(goal.createdAt).toLocaleDateString('ru-RU')}
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-2 min-[360px]:justify-end sm:gap-3">
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
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border p-[3px] shadow-sm ${
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
              {visibleTopics.map((topic, index) => (
                <GoalTopicCard
                  key={topic.id}
                  goalId={goal.id}
                  minutesPerDay={goal.minutesPerDay}
                  topic={topic}
                  index={index}
                  now={now}
                  assessment={assessmentsByTopic.get(topic.id)}
                  onStartLesson={onStartLesson}
                  onCreateTopicAssessment={onCreateTopicAssessment}
                  onStartAssessment={onStartAssessment}
                  isStartingLesson={isStartingLesson}
                  isStartingAssessment={isStartingAssessment}
                  isCreatingAssessment={isCreatingAssessment}
                  creatingTopicId={creatingTopicId}
                  setCreatingTopicId={setCreatingTopicId}
                />
              ))}
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
