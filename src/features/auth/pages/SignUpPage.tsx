import AuthPage from '@/features/auth/components/AuthPage';
import { SignUpForm } from '@/features/auth/components/sign-up-form';

const SignUpPage = () => {
  return (
    <AuthPage>
      <SignUpForm />
    </AuthPage>
  );
};

export default SignUpPage;
