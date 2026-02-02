import customAxios from '@/shared/lib/axios';
import { GoalInput, GoalResponse, GoalsResponse } from '../types';

export const getGoals = async (): Promise<GoalsResponse> => {
  const { data } = await customAxios.get('/goals');
  return data;
};

export const createGoal = async (payload: GoalInput): Promise<GoalResponse> => {
  const { data } = await customAxios.post('/goals', payload);
  return data;
};

export const deleteGoal = (id: string) => customAxios.delete(`/goals/${id}`);

export const startGoalTopicLesson = async (
  goalId: string,
  topicId: string
): Promise<{ chatId: string }> => {
  const { data } = await customAxios.post(
    `/goals/${goalId}/topics/${topicId}/lesson`
  );
  return data;
};
