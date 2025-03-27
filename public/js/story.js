/**
 * The Crimson Court - Story So Far
 * 
 * This script manages the story page functionality, including:
 * - Lazy loading story episodes as user scrolls
 * - Filtering episodes by act, chapter, and location
 * - Search functionality for finding specific content
 * - Fade in/out animations as episodes enter/leave viewport
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Story module first
    Story.init();
});

// Story Module
const Story = {
    // Configuration
    config: {
        episodesPerBatch: 15,          // Number of episodes to load per batch
        fadeInThreshold: 100,         // Pixels from bottom to start fading in
        scrollThreshold: 300,         // Pixels from bottom to trigger loading more
        animationDelay: 100,          // Ms delay between episode animations
    },

    // State
    state: {
        isLoading: false,               // Are we currently loading episodes?
        hasMoreEpisodes: true,          // Are there more episodes to load?
        currentPage: 1,                 // Current page for pagination
        currentAct: 'all',              // Currently selected act filter
        currentChapter: 'all',          // Currently selected chapter filter
        currentLocation: 'all',         // Currently selected location filter
        searchTerm: '',                 // Current search term
        loadedEpisodeIds: new Set(),    // IDs of already loaded episodes (prevent duplicates)
        cachedEpisodes: [],             // All episodes loaded from the server
        visibleEpisodeIds: new Set(),   // IDs of currently visible episodes
        knownLocations: new Set(['all']), // Track all unique locations for filtering
        knownChapters: new Set(['all']), // Track all unique chapters for filtering
    },

    // DOM Elements
    elements: {
        storyContent: document.getElementById('story-content'),
        topLoader: document.querySelector('.top-loader'),
        bottomLoader: document.querySelector('.bottom-loader'),
        searchInput: document.getElementById('story-search-input'),
        searchButton: document.getElementById('search-button'),
        noResultsMessage: document.querySelector('.no-results-message'),
        clearSearchBtn: document.querySelector('.clear-search-btn'),
        episodeTemplate: document.getElementById('episode-template'),
        dividerTemplate: document.getElementById('divider-template'),
        actDropdownBtn: document.getElementById('act-dropdown-btn'),
        actDropdown: document.getElementById('act-dropdown'),
        chapterDropdownBtn: document.getElementById('chapter-dropdown-btn'),
        chapterDropdown: document.getElementById('chapter-dropdown'),
        locationDropdownBtn: document.getElementById('location-dropdown-btn'),
        locationDropdown: document.getElementById('location-dropdown'),
        locationFilters: document.querySelector('.location-filters'),
    },

    // Initialize Story
    init: function() {
        
        
        // Cache DOM elements first
        this.elements = {
            storyContent: document.getElementById('story-content'),
            topLoader: document.querySelector('.top-loader'),
            bottomLoader: document.querySelector('.bottom-loader'),
            searchInput: document.getElementById('story-search-input'),
            searchButton: document.getElementById('search-button'),
            noResultsMessage: document.querySelector('.no-results-message'),
            clearSearchBtn: document.querySelector('.clear-search-btn'),
            episodeTemplate: document.getElementById('episode-template'),
            dividerTemplate: document.getElementById('divider-template'),
            actDropdownBtn: document.getElementById('act-dropdown-btn'),
            actDropdown: document.getElementById('act-dropdown'),
            chapterDropdownBtn: document.getElementById('chapter-dropdown-btn'),
            chapterDropdown: document.getElementById('chapter-dropdown'),
            locationDropdownBtn: document.getElementById('location-dropdown-btn'),
            locationDropdown: document.getElementById('location-dropdown'),
            locationFilters: document.querySelector('.location-filters')
        };

        // Debug element presence
        
        
        

        // Verify critical elements
        if (!this.elements.storyContent || !this.elements.episodeTemplate) {
            console.error('Critical elements missing');
            return;
        }

        // Clear any existing content
        this.elements.storyContent.innerHTML = '';

        // Initialize components
        this.bindEvents();
        this.initIntersectionObserver();
        this.initDropdowns();

        // Load initial data
        
        this.loadInitialEpisodes(); // Call the async method
    },

    // Bind all event listeners
    bindEvents: function() {
        // Scroll event for lazy loading
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        // Search functionality
        if (this.elements.searchInput && this.elements.searchButton) {
            this.elements.searchButton.addEventListener('click', this.handleSearch.bind(this));
            this.elements.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }
        
        // Clear search button
        if (this.elements.clearSearchBtn) {
            this.elements.clearSearchBtn.addEventListener('click', this.clearSearch.bind(this));
        }
        
        // Dropdown click handlers for act dropdown
        if (this.elements.actDropdownBtn && this.elements.actDropdown) {
            this.elements.actDropdownBtn.addEventListener('click', () => {
                this.toggleDropdown(this.elements.actDropdown);
            });
            
            // Act filter selection
            this.elements.actDropdown.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.filterByAct(item.dataset.act);
                    this.toggleDropdown(this.elements.actDropdown);
                });
            });
        }
        
        // Dropdown click handlers for chapter dropdown
        if (this.elements.chapterDropdownBtn && this.elements.chapterDropdown) {
            this.elements.chapterDropdownBtn.addEventListener('click', () => {
                this.toggleDropdown(this.elements.chapterDropdown);
            });
            
            // Chapter filter selection
            this.elements.chapterDropdown.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.filterByChapter(item.dataset.chapter);
                    this.toggleDropdown(this.elements.chapterDropdown);
                });
            });
        }
        
        // Dropdown click handlers for location dropdown
        if (this.elements.locationDropdownBtn && this.elements.locationDropdown) {
            this.elements.locationDropdownBtn.addEventListener('click', () => {
                this.toggleDropdown(this.elements.locationDropdown);
            });
            
            // Location filter selection
            this.elements.locationDropdown.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.filterByLocation(item.dataset.location);
                    this.toggleDropdown(this.elements.locationDropdown);
                });
            });
        }
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown-container')) {
                document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
                document.querySelectorAll('.dropdown-button').forEach(button => {
                    button.classList.remove('active');
                });
            }
        });
    },

    // Initialize Intersection Observer for fade effects
    initIntersectionObserver: function() {
        const options = {
            root: null, // Use viewport
            rootMargin: '0px',
            threshold: 0.1 // Trigger when 10% of element is visible
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Skip non-episode entries
                if (!entry.target.classList.contains('story-episode') && 
                    !entry.target.classList.contains('story-divider')) {
                    return;
                }

                if (entry.isIntersecting) {
                    // Element is in view, make it visible with animation
                    entry.target.classList.add('visible');
                    
                    // Store visible episode ID
                    if (entry.target.id) {
                        this.state.visibleEpisodeIds.add(entry.target.id);
                    }
                } else {
                    // Element is out of view
                    if (entry.target.id) {
                        this.state.visibleEpisodeIds.delete(entry.target.id);
                    }
                    
                    // Only add fade-out if it was already visible and scrolling out the top
                    if (entry.target.classList.contains('visible') && entry.boundingClientRect.y < 0) {
                        entry.target.classList.remove('visible');
                    }
                }
            });
        }, options);
    },

    // Initialize dropdown functionality
    initDropdowns: function() {
        // This initializes any additional dynamic dropdown items based on data
        // This will be populated after loading episodes
        this.createLocationFilters();
    },

    // Toggle a dropdown's visibility
    toggleDropdown: function(dropdown) {
        // Close other dropdowns first
        document.querySelectorAll('.dropdown-content').forEach(content => {
            if (content !== dropdown) {
                content.classList.remove('show');
            }
        });
        
        // Toggle the button active state
        const button = dropdown.previousElementSibling;
        if (button) {
            button.classList.toggle('active');
        }
        
        // Toggle the dropdown
        dropdown.classList.toggle('show');
    },

    // Handle scroll event for lazy loading
    handleScroll: function() {
        // Don't process if already loading
        if (this.state.isLoading) return;

        const scrollY = window.scrollY || window.pageYOffset;
        const windowHeight = window.innerHeight;
        const bodyHeight = document.body.scrollHeight; // Changed from offsetHeight to scrollHeight
        
        // Check if we're near the bottom
        const nearBottom = scrollY + windowHeight > bodyHeight - this.config.scrollThreshold;
        
        // For troubleshooting
        
        
        if (this.state.hasMoreEpisodes && nearBottom) {
            
            this.loadMoreEpisodes();
        }
    },

    // Handle search functionality
    handleSearch: function() {
        const searchTerm = this.elements.searchInput.value.trim();
        
        if (searchTerm !== this.state.searchTerm) {
            this.state.searchTerm = searchTerm;
            this.resetStory();
            this.filterEpisodes();
        }
    },

    // Clear search functionality
    clearSearch: function() {
        if (this.elements.searchInput) {
            this.elements.searchInput.value = '';
        }
        
        // Reset all filters
        this.state.searchTerm = '';
        this.state.currentAct = 'all';
        this.state.currentChapter = 'all';
        this.state.currentLocation = 'all';
        
        // Update dropdown UI
        this.updateDropdownUI(this.elements.actDropdownBtn, 'All Acts');
        this.updateDropdownUI(this.elements.chapterDropdownBtn, 'All Chapters');
        this.updateDropdownUI(this.elements.locationDropdownBtn, 'All Locations');
        
        // Update active classes in dropdowns
        document.querySelectorAll('.dropdown-item').forEach(item => {
            if (item.dataset.act === 'all' || item.dataset.chapter === 'all' || item.dataset.location === 'all') {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Reset and reload
        this.resetStory();
        this.filterEpisodes();
    },

    // Filter by act
    filterByAct: function(act) {
        if (act !== this.state.currentAct) {
            this.state.currentAct = act;
            
            // Update button text
            const actMap = {
                'all': 'All Acts',
                'act-1': 'Act I: The Gathering',
                'act-2': 'Act II: The Conclave',
                'act-3': 'Act III: The Revelation'
            };
            
            this.updateDropdownUI(this.elements.actDropdownBtn, actMap[act] || 'All Acts');
            
            // Update active classes in dropdown
            this.elements.actDropdown.querySelectorAll('.dropdown-item').forEach(item => {
                if (item.dataset.act === act) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            // Reset and reload with filter
            this.resetStory();
            this.filterEpisodes();
        }
    },

    // Filter by chapter
    filterByChapter: function(chapter) {
        if (chapter !== this.state.currentChapter) {
            this.state.currentChapter = chapter;
            
            // Get chapter name from the dropdown item
            let chapterName = 'All Chapters';
            this.elements.chapterDropdown.querySelectorAll('.dropdown-item').forEach(item => {
                if (item.dataset.chapter === chapter) {
                    chapterName = item.textContent.trim();
                }
            });
            
            // Update button text
            this.updateDropdownUI(this.elements.chapterDropdownBtn, chapterName);
            
            // Update active classes in dropdown
            this.elements.chapterDropdown.querySelectorAll('.dropdown-item').forEach(item => {
                if (item.dataset.chapter === chapter) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            // Reset and reload with filter
            this.resetStory();
            this.filterEpisodes();
        }
    },

    // Filter by location
    filterByLocation: function(location) {
        if (location !== this.state.currentLocation) {
            this.state.currentLocation = location;
            
            // Reset and reload with filter
            this.resetStory();
            this.filterEpisodes();
        }
    },

    // Update dropdown button UI
    updateDropdownUI: function(button, text) {
        if (button) {
            const span = button.querySelector('.current-selection');
            if (span) {
                // Keep the icon
                const icon = span.querySelector('i');
                span.innerHTML = '';
                if (icon) {
                    span.appendChild(icon);
                }
                span.appendChild(document.createTextNode(' ' + text));
            }
        }
    },

    // Reset story to load fresh content
    resetStory: function() {
        // Clear story content except for loaders
        if (this.elements.storyContent) {
            // Keep loaders and no results message
            const elementsToKeep = [
                this.elements.topLoader, 
                this.elements.bottomLoader,
                this.elements.noResultsMessage
            ];
            
            // Remove everything except the elements to keep
            Array.from(this.elements.storyContent.children).forEach(child => {
                if (!elementsToKeep.includes(child)) {
                    child.remove();
                }
            });
        }
        
        // Reset state
        this.state.isLoading = false;
        this.state.hasMoreEpisodes = true;
        this.state.loadedEpisodeIds.clear();
        this.state.visibleEpisodeIds.clear();
        this.state.currentPage = 1;
        
        // Reset loaders
        if (this.elements.topLoader) {
            this.elements.topLoader.classList.remove('active');
        }
        if (this.elements.bottomLoader) {
            this.elements.bottomLoader.classList.remove('active');
        }
        
        // Hide no results message
        if (this.elements.noResultsMessage) {
            this.elements.noResultsMessage.style.display = 'none';
        }
    },

    // Replace the loadInitialEpisodes method with this
    loadInitialEpisodes: async function() {
        if (!this.elements.storyContent) return;
        
        this.state.isLoading = true;
        
        // Show loader
        if (this.elements.bottomLoader) {
            this.elements.bottomLoader.classList.add('active');
        }
        
        try {
            // Fetch real data from API instead of using sample data
            const response = await fetch('/api/public/story-episodes');
            
            if (!response.ok) {
                throw new Error(`Failed to load story episodes: ${response.status}`);
            }
            
            this.state.cachedEpisodes = await response.json();
            
            
            // If no episodes found, use sample data as fallback
            if (this.state.cachedEpisodes.length === 0) {
                
                this.state.cachedEpisodes = this.getSampleStoryData();
            }
            
            // Process metadata
            this.extractMetadata();
            this.updateDynamicDropdowns();
            
            // Filter and display episodes
            const filteredEpisodes = this.filterCachedEpisodes();
            
            
            if (filteredEpisodes.length === 0) {
                if (this.elements.noResultsMessage) {
                    this.elements.noResultsMessage.style.display = 'block';
                }
                this.state.hasMoreEpisodes = false;
            } else {
                // Take first batch
                const firstBatch = filteredEpisodes.slice(0, this.config.episodesPerBatch);
                
                // Render episodes
                this.renderEpisodes(firstBatch);
                
                // Update state
                this.state.hasMoreEpisodes = filteredEpisodes.length > this.config.episodesPerBatch;
            }
        } catch (error) {
            console.error('Error loading story episodes:', error);
            
            // Use sample data as fallback
            this.state.cachedEpisodes = this.getSampleStoryData();
            this.extractMetadata();
            this.updateDynamicDropdowns();
            
            // Filter and display episodes
            const filteredEpisodes = this.filterCachedEpisodes();
            this.renderEpisodes(filteredEpisodes.slice(0, this.config.episodesPerBatch));
        }
        
        // Update state and hide loader
        this.state.isLoading = false;
        if (this.elements.bottomLoader) {
            this.elements.bottomLoader.classList.remove('active');
        }
        
        // Observe new elements
        document.querySelectorAll('.story-episode, .story-divider').forEach(el => {
            this.observer.observe(el);
        });
    },

    // Load more episodes (when scrolling down)
    loadMoreEpisodes: function() {
        this.state.isLoading = true;
        
        // Show loader
        if (this.elements.bottomLoader) {
            this.elements.bottomLoader.classList.add('active');
        }
        
        // Filter episodes based on current filters
        const filteredEpisodes = this.filterCachedEpisodes();
        
        // Calculate which episodes to load next
        const startIndex = this.config.episodesPerBatch * this.state.currentPage;
        const nextBatch = filteredEpisodes.slice(
            startIndex, 
            startIndex + this.config.episodesPerBatch
        );
        
        // No more episodes to load
        if (nextBatch.length === 0) {
            this.state.hasMoreEpisodes = false;
            this.state.isLoading = false;
            
            // Hide loader
            if (this.elements.bottomLoader) {
                this.elements.bottomLoader.classList.remove('active');
            }
            
            return;
        }
        
        // Render next batch of episodes
        this.renderEpisodes(nextBatch);
        
        // Update state
        this.state.currentPage++;
        this.state.hasMoreEpisodes = filteredEpisodes.length > startIndex + this.config.episodesPerBatch;
        this.state.isLoading = false;
        
        // Hide loader
        if (this.elements.bottomLoader) {
            this.elements.bottomLoader.classList.remove('active');
        }
        
        // Observe new elements
        document.querySelectorAll('.story-episode, .story-divider').forEach(el => {
            if (!el.classList.contains('visible')) {
                this.observer.observe(el);
            }
        });
    },

    // Extract metadata from cached episodes
    extractMetadata: function() {
        // Extract all unique locations and chapters
        this.state.cachedEpisodes.forEach(episode => {
            // Extract locations
            if (episode.locations && Array.isArray(episode.locations)) {
                episode.locations.forEach(loc => {
                    this.state.knownLocations.add(loc.id);
                });
            }
            
            // Extract chapters
            if (episode.chapter && episode.chapter.id) {
                this.state.knownChapters.add(episode.chapter.id);
            }
        });
        
        
        
    },

    // Update dropdowns with dynamic data
    updateDynamicDropdowns: function() {
        // Update location filters when acts/chapters change
        this.createLocationFilters();
        
        // Update chapter dropdown with chapters from data
        this.updateChapterDropdown();
        
        // Update act dropdown with acts from data
        this.updateActDropdown();
    },
    
    // Update chapter dropdown based on loaded episodes
    updateChapterDropdown: function() {
        if (!this.elements.chapterDropdown) return;
        
        // Keep the "All Chapters" option
        const allChaptersOption = this.elements.chapterDropdown.querySelector('[data-chapter="all"]');
        this.elements.chapterDropdown.innerHTML = '';
        if (allChaptersOption) {
            this.elements.chapterDropdown.appendChild(allChaptersOption);
        }
        
        // Track chapters already added to avoid duplicates
        const addedChapters = new Set(['all']);
        
        // Extract unique chapters from episodes
        const chapters = [];
        this.state.cachedEpisodes.forEach(episode => {
            if (episode.chapter && episode.chapter.id && !addedChapters.has(episode.chapter.id)) {
                addedChapters.add(episode.chapter.id);
                chapters.push(episode.chapter);
            }
        });
        
        // Sort chapters by their ID (assuming format like "chapter-1", "chapter-2")
        chapters.sort((a, b) => {
            const aNum = parseInt(a.id.replace('chapter-', '')) || 0;
            const bNum = parseInt(b.id.replace('chapter-', '')) || 0;
            return aNum - bNum;
        });
        
        // Add chapter items to dropdown
        chapters.forEach(chapter => {
            const item = document.createElement('a');
            item.href = '#';
            item.className = 'dropdown-item';
            item.dataset.chapter = chapter.id;
            item.textContent = `${chapter.name}${chapter.subtitle ? ': ' + chapter.subtitle : ''}`;
            
            // Mark as active if it's the currently selected chapter
            if (chapter.id === this.state.currentChapter) {
                item.classList.add('active');
            }
            
            // Add click event
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterByChapter(chapter.id);
                this.toggleDropdown(this.elements.chapterDropdown);
            });
            
            this.elements.chapterDropdown.appendChild(item);
        });
    },
    
    // Update act dropdown based on loaded episodes
    updateActDropdown: function() {
        if (!this.elements.actDropdown) return;
        
        // Keep the "All Acts" option
        const allActsOption = this.elements.actDropdown.querySelector('[data-act="all"]');
        this.elements.actDropdown.innerHTML = '';
        if (allActsOption) {
            this.elements.actDropdown.appendChild(allActsOption);
        }
        
        // Track acts already added to avoid duplicates
        const addedActs = new Set(['all']);
        
        // Extract unique acts from episodes
        const acts = [];
        this.state.cachedEpisodes.forEach(episode => {
            if (episode.act && episode.act.id && !addedActs.has(episode.act.id)) {
                addedActs.add(episode.act.id);
                acts.push(episode.act);
            }
        });
        
        // Sort acts by their ID (assuming format like "act-1", "act-2")
        acts.sort((a, b) => {
            const aNum = parseInt(a.id.replace('act-', '')) || 0;
            const bNum = parseInt(b.id.replace('act-', '')) || 0;
            return aNum - bNum;
        });
        
        // Add act items to dropdown
        acts.forEach(act => {
            const item = document.createElement('a');
            item.href = '#';
            item.className = 'dropdown-item';
            item.dataset.act = act.id;
            item.textContent = act.name;
            
            // Mark as active if it's the currently selected act
            if (act.id === this.state.currentAct) {
                item.classList.add('active');
            }
            
            // Add click event
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterByAct(act.id);
                this.toggleDropdown(this.elements.actDropdown);
            });
            
            this.elements.actDropdown.appendChild(item);
        });
    },

    // Render episodes (with act/chapter dividers)
    renderEpisodes: function(episodes) {
        if (!this.elements.storyContent) {
            console.error('Story content container not found');
            return;
        }

        

        let lastAct = null;
        let lastChapter = null;

        episodes.forEach(episode => {
            // Check for new act
            if (!lastAct || lastAct.id !== episode.act.id) {
                const actDivider = this.createDivider('act', episode.act);
                if (actDivider) {
                    this.elements.storyContent.appendChild(actDivider);
                }
                lastAct = episode.act;
            }

            // Check for new chapter
            if (!lastChapter || lastChapter.id !== episode.chapter.id) {
                const chapterDivider = this.createDivider('chapter', episode.chapter);
                if (chapterDivider) {
                    this.elements.storyContent.appendChild(chapterDivider);
                }
                lastChapter = episode.chapter;
            }

            // Create and append episode
            const episodeElement = this.createEpisode(episode);
            if (episodeElement) {
                this.elements.storyContent.appendChild(episodeElement);
            }
        });
    },

    // Create a divider element (act or chapter)
    createDivider: function(type, data) {
        // Skip if no template
        if (!this.elements.dividerTemplate) return null;
        
        // Clone the template
        const template = this.elements.dividerTemplate.content.cloneNode(true);
        const dividerElement = template.querySelector('.story-divider');
        
        // Set attributes
        dividerElement.dataset.type = type;
        dividerElement.dataset.act = data.id;
        dividerElement.id = `${type}-${data.id}`;
        
        // Set content
        const title = dividerElement.querySelector('.divider-title');
        if (title) title.textContent = data.name;
        
        const subtitle = dividerElement.querySelector('.divider-subtitle');
        if (subtitle) subtitle.textContent = data.subtitle || '';
        
        return dividerElement;
    },

    // Create an episode element
    createEpisode: function(episode) {
        const template = this.elements.episodeTemplate;
        if (!template) {
            console.error('Episode template not found');
            return null;
        }

        // Clone template
        const clone = template.content.cloneNode(true);
        const episodeElement = clone.querySelector('.story-episode');

        // Set episode metadata
        const numberEl = episodeElement.querySelector('.episode-number');
        if (numberEl) numberEl.textContent = `Session ${episode.episodeNumber}`;

        const dateEl = episodeElement.querySelector('.episode-date');
        if (dateEl) {
            if (episode.dateStart === episode.dateEnd) {
                // Single day session
                dateEl.textContent = episode.dateStart;
            } else {
                // Multi-day session
                dateEl.textContent = `${episode.dateStart} - ${episode.dateEnd}`;
            }
        }

        const titleEl = episodeElement.querySelector('.episode-title');
        if (titleEl) titleEl.textContent = episode.title;

        // Set locations
        const locationTags = episodeElement.querySelector('.location-tags');
        if (locationTags && episode.locations) {
            locationTags.innerHTML = episode.locations
                .map(loc => `<span class="location-tag">${loc.name}</span>`)
                .join('');
        }

        // Set content
        const contentEl = episodeElement.querySelector('.episode-text');
        if (contentEl) contentEl.innerHTML = episode.content;

        // Set image if exists
        if (episode.image) {
            const imageContainer = episodeElement.querySelector('.episode-image-container');
            const image = episodeElement.querySelector('.episode-image');
            const caption = episodeElement.querySelector('.image-caption');
            
            if (image) {
                image.src = episode.image;
                image.alt = episode.title;
            }
            
            if (caption) {
                caption.textContent = episode.imageCaption || '';
            }
            
            if (imageContainer) {
                imageContainer.style.display = 'block';
            }
        }

        return episodeElement;
    },

    // Filter cached episodes based on current filters
    filterCachedEpisodes: function() {
        // Start with all episodes
        let filteredEpisodes = [...this.state.cachedEpisodes];
        
        // Apply act filter
        if (this.state.currentAct && this.state.currentAct !== 'all') {
            filteredEpisodes = filteredEpisodes.filter(episode => 
                episode.act && episode.act.id === this.state.currentAct
            );
        }
        
        // Apply chapter filter
        if (this.state.currentChapter && this.state.currentChapter !== 'all') {
            filteredEpisodes = filteredEpisodes.filter(episode => 
                episode.chapter && episode.chapter.id === this.state.currentChapter
            );
        }
        
        // Apply location filter
        if (this.state.currentLocation && this.state.currentLocation !== 'all') {
            filteredEpisodes = filteredEpisodes.filter(episode => 
                episode.locations && episode.locations.some(loc => loc.id === this.state.currentLocation)
            );
        }
        
        // Apply search filter
        if (this.state.searchTerm) {
            const searchLower = this.state.searchTerm.toLowerCase();
            filteredEpisodes = filteredEpisodes.filter(episode => {
                // Search in title, content, and location names
                return (
                    episode.title.toLowerCase().includes(searchLower) ||
                    episode.content.toLowerCase().includes(searchLower) ||
                    (episode.locations && episode.locations.some(loc => loc.name.toLowerCase().includes(searchLower)))
                );
            });
        }
        
        // Sort by episode number
        filteredEpisodes.sort((a, b) => a.episodeNumber - b.episodeNumber);
        
        return filteredEpisodes;
    },

    // Filter episodes and display
    filterEpisodes: function() {
        // Filter episodes
        const filteredEpisodes = this.filterCachedEpisodes();
        
        // Update no results message
        if (filteredEpisodes.length === 0) {
            if (this.elements.noResultsMessage) {
                this.elements.noResultsMessage.style.display = 'block';
            }
            
            this.state.hasMoreEpisodes = false;
            return;
        }
        
        // Hide no results message
        if (this.elements.noResultsMessage) {
            this.elements.noResultsMessage.style.display = 'none';
        }
        
        // Take the first batch
        const firstBatch = filteredEpisodes.slice(0, this.config.episodesPerBatch);
        
        // Render episodes
        this.renderEpisodes(firstBatch);
        
        // Update state
        this.state.hasMoreEpisodes = filteredEpisodes.length > this.config.episodesPerBatch;
        
        // Observe new elements
        document.querySelectorAll('.story-episode, .story-divider').forEach(el => {
            this.observer.observe(el);
        });
    },

    // Sample data for the demonstration
    getSampleStoryData: function() {
        return [
            {
                id: "1",
                episodeNumber: 1,
                title: "Royal Summons",
                dateStart: "January 15, 850 A.R.",  // Changed from date to dateStart
                dateEnd: "January 15, 850 A.R.",    // Added dateEnd
                act: {
                    id: "act-1",
                    name: "Act I: The Gathering",
                    subtitle: "The heirs answer their king's call"
                },
                chapter: {
                    id: "chapter-1",
                    name: "Chapter 1",
                    subtitle: "Royal Summons"
                },
                locations: [
                    { id: "crimson-keep", name: "Crimson Keep" },
                    { id: "ederia-city", name: "Ederia City" }
                ],
                content: "<p>The five heirs to the Crimson Throne—each with their own ambitions, secrets, and talents—receive a royal summons from their aging father, King Talon Falkrest. Word spreads throughout the kingdom that the king's health is failing, and the succession must be decided.</p><p>The first to arrive is Princess Eleanor, the king's eldest daughter and commander of the royal navy. Her journey from the coastal fortress of Stormwatch is marked by whispers of unrest along the borders of the kingdom.</p><p>Meanwhile, Prince Darian, the charismatic diplomat, returns from his mission to the neighboring kingdoms with troubling news of alliances shifting against Ederia. The castle steward greets him with the king's urgent request for a private audience.</p>",
                image: "assets/images/story/royal-summons.jpg",
                imageCaption: "The royal messengers depart with the king's seal"
            },
            {
                id: "2",
                episodeNumber: 2,
                title: "The First Council",
                dateStart: "January 20, 850 A.R.",
                dateEnd: "January 21, 850 A.R.",    // Example of multi-day session
                act: {
                    id: "act-1",
                    name: "Act I: The Gathering",
                    subtitle: "The heirs answer their king's call"
                },
                chapter: {
                    id: "chapter-1",
                    name: "Chapter 1",
                    subtitle: "Royal Summons"
                },
                locations: [
                    { id: "crimson-keep", name: "Crimson Keep" },
                    { id: "throne-room", name: "Throne Room" }
                ],
                content: "<p>With all five heirs finally gathered in the Crimson Keep, King Talon calls the first council meeting. The throne room's ancient stonework witnesses the tense reunion of siblings who have spent years pursuing separate paths.</p><p>The king, his once-powerful frame now diminished by illness, reveals a dire prophecy from the court seers: a darkness gathers beyond the kingdom's borders that threatens to consume all of Ederia. The succession cannot be decided by bloodright alone—the true heir must prove their worth by uniting the realm against this coming threat.</p><p>Prince Rowan, the military strategist, argues for strengthening the army, while Lady Sophia suggests diplomatic solutions. Their half-brother, Lord Thorne, speaks of arcane defenses that could be activated. The meeting ends with the king assigning each heir a task to test their abilities and vision for the kingdom's future.</p>",
                image: "assets/images/story/throne-room.jpg",
                imageCaption: "The ancient throne room of Ederia"
            },
            {
                id: "3",
                episodeNumber: 3,
                title: "Whispers in the Dark",
                dateStart: "January 25, 850 A.R.",
                dateEnd: "January 25, 850 A.R.",
                act: {
                    id: "act-1",
                    name: "Act I: The Gathering",
                    subtitle: "The heirs answer their king's call"
                },
                chapter: {
                    id: "chapter-2",
                    name: "Chapter 2",
                    subtitle: "Palace Intrigue"
                },
                locations: [
                    { id: "crimson-keep", name: "Crimson Keep" },
                    { id: "royal-library", name: "Royal Library" }
                ],
                content: "<p>Late at night in the Crimson Keep's vast library, Lady Sophia discovers a forgotten tome that speaks of an ancient artifact called the Crown of Ederius, said to reveal the true heir when worn by one of royal blood. As she studies the text by candlelight, she overhears a hushed conversation from behind the stacks.</p><p>Two royal advisors discuss a secret alliance forming between neighboring kingdoms and hint at a traitor among the heirs. Before she can hear more, a noise startles the conspirators into silence. Sophia slips away, her mind racing with questions about who might be plotting against the crown.</p><p>Meanwhile, Prince Darian meets with his network of spies who bring reports of unusual troop movements along the northern border and strange magical disturbances in the ancient forests. The pieces of a larger threat begin to take shape, but its true nature remains elusive.</p>",
                image: null
            }
        ];
    },

    // Create location filters
    createLocationFilters: function() {
        if (!this.elements.locationFilters) return;

        // Clear existing filters
        this.elements.locationFilters.innerHTML = '';

        // Get all locations from visible acts/chapters
        const visibleLocations = new Map();
        
        this.state.cachedEpisodes.forEach(episode => {
            // Check if episode matches current act/chapter filters
            const matchesAct = this.state.currentAct === 'all' || 
                              (episode.act && episode.act.id === this.state.currentAct);
            const matchesChapter = this.state.currentChapter === 'all' || 
                                 (episode.chapter && episode.chapter.id === this.state.currentChapter);

            // If episode matches filters, add its locations
            if (matchesAct && matchesChapter) {
                episode.locations?.forEach(loc => {
                    visibleLocations.set(loc.id, loc.name);
                });
            }
        });

        // Create "All Locations" checkbox
        const allLocationsDiv = document.createElement('div');
        allLocationsDiv.className = 'location-filter-item';
        allLocationsDiv.innerHTML = `
            <label class="checkbox-label">
                <input type="checkbox" 
                       data-location="all" 
                       ${this.state.currentLocation === 'all' ? 'checked' : ''}>
                <span class="checkbox-custom"></span>
                <span class="checkbox-text">All Locations</span>
            </label>
        `;

        this.elements.locationFilters.appendChild(allLocationsDiv);

        // Create checkbox for each location
        visibleLocations.forEach((name, id) => {
            const div = document.createElement('div');
            div.className = 'location-filter-item';
            div.innerHTML = `
                <label class="checkbox-label">
                    <input type="checkbox" 
                           data-location="${id}" 
                           ${this.state.currentLocation === id ? 'checked' : ''}>
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-text">${name}</span>
                </label>
            `;
            this.elements.locationFilters.appendChild(div);
        });

        // Add event listeners
        this.elements.locationFilters.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const locationId = e.target.dataset.location;
                
                // Handle "All Locations" checkbox
                if (locationId === 'all') {
                    if (e.target.checked) {
                        // Uncheck all other boxes
                        this.elements.locationFilters.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                            if (cb !== e.target) cb.checked = false;
                        });
                    }
                } else {
                    // Uncheck "All Locations" when selecting specific location
                    const allLocationsCheckbox = this.elements.locationFilters.querySelector('input[data-location="all"]');
                    if (allLocationsCheckbox) allLocationsCheckbox.checked = false;
                }

                this.filterByLocation(e.target.checked ? locationId : 'all');
            });
        });
    },
};