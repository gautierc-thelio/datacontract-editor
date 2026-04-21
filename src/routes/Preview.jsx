import { PreviewErrorBoundary } from '../components/error/index.js';
import { DataContractPreview } from '../components/features/index.js';
import { useNavigate } from 'react-router-dom';

const Preview = () => {
    const navigate = useNavigate();

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900">Data Contract Preview</h1>
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Back to Editor
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto">
                    <PreviewErrorBoundary>
                        <DataContractPreview />
                    </PreviewErrorBoundary>
                </div>
            </div>
        </div>
    );
};

export default Preview;
