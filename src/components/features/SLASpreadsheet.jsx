import { useMemo } from 'react';

const SLASpreadsheet = ({ value, onChange }) => {
    const slas = useMemo(() => Array.isArray(value) ? value : [], [value]);

    const handleCellChange = (index, field, newValue) => {
        const updated = [...slas];
        updated[index] = { ...updated[index], [field]: newValue };
        onChange(updated);
    };

    const addSLA = () => {
        const newSla = { property: 'latency', value: '100', unit: 'ms' };
        onChange([...slas, newSla]);
    };

    const removeSLA = (index) => {
        const updated = slas.filter((_, i) => i !== index);
        onChange(updated.length > 0 ? updated : undefined);
    };

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden border border-gray-200 rounded-md">
            <div className="p-2 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <span className="text-xs font-bold uppercase text-gray-500">Service Level Agreements</span>
                <button
                    onClick={addSLA}
                    className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded hover:bg-indigo-700"
                >
                    + Add SLA
                </button>
            </div>
            <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse text-xs">
                    <thead className="sticky top-0 bg-gray-100 z-10 shadow-sm">
                        <tr>
                            <th className="p-2 border border-gray-200 text-left">Property</th>
                            <th className="p-2 border border-gray-200 text-left">Value</th>
                            <th className="p-2 border border-gray-200 text-left">Unit</th>
                            <th className="p-2 border border-gray-200 text-left">Element</th>
                            <th className="p-2 border border-gray-200 text-left w-10">Del</th>
                        </tr>
                    </thead>
                    <tbody>
                        {slas.map((sla, idx) => (
                            <tr key={idx} className="hover:bg-indigo-50/30">
                                <td className="p-0 border border-gray-200">
                                    <input
                                        type="text"
                                        className="w-full p-2 bg-transparent outline-none"
                                        value={sla.property || ''}
                                        onChange={(e) => handleCellChange(idx, 'property', e.target.value)}
                                    />
                                </td>
                                <td className="p-0 border border-gray-200">
                                    <input
                                        type="text"
                                        className="w-full p-2 bg-transparent outline-none"
                                        value={sla.value || ''}
                                        onChange={(e) => handleCellChange(idx, 'value', e.target.value)}
                                    />
                                </td>
                                <td className="p-0 border border-gray-200">
                                    <input
                                        type="text"
                                        className="w-full p-2 bg-transparent outline-none"
                                        value={sla.unit || ''}
                                        onChange={(e) => handleCellChange(idx, 'unit', e.target.value)}
                                    />
                                </td>
                                <td className="p-0 border border-gray-200">
                                    <input
                                        type="text"
                                        className="w-full p-2 bg-transparent outline-none"
                                        value={sla.element || ''}
                                        onChange={(e) => handleCellChange(idx, 'element', e.target.value)}
                                    />
                                </td>
                                <td className="p-2 border border-gray-200 text-center">
                                    <button onClick={() => removeSLA(idx)} className="text-red-400 hover:text-red-600">×</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SLASpreadsheet;
