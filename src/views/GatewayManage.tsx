import React, { useState } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Network, Activity, Settings, RefreshCw } from 'lucide-react';

interface Gateway {
    id: string;
    driveUid: string;
    ip: string;
    status: 'Online' | 'Offline';
    signalDb: number;
    lastHeartbeat: string;
    apn?: string;
    project?: string;
    district?: string;
    assignedLamps?: number;
}

const initialGateways: Gateway[] = [
    { id: '1', driveUid: '202212070011', ip: '192.168.1.10', status: 'Online', signalDb: -65, lastHeartbeat: 'Just now', apn: 'STC-IoT-Fast', project: 'Riyadh Central', district: 'Downtown Sector A', assignedLamps: 84 },
    { id: '2', driveUid: '202212070012', ip: '192.168.1.11', status: 'Online', signalDb: -78, lastHeartbeat: '2 mins ago', apn: 'STC-IoT-Fast', project: 'Jeddah Coastal', district: 'Marina Bay', assignedLamps: 112 },
];

export const GatewayManage: React.FC = () => {
    const { canUpdateSettings } = usePermissions();
    const [gateways, setGateways] = useState(initialGateways);
    const [configuringGateway, setConfiguringGateway] = useState<Gateway | null>(null);

    // Modal Form State
    const [formApn, setFormApn] = useState('');
    const [formIp, setFormIp] = useState('');
    const [formProject, setFormProject] = useState('');
    const [formDistrict, setFormDistrict] = useState('');

    const handleReboot = (driveUid: string) => {
        if (!canUpdateSettings()) return alert("Permission Denied.");
        alert(`Reboot command sent to gateway ${driveUid}.`);
    };

    const handleConfigure = (gw: Gateway) => {
        if (!canUpdateSettings()) return alert("Permission Denied.");
        setConfiguringGateway(gw);
        setFormApn(gw.apn || '');
        setFormIp(gw.ip || '');
        setFormProject(gw.project || '');
        setFormDistrict(gw.district || '');
    };

    const handleSaveConfig = () => {
        if (!configuringGateway) return;
        setGateways(prev => prev.map(gw => {
            if (gw.id === configuringGateway.id) {
                return { ...gw, apn: formApn, ip: formIp, project: formProject, district: formDistrict };
            }
            return gw;
        }));
        setConfiguringGateway(null);
        alert(`Configuration saved for ${configuringGateway.driveUid}`);
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Gateway Management</h1>
                    <p className="text-[var(--color-text-muted)]">Infrastructure monitoring and configuration.</p>
                </div>
                <button className="btn-primary" onClick={() => alert("Polling gateways...")}>
                    <RefreshCw size={18} /> Refresh Status
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gateways.map(gw => (
                    <div key={gw.id} className="glass-panel p-5">
                        <div className="flex justify-between items-center mb-4 border-b border-[var(--color-border)] pb-3">
                            <div className="flex items-center gap-3">
                                <Network size={24} style={{ color: 'var(--color-primary)' }} />
                                <span className="font-bold text-lg text-white">{gw.driveUid}</span>
                            </div>
                            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: gw.status === 'Online' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: gw.status === 'Online' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                {gw.status}
                            </span>
                        </div>

                        <div className="flex flex-col gap-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--color-text-muted)] flex items-center gap-2"><Activity size={14} /> Signal Strength:</span>
                                <span style={{ color: gw.signalDb > -70 ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 600 }}>{gw.signalDb} dBm</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--color-text-muted)]">IP Address:</span>
                                <span className="text-white font-medium">{gw.ip}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--color-text-muted)]">Last Heartbeat:</span>
                                <span className="text-white font-medium">{gw.lastHeartbeat}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                className="w-1/2 btn-icon border border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-black transition-colors"
                                style={{ padding: '0.6rem', color: 'var(--color-primary)' }}
                                onClick={() => handleConfigure(gw)}
                            >
                                <Settings size={16} /> Configure
                            </button>
                            <button
                                className="w-1/2 btn-icon border border-[var(--color-warning)] hover:bg-[var(--color-warning)] hover:text-black transition-colors"
                                style={{ padding: '0.6rem', color: 'var(--color-warning)' }}
                                onClick={() => handleReboot(gw.driveUid)}
                            >
                                <RefreshCw size={16} /> Reboot
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Configuration Modal */}
            {configuringGateway && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in p-4">
                    <div className="glass-panel p-6 max-w-lg w-full relative">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            onClick={() => setConfiguringGateway(null)}
                        >✕</button>

                        <h2 className="text-xl font-bold text-white mb-1"><Settings className="inline mr-2 text-[var(--color-primary)] mb-1" size={20} />Configure Gateway</h2>
                        <p className="text-sm text-[var(--color-text-muted)] mb-6">Drive UID: <span className="font-mono text-white">{configuringGateway.driveUid}</span></p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="col-span-2 md:col-span-1">
                                <label className="text-sm text-[var(--color-text-muted)] mb-1 block">APN Name</label>
                                <input
                                    className="w-full bg-[#111827] border border-gray-700 rounded p-2 text-white outline-none focus:border-[var(--color-primary)]"
                                    value={formApn} onChange={e => setFormApn(e.target.value)}
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Static IP Address</label>
                                <input
                                    className="w-full bg-[#111827] border border-gray-700 rounded p-2 text-white outline-none focus:border-[var(--color-primary)]"
                                    value={formIp} onChange={e => setFormIp(e.target.value)}
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Assigned Project</label>
                                <select
                                    className="w-full bg-[#111827] border border-gray-700 rounded p-2 text-white outline-none focus:border-[var(--color-primary)]"
                                    value={formProject} onChange={e => setFormProject(e.target.value)}
                                >
                                    <option value="Riyadh Central">Riyadh Central</option>
                                    <option value="Jeddah Coastal">Jeddah Coastal</option>
                                    <option value="Dammam Industrial">Dammam Industrial</option>
                                </select>
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Assigned District</label>
                                <input
                                    className="w-full bg-[#111827] border border-gray-700 rounded p-2 text-white outline-none focus:border-[var(--color-primary)]"
                                    value={formDistrict} onChange={e => setFormDistrict(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg p-3 mb-6">
                            <p className="text-sm text-[var(--color-text-muted)] flex justify-between items-center">
                                <span>Managed Lamp Nodes:</span>
                                <span className="text-lg font-bold text-white">{configuringGateway.assignedLamps}</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-1 italic">Note: Lamp assignments are managed automatically through the Infrastructure Hierarchy builder.</p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button className="btn-secondary" onClick={() => setConfiguringGateway(null)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSaveConfig}>Save Configuration</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
