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
  setTimeout(initializeYouTubeVideos, 300); // Small delay to ensure config is loaded
});

/**
 * Fetch videos from a YouTube playlist using the server proxy
 * @param {string} playlistId - The YouTube playlist ID
 * @param {HTMLElement} container - The container to render videos into
 * @param {number} maxResults - Maximum number of videos to fetch
 */
function fetchPlaylistVideos(playlistId, container, maxResults = 6) {
  // Show loading state
  container.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner-d20">
        <div class="spinner-inner"></div>
      </div>
      <p>Loading videos...</p>
    </div>
  `;

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
      
      // Log for debugging
      console.log(`Successfully loaded ${data.items ? data.items.length : 0} videos`);
      
      // Inspect the first item to understand its structure (helpful for debugging)
      if (data.items && data.items.length > 0) {
        console.log('First video item example:', data.items[0]);
      }
      
      // Render the videos
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
 * Helper function to inspect YouTube API response
 */
function inspectYouTubeResponse(data) {
  console.log('YouTube API Response Structure:');
  console.log(data);
  
  if (data.items && data.items.length > 0) {
    const firstItem = data.items[0];
    console.log('First Item Structure:');
    console.log(firstItem);
    
    if (firstItem.snippet) {
      console.log('Snippet Structure:');
      console.log(firstItem.snippet);
      
      if (firstItem.snippet.thumbnails) {
        console.log('Available Thumbnail Types:');
        console.log(Object.keys(firstItem.snippet.thumbnails));
        
        Object.keys(firstItem.snippet.thumbnails).forEach(type => {
          console.log(`Thumbnail Type: ${type}`);
          console.log(firstItem.snippet.thumbnails[type]);
        });
      } else {
        console.log('No thumbnails available in the snippet');
      }
    }
  }
}

/**
 * Improved function to render YouTube videos to the container
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
    
    // Create the HTML structure with image onload and onerror handlers
    videoCard.innerHTML = `
      <a href="${videoUrl}" target="_blank" class="video-thumbnail loading">
        <img 
          src="${getThumbnailUrl(video, videoId)}" 
          alt="${video.title}" 
          onload="this.parentNode.classList.remove('loading')" 
          onerror="handleThumbnailError(this, '${videoId}')"
        >
      </a>
      <div class="video-info">
        <h3><a href="${videoUrl}" target="_blank">${video.title}</a></h3>
        <p>${video.description ? (video.description.substring(0, 100) + (video.description.length > 100 ? '...' : '')) : 'No description available.'}</p>
        <div class="video-meta">
          <span>Published: ${formattedDate}</span>
        </div>
      </div>
    `;
    
    container.appendChild(videoCard);
  });
  
  console.log(`Rendered ${videos.length} videos to container`);
  
  // Initialize video preview functionality after a short delay to ensure DOM is updated
  setTimeout(() => {
    // First enhance with preview functionality
    if (typeof enhanceVideoThumbnails === 'function') {
      console.log('Enhancing video thumbnails...');
      enhanceVideoThumbnails();
    } else {
      console.warn('enhanceVideoThumbnails function not available');
    }
    
    // Then apply sliding effect
    if (typeof initializeSlidingThumbnails === 'function') {
      console.log('Initializing sliding thumbnails...');
      initializeSlidingThumbnails();
    }
  }, 300);
}

/**
 * Helper function to get the best available thumbnail URL
 * @param {Object} video - Video snippet from API
 * @param {String} videoId - YouTube video ID
 * @returns {String} URL of the best available thumbnail
 */
function getThumbnailUrl(video, videoId) {
  // First check if thumbnails are available in the API response
  if (video.thumbnails) {
    // Try each thumbnail size in order of preference
    if (video.thumbnails.maxres) return video.thumbnails.maxres.url;
    if (video.thumbnails.high) return video.thumbnails.high.url;
    if (video.thumbnails.medium) return video.thumbnails.medium.url;
    if (video.thumbnails.standard) return video.thumbnails.standard.url;
    if (video.thumbnails.default) return video.thumbnails.default.url;
  }
  
  // Log for debugging
  console.log(`Using direct YouTube thumbnail URL for video ${videoId}`);
  
  // Fall back to direct YouTube thumbnail URL format
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Handle thumbnail loading errors
 * @param {HTMLImageElement} img - The image element that failed to load
 * @param {String} videoId - YouTube video ID
 */
function handleThumbnailError(img, videoId) {
  console.warn(`Failed to load thumbnail for video ID: ${videoId}`);
  
  // Try a different YouTube thumbnail format
  img.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  
  // If that also fails, use a placeholder
  img.onerror = function() {
    console.warn(`Still failed to load thumbnail for ${videoId}, using placeholder`);
    img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUAAAAC0CAMAAADROZcIAAAAMFBMVEXy8vL6+vr19fX4+Pjt7e3v7+/r6+v29vb8/Pzp6eno6Oj7+/vz8/Px8fHu7u7q6urfXciFAAACFUlEQVR4nO3a61LDIBCA0YY2Ul/3f7Ga6YxttOhaDsGZ5ftlQnYJEJMQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAZ5jQJIaQ0jV3H3GrXAVSTPXIdc4vvOoA08sBjq5nHXceHrDyy2Hrby04DKOqRh6pHbtN1AFnLI4stu8suA0hdB1BnPPKr6/dBjxxejWXeZQA+hqHrAGq6G8u86wD2m17/G0t9Ky3xysV39XfyRlz//AZVebzSLO887wcBAAAAAAAAAAAAAID3YuO49K6/1D2t93DXW3T5tW3b9vq75qp52TaWaTR5qbcMdbxnGT+Wsc01QI90a8cRzrK8lNvE+FjmFnmpu92tbeRHo5vj0g8w9pj9GDfywy0R+jLjSJkfJZnxrOG6PuNXfLBr4cdGkZ9mHKh4udv11IvnMbpd6LvOIu/1I75Jkb/OLnHPNznyGd+a3fTF+hSJvf8y7kMvQ4/uUVvJzMa3O6RY5Ne9xUfxrTRN0x+qNnnKbwxLmbMsPXzwVxWnPLk8yfE/bv1+C3PxxdcU+aLrPlPkC6XkPi9ZfrxSfmD8kOUbCwAAAAAAAAAAAAAAb+/8+YXz1ydenF7/euT4sU9+6Lv4AZc/gn3m/MsXJa+Dj19/EjlfvNKYpnl+c+KVqXn98+nnbxM//wWv8O/56S8JAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAnfQPuQgV9cnTEJQAAAABJRU5ErkJggg==';
    img.onerror = null;
    
    // Remove loading class from parent
    if (img.parentNode) {
      img.parentNode.classList.remove('loading');
    }
  };
  
  // Remove loading class if image has a parent
  if (img.parentNode) {
    img.parentNode.classList.remove('loading');
  }
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
  
  // Base64 encoded placeholder image (small 320x180 gray rectangle with text)
  const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUAAAAC0CAMAAADROZcIAAAAMFBMVEXy8vL6+vr19fX4+Pjt7e3v7+/r6+v29vb8/Pzp6eno6Oj7+/vz8/Px8fHu7u7q6urfXciFAAACFUlEQVR4nO3a61LDIBCA0YY2Ul/3f7Ga6YxttOhaDsGZ5ftlQnYJEJMQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAZ5jQJIaQ0jV3H3GrXAVSTPXIdc4vvOoA08sBjq5nHXceHrDyy2Hrby04DKOqRh6pHbtN1AFnLI4stu8suA0hdB1BnPPKr6/dBjxxejWXeZQA+hqHrAGq6G8u86wD2m17/G0t9Ky3xysV39XfyRlz//AZVebzSLO887wcBAAAAAAAAAAAAAID3YuO49K6/1D2t93DXW3T5tW3b9vq75qp52TaWaTR5qbcMdbxnGT+Wsc01QI90a8cRzrK8lNvE+FjmFnmpu92tbeRHo5vj0g8w9pj9GDfywy0R+jLjSJkfJZnxrOG6PuNXfLBr4cdGkZ9mHKh4udv11IvnMbpd6LvOIu/1I75Jkb/OLnHPNznyGd+a3fTF+hSJvf8y7kMvQ4/uUVvJzMa3O6RY5Ne9xUfxrTRN0x+qNnnKbwxLmbMsPXzwVxWnPLk8yfE/bv1+C3PxxdcU+aLrPlPkC6XkPi9ZfrxSfmD8kOUbCwAAAAAAAAAAAAAAb+/8+YXz1ydenF7/euT4sU9+6Lv4AZc/gn3m/MsXJa+Dj19/EjlfvNKYpnl+c+KVqXn98+nnbxM//wWv8O/56S8JAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAnfQPuQgV9cnTEJQAAAABJRU5ErkJggg==';
  
  // Indexed placeholder images with text
  const thumbnailTexts = [
    'The Gathering Storm', 
    'Palace Secrets', 
    'Memorable NPCs', 
    'Political Intrigue', 
    'Council Betrayal', 
    'Combat Strategies'
  ];
  
  container.innerHTML = '';
  
  for (let i = 0; i < Math.min(count, titles.length); i++) {
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    
    videoCard.innerHTML = `
      <a href="#" class="video-thumbnail">
        <img src="${placeholderImage}" alt="${titles[i]}">
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
  
  // Initialize video thumbnail previews with slight delay
  setTimeout(() => {
    if (window.enhanceVideoThumbnails) {
      console.log('Enhancing dummy video thumbnails...');
      window.enhanceVideoThumbnails();
    }
  }, 300);
}

// Make these functions available globally
window.renderVideos = renderVideos;
window.getThumbnailUrl = getThumbnailUrl;
window.handleThumbnailError = handleThumbnailError;
window.fetchPlaylistVideos = fetchPlaylistVideos;
window.inspectYouTubeResponse = inspectYouTubeResponse;