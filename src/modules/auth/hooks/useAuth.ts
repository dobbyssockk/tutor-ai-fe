import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import useAuthStore from '@/modules/auth/store';
import { fetchMe, login, signUp } from '@/modules/auth/service';

export const useLogin = () => {
  const qc = useQueryClient();
  const { setToken, setUser } = useAuthStore();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      const { user, token } = data;
      setToken(token);
      setUser(user);

      qc.setQueryData(['me'], user);
    },
    onError: (err) => {
      console.error('Login error:', err);
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
