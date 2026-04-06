import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import useAuthStore from '@/features/auth/store';
import {
  deleteMe,
  fetchMe,
  signIn,
  signUp,
  updateMe,
} from '@/features/auth/services';
import { queryKeys } from '@/shared/lib/queryKeys';
import { AuthResponse } from '@/features/auth/types';

const useAuthMutation = <TPayload,>(
  mutationFn: (payload: TPayload) => Promise<AuthResponse>,
  errorLabel: string
) => {
  const qc = useQueryClient();
  const { setToken, setUser } = useAuthStore();

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      const { user, token } = data;
      setToken(token);
      setUser(user);
      qc.setQueryData(queryKeys.auth.me, user);
    },
    onError: (err) => {
      console.error(`${errorLabel}:`, err);
    },
  });
};

export const useSignIn = () =>
  useAuthMutation(signIn, 'Sign-in error');

export const useSignUp = () =>
  useAuthMutation(signUp, 'Sign up error');

export const useFetchMe = () => {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.auth.me,
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
      qc.setQueryData(queryKeys.auth.me, data.user);
      toast.success('Изменения сохранены');
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
