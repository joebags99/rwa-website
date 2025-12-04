/**
 * CRUD Factory - Generic CRUD route generator
 *
 * This factory generates standard Create, Read, Update, Delete routes for JSON-based resources
 * Reduces code duplication and ensures consistent API patterns across all resources
 *
 * @module crud-factory
 */

const fs = require('fs');
const path = require('path');

/**
 * Create CRUD routes for a resource
 * @param {Object} options - Configuration options
 * @param {express.Router} options.router - Express router instance
 * @param {Function} options.requireAuth - Authentication middleware
 * @param {string} options.resourceName - Name of the resource (e.g., 'npcs', 'timeline')
 * @param {string} options.resourcePath - API path (e.g., '/api/npcs')
 * @param {string} options.dataFile - Path to JSON data file
 * @param {string} options.arrayKey - Key in JSON file that holds the array (e.g., 'npcs', 'entries')
 * @param {Object} options.config - Additional configuration
 * @param {boolean} options.config.publicRead - Allow unauthenticated reads (default: false)
 * @param {Function} options.config.validate - Optional validation function for create/update
 * @param {Function} options.config.beforeCreate - Hook before creating item
 * @param {Function} options.config.afterCreate - Hook after creating item
 * @param {Function} options.config.beforeUpdate - Hook before updating item
 * @param {Function} options.config.afterUpdate - Hook after updating item
 * @param {Function} options.config.beforeDelete - Hook before deleting item
 * @param {Function} options.config.afterDelete - Hook after deleting item
 */
function createCRUDRoutes(options) {
    const {
        router,
        requireAuth,
        resourceName,
        resourcePath,
        dataFile,
        arrayKey,
        config = {}
    } = options;

    // Determine if reads should be public
    const readMiddleware = config.publicRead ? [] : [requireAuth];

    /**
     * Helper: Read data from file
     */
    function readData() {
        if (!fs.existsSync(dataFile)) {
            const emptyData = {};
            emptyData[arrayKey] = [];
            fs.writeFileSync(dataFile, JSON.stringify(emptyData, null, 2), 'utf8');
            return emptyData;
        }
        return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    }

    /**
     * Helper: Write data to file
     */
    function writeData(data) {
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
    }

    /**
     * GET /api/:resource - Get all items
     */
    router.get(resourcePath, ...readMiddleware, (req, res) => {
        try {
            const data = readData();
            res.json(data[arrayKey] || []);
        } catch (error) {
            console.error(`Error reading ${resourceName} data:`, error);
            res.status(500).json({ error: `Error reading ${resourceName} data` });
        }
    });

    /**
     * POST /api/:resource - Create new item
     */
    router.post(resourcePath, requireAuth, (req, res) => {
        try {
            // Validate if validation function provided
            if (config.validate) {
                const validationError = config.validate(req.body);
                if (validationError) {
                    return res.status(400).json({ error: validationError });
                }
            }

            const data = readData();

            // Create new item with ID and timestamp
            let newItem = {
                id: Date.now().toString(),
                ...req.body,
                createdAt: new Date().toISOString()
            };

            // Before create hook
            if (config.beforeCreate) {
                newItem = config.beforeCreate(newItem, req) || newItem;
            }

            // Add to array
            data[arrayKey].push(newItem);

            // Write to file
            writeData(data);

            // After create hook
            if (config.afterCreate) {
                config.afterCreate(newItem, req);
            }

            console.log(`${resourceName} created successfully:`, newItem.id);
            res.status(201).json(newItem);
        } catch (error) {
            console.error(`Error creating ${resourceName}:`, error);
            res.status(500).json({ error: `Error creating ${resourceName}` });
        }
    });

    /**
     * GET /api/:resource/:id - Get single item
     */
    router.get(`${resourcePath}/:id`, ...readMiddleware, (req, res) => {
        try {
            const data = readData();
            const item = data[arrayKey].find(i => i.id === req.params.id);

            if (!item) {
                return res.status(404).json({ error: `${resourceName} not found` });
            }

            res.json(item);
        } catch (error) {
            console.error(`Error getting ${resourceName}:`, error);
            res.status(500).json({ error: `Error getting ${resourceName}` });
        }
    });

    /**
     * PUT /api/:resource/:id - Update item
     */
    router.put(`${resourcePath}/:id`, requireAuth, (req, res) => {
        try {
            // Validate if validation function provided
            if (config.validate) {
                const validationError = config.validate(req.body, true); // true = isUpdate
                if (validationError) {
                    return res.status(400).json({ error: validationError });
                }
            }

            const data = readData();
            const index = data[arrayKey].findIndex(i => i.id === req.params.id);

            if (index === -1) {
                return res.status(404).json({ error: `${resourceName} not found` });
            }

            // Update item, preserving id and createdAt
            let updatedItem = {
                ...data[arrayKey][index],
                ...req.body,
                id: req.params.id,
                updatedAt: new Date().toISOString()
            };

            // Before update hook
            if (config.beforeUpdate) {
                updatedItem = config.beforeUpdate(updatedItem, data[arrayKey][index], req) || updatedItem;
            }

            data[arrayKey][index] = updatedItem;

            // Write to file
            writeData(data);

            // After update hook
            if (config.afterUpdate) {
                config.afterUpdate(updatedItem, req);
            }

            console.log(`${resourceName} updated successfully:`, updatedItem.id);
            res.json(updatedItem);
        } catch (error) {
            console.error(`Error updating ${resourceName}:`, error);
            res.status(500).json({ error: `Error updating ${resourceName}` });
        }
    });

    /**
     * DELETE /api/:resource/:id - Delete item
     */
    router.delete(`${resourcePath}/:id`, requireAuth, (req, res) => {
        try {
            const data = readData();
            const index = data[arrayKey].findIndex(i => i.id === req.params.id);

            if (index === -1) {
                return res.status(404).json({ error: `${resourceName} not found` });
            }

            const deletedItem = data[arrayKey][index];

            // Before delete hook
            if (config.beforeDelete) {
                const preventDelete = config.beforeDelete(deletedItem, req);
                if (preventDelete) {
                    return res.status(400).json({ error: preventDelete });
                }
            }

            // Remove item
            data[arrayKey].splice(index, 1);

            // Write to file
            writeData(data);

            // After delete hook
            if (config.afterDelete) {
                config.afterDelete(deletedItem, req);
            }

            console.log(`${resourceName} deleted successfully:`, req.params.id);
            res.json({ success: true });
        } catch (error) {
            console.error(`Error deleting ${resourceName}:`, error);
            res.status(500).json({ error: `Error deleting ${resourceName}` });
        }
    });

    console.log(`✓ CRUD routes created for ${resourceName} at ${resourcePath}`);
}

module.exports = { createCRUDRoutes };
