import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/modules/auth/store';
import { login } from '@/modules/auth/service';

const useLogin = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      const { user, token } = data;
      setUser(user);
      localStorage.setItem('authToken', token);

      queryClient.setQueryData(['me'], user);
    },
    onError: (err) => {
      console.error('Login error:', err);
    },
  });
};

export default useLogin;
