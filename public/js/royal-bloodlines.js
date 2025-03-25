/**
 * Royal Bloodlines Visualization
 * A completely redesigned approach to visualizing the family trees and bloodlines of Ederia
 */

//==============================================================================
// INITIALIZATION AND GLOBAL VARIABLES
//==============================================================================

// Global data store
const bloodlinesData = {
    // Original data
    rawData: null,
    // Processed data
    processedData: null,
    // Currently selected person
    selectedPerson: null,
    // View state
    viewState: {
        scale: 1,
        translateX: 0,
        translateY: 0,
        highlightMode: false,
        filteredHouse: null
    },
    // Timeline configuration
    timeline: {
        earliestYear: 800,
        latestYear: 1100,
        yearSpan: 300,
        pixelsPerYear: 6
    }
};

/**
 * Initialize when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load family data
    loadBloodlinesData();
    
    // Setup event listeners
    setupEventListeners();
});

/**
 * Setup event listeners for interactive elements
 */
function setupEventListeners() {
    // Zoom controls
    document.getElementById('zoomIn').addEventListener('click', zoomIn);
    document.getElementById('zoomOut').addEventListener('click', zoomOut);
    document.getElementById('resetView').addEventListener('click', resetView);
    
    // Filter controls
    document.querySelectorAll('.house-filter').forEach(button => {
        button.addEventListener('click', function() {
            const house = this.getAttribute('data-house');
            filterByHouse(house);
            
            // Update active button
            document.querySelectorAll('.house-filter').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Detail drawer buttons
    document.querySelector('.close-drawer-btn').addEventListener('click', closePersonDetails);
    document.getElementById('highlightLineageBtn').addEventListener('click', highlightLineage);
    document.getElementById('resetHighlightBtn').addEventListener('click', resetHighlights);
    
    // Mouse wheel zoom in viewport
    const viewport = document.querySelector('.bloodlines-viewport');
    viewport.addEventListener('wheel', handleMouseWheel, { passive: false });
    
    // Dragging in viewport
    setupDragNavigation(viewport);
}

//==============================================================================
// DATA LOADING AND PROCESSING
//==============================================================================

/**
 * Load bloodlines data from JSON file
 */
function loadBloodlinesData() {
    // Show loading state
    const contentElement = document.getElementById('bloodlinesContent');
    contentElement.innerHTML = `
        <div class="loading-indicator">
            <div class="crown-loader"></div>
            <p>Illuminating the royal archives...</p>
        </div>
    `;
    
    // Fetch the data
    fetch('/data/family-tree.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Store raw data
            bloodlinesData.rawData = data;
            
            // Process the data
            const processedData = processBloodlinesData(data);
            bloodlinesData.processedData = processedData;
            
            // Set timeline configuration based on processed data
            configureTimeline(processedData.earliestBirthYear, processedData.latestBirthYear);
            
            // Render the timeline
            renderTimeline();
            
            // Render the bloodlines
            renderBloodlines(processedData);
        })
        .catch(error => {
            console.error('Error loading bloodlines data:', error);
            contentElement.innerHTML = `
                <div class="error-message">
                    <h3>Failed to load the royal archives</h3>
                    <p>${error.message}</p>
                    <button id="retryButton" class="royal-btn">Try Again</button>
                </div>
            `;
            
            // Add retry button listener
            document.getElementById('retryButton').addEventListener('click', loadBloodlinesData);
        });
}

/**
 * Updated processBloodlinesData function for negative generation support
 * @param {Array} data - The raw data from JSON
 * @returns {Object} - Processed data structure optimized for rendering
 */
function processBloodlinesData(data) {
    // Create a map for easy lookup by ID
    const personMap = new Map();
    
    // First pass: Basic mapping and initialization
    data.forEach(person => {
        personMap.set(person.id, {
            ...person,
            children: [],
            partners: [],
            siblings: []
        });
    });
    
    // Second pass: Establish relationships
    data.forEach(person => {
        const personObj = personMap.get(person.id);
        
        // Set up parent-child relationships
        if (person.parent_1) {
            const parent = personMap.get(person.parent_1);
            if (parent) {
                parent.children.push(person.id);
            }
        }
        
        if (person.parent_2) {
            const parent = personMap.get(person.parent_2);
            if (parent) {
                parent.children.push(person.id);
            }
        }
        
        // Set up betrothed relationships
        if (person.betrothed) {
            personObj.partners.push(person.betrothed);
            const partner = personMap.get(person.betrothed);
            if (partner && !partner.partners.includes(person.id)) {
                partner.partners.push(person.id);
            }
        }
    });
    
    // Third pass: Infer partnerships from common children
    data.forEach(person => {
        const personObj = personMap.get(person.id);
        
        // Look for people who share children with this person
        data.forEach(otherPerson => {
            if (person.id !== otherPerson.id) {
                const personChildren = personObj.children;
                const otherPersonObj = personMap.get(otherPerson.id);
                
                if (otherPersonObj) {
                    const otherPersonChildren = otherPersonObj.children;
                    
                    // Check for common children
                    const commonChildren = personChildren.filter(childId => 
                        otherPersonChildren.includes(childId)
                    );
                    
                    // If they have common children, they're partners
                    if (commonChildren.length > 0 && !personObj.partners.includes(otherPerson.id)) {
                        personObj.partners.push(otherPerson.id);
                    }
                }
            }
        });
    });
    
    // Fourth pass: Find siblings
    data.forEach(person => {
        const personObj = personMap.get(person.id);
        
        data.forEach(otherPerson => {
            if (person.id !== otherPerson.id) {
                // They're siblings if they share at least one parent
                if ((person.parent_1 && person.parent_1 === otherPerson.parent_1) || 
                    (person.parent_2 && person.parent_2 === otherPerson.parent_2)) {
                    if (!personObj.siblings.includes(otherPerson.id)) {
                        personObj.siblings.push(otherPerson.id);
                    }
                }
            }
        });
    });
    
    // Calculate generations - now supporting negative generations
    assignGenerations(Array.from(personMap.values()));
    
    // Find earliest and latest birth years
    const earliestBirthYear = Math.min(...data.map(p => p.birth_year || 9999));
    const latestBirthYear = Math.max(...data.map(p => p.birth_year || 0));
    
    // Group people by generation including negative numbers
    const minGeneration = Math.min(...Array.from(personMap.values()).map(p => p.generation));
    const maxGeneration = Math.max(...Array.from(personMap.values()).map(p => p.generation));
    
    // Create a sparse array with indices from minGeneration to maxGeneration
    const generations = [];
    for (let i = minGeneration; i <= maxGeneration; i++) {
        generations[i] = Array.from(personMap.values())
            .filter(p => p.generation === i)
            .sort((a, b) => (a.birth_year || 0) - (b.birth_year || 0));
    }
    
    return {
        people: Array.from(personMap.values()),
        personMap: personMap,
        generations: generations,
        minGeneration: minGeneration,
        maxGeneration: maxGeneration,
        earliestBirthYear: earliestBirthYear,
        latestBirthYear: latestBirthYear
    };
}

/**
 * Updated assignGenerations function that supports negative generation numbers
 * @param {Array} people - Array of person objects
 */
function assignGenerations(people) {
    // First, identify root people (those without parents)
    const rootPeople = people.filter(p => !p.parent_1 && !p.parent_2);
    
    // Initialize the personMap for lookups
    const personMap = new Map(people.map(p => [p.id, p]));
    
    // Check for explicitly defined generations
    const peopleWithExplicitGen = people.filter(p => p.generation !== undefined);
    if (peopleWithExplicitGen.length > 0) {
        console.log(`Found ${peopleWithExplicitGen.length} people with explicit generations`);
    }
    
    // Set any explicitly defined generations first
    peopleWithExplicitGen.forEach(person => {
        // Ensure explicit generations are respected
        console.log(`Setting explicit generation ${person.generation} for ${person.name} (${person.id})`);
    });
    
    // Assign generation 0 to root people without explicit generation
    rootPeople.forEach(person => {
        if (person.generation === undefined) {
            person.generation = 0;
        }
    });
    
    // Helper function to assign generations recursively
    function assignChildGenerations(personId, personMap, parentGeneration) {
        const person = personMap.get(personId);
        if (!person) return;
        
        // Assign generation if not already assigned or if new generation is higher
        if (person.generation === undefined || person.generation <= parentGeneration) {
            person.generation = parentGeneration + 1;
            
            // Recursively assign generations to children
            if (person.children && person.children.length > 0) {
                person.children.forEach(childId => {
                    assignChildGenerations(childId, personMap, person.generation);
                });
            }
        }
    }
    
    // Helper function to assign generations to parents (backwards)
    function assignParentGenerations(personId, personMap, childGeneration) {
        const person = personMap.get(personId);
        if (!person) return;
        
        const parents = [person.parent_1, person.parent_2].filter(p => p);
        
        parents.forEach(parentId => {
            const parent = personMap.get(parentId);
            if (!parent) return;
            
            // If parent has no generation yet or its generation is not less than the child's
            if (parent.generation === undefined || parent.generation >= childGeneration - 1) {
                // Parent should be one generation less
                parent.generation = childGeneration - 1;
                
                // Recursively assign generations to grandparents
                assignParentGenerations(parentId, personMap, parent.generation);
            }
        });
    }
    
    // First pass: Assign child generations starting from root people
    rootPeople.forEach(person => {
        if (person.children && person.children.length > 0) {
            person.children.forEach(childId => {
                assignChildGenerations(childId, personMap, person.generation);
            });
        }
    });
    
    // Second pass: Assign parent generations (backwards) for any with explicit generations
    peopleWithExplicitGen.forEach(person => {
        assignParentGenerations(person.id, personMap, person.generation);
    });
    
    // Handle any people who still don't have generations assigned
    people.forEach(person => {
        if (person.generation === undefined) {
            // If no generation was assigned, estimate based on birth year
            const birthYear = person.birth_year || 0;
            
            // Find a person with a known generation and similar birth year
            const referencePeople = people.filter(p => 
                p.generation !== undefined && p.birth_year && 
                Math.abs(p.birth_year - birthYear) < 20
            );
            
            if (referencePeople.length > 0) {
                // Use the average generation of similar-aged people
                const avgGeneration = referencePeople.reduce((sum, p) => sum + p.generation, 0) / referencePeople.length;
                person.generation = Math.round(avgGeneration);
            } else {
                // Last resort: assign generation 0
                person.generation = 0;
            }
        }
    });

    // Debugging output
    const minGeneration = Math.min(...people.map(p => p.generation));
    const maxGeneration = Math.max(...people.map(p => p.generation));
    console.log(`Generation range: ${minGeneration} to ${maxGeneration}`);
}

/**
 * Configure the timeline based on the data date range
 * @param {number} earliestYear - Earliest birth year in the data
 * @param {number} latestYear - Latest birth year in the data
 */
function configureTimeline(earliestYear, latestYear) {
    // Round down to the nearest decade for earliest year
    const timelineStart = Math.floor(earliestYear / 10) * 10 - 20;
    
    // Round up to the nearest decade for latest year
    const timelineEnd = Math.ceil(latestYear / 10) * 10 + 20;
    
    // Store in global data
    bloodlinesData.timeline = {
        earliestYear: timelineStart,
        latestYear: timelineEnd,
        yearSpan: timelineEnd - timelineStart,
        pixelsPerYear: 5 // 5 pixels per year
    };
}

//==============================================================================
// RENDERING FUNCTIONS
//==============================================================================

/**
 * Render the timeline navigation
 */
function renderTimeline() {
    const { earliestYear, latestYear, pixelsPerYear } = bloodlinesData.timeline;
    const timelineDecades = document.querySelector('.timeline-decades');
    
    // Calculate timeline width
    const timelineWidth = (latestYear - earliestYear) * pixelsPerYear;
    timelineDecades.style.width = `${timelineWidth}px`;
    
    // Clear existing markers
    timelineDecades.innerHTML = '';
    
    // Add decade markers
    for (let year = Math.floor(earliestYear / 10) * 10; year <= latestYear; year += 10) {
        const marker = document.createElement('div');
        marker.className = 'decade-marker';
        
        // Special styling for century markers
        if (year % 100 === 0) {
            marker.classList.add('century-marker');
        }
        
        marker.setAttribute('data-year', year);
        marker.style.left = `${(year - earliestYear) * pixelsPerYear}px`;
        
        timelineDecades.appendChild(marker);
    }
}

/**
 * Update renderBloodlines to support negative generations
 * @param {Object} data - Processed bloodlines data
 */
function renderBloodlines(data) {
    const contentElement = document.getElementById('bloodlinesContent');
    
    // Clear previous content
    contentElement.innerHTML = '';
    
    // Create SVG container for connection lines
    const connectionContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    connectionContainer.setAttribute('class', 'connection-container');
    connectionContainer.style.width = '100%';
    connectionContainer.style.height = '100%';
    connectionContainer.style.position = 'absolute';
    connectionContainer.style.top = '0';
    connectionContainer.style.left = '0';
    connectionContainer.style.zIndex = '0';
    contentElement.appendChild(connectionContainer);
    
    // Track which people have already been rendered to avoid duplicates
    const renderedPeople = new Set();
    
    // Find the generation range
    const minGeneration = Math.min(...data.people.map(p => p.generation));
    const maxGeneration = Math.max(...data.people.map(p => p.generation));
    
    // Create an array of all possible generations including negatives
    const allGenerations = [];
    for (let i = minGeneration; i <= maxGeneration; i++) {
        allGenerations.push(i);
    }
    
    // Reorganize generations data to support negative generations
    const generationsByNumber = new Map();
    allGenerations.forEach(genNumber => {
        generationsByNumber.set(genNumber, data.people.filter(p => p.generation === genNumber));
    });
    
    // Render generations in order from earliest to latest
    allGenerations.forEach(genNumber => {
        const generationPeople = generationsByNumber.get(genNumber);
        if (!generationPeople || generationPeople.length === 0) return;
        
        const generationGroup = document.createElement('div');
        generationGroup.className = 'generation-group';
        
        // Add generation label - negative numbers supported
        const generationLabel = document.createElement('h3');
        generationLabel.className = 'generation-label';
        generationLabel.textContent = `Generation ${genNumber}`; // This is where the generation number will be inserted for display 
        generationGroup.appendChild(generationLabel);
        
        // Create container for people in this generation
        const generationPeopleContainer = document.createElement('div');
        generationPeopleContainer.className = 'generation-people';
        
        // Filter out people who have already been rendered
        const unrenderedPeople = generationPeople.filter(person => !renderedPeople.has(person.id));
        
        // Organize people by families where possible
        const familyGroups = organizeByFamilies(unrenderedPeople, data.personMap);
        
        // If there are organized family groups, render them
        if (familyGroups.length > 0) {
            // Render each family group
            familyGroups.forEach(familyGroup => {
                const famGroup = renderFamilyGroup(familyGroup, data.personMap, renderedPeople);
                generationPeopleContainer.appendChild(famGroup);
                
                // Mark all members of this group as rendered
                familyGroup.members.forEach(id => renderedPeople.add(id));
            });
            
            // Render any ungrouped people who haven't been rendered yet
            const ungrouped = unrenderedPeople.filter(person => 
                !familyGroups.some(group => 
                    group.members.includes(person.id)
                ) && !renderedPeople.has(person.id)
            );
            
            ungrouped.forEach(person => {
                const personCard = createPersonCard(person);
                generationPeopleContainer.appendChild(personCard);
                renderedPeople.add(person.id);
            });
        } else {
            // If no family grouping, just render all unrendered people in this generation
            unrenderedPeople.forEach(person => {
                if (!renderedPeople.has(person.id)) {
                    const personCard = createPersonCard(person);
                    generationPeopleContainer.appendChild(personCard);
                    renderedPeople.add(person.id);
                }
            });
        }
        
        generationGroup.appendChild(generationPeopleContainer);
        contentElement.appendChild(generationGroup);
    });
    
    // Draw connection lines after cards are rendered
    setTimeout(() => {
        drawConnectionLines(data.people, data.personMap, connectionContainer);
    }, 100);
}

/**
 * Improved organizeByFamilies function to better handle multiple relationships
 * @param {Array} people - People in a generation
 * @param {Map} personMap - Map of all people by ID
 * @returns {Array} - Array of family groups
 */
function organizeByFamilies(people, personMap) {
    const familyGroups = [];
    
    // First pass - identify partners and group them
    people.forEach(person => {
        // Skip if already added to a partnership group
        if (familyGroups.some(group => 
            group.type === 'partnership' && 
            group.members.includes(person.id) &&
            group.primaryPerson !== person.id // Allow a person to be primary in their own group
        )) {
            return;
        }
        
        // Find all partners of this person from the same generation
        const sameGenPartners = person.partners.filter(partnerId => {
            const partner = personMap.get(partnerId);
            return partner && partner.generation === person.generation;
        });
        
        if (sameGenPartners.length > 0) {
            // Create a family group for each partnership
            // This avoids one person with multiple partners creating a single huge family
            sameGenPartners.forEach(partnerId => {
                // Check if this specific partnership is already represented
                const partnershipExists = familyGroups.some(group => 
                    group.type === 'partnership' && 
                    group.members.includes(person.id) && 
                    group.members.includes(partnerId)
                );
                
                if (!partnershipExists) {
                    familyGroups.push({
                        primaryPerson: person.id,
                        members: [person.id, partnerId],
                        type: 'partnership'
                    });
                }
            });
        }
    });
    
    // Then group siblings if they're not already in partnership groups
    people.forEach(person => {
        // Skip if already in a partnership group as primary
        if (familyGroups.some(group => 
            group.type === 'partnership' && 
            group.primaryPerson === person.id
        )) {
            return;
        }
        
        // Find siblings in the same generation who aren't in partnership groups
        const sameGenSiblings = person.siblings.filter(siblingId => {
            const sibling = personMap.get(siblingId);
            return sibling && 
                   sibling.generation === person.generation && 
                   !familyGroups.some(group => 
                       group.type === 'partnership' && 
                       group.primaryPerson === siblingId
                   );
        });
        
        if (sameGenSiblings.length > 0) {
            // Check if any of these siblings are already in a sibling group
            const existingSiblingGroup = familyGroups.find(group => 
                group.type === 'siblings' && 
                (group.members.includes(person.id) || 
                 sameGenSiblings.some(id => group.members.includes(id)))
            );
            
            if (existingSiblingGroup) {
                // Add this person and their siblings to the existing group
                const newMembers = [person.id, ...sameGenSiblings].filter(id => 
                    !existingSiblingGroup.members.includes(id)
                );
                existingSiblingGroup.members.push(...newMembers);
            } else {
                // Create a new sibling group
                familyGroups.push({
                    primaryPerson: person.id,
                    members: [person.id, ...sameGenSiblings],
                    type: 'siblings'
                });
            }
        }
    });
    
    return familyGroups;
}

/**
 * Modified renderFamilyGroup function that accounts for already rendered people
 * @param {Object} familyGroup - The family group to render
 * @param {Map} personMap - Map of all people by ID
 * @param {Set} renderedPeople - Set of already rendered people IDs
 * @returns {HTMLElement} - The rendered family group element
 */
function renderFamilyGroup(familyGroup, personMap, renderedPeople) {
    const groupElement = document.createElement('div');
    groupElement.className = 'family-group';
    
    const membersContainer = document.createElement('div');
    membersContainer.className = 'family-members';
    
    // Render each member of the family who hasn't been rendered yet
    familyGroup.members.forEach(memberId => {
        if (!renderedPeople.has(memberId)) {
            const person = personMap.get(memberId);
            if (person) {
                const personCard = createPersonCard(person);
                membersContainer.appendChild(personCard);
                // Mark this person as rendered
                renderedPeople.add(memberId);
            }
        }
    });
    
    groupElement.appendChild(membersContainer);
    return groupElement;
}

/**
 * Create a person card
 * @param {Object} person - The person data
 * @returns {HTMLElement} - The person card element
 */
function createPersonCard(person) {
    const card = document.createElement('div');
    card.className = 'person-card';
    card.setAttribute('data-id', person.id);
    
    // Add deceased class if applicable
    if (person.death_year !== null) {
        card.classList.add('person-deceased');
    }
    
    // Inner card content
    const cardContent = document.createElement('div');
    cardContent.className = 'person-card-content';
    
    // House indicator (main house)
    if (person.main_house) {
        const houseIndicator = document.createElement('div');
        houseIndicator.className = `house-indicator house-${person.main_house.toLowerCase()}`;
        card.appendChild(houseIndicator);
    }
    
    // Secondary house indicator
    if (person.secondary_house) {
        const secondaryIndicator = document.createElement('div');
        secondaryIndicator.className = `house-secondary-indicator house-${person.secondary_house.toLowerCase()}`;
        card.appendChild(secondaryIndicator);
    }
    
    // Portrait
    const portrait = document.createElement('div');
    portrait.className = 'card-portrait';
    const img = document.createElement('img');
    img.src = person.portrait || 'assets/images/unknown.png';
    img.alt = person.name;
    portrait.appendChild(img);
    cardContent.appendChild(portrait);
    
    // Person info
    const info = document.createElement('div');
    info.className = 'card-info';
    
    // Name
    const name = document.createElement('h3');
    name.className = 'card-name';
    name.textContent = person.name;
    info.appendChild(name);
    
    // Dates
    const dates = document.createElement('div');
    dates.className = 'card-dates';
    dates.textContent = `${person.birth_year} - ${person.death_year || 'Present'}`;
    info.appendChild(dates);
    
    // Title (if present)
    if (person.title) {
        const title = document.createElement('div');
        title.className = 'card-title';
        title.textContent = person.title;
        info.appendChild(title);
    }
    
    // House badges
    const houses = document.createElement('div');
    houses.className = 'card-houses';
    
    if (person.main_house) {
        const mainHouse = document.createElement('span');
        mainHouse.className = `card-house-badge house-${person.main_house.toLowerCase()}`;
        mainHouse.textContent = person.main_house;
        houses.appendChild(mainHouse);
    }
    
    if (person.secondary_house) {
        const secondaryHouse = document.createElement('span');
        secondaryHouse.className = `card-house-badge house-${person.secondary_house.toLowerCase()}`;
        secondaryHouse.textContent = person.secondary_house;
        houses.appendChild(secondaryHouse);
    }
    
    info.appendChild(houses);
    cardContent.appendChild(info);
    card.appendChild(cardContent);
    
    // Add click event to show details
    card.addEventListener('click', () => showPersonDetails(person.id));
    
    return card;
}

/**
 * Draw connection lines between related people, accounting for possible element absence
 * @param {Array} people - All people in the dataset
 * @param {Map} personMap - Map of all people by ID
 * @param {SVGElement} svgContainer - SVG container to draw in
 */
function drawConnectionLines(people, personMap, svgContainer) {
    // Track connections we've already drawn to avoid duplicates
    const drawnConnections = new Set();
    
    // Draw parent-child connections
    people.forEach(person => {
        // Skip if no parents
        if (!person.parent_1 && !person.parent_2) return;
        
        const childElement = document.querySelector(`.person-card[data-id="${person.id}"]`);
        if (!childElement) return;
        
        // Draw connection to each parent
        [person.parent_1, person.parent_2].forEach(parentId => {
            if (!parentId) return;
            
            const parent = personMap.get(parentId);
            if (!parent) return;
            
            const parentElement = document.querySelector(`.person-card[data-id="${parentId}"]`);
            if (!parentElement) return;
            
            // Create unique ID for this connection
            const connectionId = `${parentId}-${person.id}`;
            
            // Skip if already drawn
            if (drawnConnections.has(connectionId)) return;
            drawnConnections.add(connectionId);
            
            // Draw the connection
            drawConnection(
                parentElement, 
                childElement, 
                svgContainer, 
                'parent-child',
                parentId,
                person.id
            );
        });
    });
    
    // Draw partnership connections
    people.forEach(person => {
        if (!person.partners || person.partners.length === 0) return;
        
        const personElement = document.querySelector(`.person-card[data-id="${person.id}"]`);
        if (!personElement) return;
        
        // Draw connection to each partner
        person.partners.forEach(partnerId => {
            // Create a sorted connection ID to avoid duplicates
            const connectionPair = [person.id, partnerId].sort();
            const connectionId = `${connectionPair[0]}-${connectionPair[1]}`;
            
            // Skip if already drawn
            if (drawnConnections.has(connectionId)) return;
            
            const partner = personMap.get(partnerId);
            if (!partner) return;
            
            const partnerElement = document.querySelector(`.person-card[data-id="${partnerId}"]`);
            if (!partnerElement) return; // Skip if partner element doesn't exist
            
            // Now we can add the connection ID since we've verified both elements exist
            drawnConnections.add(connectionId);
            
            // Draw the connection
            drawConnection(
                personElement, 
                partnerElement, 
                svgContainer, 
                'partnership',
                person.id,
                partnerId
            );
        });
    });
}

/**
 * Draw a connection line between two elements
 * @param {HTMLElement} element1 - First element to connect
 * @param {HTMLElement} element2 - Second element to connect
 * @param {SVGElement} svgContainer - SVG container to draw in
 * @param {string} type - Type of connection ('parent-child' or 'partnership')
 * @param {string} id1 - ID of first person
 * @param {string} id2 - ID of second person
 */
function drawConnection(element1, element2, svgContainer, type, id1, id2) {
    // Get positions of elements
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    const svgRect = svgContainer.getBoundingClientRect();
    
    // Calculate connection points
    let x1, y1, x2, y2;
    
    // For parent-child connections, connect bottom of parent to top of child
    if (type === 'parent-child') {
        x1 = rect1.left + rect1.width / 2 - svgRect.left;
        y1 = rect1.bottom - svgRect.top;
        x2 = rect2.left + rect2.width / 2 - svgRect.left;
        y2 = rect2.top - svgRect.top;
    } 
    // For partnerships, connect sides of cards
    else {
        // If they're side by side, connect the sides
        if (Math.abs(rect1.top - rect2.top) < rect1.height) {
            // Determine which is left and which is right
            if (rect1.left < rect2.left) {
                x1 = rect1.right - svgRect.left;
                y1 = rect1.top + rect1.height / 2 - svgRect.top;
                x2 = rect2.left - svgRect.left;
                y2 = rect2.top + rect2.height / 2 - svgRect.top;
            } else {
                x1 = rect1.left - svgRect.left;
                y1 = rect1.top + rect1.height / 2 - svgRect.top;
                x2 = rect2.right - svgRect.left;
                y2 = rect2.top + rect2.height / 2 - svgRect.top;
            }
        } 
        // If they're stacked, connect top to bottom
        else {
            if (rect1.top < rect2.top) {
                x1 = rect1.left + rect1.width / 2 - svgRect.left;
                y1 = rect1.bottom - svgRect.top;
                x2 = rect2.left + rect2.width / 2 - svgRect.left;
                y2 = rect2.top - svgRect.top;
            } else {
                x1 = rect1.left + rect1.width / 2 - svgRect.left;
                y1 = rect1.top - svgRect.top;
                x2 = rect2.left + rect2.width / 2 - svgRect.left;
                y2 = rect2.bottom - svgRect.top;
            }
        }
    }
    
    // Create path element
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Set path data - using bezier curve for smooth connection
    let d;
    
    // If the connection is mostly horizontal
    if (Math.abs(x2 - x1) > Math.abs(y2 - y1)) {
        // Control points at 1/3 and 2/3 of the distance
        const cpX1 = x1 + (x2 - x1) / 3;
        const cpY1 = y1;
        const cpX2 = x1 + 2 * (x2 - x1) / 3;
        const cpY2 = y2;
        
        d = `M ${x1} ${y1} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x2} ${y2}`;
    } 
    // If the connection is mostly vertical
    else {
        // Control points at 1/3 and 2/3 of the distance
        const cpX1 = x1;
        const cpY1 = y1 + (y2 - y1) / 3;
        const cpX2 = x2;
        const cpY2 = y1 + 2 * (y2 - y1) / 3;
        
        d = `M ${x1} ${y1} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x2} ${y2}`;
    }
    
    // Set path attributes
    path.setAttribute('d', d);
    path.setAttribute('class', `connection-line ${type}`);
    path.setAttribute('data-from', id1);
    path.setAttribute('data-to', id2);
    
    // Add to SVG
    svgContainer.appendChild(path);
}

//==============================================================================
// PERSON DETAILS
//==============================================================================

/**
 * Show detailed information for a person
 * @param {string} personId - ID of the person to show details for
 */
function showPersonDetails(personId) {
    const { personMap } = bloodlinesData.processedData;
    const person = personMap.get(personId);
    if (!person) return;
    
    // Store selected person
    bloodlinesData.selectedPerson = person;
    
    // Update details drawer
    const drawer = document.getElementById('personDetailsDrawer');
    
    // Portrait
    document.getElementById('detailPortrait').src = person.portrait || 'assets/images/unknown.png';
    
    // Name
    document.getElementById('detailName').textContent = person.name;
    
    // Houses
    const primaryHouse = document.getElementById('detailPrimaryHouse');
    primaryHouse.className = 'house-badge primary-house';
    const mainHouseClass = `house-${person.main_house.toLowerCase().replace(/\s+/g, '-')}`;
    primaryHouse.classList.add(mainHouseClass);
    primaryHouse.querySelector('.house-name').textContent = person.main_house;
    
    const secondaryHouse = document.getElementById('detailSecondaryHouse');
    if (person.secondary_house) {
        secondaryHouse.style.display = 'block';
        secondaryHouse.className = 'house-badge secondary-house';
        const secondaryHouseClass = `house-${person.secondary_house.toLowerCase().replace(/\s+/g, '-')}`;
        secondaryHouse.classList.add(secondaryHouseClass);
        secondaryHouse.querySelector('.house-name').textContent = person.secondary_house;
    } else {
        secondaryHouse.style.display = 'none';
    }
    
    // Lifespan
    document.getElementById('detailLifespan').querySelector('span').textContent = 
        `${person.birth_year} - ${person.death_year || 'Present'}`;
    
    // Title
    const titleEl = document.getElementById('detailTitle');
    if (person.title) {
        titleEl.style.display = 'block';
        titleEl.querySelector('span').textContent = person.title;
    } else {
        titleEl.style.display = 'none';
    }
    
    // Aliases
    const aliasesEl = document.getElementById('detailAliases');
    const aliasesList = aliasesEl.querySelector('.aliases-list');
    aliasesList.innerHTML = '';
    
    if (person.aliases && person.aliases.length > 0) {
        aliasesEl.style.display = 'block';
        person.aliases.forEach(alias => {
            const li = document.createElement('li');
            li.textContent = alias;
            aliasesList.appendChild(li);
        });
    } else {
        aliasesEl.style.display = 'none';
    }
    
    // Description
    const descriptionEl = document.getElementById('detailDescription');
    if (person.description) {
        descriptionEl.style.display = 'block';
        
        // Handle both string and array descriptions
        if (Array.isArray(person.description)) {
            descriptionEl.querySelector('p').textContent = person.description.join(', ');
        } else {
            descriptionEl.querySelector('p').textContent = person.description;
        }
    } else {
        descriptionEl.style.display = 'none';
    }
    
    // Update family lists
    updateFamilyLists(person);
    
    // Show the drawer
    drawer.classList.add('open');
}

/**
 * Update the family relationship lists in the person details
 * @param {Object} person - The person object
 */
function updateFamilyLists(person) {
    const { personMap } = bloodlinesData.processedData;
    
    // Parents
    const parentsList = document.getElementById('detailParents');
    parentsList.innerHTML = '';
    
    if (person.parent_1 || person.parent_2) {
        [person.parent_1, person.parent_2].forEach(parentId => {
            if (!parentId) return;
            
            const parent = personMap.get(parentId);
            if (!parent) return;
            
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.textContent = parent.name;
            a.href = '#';
            a.addEventListener('click', e => {
                e.preventDefault();
                closePersonDetails();
                setTimeout(() => showPersonDetails(parentId), 300);
            });
            li.appendChild(a);
            parentsList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'Unknown or not recorded';
        parentsList.appendChild(li);
    }
    
    // Partners
    const partnersList = document.getElementById('detailPartners');
    partnersList.innerHTML = '';
    
    if (person.partners && person.partners.length > 0) {
        person.partners.forEach(partnerId => {
            const partner = personMap.get(partnerId);
            if (!partner) return;
            
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.textContent = partner.name;
            a.href = '#';
            a.addEventListener('click', e => {
                e.preventDefault();
                closePersonDetails();
                setTimeout(() => showPersonDetails(partnerId), 300);
            });
            li.appendChild(a);
            partnersList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'None recorded';
        partnersList.appendChild(li);
    }
    
    // Children
    const childrenList = document.getElementById('detailChildren');
    childrenList.innerHTML = '';
    
    if (person.children && person.children.length > 0) {
        person.children.forEach(childId => {
            const child = personMap.get(childId);
            if (!child) return;
            
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.textContent = child.name;
            a.href = '#';
            a.addEventListener('click', e => {
                e.preventDefault();
                closePersonDetails();
                setTimeout(() => showPersonDetails(childId), 300);
            });
            li.appendChild(a);
            childrenList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'None recorded';
        childrenList.appendChild(li);
    }
    
    // Siblings
    const siblingsList = document.getElementById('detailSiblings');
    siblingsList.innerHTML = '';
    
    if (person.siblings && person.siblings.length > 0) {
        person.siblings.forEach(siblingId => {
            const sibling = personMap.get(siblingId);
            if (!sibling) return;
            
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.textContent = sibling.name;
            a.href = '#';
            a.addEventListener('click', e => {
                e.preventDefault();
                closePersonDetails();
                setTimeout(() => showPersonDetails(siblingId), 300);
            });
            li.appendChild(a);
            siblingsList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'None recorded';
        siblingsList.appendChild(li);
    }
}

/**
 * Close the person details drawer
 */
function closePersonDetails() {
    document.getElementById('personDetailsDrawer').classList.remove('open');
}

//==============================================================================
// HIGHLIGHTING AND FILTERING
//==============================================================================

/**
 * Highlight the bloodline of the selected person
 */
function highlightLineage() {
    if (!bloodlinesData.selectedPerson) return;
    
    // Enable highlight mode
    bloodlinesData.viewState.highlightMode = true;
    
    // Find all related people
    const relatedIds = findAllRelatedPeople(bloodlinesData.selectedPerson.id);
    
    // Highlight person cards
    document.querySelectorAll('.person-card').forEach(card => {
        const id = card.getAttribute('data-id');
        
        if (relatedIds.includes(id)) {
            card.classList.add('highlighted');
        } else {
            card.classList.remove('highlighted');
            card.classList.add('filtered-out');
        }
    });
    
    // Highlight connection lines
    document.querySelectorAll('.connection-line').forEach(line => {
        const fromId = line.getAttribute('data-from');
        const toId = line.getAttribute('data-to');
        
        if (relatedIds.includes(fromId) && relatedIds.includes(toId)) {
            line.classList.add('highlighted');
        } else {
            line.classList.remove('highlighted');
            line.style.opacity = '0.2';
        }
    });
    
    // Close the details drawer
    closePersonDetails();
}

/**
 * Find all people related to a given person
 * @param {string} personId - ID of the person
 * @returns {Array} - Array of IDs of related people
 */
function findAllRelatedPeople(personId) {
    const { personMap } = bloodlinesData.processedData;
    const relatedPeople = new Set([personId]);
    
    // Helper function to find ancestors recursively
    function findAncestors(id) {
        const person = personMap.get(id);
        if (!person) return;
        
        // Add parents
        [person.parent_1, person.parent_2].forEach(parentId => {
            if (parentId && !relatedPeople.has(parentId)) {
                relatedPeople.add(parentId);
                findAncestors(parentId);
            }
        });
    }
    
    // Helper function to find descendants recursively
    function findDescendants(id) {
        const person = personMap.get(id);
        if (!person) return;
        
        // Add children
        person.children.forEach(childId => {
            if (!relatedPeople.has(childId)) {
                relatedPeople.add(childId);
                findDescendants(childId);
            }
        });
    }
    
    // Find ancestors and descendants
    findAncestors(personId);
    findDescendants(personId);
    
    // Include spouses/partners
    const person = personMap.get(personId);
    if (person && person.partners) {
        person.partners.forEach(partnerId => {
            relatedPeople.add(partnerId);
        });
    }
    
    return Array.from(relatedPeople);
}

/**
 * Reset all highlighting
 */
function resetHighlights() {
    // Disable highlight mode
    bloodlinesData.viewState.highlightMode = false;
    
    // Reset person cards
    document.querySelectorAll('.person-card').forEach(card => {
        card.classList.remove('highlighted');
        card.classList.remove('filtered-out');
    });
    
    // Reset connection lines
    document.querySelectorAll('.connection-line').forEach(line => {
        line.classList.remove('highlighted');
        line.style.opacity = '';
    });
    
    // Close the details drawer
    closePersonDetails();
}

/**
 * Filter to show only people from a specific house
 * @param {string} house - The house to filter by, or 'all' for no filter
 */
function filterByHouse(house) {
    // Reset any existing highlighting
    resetHighlights();
    
    // Update filter state
    bloodlinesData.viewState.filteredHouse = house === 'all' ? null : house;
    
    // If no filter, show all
    if (house === 'all') {
        document.querySelectorAll('.person-card').forEach(card => {
            card.classList.remove('filtered-out');
        });
        
        document.querySelectorAll('.connection-line').forEach(line => {
            line.style.opacity = '';
        });
        
        return;
    }
    
    // Find all people from the selected house
    const { people } = bloodlinesData.processedData;
    const matchingIds = people
        .filter(p => 
            (p.main_house && p.main_house.toLowerCase() === house) ||
            (p.secondary_house && p.secondary_house.toLowerCase() === house)
        )
        .map(p => p.id);
    
    // Filter person cards
    document.querySelectorAll('.person-card').forEach(card => {
        const id = card.getAttribute('data-id');
        
        if (matchingIds.includes(id)) {
            card.classList.remove('filtered-out');
        } else {
            card.classList.add('filtered-out');
        }
    });
    
    // Filter connection lines
    document.querySelectorAll('.connection-line').forEach(line => {
        const fromId = line.getAttribute('data-from');
        const toId = line.getAttribute('data-to');
        
        if (matchingIds.includes(fromId) && matchingIds.includes(toId)) {
            line.style.opacity = '';
        } else {
            line.style.opacity = '0.2';
        }
    });
}

/**
 * Enhanced Timeline Navigation Functionality
 * This adds interactive features to the royal bloodlines timeline
 */

//==============================================================================
// TIMELINE ENHANCEMENT FUNCTIONS
//==============================================================================

/**
 * Initialize the enhanced timeline functionality
 */
function initializeEnhancedTimeline() {
    // Set up timeline navigation
    setupTimelineNavigation();
    
    // Create timeline cursor indicator
    createTimelineCursor();
    
    // Add position indicator
    createTimelinePositionIndicator();
    
    // Set up timeline scroll synchronization
    setupTimelineScrollSync();
}

/**
 * Set up interactive timeline navigation
 */
function setupTimelineNavigation() {
    const decadeMarkers = document.querySelectorAll('.decade-marker');
    
    decadeMarkers.forEach(marker => {
        marker.addEventListener('click', e => {
            const year = parseInt(marker.getAttribute('data-year'));
            navigateToYear(year);
            
            // Highlight the clicked marker
            highlightTimelineMarker(marker);
        });
        
        // Add hover effects for better UX
        marker.addEventListener('mouseenter', () => {
            marker.style.borderLeftWidth = '3px';
            marker.style.cursor = 'pointer';
            
            // Show year tooltip on hover
            const tooltip = document.createElement('div');
            tooltip.className = 'year-tooltip';
            tooltip.textContent = marker.getAttribute('data-year');
            tooltip.style.position = 'absolute';
            tooltip.style.bottom = '45px';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translateX(-50%)';
            tooltip.style.backgroundColor = 'rgba(212, 175, 55, 0.9)';
            tooltip.style.color = '#000';
            tooltip.style.padding = '3px 8px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.fontSize = '0.8rem';
            tooltip.style.fontWeight = 'bold';
            tooltip.style.zIndex = '10';
            tooltip.style.whiteSpace = 'nowrap';
            marker.appendChild(tooltip);
        });
        
        marker.addEventListener('mouseleave', () => {
            marker.style.borderLeftWidth = marker.classList.contains('century-marker') ? '2px' : '1px';
            
            // Remove tooltip on mouse leave
            const tooltip = marker.querySelector('.year-tooltip');
            if (tooltip) {
                marker.removeChild(tooltip);
            }
        });
    });
}

/**
 * Navigate to a specific year in the bloodlines visualization
 * @param {number} year - The year to navigate to
 */
function navigateToYear(year) {
    const { processedData } = bloodlinesData;
    const people = processedData.people;
    
    // Find people born close to this year (within a decade)
    const yearRange = 10;
    const relevantPeople = people.filter(person => 
        person.birth_year >= year - yearRange && 
        person.birth_year <= year + yearRange
    );
    
    if (relevantPeople.length > 0) {
        // Sort by closest to the target year
        relevantPeople.sort((a, b) => 
            Math.abs(a.birth_year - year) - Math.abs(b.birth_year - year)
        );
        
        // Find the HTML element for the person closest to this year
        const targetPerson = relevantPeople[0];
        const targetElement = document.querySelector(`.person-card[data-id="${targetPerson.id}"]`);
        
        if (targetElement) {
            // Scroll to the element
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Briefly highlight the matching person cards
            highlightPeopleByYear(year, yearRange);
            
            // Update timeline cursor position
            updateTimelineCursor(year);
            
            // Show a message about the current year view
            showYearNavMessage(year, relevantPeople.length);
        } else {
            // If no element found, just show a navigation message
            showYearNavMessage(year, relevantPeople.length, true);
        }
    } else {
        // If no people found in this year range
        showYearNavMessage(year, 0, true);
    }
}

/**
 * Highlight people born within a specific year range
 * @param {number} year - The target year
 * @param {number} range - The range around the target year
 */
function highlightPeopleByYear(year, range) {
    const { processedData } = bloodlinesData;
    const people = processedData.people;
    
    // Find all people born in this range
    const relevantPeopleIds = people
        .filter(person => 
            person.birth_year >= year - range && 
            person.birth_year <= year + range
        )
        .map(person => person.id);
    
    // Remove existing year highlights
    document.querySelectorAll('.year-highlight').forEach(el => {
        el.classList.remove('year-highlight');
    });
    
    // Add highlights to matching person cards
    relevantPeopleIds.forEach(id => {
        const element = document.querySelector(`.person-card[data-id="${id}"]`);
        if (element) {
            element.classList.add('year-highlight');
            
            // Add a pulse animation
            element.style.animation = 'pulseHighlight 1.5s ease-in-out';
            
            // Remove animation after it completes
            setTimeout(() => {
                element.style.animation = '';
            }, 1500);
        }
    });
}

/**
 * Highlight a timeline marker
 * @param {HTMLElement} marker - The marker to highlight
 */
function highlightTimelineMarker(marker) {
    // Remove existing highlights
    document.querySelectorAll('.marker-active').forEach(el => {
        el.classList.remove('marker-active');
    });
    
    // Add highlight to this marker
    marker.classList.add('marker-active');
}

/**
 * Show a message about the year navigation
 * @param {number} year - The target year
 * @param {number} count - Number of people found
 * @param {boolean} notFound - Whether people were found
 */
function showYearNavMessage(year, count, notFound = false) {
    // Create or get the message element
    let messageEl = document.getElementById('timeline-message');
    
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.id = 'timeline-message';
        messageEl.className = 'timeline-message';
        
        const viewport = document.querySelector('.bloodlines-viewport');
        viewport.appendChild(messageEl);
    }
    
    // Set the message text
    if (notFound) {
        messageEl.textContent = `No records found near year ${year}`;
        messageEl.classList.add('no-results');
    } else {
        messageEl.textContent = `Year ${year}: ${count} people born within a decade`;
        messageEl.classList.remove('no-results');
    }
    
    // Show the message
    messageEl.classList.add('show');
    
    // Hide after a few seconds
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 3000);
}

/**
 * Create a timeline cursor to show current position
 */
function createTimelineCursor() {
    const timeline = document.querySelector('.timeline-decades');
    
    const cursor = document.createElement('div');
    cursor.className = 'timeline-cursor';
    cursor.innerHTML = '<div class="cursor-arrow"></div>';
    timeline.appendChild(cursor);
    
    // Set initial position based on the current date
    updateTimelineCursor(bloodlinesData.timeline.earliestYear + 100);
}

/**
 * Update the position of the timeline cursor
 * @param {number} year - The year to position the cursor at
 */
function updateTimelineCursor(year) {
    const cursor = document.querySelector('.timeline-cursor');
    if (!cursor) return;
    
    const { earliestYear, pixelsPerYear } = bloodlinesData.timeline;
    
    // Calculate position
    const position = (year - earliestYear) * pixelsPerYear;
    
    // Update position
    cursor.style.left = `${position}px`;
}

/**
 * Create a position indicator that shows visible years in the viewport
 */
function createTimelinePositionIndicator() {
    const timeline = document.querySelector('.timeline-navigation');
    
    const indicator = document.createElement('div');
    indicator.className = 'timeline-position-indicator';
    timeline.appendChild(indicator);
}

/**
 * Update the timeline position indicator
 * @param {number} startYear - Start year of visible range
 * @param {number} endYear - End year of visible range
 */
function updateTimelinePositionIndicator(startYear, endYear) {
    const indicator = document.querySelector('.timeline-position-indicator');
    if (!indicator) return;
    
    const { earliestYear, pixelsPerYear } = bloodlinesData.timeline;
    
    // Calculate positions
    const startPos = (startYear - earliestYear) * pixelsPerYear;
    const endPos = (endYear - earliestYear) * pixelsPerYear;
    const width = endPos - startPos;
    
    // Update indicator
    indicator.style.left = `${startPos}px`;
    indicator.style.width = `${width}px`;
}

/**
 * Set up synchronization between timeline and bloodlines scroll
 */
function setupTimelineScrollSync() {
    const timelineContainer = document.querySelector('.timeline-scale');
    const bloodlinesViewport = document.querySelector('.bloodlines-viewport');
    
    // Sync bloodlines scroll to timeline
    timelineContainer.addEventListener('scroll', () => {
        // Prevent recursive triggering
        if (timelineContainer.isScrolling) return;
        
        bloodlinesViewport.isScrolling = true;
        
        // Get visible range in the timeline
        const visibleYears = calculateVisibleYearRange(timelineContainer);
        
        // Update cursor to center of visible range
        const midYear = (visibleYears.start + visibleYears.end) / 2;
        updateTimelineCursor(midYear);
        
        bloodlinesViewport.isScrolling = false;
    });
    
    // Track visible people while scrolling the bloodlines view
    bloodlinesViewport.addEventListener('scroll', () => {
        // Prevent recursive triggering
        if (bloodlinesViewport.isScrolling) return;
        
        timelineContainer.isScrolling = true;
        
        // Find the most visible person cards
        const visiblePeople = findVisiblePeople(bloodlinesViewport);
        
        if (visiblePeople.length > 0) {
            // Calculate the average birth year of visible people
            const averageBirthYear = visiblePeople.reduce((sum, p) => sum + p.birthYear, 0) / visiblePeople.length;
            
            // Update the timeline cursor
            updateTimelineCursor(averageBirthYear);
            
            // Scroll the timeline to make the cursor visible
            const { earliestYear, pixelsPerYear } = bloodlinesData.timeline;
            const cursorPosition = (averageBirthYear - earliestYear) * pixelsPerYear;
            
            timelineContainer.scrollLeft = cursorPosition - (timelineContainer.clientWidth / 2);
            
            // Find min and max birth years of visible people
            const minYear = Math.min(...visiblePeople.map(p => p.birthYear));
            const maxYear = Math.max(...visiblePeople.map(p => p.birthYear));
            
            // Update position indicator
            updateTimelinePositionIndicator(minYear, maxYear);
        }
        
        timelineContainer.isScrolling = false;
    });
}

/**
 * Calculate the visible year range in the timeline
 * @param {HTMLElement} timelineContainer - The timeline container element
 * @returns {Object} - Object with start and end years
 */
function calculateVisibleYearRange(timelineContainer) {
    const { earliestYear, pixelsPerYear } = bloodlinesData.timeline;
    
    const scrollLeft = timelineContainer.scrollLeft;
    const containerWidth = timelineContainer.clientWidth;
    
    const startYear = earliestYear + (scrollLeft / pixelsPerYear);
    const endYear = earliestYear + ((scrollLeft + containerWidth) / pixelsPerYear);
    
    return {
        start: Math.round(startYear),
        end: Math.round(endYear)
    };
}

/**
 * Find the most visible person cards in the viewport
 * @param {HTMLElement} viewport - The bloodlines viewport element
 * @returns {Array} - Array of objects with person IDs and birth years
 */
function findVisiblePeople(viewport) {
    const cards = document.querySelectorAll('.person-card');
    const viewportRect = viewport.getBoundingClientRect();
    const visiblePeople = [];
    
    // Calculate the viewport center
    const viewportCenterY = viewportRect.top + (viewportRect.height / 2);
    
    cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        
        // If card is visible
        if (cardRect.top < viewportRect.bottom && cardRect.bottom > viewportRect.top) {
            const personId = card.getAttribute('data-id');
            const person = bloodlinesData.processedData.personMap.get(personId);
            
            if (person && person.birth_year) {
                // Calculate the vertical distance from viewport center
                const distanceFromCenter = Math.abs(cardRect.top + (cardRect.height / 2) - viewportCenterY);
                
                visiblePeople.push({
                    id: personId,
                    birthYear: person.birth_year,
                    distance: distanceFromCenter
                });
            }
        }
    });
    
    // Sort by distance from center
    visiblePeople.sort((a, b) => a.distance - b.distance);
    
    // Return top results
    return visiblePeople.slice(0, 5);
}

// Add the timeline initialization to the main initialization
document.addEventListener('DOMContentLoaded', function() {
    // The existing initialization will be called first
    
    // Wait for the bloodlines data to be loaded
    const checkDataInterval = setInterval(() => {
        if (bloodlinesData.processedData) {
            clearInterval(checkDataInterval);
            // Now initialize the enhanced timeline
            initializeEnhancedTimeline();
        }
    }, 500);
});

//==============================================================================
// VIEWPORT NAVIGATION AND ZOOM
//==============================================================================

/**
 * Zoom in on the bloodlines view
 */
function zoomIn() {
    const { viewState } = bloodlinesData;
    
    // Increase scale
    viewState.scale = Math.min(viewState.scale * 1.2, 3);
    
    // Apply the transform
    applyViewTransform();
}

/**
 * Zoom out on the bloodlines view
 */
function zoomOut() {
    const { viewState } = bloodlinesData;
    
    // Decrease scale
    viewState.scale = Math.max(viewState.scale / 1.2, 0.4);
    
    // Apply the transform
    applyViewTransform();
}

/**
 * Reset the view to the default
 */
function resetView() {
    const { viewState } = bloodlinesData;
    
    // Reset values
    viewState.scale = 1;
    viewState.translateX = 0;
    viewState.translateY = 0;
    
    // Apply the transform
    applyViewTransform();
    
    // Reset any filters or highlights
    resetHighlights();
    
    // Reset house filter buttons
    document.querySelectorAll('.house-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.house-filter[data-house="all"]').classList.add('active');
}

/**
 * Apply the current transform values
 */
function applyViewTransform() {
    const { scale, translateX, translateY } = bloodlinesData.viewState;
    const content = document.getElementById('bloodlinesContent');
    
    content.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
}

/**
 * Handle mouse wheel events for zooming
 * @param {Event} event - The wheel event
 */
function handleMouseWheel(event) {
    // Prevent default scroll behavior
    event.preventDefault();
    
    // Determine zoom direction
    if (event.deltaY < 0) {
        zoomIn();
    } else {
        zoomOut();
    }
}

/**
 * Setup drag navigation in the viewport
 * @param {HTMLElement} viewport - The viewport element
 */
function setupDragNavigation(viewport) {
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    
    viewport.addEventListener('mousedown', e => {
        // Only enable dragging on the viewport itself, not on cards or interactive elements
        if (e.target === viewport || e.target.id === 'bloodlinesContent' || e.target.classList.contains('connection-container')) {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            viewport.style.cursor = 'grabbing';
        }
    });
    
    viewport.addEventListener('mousemove', e => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        
        // Update translation values based on mouse movement and scale
        bloodlinesData.viewState.translateX += deltaX / bloodlinesData.viewState.scale;
        bloodlinesData.viewState.translateY += deltaY / bloodlinesData.viewState.scale;
        
        // Apply the transform
        applyViewTransform();
        
        // Update last position
        lastX = e.clientX;
        lastY = e.clientY;
    });
    
    // Stop dragging on mouse up or leave
    const stopDragging = () => {
        if (isDragging) {
            isDragging = false;
            viewport.style.cursor = 'default';
        }
    };
    
    viewport.addEventListener('mouseup', stopDragging);
    viewport.addEventListener('mouseleave', stopDragging);
}