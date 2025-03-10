/**
 * Roll With Advantage - Configuration
 * This file contains environment-specific configuration variables
 * 
 * Usage:
 * Import this file in your JavaScript files:
 * import { config } from './config.js';
 * 
 * Then use the variables:
 * const apiUrl = config.apiBaseUrl + '/endpoint';
 */

// Detect environment
const isProduction = window.location.hostname === 'rollwithadvantage.com' || window.location.hostname === 'www.rollwithadvantage.com';
const isStaging = window.location.hostname === 'staging.rollwithadvantage.com';
const isDevelopment = !isProduction && !isStaging;

// Environment-specific configuration
const environmentConfig = {
  development: {
    apiBaseUrl: 'http://localhost:5000/api',
    siteBaseUrl: 'http://localhost:5000',
    youtubeApiKey: 'YOUR_DEV_YOUTUBE_API_KEY',
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
    apiBaseUrl: 'https://staging.rollwithadvantage.com/api',
    siteBaseUrl: 'https://staging.rollwithadvantage.com',
    youtubeApiKey: 'YOUR_STAGING_YOUTUBE_API_KEY',
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
    apiBaseUrl: 'https://rollwithadvantage.com/api',
    siteBaseUrl: 'https://rollwithadvantage.com',
    youtubeApiKey: 'YOUR_PROD_YOUTUBE_API_KEY',
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
  console.log('Running in production environment');
} else if (isStaging) {
  activeConfig = environmentConfig.staging;
  console.log('Running in staging environment');
} else {
  activeConfig = environmentConfig.development;
  console.log('Running in development environment');
}

// Add common configuration that's the same across all environments
const commonConfig = {
  siteName: 'Roll With Advantage',
  videoMaxResults: 6,
  contactEmail: 'info@rollwithadvantage.com',
  socialLinks: {
    youtube: 'https://www.youtube.com/@RollWithAdvantage5e',
    twitch: 'https://www.twitch.tv/rollwithadvantage5e',
    instagram: 'https://www.instagram.com/rollwithadv5e/',
    discord: 'https://discord.gg/Yjx3vJzN5Q'
  }
};

// Export the merged configuration
export const config = {
  ...commonConfig,
  ...activeConfig
};

// For backwards compatibility with non-module scripts
window.RWA_CONFIG = config;