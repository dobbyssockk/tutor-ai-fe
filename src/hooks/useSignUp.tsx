import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/modules/auth/store';
import { signUp } from '@/modules/auth/service';

const useSignUp = () => {
  const queryClient = useQueryClient();
  const { setToken, setUser } = useAuthStore();

  return useMutation({
    mutationFn: signUp,
    onSuccess: (data) => {
      const { user, token } = data;
      setToken(token);
      setUser(user);

      queryClient.setQueryData(['me'], user);
    },
    onError: (err) => {
      console.error('Sign up error:', err);
    },
  });
};

export default useSignUp;
