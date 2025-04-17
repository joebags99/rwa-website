/**
 * Roll With Advantage - Express Server
 * A simple Express server for local development with Admin functionality
 */

// Load environment variables - try multiple paths to be safe
try {
  require('dotenv').config({ path: '.env.local' });
  console.log('Loaded environment variables from .env.local');
} catch (error) {
  console.warn('Error loading .env.local:', error.message);
  try {
    require('dotenv').config();
    console.log('Loaded environment variables from .env');
  } catch (secondError) {
    console.warn('Error loading .env:', secondError.message);
    console.log('Continuing without loading environment variables from file');
  }
}

// Import dependencies
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const session = require('express-session');

// Create Express app
const app = express();

// Set port
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Create data directory if it doesn't exist
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log('Created data directory');
}

// Create admin directory structure if it doesn't exist
const ADMIN_DIR = path.join(__dirname, 'public', 'admin');
if (!fs.existsSync(ADMIN_DIR)) {
  fs.mkdirSync(ADMIN_DIR, { recursive: true });
  console.log('Created admin directory');
}

// Create routes directory if it doesn't exist
const ROUTES_DIR = path.join(__dirname, 'routes');
if (!fs.existsSync(ROUTES_DIR)) {
  fs.mkdirSync(ROUTES_DIR, { recursive: true });
  console.log('Created routes directory');
}

// Public articles API routes
app.get('/api/articles', (req, res) => {
    // Return all published articles
    const data = require('./data/articles.json');
    const publishedArticles = data.articles.filter(article => article.status === 'published');
    res.json(publishedArticles);
});

app.get('/api/articles/:id', (req, res) => {
    const data = require('./data/articles.json');
    const article = data.articles.find(a => a.id === req.params.id);
    
    if (!article || article.status !== 'published') {
        return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json(article);
});

// Import and use admin routes
const adminRoutes = require('./routes/admin')(app);
app.use('/admin', adminRoutes);

// API Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Check for .env files and log their existence
function checkEnvFiles() {
  const envFiles = ['.env', '.env.local'];
  envFiles.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        console.log(`✓ ${file} file exists`);
      } else {
        console.log(`✗ ${file} file not found`);
      }
    } catch (err) {
      console.error(`Error checking for ${file}:`, err);
    }
  });
}

// Check and log environment variables
function logEnvironmentVariables() {
  const youtubeApiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.CHANNEL_ID;
  const crimsonCourtPlaylistId = process.env.CRIMSON_COURT_PLAYLIST_ID;
  const dmAdvicePlaylistId = process.env.DM_ADVICE_PLAYLIST_ID;
  const featuredPlaylistId = process.env.FEATURED_PLAYLIST_ID;

  console.log('\nEnvironment variables status:');
  console.log('- YOUTUBE_API_KEY:', youtubeApiKey ? `Configured ✓ (${youtubeApiKey.substring(0, 3)}...)` : 'Not configured ✗');
  console.log('- CHANNEL_ID:', channelId ? `Configured ✓ (${channelId})` : 'Not configured ✗');
  console.log('- CRIMSON_COURT_PLAYLIST_ID:', crimsonCourtPlaylistId ? `Configured ✓ (${crimsonCourtPlaylistId})` : 'Not configured ✗');
  console.log('- DM_ADVICE_PLAYLIST_ID:', dmAdvicePlaylistId ? `Configured ✓ (${dmAdvicePlaylistId})` : 'Not configured ✗');
  console.log('- FEATURED_PLAYLIST_ID:', featuredPlaylistId ? `Configured ✓ (${featuredPlaylistId})` : 'Not configured ✗');
  console.log('- PORT:', process.env.PORT || '5000 (default)');
  console.log('- SESSION_SECRET:', process.env.SESSION_SECRET ? 'Configured ✓' : 'Using default (not recommended for production) ✗');
}

// Check ENV file format by reading it directly (for debugging)
function checkEnvFileFormat() {
  try {
    if (fs.existsSync('.env.local')) {
      const envContent = fs.readFileSync('.env.local', 'utf8');
      console.log('\n.env.local file content structure:');
      
      // Split by lines and count variables properly formatted
      const lines = envContent.split('\n').filter(line => line.trim() !== '' && !line.startsWith('#'));
      const properlyFormattedLines = lines.filter(line => line.includes('='));
      
      console.log(`- Total non-comment lines: ${lines.length}`);
      console.log(`- Lines with '=' separator: ${properlyFormattedLines.length}`);
      
      if (lines.length !== properlyFormattedLines.length) {
        console.warn('⚠️ Some environment variables may not be properly formatted!');
        console.warn('  Make sure each variable is on its own line in format KEY=value with no spaces around =');
      }
    }
  } catch (err) {
    console.error('Error reading .env.local file:', err);
  }
}

// Run the environment checks
checkEnvFiles();
logEnvironmentVariables();
checkEnvFileFormat();

// YouTube proxy endpoint (to protect API key)
app.get('/api/youtube/playlist/:playlistId', async (req, res) => {
  try {
    const playlistId = req.params.playlistId;
    const maxResults = req.query.maxResults || 6;
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    console.log(`YouTube API request received for playlist: ${playlistId}`);
    
    if (!apiKey) {
      console.error('YouTube API key not found in environment variables');
      return res.status(500).json({ 
        error: 'YouTube API key not configured', 
        message: 'Add YOUTUBE_API_KEY to your .env.local file'
      });
    }
    
    const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${maxResults}&playlistId=${playlistId}&key=${apiKey}`;
    
    console.log(`Proxying YouTube API request for playlist: ${playlistId}`);
    
    // Fetch data from YouTube API
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API error:', errorData);
      throw new Error(`YouTube API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched ${data.items?.length || 0} videos from YouTube API`);
    res.json(data);
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Config endpoint (to securely provide playlist IDs to the frontend)
app.get('/api/config', (req, res) => {
  // Only send non-sensitive configuration to the frontend
  const config = {
    channelId: process.env.CHANNEL_ID,
    playlists: {
      crimsonCourt: process.env.CRIMSON_COURT_PLAYLIST_ID,
      dmAdvice: process.env.DM_ADVICE_PLAYLIST_ID,
      featured: process.env.FEATURED_PLAYLIST_ID
    }
  };

  console.log('Sending configuration to client:', config);
  
  res.json(config);
});

// Public API route for NPCs (non-admin)
app.get('/api/npcs', (req, res) => {
  try {
    const DATA_DIR = path.join(__dirname, 'data');
    const NPC_DATA_FILE = path.join(DATA_DIR, 'npcs.json');
    
    if (fs.existsSync(NPC_DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(NPC_DATA_FILE, 'utf8'));
      res.json(data.npcs);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error reading NPC data:', error);
    res.status(500).json({ error: 'Error reading NPC data' });
  }
});

// Public API route for timeline (non-admin)
app.get('/api/public/timeline', (req, res) => {
  try {
    const DATA_DIR = path.join(__dirname, 'data');
    const TIMELINE_DATA_FILE = path.join(DATA_DIR, 'timeline.json');
    
    if (fs.existsSync(TIMELINE_DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(TIMELINE_DATA_FILE, 'utf8'));
      res.json(data.entries);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error reading timeline data:', error);
    res.status(500).json({ error: 'Error reading timeline data' });
  }
});

// Public API route for story episodes (non-admin)
app.get('/api/public/story-episodes', (req, res) => {
  try {
    const DATA_DIR = path.join(__dirname, 'data');
    const STORY_EPISODES_FILE = path.join(DATA_DIR, 'story-episodes.json');
    
    if (!fs.existsSync(STORY_EPISODES_FILE)) {
      // Return empty array if file doesn't exist
      console.log('Story episodes file not found, returning empty array');
      return res.json([]);
    }
    
    const data = JSON.parse(fs.readFileSync(STORY_EPISODES_FILE, 'utf8'));
    res.json(data.episodes || []);
  } catch (error) {
    console.error('Error reading story episodes data:', error);
    res.status(500).json({ error: 'Error reading story episodes data' });
  }
});

// Public API route for locations
app.get('/api/public/locations', (req, res) => {
  try {
    const DATA_DIR = path.join(__dirname, 'data');
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
      
      fs.writeFileSync(LOCATIONS_FILE, JSON.stringify(defaultLocations, null, 2), 'utf8');
      console.log('Created default locations data file');
      
      return res.json(defaultLocations.locations);
    }
    
    const data = JSON.parse(fs.readFileSync(LOCATIONS_FILE, 'utf8'));
    res.json(data.locations);
  } catch (error) {
    console.error('Error reading locations data:', error);
    res.status(500).json({ error: 'Error reading locations data' });
  }
});

// Add this route to serve the article.html page
app.get('/article', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'article.html'));
});

// API endpoint to list images in the artist folder
app.get('/api/list-artist-images', (req, res) => {
  try {
    const artistDir = path.join(__dirname, 'public', 'assets', 'images', 'artist');
    
    // Check if directory exists
    if (!fs.existsSync(artistDir)) {
      console.log(`Artist directory not found: ${artistDir}`);
      // Create the directory if it doesn't exist
      fs.mkdirSync(artistDir, { recursive: true });
      console.log(`Created artist directory: ${artistDir}`);
      return res.json([]); // Return empty array since we just created the directory
    }
    
    // Read the directory
    const files = fs.readdirSync(artistDir);
    
    // Filter for image files
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });
    
    // Format the response - ensure paths use the correct web path (not filesystem path)
    // The key is to NOT include 'public' in the path since it's the web root
    const images = imageFiles.map(file => {
      return {
        path: `assets/images/artist/${file}`, // No 'public' in web path
        alt: `Character artwork by Gemma`
      };
    });
    
    console.log(`Found ${images.length} images in artist directory`);
    console.log('Image paths:', images.map(img => img.path));
    res.json(images);
  } catch (error) {
    console.error('Error reading artist directory:', error);
    res.status(500).json({ error: 'Error reading artist directory' });
  }
});

// Define routes for all your HTML pages
app.get('/crimson-court', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'crimson-court.html'));
});

app.get('/articles', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'articles.html'));
});

app.get('/meet-the-cast', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'meet-the-cast.html'));
});

app.get('/tools', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tools.html'));
});

app.get('/dice-roller', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dice-roller.html'));
});

app.get('/interactive-map', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'interactive-map.html'));
});

app.get('/ai-disclaimer', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ai-disclaimer.html'));
});

// Handle any other routes by serving index.html
app.get('*', (req, res) => {
  // Skip for admin routes which are handled by the admin router
  if (req.path.startsWith('/admin')) {
    return;
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
  🎲 Roll With Advantage server running!
  📁 Local: http://localhost:${PORT}
  🔐 Admin: http://localhost:${PORT}/admin
  
  Ready to help you manage your D&D content
  `);
});