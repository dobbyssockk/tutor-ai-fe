import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import AuthGate from '@/features/auth/components/AuthGate';
import PublicGate from '@/features/auth/components/PublicGate';
import SignInPage from '@/features/auth/pages/SignInPage';
import SignUpPage from '@/features/auth/pages/SignUpPage';
import useAuthStore from '@/features/auth/store';
import AssessmentAttemptPage from '@/features/assessments/pages/AssessmentAttemptPage';
import AssessmentResultPage from '@/features/assessments/pages/AssessmentResultPage';
import ChatPage from '@/features/chats/pages/ChatPage';
import ChatView from '@/features/chats/components/ChatView';
import NoChatSelected from '@/features/chats/components/NoChatSelected';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';

const AppRoutes = () => {
  const { token } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/chat')) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

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
        <Route
          path="/assessments/:id/attempts/:attemptId"
          element={<AssessmentAttemptPage />}
        />
        <Route
          path="/assessments/attempts/:attemptId/results"
          element={<AssessmentResultPage />}
        />
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
