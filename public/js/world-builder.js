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
    let html = '<table class="alignment-table"><thead><tr>';
    
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
    
    html += '</tbody></table>';
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
    
    // Create HTML for the World Builder
    const html = `
        <div class="mb-8 text-center">
            <h1 class="text-3xl font-bold text-primary-blue mb-4">4-Pillar World Builder</h1>
            <p class="text-lg">Create your D&D campaign world using the 4-Pillar framework.</p>
        </div>
        
        <!-- Navigation -->
        <div class="wb-nav-buttons">
            <button class="wb-nav-btn ${activeSection === 'introduction' ? 'active' : ''}" data-section="introduction">Introduction</button>
            <button class="wb-nav-btn ${activeSection === 'alignment' ? 'active' : ''}" data-section="alignment">Alignment</button>
            <button class="wb-nav-btn ${activeSection === 'foundation' ? 'active' : ''}" data-section="foundation">Foundation</button>
            <button class="wb-nav-btn ${activeSection === 'pillars' ? 'active' : ''}" data-section="pillars">Pillars</button>
            <button class="wb-nav-btn ${activeSection === 'inverse' ? 'active' : ''}" data-section="inverse">Inverse Twists</button>
            <button class="wb-nav-btn ${activeSection === 'export' ? 'active' : ''}" data-section="export">Export</button>
        </div>

        <!-- Introduction Section -->
        <div class="wb-section ${activeSection === 'introduction' ? 'active' : ''}" id="introduction-section">
            <h2>About the 4-Pillar Framework</h2>
            <p>The 4-Pillar World Builder is a structured approach to creating compelling fantasy worlds. It helps you establish consistent rules across four fundamental pillars of your setting: Magic, Religion, Society, and Wilds.</p>
            <p>By defining these pillars with clear laws, conflicts, and sensory elements, you'll create a world that feels both coherent and exciting for your players to explore.</p>
            
            <h3 class="text-xl font-bold mb-3 text-primary-purple mt-6">Quick Roadmap:</h3>
            <ul class="list-disc pl-6 space-y-2">
                <li><strong>Alignment Thesis</strong> - Define the tone and core concept of your world</li>
                <li><strong>Four Pillars</strong> - Establish the laws of Magic, Religion, Society, and Wilds</li>
                <li><strong>Conflicts & Barriers</strong> - Create problems for heroes and reasons why ordinary people can't solve them</li>
                <li><strong>Tier Ladders</strong> - Scale conflicts across character levels</li>
                <li><strong>Inverse Twists</strong> - Add complexity with exceptions to your established rules</li>
            </ul>
            
            <div class="wb-btn-row">
                <div></div> <!-- Empty div for spacing -->
                <button class="wb-btn wb-btn-primary" id="begin-btn">Let's Begin</button>
            </div>
        </div>

        <!-- Alignment Grid Section -->
        <div class="wb-section ${activeSection === 'alignment' ? 'active' : ''}" id="alignment-section">
            <h2>Choose Your World's Alignment</h2>
            <p>Select a position on the grid that best describes your world's tone and level of character agency. This will determine the recommended number of conflicts and barriers for each pillar.</p>
            
            <div class="alignment-grid-container">
                <div class="alignment-grid">
                    ${renderAlignmentGrid()}
                </div>
                
                <div class="alignment-description">
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
            <p>Let's establish the core elements of your world. These fundamentals will guide all your future decisions.</p>
            
            <div class="wb-form-group">
                <label for="alignment-square">Alignment Square:</label>
                <span class="hint">Your world's tone based on the grid selection.</span>
                <input type="text" id="alignment-square" value="${worldData.alignmentSquare}" placeholder="e.g., Bright-Noble (Heroic Fantasy)" readonly>
                ${getAlignmentRequirementHint()}
            </div>
            
            <div class="wb-form-group">
                <label for="thesis">Thesis:</label>
                <span class="hint">Write a one-sentence summary of your world's core concept.</span>
                <input type="text" id="thesis" value="${worldData.thesis}" placeholder="e.g., A world where magic is fading and ancient gods are returning">
            </div>
            
            <div class="wb-form-group">
                <label>Rule-Zero Laws:</label>
                <span class="hint">Define 1-3 universal truths that trump everything else in your world.</span>
                ${worldData.ruleZeroLaws.map((law, index) => `
                    <input type="text" id="rule-zero-${index}" class="rule-zero-law" value="${law}" placeholder="Rule-Zero Law ${index + 1}" style="margin-bottom: 10px;">
                `).join('')}
            </div>
            
            <div class="wb-form-group">
                <label>Touchstones:</label>
                <span class="hint">Name two inspirational works and what you're borrowing from them.</span>
                ${worldData.touchstones.map((touchstone, index) => `
                    <div class="wb-grid-2" style="margin-bottom: 10px;">
                        <input type="text" id="touchstone-name-${index}" class="touchstone-name" value="${touchstone.name}" placeholder="Work name">
                        <input type="text" id="touchstone-stealing-${index}" class="touchstone-stealing" value="${touchstone.stealing}" placeholder="What you're borrowing">
                    </div>
                `).join('')}
            </div>
            
            <div class="wb-btn-row">
                <button class="wb-btn wb-btn-secondary" id="foundation-back-btn">Back</button>
                <button class="wb-btn wb-btn-primary" id="foundation-next-btn">Next: Define Pillars</button>
            </div>
        </div>

        <!-- Pillars Section -->
        <div class="wb-section ${activeSection === 'pillars' ? 'active' : ''}" id="pillars-section">
            <h2>The Four Pillars</h2>
            <p>Define the foundational rules for each pillar of your world. These pillars will create a cohesive framework for your setting.</p>
            
            <div class="alignment-requirement-reminder">
                ${getAlignmentRequirementHint()}
            </div>
            
            <div class="wb-tabs">
                <div class="wb-tab ${activeTab === 'magic' ? 'active' : ''}" data-tab="magic">Magic</div>
                <div class="wb-tab ${activeTab === 'religion' ? 'active' : ''}" data-tab="religion">Religion</div>
                <div class="wb-tab ${activeTab === 'society' ? 'active' : ''}" data-tab="society">Society</div>
                <div class="wb-tab ${activeTab === 'wilds' ? 'active' : ''}" data-tab="wilds">Wilds</div>
            </div>
            
            <!-- Magic Tab -->
            <div class="wb-tab-content ${activeTab === 'magic' ? 'active' : ''}" id="magic-tab">
                <div class="brainspark-box">
                    <h4>Brain-Spark Questions:</h4>
                    <ul>
                        ${brainsparkQuestions.magic.map(q => `<li>${q}</li>`).join('')}
                    </ul>
                </div>
                
                ${renderPillarForm('magic')}
            </div>
            
            <!-- Religion Tab -->
            <div class="wb-tab-content ${activeTab === 'religion' ? 'active' : ''}" id="religion-tab">
                <div class="brainspark-box">
                    <h4>Brain-Spark Questions:</h4>
                    <ul>
                        ${brainsparkQuestions.religion.map(q => `<li>${q}</li>`).join('')}
                    </ul>
                </div>
                
                ${renderPillarForm('religion')}
            </div>
            
            <!-- Society Tab -->
            <div class="wb-tab-content ${activeTab === 'society' ? 'active' : ''}" id="society-tab">
                <div class="brainspark-box">
                    <h4>Brain-Spark Questions:</h4>
                    <ul>
                        ${brainsparkQuestions.society.map(q => `<li>${q}</li>`).join('')}
                    </ul>
                </div>
                
                ${renderPillarForm('society')}
            </div>
            
            <!-- Wilds Tab -->
            <div class="wb-tab-content ${activeTab === 'wilds' ? 'active' : ''}" id="wilds-tab">
                <div class="brainspark-box">
                    <h4>Brain-Spark Questions:</h4>
                    <ul>
                        ${brainsparkQuestions.wilds.map(q => `<li>${q}</li>`).join('')}
                    </ul>
                </div>
                
                ${renderPillarForm('wilds')}
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