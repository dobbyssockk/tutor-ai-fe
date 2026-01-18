import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import useAuthStore from '@/features/auth/store';
import {
  deleteMe,
  fetchMe,
  signIn,
  signUp,
  updateMe,
} from '@/features/auth/services';

export const useSignIn = () => {
  const qc = useQueryClient();
  const { setToken, setUser } = useAuthStore();

  return useMutation({
    mutationFn: signIn,
    onSuccess: (data) => {
      const { user, token } = data;
      setToken(token);
      setUser(user);

      qc.setQueryData(['me'], user);
    },
    onError: (err) => {
      console.error('Sign-in error:', err);
    },
  });
};

export const useSignUp = () => {
  const qc = useQueryClient();
  const { setToken, setUser } = useAuthStore();

  return useMutation({
    mutationFn: signUp,
    onSuccess: (data) => {
      const { user, token } = data;
      setToken(token);
      setUser(user);

      qc.setQueryData(['me'], user);
    },
    onError: (err) => {
      console.error('Sign up error:', err);
    },
  });
};

export const useFetchMe = () => {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled: !!token,
    retry: false,
  });
};

export const useUpdateMe = () => {
  const qc = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: updateMe,
    onSuccess: (data) => {
      setUser(data.user);
      qc.setQueryData(['me'], data.user);
    },
    onError: (err) => {
      console.error('Update profile error:', err);
    },
  });
};

export const useDeleteMe = () => {
  const qc = useQueryClient();
  const { signOut } = useAuthStore();

  return useMutation({
    mutationFn: deleteMe,
    onSuccess: () => {
      signOut();
      qc.clear();
    },
    onError: (err) => {
      console.error('Delete account error:', err);
    },
  });
};
