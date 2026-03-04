'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AuthFormProps {
    mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const emailTrim = email.trim();
        if (!emailTrim || !password) {
            setError('Please enter both email and password.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sc-backend-suhaan.azurewebsites.net';
            const endpoint = mode === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/signup';

            const payload = mode === 'login'
                ? { email: emailTrim, password }
                : { email: emailTrim, password, display_name: displayName.trim() };

            const res = await fetch(`${backendUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('sc_jwt_token', data.token);
                router.push('/live');
            } else {
                const errData = await res.json().catch(() => ({}));
                setError(errData.detail || `${mode === 'login' ? 'Login' : 'Signup'} failed. Please check your credentials.`);
            }
        } catch {
            setError('Cannot reach the backend. Is it running?');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}>
            <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '16px',
                padding: '48px',
                maxWidth: '420px',
                width: '100%',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(99, 102, 241, 0.1)',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>🧠</div>
                    <h1 style={{
                        fontSize: '24px', fontWeight: 700, color: '#e2e8f0', margin: '0 0 4px 0', letterSpacing: '-0.5px',
                    }}>SecondCortex</h1>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                        {mode === 'login' ? 'Welcome back' : 'Join the Neural Network'}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            style={{
                                width: '100%', padding: '12px 16px', fontSize: '14px',
                                background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99, 102, 241, 0.3)',
                                borderRadius: '10px', color: '#e2e8f0', outline: 'none', boxSizing: 'border-box',
                                marginBottom: '16px'
                            }}
                            required
                        />

                        <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{
                                width: '100%', padding: '12px 16px', fontSize: '14px',
                                background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99, 102, 241, 0.3)',
                                borderRadius: '10px', color: '#e2e8f0', outline: 'none', boxSizing: 'border-box',
                                marginBottom: mode === 'signup' ? '16px' : '0'
                            }}
                            required
                        />

                        {mode === 'signup' && (
                            <>
                                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>Display Name (optional)</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Your Name"
                                    style={{
                                        width: '100%', padding: '12px 16px', fontSize: '14px',
                                        background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99, 102, 241, 0.3)',
                                        borderRadius: '10px', color: '#e2e8f0', outline: 'none', boxSizing: 'border-box'
                                    }}
                                />
                            </>
                        )}
                    </div>

                    {error && (
                        <div style={{
                            padding: '10px 14px', fontSize: '13px', color: '#f87171',
                            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '8px', marginBottom: '16px',
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%', padding: '12px', fontSize: '14px', fontWeight: 600,
                            background: isLoading ? 'rgba(99, 102, 241, 0.3)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: '#fff', border: 'none', borderRadius: '10px',
                            cursor: isLoading ? 'wait' : 'pointer', letterSpacing: '0.3px', marginTop: '8px'
                        }}
                    >
                        {isLoading ? 'Please wait…' : (mode === 'login' ? 'Log In' : 'Create Account')}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
                    {mode === 'login' ? (
                        <>
                            Don't have an account?{' '}
                            <Link href="/signup" style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: 500 }}>
                                Sign up
                            </Link>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <Link href="/login" style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: 500 }}>
                                Log in
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
