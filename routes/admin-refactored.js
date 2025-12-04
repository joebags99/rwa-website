// routes/admin-refactored.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const { createCRUDRoutes } = require('./crud-factory');

// Check if running in development mode
const isDev = process.env.NODE_ENV !== 'production';

// Path to our data storage
const DATA_DIR = path.join(__dirname, '../data');
const ADMIN_CONFIG_FILE = path.join(DATA_DIR, 'admin-config.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize admin config with a default password if it doesn't exist
if (!fs.existsSync(ADMIN_CONFIG_FILE)) {
    const defaultPassword = bcrypt.hashSync('rollwithadvantage', 10);
    fs.writeFileSync(
        ADMIN_CONFIG_FILE,
        JSON.stringify({
            username: 'admin',
            passwordHash: defaultPassword,
            createdAt: new Date().toISOString()
        }),
        'utf8'
    );
    console.log('Created default admin credentials');
}

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) {
        return next();
    }

    // If it's an API request, return 401
    if (req.path.startsWith('/api/')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Otherwise redirect to login page
    res.redirect('/admin/login');
}

// Set up admin routes
module.exports = function(app) {
    // Add session support before defining routes
    app.use(session({
        secret: process.env.SESSION_SECRET || 'crimson-court-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            path: '/'
        },
        rolling: true
    }));

    // ============================================================================
    // Authentication Routes
    // ============================================================================

    // Session refresh endpoint
    router.post('/api/refresh-token', requireAuth, (req, res) => {
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000;

        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ error: 'Failed to refresh session' });
            }

            res.json({
                success: true,
                message: 'Session refreshed successfully',
                expiresIn: req.session.cookie.maxAge
            });
        });
    });

    // Admin login page
    router.get('/login', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/admin/login.html'));
    });

    // Admin login POST
    router.post('/api/login', express.json(), (req, res) => {
        const { username, password } = req.body;

        try {
            const adminConfig = JSON.parse(fs.readFileSync(ADMIN_CONFIG_FILE, 'utf8'));
            const passwordMatch = bcrypt.compareSync(password, adminConfig.passwordHash);

            if (username === adminConfig.username && passwordMatch) {
                req.session.authenticated = true;
                req.session.username = username;

                req.session.save((err) => {
                    if (err) {
                        console.error('Session save error:', err);
                        return res.status(500).json({ error: 'Session save failed' });
                    }
                    return res.json({ success: true });
                });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Admin logout
    router.get('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
            }
            res.redirect('/admin/login');
        });
    });

    // Change password API
    router.post('/api/change-password', requireAuth, express.json(), (req, res) => {
        const { currentPassword, newPassword } = req.body;

        try {
            const adminConfig = JSON.parse(fs.readFileSync(ADMIN_CONFIG_FILE, 'utf8'));

            if (bcrypt.compareSync(currentPassword, adminConfig.passwordHash)) {
                adminConfig.passwordHash = bcrypt.hashSync(newPassword, 10);
                adminConfig.updatedAt = new Date().toISOString();

                fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify(adminConfig, null, 2), 'utf8');

                return res.json({ success: true });
            }

            res.status(401).json({ error: 'Current password is incorrect' });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // ============================================================================
    // Recent Activity Routes (Special handling needed)
    // ============================================================================

    router.get('/api/recent-activity', requireAuth, (req, res) => {
        try {
            const activityFile = path.join(DATA_DIR, 'activity.json');
            let activities = [];

            if (fs.existsSync(activityFile)) {
                activities = JSON.parse(fs.readFileSync(activityFile, 'utf8'));
                activities = activities
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .slice(0, 5);
            }

            res.json(activities);
        } catch (error) {
            console.error('Error getting recent activity:', error);
            res.status(500).json({ error: 'Error getting recent activity' });
        }
    });

    router.post('/api/recent-activity', requireAuth, express.json(), (req, res) => {
        try {
            const activityFile = path.join(DATA_DIR, 'activity.json');
            let activities = [];

            if (fs.existsSync(activityFile)) {
                activities = JSON.parse(fs.readFileSync(activityFile, 'utf8'));
            }

            const newActivity = {
                ...req.body,
                timestamp: new Date().toISOString()
            };

            activities.unshift(newActivity);
            activities = activities.slice(0, 50);

            fs.writeFileSync(activityFile, JSON.stringify(activities, null, 2));

            res.json(newActivity);
        } catch (error) {
            console.error('Error saving recent activity:', error);
            res.status(500).json({ error: 'Error saving recent activity' });
        }
    });

    // Admin dashboard - protected by requireAuth
    router.get('/', requireAuth, (req, res) => {
        res.sendFile(path.join(__dirname, '../public/admin/index.html'));
    });

    // ============================================================================
    // CRUD Resources - Using Factory Pattern
    // ============================================================================

    console.log('Setting up CRUD routes...');

    // NPCs
    createCRUDRoutes({
        router,
        requireAuth,
        resourceName: 'NPCs',
        resourcePath: '/api/npcs',
        dataFile: path.join(DATA_DIR, 'npcs.json'),
        arrayKey: 'npcs'
    });

    // Timeline
    createCRUDRoutes({
        router,
        requireAuth,
        resourceName: 'Timeline',
        resourcePath: '/api/timeline',
        dataFile: path.join(DATA_DIR, 'timeline.json'),
        arrayKey: 'entries'
    });

    // Story Episodes
    createCRUDRoutes({
        router,
        requireAuth,
        resourceName: 'Story Episodes',
        resourcePath: '/api/story-episodes',
        dataFile: path.join(DATA_DIR, 'story-episodes.json'),
        arrayKey: 'episodes'
    });

    // Articles - with public read access
    createCRUDRoutes({
        router,
        requireAuth,
        resourceName: 'Articles',
        resourcePath: '/api/articles',
        dataFile: path.join(DATA_DIR, 'articles.json'),
        arrayKey: 'articles',
        config: {
            publicRead: true // Allow unauthenticated reads for public articles page
        }
    });

    // Acts
    createCRUDRoutes({
        router,
        requireAuth,
        resourceName: 'Acts',
        resourcePath: '/api/acts',
        dataFile: path.join(DATA_DIR, 'acts.json'),
        arrayKey: 'acts'
    });

    // Chapters
    createCRUDRoutes({
        router,
        requireAuth,
        resourceName: 'Chapters',
        resourcePath: '/api/chapters',
        dataFile: path.join(DATA_DIR, 'chapters.json'),
        arrayKey: 'chapters'
    });

    // ============================================================================
    // Special Routes (Non-standard CRUD)
    // ============================================================================

    // Locations - Special handling for ID validation
    router.get('/api/locations', (req, res) => {
        try {
            const LOCATIONS_FILE = path.join(DATA_DIR, 'locations.json');

            if (!fs.existsSync(LOCATIONS_FILE)) {
                const defaultLocations = {
                    locations: [
                        { id: "crimson-keep", name: "Crimson Keep" },
                        { id: "ederia-city", name: "Ederia City" },
                        { id: "throne-room", name: "Throne Room" },
                        { id: "royal-library", name: "Royal Library" },
                        { id: "stormwatch", name: "Stormwatch Fortress" }
                    ]
                };

                if (!fs.existsSync(DATA_DIR)) {
                    fs.mkdirSync(DATA_DIR, { recursive: true });
                }

                fs.writeFileSync(LOCATIONS_FILE, JSON.stringify(defaultLocations, null, 2), 'utf8');
                return res.json(defaultLocations.locations);
            }

            const data = JSON.parse(fs.readFileSync(LOCATIONS_FILE, 'utf8'));
            res.json(data.locations);
        } catch (error) {
            console.error('Error reading locations data:', error);
            res.status(500).json({ error: 'Error reading locations data' });
        }
    });

    router.post('/api/locations', requireAuth, express.json(), (req, res) => {
        try {
            const LOCATIONS_FILE = path.join(DATA_DIR, 'locations.json');

            if (!req.body.id || !req.body.name) {
                return res.status(400).json({ error: 'Location ID and name are required' });
            }

            if (!/^[a-z0-9-]+$/.test(req.body.id)) {
                return res.status(400).json({
                    error: 'Location ID must contain only lowercase letters, numbers, and hyphens'
                });
            }

            let data = { locations: [] };
            if (fs.existsSync(LOCATIONS_FILE)) {
                data = JSON.parse(fs.readFileSync(LOCATIONS_FILE, 'utf8'));
            }

            if (data.locations.some(loc => loc.id === req.body.id)) {
                return res.status(400).json({ error: 'A location with this ID already exists' });
            }

            const newLocation = {
                id: req.body.id,
                name: req.body.name
            };

            data.locations.push(newLocation);
            fs.writeFileSync(LOCATIONS_FILE, JSON.stringify(data, null, 2), 'utf8');

            res.status(201).json(data.locations);
        } catch (error) {
            console.error('Error adding location:', error);
            res.status(500).json({ error: 'Error adding location' });
        }
    });

    console.log('✓ Admin routes configured successfully');

    return router;
};
