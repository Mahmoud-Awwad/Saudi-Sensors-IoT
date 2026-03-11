import React, { useState } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { useProject } from '../context/ProjectContext';
import { Lightbulb, Network, Search } from 'lucide-react';
import { LoraApi } from '../api/apiClient';
import './DevicesHub.css';

// --- Types ---
interface LampData {
    id: string;
    concentrator: string;
    zone: string;
    i: number; // Current (Amps)
    v: number; // Voltage (Volts)
    p: number; // Power (Watts)
    pf: number; // Power Factor
    dimming: number;
    status: 'Online' | 'Offline';
}

interface GatewayData {
    id: string;
    polesCount: number;
    lampsOnCount: number;
    internetStatus: 'Connected' | 'Disconnected';
    i: number; // Current (Amps)
    v: number; // Voltage (Volts)
    p: number; // Power (Watts)
    pf: number; // Power Factor
    dimming: number;
    status: 'Online' | 'Offline';
}

// --- Mock Data ---
const mockLamps: LampData[] = [
    { id: 'Pole-101', concentrator: 'GW-01', zone: 'Zone A', i: 0.68, v: 220, p: 150, pf: 0.98, dimming: 100, status: 'Online' },
    { id: 'Pole-102', concentrator: 'GW-01', zone: 'Zone A', i: 0.34, v: 220, p: 75, pf: 0.95, dimming: 50, status: 'Online' },
    { id: 'Pole-103', concentrator: 'GW-02', zone: 'Zone B', i: 0.00, v: 0, p: 0, pf: 0.00, dimming: 0, status: 'Offline' },
    { id: 'Pole-104', concentrator: 'GW-02', zone: 'Zone B', i: 0.55, v: 218, p: 120, pf: 0.97, dimming: 80, status: 'Online' },
];

const mockGateways: GatewayData[] = [
    { id: 'GW-01', polesCount: 45, lampsOnCount: 42, internetStatus: 'Connected', i: 15.4, v: 225, p: 3450, pf: 0.96, dimming: 100, status: 'Online' },
    { id: 'GW-02', polesCount: 30, lampsOnCount: 15, internetStatus: 'Disconnected', i: 5.2, v: 215, p: 1100, pf: 0.92, dimming: 50, status: 'Offline' },
];


export const DevicesHub: React.FC = () => {
    const { canControlDevice } = usePermissions();
    const { currentProject, currentGateway } = useProject();
    const [activeTab, setActiveTab] = useState<'Lamps' | 'Gateways'>('Lamps');

    // Derived state for Lamps
    const [lamps, setLamps] = useState<LampData[]>(mockLamps);
    const [lampFilter, setLampFilter] = useState<'All' | 'Online' | 'Offline'>('All');

    // Derived state for Gateways
    const [gateways, setGateways] = useState<GatewayData[]>(mockGateways);
    const [gatewayFilter, setGatewayFilter] = useState<'All' | 'Online' | 'Offline'>('All');

    // --- Handlers ---
    const contextFilteredLamps = lamps.filter(l => {
        if (currentProject?.id === 'all') return true;
        if (currentGateway !== 'all') return l.concentrator === currentGateway;
        // Mock simplification: assume concentrator ID matches driveUid
        return currentProject?.driveUids.includes(l.concentrator) || true; // Fallback for mock mismatch
    });

    const contextFilteredGateways = gateways.filter(g => {
        if (currentProject?.id === 'all') return true;
        if (currentGateway !== 'all') return g.id === currentGateway;
        return currentProject?.driveUids.includes(g.id) || true; // Fallback for mock mismatch
    });

    const filteredLamps = contextFilteredLamps.filter(l => lampFilter === 'All' ? true : l.status === lampFilter);
    const filteredGateways = contextFilteredGateways.filter(g => gatewayFilter === 'All' ? true : g.status === gatewayFilter);

    const handleLampToggle = async (id: string, newState: boolean) => {
        if (!canControlDevice()) return alert("Permission Denied.");
        const lamp = lamps.find(l => l.id === id);
        if (!lamp) return;
        
        const lampCodeMatch = id.match(/\d+/);
        const lampCode = lampCodeMatch ? parseInt(lampCodeMatch[0], 10) : 0;
        const dimmingVal = newState ? 100 : 0;

        try {
            const res = await LoraApi.lampSingleDimming(lamp.concentrator, lampCode, dimmingVal);
            if (res.succeed) {
                setLamps(prev => prev.map(l => l.id === id ? { ...l, dimming: dimmingVal } : l));
            } else {
                alert(`Failed: ${res.msg}`);
            }
        } catch (error) {
            alert(`Error updating lamp ${id}`);
        }
    };

    const handleLampDimming = async (id: string, val: number) => {
        if (!canControlDevice()) return alert("Permission Denied.");
        const lamp = lamps.find(l => l.id === id);
        if (!lamp) return;
        
        const lampCodeMatch = id.match(/\d+/);
        const lampCode = lampCodeMatch ? parseInt(lampCodeMatch[0], 10) : 0;

        try {
            const res = await LoraApi.lampSingleDimming(lamp.concentrator, lampCode, val);
            if (res.succeed) {
                setLamps(prev => prev.map(l => l.id === id ? { ...l, dimming: val } : l));
            } else {
                alert(`Failed: ${res.msg}`);
            }
        } catch (error) {
            alert(`Error updating lamp ${id}`);
        }
    };

    const handleGatewayToggle = async (id: string, newState: boolean) => {
        if (!canControlDevice()) return alert("Permission Denied.");
        const dimmingVal = newState ? 100 : 0;

        try {
            const res = await LoraApi.lampAllDimming(id, dimmingVal);
            if (res.succeed) {
                setGateways(prev => prev.map(g => g.id === id ? { ...g, dimming: dimmingVal } : g));
            } else {
                alert(`Failed: ${res.msg}`);
            }
        } catch (error) {
            alert(`Error updating gateway ${id}`);
        }
    };

    const handleGatewayDimming = async (id: string, val: number) => {
        if (!canControlDevice()) return alert("Permission Denied.");
        
        try {
            const res = await LoraApi.lampAllDimming(id, val);
            if (res.succeed) {
                setGateways(prev => prev.map(g => g.id === id ? { ...g, dimming: val } : g));
            } else {
                alert(`Failed: ${res.msg}`);
            }
        } catch (error) {
            alert(`Error updating gateway ${id}`);
        }
    };

    const handleReadMetrics = async (id: string, type: 'Lamp' | 'Gateway') => {
        try {
            if (type === 'Gateway') {
                const res = await LoraApi.queryDeviceWorkState(id);
                if (res.succeed) {
                    alert(`Gateway Metrics: ${JSON.stringify(res.data, null, 2)}`);
                } else {
                    alert(`Failed to read gateway metrics: ${res.msg}`);
                }
            } else if (type === 'Lamp') {
                const lamp = lamps.find(l => l.id === id);
                if (!lamp) return;
                const res = await LoraApi.queryLampList(lamp.concentrator);
                if (res.succeed) {
                    const lampCodeMatch = id.match(/\d+/);
                    const lampCode = lampCodeMatch ? parseInt(lampCodeMatch[0], 10) : -1;
                    const specificLamp = res.data?.find(l => l.lampUid === String(lampCode) || l.code === lampCode);
                    
                    if (specificLamp) {
                         alert(`Lamp Metrics: ${JSON.stringify(specificLamp, null, 2)}`);
                    } else {
                         alert(`Lamp Metrics: ${JSON.stringify(res.data, null, 2)}`);
                    }
                } else {
                    alert(`Failed to read lamp metrics: ${res.msg}`);
                }
            }
        } catch (error) {
            alert(`Error reading metrics for ${type} ${id}`);
        }
    };

    return (
        <div className="devices-hub">
            <div className="hub-header">
                <div>
                    <h1 className="hub-title">Devices Hub</h1>
                    <p className="hub-subtitle">Manage Lamps and Gateways for {currentProject?.name || 'the system'}.</p>
                </div>
            </div>

            {/* Custom Tabs */}
            <div className="hub-tabs">
                <button
                    className={`tab-btn ${activeTab === 'Lamps' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Lamps')}
                >
                    <Lightbulb size={18} /> Lamp Details
                </button>
                <button
                    className={`tab-btn ${activeTab === 'Gateways' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Gateways')}
                >
                    <Network size={18} /> Concentrator / Gateway Details
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content glass-panel">

                {/* --- LAMPS TAB --- */}
                {activeTab === 'Lamps' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                            <div className="filter-buttons">
                                <button className={`filter-btn ${lampFilter === 'All' ? 'active' : ''}`} onClick={() => setLampFilter('All')}>All Lamps ({lamps.length})</button>
                                <button className={`filter-btn ${lampFilter === 'Online' ? 'active' : ''}`} onClick={() => setLampFilter('Online')}>Online ({lamps.filter(l => l.status === 'Online').length})</button>
                                <button className={`filter-btn ${lampFilter === 'Offline' ? 'active' : ''}`} onClick={() => setLampFilter('Offline')}>Offline ({lamps.filter(l => l.status === 'Offline').length})</button>
                            </div>
                            <div className="search-box">
                                <Search size={16} className="text-[var(--color-text-muted)]" />
                                <input type="text" placeholder="Search Pole ID..." className="search-input" />
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="devices-table w-full text-left">
                                <thead>
                                    <tr>
                                        <th>Pole ID</th>
                                        <th>GateWay</th>
                                        <th>Zone</th>
                                        <th>Status</th>
                                        <th>Metrics (I / V / P / PF)</th>
                                        <th>Control Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLamps.map(lamp => (
                                        <tr key={lamp.id}>
                                            <td className="font-bold text-white">{lamp.id}</td>
                                            <td className="text-[var(--color-text-muted)]">{lamp.concentrator}</td>
                                            <td className="text-[var(--color-text-muted)]">{lamp.zone}</td>
                                            <td>
                                                <span className={`status-badge ${lamp.status.toLowerCase()}`}>
                                                    {lamp.status}
                                                </span>
                                            </td>
                                            <td className="font-mono text-sm">
                                                <span className="text-white" title="Current (A)">{lamp.i.toFixed(2)}A</span> <span className="text-[var(--color-text-muted)]">/</span>{' '}
                                                <span className="text-white" title="Voltage (V)">{lamp.v}V</span> <span className="text-[var(--color-text-muted)]">/</span>{' '}
                                                <span className="text-white" title="Power (W)">{lamp.p}W</span> <span className="text-[var(--color-text-muted)]">/</span>{' '}
                                                <span className="text-[var(--color-primary)]" title="Power Factor">{lamp.pf.toFixed(2)}</span>
                                            </td>
                                            <td className="min-w-[320px]">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        className="btn-action hover:text-green-400"
                                                        onClick={() => handleLampToggle(lamp.id, true)}
                                                        disabled={lamp.status === 'Offline'}
                                                    >
                                                        ON
                                                    </button>
                                                    <button
                                                        className="btn-action hover:text-red-400"
                                                        onClick={() => handleLampToggle(lamp.id, false)}
                                                        disabled={lamp.status === 'Offline'}
                                                    >
                                                        OFF
                                                    </button>
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-[rgba(0,0,0,0.2)] rounded border border-[rgba(255,255,255,0.05)]">
                                                        <span className="text-xs font-medium text-[var(--color-warning)]">DIM</span>
                                                        <input
                                                            type="range"
                                                            min="0" max="100"
                                                            value={lamp.dimming}
                                                            onChange={(e) => handleLampDimming(lamp.id, Number(e.target.value))}
                                                            className="range-slider w-16"
                                                            disabled={lamp.status === 'Offline'}
                                                        />
                                                        <span className="w-8 text-right text-xs font-mono">{lamp.dimming}%</span>
                                                    </div>
                                                    <button
                                                        className="btn-read"
                                                        onClick={() => handleReadMetrics(lamp.id, 'Lamp')}
                                                        title="Pull Real-time Metrics"
                                                    >
                                                        Read
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredLamps.length === 0 && (
                                        <tr><td colSpan={7} className="text-center py-8 text-[var(--color-text-muted)]">No lamps found for this filter.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- GATEWAYS TAB --- */}
                {activeTab === 'Gateways' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                            <div className="filter-buttons">
                                <button className={`filter-btn ${gatewayFilter === 'All' ? 'active' : ''}`} onClick={() => setGatewayFilter('All')}>All Gateways ({gateways.length})</button>
                                <button className={`filter-btn ${gatewayFilter === 'Online' ? 'active' : ''}`} onClick={() => setGatewayFilter('Online')}>Online ({gateways.filter(g => g.status === 'Online').length})</button>
                                <button className={`filter-btn ${gatewayFilter === 'Offline' ? 'active' : ''}`} onClick={() => setGatewayFilter('Offline')}>Offline ({gateways.filter(g => g.status === 'Offline').length})</button>
                            </div>
                            <div className="search-box">
                                <Search size={16} className="text-[var(--color-text-muted)]" />
                                <input type="text" placeholder="Search Gateway ID..." className="search-input" />
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="devices-table w-full text-left">
                                <thead>
                                    <tr>
                                        <th>Gateway ID</th>
                                        <th>Network Status</th>
                                        <th>Managed Nodes</th>
                                        <th>Aggregate Metrics (I / V / P / PF)</th>
                                        <th>Control Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredGateways.map(gw => (
                                        <tr key={gw.id}>
                                            <td className="font-bold text-white flex items-center gap-2">
                                                <Network size={16} className="text-[var(--color-primary)]" /> {gw.id}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${gw.status.toLowerCase()}`}>
                                                    {gw.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex flex-col text-sm">
                                                    <span className="text-white">{gw.lampsOnCount} / {gw.polesCount} Lamps ON</span>
                                                    <div className="w-full bg-[rgba(255,255,255,0.1)] h-1.5 mt-1 rounded-full overflow-hidden">
                                                        <div
                                                            className="bg-[var(--color-primary)] h-full"
                                                            style={{ width: `${(gw.lampsOnCount / gw.polesCount) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="font-mono text-sm">
                                                <span className="text-white" title="Current (A)">{gw.i.toFixed(1)}A</span> <span className="text-[var(--color-text-muted)]">/</span>{' '}
                                                <span className="text-white" title="Voltage (V)">{gw.v}V</span> <span className="text-[var(--color-text-muted)]">/</span>{' '}
                                                <span className="text-white" title="Power (W)">{gw.p}W</span> <span className="text-[var(--color-text-muted)]">/</span>{' '}
                                                <span className="text-[var(--color-primary)]" title="Power Factor">{gw.pf.toFixed(2)}</span>
                                            </td>
                                            <td className="min-w-[320px]">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        className="btn-action hover:text-green-400"
                                                        onClick={() => handleGatewayToggle(gw.id, true)}
                                                        disabled={gw.status === 'Offline'}
                                                    >
                                                        ON
                                                    </button>
                                                    <button
                                                        className="btn-action hover:text-red-400"
                                                        onClick={() => handleGatewayToggle(gw.id, false)}
                                                        disabled={gw.status === 'Offline'}
                                                    >
                                                        OFF
                                                    </button>
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-[rgba(0,0,0,0.2)] rounded border border-[rgba(255,255,255,0.05)]">
                                                        <span className="text-xs font-medium text-[var(--color-warning)]">DIM</span>
                                                        <input
                                                            type="range"
                                                            min="0" max="100"
                                                            value={gw.dimming}
                                                            onChange={(e) => handleGatewayDimming(gw.id, Number(e.target.value))}
                                                            className="range-slider w-16"
                                                            disabled={gw.status === 'Offline'}
                                                        />
                                                        <span className="w-8 text-right text-xs font-mono">{gw.dimming}%</span>
                                                    </div>
                                                    <button
                                                        className="btn-read"
                                                        onClick={() => handleReadMetrics(gw.id, 'Gateway')}
                                                        title="Pull Real-time Metrics"
                                                    >
                                                        Read
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredGateways.length === 0 && (
                                        <tr><td colSpan={6} className="text-center py-8 text-[var(--color-text-muted)]">No gateways found for this filter.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
