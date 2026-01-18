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
  email: z.string().email('Invalid email address'),
  displayName: z
    .string()
    .max(60, 'Display name must be at most 60 characters')
    .optional(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be at most 100 characters'),
  acceptTerms: z
    .boolean()
    .refine((value) => value === true, {
      message: 'Please confirm before creating your account.',
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
  const signUp = ({ acceptTerms, ...data }: SignUpFormData) => {
    mutate({
      ...data,
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
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email below to create an account
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

        {/* Display name */}
        <div className="grid gap-3">
          <Label htmlFor="displayName">Display name (optional)</Label>
          <Input
            id="displayName"
            type="text"
            {...register('displayName')}
            placeholder="Maria"
            aria-invalid={!!errors.displayName}
          />
          {errors.displayName && (
            <p className="text-red-500 text-sm">
              {errors.displayName.message}
            </p>
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

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <input
              id="accept-terms"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-muted-foreground/40"
              {...register('acceptTerms')}
            />
            <Label htmlFor="accept-terms" className="text-sm font-normal">
              I understand this will create my account.
            </Label>
          </div>
          {errors.acceptTerms && (
            <p className="text-red-500 text-sm">
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error.message}</p>}

        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          {status === 'pending' ? (
            <Button type="button" className="w-full ml-auto gap-1.5" disabled>
              <Loader2 className="animate-spin" />
              Signing up...
            </Button>
          ) : (
            <Button
              type="button"
              className="w-full ml-auto gap-1.5"
              onClick={openConfirm}
            >
              Sign up
            </Button>
          )}
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Create your account?</AlertDialogTitle>
              <AlertDialogDescription>
                We will set up your Tutor AI account with this email.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="sign-up-form"
                disabled={status === 'pending'}
              >
                Create account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="text-center text-sm">
        Already have an account?{' '}
        <Link className="underline underline-offset-4" to="/signin">
          Sign in
        </Link>
      </div>
    </form>
  );
}
