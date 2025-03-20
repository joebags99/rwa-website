/**
 * The Crimson Court - Interactive Portal Script
 * Handles the epic transition and interactive elements for the Crimson Court page
 * 
 * This script creates an immersive portal entrance experience with:
 * - Loading sequence with animated crown
 * - Burn effect transition using sprite animation
 * - Ember particles and sound effects
 * - Interactive portals for exploring different aspects of the Crimson Court
 */

//==============================================================================
// INITIALIZATION AND EVENT LISTENERS
//==============================================================================

// Immediately check if we're on a special page that should use its own transition
if (document.body.classList.contains('timeline-page') || 
    document.body.classList.contains('heirs-page') || 
    document.body.classList.contains('story-page')) {
    console.log('Special page detected, disabling crimson-court.js transitions');
    
    // Replace the original event handlers with empty ones
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function(type, listener, options) {
        // Block load event handlers from crimson-court.js
        if (type === 'load' && !listener.toString().includes('timeline')) {
            console.log('Blocked crimson-court.js load handler on special page');
            return;
        }
        return originalAddEventListener.call(window, type, listener, options);
    };
    
    // Also override the initialization function to do nothing
    window.initCrimsonCourt = function() {
        console.log('Crimson Court initialization bypassed for special page');
        return; // Do nothing
    };
    
    window.startCrimsonTransition = function() {
        console.log('Crimson Court transition bypassed for special page');
        return; // Do nothing
    };
}

/**
 * Initialize when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the Crimson Court experience
    initCrimsonCourt();
    
    // Add debug toggle (can be removed in production)
    setupDebugToggle();
});

/**
 * Override default preloader behavior for Crimson Court page
 */
window.addEventListener('load', function(e) {
    // Skip for timeline, heirs, and story pages
    if (document.body.classList.contains('timeline-page') ||
        document.body.classList.contains('heirs-page') ||
        document.body.classList.contains('story-page')) {
        return;
    }
    
    // Only for Crimson Court page
    if (document.body.classList.contains('crimson-court-page')) {
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            // Force preloader to stay visible
            preloader.classList.remove('fade-out');
            document.body.classList.add('loading');
            preloader.style.opacity = '1';
            preloader.style.visibility = 'visible';
            preloader.style.display = 'flex';
        }
    }
}, true); // Use capture phase to run before other handlers

/**
 * Initialize the Crimson Court portal
 */
/**
 * Initialize the Crimson Court portal
 */
function initCrimsonCourt() {
    // Skip for timeline, heirs, and story pages as they have their own initialization
    if (document.body.classList.contains('timeline-page') || 
        document.body.classList.contains('heirs-page') || 
        document.body.classList.contains('story-page')) {
        console.log('Skipping Crimson Court initialization for special page');
        return;
    }

    // Get preloader element
    const preloader = document.querySelector('.preloader');
    const loadingDuration = 2000; // 2 seconds of loading before burn effect
    
    // Add audio cue for loading
    playLoadingSound();
    
    // Add loading animation classes
    if (preloader) {
        preloader.classList.add('show-loading');
        
        // Animate the crown
        const crown = preloader.querySelector('.crown');
        if (crown) crown.classList.add('animate-loading');
        
        // Animate progress bar
        const progressBar = preloader.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.animation = `progressAnimation ${loadingDuration/1000}s ease-in-out forwards, shimmerEffect 2s infinite linear`;
        }
    }
    
    // After loading duration, start the transition
    setTimeout(function() {
        startCrimsonTransition(preloader);
    }, loadingDuration);
    
    // Initialize interactive elements
    setupPortalNavigation();
    setupReturnButton();
    setupAmbientEffects();
}

//==============================================================================
// CORE ANIMATION FUNCTIONS
//==============================================================================

/**
 * Animate the burn effect using sprite sheet animation with gradual fadeout
 */
function animateBurnEffect() {
    const burnEffect = document.querySelector('.burn-effect');
    if (!burnEffect) return;
    
    const totalFrames = 23;
    const animationDuration = 2500; // 2.5 seconds total animation
    let currentFrame = totalFrames - 1; // START FROM THE LAST FRAME
    
    // Make the effect fully visible to start
    burnEffect.classList.add('active');
    burnEffect.style.opacity = '1';
    
    // Initially position at the last frame (completely black)
    burnEffect.style.backgroundPosition = '100% 0%';
    
    // Calculate time between frames
    const frameInterval = animationDuration / totalFrames;
    
    // Create animation interval - going BACKWARDS through frames
    const burnAnimation = setInterval(() => {
        // Calculate position percentage based on current frame
        const positionX = (currentFrame / (totalFrames - 1)) * 100;
        burnEffect.style.backgroundPosition = `${positionX}% 0%`;
        
        // Calculate the opacity based on frame progress
        // Start at 1, end at 0 over the course of the animation
        const opacity = currentFrame / (totalFrames - 1);
        burnEffect.style.opacity = opacity;
        
        currentFrame--;
        
        // Stop when all frames have played
        if (currentFrame < 0) {
            clearInterval(burnAnimation);
            console.log("Burn animation complete");
            burnEffect.style.opacity = '0'; // Ensure it's fully transparent at the end
        }
    }, frameInterval);
}

/**
 * Create burning ember particles for the transition effect
 */
function createEmbers() {
    const overlay = document.querySelector('.transition-overlay');
    if (!overlay) return;
    
    // Create 15 ember particles (reduced from 30 for less visual obstruction)
    for (let i = 0; i < 15; i++) {
        const ember = document.createElement('div');
        ember.className = 'ember-particle';
        
        // Random properties
        const size = Math.random() * 5 + 2; // 2-7px
        const posX = Math.random() * 100; // 0-100%
        const posY = Math.random() * 100; // 0-100%
        const delay = Math.random() * 0.5; // 0-0.5s (reduced)
        const duration = Math.random() * 1.5 + 1; // 1-2.5s (reduced)
        
        // Apply styles
        ember.style.width = `${size}px`;
        ember.style.height = `${size}px`;
        ember.style.left = `${posX}%`;
        ember.style.top = `${posY}%`;
        ember.style.animationDelay = `${delay}s`;
        ember.style.animationDuration = `${duration}s`;
        ember.style.opacity = '0.7'; // Reduced opacity
        ember.style.zIndex = '9000'; // Lower z-index so they don't block everything
        
        // Add to overlay
        overlay.appendChild(ember);
    }
    
    // Create ember styles if not already added
    if (!document.getElementById('ember-styles')) {
        const emberStyles = document.createElement('style');
        emberStyles.id = 'ember-styles';
        emberStyles.innerHTML = `
            .ember-particle {
                position: absolute;
                background: radial-gradient(circle at center, #ffcc00, #ff6600);
                border-radius: 50%;
                filter: blur(1px);
                opacity: 0;
                z-index: 9000; /* Lower z-index */
                pointer-events: none;
                animation: emberRise cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
            }
            
            @keyframes emberRise {
                0% {
                    transform: translateY(0) scale(1);
                    opacity: 0;
                }
                20% {
                    opacity: 0.6; /* Reduced max opacity */
                }
                100% {
                    transform: translateY(-100vh) scale(0);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(emberStyles);
    }
}

//==============================================================================
// TRANSITION AND EFFECT FUNCTIONS
//==============================================================================

/**
 * Handle the epic "burn away" transition effect
 * @param {HTMLElement} preloader - The preloader element to hide after transition
 */
function startCrimsonTransition(preloader) {
    console.log('Starting Crimson Court transition...');
    
        // Check for excluded pages
        const isTimelinePage = document.body.classList.contains('timeline-page');
        const isHeirsPage = document.body.classList.contains('heirs-page');
        const isStoryPage = document.body.classList.contains('story-page');
        
        // Skip burn effect for excluded pages
        if (isTimelinePage || isHeirsPage || isStoryPage) {
            console.log('Using simplified transition for special page...');
            performSimpleTransition(preloader);
            return;
        }

    // Get transition elements
    const overlay = document.querySelector('.transition-overlay');
    const burnEffect = document.querySelector('.burn-effect');
    const body = document.body;
    const mainHeader = document.querySelector('.main-header');
    
    // Make sure portals start invisible but are in the DOM
    ensurePortalsVisible();
    
    // Update loading text
    if (preloader) {
        const loadingText = preloader.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = "The court awaits...";
            loadingText.style.animation = "pulsateText 1s ease-in-out infinite";
        }
    }
    
    // Start the transition sequence with precise timing
    setTimeout(() => {
        // 1. Show the overlay
        overlay.classList.add('active');
        
        // 2. Start burn effect and related animations
        setTimeout(() => {
            // Run sprite animation
            animateBurnEffect();
            
            // Add ember particles
            createEmbers();
            
            // Play dramatic sound
            playTransitionSound();
            
            // Hide main header if it exists
            if (mainHeader) {
                mainHeader.style.opacity = '0';
                mainHeader.style.visibility = 'hidden';
                mainHeader.style.zIndex = '-1';
            }
            
            // 3. Reveal the court portal
            setTimeout(() => {
                body.classList.add('court-portal-active');
                document.documentElement.scrollTop = 0; // Scroll to top
                
                // Update loading text again
                if (preloader) {
                    const loadingText = preloader.querySelector('.loading-text');
                    if (loadingText) {
                        loadingText.textContent = "Entering the court...";
                    }
                }
                
                // 4. Allow time for portal animations then clean up
                setTimeout(() => {
                    // Hide preloader after portals have started animating
                    if (preloader) {
                        console.log("Hiding preloader now that portals are animating");
                        preloader.classList.add('fade-out');
                        setTimeout(() => {
                            preloader.style.display = 'none';
                        }, 800); // Longer fade for smoother transition
                    }
                    
                    // Fade out transition overlay
                    setTimeout(() => {
                        overlay.classList.remove('active');
                        
                        // Double check that portals are visible
                        setTimeout(() => {
                            ensurePortalsVisible();
                        }, 500);
                    }, 1500);
                }, 3000); // 3 seconds to ensure portals are animating
            }, 1000);
        }, 1000);
    }, 100);
}

/**
 * Perform a simplified transition without burn effect
 * @param {HTMLElement} preloader - The preloader element to hide
 */
function performSimpleTransition(preloader) {
    const body = document.body;
    
    // Make sure portals are prepared
    ensurePortalsVisible();
    
    // Update loading text
    if (preloader) {
        const loadingText = preloader.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = "The court awaits...";
        }
    }
    
    // Simple fade-in transition with shorter timings
    setTimeout(() => {
        // Add active class to show content
        body.classList.add('court-portal-active');
        document.documentElement.scrollTop = 0; // Scroll to top
        
        // Fade out preloader after a short delay
        setTimeout(() => {
            if (preloader) {
                preloader.classList.add('fade-out');
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 800);
            }
        }, 500);
    }, 300);
}

/**
 * Ensure the portal elements are visible
 */
function ensurePortalsVisible() {
    const portals = document.querySelectorAll('.royal-portal');
    const portalContainer = document.querySelector('.portal-container');
    
    if (portalContainer) {
        portalContainer.style.display = 'grid';
    }
    
    portals.forEach(portal => {
        portal.style.display = 'block';
        // Make sure portals are fully visible with no transition
        portal.style.opacity = '1';
        portal.style.transform = 'translateY(0)';
    });
    
    console.log('Portals visibility enforced. Found ' + portals.length + ' portals.');
}

//==============================================================================
// AUDIO FUNCTIONS
//==============================================================================

/**
 * Play a subtle loading/summoning sound
 */
function playLoadingSound() {
    // Create audio element if not exists
    if (!document.getElementById('loading-sound')) {
        const audio = document.createElement('audio');
        audio.id = 'loading-sound';
        audio.src = 'assets/sounds/summoning.mp3';
        audio.volume = 0.3;
        document.body.appendChild(audio);
    }
    
    // Play the sound
    const sound = document.getElementById('loading-sound');
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Error playing loading sound:', e));
    }
}

/**
 * Play a dramatic sound effect during the transition
 */
function playTransitionSound() {
    // Create audio element if not exists
    if (!document.getElementById('transition-sound')) {
        const audio = document.createElement('audio');
        audio.id = 'transition-sound';
        audio.src = 'assets/sounds/portal-transition.mp3';
        audio.volume = 0.7;
        audio.preload = 'auto';
        document.body.appendChild(audio);
    }
    
    // Play the sound
    const sound = document.getElementById('transition-sound');
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Error playing sound:', e));
    }
}

/**
 * Initialize ambient background audio
 */
function initAmbientAudio() {
    // Create audio element if not exists
    if (!document.getElementById('ambient-audio')) {
        const audio = document.createElement('audio');
        audio.id = 'ambient-audio';
        audio.src = 'assets/sounds/court-ambience.mp3';
        audio.loop = true;
        audio.volume = 0.2;
        audio.preload = 'auto';
        document.body.appendChild(audio);
        
        // Play ambient audio after user interacts with the page
        document.addEventListener('click', function playAmbient() {
            audio.play().catch(e => console.log('Error playing ambient sound:', e));
            // Remove the event listener after first interaction
            document.removeEventListener('click', playAmbient);
        }, { once: true });
    }
}

//==============================================================================
// PORTAL AND NAVIGATION FUNCTIONS
//==============================================================================

/**
 * Setup interactive navigation for the portals
 */
function setupPortalNavigation() {
    // Get portal elements
    const heirsPortal = document.querySelector('.heirs-portal');
    const timelinePortal = document.querySelector('.timeline-portal');
    const npcsPortal = document.querySelector('.npcs-portal');
    const storyPortal = document.querySelector('.story-portal');
    const housesPortal = document.querySelector('.houses-portal');
    const treePortal = document.querySelector('.tree-portal');
    
    // Add click event listeners to each portal
    if (heirsPortal) {
        heirsPortal.addEventListener('click', () => {
            portalTransition('the-heirs.html');
        });
    }
    
    if (timelinePortal) {
        timelinePortal.addEventListener('click', () => {
            portalTransition('the-timeline.html');
        });
    }

    if (npcsPortal) {
        npcsPortal.addEventListener('click', () => {
            portalTransition('npcs.html');
        });
    }
    
    if (storyPortal) {
        storyPortal.addEventListener('click', () => {
            portalTransition('the-story.html');
        });
    }
    
    if (housesPortal) {
        housesPortal.addEventListener('click', () => {
            portalTransition('houses-of-ederia.html');
        });
    }
    
    if (treePortal) {
        treePortal.addEventListener('click', () => {
            portalTransition('family-tree.html');
        });
    }
}

/**
 * Handle the transition to a sub-portal page
 * @param {string} destination - The destination URL
 */
function portalTransition(destination) {
    // Add exit animation class
    document.body.classList.add('portal-exit');
    
    // Play transition sound
    const sound = document.createElement('audio');
    sound.src = 'assets/sounds/portal-select.mp3';
    sound.volume = 0.5;
    sound.play().catch(e => console.log('Error playing sound:', e));
    
    // Navigate after animation completes
    setTimeout(() => {
        window.location.href = destination;
    }, 1000);
}

/**
 * Setup the return button to go back to the main site
 */
function setupReturnButton() {
    const returnButton = document.querySelector('.return-home');
    
    if (returnButton) {
        returnButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add exit animation class
            document.body.classList.add('portal-exit');
            
            // Play transition sound
            const sound = document.createElement('audio');
            sound.src = 'assets/sounds/portal-close.mp3';
            sound.volume = 0.5;
            sound.play().catch(e => console.log('Error playing sound:', e));
            
            // Navigate after animation completes
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    }
}

//==============================================================================
// AMBIENT EFFECTS AND PARTICLES
//==============================================================================

/**
 * Setup ambient effects for the court portal
 */
function setupAmbientEffects() {
    // Create ambient background candle flicker
    createCandleFlicker();
    
    // Add subtle particle effects
    addAmbientParticles();
    
    // Initialize ambient audio background if needed
    initAmbientAudio();
}

/**
 * Create subtle candle flicker effect on existing candles
 */
function createCandleFlicker() {
    const candles = document.querySelectorAll('.candle');
    
    candles.forEach(candle => {
        // Random flicker timing
        const flickerSpeed = Math.random() * 2 + 2; // 2-4s
        candle.style.animation = `flicker ${flickerSpeed}s ease-in-out infinite`;
    });
}

/**
 * Add subtle ambient particles (dust motes, etc)
 */
function addAmbientParticles() {
    const courtPortal = document.querySelector('.court-portal');
    
    if (!courtPortal) return;
    
    // Create particles container if doesn't exist
    let particlesContainer = document.querySelector('.ambient-particles');
    
    if (!particlesContainer) {
        particlesContainer = document.createElement('div');
        particlesContainer.className = 'ambient-particles';
        particlesContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            opacity: 0.5;
        `;
        courtPortal.appendChild(particlesContainer);
    }
    
    // Create dust mote particles
    for (let i = 0; i < 30; i++) {
        createDustMote(particlesContainer);
    }
}

/**
 * Create a dust mote particle
 * @param {HTMLElement} container - The container element
 */
function createDustMote(container) {
    const particle = document.createElement('div');
    particle.className = 'dust-mote';
    
    // Random properties
    const size = Math.random() * 4 + 1; // 1-5px
    const posX = Math.random() * 100; // 0-100%
    const posY = Math.random() * 100; // 0-100%
    const duration = Math.random() * 30 + 20; // 20-50s
    const delay = Math.random() * 10; // 0-10s
    
    // Apply styles
    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background-color: rgba(212, 175, 55, 0.2);
        border-radius: 50%;
        left: ${posX}%;
        top: ${posY}%;
        filter: blur(1px);
        opacity: 0;
        animation: floatDust ${duration}s ease-in-out ${delay}s infinite;
    `;
    
    container.appendChild(particle);
    
    // Create animation keyframes if not already added
    if (!document.getElementById('dust-keyframes')) {
        const dustStyles = document.createElement('style');
        dustStyles.id = 'dust-keyframes';
        dustStyles.innerHTML = `
            @keyframes floatDust {
                0% {
                    transform: translate(0, 0);
                    opacity: 0;
                }
                25% {
                    opacity: 0.5;
                }
                50% {
                    transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 50 - 25}px);
                    opacity: 0.7;
                }
                75% {
                    opacity: 0.5;
                }
                100% {
                    transform: translate(0, 0);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(dustStyles);
    }
}

//==============================================================================
// UTILITY AND HELPER FUNCTIONS
//==============================================================================

/**
 * Setup debug toggle button for development
 * This can be removed in production
 */
function setupDebugToggle() {
    const debugBtn = document.getElementById('debug-toggle');
    
    if (debugBtn) {
        // Show in development mode
        debugBtn.style.display = 'block';
        
        debugBtn.addEventListener('click', () => {
            const body = document.body;
            
            if (body.classList.contains('court-portal-active')) {
                body.classList.remove('court-portal-active');
                debugBtn.textContent = 'Show Court Portal';
            } else {
                body.classList.add('court-portal-active');
                ensurePortalsVisible();
                debugBtn.textContent = 'Hide Court Portal';
            }
        });
    }
}

/**
 * Helper function to create and animate a magical element
 * @param {string} type - Type of element ('crown', 'scroll', 'sword', etc)
 * @param {HTMLElement} container - The container to append to
 */
function createMagicalElement(type, container) {
    const element = document.createElement('div');
    element.className = `magical-${type}`;
    
    // Set position and animation
    const posX = Math.random() * 80 + 10; // 10-90%
    const posY = Math.random() * 80 + 10; // 10-90%
    const duration = Math.random() * 20 + 10; // 10-30s
    const delay = Math.random() * 5; // 0-5s
    
    element.style.cssText = `
        position: absolute;
        left: ${posX}%;
        top: ${posY}%;
        width: 30px;
        height: 30px;
        background-image: url("assets/images/${type}.png");
        background-size: contain;
        background-repeat: no-repeat;
        opacity: 0.6;
        filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.3));
        animation: floatElement ${duration}s ease-in-out ${delay}s infinite;
    `;
    
    container.appendChild(element);
}