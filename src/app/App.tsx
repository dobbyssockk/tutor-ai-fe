import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from '@/shared/components/theme-provider';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;
