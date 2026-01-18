import customAxios from '@/shared/lib/axios';
import {
  GoalInput,
  GoalResponse,
  GoalsResponse,
  GoalUpdateInput,
} from '../types';

export const getGoals = async (): Promise<GoalsResponse> => {
  const { data } = await customAxios.get('/goals');
  return data;
};

export const createGoal = async (payload: GoalInput): Promise<GoalResponse> => {
  const { data } = await customAxios.post('/goals', payload);
  return data;
};

export const updateGoal = async (
  id: string,
  payload: GoalUpdateInput
): Promise<GoalResponse> => {
  const { data } = await customAxios.patch(`/goals/${id}`, payload);
  return data;
};

export const deleteGoal = (id: string) => customAxios.delete(`/goals/${id}`);
