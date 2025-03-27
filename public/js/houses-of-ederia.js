/**
 * Houses of Ederia - Interactive Noble Houses Script
 * 
 * This script handles the interactive elements for the Houses of Ederia page,
 * allowing users to explore each noble house's details with similar functionality
 * to the Heirs page but featuring house shields instead of character portraits.
 */

document.addEventListener('DOMContentLoaded', function() {
    initHouses();
    initMagicalParticles();
    loadHouseData();
});

/**
 * Initialize the houses interactive interface
 */
function initHouses() {
    // Get DOM elements
    const houseSections = document.querySelectorAll('.house-section');
    const selectionContainer = document.querySelector('.house-selection-container');
    const detailedViewContainer = document.querySelector('.detailed-view-container');
    const backButton = document.querySelector('.back-to-circle');
    const detailedViews = document.querySelectorAll('.house-detailed-view');
    const revealAllButton = document.querySelector('.reveal-all-btn');
    
    
    
    // Add click event to each house section
    houseSections.forEach(section => {
        section.addEventListener('click', function() {
            const houseId = this.getAttribute('data-house');
            showHouseDetails(houseId);
            
            // Play transition sound
            playTransitionSound('reveal');
        });
        
        // Add hover sound effect
        section.addEventListener('mouseenter', function() {
            playTransitionSound('hover');
        });
    });
    
    // Reveal All button functionality
    if (revealAllButton) {
        revealAllButton.addEventListener('click', function() {
            houseSections.forEach(section => {
                section.classList.add('active');
            });
            
            // Play transition sound
            playTransitionSound('reveal');
            
            // Toggle button text to "Hide All" after clicking
            this.innerHTML = '<i class="fas fa-eye-slash"></i> Hide All Houses';
            
            // Change event to hide all on second click
            this.removeEventListener('click', arguments.callee);
            this.addEventListener('click', function() {
                houseSections.forEach(section => {
                    section.classList.remove('active');
                });
                
                // Reset button text
                this.innerHTML = '<i class="fas fa-eye"></i> Reveal All Houses';
                
                // Play transition sound
                playTransitionSound('back');
                
                // Reset to original functionality
                this.removeEventListener('click', arguments.callee);
                initHouses();
            });
        });
    }
    
    // Back button functionality
    backButton.addEventListener('click', function() {
        hideHouseDetails();
        
        // Play transition sound
        playTransitionSound('back');
    });
    
    /**
     * Show the detailed view for a specific house
     * @param {string} houseId - The ID of the house to display
     */
    function showHouseDetails(houseId) {
        
        
        // Hide the selection circle
        selectionContainer.classList.add('hidden');
        
        // Show the detailed view container
        detailedViewContainer.classList.add('active');
        
        // Activate the specific house's detailed view
        const targetView = document.getElementById(`${houseId}-view`);
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
        
        // Apply body class for house-specific styling
        document.body.classList.add(`viewing-${houseId}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        
        // Add house specific particles
        addHouseSpecificParticles(houseId);
    }
    
    /**
     * Hide all house detailed views and show the selection circle
     */
    function hideHouseDetails() {
        
        
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
        
        // Remove any house-specific body classes
        document.body.classList.remove(
            'viewing-falkrest',
            'viewing-veltaris',
            'viewing-thornefield',
            'viewing-astralor',
            'viewing-eldran',
            'viewing-emberlyn'
        );

        window.scrollTo({ top: 200, behavior: "smooth" });
        
        // Reset particles
        clearHouseSpecificParticles();
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
                soundUrl = 'assets/sounds/shield-reveal.mp3';
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
            
            // Most browsers require user interaction before playing audio
        });
    }
}

/**
 * Initialize magical particles background effects
 */
function initMagicalParticles() {
    const container = document.querySelector('.house-particles-container');
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
    
    // Create floating tapestry effect
    createFloatingTapestries(container);
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
 * Create floating tapestry effect
 * @param {HTMLElement} container - The container element
 */
function createFloatingTapestries(container) {
    const tapestryPositions = [
        { top: '15%', left: '5%' },
        { top: '15%', right: '5%' },
        { top: '60%', left: '5%' },
        { top: '60%', right: '5%' }
    ];
    
    tapestryPositions.forEach((position, index) => {
        const tapestry = document.createElement('div');
        tapestry.className = 'tapestry-element';
        
        // Apply styles based on position
        let style = `
            position: absolute;
            width: 120px;
            height: 200px;
            background-image: url('assets/images/tapestry${index + 1}.png');
            background-size: contain;
            background-repeat: no-repeat;
            opacity: 0.4;
            filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.5));
            z-index: 0;
            animation: floatTapestry 5s ease-in-out infinite;
            animation-delay: ${index * 1.5}s;
        `;
        
        // Apply position from the array
        for (const [key, value] of Object.entries(position)) {
            style += `${key}: ${value};`;
        }
        
        tapestry.style.cssText = style;
        container.appendChild(tapestry);
    });
    
    // Add animation keyframes if not already present
    if (!document.getElementById('tapestry-keyframes')) {
        const tapestryStyles = document.createElement('style');
        tapestryStyles.id = 'tapestry-keyframes';
        tapestryStyles.innerHTML = `
            @keyframes floatTapestry {
                0%, 100% {
                    transform: rotate(0deg);
                }
                50% {
                    transform: rotate(2deg);
                }
            }
        `;
        document.head.appendChild(tapestryStyles);
    }
}

/**
 * Add house-specific magical particles
 * @param {string} houseId - The house identifier
 */
function addHouseSpecificParticles(houseId) {
    // Define colors for each house
    const houseColors = {
        falkrest: 'rgba(58, 119, 52, 0.6)',
        veltaris: 'rgba(26, 75, 130, 0.6)',
        thornefield: 'rgba(184, 157, 88, 0.6)',
        astralor: 'rgba(64, 192, 192, 0.6)',
        eldran: 'rgba(147, 112, 219, 0.6)',
        emberlyn: 'rgba(205, 92, 92, 0.6)'
    };
    
    const color = houseColors[houseId] || 'rgba(212, 175, 55, 0.4)';
    const container = document.querySelector('.house-particles-container');
    if (!container) return;
    
    // Clear existing house-specific particles
    clearHouseSpecificParticles();
    
    // Create new particles with house-specific color
    for (let i = 0; i < 20; i++) {
        createHouseParticle(container, color);
    }
    
    // Add house-specific ambient effect
    addHouseAmbientEffect(houseId);
}

/**
 * Create a particle specific to the selected house
 * @param {HTMLElement} container - The container element
 * @param {string} color - CSS color value for the particle
 */
function createHouseParticle(container, color) {
    const particle = document.createElement('div');
    particle.className = 'house-specific-particle';
    
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
        animation: houseParticleFloat ${duration}s ease-in-out ${delay}s infinite;
        z-index: 2;
    `;
    
    container.appendChild(particle);
    
    // Create animation keyframes if not already added
    if (!document.getElementById('house-particle-keyframes')) {
        const particleStyles = document.createElement('style');
        particleStyles.id = 'house-particle-keyframes';
        particleStyles.innerHTML = `
            @keyframes houseParticleFloat {
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
 * Add an ambient background effect specific to the house
 * @param {string} houseId - The house identifier
 */
function addHouseAmbientEffect(houseId) {
    const container = document.querySelector('.house-particles-container');
    if (!container) return;
    
    // Create ambient gradient for house
    const ambient = document.createElement('div');
    ambient.className = 'house-ambient-effect';
    
    // Different gradient patterns for each house
    let gradient;
    switch(houseId) {
        case 'falkrest':
            gradient = 'radial-gradient(circle at 30% 40%, rgba(58, 119, 52, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)';
            break;
        case 'veltaris':
            gradient = 'radial-gradient(circle at 70% 30%, rgba(26, 75, 130, 0.2) 0%, transparent 50%), radial-gradient(circle at 30% 70%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)';
            break;
        case 'thornefield':
            gradient = 'radial-gradient(circle at 50% 30%, rgba(184, 157, 88, 0.2) 0%, transparent 50%), radial-gradient(circle at 50% 70%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)';
            break;
        case 'astralor':
            gradient = 'radial-gradient(circle at 30% 60%, rgba(64, 192, 192, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)';
            break;
        case 'eldran':
            gradient = 'radial-gradient(circle at 60% 40%, rgba(147, 112, 219, 0.2) 0%, transparent 50%), radial-gradient(circle at 30% 60%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)';
            break;
        case 'emberlyn':
            gradient = 'radial-gradient(circle at 40% 50%, rgba(205, 92, 92, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 40%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)';
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
 * Clear house-specific particles
 */
function clearHouseSpecificParticles() {
    // Remove all house-specific particles
    const existingParticles = document.querySelectorAll('.house-specific-particle');
    existingParticles.forEach(particle => {
        particle.remove();
    });
    
    // Remove ambient effect
    const ambientEffect = document.querySelector('.house-ambient-effect');
    if (ambientEffect) {
        ambientEffect.remove();
    }
}

/**
 * Populate house details from the loaded data
 * @param {Object} data - The houses data object
 */
function populateHouseDetails(data) {
    // For each house in the data
    for (const [houseId, houseData] of Object.entries(data)) {
        const houseView = document.getElementById(`${houseId}-view`);
        if (!houseView) continue;
        
        // Basic details
        const fullNameEl = houseView.querySelector('.house-full-name');
        const mottoEl = houseView.querySelector('.house-motto');
        
        if (fullNameEl) fullNameEl.textContent = houseData.name;
        if (mottoEl) mottoEl.textContent = `"${houseData.motto}"`;
        
        // House basics section
        const basicsContainer = houseView.querySelector('.house-basics');
        if (basicsContainer) {
            let basicsHTML = '';
            
            if (houseData.colors) {
                basicsHTML += `<div class="basics-item">
                    <span class="label">Colors:</span>
                    <span class="value">${houseData.colors}</span>
                </div>`;
            }
            
            if (houseData.sigil) {
                basicsHTML += `<div class="basics-item">
                    <span class="label">Sigil:</span>
                    <span class="value">${houseData.sigil}</span>
                </div>`;
            }
            
            if (houseData.seat) {
                basicsHTML += `<div class="basics-item">
                    <span class="label">Seat:</span>
                    <span class="value">${houseData.seat}</span>
                </div>`;
            }
            
            if (houseData.region) {
                basicsHTML += `<div class="basics-item">
                    <span class="label">Region:</span>
                    <span class="value">${houseData.region}</span>
                </div>`;
            }
            
            if (houseData.currentLord) {
                basicsHTML += `<div class="basics-item">
                    <span class="label">Current Lord:</span>
                    <span class="value">${houseData.currentLord}</span>
                </div>`;
            }
            
            basicsContainer.innerHTML = basicsHTML;
        }
        
        // History section
        const historySection = houseView.querySelector('.section-title + p');
        if (historySection && houseData.history) {
            // Split history into paragraphs
            const paragraphs = houseData.history.split('\n\n');
            
            // Replace the first paragraph
            historySection.textContent = paragraphs[0];
            
            // Add additional paragraphs if any
            for (let i = 1; i < paragraphs.length; i++) {
                const para = document.createElement('p');
                para.textContent = paragraphs[i];
                historySection.insertAdjacentElement('afterend', para);
            }
        }
        
        // Notable Members section
        const notableMembersList = houseView.querySelector('.house-list');
        if (notableMembersList && houseData.notableMembers) {
            let membersHTML = '';
            houseData.notableMembers.forEach(member => {
                membersHTML += `<li>${member}</li>`;
            });
            notableMembersList.innerHTML = membersHTML;
        }
        
        // Banner Houses section
        const bannerHousesList = houseView.querySelectorAll('.house-list')[1];
        if (bannerHousesList && houseData.bannerHouses) {
            let bannerHTML = '';
            houseData.bannerHouses.forEach(banner => {
                bannerHTML += `<li>${banner}</li>`;
            });
            bannerHousesList.innerHTML = bannerHTML;
        }
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
    
    // If in circle view, enter key selects the focused house
    if (e.key === 'Enter' && !isDetailedView) {
        const focusedHouse = document.activeElement;
        if (focusedHouse && focusedHouse.classList.contains('house-section')) {
            focusedHouse.click();
        }
    }
});

// Make sure house sections are keyboard navigable
window.addEventListener('load', function() {
    const houseSections = document.querySelectorAll('.house-section');
    houseSections.forEach(section => {
        section.setAttribute('tabindex', '0');
        section.setAttribute('role', 'button');
        const houseName = section.querySelector('.house-name');
        const name = houseName ? houseName.textContent : 'House';
        section.setAttribute('aria-label', `View details for ${name}`);
    });
});