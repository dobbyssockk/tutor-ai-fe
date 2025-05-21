import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import SignUpPage from '../pages/SignUpPage';
import ChatPage from '../pages/ChatPage';
import NoChatSelected from '../components/NoChatSelected';
import ChatView from '../components/ChatView';
import { User } from '@/modules/auth/types';

const AppRoutes = ({ user }: { user: User | null }) => {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate replace to={user ? '/chat' : '/login'} />}
      />

      <Route
        path="/login"
        element={
          <ProtectedRoute onlyForAuth={false} isAuth={!!user} redirectPath="/chat">
            <LoginPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <ProtectedRoute onlyForAuth={false} isAuth={!!user} redirectPath="/chat">
            <SignUpPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute onlyForAuth={true} isAuth={!!user} redirectPath="/login">
            <ChatPage />
          </ProtectedRoute>
        }
      >
        <Route index element={<NoChatSelected />} />
        <Route path=":id" element={<ChatView />} />
      </Route>

      <Route path="*" element={<p>There's nothing here: 404!</p>} />
    </Routes>
  );
};

export default AppRoutes;
