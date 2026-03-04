import AuthForm from '@/components/AuthForm';

export const metadata = {
    title: 'SecondCortex — Sign Up',
    description: 'Create a new SecondCortex account.',
};

export default function SignupPage() {
    return <AuthForm mode="signup" />;
}
