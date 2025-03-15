/**
 * The Crimson Court - Timeline
 * 
 * This script manages the royal timeline, including:
 * - Lazy loading events as user scrolls up/down
 * - Filtering events by era or search term
 * - Fade in/out animations as events enter/leave viewport
 * - Dynamic event placement (left/right alternating)
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Timeline immediately
    Timeline.init();
});

// Initialize the Timeline
const Timeline = {
    // Configuration
    config: {
        eventsPerBatch: 5,          // Number of events to load per batch
        fadeOutThreshold: 200,      // Pixels from top to start fading out
        fadeInThreshold: 100,       // Pixels from bottom to start fading in
        scrollThreshold: 300,       // Pixels from bottom to trigger loading more
        animationDelay: 100,        // Ms delay between event animations
        monthNames: [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ],
        eras: {
            'age-of-chains': 'The Age of Chains',
            'arcane-reckoning': 'The Arcane Reckoning',
            'broken-sun': 'The Age of the Broken Sun', 
            'silent-war': 'The Silent War',
            'uncertainty': 'The Age of Uncertainty'
        }
    },

    // State
    state: {
        isLoading: false,           // Are we currently loading events?
        hasMoreEvents: true,        // Are there more events to load?
        hasEarlierEvents: true,     // Are there earlier events to load?
        oldestYearLoaded: 845,      // The oldest year we've loaded events for
        newestYearLoaded: 850,      // The newest year we've loaded events for
        currentEra: '',             // Currently selected era filter
        searchTerm: '',             // Current search term
        visibleEventIds: new Set(), // IDs of currently visible events
        currentPosition: 'right',   // Current position (left/right) for alternating
        loadedEventIds: new Set(),  // IDs of already loaded events (prevent duplicates)
        cachedEvents: [],           // All events loaded from the server
        currentPage: 1,             // Current page number for pagination
    },

    // DOM Elements
    elements: {
        timelineContent: document.getElementById('timeline-content'),
        topLoader: document.querySelector('.top-loader'),
        bottomLoader: document.querySelector('.bottom-loader'),
        searchInput: document.getElementById('timeline-search'),
        searchButton: document.getElementById('search-button'),
        eraButtons: document.querySelectorAll('.era-button'),
        clearSearchBtn: document.querySelector('.clear-search-btn'),
        noResultsMessage: document.querySelector('.no-results-message'),
        eventTemplate: document.getElementById('timeline-event-template'),
        monarchTemplate: document.getElementById('monarch-break-template')
    },

    // Initialize Timeline
    init: function() {
        this.bindEvents();
        this.initIntersectionObserver();
        this.loadInitialEvents();
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
        
        // Era filter buttons
        if (this.elements.eraButtons) {
            this.elements.eraButtons.forEach(button => {
                button.addEventListener('click', () => {
                    this.filterByEra(button.dataset.era);
                });
            });
        }

        // Clear search button
        const clearSearchBtn = document.querySelector('.clear-search-btn');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }
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
                // Skip non-event entries
                if (!entry.target.classList.contains('timeline-event') && 
                    !entry.target.classList.contains('timeline-break')) {
                    return;
                }

                if (entry.isIntersecting) {
                    // Element is in view, make it visible with animation
                    entry.target.classList.add('visible');
                    
                    // Store visible event ID
                    if (entry.target.id) {
                        this.state.visibleEventIds.add(entry.target.id);
                    }
                } else {
                    // Element is out of view
                    if (entry.target.id) {
                        this.state.visibleEventIds.delete(entry.target.id);
                    }
                    
                    // Only add fade-out if it was already visible and scrolling out the top
                    if (entry.target.classList.contains('visible') && entry.boundingClientRect.y < 0) {
                        // Remove visible class directly without fade-out to prevent flashing
                        entry.target.classList.remove('visible');
                    }
                }
            });
        }, options);
    },

    // Handle scroll event for lazy loading
    handleScroll: function() {
        // Don't process if already loading
        if (this.state.isLoading) return;

        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const bodyHeight = document.body.offsetHeight;
        
        // Check if we're near the bottom
        if (this.state.hasMoreEvents && 
            scrollY + windowHeight > bodyHeight - this.config.scrollThreshold) {
            this.loadMoreEvents();
        }
        
        // Check if we're near the top
        if (this.state.hasEarlierEvents && scrollY < this.config.scrollThreshold) {
            this.loadEarlierEvents();
        }
        
        // Use a debounced or throttled approach to checking visibility
        // to reduce processing during scroll
        if (!this._scrollThrottleTimeout) {
            this._scrollThrottleTimeout = setTimeout(() => {
                // Ensure event visibility
                document.querySelectorAll('.timeline-event:not(.visible), .timeline-break:not(.visible)').forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.top < windowHeight && rect.bottom > 0) {
                        el.classList.add('visible');
                    }
                });
                this._scrollThrottleTimeout = null;
            }, 100); // Throttle to execute at most every 100ms
        }
    },

    // Handle search functionality
    handleSearch: function() {
        const searchTerm = this.elements.searchInput.value.trim();
        
        if (searchTerm !== this.state.searchTerm) {
            this.state.searchTerm = searchTerm;
            this.resetTimeline();
            this.filterEvents();
        }
    },

    // Clear search functionality
    clearSearch: function() {
        // Reset search input
        if (this.elements.searchInput) {
            this.elements.searchInput.value = '';
        }
        
        // Reset state
        this.state.searchTerm = '';
        this.state.currentEra = '';
        this.state.currentPage = 1;
        
        // Reset era buttons
        this.updateEraButtons('all');
        
        // Reset and rerender timeline
        this.resetTimeline();
        
        // Hide no results message if visible
        if (this.elements.noResultsMessage) {
            this.elements.noResultsMessage.style.display = 'none';
        }
        
        // Reload initial events
        this.loadInitialEvents();
    },

    // Filter by era
    filterByEra: function(era) {
        console.log('Filtering by era:', era);
        
        // Update active button state
        this.updateEraButtons(era);
        
        // Update state
        this.state.currentEra = era === 'all' ? '' : era;
        
        // Reset and refilter
        this.resetTimeline();
        this.renderFilteredEvents();
    },

    // Separated button update logic
    updateEraButtons: function(selectedEra) {
        const eraButtons = document.querySelectorAll('.era-navigation .era-button');
        eraButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.era === selectedEra);
        });
    },

    // Consolidated filtering logic
    filterEvents: function() {
        let filteredEvents = [...this.state.cachedEvents];
        
        // Era filter
        if (this.state.currentEra) {
            filteredEvents = filteredEvents.filter(event => event.era === this.state.currentEra);
        }
        
        // Search filter
        if (this.state.searchTerm) {
            const searchLower = this.state.searchTerm.toLowerCase();
            filteredEvents = filteredEvents.filter(event => {
                return event.type === 'reign-break' ? 
                    event.title.toLowerCase().includes(searchLower) :
                    this.matchesSearch(event, searchLower);
            });
        }
        
        return this.sortEvents(filteredEvents);
    },

    // Separated search matching logic
    matchesSearch: function(event, searchTerm) {
        return (
            event.title.toLowerCase().includes(searchTerm) ||
            (event.description && event.description.toLowerCase().includes(searchTerm)) ||
            (event.location && event.location.toLowerCase().includes(searchTerm))
        );
    },

    // Separated sorting logic
    sortEvents: function(events) {
        return events.sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            if (a.month !== b.month) return (a.month || 0) - (b.month || 0);
            if (a.day !== b.day) return (a.day || 0) - (b.day || 0);
            return a.type === 'reign-break' ? -1 : 1;
        });
    },

    // Reset timeline to load fresh content
    resetTimeline: function() {
        // Clear timeline content
        if (this.elements.timelineContent) {
            this.elements.timelineContent.innerHTML = '';
        }
        
        // Reset state
        this.state.isLoading = false;
        this.state.hasMoreEvents = true;
        this.state.hasEarlierEvents = true;
        this.state.currentPosition = 'right';
        this.state.loadedEventIds.clear();
        this.state.visibleEventIds.clear();
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

    // Filter events based on current state
   // Filter by era - updated to work with your HTML structure
filterByEra: function(era) {
    console.log('Filtering by era:', era);
    
    // Find era buttons - use your class structure
    const eraButtons = document.querySelectorAll('.era-navigation .era-button');
    
    // Update active button
    eraButtons.forEach(button => {
        if (button.dataset.era === era) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Handle different era values
    if (era === 'all' || era === '') {
        this.state.currentEra = ''; // Empty string means no filter
    } else {
        this.state.currentEra = era;
    }
    
    console.log('Current era set to:', this.state.currentEra);
    
    // Reset timeline and apply filters
    this.resetTimeline();
    
    // Add a slight delay to ensure DOM is updated
    setTimeout(() => {
        const filteredEvents = this.filterEvents();
        console.log('Filtered events:', filteredEvents.length);
        
        // Take the first batch
        const firstBatch = filteredEvents.slice(0, this.config.eventsPerBatch);
        
        // Render events
        firstBatch.forEach(event => {
            this.renderTimelineItem(event);
        });
        
        // Update state
        this.state.hasMoreEvents = filteredEvents.length > this.config.eventsPerBatch;
        
        // Show/hide no results message
        if (this.elements.noResultsMessage) {
            if (filteredEvents.length === 0) {
                this.elements.noResultsMessage.style.display = 'block';
            } else {
                this.elements.noResultsMessage.style.display = 'none';
            }
        }
        
        // Observe new elements
        document.querySelectorAll('.timeline-event, .timeline-break').forEach(el => {
            this.observer.observe(el);
        });
    }, 50);
},
    
    // Filter events - updated function
    filterEvents: function() {
        console.log('Filtering events. Era:', this.state.currentEra, 'Search:', this.state.searchTerm);
        console.log('Total cached events:', this.state.cachedEvents.length);
        
        // Start with all events
        let filteredEvents = [...this.state.cachedEvents];
        
        // Apply era filter
        if (this.state.currentEra) {
            console.log('Applying era filter for:', this.state.currentEra);
            filteredEvents = filteredEvents.filter(event => {
                const match = event.era === this.state.currentEra;
                return match;
            });
        }
        
        // Apply search filter
        if (this.state.searchTerm) {
            const searchLower = this.state.searchTerm.toLowerCase();
            filteredEvents = filteredEvents.filter(event => {
                // Allow searching in all fields
                return (
                    (event.title && event.title.toLowerCase().includes(searchLower)) ||
                    (event.description && event.description.toLowerCase().includes(searchLower)) ||
                    (event.location && event.location.toLowerCase().includes(searchLower))
                );
            });
        }
        
        console.log('Filtered events count:', filteredEvents.length);
        
        // Sort by year and month
        filteredEvents.sort((a, b) => {
            // Primary sort by year
            if (a.year !== b.year) {
                return a.year - b.year;
            }
            // Secondary sort by month (if both have months)
            if (a.month && b.month) {
                return a.month - b.month;
            }
            // Reign breaks come before events in the same year
            if (a.type === 'reign-break' && b.type !== 'reign-break') {
                return -1;
            }
            if (a.type !== 'reign-break' && b.type === 'reign-break') {
                return 1;
            }
            return 0;
        });
        
        return filteredEvents;
    },
    
    // Fix event listener binding for era buttons
    bindEvents: function() {
        // Scroll event for lazy loading
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        // Log which era buttons are found
        console.log('Era buttons found:', this.elements.eraButtons ? this.elements.eraButtons.length : 0);
        
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
        
        // Era filter buttons - improved handling
        if (this.elements.eraButtons && this.elements.eraButtons.length > 0) {
            console.log('Setting up era button listeners');
            this.elements.eraButtons.forEach(button => {
                console.log('Button found:', button.dataset.era);
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Era button clicked:', button.dataset.era);
                    this.filterByEra(button.dataset.era);
                });
            });
        } else {
            // Try to find buttons a different way as a fallback
            console.log('No era buttons found with querySelector. Trying direct method...');
            const eraButtons = document.querySelectorAll('.era-button');
            if (eraButtons.length > 0) {
                console.log('Found', eraButtons.length, 'era buttons directly');
                this.elements.eraButtons = eraButtons;
                eraButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        console.log('Era button clicked:', button.dataset.era);
                        this.filterByEra(button.dataset.era);
                    });
                });
            }
        }

        // Clear search button
        const clearSearchBtn = document.querySelector('.clear-search-btn');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }
    },

    // Load initial events
    loadInitialEvents: function() {
        this.state.isLoading = true;
        
        // Show loader
        if (this.elements.bottomLoader) {
            this.elements.bottomLoader.classList.add('active');
        }
        
        // Fetch data from the server
        fetch('/api/public/timeline')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch timeline data');
                }
                return response.json();
            })
            .then(data => {
                console.log('Timeline data loaded:', data);
                
                // Store the fetched data in our cache
                this.state.cachedEvents = data || [];
                
                // Filter events based on current filters
                const filteredEvents = this.filterEvents();
                
                // Update no results message
                if (filteredEvents.length === 0) {
                    if (this.elements.noResultsMessage) {
                        this.elements.noResultsMessage.style.display = 'block';
                    }
                    
                    // Hide loaders
                    if (this.elements.bottomLoader) {
                        this.elements.bottomLoader.classList.remove('active');
                    }
                    
                    this.state.isLoading = false;
                    this.state.hasMoreEvents = false;
                    return;
                }
                
                // Take the first batch
                const firstBatch = filteredEvents.slice(0, this.config.eventsPerBatch);
                
                // Render events
                firstBatch.forEach(event => {
                    this.renderTimelineItem(event);
                });
                
                // Update state
                this.state.hasMoreEvents = filteredEvents.length > this.config.eventsPerBatch;
                this.state.isLoading = false;
                
                // Hide loader
                if (this.elements.bottomLoader) {
                    this.elements.bottomLoader.classList.remove('active');
                }
                
                // Observe new elements
                document.querySelectorAll('.timeline-event, .timeline-break').forEach(el => {
                    this.observer.observe(el);
                });
            })
            .catch(error => {
                console.error('Error fetching timeline data:', error);
                
                // Show error message
                if (this.elements.timelineContent) {
                    this.elements.timelineContent.innerHTML = `
                        <div class="error-message">
                            <p>Error loading timeline data. Please try again later.</p>
                        </div>
                    `;
                }
                
                // Hide loader
                if (this.elements.bottomLoader) {
                    this.elements.bottomLoader.classList.remove('active');
                }
                
                this.state.isLoading = false;
            });
    },

    // Load more events (when scrolling down)
    loadMoreEvents: function() {
        if (this.state.isLoading) return;
        
        this.state.isLoading = true;
        
        // Show loader
        if (this.elements.bottomLoader) {
            this.elements.bottomLoader.classList.add('active');
        }
        
        // We already have all data cached, just need to load the next batch
        const filteredEvents = this.filterEvents();
        
        // Calculate which events to load next
        const startIndex = this.config.eventsPerBatch * this.state.currentPage;
        const nextBatch = filteredEvents.slice(
            startIndex, 
            startIndex + this.config.eventsPerBatch
        );
        
        // No more events to load
        if (nextBatch.length === 0) {
            this.state.hasMoreEvents = false;
            this.state.isLoading = false;
            
            // Hide loader
            if (this.elements.bottomLoader) {
                this.elements.bottomLoader.classList.remove('active');
            }
            
            return;
        }
        
        // Add a small delay to make the loading more natural
        setTimeout(() => {
            // Render next batch of events
            nextBatch.forEach(event => {
                this.renderTimelineItem(event);
            });
            
            // Update state
            this.state.currentPage++;
            this.state.hasMoreEvents = filteredEvents.length > startIndex + this.config.eventsPerBatch;
            this.state.isLoading = false;
            
            // Hide loader
            if (this.elements.bottomLoader) {
                this.elements.bottomLoader.classList.remove('active');
            }
            
            // Observe new elements
            document.querySelectorAll('.timeline-event, .timeline-break').forEach(el => {
                if (!el.classList.contains('visible') && !el.classList.contains('fade-out')) {
                    this.observer.observe(el);
                }
            });
        }, 500);
    },

    // Load earlier events (when scrolling up)
    loadEarlierEvents: function() {
        // In a real implementation, this would load earlier events
        // For the demo, we'll just hide the loader
        if (this.elements.topLoader) {
            this.elements.topLoader.classList.add('active');
            
            setTimeout(() => {
                this.elements.topLoader.classList.remove('active');
                this.state.hasEarlierEvents = false;
            }, 1000);
        }
    },

    // Render a timeline item (event or reign break)
    renderTimelineItem: function(item) {
        // Skip if already rendered
        if (this.state.loadedEventIds.has(item.id)) {
            return;
        }
        
        // Mark as loaded
        this.state.loadedEventIds.add(item.id);
        
        // Create appropriate element based on type
        let timelineElement;
        
        if (item.type === 'reign-break') {
            timelineElement = this.createMonarchBreak(item);
        } else {
            timelineElement = this.createTimelineEvent(item);
        }
        
        // Add to timeline
        if (this.elements.timelineContent && timelineElement) {
            this.elements.timelineContent.appendChild(timelineElement);
        }
    },

    // Create a timeline event element
    createTimelineEvent: function(event) {
        const template = this.elements.eventTemplate;
        if (!template) return null;
        
        const clone = template.content.cloneNode(true);
        const eventElement = clone.querySelector('.timeline-event');
        
        // Set data attributes
        eventElement.dataset.year = event.year;
        eventElement.dataset.month = event.month || '';
        eventElement.dataset.era = event.era;
        
        // Set date components
        const daySpan = eventElement.querySelector('.timeline-day');
        const monthSpan = eventElement.querySelector('.timeline-month');
        const yearSpan = eventElement.querySelector('.timeline-year');
        
        // Always set the day if it exists
        if (daySpan && event.day) {
            daySpan.textContent = event.day;
        }
        
        // Set month if it exists
        if (monthSpan && event.month) {
            monthSpan.textContent = this.config.monthNames[event.month - 1];
        }
        
        // Always set year
        if (yearSpan) {
            yearSpan.textContent = `${event.year} A.R.`;
        }
        
        // Set position (alternating left/right)
        if (event.position) {
            // Use specified position if provided
            eventElement.classList.add(event.position);
            // Update current position
            this.state.currentPosition = event.position;
        } else {
            // Alternate left/right
            eventElement.classList.add(this.state.currentPosition);
            // Update for next event
            this.state.currentPosition = this.state.currentPosition === 'left' ? 'right' : 'left';
        }
        
        // Set unique ID
        eventElement.id = `event-${event.id}`;
        
        // Set content
        const title = eventElement.querySelector('.timeline-title');
        if (title) title.textContent = event.title;
        
        const location = eventElement.querySelector('.location-name');
        if (location) location.textContent = event.location;
        
        const description = eventElement.querySelector('.timeline-description');
        if (description) description.innerHTML = event.description;
        
        // Handle image if present
        const imageContainer = eventElement.querySelector('.timeline-image');
        const image = imageContainer ? imageContainer.querySelector('img') : null;
        
        if (image && event.image) {
            image.src = event.image;
            image.alt = event.title;
        } else if (imageContainer) {
            // Remove image container if no image
            imageContainer.remove();
        }
        
        return eventElement;
    },

    // Create a monarch break element
    createMonarchBreak: function(breakData) {
        // Skip if no template
        if (!this.elements.monarchTemplate) return null;
        
        // Clone the template
        const template = this.elements.monarchTemplate.content.cloneNode(true);
        const breakElement = template.querySelector('.timeline-break');
        
        // Set unique ID
        breakElement.id = `break-${breakData.id}`;
        
        // Set type class
        breakElement.classList.add(breakData.breakType);
        
        // Set content
        const title = breakElement.querySelector('h3');
        if (title) title.textContent = breakData.title;
        
        const year = breakElement.querySelector('.timeline-year');
        if (year) year.textContent = `${breakData.year} A.R.`;
        
        return breakElement;
    },

    // Filter cached events based on current filters
    filterCachedEvents: function() {
        // Start with all events
        let filteredEvents = [...this.state.cachedEvents];
        
        // Apply era filter
        if (this.state.currentEra) {
            filteredEvents = filteredEvents.filter(event => 
                event.era === this.state.currentEra
            );
        }
        
        // Apply search filter
        if (this.state.searchTerm) {
            const searchLower = this.state.searchTerm.toLowerCase();
            filteredEvents = filteredEvents.filter(event => {
                // Skip reign breaks in search
                if (event.type === 'reign-break') {
                    return false;
                }
                
                // Search in title, description, and location
                return (
                    event.title.toLowerCase().includes(searchLower) ||
                    event.description.toLowerCase().includes(searchLower) ||
                    event.location.toLowerCase().includes(searchLower)
                );
            });
        }
        
        // Sort by year and month
        filteredEvents.sort((a, b) => {
            // Primary sort by year
            if (a.year !== b.year) {
                return a.year - b.year;
            }
            // Secondary sort by month (if both have months)
            if (a.month && b.month) {
                return a.month - b.month;
            }
            // Reign breaks come before events in the same year
            if (a.type === 'reign-break' && b.type !== 'reign-break') {
                return -1;
            }
            if (a.type !== 'reign-break' && b.type === 'reign-break') {
                return 1;
            }
            return 0;
        });
        
        return filteredEvents;
    },

    // Sample data for the demonstration
    getSampleTimelineData: function() {
        return [
            {
                id: 'break-1',
                type: 'reign-break',
                breakType: 'reign-beginning',
                title: 'Beginning of the Reign of King Talon Falkrest',
                year: 845,
                month: 3,
                day: 12,
                era: 'silent-war'  // Updated from 'restoration'
            },
            {
                id: '1',
                type: 'event',
                title: 'The Coronation of King Talon',
                year: 845,
                month: 3,
                day: 12,
                location: 'Crimson Keep, Ederia',
                description: '<p>Following the tragic death of King Aldric in the Battle of Blackwater Marsh, his son Talon Falkrest was crowned the new king of Ederia. The young prince, only 25 years of age, took on the mantle of leadership during one of the kingdom\'s darkest hours.</p>',
                image: 'assets/images/timeline/coronation.jpg',
                era: 'silent-war'  // Updated from 'restoration'
            },
            {
                id: 'break-4',
                type: 'reign-break',
                breakType: 'reign-beginning',
                title: 'Beginning of the Reign of Lord Edric Falkrest',
                year: 780,
                era: 'age-of-chains'  // Updated from 'founding'
            }
        ];
    }
};