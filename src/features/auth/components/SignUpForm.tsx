import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import { cn } from '@/shared/lib/utils';
import { useSignUp } from '@/features/auth/hooks/useAuth';

// Validation
const signUpSchema = z.object({
  email: z.string().email('Введите корректную электронную почту'),
  displayName: z
    .string()
    .max(60, 'Имя должно быть не длиннее 60 символов')
    .optional(),
  password: z
    .string()
    .min(6, 'Пароль должен быть не короче 6 символов')
    .max(100, 'Пароль должен быть не длиннее 100 символов'),
  acceptTerms: z.boolean().refine((value) => value === true, {
    message: 'Подтвердите создание аккаунта.',
  }),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { mutate, status, error } = useSignUp();
  const signUp = (data: SignUpFormData) => {
    mutate({
      email: data.email,
      password: data.password,
      displayName: data.displayName?.trim() || undefined,
    });
  };
  const openConfirm = async () => {
    const isValid = await trigger();
    if (isValid) {
      setIsConfirmOpen(true);
    }
  };

  return (
    <form
      id="sign-up-form"
      onSubmit={handleSubmit(signUp)}
      noValidate
      className={cn('flex flex-col gap-6', className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Создание аккаунта</h1>
        <p className="text-muted-foreground text-sm">
          Введите электронную почту, чтобы создать аккаунт
        </p>
      </div>
      <div className="grid gap-6">
        {/* Email */}
        <div className="grid gap-3">
          <Label htmlFor="email">Электронная почта</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="m@example.com"
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* Display name */}
        <div className="grid gap-3">
          <Label htmlFor="displayName">Имя (необязательно)</Label>
          <Input
            id="displayName"
            type="text"
            {...register('displayName')}
            placeholder="Мария"
            aria-invalid={!!errors.displayName}
          />
          {errors.displayName && (
            <p className="text-red-500 text-sm">{errors.displayName.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="grid gap-3">
          <Label htmlFor="password">Пароль</Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <input
              id="accept-terms"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-muted-foreground/40"
              {...register('acceptTerms')}
            />
            <Label htmlFor="accept-terms" className="text-sm font-normal">
              Я подтверждаю создание аккаунта.
            </Label>
          </div>
          {errors.acceptTerms && (
            <p className="text-red-500 text-sm">{errors.acceptTerms.message}</p>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error.message}</p>}

        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          {status === 'pending' ? (
            <Button type="button" className="w-full ml-auto gap-1.5" disabled>
              <Loader2 className="animate-spin" />
              Создаем аккаунт...
            </Button>
          ) : (
            <Button
              type="button"
              className="w-full ml-auto gap-1.5"
              onClick={openConfirm}
            >
              Зарегистрироваться
            </Button>
          )}
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Создать аккаунт?</AlertDialogTitle>
              <AlertDialogDescription>
                Мы создадим аккаунт Tutor AI с этой электронной почтой.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="sign-up-form"
                disabled={status === 'pending'}
              >
                Создать аккаунт
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="text-center text-sm">
        Уже есть аккаунт?{' '}
        <Link className="underline underline-offset-4" to="/signin">
          Войти
        </Link>
      </div>
    </form>
  );
}
