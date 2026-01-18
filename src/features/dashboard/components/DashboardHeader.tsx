import { Link } from 'react-router-dom';

import { Button } from '@/shared/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import useAuthStore from '@/features/auth/store';

const DashboardHeader = () => {
  const { signOut } = useAuthStore();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Tutor AI Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Track your progress, set goals, and pick up where you left off.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button asChild variant="outline">
          <Link to="/chat">Go to chat</Link>
        </Button>
        <Button disabled>Start assessment</Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost">Sign out</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out of Tutor AI?</AlertDialogTitle>
              <AlertDialogDescription>
                You can sign back in at any time. Unsaved changes will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={signOut}>Sign out</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
};

export default DashboardHeader;
