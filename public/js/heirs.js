/**
 * The Heirs - Interactive Portrait Gallery
 * 
 * This script handles the interactive portrait circle for the heirs of Ederia,
 * allowing users to select and view detailed information about each character.
 * Includes fancy animations, hover effects, and dynamic content loading.
 */

document.addEventListener('DOMContentLoaded', function() {
    initHeirs();
    initMagicalParticles();
});

window.scrollTo({ top: 200, behavior: "smooth" });

/**
 * Initialize the heirs interactive portrait gallery
 */
function initHeirs() {
    // Get DOM elements
    const heirSections = document.querySelectorAll('.heir-section');
    const selectionContainer = document.querySelector('.heir-selection-container');
    const detailedViewContainer = document.querySelector('.detailed-view-container');
    const backButton = document.querySelector('.back-to-circle');
    const detailedViews = document.querySelectorAll('.heir-detailed-view');
    
    console.log('Initializing heirs gallery with', heirSections.length, 'heirs');
    
    // Add click event to each heir section
    heirSections.forEach(section => {
        section.addEventListener('click', function() {
            const heirId = this.getAttribute('data-heir');
            showHeirDetails(heirId);
            
            // Play transition sound
            playTransitionSound('reveal');
        });
        
        // Add hover sound effect
        section.addEventListener('mouseenter', function() {
            playTransitionSound('hover');
        });
    });
    
    // Back button functionality
    backButton.addEventListener('click', function() {
        hideHeirDetails();
        
        // Play transition sound
        playTransitionSound('back');
    });
    
    /**
     * Show the detailed view for a specific heir
     * @param {string} heirId - The ID of the heir to display
     */
    function showHeirDetails(heirId) {
        console.log('Showing details for heir:', heirId);
        
        // Hide the selection circle
        selectionContainer.classList.add('hidden');
        
        // Show the detailed view container
        detailedViewContainer.classList.add('active');
        
        // Activate the specific heir's detailed view
        const targetView = document.getElementById(`${heirId}-view`);
        if (targetView) {
            // Hide any currently active view
            detailedViews.forEach(view => {
                view.classList.remove('active');
            });
            
            // Show the target view
            setTimeout(() => {
                targetView.classList.add('active');
            }, 300);
        }
        
        // Apply body class for heir-specific styling
        document.body.classList.add(`viewing-${heirId}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        // Add magic ambient particles specific to the heir
        addHeirSpecificParticles(heirId);
    }
    
    /**
     * Hide all heir detailed views and show the selection circle
     */
    function hideHeirDetails() {
        console.log('Returning to heirs selection');
        
        // Hide the detailed view container
        detailedViewContainer.classList.remove('active');
        
        // Remove active class from all detailed views
        detailedViews.forEach(view => {
            view.classList.remove('active');
        });
        
        // Show the selection circle after a short delay
        setTimeout(() => {
            selectionContainer.classList.remove('hidden');
        }, 300);
        
        // Remove any heir-specific body classes
        document.body.classList.remove(
            'viewing-edwinn',
            'viewing-via',
            'viewing-marik',
            'viewing-xanthe',
            'viewing-cailynn'
        );

        window.scrollTo({ top: 200, behavior: "smooth" });

        
        // Reset particles
        clearHeirSpecificParticles();
    }
    
    /**
     * Play sound effects for transitions
     * @param {string} type - The type of sound to play ('hover', 'reveal', or 'back')
     */
    function playTransitionSound(type) {
        let soundUrl;
        let volume = 0.3;
        
        switch(type) {
            case 'hover':
                soundUrl = 'assets/sounds/hover-chime.mp3';
                volume = 0.2;
                break;
            case 'reveal':
                soundUrl = 'assets/sounds/reveal-whoosh.mp3';
                volume = 0.4;
                break;
            case 'back':
                soundUrl = 'assets/sounds/back-swish.mp3';
                volume = 0.3;
                break;
            default:
                return;
        }
        
        // Create audio element
        const sound = new Audio(soundUrl);
        sound.volume = volume;
        
        // Play the sound with error handling
        sound.play().catch(e => {
            console.log('Sound playback prevented:', e);
            // Most browsers require user interaction before playing audio
        });
    }
}

/**
 * Initialize magical particles background effects
 */
function initMagicalParticles() {
    const container = document.querySelector('.heir-particles-container');
    if (!container) return;
    
    // Don't run heavy animations on mobile
    if (document.body.classList.contains('mobile-device')) return;
    
    // Create ambient dust particles
    for (let i = 0; i < 30; i++) {
        createDustParticle(container);
    }
    
    // Create subtle shimmer effect
    for (let i = 0; i < 15; i++) {
        createShimmerParticle(container);
    }
}

/**
 * Create a floating dust particle
 * @param {HTMLElement} container - The container element
 */
function createDustParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'dust-particle';
    
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
        z-index: 1;
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
 * Create a subtle shimmer particle
 * @param {HTMLElement} container - The container element
 */
function createShimmerParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'shimmer-particle';
    
    // Random properties
    const size = Math.random() * 5 + 2; // 2-7px
    const posX = Math.random() * 100; // 0-100%
    const posY = Math.random() * 100; // 0-100%
    const duration = Math.random() * 5 + 3; // 3-8s
    const delay = Math.random() * 5; // 0-5s
    
    // Apply styles
    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle at center, rgba(255, 255, 255, 0.8), transparent);
        border-radius: 50%;
        left: ${posX}%;
        top: ${posY}%;
        opacity: 0;
        filter: blur(1px);
        animation: shimmerEffect ${duration}s ease-in-out ${delay}s infinite;
        z-index: 1;
    `;
    
    container.appendChild(particle);
    
    // Create animation keyframes if not already added
    if (!document.getElementById('shimmer-keyframes')) {
        const shimmerStyles = document.createElement('style');
        shimmerStyles.id = 'shimmer-keyframes';
        shimmerStyles.innerHTML = `
            @keyframes shimmerEffect {
                0%, 100% {
                    opacity: 0;
                    transform: scale(0.5);
                }
                50% {
                    opacity: 0.8;
                    transform: scale(1.2);
                }
            }
        `;
        document.head.appendChild(shimmerStyles);
    }
}

/**
 * Add heir-specific magical particles
 * @param {string} heirId - The heir identifier
 */
function addHeirSpecificParticles(heirId) {
    // Define colors for each heir
    const heirColors = {
        edwinn: 'rgba(91, 140, 255, 0.6)',
        via: 'rgba(230, 98, 160, 0.6)',
        marik: 'rgba(65, 184, 127, 0.6)',
        xanthe: 'rgba(169, 92, 76, 0.6)',
        cailynn: 'rgba(154, 103, 210, 0.6)'
    };
    
    const color = heirColors[heirId] || 'rgba(212, 175, 55, 0.4)';
    const container = document.querySelector('.heir-particles-container');
    if (!container) return;
    
    // Clear existing heir-specific particles
    clearHeirSpecificParticles();
    
    // Create new particles with heir-specific color
    for (let i = 0; i < 20; i++) {
        createHeirParticle(container, color);
    }
    
    // Add heir-specific ambient effect
    addHeirAmbientEffect(heirId);
}

/**
 * Create a particle specific to the selected heir
 * @param {HTMLElement} container - The container element
 * @param {string} color - CSS color value for the particle
 */
function createHeirParticle(container, color) {
    const particle = document.createElement('div');
    particle.className = 'heir-specific-particle';
    
    // Random properties
    const size = Math.random() * 8 + 3; // 3-11px
    const posX = Math.random() * 100; // 0-100%
    const posY = Math.random() * 100; // 0-100%
    const duration = Math.random() * 8 + 5; // 5-13s
    const delay = Math.random() * 2; // 0-2s
    
    // Apply styles
    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border-radius: 50%;
        left: ${posX}%;
        top: ${posY}%;
        opacity: 0;
        filter: blur(2px);
        animation: heirParticleFloat ${duration}s ease-in-out ${delay}s infinite;
        z-index: 2;
    `;
    
    container.appendChild(particle);
    
    // Create animation keyframes if not already added
    if (!document.getElementById('heir-particle-keyframes')) {
        const particleStyles = document.createElement('style');
        particleStyles.id = 'heir-particle-keyframes';
        particleStyles.innerHTML = `
            @keyframes heirParticleFloat {
                0%, 100% {
                    transform: translate(0, 0) rotate(0deg);
                    opacity: 0;
                }
                25% {
                    opacity: 0.7;
                }
                50% {
                    transform: translate(${Math.random() * 150 - 75}px, ${Math.random() * 150 - 75}px) rotate(180deg);
                    opacity: 0.9;
                }
                75% {
                    opacity: 0.7;
                }
                100% {
                    transform: translate(0, 0) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(particleStyles);
    }
}

/**
 * Add an ambient background effect specific to the heir
 * @param {string} heirId - The heir identifier
 */
function addHeirAmbientEffect(heirId) {
    const container = document.querySelector('.heir-particles-container');
    if (!container) return;
    
    // Create ambient gradient for heir
    const ambient = document.createElement('div');
    ambient.className = 'heir-ambient-effect';
    
    // Different gradient patterns for each heir
    let gradient;
    switch(heirId) {
        case 'edwinn':
            gradient = 'radial-gradient(circle at 30% 40%, rgba(91, 140, 255, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)';
            break;
        case 'via':
            gradient = 'radial-gradient(circle at 70% 30%, rgba(230, 98, 160, 0.2) 0%, transparent 50%), radial-gradient(circle at 30% 70%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)';
            break;
        case 'marik':
            gradient = 'radial-gradient(circle at 50% 30%, rgba(65, 184, 127, 0.2) 0%, transparent 50%), radial-gradient(circle at 50% 70%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)';
            break;
        case 'xanthe':
            gradient = 'radial-gradient(circle at 30% 60%, rgba(169, 92, 76, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)';
            break;
        case 'cailynn':
            gradient = 'radial-gradient(circle at 60% 40%, rgba(154, 103, 210, 0.2) 0%, transparent 50%), radial-gradient(circle at 30% 60%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)';
            break;
        default:
            gradient = 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)';
    }
    
    // Apply styles
    ambient.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: ${gradient};
        z-index: 0;
        opacity: 0;
        transition: opacity 1.5s ease;
        pointer-events: none;
    `;
    
    container.appendChild(ambient);
    
    // Fade in the ambient effect
    setTimeout(() => {
        ambient.style.opacity = '1';
    }, 100);
}

/**
 * Clear heir-specific particles
 */
function clearHeirSpecificParticles() {
    // Remove all heir-specific particles
    const existingParticles = document.querySelectorAll('.heir-specific-particle');
    existingParticles.forEach(particle => {
        particle.remove();
    });
    
    // Remove ambient effect
    const ambientEffect = document.querySelector('.heir-ambient-effect');
    if (ambientEffect) {
        ambientEffect.remove();
    }
}

/**
 * Add a keyboard navigation listener for accessibility
 */
document.addEventListener('keydown', function(e) {
    // Check if we're in detailed view
    const isDetailedView = document.querySelector('.detailed-view-container.active');
    
    // ESC key to go back to circle
    if (e.key === 'Escape' && isDetailedView) {
        const backButton = document.querySelector('.back-to-circle');
        if (backButton) backButton.click();
    }
    
    // If in circle view, enter key selects the focused heir
    if (e.key === 'Enter' && !isDetailedView) {
        const focusedHeir = document.activeElement;
        if (focusedHeir && focusedHeir.classList.contains('heir-section')) {
            focusedHeir.click();
        }
    }
});

// Make sure heir sections are keyboard navigable
window.addEventListener('load', function() {
    const heirSections = document.querySelectorAll('.heir-section');
    heirSections.forEach(section => {
        section.setAttribute('tabindex', '0');
        section.setAttribute('role', 'button');
        section.setAttribute('aria-label', `View details for ${section.querySelector('.heir-name').textContent}`);
    });
});