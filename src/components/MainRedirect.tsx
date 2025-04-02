import { Navigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

const MainRedirect = () => {
  const { user } = useAuth();
  return <Navigate replace to={user ? '/chat' : '/login'} />;
};

export default MainRedirect;
