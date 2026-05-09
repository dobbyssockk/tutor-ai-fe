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
    <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-2">
        <p className="text-sm text-muted-foreground">С возвращением</p>
        <div>
          <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
            Панель Tutor AI
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Ставьте цели и отслеживайте прогресс
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 min-[360px]:flex-row sm:items-center sm:gap-3">
        <Button asChild variant="outline" className="w-full min-[360px]:w-auto">
          <Link to="/chat">Перейти к чату</Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="w-full min-[360px]:w-auto">
              Выйти
            </Button>
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
