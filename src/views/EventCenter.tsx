import React, { useState } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { AlertCircle, ShieldAlert, CheckCircle2, Clock, Check, Loader2, Search, Activity, Zap, Server } from 'lucide-react';
import './EventCenter.css';

interface Incident {
    id: string;
    type: 'Electrical' | 'Physical' | 'Network';
    severity: 'Critical' | 'High' | 'Medium';
    desc: string;
    time: string;
    status: 'Active' | 'Resolving' | 'Resolved';
    nodeId: string;
    deviceType: 'Lamp' | 'Gateway';
}

const mockIncidents: Incident[] = [
    { id: 'INC-901', type: 'Physical', severity: 'Critical', desc: 'Pole tilt exceeded 15 degrees', time: '10 mins ago', status: 'Active', nodeId: 'Pole-104', deviceType: 'Lamp' },
    { id: 'INC-902', type: 'Electrical', severity: 'High', desc: 'Voltage spike detected (255V)', time: '1 hour ago', status: 'Active', nodeId: 'Pole-102', deviceType: 'Lamp' },
    { id: 'INC-903', type: 'Network', severity: 'Medium', desc: 'Gateway lost connection', time: '3 hours ago', status: 'Resolved', nodeId: 'GW-05', deviceType: 'Gateway' },
    { id: 'INC-904', type: 'Electrical', severity: 'Medium', desc: 'Power factor drop', time: '5 hours ago', status: 'Active', nodeId: 'GW-01', deviceType: 'Gateway' },
    { id: 'INC-905', type: 'Electrical', severity: 'High', desc: 'Lamp failure (0W draw)', time: '1 day ago', status: 'Active', nodeId: 'Pole-103', deviceType: 'Lamp' },
];

export const EventCenter: React.FC = () => {
    const { canUpdateSettings } = usePermissions();
    const [incidents, setIncidents] = useState(mockIncidents);
    const [tiltThreshold, setTiltThreshold] = useState(10);
    const [voltThreshold, setVoltThreshold] = useState(250);

    // Filtering State
    const [activeFilter, setActiveFilter] = useState<'All' | 'Lamps' | 'Gateways'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [severityFilter, setSeverityFilter] = useState<'All' | 'Critical' | 'Warning' | 'Resolved'>('All');

    const resolveIncident = (id: string) => {
        // Optimistically set to resolving state
        setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'Resolving' } : inc));

        // Simulate a manual validation step taking 1.5 seconds
        setTimeout(() => {
            setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'Resolved' } : inc));
        }, 1500);
    };

    const saveThresholds = () => {
        if (!canUpdateSettings()) return alert("Permission Denied.");
        alert("Safety thresholds synced globally to all hardware controllers.");
    };

    // Derived Data
    const activeIncidents = incidents.filter(i => i.status === 'Active' || i.status === 'Resolving');
    const resolvedIncidents = incidents.filter(i => i.status === 'Resolved');

    const filteredActive = activeIncidents.filter(inc => {
        const matchesType = activeFilter === 'All' ? true :
            activeFilter === 'Lamps' ? inc.deviceType === 'Lamp' :
                inc.deviceType === 'Gateway';
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = inc.desc.toLowerCase().includes(searchLower) || inc.nodeId.toLowerCase().includes(searchLower);

        let matchesSeverity = true;
        if (severityFilter === 'Critical') matchesSeverity = inc.severity === 'Critical';
        if (severityFilter === 'Warning') matchesSeverity = inc.severity === 'High' || inc.severity === 'Medium';

        return matchesType && matchesSearch && matchesSeverity;
    });

    const filteredResolved = resolvedIncidents.filter(inc => {
        const matchesType = activeFilter === 'All' ? true :
            activeFilter === 'Lamps' ? inc.deviceType === 'Lamp' :
                inc.deviceType === 'Gateway';
        const searchLower = searchQuery.toLowerCase();
        return (inc.desc.toLowerCase().includes(searchLower) || inc.nodeId.toLowerCase().includes(searchLower)) && matchesType;
    });

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Alarm Management</h1>
                    <p className="text-[var(--color-text-muted)]">Real-time incident tracking, filtering, and manual validation.</p>
                </div>
            </div>

            {/* Smart Dashboard Top */}
            <div className="event-dashboard-grid mb-2">
                <div
                    className={`dashboard-card glass-panel cursor-pointer transition-all hover:bg-[rgba(255,255,255,0.05)] ${severityFilter === 'All' ? 'ring-2 ring-[var(--color-primary)]' : ''}`}
                    onClick={() => setSeverityFilter('All')}
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[var(--color-text-muted)] font-medium">Total Active Alarms</span>
                        <Activity className="text-white" size={20} />
                    </div>
                    <div className="text-3xl font-bold text-white">{activeIncidents.length}</div>
                </div>
                <div
                    className={`dashboard-card glass-panel cursor-pointer relative overflow-hidden transition-all hover:bg-[rgba(255,255,255,0.05)] ${severityFilter === 'Critical' ? 'ring-2 ring-[var(--color-danger)]' : ''}`}
                    onClick={() => setSeverityFilter('Critical')}
                >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-danger)]"></div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[var(--color-text-muted)] font-medium">Critical</span>
                        <AlertCircle className="text-[var(--color-danger)]" size={20} />
                    </div>
                    <div className="text-3xl font-bold text-white">{incidents.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length}</div>
                </div>
                <div
                    className={`dashboard-card glass-panel cursor-pointer relative overflow-hidden transition-all hover:bg-[rgba(255,255,255,0.05)] ${severityFilter === 'Warning' ? 'ring-2 ring-[var(--color-warning)]' : ''}`}
                    onClick={() => setSeverityFilter('Warning')}
                >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-warning)]"></div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[var(--color-text-muted)] font-medium">High / Medium</span>
                        <AlertCircle className="text-[var(--color-warning)]" size={20} />
                    </div>
                    <div className="text-3xl font-bold text-white">{incidents.filter(i => (i.severity === 'High' || i.severity === 'Medium') && i.status !== 'Resolved').length}</div>
                </div>
                <div
                    className={`dashboard-card glass-panel cursor-pointer transition-all hover:bg-[rgba(255,255,255,0.05)] ${severityFilter === 'Resolved' ? 'ring-2 ring-[var(--color-success)]' : ''}`}
                    onClick={() => setSeverityFilter('Resolved')}
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[var(--color-text-muted)] font-medium">Recently Resolved</span>
                        <CheckCircle2 className="text-[var(--color-success)]" size={20} />
                    </div>
                    <div className="text-3xl font-bold text-white">{resolvedIncidents.length}</div>
                </div>
            </div>

            <div className="events-grid">

                {/* Incident Feed */}
                <div className="glass-panel p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <ShieldAlert style={{ color: 'var(--color-danger)' }} /> Active Alarms
                        </h2>

                        <div className="flex gap-4 flex-wrap">
                            <div className="filter-buttons">
                                <button className={`filter-btn ${activeFilter === 'All' ? 'active' : ''}`} onClick={() => setActiveFilter('All')}>All</button>
                                <button className={`filter-btn ${activeFilter === 'Lamps' ? 'active' : ''}`} onClick={() => setActiveFilter('Lamps')}><Zap size={14} className="inline mr-1" /> Lamps</button>
                                <button className={`filter-btn ${activeFilter === 'Gateways' ? 'active' : ''}`} onClick={() => setActiveFilter('Gateways')}><Server size={14} className="inline mr-1" /> Gateways</button>
                            </div>

                            <div className="search-box">
                                <Search size={16} className="text-[var(--color-text-muted)]" />
                                <input
                                    type="text"
                                    placeholder="Search node or desc..."
                                    className="search-input text-sm w-48"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {(severityFilter === 'All' || severityFilter === 'Critical' || severityFilter === 'Warning') && (
                        <div className="flex flex-col gap-3">
                            {filteredActive.map(inc => (
                                <div key={inc.id} className="incident-card active">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-start gap-4">
                                            <div className={`severity-icon ${inc.severity.toLowerCase()}`}>
                                                <AlertCircle size={24} />
                                            </div>
                                            <div>
                                                <div className="text-white font-bold text-lg">{inc.desc}</div>
                                                <div className="text-sm text-[var(--color-text-muted)] flex items-center gap-3 mt-1">
                                                    <span>Node: <span style={{ color: 'var(--color-primary)' }}>{inc.nodeId}</span> <span className="text-xs px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.1)] ml-1">{inc.deviceType}</span></span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1"><Clock size={14} /> {inc.time}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            className={`btn-primary flex items-center gap-2 ${inc.status === 'Resolving' ? 'opacity-70 cursor-wait' : ''}`}
                                            onClick={() => resolveIncident(inc.id)}
                                            style={{ padding: '0.4rem 1.2rem', minWidth: '120px', justifyContent: 'center' }}
                                            disabled={inc.status === 'Resolving'}
                                        >
                                            {inc.status === 'Resolving' ? (
                                                <><Loader2 size={16} className="animate-spin" /> Validating...</>
                                            ) : (
                                                <><Check size={16} /> Resolve</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filteredActive.length === 0 && (
                                <div className="text-center py-8 text-[var(--color-text-muted)] bg-[rgba(0,0,0,0.2)] rounded-lg border border-[var(--color-border)]">
                                    No alarms match your current filters.
                                </div>
                            )}
                        </div>
                    )}

                    {(severityFilter === 'All' || severityFilter === 'Resolved') && (
                        <>
                            {severityFilter === 'All' && <h3 className="text-lg font-bold text-white mt-6 border-b border-[var(--color-border)] pb-2 mb-2">Recently Resolved</h3>}
                            <div className="flex flex-col gap-2">
                                {filteredResolved.map(inc => (
                                    <div key={inc.id} className="incident-card resolved">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} />
                                            <div>
                                                <span className="text-[var(--color-text-muted)] mt-1" style={{ textDecoration: 'line-through', marginRight: '8px' }}>{inc.desc}</span>
                                                <span className="text-xs text-[var(--color-text-muted)]">Resolved {inc.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredResolved.length === 0 && severityFilter === 'Resolved' && (
                                    <div className="text-center py-8 text-[var(--color-text-muted)] bg-[rgba(0,0,0,0.2)] rounded-lg border border-[var(--color-border)] mt-2">
                                        No resolved alarms match your current filters.
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Safety Thresholds */}
                <div className="glass-panel p-5">
                    <h2 className="text-xl font-bold text-white mb-4">Safety Thresholds</h2>
                    <p className="text-sm text-[var(--color-text-muted)] mb-6">
                        Global propagation parameters for autonomous hardware safety fallbacks.
                    </p>

                    <div className="flex flex-col gap-6">
                        <div className="threshold-group">
                            <label className="threshold-label text-white">
                                <span>Max Tilt Angle (Degrees)</span>
                                <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>{tiltThreshold}°</span>
                            </label>
                            <input
                                type="range" min="1" max="90"
                                value={tiltThreshold}
                                onChange={e => setTiltThreshold(Number(e.target.value))}
                                className="range-slider"
                                style={{ width: '100%', WebkitAppearance: 'none', appearance: 'none', height: '6px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}
                            />
                        </div>

                        <div className="threshold-group">
                            <label className="threshold-label text-white">
                                <span>Over-Voltage Cutoff (V)</span>
                                <span style={{ color: 'var(--color-warning)', fontWeight: 700 }}>{voltThreshold}V</span>
                            </label>
                            <input
                                type="range" min="230" max="280"
                                value={voltThreshold}
                                onChange={e => setVoltThreshold(Number(e.target.value))}
                                className="range-slider"
                                style={{ width: '100%', WebkitAppearance: 'none', appearance: 'none', height: '6px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}
                            />
                        </div>

                        <button className="btn-primary mt-4" style={{ width: '100%', justifyContent: 'center' }} onClick={saveThresholds}>
                            Sync to Controllers
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
