import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  onlyForAuth: boolean;
  isAuth: boolean;
  redirectPath: string;
  children: ReactNode;
}

const ProtectedRoute = ({
  onlyForAuth,
  isAuth,
  redirectPath,
  children,
}: ProtectedRouteProps) => {
  return onlyForAuth !== isAuth ? (
    <Navigate replace to={redirectPath} />
  ) : (
    children
  );
};

export default ProtectedRoute;
