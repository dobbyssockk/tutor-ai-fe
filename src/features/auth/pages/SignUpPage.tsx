import AuthPage from '@/features/auth/components/AuthPage';
import { SignUpForm } from '@/features/auth/components/SignUpForm';

const SignUpPage = () => {
  return (
    <AuthPage>
      <SignUpForm />
    </AuthPage>
  );
};

export default SignUpPage;
