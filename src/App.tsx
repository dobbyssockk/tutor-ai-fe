import ConversationsProvider from './context/ConversationsProvider';
import { ThemeProvider } from './components/theme-provider';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <ConversationsProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AppRoutes />
      </ThemeProvider>
    </ConversationsProvider>
  );
}

export default App;
