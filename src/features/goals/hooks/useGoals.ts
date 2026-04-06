import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import {
  createGoal,
  deleteGoal,
  getGoals,
  startGoalTopicLesson,
} from '@/features/goals/services';
import { GoalInput, GoalsResponse } from '../types';
import { queryKeys } from '@/shared/lib/queryKeys';

export const useGoals = () =>
  useQuery({
    queryKey: queryKeys.goals.all,
    queryFn: getGoals,
  });

export const useCreateGoal = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: GoalInput) => createGoal(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.goals.all });
    },
  });
};

export const useDeleteGoal = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: queryKeys.goals.all });
      const previous = qc.getQueryData<GoalsResponse>(queryKeys.goals.all);

      qc.setQueryData<GoalsResponse>(queryKeys.goals.all, (old) => {
        if (!old) return old;
        return {
          goals: old.goals.filter((goal) => goal.id !== id),
        };
      });

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.goals.all, context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.goals.all });
    },
  });
};

export const useStartGoalTopicLesson = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ goalId, topicId }: { goalId: string; topicId: string }) =>
      startGoalTopicLesson(goalId, topicId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.goals.all });
      navigate(`/chat/${data.chatId}`);
    },
    onError: (err) => {
      console.error('Start goal topic lesson error:', err);
    },
  });
};
