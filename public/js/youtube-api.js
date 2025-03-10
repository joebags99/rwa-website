/**
 * Roll With Advantage - YouTube API Integration
 * This file handles fetching and displaying YouTube videos from the channel
 * using the server-side proxy to protect API keys
 */

// Global variables to store the configuration
let API_BASE_URL;
let CHANNEL_ID;
let MAX_RESULTS;
let PLAYLISTS = {};

/**
 * Initialize YouTube videos with the latest configuration
 */
function initializeYouTubeVideos() {
  console.log('Initializing YouTube videos with current configuration');
  
  // Get the latest config from the global variable
  const appConfig = window.RWA_CONFIG || {
    apiBaseUrl: '/api',
    channelId: 'YOUR_CHANNEL_ID',
    videoMaxResults: 6,
    playlists: {
      crimsonCourt: 'YOUR_CRIMSON_COURT_PLAYLIST_ID',
      dmAdvice: 'YOUR_DM_ADVICE_PLAYLIST_ID',
      featured: 'YOUR_FEATURED_PLAYLIST_ID'
    }
  };
  
  // Update our variables with the latest values
  API_BASE_URL = appConfig.apiBaseUrl;
  CHANNEL_ID = appConfig.channelId;
  MAX_RESULTS = appConfig.videoMaxResults || 6;
  
  // Update playlist IDs
  PLAYLISTS = {
    CRIMSON_COURT: appConfig.playlists.crimsonCourt,
    DM_ADVICE: appConfig.playlists.dmAdvice,
    FEATURED: appConfig.playlists.featured
  };
  
  console.log('Using API base URL:', API_BASE_URL);
  console.log('Using channel ID:', CHANNEL_ID);
  console.log('Using playlists:', PLAYLISTS);
  
  // Load featured videos on the homepage
  const featuredVideosContainer = document.getElementById('featured-videos');
  if (featuredVideosContainer) {
    console.log('Loading featured videos');
    fetchPlaylistVideos(PLAYLISTS.FEATURED, featuredVideosContainer, MAX_RESULTS);
  }
  
  // Load Crimson Court videos on the homepage
  const crimsonCourtContainer = document.getElementById('crimson-court-videos');
  if (crimsonCourtContainer) {
    console.log('Loading Crimson Court videos');
    fetchPlaylistVideos(PLAYLISTS.CRIMSON_COURT, crimsonCourtContainer, MAX_RESULTS);
  }
  
  // Load DM advice videos on the homepage
  const dmAdviceContainer = document.getElementById('dm-advice-videos');
  if (dmAdviceContainer) {
    console.log('Loading DM advice videos');
    fetchPlaylistVideos(PLAYLISTS.DM_ADVICE, dmAdviceContainer, MAX_RESULTS);
  }
  
  // Load all Crimson Court videos on the dedicated page
  const allCrimsonCourtContainer = document.getElementById('all-crimson-court-videos');
  if (allCrimsonCourtContainer) {
    fetchPlaylistVideos(PLAYLISTS.CRIMSON_COURT, allCrimsonCourtContainer, 50);
  }
  
  // Load all DM advice videos on the dedicated page
  const allDmAdviceContainer = document.getElementById('all-dm-advice-videos');
  if (allDmAdviceContainer) {
    fetchPlaylistVideos(PLAYLISTS.DM_ADVICE, allDmAdviceContainer, 50);
  }
}

// Make the initialization function globally available
window.initializeYouTubeVideos = initializeYouTubeVideos;

// Initial setup when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('YouTube API script loaded');
  
  // Do an initial initialization with whatever config is available
  // This will be updated later when the server config is fetched
  initializeYouTubeVideos();
});

/**
 * Fetch videos from a YouTube playlist using the server proxy
 * @param {string} playlistId - The YouTube playlist ID
 * @param {HTMLElement} container - The container to render videos into
 * @param {number} maxResults - Maximum number of videos to fetch
 */
function fetchPlaylistVideos(playlistId, container, maxResults = 6) {
  if (!playlistId || playlistId === 'YOUR_CRIMSON_COURT_PLAYLIST_ID' || 
      playlistId === 'YOUR_DM_ADVICE_PLAYLIST_ID' || playlistId === 'YOUR_FEATURED_PLAYLIST_ID') {
    // Display message if playlist ID is not set
    console.log('Playlist ID not configured, showing dummy videos');
    container.innerHTML = `
      <div class="api-key-message">
        <p>YouTube playlist ID not configured. Using preview mode with dummy videos.</p>
      </div>
    `;
    renderDummyVideos(container, maxResults);
    return;
  }

  // Use the server proxy endpoint
  const apiUrl = `${API_BASE_URL}/youtube/playlist/${playlistId}?maxResults=${maxResults}`;
  
  console.log(`Fetching videos from playlist via proxy: ${playlistId}`);
  
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Server response was not ok: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.error) {
        throw new Error(data.message || 'Error from server proxy');
      }
      console.log(`Successfully loaded ${data.items ? data.items.length : 0} videos`);
      renderVideos(data.items, container);
    })
    .catch(error => {
      console.error('Error fetching YouTube videos:', error);
      container.innerHTML = `
        <div class="api-key-message">
          <p>Error loading videos: ${error.message}</p>
          <p>Using preview mode with dummy videos instead.</p>
        </div>
      `;
      renderDummyVideos(container, maxResults);
    });
}

/**
 * Render YouTube videos to the container
 * @param {Array} videos - Array of video data from YouTube API
 * @param {HTMLElement} container - The container to render videos into
 */
function renderVideos(videos, container) {
  if (!videos || videos.length === 0) {
    container.innerHTML = '<p>No videos found.</p>';
    return;
  }
  
  container.innerHTML = '';
  
  videos.forEach(item => {
    const video = item.snippet;
    const videoId = video.resourceId.videoId;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Create video card
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    
    // Format date
    const publishedDate = new Date(video.publishedAt);
    const formattedDate = publishedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    videoCard.innerHTML = `
      <a href="${videoUrl}" target="_blank" class="video-thumbnail">
        <img src="${video.thumbnails.high.url}" alt="${video.title}">
      </a>
      <div class="video-info">
        <h3><a href="${videoUrl}" target="_blank">${video.title}</a></h3>
        <p>${video.description.substring(0, 100)}${video.description.length > 100 ? '...' : ''}</p>
        <div class="video-meta">
          <span>Published: ${formattedDate}</span>
        </div>
      </div>
    `;
    
    container.appendChild(videoCard);
  });
}

/**
 * Render dummy videos for development and preview purposes
 * @param {HTMLElement} container - The container to render videos into
 * @param {number} count - Number of dummy videos to render
 */
function renderDummyVideos(container, count) {
  console.log(`Rendering ${count} dummy videos`);
  
  const titles = [
    'The Crimson Court: Episode 1 - The Gathering Storm',
    'The Crimson Court: Episode 2 - Secrets of the Palace',
    'DM Advice: Creating Memorable NPCs',
    'DM Advice: Building Political Intrigue in Your Campaign',
    'The Crimson Court: Episode 3 - Betrayal at the Council',
    'DM Advice: Combat Strategies for Challenging Encounters'
  ];
  
  const descriptions = [
    'Our heroes meet for the first time as political tensions rise in the kingdom.',
    'The court politics intensify as our adventurers discover hidden alliances.',
    'Learn how to create NPCs that your players will remember long after the session ends.',
    'Add depth to your world with these political intrigue tips and tricks.',
    'A shocking betrayal changes everything for our heroes as they navigate the royal court.',
    'Make your combat encounters more dynamic and engaging with these DM tips.'
  ];
  
  container.innerHTML = '';
  
  for (let i = 0; i < Math.min(count, titles.length); i++) {
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    
    videoCard.innerHTML = `
      <a href="#" class="video-thumbnail">
        <img src="https://via.placeholder.com/320x180.png?text=Thumbnail+${i+1}" alt="${titles[i]}">
      </a>
      <div class="video-info">
        <h3><a href="#">${titles[i]}</a></h3>
        <p>${descriptions[i]}</p>
        <div class="video-meta">
          <span>Published: Jan ${i + 1}, 2025</span>
        </div>
      </div>
    `;
    
    container.appendChild(videoCard);
  }
}