import { AxiosError } from 'axios';

import customAxios from '@/shared/lib/axios';
import { AuthMeResponse, AuthResponse, CreateUser, SignInUser } from '../types';

const postAuthPayload = async (
  path: '/auth/sign-up' | '/auth/sign-in',
  userData: CreateUser | SignInUser,
  fallbackMessage: string
): Promise<AuthResponse> => {
  try {
    const { data } = await customAxios.post(path, userData);
    return data;
  } catch (err) {
    if (err instanceof AxiosError) {
      throw new Error(err?.response?.data?.message || fallbackMessage);
    }
    throw err;
  }
};

export const signUp = (userData: CreateUser) =>
  postAuthPayload('/auth/sign-up', userData, 'Sign up failed');

export const signIn = async (userData: SignInUser): Promise<AuthResponse> => {
  return postAuthPayload('/auth/sign-in', userData, 'Sign in failed');
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
