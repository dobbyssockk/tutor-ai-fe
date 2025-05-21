import { useEffect } from 'react';
import useAuthStore from './modules/auth/store';
import useFetchMe from './hooks/useFetchMe';
import ConversationsProvider from './context/ConversationsProvider';
import { ThemeProvider } from './components/theme-provider';
import AppRoutes from './routes/AppRoutes';
import { Loader2 } from 'lucide-react';
import { CircleAlert } from 'lucide-react';

function App() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const { data, isLoading, isSuccess, isError } = useFetchMe();

  useEffect(() => {
    if (isSuccess && data?.user) {
      setUser(data.user);
    }
  }, [data, isSuccess, setUser]);

  return (
    <ConversationsProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-screen gap-4">
            <Loader2 size="80" className="animate-spin" />
            <p className="text-3xl font-semibold text-center">Loading...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-screen gap-4">
            <CircleAlert size="40" color="var(--destructive)" />
            <p className="text-3xl font-semibold text-center">
              Something went wrong. Please try again.
            </p>
          </div>
        ) : (
          <AppRoutes user={user} />
        )}
      </ThemeProvider>
    </ConversationsProvider>
  );
}

export default App;
