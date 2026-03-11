import React, { useState, useEffect } from 'react';
import { BellRing, Plus, Edit2, Trash2, Filter, AlertTriangle, Lightbulb, Network, Activity } from 'lucide-react';

export type AlarmType = 'Lamp' | 'Gateway';
export type AlarmSeverity = 'Critical' | 'Warning' | 'Info';
export type TargetLevel = 'Global' | 'Project' | 'District' | 'Gateway' | 'Pole' | 'Node';

export interface AlarmRule {
    id: string;
    name: string;
    type: AlarmType;
    severity: AlarmSeverity;
    targetLevel: TargetLevel;
    targetId: string;
    condition: string; // The fully formed string e.g. "Over Voltage (> 260 V)"
    active: boolean;
}

// Define metrics with optional editable parameters
export interface MetricDefinition {
    id: string;
    label: string;
    hasParam: boolean;
    paramLabel?: string;
    paramUnit?: string;
    defaultParamValue?: number;
    formatCondition: (val?: number) => string;
}

const LAMP_METRICS: MetricDefinition[] = [
    { id: 'offline', label: 'Offline Node', hasParam: false, formatCondition: () => 'Offline Node' },
    { id: 'tilt', label: 'Pole Tilting Detected', hasParam: false, formatCondition: () => 'Pole Tilting Detected' },
    { id: 'over_voltage', label: 'Over Voltage', hasParam: true, paramLabel: 'Threshold >', paramUnit: 'V', defaultParamValue: 250, formatCondition: (v) => `Over Voltage (> ${v}V)` },
    { id: 'under_voltage', label: 'Under Voltage', hasParam: true, paramLabel: 'Threshold <', paramUnit: 'V', defaultParamValue: 190, formatCondition: (v) => `Under Voltage (< ${v}V)` },
    { id: 'over_current', label: 'Over Current / Surge', hasParam: true, paramLabel: 'Threshold >', paramUnit: 'A', defaultParamValue: 10, formatCondition: (v) => `Over Current (> ${v}A)` },
    { id: 'high_temp', label: 'High Temperature', hasParam: true, paramLabel: 'Threshold >', paramUnit: '°C', defaultParamValue: 65, formatCondition: (v) => `High Temperature (> ${v}°C)` },
    { id: 'relay_fail', label: 'Relay Failure (Stuck)', hasParam: false, formatCondition: () => 'Relay Failure' },
    { id: 'day_burn', label: 'Day-Burn (ON in daytime)', hasParam: false, formatCondition: () => 'Day-Burn (ON in daytime)' },
    { id: 'night_dark', label: 'Night-Dark (OFF in nighttime)', hasParam: false, formatCondition: () => 'Night-Dark (OFF in nighttime)' },
    { id: 'comms_loss', label: 'Communication Loss', hasParam: false, formatCondition: () => 'Communication Loss' },
];

const GATEWAY_METRICS: MetricDefinition[] = [
    { id: 'disconnect', label: 'Internet Disconnect', hasParam: false, formatCondition: () => 'Internet Disconnect' },
    { id: 'missed_heartbeats', label: 'Missed Heartbeats', hasParam: true, paramLabel: 'Missed count >', paramUnit: 'beats', defaultParamValue: 3, formatCondition: (v) => `Offline (> ${v} Missed Heartbeats)` },
    { id: 'battery_mode', label: 'Power Loss (Battery Mode)', hasParam: false, formatCondition: () => 'Power Loss (Battery Mode)' },
    { id: 'high_temp_gw', label: 'High Temperature', hasParam: true, paramLabel: 'Threshold >', paramUnit: '°C', defaultParamValue: 70, formatCondition: (v) => `High Temperature (> ${v}°C)` },
    { id: 'data_parsing', label: 'Data Parsing Error', hasParam: false, formatCondition: () => 'Data Parsing Error' },
    { id: 'firmware_fail', label: 'Firmware Integrity Failure', hasParam: false, formatCondition: () => 'Firmware Integrity Failure' },
];

const mockAlarms: AlarmRule[] = [
    { id: 'al-1', name: 'Gateway Offline Critical', type: 'Gateway', severity: 'Critical', targetLevel: 'Global', targetId: 'All', condition: 'Internet Disconnect', active: true },
    { id: 'al-2', name: 'Pole Tilting Incident', type: 'Lamp', severity: 'Critical', targetLevel: 'Global', targetId: 'All', condition: 'Pole Tilting Detected', active: true },
    { id: 'al-3', name: 'High Lamp Temperature', type: 'Lamp', severity: 'Warning', targetLevel: 'District', targetId: 'Downtown Sector A', condition: 'High Temperature (> 75°C)', active: true },
    { id: 'al-4', name: 'Day-Burn Detection', type: 'Lamp', severity: 'Info', targetLevel: 'Project', targetId: 'proj-1', condition: 'Day-Burn (ON in daytime)', active: false },
];

export const AdminAlarms: React.FC = () => {
    const [alarms, setAlarms] = useState<AlarmRule[]>(mockAlarms);

    // Create/Edit Modal State
    const [showCreate, setShowCreate] = useState(false);
    const [editingAlarm, setEditingAlarm] = useState<AlarmRule | null>(null);
    const [newType, setNewType] = useState<AlarmType>('Lamp');
    const [newName, setNewName] = useState('');
    const [newSeverity, setNewSeverity] = useState<AlarmSeverity>('Warning');
    const [newTargetLevel, setNewTargetLevel] = useState<TargetLevel>('Global');
    const [newTargetId, setNewTargetId] = useState('All');

    // Complex Condition State
    const [selectedMetricId, setSelectedMetricId] = useState<string>(LAMP_METRICS[0].id);
    const [metricParamValue, setMetricParamValue] = useState<number | undefined>(undefined);

    const currentMetricsList = newType === 'Lamp' ? LAMP_METRICS : GATEWAY_METRICS;
    const activeMetricDef = currentMetricsList.find(m => m.id === selectedMetricId) || currentMetricsList[0];

    // Ensure metric matches the selected type when switching types
    useEffect(() => {
        const list = newType === 'Lamp' ? LAMP_METRICS : GATEWAY_METRICS;
        const defaultMetric = list[0];
        setSelectedMetricId(defaultMetric.id);
        setMetricParamValue(defaultMetric.defaultParamValue);
    }, [newType]);

    // Handle metric change within the same type to reset param default
    const handleMetricChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const mId = e.target.value;
        setSelectedMetricId(mId);
        const def = currentMetricsList.find(m => m.id === mId);
        if (def) {
            setMetricParamValue(def.defaultParamValue);
        }
    };

    const handleCreateAlarm = (e: React.FormEvent) => {
        e.preventDefault();

        const finalConditionString = activeMetricDef.formatCondition(metricParamValue);

        const newAlarm: AlarmRule = {
            id: `al-${Date.now()}`,
            name: newName,
            type: newType,
            severity: newSeverity,
            targetLevel: newTargetLevel,
            targetId: newTargetId,
            condition: finalConditionString,
            active: true
        };
        setAlarms([...alarms, newAlarm]);
        setShowCreate(false);

        // Reset form
        setNewName('');
        setNewType('Lamp');
        setNewTargetId('All');
        setNewTargetLevel('Global');
        // useEffect handles resetting the metric selections based on type change
    };

    const handleUpdateAlarm = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAlarm) return;

        const finalConditionString = activeMetricDef.formatCondition(metricParamValue);

        const updatedAlarm: AlarmRule = {
            ...editingAlarm,
            name: newName,
            type: newType,
            severity: newSeverity,
            targetLevel: newTargetLevel,
            targetId: newTargetId,
            condition: finalConditionString
        };

        setAlarms(alarms.map(a => a.id === editingAlarm.id ? updatedAlarm : a));
        setEditingAlarm(null);

        // Reset form
        setNewName('');
        setNewType('Lamp');
        setNewTargetId('All');
        setNewTargetLevel('Global');
    };

    const openEditModal = (alarm: AlarmRule) => {
        setEditingAlarm(alarm);
        setNewName(alarm.name);
        setNewType(alarm.type);
        setNewSeverity(alarm.severity);
        setNewTargetLevel(alarm.targetLevel);
        setNewTargetId(alarm.targetId);

        // Try to reverse-engineer selected metric from condition string
        const list = alarm.type === 'Lamp' ? LAMP_METRICS : GATEWAY_METRICS;
        let foundMetric = list.find(m => alarm.condition.startsWith(m.label));

        if (foundMetric) {
            setSelectedMetricId(foundMetric.id);
            if (foundMetric.hasParam) {
                const match = alarm.condition.match(/\d+(\.\d+)?/);
                if (match) {
                    setMetricParamValue(Number(match[0]));
                }
            } else {
                setMetricParamValue(undefined);
            }
        }
    };

    const toggleActive = (id: string) => {
        setAlarms(alarms.map(a => a.id === id ? { ...a, active: !a.active } : a));
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this alarm rule?")) {
            setAlarms(alarms.filter(a => a.id !== id));
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Header Section */}
            <div className="flex justify-between items-center bg-[rgba(255,255,255,0.02)] p-4 rounded-lg border border-[rgba(255,255,255,0.05)]">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <BellRing size={20} className="text-[var(--color-primary)]" /> Alarm Rules Engine
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">Configure threshold triggers and alerting targets across the infrastructure.</p>
                </div>
                <button className="btn-primary" onClick={() => setShowCreate(true)}>
                    <Plus size={18} /> Create Rule
                </button>
            </div>

            {/* Create Form */}
            {showCreate && (
                <form onSubmit={handleCreateAlarm} className="glass-panel p-6 border-[var(--color-primary)] border animate-fade-in relative">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Activity size={18} /> New Alarm Rule Definition</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Rule Name</label>
                                <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded p-2 text-white outline-none focus:border-[var(--color-primary)]" placeholder="e.g. Node Voltage Spike" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Alarm Type</label>
                                    <select value={newType} onChange={e => setNewType(e.target.value as AlarmType)} className="w-full bg-[#111827] border border-gray-700 rounded p-2 text-white outline-none focus:border-[var(--color-primary)]">
                                        <option value="Lamp" className="bg-[#1f2937] text-white">Lamp Asset</option>
                                        <option value="Gateway" className="bg-[#1f2937] text-white">Gateway Controller</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Severity</label>
                                    <select value={newSeverity} onChange={e => setNewSeverity(e.target.value as AlarmSeverity)} className="w-full bg-[#111827] border border-gray-700 rounded p-2 text-white outline-none focus:border-[var(--color-primary)]">
                                        <option value="Info" className="bg-[#1f2937] text-blue-400">Info</option>
                                        <option value="Warning" className="bg-[#1f2937] text-yellow-400">Warning</option>
                                        <option value="Critical" className="bg-[#1f2937] text-red-400">Critical</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="text-sm text-[var(--color-primary)] font-bold mb-1 block">Trigger Condition Metric</label>
                                    <select value={selectedMetricId} onChange={handleMetricChange} className="w-full bg-[#111827] border border-gray-700 rounded p-2 text-white outline-none focus:border-[var(--color-primary)] font-mono text-sm leading-relaxed">
                                        <optgroup label={`${newType} Available Metrics`} className="bg-[#1f2937] text-gray-400">
                                            {currentMetricsList.map(metric => (
                                                <option key={metric.id} value={metric.id} className="text-white">{metric.label}</option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>
                                {activeMetricDef.hasParam && (
                                    <div className="w-32 animate-fade-in">
                                        <label className="text-xs text-[var(--color-text-muted)] mb-1 block">{activeMetricDef.paramLabel}</label>
                                        <div className="relative">
                                            <input
                                                required
                                                type="number"
                                                value={metricParamValue ?? ''}
                                                onChange={e => setMetricParamValue(Number(e.target.value))}
                                                className="w-full bg-[#111827] border border-gray-700 rounded p-2 pr-8 text-white outline-none focus:border-[var(--color-primary)] font-mono text-sm"
                                            />
                                            <span className="absolute right-3 top-2.5 text-xs text-gray-500">{activeMetricDef.paramUnit}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                    <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Target Scope</label>
                                    <select value={newTargetLevel} onChange={e => setNewTargetLevel(e.target.value as TargetLevel)} className="w-full bg-[#111827] border border-gray-700 rounded p-2 text-white outline-none focus:border-[var(--color-primary)]">
                                        <option value="Global" className="bg-[#1f2937] text-white">Global (All)</option>
                                        <option value="Project" className="bg-[#1f2937] text-white">Project Level</option>
                                        <option value="District" className="bg-[#1f2937] text-white">District Level</option>
                                        <option value="Gateway" className="bg-[#1f2937] text-white">Gateway Level</option>
                                        <option value="Pole" className="bg-[#1f2937] text-white">Pole Level</option>
                                        <option value="Node" className="bg-[#1f2937] text-white">Specific Node</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Target Assignment ID</label>
                                    <input type="text" value={newTargetId} onChange={e => setNewTargetId(e.target.value)} disabled={newTargetLevel === 'Global'} className="w-full bg-[#111827] border border-gray-700 rounded p-2 text-white outline-none focus:border-[var(--color-primary)] disabled:opacity-50" placeholder={newTargetLevel === 'Global' ? "All Assets" : "Enter ID e.g. proj-1"} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)]">
                        <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                        <button type="submit" className="btn-primary">Save Rule</button>
                    </div>
                </form>
            )}

            {/* Edit Form */}
            {editingAlarm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <form onSubmit={handleUpdateAlarm} className="glass-panel w-full max-w-4xl p-6 border-[var(--color-primary)] border animate-fade-in relative shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Edit2 size={18} /> Edit Alarm Rule: {editingAlarm.name}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Rule Name</label>
                                    <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded p-2 text-white outline-none focus:border-[var(--color-primary)]" placeholder="e.g. Node Voltage Spike" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Alarm Type</label>
                                        <select value={newType} onChange={e => setNewType(e.target.value as AlarmType)} className="w-full bg-[#111827] border border-gray-700 rounded p-2 text-white outline-none focus:border-[var(--color-primary)]">
                                            <option value="Lamp" className="bg-[#1f2937] text-white">Lamp Asset</option>
                                            <option value="Gateway" className="bg-[#1f2937] text-white">Gateway Controller</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Severity</label>
                                        <select value={newSeverity} onChange={e => setNewSeverity(e.target.value as AlarmSeverity)} className="w-full bg-[#111827] border border-gray-700 rounded p-2 text-white outline-none focus:border-[var(--color-primary)]">
                                            <option value="Info" className="bg-[#1f2937] text-blue-400">Info</option>
                                            <option value="Warning" className="bg-[#1f2937] text-yellow-400">Warning</option>
                                            <option value="Critical" className="bg-[#1f2937] text-red-400">Critical</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                                <div className="flex gap-4 items-end">
                                    <div className="flex-1">
                                        <label className="text-sm text-[var(--color-primary)] font-bold mb-1 block">Trigger Condition Metric</label>
                                        <select value={selectedMetricId} onChange={handleMetricChange} className="w-full bg-[#111827] border border-gray-700 rounded p-2 text-white outline-none focus:border-[var(--color-primary)] font-mono text-sm leading-relaxed">
                                            <optgroup label={`${newType} Available Metrics`} className="bg-[#1f2937] text-gray-400">
                                                {currentMetricsList.map(metric => (
                                                    <option key={metric.id} value={metric.id} className="text-white">{metric.label}</option>
                                                ))}
                                            </optgroup>
                                        </select>
                                    </div>
                                    {activeMetricDef.hasParam && (
                                        <div className="w-32 animate-fade-in">
                                            <label className="text-xs text-[var(--color-text-muted)] mb-1 block">{activeMetricDef.paramLabel}</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="number"
                                                    value={metricParamValue ?? ''}
                                                    onChange={e => setMetricParamValue(Number(e.target.value))}
                                                    className="w-full bg-[#111827] border border-gray-700 rounded p-2 pr-8 text-white outline-none focus:border-[var(--color-primary)] font-mono text-sm"
                                                />
                                                <span className="absolute right-3 top-2.5 text-xs text-gray-500">{activeMetricDef.paramUnit}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Target Scope</label>
                                        <select value={newTargetLevel} onChange={e => setNewTargetLevel(e.target.value as TargetLevel)} className="w-full bg-[#111827] border border-gray-700 rounded p-2 text-white outline-none focus:border-[var(--color-primary)]">
                                            <option value="Global" className="bg-[#1f2937] text-white">Global (All)</option>
                                            <option value="Project" className="bg-[#1f2937] text-white">Project Level</option>
                                            <option value="District" className="bg-[#1f2937] text-white">District Level</option>
                                            <option value="Gateway" className="bg-[#1f2937] text-white">Gateway Level</option>
                                            <option value="Pole" className="bg-[#1f2937] text-white">Pole Level</option>
                                            <option value="Node" className="bg-[#1f2937] text-white">Specific Node</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Target Assignment ID</label>
                                        <input type="text" value={newTargetId} onChange={e => setNewTargetId(e.target.value)} disabled={newTargetLevel === 'Global'} className="w-full bg-[#111827] border border-gray-700 rounded p-2 text-white outline-none focus:border-[var(--color-primary)] disabled:opacity-50" placeholder={newTargetLevel === 'Global' ? "All Assets" : "Enter ID e.g. proj-1"} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)]">
                            <button type="button" className="btn-secondary" onClick={() => {
                                setEditingAlarm(null);
                                setNewName('');
                                setNewType('Lamp');
                                setNewTargetId('All');
                                setNewTargetLevel('Global');
                            }}>Cancel</button>
                            <button type="submit" className="btn-primary">Update Rule</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Configured Alarms List */}
            <div className="glass-panel flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] text-sm sticky top-0 bg-[#0f1523] z-10">
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Rule Name</th>
                            <th className="p-4 font-medium">Type</th>
                            <th className="p-4 font-medium">Severity</th>
                            <th className="p-4 font-medium">Target Assignment</th>
                            <th className="p-4 font-medium">Constraint Logic</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alarms.map((alarm) => (
                            <tr key={alarm.id} className={`border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors ${!alarm.active ? 'opacity-50 grayscale' : ''}`}>
                                <td className="p-4">
                                    <button
                                        onClick={() => toggleActive(alarm.id)}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${alarm.active ? 'bg-[var(--color-primary)]' : 'bg-gray-600'}`}
                                        title={alarm.active ? "Deactivate Rule" : "Activate Rule"}
                                    >
                                        <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-transform ${alarm.active ? 'translate-x-[22px] bg-black' : 'translate-x-[3px]'}`} />
                                    </button>
                                </td>
                                <td className="p-4 font-medium text-white">{alarm.name}</td>
                                <td className="p-4 text-xs">
                                    <div className="flex items-center gap-1.5 text-gray-300">
                                        {alarm.type === 'Lamp' ? <Lightbulb size={14} className="text-yellow-400" /> : <Network size={14} className="text-purple-400" />}
                                        {alarm.type}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs border flex items-center gap-1 w-max
                                        ${alarm.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                                            alarm.severity === 'Warning' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                                                'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}
                                    >
                                        <AlertTriangle size={12} /> {alarm.severity}
                                    </span>
                                </td>
                                <td className="p-4 text-sm">
                                    <span className="text-gray-400">{alarm.targetLevel}:</span> <span className="text-white">{alarm.targetId}</span>
                                </td>
                                <td className="p-4 text-sm font-mono text-[var(--color-primary)]">
                                    {alarm.condition}
                                </td>
                                <td className="p-4 flex gap-2 justify-end">
                                    <button className="btn-icon text-blue-400 hover:text-blue-300" onClick={() => openEditModal(alarm)}><Edit2 size={16} /></button>
                                    <button className="btn-icon text-red-400 hover:text-red-300" onClick={() => handleDelete(alarm.id)}><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {alarms.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        <Filter size={32} className="mx-auto mb-2 opacity-50" />
                        <p>No alarm rules configured.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
