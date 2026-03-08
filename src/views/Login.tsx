import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Mocking auth delay
        setTimeout(() => {
            setIsLoading(false);
            navigate('/');
        }, 800);
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-[var(--color-bg-base)]">
            {/* Abstract Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-primary)] opacity-10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[var(--color-info)] opacity-10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="glass-panel w-full max-w-md p-8 relative z-10 mx-4">
                <div className="flex flex-col items-center mb-8">
                    <img src="/assets/logo.png" alt="Saudi Sensors" className="h-16 mb-4 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    <h1 className="text-2xl font-bold text-white mb-2 text-center">Smart City Platform</h1>
                    <p className="text-[var(--color-text-muted)] text-center text-sm">Sign in to manage IoT assets and projects.</p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User size={18} className="text-[var(--color-text-muted)]" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg py-2.5 pl-10 pr-4 text-white outline-none focus:border-[var(--color-primary)] transition-colors"
                                placeholder="admin@saudisensors.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-[var(--color-text-muted)]" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg py-2.5 pl-10 pr-4 text-white outline-none focus:border-[var(--color-primary)] transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full justify-center py-3 text-lg mt-2 relative overflow-hidden group"
                    >
                        {isLoading ? 'Authenticating...' : 'Sign In'}
                        <div className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
                    Protected by Saudi Sensors Security Validation
                </div>
            </div>
        </div>
    );
};
