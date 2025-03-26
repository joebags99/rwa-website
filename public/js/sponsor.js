/**
 * Roll With Advantage - Sponsors Carousel (Infinite Loop)
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeSponsorsCarousel();
});

function initializeSponsorsCarousel() {
    const carousel = document.querySelector('.sponsors-carousel');
    if (!carousel) return;
    
    const track = carousel.querySelector('.sponsor-track');
    const items = carousel.querySelectorAll('.sponsor-item');
    
    if (items.length === 0) return;
    
    // Create perfect loop by duplicating all sponsors
    setupInfiniteLoop();
    
    // Calculate animation properties
    setAnimationProperties();
    
    // Recalculate on window resize
    window.addEventListener('resize', setAnimationProperties);
    
    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        // Pause animation during touch
        track.style.animationPlayState = 'paused';
    }, {passive: true});
    
    carousel.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        // Resume animation after touch
        track.style.animationPlayState = 'running';
    }, {passive: true});
    
    // Reset animation when page becomes visible again
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            // Restart the animation
            track.style.animation = 'none';
            setTimeout(() => {
                setAnimationProperties(); // Recalculate and apply animation
            }, 10);
        }
    });
    
    /**
     * Set up the infinite loop by duplicating items
     */
    function setupInfiniteLoop() {
        // Clone each sponsor and add to the track
        // We need enough duplicates to create a seamless loop
        const originals = Array.from(items);
        
        // First duplicate set - guarantees we have enough items for a loop
        originals.forEach(item => {
            const clone = item.cloneNode(true);
            track.appendChild(clone);
        });
        
        // For very few sponsors, add another set to make the loop smoother
        if (items.length < 4) {
            originals.forEach(item => {
                const clone = item.cloneNode(true);
                track.appendChild(clone);
            });
        }
    }
    
    /**
     * Calculate and set animation properties based on content
     */
    function setAnimationProperties() {
        // Get the current width of the visible carousel
        const carouselWidth = carousel.offsetWidth;
        
        // Get the width of a single item (including gap)
        const itemWidth = items[0].offsetWidth + 30; // Width + gap
        
        // Get all items (including clones)
        const allItems = track.querySelectorAll('.sponsor-item');
        
        // Calculate the width of original items (before cloning)
        const originalItemsWidth = items.length * itemWidth;
        
        // Calculate total track width
        const trackWidth = allItems.length * itemWidth;
        
        // For true infinite loop, the animation distance is the width of original items
        const scrollWidth = -originalItemsWidth; 
        
        // Set animation duration based on sponsor count (slower for fewer sponsors)
        // This makes sure the speed feels natural regardless of sponsor count
        const baseDuration = 20; // Base seconds for loop
        const scrollDuration = Math.max(baseDuration, items.length * 4); // At least 4s per sponsor
        
        // Apply the CSS variables for the animation
        track.style.setProperty('--scroll-width', `${scrollWidth}px`);
        track.style.setProperty('--scroll-duration', `${scrollDuration}s`);
        
        // Apply the animation
        track.style.animation = 'infiniteScroll var(--scroll-duration) linear infinite';
    }
}