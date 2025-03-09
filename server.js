/**
 * Roll With Advantage - Express Server
 * A simple Express server for local development
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Import dependencies
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');

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

// API Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// YouTube proxy endpoint (to protect API key)
app.get('/api/youtube/playlist/:playlistId', async (req, res) => {
  try {
    const playlistId = req.params.playlistId;
    const maxResults = req.query.maxResults || 6;
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'YouTube API key not configured', 
        message: 'Add YOUTUBE_API_KEY to your .env.local file'
      });
    }
    
    const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${maxResults}&playlistId=${playlistId}&key=${apiKey}`;
    
    // Fetch data from YouTube API
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle any other routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
  🎲 Roll With Advantage server running!
  📁 Local: http://localhost:${PORT}
  
  Ready to help you manage your D&D content
  `);
});