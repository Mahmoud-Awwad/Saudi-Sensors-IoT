import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface Project {
    id: string;
    name: string;
    driveUid: string; // Reflecting the swagger parameter for concentrator ID
}

interface ProjectContextType {
    currentProject: Project | null;
    setCurrentProject: (project: Project | null) => void;
    projects: Project[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Mock initial projects based on district concept
    const [projects] = useState<Project[]>([
        { id: 'p1', name: 'Riyadh Central District', driveUid: '202212070011' },
        { id: 'p2', name: 'Jeddah Coastal Hub', driveUid: '202212070012' },
    ]);
    const [currentProject, setCurrentProject] = useState<Project | null>(projects[0]);

    return (
        <ProjectContext.Provider value={{ currentProject, setCurrentProject, projects }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};
