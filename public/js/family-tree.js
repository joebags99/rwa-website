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
        const svgWidth = svgElement.clientWidth || 800; // Add fallback value
        const svgHeight = svgElement.clientHeight || 600; // Add fallback value
        
        // Check if we have valid nodes
        if (!treeNodes || treeNodes.length === 0) {
            console.warn("No tree nodes available for reset view");
            return;
        }
        
        // Calculate the bounds of all nodes to determine the tree's extent
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let hasValidCoordinates = false;
        
        // Find the boundaries of all nodes
        treeNodes.forEach(node => {
            // Skip nodes with invalid coordinates
            if (typeof node.x !== 'number' || typeof node.y !== 'number' || 
                isNaN(node.x) || isNaN(node.y)) {
                return;
            }
            
            hasValidCoordinates = true;
            const nodeWidth = 180;
            const nodeHeight = 40;
            
            minX = Math.min(minX, node.x - nodeWidth/2);
            maxX = Math.max(maxX, node.x + nodeWidth/2);
            minY = Math.min(minY, node.y - nodeHeight/2);
            maxY = Math.max(maxY, node.y + nodeHeight/2);
        });
        
        // Exit if no valid coordinates were found
        if (!hasValidCoordinates) {
            console.warn("No nodes with valid coordinates found");
            return;
        }
        
        // Add padding
        const padding = 50;
        minX -= padding;
        maxX += padding;
        minY -= padding;
        maxY += padding;
        
        // Calculate tree dimensions
        const treeWidth = maxX - minX;
        const treeHeight = maxY - minY;
        
        // Avoid division by zero
        if (treeWidth <= 0 || treeHeight <= 0) {
            console.warn("Invalid tree dimensions", { treeWidth, treeHeight });
            return;
        }
        
        // Calculate scale to fit the tree
        const scaleX = svgWidth / treeWidth;
        const scaleY = svgHeight / treeHeight;
        const scale = Math.min(scaleX, scaleY, 1.0) * 0.9; // Use 90% of available space
        
        // Calculate translation to center the tree
        const centerX = (svgWidth / scale - treeWidth) / 2 - minX;
        const centerY = (svgHeight / scale - treeHeight) / 2 - minY;
        
        // Final validation of transform values
        if (isNaN(centerX) || isNaN(centerY) || isNaN(scale) || scale <= 0) {
            console.error("Invalid transform values:", { centerX, centerY, scale });
            return;
        }
        
        // Debug output
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
    }, 500); // Increased delay to ensure DOM is updated
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

function applyFixedPositions(characterMap) {
    // Define explicit positions for important characters
    const fixedPositions = {
        // Talon and his family
        "F013": { x: 1000, y: 350 },                // Talon Falkrest (central)
        "F011": { x: 800, y: 350 },                 // Zara Callista (partner 1)
        "A002": { x: 600, y: 350 },                 // Kasya Astralor (partner 2)
        "F012": { x: 1200, y: 350 },                // Senua Oldblood (partner 3)
        "V002": { x: 1400, y: 350 },                // Sharn Veltaris (partner 4)
        "F015": { x: 1600, y: 350 },                // Circe Alysides (partner 5)
        
        // Talon's children - positioned under respective parents
        "F016": { x: 600, y: 450 },                 // Xanthe (child of Kasya)
        "F017": { x: 800, y: 450 },                 // Edwinn (child of Zara)
        "F018": { x: 1200, y: 450 },                // Cailynn (child of Senua)
        "F019": { x: 1400, y: 450 },                // Marik (child of Sharn)
        "F020": { x: 1600, y: 450 },                // Octavia (child of Circe)
        
        // Edemere and his family (separate branch)
        "F010": { x: 400, y: 350 },                 // Edemere
        "E001": { x: 200, y: 350 },                 // Gwendolyn Eldran (partner)
        
        // Edemere's children
        "F021": { x: 200, y: 450 },                 // Dorian
        "F022": { x: 270, y: 450 },                 // Perrin
        "F023": { x: 340, y: 450 },                 // Alayna
        "F024": { x: 410, y: 450 },                 // Lysenne
        
        // Other important characters
        "F014": { x: 100, y: 350 },                 // Raynere (separate)
        "E002": { x: 1800, y: 350 },                // Alarice Eldran (separate)
    };
    
    // Apply fixed positions
    Object.entries(fixedPositions).forEach(([id, position]) => {
        const character = characterMap.get(id);
        if (character) {
            character.x = position.x;
            character.y = position.y;
            character.hasFixedPosition = true; // Mark as having fixed position
        }
    });
    
    // Let the automatic algorithm position the rest but respect fixed positions
    return characterMap;
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
 * Enhanced positioning algorithm that sorts all nodes more effectively
 * Replace the existing positionNodesImproved function with this version
 */
function positionNodesImproved(rootNodes, characterMap) {
    // First apply fixed positions to important characters
    applyFixedPositions(characterMap);
    
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
    
    // For each generation, sort and position characters
    let maxGeneration = 0;
    generationGroups.forEach((characters, gen) => {
        maxGeneration = Math.max(maxGeneration, gen);
        
        // Skip characters with fixed positions
        const flexibleCharacters = characters.filter(c => !c.hasFixedPosition);
        
        // Group characters by house for better organization
        const houseGroups = {};
        flexibleCharacters.forEach(character => {
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
    
    // Adjust positions for marriages/partnerships that don't have fixed positions
    adjustFreePartnerships(characterMap);
    
    // Final pass: adjust position of nodes to prevent overlapping
    // Skip fixed nodes in overlap prevention
    preventNodeOverlap(generationGroups);
    
    // Create nodes and links arrays
    createNodesAndLinks(characterMap);
}

function adjustFreePartnerships(characterMap) {
    // Identify all partnerships
    const partnerships = [];
    characterMap.forEach(character => {
        if (character.partners && character.partners.length > 0) {
            character.partners.forEach(partnerId => {
                // Skip if either partner has fixed position
                const partner = characterMap.get(partnerId);
                if (!partner || character.hasFixedPosition || partner.hasFixedPosition) {
                    return;
                }
                
                // Avoid duplicates by only processing partnerships where this character has smaller ID
                if (character.id < partnerId) {
                    partnerships.push({
                        person1: character,
                        person2: partner
                    });
                }
            });
        }
    });
    
    // Position non-fixed partners next to each other
    partnerships.forEach(partnership => {
        const { person1, person2 } = partnership;
        
        // Calculate average position of both partners
        const avgX = (person1.x + person2.x) / 2;
        
        // Reposition both partners - with wider spacing for rectangles
        person1.x = avgX - 120; // Increased spacing for rectangles
        person2.x = avgX + 120;
    });
}


/**
 * Identify family groups within a generation
 * A family group is a character and all their partners
 */
function identifyFamilyGroups(characters) {
    const familyGroups = [];
    const assignedToGroup = new Set();
    
    // First, identify primary characters (those with the most partners)
    // This helps put characters with multiple marriages at the center of their groups
    characters.sort((a, b) => {
        const aPartners = a.partners ? a.partners.length : 0;
        const bPartners = b.partners ? b.partners.length : 0;
        return bPartners - aPartners; // Sort by number of partners descending
    });
    
    // Create family groups around primary characters
    characters.forEach(character => {
        if (assignedToGroup.has(character.id)) return;
        
        const group = {
            primary: character,
            members: [character],
            housePriority: getHousePriority(character.main_house)
        };
        
        // Add all partners to the group
        if (character.partners) {
            character.partners.forEach(partnerId => {
                const partner = characters.find(c => c.id === partnerId);
                if (partner && !assignedToGroup.has(partnerId)) {
                    group.members.push(partner);
                    assignedToGroup.add(partnerId);
                }
            });
        }
        
        assignedToGroup.add(character.id);
        familyGroups.push(group);
    });
    
    // Sort family groups by house priority (Falkrest first, then others)
    familyGroups.sort((a, b) => a.housePriority - b.housePriority);
    
    return familyGroups;
}

/**
 * Get priority for a house (for sorting)
 * Lower numbers = higher priority
 */
function getHousePriority(house) {
    const housePriorities = {
        'Falkrest': 1,
        'Veltaris': 2,
        'Astralor': 3,
        'Eldran': 4,
        'Draven': 5,
        'Thornefield': 6,
        'Emberlyn': 7,
        'Foreign': 8,
        'Minor House': 9
    };
    
    return housePriorities[house] || 10;
}

/**
 * Position family groups horizontally across the generation
 */
function positionFamilyGroups(familyGroups, generation) {
    let currentX = 100; // Starting position
    
    familyGroups.forEach(group => {
        const primaryX = currentX + (group.members.length * 200) / 2;
        
        // Position primary character in center of group
        group.primary.x = primaryX;
        group.primary.y = 100 + generation * 200; // Vertical position based on generation
        
        // Position partners on either side of primary
        if (group.members.length > 1) {
            let leftOffset = -200;
            let rightOffset = 200;
            
            // Sort partners by birth year if available
            const partners = group.members.filter(m => m !== group.primary)
                .sort((a, b) => (a.birth_year || 0) - (b.birth_year || 0));
            
            partners.forEach((partner, index) => {
                if (index % 2 === 0) {
                    // Position on right
                    partner.x = primaryX + rightOffset;
                    rightOffset += 200;
                } else {
                    // Position on left
                    partner.x = primaryX + leftOffset;
                    leftOffset -= 200;
                }
                
                partner.y = group.primary.y; // Same vertical position as primary
            });
        }
        
        // Update currentX for next group
        const groupWidth = Math.max(group.members.length * 220, 300);
        currentX += groupWidth;
    });
}

/**
 * Ensure partners are properly aligned side by side
 */
function alignPartnerships(characterMap) {
    // Find all partnerships
    const partnerships = [];
    
    characterMap.forEach(character => {
        if (character.partners && character.partners.length > 0) {
            character.partners.forEach(partnerId => {
                const partner = characterMap.get(partnerId);
                
                // Only process each partnership once
                if (partner && character.id < partnerId) {
                    partnerships.push({
                        person1: character,
                        person2: partner
                    });
                }
            });
        }
    });
    
    // Process partnerships in order of "importance" (by house priority)
    partnerships.sort((a, b) => {
        const aHousePriority = Math.min(
            getHousePriority(a.person1.main_house),
            getHousePriority(a.person2.main_house)
        );
        const bHousePriority = Math.min(
            getHousePriority(b.person1.main_house),
            getHousePriority(b.person2.main_house)
        );
        return aHousePriority - bHousePriority;
    });
    
    // Position partners side by side with appropriate spacing
    partnerships.forEach(partnership => {
        const { person1, person2 } = partnership;
        
        // If either person has multiple partners, use special handling
        if ((person1.partners && person1.partners.length > 1) || 
            (person2.partners && person2.partners.length > 1)) {
            
            // Special case: Talon Falkrest (who has 5 partners)
            if (person1.id === "F013" || person2.id === "F013") {
                const talon = person1.id === "F013" ? person1 : person2;
                const partner = person1.id === "F013" ? person2 : person1;
                
                // Don't adjust Talon's position, just arrange partners around him
                // Logic for positioning Talon's partners here...
                // This will depend on birth years or other criteria
            }
            
            // For other cases with multiple partners
            // Keep existing positions, will be handled in positionChildren
            
        } else {
            // Simple case: just two partners
            // Position them close to each other
            const avgX = (person1.x + person2.x) / 2;
            person1.x = avgX - 120;
            person2.x = avgX + 120;
        }
    });
    
    // Special handling for Talon Falkrest's family
    const talon = characterMap.get("F013");
    if (talon && talon.partners && talon.partners.length > 0) {
        // Define ideal partner order and positions
        const partnerPositions = [
            { id: "F011", name: "Zara Callista", offset: -400 },
            { id: "A002", name: "Kasya Astralor", offset: -200 },
            { id: "F012", name: "Senua Oldblood", offset: 200 },
            { id: "V002", name: "Sharn Veltaris", offset: 400 },
            { id: "F015", name: "Circe Alysides", offset: 600 }
        ];
        
        // Apply positions
        partnerPositions.forEach(partnerInfo => {
            const partner = characterMap.get(partnerInfo.id);
            if (partner) {
                partner.x = talon.x + partnerInfo.offset;
                partner.y = talon.y;
            }
        });
    }
}

/**
 * Position children in relation to their parents
 */
function positionChildren(characterMap) {
    // Get all characters with children
    const parentsWithChildren = Array.from(characterMap.values())
        .filter(character => character.children && character.children.length > 0);
    
    // Special characters who should be processed first (e.g., Talon)
    const priorityCharacters = ["F013", "F014"];
    
    // Sort parents by priority, then by children count
    parentsWithChildren.sort((a, b) => {
        const aPriority = priorityCharacters.indexOf(a.id);
        const bPriority = priorityCharacters.indexOf(b.id);
        
        // Sort by priority first
        if (aPriority !== -1 && bPriority === -1) return -1;
        if (aPriority === -1 && bPriority !== -1) return 1;
        if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
        
        // Then by children count
        return b.children.length - a.children.length;
    });
    
    // Process each parent
    parentsWithChildren.forEach(parent => {
        // Skip characters whose children might have already been positioned
        if (parent.childrenPositioned) return;
        
        parent.children.forEach(child => {
            // Find other parent if available
            let otherParent = null;
            if (child.parent_1 && child.parent_2) {
                const otherParentId = child.parent_1 === parent.id ? child.parent_2 : child.parent_1;
                otherParent = characterMap.get(otherParentId);
            }
            
            if (otherParent) {
                // Position child between both parents
                child.x = (parent.x + otherParent.x) / 2;
                
                // Mark otherParent as having positioned children
                otherParent.childrenPositioned = true;
            } else {
                // No other parent or not found, position below this parent
                child.x = parent.x;
            }
        });
    });
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

        // Add family identifiers to nodes
nodesGroup.selectAll(".node-group")
.classed("talon-family-node", d => isTalonFamily(d))
.classed("edemere-family-node", d => isEdemereFamily(d));

// Add family identifiers to links
linksGroup.selectAll(".link-path")
.classed("talon-family-link", d => isTalonFamily(d.source) && isTalonFamily(d.target))
.classed("edemere-family-link", d => isEdemereFamily(d.source) && isEdemereFamily(d.target));

        // Optional: Add background regions for family groups
        const familyGroups = [
        {
            id: "talon-family",
            x: 550, // Left position
            y: 325, // Top position 
            width: 1100, // Width to encompass Talon and all partners
            height: 150, // Height
            className: "family-group-region talon-family-region"
        },
        {
            id: "edemere-family",
            x: 150, // Left position
            y: 325, // Top position
            width: 350, // Width for Edemere and partner
            height: 150, // Height
            className: "family-group-region edemere-family-region"
        }
        ];

        // Add the background regions to the SVG before the nodes and links
        const groupsLayer = g.insert("g", ":first-child")
        .attr("class", "family-groups-layer");

        groupsLayer.selectAll(".family-group-region")
        .data(familyGroups)
        .enter()
        .append("rect")
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("width", d => d.width)
        .attr("height", d => d.height)
        .attr("class", d => d.className);

        /**
        * Helper functions to determine family membership
        */
        function isTalonFamily(character) {
        // Talon's ID plus his partners and children
        const talonFamilyIds = [
            "F013", // Talon
            "F011", "A002", "F012", "V002", "F015", // Partners
            "F016", "F017", "F018", "F019", "F020" // Children
        ];
        return talonFamilyIds.includes(character.id);
        }

        function isEdemereFamily(character) {
        // Edemere's ID plus his partner and children
        const edemereFamilyIds = [
            "F010", // Edemere
            "E001", // Partner
            "F021", "F022", "F023", "F024" // Children
        ];
        return edemereFamilyIds.includes(character.id);
        }
    
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
    
        // Initialize zoom behavior
        initZoomBehavior();
            
        // Delay the reset view to ensure nodes are properly positioned
        setTimeout(() => {
            // Check if we have valid nodes with positions before attempting to reset view
            if (treeNodes && treeNodes.length > 0 && 
                treeNodes.some(node => typeof node.x === 'number' && typeof node.y === 'number' && 
                                !isNaN(node.x) && !isNaN(node.y))) {
                resetView();
            } else {
                console.warn("Cannot reset view - nodes don't have valid coordinates yet");
            }
        }, 1000); // Longer delay
        }

/**
 * Generate paths for links with improved routing to avoid crossing
 */
function linkPathGenerator(d) {
    const nodeHeight = 40;

    // Explicitly check if this is a link between Talon and partners
    const isTalonPartnership = 
        (d.source.id === "F013" || d.target.id === "F013") && 
        d.type === 'marriage';
    
    // Explicitly check if this is a link between Edemere and partners
    const isEdemerePartnership = 
        (d.source.id === "F010" || d.target.id === "F010") && 
        d.type === 'marriage';
    
    // Handle marriage links with different styles
    if (d.type === 'marriage') {
        if (isTalonPartnership) {
            // Talon partnerships get a different color in CSS
            return `M${d.source.x + 90},${d.source.y} L${d.target.x - 90},${d.target.y}`;
        } 
        else if (isEdemerePartnership) {
            // Edemere partnerships get another color in CSS
            return `M${d.source.x + 90},${d.source.y} L${d.target.x - 90},${d.target.y}`;
        }
        else {
            // Normal marriages
            return `M${d.source.x + 90},${d.source.y} L${d.target.x - 90},${d.target.y}`;
        }
    } 
    else if (d.type === 'betrothal') {
        // Curved betrothal line
        const midX = (d.source.x + d.target.x) / 2;
        const midY = d.source.y - 30; // Curve upward
        
        return `M${d.source.x},${d.source.y - 20} Q${midX},${midY} ${d.target.x},${d.target.y - 20}`;
    } 
    else if (d.type === 'parent') {
        // Check if this is Talon's child
        const isTalonChild = 
            d.source.id === "F013" || 
            (d.target.parent_1 === "F013" || d.target.parent_2 === "F013");
            
        // Check if this is Edemere's child
        const isEdemereChild = 
            d.source.id === "F010" || 
            (d.target.parent_1 === "F010" || d.target.parent_2 === "F010");
        
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
                return `M${d.source.x},${d.source.y + 20}` + 
                       `V${parentY + 40}` + // Go down from parent bottom
                       `H${midX}` + // Move horizontally to midpoint between parents
                       `V${d.target.y - 25}` + // Go down to just above child
                       `H${d.target.x}` + // Move horizontally to child's x position
                       `V${d.target.y - 20}`; // Connect to top of child
            }
        }
        
        // Simple case with improved spacing - from bottom of parent to top of child
        return `M${d.source.x},${d.source.y + 20}` + // Start from bottom of parent
               `V${d.source.y + 40}` + // Go down a bit
               `H${d.target.x}` + // Move horizontally to child's position
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
    
    // Default portrait path matching the one in HTML
    const defaultPortrait = "assets/images/unknown.png";
    
    if (character.portrait) {
        // Process the portrait path
        let portraitPath = character.portrait;
        
        // Remove leading slash if exists
        if (portraitPath.startsWith('/')) {
            portraitPath = portraitPath.substring(1);
        }
        
        // Add assets/ prefix if needed
        if (!portraitPath.startsWith('assets/')) {
            portraitPath = `assets/${portraitPath}`;
        }
        
        // Set the image source
        portraitImg.src = portraitPath;
        
        // Add error handler
        portraitImg.onerror = function() {
            console.warn(`Failed to load portrait for ${character.name}: ${portraitPath}`);
            this.src = defaultPortrait;
        };
    } else {
        // No portrait specified, use default
        portraitImg.src = defaultPortrait;
    }
    
    // Show the modal
    document.querySelector(".character-modal").classList.add("active");
    
    // Set up highlight lineage button
    document.querySelector(".highlight-lineage").onclick = () => {
        highlightLineage(character);
    };

        // Debugging image loading
    console.log("Setting portrait image:", portraitPath);
    portraitImg.onload = function() {
        console.log(`Successfully loaded portrait for ${character.name}`);
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
    if (!character || typeof character.x !== 'number' || typeof character.y !== 'number' || 
        isNaN(character.x) || isNaN(character.y)) {
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
    
    // Validate transform values
    if (isNaN(centerX) || isNaN(centerY) || isNaN(scale) || scale <= 0) {
        console.error("Invalid transform values:", { centerX, centerY, scale });
        return;
    }
    
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