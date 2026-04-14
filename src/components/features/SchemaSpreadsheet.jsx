import { useMemo, useState, useCallback } from 'react';
import { useEditorStore } from '../../store.js';
import QuestionMarkCircleIcon from '../ui/icons/QuestionMarkCircleIcon.jsx';
import { Tooltip } from '../ui/index.js';
import { useSchemaOperations } from './schema/useSchemaOperations.js';
import QualitySpreadsheet from './QualitySpreadsheet.jsx';

const SchemaSpreadsheet = ({ schemaIndex }) => {
    const { schema, setValue, updateProperty, removeProperty } = useSchemaOperations(schemaIndex);
    const properties = useMemo(() => schema?.[schemaIndex]?.properties || [], [schema, schemaIndex]);

    const handleCellChange = (rowIdx, colKey, value) => {
        const prop = { ...properties[rowIdx] };
        prop[colKey] = value;
        updateProperty(schemaIndex, rowIdx, prop);
    };

    const handleKeyDown = (e, rowIdx, colKey) => {
        const input = e.target;
        if (e.key === 'ArrowDown') {
            const next = input.closest('tr').nextElementSibling?.querySelector(`[data-col="${colKey}"]`);
            next?.focus();
        } else if (e.key === 'ArrowUp') {
            const prev = input.closest('tr').previousElementSibling?.querySelector(`[data-col="${colKey}"]`);
            prev?.focus();
        } else if (e.key === 'Enter') {
            addRow();
            setTimeout(() => {
                const lastRow = input.closest('tbody').lastElementChild;
                lastRow.querySelector(`[data-col="${colKey}"]`)?.focus();
            }, 0);
        }
    };

    const deleteRow = (rowIdx) => {
        if (window.confirm('Delete this property?')) {
            removeProperty(schemaIndex, rowIdx);
        }
    };

    const addRow = () => {
        const newProp = { name: 'new_field', type: 'string', description: '' };
        setValue(`schema[${schemaIndex}].properties`, [...properties, newProp]);
    };

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase">Schema: {schema?.[schemaIndex]?.name || 'Untitled'}</h3>
                    <p className="text-[10px] text-gray-500">Spreadsheet View</p>
                </div>
                <button
                    onClick={addRow}
                    className="inline-flex items-center px-2 py-1 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700"
                >
                    + Add Field
                </button>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse text-xs">
                    <thead className="sticky top-0 bg-gray-100 z-10 shadow-sm">
                        <tr>
                            <th className="p-2 border border-gray-200 text-left w-10">#</th>
                            <th className="p-2 border border-gray-200 text-left">Name</th>
                            <th className="p-2 border border-gray-200 text-left w-32">Type</th>
                            <th className="p-2 border border-gray-200 text-left">Description</th>
                            <th className="p-2 border border-gray-200 text-left w-64">Quality Rules</th>
                            <th className="p-2 border border-gray-200 text-left w-20">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {properties.map((prop, rowIdx) => (
                            <tr key={rowIdx} className="hover:bg-indigo-50/30 transition-colors">
                                <td className="p-2 border border-gray-200 text-gray-400 font-mono text-[10px]">{rowIdx + 1}</td>
                                <td className="p-0 border border-gray-200">
                                    <input
                                        type="text"
                                        data-col="name"
                                        className="w-full p-2 bg-transparent focus:bg-white focus:ring-1 focus:ring-inset focus:ring-indigo-600 outline-none"
                                        value={prop.name || ''}
                                        onChange={(e) => handleCellChange(rowIdx, 'name', e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, rowIdx, 'name')}
                                    />
                                </td>
                                <td className="p-0 border border-gray-200">
                                    <select
                                        data-col="type"
                                        className="w-full p-2 bg-transparent focus:bg-white focus:ring-1 focus:ring-inset focus:ring-indigo-600 outline-none appearance-none"
                                        value={prop.type || 'string'}
                                        onChange={(e) => handleCellChange(rowIdx, 'type', e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, rowIdx, 'type')}
                                    >
                                        <option value="string">string</option>
                                        <option value="integer">integer</option>
                                        <option value="number">number</option>
                                        <option value="boolean">boolean</option>
                                        <option value="object">object</option>
                                        <option value="array">array</option>
                                        <option value="timestamp">timestamp</option>
                                        <option value="date">date</option>
                                    </select>
                                </td>
                                <td className="p-0 border border-gray-200">
                                    <input
                                        type="text"
                                        data-col="description"
                                        className="w-full p-2 bg-transparent focus:bg-white focus:ring-1 focus:ring-inset focus:ring-indigo-600 outline-none"
                                        value={prop.description || ''}
                                        onChange={(e) => handleCellChange(rowIdx, 'description', e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, rowIdx, 'description')}
                                    />
                                </td>
                                <td className="p-1 border border-gray-200 h-24">
                                    <QualitySpreadsheet
                                        value={prop.quality}
                                        onChange={(val) => handleCellChange(rowIdx, 'quality', val)}
                                        context="property"
                                    />
                                </td>
                                <td className="p-2 border border-gray-200 text-center">
                                    <button
                                        onClick={() => deleteRow(rowIdx)}
                                        className="text-red-400 hover:text-red-600 p-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {properties.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-gray-400 text-sm">No properties defined.</p>
                        <button onClick={addRow} className="mt-2 text-indigo-600 font-bold hover:underline">Add first field</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SchemaSpreadsheet;
