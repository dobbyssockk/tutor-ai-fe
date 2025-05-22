import { Outlet, Navigate } from 'react-router-dom';
import useAuthStore from '@/modules/auth/store';

const PublicGate = () => {
  const { token } = useAuthStore();

  if (token) {
    console.log('Navigate - public gate');
    return <Navigate to="/chat" replace />;
  }

  return <Outlet />;
};

export default PublicGate;
