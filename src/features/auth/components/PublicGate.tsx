import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/features/auth/store';

const PublicGate = () => {
  const { token } = useAuthStore();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicGate;
