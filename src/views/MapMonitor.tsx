import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { usePermissions } from '../hooks/usePermissions';
import { useProject } from '../context/ProjectContext';
import { Zap, Activity, LightbulbIcon, Power, Network, Hash, MapPin, Eye } from 'lucide-react';
import './MapMonitor.css';

type DeviceStatus = 'ON' | 'OFF' | 'Has alerts' | 'Offline';

interface LampNode {
    id: string; // Pole ID
    type: 'node';
    lat: number;
    lng: number;
    status: DeviceStatus;
    dimming: number;
    power: number;
    voltage: number;
    zoneId: string;
    concentratorId: string;
}

interface Concentrator {
    id: string;
    type: 'concentrator';
    lat: number;
    lng: number;
    status: DeviceStatus;
    signalDb: number;
    zoneId: string;
}

const getStatusColor = (status: DeviceStatus) => {
    switch (status) {
        case 'ON': return '#10b981'; // success
        case 'OFF': return '#94a3b8'; // muted gray
        case 'Has alerts': return '#f59e0b'; // warning
        case 'Offline': return '#ef4444'; // danger
        default: return '#94a3b8';
    }
};

// Custom icons based on type and status
const createNodeIcon = (color: string) => new Icon({
    iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color}" stroke="black" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="white"></circle></svg>`)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const createConcentratorIcon = (color: string) => new Icon({
    iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="4"></rect><circle cx="12" cy="12" r="3" fill="black"></circle></svg>`)}`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
});

const initialNodes: LampNode[] = [
    { id: 'Pole-101', type: 'node', lat: 24.7136, lng: 46.6753, status: 'ON', dimming: 80, power: 120, voltage: 220, zoneId: 'Downtown Sector A', concentratorId: '202212070011' },
    { id: 'Pole-102', type: 'node', lat: 24.7142, lng: 46.6760, status: 'Has alerts', dimming: 100, power: 155, voltage: 235, zoneId: 'Downtown Sector A', concentratorId: '202212070011' },
    { id: 'Pole-103', type: 'node', lat: 24.7125, lng: 46.6745, status: 'OFF', dimming: 0, power: 0, voltage: 220, zoneId: 'Downtown Sector A', concentratorId: '202212070011' },
    { id: 'Pole-104', type: 'node', lat: 24.7210, lng: 46.6810, status: 'Offline', dimming: 0, power: 0, voltage: 0, zoneId: 'North Sector B', concentratorId: '202212070013' },
    { id: 'Pole-105', type: 'node', lat: 24.7220, lng: 46.6790, status: 'Offline', dimming: 0, power: 0, voltage: 0, zoneId: 'North Sector B', concentratorId: '202212070013' },
    { id: 'Pole-201', type: 'node', lat: 21.5440, lng: 39.1730, status: 'ON', dimming: 100, power: 150, voltage: 220, zoneId: 'Marina Bay', concentratorId: '202212070012' },
    { id: 'Pole-202', type: 'node', lat: 21.5510, lng: 39.1810, status: 'Has alerts', dimming: 100, power: 155, voltage: 235, zoneId: 'Port Area', concentratorId: '202212070014' },
];

const initialConcentrators: Concentrator[] = [
    { id: '202212070011', type: 'concentrator', lat: 24.7130, lng: 46.6750, status: 'ON', signalDb: -65, zoneId: 'Downtown Sector A' },
    { id: '202212070013', type: 'concentrator', lat: 24.7200, lng: 46.6800, status: 'Offline', signalDb: -80, zoneId: 'North Sector B' },
    { id: '202212070012', type: 'concentrator', lat: 21.5433, lng: 39.1728, status: 'ON', signalDb: -78, zoneId: 'Marina Bay' },
    { id: '202212070014', type: 'concentrator', lat: 21.5500, lng: 39.1800, status: 'Has alerts', signalDb: -62, zoneId: 'Port Area' },
];

export const MapMonitor: React.FC = () => {
    const { currentProject, currentGateway } = useProject();
    const { canControlDevice } = usePermissions();
    const [nodes, setNodes] = useState(initialNodes);
    const [concentrators] = useState(initialConcentrators);
    const [expandedConc, setExpandedConc] = useState<string | null>(null);

    // Filter Logic
    const displayedConcentrators = concentrators.filter(conc => {
        if (currentProject?.id === 'all') return true;
        if (currentGateway !== 'all') return conc.id === currentGateway;
        return currentProject?.driveUids.includes(conc.id);
    });

    const displayedNodes = nodes.filter(node => {
        return displayedConcentrators.some(c => c.id === node.concentratorId);
    });

    const handleNodeToggle = (id: string, forceState?: boolean) => {
        if (!canControlDevice()) return alert("Permission Denied: Operator level or higher required.");
        setNodes(prev => prev.map(n => {
            if (n.id === id) {
                if (n.status === 'Offline') return n;
                const turnOn = forceState !== undefined ? forceState : n.dimming === 0;
                return { ...n, dimming: turnOn ? 100 : 0, status: turnOn ? 'ON' : 'OFF' };
            }
            return n;
        }));
    };

    const handleNodeDimming = (id: string, val: number) => {
        if (!canControlDevice()) return;
        setNodes(prev => prev.map(n => {
            if (n.id === id) {
                if (n.status === 'Offline') return n;
                return { ...n, dimming: val, status: val > 0 ? 'ON' : 'OFF' };
            }
            return n;
        }));
    };

    const handleConcToggle = (concId: string, turnOn: boolean) => {
        if (!canControlDevice()) return alert("Permission Denied.");
        setNodes(prev => prev.map(n => {
            if (n.concentratorId === concId && n.status !== 'Offline') {
                return { ...n, dimming: turnOn ? 100 : 0, status: turnOn ? 'ON' : 'OFF' };
            }
            return n;
        }));
    };

    const handleConcDimming = (concId: string, val: number) => {
        if (!canControlDevice()) return;
        setNodes(prev => prev.map(n => {
            if (n.concentratorId === concId && n.status !== 'Offline') {
                return { ...n, dimming: val, status: val > 0 ? 'ON' : 'OFF' };
            }
            return n;
        }));
    };

    return (
        <div className="flex flex-col h-full">
            <div className="map-header">
                <div>
                    <h1 className="map-title">Geographic Monitoring</h1>
                    <p className="dashboard-subtitle">Real-time asset tracking and direct control.</p>
                </div>
                <div className="flex gap-4">
                    {/* Legend */}
                    {(['ON', 'OFF', 'Has alerts', 'Offline'] as DeviceStatus[]).map(status => (
                        <div key={status} className="flex items-center gap-2">
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: getStatusColor(status) }}></div>
                            <span className="text-sm text-[var(--color-text-muted)]">{status}</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-2 ml-4 px-3 border-l border-[var(--color-border)]">
                        <div style={{ width: 14, height: 14, border: '1px solid white', background: '#94a3b8' }}></div>
                        <span className="text-sm text-[var(--color-text-muted)]">Concentrator</span>
                    </div>
                </div>
            </div>

            <div className="map-container-wrapper">
                <MapContainer center={[24.7136, 46.6753]} zoom={15}>
                    {/* CartoDB Dark Matter Base Map */}
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {/* Render Concentrators */}
                    {displayedConcentrators.map(conc => (
                        <Marker key={conc.id} position={[conc.lat, conc.lng]} icon={createConcentratorIcon(getStatusColor(conc.status))}>
                            <Popup>
                                <div style={{ width: '300px', maxHeight: '400px', overflowY: 'auto', overflowX: 'hidden' }}>
                                    <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3 mb-3">
                                        <div className="flex items-center gap-2">
                                            <Network size={18} className="text-[var(--color-primary)]" />
                                            <span className="font-bold text-white text-base">{conc.id}</span>
                                            <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: `${getStatusColor(conc.status)}20`, color: getStatusColor(conc.status), marginLeft: '4px' }}>
                                                {conc.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 mb-4">
                                        <div className="flex justify-between items-center bg-[rgba(255,255,255,0.02)] p-2 rounded">
                                            <span className="text-[var(--color-text-muted)] text-sm flex items-center gap-2"><MapPin size={14} />Location</span>
                                            <span className="text-white font-medium text-sm">{conc.lat.toFixed(4)}, {conc.lng.toFixed(4)}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-[rgba(255,255,255,0.02)] p-2 rounded">
                                            <span className="text-[var(--color-text-muted)] text-sm flex items-center gap-2"><Hash size={14} />Zone</span>
                                            <span className="text-white font-medium text-sm">{conc.zoneId}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-[rgba(255,255,255,0.02)] p-2 rounded">
                                            <span className="text-[var(--color-text-muted)] text-sm flex items-center gap-2"><Activity size={14} />Signal</span>
                                            <span className="text-white font-medium text-sm">{conc.signalDb} dBm</span>
                                        </div>
                                    </div>

                                    <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.05)]">
                                        {(() => {
                                            const attachedNodes = nodes.filter(n => n.concentratorId === conc.id);
                                            const onCount = attachedNodes.filter(n => n.status === 'ON').length;
                                            const offCount = attachedNodes.filter(n => n.status === 'OFF').length;

                                            return (
                                                <div className="flex flex-col gap-2">
                                                    <div className="text-sm text-[var(--color-text-muted)] flex justify-between">
                                                        <span>Attached Nodes ({attachedNodes.length}):</span>
                                                        <div className="flex gap-2 text-xs">
                                                            <span className="text-[#10b981]">{onCount} ON</span>
                                                            <span className="text-[#94a3b8]">{offCount} OFF</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 mt-1">
                                                        <button onClick={() => handleConcToggle(conc.id, true)} className="flex-1 btn-primary" style={{ padding: '0.4rem', fontSize: '0.8rem', justifyContent: 'center' }}>All ON</button>
                                                        <button onClick={() => handleConcToggle(conc.id, false)} className="flex-1 btn-primary" style={{ padding: '0.4rem', fontSize: '0.8rem', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', color: 'white' }}>All OFF</button>
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-xs text-[var(--color-text-muted)] w-16">Group Dim:</span>
                                                        <input
                                                            type="range" min="0" max="100" defaultValue="100"
                                                            className="range-slider flex-1"
                                                            onChange={(e) => handleConcDimming(conc.id, Number(e.target.value))}
                                                        />
                                                    </div>

                                                    <button
                                                        onClick={() => setExpandedConc(expandedConc === conc.id ? null : conc.id)}
                                                        className="btn-glass w-full mt-3 text-xs py-2"
                                                        style={{
                                                            background: expandedConc === conc.id ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, rgba(20, 30, 48, 0.4) 0%, rgba(5, 8, 16, 0.6) 100%)',
                                                            color: expandedConc === conc.id ? 'white' : 'var(--color-primary)'
                                                        }}
                                                    >
                                                        <Eye size={12} /> {expandedConc === conc.id ? 'Hide Node List' : 'View Node List'}
                                                    </button>

                                                    {expandedConc === conc.id && (
                                                        <div className="mt-2 max-h-[120px] overflow-y-auto bg-[rgba(0,0,0,0.2)] rounded p-2 flex flex-col gap-1 border border-[rgba(255,255,255,0.05)]">
                                                            {attachedNodes.map(n => (
                                                                <div key={n.id} className="flex justify-between items-center text-xs p-1 border-b border-[rgba(255,255,255,0.02)]">
                                                                    <span className="text-white">{n.id}</span>
                                                                    <span style={{ color: getStatusColor(n.status), fontWeight: 600 }}>{n.status}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Render Nodes (Lamps) */}
                    {displayedNodes.map(node => (
                        <Marker key={node.id} position={[node.lat, node.lng]} icon={createNodeIcon(getStatusColor(node.status))}>
                            <Popup>
                                <div style={{ width: '300px', overflowX: 'hidden' }}>
                                    <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3 mb-3">
                                        <div className="flex items-center gap-2">
                                            <LightbulbIcon size={18} className="text-[var(--color-primary)]" />
                                            <span className="font-bold text-white text-base">{node.id}</span>
                                            <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: `${getStatusColor(node.status)}20`, color: getStatusColor(node.status), marginLeft: '4px' }}>
                                                {node.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 mb-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[var(--color-text-muted)] text-sm flex items-center gap-2"><MapPin size={14} />Location</span>
                                            <span className="text-white font-medium text-sm">{node.lat.toFixed(4)}, {node.lng.toFixed(4)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[var(--color-text-muted)] text-sm flex items-center gap-2"><Hash size={14} />Zone</span>
                                            <span className="text-white font-medium text-sm">{node.zoneId}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[var(--color-text-muted)] text-sm flex items-center gap-2"><Network size={14} />Gateway</span>
                                            <span className="text-white font-medium text-sm" title={node.concentratorId}>{node.concentratorId}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-[rgba(255,255,255,0.02)] rounded-lg border border-[rgba(255,255,255,0.05)]">
                                        <div className="flex flex-col gap-1 items-center">
                                            <span className="text-[var(--color-text-muted)] text-xs flex items-center gap-1"><Activity size={12} />Power</span>
                                            <span className="text-white font-bold text-lg">{node.power} <span className="text-xs font-normal text-[var(--color-text-muted)]">W</span></span>
                                        </div>
                                        <div className="flex flex-col gap-1 items-center border-l border-[rgba(255,255,255,0.05)]">
                                            <span className="text-[var(--color-text-muted)] text-xs flex items-center gap-1"><Zap size={12} />Voltage</span>
                                            <span className="text-white font-bold text-lg">{node.voltage} <span className="text-xs font-normal text-[var(--color-text-muted)]">V</span></span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 mt-2 border-t border-[rgba(255,255,255,0.05)] pt-4">
                                        <button
                                            onClick={() => handleNodeToggle(node.id)}
                                            className="w-full btn-primary transition-all duration-300 flex justify-center items-center gap-2"
                                            style={{
                                                padding: '0.6rem', fontSize: '0.9rem',
                                                background: node.dimming > 0 ? 'rgba(255,255,255,0.1)' : undefined,
                                                color: node.dimming > 0 ? 'white' : 'black',
                                                border: node.dimming > 0 ? '1px solid rgba(255,255,255,0.2)' : 'none'
                                            }}
                                            disabled={node.status === 'Offline'}
                                        >
                                            <Power size={16} /> {node.dimming > 0 ? 'Turn OFF' : 'Turn ON'}
                                        </button>

                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-[var(--color-text-muted)] flex items-center gap-1"><LightbulbIcon size={14} /> Dimming</span>
                                                <span className="text-sm text-white font-medium">{node.dimming}%</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="100" value={node.dimming}
                                                onChange={(e) => handleNodeDimming(node.id, Number(e.target.value))}
                                                className="range-slider w-full"
                                                disabled={node.status === 'Offline'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};
