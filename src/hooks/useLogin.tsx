import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/modules/auth/store';
import { login } from '@/modules/auth/service';

const useLogin = () => {
  const queryClient = useQueryClient();
  const { setToken, setUser } = useAuthStore();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      const { user, token } = data;
      setToken(token);
      setUser(user);

      queryClient.setQueryData(['me'], user);
    },
    onError: (err) => {
      console.error('Login error:', err);
    },
  });
};

export default useLogin;
