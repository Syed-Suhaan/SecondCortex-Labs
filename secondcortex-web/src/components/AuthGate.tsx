'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ContextGraph from '@/components/ContextGraph';

/**
 * AuthGate — protection wrapper for the live graph.
 * If no token is found in localStorage, it redirects to /login.
 */
export default function AuthGate() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('sc_jwt_token');
        if (!stored) {
            router.push('/login');
        } else {
            setToken(stored);
        }
        setIsChecking(false);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('sc_jwt_token');
        setToken(null);
        router.push('/login');
    };

    if (isChecking) {
        return (
            <div style={{
                width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#020617', color: '#6366f1', fontSize: '18px', fontWeight: 600
            }}>
                Authenticating...
            </div>
        );
    }

    if (!token) {
        return null; // Will be redirected by useEffect
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <button
                onClick={handleLogout}
                style={{
                    position: 'absolute', top: 16, right: 16, zIndex: 1000, padding: '6px 14px', fontSize: '12px',
                    background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '6px', cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.2s ease',
                }}
            >
                Logout
            </button>
            <ContextGraph token={token} onUnauthorized={handleLogout} />
        </div>
    );
}
