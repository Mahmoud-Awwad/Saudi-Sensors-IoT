import React from 'react';
import { useProject } from '../context/ProjectContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import './Dashboard.css';

const powerData = [
    { time: '00:00', kw: 400 },
    { time: '04:00', kw: 300 },
    { time: '08:00', kw: 200 },
    { time: '12:00', kw: 200 },
    { time: '16:00', kw: 250 },
    { time: '20:00', kw: 600 },
    { time: '24:00', kw: 450 },
];

const efficiencyData = [
    { name: 'Efficient', value: 85 },
    { name: 'Loss', value: 15 },
];
const COLORS = ['#92de8b', '#ef4444'];

export const Dashboard: React.FC = () => {
    const { currentProject, currentGateway } = useProject();

    // Dynamically adjust mock metrics based on context depth
    const isAllProjects = currentProject?.id === 'all';
    const isSingleGateway = currentGateway !== 'all';

    let totalEnergy = '1,240 kWh';
    let activeNodes = '342 / 350';
    let alertsCount = '3';
    let healthStatus = '98%';

    if (isAllProjects) {
        totalEnergy = '2,480 kWh';
        activeNodes = '684 / 700';
        alertsCount = '7';
    } else if (isSingleGateway) {
        totalEnergy = '310 kWh';
        activeNodes = '85 / 85';
        alertsCount = '0';
        healthStatus = '100%';
    }

    const metrics = [
        { label: 'Total Energy', value: totalEnergy, icon: Zap, color: 'var(--color-primary)' },
        { label: 'Active Nodes', value: activeNodes, icon: CheckCircle2, color: 'var(--color-success)' },
        { label: 'Alerts', value: alertsCount, icon: AlertTriangle, color: 'var(--color-warning)' },
        { label: 'Network Health', value: healthStatus, icon: Activity, color: 'var(--color-info)' },
    ];

    return (
        <div>
            <div className="dashboard-header">
                <h1 className="dashboard-title">System Overview</h1>
                <p className="dashboard-subtitle">
                    Live analytics for {currentProject?.name}
                    {currentGateway !== 'all' ? ` > Gateway ${currentGateway}` : ''}
                </p>
            </div>

            <div className="metrics-grid">
                {metrics.map((stat, i) => (
                    <div key={i} className="glass-panel metric-card">
                        <div className="metric-icon-wrap" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <div className="metric-label">{stat.label}</div>
                            <div className="metric-value">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="charts-grid">
                <div className="glass-panel chart-panel">
                    <h2 className="panel-title">Power Consumption (24h)</h2>
                    <div style={{ height: '250px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={powerData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="time" stroke="var(--color-text-muted)" fontSize={12} />
                                <YAxis stroke="var(--color-text-muted)" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--color-primary)' }}
                                />
                                <Line type="monotone" dataKey="kw" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-bg-surface)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel chart-panel gauge-container">
                    <h2 className="panel-title" style={{ width: '100%' }}>Efficiency Gauge</h2>
                    <div style={{ height: '200px', width: '100%', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={efficiencyData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    startAngle={180}
                                    endAngle={0}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {efficiencyData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="gauge-overlay">
                            <span className="gauge-value">85%</span>
                            <span className="gauge-label">Optimal</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-panel chart-panel">
                <h2 className="panel-title">Pending Maintenance Tasks</h2>
                <div className="task-list">
                    {[
                        { id: 'TSK-001', desc: 'Recalibrate gateway sector 4', status: 'Pending', time: 'Today, 14:00' },
                        { id: 'TSK-002', desc: 'Inspect tilted pole at King Fahd Rd', status: 'Overdue', time: 'Yesterday' },
                    ].map(task => (
                        <div key={task.id} className="task-item">
                            <div>
                                <div className="task-desc">{task.desc}</div>
                                <div className="task-meta">{task.id} • {task.time}</div>
                            </div>
                            <span className={`status-badge ${task.status.toLowerCase()}`}>
                                {task.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
