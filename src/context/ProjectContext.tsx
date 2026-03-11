import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface Project {
    id: string;
    name: string;
    driveUids: string[]; // Allowing multiple gateways per project
}

interface ProjectContextType {
    currentProject: Project | null;
    setCurrentProject: (project: Project | null) => void;
    currentGateway: string; // 'all' or specific driveUid
    setCurrentGateway: (gateway: string) => void;
    projects: Project[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Mock initial projects based on district concept
    const mockProjects: Project[] = [
        { id: 'p1', name: 'Riyadh Central District', driveUids: ['202212070011', '202212070013'] },
        { id: 'p2', name: 'Jeddah Coastal Hub', driveUids: ['202212070012', '202212070014'] },
    ];

    const allProjectsEntity: Project = {
        id: 'all',
        name: 'All Projects',
        driveUids: mockProjects.flatMap(p => p.driveUids)
    };

    const [projects] = useState<Project[]>([allProjectsEntity, ...mockProjects]);
    const [currentProject, setCurrentProject] = useState<Project | null>(projects[0]);
    const [currentGateway, setCurrentGateway] = useState<string>('all');

    // Reset gateway to 'all' whenever the project changes
    const handleSetProject = (project: Project | null) => {
        setCurrentProject(project);
        setCurrentGateway('all');
    };

    return (
        <ProjectContext.Provider value={{
            currentProject,
            setCurrentProject: handleSetProject,
            currentGateway,
            setCurrentGateway,
            projects
        }}>
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
