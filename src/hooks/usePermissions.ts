import { useState, useCallback } from 'react';

export type UserRole = 'Super Admin' | 'Supervisor' | 'Operator';

export const usePermissions = () => {
    // Default to Super Admin for dev. Usually driven by auth context.
    const [role, setRole] = useState<UserRole>('Super Admin');

    // Direct hardware interaction (Broadcast dimming, toggling)
    const canControlDevice = useCallback(() => {
        return role === 'Super Admin' || role === 'Supervisor' || role === 'Operator';
    }, [role]);

    // Project management, creating new users, editing roles
    const canManageProjects = useCallback(() => {
        return role === 'Super Admin';
    }, [role]);

    // Updating gateway configs, schedules, network params
    const canUpdateSettings = useCallback(() => {
        return role === 'Super Admin' || role === 'Supervisor';
    }, [role]);

    // Check if a user has access to view a specific project layout map
    const hasProjectAccess = useCallback((projectId: string, assignedProjectIds: string[]) => {
        if (role === 'Super Admin') return true;
        return assignedProjectIds.includes(projectId);
    }, [role]);

    return {
        role,
        setRole,
        canControlDevice,
        canManageProjects,
        canUpdateSettings,
        hasProjectAccess
    };
};
