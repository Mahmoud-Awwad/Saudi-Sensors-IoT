import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';

import { Dashboard } from './views/Dashboard';
import { MapMonitor } from './views/MapMonitor';
import { DevicesHub } from './views/DevicesHub';
import { EventCenter } from './views/EventCenter';
import { GatewayManage } from './views/GatewayManage';
import { TaskManage } from './views/TaskManage';
import { NetworkManage } from './views/NetworkManage';
import { AdminPanel } from './views/AdminPanel';
import { Login } from './views/Login';
import { Reports } from './views/Reports';

const ProtectedRoute = () => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="map" element={<MapMonitor />} />
                <Route path="lamps" element={<DevicesHub />} />
                <Route path="events" element={<EventCenter />} />
                <Route path="tasks" element={<TaskManage />} />
                <Route path="gateways" element={<GatewayManage />} />
                <Route path="network" element={<NetworkManage />} />
                <Route path="reports" element={<Reports />} />
                <Route path="admin" element={<AdminPanel />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>

            </Route>
          </Routes>
        </BrowserRouter>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
