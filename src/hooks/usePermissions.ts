import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
export type { UserRole } from '../context/AuthContext';

export const usePermissions = () => {
    const { currentUser } = useAuth();
    const role = currentUser?.role || 'Viewer'; // Fallback role if logged out

    // Direct hardware interaction (Broadcast dimming, toggling)
    const canControlDevice = useCallback(() => {
        return role === 'Admin' || role === 'Supervisor' || role === 'Operator';
    }, [role]);

    // Project management, creating new users, editing roles
    const canManageProjects = useCallback(() => {
        return role === 'Admin';
    }, [role]);

    // Updating gateway configs, schedules, network params
    const canUpdateSettings = useCallback(() => {
        return role === 'Admin' || role === 'Supervisor';
    }, [role]);

    // Check if a user has access to view a specific project layout map
    const hasProjectAccess = useCallback((projectId: string, assignedProjectIds: string[]) => {
        if (role === 'Admin') return true;
        return assignedProjectIds.includes(projectId); // Assuming 'assignedProjectIds' comes from the entity checks
    }, [role]);

    // User management rules
    const canCreateUser = useCallback((targetRole: string) => {
        if (role === 'Admin') return true;
        if (role === 'Supervisor' && (targetRole === 'Operator' || targetRole === 'Viewer')) return true;
        return false;
    }, [role]);

    return {
        role,
        currentUser,
        canControlDevice,
        canManageProjects,
        canUpdateSettings,
        hasProjectAccess,
        canCreateUser
    };
};
