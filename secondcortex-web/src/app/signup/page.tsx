import BackendOffline from '@/components/BackendOffline';

export const metadata = {
    title: 'SecondCortex — Sign Up',
    description: 'Create a new SecondCortex account.',
};

export default function SignupPage() {
    return (
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
            <BackendOffline title="Sign up" />
        </main>
    );
}
