import React, { useState } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { useProject } from '../context/ProjectContext';
import { Globe, Server, Hash, Save } from 'lucide-react';

export const NetworkManage: React.FC = () => {
    const { canUpdateSettings } = usePermissions();
    const { currentProject } = useProject();

    const [apn, setApn] = useState('iot.saudi');
    const [mainIp, setMainIp] = useState('192.168.1.1');
    const [mainPort, setMainPort] = useState('7002');
    const [gatewayIp, setGatewayIp] = useState('192.168.1.254');
    const [subnetMask, setSubnetMask] = useState('255.255.255.0');

    const handleSave = () => {
        if (!canUpdateSettings()) return alert("Permission Denied.");
        alert(`Network configurations saved for project ${currentProject?.name} concentrators.`);
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Network Settings</h1>
                    <p className="text-[var(--color-text-muted)]">Configure Uplink and Subnet parameters for Concentrators.</p>
                </div>
                <button className="btn-primary" onClick={handleSave}>
                    <Save size={18} /> Save Settings
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Uplink Settings */}
                <div className="glass-panel p-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                        <Globe style={{ color: 'var(--color-info)' }} /> Cellular Uplink (APN/IP)
                    </h2>

                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm text-[var(--color-text-muted)] mb-1">APN (Access Point Name)</label>
                            <input
                                type="text" value={apn} onChange={e => setApn(e.target.value)}
                                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded p-2 text-white outline-none focus:border-[var(--color-primary)] transition-colors"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm text-[var(--color-text-muted)] mb-1">Main IP</label>
                                <input
                                    type="text" value={mainIp} onChange={e => setMainIp(e.target.value)}
                                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded p-2 text-white outline-none focus:border-[var(--color-primary)] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-[var(--color-text-muted)] mb-1">Port</label>
                                <input
                                    type="text" value={mainPort} onChange={e => setMainPort(e.target.value)}
                                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded p-2 text-white outline-none focus:border-[var(--color-primary)] transition-colors"
                                />
                            </div>
                        </div>
                        <div className="mt-4 p-3 rounded-lg bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.3)] text-sm text-blue-300">
                            Uplink parameters sync globally to all gateways when saved.
                        </div>
                    </div>
                </div>

                {/* Subnet Settings */}
                <div className="glass-panel p-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                        <Server style={{ color: 'var(--color-success)' }} /> Ethernet & LAN
                    </h2>

                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm text-[var(--color-text-muted)] mb-1 flex items-center gap-1"><Hash size={14} /> Default Gateway IP</label>
                            <input
                                type="text" value={gatewayIp} onChange={e => setGatewayIp(e.target.value)}
                                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded p-2 text-white outline-none focus:border-[var(--color-primary)] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-[var(--color-text-muted)] mb-1 flex items-center gap-1"><Hash size={14} /> Subnet Mask</label>
                            <input
                                type="text" value={subnetMask} onChange={e => setSubnetMask(e.target.value)}
                                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded p-2 text-white outline-none focus:border-[var(--color-primary)] transition-colors"
                            />
                        </div>
                        <div className="mt-4 p-3 rounded-lg bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] text-sm text-yellow-300">
                            Ensure device IPs are assigned outside the DHCP range of the defined subnet.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
