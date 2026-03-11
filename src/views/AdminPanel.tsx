import React, { useState } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';
import { UserPlus, Edit2, Shield, Trash2, Users, Server, BellRing, Upload, Download } from 'lucide-react';
import { AdminInfrastructure } from './AdminInfrastructure';
import { AdminAlarms } from './AdminAlarms';

interface UserData {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    accessibleEntities: string[];
}

const mockUsers: UserData[] = [
    { id: 'U-1', name: 'System Admin', email: 'admin@saudisensors.com', role: 'Admin', accessibleEntities: ['All'] },
    { id: 'U-2', name: 'Riyadh Supervisor', email: 'riyadh@saudisensors.com', role: 'Supervisor', accessibleEntities: ['Riyadh Central District'] },
    { id: 'U-3', name: 'Jeddah Sec Oper', email: 'jeddah@saudisensors.com', role: 'Operator', accessibleEntities: ['Jeddah Coastal Hub'] },
    { id: 'U-4', name: 'Guest Viewer', email: 'guest@saudisensors.com', role: 'Viewer', accessibleEntities: ['All'] },
];

const availableScopes = [
    'Riyadh Central District',
    'Downtown Sector A',
    'Jeddah Coastal Hub',
    'Dammam Industrial Area',
    'Gateway GW-Alpha-01'
];

export const AdminPanel: React.FC = () => {
    const { role, canCreateUser } = usePermissions();
    const { currentUser } = useAuth();

    const [activeTab, setActiveTab] = useState<'users' | 'infra' | 'alarms'>('users');
    const [users, setUsers] = useState<UserData[]>(mockUsers);
    const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);

    // Add/Edit User Modal State
    const [showAddUser, setShowAddUser] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState<UserRole>('Viewer');
    const [newUserScopes, setNewUserScopes] = useState<string[]>([]);

    // Basic RBAC Check for Admin Panel Access
    // Admins and Supervisors can access. Operators/Viewers cannot.
    if (role !== 'Admin' && role !== 'Supervisor') {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                <Shield size={64} className="text-[var(--color-danger)] mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
                <p className="text-[var(--color-text-muted)]">You do not have administrative privileges to view this page.</p>
            </div>
        );
    }

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();

        if (!canCreateUser(newUserRole)) {
            alert(`Your role (${role}) is not permitted to create a user with role: ${newUserRole}`);
            return;
        }

        const newUser: UserData = {
            id: `U-${users.length + 1}`,
            name: newUserName,
            email: newUserEmail,
            role: newUserRole,
            accessibleEntities: newUserRole === 'Admin' ? ['All'] : newUserScopes.length > 0 ? newUserScopes : ['None assigned']
        };

        setUsers([...users, newUser]);
        setShowAddUser(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserRole('Viewer');
        setNewUserScopes([]);
    };

    const handleUpdateUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        if (editingUser.role === 'Admin' && newUserRole !== 'Admin' && editingUser.id === currentUser?.id) {
            alert("You cannot remove your own Admin privileges.");
            return;
        }

        const updatedUser: UserData = {
            ...editingUser,
            name: newUserName,
            email: newUserEmail,
            role: newUserRole,
            accessibleEntities: newUserRole === 'Admin' ? ['All'] : newUserScopes.length > 0 ? newUserScopes : ['None assigned']
        };

        setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
        setEditingUser(null);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserRole('Viewer');
        setNewUserScopes([]);
    };

    const openEditModal = (user: UserData) => {
        setEditingUser(user);
        setNewUserName(user.name);
        setNewUserEmail(user.email);
        setNewUserRole(user.role);
        setNewUserScopes(user.accessibleEntities);
    };

    const handleDeleteUser = (id: string, targetRole: string) => {
        if (id === currentUser?.id) {
            return alert("You cannot delete your own account.");
        }
        if (role === 'Supervisor' && (targetRole === 'Admin' || targetRole === 'Supervisor')) {
            return alert("Supervisors cannot delete Admin or Supervisor accounts.");
        }

        if (confirm("Are you sure you want to delete this user?")) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    const handleBatchUpload = () => {
        setIsSimulatingUpload(true);
        setTimeout(() => {
            alert("CSV successfully parsed. 5 Users ingested.");
            setIsSimulatingUpload(false);
        }, 1500);
    };

    const handleDownloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,FullName,Email,Role,AccessibleEntities\nJane Smith,jane@saudisensors.com,Operator,\"Jeddah Coastal Hub, Dammam Industrial Area\"\nBob Jones,bob@saudisensors.com,Viewer,\"All\"";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "users_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Platform Administration</h1>
                    <p className="text-[var(--color-text-muted)]">Manage Users, Infrastructure Hierarchy, and Global Alarms.</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="tab-container">
                <button
                    className={`btn-tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <Users size={18} /> User Management
                </button>
                <button
                    className={`btn-tab ${activeTab === 'infra' ? 'active' : ''}`}
                    onClick={() => setActiveTab('infra')}
                >
                    <Server size={18} /> Infrastructure Hierarchy
                </button>
                <button
                    className={`btn-tab ${activeTab === 'alarms' ? 'active' : ''}`}
                    onClick={() => setActiveTab('alarms')}
                >
                    <BellRing size={18} /> Alarm Rules
                </button>
            </div>

            <div className="flex-1 overflow-auto">
                {/* --- USERS TAB --- */}
                {activeTab === 'users' && (
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center bg-[rgba(255,255,255,0.02)] p-4 rounded-lg border border-[rgba(255,255,255,0.05)]">
                            <div>
                                <h3 className="text-lg font-bold text-white">System Users</h3>
                                <p className="text-sm text-[var(--color-text-muted)]">Control access levels and permissions for the platform.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="btn-secondary flex items-center gap-2 text-[var(--color-primary)]" onClick={handleDownloadTemplate}>
                                    <Download size={16} /> Template
                                </button>
                                <button className="btn-secondary flex items-center gap-2" onClick={handleBatchUpload} disabled={isSimulatingUpload}>
                                    {isSimulatingUpload ? <span className="animate-spin">◷</span> : <Upload size={16} />}
                                    Batch Upload
                                </button>
                                <button className="btn-primary flex items-center gap-2" onClick={() => setShowAddUser(true)}>
                                    <UserPlus size={18} /> Add New User
                                </button>
                            </div>
                        </div>

                        {showAddUser && (
                            <form onSubmit={handleCreateUser} className="glass-panel p-6 border-[var(--color-primary)] border animate-fade-in relative">
                                <h3 className="text-lg font-bold text-white mb-4">Create New Account</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Full Name</label>
                                        <input required type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded p-2 text-white outline-none focus:border-[var(--color-primary)]" placeholder="John Doe" />
                                    </div>
                                    <div>
                                        <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Email</label>
                                        <input required type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded p-2 text-white outline-none focus:border-[var(--color-primary)]" placeholder="user@saudisensors.com" />
                                    </div>
                                    <div>
                                        <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Role</label>
                                        <select value={newUserRole} onChange={e => setNewUserRole(e.target.value as UserRole)} className="w-full bg-[#111827] border border-gray-700 rounded p-2 text-white outline-none focus:border-[var(--color-primary)]">
                                            {role === 'Admin' && <option value="Admin">Admin</option>}
                                            {role === 'Admin' && <option value="Supervisor">Supervisor</option>}
                                            <option value="Operator">Operator</option>
                                            <option value="Viewer">Viewer</option>
                                        </select>
                                    </div>
                                    {newUserRole !== 'Admin' && (
                                        <div className="md:col-span-3">
                                            <label className="text-sm text-[var(--color-text-muted)] mb-1 flex items-center justify-between">
                                                Scope of Access (ABAC)
                                                <span className="text-xs text-blue-400">Hold Ctrl/Cmd to select multiple targets</span>
                                            </label>
                                            <select
                                                multiple
                                                value={newUserScopes}
                                                onChange={e => setNewUserScopes(Array.from(e.target.selectedOptions, option => option.value))}
                                                className="w-full bg-[#111827] border border-gray-700 rounded p-2 text-white outline-none focus:border-[var(--color-primary)] h-32 custom-scrollbar"
                                            >
                                                {availableScopes.map(scope => (
                                                    <option key={scope} value={scope} className="p-2 mb-1 rounded hover:bg-[var(--color-primary)] hover:text-black">{scope}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-3 justify-end mt-6">
                                    <button type="button" className="btn-secondary" onClick={() => setShowAddUser(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">Create User</button>
                                </div>
                            </form>
                        )}

                        {/* Edit User Modal Form */}
                        {editingUser && (
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                                <form onSubmit={handleUpdateUser} className="glass-panel w-full max-w-4xl p-6 border-[var(--color-primary)] border animate-fade-in relative shadow-2xl">
                                    <h3 className="text-lg font-bold text-white mb-4">Edit User: {editingUser.name}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Full Name</label>
                                            <input required type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded p-2 text-white outline-none focus:border-[var(--color-primary)]" placeholder="John Doe" />
                                        </div>
                                        <div>
                                            <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Email</label>
                                            <input required type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded p-2 text-white outline-none focus:border-[var(--color-primary)]" placeholder="user@saudisensors.com" />
                                        </div>
                                        <div>
                                            <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Role</label>
                                            <select value={newUserRole} onChange={e => setNewUserRole(e.target.value as UserRole)} className="w-full bg-[#111827] border border-gray-700 rounded p-2 text-white outline-none focus:border-[var(--color-primary)]" disabled={editingUser.id === currentUser?.id || (role === 'Supervisor' && (editingUser.role === 'Admin' || editingUser.role === 'Supervisor'))}>
                                                {role === 'Admin' && <option value="Admin">Admin</option>}
                                                {role === 'Admin' && <option value="Supervisor">Supervisor</option>}
                                                <option value="Operator">Operator</option>
                                                <option value="Viewer">Viewer</option>
                                            </select>
                                        </div>
                                        {newUserRole !== 'Admin' && (
                                            <div className="md:col-span-3">
                                                <label className="text-sm text-[var(--color-text-muted)] mb-1 flex items-center justify-between">
                                                    Scope of Access (ABAC)
                                                    <span className="text-xs text-blue-400">Hold Ctrl/Cmd to select multiple targets</span>
                                                </label>
                                                <select
                                                    multiple
                                                    value={newUserScopes}
                                                    onChange={e => setNewUserScopes(Array.from(e.target.selectedOptions, option => option.value))}
                                                    className="w-full bg-[#111827] border border-gray-700 rounded p-2 text-white outline-none focus:border-[var(--color-primary)] h-32 custom-scrollbar"
                                                >
                                                    {availableScopes.map(scope => (
                                                        <option key={scope} value={scope} className="p-2 mb-1 rounded hover:bg-[var(--color-primary)] hover:text-black">{scope}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-3 justify-end mt-6">
                                        <button type="button" className="btn-secondary" onClick={() => {
                                            setEditingUser(null);
                                            setNewUserName('');
                                            setNewUserEmail('');
                                            setNewUserRole('Viewer');
                                            setNewUserScopes([]);
                                        }}>Cancel</button>
                                        <button type="submit" className="btn-primary">Save Changes</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="glass-panel">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] text-sm">
                                            <th className="p-4 font-medium">User Name</th>
                                            <th className="p-4 font-medium">Email</th>
                                            <th className="p-4 font-medium">Role Level</th>
                                            <th className="p-4 font-medium">Access Scope</th>
                                            <th className="p-4 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                                <td className="p-4 font-medium text-white">{u.name} {u.id === currentUser?.id && <span className="ml-2 text-xs bg-[var(--color-primary)] text-black px-2 py-0.5 rounded-full font-bold">YOU</span>}</td>
                                                <td className="p-4 text-[var(--color-text-muted)]">{u.email}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs border ${u.role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                                                        u.role === 'Supervisor' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                                                            u.role === 'Operator' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                                                                'bg-gray-500/10 text-gray-400 border-gray-500/30'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                        {u.accessibleEntities.map(entity => (
                                                            <span key={entity} className={`px-2 py-0.5 rounded text-xs border ${entity === 'All' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 font-bold' : 'bg-[#1f2937] text-gray-300 border-gray-600'}`}>
                                                                {entity}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-4 flex gap-2 justify-end">
                                                    <button
                                                        className="btn-icon text-blue-400 hover:text-blue-300 disabled:opacity-30 disabled:cursor-not-allowed"
                                                        title="Edit User"
                                                        onClick={() => openEditModal(u)}
                                                        disabled={role === 'Supervisor' && u.role === 'Admin'}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        className="btn-icon text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed"
                                                        title="Delete User"
                                                        onClick={() => handleDeleteUser(u.id, u.role)}
                                                        disabled={u.id === currentUser?.id || (role === 'Supervisor' && (u.role === 'Admin' || u.role === 'Supervisor'))}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- INFRASTRUCTURE TAB --- */}
                {activeTab === 'infra' && (
                    <AdminInfrastructure />
                )}

                {/* --- ALARMS TAB --- */}
                {activeTab === 'alarms' && (
                    <div className="h-full">
                        <AdminAlarms />
                    </div>
                )}
            </div>
        </div>
    );
};
