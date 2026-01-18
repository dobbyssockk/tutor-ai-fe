import { Navigate, Route, Routes } from 'react-router-dom';

import AuthGate from '@/features/auth/components/AuthGate';
import PublicGate from '@/features/auth/components/PublicGate';
import SignInPage from '@/features/auth/pages/SignInPage';
import SignUpPage from '@/features/auth/pages/SignUpPage';
import useAuthStore from '@/features/auth/store';
import ChatPage from '@/features/chats/pages/ChatPage';
import ChatView from '@/features/chats/components/ChatView';
import NoChatSelected from '@/features/chats/components/NoChatSelected';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';

const AppRoutes = () => {
  const { token } = useAuthStore();

  return (
    <Routes>
      {/* Redirect from "/" based on auth state */}
      <Route
        path="/"
        element={<Navigate to={token ? '/dashboard' : '/signin'} replace />}
      />

      {/* PUBLIC-only */}
      <Route element={<PublicGate />}>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Route>

      {/* PRIVATE-only */}
      <Route element={<AuthGate />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/chat" element={<ChatPage />}>
          <Route index element={<NoChatSelected />} />
          <Route path=":id" element={<ChatView />} />
        </Route>
      </Route>

      {/* Catch-all for 404 */}
      <Route path="*" element={<p>There's nothing here: 404!</p>} />
    </Routes>
  );
};

export default AppRoutes;
