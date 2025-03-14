// routes/admin.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const session = require('express-session');

// Check if running in development mode
const isDev = process.env.NODE_ENV !== 'production';

// Path to our data storage
const DATA_DIR = path.join(__dirname, '../data');
const NPC_DATA_FILE = path.join(DATA_DIR, 'npcs.json');
const ADMIN_CONFIG_FILE = path.join(DATA_DIR, 'admin-config.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize empty NPC data file if it doesn't exist
if (!fs.existsSync(NPC_DATA_FILE)) {
    fs.writeFileSync(NPC_DATA_FILE, JSON.stringify({ npcs: [] }), 'utf8');
}

// Initialize admin config with a default password if it doesn't exist
// Default admin password is "rollwithadvantage" (hashed)
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
        // Simply proceed - don't try to modify the session here
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
    // Add session support
    app.use(session({
        secret: process.env.SESSION_SECRET || 'crimson-court-secret',
        resave: false,
        saveUninitialized: false,
        cookie: { 
            secure: false,            // Set to true in production with HTTPS
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            path: '/'
        },
        rolling: true               // Reset expiration on each request
    }));

// Session refresh endpoint
router.post('/api/refresh-token', requireAuth, (req, res) => {
    console.log('Token refresh requested');
    
    // Update session expiration
    req.session.cookie.maxAge = 24 * 60 * 60 * 1000;
    
    req.session.save((err) => {
        if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({ error: 'Failed to refresh session' });
        }
        
        console.log('Session refreshed successfully');
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
                
                // Explicitly save the session before responding
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

    // Recent activity routes
    router.get('/api/recent-activity', requireAuth, (req, res) => {
        try {
            const activityFile = path.join(DATA_DIR, 'activity.json');
            let activities = [];
            
            if (fs.existsSync(activityFile)) {
                activities = JSON.parse(fs.readFileSync(activityFile, 'utf8'));
                
                // Sort by timestamp descending (newest first)
                activities = activities
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .slice(0, 5); // Limit to 5 most recent
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
            
            // Add new activity with timestamp
            const newActivity = {
                ...req.body,
                timestamp: new Date().toISOString()
            };
            
            // Add to beginning of array
            activities.unshift(newActivity);
            
            // Keep only last 50 activities (increased from 5 for better history)
            activities = activities.slice(0, 50);
            
            // Save to file
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

    // NPC API routes
    // Get all NPCs
    router.get('/api/npcs', requireAuth, (req, res) => {
        try {
            const data = JSON.parse(fs.readFileSync(NPC_DATA_FILE, 'utf8'));
            res.json(data.npcs);
        } catch (error) {
            console.error('Error reading NPC data:', error);
            res.status(500).json({ error: 'Error reading NPC data' });
        }
    });

    // Create NPC
    router.post('/api/npcs', requireAuth, express.json(), (req, res) => {
        try {
            const data = JSON.parse(fs.readFileSync(NPC_DATA_FILE, 'utf8'));
            
            const newNPC = {
                id: Date.now().toString(), // Simple ID generation
                ...req.body,
                createdAt: new Date().toISOString()
            };
            
            data.npcs.push(newNPC);
            
            fs.writeFileSync(NPC_DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
            
            res.status(201).json(newNPC);
        } catch (error) {
            console.error('Error creating NPC:', error);
            res.status(500).json({ error: 'Error creating NPC' });
        }
    });

    // Get single NPC
    router.get('/api/npcs/:id', requireAuth, (req, res) => {
        try {
            const data = JSON.parse(fs.readFileSync(NPC_DATA_FILE, 'utf8'));
            const npc = data.npcs.find(n => n.id === req.params.id);
            
            if (!npc) {
                return res.status(404).json({ error: 'NPC not found' });
            }
            
            res.json(npc);
        } catch (error) {
            console.error('Error getting NPC:', error);
            res.status(500).json({ error: 'Error getting NPC' });
        }
    });

    // Update NPC
    router.put('/api/npcs/:id', requireAuth, express.json(), (req, res) => {
        try {
            const data = JSON.parse(fs.readFileSync(NPC_DATA_FILE, 'utf8'));
            const index = data.npcs.findIndex(n => n.id === req.params.id);
            
            if (index === -1) {
                return res.status(404).json({ error: 'NPC not found' });
            }
            
            // Update the NPC, preserving id and createdAt
            data.npcs[index] = {
                ...data.npcs[index],
                ...req.body,
                id: req.params.id, // Make sure ID doesn't change
                updatedAt: new Date().toISOString()
            };
            
            fs.writeFileSync(NPC_DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
            
            res.json(data.npcs[index]);
        } catch (error) {
            console.error('Error updating NPC:', error);
            res.status(500).json({ error: 'Error updating NPC' });
        }
    });

    // Delete NPC
    router.delete('/api/npcs/:id', requireAuth, (req, res) => {
        try {
            const data = JSON.parse(fs.readFileSync(NPC_DATA_FILE, 'utf8'));
            const index = data.npcs.findIndex(n => n.id === req.params.id);
            
            if (index === -1) {
                return res.status(404).json({ error: 'NPC not found' });
            }
            
            // Remove the NPC
            data.npcs.splice(index, 1);
            
            fs.writeFileSync(NPC_DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
            
            res.json({ success: true });
        } catch (error) {
            console.error('Error deleting NPC:', error);
            res.status(500).json({ error: 'Error deleting NPC' });
        }
    });

    // Timeline API routes
// Get all timeline entries
router.get('/api/timeline', requireAuth, (req, res) => {
    try {
        const TIMELINE_DATA_FILE = path.join(DATA_DIR, 'timeline.json');
        
        if (!fs.existsSync(TIMELINE_DATA_FILE)) {
            // Create empty timeline data file if it doesn't exist
            fs.writeFileSync(TIMELINE_DATA_FILE, JSON.stringify({ entries: [] }), 'utf8');
            console.log('Created empty timeline data file');
            return res.json([]);
        }
        
        const data = JSON.parse(fs.readFileSync(TIMELINE_DATA_FILE, 'utf8'));
        res.json(data.entries);
    } catch (error) {
        console.error('Error reading timeline data:', error);
        res.status(500).json({ error: 'Error reading timeline data' });
    }
});

// Create timeline entry
router.post('/api/timeline', requireAuth, express.json(), (req, res) => {
    try {
        const TIMELINE_DATA_FILE = path.join(DATA_DIR, 'timeline.json');
        
        // Create data structure if file doesn't exist
        if (!fs.existsSync(TIMELINE_DATA_FILE)) {
            fs.writeFileSync(TIMELINE_DATA_FILE, JSON.stringify({ entries: [] }), 'utf8');
        }
        
        const data = JSON.parse(fs.readFileSync(TIMELINE_DATA_FILE, 'utf8'));
        
        const newEntry = {
            id: Date.now().toString(), // Simple ID generation
            ...req.body,
            createdAt: new Date().toISOString()
        };
        
        data.entries.push(newEntry);
        
        fs.writeFileSync(TIMELINE_DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        
        res.status(201).json(newEntry);
    } catch (error) {
        console.error('Error creating timeline entry:', error);
        res.status(500).json({ error: 'Error creating timeline entry' });
    }
});

// Get single timeline entry
router.get('/api/timeline/:id', requireAuth, (req, res) => {
    try {
        const TIMELINE_DATA_FILE = path.join(DATA_DIR, 'timeline.json');
        
        if (!fs.existsSync(TIMELINE_DATA_FILE)) {
            return res.status(404).json({ error: 'Timeline data not found' });
        }
        
        const data = JSON.parse(fs.readFileSync(TIMELINE_DATA_FILE, 'utf8'));
        const entry = data.entries.find(e => e.id === req.params.id);
        
        if (!entry) {
            return res.status(404).json({ error: 'Timeline entry not found' });
        }
        
        res.json(entry);
    } catch (error) {
        console.error('Error getting timeline entry:', error);
        res.status(500).json({ error: 'Error getting timeline entry' });
    }
});

// Update timeline entry
router.put('/api/timeline/:id', requireAuth, express.json(), (req, res) => {
    try {
        const TIMELINE_DATA_FILE = path.join(DATA_DIR, 'timeline.json');
        
        if (!fs.existsSync(TIMELINE_DATA_FILE)) {
            return res.status(404).json({ error: 'Timeline data not found' });
        }
        
        const data = JSON.parse(fs.readFileSync(TIMELINE_DATA_FILE, 'utf8'));
        const index = data.entries.findIndex(e => e.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Timeline entry not found' });
        }
        
        // Update the entry, preserving id and createdAt
        data.entries[index] = {
            ...data.entries[index],
            ...req.body,
            id: req.params.id, // Make sure ID doesn't change
            updatedAt: new Date().toISOString()
        };
        
        fs.writeFileSync(TIMELINE_DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        
        res.json(data.entries[index]);
    } catch (error) {
        console.error('Error updating timeline entry:', error);
        res.status(500).json({ error: 'Error updating timeline entry' });
    }
});

// Delete timeline entry
router.delete('/api/timeline/:id', requireAuth, (req, res) => {
    try {
        const TIMELINE_DATA_FILE = path.join(DATA_DIR, 'timeline.json');
        
        if (!fs.existsSync(TIMELINE_DATA_FILE)) {
            return res.status(404).json({ error: 'Timeline data not found' });
        }
        
        const data = JSON.parse(fs.readFileSync(TIMELINE_DATA_FILE, 'utf8'));
        const index = data.entries.findIndex(e => e.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Timeline entry not found' });
        }
        
        // Remove the entry
        data.entries.splice(index, 1);
        
        fs.writeFileSync(TIMELINE_DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting timeline entry:', error);
        res.status(500).json({ error: 'Error deleting timeline entry' });
    }
});

    // Apply the router
    app.use('/admin', router);
    
    // Return the router for testing
    return router;
};