import React, { useState, useMemo } from 'react';
import {
    Folder,
    MapPin,
    Network,
    Power,
    Lightbulb,
    Plus,
    ChevronRight,
    ChevronDown,
    Upload,
    Save,
    Trash2,
    Server
} from 'lucide-react';

export type EntityType = 'Project' | 'District' | 'Gateway' | 'Pole' | 'Node';

export interface InfraEntity {
    id: string;
    type: EntityType;
    name: string;
    parentId: string | null;
}

const initialData: InfraEntity[] = [
    { id: 'proj-1', type: 'Project', name: 'Riyadh Central District', parentId: null },
    { id: 'dist-1', type: 'District', name: 'Downtown Sector A', parentId: 'proj-1' },
    { id: 'gw-1', type: 'Gateway', name: 'GW-Alpha-01', parentId: 'dist-1' },
    { id: 'pole-1', type: 'Pole', name: 'Pole-MainSt-001', parentId: 'gw-1' },
    { id: 'node-1', type: 'Node', name: 'Lamp Node 1', parentId: 'pole-1' },
    { id: 'node-2', type: 'Node', name: 'Lamp Node 2', parentId: 'pole-1' },
];

const typeOrder = ['Project', 'District', 'Gateway', 'Pole', 'Node'];
const typeIcons = {
    Project: <Folder size={16} className="text-blue-400" />,
    District: <MapPin size={16} className="text-indigo-400" />,
    Gateway: <Network size={16} className="text-purple-400" />,
    Pole: <Power size={16} className="text-gray-400" />,
    Node: <Lightbulb size={16} className="text-yellow-400" />
};

export const AdminInfrastructure: React.FC = () => {
    const [entities, setEntities] = useState<InfraEntity[]>(initialData);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'proj-1': true, 'dist-1': true, 'gw-1': true, 'pole-1': true });
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
    const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleBatchUpload = () => {
        setIsSimulatingUpload(true);
        setTimeout(() => {
            alert("CSV successfully parsed. 1 Project, 3 Districts, 12 Gateways, and 450 Nodes ingested.");
            setIsSimulatingUpload(false);
        }, 1500);
    };

    const getChildren = (parentId: string | null) => entities.filter(e => e.parentId === parentId);

    const handleAddChild = (parent: InfraEntity | null) => {
        let newType: EntityType = 'Project';
        if (parent) {
            const idx = typeOrder.indexOf(parent.type);
            if (idx >= typeOrder.length - 1) {
                alert("Cannot add children to a Node.");
                return;
            }
            if (parent.type === 'Pole' && getChildren(parent.id).length >= 12) {
                alert("Maximum 12 nodes allowed per Pole.");
                return;
            }
            newType = typeOrder[idx + 1] as EntityType;
        }

        const newId = `${newType.toLowerCase()}-${Date.now()}`;
        const newEntity: InfraEntity = {
            id: newId,
            type: newType,
            name: `New ${newType}`,
            parentId: parent ? parent.id : null
        };

        setEntities([...entities, newEntity]);
        if (parent) {
            setExpanded(prev => ({ ...prev, [parent.id]: true }));
        }
        setSelectedEntityId(newId);
    };

    const handleDelete = (id: string) => {
        // Recursive delete
        const idsToDelete = new Set<string>();
        const queue = [id];
        while (queue.length > 0) {
            const curr = queue.shift()!;
            idsToDelete.add(curr);
            const children = entities.filter(e => e.parentId === curr);
            queue.push(...children.map(c => c.id));
        }

        if (confirm(`Are you sure you want to delete this ${entities.find(e => e.id === id)?.type} and all ${idsToDelete.size - 1} nested sub-components?`)) {
            setEntities(entities.filter(e => !idsToDelete.has(e.id)));
            if (idsToDelete.has(selectedEntityId!)) setSelectedEntityId(null);
        }
    };

    const updateEntityName = (id: string, newName: string) => {
        setEntities(entities.map(e => e.id === id ? { ...e, name: newName } : e));
    };

    // Bottom-Up Assignment (Changing Parent map)
    const updateEntityParent = (id: string, newParentId: string | null) => {
        setEntities(entities.map(e => e.id === id ? { ...e, parentId: newParentId } : e));
    };

    const buildTree = (parentId: string | null, level: number = 0) => {
        const children = getChildren(parentId);
        if (children.length === 0) return null;

        return (
            <div className="flex flex-col gap-1 w-full" style={{ paddingLeft: level === 0 ? '0' : '1.5rem' }}>
                {children.map(child => {
                    const hasChildren = getChildren(child.id).length > 0;
                    const isExpanded = expanded[child.id];
                    const isSelected = selectedEntityId === child.id;

                    return (
                        <div key={child.id} className="flex flex-col">
                            <div
                                className={`flex items-center justify-between p-2 rounded cursor-pointer group ${isSelected ? 'bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30' : 'hover:bg-[rgba(255,255,255,0.02)]'}`}
                                onClick={() => setSelectedEntityId(child.id)}
                            >
                                <div className="flex items-center gap-2">
                                    <button
                                        className="p-1 text-gray-400 hover:text-white rounded"
                                        onClick={(e) => { e.stopPropagation(); toggleExpand(child.id); }}
                                    >
                                        {hasChildren ? (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span className="w-3" />}
                                    </button>
                                    <div className="flex items-center gap-2 text-sm text-gray-200">
                                        {typeIcons[child.type]}
                                        <span className={isSelected ? 'text-white font-semibold' : ''}>{child.name}</span>
                                    </div>
                                </div>
                                <button
                                    className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-[var(--color-primary)] transition-opacity"
                                    onClick={(e) => { e.stopPropagation(); handleAddChild(child); }}
                                    title={`Add sub-component underneath ${child.name}`}
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                            {isExpanded && buildTree(child.id, level + 1)}
                        </div>
                    );
                })}
            </div>
        );
    };

    const selectedEntity = useMemo(() => entities.find(e => e.id === selectedEntityId), [entities, selectedEntityId]);

    // Derive valid parents for bottom-up reassignment
    const validParentsForSelected = useMemo(() => {
        if (!selectedEntity || selectedEntity.type === 'Project') return [];
        const parentTypeIdx = typeOrder.indexOf(selectedEntity.type) - 1;
        const targetParentType = typeOrder[parentTypeIdx];
        return entities.filter(e => e.type === targetParentType);
    }, [entities, selectedEntity]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
            {/* Left: Tree View */}
            <div className="glass-panel col-span-1 lg:col-span-1 flex flex-col h-full border-[var(--color-border)]">
                <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[rgba(255,255,255,0.02)]">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Server size={18} className="text-[var(--color-primary)]" /> Network Tree
                    </h3>
                    <div className="flex gap-2">
                        <button className="btn-icon text-gray-400 hover:text-white" onClick={() => handleAddChild(null)} title="New Root Project">
                            <Plus size={18} />
                        </button>
                    </div>
                </div>
                <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                    {buildTree(null)}
                </div>
                <div className="p-4 border-t border-[var(--color-border)]">
                    <button
                        className="w-full btn-secondary flex justify-center gap-2 items-center text-sm py-2"
                        onClick={handleBatchUpload}
                        disabled={isSimulatingUpload}
                    >
                        {isSimulatingUpload ? <span className="animate-spin">◷</span> : <Upload size={16} />}
                        {isSimulatingUpload ? 'Parsing CSV...' : 'Batch Upload CSV'}
                    </button>
                </div>
            </div>

            {/* Right: Configuration Editor */}
            <div className="glass-panel col-span-1 lg:col-span-2 h-full flex flex-col bg-[rgba(10,15,26,0.5)]">
                {selectedEntity ? (
                    <div className="p-6 flex flex-col h-full animate-fade-in">
                        <div className="flex justify-between items-start mb-6 border-b border-[rgba(255,255,255,0.05)] pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center">
                                    {typeIcons[selectedEntity.type]}
                                </div>
                                <div>
                                    <div className="text-xs text-[var(--color-primary)] font-bold tracking-widest uppercase mb-1">{selectedEntity.type} CONFIGURATION</div>
                                    <h2 className="text-2xl font-bold text-white">{selectedEntity.name}</h2>
                                    <div className="text-xs text-gray-500 font-mono mt-1">ID: {selectedEntity.id}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="btn-secondary text-sm flex gap-2"><Save size={14} /> Save Changes</button>
                                <button
                                    className="btn-icon text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                    onClick={() => handleDelete(selectedEntity.id)}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Display Name</label>
                                    <input
                                        type="text"
                                        value={selectedEntity.name}
                                        onChange={e => updateEntityName(selectedEntity.id, e.target.value)}
                                        className="w-full bg-[#111827] border border-gray-700 rounded-lg p-3 text-white focus:border-[var(--color-primary)] outline-none"
                                    />
                                </div>

                                {/* Flexible Bottom-up Assignment */}
                                {selectedEntity.type !== 'Project' && (
                                    <div className="col-span-2 p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg">
                                        <label className="block text-sm font-medium text-[var(--color-primary)] mb-2 flex items-center gap-2">
                                            Parent Assignment (Bottom-Up Links)
                                        </label>
                                        <p className="text-xs text-gray-400 mb-3">Reassign this {selectedEntity.type} to a different {typeOrder[typeOrder.indexOf(selectedEntity.type) - 1]}.</p>
                                        <select
                                            value={selectedEntity.parentId || ''}
                                            onChange={e => updateEntityParent(selectedEntity.id, e.target.value)}
                                            className="w-full bg-[#111827] border border-gray-700 rounded-lg p-3 text-white focus:border-[var(--color-primary)] outline-none"
                                        >
                                            <option value="" disabled className="bg-[#1f2937] text-gray-500">Select parent...</option>
                                            {validParentsForSelected.map(p => (
                                                <option key={p.id} value={p.id} className="bg-[#1f2937] text-white">{p.name} (ID: {p.id})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Specific Fields mock based on type */}
                                {selectedEntity.type === 'Gateway' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Device UID</label>
                                            <input type="text" placeholder="GW-UID-2023-A" className="w-full bg-[#111827] border border-gray-700 rounded-lg p-3 text-white focus:border-[var(--color-primary)] outline-none font-mono" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">IP Address / APN</label>
                                            <input type="text" placeholder="10.0.0.12" className="w-full bg-[#111827] border border-gray-700 rounded-lg p-3 text-white focus:border-[var(--color-primary)] outline-none" />
                                        </div>
                                    </>
                                )}

                                {selectedEntity.type === 'Node' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Device UID</label>
                                            <input type="text" placeholder="LMP-UID-99X" className="w-full bg-[#111827] border border-gray-700 rounded-lg p-3 text-white focus:border-[var(--color-primary)] outline-none font-mono" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Hardware Address (1-12)</label>
                                            <input type="number" min="1" max="12" placeholder="1" className="w-full bg-[#111827] border border-gray-700 rounded-lg p-3 text-white focus:border-[var(--color-primary)] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Device Component</label>
                                            <select className="w-full bg-[#111827] border border-gray-700 rounded-lg p-3 text-white focus:border-[var(--color-primary)] outline-none">
                                                <option className="bg-[#1f2937] text-white">LED Streetlight</option>
                                                <option className="bg-[#1f2937] text-white">Motion Sensor</option>
                                                <option className="bg-[#1f2937] text-white">Camera Box</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                {selectedEntity.type === 'Pole' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Latitude Coordinates</label>
                                            <input type="text" placeholder="24.7136" className="w-full bg-[#111827] border border-gray-700 rounded-lg p-3 text-white focus:border-[var(--color-primary)] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Longitude Coordinates</label>
                                            <input type="text" placeholder="46.6753" className="w-full bg-[#111827] border border-gray-700 rounded-lg p-3 text-white focus:border-[var(--color-primary)] outline-none" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-12 text-center h-full">
                        <Network size={64} className="mb-4 opacity-20" />
                        <h3 className="text-xl font-bold text-white mb-2">No Component Selected</h3>
                        <p className="max-w-md">Select an item from the network tree on the left to edit its configuration, assign it to a different parent, or delete it.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
