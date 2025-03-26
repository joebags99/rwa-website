/**
 * Roll With Advantage - Interactive Map
 * Explore the lands of Ederia with our interactive map
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Interactive Map');
    
    // Map elements
    const mapElement = document.getElementById('ederia-map');
    const locationPanel = document.getElementById('location-panel');
    const closePanel = document.getElementById('close-panel');
    const locationName = document.getElementById('location-name');
    const locationType = document.getElementById('location-type');
    const locationImage = document.getElementById('location-image');
    const locationDescription = document.getElementById('location-description');
    const locationDetailsSection = document.getElementById('location-details-section');
    const relatedLocationsList = document.getElementById('related-locations-list');
    const searchInput = document.getElementById('location-search');
    const searchButton = document.getElementById('search-button');
    const filterOptions = document.querySelectorAll('.filter-option');
    
    // Map state
    let map = null;
    let locationMarkers = [];
    let markerGroups = {
        nation: L.layerGroup(),
        city: L.layerGroup(),
        region: L.layerGroup(),
        landmark: L.layerGroup()
    };
    let currentFilters = ['nation', 'city', 'region', 'landmark'];
    
    // Fallback location data in case JSON doesn't load
    const fallbackLocations = [
        {
            id: "falkrest",
            name: "Kingdom of Falkrest",
            type: "nation",
            coordinates: [2305, 4096],
            image: "assets/images/tools/falkrest-nation.jpg",
            description: "The Kingdom of Falkrest is the central power in Ederia, known for its majestic castles and sprawling farmlands. The royal family has ruled from the capital city of Highcrown for over five centuries, maintaining peace through strategic alliances and a strong military presence. Falkrest's banner displays a golden crown on a deep blue field, representing their claim to the high throne of Ederia.",
            details: {
                "Capital": "Highcrown",
                "Ruler": "King Edmund Falkrest IV",
                "Population": "Approximately 1.2 million",
                "Known For": "Military strength, agricultural prosperity, and political influence"
            },
            relatedLocations: ["highcrown", "thornefield_forest", "royal_palace"]
        },
        {
            id: "highcrown",
            name: "Highcrown",
            type: "city",
            coordinates: [2354, 4300],
            image: "assets/images/tools/highcrown-city.jpg",
            description: "Highcrown is the capital city of Falkrest and the political center of Ederia. Built on seven hills, the city features magnificent architecture, including the Royal Palace, the Grand Cathedral of the Divine Light, and the Citadel. Its streets are lined with shops, taverns, and homes of noble families. The city is divided into districts, with the wealthy nobles residing in the upper city while merchants and commoners populate the lower districts. The Highcrown Market is renowned throughout the realm for its exotic goods.",
            details: {
                "Population": "100,000",
                "Governance": "City Council led by Lord Mayor Elias Thorne",
                "Notable Landmarks": "Royal Palace, Grand Cathedral, The Citadel",
                "Economy": "Trade, politics, crafting"
            },
            relatedLocations: ["falkrest", "thornefield_forest", "royal_palace"]
        },
        {
            id: "thornefield_forest",
            name: "Thornefield Forest",
            type: "region",
            coordinates: [2050, 3686],
            image: "assets/images/tools/thornefield-forest.jpg",
            description: "Thornefield Forest is an ancient woodland that stretches across the southwestern portion of Falkrest. The forest is known for its massive oak trees, some of which are said to be over a thousand years old. Local legends speak of fey creatures dwelling deep within the woods, and travelers often report strange lights and music at night. House Thornefield maintains several logging camps on the forest edge, carefully harvesting timber while respecting ancient treaties with the forest's mysterious guardians. The central portions of the forest remain largely unexplored.",
            details: {
                "Area": "600 square miles",
                "Fauna": "Deer, wolves, bears, foxes, and rumored magical creatures",
                "Flora": "Ancient oaks, redwoods, various medicinal herbs and fungi",
                "Resources": "Rare timber, medicinal plants, hunting grounds"
            },
            relatedLocations: ["falkrest", "highcrown", "royal_palace"]
        },
        {
            id: "royal_palace",
            name: "The Royal Palace",
            type: "landmark",
            coordinates: [2360, 4290],
            image: "assets/images/tools/royal-palace.jpg",
            description: "The Royal Palace of Highcrown stands at the highest point of the capital, a magnificent structure of white stone and blue-tinted glass. Built 300 years ago after the War of Five Crowns, the palace serves as both the royal residence and the seat of government for the Kingdom of Falkrest. Its most distinctive feature is the Crown Tower, which rises 200 feet into the air and is topped with a massive magical beacon that can be seen for miles around. The Grand Hall within can accommodate up to 500 nobles for royal functions, while the Council Chambers host the meetings of the King's advisors. The Royal Gardens surrounding the palace are open to the public during daylight hours and showcase plant species from all corners of Ederia.",
            details: {
                "Age": "300 years",
                "Architecture": "Highcrown Gothic style with magical reinforcements",
                "Notable Rooms": "Throne Room, Royal Library, Hall of Heroes, Crown Vault",
                "Security": "Royal Guard, magical wards, and rumored secret passages"
            },
            relatedLocations: ["falkrest", "highcrown", "thornefield_forest"]
        }
    ];
    
    // Initialize the map
    function initializeMap() {
        // Create the Leaflet map with a simple coordinate system
        map = L.map('ederia-map', {
            crs: L.CRS.Simple,
            minZoom: -3,  // Allow zooming out further
            maxZoom: 3,   // Allow zooming in further
            zoomControl: true,
            attributionControl: false,
            zoomSnap: 0.25
        });
        
        // Define bounds for the map image (will be adjusted based on actual image dimensions)
        const mapWidth = 8192;
        const mapHeight = 4608; 
        const bounds = [[0, 0], [mapHeight, mapWidth]];

        // Add the map image as a layer
        const mapImage = L.imageOverlay('assets/images/maps/illica_map.jpg', bounds);
        mapImage.addTo(map);

        // Set the view to center of map with appropriate zoom
        map.setView([mapHeight/2, mapWidth/2], -1); // Center and set initial zoom
        map.setMaxBounds(bounds.pad(0.5)); // Add some padding to prevent dragging too far
        
        // Set the view to center of map with appropriate zoom
        map.fitBounds(bounds);
        map.setMaxBounds(bounds);
        
        // Add layer groups to map
        Object.values(markerGroups).forEach(group => {
            group.addTo(map);
        });
        
        // Load location data
        loadLocationData();
        
        // Initialize event listeners
        initializeEventListeners();
    }
    
    // Load location data from JSON file, or use fallback data
    function loadLocationData() {
        // Try to fetch the JSON data
        fetch('data/locations.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Successfully loaded data, create markers
                createLocationMarkers(data);
            })
            .catch(error => {
                console.warn('Failed to load location data:', error);
                // Use fallback data instead
                console.log('Using fallback location data');
                createLocationMarkers(fallbackLocations);
            });
    }
    
    // Create markers for all locations
    function createLocationMarkers(locations) {
        // Clear existing markers if any
        locationMarkers = [];
        Object.values(markerGroups).forEach(group => group.clearLayers());
        
        // Create a marker for each location
        locations.forEach(location => {
            // Define icon based on location type
            const markerIcon = createMarkerIcon(location.type);
            
            // Create the marker
            const marker = L.marker(location.coordinates, {
                icon: markerIcon,
                title: location.name,
                alt: location.name,
                locationId: location.id,
                locationType: location.type,
                riseOnHover: true
            });
            
            // Add tooltip
            marker.bindTooltip(location.name, {
                direction: 'top',
                offset: [0, -30],
                className: 'custom-tooltip'
            });
            
            // Add click event
            marker.on('click', function() {
                displayLocationDetails(location);
            });
            
            // Store marker reference
            locationMarkers.push({
                id: location.id,
                marker: marker,
                data: location
            });
            
            // Add to appropriate layer group
            if (markerGroups[location.type]) {
                markerGroups[location.type].addLayer(marker);
            }
            
            // Add hover effect using JS instead of CSS
            marker.on('mouseover', function() {
                if (this._icon) {
                    this._icon.classList.add('hover');
                }
            }).on('mouseout', function() {
                if (this._icon) {
                    this._icon.classList.remove('hover');
                }
            });
        });
        
        // Add a handler for zooming to manage marker visibility
        map.on('zoomanim', function() {
            document.querySelectorAll('.leaflet-marker-icon').forEach(el => {
                el.style.visibility = 'hidden';
            });
        });
        
        map.on('zoomend', function() {
            document.querySelectorAll('.leaflet-marker-icon').forEach(el => {
                el.style.visibility = 'visible';
            });
        });
    }
    
    // Create custom marker icon
    function createMarkerIcon(locationType) {
        // Create a custom HTML icon to prevent hover issues
        const iconHtml = getIconHtml(locationType);
        
        return L.divIcon({
            className: `custom-marker marker-${locationType}`,
            html: iconHtml,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
    }
    
    // Get HTML content for icon based on type
    function getIconHtml(locationType) {
        let iconClass = '';
        
        switch(locationType) {
            case 'nation':
                iconClass = 'fa-flag';
                break;
            case 'city':
                iconClass = 'fa-city';
                break;
            case 'region':
                iconClass = 'fa-tree';
                break;
            case 'landmark':
                iconClass = 'fa-monument';
                break;
            default:
                iconClass = 'fa-map-marker-alt';
        }
        
        return `<i class="fas ${iconClass}"></i>`;
    }
    
    // Display location details in the panel
    function displayLocationDetails(location) {
        // Update panel content
        locationName.textContent = location.name;
        locationType.textContent = capitalizeFirstLetter(location.type);
        
        // Update panel header class
        const headerElement = document.querySelector('.panel-header');
        headerElement.className = 'panel-header';
        headerElement.classList.add(`type-${location.type}`);
        
        // Set location image with fallback
        locationImage.src = location.image || 'assets/images/tools/map-placeholder.jpg';
        locationImage.alt = location.name;
        
        // Set description
        locationDescription.innerHTML = `<p>${location.description}</p>`;
        
        // Clear and populate details section
        locationDetailsSection.innerHTML = '';
        if (location.details) {
            const detailsHeader = document.createElement('h3');
            detailsHeader.textContent = 'Details';
            locationDetailsSection.appendChild(detailsHeader);
            
            for (const [key, value] of Object.entries(location.details)) {
                const detailItem = document.createElement('div');
                detailItem.className = 'detail-item';
                
                const detailLabel = document.createElement('span');
                detailLabel.className = 'detail-label';
                detailLabel.textContent = `${key}: `;
                
                const detailValue = document.createElement('span');
                detailValue.className = 'detail-value';
                detailValue.textContent = value;
                
                detailItem.appendChild(detailLabel);
                detailItem.appendChild(detailValue);
                locationDetailsSection.appendChild(detailItem);
            }
        }
        
        // Clear and populate related locations
        relatedLocationsList.innerHTML = '';
        if (location.relatedLocations && location.relatedLocations.length > 0) {
            location.relatedLocations.forEach(relatedId => {
                const relatedLocation = findLocationById(relatedId);
                if (relatedLocation) {
                    const listItem = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = '#';
                    
                    const icon = document.createElement('i');
                    icon.className = `fas ${getIconClass(relatedLocation.type)}`;
                    
                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = relatedLocation.name;
                    
                    link.appendChild(icon);
                    link.appendChild(nameSpan);
                    
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        displayLocationDetails(relatedLocation);
                        // Pan to the related location
                        map.panTo(relatedLocation.coordinates);
                        // Highlight the marker
                        highlightMarker(relatedId);
                    });
                    
                    listItem.appendChild(link);
                    relatedLocationsList.appendChild(listItem);
                }
            });
        } else {
            const listItem = document.createElement('li');
            listItem.textContent = 'No related locations';
            relatedLocationsList.appendChild(listItem);
        }
        
        // Show the panel
        locationPanel.classList.add('active');
        
        // Highlight this marker
        highlightMarker(location.id);
    }
    
    // Highlight a marker temporarily
    function highlightMarker(locationId) {
        // Reset all markers
        locationMarkers.forEach(item => {
            if (item.marker._icon) {
                item.marker._icon.classList.remove('hover');
            }
        });
        
        // Find the marker by ID
        const markerData = locationMarkers.find(item => item.id === locationId);
        
        if (markerData && markerData.marker._icon) {
            // Add highlight class
            markerData.marker._icon.classList.add('hover');
            
            // Remove the highlight after 2 seconds
            setTimeout(() => {
                if (markerData.marker._icon) {
                    markerData.marker._icon.classList.remove('hover');
                }
            }, 2000);
        }
    }
    
    // Find a location by ID
    function findLocationById(id) {
        const markerData = locationMarkers.find(item => item.id === id);
        return markerData ? markerData.data : null;
    }
    
    // Get icon class for a location type
    function getIconClass(locationType) {
        switch(locationType) {
            case 'nation':
                return 'fa-flag';
            case 'city':
                return 'fa-city';
            case 'region':
                return 'fa-tree';
            case 'landmark':
                return 'fa-monument';
            default:
                return 'fa-map-marker-alt';
        }
    }
    
    // Capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Initialize all event listeners
    function initializeEventListeners() {
        // Close panel button
        closePanel.addEventListener('click', function() {
            locationPanel.classList.remove('active');
        });
        
        // Filter checkboxes
        filterOptions.forEach(option => {
            option.addEventListener('click', function() {
                const type = this.dataset.type;
                const checked = this.querySelector('input').checked;
                
                if (type === 'all') {
                    // Toggle all filters
                    const shouldCheck = checked;
                    filterOptions.forEach(opt => {
                        if (opt.dataset.type !== 'all') {
                            opt.querySelector('input').checked = shouldCheck;
                            toggleLayer(opt.dataset.type, shouldCheck);
                        }
                    });
                    
                    if (shouldCheck) {
                        currentFilters = ['nation', 'city', 'region', 'landmark'];
                    } else {
                        currentFilters = [];
                    }
                } else {
                    // Toggle individual filter
                    toggleLayer(type, checked);
                    
                    if (checked) {
                        // Add to current filters
                        if (!currentFilters.includes(type)) {
                            currentFilters.push(type);
                        }
                    } else {
                        // Remove from current filters
                        currentFilters = currentFilters.filter(filter => filter !== type);
                        
                        // Uncheck "All" option
                        document.querySelector('.filter-option[data-type="all"] input').checked = false;
                    }
                    
                    // Check if all individual filters are selected
                    const allSelected = ['nation', 'city', 'region', 'landmark'].every(type => 
                        currentFilters.includes(type)
                    );
                    
                    // Update "All" checkbox
                    document.querySelector('.filter-option[data-type="all"] input').checked = allSelected;
                }
            });
        });
        
        // Search functionality
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Closing panel when clicking outside
        map.on('click', function(e) {
            // Only close if clicking on the map itself, not markers
            if (!e.originalEvent.target.closest('.leaflet-marker-icon')) {
                locationPanel.classList.remove('active');
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // ESC key to close panel
            if (e.key === 'Escape' && locationPanel.classList.contains('active')) {
                locationPanel.classList.remove('active');
            }
        });
    }
    
    // Toggle a layer group's visibility
    function toggleLayer(type, visible) {
        if (visible) {
            map.addLayer(markerGroups[type]);
        } else {
            map.removeLayer(markerGroups[type]);
        }
    }
    
    // Perform search
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm.length < 2) {
            // Don't search for very short terms
            return;
        }
        
        // Find matching locations
        const matches = locationMarkers.filter(item => 
            item.data.name.toLowerCase().includes(searchTerm) && 
            currentFilters.includes(item.data.type)
        );
        
        if (matches.length > 0) {
            // Display first match
            displayLocationDetails(matches[0].data);
            // Pan to the location
            map.panTo(matches[0].data.coordinates);
            // Highlight the marker
            highlightMarker(matches[0].data.id);
            
            // If there are multiple matches, show a count
            if (matches.length > 1) {
                // Could be enhanced to display all matches in a dropdown
                console.log(`Found ${matches.length} matches for "${searchTerm}"`);
            }
        } else {
            // No matches found
            alert(`No locations found matching "${searchTerm}"`);
        }
    }

    // Add this to the end of your file, before the final closing brackets

    // Helper for finding coordinates - useful during development
    function addCoordinateHelper() {
        // Add click event to get coordinates
        map.on('click', function(e) {
            console.log("Map coordinates:", e.latlng);
            // Create a temporary marker
            L.marker(e.latlng, {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: '<i class="fas fa-map-pin"></i>',
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                })
            }).addTo(map)
            .bindTooltip(`Coordinates: [${Math.round(e.latlng.lat)}, ${Math.round(e.latlng.lng)}]`);
        });
        
        console.log("Coordinate helper active - click on map to see coordinates");
    }

    // Uncomment the next line during development to activate
    addCoordinateHelper();
    
    // Initialize the interactive map
    initializeMap();
});