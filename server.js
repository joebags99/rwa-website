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

// Import and use admin routes
const adminRoutes = require('./routes/admin')(app);

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