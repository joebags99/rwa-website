/**
 * Admin Module Loader
 *
 * Dynamically loads admin modules on-demand for better performance
 * Falls back to monolithic version if module loading fails
 *
 * @version 3.0.0
 */

'use strict';

window.AdminModuleLoader = {
    // Track loaded modules
    loadedModules: new Set(),

    // Track loading promises to prevent duplicate loads
    loadingPromises: new Map(),

    // Module configuration
    modules: {
        'npcs': {
            path: '/js/modules/admin-npcs.js',
            namespace: 'AdminNPCs',
            init: 'init'
        },
        'timeline': {
            path: '/js/modules/admin-timeline.js',
            namespace: 'AdminTimeline',
            init: 'init'
        },
        'story': {
            path: '/js/modules/admin-story.js',
            namespace: 'AdminStory',
            init: 'init'
        },
        'articles': {
            path: '/js/modules/admin-articles.js',
            namespace: 'AdminArticles',
            init: 'init'
        },
        'settings': {
            path: '/js/modules/admin-settings.js',
            namespace: 'AdminSettings',
            init: 'init'
        }
    },

    /**
     * Load a module dynamically
     * @param {string} moduleName - Name of the module to load
     * @returns {Promise<Object>} - The loaded module
     */
    async loadModule(moduleName) {
        // Check if already loaded
        if (this.loadedModules.has(moduleName)) {
            console.log(`✓ Module '${moduleName}' already loaded`);
            return window[this.modules[moduleName].namespace];
        }

        // Check if currently loading
        if (this.loadingPromises.has(moduleName)) {
            console.log(`⏳ Module '${moduleName}' is already loading, waiting...`);
            return this.loadingPromises.get(moduleName);
        }

        // Get module config
        const moduleConfig = this.modules[moduleName];
        if (!moduleConfig) {
            throw new Error(`Module '${moduleName}' not found in configuration`);
        }

        console.log(`📦 Loading module: ${moduleName} from ${moduleConfig.path}`);

        // Create loading promise
        const loadingPromise = this._loadScript(moduleConfig.path, moduleName)
            .then(() => {
                const moduleObj = window[moduleConfig.namespace];

                if (!moduleObj) {
                    throw new Error(`Module '${moduleName}' loaded but namespace '${moduleConfig.namespace}' not found`);
                }

                // Initialize module if it has an init function
                if (moduleConfig.init && typeof moduleObj[moduleConfig.init] === 'function') {
                    console.log(`🔧 Initializing module: ${moduleName}`);
                    moduleObj[moduleConfig.init]();
                }

                this.loadedModules.add(moduleName);
                this.loadingPromises.delete(moduleName);

                console.log(`✅ Module '${moduleName}' loaded successfully`);
                return moduleObj;
            })
            .catch(error => {
                this.loadingPromises.delete(moduleName);
                console.error(`❌ Failed to load module '${moduleName}':`, error);
                throw error;
            });

        this.loadingPromises.set(moduleName, loadingPromise);
        return loadingPromise;
    },

    /**
     * Load a script dynamically
     * @private
     */
    _loadScript(src, moduleName) {
        return new Promise((resolve, reject) => {
            // Check if script already exists
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.dataset.module = moduleName;

            script.onload = () => {
                console.log(`✓ Script loaded: ${src}`);
                resolve();
            };

            script.onerror = () => {
                reject(new Error(`Failed to load script: ${src}`));
            };

            document.head.appendChild(script);
        });
    },

    /**
     * Preload modules for faster section switching
     * @param {string[]} moduleNames - Array of module names to preload
     */
    async preloadModules(moduleNames) {
        console.log(`📦 Preloading modules: ${moduleNames.join(', ')}`);

        const promises = moduleNames.map(name =>
            this.loadModule(name).catch(err => {
                console.warn(`Failed to preload module '${name}':`, err);
            })
        );

        await Promise.all(promises);
        console.log(`✅ Preload complete`);
    },

    /**
     * Check if a module is loaded
     */
    isLoaded(moduleName) {
        return this.loadedModules.has(moduleName);
    },

    /**
     * Get loaded module count
     */
    getLoadedCount() {
        return this.loadedModules.size;
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminModuleLoader;
}
