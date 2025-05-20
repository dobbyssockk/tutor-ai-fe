import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import useLogin from '@/hooks/useLogin';

// Validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be at most 100 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate, status, error } = useLogin();

  const login = (data: LoginFormData) => {
    mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(login)}
      noValidate
      className={cn('flex flex-col gap-6', className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        {/* Email */}
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
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
          <Label htmlFor="password">Password</Label>
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

        {error && (
          <p className="text-red-500 text-sm">
            {error.message}
          </p>
        )}

        {status === 'pending' ? (
          <Button type="submit" className="w-full ml-auto gap-1.5" disabled>
            <Loader2 className="animate-spin" />
            Logging in...
          </Button>
        ) : (
          <Button type="submit" className="w-full ml-auto gap-1.5">
            Login
          </Button>
        )}
      </div>

      <div className="text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link className="underline underline-offset-4" to="/signup">
          Sign up
        </Link>
      </div>
    </form>
  );
}
