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
    // Add initial loading class
    document.body.classList.add('loading');
    
    window.addEventListener('load', function() {
        const preloader = document.querySelector('.preloader');
        
        if (preloader) {
            // Start fade out
            preloader.classList.add('fade-out');
            
            // In timeline.js, increase the timeout to allow smoother transition
            setTimeout(() => {
                // Hide preloader
                preloader.style.display = 'none';
                // Add active class to show content
                document.body.classList.add('court-portal-active');
                // Remove loading class
                document.body.classList.remove('loading');
                
                // Initialize Timeline
                Timeline.init();
            }, 800); // Increased from 600ms
        }
    });

    // Initialize the Timeline
    const Timeline = {
        // Configuration
        config: {
            eventsPerBatch: 5,          // Number of events to load per batch
            fadeOutThreshold: 200,       // Pixels from top to start fading out
            fadeInThreshold: 100,        // Pixels from bottom to start fading in
            scrollThreshold: 300,        // Pixels from bottom to trigger loading more
            animationDelay: 100,         // Ms delay between event animations
            monthNames: [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ]
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
            if (this.elements.searchInput) {
                this.elements.searchInput.value = '';
            }
            this.state.searchTerm = '';
            this.resetTimeline();
            this.filterEvents();
        },

        // Filter by era
        filterByEra: function(era) {
            // Update active button
            if (this.elements.eraButtons) {
                this.elements.eraButtons.forEach(button => {
                    if (button.dataset.era === era) {
                        button.classList.add('active');
                    } else {
                        button.classList.remove('active');
                    }
                });
            }
            
            // Update state and filter
            this.state.currentEra = era;
            this.resetTimeline();
            this.filterEvents();
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
        filterEvents: function() {
            // In a real implementation, this would call the server
            // For now, we'll simulate with our dummy data
            this.loadInitialEvents();
        },

        // Load initial events
        loadInitialEvents: function() {
            this.state.isLoading = true;
            
            // Show loader
            if (this.elements.bottomLoader) {
                this.elements.bottomLoader.classList.add('active');
            }
            
            // In a real application, you would fetch from your API here
            // For demonstration, we'll use the static sample data
            setTimeout(() => {
                // First fetch or populate a cached copy of all events
                if (this.state.cachedEvents.length === 0) {
                    this.state.cachedEvents = this.getSampleTimelineData();
                }
                
                // Filter events based on current filters
                const filteredEvents = this.filterCachedEvents();
                
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
                
            }, 1000); // Simulate network delay
        },

        // Load more events (when scrolling down)
        loadMoreEvents: function() {
            this.state.isLoading = true;
            
            // Show loader
            if (this.elements.bottomLoader) {
                this.elements.bottomLoader.classList.add('active');
            }
            
            // In a real application, you would fetch the next page from your API
            setTimeout(() => {
                // Filter events based on current filters
                const filteredEvents = this.filterCachedEvents();
                
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
                
            }, 1000); // Simulate network delay
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
            // Skip if no template
            if (!this.elements.eventTemplate) return null;
            
            // Clone the template
            const template = this.elements.eventTemplate.content.cloneNode(true);
            const eventElement = template.querySelector('.timeline-event');
            
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
            
            // Set data attributes
            eventElement.dataset.year = event.year;
            eventElement.dataset.month = event.month;
            eventElement.dataset.era = event.era;
            
            // Set content
            const title = eventElement.querySelector('.timeline-title');
            if (title) title.textContent = event.title;
            
            const month = eventElement.querySelector('.timeline-month');
            if (month) month.textContent = this.config.monthNames[event.month - 1];
            
            const year = eventElement.querySelector('.timeline-year');
            if (year) year.textContent = `${event.year} A.E.`;
            
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
            if (year) year.textContent = `${breakData.year} A.E.`;
            
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
                    era: 'restoration'
                },
                {
                    id: '1',
                    type: 'event',
                    title: 'The Coronation of King Talon',
                    year: 845,
                    month: 3,
                    location: 'Crimson Keep, Ederia',
                    description: '<p>Following the tragic death of King Aldric in the Battle of Blackwater Marsh, his son Talon Falkrest was crowned the new king of Ederia. The young prince, only 25 years of age, took on the mantle of leadership during one of the kingdom\'s darkest hours.</p>',
                    image: 'assets/images/timeline/coronation.jpg',
                    era: 'restoration'
                },
                {
                    id: '2',
                    type: 'event',
                    title: 'The Eastern Alliance',
                    year: 846,
                    month: 7,
                    location: 'Silvermoon Palace, Lunaria',
                    description: '<p>King Talon secured a crucial treaty with the elven kingdom of Lunaria, establishing trade routes and mutual defense. This alliance brought much-needed resources to the struggling Kingdom of Ederia and helped secure its eastern borders.</p>',
                    era: 'restoration'
                },
                {
                    id: '3',
                    type: 'event',
                    title: 'The Great Winter',
                    year: 850,
                    month: 11,
                    location: 'Across Ederia',
                    description: '<p>The kingdom faced its harshest winter in a century. King Talon opened the royal granaries to feed the people, earning him the epithet "the Kind." The snow lasted until late spring, and many believe this winter was caused by arcane forces.</p>',
                    image: 'assets/images/timeline/winter.jpg',
                    era: 'restoration'
                },
                {
                    id: '4',
                    type: 'event',
                    title: 'Birth of Princess Elena',
                    year: 852,
                    month: 5,
                    location: 'Crimson Keep, Ederia',
                    description: '<p>King Talon\'s first daughter, Princess Elena, was born. The kingdom celebrated for a week, and many saw her birth as a sign of prosperity to come. Seers claimed to have witnessed unusual celestial alignments on the night of her birth.</p>',
                    era: 'restoration'
                },
                {
                    id: '5',
                    type: 'event',
                    title: 'The Western Rebellion',
                    year: 855,
                    month: 8,
                    location: 'Westmark Province',
                    description: '<p>Lord Gareth of Westmark attempted to secede from the kingdom, claiming independence. King Talon personally led the royal forces to quell the rebellion, showing both military might and mercy by sparing Lord Gareth\'s life but stripping him of his titles.</p>',
                    image: 'assets/images/timeline/rebellion.jpg',
                    era: 'restoration'
                },
                {
                    id: '6',
                    type: 'event',
                    title: 'Construction of the High Temple',
                    year: 858,
                    month: 2,
                    location: 'Ederia City',
                    description: '<p>King Talon commissioned the construction of the High Temple of the Divine Light, the largest religious structure in the kingdom\'s history. The temple became a symbol of Ederia\'s spiritual rebirth and cultural renaissance.</p>',
                    era: 'restoration'
                },
                {
                    id: '7',
                    type: 'event',
                    title: 'Birth of Prince Rowan',
                    year: 860,
                    month: 9,
                    location: 'Crimson Keep, Ederia',
                    description: '<p>The birth of Prince Rowan, King Talon\'s second child, was celebrated throughout the kingdom. Unlike his sister, Prince Rowan was born during a thunderstorm of unusual intensity, which some interpreted as an omen.</p>',
                    era: 'restoration'
                },
                {
                    id: '8',
                    type: 'event',
                    title: 'The Arcane Concordat',
                    year: 863,
                    month: 4,
                    location: 'Tower of Mysteries, Ederia',
                    description: '<p>King Talon signed the Arcane Concordat, officially recognizing the College of Mages and establishing laws governing the practice of magic within the kingdom. This controversial decision was met with both praise and criticism.</p>',
                    image: 'assets/images/timeline/arcane.jpg',
                    era: 'restoration'
                },
                {
                    id: '9',
                    type: 'event',
                    title: 'The Northern Campaign',
                    year: 868,
                    month: 6,
                    location: 'Frostpeak Mountains',
                    description: '<p>King Talon led a successful military campaign against giant tribes in the north who had been raiding border settlements. The king\'s strategic acumen and the valor of his knights secured a decisive victory and decades of peace on the northern frontier.</p>',
                    era: 'restoration'
                },
                {
                    id: '10',
                    type: 'event',
                    title: 'The Silver Jubilee',
                    year: 870,
                    month: 3,
                    location: 'Ederia City',
                    description: '<p>The kingdom celebrated 25 years of King Talon\'s rule with a grand festival lasting two weeks. Representatives from all allied kingdoms attended, and it was the largest gathering of royalty in Ederian history.</p>',
                    image: 'assets/images/timeline/jubilee.jpg',
                    era: 'present'
                },
                {
                    id: '11',
                    type: 'event',
                    title: 'The Crimson Plague',
                    year: 872,
                    month: 10,
                    location: 'Southern Ederia',
                    description: '<p>A mysterious illness known as the Crimson Plague swept through the southern provinces. Those afflicted developed crimson veins across their skin before succumbing to the disease. King Talon established quarantine zones and relief efforts, but thousands perished before the plague mysteriously vanished a year later.</p>',
                    era: 'present'
                },
                {
                    id: '12',
                    type: 'event',
                    title: 'The Grand Tournament',
                    year: 875,
                    month: 7,
                    location: 'Fields of Valor, Ederia',
                    description: '<p>To celebrate his 30th year on the throne, King Talon held the largest tournament in the kingdom\'s history. Knights and warriors from across the continent participated, with the mysterious Black Knight claiming victory in the joust before mysteriously disappearing.</p>',
                    era: 'present'
                },
                {
                    id: '13',
                    type: 'event',
                    title: 'Birth of Princess Aurora',
                    year: 878,
                    month: 12,
                    location: 'Crimson Keep, Ederia',
                    description: '<p>The birth of King Talon\'s third child, Princess Aurora, was celebrated throughout the kingdom. Born during the winter solstice, seers proclaimed she would have a unique destiny intertwined with the kingdom\'s fate.</p>',
                    era: 'present'
                },
                {
                    id: '14',
                    type: 'event',
                    title: 'The Twilight Compact',
                    year: 880,
                    month: 2,
                    location: 'Shadowvale',
                    description: '<p>In a controversial move, King Talon negotiated a non-aggression pact with the realm of Shadowvale, home to dark elves who had historically been enemies of Ederia. This diplomatic achievement was viewed with suspicion by many nobles.</p>',
                    image: 'assets/images/timeline/compact.jpg',
                    era: 'present'
                },
                {
                    id: '15',
                    type: 'event',
                    title: 'The Strange Star',
                    year: 884,
                    month: 9,
                    location: 'Across Ederia',
                    description: '<p>A crimson star appeared in the night sky and remained visible for three weeks. Astrologers and seers across the kingdom offered conflicting interpretations, with many viewing it as an omen of coming bloodshed or change.</p>',
                    era: 'present'
                },
                {
                    id: 'break-2',
                    type: 'reign-break',
                    breakType: 'reign-end',
                    title: 'End of the Reign of King Mathis IV',
                    year: 843,
                    era: 'dark-times'
                },
                {
                    id: 'break-3',
                    type: 'reign-break',
                    breakType: 'reign-beginning',
                    title: 'Beginning of the Reign of King Aldric',
                    year: 843,
                    era: 'dark-times'
                },
                {
                    id: '16',
                    type: 'event',
                    title: 'Coronation of King Aldric',
                    year: 843,
                    month: 4,
                    location: 'Crimson Keep, Ederia',
                    description: '<p>After the mysterious death of King Mathis IV, his brother Aldric ascended to the throne. The coronation was marred by an unusually violent storm that many took as a bad omen for the new king\'s reign.</p>',
                    era: 'dark-times'
                },
                {
                    id: '17',
                    type: 'event',
                    title: 'The Northern Invasion',
                    year: 844,
                    month: 6,
                    location: 'Northern Ederia',
                    description: '<p>Barbarian tribes from beyond the Frostpeak Mountains launched a massive invasion of Ederia\'s northern territories. King Aldric personally led the kingdom\'s forces to meet this threat.</p>',
                    era: 'dark-times'
                },
                {
                    id: '18',
                    type: 'event',
                    title: 'Battle of Blackwater Marsh',
                    year: 845,
                    month: 2,
                    location: 'Blackwater Marsh, Northern Ederia',
                    description: '<p>The decisive battle against the northern invaders ended in victory for Ederia, but at a terrible cost. King Aldric was mortally wounded, dying on the battlefield after ensuring his kingdom\'s safety. The crown prince Talon was immediately summoned to assume the throne.</p>',
                    image: 'assets/images/timeline/battle.jpg',
                    era: 'dark-times'
                },
                {
                    id: '19',
                    type: 'event',
                    title: 'The Golden Treaty',
                    year: 830,
                    month: 8,
                    location: 'Sunhaven Palace',
                    description: '<p>During the height of the Golden Age, King Mathis IV established a historic trade agreement with the distant kingdom of Aurelia, opening new silk and spice routes that brought unprecedented wealth to Ederia\'s merchant class.</p>',
                    era: 'golden-age'
                },
                {
                    id: '20',
                    type: 'event',
                    title: 'The Arcane Calamity',
                    year: 835,
                    month: 5,
                    location: 'Wizard\'s Tower, Ederia City',
                    description: '<p>A magical experiment by the royal court wizard went catastrophically wrong, causing a magical storm that damaged a quarter of Ederia City and killed dozens. In the aftermath, King Mathis IV imposed strict regulations on arcane practices.</p>',
                    image: 'assets/images/timeline/calamity.jpg',
                    era: 'golden-age'
                },
                {
                    id: '21',
                    type: 'event',
                    title: 'The Founding Charter',
                    year: 780,
                    month: 4,
                    location: 'Crown Hill, Ederia',
                    description: '<p>Lord Edric Falkrest unified the warring provinces under a single banner, establishing the Kingdom of Ederia. The Founding Charter was signed by all twelve provincial lords, marking the official birth of the nation.</p>',
                    image: 'assets/images/timeline/charter.jpg',
                    era: 'founding-era'
                },
                {
                    id: 'break-4',
                    type: 'reign-break',
                    breakType: 'reign-beginning',
                    title: 'Beginning of the Reign of Lord Edric Falkrest',
                    year: 780,
                    era: 'founding-era'
                }
            ];
        }
    };
});