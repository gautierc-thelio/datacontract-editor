import { useMemo } from 'react';

const QualitySpreadsheet = ({ value, onChange, context = 'property' }) => {
    const rules = useMemo(() => Array.isArray(value) ? value : [], [value]);

    const handleCellChange = (index, field, newValue) => {
        const updatedRules = [...rules];
        updatedRules[index] = { ...updatedRules[index], [field]: newValue };
        onChange(updatedRules);
    };

    const addRule = () => {
        const newRule = { type: 'library', name: 'new_rule', dimension: 'accuracy' };
        onChange([...rules, newRule]);
    };

    const removeRule = (index) => {
        const updatedRules = rules.filter((_, i) => i !== index);
        onChange(updatedRules.length > 0 ? updatedRules : undefined);
    };

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden border border-gray-200 rounded-md">
            <div className="p-2 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <span className="text-[10px] font-bold uppercase text-gray-500">Quality Rules ({context})</span>
                <button
                    onClick={addRule}
                    className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded hover:bg-indigo-700"
                >
                    + Add Rule
                </button>
            </div>
            <div className="flex-1 overflow-auto font-mono">
                <table className="w-full border-collapse text-[10px]">
                    <thead className="sticky top-0 bg-gray-100 z-10 shadow-sm">
                        <tr>
                            <th className="p-1 border border-gray-200 text-left">Type</th>
                            <th className="p-1 border border-gray-200 text-left">Name</th>
                            <th className="p-1 border border-gray-200 text-left">Dimension</th>
                            <th className="p-1 border border-gray-200 text-left">Metric/Query</th>
                            <th className="p-1 border border-gray-200 text-left w-10">Del</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rules.map((rule, idx) => (
                            <tr key={idx} className="hover:bg-indigo-50/30">
                                <td className="p-0 border border-gray-200">
                                    <select
                                        className="w-full p-1 bg-transparent outline-none"
                                        value={rule.type || 'library'}
                                        onChange={(e) => handleCellChange(idx, 'type', e.target.value)}
                                    >
                                        <option value="library">library</option>
                                        <option value="sql">sql</option>
                                        <option value="text">text</option>
                                        <option value="custom">custom</option>
                                    </select>
                                </td>
                                <td className="p-0 border border-gray-200">
                                    <input
                                        type="text"
                                        className="w-full p-1 bg-transparent outline-none"
                                        value={rule.name || ''}
                                        onChange={(e) => handleCellChange(idx, 'name', e.target.value)}
                                    />
                                </td>
                                <td className="p-0 border border-gray-200">
                                    <input
                                        type="text"
                                        className="w-full p-1 bg-transparent outline-none"
                                        value={rule.dimension || ''}
                                        onChange={(e) => handleCellChange(idx, 'dimension', e.target.value)}
                                    />
                                </td>
                                <td className="p-0 border border-gray-200">
                                    <input
                                        type="text"
                                        className="w-full p-1 bg-transparent outline-none"
                                        value={rule.metric || rule.query || ''}
                                        onChange={(e) => handleCellChange(idx, rule.type === 'sql' ? 'query' : 'metric', e.target.value)}
                                    />
                                </td>
                                <td className="p-1 border border-gray-200 text-center">
                                    <button onClick={() => removeRule(idx)} className="text-red-400 hover:text-red-600">×</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default QualitySpreadsheet;
