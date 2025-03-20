// Enhanced Family Tree Visualization 
// This updated version improves the layout algorithm and node presentation

// Global variables
let familyData = [];
let zoom;
let treeNodes = [];
let treeLinks = [];

// Configuration constants - INCREASED SPACING VALUES
const siblingSpacing = 180;     // Increased from 100 to 180
const generationSpacing = 200;  // Increased from 120 to 200
const marriageWidth = 100;      // Increased from 60 to 100
const nodeRadius = 25;          // Node size for containing names

// SVG dimensions and margins
const width = 2000;             // Increased from 1000 to 2000
const height = 1600;            // Increased from 800 to 1600
const margin = {  
    top: 100,
    right: 100,
    bottom: 100,
    left: 100
};

// Track current transform for zoom/pan
let currentTransform = null;

// Create tooltip
const tooltip = createTooltip();

// For tracking the currently highlighted character
let highlightedCharacter = null;

/**
 * Format a character's display name
 */
function formatName(character) {
    // Create shorter display name to fit in node
    const fullName = character.name;
    const nameParts = fullName.split(' ');
    
    // If name is too long, use first name and last initial
    if (fullName.length > 15 && nameParts.length > 1) {
        return `${nameParts[0]} ${nameParts[nameParts.length-1].charAt(0)}.`;
    }
    
    return fullName;
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
    
    // Now position the nodes with improved algorithm
    positionNodesImproved(rootNodes, characterMap);
}

/**
 * Initialize the D3 zoom behavior
 */
function initZoomBehavior() {
    zoom = d3.zoom()
        .scaleExtent([0.1, 3])
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
    // Wait a moment to ensure all nodes are fully loaded
    setTimeout(() => {
        // Get the actual SVG dimensions
        const svgElement = document.getElementById("family-tree-svg");
        const svgWidth = svgElement.clientWidth;
        const svgHeight = svgElement.clientHeight;
        
        // Calculate the bounds of all nodes to determine the tree's extent
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        
        // Find the boundaries of all nodes
        treeNodes.forEach(node => {
            // For rectangular nodes, account for width
            const nodeWidth = 180;
            const nodeHeight = 40;
            
            minX = Math.min(minX, node.x - nodeWidth/2);
            maxX = Math.max(maxX, node.x + nodeWidth/2);
            minY = Math.min(minY, node.y - nodeHeight/2);
            maxY = Math.max(maxY, node.y + nodeHeight/2);
        });
        
        // Add padding
        const padding = 50;
        minX -= padding;
        maxX += padding;
        minY -= padding;
        maxY += padding;
        
        // Calculate tree dimensions
        const treeWidth = maxX - minX;
        const treeHeight = maxY - minY;
        
        // Calculate scale to fit the tree
        const scaleX = svgWidth / treeWidth;
        const scaleY = svgHeight / treeHeight;
        const scale = Math.min(scaleX, scaleY, 1.0) * 0.9; // Use 90% of available space
        
        // Calculate translation to center the tree
        const centerX = (svgWidth / scale - treeWidth) / 2 - minX;
        const centerY = (svgHeight / scale - treeHeight) / 2 - minY;
        
        // Debug output - can be removed in production
        console.log("Tree dimensions:", { minX, maxX, minY, maxY, treeWidth, treeHeight });
        console.log("View parameters:", { svgWidth, svgHeight, scale, centerX, centerY });
        
        // Apply the transformation with a smooth transition
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
    }, 100); // Small delay to ensure DOM is updated
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
 * Improved position nodes function with better layout
 */
function positionNodesImproved(rootNodes, characterMap) {
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
    
    // Group characters by generation and house
    const generationGroups = new Map();
    generations.forEach((gen, id) => {
        if (!generationGroups.has(gen)) {
            generationGroups.set(gen, []);
        }
        generationGroups.get(gen).push(characterMap.get(id));
    });
    
    // For each generation, sort and position characters
    let maxGeneration = 0;
    generationGroups.forEach((characters, gen) => {
        maxGeneration = Math.max(maxGeneration, gen);
        
        // Group characters by house for better organization
        const houseGroups = {};
        characters.forEach(character => {
            const house = character.main_house;
            if (!houseGroups[house]) {
                houseGroups[house] = [];
            }
            houseGroups[house].push(character);
        });
        
        // Position each house group with appropriate spacing
        let currentX = 100; // Starting X position
        Object.entries(houseGroups).forEach(([house, houseMembers]) => {
            // Sort members within house by id for consistency
            houseMembers.sort((a, b) => a.id.localeCompare(b.id));
            
            // Position each member
            houseMembers.forEach((character, index) => {
                character.x = currentX + index * siblingSpacing;
                character.y = 100 + gen * generationSpacing;
            });
            
            // Update current X for next house group with padding
            currentX += houseMembers.length * siblingSpacing + 100; // Add extra padding between houses
        });
    });
    
    // Calculate the total width needed
    let totalWidth = 0;
    generationGroups.forEach(characters => {
        if (characters.length > 0) {
            const lastChar = characters[characters.length - 1];
            totalWidth = Math.max(totalWidth, lastChar.x + 100);
        }
    });
    
    // Now adjust positions for marriages/partnerships
    adjustMarriagePositions(characterMap);
    
    // Final pass: adjust position of nodes to prevent overlapping
    preventNodeOverlap(generationGroups);
    
    // Create nodes and links arrays
    createNodesAndLinks(characterMap);
}

/**
 * Prevent node overlap by adjusting positions
 */
function preventNodeOverlap(generationGroups) {
    generationGroups.forEach(characters => {
        // Sort by X position
        characters.sort((a, b) => a.x - b.x);
        
        // Check for overlaps and adjust
        for (let i = 1; i < characters.length; i++) {
            const prevChar = characters[i-1];
            const currChar = characters[i];
            
            // Minimum distance needed for rectangles - larger than for circles
            const minDistance = 200; // Wider spacing for rectangles
            
            if (currChar.x - prevChar.x < minDistance) {
                // Shift current character to the right
                currChar.x = prevChar.x + minDistance;
                
                // Propagate the shift to all characters to the right
                for (let j = i + 1; j < characters.length; j++) {
                    characters[j].x += (minDistance - (currChar.x - prevChar.x));
                }
            }
        }
    });
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
        
        // Reposition both partners - with wider spacing for rectangles
        person1.x = avgX - 120; // Increased spacing for rectangles
        person2.x = avgX + 120;
        
        // If they have common children, adjust those too
        if (commonChildren.length > 0) {
            const childrenWidth = (commonChildren.length - 1) * 200; // Increased spacing for child rectangles
            const startX = avgX - childrenWidth / 2;
            
            commonChildren.forEach((child, index) => {
                child.x = startX + index * 200;
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
    // Create SVG defs for gradients first
    const defs = svg.append("defs");

    // Create a diagonal gradient for mixed-house nodes
    defs.append("linearGradient")
        .attr("id", "mixed-house-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .selectAll("stop")
        .data([
            {offset: "0%", color: "var(--royal-gold-light, #F8E39C)"},
            {offset: "100%", color: "var(--royal-gold, #D4AF37)"}
        ])
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);
    
    // Create links
    const links = linksGroup.selectAll(".link-path")
        .data(treeLinks)
        .enter().append("path")
        .attr("class", link => `link-path ${link.type}-path`)
        .attr("d", linkPathGenerator)
        .attr("stroke-width", 2);
    
    // Create node groups with rectangular nodes
    const nodeGroups = nodesGroup.selectAll(".node-group")
        .data(treeNodes)
        .enter().append("g")
        .attr("class", "node-group")
        .attr("transform", d => `translate(${d.x}, ${d.y})`)
        .on("click", handleNodeClick)
        .on("mouseover", handleNodeMouseOver)
        .on("mouseout", handleNodeMouseOut);
    
    // Add rectangular nodes
    nodeGroups.append("rect")
        .attr("class", d => getNodeClass(d))
        .attr("width", 180)
        .attr("height", 40)
        .attr("x", -90) // Center horizontally
        .attr("y", -20) // Center vertically
        .attr("rx", 6)  // Rounded corners
        .attr("ry", 6);
    
    // Add the full name labels inside rectangles
    nodeGroups.append("text")
        .attr("class", "node-label")
        .attr("dy", "0.35em") // Adjust text vertical alignment
        .text(d => d.name);
    
    // Initialize zoom behavior BEFORE using it
    initZoomBehavior();
    
    // Don't call resetView immediately - let the timeout handle it
    setTimeout(() => {
        // Check if we have valid nodes with positions before attempting to reset view
        if (treeNodes && treeNodes.length > 0 && 
            typeof treeNodes[0].x === 'number' && 
            typeof treeNodes[0].y === 'number') {
            resetView();
        }
        
        // Add transition class to show the visualization is loaded
        document.querySelector('.tree-visualization').classList.add('fully-loaded');
    }, 500);
}

/**
 * Generate paths for links with improved routing to avoid crossing
 */
function linkPathGenerator(d) {
    const nodeHeight = 40;
    
    if (d.type === 'marriage') {
        // Horizontal marriage line that connects the sides of the rectangles
        return `M${d.source.x + 90},${d.source.y} L${d.target.x - 90},${d.target.y}`;
    } else if (d.type === 'betrothal') {
        // Curved betrothal line
        const midX = (d.source.x + d.target.x) / 2;
        const midY = d.source.y - 30; // Curve upward
        
        return `M${d.source.x},${d.source.y - 20} Q${midX},${midY} ${d.target.x},${d.target.y - 20}`;
    } else if (d.type === 'parent') {
        // Vertical line from parent to child with improved routing
        const hasDefinedParents = d.target.parent_1 && d.target.parent_2;
        
        if (hasDefinedParents) {
            // Find the average x position of the parents
            const parent1 = treeNodes.find(node => node.id === d.target.parent_1);
            const parent2 = treeNodes.find(node => node.id === d.target.parent_2);
            
            if (parent1 && parent2) {
                const midX = (parent1.x + parent2.x) / 2;
                const parentY = parent1.y;
                
                // Create a better-spaced path for parents with a common child
                return `M${d.source.x},${d.source.y + 20} ` + 
                       `V${parentY + 40} ` + // Go down from parent bottom
                       `H${midX} ` + // Move horizontally to midpoint between parents
                       `V${d.target.y - 25} ` + // Go down to just above child
                       `H${d.target.x} ` + // Move horizontally to child's x position
                       `V${d.target.y - 20}`; // Connect to top of child
            }
        }
        
        // Simple case with improved spacing - from bottom of parent to top of child
        return `M${d.source.x},${d.source.y + 20} ` + // Start from bottom of parent
               `V${d.source.y + 40} ` + // Go down a bit
               `H${d.target.x} ` + // Move horizontally to child's position
               `V${d.target.y - 20}`; // Connect to top of child
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
 * Enlarged to contain the name text
 */
function getNodeShape(d) {
    // Fixed dimensions for rectangles
    const nodeWidth = 180;
    const nodeHeight = 40;
    
    // Create a rectangle with rounded corners
    return `M${-nodeWidth/2},${-nodeHeight/2}
            h${nodeWidth}
            v${nodeHeight}
            h${-nodeWidth}
            z`;
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
 * Handle node mouse over - show tooltip with additional info
 */
function handleNodeMouseOver(event, d) {
    // Only show tooltip for nodes that aren't the current selection
    if (highlightedCharacter && highlightedCharacter.id === d.id) return;
    
    // Create tooltip content with more detail
    let content = `<strong>${d.name}</strong>`;
    
    // Add title if available
    if (d.title) content += `<br><em>${d.title}</em>`;
    
    // Add life span if available
    if (d.birth_year || d.death_year) {
        content += '<br>';
        if (d.birth_year) content += `${d.birth_year} AR`;
        if (d.birth_year && d.death_year) content += ' - ';
        if (d.death_year) content += `${d.death_year} AR`;
    }
    
    // Add house
    content += `<br>House ${d.main_house}`;
    if (d.secondary_house) content += ` & ${d.secondary_house}`;
    
    // Position and show tooltip
    tooltip
        .html(content)
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
    document.getElementById("character-name").textContent = character.name;
    
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
        return character.name;
    }
    
    // If not found by ID, it might be a full name
    return idOrName;
}

/**
 * Highlight a character's lineage (ancestors and descendants) with improved visibility
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
    
    // Apply highlighting to node groups
    nodesGroup.selectAll(".node-group")
        .classed("highlighted-node", d => lineage.has(d.id))
        .classed("dimmed-node", d => !lineage.has(d.id));
    
    // Apply highlighting to links
    linksGroup.selectAll(".link-path")
        .classed("highlighted-link", d => 
            (lineage.has(d.source.id) && lineage.has(d.target.id)))
        .classed("dimmed-link", d => 
            !(lineage.has(d.source.id) && lineage.has(d.target.id)));
            
    // Center view on selected character
    centerOnCharacter(character);
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
    nodesGroup.selectAll(".node-group")
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
    
    // Filter node groups
    nodesGroup.selectAll(".node-group")
        .style("display", d => {
            const mainHouse = d.main_house.toLowerCase();
            const secHouse = d.secondary_house ? d.secondary_house.toLowerCase() : null;
            
            // Show if either main or secondary house is selected
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
                        <span>${character.name}</span>
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
    // Ensure character has valid coordinates
    if (!character || typeof character.x !== 'number' || typeof character.y !== 'number') {
        console.error("Cannot center on character with invalid coordinates", character);
        return;
    }
    
    // Get the actual SVG dimensions
    const svgElement = document.getElementById("family-tree-svg");
    if (!svgElement) return;
    
    const svgWidth = svgElement.clientWidth || 800;  // Fallback width
    const svgHeight = svgElement.clientHeight || 600;  // Fallback height
    
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
    // Remove the alert that might be causing issues
    loadFamilyData();
});