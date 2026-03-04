import AuthForm from '@/components/AuthForm';

export const metadata = {
    title: 'SecondCortex — Login',
    description: 'Log in to your SecondCortex account.',
};

export default function LoginPage() {
    return <AuthForm mode="login" />;
}
