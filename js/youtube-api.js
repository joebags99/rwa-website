/**
 * Roll With Advantage - YouTube API Integration
 * This file handles fetching and displaying YouTube videos from the channel
 */

// Import the configuration
import { config } from './config.js';

// Configuration from config.js
const YOUTUBE_API_KEY = config.youtubeApiKey;
const CHANNEL_ID = config.channelId;
const MAX_RESULTS = config.videoMaxResults;

// Playlist IDs from config.js
const PLAYLISTS = {
    CRIMSON_COURT: config.playlists.crimsonCourt,
    DM_ADVICE: config.playlists.dmAdvice,
    FEATURED: config.playlists.featured
};

document.addEventListener('DOMContentLoaded', function() {
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
});

/**
 * Fetch videos from a YouTube playlist
 * @param {string} playlistId - The YouTube playlist ID
 * @param {HTMLElement} container - The container to render videos into
 * @param {number} maxResults - Maximum number of videos to fetch
 */
function fetchPlaylistVideos(playlistId, container, maxResults = 6) {
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY') {
        // Display message if API key is not set
        container.innerHTML = `
            <div class="api-key-message">
                <p>To display YouTube videos, you need to set up your YouTube API key in youtube-api.js</p>
                <ol>
                    <li>Get an API key from the <a href="https://console.developers.google.com/" target="_blank">Google Developer Console</a></li>
                    <li>Enable the YouTube Data API v3</li>
                    <li>Replace 'YOUR_YOUTUBE_API_KEY' in youtube-api.js with your actual API key</li>
                </ol>
                <p>For testing purposes, here's what the content would look like:</p>
            </div>
        `;
        renderDummyVideos(container, maxResults);
        return;
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${maxResults}&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`;
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            renderVideos(data.items, container);
        })
        .catch(error => {
            console.error('Error fetching YouTube videos:', error);
            container.innerHTML = `<p>Error loading videos. Please try again later.</p>`;
            // Show dummy videos for development purposes
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
                <img src="assets/images/placeholder-thumbnail-${(i % 3) + 1}.jpg" alt="${titles[i]}">
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