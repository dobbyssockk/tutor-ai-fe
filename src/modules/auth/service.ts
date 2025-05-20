import { CreateUser, LoginUser, AuthResponse } from '@/modules/auth/types';
import customAxios from '@/lib/axios';
import { AxiosError } from 'axios';

export const signUp = async (userData: CreateUser): Promise<AuthResponse> => {
  try {
    const { data } = await customAxios.post('/auth/sign-up', userData);
    return data;
  } catch (err) {
    if (err instanceof AxiosError) {
      throw new Error(err?.response?.data?.message || 'Login failed');
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
