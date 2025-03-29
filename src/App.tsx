import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import { ThemeProvider } from '@/components/theme-provider';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ChatPage />
    </ThemeProvider>
  );
}

export default App;
