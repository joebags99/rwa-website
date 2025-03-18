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

// Set up admin routes - ** THIS IS THE FIXED MODULE EXPORTS PATTERN **
module.exports = function(app) {
    // Add session support before defining routes
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

    // Define all routes on the router...
    
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

    // Get all locations
    router.get('/api/locations', (req, res) => {
        try {
            const LOCATIONS_FILE = path.join(DATA_DIR, 'locations.json');
            
            if (!fs.existsSync(LOCATIONS_FILE)) {
                // Create default locations file if it doesn't exist
                const defaultLocations = {
                    locations: [
                        { id: "crimson-keep", name: "Crimson Keep" },
                        { id: "ederia-city", name: "Ederia City" },
                        { id: "throne-room", name: "Throne Room" },
                        { id: "royal-library", name: "Royal Library" },
                        { id: "stormwatch", name: "Stormwatch Fortress" }
                    ]
                };
                
                // Create the DATA_DIR if it doesn't exist
                if (!fs.existsSync(DATA_DIR)) {
                    fs.mkdirSync(DATA_DIR, { recursive: true });
                }
                
                // Write the default locations file
                fs.writeFileSync(LOCATIONS_FILE, JSON.stringify(defaultLocations, null, 2), 'utf8');
                console.log('Created default locations data file');
                
                return res.json(defaultLocations.locations);
            }
            
            // Read the locations file
            const data = JSON.parse(fs.readFileSync(LOCATIONS_FILE, 'utf8'));
            res.json(data.locations);
        } catch (error) {
            console.error('Error reading locations data:', error);
            res.status(500).json({ error: 'Error reading locations data' });
        }
    });

    // Add new location
    router.post('/api/locations', requireAuth, express.json(), (req, res) => {
        try {
            const LOCATIONS_FILE = path.join(DATA_DIR, 'locations.json');
            
            // Require location data
            if (!req.body.id || !req.body.name) {
                return res.status(400).json({ error: 'Location ID and name are required' });
            }
            
            // Format validation
            if (!/^[a-z0-9-]+$/.test(req.body.id)) {
                return res.status(400).json({ 
                    error: 'Location ID must contain only lowercase letters, numbers, and hyphens' 
                });
            }
            
            // Load existing locations
            let data = { locations: [] };
            if (fs.existsSync(LOCATIONS_FILE)) {
                data = JSON.parse(fs.readFileSync(LOCATIONS_FILE, 'utf8'));
            }
            
            // Check for duplicate ID
            if (data.locations.some(loc => loc.id === req.body.id)) {
                return res.status(400).json({ error: 'A location with this ID already exists' });
            }
            
            // Add the new location
            const newLocation = {
                id: req.body.id,
                name: req.body.name
            };
            
            data.locations.push(newLocation);
            
            // Save to file
            fs.writeFileSync(LOCATIONS_FILE, JSON.stringify(data, null, 2), 'utf8');
            
            // Return all locations
            res.status(201).json(data.locations);
        } catch (error) {
            console.error('Error adding location:', error);
            res.status(500).json({ error: 'Error adding location' });
        }
    });

    // Story Episodes API routes
    // Get all story episodes
    router.get('/api/story-episodes', requireAuth, (req, res) => {
        try {
            const STORY_EPISODES_FILE = path.join(DATA_DIR, 'story-episodes.json');
            
            if (!fs.existsSync(STORY_EPISODES_FILE)) {
                // Create empty story episodes file if it doesn't exist
                fs.writeFileSync(STORY_EPISODES_FILE, JSON.stringify({ episodes: [] }), 'utf8');
                console.log('Created empty story episodes data file');
                return res.json([]);
            }
            
            const data = JSON.parse(fs.readFileSync(STORY_EPISODES_FILE, 'utf8'));
            res.json(data.episodes);
        } catch (error) {
            console.error('Error reading story episodes data:', error);
            res.status(500).json({ error: 'Error reading story episodes data' });
        }
    });

    // Create story episode
    router.post('/api/story-episodes', requireAuth, express.json(), (req, res) => {
        try {
            const STORY_EPISODES_FILE = path.join(DATA_DIR, 'story-episodes.json');
            
            // Create data structure if file doesn't exist
            if (!fs.existsSync(STORY_EPISODES_FILE)) {
                fs.writeFileSync(STORY_EPISODES_FILE, JSON.stringify({ episodes: [] }), 'utf8');
            }
            
            const data = JSON.parse(fs.readFileSync(STORY_EPISODES_FILE, 'utf8'));
            
            const newEpisode = {
                id: Date.now().toString(), // Simple ID generation
                ...req.body,
                createdAt: new Date().toISOString()
            };
            
            data.episodes.push(newEpisode);
            
            fs.writeFileSync(STORY_EPISODES_FILE, JSON.stringify(data, null, 2), 'utf8');
            
            res.status(201).json(newEpisode);
        } catch (error) {
            console.error('Error creating story episode:', error);
            res.status(500).json({ error: 'Error creating story episode' });
        }
    });

    // Get single story episode
    router.get('/api/story-episodes/:id', requireAuth, (req, res) => {
        try {
            const STORY_EPISODES_FILE = path.join(DATA_DIR, 'story-episodes.json');
            
            if (!fs.existsSync(STORY_EPISODES_FILE)) {
                return res.status(404).json({ error: 'Story episodes data not found' });
            }
            
            const data = JSON.parse(fs.readFileSync(STORY_EPISODES_FILE, 'utf8'));
            const episode = data.episodes.find(e => e.id === req.params.id);
            
            if (!episode) {
                return res.status(404).json({ error: 'Story episode not found' });
            }
            
            res.json(episode);
        } catch (error) {
            console.error('Error getting story episode:', error);
            res.status(500).json({ error: 'Error getting story episode' });
        }
    });

    // Update story episode
    router.put('/api/story-episodes/:id', requireAuth, express.json(), (req, res) => {
        try {
            const STORY_EPISODES_FILE = path.join(DATA_DIR, 'story-episodes.json');
            
            if (!fs.existsSync(STORY_EPISODES_FILE)) {
                return res.status(404).json({ error: 'Story episodes data not found' });
            }
            
            const data = JSON.parse(fs.readFileSync(STORY_EPISODES_FILE, 'utf8'));
            const index = data.episodes.findIndex(e => e.id === req.params.id);
            
            if (index === -1) {
                return res.status(404).json({ error: 'Story episode not found' });
            }
            
            // Update the episode, preserving id and createdAt
            data.episodes[index] = {
                ...data.episodes[index],
                ...req.body,
                id: req.params.id, // Make sure ID doesn't change
                updatedAt: new Date().toISOString()
            };
            
            fs.writeFileSync(STORY_EPISODES_FILE, JSON.stringify(data, null, 2), 'utf8');
            
            res.json(data.episodes[index]);
        } catch (error) {
            console.error('Error updating story episode:', error);
            res.status(500).json({ error: 'Error updating story episode' });
        }
    });

    // Delete story episode
    router.delete('/api/story-episodes/:id', requireAuth, (req, res) => {
        try {
            const STORY_EPISODES_FILE = path.join(DATA_DIR, 'story-episodes.json');
            
            if (!fs.existsSync(STORY_EPISODES_FILE)) {
                return res.status(404).json({ error: 'Story episodes data not found' });
            }
            
            const data = JSON.parse(fs.readFileSync(STORY_EPISODES_FILE, 'utf8'));
            const index = data.episodes.findIndex(e => e.id === req.params.id);
            
            if (index === -1) {
                return res.status(404).json({ error: 'Story episode not found' });
            }
            
            // Remove the episode
            data.episodes.splice(index, 1);
            
            fs.writeFileSync(STORY_EPISODES_FILE, JSON.stringify(data, null, 2), 'utf8');
            
            res.json({ success: true });
        } catch (error) {
            console.error('Error deleting story episode:', error);
            res.status(500).json({ error: 'Error deleting story episode' });
        }
    });

    // Acts endpoints
    router.get('/api/acts', requireAuth, (req, res) => {
        try {
            const ACTS_FILE = path.join(DATA_DIR, 'acts.json');
            
            if (!fs.existsSync(ACTS_FILE)) {
                // Create empty acts file if it doesn't exist
                const emptyActs = {
                    acts: []
                };
                
                // Create directory if it doesn't exist
                if (!fs.existsSync(DATA_DIR)) {
                    fs.mkdirSync(DATA_DIR, { recursive: true });
                }
                
                fs.writeFileSync(ACTS_FILE, JSON.stringify(emptyActs, null, 2), 'utf8');
                return res.json(emptyActs.acts);
            }
            
            const data = JSON.parse(fs.readFileSync(ACTS_FILE, 'utf8'));
            res.json(data.acts);
        } catch (error) {
            console.error('Error reading acts data:', error);
            res.status(500).json({ error: 'Error reading acts data' });
        }
    });

    router.post('/api/acts', requireAuth, express.json(), (req, res) => {
        try {
            const { id, name, subtitle } = req.body;
            
            if (!id || !name) {
                return res.status(400).json({ error: 'Act ID and name are required' });
            }
            
            const ACTS_FILE = path.join(DATA_DIR, 'acts.json');
            let data = { acts: [] };
            
            if (fs.existsSync(ACTS_FILE)) {
                data = JSON.parse(fs.readFileSync(ACTS_FILE, 'utf8'));
            }
            
            // Check for duplicate ID
            if (data.acts.some(act => act.id === id)) {
                return res.status(400).json({ error: 'An act with this ID already exists' });
            }
            
            // Add the new act
            data.acts.push({ id, name, subtitle: subtitle || '' });
            fs.writeFileSync(ACTS_FILE, JSON.stringify(data, null, 2), 'utf8');
            
            res.status(201).json(data.acts);
        } catch (error) {
            console.error('Error adding act:', error);
            res.status(500).json({ error: 'Error adding act' });
        }
    });

    // Chapters endpoints
    router.get('/api/chapters', requireAuth, (req, res) => {
        try {
            const CHAPTERS_FILE = path.join(DATA_DIR, 'chapters.json');
            
            if (!fs.existsSync(CHAPTERS_FILE)) {
                // Create empty chapters file if it doesn't exist
                const emptyChapters = {
                    chapters: []
                };
                
                // Create directory if it doesn't exist
                if (!fs.existsSync(DATA_DIR)) {
                    fs.mkdirSync(DATA_DIR, { recursive: true });
                }
                
                fs.writeFileSync(CHAPTERS_FILE, JSON.stringify(emptyChapters, null, 2), 'utf8');
                return res.json(emptyChapters.chapters);
            }
            
            const data = JSON.parse(fs.readFileSync(CHAPTERS_FILE, 'utf8'));
            res.json(data.chapters);
        } catch (error) {
            console.error('Error reading chapters data:', error);
            res.status(500).json({ error: 'Error reading chapters data' });
        }
    });

    router.post('/api/chapters', requireAuth, express.json(), (req, res) => {
        try {
            const { id, name, subtitle } = req.body;
            
            if (!id || !name) {
                return res.status(400).json({ error: 'Chapter ID and name are required' });
            }
            
            const CHAPTERS_FILE = path.join(DATA_DIR, 'chapters.json');
            let data = { chapters: [] };
            
            if (fs.existsSync(CHAPTERS_FILE)) {
                data = JSON.parse(fs.readFileSync(CHAPTERS_FILE, 'utf8'));
            }
            
            // Check for duplicate ID
            if (data.chapters.some(chapter => chapter.id === id)) {
                return res.status(400).json({ error: 'A chapter with this ID already exists' });
            }
            
            // Add the new chapter
            data.chapters.push({ id, name, subtitle: subtitle || '' });
            fs.writeFileSync(CHAPTERS_FILE, JSON.stringify(data, null, 2), 'utf8');
            
            res.status(201).json(data.chapters);
        } catch (error) {
            console.error('Error adding chapter:', error);
            res.status(500).json({ error: 'Error adding chapter' });
        }
    });

    // Articles routes
    const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');
    
    // Initialize empty articles data file if it doesn't exist
    if (!fs.existsSync(ARTICLES_FILE)) {
        fs.writeFileSync(ARTICLES_FILE, JSON.stringify({ articles: [] }), 'utf8');
        console.log('Created empty articles data file');
    }
    
    // Get all articles
    router.get('/api/articles', (req, res) => {
        try {
            const data = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8'));
            res.json(data.articles || []);
        } catch (error) {
            console.error('Error reading articles data:', error);
            res.status(500).json({ error: 'Error reading articles data' });
        }
    });
    
    // Create article
    router.post('/api/articles', requireAuth, express.json(), (req, res) => {
        try {
            const data = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8'));
            
            const newArticle = {
                id: Date.now().toString(),
                ...req.body,
                createdAt: new Date().toISOString()
            };
            
            data.articles.push(newArticle);
            fs.writeFileSync(ARTICLES_FILE, JSON.stringify(data, null, 2), 'utf8');
            res.status(201).json(newArticle);
        } catch (error) {
            console.error('Error creating article:', error);
            res.status(500).json({ error: 'Error creating article' });
        }
    });
    
    // Get single article
    router.get('/api/articles/:id', (req, res) => {
        try {
            const data = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8'));
            const article = data.articles.find(a => a.id === req.params.id);
            
            if (!article) {
                return res.status(404).json({ error: 'Article not found' });
            }
            
            res.json(article);
        } catch (error) {
            console.error('Error getting article:', error);
            res.status(500).json({ error: 'Error getting article' });
        }
    });
    
    // Update article
router.put('/api/articles/:id', requireAuth, express.json(), (req, res) => {
    try {
        if (!fs.existsSync(ARTICLES_FILE)) {
            return res.status(404).json({ error: 'Articles data not found' });
        }
        
        const data = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8'));
        const index = data.articles.findIndex(article => article.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Article not found' });
        }
        
        // Update article fields, preserving ID and creation date
        const updatedArticle = {
            ...data.articles[index],
            ...req.body,
            id: req.params.id,
            updatedAt: new Date().toISOString()
        };
        
        data.articles[index] = updatedArticle;
        
        fs.writeFileSync(ARTICLES_FILE, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Article updated successfully: ${updatedArticle.title}`);
        
        res.json(updatedArticle);
    } catch (error) {
        console.error('Error updating article:', error);
        res.status(500).json({ error: 'Error updating article' });
    }
});
    
    // Delete article
    router.delete('/api/articles/:id', requireAuth, (req, res) => {
        try {
            const data = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8'));
            const index = data.articles.findIndex(a => a.id === req.params.id);
            
            if (index === -1) {
                return res.status(404).json({ error: 'Article not found' });
            }
            
            data.articles.splice(index, 1);
            fs.writeFileSync(ARTICLES_FILE, JSON.stringify(data, null, 2), 'utf8');
            res.json({ success: true });
        } catch (error) {
            console.error('Error deleting article:', error);
            res.status(500).json({ error: 'Error deleting article' });
        }
    });
    
    // Create article
    router.post('/api/articles', requireAuth, express.json(), (req, res) => {
        try {
            // Ensure data directory exists
            if (!fs.existsSync(DATA_DIR)) {
                fs.mkdirSync(DATA_DIR, { recursive: true });
                console.log(`Created data directory: ${DATA_DIR}`);
            }
            
            // Initialize empty articles file if it doesn't exist
            if (!fs.existsSync(ARTICLES_FILE)) {
                fs.writeFileSync(ARTICLES_FILE, JSON.stringify({ articles: [] }), 'utf8');
                console.log(`Created empty articles file: ${ARTICLES_FILE}`);
            }
            
            // Read existing data
            const data = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8'));
            
            // Create new article with timestamp and ID
            const newArticle = {
                id: req.body.id || Date.now().toString(),
                title: req.body.title,
                subtitle: req.body.subtitle || '',
                content: req.body.content,
                excerpt: req.body.excerpt || '',
                image: req.body.image || '',
                author: req.body.author || 'Admin',
                tags: Array.isArray(req.body.tags) ? req.body.tags : [],
                status: req.body.status || 'draft',
                readTime: req.body.readTime || 5,
                relatedVideo: req.body.relatedVideo || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Add to articles array
            data.articles.push(newArticle);
            
            // Write updated data back to file
            fs.writeFileSync(ARTICLES_FILE, JSON.stringify(data, null, 2), 'utf8');
            console.log(`Article saved successfully: ${newArticle.title}`);
            
            // Return success response with created article
            res.status(201).json(newArticle);
        } catch (error) {
            console.error('Error creating article:', error);
            res.status(500).json({ error: 'Error creating article' });
        }
    });
    
    // Return the router at the end
    return router;
};