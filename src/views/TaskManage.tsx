import React, { useState } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Calendar, UploadCloud, Clock, Plus } from 'lucide-react';

export const TaskManage: React.FC = () => {
    const { canUpdateSettings } = usePermissions();
    const [jsonPayload, setJsonPayload] = useState('[\n  {\n    "yearOfDay": 1,\n    "actions": [\n      {"actionHour": 18, "actionMinute": 0, "dimming": 100, "groupCode": 0},\n      {"actionHour": 23, "actionMinute": 0, "dimming": 60, "groupCode": 0},\n      {"actionHour": 6, "actionMinute": 0, "dimming": 0, "groupCode": 0}\n    ]\n  }\n]');

    const handleUpload = () => {
        if (!canUpdateSettings()) return alert("Permission Denied.");
        alert("Task schedule uploaded successfully to gateways.");
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Task Scheduling</h1>
                    <p className="text-[var(--color-text-muted)]">Upload autonomous dimming and loop tasks to concentrators.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                        <Calendar style={{ color: 'var(--color-primary)' }} /> Task Definitions
                    </h2>
                    <p className="text-sm text-[var(--color-text-muted)] mb-4">
                        Enter the JSON payload representing the autonomous tasks. Based on the <code>LoraMeshTaskVO</code> structure.
                    </p>

                    <textarea
                        value={jsonPayload}
                        onChange={(e) => setJsonPayload(e.target.value)}
                        className="w-full h-64 p-4 rounded-lg bg-[var(--color-bg-base)] text-[var(--color-primary)] font-mono text-sm border border-[var(--color-border)] focus:border-[var(--color-primary)] outline-none resize-none"
                        spellCheck={false}
                    />

                    <button className="btn-primary w-full mt-4 justify-center" onClick={handleUpload}>
                        <UploadCloud size={18} /> Upload to Concentrators
                    </button>
                </div>

                <div className="glass-panel p-5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                        <Clock style={{ color: 'var(--color-info)' }} /> Active Schedules
                    </h2>
                    <p className="text-sm text-[var(--color-text-muted)] mb-4">
                        Currently running loops and dimming tasks on the network.
                    </p>

                    <div className="flex flex-col gap-3">
                        {[
                            { name: 'Standard Evening Curve', target: 'All Nodes', status: 'Running', items: 3 },
                            { name: 'Highway Energy Save', target: 'Zone 2', status: 'Running', items: 5 },
                            { name: 'Ramadan Special', target: 'Zone 1', status: 'Inactive', items: 2 },
                        ].map((schedule, i) => (
                            <div key={i} className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-white">{schedule.name}</div>
                                    <div className="text-sm text-[var(--color-text-muted)]">Target: {schedule.target} • {schedule.items} states</div>
                                </div>
                                <div style={{ color: schedule.status === 'Running' ? 'var(--color-success)' : 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                    {schedule.status}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full btn-icon mt-4 border border-[var(--color-border)] hover:bg-[var(--color-bg-base)]" style={{ padding: '0.6rem', color: 'var(--color-text-main)' }}>
                        <Plus size={16} /> Create New Schedule
                    </button>
                </div>
            </div>
        </div>
    );
};
