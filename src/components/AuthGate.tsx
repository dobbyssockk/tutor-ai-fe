import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import Error from './Error';
import Loader from './Loader';

import { useFetchMe } from '@/modules/auth/hooks/useAuth';
import useAuthStore from '@/modules/auth/store';

const AuthGate = () => {
  const { token, setUser } = useAuthStore();
  const location = useLocation();

  const { data, isLoading, isError } = useFetchMe();

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    }
  }, [data, setUser]);

  if (!token) {
    console.log('Navigate - auth gate');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <Error />;
  }

  return <Outlet />;
};

export default AuthGate;
