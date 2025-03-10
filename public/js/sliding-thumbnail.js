/**
 * Sliding Thumbnail Effect
 * 
 * This script creates a sliding thumbnail effect that reveals the thumbnail
 * image from behind the video card when hovered.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure thumbnails are loaded
    setTimeout(initializeSlidingThumbnails, 300);
});

/**
 * Initialize the sliding thumbnail effect for all video cards
 */
function initializeSlidingThumbnails() {
    console.log('Initializing sliding thumbnails...');
    
    const videoCards = document.querySelectorAll('.video-card');
    let processedCount = 0;
    
    videoCards.forEach(card => {
        const thumbnail = card.querySelector('.video-thumbnail');
        if (!thumbnail) return;
        
        const img = thumbnail.querySelector('img');
        if (!img) return;
        
        // Get the current image source
        const imgSrc = img.src;
        
        // Create the sliding thumbnail element
        const slidingThumbnail = document.createElement('div');
        slidingThumbnail.className = 'thumbnail-preview';
        slidingThumbnail.style.backgroundImage = `url('${imgSrc}')`;
        
        // Create a play icon for the sliding thumbnail
        const playIcon = document.createElement('i');
        playIcon.className = 'fas fa-play-circle thumbnail-preview-play';
        slidingThumbnail.appendChild(playIcon);
        
        // Add the sliding thumbnail to the thumbnail container
        thumbnail.appendChild(slidingThumbnail);
        
        // Track the number of successfully processed cards
        processedCount++;
        
        // Preload the image to ensure it's ready when needed
        const preloadImg = new Image();
        preloadImg.src = imgSrc;
        preloadImg.onload = function() {
            // Remove any loading indicator once properly loaded
            thumbnail.classList.remove('loading');
            slidingThumbnail.classList.add('loaded');
        };
        
        // Add error handling
        preloadImg.onerror = function() {
            console.warn(`Failed to load thumbnail: ${imgSrc}`);
            slidingThumbnail.style.backgroundImage = "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUAAAAC0CAMAAADROZcIAAAAMFBMVEXy8vL6+vr19fX4+Pjt7e3v7+/r6+v29vb8/Pzp6eno6Oj7+/vz8/Px8fHu7u7q6urfXciFAAACFUlEQVR4nO3a61LDIBCA0YY2Ul/3f7Ga6YxttOhaDsGZ5ftlQnYJEJMQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAZ5jQJIaQ0jV3H3GrXAVSTPXIdc4vvOoA08sBjq5nHXceHrDyy2Hrby04DKOqRh6pHbtN1AFnLI4stu8suA0hdB1BnPPKr6/dBjxxejWXeZQA+hqHrAGq6G8u86wD2m17/G0t9Ky3xysV39XfyRlz//AZVebzSLO887wcBAAAAAAAAAAAAAID3YuO49K6/1D2t93DXW3T5tW3b9vq75qp52TaWaTR5qbcMdbxnGT+Wsc01QI90a8cRzrK8lNvE+FjmFnmpu92tbeRHo5vj0g8w9pj9GDfywy0R+jLjSJkfJZnxrOG6PuNXfLBr4cdGkZ9mHKh4udv11IvnMbpd6LvOIu/1I75Jkb/OLnHPNznyGd+a3fTF+hSJvf8y7kMvQ4/uUVvJzMa3O6RY5Ne9xUfxrTRN0x+qNnnKbwxLmbMsPXzwVxWnPLk8yfE/bv1+C3PxxdcU+aLrPlPkC6XkPi9ZfrxSfmD8kOUbCwAAAAAAAAAAAAAAb+/8+YXz1ydenF7/euT4sU9+6Lv4AZc/gn3m/MsXJa+Dj19/EjlfvNKYpnl+c+KVqXn98+nnbxM//wWv8O/56S8JAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAnfQPuQgV9cnTEJQAAAABJRU5ErkJggg==')";
            thumbnail.classList.remove('loading');
        };
    });
    
    console.log(`Processed ${processedCount} video thumbnails with sliding effect`);

    // Set up click event for sliding thumbnails
    document.addEventListener('click', function(e) {
        // Check if the clicked element is a sliding thumbnail or part of it
        const slidingThumbnail = e.target.closest('.thumbnail-preview');
        if (slidingThumbnail) {
            const card = slidingThumbnail.closest('.video-card');
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
 * Reinitialize thumbnails (useful after dynamic content updates)
 */
function refreshSlidingThumbnails() {
    // Find and remove any existing sliding thumbnails
    const existingThumbnails = document.querySelectorAll('.thumbnail-preview');
    existingThumbnails.forEach(thumbnail => thumbnail.remove());
    
    // Reinitialize
    initializeSlidingThumbnails();
}

// Make functions globally available
window.initializeSlidingThumbnails = initializeSlidingThumbnails;
window.refreshSlidingThumbnails = refreshSlidingThumbnails;