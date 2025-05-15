import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Link } from 'react-router-dom';

type SignupFormProps = {
  handleSubmit: (email: string, e: React.FormEvent<HTMLFormElement>) => void;
} & React.ComponentProps<'form'>;

export function SignupForm({
  className,
  handleSubmit,
  ...props
}: SignupFormProps) {
  const [email, setEmail] = useState('');

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      {...props}
      onSubmit={(e) => handleSubmit(email, e)}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email below to create an account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="m@example.com"
            required
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input id="password" type="password" required />
        </div>
        <Button type="submit" className="w-full">
          Sign up
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?{' '}
        <Link className="underline underline-offset-4" to="/login">
          Login
        </Link>
      </div>
    </form>
  );
}
