import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Pencil } from 'lucide-react';

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
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import useAuthStore from '@/features/auth/store';
import { useDeleteMe, useUpdateMe } from '@/features/auth/hooks/useAuth';

const AccountPreviewCard = () => {
  const { user } = useAuthStore();
  const { mutate: updateMe, isPending } = useUpdateMe();
  const { mutate: deleteMe, isPending: isDeleting } = useDeleteMe();
  const [displayName, setDisplayName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [instructions, setInstructions] = useState('');
  const createdAtLabel = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('ru-RU')
    : '-';
  const displayNameValue = displayName.trim();
  const displayNameLabel = displayNameValue || user?.displayName;

  useEffect(() => {
    setDisplayName(user?.displayName ?? '');
    setInstructions(user?.tutorInstructions ?? '');
  }, [user?.displayName, user?.tutorInstructions]);

  const isDirty = useMemo(() => {
    const instructionsDirty =
      (user?.tutorInstructions ?? '') !== instructions.trim();
    const displayNameDirty = (user?.displayName ?? '') !== displayName.trim();
    return instructionsDirty || displayNameDirty;
  }, [displayName, instructions, user?.displayName, user?.tutorInstructions]);

  return (
    <section className="min-w-0 rounded-xl border bg-card/60 p-4 shadow-sm sm:p-6">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Профиль</p>
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              {displayNameLabel ? (
                <>
                  <span className="max-w-full break-words font-semibold">
                    {displayNameLabel}
                  </span>
                  <span className="max-w-full break-all text-muted-foreground">
                    {user?.email ?? 'Email not set'}
                  </span>
                </>
              ) : (
                <span className="max-w-full break-all font-semibold">
                  {user?.email ?? 'Email not set'}
                </span>
              )}
            </div>
          </div>
          <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>

        <div className="mt-6 space-y-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Детали аккаунта
            </p>
            <div className="mt-3 grid gap-3 rounded-lg border bg-background/60 p-3 text-sm sm:p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="text-muted-foreground">
                  Отображаемое имя
                  <span className="ml-1 text-xs text-muted-foreground">
                    (используется в чате)
                  </span>
                </span>
                <div className="flex min-w-0 items-center justify-between gap-2 sm:justify-end">
                  {isEditingName ? (
                    <Input
                      id="display-name"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      placeholder="Ваше имя"
                      className="h-8 min-w-0 flex-1 text-sm sm:w-40 sm:flex-none"
                      aria-label="Отображаемое имя"
                    />
                  ) : (
                    <span
                      className={
                        displayNameValue
                          ? 'min-w-0 break-words font-medium'
                          : 'min-w-0 text-muted-foreground'
                      }
                    >
                      {displayNameValue || 'Не задано'}
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={
                      isEditingName
                        ? 'Скрыть редактирование имени'
                        : 'Редактировать имя'
                    }
                    onClick={() => setIsEditingName((prev) => !prev)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-muted-foreground">Электронная почта</span>
                <span className="break-all font-medium">{user?.email ?? '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Зарегистрирован</span>
                <span className="font-medium">{createdAtLabel}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-instructions">
              Как должен помогать тьютор?
            </Label>
            <Textarea
              id="profile-instructions"
              placeholder="Объясняй пошагово, задавай вопросы, отвечай кратко"
              className="text-sm"
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Это поможет настроить стиль ответов вашего тьютора.
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              disabled={!isDirty || isPending}
              onClick={() =>
                updateMe({
                  tutorInstructions: instructions.trim() || null,
                  displayName: displayName.trim() || null,
                })
              }
            >
              {isPending ? 'Сохраняем...' : 'Сохранить изменения'}
            </Button>
          </div>

          <div className="rounded-lg border border-destructive/30 bg-background/60 p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">
                  Удалить аккаунт
                </p>
                <p className="text-sm text-muted-foreground">
                  Это навсегда удалит профиль, цели и чаты.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    {isDeleting ? 'Удаляем...' : 'Удалить аккаунт'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Удалить аккаунт?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Это действие нельзя отменить. Ваши чаты, цели и профиль
                      будут удалены навсегда.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                      Отмена
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20"
                      onClick={() => deleteMe()}
                      disabled={isDeleting}
                    >
                      Удалить аккаунт
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </details>
    </section>
  );
};

export default AccountPreviewCard;
