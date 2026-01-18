import axios from 'axios';

import queryClient from './queryClient';
import useAuthStore from '@/features/auth/store';

const BASE_URL = 'http://localhost:3000';
const customAxios = axios.create({
  baseURL: BASE_URL,
});

customAxios.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

customAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    if (
      error?.response?.status === 401 &&
      !url.endsWith('/signin') &&
      !url.endsWith('/signup')
    ) {
      useAuthStore.getState().signOut();
      queryClient.clear();
    }
    return Promise.reject(error);
  }
);

export default customAxios;
