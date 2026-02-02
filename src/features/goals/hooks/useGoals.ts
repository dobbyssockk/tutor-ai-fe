import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import {
  createGoal,
  deleteGoal,
  getGoals,
  startGoalTopicLesson,
} from '@/features/goals/services';
import { GoalInput, GoalsResponse } from '../types';

export const useGoals = () =>
  useQuery({
    queryKey: ['goals'],
    queryFn: getGoals,
  });

export const useCreateGoal = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: GoalInput) => createGoal(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};

export const useDeleteGoal = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ['goals'] });
      const previous = qc.getQueryData<GoalsResponse>(['goals']);

      qc.setQueryData<GoalsResponse>(['goals'], (old) => {
        if (!old) return old;
        return {
          goals: old.goals.filter((goal) => goal.id !== id),
        };
      });

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        qc.setQueryData(['goals'], context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['goals'] });
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
      qc.invalidateQueries({ queryKey: ['goals'] });
      navigate(`/chat/${data.chatId}`);
    },
    onError: (err) => {
      console.error('Start goal topic lesson error:', err);
    },
  });
};
