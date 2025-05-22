import { useQuery } from '@tanstack/react-query';
import useAuthStore from '@/modules/auth/store';
import { fetchMe } from '@/modules/auth/service';

const useFetchMe = () => {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled: !!token,
    retry: false,
  });
};

export default useFetchMe;
