import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, Network } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const success = await login(email, password);

        if (success) {
            navigate('/');
        } else {
            setError('Invalid email or password.');
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Left Column: Form Container */}
            <div className="login-form-area">

                {/* Brand Header */}
                <div className="login-brand">
                    <img
                        src="/assets/logo.png"
                        alt="Saudi Sensors"
                        className="login-logo"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            // Fallback icon if logo fails to load
                            e.currentTarget.parentElement!.innerHTML = '<div class="login-logo-fallback">SS</div>';
                        }}
                    />
                    <h1 className="login-title">Saudi Sensors <span>IoT</span></h1>
                </div>

                <div className="login-welcome">
                    <h2>Welcome back</h2>
                    <p>Enter your credentials to access the Smart City control center and manage your connected infrastructure.</p>
                </div>

                {error && (
                    <div className="login-error animate-fade-in">
                        <div className="error-dot"></div>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="login-form animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <User size={20} className="input-icon" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@saudisensors.com"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="form-header">
                            <label>Password</label>
                            <a href="#" className="forgot-password">Forgot password?</a>
                        </div>
                        <div className="input-wrapper">
                            <Lock size={20} className="input-icon" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="password-input"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-login"
                    >
                        {isLoading ? 'Authenticating...' : 'Sign In'}
                        {!isLoading && <ArrowRight size={20} className="btn-icon-right" />}
                    </button>
                </form>

                <div className="login-footer">
                    <p>© 2026 Saudi Sensors. Supported by Advanced IoT Security Protocols.</p>
                </div>
            </div>

            {/* Right Column: Hero Image Background */}
            <div className="login-hero-area">
                {/* The actual generated image */}
                <div
                    className="login-hero-bg"
                    style={{ backgroundImage: "url('/assets/login-bg.png')" }}
                ></div>

                {/* Gradient overlays to blend it into the dark theme */}
                <div className="login-hero-overlay-x"></div>
                <div className="login-hero-overlay-y"></div>

                {/* Floating Stats Glass Panel (Decorative) */}
                <div className="login-stats-panel">
                    <div className="stats-header">
                        <div className="stats-icon-bg">
                            <Network size={24} />
                        </div>
                        <div>
                            <div className="stats-title">Network Status</div>
                            <div className="stats-status">
                                <div className="status-dot"></div>
                                All nodes operational
                            </div>
                        </div>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-card" style={{ animationDelay: '0.2s', animation: 'fadeIn 0.5s ease-out backwards' }}>
                            <div className="stat-label">Active Gateways</div>
                            <div className="stat-value">142</div>
                        </div>
                        <div className="stat-card" style={{ animationDelay: '0.3s', animation: 'fadeIn 0.5s ease-out backwards' }}>
                            <div className="stat-label">Managed Lamps</div>
                            <div className="stat-value">8,490</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
