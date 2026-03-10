import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../context/AuthContext';
import { UserCircle, LogOut, Key } from 'lucide-react';

export const Topbar: React.FC = () => {
    const { currentProject, projects, setCurrentProject } = useProject();
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="topbar">
            <div className="flex items-center gap-4">
                {/* Project Selector Placeholder */}
                <select
                    className="glass-panel"
                    style={{ padding: '0.5rem', color: 'var(--color-text-main)', outline: 'none' }}
                    value={currentProject?.id || ''}
                    onChange={(e) => {
                        const proj = projects.find(p => p.id === e.target.value);
                        setCurrentProject(proj || null);
                    }}
                >
                    {projects.map(p => (
                        <option key={p.id} value={p.id} style={{ background: 'var(--color-bg-base)' }}>
                            {p.name}
                        </option>
                    ))}
                </select>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    Drive UID: <span style={{ color: 'var(--color-primary)' }}>{currentProject?.driveUid}</span>
                </div>
            </div>

            <div className="flex items-center gap-4 relative">
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{currentUser?.name || 'Guest User'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{currentUser?.role || 'Viewer'}</div>
                </div>
                <button
                    className="flex items-center gap-2 hover:bg-[rgba(255,255,255,0.05)] p-1 rounded-full transition-colors"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                    <UserCircle size={36} color="var(--color-primary)" />
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                    <div className="absolute top-12 right-0 w-48 bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded-lg shadow-xl z-50 overflow-hidden">
                        <div className="p-3 border-b border-[var(--color-border)]">
                            <p className="text-sm font-medium text-white truncate">{currentUser?.email}</p>
                        </div>
                        <div className="p-1">
                            <button className="w-full text-left px-3 py-2 text-sm text-[var(--color-text-main)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white rounded flex items-center gap-2 transition-colors">
                                <Key size={14} /> Change Password
                            </button>
                            <button
                                className="w-full text-left px-3 py-2 text-sm text-[var(--color-danger)] hover:bg-[rgba(239,68,68,0.1)] rounded flex items-center gap-2 transition-colors mt-1"
                                onClick={handleLogout}
                            >
                                <LogOut size={14} /> Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};
