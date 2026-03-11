import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Lightbulb, Bell, Settings, Network, Users, Calendar, Menu, ChevronLeft, FileText } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (col: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
    const { role } = usePermissions();

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/map', icon: Map, label: 'Geo Monitor' },
        { to: '/lamps', icon: Lightbulb, label: 'Devices Hub' },
        { to: '/events', icon: Bell, label: 'Event Center' },
        { to: '/tasks', icon: Calendar, label: 'Schedules' },
        { to: '/gateways', icon: Network, label: 'Gateways' },
        { to: '/network', icon: Settings, label: 'Network' },
        { to: '/reports', icon: FileText, label: 'Reports' },
        { to: '/admin', icon: Users, label: 'Admin', requiresAdminOrSupervisor: true },
    ];

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <span className="brand-title">Smart City</span>
                    </div>
                )}
                <button className="btn-icon" onClick={() => setCollapsed(!collapsed)} title="Toggle Sidebar">
                    {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    if (item.requiresAdminOrSupervisor && role !== 'Admin' && role !== 'Supervisor') return null;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            <item.icon size={22} style={{ flexShrink: 0 }} />
                            {!collapsed && <span>{item.label}</span>}
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
};
