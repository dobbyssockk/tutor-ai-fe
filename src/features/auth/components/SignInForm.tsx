import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import { cn } from '@/shared/lib/utils';
import { useSignIn } from '@/features/auth/hooks/useAuth';

// Validation
const signInSchema = z.object({
  email: z.string().email('Введите корректную электронную почту'),
  password: z
    .string()
    .min(6, 'Пароль должен быть не короче 6 символов')
    .max(100, 'Пароль должен быть не длиннее 100 символов'),
});

type SignInFormData = z.infer<typeof signInSchema>;

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const { mutate, status, error } = useSignIn();
  const signIn = (data: SignInFormData) => {
    mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(signIn)}
      noValidate
      className={cn('flex flex-col gap-6', className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Вход в аккаунт</h1>
        <p className="text-muted-foreground text-sm">
          Введите электронную почту, чтобы войти в аккаунт
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

        {error && <p className="text-red-500 text-sm">{error.message}</p>}

        {status === 'pending' ? (
          <Button type="submit" className="w-full ml-auto gap-1.5" disabled>
            <Loader2 className="animate-spin" />
            Входим...
          </Button>
        ) : (
          <Button type="submit" className="w-full ml-auto gap-1.5">
            Войти
          </Button>
        )}
      </div>

      <div className="text-center text-sm">
        Нет аккаунта?{' '}
        <Link className="underline underline-offset-4" to="/signup">
          Зарегистрироваться
        </Link>
      </div>
    </form>
  );
}
