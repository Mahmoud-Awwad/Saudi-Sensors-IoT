import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type UserRole = 'Admin' | 'Supervisor' | 'Operator' | 'Viewer';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    projects: string[];
}

interface AuthContextType {
    currentUser: UserProfile | null;
    login: (email: string, pass: string) => Promise<boolean>;
    logout: () => void;
    changePassword: (oldPass: string, newPass: string) => Promise<boolean>;
}

// Initial Mocked user database for UI demonstration
const MOCK_DB: UserProfile[] = [
    { id: 'U-1', name: 'System Admin', email: 'admin@saudisensors.com', role: 'Admin', projects: ['All'] },
    { id: 'U-2', name: 'Riyadh Supervisor', email: 'riyadh@saudisensors.com', role: 'Supervisor', projects: ['Riyadh Central District'] },
    { id: 'U-3', name: 'Jeddah Sec Oper', email: 'jeddah@saudisensors.com', role: 'Operator', projects: ['Jeddah Coastal Hub'] },
    { id: 'U-4', name: 'Guest Viewer', email: 'guest@saudisensors.com', role: 'Viewer', projects: ['All'] },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Start as null so the Auth Guard correctly redirects unauthenticated users
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

    const login = async (email: string, _pass: string) => {
        // Mock API delay
        await new Promise(res => setTimeout(res, 800));

        // Mock validation: any password works for these emails
        const user = MOCK_DB.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
            setCurrentUser(user);
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const changePassword = async (_oldPass: string, _newPass: string) => {
        // Mock API delay
        await new Promise(res => setTimeout(res, 800));
        // In reality, validate oldPass. Here we just return true.
        return true;
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, changePassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
