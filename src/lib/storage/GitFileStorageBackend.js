import { FileStorageBackend } from '../../services/FileStorageBackend.js';

/**
 * Storage backend for Git-based repositories (GitHub/GitLab API)
 */
export class GitFileStorageBackend extends FileStorageBackend {
    constructor(config) {
        super();
        this.config = config; // { provider, repo, token, branch }
    }

    async listFiles() {
        if (this.config.provider === 'github') {
            return this._listGitHub();
        }
        return [];
    }

    async loadYamlFile(path) {
        if (this.config.provider === 'github') {
            return this._loadGitHub(path);
        }
        throw new Error('Unsupported provider');
    }

    async saveYamlFile(content, path) {
        // Implement commit logic here
        console.log('Committing to Git:', path);
        return { filename: path };
    }

    async _listGitHub() {
        const url = `https://api.github.com/repos/${this.config.repo}/contents`;
        const resp = await fetch(url, {
            headers: { 'Authorization': `token ${this.config.token}` }
        });
        const data = await resp.json();
        return data
            .filter(f => f.name.endsWith('.yaml') || f.name.endsWith('.yml'))
            .map(f => f.path);
    }

    async _loadGitHub(path) {
        const url = `https://api.github.com/repos/${this.config.repo}/contents/${path}`;
        const resp = await fetch(url, {
            headers: { 'Authorization': `token ${this.config.token}` }
        });
        const data = await resp.json();
        return atob(data.content);
    }

    getBackendName() {
        return 'Git Repository';
    }
}
