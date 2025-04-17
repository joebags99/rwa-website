const { Document, Paragraph, Packer } = docx;
const { saveAs } = window.saveAs ? { saveAs: window.saveAs } : window.FileSaver;

/**
 * Roll With Advantage - 4-Pillar World Builder
 * This file contains all the functionality for the world builder tool
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the World Builder tool
    initWorldBuilder();
});

// Initial state structure with all form fields
const initialState = {
    alignmentSquare: '',
    alignmentPosition: { row: null, col: null },
    thesis: '',
    ruleZeroLaws: ['', '', ''],
    touchstones: [
        { name: '', stealing: '' },
        { name: '', stealing: '' }
    ],
    pillars: {
        magic: {
            scale: 3,
            primeLaw: '',
            loopholeMYth: '',
            enforcerAvatar: '',
            everydaySign: '',
            toneTieIn: '',
            conflicts: ['', '', ''],
            barriers: ['', '', ''],
            tierLadder: ['', '', '', ''],
            sensoryMotifs: ['', '', '']
        },
        religion: {
            scale: 3,
            primeLaw: '',
            loopholeMYth: '',
            enforcerAvatar: '',
            everydaySign: '',
            toneTieIn: '',
            conflicts: ['', '', ''],
            barriers: ['', '', ''],
            tierLadder: ['', '', '', ''],
            sensoryMotifs: ['', '', '']
        },
        society: {
            scale: 3,
            primeLaw: '',
            loopholeMYth: '',
            enforcerAvatar: '',
            everydaySign: '',
            toneTieIn: '',
            conflicts: ['', '', ''],
            barriers: ['', '', ''],
            tierLadder: ['', '', '', ''],
            sensoryMotifs: ['', '', '']
        },
        wilds: {
            scale: 3,
            primeLaw: '',
            loopholeMYth: '',
            enforcerAvatar: '',
            everydaySign: '',
            toneTieIn: '',
            conflicts: ['', '', ''],
            barriers: ['', '', ''],
            tierLadder: ['', '', '', ''],
            sensoryMotifs: ['', '', '']
        }
    },
    inverseTwists: {
        roll: 0,
        twists: ''
    }
};

// Alignment grid data
const alignmentGrid = [
    [
        {
            name: "Grim-Bright",
            description: "A hopeful world where people have limited agency. Forces of good are winning but ordinary people struggle to affect change.",
            examples: "Lord of the Rings, Star Wars",
            conflicts: 1,
            barriers: 3
        },
        {
            name: "Neutral-Bright",
            description: "A balanced, optimistic setting where people have moderate agency. Good prevails with effort.",
            examples: "The Legend of Zelda, Harry Potter",
            conflicts: 1,
            barriers: 2
        },
        {
            name: "Noble-Bright",
            description: "An optimistic world where individuals have significant agency. Heroes can readily make a difference.",
            examples: "Marvel Cinematic Universe, The Incredibles",
            conflicts: 1,
            barriers: 1
        }
    ],
    [
        {
            name: "Grim-Neutral",
            description: "A morally balanced world where individual agency is limited. Fate and institutions have more control than individuals.",
            examples: "Game of Thrones, The Witcher",
            conflicts: 2,
            barriers: 3
        },
        {
            name: "Neutral-Neutral",
            description: "A balanced world in both morality and agency. Actions matter but are constrained by realistic limitations.",
            examples: "Dragon Age, The Expanse",
            conflicts: 2,
            barriers: 2
        },
        {
            name: "Noble-Neutral",
            description: "A morally balanced world where individuals have noble agency. People can change the world, for better or worse.",
            examples: "Mass Effect, Avatar: The Last Airbender",
            conflicts: 2,
            barriers: 1
        }
    ],
    [
        {
            name: "Grim-Dark",
            description: "A grim world where individuals have little agency. Darkness is winning and people struggle to resist.",
            examples: "1984, Warhammer 40K, Dark Souls",
            conflicts: 3,
            barriers: 3
        },
        {
            name: "Neutral-Dark",
            description: "A grim world with moderate individual agency. The darkness is strong but can be fought with great effort.",
            examples: "Bloodborne, The Walking Dead",
            conflicts: 3,
            barriers: 2
        },
        {
            name: "Noble-Dark",
            description: "A dark world where individuals have significant agency. The world is grim but protagonists can enact meaningful change.",
            examples: "Blade Runner, Cyberpunk 2077",
            conflicts: 3,
            barriers: 1
        }
    ]
];

// Brain-spark questions for each pillar
const brainsparkQuestions = {
    magic: [
        "Where does power physically pool—ley lines, moons, blood?",
        "What's the cheapest cantrip and the forbidden apex spell?",
        "What mundane profession relies on magic?",
        "What's the public health risk of magic misuse?"
    ],
    religion: [
        "Are gods present, absentee, dead—or on strike?",
        "How does divine power differ from arcane?",
        "What happens to heretics: exile, transformation, or re-education?",
        "Is prayer transactional or karmic?"
    ],
    society: [
        "What's the unit of currency: gold, memories, time, sunlight?",
        "Who legally owns land—nobles, spirits, AI city-cores?",
        "How do the wealthy cheat your Prime Laws?",
        "What social rite marks adulthood?"
    ],
    wilds: [
        "Which creature breaks a core law just by existing?",
        "Where is the cartographer's last blank spot?",
        "What weather pattern is unique to this world?",
        "How do monsters adapt to the Prime Magic Law?"
    ]
};

// Define scales for each pillar
const pillarScales = {
  magic: {
    name: "Arcane Saturation",
    description: "How prevalent and powerful is magic in your world?",
    levels: [
      {
        value: 1,
        name: "Rare Magic",
        description: "Magic is extremely rare, perhaps even considered myth by most people",
        example: "Game of Thrones, specifically Westeros"
      },
      {
        value: 2,
        name: "Limited Magic",
        description: "Magic exists but is uncommon and limited in scope",
        example: "Lord of the Rings, Conan the Barbarian"
      },
      {
        value: 3,
        name: "Moderate Magic",
        description: "Magic is recognized and somewhat common, but not everyday for most people",
        example: "Dungeons & Dragons, Wheel of Time"
      },
      {
        value: 4,
        name: "Abundant Magic",
        description: "Magic is common and shapes many aspects of the world",
        example: "Harry Potter, Eberron campaign setting"
      },
      {
        value: 5,
        name: "Pervasive Magic",
        description: "Magic infuses nearly everything, fundamental to society",
        example: "Avatar: The Last Airbender, Arcane (Runterra), Final Fantasy"
      }
    ]
  },
  religion: {
    name: "Divine Presence",
    description: "How active and manifest are gods and divine forces?",
    levels: [
      {
        value: 1,
        name: "Absent Divinity",
        description: "Gods may or may not exist; they have no apparent influence",
        example: "Game of Thrones, real-world atheistic perspective"
      },
      {
        value: 2,
        name: "Distant Divinity",
        description: "The gods are real and acknowledged. Their power is known, sometimes even visible through miracles or divine agents",
        example: "The Elder Scrolls, Conan the Barbarian"
      },
      {
        value: 3,
        name: "Responsive Divinity",
        description: "Gods respond to prayer and grant power to followers",
        example: "Standard D&D, Forgotten Realms"
      },
      {
        value: 4,
        name: "Active Divinity",
        description: "Gods regularly interact through avatars and miracles",
        example: "Norse mythology, Critical Role Campaign 3"
      },
      {
        value: 5,
        name: "Manifest Divinity",
        description: "Gods walk the world and directly involve themselves in mortal affairs",
        example: "Greek mythology, American Gods, God of War"
      }
    ]
  },
  society: {
    name: "Societal Development",
    description: "How advanced and complex is your world's civilization?",
    levels: [
      {
        value: 1,
        name: "Pre-civilization",
        description: "Nomadic tribes, hunter-gatherers, minimal technology",
        example: "Far Cry Primal, 10,000 BC"
      },
      {
        value: 2,
        name: "Early Civilization",
        description: "Early agriculture, city-states, bronze/iron age",
        example: "Conan the Barbarian, early Mesopotamia"
      },
      {
        value: 3,
        name: "Established Civilization",
        description: "Medieval to Renaissance level technology and social structures",
        example: "Standard D&D, Game of Thrones, Lord of the Rings"
      },
      {
        value: 4,
        name: "Advanced Civilization",
        description: "Early industrial to Victorian-equivalent complexity",
        example: "Eberron, Dishonored, early Bioshock"
      },
      {
        value: 5,
        name: "Complex Civilization",
        description: "Highly developed cultures, magical technology integration",
        example: "Final Fantasy, Legend of Korra, Arcane"
      }
    ]
  },
  wilds: {
    name: "Wilderness Peril",
    description: "How dangerous are the untamed parts of your world?",
    levels: [
      {
        value: 1,
        name: "Tame Wilderness",
        description: "The wild presents few dangers beyond natural elements",
        example: "Pastoral fantasy, The Shire in Lord of the Rings"
      },
      {
        value: 2,
        name: "Moderate Wilderness",
        description: "Wilderness has some dangers but is largely navigable",
        example: "Narnia, standard fairy tales"
      },
      {
        value: 3,
        name: "Hazardous Wilderness",
        description: "Significant dangers exist in the wild; common folk avoid travel",
        example: "Standard D&D, Witcher wilderness"
      },
      {
        value: 4,
        name: "Perilous Wilderness",
        description: "The wilds are filled with lethal threats; travel requires preparations",
        example: "Dark Sun, Fallout, Monster Hunter"
      },
      {
        value: 5,
        name: "Lethal Wilderness",
        description: "Venturing into the wild is a death sentence for most; extreme danger",
        example: "Dark Souls, Darkest Dungeon, Bloodborne"
      }
    ]
  }
};

// Global variables
let worldData = {};
let activeSection = 'introduction';
let activeTab = 'magic';
let showClearConfirm = false;
let d4Roll = null;

function initWorldBuilder() {
    // Load data from localStorage or use initialState
    const savedData = localStorage.getItem('worldBuilderData');
    worldData = savedData ? JSON.parse(savedData) : {...initialState};
    
    // Render the World Builder HTML
    renderWorldBuilder();
    
    // Set up event listeners
    setupEventListeners();
}

function renderAlignmentGrid() {
    let html = `
        <div class="alignment-grid-container">
            <!-- Horizontal axis label (agency/impact) -->
            <div class="axis-label horizontal-axis">
                <span class="axis-start">Less Agency & Impact</span>
                <span class="axis-name">AGENCY & IMPACT</span>
                <span class="axis-end">More Agency & Impact</span>
            </div>
            
            <!-- Vertical axis label (opportunity/optimism) -->
            <div class="axis-label vertical-axis">
                <span class="axis-end">More Opportunity & Optimism</span>
                <span class="axis-name">OPPORTUNITY & OPTIMISM</span>
                <span class="axis-start">Less Opportunity & Optimism</span>
            </div>
            
            <table class="alignment-table"><thead><tr>`;
    
    // Add column headers
    html += '<th></th><th>Grim</th><th>Neutral</th><th>Noble</th></tr></thead><tbody>';
    
    // Row labels
    const rowLabels = ['Bright', 'Neutral', 'Dark'];
    
    // Add rows with row headers
    for (let row = 0; row < alignmentGrid.length; row++) {
        html += `<tr><th>${rowLabels[row]}</th>`;
        
        for (let col = 0; col < alignmentGrid[row].length; col++) {
            const cell = alignmentGrid[row][col];
            const isSelected = worldData.alignmentPosition && 
                               worldData.alignmentPosition.row === row && 
                               worldData.alignmentPosition.col === col;
            
            html += `
                <td>
                    <div class="alignment-cell ${isSelected ? 'selected' : ''}" 
                         data-row="${row}" 
                         data-col="${col}">
                        <div class="alignment-cell-content">
                            ${cell.name}
                        </div>
                    </div>
                </td>
            `;
        }
        
        html += '</tr>';
    }
    
    html += '</tbody></table></div>';
    return html;
}

function renderAlignmentDescription() {
    // If no alignment is selected, show a placeholder
    if (!worldData.alignmentPosition || worldData.alignmentPosition.row === null || worldData.alignmentPosition.col === null) {
        return `
            <div class="alignment-placeholder">
                <h3>Select an alignment square</h3>
                <p>Click on a square in the grid to view details and set your world's alignment.</p>
            </div>
        `;
    }
    
    // Get the selected alignment
    const { row, col } = worldData.alignmentPosition;
    const alignment = alignmentGrid[row][col];
    
    return `
        <div class="alignment-details">
            <h3>${alignment.name}</h3>
            <p>${alignment.description}</p>
            <p><strong>Examples:</strong> ${alignment.examples}</p>
            <div class="alignment-stats">
                <div class="stat">
                    <span class="stat-label">Conflicts:</span>
                    <span class="stat-value">${alignment.conflicts}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Barriers:</span>
                    <span class="stat-value">${alignment.barriers}</span>
                </div>
            </div>
        </div>
    `;
}

function getAlignmentRequirementHint() {
    if (!worldData.alignmentPosition || worldData.alignmentPosition.row === null || worldData.alignmentPosition.col === null) {
        return '<div class="alignment-requirement-hint">No alignment selected yet.</div>';
    }
    
    const { row, col } = worldData.alignmentPosition;
    const alignment = alignmentGrid[row][col];
    
    return `
        <div class="alignment-requirement-hint">
            <p>Your selected alignment (${alignment.name}) recommends:</p>
            <ul>
                <li>${alignment.conflicts} conflicts per pillar</li>
                <li>${alignment.barriers} barriers per pillar</li>
            </ul>
        </div>
    `;
}

function renderWorldBuilder() {
    const container = document.getElementById('world-builder-container');
    if (!container) return;
    
    // Add this at the beginning of the renderWorldBuilder function before the HTML generation:

    const styleElement = document.head.querySelector('style.world-builder-styles') || 
                        document.createElement('style');
    styleElement.className = 'world-builder-styles';

    // Add or update styles
    styleElement.textContent = `
        /* Existing styles... */
        
        /* Scale UI styles */
        .pillar-scale-container {
            margin-bottom: 20px;
            padding: 15px;
            background-color: rgba(0,0,0,0.03);
            border-radius: 8px;
        }
        
        .scale-selector {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            position: relative;
            align-items: center;
            padding: 0 10px;
            height: 50px;
        }
        
        /* Background inactive line */
        .scale-selector:before {
            content: '';
            position: absolute;
            top: 50%;
            left: 28px;
            right: 28px;
            height: 3px;
            background-color: #e0e0e0;
            z-index: 0;
        }
        
        /* Active highlighted line */
        .scale-selector:after {
            content: '';
            position: absolute;
            top: 50%;
            left: 28px;
            height: 3px;
            background-color: #4a6da7;
            z-index: 1;
            transition: width 0.4s ease-in-out;
            width: 0%; /* Will be set via JS */
        }
        
        .scale-option {
            text-align: center;
            position: relative;
            z-index: 2; /* Ensure dots appear above both lines */
        }
        
        .scale-option input[type="radio"] {
            position: absolute;
            opacity: 0;
        }
        
        .scale-option label {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background-color: #f0f0f0;
            cursor: pointer;
            transition: all 0.3s;
            border: 2px solid #d0d0d0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .scale-option input[type="radio"]:checked + label {
            background-color: #4a6da7;
            color: white;
            border-color: #2a4d87;
            transform: scale(1.1);
        }
        
        /* Add a new rule for scale options that are at or below the selected value */
        .scale-option.active label {
            background-color: #4a6da7;
            color: white;
            border-color: #2a4d87;
        }
        
        .scale-option:hover label {
            transform: scale(1.05);
            background-color: #e5e5e5;
        }
        
        .scale-option input[type="radio"]:checked:hover + label {
            background-color: #4a6da7;
        }
        
        .scale-labels {
            display: flex;
            justify-content: space-between;
            margin-top: 5px;
            font-size: 0.8em;
            color: #666;
        }
        
        .scale-current-value {
            margin-top: 15px;
            padding: 12px;
            background-color: rgba(0,0,0,0.05);
            border-radius: 4px;
            transition: all 0.3s ease;
        }
        
        .scale-current-value strong {
            display: block;
            margin-bottom: 5px;
            color: #333;
            font-size: 1.1em;
        }
        
        .scale-current-value p {
            margin-bottom: 8px;
        }

        /* World Summary Styles */
        .world-summary {
          background-color: rgba(0,0,0,0.02);
          border-radius: 8px;
          padding: 20px;
          margin: 30px 0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .world-summary h3 {
          font-size: 1.8rem;
          color: #4a6da7;
          margin-bottom: 20px;
          text-align: center;
          font-weight: bold;
        }
        
        .world-summary h4 {
          font-size: 1.4rem;
          color: #6a4aa7;
          margin: 25px 0 10px;
          padding-bottom: 5px;
          border-bottom: 2px solid rgba(0,0,0,0.1);
        }
        
        .world-summary h5 {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 10px;
          color: #4a6da7;
        }
        
        .summary-alignment p {
          font-style: italic;
          color: #555;
        }
        
        .summary-thesis-text {
          font-weight: 500;
          font-size: 1.1rem;
          color: #444;
          font-style: italic;
        }
        
        /* Scale bars */
        .summary-scales {
          margin: 25px 0;
        }
        
        .summary-scale-bars {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .summary-scale-bar {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .scale-bar-label {
          width: 80px;
          font-weight: 600;
          text-align: right;
        }
        
        .scale-bar-container {
          flex-grow: 1;
          height: 25px;
          background-color: #f0f0f0;
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        }
        
        .scale-bar-fill {
          height: 100%;
          background: linear-gradient(to right, #4a6da7, #7a9fd7);
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        
        .scale-bar-markers {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          display: flex;
          justify-content: space-between;
          padding: 0 10px;
          color: rgba(0,0,0,0.5);
          font-size: 0.7rem;
          pointer-events: none;
        }
        
        .scale-bar-markers span {
          position: relative;
          top: 5px;
        }
        
        .scale-bar-value {
          width: 120px;
          font-style: italic;
          font-size: 0.9rem;
        }
        
        /* Pillar summaries */
        .pillar-summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr; /* Change from auto-fill to exactly 2 columns */
          gap: 20px;
          margin-top: 15px;
        }
        
        .pillar-summary {
          background-color: white;
          border-radius: 6px;
          padding: 15px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .pillar-conflicts-barriers {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 10px;
        }
        
        .pillar-conflicts-barriers ul {
          padding-left: 20px;
          margin-top: 5px;
          font-size: 0.9rem;
        }
        
        .pillar-conflicts-barriers li {
          margin-bottom: 5px;
        }
        
        /* Summary twists */
        .summary-twists {
          background-color: rgba(0,0,0,0.03);
          border-radius: 6px;
          padding: 15px;
          margin-top: 25px;
        }
        
        .world-summary-placeholder {
          text-align: center;
          padding: 30px;
          background-color: rgba(0,0,0,0.03);
          border-radius: 8px;
          color: #666;
          font-style: italic;
        }
        
        /* Mobile adjustments */
        @media (max-width: 768px) {
          .pillar-summary-grid {
            grid-template-columns: 1fr;
          }
          
          .pillar-conflicts-barriers {
            grid-template-columns: 1fr;
          }
        }

        /* Alignment grid axis labels */
        .alignment-grid-container {
            position: relative;
            padding: 40px 80px;
        }

        .axis-label {
            position: absolute;
            display: flex;
            justify-content: space-between;
            color: #555;
            font-size: 0.85rem;
        }

        .axis-name {
            font-weight: 600;
            color: #444;
            font-size: 0.9rem;
            text-transform: uppercase;
        }

        .horizontal-axis {
            bottom: 0;
            left: 80px;
            right: 10px;
            text-align: center;
        }

        .vertical-axis {
            top: 40px;
            bottom: 40px;
            left: 10px;
            width: 30px;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .axis-start, .axis-end {
            font-style: italic;
            font-size: 0.8rem;
        }

        /* Alignment details panel styling */
        .alignment-details {
            background: linear-gradient(to bottom, #f9f9f9, #f0f0f0);
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px 25px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            margin-top: 15px;
        }

        .alignment-details:hover {
            box-shadow: 0 5px 15px rgba(0,0,0,0.12);
            transform: translateY(-2px);
        }

        .alignment-details h3 {
            color: #4a6da7;
            font-size: 1.6rem;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid rgba(74, 109, 167, 0.3);
            text-align: center;
        }

        .alignment-details p {
            line-height: 1.6;
            margin-bottom: 15px;
            color: #444;
        }

        .alignment-details p:nth-child(3) {
            font-style: italic;
            color: #666;
            padding: 8px 0;
        }

        .alignment-stats {
            display: flex;
            justify-content: space-around;
            background-color: rgba(74, 109, 167, 0.08);
            border-radius: 6px;
            padding: 15px 10px;
            margin-top: 20px;
        }

        .stat {
            text-align: center;
            flex: 1;
            padding: 0 15px;
        }

        .stat:first-child {
            border-right: 1px solid rgba(0,0,0,0.1);
        }

        .stat-label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            color: #555;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stat-value {
            display: block;
            font-size: 2rem;
            font-weight: bold;
            color: #4a6da7;
        }
    `;

    // Add the style element to the head if it's not already there
    if (!document.head.querySelector('style.world-builder-styles')) {
        document.head.appendChild(styleElement);
    }
    
    // Generate the HTML content
    const html = `
        <!-- Navigation Bar -->
        <div class="wb-nav-buttons">
            <button class="wb-nav-btn ${activeSection === 'introduction' ? 'active' : ''}" data-section="introduction">Introduction</button>
            <button class="wb-nav-btn ${activeSection === 'alignment' ? 'active' : ''}" data-section="alignment">Alignment</button>
            <button class="wb-nav-btn ${activeSection === 'foundation' ? 'active' : ''}" data-section="foundation">Foundation</button>
            <button class="wb-nav-btn ${activeSection === 'pillars' ? 'active' : ''}" data-section="pillars">Four Pillars</button>
            <button class="wb-nav-btn ${activeSection === 'inverse' ? 'active' : ''}" data-section="inverse">Inverse Twists</button>
            <button class="wb-nav-btn ${activeSection === 'export' ? 'active' : ''}" data-section="export">Export</button>
        </div>

        <!-- Introduction Section -->
        <div class="wb-section ${activeSection === 'introduction' ? 'active' : ''}" id="introduction-section">
            <h2>Welcome to the 4-Pillar World Builder</h2>
            <p>Create a rich, cohesive world for your tabletop RPG adventures using this guided framework.</p>
            
            <div class="wb-btn-row">
                <button class="wb-btn wb-btn-primary" id="begin-btn">Begin</button>
            </div>
        </div>
        
        <!-- Alignment Selection Section -->
        <div class="wb-section ${activeSection === 'alignment' ? 'active' : ''}" id="alignment-section">
            <h2>World Alignment</h2>
            <p>Start by selecting your world's alignment. This sets the baseline tone and conflict level for your setting.</p>
            
            <div class="alignment-container">
                <div class="alignment-grid">
                    ${renderAlignmentGrid()}
                </div>
                <div class="alignment-details-panel">
                    ${renderAlignmentDescription()}
                </div>
            </div>
            
            <div class="wb-btn-row">
                <button class="wb-btn wb-btn-secondary" id="alignment-back-btn">Back</button>
                <button class="wb-btn wb-btn-primary" id="alignment-next-btn">Next: Foundation</button>
            </div>
        </div>
        
        <!-- Foundation Section -->
        <div class="wb-section ${activeSection === 'foundation' ? 'active' : ''}" id="foundation-section">
            <h2>World Foundation</h2>
            <p>Establish the core principles that make your world unique.</p>
            
            <div class="wb-form-group">
                <label for="thesis">World Thesis:</label>
                <span class="hint">The one-sentence pitch that captures your world's essence.</span>
                <input type="text" id="thesis" value="${worldData.thesis}" placeholder="e.g., A world where magic comes at the cost of memories">
            </div>
            
            <div class="wb-form-group">
                <label>Rule-Zero Laws:</label>
                <span class="hint">Three universal principles that govern how your world works.</span>
                ${worldData.ruleZeroLaws.map((law, index) => `
                    <input type="text" id="rule-zero-${index}" class="rule-zero-law" value="${law}" placeholder="Law ${index + 1}" style="margin-bottom: 10px;">
                `).join('')}
            </div>
            
            <div class="wb-form-group">
                <label>Touchstone Properties:</label>
                <span class="hint">List media you're inspired by and what you're stealing from them.</span>
                ${worldData.touchstones.map((touchstone, index) => `
                    <div style="display: flex; margin-bottom: 10px;">
                        <input type="text" class="touchstone-name" value="${touchstone.name}" placeholder="Property name" style="flex: 1; margin-right: 10px;">
                        <input type="text" class="touchstone-stealing" value="${touchstone.stealing}" placeholder="What you're stealing" style="flex: 2;">
                    </div>
                `).join('')}
            </div>
            
            <div class="wb-btn-row">
                <button class="wb-btn wb-btn-secondary" id="foundation-back-btn">Back</button>
                <button class="wb-btn wb-btn-primary" id="foundation-next-btn">Next: Four Pillars</button>
            </div>
        </div>
        
        <!-- Four Pillars Section -->
        <div class="wb-section ${activeSection === 'pillars' ? 'active' : ''}" id="pillars-section">
            <h2>The Four Pillars</h2>
            <p>Define the four core systems that shape your world.</p>
            
            ${getAlignmentRequirementHint()}
            
            <div class="wb-tabs">
                <div class="wb-tab ${activeTab === 'magic' ? 'active' : ''}" data-tab="magic">Magic</div>
                <div class="wb-tab ${activeTab === 'religion' ? 'active' : ''}" data-tab="religion">Religion</div>
                <div class="wb-tab ${activeTab === 'society' ? 'active' : ''}" data-tab="society">Society</div>
                <div class="wb-tab ${activeTab === 'wilds' ? 'active' : ''}" data-tab="wilds">Wilds</div>
            </div>
            
            <div class="wb-tab-content-container">
                <div id="magic-tab" class="wb-tab-content ${activeTab === 'magic' ? 'active' : ''}">
                    ${renderPillarScale('magic')}
                    ${renderPillarForm('magic')}
                </div>
                
                <div id="religion-tab" class="wb-tab-content ${activeTab === 'religion' ? 'active' : ''}">
                    ${renderPillarScale('religion')}
                    ${renderPillarForm('religion')}
                </div>
                
                <div id="society-tab" class="wb-tab-content ${activeTab === 'society' ? 'active' : ''}">
                    ${renderPillarScale('society')}
                    ${renderPillarForm('society')}
                </div>
                
                <div id="wilds-tab" class="wb-tab-content ${activeTab === 'wilds' ? 'active' : ''}">
                    ${renderPillarScale('wilds')}
                    ${renderPillarForm('wilds')}
                </div>
            </div>
            
            <div class="wb-btn-row">
                <button class="wb-btn wb-btn-secondary" id="pillars-back-btn">Back</button>
                <button class="wb-btn wb-btn-primary" id="pillars-next-btn">Next: Inverse Twists</button>
            </div>
        </div>

        <!-- Inverse Twists Section -->
        <div class="wb-section ${activeSection === 'inverse' ? 'active' : ''}" id="inverse-section">
            <h2>Inverse Twists</h2>
            <p>After establishing your core world rules, it's time to add complexity with exceptions to those rules. Roll a d4 and create that many inverse twists.</p>
            
            <div style="margin: 30px 0; text-align: center;">
                <button class="wb-btn wb-btn-primary d4-roll-btn" id="d4-roll-btn">Roll d4</button>
                <span class="d4-roll-result">${worldData.inverseTwists.roll || '—'}</span>
            </div>
            
            <div class="wb-form-group">
                <label for="inverse-twists">Inverse Twists:</label>
                <span class="hint">Create a region, faction, or anomaly that embodies the opposite tone for each of your pillars (based on your d4 roll).</span>
                <textarea id="inverse-twists" rows="6" placeholder="Describe your inverse twists here...">${worldData.inverseTwists.twists}</textarea>
            </div>
            
            <div class="wb-btn-row">
                <button class="wb-btn wb-btn-secondary" id="inverse-back-btn">Back</button>
                <button class="wb-btn wb-btn-primary" id="inverse-next-btn">Next: Export</button>
            </div>
        </div>

        <!-- Export Section -->
        <div class="wb-section ${activeSection === 'export' ? 'active' : ''}" id="export-section">
            <h2>Export Your World</h2>
            <p>Your world is ready! Export it to save a copy or to share with others.</p>
            
            ${renderWorldSummary()}
            
            <div class="summary-box">
                <h3>Completion Status</h3>
                <div class="completion-meter">
                    <div class="completion-bar" style="width: ${calculateCompletion()}%"></div>
                </div>
                <p style="margin-top: 10px;">Your world is approximately ${calculateCompletion()}% complete.</p>
            </div>
            
            <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 30px;">
                <button class="wb-btn wb-btn-primary" id="export-word-btn">
                    <i class="fas fa-file-word"></i> Export as Word Document
                </button>
                
                <button class="wb-btn wb-btn-secondary" id="export-txt-btn">
                    <i class="fas fa-file-alt"></i> Export as Text
                </button>
                
                <button class="wb-btn wb-btn-danger" id="clear-data-btn">
                    <i class="fas fa-trash"></i> Clear All Data
                </button>
            </div>
            
            ${showClearConfirm ? `
                <div style="margin-top: 20px; padding: 15px; background-color: rgba(195, 10, 61, 0.1); border-radius: 8px;">
                    <p><strong>Are you sure you want to clear all data?</strong> This cannot be undone.</p>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button class="wb-btn wb-btn-danger" id="confirm-clear-btn">Yes, Clear Everything</button>
                        <button class="wb-btn wb-btn-secondary" id="cancel-clear-btn">Cancel</button>
                    </div>
                </div>
            ` : ''}
            
            <div class="wb-btn-row">
                <button class="wb-btn wb-btn-secondary" id="export-back-btn">Back</button>
                <div></div> <!-- Empty div for spacing -->
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

function renderPillarForm(pillar) {
    const data = worldData.pillars[pillar];
    
    return `
        <div class="wb-form-group">
            <label for="${pillar}-prime-law">Prime Law:</label>
            <span class="hint">The one rule about ${pillar} that can't be broken.</span>
            <input type="text" id="${pillar}-prime-law" value="${data.primeLaw}" placeholder="e.g., Magic requires sacrifice">
        </div>
        
        <div class="wb-form-group">
            <label for="${pillar}-loophole">Loophole / Myth:</label>
            <span class="hint">A rare exception or rumor about this law.</span>
            <input type="text" id="${pillar}-loophole" value="${data.loopholeMYth}" placeholder="e.g., A mystical location where magic fgrims freely">
        </div>
        
        <div class="wb-form-group">
            <label for="${pillar}-enforcer">Enforcer / Avatar:</label>
            <span class="hint">Who or what upholds or embodies this law?</span>
            <input type="text" id="${pillar}-enforcer" value="${data.enforcerAvatar}" placeholder="e.g., The Order of Balance">
        </div>
        
        <div class="wb-form-group">
            <label for="${pillar}-sign">Everyday Sign:</label>
            <span class="hint">Sights, sounds, smells that reveal this law in daily life.</span>
            <input type="text" id="${pillar}-sign" value="${data.everydaySign}" placeholder="e.g., Arcane tattoos that ggrim during spellcasting">
        </div>
        
        <div class="wb-form-group">
            <label for="${pillar}-tone">Tone Tie-in:</label>
            <span class="hint">How does this pillar reflect your world's alignment square?</span>
            <input type="text" id="${pillar}-tone" value="${data.toneTieIn}" placeholder="e.g., Magic's unpredictability reflects the world's dark tone">
        </div>
        
        <div class="wb-form-group">
            <label>Conflicts:</label>
            <span class="hint">Problems that heroes can chase related to this pillar.</span>
            ${data.conflicts.map((conflict, index) => `
                <input type="text" id="${pillar}-conflict-${index}" class="${pillar}-conflict" value="${conflict}" placeholder="Conflict ${index + 1}" style="margin-bottom: 10px;">
            `).join('')}
        </div>
        
        <div class="wb-form-group">
            <label>Barriers:</label>
            <span class="hint">Reasons why common folk cannot easily solve these problems.</span>
            ${data.barriers.map((barrier, index) => `
                <input type="text" id="${pillar}-barrier-${index}" class="${pillar}-barrier" value="${barrier}" placeholder="Barrier ${index + 1}" style="margin-bottom: 10px;">
            `).join('')}
        </div>
        
        <div class="wb-form-group">
            <label>Tier Ladder:</label>
            <span class="hint">How conflicts related to this pillar scale across character levels.</span>
            ${['Tier 1 (Lv 1-4)', 'Tier 2 (Lv 5-10)', 'Tier 3 (Lv 11-16)', 'Tier 4 (Lv 17-20)'].map((tier, index) => `
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <span style="width: 150px; flex-shrink: 0;">${tier}:</span>
                    <input type="text" id="${pillar}-tier-${index}" class="${pillar}-tier" value="${data.tierLadder[index]}" placeholder="e.g., Local conflict">
                </div>
            `).join('')}
        </div>
        
        <div class="wb-form-group">
            <label>Sensory Motifs:</label>
            <span class="hint">Three sensory elements that define the feel of this pillar.</span>
            ${data.sensoryMotifs.map((motif, index) => `
                <input type="text" id="${pillar}-motif-${index}" class="${pillar}-motif" value="${motif}" placeholder="Motif ${index + 1}" style="margin-bottom: 10px;">
            `).join('')}
        </div>
    `;
}

// Update the renderPillarScale function

function renderPillarScale(pillar) {
    const scale = pillarScales[pillar];
    const currentValue = worldData.pillars[pillar].scale || 3;
    
    let html = `
        <div class="wb-form-group pillar-scale-container" data-pillar="${pillar}" data-current-value="${currentValue}">
            <label for="${pillar}-scale">${scale.name}:</label>
            <span class="hint">${scale.description}</span>
            <div class="scale-selector">
    `;
    
    // Add radio buttons for each scale level
    for (let i = 1; i <= 5; i++) {
        const level = scale.levels.find(l => l.value === i);
        const isActive = i <= currentValue; // Check if this option should be marked as active
        html += `
            <div class="scale-option ${isActive ? 'active' : ''}" title="${level.name}: ${level.description}&#10;Example: ${level.example}" data-value="${i}">
                <input type="radio" name="${pillar}-scale" id="${pillar}-scale-${i}" 
                    value="${i}" ${currentValue === i ? 'checked' : ''}>
                <label for="${pillar}-scale-${i}">${i}</label>
            </div>
        `;
    }
    
    html += `
            </div>
            <div class="scale-labels">
                <span>Low</span>
                <span>High</span>
            </div>
            <div class="scale-current-value">
                <strong>${scale.levels.find(l => l.value === currentValue)?.name || ''}</strong>
                <p>${scale.levels.find(l => l.value === currentValue)?.description || ''}</p>
                <p><em>Example: ${scale.levels.find(l => l.value === currentValue)?.example || ''}</em></p>
            </div>
        </div>
    `;
    
    return html;
}

function setupEventListeners() {
    // Section navigation
    document.querySelectorAll('.wb-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            navigateToSection(btn.getAttribute('data-section'));
        });
    });
    
    // Button event listeners
    setupButtonListeners();
    
    // Pillar tab switching
    document.querySelectorAll('.wb-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.getAttribute('data-tab'));
        });
    });
    
    // Form input change listeners
    setupFormListeners();
    
    // Alignment grid cell selection
    setupAlignmentGridListeners();

    // Scale radio button listeners
    setupScaleListeners();
}

function setupAlignmentGridListeners() {
    document.querySelectorAll('.alignment-cell').forEach(cell => {
        cell.addEventListener('click', () => {
            const row = parseInt(cell.getAttribute('data-row'));
            const col = parseInt(cell.getAttribute('data-col'));
            
            // Update world data
            worldData.alignmentPosition = { row, col };
            worldData.alignmentSquare = alignmentGrid[row][col].name;
            
            // Update UI
            renderWorldBuilder();
            setupEventListeners();
        });
    });
}

function setupButtonListeners() {
    // Introduction section
    const beginBtn = document.getElementById('begin-btn');
    if (beginBtn) {
        beginBtn.addEventListener('click', () => {
            navigateToSection('alignment');
        });
    }
    
    // Alignment section
    const alignmentBackBtn = document.getElementById('alignment-back-btn');
    if (alignmentBackBtn) {
        alignmentBackBtn.addEventListener('click', () => {
            navigateToSection('introduction');
        });
    }
    
    const alignmentNextBtn = document.getElementById('alignment-next-btn');
    if (alignmentNextBtn) {
        alignmentNextBtn.addEventListener('click', () => {
            if (!worldData.alignmentPosition) {
                alert('Please select an alignment from the grid before continuing.');
                return;
            }
            navigateToSection('foundation');
        });
    }
    
    // Foundation section
    const foundationBackBtn = document.getElementById('foundation-back-btn');
    if (foundationBackBtn) {
        foundationBackBtn.addEventListener('click', () => {
            saveFoundationData();
            navigateToSection('alignment');
        });
    }
    
    const foundationNextBtn = document.getElementById('foundation-next-btn');
    if (foundationNextBtn) {
        foundationNextBtn.addEventListener('click', () => {
            saveFoundationData();
            navigateToSection('pillars');
        });
    }
    
    // Pillars section
    const pillarsBackBtn = document.getElementById('pillars-back-btn');
    if (pillarsBackBtn) {
        pillarsBackBtn.addEventListener('click', () => {
            savePillarsData();
            navigateToSection('foundation');
        });
    }
    
    const pillarsNextBtn = document.getElementById('pillars-next-btn');
    if (pillarsNextBtn) {
        pillarsNextBtn.addEventListener('click', () => {
            savePillarsData();
            navigateToSection('inverse');
        });
    }
    
    // Inverse section
    const inverseBackBtn = document.getElementById('inverse-back-btn');
    if (inverseBackBtn) {
        inverseBackBtn.addEventListener('click', () => {
            saveInverseData();
            navigateToSection('pillars');
        });
    }
    
    const inverseNextBtn = document.getElementById('inverse-next-btn');
    if (inverseNextBtn) {
        inverseNextBtn.addEventListener('click', () => {
            saveInverseData();
            navigateToSection('export');
        });
    }
    
    // Roll d4 button
    const d4RollBtn = document.getElementById('d4-roll-btn');
    if (d4RollBtn) {
        d4RollBtn.addEventListener('click', rollD4);
    }
    
    // Export section
    const exportBackBtn = document.getElementById('export-back-btn');
    if (exportBackBtn) {
        exportBackBtn.addEventListener('click', () => {
            navigateToSection('inverse');
        });
    }
    
    const exportWordBtn = document.getElementById('export-word-btn');
    if (exportWordBtn) {
        exportWordBtn.addEventListener('click', exportToWord);
    }
    
    const exportTxtBtn = document.getElementById('export-txt-btn');
    if (exportTxtBtn) {
        exportTxtBtn.addEventListener('click', exportToText);
    }
    
    const clearDataBtn = document.getElementById('clear-data-btn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', () => {
            showClearConfirm = true;
            renderWorldBuilder();
            setupEventListeners();
        });
    }
    
    const confirmClearBtn = document.getElementById('confirm-clear-btn');
    if (confirmClearBtn) {
        confirmClearBtn.addEventListener('click', clearAllData);
    }
    
        const cancelClearBtn = document.getElementById('cancel-clear-btn');
        if (cancelClearBtn) {
            cancelClearBtn.addEventListener('click', () => {
                showClearConfirm = false;
                renderWorldBuilder();
                setupEventListeners();
            });
        }
    }

/**
 * Calculate the completion percentage of the world building
 * @returns {number} - Percentage of completion (0-100)
 */
function calculateCompletion() {
    let filledFields = 0;
    let totalFields = 0;
    
    // Count foundation fields
    if (worldData.alignmentSquare) filledFields++;
    if (worldData.thesis) filledFields++;
    totalFields += 2;
    
    // Count rule zero laws
    worldData.ruleZeroLaws.forEach(law => {
        totalFields++;
        if (law) filledFields++;
    });
    
    // Count touchstones
    worldData.touchstones.forEach(touchstone => {
        totalFields += 2; // name and what you're stealing
        if (touchstone.name) filledFields++;
        if (touchstone.stealing) filledFields++;
    });
    
    // Count pillar fields
    Object.keys(worldData.pillars).forEach(pillarKey => {
        const pillar = worldData.pillars[pillarKey];
        
        // Basic fields
        ['primeLaw', 'loopholeMYth', 'enforcerAvatar', 'everydaySign', 'toneTieIn'].forEach(field => {
            totalFields++;
            if (pillar[field]) filledFields++;
        });
        
        // Arrays
        ['conflicts', 'barriers', 'tierLadder', 'sensoryMotifs'].forEach(arrayField => {
            pillar[arrayField].forEach(item => {
                totalFields++;
                if (item) filledFields++;
            });
        });
    });
    
    // Count inverse twists
    if (worldData.inverseTwists.roll) filledFields++;
    if (worldData.inverseTwists.twists) filledFields++;
    totalFields += 2;
    
    // Calculate percentage
    return Math.round((filledFields / totalFields) * 100);
}

/**
 * Navigate to a specific section of the world builder
 * @param {string} sectionName - The name of the section to navigate to
 */
function navigateToSection(sectionName) {
    // Save current section data if needed
    if (activeSection === 'foundation') {
        saveFoundationData();
    } else if (activeSection === 'pillars') {
        savePillarsData();
    } else if (activeSection === 'inverse') {
        saveInverseData();
    }
    
    // Update active section
    activeSection = sectionName;
    
    // Render the UI with the new active section
    renderWorldBuilder();
    
    // Set up event listeners for the new UI
    setupEventListeners();
    
    // Scroll to the top of the section
    const sectionElement = document.getElementById(`${sectionName}-section`);
    if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Roll a d4 die for determining the number of inverse twists
 * Updates the UI and saves the result to worldData
 */
function rollD4() {
    // Generate random number between 1-4
    const roll = Math.floor(Math.random() * 4) + 1;
    
    // Update world data
    worldData.inverseTwists.roll = roll;
    
    // Update UI
    const rollResult = document.querySelector('.d4-roll-result');
    if (rollResult) {
        rollResult.textContent = roll;
        
        // Add a small animation effect
        rollResult.classList.add('roll-animation');
        setTimeout(() => {
            rollResult.classList.remove('roll-animation');
        }, 500);
    }
    
    // Save data
    saveToLocalStorage();
}

/**
 * Save foundation section data to the worldData object
 */
function saveFoundationData() {
    // Save thesis
    const thesisElement = document.getElementById('thesis');
    if (thesisElement) {
        worldData.thesis = thesisElement.value;
    }
    
    // Save rule zero laws
    document.querySelectorAll('.rule-zero-law').forEach((input, index) => {
        worldData.ruleZeroLaws[index] = input.value;
    });
    
    // Save touchstones
    document.querySelectorAll('.touchstone-name').forEach((input, index) => {
        worldData.touchstones[index].name = input.value;
    });
    
    document.querySelectorAll('.touchstone-stealing').forEach((input, index) => {
        worldData.touchstones[index].stealing = input.value;
    });
    
    // Save to localStorage
    saveToLocalStorage();
}

/**
 * Save pillar section data to the worldData object
 */
function savePillarsData() {
    // For each pillar (magic, religion, society, wilds)
    ['magic', 'religion', 'society', 'wilds'].forEach(pillar => {
        // Save basic fields
        const primeLaw = document.getElementById(`${pillar}-prime-law`);
        if (primeLaw) worldData.pillars[pillar].primeLaw = primeLaw.value;
        
        const loophole = document.getElementById(`${pillar}-loophole`);
        if (loophole) worldData.pillars[pillar].loopholeMYth = loophole.value;
        
        const enforcer = document.getElementById(`${pillar}-enforcer`);
        if (enforcer) worldData.pillars[pillar].enforcerAvatar = enforcer.value;
        
        const sign = document.getElementById(`${pillar}-sign`);
        if (sign) worldData.pillars[pillar].everydaySign = sign.value;
        
        const tone = document.getElementById(`${pillar}-tone`);
        if (tone) worldData.pillars[pillar].toneTieIn = tone.value;
        
        // Save array fields
        document.querySelectorAll(`.${pillar}-conflict`).forEach((input, index) => {
            worldData.pillars[pillar].conflicts[index] = input.value;
        });
        
        document.querySelectorAll(`.${pillar}-barrier`).forEach((input, index) => {
            worldData.pillars[pillar].barriers[index] = input.value;
        });
        
        document.querySelectorAll(`.${pillar}-tier`).forEach((input, index) => {
            worldData.pillars[pillar].tierLadder[index] = input.value;
        });
        
        document.querySelectorAll(`.${pillar}-motif`).forEach((input, index) => {
            worldData.pillars[pillar].sensoryMotifs[index] = input.value;
        });
    });
    
    // Save to localStorage
    saveToLocalStorage();
}

/**
 * Save inverse twists section data to the worldData object
 */
function saveInverseData() {
    const twistsElement = document.getElementById('inverse-twists');
    if (twistsElement) {
        worldData.inverseTwists.twists = twistsElement.value;
    }
    
    // Save to localStorage
    saveToLocalStorage();
}

/**
 * Save the current worldData to localStorage
 */
function saveToLocalStorage() {
    localStorage.setItem('worldBuilderData', JSON.stringify(worldData));
}

/**
 * Export world data as a Word document
 * Uses docx.js library to create a properly formatted document
 */
function exportToWord() {
    const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = docx;
    
    // Create a new document
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                // Title
                new Paragraph({
                    text: "4-Pillar World Builder",
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER
                }),
                
                // Alignment & Thesis
                new Paragraph({
                    text: "World Foundation",
                    heading: HeadingLevel.HEADING_1
                }),
                new Paragraph({
                    text: `Alignment: ${worldData.alignmentSquare || "Not specified"}`,
                    spacing: { before: 200, after: 200 }
                }),
                new Paragraph({
                    text: `Thesis: ${worldData.thesis || "Not specified"}`,
                    spacing: { before: 200, after: 400 }
                }),
                
                // Rule Zero Laws
                new Paragraph({
                    text: "Rule-Zero Laws",
                    heading: HeadingLevel.HEADING_2
                }),
                ...worldData.ruleZeroLaws.map((law, index) => 
                    new Paragraph({
                        text: `${index + 1}. ${law || "Not specified"}`,
                        spacing: { before: 100, after: 100 }
                    })
                ),
                
                // Touchstones
                new Paragraph({
                    text: "Touchstones",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 400 }
                }),
                ...worldData.touchstones.map((touchstone, index) => 
                    new Paragraph({
                        text: `${touchstone.name || "Not specified"}: ${touchstone.stealing || "Not specified"}`,
                        spacing: { before: 100, after: 100 }
                    })
                ),
                
                // Pillars
                new Paragraph({
                    text: "The Four Pillars",
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 600 }
                })
            ]
        }]
    });
    
    // Add each pillar section
    ['Magic', 'Religion', 'Society', 'Wilds'].forEach(pillarTitle => {
        const pillarKey = pillarTitle.toLowerCase();
        const pillar = worldData.pillars[pillarKey];
        
        // Add pillar section to document
        doc.addSection({
            properties: {},
            children: [
                new Paragraph({
                    text: pillarTitle,
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 }
                }),
                new Paragraph({
                    text: `${pillarScales[pillarKey].name}: ${pillar.scale}/5 - ${pillarScales[pillarKey].levels.find(l => l.value === pillar.scale)?.name || "Not specified"}`,
                    spacing: { before: 100, after: 100 }
                }),
                new Paragraph({
                    text: `Prime Law: ${pillar.primeLaw || "Not specified"}`,
                    spacing: { before: 200, after: 100 }
                }),
                new Paragraph({
                    text: `Loophole/Myth: ${pillar.loopholeMYth || "Not specified"}`,
                    spacing: { before: 100, after: 100 }
                }),
                new Paragraph({
                    text: `Enforcer/Avatar: ${pillar.enforcerAvatar || "Not specified"}`,
                    spacing: { before: 100, after: 100 }
                }),
                new Paragraph({
                    text: `Everyday Sign: ${pillar.everydaySign || "Not specified"}`,
                    spacing: { before: 100, after: 100 }
                }),
                new Paragraph({
                    text: `Tone Tie-in: ${pillar.toneTieIn || "Not specified"}`,
                    spacing: { before: 100, after: 200 }
                }),
                
                // Conflicts subsection
                new Paragraph({
                    text: "Conflicts",
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 }
                }),
                ...pillar.conflicts.map((conflict, index) => 
                    new Paragraph({
                        text: `• ${conflict || "Not specified"}`,
                        spacing: { before: 0, after: 0 }
                    })
                ),
                
                // Barriers subsection
                new Paragraph({
                    text: "Barriers",
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 }
                }),
                ...pillar.barriers.map((barrier, index) => 
                    new Paragraph({
                        text: `• ${barrier || "Not specified"}`,
                        spacing: { before: 0, after: 0 }
                    })
                ),
                
                // Tier Ladder subsection
                new Paragraph({
                    text: "Tier Ladder",
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 }
                }),
                ...pillar.tierLadder.map((tier, index) => {
                    const tierLabels = ["Tier 1 (Lv 1-4)", "Tier 2 (Lv 5-10)", "Tier 3 (Lv 11-16)", "Tier 4 (Lv 17-20)"];
                    return new Paragraph({
                        text: `${tierLabels[index]}: ${tier || "Not specified"}`,
                        spacing: { before: 0, after: 0 }
                    });
                }),
                
                // Sensory Motifs subsection
                new Paragraph({
                    text: "Sensory Motifs",
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 }
                }),
                ...pillar.sensoryMotifs.map((motif, index) => 
                    new Paragraph({
                        text: `• ${motif || "Not specified"}`,
                        spacing: { before: 0, after: 0 }
                    })
                )
            ]
        });
    });
    
    // Add Inverse Twists section
    doc.addSection({
        properties: {},
        children: [
            new Paragraph({
                text: "Inverse Twists",
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 600, after: 200 }
            }),
            new Paragraph({
                text: `Number of Twists (d4 roll): ${worldData.inverseTwists.roll || "Not rolled"}`,
                spacing: { before: 100, after: 200 }
            }),
            new Paragraph({
                text: worldData.inverseTwists.twists || "No inverse twists specified",
                spacing: { before: 100, after: 100 }
            })
        ]
    });
    
    // Generate and save the document
    docx.Packer.toBlob(doc).then(blob => {
        saveAs(blob, "my-world-builder.docx");
    });
}

/**
 * Export world data as a text file
 */
function exportToText() {
    let content = "4-PILLAR WORLD BUILDER\n";
    content += "======================\n\n";
    
    // Foundation
    content += "WORLD FOUNDATION\n";
    content += "-----------------\n\n";
    content += `Alignment: ${worldData.alignmentSquare || "Not specified"}\n`;
    content += `Thesis: ${worldData.thesis || "Not specified"}\n\n`;
    
    // Rule Zero Laws
    content += "Rule-Zero Laws:\n";
    worldData.ruleZeroLaws.forEach((law, index) => {
        content += `${index + 1}. ${law || "Not specified"}\n`;
    });
    content += "\n";
    
    // Touchstones
    content += "Touchstones:\n";
    worldData.touchstones.forEach((touchstone, index) => {
        content += `• ${touchstone.name || "Not specified"}: ${touchstone.stealing || "Not specified"}\n`;
    });
    content += "\n\n";
    
    // Pillars
    content += "THE FOUR PILLARS\n";
    content += "----------------\n\n";
    
    ['Magic', 'Religion', 'Society', 'Wilds'].forEach(pillarTitle => {
        const pillarKey = pillarTitle.toLowerCase();
        const pillar = worldData.pillars[pillarKey];
        
        content += `${pillarTitle.toUpperCase()}\n`;
        content += "".padEnd(pillarTitle.length, "=") + "\n\n";
        content += `${pillarScales[pillarKey].name}: ${pillar.scale}/5 - ${pillarScales[pillarKey].levels.find(l => l.value === pillar.scale)?.name || "Not specified"}\n`;
        
        content += `Prime Law: ${pillar.primeLaw || "Not specified"}\n`;
        content += `Loophole/Myth: ${pillar.loopholeMYth || "Not specified"}\n`;
        content += `Enforcer/Avatar: ${pillar.enforcerAvatar || "Not specified"}\n`;
        content += `Everyday Sign: ${pillar.everydaySign || "Not specified"}\n`;
        content += `Tone Tie-in: ${pillar.toneTieIn || "Not specified"}\n\n`;
        
        content += "Conflicts:\n";
        pillar.conflicts.forEach(conflict => {
            content += `• ${conflict || "Not specified"}\n`;
        });
        content += "\n";
        
        content += "Barriers:\n";
        pillar.barriers.forEach(barrier => {
            content += `• ${barrier || "Not specified"}\n`;
        });
        content += "\n";
        
        content += "Tier Ladder:\n";
        const tierLabels = ["Tier 1 (Lv 1-4)", "Tier 2 (Lv 5-10)", "Tier 3 (Lv 11-16)", "Tier 4 (Lv 17-20)"];
        pillar.tierLadder.forEach((tier, index) => {
            content += `• ${tierLabels[index]}: ${tier || "Not specified"}\n`;
        });
        content += "\n";
        
        content += "Sensory Motifs:\n";
        pillar.sensoryMotifs.forEach(motif => {
            content += `• ${motif || "Not specified"}\n`;
        });
        content += "\n\n";
    });
    
    // Inverse Twists
    content += "INVERSE TWISTS\n";
    content += "--------------\n\n";
    content += `Number of Twists (d4 roll): ${worldData.inverseTwists.roll || "Not rolled"}\n\n`;
    content += worldData.inverseTwists.twists || "No inverse twists specified";
    
    // Create and download the text file
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "my-world-builder.txt");
}

/**
 * Clear all world builder data and reset to initial state
 */
function clearAllData() {
    // Reset to initial state
    worldData = {...initialState};
    
    // Clear localStorage
    localStorage.removeItem('worldBuilderData');
    
    // Hide confirmation dialog
    showClearConfirm = false;
    
    // Reset active tab
    activeTab = 'magic';
    
    // Navigate to introduction section
    activeSection = 'introduction';
    
    // Update UI
    renderWorldBuilder();
    setupEventListeners();
    
    // Show confirmation to user
    alert('All world builder data has been cleared.');
}

/**
 * Switch between pillar tabs
 * @param {string} tabName - The name of the tab to switch to
 */
function switchTab(tabName) {
    // Save current tab data
    savePillarsData();
    
    // Update active tab
    activeTab = tabName;
    
    // Update UI to show new tab
    renderWorldBuilder();
    setupEventListeners();
}

/**
 * Set up form input change listeners to save data as user types
 */
function setupFormListeners() {
    // Add input change listeners based on active section
    if (activeSection === 'foundation') {
        // Foundation form fields
        const thesisElement = document.getElementById('thesis');
        if (thesisElement) {
            thesisElement.addEventListener('input', () => {
                worldData.thesis = thesisElement.value;
                saveToLocalStorage();
            });
        }
        
        // Rule zero laws
        document.querySelectorAll('.rule-zero-law').forEach((input, index) => {
            input.addEventListener('input', () => {
                worldData.ruleZeroLaws[index] = input.value;
                saveToLocalStorage();
            });
        });
        
        // Touchstones
        document.querySelectorAll('.touchstone-name, .touchstone-stealing').forEach(input => {
            input.addEventListener('input', () => {
                saveFoundationData();
            });
        });
    } else if (activeSection === 'pillars') {
        // Pillar form fields (for current active tab)
        const pillarInputs = document.querySelectorAll(`#${activeTab}-tab input`);
        pillarInputs.forEach(input => {
            input.addEventListener('input', () => {
                savePillarsData();
            });
        });
    } else if (activeSection === 'inverse') {
        // Inverse twists
        const twistsElement = document.getElementById('inverse-twists');
        if (twistsElement) {
            twistsElement.addEventListener('input', () => {
                worldData.inverseTwists.twists = twistsElement.value;
                saveToLocalStorage();
            });
        }
    }
}

// Update the setupScaleListeners function

function setupScaleListeners() {
    // First, set the initial line width for all pillar scales
    document.querySelectorAll('.pillar-scale-container').forEach(container => {
        updateScaleLine(container);
    });

    // Add event listeners to scale radio buttons
    ['magic', 'religion', 'society', 'wilds'].forEach(pillar => {
        document.querySelectorAll(`input[name="${pillar}-scale"]`).forEach(radio => {
            radio.addEventListener('change', () => {
                // Update the display immediately when a scale option is clicked
                const scaleValue = parseInt(radio.value);
                const scale = pillarScales[pillar];
                const level = scale.levels.find(l => l.value === scaleValue);
                const container = radio.closest('.pillar-scale-container');
                
                // Update data attribute for current value
                container.setAttribute('data-current-value', scaleValue);
                
                // Update active states for scale options
                const options = container.querySelectorAll('.scale-option');
                options.forEach(option => {
                    const optionValue = parseInt(option.getAttribute('data-value'));
                    if (optionValue <= scaleValue) {
                        option.classList.add('active');
                    } else {
                        option.classList.remove('active');
                    }
                });
                
                // Update the line width
                updateScaleLine(container);
                
                // Update the current value display
                const currentValueDiv = container.querySelector('.scale-current-value');
                if (currentValueDiv && level) {
                    currentValueDiv.innerHTML = `
                        <strong>${level.name}</strong>
                        <p>${level.description}</p>
                        <p><em>Example: ${level.example}</em></p>
                    `;
                }
                
                // Save to world data
                worldData.pillars[pillar].scale = scaleValue;
                saveToLocalStorage();
            });
        });
    });
}

// Update the updateScaleLine function

function updateScaleLine(container) {
    const currentValue = parseInt(container.getAttribute('data-current-value')) || 3;
    const selector = container.querySelector('.scale-selector');
    
    if (selector) {
        // Use specific percentages for each value point
        let percentage;
        switch (currentValue) {
            case 1:
                percentage = 0;
                break;
            case 2:
                percentage = 25;
                break;
            case 3:
                percentage = 48; // mid-point of 46-49%
                break;
            case 4:
                percentage = 72; // mid-point of 70-73%
                break;
            case 5:
                percentage = 95;
                break;
            default:
                percentage = 48; // Default to middle value
        }
        
        // Apply the width to the pseudo-element using a CSS variable
        selector.style.setProperty('--scale-line-width', percentage + '%');
        
        // We need to adjust the CSS to use this variable
        if (!document.head.querySelector('style.scale-line-styles')) {
            const lineStyle = document.createElement('style');
            lineStyle.className = 'scale-line-styles';
            lineStyle.textContent = `
                .scale-selector:after {
                    width: var(--scale-line-width, 0%);
                }
            `;
            document.head.appendChild(lineStyle);
        }
    }
}

// Add this function before renderWorldBuilder()

function renderWorldSummary() {
  // Get alignment info - add more thorough validation
  const alignmentInfo = worldData.alignmentPosition && 
                       worldData.alignmentPosition.row !== null && 
                       worldData.alignmentPosition.col !== null && 
                       alignmentGrid[worldData.alignmentPosition.row] && 
                       alignmentGrid[worldData.alignmentPosition.row][worldData.alignmentPosition.col] ? 
    alignmentGrid[worldData.alignmentPosition.row][worldData.alignmentPosition.col] : null;
  
  // If no alignment is selected, show a placeholder
  if (!alignmentInfo) {
    return `
      <div class="world-summary-placeholder">
        <p>Select an alignment and complete at least some of your pillars to see a world summary.</p>
      </div>
    `;
  }
  
  // Generate pillar scale bars
  const pillarBars = [];
  ['magic', 'religion', 'society', 'wilds'].forEach(pillar => {
    const scaleValue = worldData.pillars[pillar].scale || 3;
    const scaleName = pillarScales[pillar].levels.find(l => l.value === scaleValue)?.name || '';
    
    // Map scale values to specific percentages
    let percentage;
    switch (scaleValue) {
      case 1: percentage = 0; break;
      case 2: percentage = 27; break;
      case 3: percentage = 51; break;
      case 4: percentage = 75; break;
      case 5: percentage = 100; break;
      default: percentage = 51; // Default to middle value
    }
    
    pillarBars.push(`
      <div class="summary-scale-bar">
        <div class="scale-bar-label">${pillar.charAt(0).toUpperCase() + pillar.slice(1)}</div>
        <div class="scale-bar-container">
          <div class="scale-bar-fill" style="width: ${percentage}%"></div>
          <div class="scale-bar-markers">
            <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
          </div>
        </div>
        <div class="scale-bar-value">${scaleName}</div>
      </div>
    `);
  });
  
  // Generate the summary
  return `
    <div class="world-summary">
      <h3>World Overview</h3>
      
      <div class="summary-alignment">
        <h4>${worldData.alignmentSquare || "No Alignment Selected"}</h4>
        <p>${alignmentInfo ? alignmentInfo.description : ""}</p>
      </div>
      
      <div class="summary-scales">
        <h4>Pillar Scales</h4>
        <div class="summary-scale-bars">
          ${pillarBars.join('')}
        </div>
      </div>
      
      <div class="summary-thesis">
        <h4>Thesis</h4>
        <p class="summary-thesis-text">${worldData.thesis || "No thesis defined"}</p>
      </div>
      
      <div class="summary-pillars">
        <h4>Pillar Summary</h4>
        
        <div class="pillar-summary-grid">
          ${['magic', 'religion', 'society', 'wilds'].map(pillar => {
            const pillarData = worldData.pillars[pillar];
            const scaleValue = pillarData.scale || 3;
            const scaleName = pillarScales[pillar].levels.find(l => l.value === scaleValue)?.name || '';
            
            return `
              <div class="pillar-summary">
                <h5>${pillar.charAt(0).toUpperCase() + pillar.slice(1)}: ${scaleName}</h5>
                <p><strong>Prime Law:</strong> ${pillarData.primeLaw || "Not defined"}</p>
                <div class="pillar-conflicts-barriers">
                  <div>
                    <strong>Conflicts:</strong>
                    <ul>
                      ${pillarData.conflicts.map(conflict => 
                        conflict ? `<li>${conflict}</li>` : ''
                      ).join('')}
                    </ul>
                  </div>
                  <div>
                    <strong>Barriers:</strong>
                    <ul>
                      ${pillarData.barriers.map(barrier => 
                        barrier ? `<li>${barrier}</li>` : ''
                      ).join('')}
                    </ul>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      <div class="summary-twists">
        <h4>Inverse Twists (${worldData.inverseTwists.roll || "0"})</h4>
        <p>${worldData.inverseTwists.twists || "No inverse twists defined"}</p>
      </div>
    </div>
  `;
}