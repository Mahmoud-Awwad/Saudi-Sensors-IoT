import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { UserCircle, LogOut, Key } from 'lucide-react';

export const Topbar: React.FC = () => {
    const { currentProject, projects, setCurrentProject, currentGateway, setCurrentGateway } = useProject();
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };

        if (showProfileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.addEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileMenu]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            alert("New passwords do not match!");
            return;
        }
        // Mock success
        alert("Password successfully updated. (Mock API)");
        setShowPasswordModal(false);
        setPasswordData({ current: '', new: '', confirm: '' });
        setShowProfileMenu(false);
    };

    return (
        <header className="topbar">
            <div className="flex items-center gap-4">
                {/* Project Selector */}
                <select
                    className="glass-panel"
                    style={{ padding: '0.5rem', color: 'var(--color-primary)', fontWeight: 600, outline: 'none' }}
                    value={currentProject?.id || ''}
                    onChange={(e) => {
                        const proj = projects.find(p => p.id === e.target.value);
                        setCurrentProject(proj || null);
                    }}
                >
                    {projects.map(p => (
                        <option key={p.id} value={p.id} style={{ background: 'var(--color-bg-base)', color: 'white' }}>
                            {p.name}
                        </option>
                    ))}
                </select>

                {/* Gateway Selector */}
                {currentProject && (
                    <div className="flex items-center gap-2 border-l border-[var(--color-border)] pl-4">
                        <span className="text-sm text-[var(--color-text-muted)]">Gateway:</span>
                        <select
                            className="glass-panel"
                            style={{ padding: '0.4rem', color: 'var(--color-primary)', fontWeight: 600, outline: 'none' }}
                            value={currentGateway}
                            onChange={(e) => setCurrentGateway(e.target.value)}
                        >
                            <option value="all" style={{ background: 'var(--color-bg-base)', color: 'white' }}>All Gateways ({currentProject.driveUids.length})</option>
                            {currentProject.driveUids.map(uid => (
                                <option key={uid} value={uid} style={{ background: 'var(--color-bg-base)', color: 'white' }}>
                                    {uid}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4 relative" ref={dropdownRef}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{currentUser?.name || 'Guest User'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{currentUser?.role || 'Viewer'}</div>
                </div>
                <button
                    className="flex items-center gap-2 hover:bg-[rgba(255,255,255,0.05)] p-1 rounded-full transition-colors relative"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                    <UserCircle size={36} color="var(--color-primary)" />
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                    <div className="absolute top-[120%] right-0 w-64 bg-[#1e222d] border border-[var(--color-border)] rounded-lg shadow-2xl z-50 overflow-hidden" style={{ backdropFilter: 'blur(12px)' }}>
                        <div className="p-3 border-b border-[var(--color-border)]">
                            <p className="text-sm font-medium text-white truncate">{currentUser?.email}</p>
                        </div>
                        <div className="p-1">
                            <button
                                className="btn-dropdown"
                                onClick={() => setShowPasswordModal(true)}
                            >
                                <Key size={14} /> Change Password
                            </button>
                            <button
                                className="btn-dropdown danger mt-1"
                                onClick={handleLogout}
                            >
                                <LogOut size={14} /> Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-md p-6 animate-fade-in relative border border-[var(--color-border)] shadow-2xl">
                        <button
                            onClick={() => setShowPasswordModal(false)}
                            className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-white"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Key size={20} className="text-[var(--color-primary)]" /> Change Password
                        </h2>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Current Password</label>
                                <input
                                    required
                                    type="password"
                                    value={passwordData.current}
                                    onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded p-2 text-white outline-none focus:border-[var(--color-primary)] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-[var(--color-text-muted)] mb-1 block">New Password</label>
                                <input
                                    required
                                    type="password"
                                    value={passwordData.new}
                                    onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded p-2 text-white outline-none focus:border-[var(--color-primary)] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Confirm New Password</label>
                                <input
                                    required
                                    type="password"
                                    value={passwordData.confirm}
                                    onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded p-2 text-white outline-none focus:border-[var(--color-primary)] transition-colors"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" className="btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Update Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </header>
    );
};
