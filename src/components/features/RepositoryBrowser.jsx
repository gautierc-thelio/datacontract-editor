import { useEditorStore, getFileStorageBackend } from '../../store.js';
import { useShallow } from 'zustand/react/shallow';

const RepositoryBrowser = () => {
    const { repoFiles, setRepoFiles, activePath, setActivePath, loadFromFile } = useEditorStore(useShallow((state) => ({
        repoFiles: state.repoFiles,
        setRepoFiles: state.setRepoFiles,
        activePath: state.activePath,
        setActivePath: state.setActivePath,
        loadFromFile: state.loadFromFile
    })));

    const scanRepo = async () => {
        const backend = getFileStorageBackend();
        if (backend.scanDirectory) {
            const files = await backend.scanDirectory();
            setRepoFiles(files);
        } else if (backend.listFiles) {
            const files = await backend.listFiles();
            setRepoFiles(files);
        }
    };

    const openFile = async (file) => {
        if (file === activePath) return;
        const contracts = useEditorStore.getState().contracts;
        if (contracts[file]) {
            setActivePath(file);
        } else {
            await loadFromFile(file);
        }
    };

    return (
        <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-2 px-4">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Repository</h3>
                <button
                    onClick={scanRepo}
                    className="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold"
                >
                    SCAN
                </button>
            </div>
            <div className="space-y-1">
                {repoFiles.map(file => (
                    <button
                        key={file}
                        onClick={() => openFile(file)}
                        className={`w-full text-left px-4 py-1.5 text-xs truncate transition-colors ${
                            activePath === file ? 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {file}
                    </button>
                ))}
                {repoFiles.length === 0 && (
                    <p className="px-4 text-[10px] text-gray-400 italic">No files loaded</p>
                )}
            </div>
        </div>
    );
};

export default RepositoryBrowser;
