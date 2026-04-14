import { useMemo } from 'react';

const ServersSpreadsheet = ({ value, onChange }) => {
    const servers = useMemo(() => Array.isArray(value) ? value : [], [value]);

    const handleCellChange = (index, field, newValue) => {
        const updated = [...servers];
        updated[index] = { ...updated[index], [field]: newValue };
        onChange(updated);
    };

    const addServer = () => {
        const newServer = { server: 'prod', type: 'snowflake', host: 'account.snowflakecomputing.com' };
        onChange([...servers, newServer]);
    };

    const removeServer = (index) => {
        const updated = servers.filter((_, i) => i !== index);
        onChange(updated.length > 0 ? updated : undefined);
    };

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden border border-gray-200 rounded-md">
            <div className="p-2 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <span className="text-xs font-bold uppercase text-gray-500">Servers</span>
                <button
                    onClick={addServer}
                    className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded hover:bg-indigo-700"
                >
                    + Add Server
                </button>
            </div>
            <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse text-xs">
                    <thead className="sticky top-0 bg-gray-100 z-10 shadow-sm">
                        <tr>
                            <th className="p-2 border border-gray-200 text-left">Server ID</th>
                            <th className="p-2 border border-gray-200 text-left">Type</th>
                            <th className="p-2 border border-gray-200 text-left">Host</th>
                            <th className="p-2 border border-gray-200 text-left">Database/Env</th>
                            <th className="p-2 border border-gray-200 text-left w-10">Del</th>
                        </tr>
                    </thead>
                    <tbody>
                        {servers.map((server, idx) => (
                            <tr key={idx} className="hover:bg-indigo-50/30">
                                <td className="p-0 border border-gray-200">
                                    <input
                                        type="text"
                                        className="w-full p-2 bg-transparent outline-none font-bold"
                                        value={server.server || ''}
                                        onChange={(e) => handleCellChange(idx, 'server', e.target.value)}
                                    />
                                </td>
                                <td className="p-0 border border-gray-200">
                                    <input
                                        type="text"
                                        className="w-full p-2 bg-transparent outline-none"
                                        value={server.type || ''}
                                        onChange={(e) => handleCellChange(idx, 'type', e.target.value)}
                                    />
                                </td>
                                <td className="p-0 border border-gray-200">
                                    <input
                                        type="text"
                                        className="w-full p-2 bg-transparent outline-none"
                                        value={server.host || ''}
                                        onChange={(e) => handleCellChange(idx, 'host', e.target.value)}
                                    />
                                </td>
                                <td className="p-0 border border-gray-200">
                                    <input
                                        type="text"
                                        className="w-full p-2 bg-transparent outline-none"
                                        value={server.database || server.environment || ''}
                                        onChange={(e) => handleCellChange(idx, server.database ? 'database' : 'environment', e.target.value)}
                                    />
                                </td>
                                <td className="p-2 border border-gray-200 text-center">
                                    <button onClick={() => removeServer(idx)} className="text-red-400 hover:text-red-600">×</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ServersSpreadsheet;
