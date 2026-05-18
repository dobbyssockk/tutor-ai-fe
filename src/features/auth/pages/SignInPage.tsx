import AuthPage from '@/features/auth/components/AuthPage';
import { SignInForm } from '@/features/auth/components/SignInForm';

const SignInPage = () => {
  return (
    <AuthPage>
      <SignInForm />
    </AuthPage>
  );
};

export default SignInPage;
