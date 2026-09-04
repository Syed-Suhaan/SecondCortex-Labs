import BackendOffline from '@/components/BackendOffline';

export const metadata = {
    title: 'SecondCortex — Live Context Graph',
    description: 'Real-time visualization of the SecondCortex agent reasoning network.',
};

export default function LivePage() {
    return (
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
            <BackendOffline title="Live Graph" />
        </main>
    );
}
