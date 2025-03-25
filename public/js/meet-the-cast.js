/**
 * Roll With Advantage - Meet the Cast Page JavaScript
 * Handles the card flip animations and other interactive elements
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the card flip functionality
    initializeCardFlips();
    
    // Add floating elements animation if on larger screens
    if (!document.body.classList.contains('mobile-device')) {
        addFloatingElements();
    }
    
    // Initialize the video carousel immediately with direct method
    // No need to wait for server config since we're using direct API call
    initializeVideoCarousel();
});

/**
 * Initialize the card flip animation for all cast members
 */
function initializeCardFlips() {
    const flipCards = document.querySelectorAll('.card-flipper');
    
    flipCards.forEach(card => {
        card.addEventListener('click', function() {
            // Play a card flip sound if available
            const flipSound = document.getElementById('card-flip-sound');
            if (flipSound) {
                flipSound.currentTime = 0;
                flipSound.play().catch(e => {
                    // Handling autoplay restrictions
                    console.log('Audio play prevented:', e);
                });
            }
            
            // Toggle the flip class
            this.classList.toggle('flip');
            
            // Add some magical particles around the card when flipped
            createFlipParticles(this);
        });
    });
    
    console.log(`Initialized ${flipCards.length} flip cards`);
}

/**
 * Create particles effect when a card is flipped
 */
function createFlipParticles(card) {
    // Skip on mobile for performance
    if (document.body.classList.contains('mobile-device')) return;
    
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Create container for particles if it doesn't exist
    let particlesContainer = document.getElementById('flip-particles-container');
    if (!particlesContainer) {
        particlesContainer = document.createElement('div');
        particlesContainer.id = 'flip-particles-container';
        particlesContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(particlesContainer);
    }
    
    // Determine particle color based on which character's card is flipped
    let particleColors = [
        'rgba(11, 42, 169, 0.7)',   // Primary blue
        'rgba(127, 14, 189, 0.7)',  // Primary purple
        'rgba(195, 10, 61, 0.7)'    // Primary red
    ];
    
    // Create particles
    for (let i = 0; i < 20; i++) {
        createParticle(particlesContainer, centerX, centerY, particleColors);
    }
}

/**
 * Create a single particle for the flip effect
 */
function createParticle(container, x, y, colors) {
    if (!container || !colors || !Array.isArray(colors) || colors.length === 0) {
        console.warn('Invalid parameters for createParticle');
        return;
    }
    
    const particle = document.createElement('div');
    
    // Random properties
    const size = Math.random() * 10 + 5; // 5-15px
    const color = colors[Math.floor(Math.random() * colors.length)];
    const angle = Math.random() * 360; // 0-360 degrees
    const distance = Math.random() * 100 + 50; // 50-150px
    const duration = Math.random() * 1.5 + 0.5; // 0.5-2s
    
    // Calculate end position
    const radians = angle * (Math.PI / 180);
    const endX = x + Math.cos(radians) * distance;
    const endY = y + Math.sin(radians) * distance;
    
    // Apply styles
    particle.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        left: ${x}px;
        top: ${y}px;
        opacity: 0.8;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 9999;
        transition: all ${duration}s ease-out;
    `;
    
    container.appendChild(particle);
    
    // Animate to end position
    setTimeout(() => {
        particle.style.left = `${endX}px`;
        particle.style.top = `${endY}px`;
        particle.style.opacity = '0';
        particle.style.width = `${size / 2}px`;
        particle.style.height = `${size / 2}px`;
        
        // Remove particle after animation completes
        setTimeout(() => {
            particle.remove();
        }, duration * 1000);
    }, 10);
}

/**
 * Add floating D20 dice to the hero section
 */
function addFloatingElements() {
    const container = document.querySelector('.floating-dice-container');
    if (!container) return;
    
    // Create character-themed floating elements
    const elements = [
        { icon: 'crown', className: 'floating-icon crown' }, // Talon/Joe
        { icon: 'shield', className: 'floating-icon shield' }, // Edwinn/Jon
        { icon: 'fire', className: 'floating-icon fire' }, // Xanthe/Gemma
        { icon: 'moon', className: 'floating-icon moon' }, // Cailynn/Kayla
        { icon: 'bolt', className: 'floating-icon bolt' }, // Marik/Ryan
        { icon: 'star', className: 'floating-icon star' }, // Octavia/Felicity
        { icon: 'dice-d20', className: 'floating-icon d20' }, // Generic D&D
        { icon: 'book', className: 'floating-icon book' }, // Story
    ];
    
    // Add each element to the container
    elements.forEach(element => {
        for (let i = 0; i < 2; i++) { // Add two of each
            const el = document.createElement('div');
            el.className = element.className;
            el.innerHTML = `<i class="fas fa-${element.icon}"></i>`;
            
            // Random position, size and animation
            const size = Math.random() * 30 + 20; // 20-50px
            const posX = Math.random() * 100; // 0-100%
            const posY = Math.random() * 100; // 0-100%
            const delay = Math.random() * 5; // 0-5s
            const duration = Math.random() * 10 + 10; // 10-20s
            
            el.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${posX}%;
                top: ${posY}%;
                color: rgba(251, 251, 215, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: ${size * 0.8}px;
                animation: floatElement ${duration}s ease-in-out ${delay}s infinite;
                text-shadow: 0 0 ${size/4}px rgba(127, 14, 189, 0.5);
            `;
            
            container.appendChild(el);
        }
    });
    
    // Add floating animation if it doesn't exist
    if (!document.getElementById('float-animation')) {
        const style = document.createElement('style');
        style.id = 'float-animation';
        style.innerHTML = `
            @keyframes floatElement {
                0%, 100% {
                    transform: translateY(0) rotate(0deg);
                }
                25% {
                    transform: translateY(-20px) rotate(5deg);
                }
                50% {
                    transform: translateY(0) rotate(0deg);
                }
                75% {
                    transform: translateY(20px) rotate(-5deg);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Handle image loading errors for cast and character images
 */
window.handleImageError = function(img) {
    console.warn(`Failed to load image: ${img.src}`);
    
    // Set to placeholder image
    img.src = '/assets/images/placeholder-character.jpg';
    
    // Add error class for styling
    img.classList.add('image-error');
    
    // Add error message
    const parent = img.closest('.image-container');
    if (parent) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'image-error-message';
        errorMsg.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Image unavailable';
        parent.appendChild(errorMsg);
    }
};

/**
 * Initialize the video carousel for Crimson Court episodes
 * Special direct approach for the YouTube API
 */
function initializeVideoCarousel() {
    const carouselContainer = document.getElementById('crimson-court-carousel');
    if (!carouselContainer) return;
    
    console.log('Initializing Crimson Court video carousel - Direct Method');
    
    // Get the correct playlist ID - hardcoding for reliability
    const crimsonCourtPlaylistId = 'PLul61JiSKZm_AKoWZ8KzcFF4J1FcaCpuo';
    
    console.log('Using hardcoded Crimson Court playlist ID:', crimsonCourtPlaylistId);
    
    // Prepare carousel for videos
    carouselContainer.classList.add('carousel-layout');
    
    // Show loading state
    carouselContainer.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner-d20 crimson-spinner">
                <div class="spinner-inner"></div>
            </div>
            <p>Loading Crimson Court episodes...</p>
        </div>
    `;
    
    // Make a direct API request to our server endpoint
    try {
        console.log('Making direct API request to server endpoint');
        // Use the server proxy endpoint
        const apiUrl = `/api/youtube/playlist/${crimsonCourtPlaylistId}?maxResults=8`;
        
        // Fetch the videos directly
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server response not ok: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    throw new Error(data.message || 'Error from server proxy');
                }
                
                console.log(`Received ${data.items ? data.items.length : 0} videos from API`);
                
                // Render the videos
                renderCarouselVideos(data.items, carouselContainer);
                
                // Set up carousel navigation
                setupCarouselNavigation();
            })
            .catch(error => {
                console.error('Error fetching YouTube data:', error);
                renderPlaceholderVideos(carouselContainer);
                setupCarouselNavigation();
            });
    } catch (error) {
        console.error('Error in initialization:', error);
        renderPlaceholderVideos(carouselContainer);
        setupCarouselNavigation();
    }
}

/**
 * Convert the standard video cards rendered by fetchPlaylistVideos to carousel items
 */
function convertToCarouselItems(container) {
    if (!container) return;
    
    console.log('Converting video cards to carousel items');
    
    // Select all standard video cards that were rendered by the YouTube API
    const videoCards = container.querySelectorAll('.video-card');
    
    if (videoCards.length === 0) {
        console.warn('No video cards found to convert to carousel items');
        return;
    }
    
    console.log(`Found ${videoCards.length} video cards to convert`);
    
    // Apply carousel-specific classes and styles
    videoCards.forEach(card => {
        card.classList.add('carousel-item');
    });
    
    // Add sliding behavior with left/right arrows
    const nav = document.querySelector('.carousel-controls');
    if (nav) nav.style.display = 'flex';
}

/**
 * Render videos in the carousel format
 * @param {Array} videos - Array of video data
 * @param {HTMLElement} container - Container element
 */
function renderCarouselVideos(videos, container) {
    if (!videos || videos.length === 0) {
        renderPlaceholderVideos(container);
        return;
    }
    
    console.log(`Rendering ${videos.length} videos to carousel`);
    container.innerHTML = '';
    
    videos.forEach(video => {
        try {
            const videoId = video.snippet?.resourceId?.videoId || video.id?.videoId;
            if (!videoId) {
                console.warn('Video is missing ID:', video);
                return;
            }
            
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            // Use our local getThumbnailUrl function, not the window one
            const thumbnailUrl = getThumbnailUrl(video.snippet, videoId);
            const title = video.snippet?.title || 'Crimson Court Episode';
            const publishedDate = new Date(video.snippet?.publishedAt || Date.now());
            const formattedDate = publishedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            const videoCard = document.createElement('div');
            videoCard.className = 'video-card carousel-item';
            
            videoCard.innerHTML = `
                <a href="${videoUrl}" target="_blank" class="video-thumbnail">
                    <img 
                        src="${thumbnailUrl}" 
                        alt="${title}" 
                        onerror="this.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUAAAAC0CAMAAADROZcIAAAAMFBMVEXy8vL6+vr19fX4+Pjt7e3v7+/r6+v29vb8/Pzp6eno6Oj7+/vz8/Px8fHu7u7q6urfXciFAAACFUlEQVR4nO3a61LDIBCA0YY2Ul/3f7Ga6YxttOhaDsGZ5ftlQnYJEJMQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAZ5jQJIaQ0jV3H3GrXAVSTPXIdc4vvOoA08sBjq5nHXceHrDyy2Hrby04DKOqRh6pHbtN1AFnLI4stu8suA0hdB1BnPPKr6/dBjxxejWXeZQA+hqHrAGq6G8u86wD2m17/G0t9Ky3xysV39XfyRlz//AZVebzSLO887wcBAAAAAAAAAAAAAID3YuO49K6/1D2t93DXW3T5tW3b9vq75qp52TaWaTR5qbcMdbxnGT+Wsc01QI90a8cRzrK8lNvE+FjmFnmpu92tbeRHo5vj0g8w9pj9GDfywy0R+jLjSJkfJZnxrOG6PuNXfLBr4cdGkZ9mHKh4udv11IvnMbpd6LvOIu/1I75Jkb/OLnHPNznyGd+a3fTF+hSJvf8y7kMvQ4/uUVvJzMa3O6RY5Ne9xUfxrTRN0x+qNnnKbwxLmbMsPXzwVxWnPLk8yfE/bv1+C3PxxdcU+aLrPlPkC6XkPi9ZfrxSfmD8kOUbCwAAAAAAAAAAAAAAb+/8+YXz1ydenF7/euT4sU9+6Lv4AZc/gn3m/MsXJa+Dj19/EjlfvNKYpnl+c+KVqXn98+nnbxM//wWv8O/56S8JAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAnfQPuQgV9cnTEJQAAAABJRU5ErkJggg=='"
                    >
                    <div class="thumbnail-preview">
                        <i class="fas fa-play-circle thumbnail-preview-play"></i>
                    </div>
                </a>
                <div class="video-info">
                    <h3><a href="${videoUrl}" target="_blank">${title}</a></h3>
                    <div class="video-meta">
                        <span>Published: ${formattedDate}</span>
                    </div>
                </div>
            `;
            
            container.appendChild(videoCard);
        } catch (error) {
            console.error('Error rendering video:', error);
        }
    });
    
    // Apply sliding overlay effect if available
    if (typeof window.initializeSlidingThumbnails === 'function') {
        setTimeout(() => {
            window.initializeSlidingThumbnails();
        }, 500);
    }
}

/**
 * Render placeholder videos for development or when API fails
 * @param {HTMLElement} container - Container element
 */
function renderPlaceholderVideos(container) {
    if (!container) return;
    
    console.log('Rendering placeholder Crimson Court videos');
    // Clear any existing content
    container.innerHTML = '';
    
    const episodes = [
        'The Gathering Storm',
        'Secrets of the Palace',
        'Royal Intrigue',
        'The Council Meeting',
        'Betrayal at Court',
        'The Shadow Rises',
        'Family Bonds',
        'The Journey Begins'
    ];
    
    episodes.forEach((title, index) => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card placeholder';
        
        const videoUrl = '#';
        const placeholderUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUAAAAC0CAMAAADROZcIAAAAMFBMVEXy8vL6+vr19fX4+Pjt7e3v7+/r6+v29vb8/Pzp6eno6Oj7+/vz8/Px8fHu7u7q6urfXciFAAACFUlEQVR4nO3a61LDIBCA0YY2Ul/3f7Ga6YxttOhaDsGZ5ftlQnYJEJMQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAZ5jQJIaQ0jV3H3GrXAVSTPXIdc4vvOoA08sBjq5nHXceHrDyy2Hrby04DKOqRh6pHbtN1AFnLI4stu8suA0hdB1BnPPKr6/dBjxxejWXeZQA+hqHrAGq6G8u86wD2m17/G0t9Ky3xysV39XfyRlz//AZVebzSLO887wcBAAAAAAAAAAAAAID3YuO49K6/1D2t93DXW3T5tW3b9vq75qp52TaWaTR5qbcMdbxnGT+Wsc01QI90a8cRzrK8lNvE+FjmFnmpu92tbeRHo5vj0g8w9pj9GDfywy0R+jLjSJkfJZnxrOG6PuNXfLBr4cdGkZ9mHKh4udv11IvnMbpd6LvOIu/1I75Jkb/OLnHPNznyGd+a3fTF+hSJvf8y7kMvQ4/uUVvJzMa3O6RY5Ne9xUfxrTRN0x+qNnnKbwxLmbMsPXzwVxWnPLk8yfE/bv1+C3PxxdcU+aLrPlPkC6XkPi9ZfrxSfmD8kOUbCwAAAAAAAAAAAAAAb+/8+YXz1ydenF7/euT4sU9+6Lv4AZc/gn3m/MsXJa+Dj19/EjlfvNKYpnl+c+KVqXn98+nnbxM//wWv8O/56S8JAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAnfQPuQgV9cnTEJQAAAABJRU5ErkJggg==';
        
        const publishedDate = new Date();
        publishedDate.setDate(publishedDate.getDate() - (index * 7)); // One episode per week
        const formattedDate = publishedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        videoCard.innerHTML = `
            <a href="${videoUrl}" class="video-thumbnail">
                <img src="${placeholderUrl}" alt="${title}">
                <div class="thumbnail-preview">
                    <i class="fas fa-play-circle thumbnail-preview-play"></i>
                </div>
            </a>
            <div class="video-info">
                <h3><a href="${videoUrl}">The Crimson Court: ${title}</a></h3>
                <div class="video-meta">
                    <span>Published: ${formattedDate}</span>
                </div>
            </div>
        `;
        
        container.appendChild(videoCard);
    });
    
    console.log(`Rendered ${episodes.length} placeholder videos`);
}

/**
 * Get the best available thumbnail URL for a video
 * @param {Object} snippet - Video snippet from YouTube API
 * @param {String} videoId - YouTube video ID
 * @returns {String} - Thumbnail URL
 */
function getThumbnailUrl(snippet, videoId) {
    // Do NOT call window.getThumbnailUrl here - that's causing recursion
    
    // Implement our own logic directly
    if (snippet && snippet.thumbnails) {
        if (snippet.thumbnails.maxres) return snippet.thumbnails.maxres.url;
        if (snippet.thumbnails.high) return snippet.thumbnails.high.url;
        if (snippet.thumbnails.medium) return snippet.thumbnails.medium.url;
        if (snippet.thumbnails.standard) return snippet.thumbnails.standard.url;
        if (snippet.thumbnails.default) return snippet.thumbnails.default.url;
    }
    
    // Fallback to direct YouTube thumbnail URL
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Set up the navigation controls for the carousel
 */
function setupCarouselNavigation() {
    const carousel = document.getElementById('crimson-court-carousel');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    
    if (!carousel || !prevBtn || !nextBtn) return;
    
    console.log('Setting up carousel navigation');
    
    // Check if any videos are loaded
    const videoElements = carousel.querySelectorAll('.video-card, .carousel-item');
    
    if (videoElements.length === 0) {
        console.warn('No video elements found in carousel');
        return;
    }
    
    console.log(`Found ${videoElements.length} video elements in carousel`);
    
    // Calculate item width based on first video element
    const itemWidth = videoElements[0].offsetWidth || 300;
    const itemMargin = 16; // Margin between items
    const scrollDistance = itemWidth + itemMargin; // Distance to scroll for one item
    
    console.log(`Item width: ${itemWidth}px, Scroll distance: ${scrollDistance}px`);
    
    // Variables for scrolling
    let currentPosition = 0;
    
    // Calculate maximum scroll amount
    const carouselWidth = carousel.scrollWidth;
    const containerWidth = carousel.parentElement.clientWidth;
    const maxScroll = carouselWidth - containerWidth;
    
    console.log(`Carousel width: ${carouselWidth}px, Container width: ${containerWidth}px, Max scroll: ${maxScroll}px`);
    
    // Update button visibility
    function updateButtonStates() {
        prevBtn.classList.toggle('disabled', currentPosition <= 0);
        nextBtn.classList.toggle('disabled', currentPosition >= maxScroll);
    }
    
    // Add click handlers
    prevBtn.addEventListener('click', () => {
        console.log('Previous button clicked');
        // Scroll exactly one item distance
        currentPosition = Math.max(currentPosition - scrollDistance, 0);
        carousel.style.transform = `translateX(-${currentPosition}px)`;
        updateButtonStates();
        console.log(`New position: ${currentPosition}px`);
    });
    
    nextBtn.addEventListener('click', () => {
        console.log('Next button clicked');
        // Scroll exactly one item distance
        currentPosition = Math.min(currentPosition + scrollDistance, maxScroll);
        carousel.style.transform = `translateX(-${currentPosition}px)`;
        updateButtonStates();
        console.log(`New position: ${currentPosition}px`);
    });
    
    // Make sure carousel is initially visible
    carousel.style.transform = 'translateX(0)';
    currentPosition = 0;
    
    // Initial update of button states
    updateButtonStates();
    
    // Update on window resize
    window.addEventListener('resize', () => {
        // Recalculate dimensions
        const newCarouselWidth = carousel.scrollWidth;
        const newContainerWidth = carousel.parentElement.clientWidth;
        const newMaxScroll = newCarouselWidth - newContainerWidth;
        
        console.log(`Window resized. New max scroll: ${newMaxScroll}px`);
        
        // Adjust position if needed
        if (currentPosition > newMaxScroll) {
            currentPosition = newMaxScroll > 0 ? newMaxScroll : 0;
            carousel.style.transform = `translateX(-${currentPosition}px)`;
        }
        
        // Update button states
        updateButtonStates();
    });
    
    // Make carousel controls visible now that they're set up
    const controlsContainer = document.querySelector('.carousel-controls');
    if (controlsContainer) {
        controlsContainer.style.display = 'flex';
    }
}

/**
 * Helper function for fallback video thumbnail error handling
 */
window.handleThumbnailError = function(img, videoId) {
    console.warn(`Failed to load thumbnail for video ID: ${videoId}`);
    
    // Try a different format
    img.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    
    // If that also fails, use a placeholder
    img.onerror = function() {
        img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUAAAAC0CAMAAADROZcIAAAAMFBMVEXy8vL6+vr19fX4+Pjt7e3v7+/r6+v29vb8/Pzp6eno6Oj7+/vz8/Px8fHu7u7q6urfXciFAAACFUlEQVR4nO3a61LDIBCA0YY2Ul/3f7Ga6YxttOhaDsGZ5ftlQnYJEJMQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAZ5jQJIaQ0jV3H3GrXAVSTPXIdc4vvOoA08sBjq5nHXceHrDyy2Hrby04DKOqRh6pHbtN1AFnLI4stu8suA0hdB1BnPPKr6/dBjxxejWXeZQA+hqHrAGq6G8u86wD2m17/G0t9Ky3xysV39XfyRlz//AZVebzSLO887wcBAAAAAAAAAAAAAID3YuO49K6/1D2t93DXW3T5tW3b9vq75qp52TaWaTR5qbcMdbxnGT+Wsc01QI90a8cRzrK8lNvE+FjmFnmpu92tbeRHo5vj0g8w9pj9GDfywy0R+jLjSJkfJZnxrOG6PuNXfLBr4cdGkZ9mHKh4udv11IvnMbpd6LvOIu/1I75Jkb/OLnHPNznyGd+a3fTF+hSJvf8y7kMvQ4/uUVvJzMa3O6RY5Ne9xUfxrTRN0x+qNnnKbwxLmbMsPXzwVxWnPLk8yfE/bv1+C3PxxdcU+aLrPlPkC6XkPi9ZfrxSfmD8kOUbCwAAAAAAAAAAAAAAb+/8+YXz1ydenF7/euT4sU9+6Lv4AZc/gn3m/MsXJa+Dj19/EjlfvNKYpnl+c+KVqXn98+nnbxM//wWv8O/56S8JAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAnfQPuQgV9cnTEJQAAAABJRU5ErkJggg==';
        img.onerror = null;
    };
};