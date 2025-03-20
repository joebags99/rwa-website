// Add at the top of family-tree.js
let familyData = [];

// Configuration constants for the family tree layout
const siblingSpacing = 100;     // Horizontal space between siblings
const generationSpacing = 120;  // Vertical space between generations
const marriageWidth = 60;       // Space between marriage partners

/**
 * Format a character's display name
 */
function formatName(character) {
    return character.name;
}

/**
 * Process the flat data into a structured format suitable for visualization
 */
function processData(data) {
        // Map of ID to character
        const characterMap = new Map();
        
        // First pass: Create character map
        data.forEach(character => {
                characterMap.set(character.id, character);
                
                // Initialize children array
                character.children = [];
                
                // Format the display name
                character.displayName = formatName(character);
        });
        
        // Second pass: Connect parents and children
        data.forEach(character => {
                // Set parent data if available
                if (character.parent_1) {
                        const parent1 = characterMap.get(character.parent_1);
                        if (parent1) {
                                parent1.children.push(character);
                        }
                }
                
                if (character.parent_2) {
                        const parent2 = characterMap.get(character.parent_2);
                        if (parent2) {
                                // Avoid duplicating child relationships
                                if (!parent2.children.includes(character)) {
                                        parent2.children.push(character);
                                }
                        }
                }
        });
        
        // Third pass: Identify marriages/partnerships
        data.forEach(character => {
                // If character has two known parents, mark them as partners
                if (character.parent_1 && character.parent_2) {
                        const parent1 = characterMap.get(character.parent_1);
                        const parent2 = characterMap.get(character.parent_2);
                        
                        if (parent1 && parent2) {
                                // Create or update partners array
                                if (!parent1.partners) parent1.partners = [];
                                if (!parent2.partners) parent2.partners = [];
                                
                                // Add partner relationship if not already exists
                                if (!parent1.partners.includes(parent2.id)) {
                                        parent1.partners.push(parent2.id);
                                }
                                if (!parent2.partners.includes(parent1.id)) {
                                        parent2.partners.push(parent1.id);
                                }
                        }
                }
        });
        
        // Fourth pass: Identify betrothals
        data.forEach(character => {
                if (character.betrothed) {
                        const betrothed = characterMap.get(character.betrothed);
                        if (betrothed) {
                                // Create or update betrothals array
                                if (!character.betrothals) character.betrothals = [];
                                if (!betrothed.betrothals) betrothed.betrothals = [];
                                
                                // Add betrothal relationship if not already exists
                                if (!character.betrothals.includes(betrothed.id)) {
                                        character.betrothals.push(betrothed.id);
                                }
                                if (!betrothed.betrothals.includes(character.id)) {
                                        betrothed.betrothals.push(character.id);
                                }
                        }
                }
        });
        
        // Find the root nodes (characters without parents)
        const rootNodes = data.filter(character => {
                return !character.parent_1 && !character.parent_2;
        });
        
        console.log("Root nodes:", rootNodes.length);
        
        // Now position the nodes
        positionNodes(rootNodes, characterMap);
}

/**
 * Initialize the D3 zoom behavior
 */
function initZoomBehavior() {
    zoom = d3.zoom()
        .scaleExtent([0.2, 3])
        .on("zoom", (event) => {
            currentTransform = event.transform;
            g.attr("transform", currentTransform);
            
            // Hide tooltip when zooming/panning
            tooltip.classed("visible", false);
        });
    
    svg.call(zoom);
    
    // Set up zoom buttons
    document.getElementById("zoom-in").addEventListener("click", () => {
        svg.transition().duration(300).call(zoom.scaleBy, 1.3);
    });
    
    document.getElementById("zoom-out").addEventListener("click", () => {
        svg.transition().duration(300).call(zoom.scaleBy, 0.7);
    });
    
    document.getElementById("reset-view").addEventListener("click", resetView);
}

/**
 * Reset the view to center the visualization
 */
function resetView() {
    // Get the actual SVG dimensions
    const svgElement = document.getElementById("family-tree-svg");
    const svgWidth = svgElement.clientWidth;
    const svgHeight = svgElement.clientHeight;
    
    // Calculate scale to fit everything
    const scale = Math.min(
        svgWidth / (width + margin.left + margin.right),
        svgHeight / (height + margin.top + margin.bottom)
    ) * 0.9; // 90% to leave some padding
    
    // Center the tree
    const centerX = (svgWidth / scale - width) / 2;
    const centerY = (svgHeight / scale - height) / 2;
    
    svg.transition()
        .duration(750)
        .call(
            zoom.transform,
            d3.zoomIdentity
                .translate(centerX, centerY)
                .scale(scale)
        );
    
    // Clear any highlighting
    clearHighlighting();
    
    // Hide tooltip
    tooltip.classed("visible", false);
}

/**
 * Create the tooltip element
 */
function createTooltip() {
    return d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
}

/**
 * Load family data from JSON
 */
function loadFamilyData() {
    alert("loadFamilyData is running");
    console.log("Starting to load family data");
    try {
        d3.json("data/family-tree.json")        
        .then(data => {
                console.log("Data loaded:", data);
                console.log("Loaded family data:", data.length, "characters");
                familyData = data;
                
                // Process the flat data into a structured format
                processData(data);
                
                // Create the visualization
                createVisualization();
                
                // Initialize UI elements
                initUI();
                
                // Hide loading spinner
                document.querySelector('.visualization-overlay').classList.add('loaded');
            })
            .catch(error => {
                console.error("Error loading family data:", error);
                console.error("Error status:", error.status || "No status");
                console.error("Error message:", error.message || "No message");
                console.error("Error details:", error.stack || "No stack trace");
                
                // Show error message in loading overlay
                document.querySelector('.loading-text').textContent = 
                    "Error loading family data. Please try again later.";
            });
    } catch (err) {
        console.error("Exception in loadFamilyData:", err);
    }
}

/**
 * Map parent name to ID (handles edge cases in the data)
 */
function mapParentName(parentName) {
    // Handle case where the parent name isn't a direct ID
    // If parent is given as a full name, attempt to map to ID
    if (parentName.includes(" ") && !parentName.startsWith("F") && 
        !parentName.startsWith("V") && !parentName.startsWith("A") &&
        !parentName.startsWith("E") && !parentName.startsWith("D")) {
        
        // Simplistic approach - may need to enhance for real data
        for (const character of familyData) {
            if (character.name === parentName) {
                return character.id;
            }
        }
        
        // If no match, return original
        return parentName;
    }
    
    return parentName;
}

/**
 * Position nodes using a custom family tree layout algorithm
 */
function positionNodes(rootNodes, characterMap) {
    // Track visited nodes to avoid cycles
    const visited = new Set();
    
    // Track generations for vertical positioning
    const generations = new Map();
    
    // First, assign generations to each character (depth-first search)
    rootNodes.forEach(root => {
        assignGeneration(root, 0, generations, visited, characterMap);
    });
    
    // Reset visited set for the next traversal
    visited.clear();
    
    // Group characters by generation
    const generationGroups = new Map();
    generations.forEach((gen, id) => {
        if (!generationGroups.has(gen)) {
            generationGroups.set(gen, []);
        }
        generationGroups.get(gen).push(characterMap.get(id));
    });
    
    // Sort each generation horizontally (this is a simplistic approach)
    generationGroups.forEach((characters, gen) => {
        // Sort by house for grouping
        characters.sort((a, b) => {
            if (a.main_house === b.main_house) {
                return a.id.localeCompare(b.id);
            }
            return a.main_house.localeCompare(b.main_house);
        });
        
        // Position horizontally
        characters.forEach((character, index) => {
            const x = 100 + index * siblingSpacing;
            const y = 100 + gen * generationSpacing;
            
            character.x = x;
            character.y = y;
        });
    });
    
    // Now adjust positions for marriages/partnerships
    adjustMarriagePositions(characterMap);
    
    // Create nodes and links arrays
    createNodesAndLinks(characterMap);
}

/**
 * Assign generation (vertical level) to each character
 */
function assignGeneration(character, generation, generations, visited, characterMap) {
    if (visited.has(character.id)) return;
    visited.add(character.id);
    
    // Assign generation
    generations.set(character.id, generation);
    
    // Process children
    character.children.forEach(child => {
        assignGeneration(child, generation + 1, generations, visited, characterMap);
    });
    
    // Process partners (keep at same generation)
    if (character.partners) {
        character.partners.forEach(partnerId => {
            const partner = characterMap.get(partnerId);
            if (partner && !visited.has(partnerId)) {
                assignGeneration(partner, generation, generations, visited, characterMap);
            }
        });
    }
}

/**
 * Adjust positions for marriages and partnerships
 */
function adjustMarriagePositions(characterMap) {
    // Identify all partnerships
    const partnerships = [];
    characterMap.forEach(character => {
        if (character.partners && character.partners.length > 0) {
            character.partners.forEach(partnerId => {
                // Avoid duplicates by only processing partnerships where this character has smaller ID
                if (character.id < partnerId) {
                    partnerships.push({
                        person1: character,
                        person2: characterMap.get(partnerId)
                    });
                }
            });
        }
    });
    
    // Position partners next to each other
    partnerships.forEach(partnership => {
        const { person1, person2 } = partnership;
        
        // Find their common children
        const commonChildren = person1.children.filter(child => 
            person2.children.includes(child)
        );
        
        // Calculate average position of both partners
        const avgX = (person1.x + person2.x) / 2;
        
        // Reposition both partners
        person1.x = avgX - marriageWidth / 2;
        person2.x = avgX + marriageWidth / 2;
        
        // If they have common children, adjust those too
        if (commonChildren.length > 0) {
            const childrenWidth = (commonChildren.length - 1) * siblingSpacing;
            const startX = avgX - childrenWidth / 2;
            
            commonChildren.forEach((child, index) => {
                child.x = startX + index * siblingSpacing;
            });
        }
    });
}

/**
 * Create the nodes and links arrays needed for D3
 */
function createNodesAndLinks(characterMap) {
        // Create nodes array
        treeNodes = Array.from(characterMap.values());
        
        // Create links array
        treeLinks = [];
        
        // Parent-child links
        treeNodes.forEach(node => {
                if (node.parent_1) {
                        const parent1 = characterMap.get(node.parent_1);
                        if (parent1) {
                                treeLinks.push({
                                        source: parent1,
                                        target: node,
                                        type: 'parent'
                                });
                        }
                }
                
                if (node.parent_2) {
                        const parent2 = characterMap.get(node.parent_2);
                        if (parent2) {
                                treeLinks.push({
                                        source: parent2,
                                        target: node,
                                        type: 'parent'
                                });
                        }
                }
        });
        
        // Marriage links
        treeNodes.forEach(node => {
                if (node.partners) {
                        node.partners.forEach(partnerId => {
                                // Only add the link in one direction to avoid duplicates
                                if (node.id < partnerId) {
                                        const partner = characterMap.get(partnerId);
                                        if (partner) {
                                                treeLinks.push({
                                                        source: node,
                                                        target: partner,
                                                        type: 'marriage'
                                                });
                                        }
                                }
                        });
                }
        });
        
        // Betrothal links
        treeNodes.forEach(node => {
                if (node.betrothals) {
                        node.betrothals.forEach(betrothedId => {
                                // Only add the link in one direction to avoid duplicates
                                if (node.id < betrothedId) {
                                        const betrothed = characterMap.get(betrothedId);
                                        if (betrothed) {
                                                treeLinks.push({
                                                        source: node,
                                                        target: betrothed,
                                                        type: 'betrothal'
                                                });
                                        }
                                }
                        });
                }
        });
}

/**
 * Create the D3 visualization
 */
function createVisualization() {
    // Create links
    const links = linksGroup.selectAll(".link-path")
        .data(treeLinks)
        .enter().append("path")
        .attr("class", link => `link-path ${link.type}-path`)
        .attr("d", linkPathGenerator)
        .attr("stroke-width", 2);
    
    // Create nodes
    const nodes = nodesGroup.selectAll(".tree-node")
        .data(treeNodes)
        .enter().append("path")
        .attr("class", d => getNodeClass(d))
        .attr("d", d => getNodeShape(d))
        .attr("transform", d => `translate(${d.x}, ${d.y})`)
        .style("stroke-width", 2)
        .on("click", handleNodeClick)
        .on("mouseover", handleNodeMouseOver)
        .on("mouseout", handleNodeMouseOut);
    
    // Add node labels (names)
    const nodeLabels = nodesGroup.selectAll(".node-name")
        .data(treeNodes)
        .enter().append("text")
        .attr("class", "node-name")
        .attr("x", d => d.x)
        .attr("y", d => d.y + 35)
        .text(d => d.displayName);
    
    // Initial zoom to fit the tree
    resetView();
}

/**
 * Generate path for links
 */
function linkPathGenerator(d) {
        if (d.type === 'marriage') {
                // Horizontal marriage line
                return `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`;
        } else if (d.type === 'betrothal') {
                // Curved betrothal line
                const midX = (d.source.x + d.target.x) / 2;
                const midY = d.source.y - 15; // Curve upward slightly
                
                return `M${d.source.x},${d.source.y} Q${midX},${midY} ${d.target.x},${d.target.y}`;
        } else if (d.type === 'parent') {
                // Vertical line from parent to child
                // First check if we know both parents
                const hasDefinedParents = d.target.parent_1 && d.target.parent_2;
                
                if (hasDefinedParents) {
                        // Find the average x position of the parents
                        const parent1 = treeNodes.find(node => node.id === d.target.parent_1);
                        const parent2 = treeNodes.find(node => node.id === d.target.parent_2);
                        
                        if (parent1 && parent2) {
                                const midX = (parent1.x + parent2.x) / 2;
                                const parentY = parent1.y;
                                
                                // This is a more complex path with a vertical line from parents' midpoint
                                return `M${d.source.x},${d.source.y} ` +
                                       `V${parentY + 25} ` +
                                       `H${midX} ` +
                                       `V${d.target.y - 5} ` +
                                       `H${d.target.x} ` +
                                       `V${d.target.y}`;
                        }
                }
                
                // Simple case - just a direct line with bend
                return `M${d.source.x},${d.source.y} ` +
                       `V${d.source.y + 25} ` +
                       `H${d.target.x} ` +
                       `V${d.target.y}`;
        }
}

/**
 * Get CSS class for node based on house and highlighting
 */
function getNodeClass(d) {
    let classes = "tree-node";
    
    // Handle main house
    if (d.main_house) {
        const house = d.main_house.toLowerCase();
        classes += ` house-${house}-node`;
    }
    
    // Handle secondary house (for dual-house characters)
    if (d.secondary_house) {
        classes += " mixed-house-node";
    }
    
    // Add class for dead characters
    if (d.death_year) {
        classes += " node-deceased";
    }
    
    return classes;
}

/**
 * Get the SVG path for node shape based on gender
 */
function getNodeShape(d) {
    const nodeRadius = 15;
    
    // Different shapes based on gender
    if (d.gender === "Male") {
        // Square for male
        return `M${-nodeRadius},${-nodeRadius} h${nodeRadius*2} v${nodeRadius*2} h${-nodeRadius*2} z`;
    } else if (d.gender === "Female") {
        // Circle for female
        return `M0,${-nodeRadius} a${nodeRadius},${nodeRadius} 0 1,1 0,${nodeRadius*2} a${nodeRadius},${nodeRadius} 0 1,1 0,${-nodeRadius*2}`;
    } else {
        // Diamond for other/unknown
        return `M0,${-nodeRadius} L${nodeRadius},0 L0,${nodeRadius} L${-nodeRadius},0 Z`;
    }
}

/**
 * Handle node click - show character details
 */
function handleNodeClick(event, d) {
    // Show the character details modal
    showCharacterDetails(d);
    
    // Highlight the character's lineage
    highlightLineage(d);
}

/**
 * Handle node mouse over - show tooltip
 */
function handleNodeMouseOver(event, d) {
    // Position and show tooltip
    tooltip
        .html(`${d.displayName}${d.title ? `<br>${d.title}` : ""}`)
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px")
        .classed("visible", true);
}

/**
 * Handle node mouse out - hide tooltip
 */
function handleNodeMouseOut() {
    tooltip.classed("visible", false);
}

/**
 * Show character details in the modal
 */
function showCharacterDetails(character) {
    // Track the highlighted character
    highlightedCharacter = character;
    
    // Set character name and title
    document.getElementById("character-name").textContent = character.displayName;
    
    // Set or hide title
    if (character.title) {
        document.getElementById("character-title").textContent = character.title;
        document.getElementById("character-title").style.display = "block";
    } else {
        document.getElementById("character-title").style.display = "none";
    }
    
    // Set house information
    let houseText = character.main_house;
    if (character.secondary_house) {
        houseText += ` and ${character.secondary_house}`;
    }
    document.getElementById("character-house").textContent = houseText;
    
    // Set lifespan
    let lifespanText = "Unknown";
    if (character.birth_year || character.death_year) {
        lifespanText = "";
        if (character.birth_year) lifespanText += `Birth: ${character.birth_year} AR`;
        if (character.birth_year && character.death_year) lifespanText += " • ";
        if (character.death_year) lifespanText += `Death: ${character.death_year} AR`;
    }
    document.getElementById("character-lifespan").textContent = lifespanText;
    
    // Set parents information
    let parentsText = "Unknown";
    if (character.parent_1 || character.parent_2) {
        const parent1 = character.parent_1 ? findCharacterName(character.parent_1) : null;
        const parent2 = character.parent_2 ? findCharacterName(character.parent_2) : null;
        
        parentsText = "";
        if (parent1) parentsText += parent1;
        if (parent1 && parent2) parentsText += " and ";
        if (parent2) parentsText += parent2;
    }
    document.getElementById("character-parents").textContent = parentsText;
    
    // Set aliases (if any)
    const aliasesSection = document.getElementById("aliases-section");
    if (character.aliases && character.aliases.length > 0) {
        document.getElementById("character-aliases").textContent = character.aliases.join(", ");
        aliasesSection.classList.remove("hidden-section");
    } else {
        aliasesSection.classList.add("hidden-section");
    }
    
    // Set description (if any)
    const descriptionSection = document.getElementById("description-section");
    if (character.description) {
        document.getElementById("character-description").textContent = character.description;
        descriptionSection.classList.remove("hidden-section");
    } else {
        descriptionSection.classList.add("hidden-section");
    }
    
    // Set portrait
    const portraitImg = document.getElementById("character-portrait");
    portraitImg.src = character.portrait || "assets/images/unknown.png";
    
    // Show the modal
    document.querySelector(".character-modal").classList.add("active");
    
    // Set up highlight lineage button
    document.querySelector(".highlight-lineage").onclick = () => {
        highlightLineage(character);
    };
}

/**
 * Find a character's name by ID or full name
 */
function findCharacterName(idOrName) {
    // Check if it's an ID
    const character = familyData.find(c => c.id === idOrName);
    
    if (character) {
        return character.displayName;
    }
    
    // If not found by ID, it might be a full name
    return idOrName;
}

/**
 * Highlight a character's lineage (ancestors and descendants)
 */
function highlightLineage(character) {
    // Clear any previous highlighting
    clearHighlighting();
    
    // Find all ancestors and descendants
    const lineage = new Set();
    lineage.add(character.id);
    
    // Find ancestors
    findAncestors(character, lineage);
    
    // Find descendants
    findDescendants(character, lineage);
    
    // Apply highlighting to nodes
    nodesGroup.selectAll(".tree-node")
        .classed("highlighted-node", d => lineage.has(d.id))
        .classed("dimmed-node", d => !lineage.has(d.id));
    
    // Apply highlighting to links
    linksGroup.selectAll(".link-path")
        .classed("highlighted-link", d => 
            (lineage.has(d.source.id) && lineage.has(d.target.id)))
        .classed("dimmed-link", d => 
            !(lineage.has(d.source.id) && lineage.has(d.target.id)));
}

/**
 * Find all ancestors of a character
 */
function findAncestors(character, lineage) {
    if (character.parent_1) {
        const parent1 = familyData.find(c => c.id === mapParentName(character.parent_1));
        if (parent1) {
            lineage.add(parent1.id);
            findAncestors(parent1, lineage);
        }
    }
    
    if (character.parent_2) {
        const parent2 = familyData.find(c => c.id === mapParentName(character.parent_2));
        if (parent2) {
            lineage.add(parent2.id);
            findAncestors(parent2, lineage);
        }
    }
}

/**
 * Find all descendants of a character
 */
function findDescendants(character, lineage) {
    character.children.forEach(child => {
        lineage.add(child.id);
        findDescendants(child, lineage);
    });
}

/**
 * Clear all highlighting
 */
function clearHighlighting() {
    nodesGroup.selectAll(".tree-node")
        .classed("highlighted-node", false)
        .classed("dimmed-node", false);
    
    linksGroup.selectAll(".link-path")
        .classed("highlighted-link", false)
        .classed("dimmed-link", false);
}

/**
 * Initialize the UI elements
 */
function initUI() {
    // Close modal button
    document.querySelector(".close-modal").addEventListener("click", () => {
        document.querySelector(".character-modal").classList.remove("active");
    });
    
    // House filters
    initHouseFilters();
    
    // Search functionality
    initSearch();
}

/**
 * Initialize house filter checkboxes
 */
function initHouseFilters() {
    // Get all house checkboxes
    const houseCheckboxes = document.querySelectorAll(".house-checkbox");
    
    // Special handling for "All Houses" checkbox
    const allHousesCheckbox = document.getElementById("filter-all");
    
    allHousesCheckbox.addEventListener("change", function() {
        if (this.checked) {
            // Check all house checkboxes
            houseCheckboxes.forEach(checkbox => {
                if (checkbox.id !== "filter-all") {
                    checkbox.checked = true;
                }
            });
        }
        
        // Apply filters
        applyHouseFilters();
    });
    
    // Individual house checkboxes
    houseCheckboxes.forEach(checkbox => {
        if (checkbox.id !== "filter-all") {
            checkbox.addEventListener("change", function() {
                // If any individual house is unchecked, uncheck "All Houses"
                if (!this.checked) {
                    allHousesCheckbox.checked = false;
                }
                
                // If all individual houses are checked, check "All Houses"
                let allChecked = true;
                houseCheckboxes.forEach(cb => {
                    if (cb.id !== "filter-all" && !cb.checked) {
                        allChecked = false;
                    }
                });
                
                if (allChecked) {
                    allHousesCheckbox.checked = true;
                }
                
                // Apply filters
                applyHouseFilters();
            });
        }
    });
}

/**
 * Apply house filters to the visualization
 */
function applyHouseFilters() {
    // Get selected houses
    const selectedHouses = Array.from(document.querySelectorAll(".house-checkbox:checked"))
        .map(checkbox => checkbox.id.replace("filter-", ""))
        .filter(house => house !== "all");
    
    // Filter nodes
    nodesGroup.selectAll(".tree-node")
        .style("display", d => {
            const mainHouse = d.main_house.toLowerCase();
            const secHouse = d.secondary_house ? d.secondary_house.toLowerCase() : null;
            
            // Show if either main or secondary house is selected
            return (selectedHouses.includes(mainHouse) || 
                    (secHouse && selectedHouses.includes(secHouse))) ? 
                    "block" : "none";
        });
    
    // Filter labels
    nodesGroup.selectAll(".node-name")
        .style("display", d => {
            const mainHouse = d.main_house.toLowerCase();
            const secHouse = d.secondary_house ? d.secondary_house.toLowerCase() : null;
            
            return (selectedHouses.includes(mainHouse) || 
                    (secHouse && selectedHouses.includes(secHouse))) ? 
                    "block" : "none";
        });
    
    // Filter links
    linksGroup.selectAll(".link-path")
        .style("display", d => {
            const sourceMainHouse = d.source.main_house.toLowerCase();
            const sourceSecHouse = d.source.secondary_house ? 
                                  d.source.secondary_house.toLowerCase() : null;
            const targetMainHouse = d.target.main_house.toLowerCase();
            const targetSecHouse = d.target.secondary_house ? 
                                  d.target.secondary_house.toLowerCase() : null;
            
            // Show if both source and target have at least one selected house
            const sourceVisible = selectedHouses.includes(sourceMainHouse) || 
                                (sourceSecHouse && selectedHouses.includes(sourceSecHouse));
                                
            const targetVisible = selectedHouses.includes(targetMainHouse) || 
                                (targetSecHouse && selectedHouses.includes(targetSecHouse));
            
            return (sourceVisible && targetVisible) ? "block" : "none";
        });
}

/**
 * Initialize search functionality
 */
function initSearch() {
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const searchResults = document.getElementById("search-results");
    
    // Search button click
    searchButton.addEventListener("click", performSearch);
    
    // Enter key in search input
    searchInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            performSearch();
        }
    });
    
    // Real-time search as user types
    searchInput.addEventListener("input", function() {
        if (this.value.length >= 2) {
            performSearch();
        } else if (this.value.length === 0) {
            // Clear results if search is empty
            searchResults.innerHTML = "";
            searchResults.classList.remove("active");
        }
    });
    
    /**
     * Perform search based on current input
     */
    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        
        if (query.length === 0) {
            searchResults.innerHTML = "";
            searchResults.classList.remove("active");
            return;
        }
        
        // Find matching characters
        const matches = familyData.filter(character => {
            const name = character.name.toLowerCase();
            return name.includes(query);
        });
        
        // Display results
        if (matches.length > 0) {
            let resultsHTML = "";
            
            matches.forEach(character => {
                const houseName = character.main_house.toLowerCase();
                resultsHTML += `
                    <div class="search-result-item" data-id="${character.id}">
                        <span class="result-dot house-${houseName}-node"></span>
                        <span>${character.displayName}</span>
                    </div>
                `;
            });
            
            searchResults.innerHTML = resultsHTML;
            searchResults.classList.add("active");
            
            // Add click handlers
            document.querySelectorAll(".search-result-item").forEach(item => {
                item.addEventListener("click", function() {
                    const id = this.getAttribute("data-id");
                    const character = familyData.find(c => c.id === id);
                    
                    if (character) {
                        // Center view on this character
                        centerOnCharacter(character);
                        
                        // Show details
                        showCharacterDetails(character);
                        
                        // Highlight lineage
                        highlightLineage(character);
                    }
                });
            });
        } else {
            searchResults.innerHTML = "<div class='no-results'>No characters found</div>";
            searchResults.classList.add("active");
        }
    }
}

/**
 * Center the view on a specific character
 */
function centerOnCharacter(character) {
    // Get the actual SVG dimensions
    const svgElement = document.getElementById("family-tree-svg");
    const svgWidth = svgElement.clientWidth;
    const svgHeight = svgElement.clientHeight;
    
    // Calculate scale (keep current or use default)
    const scale = currentTransform ? currentTransform.k : 0.7;
    
    // Center on the character
    const centerX = svgWidth / 2 - character.x * scale;
    const centerY = svgHeight / 2 - character.y * scale;
    
    svg.transition()
        .duration(750)
        .call(
            zoom.transform,
            d3.zoomIdentity
                .translate(centerX, centerY)
                .scale(scale)
        );
}

// Initialize SVG and groups
const svg = d3.select("#family-tree-svg");
const g = svg.append("g");
const linksGroup = g.append("g").attr("class", "links");
const nodesGroup = g.append("g").attr("class", "nodes");

// Call the function when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadFamilyData();
});