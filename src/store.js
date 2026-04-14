import {create} from 'zustand'
import {devtools, persist} from 'zustand/middleware'
import {LocalFileStorageBackend} from './services/LocalFileStorageBackend.js'
import * as Yaml from "yaml";
import { stringifyYaml, setYamlFormatConfig, parseYaml } from './utils/yaml.js';
import { DEFAULT_AI_CONFIG, DEFAULT_TESTS_CONFIG } from './config/defaults.js';
import { getStorageConfig } from './utils/persistence.js';
import { isSafeKey } from './utils/safeProperty.js';

// Storage backend instance
let fileStorageBackend = new LocalFileStorageBackend();

export const initialYaml = 'apiVersion: "v3.1.0"\nkind: "DataContract"\nid: "example-id"\nversion: "0.0.1"\nstatus: "draft"\nname: "Example Data Contract"\n';

export const setFileStorageBackend = (backend) => {
	fileStorageBackend = backend;
};

export const getFileStorageBackend = () => {
	return fileStorageBackend;
};

let overrideStore = null;

export const setOverrideStore = (store) => {
	overrideStore = store;
};

export const getOverrideStore = () => {
	return overrideStore;
};

export function getValueWithPath(obj, path, defaultValue) {
	const keys = path?.split(/\.|\[|\]/).filter(Boolean);
	if (keys?.some((k) => !isSafeKey(k))) return defaultValue;
	const result = keys?.reduce((acc, key) => acc?.[key], obj);
	return result !== undefined ? result : defaultValue;
}

export function setValueWithPath(obj, path, value) {
	const newObj = JSON.parse(JSON.stringify(obj || {}));
	const keys = path.match(/[^.[\]]+/g);
	if (keys?.some((k) => !isSafeKey(k))) return newObj;
	keys.slice(0, -1).reduce((acc, key, i) =>
		acc[key] = acc[key] || (/^\d+$/.test(keys[i + 1]) ? [] : {}), newObj
	)[keys[keys.length - 1]] = value;
	return newObj;
}

export function extractParseErrorMessage(e) {
	try {
		if (e?.message) return String(e.message);
	} catch {
		// ignore
	}
	return 'Unknown YAML parse error';
}

export function extractParseErrorPos(e) {
	try {
		const pos = e?.linePos?.[0];
		if (pos && typeof pos.line === 'number') {
			return { line: pos.line, col: typeof pos.col === 'number' ? pos.col : 1 };
		}
	} catch {
		// ignore
	}
	return null;
}

export function defaultStoreConfig(set, get) {
	const actions = {
		setYaml: (newYaml) => {
			const { activePath, contracts } = get();
			try {
				const yamlParts = Yaml.parse(newYaml);
				const updatedContracts = { ...contracts };
				if (activePath) {
					updatedContracts[activePath] = {
						...updatedContracts[activePath],
						currentYaml: newYaml,
						yamlParts,
						isDirty: newYaml !== updatedContracts[activePath]?.initialYaml
					};
				}
				set({
					yaml: newYaml,
					yamlParts,
					yamlParseError: null,
					yamlParseErrorPos: null,
					contracts: updatedContracts
				});
			} catch(e) {
				set({
					yaml: newYaml,
					yamlParseError: extractParseErrorMessage(e),
					yamlParseErrorPos: extractParseErrorPos(e)
				});
			}
		},
		loadYaml: (newYaml, path = 'default.yaml') => {
			try {
				const yamlParts = Yaml.parse(newYaml);
				const updatedContracts = { ...get().contracts };
				updatedContracts[path] = {
					initialYaml: newYaml,
					currentYaml: newYaml,
					yamlParts,
					isDirty: false
				};
				set({
					yaml: newYaml,
					baselineYaml: newYaml,
					yamlParts,
					yamlParseError: null,
					yamlParseErrorPos: null,
					activePath: path,
					contracts: updatedContracts
				});
			} catch(e) {
				// ignore
			}
		},
		setActivePath: (path) => {
			const { contracts } = get();
			const contract = contracts[path];
			if (contract) {
				set({
					activePath: path,
					yaml: contract.currentYaml,
					yamlParts: contract.yamlParts,
					baselineYaml: contract.initialYaml
				});
			}
		},
		setRepoFiles: (files) => set({ repoFiles: files }),
		getValue: (path) => getValueWithPath(get().yamlParts, path),
		setValue: (path, value) => {
			const { yamlParts, activePath, contracts } = get();
			const newYamlParts = setValueWithPath(yamlParts, path, value);
			const newYaml = stringifyYaml(newYamlParts);

			const updatedContracts = { ...contracts };
			if (activePath) {
				updatedContracts[activePath] = {
					...updatedContracts[activePath],
					currentYaml: newYaml,
					yamlParts: newYamlParts,
					isDirty: newYaml !== updatedContracts[activePath]?.initialYaml
				};
			}

			set({
				yamlParts: newYamlParts,
				yaml: newYaml,
				contracts: updatedContracts
			})
		},
		addNotification: (notification) => {
			const id = Date.now() + Math.random();
			const newNotification = { id, type: 'info', duration: 3000, ...notification };
			set((state) => ({ notifications: [...state.notifications, newNotification] }));
			if (newNotification.duration > 0) {
				setTimeout(() => {
					set((state) => ({ notifications: state.notifications.filter(n => n.id !== id) }));
				}, newNotification.duration);
			}
			return id;
		},
		removeNotification: (id) => set((state) => ({ notifications: state.notifications.filter(n => n.id !== id) })),
		toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
		closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
		setView: (view) => set({currentView: view}),
		setSelectedDiagramSchemaIndex: (index) => set({selectedDiagramSchemaIndex: index}),
		setSchemaInfo: (schemaUrl, schemaData) => set({schemaUrl, schemaData}),
		loadFromFile: async (filename = null) => {
			const yamlContent = await fileStorageBackend.loadYamlFile(filename);
			get().loadYaml(yamlContent, filename || 'local-file.yaml');
			return yamlContent;
		},
		saveToFile: async (suggestedName) => {
			const {yaml, activePath} = get();
			const result = await fileStorageBackend.saveYamlFile(yaml, suggestedName || activePath, activePath);
			const updatedContracts = { ...get().contracts };
			if (activePath) {
				updatedContracts[activePath] = { ...updatedContracts[activePath], initialYaml: yaml, isDirty: false };
			}
			set({ baselineYaml: yaml, contracts: updatedContracts });
			get().addNotification({ type: 'success', title: 'Saved successfully', duration: 3000 });
		},
		setMarkers: (markers) => set({ markers }),
		togglePreview: () => set((state) => ({ isPreviewVisible: !state.isPreviewVisible, isWarningsVisible: false, isTestResultsVisible: false })),
		toggleWarnings: () => set((state) => ({ isWarningsVisible: !state.isWarningsVisible, isPreviewVisible: false, isTestResultsVisible: false })),
		toggleTestResults: () => set((state) => ({ isTestResultsVisible: !state.isTestResultsVisible, isPreviewVisible: false, isWarningsVisible: false })),
		toggleAiPanel: () => set((state) => ({ isAiPanelOpen: !state.isAiPanelOpen })),
		openAiPanel: () => set({ isAiPanelOpen: true }),
		closeAiPanel: () => set({ isAiPanelOpen: false }),
		resetAiChat: () => set((state) => ({ aiChatResetKey: (state.aiChatResetKey || 0) + 1, aiChatHasMessages: false })),
		setAiChatHasMessages: (hasMessages) => set({ aiChatHasMessages: hasMessages }),
		runTest: async (server) => {
			const {yaml, editorConfig} = get();
			set({isTestRunning: true});
			try {
				const baseUrl = editorConfig?.tests?.dataContractCliApiServerUrl || 'https://api.datacontract.com';
				const response = await fetch(`${baseUrl}/test${server ? '?server=' + encodeURIComponent(server) : ''}`, {
					method: 'POST',
					headers: { 'Content-Type': 'text/plain' },
					body: yaml
				});
				const result = await response.json();
				const newResult = { timestamp: new Date().toISOString(), success: result.result === 'passed', data: result };
				set({testResults: [newResult], isTestRunning: false});
				return newResult;
			} catch (e) {
				set({isTestRunning: false});
				throw e;
			}
		},
		clearTestResults: () => set({testResults: []}),
		setPendingAiChange: (change) => set({ pendingAiChange: change }),
		clearPendingAiChange: () => set({ pendingAiChange: null }),
		applyPendingAiChange: () => {
			const { pendingAiChange, yaml } = get();
			if (pendingAiChange?.isValid && pendingAiChange?.updatedYaml) {
				set({ lastAppliedAiChange: { originalYaml: yaml, summary: pendingAiChange.summary } });
				actions.setYaml(pendingAiChange.updatedYaml);
			}
			set({ pendingAiChange: null });
		},
		unapplyAiChange: () => {
			const { lastAppliedAiChange } = get();
			if (lastAppliedAiChange?.originalYaml) {
				actions.setYaml(lastAppliedAiChange.originalYaml);
				set({ lastAppliedAiChange: null });
			}
		},
		clearLastAppliedAiChange: () => set({ lastAppliedAiChange: null }),
	};

	return {
		yaml: initialYaml,
		yamlParts: Yaml.parse(initialYaml),
		baselineYaml: initialYaml,
		activePath: 'default.yaml',
		contracts: { 'default.yaml': { initialYaml: initialYaml, currentYaml: initialYaml, yamlParts: Yaml.parse(initialYaml), isDirty: false } },
		repoFiles: [],
		isDirty: false,
		isMobileSidebarOpen: false,
		isPreviewVisible: true,
		isWarningsVisible: false,
		isTestResultsVisible: false,
		isTestRunning: false,
		testResults: [],
		markers: [],
		yamlParseError: null,
		yamlParseErrorPos: null,
		currentView: 'form',
		schemaUrl: null,
		schemaData: null,
		notifications: [],
		selectedDiagramSchemaIndex: null,
		isAiPanelOpen: false,
		aiChatResetKey: 0,
		aiChatHasMessages: false,
		pendingAiChange: null,
		lastAppliedAiChange: null,
		editorConfig: { mode: 'SERVER', tests: DEFAULT_TESTS_CONFIG, ai: DEFAULT_AI_CONFIG },
		...actions,
	};
}

const persistence = import.meta.env.VITE_PERSISTENCE || 'sessionStorage';
const storageConfig = getStorageConfig(persistence);

const defaultEditorStore = create()(
	devtools(
		storageConfig
		? persist(defaultStoreConfig, {
			name: 'editor-store',
			storage: storageConfig,
			merge: (persistedState, currentState) => ({ ...currentState, ...persistedState, editorConfig: { ...currentState.editorConfig, ...persistedState?.editorConfig } }),
		})
		: defaultStoreConfig
	)
);

export const useEditorStore = (selector) => {
    const store = overrideStore || defaultEditorStore;
    return store(selector);
};
useEditorStore.setState = (state) => (overrideStore || defaultEditorStore).setState(state);
useEditorStore.getState = () => (overrideStore || defaultEditorStore).getState();

export const setEditorConfig = (config) => {
	const store = overrideStore || defaultEditorStore;
	store.setState({ editorConfig: { ...store.getState().editorConfig, ...config } });
};
