import React, { useState } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import type { UserRole } from '../hooks/usePermissions';
import { UserPlus, Edit2, Shield, Trash2 } from 'lucide-react';

interface UserData {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    projects: string[];
}

const mockUsers: UserData[] = [
    { id: 'U-1', name: 'Admin Manager', email: 'admin@saudisensors.com', role: 'Super Admin', projects: ['All'] },
    { id: 'U-2', name: 'Riyadh Supervisor', email: 'riyadh@saudisensors.com', role: 'Supervisor', projects: ['Riyadh Central District'] },
    { id: 'U-3', name: 'Jeddah Sec Oper', email: 'jeddah@saudisensors.com', role: 'Operator', projects: ['Jeddah Coastal Hub'] },
];

export const AdminPanel: React.FC = () => {
    const { role, canManageProjects, setRole } = usePermissions();
    const [users] = useState<UserData[]>(mockUsers);

    if (role !== 'Super Admin') {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                <Shield size={64} className="text-[var(--color-danger)] mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
                <p className="text-[var(--color-text-muted)]">You do not have administrative privileges to view this page.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Administrative Control</h1>
                    <p className="text-[var(--color-text-muted)]">User governance, roles, and project lifecycle management.</p>
                </div>
                <button className="btn-primary" onClick={() => alert("Open create user modal")}>
                    <UserPlus size={18} /> Add User
                </button>
            </div>

            {/* Dev Mode Role Toggle */}
            <div className="glass-panel p-4 flex items-center justify-between bg-[rgba(146,222,139,0.05)] border-[var(--color-primary)]">
                <div>
                    <div className="font-bold text-white mb-1">Dev Tools: Quick Role Switcher</div>
                    <div className="text-sm text-[var(--color-text-muted)]">Change your current session role to test RBAC constraints.</div>
                </div>
                <select
                    className="p-2 rounded bg-[var(--color-bg-base)] text-white border border-[var(--color-border)] outline-none"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Operator">Operator</option>
                </select>
            </div>

            <div className="glass-panel">
                <div className="p-5 border-b border-[var(--color-border)]">
                    <h2 className="text-xl font-bold text-white">System Users</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] text-sm">
                                <th className="p-4 font-medium">User Name</th>
                                <th className="p-4 font-medium">Email</th>
                                <th className="p-4 font-medium">Role Level</th>
                                <th className="p-4 font-medium">Assigned Projects</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                    <td className="p-4 font-medium text-white">{u.name}</td>
                                    <td className="p-4 text-[var(--color-text-muted)]">{u.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs border ${u.role === 'Super Admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                                            u.role === 'Supervisor' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                                                'bg-gray-500/10 text-gray-400 border-gray-500/30'
                                            }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-[var(--color-text-muted)]">
                                        {u.projects.join(', ')}
                                    </td>
                                    <td className="p-4 flex gap-2 justify-end">
                                        <button className="btn-icon text-blue-400 hover:text-blue-300"><Edit2 size={16} /></button>
                                        <button className="btn-icon text-red-400 hover:text-red-300" disabled={u.role === 'Super Admin'}><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
