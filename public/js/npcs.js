/**
 * Those Who Play The Game - NPCs Interactive Script
 * Handles the filtering, animation, and interactive elements for the NPCs page
 * 
 * Features:
 * - Primary category filtering (Royal, Pastoral, Militant, Religious)
 * - Tag-based filtering with multiple selections
 * - Responsive layout with alternating card designs
 * - Animated transitions between filtered views
 * - Data loading and population
 */

//==============================================================================
// INITIALIZATION AND MAIN ENTRY POINT
//==============================================================================

/**
 * Initialize when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initNPCPage();
});

/**
 * Main initialization function - entry point for the page
 */
function initNPCPage() {
    console.log('Initializing NPC Page...');
    
    // Simple fade transition - remove loading class after short delay
    setTimeout(() => {
        document.body.classList.remove('loading');
    }, 500);
    
    // Fetch NPCs from server, then initialize the rest of the page components
    fetchServerNPCs()
        .then(() => {
            // Generate tag buttons from NPCs data
            return generateTagButtons();
        })
        .then(() => {
            // Initialize filters after generating tag buttons
            setupCategoryFilters();
            setupTagFilters();
            
            // Create animation for each NPC card
            animateNPCCards();
            
            // Set initial alternating layout
            updateAlternatingLayout();
            
            // Load ambient elements
            setupAmbientEffects();
        })
        .catch(error => {
            console.error('Error initializing NPC page:', error);
        });
}

//==============================================================================
// DATA FETCHING AND PROCESSING
//==============================================================================

/**
 * Fetch NPCs from the server
 * @returns {Promise} A promise that resolves when NPCs are fetched and displayed
 */
async function fetchServerNPCs() {
    try {
        // Hide loading indicator
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        
        // Fetch NPCs from server
        console.log('Fetching NPCs from server...');
        const response = await fetch('/api/npcs');
        const npcs = await response.json();
        
        console.log(`Received ${npcs.length} NPCs from server`);
        
        // Exit if no NPCs found
        if (!npcs || npcs.length === 0) {
            console.log('No NPCs found on server');
            return;
        }
        
        // Get NPC list container
        const npcList = document.querySelector('.npc-list');
        if (!npcList) {
            console.error('NPC list container not found');
            return;
        }
        
        // Create and add NPC cards to the list
        createNPCCards(npcs, npcList);
        
        // Add click handlers to all NPC tags
        setupNPCTagClickHandlers();
        
        return npcs;
    } catch (error) {
        console.error('Error fetching NPCs from server:', error);
        throw error;
    }
}

/**
 * Generate tag filter buttons from NPC data
 * @returns {Promise} A promise that resolves when tag buttons are created
 */
async function generateTagButtons() {
    const tagButtons = document.querySelector('.tag-buttons');
    if (!tagButtons) return;

    try {
        // Fetch NPCs data
        const response = await fetch('/api/npcs');
        const npcs = await response.json();
        
        // Create a Set to store unique tags
        const uniqueTags = new Set();

        // Collect all tags from NPCs
        npcs.forEach(npc => {
            if (npc.tags && Array.isArray(npc.tags)) {
                npc.tags.forEach(tag => uniqueTags.add(tag.toLowerCase().trim()));
            }
        });

        // Sort tags alphabetically
        const sortedTags = Array.from(uniqueTags).sort();

        // Clear existing buttons
        tagButtons.innerHTML = '';

        // Create buttons for each unique tag
        sortedTags.forEach(tag => {
            const button = document.createElement('button');
            button.className = 'tag-btn';
            button.setAttribute('data-tag', tag);
            button.textContent = tag.replace(/-/g, ' '); // Replace hyphens with spaces for display
            tagButtons.appendChild(button);
        });

        return sortedTags;
    } catch (error) {
        console.error('Error generating tag buttons:', error);
        throw error;
    }
}

//==============================================================================
// DOM MANIPULATION AND UI CREATION
//==============================================================================

/**
 * Create NPC cards and add them to the container
 * @param {Array} npcs - Array of NPC data objects
 * @param {HTMLElement} container - Container element to append cards to
 */
function createNPCCards(npcs, container) {
    // Loop through each NPC and create HTML
    npcs.forEach(npc => {
        // Create a new NPC card element
        const npcCard = document.createElement('div');
        npcCard.className = 'npc-card';
        npcCard.setAttribute('data-category', npc.category || 'unknown');
        npcCard.setAttribute('data-tags', Array.isArray(npc.tags) ? npc.tags.join(',') : '');
        
        // Format importance stars
        const importanceStars = Array(3).fill()
            .map((_, i) => `<i class="${i < npc.importance ? 'fas' : 'far'} fa-star"></i>`)
            .join('');
            
        // Format relationship display
        const relationship = (npc.relationship || 'neutral');
        const relationshipDisplay = relationship.charAt(0).toUpperCase() + relationship.slice(1);
        
        // Format tags
        const tagsHtml = Array.isArray(npc.tags) 
            ? npc.tags.map(tag => `<span class="tag">${tag.charAt(0).toUpperCase() + tag.slice(1)}</span>`).join('') 
            : '';
        
        // Create HTML for the NPC
        npcCard.innerHTML = `
            <div class="npc-portrait">
                <div class="portrait-frame">
                    <img src="${npc.imageSrc || 'assets/images/npcs/unknown.png'}" alt="${npc.name}">
                    <div class="frame-ornament top-left"></div>
                    <div class="frame-ornament top-right"></div>
                    <div class="frame-ornament bottom-left"></div>
                    <div class="frame-ornament bottom-right"></div>
                </div>
            </div>
            <div class="npc-details">
                <h2 class="npc-name">${npc.name}</h2>
                <div class="npc-importance">
                    <span class="importance-label">Importance:</span>
                    <span class="importance-stars">${importanceStars}</span>
                </div>
                <div class="npc-meta">
                    <div class="npc-appearance">
                        <span class="meta-label">First Appearance:</span>
                        <span class="appearance-value">${npc.appearance || 'Unknown'}</span>
                    </div>
                    <div class="npc-relation">
                        <span class="meta-label">Relationship:</span>
                        <span class="relation-value relation-${relationship}">${relationshipDisplay}</span>
                    </div>
                </div>
                <div class="npc-description">
                    <p>${npc.description || 'No description available.'}</p>
                </div>
                <div class="npc-quote">
                    <i class="fas fa-quote-left quote-icon"></i>
                    <blockquote>${npc.quote || 'No memorable quote recorded.'}</blockquote>
                    <i class="fas fa-quote-right quote-icon"></i>
                </div>
                <div class="npc-tags">
                    ${tagsHtml}
                </div>
            </div>
        `;
        
        // Add to the beginning of the list (before existing examples)
        container.insertBefore(npcCard, container.firstChild);
        
        console.log(`Added NPC: ${npc.name}`);
    });
}

/**
 * Setup click handlers for NPC tags
 */
function setupNPCTagClickHandlers() {
    document.querySelectorAll('.npc-tags .tag').forEach(tag => {
        tag.addEventListener('click', function() {
            const tagText = this.textContent.toLowerCase();
            const tagValue = tagText.replace(/\s+/g, '-');
            
            const tagBtn = document.querySelector(`.tag-btn[data-tag="${tagValue}"]`);
            if (tagBtn && !tagBtn.classList.contains('active')) {
                tagBtn.click();
            }
        });
    });
}

/**
 * Update alternating card layout after filtering
 */
function updateAlternatingLayout() {
    // Get all visible NPC cards
    const visibleCards = document.querySelectorAll('.npc-card:not(.filtered)');
    
    // Reset all cards to default layout
    document.querySelectorAll('.npc-card').forEach(card => {
        card.style.gridTemplateColumns = '2fr 3fr';
        
        const portrait = card.querySelector('.npc-portrait');
        const details = card.querySelector('.npc-details');
        
        if (portrait) {
            portrait.style.gridColumn = '1';
            portrait.style.gridRow = '1';
        }
        
        if (details) {
            details.style.gridColumn = '2';
            details.style.gridRow = '1';
        }
    });
    
    // Apply alternating layout to visible cards
    visibleCards.forEach((card, index) => {
        // Even indices (0, 2, 4, etc.) have default layout
        // Odd indices (1, 3, 5, etc.) have flipped layout
        if (index % 2 === 1) {
            card.style.gridTemplateColumns = '3fr 2fr';
            
            const portrait = card.querySelector('.npc-portrait');
            const details = card.querySelector('.npc-details');
            
            if (portrait) {
                portrait.style.gridColumn = '2';
                portrait.style.gridRow = '1';
            }
            
            if (details) {
                details.style.gridColumn = '1';
                details.style.gridRow = '1';
            }
        }
    });
}

/**
 * Update the active tags display
 */
function updateActiveTagsDisplay() {
    const activeTags = document.querySelector('.active-tags');
    const activeTagButtons = document.querySelectorAll('.tag-btn.active');
    
    // Clear current tags
    activeTags.innerHTML = '';
    
    // No active tags
    if (activeTagButtons.length === 0) {
        activeTags.innerHTML = '<span class="no-active-filters">No active tag filters</span>';
        return;
    }
    
    // Add each active tag
    activeTagButtons.forEach(button => {
        const tag = document.createElement('span');
        tag.className = 'active-tag';
        tag.innerHTML = `${button.textContent} <i class="fas fa-times" data-tag="${button.getAttribute('data-tag')}"></i>`;
        activeTags.appendChild(tag);
        
        // Add click event to remove tag
        tag.querySelector('i').addEventListener('click', function() {
            const tagName = this.getAttribute('data-tag');
            const tagBtn = document.querySelector(`.tag-btn[data-tag="${tagName}"]`);
            
            if (tagBtn) {
                tagBtn.classList.remove('active');
                updateActiveTagsDisplay();
                applyFilters();
                playFilterSound('tag-remove');
            }
        });
    });
}

//==============================================================================
// FILTER FUNCTIONALITY
//==============================================================================

/**
 * Setup category filter buttons
 */
function setupCategoryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Add click event to each filter button
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get selected category
            const filter = this.getAttribute('data-filter');
            
            // Update active button state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Apply filtering with animation
            applyFilters();
            
            // Play click sound
            playFilterSound();
        });
    });
}

/**
 * Setup tag filter buttons
 */
function setupTagFilters() {
    const tagButtons = document.querySelectorAll('.tag-btn');
    const clearFilterBtn = document.querySelector('.clear-filters');
    
    // Add click event to each tag button
    tagButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Toggle active state
            this.classList.toggle('active');
            
            // Update active tags display
            updateActiveTagsDisplay();
            
            // Apply filtering with animation
            applyFilters();
            
            // Play click sound
            playFilterSound('tag');
        });
    });
    
    // Add event listener to clear filters button
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', function() {
            // Clear all active tag filters
            tagButtons.forEach(btn => btn.classList.remove('active'));
            
            // Update active tags display
            updateActiveTagsDisplay();
            
            // Apply filtering
            applyFilters();
            
            // Play click sound
            playFilterSound('clear');
        });
    }
    
    // Initial update of active tags display
    updateActiveTagsDisplay();
    
    // Add click handler to clear filters in "no results" message
    const clearFiltersBtn = document.querySelector('.no-results-message .clear-filters-btn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            // Reset category filter to "All"
            document.querySelector('.filter-btn[data-filter="all"]').click();
            
            // Clear all tag filters
            document.querySelector('.clear-filters').click();
        });
    }
}

/**
 * Apply all active filters to NPCs
 */
function applyFilters() {
    const activeCategoryFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
    const activeTagFilters = Array.from(document.querySelectorAll('.tag-btn.active')).map(btn => 
        btn.getAttribute('data-tag')
    );
    
    const npcCards = document.querySelectorAll('.npc-card');
    let visibleCards = 0;
    
    // Add filtering animation class to all cards
    npcCards.forEach(card => {
        card.classList.add('filtering');
        card.classList.remove('filtering-in');
    });
    
    // Short delay to allow animation to start
    setTimeout(() => {
        npcCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            const cardTags = card.getAttribute('data-tags').split(',');
            
            // Check if card passes category filter
            const passesCategoryFilter = activeCategoryFilter === 'all' || cardCategory === activeCategoryFilter;
            
            // Check if card passes all active tag filters
            const passesTagFilters = activeTagFilters.length === 0 || 
                activeTagFilters.every(tag => cardTags.includes(tag));
            
            // Show/hide card based on filters
            if (passesCategoryFilter && passesTagFilters) {
                card.classList.remove('filtered');
                visibleCards++;
                
                // Apply filtering-in animation with slight delay for each card
                setTimeout(() => {
                    card.classList.add('filtering-in');
                }, 50 * visibleCards); // Stagger the animation
            } else {
                card.classList.add('filtered');
            }
        });
        
        // Show "no results" message if no cards are visible
        const noResultsMessage = document.querySelector('.no-results-message');
        if (visibleCards === 0 && noResultsMessage) {
            noResultsMessage.style.display = 'block';
        } else if (noResultsMessage) {
            noResultsMessage.style.display = 'none';
        }
        
        // Update alternating layout after all filtering is done
        updateAlternatingLayout();
    }, 50);
}

//==============================================================================
// ANIMATIONS AND VISUAL EFFECTS
//==============================================================================

/**
 * Animate NPC cards on page load
 */
function animateNPCCards() {
    const npcCards = document.querySelectorAll('.npc-card');
    
    // Add staggered animation delay to each card
    npcCards.forEach((card, index) => {
        card.style.animationDelay = `${0.1 * index}s`;
    });
}

/**
 * Setup ambient effects for the NPCs page
 */
function setupAmbientEffects() {
    // Re-use existing ambient effects from crimson-court.js if available
    if (typeof addAmbientParticles === 'function') {
        const container = document.querySelector('.court-portal');
        addAmbientParticles(container);
    }
    
    // Create subtle animation for portrait frames
    animatePortraitFrames();
}

/**
 * Add subtle animation to portrait frames
 */
function animatePortraitFrames() {
    const frames = document.querySelectorAll('.portrait-frame');
    
    frames.forEach(frame => {
        // Add subtle glow animation
        frame.style.animation = 'portraitGlow 3s ease-in-out infinite alternate';
    });
    
    // Add CSS animation if not already present
    if (!document.getElementById('portrait-animations')) {
        const style = document.createElement('style');
        style.id = 'portrait-animations';
        style.innerHTML = `
            @keyframes portraitGlow {
                0% {
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5), 0 0 10px rgba(212, 175, 55, 0.3);
                }
                100% {
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.4);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

//==============================================================================
// UTILITY FUNCTIONS
//==============================================================================

/**
 * Play filter interaction sound
 * @param {string} type - Type of filter interaction (default, tag, clear, etc.)
 */
function playFilterSound(type = 'default') {
    // Create audio element based on interaction type
    let sound;
    let volume = 0.3;
    
    switch(type) {
        case 'tag':
            sound = new Audio('assets/sounds/tag-click.mp3');
            volume = 0.3;
            break;
        case 'tag-remove':
            sound = new Audio('assets/sounds/tag-remove.mp3');
            volume = 0.2;
            break;
        case 'clear':
            sound = new Audio('assets/sounds/clear-filters.mp3');
            volume = 0.4;
            break;
        default:
            sound = new Audio('assets/sounds/filter-click.mp3');
            volume = 0.3;
    }
    
    // Set volume
    sound.volume = volume;
    
    // Only play on desktop (optional)
    if (!document.body.classList.contains('mobile-device')) {
        sound.play().catch(e => console.log('Error playing sound:', e));
    }
}