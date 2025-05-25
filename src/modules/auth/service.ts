import { AxiosError } from 'axios';

import customAxios from '@/lib/axios';
import { AuthMeResponse, AuthResponse, CreateUser, LoginUser } from './types';

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

export const login = async (userData: LoginUser): Promise<AuthResponse> => {
  try {
    const { data } = await customAxios.post('/auth/login', userData);
    return data;
  } catch (err) {
    if (err instanceof AxiosError) {
      throw new Error(err?.response?.data?.message || 'Login failed');
    }
    throw err;
  }
};

export const fetchMe = async (): Promise<AuthMeResponse> => {
  const { data } = await customAxios.get('/auth/me');
  return data;
};
