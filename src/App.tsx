import AuthProvider from './context/AuthProvider';
import ConversationsProvider from './context/ConversationsProvider';
import { ThemeProvider } from '@/components/theme-provider';
import { Routes, Route } from 'react-router-dom';
import MainRedirect from './components/MainRedirect';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ChatPage from './pages/ChatPage';
import NoChatSelected from './components/NoChatSelected';
import ChatView from './components/ChatView';

function App() {
  return (
    <AuthProvider>
      <ConversationsProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Routes>
            <Route path="/" element={<MainRedirect />} />
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
    </AuthProvider>
  );
}

export default App;
