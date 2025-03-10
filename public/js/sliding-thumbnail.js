/**
 * Sliding Overlay Effect
 * 
 * This script creates a sliding overlay effect that reveals a gradient and play button
 * over the video thumbnail when hovered.
 */

/**
 * Initialize the sliding overlay effect for all video cards
 */
function initializeSlidingThumbnails() {
    console.log('Initializing sliding overlays...');
    
    const videoCards = document.querySelectorAll('.video-card');
    let processedCount = 0;
    
    videoCards.forEach(card => {
        const thumbnail = card.querySelector('.video-thumbnail');
        if (!thumbnail) {
            console.warn('No .video-thumbnail found in a video card');
            return;
        }
        
        const img = thumbnail.querySelector('img');
        if (!img) {
            console.warn('No img found in .video-thumbnail');
            return;
        }
        
        // Remove any existing overlay to avoid duplicates
        const existingOverlay = thumbnail.querySelector('.thumbnail-preview');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // Create the sliding overlay element
        const slidingOverlay = document.createElement('div');
        slidingOverlay.className = 'thumbnail-preview';
        
        // Create a play icon for the overlay
        const playIcon = document.createElement('i');
        playIcon.className = 'fas fa-play-circle thumbnail-preview-play';
        slidingOverlay.appendChild(playIcon);
        
        // Add the overlay to the thumbnail container
        thumbnail.appendChild(slidingOverlay);
        
        processedCount++;
        console.log(`Added overlay ${processedCount}`);
    });
    
    console.log(`Processed ${processedCount} video thumbnails with sliding overlay effect`);
    
    // Set up click event for sliding overlays
    document.addEventListener('click', function(e) {
        // Check if the clicked element is a sliding overlay or part of it
        const slidingOverlay = e.target.closest('.thumbnail-preview');
        if (slidingOverlay) {
            const card = slidingOverlay.closest('.video-card');
            if (!card) return;
            
            const thumbnailLink = card.querySelector('.video-thumbnail');
            if (!thumbnailLink) return;
            
            // Get the link's href
            const href = thumbnailLink.getAttribute('href');
            if (href && href !== '#') {
                // Open the video link
                window.open(href, '_blank');
            } else {
                console.log('Video link is not available or is a placeholder');
            }
        }
    });
}

/**
 * Reinitialize overlays (useful after dynamic content updates)
 */
function refreshSlidingThumbnails() {
    // Find and remove any existing sliding overlays
    const existingOverlays = document.querySelectorAll('.thumbnail-preview');
    existingOverlays.forEach(overlay => overlay.remove());
    
    // Reinitialize
    initializeSlidingThumbnails();
}

// Make functions globally available
window.initializeSlidingThumbnails = initializeSlidingThumbnails;
window.refreshSlidingThumbnails = refreshSlidingThumbnails;