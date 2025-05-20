import { useMutation } from '@tanstack/react-query';
import useAuthStore from '@/modules/auth/store';
import { signUp } from '@/modules/auth/service';

const useSignUp = () => {
  // const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: signUp,
    onSuccess: (data) => {
      const { user, token } = data;
      setUser(user);
      localStorage.setItem('authToken', token);

      // TODO:
      // queryClient.setQueryData(['me'], user);
    },
    onError: (err) => {
      console.error('Sign up error:', err);
    },
  });
};

export default useSignUp;
