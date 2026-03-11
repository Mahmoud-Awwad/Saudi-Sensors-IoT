import React, { useState, useEffect } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Calendar, UploadCloud, Clock, Plus, Trash2, Code, Eye, Save, Bookmark } from 'lucide-react';
import './TaskManage.css';

interface TaskAction {
    id: string;
    actionHour: number;
    actionMinute: number;
    dimming: number;
    groupCode: number;
}

export const TaskManage: React.FC = () => {
    const { canUpdateSettings } = usePermissions();

    // Visual Builder State
    const [taskName, setTaskName] = useState<string>('');
    const [yearOfDay, setYearOfDay] = useState<number>(1);
    const [actions, setActions] = useState<TaskAction[]>([
        { id: '1', actionHour: 18, actionMinute: 0, dimming: 100, groupCode: 0 },
        { id: '2', actionHour: 23, actionMinute: 0, dimming: 60, groupCode: 0 },
        { id: '3', actionHour: 6, actionMinute: 0, dimming: 0, groupCode: 0 }
    ]);

    // Saved Profiles State
    const [savedProfiles, setSavedProfiles] = useState([
        { name: 'Standard Evening Curve', target: 'All Gateways', status: 'Active', items: 3 },
        { name: 'Highway Energy Save', target: 'Zone 2 East', status: 'Active', items: 5 },
        { name: 'Ramadan Special Profiles', target: 'Zone 1 Central', status: 'Inactive', items: 2 },
    ]);

    // UI State
    const [showJson, setShowJson] = useState(false);
    const [jsonPreview, setJsonPreview] = useState('');

    // Update JSON Preview whenever visual state changes
    useEffect(() => {
        const payload = [
            {
                yearOfDay,
                actions: actions.map(({ actionHour, actionMinute, dimming, groupCode }) => ({
                    actionHour, actionMinute, dimming, groupCode
                }))
            }
        ];
        setJsonPreview(JSON.stringify(payload, null, 2));
    }, [yearOfDay, actions]);

    const handleAddAction = () => {
        const newId = Math.random().toString(36).substr(2, 9);
        // Default to a sensible next step, or just 12:00
        setActions([...actions, { id: newId, actionHour: 12, actionMinute: 0, dimming: 50, groupCode: 0 }]);
    };

    const handleRemoveAction = (idToRemove: string) => {
        setActions(actions.filter(a => a.id !== idToRemove));
    };

    const handleUpdateAction = (id: string, field: keyof TaskAction, value: number) => {
        setActions(actions.map(a => a.id === id ? { ...a, [field]: value } : a));
    };

    // Template Handlers
    const loadTemplate = (type: 'standard' | 'highway' | 'security') => {
        setYearOfDay(1);
        if (type === 'standard') {
            setTaskName('Standard Evening');
            setActions([
                { id: 't1-1', actionHour: 18, actionMinute: 0, dimming: 100, groupCode: 0 },
                { id: 't1-2', actionHour: 0, actionMinute: 0, dimming: 50, groupCode: 0 },
                { id: 't1-3', actionHour: 6, actionMinute: 0, dimming: 0, groupCode: 0 }
            ]);
        } else if (type === 'highway') {
            setTaskName('Highway Energy Save');
            setActions([
                { id: 't2-1', actionHour: 19, actionMinute: 0, dimming: 100, groupCode: 0 },
                { id: 't2-2', actionHour: 23, actionMinute: 0, dimming: 70, groupCode: 0 },
                { id: 't2-3', actionHour: 2, actionMinute: 0, dimming: 40, groupCode: 0 },
                { id: 't2-4', actionHour: 5, actionMinute: 0, dimming: 100, groupCode: 0 },
                { id: 't2-5', actionHour: 7, actionMinute: 0, dimming: 0, groupCode: 0 },
            ]);
        } else if (type === 'security') {
            setTaskName('All Night Security');
            setActions([
                { id: 't3-1', actionHour: 18, actionMinute: 0, dimming: 100, groupCode: 0 },
                { id: 't3-2', actionHour: 6, actionMinute: 0, dimming: 0, groupCode: 0 }
            ]);
        }
    };

    const handleSaveProfile = () => {
        if (!taskName.trim()) return alert("Please enter a Task Name before saving.");
        const newProfile = {
            name: taskName,
            target: 'Configured Network', // In a real app, this would be selected via UI
            status: 'Inactive',
            items: actions.length
        };
        setSavedProfiles([newProfile, ...savedProfiles]);
        alert(`Profile "${taskName}" saved successfully locally!`);
    };

    const handleUpload = () => {
        if (!canUpdateSettings()) return alert("Permission Denied.");
        alert(`Task schedule "${taskName || 'Unnamed'}" uploaded successfully to gateways.`);
    };

    // Helper to generate hours/minutes for select boxes
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = [0, 15, 30, 45]; // Common scheduling intervals

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Task Scheduling</h1>
                    <p className="text-[var(--color-text-muted)]">Configure and upload autonomous dimming tasks to concentrators.</p>
                </div>
                <button
                    className="btn-icon"
                    onClick={() => setShowJson(!showJson)}
                    title={showJson ? "Show Visual Builder" : "Show JSON Payload"}
                >
                    {showJson ? <Eye size={20} /> : <Code size={20} />}
                    <span className="ml-2 font-medium">{showJson ? "Visual Builder" : "JSON Preview"}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">

                {/* Visual Task Builder */}
                <div className="glass-panel p-5 flex flex-col h-full relative">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                        <Calendar style={{ color: 'var(--color-primary)' }} /> Task Definitions
                    </h2>

                    {showJson ? (
                        <div className="flex-1 flex flex-col">
                            <p className="text-sm text-[var(--color-text-muted)] mb-3">
                                Read-only preview of the exact <code>LoraMeshTaskVO</code> structure matching your visual configuration.
                            </p>
                            <textarea
                                value={jsonPreview}
                                readOnly
                                className="w-full flex-1 p-4 rounded-lg bg-[var(--color-bg-base)] text-[var(--color-primary)] font-mono text-sm border border-[var(--color-border)] outline-none resize-none"
                                spellCheck={false}
                            />
                        </div>
                    ) : (
                        <div className="visual-builder flex-1 flex flex-col gap-6 animate-fade-in">
                            {/* Templates and Naming */}
                            <div className="builder-header flex flex-wrap gap-4 items-end">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="text-sm font-medium text-[var(--color-primary)] mb-2 block">Task Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[rgba(0,0,0,0.2)] border border-[var(--color-border)] rounded-lg p-2.5 text-white outline-none focus:border-[var(--color-primary)] transition-colors"
                                        placeholder="e.g. Ramadan Special Profile"
                                        value={taskName}
                                        onChange={e => setTaskName(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col flex-1 min-w-[300px]">
                                    <label className="text-sm font-medium text-[var(--color-text-muted)] mb-2 block">Quick Templates</label>
                                    <div className="flex gap-2">
                                        <button className="btn-chip" onClick={() => loadTemplate('standard')}>Standard</button>
                                        <button className="btn-chip" onClick={() => loadTemplate('highway')}>Highway</button>
                                        <button className="btn-chip" onClick={() => loadTemplate('security')}>Security</button>
                                    </div>
                                </div>
                            </div>

                            {/* Day Selection */}
                            <div className="builder-section">
                                <label className="text-sm font-medium text-white mb-2 block">Trigger Schedule</label>
                                <div className="flex items-center gap-3 bg-[rgba(0,0,0,0.2)] p-3 rounded-lg border border-[var(--color-border)]">
                                    <span className="text-[var(--color-text-muted)] text-sm">Target Day:</span>
                                    <select
                                        className="styled-select min-w-[150px]"
                                        value={yearOfDay}
                                        onChange={(e) => setYearOfDay(Number(e.target.value))}
                                    >
                                        <option value={1}>Everyday (1)</option>
                                        <option value={2}>Weekdays (2)</option>
                                        <option value={3}>Weekends (3)</option>
                                        {/* Based on LoraMesh implementation could have up to 7 or custom logic */}
                                    </select>
                                    <span className="text-xs text-[var(--color-text-muted)] ml-auto">
                                        (yearOfDay parameter)
                                    </span>
                                </div>
                            </div>

                            {/* Actions List */}
                            <div className="builder-section flex-1">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-sm font-medium text-white">Time-based Actions</label>
                                    <button className="btn-action text-xs flex items-center gap-1 active" onClick={handleAddAction}>
                                        <Plus size={14} /> Add Action
                                    </button>
                                </div>

                                <div className="actions-list flex flex-col gap-3">
                                    {actions.length === 0 ? (
                                        <div className="text-center py-6 text-[var(--color-text-muted)] bg-[rgba(0,0,0,0.1)] rounded-lg border border-dashed border-[var(--color-border)]">
                                            No actions defined. Lamp will remain in its last state.
                                        </div>
                                    ) : (
                                        actions.map((action, index) => (
                                            <div key={action.id} className="action-card flex items-center flex-wrap gap-4 p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-xs font-bold text-[var(--color-text-muted)]">
                                                    {index + 1}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} className="text-[var(--color-text-muted)]" />
                                                    <select
                                                        className="styled-select"
                                                        value={action.actionHour}
                                                        onChange={(e) => handleUpdateAction(action.id, 'actionHour', Number(e.target.value))}
                                                    >
                                                        {hours.map(h => <option key={`h-${h}`} value={h}>{h.toString().padStart(2, '0')}</option>)}
                                                    </select>
                                                    <span className="text-[var(--color-text-muted)]">:</span>
                                                    <select
                                                        className="styled-select"
                                                        value={action.actionMinute}
                                                        onChange={(e) => handleUpdateAction(action.id, 'actionMinute', Number(e.target.value))}
                                                    >
                                                        {minutes.map(m => <option key={`m-${m}`} value={m}>{m.toString().padStart(2, '0')}</option>)}
                                                    </select>
                                                </div>

                                                <div className="flex items-center gap-3 flex-1 min-w-[200px] bg-[rgba(0,0,0,0.2)] px-3 py-1.5 rounded">
                                                    <span className="text-xs font-medium text-[var(--color-warning)]">DIM</span>
                                                    <input
                                                        type="range"
                                                        min="0" max="100"
                                                        value={action.dimming}
                                                        onChange={(e) => handleUpdateAction(action.id, 'dimming', Number(e.target.value))}
                                                        className="range-slider w-full"
                                                    />
                                                    <span className="w-10 text-right text-xs font-mono font-bold text-white">{action.dimming}%</span>
                                                </div>

                                                <button
                                                    className="p-2 ml-auto text-[var(--color-danger)] opacity-60 hover:opacity-100 hover:bg-[rgba(239,68,68,0.1)] rounded transition-all"
                                                    onClick={() => handleRemoveAction(action.id)}
                                                    title="Remove Action"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.05)] flex gap-4">
                        <button className="btn-glass flex-1" onClick={handleSaveProfile}>
                            <Save size={18} /> Save Profile Locally
                        </button>
                        <button className="btn-primary flex-1 justify-center py-3" onClick={handleUpload}>
                            <UploadCloud size={18} /> Deploy to Network
                        </button>
                    </div>
                </div>

                {/* Active/Saved Profiles sidebar */}
                <div className="glass-panel p-5 h-fit">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                        <Bookmark style={{ color: 'var(--color-info)' }} /> Saved & Active Profiles
                    </h2>
                    <p className="text-sm text-[var(--color-text-muted)] mb-6">
                        Profiles defined for execution or currently deployed to the gateway network.
                    </p>

                    <div className="flex flex-col gap-3">
                        {savedProfiles.map((schedule, i) => (
                            <div key={i} className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] flex flex-col gap-2 transition-all hover:bg-[rgba(255,255,255,0.05)] cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <div className="font-bold text-white text-md">{schedule.name}</div>
                                    <div className={`status-badge ${schedule.status === 'Active' ? 'online' : 'offline'}`}>
                                        {schedule.status}
                                    </div>
                                </div>
                                <div className="text-sm text-[var(--color-text-muted)] flex justify-between mt-1">
                                    <span>{schedule.target}</span>
                                    <span>{schedule.items} states</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
