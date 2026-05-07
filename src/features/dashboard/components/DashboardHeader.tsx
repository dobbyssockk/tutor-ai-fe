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
        <p className="text-sm text-muted-foreground">С возвращением</p>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Панель Tutor AI
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Ставьте цели и отслеживайте прогресс
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button asChild variant="outline">
          <Link to="/chat">Перейти к чату</Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost">Выйти</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Выйти из Tutor AI?</AlertDialogTitle>
              <AlertDialogDescription>
                Вы сможете войти снова в любое время. Несохраненные изменения
                будут потеряны.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={signOut}>Выйти</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
};

export default DashboardHeader;
