import { Link } from 'react-router-dom';

import { Button } from '@/shared/components/ui/button';
import {
  getAssessmentButtonLabel,
  getAssessmentState,
  getTopicStatusLabel,
  PASSING_SCORE,
} from './helpers';
import { topicCalendarDaySpan } from '@/features/goals/topicPace';
import type { GoalTopicCardProps } from './types';

const GoalTopicCard = ({
  goalId,
  minutesPerDay,
  topic,
  index,
  now,
  assessment,
  onStartLesson,
  onCreateTopicAssessment,
  onStartAssessment,
  isStartingLesson,
  isStartingAssessment,
  isCreatingAssessment,
  creatingTopicId,
  setCreatingTopicId,
}: GoalTopicCardProps) => {
  const status = getTopicStatusLabel(topic.status);
  const dueAt = topic.dueAt ? new Date(topic.dueAt) : null;
  const isLate =
    topic.status === 'in_progress' && dueAt && dueAt.getTime() < now;

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

  const calendarDaysForTopic = topicCalendarDaySpan(
    topic.durationWeeks,
    minutesPerDay
  );
  const durationWeeksLabel = (calendarDaysForTopic / 7).toLocaleString('ru-RU', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  });

  const remainingPasses = Math.max(passesRequired - passesCompleted, 0);
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
      className={`min-w-0 rounded-xl border p-3 shadow-sm transition sm:p-4 ${
        topic.status === 'done'
          ? isAlternate
            ? 'bg-muted/25 border-border/40 opacity-70'
            : 'bg-background/40 border-border/40 opacity-70'
          : isAlternate
          ? 'bg-muted/30'
          : 'bg-background/80'
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Тема {topic.order}
            </p>
            <p className="break-words text-base font-semibold text-foreground">
              {topic.title}
            </p>
            {topic.summary ? (
              <p className="break-words text-sm text-muted-foreground">
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
                {topic.subtopics.map((subtopic, subtopicIndex) => (
                  <span
                    key={`${subtopic}-${subtopicIndex}`}
                    className="max-w-full break-words rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground"
                  >
                    {subtopic}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Подтемы не указаны.</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>Длительность: {durationWeeksLabel} нед.</span>
            {assessment ? (
              assessment.recentAttempts && assessment.recentAttempts.length > 0 ? (
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
                        {passed ? 'Тест пройден' : 'Тест не пройден'}
                        <span className="text-[11px]">{attempt.score}%</span>
                        <span className="text-[11px] text-muted-foreground">
                          · {new Date(attempt.completedAt).toLocaleDateString('ru-RU')}
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
                  {needsRetake ? 'Тест не пройден' : 'Тест пройден'}
                  <span className="text-[11px]">{lastScore ?? 0}%</span>
                  <span className="text-[11px] text-muted-foreground">
                    · {assessmentResultDate?.toLocaleDateString('ru-RU')}
                  </span>
                </Link>
              ) : (
                <span>Тест создан для темы.</span>
              )
            ) : null}
          </div>
        </div>
        <div className="shrink-0 space-y-1 sm:text-right">
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
                goalId,
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
                  goalId,
                  topicId: topic.id,
                  regenerate: Boolean(lastAttempt),
                },
                {
                  onSuccess: (data) => onStartAssessment(data.assessment.id),
                  onSettled: () => setCreatingTopicId(null),
                }
              );
            }}
            title={topic.lessonChatId ? undefined : 'Сначала начните урок'}
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
            <Link to={`/chat/${topic.lessonChatId}`}>Перейти к уроку</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default GoalTopicCard;
