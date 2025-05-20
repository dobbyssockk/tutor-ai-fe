import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '@/modules/auth/store';

interface ProtectedRouteProps {
  onlyForAuth: boolean;
  redirectPath: string;
  children: ReactNode;
}

const ProtectedRoute = ({
  onlyForAuth,
  redirectPath,
  children,
}: ProtectedRouteProps) => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = !!user;

  if (onlyForAuth !== isAuthenticated) {
    return <Navigate replace to={redirectPath} />;
  }

  return children;
};

export default ProtectedRoute;
