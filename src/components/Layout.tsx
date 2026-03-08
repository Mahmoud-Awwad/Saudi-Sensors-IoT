import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const Layout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="app-layout">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className={`main-content ${collapsed ? 'expanded' : ''}`}>
                <Topbar />
                <main className="page-container">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
