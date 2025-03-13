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
            secure: !isDev, // Use secure cookies in production
            httpOnly: true,
            maxAge: 3600000 // 1 hour
        }
    }));

    // Admin login page
    router.get('/login', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/admin/login.html'));
    });

    // Admin login POST
    router.post('/api/login', express.json(), (req, res) => {
        const { username, password } = req.body;
        
        try {
            const adminConfig = JSON.parse(fs.readFileSync(ADMIN_CONFIG_FILE, 'utf8'));
            
            if (username === adminConfig.username && bcrypt.compareSync(password, adminConfig.passwordHash)) {
                req.session.authenticated = true;
                req.session.username = username;
                return res.json({ success: true });
            }
            
            res.status(401).json({ error: 'Invalid credentials' });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Admin logout
    router.get('/logout', (req, res) => {
        req.session.destroy();
        res.redirect('/admin/login');
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

    // Apply the router
    app.use('/admin', router);
    
    // Return the router for testing
    return router;
};