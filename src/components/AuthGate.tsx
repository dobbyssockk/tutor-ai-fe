import { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import useFetchMe from '@/hooks/useFetchMe';
import useAuthStore from '@/modules/auth/store';
import { Loader2 } from 'lucide-react';
import { CircleAlert } from 'lucide-react';

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
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 size="80" className="animate-spin" />
        <p className="text-3xl font-semibold text-center">Loading...</p>
      </div>
    );
  }

  if (isError) {
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <CircleAlert size="40" color="var(--destructive)" />
      <p className="text-3xl font-semibold text-center">
        Something went wrong. Please try again.
      </p>
    </div>;
  }

  return <Outlet />;
};

export default AuthGate;
