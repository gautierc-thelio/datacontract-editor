import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { ServerEditor, ServersSpreadsheet } from '../components/features/index.js';
import { useEditorStore } from '../store.js';

const Server = () => {
  const { serverId } = useParams();
  const serverIndex = parseInt(serverId, 10);
  const [viewMode, setViewMode] = useState('form');

  const servers = useEditorStore((state) => state.getValue('servers')) || [];
  const setValue = useEditorStore((state) => state.setValue);

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
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

      <div className="flex-1 overflow-y-auto">
        {viewMode === 'spreadsheet' ? (
          <div className="p-4 h-full">
            <ServersSpreadsheet
                value={servers}
                onChange={(val) => setValue('servers', val)}
            />
          </div>
        ) : (
          <ServerEditor serverIndex={serverIndex} />
        )}
      </div>
    </div>
  );
};

export default Server;
