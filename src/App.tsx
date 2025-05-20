import ConversationsProvider from './context/ConversationsProvider';
import { ThemeProvider } from '@/components/theme-provider';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ChatPage from './pages/ChatPage';
import NoChatSelected from './components/NoChatSelected';
import ChatView from './components/ChatView';
import useAuthStore from './modules/auth/store';

function App() {
  const user = useAuthStore((state) => state.user);
  return (
    <ConversationsProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Routes>
          <Route
            path="/"
            element={<Navigate replace to={user ? '/chat' : '/login'} />}
          />
          <Route
            path="/login"
            element={
              <ProtectedRoute onlyForAuth={false} redirectPath="/chat">
                <LoginPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <ProtectedRoute onlyForAuth={false} redirectPath="/chat">
                <SignupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute onlyForAuth={true} redirectPath="/login">
                <ChatPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<NoChatSelected />} />
            <Route path=":id" element={<ChatView />} />
          </Route>
          <Route path="*" element={<p>There's nothing here: 404!</p>} />
        </Routes>
      </ThemeProvider>
    </ConversationsProvider>
  );
}

export default App;
