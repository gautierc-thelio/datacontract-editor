import { useMemo } from 'react';
import { useEditorStore } from '../../store.js';
import { useShallow } from 'zustand/react/shallow';

const ChangesDiffView = () => {
    const { contracts } = useEditorStore(useShallow((state) => ({
        contracts: state.contracts
    })));

    const { yaml, baselineYaml, isDirty, activePath } = useEditorStore(useShallow((state) => ({
        yaml: state.yaml,
        baselineYaml: state.baselineYaml,
        isDirty: state.isDirty,
        activePath: state.activePath
    })));

    const modifiedFiles = Object.entries(contracts).filter(([path, data]) => data.isDirty && path !== activePath);

    // Add current active contract if dirty
    const allChanges = [...modifiedFiles];
    if (isDirty) {
        allChanges.push([activePath || 'unsaved_contract.yaml', {
            initialYaml: baselineYaml,
            currentYaml: yaml
        }]);
    }

    if (allChanges.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p>No changes detected.</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8">
            <h2 className="text-xl font-bold text-gray-900">Pending Changes</h2>
            {allChanges.map(([path, data]) => (
                <div key={path} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-gray-700">{path}</span>
                        <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Modified</span>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-gray-200">
                        <div className="p-4 bg-red-50/30 overflow-auto max-h-96">
                            <h4 className="text-[10px] font-bold text-red-700 uppercase mb-2">Original</h4>
                            <pre className="text-[10px] font-mono text-gray-600 leading-tight">
                                {data.initialYaml}
                            </pre>
                        </div>
                        <div className="p-4 bg-green-50/30 overflow-auto max-h-96">
                            <h4 className="text-[10px] font-bold text-green-700 uppercase mb-2">Current</h4>
                            <pre className="text-[10px] font-mono text-gray-600 leading-tight">
                                {data.currentYaml}
                            </pre>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ChangesDiffView;
