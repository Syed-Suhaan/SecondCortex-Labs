import BackendOffline from '@/components/BackendOffline';

export const metadata = {
    title: 'SecondCortex — Login',
    description: 'Log in to your SecondCortex account.',
};

export default function LoginPage() {
    return (
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
            <BackendOffline title="Login" />
        </main>
    );
}
