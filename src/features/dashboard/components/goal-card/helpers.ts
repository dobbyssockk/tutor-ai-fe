import type { AssessmentSummary } from '@/features/assessments/types';
import type { GoalTopic } from '@/features/goals/types';

export const PASSING_SCORE = 70;
export const MAX_VISIBLE_TOPICS = 3;

export const getTopicStatusLabel = (status: GoalTopic['status']) => {
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

export const getAssessmentState = (assessment?: AssessmentSummary) => {
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

export const getAssessmentButtonLabel = ({
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
