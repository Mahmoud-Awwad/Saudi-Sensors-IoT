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
}

const initialGateways: Gateway[] = [
    { id: '1', driveUid: '202212070011', ip: '192.168.1.10', status: 'Online', signalDb: -65, lastHeartbeat: 'Just now' },
    { id: '2', driveUid: '202212070012', ip: '192.168.1.11', status: 'Online', signalDb: -78, lastHeartbeat: '2 mins ago' },
];

export const GatewayManage: React.FC = () => {
    const { canUpdateSettings } = usePermissions();
    const [gateways, setGateways] = useState(initialGateways);

    const handleRecalibrate = (driveUid: string) => {
        if (!canUpdateSettings()) return alert("Permission Denied.");
        alert(`Reboot command sent to gateway ${driveUid}.`);
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

                        <button
                            className="w-full btn-icon border border-[var(--color-border)] hover:bg-[var(--color-bg-base)]"
                            style={{ padding: '0.6rem', color: 'var(--color-text-main)' }}
                            onClick={() => handleRecalibrate(gw.driveUid)}
                        >
                            <Settings size={16} /> Config & Reboot
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
