import React from 'react';
import { useProject } from '../context/ProjectContext';
import { usePermissions } from '../hooks/usePermissions';
import { UserCircle } from 'lucide-react';

export const Topbar: React.FC = () => {
    const { currentProject, projects, setCurrentProject } = useProject();
    const { role } = usePermissions();

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

            <div className="flex items-center gap-4">
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Admin User</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{role}</div>
                </div>
                <UserCircle size={36} color="var(--color-primary)" />
            </div>
        </header>
    );
};
