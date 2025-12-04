/**
 * Character Management Module
 *
 * Handles all character progression tracking functionality
 * Including D&D Beyond imports, snapshots, and character CRUD operations
 *
 * @version 1.0.0
 */

'use strict';

(function() {
    // Wait for AdminDashboard to be available
    if (typeof AdminDashboard === 'undefined') {
        console.error('AdminDashboard not loaded - cannot initialize character management');
        return;
    }

    // Add characters endpoint to config
    if (!AdminDashboard.config.apiEndpoints.characters) {
        AdminDashboard.config.apiEndpoints.characters = '/admin/api/characters';
    }

    /**
     * Characters API Methods
     */
    AdminDashboard.API.Characters = {
        /**
         * Get all characters
         * @returns {Promise<Array>} - Array of character objects
         */
        async getAll() {
            return AdminDashboard.API.request(AdminDashboard.config.apiEndpoints.characters);
        },

        /**
         * Get a single character by ID
         * @param {string} id - Character ID
         * @returns {Promise<Object>} - Character object
         */
        async get(id) {
            return AdminDashboard.API.request(`${AdminDashboard.config.apiEndpoints.characters}/${id}`);
        },

        /**
         * Create a new character
         * @param {Object} characterData - Character data
         * @returns {Promise<Object>} - Created character
         */
        async create(characterData) {
            return AdminDashboard.API.request(AdminDashboard.config.apiEndpoints.characters, {
                method: 'POST',
                body: JSON.stringify(characterData)
            });
        },

        /**
         * Update an existing character
         * @param {string} id - Character ID
         * @param {Object} characterData - Character data
         * @returns {Promise<Object>} - Updated character
         */
        async update(id, characterData) {
            return AdminDashboard.API.request(`${AdminDashboard.config.apiEndpoints.characters}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(characterData)
            });
        },

        /**
         * Delete a character
         * @param {string} id - Character ID
         * @returns {Promise<Object>} - API response
         */
        async delete(id) {
            return AdminDashboard.API.request(`${AdminDashboard.config.apiEndpoints.characters}/${id}`, {
                method: 'DELETE'
            });
        },

        /**
         * Get all snapshots for a character
         * @param {string} characterId - Character ID
         * @returns {Promise<Array>} - Array of snapshot objects
         */
        async getSnapshots(characterId) {
            return AdminDashboard.API.request(`${AdminDashboard.config.apiEndpoints.characters}/${characterId}/snapshots`);
        },

        /**
         * Create a new snapshot for a character
         * @param {string} characterId - Character ID
         * @param {Object} snapshotData - Snapshot data
         * @returns {Promise<Object>} - Created snapshot
         */
        async createSnapshot(characterId, snapshotData) {
            return AdminDashboard.API.request(`${AdminDashboard.config.apiEndpoints.characters}/${characterId}/snapshots`, {
                method: 'POST',
                body: JSON.stringify(snapshotData)
            });
        },

        /**
         * Update a snapshot
         * @param {string} characterId - Character ID
         * @param {string} snapshotId - Snapshot ID
         * @param {Object} snapshotData - Snapshot data
         * @returns {Promise<Object>} - Updated snapshot
         */
        async updateSnapshot(characterId, snapshotId, snapshotData) {
            return AdminDashboard.API.request(
                `${AdminDashboard.config.apiEndpoints.characters}/${characterId}/snapshots/${snapshotId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(snapshotData)
                }
            );
        },

        /**
         * Delete a snapshot
         * @param {string} characterId - Character ID
         * @param {string} snapshotId - Snapshot ID
         * @returns {Promise<Object>} - API response
         */
        async deleteSnapshot(characterId, snapshotId) {
            return AdminDashboard.API.request(
                `${AdminDashboard.config.apiEndpoints.characters}/${characterId}/snapshots/${snapshotId}`,
                {
                    method: 'DELETE'
                }
            );
        }
    };

    /**
     * Character Management Functions
     */
    AdminDashboard.Characters = {
        /**
         * Current character being viewed/edited
         */
        currentCharacter: null,

        /**
         * Initialize character management
         */
        init() {
            console.log('🎲 Initializing character management...');

            // Set up event listeners
            this.setupEventListeners();

            // Load characters if on characters section
            const charactersSection = document.getElementById('characters-section');
            if (charactersSection && charactersSection.classList.contains('active')) {
                this.loadCharacters();
            }

            // Listen for section changes
            document.addEventListener('section:changed', (e) => {
                if (e.detail && e.detail.section === 'characters') {
                    this.loadCharacters();
                }
            });

            // Listen for character reload events
            document.addEventListener('character:reload', () => this.loadCharacters());

            console.log('✅ Character management initialized');
        },

        /**
         * Set up event listeners
         */
        setupEventListeners() {
            // Create character button
            const createBtn = document.getElementById('create-character-btn');
            if (createBtn) {
                createBtn.addEventListener('click', () => this.openCreateModal());
            }

            // Show bookmarklet button
            const bookmarkletBtn = document.getElementById('show-bookmarklet-btn');
            if (bookmarkletBtn) {
                bookmarkletBtn.addEventListener('click', () => this.showBookmarkletInstructions());
            }

            // Character search
            const searchInput = document.getElementById('character-search');
            if (searchInput) {
                searchInput.addEventListener('input', AdminDashboard.Utils.debounce((e) => {
                    this.filterCharacters(e.target.value);
                }, AdminDashboard.config.searchDebounceDelay));
            }
        },

        /**
         * Load and display all characters
         */
        async loadCharacters() {
            const characterList = document.getElementById('character-list');

            if (!characterList) {
                console.warn('Cannot load characters: characterList element not found');
                return;
            }

            try {
                // Show loading indicator
                characterList.innerHTML = `
                    <div class="loading-indicator">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading characters...</p>
                    </div>
                `;

                // Fetch characters from API
                const characters = await AdminDashboard.API.Characters.getAll();

                // Update character count in dashboard
                const countElement = document.getElementById('characters-count');
                if (countElement) {
                    countElement.textContent = characters.length;
                }

                // Display characters
                if (characters.length === 0) {
                    characterList.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-hat-wizard"></i>
                            <h3>No Characters Yet</h3>
                            <p>Create your first character or import one from D&D Beyond</p>
                            <button class="btn btn-primary" onclick="AdminDashboard.Characters.openCreateModal()">
                                <i class="fas fa-plus"></i> Create Character
                            </button>
                        </div>
                    `;
                } else {
                    characterList.innerHTML = characters.map(character => this.renderCharacterCard(character)).join('');

                    // Add event listeners to action buttons
                    this.attachCharacterCardListeners();
                }

            } catch (error) {
                console.error('Error loading characters:', error);
                characterList.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Error Loading Characters</h3>
                        <p>Error loading characters: ${error.message || 'Unknown error'}</p>
                        <button class="btn btn-primary" onclick="AdminDashboard.Characters.loadCharacters()">
                            <i class="fas fa-redo"></i> Try Again
                        </button>
                    </div>
                `;
            }
        },

        /**
         * Render a character card
         * @param {Object} character - Character data
         * @returns {string} - HTML for character card
         */
        renderCharacterCard(character) {
            const snapshotCount = character.snapshots ? character.snapshots.length : 0;
            const latestSnapshot = character.snapshots && character.snapshots.length > 0
                ? character.snapshots[character.snapshots.length - 1]
                : null;

            const level = latestSnapshot && latestSnapshot.data ? latestSnapshot.data.level || '?' : '?';

            const accentColor = character.accentColor || '#7F0EBD';

            return `
                <div class="item-card character-card" data-character-id="${character.id}">
                    <div class="character-card-header" style="border-left: 4px solid ${accentColor};">
                        ${character.avatarUrl ? `
                            <div class="character-avatar">
                                <img src="${character.avatarUrl}" alt="${character.name}" onerror="this.src='/assets/images/unknown.png'">
                            </div>
                        ` : ''}
                        <div class="character-info">
                            <h3>${character.name}</h3>
                            <p class="character-meta">
                                <span class="character-player">
                                    <i class="fas fa-user"></i> ${character.player || 'Unknown Player'}
                                </span>
                                <span class="character-details">
                                    Level ${level} ${character.race || ''}
                                </span>
                            </p>
                            ${character.classes ? `
                                <p class="character-classes">
                                    <i class="fas fa-shield-alt"></i> ${character.classes}
                                </p>
                            ` : ''}
                        </div>
                    </div>
                    <div class="character-card-body">
                        <div class="character-stats">
                            <div class="stat-item">
                                <span class="stat-label">Snapshots</span>
                                <span class="stat-value">${snapshotCount}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Created</span>
                                <span class="stat-value">${this.formatDate(character.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="character-card-actions">
                        <button class="btn btn-sm btn-secondary view-snapshots-btn" data-character-id="${character.id}">
                            <i class="fas fa-history"></i> Snapshots (${snapshotCount})
                        </button>
                        <button class="btn btn-sm btn-primary edit-character-btn" data-character-id="${character.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger delete-character-btn" data-character-id="${character.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        },

        /**
         * Format date for display
         * @param {string} dateString - ISO date string
         * @returns {string} - Formatted date
         */
        formatDate(dateString) {
            if (!dateString) return 'Unknown';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        },

        /**
         * Attach event listeners to character card buttons
         */
        attachCharacterCardListeners() {
            // View snapshots buttons
            document.querySelectorAll('.view-snapshots-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const characterId = e.target.closest('[data-character-id]').dataset.characterId;
                    this.openSnapshotsModal(characterId);
                });
            });

            // Edit buttons
            document.querySelectorAll('.edit-character-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const characterId = e.target.closest('[data-character-id]').dataset.characterId;
                    this.openEditModal(characterId);
                });
            });

            // Delete buttons
            document.querySelectorAll('.delete-character-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const characterId = e.target.closest('[data-character-id]').dataset.characterId;
                    this.confirmDelete(characterId);
                });
            });
        },

        /**
         * Open create character modal
         */
        openCreateModal() {
            if (window.AdminModals && window.AdminModals.character) {
                window.AdminModals.character.open();
            } else {
                console.error('Character modal not initialized');
            }
        },

        /**
         * Open edit character modal
         * @param {string} characterId - Character ID
         */
        async openEditModal(characterId) {
            try {
                const character = await AdminDashboard.API.Characters.get(characterId);

                if (window.AdminModals && window.AdminModals.character) {
                    window.AdminModals.character.open(character);
                } else {
                    console.error('Character modal not initialized');
                }
            } catch (error) {
                console.error('Error loading character:', error);
                AdminDashboard.showToast('Error loading character', 'error');
            }
        },

        /**
         * Open snapshots modal for a character
         * @param {string} characterId - Character ID
         */
        async openSnapshotsModal(characterId) {
            try {
                const character = await AdminDashboard.API.Characters.get(characterId);
                this.currentCharacter = character;

                // Create and show a custom modal for snapshots
                this.showSnapshotsView(character);

            } catch (error) {
                console.error('Error loading character snapshots:', error);
                AdminDashboard.showToast('Error loading snapshots', 'error');
            }
        },

        /**
         * Show snapshots view in a custom modal
         * @param {Object} character - Character object with snapshots
         */
        showSnapshotsView(character) {
            const snapshots = character.snapshots || [];

            const modalHTML = `
                <div class="modal-overlay" id="snapshots-modal-overlay">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h2>
                                    <i class="fas fa-history"></i>
                                    ${character.name} - Character Snapshots
                                </h2>
                                <button class="modal-close" id="close-snapshots-modal">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <div class="modal-body">
                                <div class="snapshots-toolbar">
                                    <button class="btn btn-primary" id="add-snapshot-btn">
                                        <i class="fas fa-plus"></i> Add Snapshot
                                    </button>
                                </div>

                                ${snapshots.length === 0 ? `
                                    <div class="empty-state">
                                        <i class="fas fa-camera"></i>
                                        <h3>No Snapshots Yet</h3>
                                        <p>Add a snapshot to track ${character.name}'s progression</p>
                                    </div>
                                ` : `
                                    <div class="snapshots-timeline">
                                        ${snapshots.map(snapshot => this.renderSnapshotCard(character.id, snapshot)).join('')}
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Remove existing modal if any
            const existingModal = document.getElementById('snapshots-modal-overlay');
            if (existingModal) {
                existingModal.remove();
            }

            // Add modal to DOM
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Add event listeners
            document.getElementById('close-snapshots-modal').addEventListener('click', () => {
                this.closeSnapshotsModal();
            });

            document.getElementById('add-snapshot-btn').addEventListener('click', () => {
                this.openAddSnapshotModal(character.id);
            });

            // Attach snapshot action listeners
            this.attachSnapshotListeners(character.id);

            // Show modal
            setTimeout(() => {
                document.getElementById('snapshots-modal-overlay').classList.add('active');
            }, 10);
        },

        /**
         * Render a snapshot card
         * @param {string} characterId - Character ID
         * @param {Object} snapshot - Snapshot data
         * @returns {string} - HTML for snapshot card
         */
        renderSnapshotCard(characterId, snapshot) {
            const data = snapshot.data || {};
            const level = data.level || '?';

            return `
                <div class="snapshot-card" data-snapshot-id="${snapshot.id}">
                    <div class="snapshot-header">
                        <div class="snapshot-title">
                            <h4>Act ${snapshot.act}, Chapter ${snapshot.chapter}</h4>
                            <span class="snapshot-date">${this.formatDate(snapshot.date)}</span>
                        </div>
                        <div class="snapshot-actions">
                            <button class="btn btn-sm btn-secondary edit-snapshot-btn"
                                    data-character-id="${characterId}"
                                    data-snapshot-id="${snapshot.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger delete-snapshot-btn"
                                    data-character-id="${characterId}"
                                    data-snapshot-id="${snapshot.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="snapshot-body">
                        <div class="snapshot-stats">
                            <div class="stat-item">
                                <span class="stat-label">Level</span>
                                <span class="stat-value">${level}</span>
                            </div>
                            ${data.hp ? `
                                <div class="stat-item">
                                    <span class="stat-label">HP</span>
                                    <span class="stat-value">${data.hp.current}/${data.hp.max}</span>
                                </div>
                            ` : ''}
                            ${data.ac ? `
                                <div class="stat-item">
                                    <span class="stat-label">AC</span>
                                    <span class="stat-value">${data.ac}</span>
                                </div>
                            ` : ''}
                        </div>
                        ${snapshot.notes ? `
                            <div class="snapshot-notes">
                                <strong>Notes:</strong> ${snapshot.notes}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        },

        /**
         * Attach event listeners to snapshot action buttons
         * @param {string} characterId - Character ID
         */
        attachSnapshotListeners(characterId) {
            // Edit snapshot buttons
            document.querySelectorAll('.edit-snapshot-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const snapshotId = e.target.closest('[data-snapshot-id]').dataset.snapshotId;
                    this.openEditSnapshotModal(characterId, snapshotId);
                });
            });

            // Delete snapshot buttons
            document.querySelectorAll('.delete-snapshot-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const snapshotId = e.target.closest('[data-snapshot-id]').dataset.snapshotId;
                    this.confirmDeleteSnapshot(characterId, snapshotId);
                });
            });
        },

        /**
         * Close snapshots modal
         */
        closeSnapshotsModal() {
            const modal = document.getElementById('snapshots-modal-overlay');
            if (modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            }
            this.currentCharacter = null;
        },

        /**
         * Open add snapshot modal
         * @param {string} characterId - Character ID
         */
        openAddSnapshotModal(characterId) {
            if (window.AdminModals && window.AdminModals.snapshot) {
                window.AdminModals.snapshot.characterId = characterId;
                window.AdminModals.snapshot.open();
            } else {
                console.error('Snapshot modal not initialized');
            }
        },

        /**
         * Open edit snapshot modal
         * @param {string} characterId - Character ID
         * @param {string} snapshotId - Snapshot ID
         */
        async openEditSnapshotModal(characterId, snapshotId) {
            try {
                const character = await AdminDashboard.API.Characters.get(characterId);
                const snapshot = character.snapshots.find(s => s.id === snapshotId);

                if (window.AdminModals && window.AdminModals.snapshot) {
                    window.AdminModals.snapshot.characterId = characterId;
                    window.AdminModals.snapshot.open(snapshot);
                } else {
                    console.error('Snapshot modal not initialized');
                }
            } catch (error) {
                console.error('Error loading snapshot:', error);
                AdminDashboard.showToast('Error loading snapshot', 'error');
            }
        },

        /**
         * Filter characters by search term
         * @param {string} searchTerm - Search term
         */
        filterCharacters(searchTerm) {
            const characterCards = document.querySelectorAll('.character-card');
            const search = searchTerm.toLowerCase();

            characterCards.forEach(card => {
                const name = card.querySelector('h3').textContent.toLowerCase();
                const player = card.querySelector('.character-player')?.textContent.toLowerCase() || '';
                const details = card.querySelector('.character-details')?.textContent.toLowerCase() || '';

                if (name.includes(search) || player.includes(search) || details.includes(search)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        },

        /**
         * Confirm character deletion
         * @param {string} characterId - Character ID
         */
        confirmDelete(characterId) {
            if (confirm('Are you sure you want to delete this character? This action cannot be undone.')) {
                this._deleteCharacter(characterId);
            }
        },

        /**
         * Delete a character
         * @param {string} characterId - Character ID
         */
        async _deleteCharacter(characterId) {
            try {
                await AdminDashboard.API.Characters.delete(characterId);
                AdminDashboard.showToast('Character deleted successfully', 'success');
                this.loadCharacters();
            } catch (error) {
                console.error('Error deleting character:', error);
                AdminDashboard.showToast('Error deleting character', 'error');
            }
        },

        /**
         * Confirm snapshot deletion
         * @param {string} characterId - Character ID
         * @param {string} snapshotId - Snapshot ID
         */
        confirmDeleteSnapshot(characterId, snapshotId) {
            if (confirm('Are you sure you want to delete this snapshot? This action cannot be undone.')) {
                this._deleteSnapshot(characterId, snapshotId);
            }
        },

        /**
         * Delete a snapshot
         * @param {string} characterId - Character ID
         * @param {string} snapshotId - Snapshot ID
         */
        async _deleteSnapshot(characterId, snapshotId) {
            try {
                await AdminDashboard.API.Characters.deleteSnapshot(characterId, snapshotId);
                AdminDashboard.showToast('Snapshot deleted successfully', 'success');

                // Reload the snapshots view
                const character = await AdminDashboard.API.Characters.get(characterId);
                this.showSnapshotsView(character);
            } catch (error) {
                console.error('Error deleting snapshot:', error);
                AdminDashboard.showToast('Error deleting snapshot', 'error');
            }
        },

        /**
         * Create a new character
         * @param {Object} characterData - Character data
         */
        async _createCharacter(characterData) {
            try {
                await AdminDashboard.API.Characters.create(characterData);
                AdminDashboard.showToast('Character created successfully', 'success');
                this.loadCharacters();

                // Close modal
                if (window.AdminModals && window.AdminModals.character) {
                    window.AdminModals.character.close();
                }
            } catch (error) {
                console.error('Error creating character:', error);
                AdminDashboard.showToast('Error creating character', 'error');
            }
        },

        /**
         * Update a character
         * @param {Object} characterData - Character data (must include id)
         */
        async _updateCharacter(characterData) {
            try {
                await AdminDashboard.API.Characters.update(characterData.id, characterData);
                AdminDashboard.showToast('Character updated successfully', 'success');
                this.loadCharacters();

                // Close modal
                if (window.AdminModals && window.AdminModals.character) {
                    window.AdminModals.character.close();
                }
            } catch (error) {
                console.error('Error updating character:', error);
                AdminDashboard.showToast('Error updating character', 'error');
            }
        },

        /**
         * Create a new snapshot
         * @param {string} characterId - Character ID
         * @param {Object} snapshotData - Snapshot data
         */
        async _createSnapshot(characterId, snapshotData) {
            try {
                await AdminDashboard.API.Characters.createSnapshot(characterId, snapshotData);
                AdminDashboard.showToast('Snapshot added successfully', 'success');

                // Close modal
                if (window.AdminModals && window.AdminModals.snapshot) {
                    window.AdminModals.snapshot.close();
                }

                // Reload the snapshots view
                const character = await AdminDashboard.API.Characters.get(characterId);
                this.showSnapshotsView(character);
            } catch (error) {
                console.error('Error creating snapshot:', error);
                AdminDashboard.showToast('Error creating snapshot', 'error');
            }
        },

        /**
         * Update a snapshot
         * @param {string} characterId - Character ID
         * @param {Object} snapshotData - Snapshot data (must include id)
         */
        async _updateSnapshot(characterId, snapshotData) {
            try {
                await AdminDashboard.API.Characters.updateSnapshot(characterId, snapshotData.id, snapshotData);
                AdminDashboard.showToast('Snapshot updated successfully', 'success');

                // Close modal
                if (window.AdminModals && window.AdminModals.snapshot) {
                    window.AdminModals.snapshot.close();
                }

                // Reload the snapshots view
                const character = await AdminDashboard.API.Characters.get(characterId);
                this.showSnapshotsView(character);
            } catch (error) {
                console.error('Error updating snapshot:', error);
                AdminDashboard.showToast('Error updating snapshot', 'error');
            }
        },

        /**
         * Show bookmarklet instructions
         */
        async showBookmarkletInstructions() {
            // Load bookmarklet code
            try {
                const response = await fetch('/js/dndbeyond-bookmarklet.js');
                let bookmarkletCode = await response.text();

                // Replace API endpoint with actual website URL
                const actualOrigin = window.location.origin;
                bookmarkletCode = bookmarkletCode.replace(
                    /const API_ENDPOINT = window\.location\.origin \+ '\/admin\/api\/characters\/import-from-dndbeyond';/,
                    `const API_ENDPOINT = '${actualOrigin}/admin/api/characters/import-from-dndbeyond';`
                );

                // Skip minification to avoid breaking URLs and strings
                // Bookmarklets can handle the full source code
                const bookmarkletUrl = `javascript:${encodeURIComponent(bookmarkletCode)}`;

                // Create custom modal HTML
                const modalHTML = `
                    <div class="modal-overlay" id="bookmarklet-modal-overlay">
                        <div class="modal-dialog modal-lg">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h2>
                                        <i class="fas fa-dragon"></i>
                                        D&D Beyond Character Importer
                                    </h2>
                                    <button class="modal-close" id="close-bookmarklet-modal">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <div class="bookmarklet-instructions">
                                        <p><strong>How to use:</strong></p>
                                        <ol>
                                            <li>Drag the purple button below to your bookmarks bar</li>
                                            <li>Navigate to any D&D Beyond character sheet</li>
                                            <li>Click the bookmark to import the character</li>
                                        </ol>

                                        <div style="text-align: center; margin: 30px 0; padding: 20px; background: var(--bg-tertiary, #1f1f2e); border-radius: 8px;">
                                            <a href="${bookmarkletUrl}"
                                               id="bookmarklet-link"
                                               class="btn btn-lg btn-primary"
                                               style="font-size: 18px; padding: 15px 30px; text-decoration: none; cursor: move;">
                                                <i class="fas fa-dragon"></i> Import from D&D Beyond
                                            </a>
                                            <p style="margin-top: 15px; font-size: 14px; color: var(--text-secondary);">
                                                ⬆️ Drag this button to your bookmarks bar
                                            </p>
                                        </div>

                                        <div style="margin-top: 20px; padding: 15px; background: rgba(13, 110, 253, 0.1); border-left: 4px solid #0d6efd; border-radius: 4px;">
                                            <i class="fas fa-info-circle"></i>
                                            <strong>Note:</strong> Make sure you're logged in to this admin panel before using the bookmarklet.
                                        </div>

                                        <details style="margin-top: 20px;">
                                            <summary style="cursor: pointer; font-weight: bold; padding: 10px; background: var(--bg-secondary); border-radius: 4px;">
                                                <i class="fas fa-code"></i> Manual Installation
                                            </summary>
                                            <div style="margin-top: 10px; padding: 15px; background: var(--bg-tertiary, #1f1f2e); border-radius: 4px;">
                                                <p>If drag-and-drop doesn't work, follow these steps:</p>
                                                <ol>
                                                    <li>Create a new bookmark in your browser</li>
                                                    <li>Set the bookmark name to: <code>Import D&D Character</code></li>
                                                    <li>Copy the code below and paste it as the URL</li>
                                                </ol>
                                                <textarea id="bookmarklet-code" readonly style="width: 100%; height: 150px; font-family: monospace; font-size: 12px; margin-top: 10px; padding: 10px; background: #1a1a1a; color: #0f0; border: 1px solid #444; border-radius: 4px;">${bookmarkletUrl}</textarea>
                                                <button id="copy-bookmarklet" class="btn btn-secondary" style="margin-top: 10px;">
                                                    <i class="fas fa-copy"></i> Copy Code
                                                </button>
                                            </div>
                                        </details>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // Remove existing modal if any
                const existingModal = document.getElementById('bookmarklet-modal-overlay');
                if (existingModal) {
                    existingModal.remove();
                }

                // Add modal to DOM
                document.body.insertAdjacentHTML('beforeend', modalHTML);

                // Add event listeners
                document.getElementById('close-bookmarklet-modal').addEventListener('click', () => {
                    this.closeBookmarkletModal();
                });

                // Copy button
                const copyBtn = document.getElementById('copy-bookmarklet');
                const textarea = document.getElementById('bookmarklet-code');
                if (copyBtn && textarea) {
                    copyBtn.addEventListener('click', () => {
                        textarea.select();
                        document.execCommand('copy');
                        AdminDashboard.showToast('Bookmarklet code copied!', 'success');
                    });
                }

                // Show modal
                setTimeout(() => {
                    document.getElementById('bookmarklet-modal-overlay').classList.add('active');
                }, 10);

            } catch (error) {
                console.error('Error loading bookmarklet code:', error);
                AdminDashboard.showToast('Error loading bookmarklet', 'error');
            }
        },

        /**
         * Close bookmarklet modal
         */
        closeBookmarkletModal() {
            const modal = document.getElementById('bookmarklet-modal-overlay');
            if (modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            }
        }
    };

    // Initialize character management when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            AdminDashboard.Characters.init();
        });
    } else {
        // DOM already loaded
        setTimeout(() => AdminDashboard.Characters.init(), 100);
    }

})();
