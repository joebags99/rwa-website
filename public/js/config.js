/**
 * Roll With Advantage - Configuration
 * This file contains environment-specific configuration variables
 */

// Detect environment
const isProduction = window.location.hostname === 'rollwithadvantage.co' || window.location.hostname === 'www.rollwithadvantage.co';
const isStaging = window.location.hostname === 'staging.rollwithadvantage.co';
const isDevelopment = !isProduction && !isStaging;

// Environment-specific configuration
const environmentConfig = {
  development: {
    apiBaseUrl: '/api',
    siteBaseUrl: 'http://localhost:5000',
    channelId: 'YOUR_CHANNEL_ID',
    playlists: {
      crimsonCourt: 'YOUR_CRIMSON_COURT_PLAYLIST_ID',
      dmAdvice: 'YOUR_DM_ADVICE_PLAYLIST_ID',
      featured: 'YOUR_FEATURED_PLAYLIST_ID'
    },
    analyticsId: '',  // No analytics in development
    debug: true
  },
  staging: {
    apiBaseUrl: '/api',
    siteBaseUrl: 'https://staging.rollwithadvantage.co',
    channelId: 'YOUR_CHANNEL_ID',
    playlists: {
      crimsonCourt: 'YOUR_CRIMSON_COURT_PLAYLIST_ID',
      dmAdvice: 'YOUR_DM_ADVICE_PLAYLIST_ID',
      featured: 'YOUR_FEATURED_PLAYLIST_ID'
    },
    analyticsId: 'YOUR_STAGING_ANALYTICS_ID',
    debug: true
  },
  production: {
    apiBaseUrl: '/api',
    siteBaseUrl: 'https://rollwithadvantage.co',
    channelId: 'YOUR_CHANNEL_ID',
    playlists: {
      crimsonCourt: 'YOUR_CRIMSON_COURT_PLAYLIST_ID',
      dmAdvice: 'YOUR_DM_ADVICE_PLAYLIST_ID',
      featured: 'YOUR_FEATURED_PLAYLIST_ID'
    },
    analyticsId: 'YOUR_PROD_ANALYTICS_ID',
    debug: false
  }
};

// Load configuration based on environment
let activeConfig;
if (isProduction) {
  activeConfig = environmentConfig.production;
  
} else if (isStaging) {
  activeConfig = environmentConfig.staging;
  
} else {
  activeConfig = environmentConfig.development;
  
}

// Add common configuration that's the same across all environments
const commonConfig = {
  siteName: 'Roll With Advantage',
  videoMaxResults: 6,
  contactEmail: 'rollwithadvantage@gmail.com',
  socialLinks: {
    youtube: 'https://www.youtube.com/@RollWithAdvantage5e',
    twitch: 'https://www.twitch.tv/rollwithadvantage5e',
    instagram: 'https://www.instagram.com/rollwithadv5e/',
    discord: 'https://discord.gg/Yjx3vJzN5Q'
  }
};

// Create the merged configuration
window.RWA_CONFIG = {
  ...commonConfig,
  ...activeConfig
};

// Fetch configuration from the server
async function fetchServerConfig() {
  try {
    
    const response = await fetch(`${window.RWA_CONFIG.apiBaseUrl}/config`);
    if (!response.ok) {
      throw new Error(`Failed to fetch configuration from server: ${response.status} ${response.statusText}`);
    }
    const serverConfig = await response.json();
    
    
    
    // Update the config
    if (serverConfig.channelId) {
      window.RWA_CONFIG.channelId = serverConfig.channelId;
    }
    
    if (serverConfig.playlists) {
      window.RWA_CONFIG.playlists = serverConfig.playlists;
    }
    
    
    
    // Re-initialize YouTube videos if the function exists
    if (typeof window.initializeYouTubeVideos === 'function') {
      window.initializeYouTubeVideos();
    } else {
      console.warn('initializeYouTubeVideos function not found. Make sure youtube-api.js is loaded properly.');
    }
  } catch (error) {
    console.error('Error fetching server configuration:', error);
  }
}

// Call the function to fetch server config after a short delay to ensure other scripts are loaded
setTimeout(fetchServerConfig, 500);