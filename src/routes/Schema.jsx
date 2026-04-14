import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { SchemaEditor, SchemaSpreadsheet } from '../components/features/index.js';

const Schema = () => {
  const { schemaId } = useParams();
  const schemaIndex = parseInt(schemaId, 10);
  const [viewMode, setViewMode] = useState('form'); // 'form' or 'spreadsheet'

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end p-2 bg-gray-50 border-b border-gray-200 gap-2">
        <button
          onClick={() => setViewMode('form')}
          className={`px-3 py-1 text-[10px] font-bold rounded shadow-sm border ${viewMode === 'form' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300'}`}
        >
          FORM
        </button>
        <button
          onClick={() => setViewMode('spreadsheet')}
          className={`px-3 py-1 text-[10px] font-bold rounded shadow-sm border ${viewMode === 'spreadsheet' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300'}`}
        >
          SPREADSHEET
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {viewMode === 'form' ? (
          <SchemaEditor schemaIndex={schemaIndex} />
        ) : (
          <SchemaSpreadsheet schemaIndex={schemaIndex} />
        )}
      </div>
    </div>
  );
};

export default Schema;