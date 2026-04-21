import { useState } from 'react';
import { useEditorStore } from '../../store.js';
import { useShallow } from 'zustand/react/shallow';

const GlobalSearchReplace = () => {
    const [search, setSearch] = useState('');
    const [replace, setReplace] = useState('');
    const { contracts, setYaml, activePath } = useEditorStore(useShallow((state) => ({
        contracts: state.contracts,
        setYaml: state.setYaml,
        activePath: state.activePath
    })));

    const handleReplaceAll = () => {
        if (!search) return;
        const confirm = window.confirm(`Replace all occurrences of "${search}" with "${replace}" in all loaded contracts?`);
        if (!confirm) return;

        Object.entries(contracts).forEach(([path, data]) => {
            const updated = data.currentYaml.replaceAll(search, replace);
            if (updated !== data.currentYaml) {
                if (path === activePath) {
                    setYaml(updated);
                } else {
                    useEditorStore.setState(state => ({
                        contracts: {
                            ...state.contracts,
                            [path]: { ...data, currentYaml: updated, isDirty: true }
                        }
                    }));
                }
            }
        });
    };

    return (
        <div className="mt-4 border-t border-gray-200 pt-4 px-4">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Mass Update</h3>
            <div className="space-y-2">
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                />
                <input
                    type="text"
                    placeholder="Replace with..."
                    value={replace}
                    onChange={(e) => setReplace(e.target.value)}
                    className="w-full p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                />
                <button
                    onClick={handleReplaceAll}
                    className="w-full py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded hover:bg-indigo-700 transition-colors"
                >
                    REPLACE ALL
                </button>
            </div>
        </div>
    );
};

export default GlobalSearchReplace;
