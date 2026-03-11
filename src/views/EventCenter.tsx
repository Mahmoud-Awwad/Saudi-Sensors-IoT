import React, { useState, useEffect } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { AlertCircle, ShieldAlert, CheckCircle2, Clock, Check, Loader2, Search, Activity, Zap, Server, ChevronLeft, ChevronRight } from 'lucide-react';
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
    ...Array.from({ length: 22 }).map((_, i) => ({
        id: `INC-9${10 + i}`,
        type: (i % 3 === 0 ? 'Physical' : i % 2 === 0 ? 'Network' : 'Electrical') as any,
        severity: (i % 5 === 0 ? 'Critical' : i % 3 === 0 ? 'High' : 'Medium') as any,
        desc: `Auto-detected anomaly ${i + 1}`,
        time: `${(i + 1) * 15} mins ago`,
        status: 'Active' as any,
        nodeId: i % 4 === 0 ? `GW-0${(i % 5) + 1}` : `Pole-${110 + i}`,
        deviceType: (i % 4 === 0 ? 'Gateway' : 'Lamp') as any
    }))
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

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Reset page to 1 whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter, searchQuery, severityFilter]);

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

    // Pagination Logic
    const totalPages = Math.ceil(filteredActive.length / ITEMS_PER_PAGE);
    const paginatedActive = filteredActive.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const filteredResolved = resolvedIncidents.filter(inc => {
        const matchesType = activeFilter === 'All' ? true :
            activeFilter === 'Lamps' ? inc.deviceType === 'Lamp' :
                inc.deviceType === 'Gateway';
        const searchLower = searchQuery.toLowerCase();
        return (inc.desc.toLowerCase().includes(searchLower) || inc.nodeId.toLowerCase().includes(searchLower)) && matchesType;
    });

    return (
        <div className="flex flex-col gap-8 h-full">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Alarm Management</h1>
                    <p className="text-[var(--color-text-muted)]">Real-time incident tracking, filtering, and manual validation.</p>
                </div>
            </div>

            {/* Smart Dashboard Top */}
            <div className="event-dashboard-grid mb-4">
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
                <div className="glass-panel p-7 flex flex-col gap-6">
                    <div className="flex justify-between items-center mb-6 flex-wrap gap-6">
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
                        <div className="flex flex-col gap-2">
                            {paginatedActive.map(inc => (
                                <div key={inc.id} className="incident-card active">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-start gap-3">
                                            <div className={`severity-icon ${inc.severity.toLowerCase()}`}>
                                                <AlertCircle size={20} />
                                            </div>
                                            <div>
                                                <div className="text-white font-bold text-base leading-tight">{inc.desc}</div>
                                                <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-2 mt-0.5">
                                                    <span>Node: <span style={{ color: 'var(--color-primary)' }}>{inc.nodeId}</span> <span className="text-[10px] px-1 py-0.5 rounded bg-[rgba(255,255,255,0.1)] ml-1">{inc.deviceType}</span></span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1"><Clock size={12} /> {inc.time}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            className={`btn-primary flex items-center gap-1.5 ${inc.status === 'Resolving' ? 'opacity-70 cursor-wait' : ''}`}
                                            onClick={() => resolveIncident(inc.id)}
                                            style={{ padding: '0.3rem 0.8rem', minWidth: '100px', fontSize: '0.85rem', justifyContent: 'center' }}
                                            disabled={inc.status === 'Resolving'}
                                        >
                                            {inc.status === 'Resolving' ? (
                                                <><Loader2 size={14} className="animate-spin" /> Validating...</>
                                            ) : (
                                                <><Check size={14} /> Resolve</>
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

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)] text-sm">
                                    <span className="text-[var(--color-text-muted)]">
                                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredActive.length)} of {filteredActive.length}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            className="btn-secondary flex items-center gap-1 justify-center px-3 py-1 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        >
                                            <ChevronLeft size={16} /> Prev
                                        </button>
                                        <div className="flex gap-1">
                                            {Array.from({ length: totalPages }).map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition-all ${currentPage === idx + 1 ? 'bg-[var(--color-primary)] text-white shadow-lg' : 'bg-[rgba(255,255,255,0.05)] text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.1)] hover:text-white border border-[rgba(255,255,255,0.02)]'}`}
                                                    onClick={() => setCurrentPage(idx + 1)}
                                                >
                                                    {idx + 1}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            className="btn-secondary flex items-center gap-1 justify-center px-3 py-1 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        >
                                            Next <ChevronRight size={16} />
                                        </button>
                                    </div>
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
                <div className="glass-panel p-7">
                    <h2 className="text-xl font-bold text-white mb-6">Safety Thresholds</h2>
                    <p className="text-sm text-[var(--color-text-muted)] mb-8">
                        Global propagation parameters for autonomous hardware safety fallbacks.
                    </p>

                    <div className="flex flex-col gap-8">
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
