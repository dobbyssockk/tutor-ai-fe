import { useMemo } from 'react';

import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  useCreateGoal,
  useDeleteGoal,
  useGoals,
  useStartGoalTopicLesson,
} from '@/features/goals/hooks/useGoals';
import {
  useAssessments,
  useCreateTopicAssessment,
  useStartAssessment,
} from '@/features/assessments/hooks/useAssessments';
import type { AssessmentSummary } from '@/features/assessments/types';

import GoalCard from './GoalCard';
import GoalForm from './GoalForm';

const GoalsSection = () => {
  const { data: goalsData, isLoading: isLoadingGoals } = useGoals();
  const { data: assessmentsData } = useAssessments();
  const { mutate: createGoal, isPending: isCreatingGoal } = useCreateGoal();
  const { mutate: deleteGoal } = useDeleteGoal();
  const { mutate: startLesson, isPending: isStartingLesson } =
    useStartGoalTopicLesson();
  const { mutate: startAssessment, isPending: isStartingAssessment } =
    useStartAssessment();
  const { mutate: createTopicAssessment, isPending: isCreatingAssessment } =
    useCreateTopicAssessment();

  const goals = useMemo(() => goalsData?.goals ?? [], [goalsData?.goals]);
  const hasGoals = goals.length > 0;
  const doneCount = useMemo(
    () => goals.filter((goal) => goal.status === 'done').length,
    [goals],
  );
  const openCount = goals.length - doneCount;

  const assessmentsByTopic = useMemo(() => {
    const map = new Map<string, AssessmentSummary>();
    (assessmentsData?.assessments ?? []).forEach((assessment) => {
      if (assessment.goalTopicId) {
        map.set(assessment.goalTopicId, assessment);
      }
    });
    return map;
  }, [assessmentsData?.assessments]);

  return (
    <section className="lg:col-span-2 space-y-4 rounded-xl border bg-card/60 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="mt-1 text-xl font-semibold">Запланировать обучение</h2>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-background/80 px-3 py-1">
            В работе: {openCount}
          </span>
          <span className="rounded-full bg-background/80 px-3 py-1">
            Готово: {doneCount}
          </span>
        </div>
      </div>

      <GoalForm isCreating={isCreatingGoal} onCreateGoal={createGoal} />

      <div className="space-y-3">
        {isLoadingGoals ? (
          <div className="space-y-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : hasGoals ? (
          goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              assessmentsByTopic={assessmentsByTopic}
              onDeleteGoal={deleteGoal}
              onStartLesson={startLesson}
              onCreateTopicAssessment={createTopicAssessment}
              onStartAssessment={startAssessment}
              isStartingLesson={isStartingLesson}
              isStartingAssessment={isStartingAssessment}
              isCreatingAssessment={isCreatingAssessment}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed bg-background/60 p-6 text-sm text-muted-foreground">
            Пока нет целей. Добавьте цель и детали, чтобы получить программу
            обучения.
          </div>
        )}
      </div>
    </section>
  );
};

export default GoalsSection;
