/**
 * The Crimson Court - Interactive Portal Script
 * Handles the epic transition and interactive elements for the Crimson Court page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the Crimson Court experience
    initCrimsonCourt();
    
    // Add debug toggle (can be removed in production)
    setupDebugToggle();
});

/**
 * Initialize the Crimson Court portal
 */
function initCrimsonCourt() {
    // Show loading screen for a controlled amount of time
    const preloader = document.querySelector('.preloader');
    const loadingDuration = 3000; // 3 seconds of loading before burn effect
    
    // Add audio cue for loading
    playLoadingSound();
    
    // Add loading animation classes immediately
    if (preloader) {
        preloader.classList.add('show-loading');
        
        // Animate the crown while loading
        const crown = preloader.querySelector('.crown');
        if (crown) {
            crown.classList.add('animate-loading');
        }
        
        // Animate progress bar
        const progressBar = preloader.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.animation = `progressAnimation ${loadingDuration/1000}s ease-in-out forwards, shimmerEffect 2s infinite linear`;
        }
    }
    
    // After loading duration, start the transition but KEEP the preloader visible
    setTimeout(function() {
        // Start the epic transition but don't hide preloader yet
        startCrimsonTransition(preloader);
    }, loadingDuration);
    
    // Setup portal navigation
    setupPortalNavigation();
    
    // Setup return button
    setupReturnButton();
    
    // Add ambient sound effects if needed
    setupAmbientEffects();
}

/**
 * Play a subtle loading/summoning sound
 */
function playLoadingSound() {
    // Create audio element if not exists
    if (!document.getElementById('loading-sound')) {
        const audio = document.createElement('audio');
        audio.id = 'loading-sound';
        audio.src = 'assets/sounds/summoning.mp3'; // Make sure this file exists
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
 * Handle the epic "burn away" transition effect
 * @param {HTMLElement} preloader - The preloader element to hide after transition
 */
function startCrimsonTransition(preloader) {
    console.log('Starting Crimson Court transition...');
    
    // Get transition elements
    const overlay = document.querySelector('.transition-overlay');
    const burnEffect = document.querySelector('.burn-effect');
    const body = document.body;
    const mainHeader = document.querySelector('.main-header');
    
    // Make sure we can see the portals but they start invisible
    ensurePortalsVisible();
    
    // Make loading text change to indicate transition is happening
    if (preloader) {
        const loadingText = preloader.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = "The court awaits...";
            loadingText.style.animation = "pulsateText 1s ease-in-out infinite";
        }
    }
    
    // Start the transition sequence
    setTimeout(() => {
        // 1. Show the overlay
        overlay.classList.add('active');
        
        // 2. Activate the burn effect
        setTimeout(() => {
            burnEffect.classList.add('active');
            
            // 3. Create burning embers effect
            createEmbers();
            
            // 4. Play dramatic sound effect
            playTransitionSound();
            
            // 5. Forcefully hide any main header if it exists
            if (mainHeader) {
                mainHeader.style.opacity = '0';
                mainHeader.style.visibility = 'hidden';
                mainHeader.style.zIndex = '-1';
            }
            
            // 6. Activate the Crimson Court portal
            setTimeout(() => {
                body.classList.add('court-portal-active');
                document.documentElement.scrollTop = 0; // Scroll to top
                
                // Change loading text again
                if (preloader) {
                    const loadingText = preloader.querySelector('.loading-text');
                    if (loadingText) {
                        loadingText.textContent = "Entering the court...";
                    }
                }
                
                // 7. Prepare the portal animations but don't hide preloader yet
                setTimeout(() => {
                    // 8. NOW hide the preloader AFTER portals have started animating
                    if (preloader) {
                        console.log("Hiding preloader now that portals are animating");
                        preloader.classList.add('fade-out');
                        setTimeout(() => {
                            preloader.style.display = 'none';
                        }, 800); // Longer fade for smoother transition
                    }
                    
                    // 9. Fade out transition overlay
                    setTimeout(() => {
                        overlay.classList.remove('active');
                        
                        // 10. Double check that portals are visible
                        setTimeout(() => {
                            ensurePortalsVisible();
                        }, 500);
                    }, 1500);
                }, 1000); // Delay to ensure portals are animating before hiding preloader
            }, 1000);
        }, 1000); // Longer burn effect
    }, 100);
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
    });
    
    console.log('Portals visibility enforced. Found ' + portals.length + ' portals.');
}

/**
 * Create burning ember particles for the transition effect
 */
function createEmbers() {
    const overlay = document.querySelector('.transition-overlay');
    
    // Create 50 ember particles
    for (let i = 0; i < 50; i++) {
        const ember = document.createElement('div');
        ember.className = 'ember-particle';
        
        // Random position, size and animation delay
        const size = Math.random() * 8 + 2; // 2-10px
        const posX = Math.random() * 100; // 0-100%
        const posY = Math.random() * 100; // 0-100%
        const delay = Math.random() * 2; // 0-2s
        const duration = Math.random() * 3 + 2; // 2-5s
        
        // Apply styles
        ember.style.width = `${size}px`;
        ember.style.height = `${size}px`;
        ember.style.left = `${posX}%`;
        ember.style.top = `${posY}%`;
        ember.style.animationDelay = `${delay}s`;
        ember.style.animationDuration = `${duration}s`;
        
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
                z-index: 10000;
                pointer-events: none;
                animation: emberRise cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
            }
            
            @keyframes emberRise {
                0% {
                    transform: translateY(0) scale(1);
                    opacity: 0;
                }
                20% {
                    opacity: 0.8;
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

/**
 * Play a dramatic sound effect during the transition
 */
function playTransitionSound() {
    // Create audio element if not exists
    if (!document.getElementById('transition-sound')) {
        const audio = document.createElement('audio');
        audio.id = 'transition-sound';
        audio.src = 'assets/sounds/portal-transition.mp3'; // Make sure this file exists
        audio.volume = 0.7;
        audio.preload = 'auto';
        document.body.appendChild(audio);
    }
    
    // Play the sound
    const sound = document.getElementById('transition-sound');
    sound.currentTime = 0;
    sound.play().catch(e => console.log('Error playing sound:', e));
}

/**
 * Setup interactive navigation for the three portals
 */
function setupPortalNavigation() {
    // Get portal elements
    const heirsPortal = document.querySelector('.heirs-portal');
    const timelinePortal = document.querySelector('.timeline-portal');
    const storyPortal = document.querySelector('.story-portal');
    
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
    
    if (storyPortal) {
        storyPortal.addEventListener('click', () => {
            portalTransition('the-story.html');
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
    sound.src = 'assets/sounds/portal-select.mp3'; // Make sure this file exists
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
            sound.src = 'assets/sounds/portal-close.mp3'; // Make sure this file exists
            sound.volume = 0.5;
            sound.play().catch(e => console.log('Error playing sound:', e));
            
            // Navigate after animation completes
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    }
}

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
    
    // Create 30 dust mote particles
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

/**
 * Initialize ambient background audio
 */
function initAmbientAudio() {
    // Create audio element if not exists
    if (!document.getElementById('ambient-audio')) {
        const audio = document.createElement('audio');
        audio.id = 'ambient-audio';
        audio.src = 'assets/sounds/court-ambience.mp3'; // Make sure this file exists
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