/**
 * Royal Bloodlines Search Component
 * This adds a search bar with auto-suggestions to the royal bloodlines page
 */

//==============================================================================
// SEARCH BAR IMPLEMENTATION
//==============================================================================

/**
 * Initialize the search functionality
 * Call this function in the main initialization after data is loaded
 */
function initializeSearchBar() {
    // Create and add the search UI elements
    createSearchUI();
    
    // Set up event listeners
    setupSearchEventListeners();
}

/**
 * Create the search UI elements and insert them into the DOM
 */
function createSearchUI() {
    // Create search container
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    
    // Create search input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'bloodline-search';
    searchInput.className = 'search-input';
    searchInput.placeholder = 'Search by name...';
    searchInput.autocomplete = 'off';
    
    // Create search icon
    const searchIcon = document.createElement('i');
    searchIcon.className = 'fas fa-search search-icon';
    
    // Create suggestions container
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'search-suggestions';
    suggestionsContainer.id = 'search-suggestions';
    
    // Assemble the search UI
    searchContainer.appendChild(searchIcon);
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(suggestionsContainer);
    
    // Insert into the bloodlines controls section
    const controlsSection = document.querySelector('.bloodlines-controls');
    if (controlsSection) {
        // Insert before the filter controls
        const filterControls = controlsSection.querySelector('.filter-controls');
        if (filterControls) {
            controlsSection.insertBefore(searchContainer, filterControls);
        } else {
            controlsSection.appendChild(searchContainer);
        }
    }
    
    // Add clear button
    const clearButton = document.createElement('button');
    clearButton.className = 'search-clear-btn';
    clearButton.innerHTML = '×';
    clearButton.style.display = 'none';
    clearButton.setAttribute('aria-label', 'Clear search');
    searchContainer.appendChild(clearButton);
}

/**
 * Set up event listeners for the search functionality
 */
function setupSearchEventListeners() {
    const searchInput = document.getElementById('bloodline-search');
    const suggestionsContainer = document.getElementById('search-suggestions');
    const clearButton = document.querySelector('.search-clear-btn');
    
    if (!searchInput || !suggestionsContainer) return;
    
    // Input event for handling typing
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        // Show/hide clear button
        clearButton.style.display = query ? 'block' : 'none';
        
        // Process search after 3 characters
        if (query.length >= 3) {
            const suggestions = findMatchingPeople(query);
            displaySuggestions(suggestions);
        } else {
            // Clear suggestions if query is too short
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = 'none';
        }
    });
    
    // Clear button event
    clearButton.addEventListener('click', function() {
        searchInput.value = '';
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.style.display = 'none';
        clearButton.style.display = 'none';
        
        // Focus back on the input
        searchInput.focus();
    });
    
    // Keyboard navigation in suggestions
    searchInput.addEventListener('keydown', function(e) {
        if (!suggestionsContainer.style.display || suggestionsContainer.style.display === 'none') return;
        
        const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');
        if (suggestions.length === 0) return;
        
        let activeIndex = -1;
        
        // Find the currently active suggestion
        suggestions.forEach((suggestion, index) => {
            if (suggestion.classList.contains('active')) {
                activeIndex = index;
            }
        });
        
        // Down arrow
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (activeIndex < suggestions.length - 1) {
                if (activeIndex >= 0) {
                    suggestions[activeIndex].classList.remove('active');
                }
                suggestions[activeIndex + 1].classList.add('active');
                suggestions[activeIndex + 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
        
        // Up arrow
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (activeIndex > 0) {
                suggestions[activeIndex].classList.remove('active');
                suggestions[activeIndex - 1].classList.add('active');
                suggestions[activeIndex - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
        
        // Enter key
        else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0) {
                const personId = suggestions[activeIndex].getAttribute('data-id');
                if (personId) {
                    selectSuggestion(personId);
                }
            }
        }
        
        // Escape key
        else if (e.key === 'Escape') {
            e.preventDefault();
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = 'none';
        }
    });
    
    // Click outside to close suggestions
    document.addEventListener('click', function(e) {
        if (!suggestionsContainer.contains(e.target) && e.target !== searchInput) {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = 'none';
        }
    });
}

/**
 * Find people matching the search query
 * @param {string} query - The search query
 * @returns {Array} - Array of matching people objects
 */
function findMatchingPeople(query) {
    if (!bloodlinesData.processedData) return [];
    
    const { people } = bloodlinesData.processedData;
    const lowerQuery = query.toLowerCase();
    
    // Find all people whose names contain the query
    const matches = people.filter(person => {
        // Primary match on name
        if (person.name.toLowerCase().includes(lowerQuery)) {
            return true;
        }
        
        // Secondary match on title or aliases
        if (person.title && person.title.toLowerCase().includes(lowerQuery)) {
            return true;
        }
        
        if (person.aliases && person.aliases.some(alias => 
            alias.toLowerCase().includes(lowerQuery)
        )) {
            return true;
        }
        
        return false;
    });
    
    // Sort matches: exact matches first, then by name length (shorter names first)
    matches.sort((a, b) => {
        // Exact matches come first
        const aExact = a.name.toLowerCase() === lowerQuery;
        const bExact = b.name.toLowerCase() === lowerQuery;
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // Then starts-with matches
        const aStartsWith = a.name.toLowerCase().startsWith(lowerQuery);
        const bStartsWith = b.name.toLowerCase().startsWith(lowerQuery);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // Then by name length
        return a.name.length - b.name.length;
    });
    
    // Limit to 10 suggestions for performance
    return matches.slice(0, 10);
}

/**
 * Display search suggestions
 * @param {Array} suggestions - Array of matching people objects
 */
function displaySuggestions(suggestions) {
    const suggestionsContainer = document.getElementById('search-suggestions');
    if (!suggestionsContainer) return;
    
    // Clear previous suggestions
    suggestionsContainer.innerHTML = '';
    
    if (suggestions.length === 0) {
        // Show no results message
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'No matches found';
        suggestionsContainer.appendChild(noResults);
        suggestionsContainer.style.display = 'block';
        return;
    }
    
    // Create suggestion items
    suggestions.forEach(person => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.setAttribute('data-id', person.id);
        
        // Create suggestion content with house indicator
        const houseIndicator = document.createElement('div');
        houseIndicator.className = `suggestion-house house-${person.main_house.toLowerCase()}`;
        
        // Person info
        const personInfo = document.createElement('div');
        personInfo.className = 'suggestion-info';
        
        // Person name
        const personName = document.createElement('div');
        personName.className = 'suggestion-name';
        personName.textContent = person.name;
        
        // Additional info (birth-death, title)
        const personDetails = document.createElement('div');
        personDetails.className = 'suggestion-details';
        personDetails.textContent = `${person.birth_year} - ${person.death_year || 'Present'}`;
        
        if (person.title) {
            personDetails.textContent += ` • ${person.title}`;
        }
        
        // Assemble the suggestion item
        personInfo.appendChild(personName);
        personInfo.appendChild(personDetails);
        suggestionItem.appendChild(houseIndicator);
        suggestionItem.appendChild(personInfo);
        
        // Click event to select this suggestion
        suggestionItem.addEventListener('click', function() {
            selectSuggestion(person.id);
        });
        
        // Hover events for active state
        suggestionItem.addEventListener('mouseenter', function() {
            // Remove active class from all suggestions
            suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to this suggestion
            this.classList.add('active');
        });
        
        suggestionsContainer.appendChild(suggestionItem);
    });
    
    // Show the suggestions container
    suggestionsContainer.style.display = 'block';
}

/**
 * Select a suggestion and navigate to the person
 * @param {string} personId - ID of the selected person
 */
function selectSuggestion(personId) {
    // Find the person in our data
    const { personMap } = bloodlinesData.processedData;
    const person = personMap.get(personId);
    
    if (!person) return;
    
    // Clear the search UI
    const searchInput = document.getElementById('bloodline-search');
    const suggestionsContainer = document.getElementById('search-suggestions');
    const clearButton = document.querySelector('.search-clear-btn');
    
    searchInput.value = '';
    suggestionsContainer.innerHTML = '';
    suggestionsContainer.style.display = 'none';
    clearButton.style.display = 'none';
    
    // Find the person card in the DOM
    const personCard = document.querySelector(`.person-card[data-id="${personId}"]`);
    
    if (personCard) {
        // Clear any filters or highlights first
        resetHighlights();
        
        // Reset any house filters
        document.querySelectorAll('.house-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('.house-filter[data-house="all"]').classList.add('active');
        
        // Scroll to the person card with animation
        personCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Highlight the person card
        personCard.classList.add('search-highlight');
        
        // Remove highlight after animation
        setTimeout(() => {
            personCard.classList.remove('search-highlight');
            
            // Open person details
            showPersonDetails(personId);
        }, 1500);
    } else {
        // If card not found (maybe filtered out), show details directly
        showPersonDetails(personId);
    }
}

// Add the search initialization to the main initialization
document.addEventListener('DOMContentLoaded', function() {
    // The existing initialization will be called first
    
    // Wait for the bloodlines data to be loaded
    const checkDataInterval = setInterval(() => {
        if (bloodlinesData.processedData) {
            clearInterval(checkDataInterval);
            // Initialize search
            initializeSearchBar();
        }
    }, 500);
});