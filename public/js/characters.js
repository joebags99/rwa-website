/**
 * Character Viewer
 *
 * Interactive D&D character progression tracker
 * with party lineup, character sheets, and timeline viewing
 *
 * @version 1.0.0
 */

'use strict';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    CharacterViewer.init();
});

/**
 * Main Character Viewer Object
 */
window.CharacterViewer = {
    // State
    characters: [],
    currentCharacter: null,
    currentSnapshot: null,
    comparisonMode: false,
    comparisonSnapshots: { then: null, now: null },

    // DOM Elements
    elements: {
        partyLineup: null,
        characterFocus: null,
        characterLineup: null,
        characterSheetContainer: null,
        backButton: null,
        loadingState: null,
        emptyState: null
    },

    /**
     * Initialize the character viewer
     */
    async init() {
        console.log('🎲 Initializing Character Viewer...');

        // Cache DOM elements
        this.cacheElements();

        // Set up event listeners
        this.setupEventListeners();

        // Initialize particle background
        this.initParticles();

        // Load characters
        await this.loadCharacters();

        console.log('✅ Character Viewer initialized');
    },

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements.partyLineup = document.getElementById('party-lineup');
        this.elements.characterFocus = document.getElementById('character-focus');
        this.elements.characterLineup = document.getElementById('character-lineup');
        this.elements.characterSheetContainer = document.getElementById('character-sheet-container');
        this.elements.backButton = document.getElementById('back-button');
        this.elements.loadingState = document.getElementById('loading-state');
        this.elements.emptyState = document.getElementById('empty-state');
    },

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Back button
        if (this.elements.backButton) {
            this.elements.backButton.addEventListener('click', () => {
                this.returnToParty();
            });
        }

        // ESC key to return to party
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentCharacter) {
                this.returnToParty();
            }
        });

        // Mobile nav toggle
        const navToggle = document.getElementById('nav-toggle');
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                // Toggle mobile menu (implement if needed)
            });
        }
    },

    /**
     * Initialize particle background effect
     */
    initParticles() {
        const particleBg = document.getElementById('particle-bg');
        if (!particleBg) return;

        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            // Random positioning
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 20}s`;
            particle.style.animationDuration = `${15 + Math.random() * 10}s`;

            particleBg.appendChild(particle);
        }
    },

    /**
     * Load characters from API
     */
    async loadCharacters() {
        try {
            // Show loading state
            this.showLoading();

            // Fetch characters
            const response = await fetch('/admin/api/characters');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.characters = await response.json();

            console.log(`📦 Loaded ${this.characters.length} characters`);

            // Hide loading, show characters or empty state
            this.hideLoading();

            if (this.characters.length === 0) {
                this.showEmptyState();
            } else {
                this.renderCharacters();
            }

        } catch (error) {
            console.error('❌ Error loading characters:', error);
            this.hideLoading();
            this.showError(error.message);
        }
    },

    /**
     * Show loading state
     */
    showLoading() {
        if (this.elements.loadingState) {
            this.elements.loadingState.style.display = 'block';
        }
        if (this.elements.emptyState) {
            this.elements.emptyState.style.display = 'none';
        }
        if (this.elements.characterLineup) {
            this.elements.characterLineup.style.display = 'none';
        }
    },

    /**
     * Hide loading state
     */
    hideLoading() {
        if (this.elements.loadingState) {
            this.elements.loadingState.style.display = 'none';
        }
    },

    /**
     * Show empty state
     */
    showEmptyState() {
        if (this.elements.emptyState) {
            this.elements.emptyState.style.display = 'block';
        }
    },

    /**
     * Show error message
     */
    showError(message) {
        if (this.elements.characterLineup) {
            this.elements.characterLineup.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Oops! Something went wrong</h2>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="CharacterViewer.loadCharacters()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            `;
            this.elements.characterLineup.style.display = 'block';
        }
    },

    /**
     * Render character cards in lineup
     */
    renderCharacters() {
        if (!this.elements.characterLineup) return;

        // Sort characters by creation date
        const sortedCharacters = [...this.characters].sort((a, b) => {
            return new Date(a.createdAt) - new Date(b.createdAt);
        });

        // Render character cards
        this.elements.characterLineup.innerHTML = sortedCharacters
            .map((character, index) => this.renderCharacterCard(character, index))
            .join('');

        // Show lineup
        this.elements.characterLineup.style.display = 'flex';

        // Attach click listeners
        this.attachCharacterListeners();
    },

    /**
     * Render a character card - redesigned as standing character
     */
    renderCharacterCard(character, index) {
        const avatarUrl = character.avatarUrl || '/assets/images/unknown.png';

        return `
            <div class="character-card"
                 data-character-id="${character.id}"
                 data-character-name="${character.name}">
                <div class="character-avatar-container">
                    <div class="character-name-hover">${character.name}</div>
                    <img src="${avatarUrl}"
                         alt="${character.name}"
                         class="character-avatar"
                         onerror="this.src='/assets/images/unknown.png'">
                </div>
            </div>
        `;
    },

    /**
     * Attach click listeners to character cards
     */
    attachCharacterListeners() {
        const characterCards = document.querySelectorAll('.character-card');

        characterCards.forEach(card => {
            card.addEventListener('click', () => {
                const characterId = card.dataset.characterId;
                this.focusCharacter(characterId);
            });
        });
    },

    /**
     * Focus on a specific character - redesigned with new animations
     */
    async focusCharacter(characterId) {
        try {
            // Find character
            const character = this.characters.find(c => c.id === characterId);

            if (!character) {
                console.error('Character not found:', characterId);
                return;
            }

            this.currentCharacter = character;

            // Get the latest snapshot or use character data directly
            if (character.snapshots && character.snapshots.length > 0) {
                // Sort snapshots by date
                const sortedSnapshots = [...character.snapshots].sort((a, b) => {
                    return new Date(b.date) - new Date(a.date);
                });

                this.currentSnapshot = sortedSnapshots[0];
            } else {
                this.currentSnapshot = null;
            }

            // Get all character cards
            const characterCards = document.querySelectorAll('.character-card');
            const selectedCard = document.querySelector(`[data-character-id="${characterId}"]`);

            // Fade out other characters
            characterCards.forEach(card => {
                if (card.dataset.characterId !== characterId) {
                    card.classList.add('fading');
                }
            });

            // Expand and move selected character to the right
            if (selectedCard) {
                selectedCard.classList.add('selected');
            }

            // Wait for character animation to start, then show focus view
            setTimeout(() => {
                this.elements.characterFocus.classList.add('active');
                this.renderCharacterSheet();
            }, 300);

        } catch (error) {
            console.error('Error focusing character:', error);
        }
    },

    /**
     * Return to party lineup - redesigned to reset animations
     */
    returnToParty() {
        // Hide character focus
        this.elements.characterFocus.classList.remove('active');

        // Remove all character card classes
        const characterCards = document.querySelectorAll('.character-card');
        characterCards.forEach(card => {
            card.classList.remove('fading');
            card.classList.remove('selected');
        });

        // Clear current character
        this.currentCharacter = null;
        this.currentSnapshot = null;
        this.comparisonMode = false;
    },

    /**
     * Render character sheet
     */
    renderCharacterSheet() {
        if (!this.currentCharacter) return;

        const character = this.currentCharacter;
        const snapshot = this.currentSnapshot;
        const accentColor = character.accentColor || '#7F0EBD';
        const avatarUrl = character.avatarUrl || '/assets/images/unknown.png';

        // Get snapshot data or use empty data
        const data = snapshot ? snapshot.data : {};

        const html = `
            <div class="character-sheet" style="border-top-color: ${accentColor};">
                <!-- Header -->
                <div class="character-sheet-header" style="border-bottom-color: ${accentColor};">
                    <img src="${avatarUrl}"
                         alt="${character.name}"
                         class="character-sheet-avatar"
                         style="border-color: ${accentColor}; box-shadow: 0 0 30px ${accentColor};"
                         onerror="this.src='/assets/images/unknown.png'">
                    <div class="character-sheet-title">
                        <h1 class="character-sheet-name" style="text-shadow: 0 0 20px ${accentColor};">
                            ${character.name}
                        </h1>
                        <p class="character-sheet-subtitle">
                            Level ${data.level || '?'} ${character.race || ''} ${character.classes || ''}
                        </p>
                        <p class="character-sheet-player">
                            <i class="fas fa-user"></i>
                            Played by ${character.player || 'Unknown Player'}
                        </p>
                    </div>
                </div>

                <!-- Timeline Selector -->
                ${this.renderTimelineSelector()}

                <!-- Character Sheet Body -->
                <div class="character-sheet-body">
                    ${this.comparisonMode ? this.renderComparison() : this.renderNormalView(data)}
                </div>
            </div>
        `;

        this.elements.characterSheetContainer.innerHTML = html;

        // Attach timeline listeners
        this.attachTimelineListeners();
    },

    /**
     * Render timeline selector
     */
    renderTimelineSelector() {
        if (!this.currentCharacter || !this.currentCharacter.snapshots || this.currentCharacter.snapshots.length === 0) {
            return '';
        }

        const snapshots = [...this.currentCharacter.snapshots].sort((a, b) => {
            // Sort by act then chapter
            if (a.act !== b.act) return a.act - b.act;
            return a.chapter - b.chapter;
        });

        return `
            <div class="timeline-selector">
                <div class="timeline-header">
                    <h3 class="timeline-title">
                        <i class="fas fa-history"></i>
                        Character Progression
                    </h3>
                    <div class="timeline-controls">
                        <button id="toggle-comparison" class="${this.comparisonMode ? 'active' : ''}">
                            <i class="fas fa-code-branch"></i>
                            ${this.comparisonMode ? 'Exit Comparison' : 'Compare Versions'}
                        </button>
                    </div>
                </div>

                <div class="timeline-track">
                    <div class="timeline-line"></div>
                    <div class="timeline-nodes">
                        ${snapshots.map(snapshot => this.renderTimelineNode(snapshot)).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render timeline node
     */
    renderTimelineNode(snapshot) {
        const isActive = this.currentSnapshot && this.currentSnapshot.id === snapshot.id;

        return `
            <div class="timeline-node ${isActive ? 'active' : ''}" data-snapshot-id="${snapshot.id}">
                <div class="timeline-dot"></div>
                <div class="timeline-label">Act ${snapshot.act}, Ch. ${snapshot.chapter}</div>
            </div>
        `;
    },

    /**
     * Attach timeline listeners
     */
    attachTimelineListeners() {
        // Timeline nodes
        const nodes = document.querySelectorAll('.timeline-node');
        nodes.forEach(node => {
            node.addEventListener('click', () => {
                const snapshotId = node.dataset.snapshotId;

                if (this.comparisonMode) {
                    // In comparison mode, select snapshots
                    this.selectComparisonSnapshot(snapshotId);
                } else {
                    // Normal mode, switch to snapshot
                    this.switchToSnapshot(snapshotId);
                }
            });
        });

        // Comparison toggle
        const comparisonToggle = document.getElementById('toggle-comparison');
        if (comparisonToggle) {
            comparisonToggle.addEventListener('click', () => {
                this.toggleComparisonMode();
            });
        }
    },

    /**
     * Switch to a specific snapshot
     */
    switchToSnapshot(snapshotId) {
        const snapshot = this.currentCharacter.snapshots.find(s => s.id === snapshotId);

        if (snapshot) {
            this.currentSnapshot = snapshot;
            this.renderCharacterSheet();
        }
    },

    /**
     * Toggle comparison mode
     */
    toggleComparisonMode() {
        this.comparisonMode = !this.comparisonMode;

        if (this.comparisonMode) {
            // Initialize comparison snapshots
            const snapshots = this.currentCharacter.snapshots;
            if (snapshots.length >= 2) {
                this.comparisonSnapshots.then = snapshots[0];
                this.comparisonSnapshots.now = snapshots[snapshots.length - 1];
            } else {
                this.comparisonMode = false;
                alert('Need at least 2 snapshots to compare!');
                return;
            }
        }

        this.renderCharacterSheet();
    },

    /**
     * Select snapshot for comparison
     */
    selectComparisonSnapshot(snapshotId) {
        const snapshot = this.currentCharacter.snapshots.find(s => s.id === snapshotId);

        if (!snapshot) return;

        // Determine which slot to fill (then or now)
        // For simplicity, always update 'now' unless shift key is pressed
        if (event && event.shiftKey) {
            this.comparisonSnapshots.then = snapshot;
        } else {
            this.comparisonSnapshots.now = snapshot;
        }

        this.renderCharacterSheet();
    },

    /**
     * Render normal view (single snapshot)
     */
    renderNormalView(data) {
        return `
            <!-- Combat Stats -->
            <div class="sheet-section">
                <h2 class="section-title">
                    <i class="fas fa-shield-alt"></i>
                    Combat Statistics
                </h2>
                ${this.renderCombatStats(data)}
            </div>

            <!-- Ability Scores -->
            <div class="sheet-section">
                <h2 class="section-title">
                    <i class="fas fa-fist-raised"></i>
                    Ability Scores
                </h2>
                ${this.renderAbilityScores(data)}
            </div>

            <!-- Skills -->
            ${data.skills && data.skills.length > 0 ? `
                <div class="sheet-section">
                    <h2 class="section-title">
                        <i class="fas fa-tools"></i>
                        Skills
                    </h2>
                    ${this.renderSkills(data)}
                </div>
            ` : ''}

            <!-- Features & Traits -->
            ${data.features && data.features.length > 0 ? `
                <div class="sheet-section">
                    <h2 class="section-title">
                        <i class="fas fa-star"></i>
                        Features & Traits
                    </h2>
                    ${this.renderFeatures(data)}
                </div>
            ` : ''}

            <!-- Spells -->
            ${data.spells && data.spells.length > 0 ? `
                <div class="sheet-section">
                    <h2 class="section-title">
                        <i class="fas fa-magic"></i>
                        Spells & Spell Slots
                    </h2>
                    ${this.renderSpellSlots(data)}
                    ${this.renderSpells(data)}
                </div>
            ` : ''}

            <!-- Equipment & Currency -->
            ${data.equipment && data.equipment.length > 0 || data.currency ? `
                <div class="sheet-section">
                    <h2 class="section-title">
                        <i class="fas fa-suitcase"></i>
                        Equipment & Currency
                    </h2>
                    ${data.equipment && data.equipment.length > 0 ? this.renderEquipment(data) : ''}
                    ${data.currency ? this.renderCurrency(data) : ''}
                </div>
            ` : ''}
        `;
    },

    /**
     * Render comparison view
     */
    renderComparison() {
        const then = this.comparisonSnapshots.then;
        const now = this.comparisonSnapshots.now;

        if (!then || !now) return '<p>Select two snapshots to compare</p>';

        return `
            <div class="comparison-container">
                <div class="comparison-column then">
                    <h3 class="comparison-header">
                        <i class="fas fa-history"></i>
                        Then (Act ${then.act}, Ch. ${then.chapter})
                    </h3>
                    ${this.renderNormalView(then.data)}
                </div>

                <div class="comparison-column now">
                    <h3 class="comparison-header">
                        <i class="fas fa-check"></i>
                        Now (Act ${now.act}, Ch. ${now.chapter})
                    </h3>
                    ${this.renderNormalView(now.data)}
                </div>
            </div>
        `;
    },

    /**
     * Render combat stats
     */
    renderCombatStats(data) {
        const hasTemp = data.hp && data.hp.temp && data.hp.temp > 0;
        return `
            <div class="combat-stats-grid">
                <div class="stat-box ${hasTemp ? 'has-temp' : ''}">
                    <div class="stat-label">HP</div>
                    <div class="stat-value">
                        ${data.hp ? `${data.hp.current}/${data.hp.max}` : '?'}
                        ${hasTemp ? `<span class="temp-hp">+${data.hp.temp} temp</span>` : ''}
                    </div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">AC</div>
                    <div class="stat-value">${data.ac || '?'}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Initiative</div>
                    <div class="stat-value">${data.initiative >= 0 ? '+' : ''}${data.initiative || 0}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Speed</div>
                    <div class="stat-value">${data.speed || '30'} ft</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Proficiency</div>
                    <div class="stat-value">+${data.proficiencyBonus || 2}</div>
                </div>
            </div>
        `;
    },

    /**
     * Render ability scores
     */
    renderAbilityScores(data) {
        const abilities = data.abilities || {};
        const abilityNames = {
            strength: 'STR',
            dexterity: 'DEX',
            constitution: 'CON',
            intelligence: 'INT',
            wisdom: 'WIS',
            charisma: 'CHA'
        };

        return `
            <div class="abilities-grid">
                ${Object.entries(abilityNames).map(([key, label]) => {
                    const ability = abilities[key] || { score: 10, modifier: 0 };
                    return `
                        <div class="ability-box">
                            <div class="ability-name">${label}</div>
                            <div class="ability-score">${ability.score || 10}</div>
                            <div class="ability-modifier">${ability.modifier >= 0 ? '+' : ''}${ability.modifier || 0}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    /**
     * Render skills
     */
    renderSkills(data) {
        const skills = data.skills || [];

        return `
            <div class="skills-grid">
                ${skills.map(skill => `
                    <div class="skill-item ${skill.proficient ? 'proficient' : ''}">
                        <span class="skill-name">${skill.name}</span>
                        <span class="skill-modifier">${skill.modifier >= 0 ? '+' : ''}${skill.modifier}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Render features
     */
    renderFeatures(data) {
        const features = data.features || [];

        return `
            <div class="features-list">
                ${features.map(feature => `
                    <div class="feature-item">
                        <h4 class="feature-name">${feature.name}</h4>
                        ${feature.description ? `<p class="feature-description">${feature.description}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Render spells
     */
    renderSpells(data) {
        const spells = data.spells || [];

        // Group spells by level
        const spellsByLevel = spells.reduce((acc, spell) => {
            const level = spell.level || 'Cantrip';
            if (!acc[level]) {
                acc[level] = [];
            }
            acc[level].push(spell);
            return acc;
        }, {});

        return `
            <div class="spells-by-level">
                ${Object.entries(spellsByLevel).map(([level, levelSpells]) => `
                    <div class="spell-level-group">
                        <h4 class="spell-level-header">${level}</h4>
                        <div class="spell-list">
                            ${levelSpells.map(spell => `
                                <div class="spell-item ${spell.prepared ? 'prepared' : ''}">
                                    ${spell.name}
                                    ${spell.prepared ? '<i class="fas fa-check-circle"></i>' : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Render equipment
     */
    renderEquipment(data) {
        const equipment = data.equipment || [];

        return `
            <div class="equipment-grid">
                ${equipment.map(item => `
                    <div class="equipment-item ${item.equipped ? 'equipped' : ''}">
                        <span class="equipment-name">${item.name}</span>
                        <span class="equipment-quantity">×${item.quantity || 1}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Render spell slots
     */
    renderSpellSlots(data) {
        const spellSlots = data.spellSlots || {};
        const slots = [];

        // Convert spell slots object to array
        for (let i = 1; i <= 9; i++) {
            const level = `${i}`;
            if (spellSlots[level] && spellSlots[level].total > 0) {
                slots.push({
                    level: i,
                    total: spellSlots[level].total,
                    used: spellSlots[level].used || 0,
                    available: spellSlots[level].total - (spellSlots[level].used || 0)
                });
            }
        }

        if (slots.length === 0) return '';

        const levelNames = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];

        return `
            <div class="spell-slots-container">
                <h4 class="spell-slots-title">
                    <i class="fas fa-circle"></i>
                    Spell Slots
                </h4>
                <div class="spell-slots-grid">
                    ${slots.map(slot => `
                        <div class="spell-slot-box">
                            <div class="slot-level">${levelNames[slot.level]} Level</div>
                            <div class="slot-tracker">
                                ${Array.from({ length: slot.total }, (_, i) => {
                                    const isUsed = i < slot.used;
                                    return `<span class="slot-circle ${isUsed ? 'used' : 'available'}"></span>`;
                                }).join('')}
                            </div>
                            <div class="slot-count">${slot.available}/${slot.total} available</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Render currency
     */
    renderCurrency(data) {
        const currency = data.currency || {};
        const hasCurrency = currency.cp || currency.sp || currency.ep || currency.gp || currency.pp;

        if (!hasCurrency) return '';

        return `
            <div class="currency-container">
                <h4 class="currency-title">
                    <i class="fas fa-coins"></i>
                    Currency
                </h4>
                <div class="currency-grid">
                    ${currency.pp > 0 ? `
                        <div class="currency-item platinum">
                            <span class="currency-amount">${currency.pp}</span>
                            <span class="currency-type">PP</span>
                        </div>
                    ` : ''}
                    ${currency.gp > 0 ? `
                        <div class="currency-item gold">
                            <span class="currency-amount">${currency.gp}</span>
                            <span class="currency-type">GP</span>
                        </div>
                    ` : ''}
                    ${currency.ep > 0 ? `
                        <div class="currency-item electrum">
                            <span class="currency-amount">${currency.ep}</span>
                            <span class="currency-type">EP</span>
                        </div>
                    ` : ''}
                    ${currency.sp > 0 ? `
                        <div class="currency-item silver">
                            <span class="currency-amount">${currency.sp}</span>
                            <span class="currency-type">SP</span>
                        </div>
                    ` : ''}
                    ${currency.cp > 0 ? `
                        <div class="currency-item copper">
                            <span class="currency-amount">${currency.cp}</span>
                            <span class="currency-type">CP</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
};
