/**
 * Abstract base class for file storage backends
 * Defines the interface that all storage implementations must follow
 */
export class FileStorageBackend {
  /**
   * Load a YAML file from the storage backend
   * @param {string} [path] - Optional path to load
   * @returns {Promise<string>} The YAML content as a string
   * @throws {Error} If the operation is cancelled or fails
   */
  async loadYamlFile(path) {
    throw new Error('loadYamlFile must be implemented by subclass');
  }

  /**
   * Save YAML content to the storage backend
   * @param {string} yamlContent - The YAML content to save
   * @param {string} [suggestedName] - Optional suggested filename
   * @param {string} [existingPath] - Optional existing path to overwrite
   * @returns {Promise<any>} Result of the save operation
   * @throws {Error} If the operation is cancelled or fails
   */
  async saveYamlFile(yamlContent, suggestedName = 'datacontract.yaml', existingPath = null) {
    throw new Error('saveYamlFile must be implemented by subclass');
  }

  /**
   * Scan or list files from the backend
   * @returns {Promise<string[]>} List of filenames
   */
  async listFiles() {
    return [];
  }

  /**
   * Check if the backend supports file selection dialog
   * @returns {boolean}
   */
  supportsFileDialog() {
    return false;
  }

  /**
   * Get the name/type of this backend for display purposes
   * @returns {string}
   */
  getBackendName() {
    return 'Unknown Backend';
  }
}
