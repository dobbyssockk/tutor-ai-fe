import { AxiosError } from 'axios';

import customAxios from '@/shared/lib/axios';
import { AuthMeResponse, AuthResponse, CreateUser, SignInUser } from '../types';

export const signUp = async (userData: CreateUser): Promise<AuthResponse> => {
  try {
    const { data } = await customAxios.post('/auth/sign-up', userData);
    return data;
  } catch (err) {
    if (err instanceof AxiosError) {
      throw new Error(err?.response?.data?.message || 'Sign up failed');
    }
    throw err;
  }
};

export const signIn = async (userData: SignInUser): Promise<AuthResponse> => {
  try {
    const { data } = await customAxios.post('/auth/sign-in', userData);
    return data;
  } catch (err) {
    if (err instanceof AxiosError) {
      throw new Error(err?.response?.data?.message || 'Sign in failed');
    }
    throw err;
  }
};

export const fetchMe = async (): Promise<AuthMeResponse> => {
  const { data } = await customAxios.get('/auth/me');
  return data;
};

export const updateMe = async (payload: {
  tutorInstructions?: string | null;
  displayName?: string | null;
}): Promise<AuthMeResponse> => {
  const { data } = await customAxios.patch('/auth/me', payload);
  return data;
};

export const deleteMe = async (): Promise<void> => {
  await customAxios.delete('/auth/me');
};
