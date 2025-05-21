import { useQuery } from '@tanstack/react-query';
import useAuthStore from '@/modules/auth/store';
import { fetchMe } from '@/modules/auth/service';

const useFetchMe = () => {
  const setUser = useAuthStore((state) => state.setUser);

  const token = localStorage.getItem('authToken');
  if (!token) {
    setUser(null);
  }
  return useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled: !!token,
  });
};

export default useFetchMe;
