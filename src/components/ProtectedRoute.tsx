import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

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
  const { user } = useAuth();
  const isAuthenticated = !!user;

  if (onlyForAuth !== isAuthenticated) {
    return <Navigate replace to={redirectPath} />;
  }

  return children;
};

export default ProtectedRoute;
