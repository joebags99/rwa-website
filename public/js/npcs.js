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
// INITIALIZATION AND EVENT LISTENERS
//==============================================================================

/**
 * Initialize when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Setup NPC page functionality
    initNPCPage();
});

/**
 * Initialize the NPC page
 */
function initNPCPage() {
    console.log('Initializing NPC Page...');
    
    // Initialize filters
    setupCategoryFilters();
    setupTagFilters();
    
    // Add example NPCs to the page
    addExampleNPCs();
    
    // Create animation for each NPC card
    animateNPCCards();
    
    // Load ambient elements
    setupAmbientEffects();
}

//==============================================================================
// FILTER FUNCTIONALITY
//==============================================================================

/**
 * Setup category filter buttons
 */
function setupCategoryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const npcCards = document.querySelectorAll('.npc-card');
    
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
    const activeTags = document.querySelector('.active-tags');
    
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
    
    // Add event listener to NPC tags for filtering
    document.querySelectorAll('.npc-tags .tag').forEach(tag => {
        tag.addEventListener('click', function() {
            const tagValue = this.textContent.toLowerCase().replace(/\s+/g, '-');
            const tagBtn = document.querySelector(`.tag-btn[data-tag="${tagValue}"]`);
            
            if (tagBtn) {
                // Activate the corresponding tag button
                tagBtn.classList.add('active');
                
                // Update active tags display
                updateActiveTagsDisplay();
                
                // Apply filtering
                applyFilters();
                
                // Play click sound
                playFilterSound('tag');
                
                // Scroll to filters if needed
                document.querySelector('.filter-controls').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    });
    
    // Initial update of active tags display
    updateActiveTagsDisplay();
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
            
            // Add click event to clear filters button in no results message
            const clearFiltersBtn = noResultsMessage.querySelector('.clear-filters-btn');
            if (clearFiltersBtn) {
                clearFiltersBtn.addEventListener('click', function() {
                    // Reset category filter to "All"
                    document.querySelector('.filter-btn[data-filter="all"]').click();
                    
                    // Clear all tag filters
                    document.querySelector('.clear-filters').click();
                });
            }
        } else if (noResultsMessage) {
            noResultsMessage.style.display = 'none';
        }
    }, 50);
}

//==============================================================================
// NPC DATA AND POPULATION
//==============================================================================

/**
 * Add example NPCs to the page
 * In a real implementation, this would fetch data from an API or JSON file
 */
function addExampleNPCs() {
    // Example NPCs data array
    const npcData = [
        // Existing first NPC (King Talon) is already in the HTML
        
        // Example NPC 2
        {
            name: "Lady Isolde Astralor",
            title: "High Priestess of Light",
            importance: 2, // 2 stars
            appearance: "Episode 2",
            relationship: "friendly",
            description: "A woman in her fifties with silver-streaked auburn hair and piercing green eyes. As High Priestess of the Temple of Light, Lady Isolde serves as the spiritual leader of Ederia. Known for her wisdom and compassion, she has been a trusted advisor to the king for decades. Her prophecies are seldom direct but have never been wrong.",
            quote: "The light reveals all truths in time. We need only the patience to wait, and the wisdom to recognize truth when it appears.",
            tags: ["ederian", "clergy", "nobility"],
            category: "religious",
            imageSrc: "assets/images/npcs/lady-isolde.jpg"
        },
        
        // Example NPC 3
        {
            name: "Sir Darian Blackforge",
            title: "Captain of the Royal Guard",
            importance: 3, // 3 stars
            appearance: "Episode 1",
            relationship: "ally",
            description: "A towering figure with dark skin and a closely-cropped beard. Sir Darian has served the royal family faithfully for over twenty years. His unwavering loyalty to the crown is matched only by his prowess in battle. Leading the elite Royal Guard, he has personally saved the king's life on three occasions, earning him the highest military honors in the kingdom.",
            quote: "Steel may win battles, but loyalty wins wars. My sword is sharp, but my devotion to the crown is sharper still.",
            tags: ["ederian", "military", "nobility"],
            category: "militant",
            imageSrc: "assets/images/npcs/sir-darian.jpg"
        },
        
        // Example NPC 4
        {
            name: "Mira Thornfield",
            title: "Village Elder of Willowbrook",
            importance: 1, // 1 star
            appearance: "Episode 5",
            relationship: "neutral",
            description: "A weathered woman with calloused hands and a kind smile. Mira has been the elder of Willowbrook for nearly fifteen years. While she has little formal education, her practical wisdom and deep understanding of agricultural cycles have helped her village prosper even in difficult times. She is respected by her people and maintains cordial, if distant, relations with the nobility.",
            quote: "The nobles may have their crowns and castles, but we have the earth beneath our feet and the sky above our heads. In the end, that's what truly sustains us all.",
            tags: ["ederian", "commoner"],
            category: "pastoral",
            imageSrc: "assets/images/npcs/mira-thornfield.jpg"
        }
    ];
    
    // Get NPC list container
    const npcList = document.querySelector('.npc-list');
    
    // Get template
    const template = document.getElementById('npc-card-template');
    
    // Skip if template or container doesn't exist
    if (!template || !npcList) {
        console.error('Template or NPC list container not found');
        return;
    }
    
    // Add each NPC
    npcData.forEach(npc => {
        // Clone template
        const npcCard = template.content.cloneNode(true);
        
        // Set category and tags
        npcCard.querySelector('.npc-card').setAttribute('data-category', npc.category);
        npcCard.querySelector('.npc-card').setAttribute('data-tags', npc.tags.join(','));
        
        // Set portrait image
        const portraitImg = npcCard.querySelector('.portrait-frame img');
        portraitImg.src = npc.imageSrc;
        portraitImg.alt = npc.name;
        
        // Set name and title
        npcCard.querySelector('.npc-name').textContent = npc.name;
        if (npc.title) {
            npcCard.querySelector('.npc-name').textContent += `, "${npc.title}"`;
        }
        
        // Set importance stars
        const starsContainer = npcCard.querySelector('.importance-stars');
        for (let i = 0; i < 3; i++) {
            const star = document.createElement('i');
            star.className = i < npc.importance ? 'fas fa-star' : 'far fa-star';
            starsContainer.appendChild(star);
        }
        
        // Set first appearance
        npcCard.querySelector('.appearance-value').textContent = npc.appearance;
        
        // Set relationship
        const relationElement = npcCard.querySelector('.relation-value');
        relationElement.textContent = npc.relationship.charAt(0).toUpperCase() + npc.relationship.slice(1);
        relationElement.className = `relation-value relation-${npc.relationship}`;
        
        // Set description
        npcCard.querySelector('.npc-description').innerHTML = `<p>${npc.description}</p>`;
        
        // Set quote
        npcCard.querySelector('blockquote').textContent = npc.quote;
        
        // Set tags
        const tagsContainer = npcCard.querySelector('.npc-tags');
        npc.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
            tagsContainer.appendChild(tagElement);
        });
        
        // Add to NPC list
        npcList.appendChild(npcCard);
    });
    
    // Add click handlers to all NPC tags
    document.querySelectorAll('.npc-tags .tag').forEach(tag => {
        tag.addEventListener('click', function() {
            const tagText = this.textContent.toLowerCase();
            const tagValue = tagText.replace(/\s+/g, '-');
            
            // Find and click the corresponding tag button
            const tagBtn = document.querySelector(`.tag-btn[data-tag="${tagValue}"]`);
            if (tagBtn && !tagBtn.classList.contains('active')) {
                tagBtn.click();
            }
        });
    });
    
    console.log(`Added ${npcData.length} example NPCs`);
}

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

//==============================================================================
// AUDIO AND VISUAL EFFECTS
//==============================================================================

/**
 * Play filter interaction sound
 * @param {string} type - Type of filter interaction (default, tag, clear, etc.)
 */
function playFilterSound(type = 'default') {
    // Create audio element if needed
    let sound;
    
    switch(type) {
        case 'tag':
            sound = new Audio('assets/sounds/tag-click.mp3');
            sound.volume = 0.3;
            break;
        case 'tag-remove':
            sound = new Audio('assets/sounds/tag-remove.mp3');
            sound.volume = 0.2;
            break;
        case 'clear':
            sound = new Audio('assets/sounds/clear-filters.mp3');
            sound.volume = 0.4;
            break;
        default:
            sound = new Audio('assets/sounds/filter-click.mp3');
            sound.volume = 0.3;
    }
    
    // Optional: Only play if not on mobile
    if (!document.body.classList.contains('mobile-device')) {
        sound.play().catch(e => console.log('Error playing sound:', e));
    }
}

/**
 * Setup ambient effects for the NPCs page
 */
function setupAmbientEffects() {
    // Re-use existing ambient effects from crimson-court.js
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