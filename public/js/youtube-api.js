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
  
  
  
  
  
  // Load featured videos on the homepage
  const featuredVideosContainer = document.getElementById('featured-videos');
  if (featuredVideosContainer) {
    
    fetchPlaylistVideos(PLAYLISTS.FEATURED, featuredVideosContainer, MAX_RESULTS);
  }
  
  // Load Crimson Court videos on the homepage
  const crimsonCourtContainer = document.getElementById('crimson-court-videos');
  if (crimsonCourtContainer) {
    
    fetchPlaylistVideos(PLAYLISTS.CRIMSON_COURT, crimsonCourtContainer, MAX_RESULTS);
  }
  
  // Load DM advice videos on the homepage
  const dmAdviceContainer = document.getElementById('dm-advice-videos');
  if (dmAdviceContainer) {
    
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

  if (!playlistId || String(playlistId).startsWith('YOUR_')) {
    // Playlist not configured yet - show a real link to YouTube instead of fake videos
    renderYouTubeFallback(container, playlistId);
    return;
  }

  // Use the server proxy endpoint
  const apiUrl = `${API_BASE_URL}/youtube/playlist/${playlistId}?maxResults=${maxResults}`;
  
  
  
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
      
      
      // Inspect the first item to understand its structure (helpful for debugging)
      if (data.items && data.items.length > 0) {
        
      }
      
      // Render the videos
      renderVideos(data.items, container);
    })
    .catch(error => {
      console.error('Error fetching YouTube videos:', error);
      // Never show fake episodes - fall back to a real "Watch on YouTube" link
      renderYouTubeFallback(container, playlistId);
    });
}

/**
 * Helper function to inspect YouTube API response
 */
function inspectYouTubeResponse(data) {
  
  
  
  if (data.items && data.items.length > 0) {
    const firstItem = data.items[0];
    
    
    
    if (firstItem.snippet) {
      
      
      
      if (firstItem.snippet.thumbnails) {
        
        
        
        Object.keys(firstItem.snippet.thumbnails).forEach(type => {
          
          
        });
      } else {
        
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
    renderYouTubeFallback(container);
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
  
  
  
  // Initialize video preview functionality after a short delay to ensure DOM is updated
  setTimeout(() => {
    // First enhance with preview functionality
    if (typeof enhanceVideoThumbnails === 'function') {
      
      enhanceVideoThumbnails();
    } else {
      console.warn('enhanceVideoThumbnails function not available');
    }
    
    // Then apply sliding effect
    if (typeof initializeSlidingThumbnails === 'function') {
      
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
 * Render a real "Watch on YouTube" fallback when videos can't be loaded.
 * Never shows fake/dummy episodes - links to the real playlist or channel.
 * @param {HTMLElement} container - The container to render into
 * @param {string} [playlistId] - The playlist to link to (falls back to the channel)
 */
function renderYouTubeFallback(container, playlistId) {
  const cfg = window.RWA_CONFIG || {};
  const channelUrl = (cfg.socialLinks && cfg.socialLinks.youtube) || 'https://www.youtube.com/@RollWithAdvantage5e';
  const isRealPlaylist = playlistId && !String(playlistId).startsWith('YOUR_');
  const destination = isRealPlaylist
    ? `https://www.youtube.com/playlist?list=${playlistId}`
    : channelUrl;

  container.innerHTML = `
    <div class="youtube-fallback">
      <i class="fab fa-youtube youtube-fallback-icon" aria-hidden="true"></i>
      <h3>Watch on YouTube</h3>
      <p>Catch our latest episodes and videos over on our YouTube channel.</p>
      <a href="${destination}" target="_blank" rel="noopener" class="btn btn-primary magical-btn youtube-fallback-btn" data-yt-cta="fallback">
        <span class="btn-text"><i class="fab fa-youtube" aria-hidden="true"></i> Watch on YouTube</span>
      </a>
    </div>
  `;
}

// Deprecated: dummy/preview videos are no longer shown. Any legacy callers now
// get the real "Watch on YouTube" fallback instead of fake episodes.
function renderDummyVideos(container) {
  renderYouTubeFallback(container);
}

// Make these functions available globally
window.renderVideos = renderVideos;
window.getThumbnailUrl = getThumbnailUrl;
window.handleThumbnailError = handleThumbnailError;
window.fetchPlaylistVideos = fetchPlaylistVideos;
window.inspectYouTubeResponse = inspectYouTubeResponse;
window.renderYouTubeFallback = renderYouTubeFallback;