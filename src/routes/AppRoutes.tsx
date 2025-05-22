import { Routes, Route } from 'react-router-dom';
import AuthGate from '@/components/AuthGate';
import PublicGate from '@/components/PublicGate';

import LoginPage from '../pages/LoginPage';
import SignUpPage from '../pages/SignUpPage';
import ChatPage from '../pages/ChatPage';
import NoChatSelected from '../components/NoChatSelected';
import ChatView from '../components/ChatView';

const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC-only */}
      <Route element={<PublicGate />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Route>

      {/* PRIVATE-only */}
      <Route element={<AuthGate />}>
        <Route path="/chat" element={<ChatPage />}>
          <Route index element={<NoChatSelected />} />
          <Route path=":id" element={<ChatView />} />
        </Route>
      </Route>

      <Route path="*" element={<p>There's nothing here: 404!</p>} />
    </Routes>
  );
};

export default AppRoutes;
