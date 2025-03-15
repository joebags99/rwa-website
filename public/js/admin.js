/**
 * Roll With Advantage - Admin Dashboard JavaScript
 * 
 * Restructured with a modular approach for better maintainability
 * - Organized code into logical modules
 * - Centralized authentication and error handling
 * - Improved performance with element caching
 * - Enhanced UX with better feedback mechanisms
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => AdminDashboard.init());

// Main Application Namespace
const AdminDashboard = {
    /**
     * UI Module - Handle all user interface components and interactions
     */
    UI: {
        // Cache DOM elements for performance
        elements: {},
        
        // Initialize UI components
        init() {
            this.cacheElements();
            this.initSidebar();
            this.initModals();
        },
        
        // Cache commonly used DOM elements
        cacheElements() {
            const elements = {
                sidebar: document.querySelector('.sidebar'),
                menuToggle: document.querySelector('.menu-toggle'),
                menuItems: document.querySelectorAll('.sidebar-menu li:not(.disabled)'),
                sections: document.querySelectorAll('.content-section'),
                sectionTitle: document.getElementById('current-section-title'),
                quickActions: document.querySelectorAll('.action-buttons a:not(.disabled)'),
                modals: document.querySelectorAll('.modal'),
                closeButtons: document.querySelectorAll('.close-btn, .modal .btn-secondary'),
                activityList: document.getElementById('recent-activity-list'),
                npcsCount: document.getElementById('npcs-count'),
                timelineCount: document.getElementById('timeline-count')
            };
            
            this.elements = elements;
            return elements;
        },
        
        /**
         * Sidebar and Navigation
         */
        initSidebar() {
            const { menuItems, sections, sectionTitle, quickActions, sidebar, menuToggle } = this.elements;
            
            // Handle menu item clicks
            menuItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    const sectionId = item.getAttribute('data-section');
                    
                    // Update active menu item
                    menuItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    
                    // Show the selected section
                    sections.forEach(section => {
                        section.classList.remove('active');
                        if (section.id === `${sectionId}-section`) {
                            section.classList.add('active');
                        }
                    });
                    
                    // Update section title
                    if (sectionTitle) {
                        sectionTitle.textContent = item.querySelector('a').textContent.trim();
                    }
                    
                    // Close sidebar on mobile after selection
                    if (window.innerWidth < 768 && sidebar.classList.contains('active')) {
                        sidebar.classList.remove('active');
                    }
                    
                    // Update URL hash without scrolling
                    const scrollPosition = window.scrollY;
                    window.location.hash = sectionId;
                    window.scrollTo(0, scrollPosition);
                });
            });
            
            // Handle hash changes for direct linking
            this.handleHashChange();
            window.addEventListener('hashchange', () => this.handleHashChange());
            
            // Quick action buttons on dashboard
            if (quickActions) {
                quickActions.forEach(action => {
                    action.addEventListener('click', (e) => {
                        e.preventDefault();
                        
                        const targetSection = action.getAttribute('data-target');
                        if (targetSection) {
                            const menuItem = document.querySelector(`.sidebar-menu li[data-section="${targetSection}"]`);
                            if (menuItem) {
                                menuItem.click();
                                
                                // If this is the NPCs section and has a "Create" button
                                if (targetSection === 'npcs' && action.textContent.includes('Create')) {
                                    // Click the create NPC button
                                    setTimeout(() => {
                                        const createNPCBtn = document.getElementById('create-npc-btn');
                                        if (createNPCBtn) createNPCBtn.click();
                                    }, 100);
                                }
                                
                                // If this is the Timeline section and has a "Create" button
                                if (targetSection === 'timeline' && action.textContent.includes('Add')) {
                                    // Click the create Timeline button
                                    setTimeout(() => {
                                        const createTimelineBtn = document.getElementById('create-timeline-btn');
                                        if (createTimelineBtn) createTimelineBtn.click();
                                    }, 100);
                                }
                            }
                        }
                    });
                });
            }
            
            // Mobile menu toggle
            if (menuToggle && sidebar) {
                menuToggle.addEventListener('click', () => {
                    sidebar.classList.toggle('active');
                });
                
                // Close sidebar when clicking outside
                document.addEventListener('click', (e) => {
                    if (
                        sidebar.classList.contains('active') && 
                        !sidebar.contains(e.target) && 
                        e.target !== menuToggle &&
                        !menuToggle.contains(e.target)
                    ) {
                        sidebar.classList.remove('active');
                    }
                });
            }
        },
        
        // Handle URL hash changes
        handleHashChange() {
            const hash = window.location.hash.substring(1);
            if (hash) {
                // Find the menu item with this section
                const menuItem = document.querySelector(`.sidebar-menu li[data-section="${hash}"]`);
                if (menuItem && !menuItem.classList.contains('disabled')) {
                    menuItem.click();
                }
            }
        },
        
        /**
         * Modal Management
         */
        initModals() {
            const { modals, closeButtons } = this.elements;
            
            // Close buttons for all modals
            closeButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const modal = btn.closest('.modal');
                    if (modal) {
                        this.closeModal(modal);
                    }
                });
            });
            
            // Close modal when clicking outside
            modals.forEach(modal => {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.closeModal(modal);
                    }
                });
            });
            
            // Close modal with Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const activeModal = document.querySelector('.modal.active');
                    if (activeModal) {
                        this.closeModal(activeModal);
                    }
                }
            });
        },
        
        // Open a modal
        openModal(modalId) {
            const modal = typeof modalId === 'string' 
                ? document.getElementById(modalId)
                : modalId;
                
            if (!modal) return;
            
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        },
        
        // Close a modal
        closeModal(modalId) {
            const modal = typeof modalId === 'string' 
                ? document.getElementById(modalId)
                : modalId;
                
            if (!modal) return;
            
            modal.classList.remove('active');
            document.body.style.overflow = '';
        },
        
        /**
         * Confirmation Modal
         */
        showConfirmation(options) {
            const modal = document.getElementById('confirm-modal');
            const title = document.getElementById('confirm-title');
            const message = document.getElementById('confirm-message');
            const confirmBtn = document.getElementById('confirm-ok');
            const cancelBtn = document.getElementById('confirm-cancel');
            
            if (!modal || !title || !message || !confirmBtn) return;
            
            // Set content
            title.textContent = options.title || 'Confirmation';
            message.textContent = options.message || 'Are you sure you want to perform this action?';
            confirmBtn.textContent = options.confirmText || 'Confirm';
            
            // Set button class
            confirmBtn.className = 'btn ' + (options.confirmClass || 'btn-danger');
            
            // Set confirm action
            const confirmHandler = () => {
                if (typeof options.onConfirm === 'function') {
                    options.onConfirm();
                }
                this.closeModal(modal);
                confirmBtn.removeEventListener('click', confirmHandler);
            };
            
            // Remove any existing event listeners
            const oldConfirm = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(oldConfirm, confirmBtn);
            
            // Add new event listener
            oldConfirm.addEventListener('click', confirmHandler);
            
            // Open the modal
            this.openModal(modal);
        },
        
        /**
         * Toast Notifications
         */
        showToast(type, message) {
            // Create toast element if it doesn't exist
            let toast = document.getElementById(`${type}-toast`);
            
            if (!toast) {
                toast = document.createElement('div');
                toast.id = `${type}-toast`;
                toast.className = `toast toast-${type}`;
                document.body.appendChild(toast);
                
                // Add styles if not already in CSS
                if (!document.getElementById('toast-styles')) {
                    const style = document.createElement('style');
                    style.id = 'toast-styles';
                    style.textContent = `
                        .toast {
                            position: fixed;
                            top: 20px;
                            right: 20px;
                            padding: 12px 20px;
                            border-radius: 4px;
                            color: white;
                            font-family: var(--font-body);
                            z-index: 9999;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                            transform: translateY(-10px);
                            opacity: 0;
                            transition: all 0.3s ease;
                        }
                        
                        .toast-success {
                            background-color: var(--admin-success);
                        }
                        
                        .toast-error {
                            background-color: var(--admin-danger);
                        }
                        
                        .toast-warning {
                            background-color: var(--admin-warning);
                        }
                        
                        .toast.show {
                            transform: translateY(0);
                            opacity: 1;
                        }
                    `;
                    document.head.appendChild(style);
                }
            }
            
            // Set message
            toast.textContent = message;
            
            // Show toast
            toast.classList.add('show');
            
            // Hide after 3 seconds
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    },
    
    /**
     * API Module - Handle all API communication
     */
    API: {
        async request(endpoint, options = {}) {
            try {
                // Set default headers
                const headers = {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                    ...(options.headers || {})
                };
                
                // Make request
                let response = await fetch(endpoint, {
                    ...options,
                    headers,
                    credentials: 'include'
                });
                
                // Handle authentication issues
                if (response.status === 401) {
                    console.log('Session expired, attempting to refresh...');
                    
                    // Try to refresh the token
                    const refreshResponse = await fetch('/admin/api/refresh-token', {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Cache-Control': 'no-cache' }
                    });

                    if (!refreshResponse.ok) {
                        console.log('Token refresh failed, redirecting to login...');
                        window.location.href = '/admin/login';
                        return;
                    }

                    // Retry the original request
                    response = await fetch(endpoint, {
                        ...options,
                        headers,
                        credentials: 'include'
                    });
                }
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `API error: ${response.status}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error(`API request failed: ${endpoint}`, error);
                if (error.message.includes('Failed to fetch')) {
                    window.location.href = '/admin/login';
                    return;
                }
                throw error;
            }
        },
        
        /**
         * NPC specific API methods
         */
        NPCs: {
            async getAll() {
                return AdminDashboard.API.request('/admin/api/npcs');
            },
            
            async create(npcData) {
                return AdminDashboard.API.request('/admin/api/npcs', {
                    method: 'POST',
                    body: JSON.stringify(npcData)
                });
            },
            
            async update(id, npcData) {
                return AdminDashboard.API.request(`/admin/api/npcs/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(npcData)
                });
            },
            
            async delete(id) {
                return AdminDashboard.API.request(`/admin/api/npcs/${id}`, {
                    method: 'DELETE'
                });
            }
        },
        
        /**
         * Timeline specific API methods
         */
        Timeline: {
            async getAll() {
                return AdminDashboard.API.request('/admin/api/timeline');
            },
            
            async create(timelineData) {
                return AdminDashboard.API.request('/admin/api/timeline', {
                    method: 'POST',
                    body: JSON.stringify(timelineData)
                });
            },
            
            async update(id, timelineData) {
                return AdminDashboard.API.request(`/admin/api/timeline/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(timelineData)
                });
            },
            
            async delete(id) {
                return AdminDashboard.API.request(`/admin/api/timeline/${id}`, {
                    method: 'DELETE'
                });
            }
        },
        
        /**
         * Activities API methods
         */
        Activities: {
            async getRecent() {
                return AdminDashboard.API.request('/admin/api/recent-activity');
            },
            
            async add(activity) {
                return AdminDashboard.API.request('/admin/api/recent-activity', {
                    method: 'POST',
                    body: JSON.stringify(activity)
                });
            }
        },
        
        /**
         * Settings API methods
         */
        Settings: {
            async changePassword(currentPassword, newPassword) {
                return AdminDashboard.API.request('/admin/api/change-password', {
                    method: 'POST',
                    body: JSON.stringify({ currentPassword, newPassword })
                });
            }
        },

        /**
         * Story Episodes specific API methods
         */
        StoryEpisodes: {
            async getAll() {
                return AdminDashboard.API.request('/admin/api/story-episodes');
            },
            
            async create(episodeData) {
                return AdminDashboard.API.request('/admin/api/story-episodes', {
                    method: 'POST',
                    body: JSON.stringify(episodeData)
                });
            },
            
            async update(id, episodeData) {
                return AdminDashboard.API.request(`/admin/api/story-episodes/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(episodeData)
                });
            },
            
            async delete(id) {
                return AdminDashboard.API.request(`/admin/api/story-episodes/${id}`, {
                    method: 'DELETE'
                });
            }
        }
    },
    
    /**
     * Auth Module - Handle authentication
     */
    Auth: {
        async refreshToken() {
            // Implementation of token refresh logic
            const response = await fetch('/admin/api/refresh-token', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Cache-Control': 'no-cache' }
            });
            return response.ok;
        }
    },
    
    /**
     * NPCs Module - NPC management functionality
     */
    NPCs: {
        data: [], // Local cache of NPC data
        elements: {},
        
        init() {
            this.cacheElements();
            this.bindEvents();
            this.loadNPCs();
        },
        
        cacheElements() {
            this.elements = {
                npcList: document.getElementById('npc-list'),
                createNPCBtn: document.getElementById('create-npc-btn'),
                npcModal: document.getElementById('npc-modal'),
                npcForm: document.getElementById('npc-form'),
                saveNPCBtn: document.getElementById('save-npc'),
                cancelNPCBtn: document.getElementById('cancel-npc'),
                npcSearch: document.getElementById('npc-search'),
                categoryFilter: document.getElementById('category-filter'),
                relationshipFilter: document.getElementById('relationship-filter'),
                modalTitle: document.getElementById('npc-modal-title')
            };
            
            return this.elements;
        },
        
        bindEvents() {
            const { 
                createNPCBtn, saveNPCBtn, cancelNPCBtn,
                npcSearch, categoryFilter, relationshipFilter
            } = this.elements;
            
            // Create NPC button
            if (createNPCBtn) {
                createNPCBtn.addEventListener('click', () => this.showCreateForm());
            }
            
            // Save NPC button
            if (saveNPCBtn) {
                saveNPCBtn.addEventListener('click', () => this.saveNPC());
            }
            
            // Cancel button 
            if (cancelNPCBtn) {
                cancelNPCBtn.addEventListener('click', () => {
                    AdminDashboard.UI.closeModal('npc-modal');
                });
            }
            
            // Search and filters
            if (npcSearch) {
                npcSearch.addEventListener('input', () => this.applyFilters());
            }
            
            if (categoryFilter) {
                categoryFilter.addEventListener('change', () => this.applyFilters());
            }
            
            if (relationshipFilter) {
                relationshipFilter.addEventListener('change', () => this.applyFilters());
            }
        },
        
        /**
         * Load NPCs from API
         */
        async loadNPCs() {
            const { npcList } = this.elements;
            
            try {
                // Show loading state
                if (npcList) {
                    npcList.innerHTML = `
                        <div class="loading-indicator">
                            <i class="fas fa-spinner fa-spin"></i>
                            <p>Loading NPCs...</p>
                        </div>
                    `;
                }
                
                // Fetch NPCs
                this.data = await AdminDashboard.API.NPCs.getAll();
                
                // Render NPC list
                this.renderNPCList();
                
                // Update dashboard stats
                AdminDashboard.updateDashboardStats();
                
            } catch (error) {
                console.error('Error loading NPCs:', error);
                
                if (npcList) {
                    npcList.innerHTML = `
                        <div class="error-message">
                            <p>Error loading NPCs. Please try again.</p>
                            <button class="btn btn-primary" onclick="AdminDashboard.NPCs.loadNPCs()">Retry</button>
                        </div>
                    `;
                }
                
                AdminDashboard.UI.showToast('error', 'Failed to load NPCs. Please try again.');
            }
        },
        
        /**
         * Show create NPC form
         */
        showCreateForm() {
            const { npcModal, modalTitle } = this.elements;
            
            // Reset form
            this.resetNPCForm();
            
            // Change modal title to Create
            if (modalTitle) {
                modalTitle.textContent = 'Create New NPC';
            }
            
            // Open modal
            AdminDashboard.UI.openModal(npcModal);
        },
        
        /**
         * Show edit NPC form
         */
        showEditForm(npc) {
            const { npcModal, modalTitle } = this.elements;
            
            // Change modal title to Edit
            if (modalTitle) {
                modalTitle.textContent = 'Edit NPC';
            }
            
            // Populate form
            this.populateNPCForm(npc);
            
            // Open modal
            AdminDashboard.UI.openModal(npcModal);
        },
        
        /**
         * Save NPC (create or update)
         */
        async saveNPC() {
            const { npcForm, saveNPCBtn } = this.elements;
            
            // Basic validation
            if (!this.validateNPCForm()) {
                return;
            }
            
            // Disable save button
            if (saveNPCBtn) {
                saveNPCBtn.disabled = true;
                saveNPCBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            }
            
            try {
                // Gather form data
                const npcId = document.getElementById('npc-id')?.value;
                const npcData = {
                    name: document.getElementById('npc-name')?.value.trim(),
                    importance: parseInt(document.getElementById('npc-importance')?.value),
                    appearance: document.getElementById('npc-appearance')?.value.trim(),
                    relationship: document.getElementById('npc-relationship')?.value,
                    category: document.getElementById('npc-category')?.value,
                    description: document.getElementById('npc-description')?.value.trim(),
                    quote: document.getElementById('npc-quote')?.value.trim(),
                    tags: document.getElementById('npc-tags')?.value.trim().split(',').map(tag => tag.trim().toLowerCase()),
                    imageSrc: document.getElementById('npc-image')?.value.trim() || 'assets/images/npcs/default.jpg'
                };
                
                let newOrUpdatedNPC;
                
                // Save to API
                if (npcId) {
                    // Update existing NPC
                    newOrUpdatedNPC = await AdminDashboard.API.NPCs.update(npcId, npcData);
                    
                    // Update local cache
                    const index = this.data.findIndex(npc => npc.id === npcId);
                    if (index !== -1) {
                        this.data[index] = newOrUpdatedNPC;
                    }
                    
                    // Show success message
                    AdminDashboard.UI.showToast('success', 'NPC updated successfully!');
                    
                    // Add to recent activity
                    await AdminDashboard.Activities.addActivity({
                        icon: 'fa-user-edit',
                        title: 'NPC Updated',
                        description: `Updated NPC: ${npcData.name}`,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    // Create new NPC
                    newOrUpdatedNPC = await AdminDashboard.API.NPCs.create(npcData);
                    
                    // Add to local cache
                    this.data.push(newOrUpdatedNPC);
                    
                    // Show success message
                    AdminDashboard.UI.showToast('success', 'NPC created successfully!');
                    
                    // Add to recent activity
                    await AdminDashboard.Activities.addActivity({
                        icon: 'fa-user-plus',
                        title: 'NPC Created',
                        description: `Created new NPC: ${npcData.name}`,
                        timestamp: new Date().toISOString()
                    });
                }
                
                // Close modal
                AdminDashboard.UI.closeModal('npc-modal');
                
                // Update list
                this.renderNPCList();
                
                // Update dashboard stats
                AdminDashboard.updateDashboardStats();
                
            } catch (error) {
                console.error('Error saving NPC:', error);
                AdminDashboard.UI.showToast('error', 'Error saving NPC. Please try again.');
            } finally {
                // Re-enable save button
                if (saveNPCBtn) {
                    saveNPCBtn.disabled = false;
                    saveNPCBtn.innerHTML = '<i class="fas fa-save"></i> Save NPC';
                }
            }
        },
        
        /**
         * Delete an NPC
         */
        async deleteNPC(id) {
            try {
                // Find NPC name before removing
                const deletedNPC = this.data.find(npc => npc.id === id);
                const npcName = deletedNPC ? deletedNPC.name : 'Unknown NPC';
                
                // Delete from API
                await AdminDashboard.API.NPCs.delete(id);
                
                // Remove from local cache
                this.data = this.data.filter(npc => npc.id !== id);
                
                // Update list
                this.renderNPCList();
                
                // Update dashboard stats
                AdminDashboard.updateDashboardStats();
                
                // Show success message
                AdminDashboard.UI.showToast('success', 'NPC deleted successfully!');
                
                // Add to recent activity
                await AdminDashboard.Activities.addActivity({
                    icon: 'fa-user-minus',
                    title: 'NPC Deleted',
                    description: `Deleted NPC: ${npcName}`,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                console.error('Error deleting NPC:', error);
                AdminDashboard.UI.showToast('error', 'Error deleting NPC. Please try again.');
            }
        },
        
        /**
         * Validate NPC form
         */
        validateNPCForm() {
            const { npcForm } = this.elements;
            if (!npcForm) return false;
            
            const requiredFields = npcForm.querySelectorAll('[required]');
            let valid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('error');
                    valid = false;
                } else {
                    field.classList.remove('error');
                }
            });
            
            return valid;
        },
        
        /**
         * Reset NPC form
         */
        resetNPCForm() {
            const { npcForm } = this.elements;
            if (!npcForm) return;
            
            // Clear the form
            npcForm.reset();
            
            // Reset hidden ID field
            const idField = document.getElementById('npc-id');
            if (idField) idField.value = '';
            
            // Reset any validation errors
            npcForm.querySelectorAll('.error').forEach(field => {
                field.classList.remove('error');
            });
        },
        
        /**
         * Populate NPC form for editing
         */
        populateNPCForm(npc) {
            if (!npc) return;
            
            // Set the form fields
            const fields = {
                'npc-id': npc.id,
                'npc-name': npc.name,
                'npc-importance': npc.importance,
                'npc-appearance': npc.appearance,
                'npc-relationship': npc.relationship,
                'npc-category': npc.category,
                'npc-description': npc.description,
                'npc-quote': npc.quote,
                'npc-tags': Array.isArray(npc.tags) ? npc.tags.join(', ') : npc.tags,
                'npc-image': npc.imageSrc || ''
            };
            
            // Update each field
            Object.entries(fields).forEach(([id, value]) => {
                const field = document.getElementById(id);
                if (field) field.value = value;
            });
        },
        
        /**
         * Apply filters to NPC list
         */
        applyFilters() {
            const { npcSearch, categoryFilter, relationshipFilter } = this.elements;
            
            const searchTerm = npcSearch?.value.trim() || '';
            const category = categoryFilter?.value || '';
            const relationship = relationshipFilter?.value || '';
            
            this.renderNPCList(searchTerm, category, relationship);
        },
        
        /**
         * Render NPC list with optional filters
         */
        renderNPCList(searchTerm = '', categoryFilter = '', relationshipFilter = '') {
            const { npcList } = this.elements;
            if (!npcList) return;
            
            // Filter NPCs if needed
            let filteredNPCs = this.data;
            
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                filteredNPCs = filteredNPCs.filter(npc => 
                    npc.name.toLowerCase().includes(term) || 
                    npc.description.toLowerCase().includes(term) ||
                    (Array.isArray(npc.tags) && npc.tags.some(tag => tag.toLowerCase().includes(term)))
                );
            }
            
            if (categoryFilter) {
                filteredNPCs = filteredNPCs.filter(npc => npc.category === categoryFilter);
            }
            
            if (relationshipFilter) {
                filteredNPCs = filteredNPCs.filter(npc => npc.relationship === relationshipFilter);
            }
            
            // No NPCs found
            if (filteredNPCs.length === 0) {
                npcList.innerHTML = `
                    <div class="empty-message">
                        <p>No NPCs found. ${searchTerm || categoryFilter || relationshipFilter ? 'Try adjusting your filters.' : 'Create your first NPC!'}</p>
                    </div>
                `;
                return;
            }
            
            // Clear list
            npcList.innerHTML = '';
            
            // Sort NPCs by importance (descending) and then by name
            filteredNPCs.sort((a, b) => {
                if (b.importance !== a.importance) {
                    return b.importance - a.importance;
                }
                return a.name.localeCompare(b.name);
            });
            
            // Add each NPC
            filteredNPCs.forEach(npc => {
                npcList.appendChild(this.createNPCListItem(npc));
            });
        },
        
        /**
         * Create NPC list item element
         */
        createNPCListItem(npc) {
            const npcItem = document.createElement('div');
            npcItem.className = 'npc-item';
            npcItem.setAttribute('data-id', npc.id);
            
            // Format importance as stars
            const importanceStars = '★'.repeat(npc.importance) + '☆'.repeat(3 - npc.importance);
            
            // Format category display
            const categoryDisplay = `<span class="npc-category category-${npc.category}">${npc.category}</span>`;
            
            // Format relationship display
            const relationshipDisplay = `<span class="npc-relation relation-${npc.relationship}">${npc.relationship}</span>`;
            
            // Check if image src is provided
            const imageSrc = npc.imageSrc || 'assets/images/npcs/default.jpg';
            
            npcItem.innerHTML = `
                <div class="npc-image">
                    <img src="${imageSrc}" alt="${npc.name}" onerror="this.src='assets/images/npcs/default.jpg'">
                </div>
                <div class="npc-info">
                    <h3 class="npc-name-title">${npc.name}</h3>
                    <div class="npc-meta">
                        <span class="npc-meta-item">
                            <i class="fas fa-star"></i>
                            <span class="npc-importance">${importanceStars}</span>
                        </span>
                        <span class="npc-meta-item">
                            <i class="fas fa-tv"></i>
                            <span>${npc.appearance || 'Unknown'}</span>
                        </span>
                        <span class="npc-meta-item">
                            ${relationshipDisplay}
                        </span>
                        <span class="npc-meta-item">
                            ${categoryDisplay}
                        </span>
                    </div>
                    <p class="npc-description">${npc.description || 'No description available.'}</p>
                </div>
                <div class="npc-actions">
                    <button class="action-btn edit" title="Edit NPC">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" title="Delete NPC">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            
            // Add event listeners
            const editBtn = npcItem.querySelector('.edit');
            if (editBtn) {
                editBtn.addEventListener('click', () => this.showEditForm(npc));
            }
            
            const deleteBtn = npcItem.querySelector('.delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    AdminDashboard.UI.showConfirmation({
                        title: 'Delete NPC',
                        message: `Are you sure you want to delete "${npc.name}"? This action cannot be undone.`,
                        confirmText: 'Delete',
                        confirmClass: 'btn-danger',
                        onConfirm: () => this.deleteNPC(npc.id)
                    });
                });
            }
            
            return npcItem;
        }
    },
    
    /**
     * Timeline Module - Timeline event management functionality
     */
    Timeline: {
        data: [], // Local cache of timeline data
        elements: {},
        
        init() {
            // Only initialize if we're on a page with timeline elements
            if (document.getElementById('timeline-section')) {
                this.cacheElements();
                this.bindEvents();
                this.loadTimelineEntries();
            }
        },
        
        cacheElements() {
            this.elements = {
                timelineList: document.getElementById('timeline-list'),
                createTimelineBtn: document.getElementById('create-timeline-btn'),
                createEventBtn: document.getElementById('create-event-btn'),
                createReignBtn: document.getElementById('create-reign-btn'),
                timelineModal: document.getElementById('timeline-modal'),
                timelineForm: document.getElementById('timeline-form'),
                saveTimelineBtn: document.getElementById('save-timeline'),
                cancelTimelineBtn: document.getElementById('cancel-timeline'),
                timelineSearch: document.getElementById('timeline-search'),
                eraFilter: document.getElementById('era-filter'),
                typeFilter: document.getElementById('type-filter'),
                modalTitle: document.getElementById('timeline-modal-title'),
                
                // Form fields
                timelineId: document.getElementById('timeline-id'),
                timelineType: document.getElementById('timeline-type'),
                timelineTitle: document.getElementById('timeline-title'),
                timelineEra: document.getElementById('timeline-era'),
                timelineYear: document.getElementById('timeline-year'),
                timelineMonth: document.getElementById('timeline-month'),
                timelineDay: document.getElementById('timeline-day'),
                timelineLocation: document.getElementById('timeline-location'),
                timelineDescription: document.getElementById('timeline-description'),
                timelineImage: document.getElementById('timeline-image'),
                timelinePosition: document.getElementById('timeline-position'),
                timelineBreakType: document.getElementById('timeline-break-type'),
                
                // Field containers for toggling visibility
                eventFields: document.getElementById('event-fields'),
                reignFields: document.getElementById('reign-fields')
            };
            
            return this.elements;
        },
        
        bindEvents() {
            // Only bind events if elements exist
            if (!this.elements.timelineList) return;
            
            const { 
                createTimelineBtn, createEventBtn, createReignBtn, 
                saveTimelineBtn, cancelTimelineBtn,
                timelineSearch, eraFilter, typeFilter,
                timelineType
            } = this.elements;
            
            // Dropdown behavior for create button
            if (createTimelineBtn) {
                createTimelineBtn.addEventListener('click', function() {
                    const dropdown = this.nextElementSibling;
                    if (!dropdown) return;
                    
                    dropdown.classList.toggle('active');
                    
                    // Close dropdown when clicking outside
                    document.addEventListener('click', function closeDropdown(e) {
                        if (!dropdown.contains(e.target) && e.target !== createTimelineBtn) {
                            dropdown.classList.remove('active');
                            document.removeEventListener('click', closeDropdown);
                        }
                    });
                });
            }
            
            // Create event button
            if (createEventBtn) {
                createEventBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showCreateForm('event');
                });
            }
            
            // Create reign break button
            if (createReignBtn) {
                createReignBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showCreateForm('reign-break');
                });
            }
            
            // Save timeline button
            if (saveTimelineBtn) {
                saveTimelineBtn.addEventListener('click', () => this.saveTimelineEntry());
            }
            
            // Cancel button 
            if (cancelTimelineBtn) {
                cancelTimelineBtn.addEventListener('click', () => {
                    AdminDashboard.UI.closeModal('timeline-modal');
                });
            }
            
            // Search and filters
            if (timelineSearch) {
                timelineSearch.addEventListener('input', () => this.applyFilters());
            }
            
            if (eraFilter) {
                eraFilter.addEventListener('change', () => this.applyFilters());
            }
            
            if (typeFilter) {
                typeFilter.addEventListener('change', () => this.applyFilters());
            }
            
            // Toggle fields based on entry type
            if (timelineType) {
                timelineType.addEventListener('change', () => this.toggleFormFields());
            }
        },
        
        /**
         * Load timeline entries from API
         */
        async loadTimelineEntries() {
            // Only continue if the timeline list element exists
            const { timelineList } = this.elements;
            if (!timelineList) return;
            
            try {
                // Show loading state
                timelineList.innerHTML = `
                    <div class="loading-indicator">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading timeline entries...</p>
                    </div>
                `;
                
                // Fetch timeline entries
                this.data = await AdminDashboard.API.Timeline.getAll();
                
                // Render timeline list
                this.renderTimelineList();
                
                // Update dashboard stats
                AdminDashboard.updateDashboardStats();
                
            } catch (error) {
                console.error('Error loading timeline entries:', error);
                
                timelineList.innerHTML = `
                    <div class="error-message">
                        <p>Error loading timeline entries. Please try again.</p>
                        <button class="btn btn-primary" onclick="AdminDashboard.Timeline.loadTimelineEntries()">Retry</button>
                    </div>
                `;
                
                AdminDashboard.UI.showToast('error', 'Failed to load timeline entries. Please try again.');
            }
        },
        
        /**
         * Show create form for timeline entry
         * @param {string} type - Type of entry ('event' or 'reign-break')
         */
        showCreateForm(type = 'event') {
            const { timelineModal, modalTitle, timelineType } = this.elements;
            if (!timelineModal || !timelineType) return;
            
            // Reset form
            this.resetTimelineForm();
            
            // Set type
            timelineType.value = type;
            
            // Toggle appropriate fields
            this.toggleFormFields();
            
            // Change modal title based on type
            if (modalTitle) {
                modalTitle.textContent = type === 'event' ? 'Add Timeline Event' : 'Add Reign Change';
            }
            
            // Open modal
            AdminDashboard.UI.openModal(timelineModal);
        },
        
        /**
         * Show edit form for timeline entry
         */
        showEditForm(entry) {
            const { timelineModal, modalTitle, timelineType } = this.elements;
            if (!timelineModal || !timelineType) return;
            
            // Change modal title based on type
            if (modalTitle) {
                modalTitle.textContent = entry.type === 'event' ? 'Edit Timeline Event' : 'Edit Reign Change';
            }
            
            // Set type
            timelineType.value = entry.type;
            
            // Populate form
            this.populateTimelineForm(entry);
            
            // Toggle appropriate fields
            this.toggleFormFields();
            
            // Open modal
            AdminDashboard.UI.openModal(timelineModal);
        },
        
        /**
         * Toggle form fields based on entry type
         */
        toggleFormFields() {
            const { timelineType, eventFields, reignFields } = this.elements;
            
            if (!timelineType || !eventFields || !reignFields) return;
            
            const type = timelineType.value;
            
            if (type === 'event') {
                eventFields.style.display = 'block';
                reignFields.style.display = 'none';
                
                // Set required fields
                if (this.elements.timelineLocation) 
                    this.elements.timelineLocation.required = true;
                if (this.elements.timelineDescription)
                    this.elements.timelineDescription.required = true;
                
                // Remove required from reign fields
                if (this.elements.timelineBreakType)
                    this.elements.timelineBreakType.required = false;
            } else {
                eventFields.style.display = 'none';
                reignFields.style.display = 'block';
                
                // Set required fields
                if (this.elements.timelineBreakType)
                    this.elements.timelineBreakType.required = true;
                
                // Remove required from event fields
                if (this.elements.timelineLocation)
                    this.elements.timelineLocation.required = false;
                if (this.elements.timelineDescription)
                    this.elements.timelineDescription.required = false;
            }
        },
        
        /**
         * Save timeline entry (create or update)
         */
        async saveTimelineEntry() {
            const { timelineForm, saveTimelineBtn } = this.elements;
            
            // Basic validation
            if (!this.validateTimelineForm()) {
                return;
            }
            
            // Disable save button
            if (saveTimelineBtn) {
                saveTimelineBtn.disabled = true;
                saveTimelineBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            }
            
            try {
                // Gather form data
                const entryId = this.elements.timelineId.value;
                const entryType = this.elements.timelineType.value;
                
                // Build common data object
                const entryData = {
                    type: entryType,
                    title: this.elements.timelineTitle.value.trim(),
                    era: this.elements.timelineEra.value,
                    year: parseInt(this.elements.timelineYear.value)
                };
                
                // Add month and day if provided
                if (this.elements.timelineMonth.value) {
                    entryData.month = parseInt(this.elements.timelineMonth.value);
                }
                
                if (this.elements.timelineDay.value) {
                    entryData.day = parseInt(this.elements.timelineDay.value);
                }
                
                // Add type-specific fields
                if (entryType === 'event') {
                    // Event-specific fields
                    entryData.location = this.elements.timelineLocation.value.trim();
                    entryData.description = this.elements.timelineDescription.value.trim();
                    
                    // Optional fields
                    if (this.elements.timelineImage.value.trim()) {
                        entryData.image = this.elements.timelineImage.value.trim();
                    }
                    
                    if (this.elements.timelinePosition.value) {
                        entryData.position = this.elements.timelinePosition.value;
                    }
                } else {
                    // Reign break-specific fields
                    entryData.breakType = this.elements.timelineBreakType.value;
                }
                
                let newOrUpdatedEntry;
                
                // Save to API
                if (entryId) {
                    // Update existing entry
                    newOrUpdatedEntry = await AdminDashboard.API.Timeline.update(entryId, entryData);
                    
                    // Update local cache
                    const index = this.data.findIndex(entry => entry.id === entryId);
                    if (index !== -1) {
                        this.data[index] = newOrUpdatedEntry;
                    }
                    
                    // Show success message
                    AdminDashboard.UI.showToast('success', 'Timeline entry updated successfully!');
                    
                    // Add to recent activity
                    await AdminDashboard.Activities.addActivity({
                        icon: 'fa-hourglass-half',
                        title: 'Timeline Entry Updated',
                        description: `Updated ${entryType === 'event' ? 'event' : 'reign change'}: ${entryData.title}`,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    // Create new entry
                    newOrUpdatedEntry = await AdminDashboard.API.Timeline.create(entryData);
                    
                    // Add to local cache
                    this.data.push(newOrUpdatedEntry);
                    
                    // Show success message
                    AdminDashboard.UI.showToast('success', 'Timeline entry created successfully!');
                    
                    // Add to recent activity
                    await AdminDashboard.Activities.addActivity({
                        icon: 'fa-hourglass-half',
                        title: 'Timeline Entry Created',
                        description: `Created new ${entryType === 'event' ? 'event' : 'reign change'}: ${entryData.title}`,
                        timestamp: new Date().toISOString()
                    });
                }
                
                // Close modal
                AdminDashboard.UI.closeModal('timeline-modal');
                
                // Update list
                this.renderTimelineList();
                
                // Update dashboard stats
                AdminDashboard.updateDashboardStats();
                
            } catch (error) {
                console.error('Error saving timeline entry:', error);
                AdminDashboard.UI.showToast('error', 'Error saving timeline entry. Please try again.');
            } finally {
                // Re-enable save button
                if (saveTimelineBtn) {
                    saveTimelineBtn.disabled = false;
                    saveTimelineBtn.innerHTML = '<i class="fas fa-save"></i> Save';
                }
            }
        },
        
        /**
         * Delete a timeline entry
         */
        async deleteTimelineEntry(id) {
            try {
                // Find entry name before removing
                const deletedEntry = this.data.find(entry => entry.id === id);
                const entryTitle = deletedEntry ? deletedEntry.title : 'Unknown entry';
                const entryType = deletedEntry ? deletedEntry.type : 'event';
                
                // Delete from API
                await AdminDashboard.API.Timeline.delete(id);
                
                // Remove from local cache
                this.data = this.data.filter(entry => entry.id !== id);
                
                // Update list
                this.renderTimelineList();
                
                // Update dashboard stats
                AdminDashboard.updateDashboardStats();
                
                // Show success message
                AdminDashboard.UI.showToast('success', 'Timeline entry deleted successfully!');
                
                // Add to recent activity
                await AdminDashboard.Activities.addActivity({
                    icon: 'fa-trash-alt',
                    title: 'Timeline Entry Deleted',
                    description: `Deleted ${entryType === 'event' ? 'event' : 'reign change'}: ${entryTitle}`,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                console.error('Error deleting timeline entry:', error);
                AdminDashboard.UI.showToast('error', 'Error deleting timeline entry. Please try again.');
            }
        },
        
        /**
         * Validate timeline form
         */
        validateTimelineForm() {
            const { timelineForm } = this.elements;
            if (!timelineForm) return false;
            
            const requiredFields = timelineForm.querySelectorAll('[required]');
            let valid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('error');
                    valid = false;
                } else {
                    field.classList.remove('error');
                }
            });
            
            return valid;
        },
        
        /**
         * Reset timeline form
         */
        resetTimelineForm() {
            const { timelineForm } = this.elements;
            if (!timelineForm) return;
            
            // Clear the form
            timelineForm.reset();
            
            // Reset hidden ID field
            const idField = document.getElementById('timeline-id');
            if (idField) idField.value = '';
            
            // Reset any validation errors
            timelineForm.querySelectorAll('.error').forEach(field => {
                field.classList.remove('error');
            });
        },
        
        /**
         * Populate timeline form for editing
         */
        populateTimelineForm(entry) {
            if (!entry) return;
            
            // Set common fields
            const fields = {
                'timeline-id': entry.id,
                'timeline-type': entry.type,
                'timeline-title': entry.title,
                'timeline-era': entry.era,
                'timeline-year': entry.year,
                'timeline-month': entry.month || '',
                'timeline-day': entry.day || '',
            };
            
            // Type-specific fields
            if (entry.type === 'event') {
                fields['timeline-location'] = entry.location || '';
                fields['timeline-description'] = entry.description || '';
                fields['timeline-image'] = entry.image || '';
                fields['timeline-position'] = entry.position || '';
            } else {
                fields['timeline-break-type'] = entry.breakType || 'reign-beginning';
            }
            
            // Update each field
            Object.entries(fields).forEach(([id, value]) => {
                const field = document.getElementById(id);
                if (field) field.value = value;
            });
        },
        
        /**
         * Apply filters to timeline list
         */
        applyFilters() {
            const { timelineSearch, eraFilter, typeFilter } = this.elements;
            
            const searchTerm = timelineSearch?.value.trim() || '';
            const era = eraFilter?.value || '';
            const type = typeFilter?.value || '';
            
            this.renderTimelineList(searchTerm, era, type);
        },
        
        /**
         * Render timeline list with optional filters
         */
        renderTimelineList(searchTerm = '', eraFilter = '', typeFilter = '') {
            const { timelineList } = this.elements;
            if (!timelineList) return;
            
            // Clone the data
            let filteredEntries = [...this.data];
            
            // Apply filters
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                filteredEntries = filteredEntries.filter(entry => 
                    entry.title.toLowerCase().includes(term) || 
                    (entry.description && entry.description.toLowerCase().includes(term)) ||
                    (entry.location && entry.location.toLowerCase().includes(term))
                );
            }
            
            if (eraFilter) {
                filteredEntries = filteredEntries.filter(entry => entry.era === eraFilter);
            }
            
            if (typeFilter) {
                filteredEntries = filteredEntries.filter(entry => entry.type === typeFilter);
            }
            
            // Sort by year then month
            filteredEntries.sort((a, b) => {
                // Primary sort by year (descending)
                if (a.year !== b.year) {
                    return b.year - a.year; // Newer first
                }
                
                // Secondary sort by month (descending)
                const monthA = a.month || 0;
                const monthB = b.month || 0;
                if (monthA !== monthB) {
                    return monthB - monthA;
                }
                
                // Tertiary sort by day (descending)
                const dayA = a.day || 0;
                const dayB = b.day || 0;
                if (dayA !== dayB) {
                    return dayB - dayA;
                }
                
                // If all dates are equal, reign-breaks come before events
                if (a.type !== b.type) {
                    return a.type === 'reign-break' ? -1 : 1;
                }
                
                return 0;
            });
            
            // No entries found
            if (filteredEntries.length === 0) {
                timelineList.innerHTML = `
                    <div class="empty-message">
                        <p>No timeline entries found. ${searchTerm || eraFilter || typeFilter ? 'Try adjusting your filters.' : 'Create your first timeline entry!'}</p>
                    </div>
                `;
                return;
            }
            
            // Clear list
            timelineList.innerHTML = '';
            
            // Add each entry
            filteredEntries.forEach(entry => {
                timelineList.appendChild(this.createTimelineListItem(entry));
            });
        },
        
        /**
         * Create timeline list item element
         */
        createTimelineListItem(entry) {
            const entryItem = document.createElement('div');
            entryItem.className = `timeline-item ${entry.type === 'reign-break' ? 'reign-item' : 'event-item'}`;
            entryItem.setAttribute('data-id', entry.id);
            
            // Format date display
            let dateDisplay = `Year ${entry.year} A.R.`;
            if (entry.month) {
                const monthNames = [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                ];
                dateDisplay = `${monthNames[entry.month - 1]}`;
                
                if (entry.day) {
                    dateDisplay += ` ${entry.day}`;
                }
                
                dateDisplay += `, ${entry.year} A.R.`;
            }
            
            // Format era display
            const eraMap = {
                'age-of-chains': 'The Age of Chains',
                'arcane-reckoning': 'The Age of Arcane Reckoning',
                'broken-sun': 'The Age of the Broken Sun',
                'silent-war': 'The Age of Silent War',
                'uncertainty': 'The Age of Uncertainty'
            };
            
            const eraDisplay = eraMap[entry.era] || entry.era;
            
            // Different displays for event vs reign break
            if (entry.type === 'event') {
                entryItem.innerHTML = `
                    <div class="timeline-item-icon">
                        <i class="fas fa-calendar-day"></i>
                    </div>
                    <div class="timeline-item-info">
                        <h3 class="timeline-item-title">${entry.title}</h3>
                        <div class="timeline-item-meta">
                            <span class="timeline-item-date">
                                <i class="fas fa-calendar"></i> ${dateDisplay}
                            </span>
                            <span class="timeline-item-era era-${entry.era}">
                                <i class="fas fa-history"></i> ${eraDisplay}
                            </span>
                            <span class="timeline-item-location">
                                <i class="fas fa-map-marker-alt"></i> ${entry.location || 'Unknown location'}
                            </span>
                        </div>
                        <p class="timeline-item-description">${entry.description ? entry.description.substring(0, 100) + '...' : 'No description'}</p>
                    </div>
                    <div class="timeline-item-actions">
                        <button class="action-btn edit" title="Edit timeline entry">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" title="Delete timeline entry">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
            } else {
                // Reign break display
                const breakTypeIcon = entry.breakType === 'reign-beginning' ? 
                    '<i class="fas fa-crown" style="color: gold;"></i>' :
                    '<i class="fas fa-crown-fallen" style="color: #C30A3D;"></i>';
                
                const breakTypeText = entry.breakType === 'reign-beginning' ? 
                    'Beginning of Reign' : 'End of Reign';
                
                entryItem.innerHTML = `
                    <div class="timeline-item-icon reign-icon">
                        <i class="fas fa-crown"></i>
                    </div>
                    <div class="timeline-item-info">
                        <h3 class="timeline-item-title">${entry.title}</h3>
                        <div class="timeline-item-meta">
                            <span class="timeline-item-date">
                                <i class="fas fa-calendar"></i> ${dateDisplay}
                            </span>
                            <span class="timeline-item-era era-${entry.era}">
                                <i class="fas fa-history"></i> ${eraDisplay}
                            </span>
                            <span class="timeline-item-type ${entry.breakType}">
                                ${breakTypeIcon} ${breakTypeText}
                            </span>
                        </div>
                    </div>
                    <div class="timeline-item-actions">
                        <button class="action-btn edit" title="Edit reign change">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" title="Delete reign change">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
            }
            
            // Add event listeners
            const editBtn = entryItem.querySelector('.edit');
            if (editBtn) {
                editBtn.addEventListener('click', () => this.showEditForm(entry));
            }
            
            const deleteBtn = entryItem.querySelector('.delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    AdminDashboard.UI.showConfirmation({
                        title: `Delete ${entry.type === 'event' ? 'Timeline Event' : 'Reign Change'}`,
                        message: `Are you sure you want to delete "${entry.title}"? This action cannot be undone.`,
                        confirmText: 'Delete',
                        confirmClass: 'btn-danger',
                        onConfirm: () => this.deleteTimelineEntry(entry.id)
                    });
                });
            }
            
            return entryItem;
        }
    },

    /**
 * Story Episodes Module - Story episode management functionality
 */
StoryEpisodes: {
    data: [], // Local cache of episode data
    elements: {},
    locations: [], // Tracks currently added locations for the form
    availableLocations: [], // List of all available locations from the server
    availableActs: [], // List of all available acts
    availableChapters: [], // List of all available chapters
    
    init() {
        // Only initialize if we're on a page with story elements
        if (document.getElementById('story-section')) {
            this.cacheElements();
            this.bindEvents();
            this.loadStoryEpisodes();
        }
    },
    
    cacheElements() {
        // Add these new elements to your existing elements object
        this.elements = {
            storyList: document.getElementById('story-list'),
            createStoryBtn: document.getElementById('create-story-btn'),
            storyModal: document.getElementById('story-modal'),
            storyForm: document.getElementById('story-form'),
            saveStoryBtn: document.getElementById('save-story'),
            cancelStoryBtn: document.getElementById('cancel-story'),
            storySearch: document.getElementById('story-search'),
            actFilter: document.getElementById('act-filter'),
            chapterFilter: document.getElementById('chapter-filter'),
            modalTitle: document.getElementById('story-modal-title'),
            
            // Form fields
            storyId: document.getElementById('story-id'),
            storyTitle: document.getElementById('story-title'),
            storyEpisodeNumber: document.getElementById('story-episode-number'),
            storyDateStart: document.getElementById('story-date-start'),
            storyDateEnd: document.getElementById('story-date-end'),
            storyAct: document.getElementById('story-act'),
            storyChapter: document.getElementById('story-chapter'),
            locationChips: document.getElementById('location-chips'),
            locationSearch: document.getElementById('location-search'),
            locationResults: document.getElementById('location-results'),
            manageLocationsBtn: document.getElementById('manage-locations-btn'),
            storyContent: document.getElementById('story-content'),
            storyImage: document.getElementById('story-image'),
            storyImageCaption: document.getElementById('story-image-caption'),
            
            // Locations modal elements
            locationsModal: document.getElementById('locations-modal'),
            closeLocationsModal: document.getElementById('close-locations-modal'),
            closeLocationsManager: document.getElementById('close-locations-manager'),
            newLocationId: document.getElementById('new-location-id'),
            newLocationName: document.getElementById('new-location-name'),
            addNewLocationBtn: document.getElementById('add-new-location-btn'),
            locationListSearch: document.getElementById('location-list-search'),
            locationsList: document.getElementById('locations-list'),

            // Act and Chapter manager elements
            manageActsBtn: document.getElementById('manage-acts-btn'),
            manageChaptersBtn: document.getElementById('manage-chapters-btn'),
            actsModal: document.getElementById('acts-modal'),
            chaptersModal: document.getElementById('chapters-modal'),
            closeActsModal: document.getElementById('close-acts-modal'),
            closeChaptersModal: document.getElementById('close-chapters-modal'),
            
            newActId: document.getElementById('new-act-id'),
            newActName: document.getElementById('new-act-name'),
            newActSubtitle: document.getElementById('new-act-subtitle'),
            actsList: document.getElementById('acts-list'),
            addActBtn: document.getElementById('add-act-btn'),
            
            newChapterId: document.getElementById('new-chapter-id'),
            newChapterName: document.getElementById('new-chapter-name'),
            newChapterSubtitle: document.getElementById('new-chapter-subtitle'),
            chaptersList: document.getElementById('chapters-list'),
            addChapterBtn: document.getElementById('add-chapter-btn'),
        };
        
        return this.elements;
    },
    
    bindEvents() {
        const { 
            createStoryBtn, saveStoryBtn, cancelStoryBtn,
            storySearch, actFilter, chapterFilter,
            locationSearch, locationResults, manageLocationsBtn,
            locationsModal, closeLocationsModal, closeLocationsManager,
            newLocationId, newLocationName, addNewLocationBtn,
            locationListSearch, locationsList,
            manageActsBtn, manageChaptersBtn, actsModal, chaptersModal,
            closeActsModal, closeChaptersModal, addActBtn, addChapterBtn
        } = this.elements;
        
        // Create episode button
        if (createStoryBtn) {
            createStoryBtn.addEventListener('click', () => this.showCreateForm());
        }
        
        // Save episode button
        if (saveStoryBtn) {
            saveStoryBtn.addEventListener('click', () => this.saveStoryEpisode());
        }
        
        // Cancel button 
        if (cancelStoryBtn) {
            cancelStoryBtn.addEventListener('click', () => {
                AdminDashboard.UI.closeModal('story-modal');
            });
        }
        
        // Location search
        if (locationSearch) {
            locationSearch.addEventListener('input', () => this.handleLocationSearch());
            locationSearch.addEventListener('focus', () => this.showLocationResults());
            
            // Hide results when clicking outside
            document.addEventListener('click', (e) => {
                if (!locationSearch.contains(e.target) && !locationResults.contains(e.target)) {
                    locationResults.classList.remove('show');
                }
            });
        }
        
        // Manage locations button
        if (manageLocationsBtn) {
            manageLocationsBtn.addEventListener('click', () => this.openLocationsManager());
        }
        
        // Locations modal close buttons
        if (closeLocationsModal) {
            closeLocationsModal.addEventListener('click', () => {
                AdminDashboard.UI.closeModal('locations-modal');
            });
        }
        
        if (closeLocationsManager) {
            closeLocationsManager.addEventListener('click', () => {
                AdminDashboard.UI.closeModal('locations-modal');
            });
        }
        
        // Add new location button
        if (addNewLocationBtn) {
            addNewLocationBtn.addEventListener('click', () => this.addNewLocation());
        }
        
        // Location list search
        if (locationListSearch) {
            locationListSearch.addEventListener('input', () => this.filterLocationsList());
        }
        
        // Search and filters for story list
        if (storySearch) {
            storySearch.addEventListener('input', () => this.applyFilters());
        }
        
        if (actFilter) {
            actFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (chapterFilter) {
            chapterFilter.addEventListener('change', () => this.applyFilters());
        }

        // Manage Acts button
        if (manageActsBtn) {
            manageActsBtn.addEventListener('click', () => this.openActsManager());
        }
        
        // Manage Chapters button
        if (manageChaptersBtn) {
            manageChaptersBtn.addEventListener('click', () => this.openChaptersManager());
        }
        
        // Close Acts modal button
        if (closeActsModal) {
            closeActsModal.addEventListener('click', () => {
                AdminDashboard.UI.closeModal('acts-modal');
            });
        }
        
        // Close Chapters modal button
        if (closeChaptersModal) {
            closeChaptersModal.addEventListener('click', () => {
                AdminDashboard.UI.closeModal('chapters-modal');
            });
        }
        
        // Add Act button
        if (addActBtn) {
            addActBtn.addEventListener('click', () => this.addNewAct());
        }
        
        // Add Chapter button
        if (addChapterBtn) {
            addChapterBtn.addEventListener('click', () => this.addNewChapter());
        }
    },
    
    /**
     * Load story episodes from API
     */
    async loadStoryEpisodes() {
        const { storyList } = this.elements;
        
        try {
            // Show loading state
            if (storyList) {
                storyList.innerHTML = `
                    <div class="loading-indicator">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading story episodes...</p>
                    </div>
                `;
            }
            
            // Fetch episodes
            this.data = await AdminDashboard.API.StoryEpisodes.getAll();
            
            // Fetch available locations
            await this.loadAvailableLocations();
            
            // Fetch available acts and chapters
            await this.loadAvailableActs();
            await this.loadAvailableChapters();
            
            // Render episode list
            this.renderStoryList();
            
            // Update dashboard stats
            AdminDashboard.updateDashboardStats();
            
        } catch (error) {
            console.error('Error loading story episodes:', error);
            
            if (storyList) {
                storyList.innerHTML = `
                    <div class="error-message">
                        <p>Error loading story episodes. Please try again.</p>
                        <button class="btn btn-primary" onclick="AdminDashboard.StoryEpisodes.loadStoryEpisodes()">Retry</button>
                    </div>
                `;
            }
            
            AdminDashboard.UI.showToast('error', 'Failed to load story episodes. Please try again.');
        }
    },
    
    /**
     * Load available locations from API
     */
    async loadAvailableLocations() {
        try {
            this.availableLocations = await AdminDashboard.API.request('/admin/api/locations');
            console.log(`Loaded ${this.availableLocations.length} locations`);
        } catch (error) {
            console.error('Error loading available locations:', error);
            AdminDashboard.UI.showToast('error', 'Failed to load locations. Please try again.');
            throw error; // Rethrow the error so it's caught by loadStoryEpisodes
        }
    },

    async loadAvailableActs() {
        try {
            this.availableActs = await AdminDashboard.API.request('/admin/api/acts');
            console.log(`Loaded ${this.availableActs.length} acts`);
            this.updateActsDropdown();
        } catch (error) {
            console.error('Error loading available acts:', error);
            AdminDashboard.UI.showToast('error', 'Failed to load acts. Please try again.');
        }
    },
    
    async loadAvailableChapters() {
        try {
            this.availableChapters = await AdminDashboard.API.request('/admin/api/chapters');
            console.log(`Loaded ${this.availableChapters.length} chapters`);
            this.updateChaptersDropdown();
        } catch (error) {
            console.error('Error loading available chapters:', error);
            AdminDashboard.UI.showToast('error', 'Failed to load chapters. Please try again.');
        }
    },
    
    updateActsDropdown() {
        const actDropdown = this.elements.storyAct;
        if (!actDropdown) return;
        
        // Save current selection
        const currentValue = actDropdown.value;
        
        // Clear dropdown
        actDropdown.innerHTML = '';
        
        // Add options
        this.availableActs.forEach(act => {
            const option = document.createElement('option');
            option.value = act.id;
            option.textContent = act.name;
            actDropdown.appendChild(option);
        });
        
        // Restore selection if possible
        if (this.availableActs.some(act => act.id === currentValue)) {
            actDropdown.value = currentValue;
        }
    },
    
    updateChaptersDropdown() {
        const chapterDropdown = this.elements.storyChapter;
        if (!chapterDropdown) return;
        
        // Save current selection
        const currentValue = chapterDropdown.value;
        
        // Clear dropdown
        chapterDropdown.innerHTML = '';
        
        // Add options
        this.availableChapters.forEach(chapter => {
            const option = document.createElement('option');
            option.value = chapter.id;
            option.textContent = chapter.name;
            chapterDropdown.appendChild(option);
        });
        
        // Restore selection if possible
        if (this.availableChapters.some(chapter => chapter.id === currentValue)) {
            chapterDropdown.value = currentValue;
        }
    },
    
    /**
     * Show create episode form
     */
    showCreateForm() {
        const { storyModal, modalTitle } = this.elements;
        
        // Reset form
        this.resetStoryForm();
        
        // Change modal title to Create
        if (modalTitle) {
            modalTitle.textContent = 'Create New Story Episode';
        }
        
        // Open modal
        AdminDashboard.UI.openModal(storyModal);
    },
    
    /**
     * Show edit episode form
     */
    showEditForm(episode) {
        const { storyModal, modalTitle } = this.elements;
        
        // Change modal title to Edit
        if (modalTitle) {
            modalTitle.textContent = 'Edit Story Episode';
        }
        
        // Populate form
        this.populateStoryForm(episode);
        
        // Open modal
        AdminDashboard.UI.openModal(storyModal);
    },
    
    /**
     * Save story episode (create or update)
     */
    async saveStoryEpisode() {
        const { storyForm, saveStoryBtn } = this.elements;
        
        // Basic validation
        if (!this.validateStoryForm()) {
            return;
        }
        
        // Disable save button
        if (saveStoryBtn) {
            saveStoryBtn.disabled = true;
            saveStoryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        }
        
        try {
            // Gather form data
            const episodeId = this.elements.storyId.value;
            
            // Find selected act and chapter
            const actId = this.elements.storyAct.value;
            const chapterId = this.elements.storyChapter.value;
            
            // Find the full act object
            const selectedAct = this.availableActs.find(act => act.id === actId) || {
                id: actId,
                name: 'Unknown Act',
                subtitle: ''
            };
            
            // Find the full chapter object
            const selectedChapter = this.availableChapters.find(chapter => chapter.id === chapterId) || {
                id: chapterId,
                name: 'Unknown Chapter',
                subtitle: ''
            };
            
            // Convert content to HTML paragraphs
            let contentHtml = '';
            const contentLines = this.elements.storyContent.value.trim().split('\n');
            for (const line of contentLines) {
                if (line.trim() !== '') {
                    contentHtml += `<p>${line.trim()}</p>`;
                }
            }
            
            // Use date end if provided, otherwise use date start
            const dateEnd = this.elements.storyDateEnd.value.trim() || this.elements.storyDateStart.value.trim();
            
            const episodeData = {
                title: this.elements.storyTitle.value.trim(),
                episodeNumber: parseInt(this.elements.storyEpisodeNumber.value),
                dateStart: this.elements.storyDateStart.value.trim(),
                dateEnd: dateEnd,
                act: {
                    id: selectedAct.id,
                    name: selectedAct.name,
                    subtitle: selectedAct.subtitle
                },
                chapter: {
                    id: selectedChapter.id,
                    name: selectedChapter.name,
                    subtitle: selectedChapter.subtitle
                },
                locations: this.locations,
                content: contentHtml,
                image: this.elements.storyImage.value.trim() || null,
                imageCaption: this.elements.storyImageCaption.value.trim() || null
            };
            
            let newOrUpdatedEpisode;
            
            // Save to API
            if (episodeId) {
                // Update existing episode
                newOrUpdatedEpisode = await AdminDashboard.API.StoryEpisodes.update(episodeId, episodeData);
                
                // Update local cache
                const index = this.data.findIndex(episode => episode.id === episodeId);
                if (index !== -1) {
                    this.data[index] = newOrUpdatedEpisode;
                }
                
                // Show success message
                AdminDashboard.UI.showToast('success', 'Story episode updated successfully!');
                
                // Add to recent activity
                await AdminDashboard.Activities.addActivity({
                    icon: 'fa-book-open',
                    title: 'Story Episode Updated',
                    description: `Updated story episode: ${episodeData.title}`,
                    timestamp: new Date().toISOString()
                });
            } else {
                // Create new episode
                newOrUpdatedEpisode = await AdminDashboard.API.StoryEpisodes.create(episodeData);
                
                // Add to local cache
                this.data.push(newOrUpdatedEpisode);
                
                // Show success message
                AdminDashboard.UI.showToast('success', 'Story episode created successfully!');
                
                // Add to recent activity
                await AdminDashboard.Activities.addActivity({
                    icon: 'fa-book-open',
                    title: 'Story Episode Created',
                    description: `Created new story episode: ${episodeData.title}`,
                    timestamp: new Date().toISOString()
                });
            }
            
            // Close modal
            AdminDashboard.UI.closeModal('story-modal');
            
            // Update list
            this.renderStoryList();
            
            // Update dashboard stats
            AdminDashboard.updateDashboardStats();
            
        } catch (error) {
            console.error('Error saving story episode:', error);
            AdminDashboard.UI.showToast('error', 'Error saving story episode. Please try again.');
        } finally {
            // Re-enable save button
            if (saveStoryBtn) {
                saveStoryBtn.disabled = false;
                saveStoryBtn.innerHTML = '<i class="fas fa-save"></i> Save Episode';
            }
        }
    },
    
    /**
     * Delete a story episode
     */
    async deleteStoryEpisode(id) {
        try {
            // Find episode name before removing
            const deletedEpisode = this.data.find(episode => episode.id === id);
            const episodeTitle = deletedEpisode ? deletedEpisode.title : 'Unknown episode';
            
            // Delete from API
            await AdminDashboard.API.request(`/admin/api/story-episodes/${id}`, {
                method: 'DELETE'
            });
            
            // Remove from local cache
            this.data = this.data.filter(episode => episode.id !== id);
            
            // Update list
            this.renderStoryList();
            
            // Update dashboard stats
            AdminDashboard.updateDashboardStats();
            
            // Show success message
            AdminDashboard.UI.showToast('success', 'Story episode deleted successfully!');
            
            // Add to recent activity
            await AdminDashboard.Activities.addActivity({
                icon: 'fa-trash-alt',
                title: 'Story Episode Deleted',
                description: `Deleted story episode: ${episodeTitle}`,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error deleting story episode:', error);
            AdminDashboard.UI.showToast('error', 'Error deleting story episode. Please try again.');
        }
    },
    
    /**
     * Handle location search within the story modal
     */
    handleLocationSearch() {
        const { locationSearch, locationResults } = this.elements;
        const searchTerm = locationSearch.value.trim().toLowerCase();
        
        // Clear previous results
        locationResults.innerHTML = '';
        
        if (!searchTerm) {
            locationResults.classList.remove('show');
            return;
        }
        
        // Filter locations by search term (match by ID or name)
        const matchingLocations = this.availableLocations.filter(loc => 
            loc.id.toLowerCase().includes(searchTerm) || 
            loc.name.toLowerCase().includes(searchTerm)
        );
        
        if (matchingLocations.length === 0) {
            locationResults.innerHTML = `
                <div class="location-result-item" style="cursor:default; color:var(--admin-text-muted);">
                    No matching locations found
                </div>
            `;
        } else {
            matchingLocations.forEach(loc => {
                const item = document.createElement('div');
                item.className = 'location-result-item';
                item.innerHTML = `
                    <span class="location-result-name">${loc.name}</span>
                    <span class="location-result-id">${loc.id}</span>
                `;
                item.addEventListener('click', () => this.selectLocation(loc));
                locationResults.appendChild(item);
            });
        }
        
        locationResults.classList.add('show');
    },
    
    /**
     * Show location search results dropdown
     */
    showLocationResults() {
        const { locationSearch, locationResults } = this.elements;
        const searchTerm = locationSearch.value.trim();
        
        // If a search term is already entered, show results
        if (searchTerm) {
            this.handleLocationSearch();
        } else {
            // Otherwise, show all available locations (limited to first 10)
            locationResults.innerHTML = '';
            
            const locationsToShow = this.availableLocations.slice(0, 10);
            
            if (locationsToShow.length === 0) {
                locationResults.innerHTML = `
                    <div class="location-result-item" style="cursor:default; color:var(--admin-text-muted);">
                        No locations available
                    </div>
                `;
            } else {
                locationsToShow.forEach(loc => {
                    const item = document.createElement('div');
                    item.className = 'location-result-item';
                    item.innerHTML = `
                        <span class="location-result-name">${loc.name}</span>
                        <span class="location-result-id">${loc.id}</span>
                    `;
                    item.addEventListener('click', () => this.selectLocation(loc));
                    locationResults.appendChild(item);
                });
                
                if (this.availableLocations.length > 10) {
                    const moreItem = document.createElement('div');
                    moreItem.className = 'location-result-item';
                    moreItem.style.textAlign = 'center';
                    moreItem.innerHTML = `<span>Type to search more locations...</span>`;
                    locationResults.appendChild(moreItem);
                }
            }
            
            locationResults.classList.add('show');
        }
    },
    
    /**
     * Select a location from the dropdown
     */
    selectLocation(location) {
        const { locationSearch, locationResults } = this.elements;
        
        // Check if location is already added
        if (this.locations.some(loc => loc.id === location.id)) {
            AdminDashboard.UI.showToast('warning', `Location "${location.name}" is already added`);
            return;
        }
        
        // Add to locations array
        this.locations.push(location);
        
        // Add chip to UI
        this.renderLocationChips();
        
        // Clear search field and hide results
        locationSearch.value = '';
        locationResults.classList.remove('show');
    },
    
    /**
     * Open the locations manager modal
     */
    openLocationsManager() {
        const { locationsModal, locationsList } = this.elements;
        
        // Show loading state
        locationsList.innerHTML = `
            <div class="loading-indicator">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading locations...</p>
            </div>
        `;
        
        // Open modal
        AdminDashboard.UI.openModal(locationsModal);
        
        // Fetch latest locations and render them
        this.loadAvailableLocations().then(() => {
            this.renderLocationsList();
        });
    },
    
    /**
     * Add a new location to the system
     */
    async addNewLocation() {
        const { newLocationId, newLocationName } = this.elements;
        
        const id = newLocationId.value.trim();
        const name = newLocationName.value.trim();
        
        // Validate inputs
        if (!id || !name) {
            AdminDashboard.UI.showToast('error', 'Please enter both location ID and name');
            return;
        }
        
        // Validate ID format (lowercase, hyphens, no spaces)
        if (!/^[a-z0-9-]+$/.test(id)) {
            AdminDashboard.UI.showToast('error', 'Location ID must contain only lowercase letters, numbers, and hyphens');
            return;
        }
        
        try {
            // Use the centralized API request method instead of direct fetch
            this.availableLocations = await AdminDashboard.API.request('/admin/api/locations', {
                method: 'POST',
                body: JSON.stringify({ id, name })
            });
            
            // Render updated list
            this.renderLocationsList();
            
            // Clear form
            newLocationId.value = '';
            newLocationName.value = '';
            
            // Show success message
            AdminDashboard.UI.showToast('success', `Location "${name}" added successfully`);
            
        } catch (error) {
            console.error('Error adding location:', error);
            AdminDashboard.UI.showToast('error', error.message || 'Failed to add location');
        }
    },
    
    /**
     * Render the list of available locations in the manager modal
     */
    renderLocationsList() {
        const { locationsList, locationListSearch } = this.elements;
        
        // Get search term if any
        const searchTerm = locationListSearch ? locationListSearch.value.trim().toLowerCase() : '';
        
        // Filter locations if search term is provided
        let locationsToShow = this.availableLocations;
        if (searchTerm) {
            locationsToShow = this.availableLocations.filter(loc => 
                loc.id.toLowerCase().includes(searchTerm) || 
                loc.name.toLowerCase().includes(searchTerm)
            );
        }
        
        // Clear list
        locationsList.innerHTML = '';
        
        // Show message if no locations
        if (locationsToShow.length === 0) {
            locationsList.innerHTML = `
                <div style="padding: 20px; text-align: center; color: var(--admin-text-muted);">
                    ${searchTerm ? 'No matching locations found' : 'No locations available'}
                </div>
            `;
            return;
        }
        
        // Add each location to the list
        locationsToShow.forEach(loc => {
            const item = document.createElement('div');
            item.className = 'location-item';
            item.innerHTML = `
                <div class="location-info">
                    <span class="location-info-name">${loc.name}</span>
                    <span class="location-info-id">${loc.id}</span>
                </div>
                <div class="location-action">
                    <button class="action-btn add-location" title="Add to episode">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            `;
            
            // Add event listener to the add button
            const addBtn = item.querySelector('.add-location');
            if (addBtn) {
                addBtn.addEventListener('click', () => {
                    this.selectLocation(loc);
                    AdminDashboard.UI.showToast('success', `Added "${loc.name}" to episode`);
                });
            }
            
            locationsList.appendChild(item);
        });
    },
    
    /**
     * Filter the locations list in the manager modal
     */
    filterLocationsList() {
        this.renderLocationsList();
    },
    
    /**
     * Remove a location from the form
     */
    removeLocation(id) {
        this.locations = this.locations.filter(loc => loc.id !== id);
        this.renderLocationChips();
    },
    
    /**
     * Render location chips in the form
     */
    renderLocationChips() {
        const { locationChips } = this.elements;
        if (!locationChips) return;
        
        locationChips.innerHTML = '';
        
        this.locations.forEach(loc => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.innerHTML = `
                <span class="chip-text">${loc.name} (${loc.id})</span>
                <button type="button" class="chip-remove" data-id="${loc.id}">×</button>
            `;
            locationChips.appendChild(chip);
            
            // Add remove event
            const removeBtn = chip.querySelector('.chip-remove');
            removeBtn.addEventListener('click', () => this.removeLocation(loc.id));
        });
    },
    
    /**
     * Validate story form
     */
    validateStoryForm() {
        const { storyForm } = this.elements;
        if (!storyForm) return false;
        
        const requiredFields = storyForm.querySelectorAll('[required]');
        let valid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                valid = false;
            } else {
                field.classList.remove('error');
            }
        });
        
        // Validate that at least one location is added
        if (this.locations.length === 0) {
            AdminDashboard.UI.showToast('error', 'Please add at least one location.');
            this.elements.locationSearch.classList.add('error');
            valid = false;
        }
        
        return valid;
    },
    
    /**
     * Reset story form
     */
    resetStoryForm() {
        const { storyForm } = this.elements;
        if (!storyForm) return;
        
        // Clear the form
        storyForm.reset();
        
        // Reset hidden ID field
        if (this.elements.storyId) {
            this.elements.storyId.value = '';
        }
        
        // Reset locations
        this.locations = [];
        this.renderLocationChips();
        
        // Reset any validation errors
        storyForm.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });
    },
    
    /**
     * Populate story form for editing
     */
    populateStoryForm(episode) {
        if (!episode) return;
        
        // Set basic fields
        this.elements.storyId.value = episode.id;
        this.elements.storyTitle.value = episode.title;
        this.elements.storyEpisodeNumber.value = episode.episodeNumber;
        this.elements.storyDateStart.value = episode.dateStart;
        this.elements.storyDateEnd.value = episode.dateEnd === episode.dateStart ? '' : episode.dateEnd;
        this.elements.storyAct.value = episode.act.id;
        this.elements.storyChapter.value = episode.chapter.id;
        
        // Set locations
        this.locations = episode.locations ? [...episode.locations] : [];
        this.renderLocationChips();
        
        // Set content - convert from HTML to plain text with line breaks
        let content = episode.content || '';
        content = content.replace(/<p>(.*?)<\/p>/g, '$1\n');
        this.elements.storyContent.value = content.trim();
        
        // Set image fields
        this.elements.storyImage.value = episode.image || '';
        this.elements.storyImageCaption.value = episode.imageCaption || '';
    },
    
    /**
     * Apply filters to story list
     */
    applyFilters() {
        const { storySearch, actFilter, chapterFilter } = this.elements;
        
        const searchTerm = storySearch?.value.trim().toLowerCase() || '';
        const act = actFilter?.value || '';
        const chapter = chapterFilter?.value || '';
        
        this.renderStoryList(searchTerm, act, chapter);
    },
    
    /**
     * Render story list with optional filters
     */
    renderStoryList(searchTerm = '', actFilter = '', chapterFilter = '') {
        const { storyList } = this.elements;
        if (!storyList) return;
        
        // Filter story episodes if needed
        let filteredEpisodes = [...this.data];
        
        // Apply filters
        if (searchTerm) {
            filteredEpisodes = filteredEpisodes.filter(episode => 
                episode.title.toLowerCase().includes(searchTerm) || 
                episode.content.toLowerCase().includes(searchTerm)
            );
        }
        
        if (actFilter) {
            filteredEpisodes = filteredEpisodes.filter(episode => 
                episode.act && episode.act.id === actFilter
            );
        }
        
        if (chapterFilter) {
            filteredEpisodes = filteredEpisodes.filter(episode => 
                episode.chapter && episode.chapter.id === chapterFilter
            );
        }
        
        // No episodes found
        if (filteredEpisodes.length === 0) {
            storyList.innerHTML = `
                <div class="empty-message">
                    <p>No story episodes found. ${searchTerm || actFilter || chapterFilter ? 'Try adjusting your filters.' : 'Create your first episode!'}</p>
                </div>
            `;
            return;
        }
        
        // Clear list
        storyList.innerHTML = '';
        
        // Sort by episode number
        filteredEpisodes.sort((a, b) => a.episodeNumber - b.episodeNumber);
        
        // Add each episode
        filteredEpisodes.forEach(episode => {
            storyList.appendChild(this.createStoryListItem(episode));
        });
    },
    
    /**
     * Create story list item element
     */
    createStoryListItem(episode) {
        const episodeItem = document.createElement('div');
        episodeItem.className = 'story-item';
        episodeItem.setAttribute('data-id', episode.id);
        
        // Location display
        const locationDisplay = episode.locations ? 
            episode.locations.map(loc => `<span class="location-tag">${loc.name}</span>`).join(' ') : 
            '';
        
        // Image badge
        const hasImageBadge = episode.image ? 
            `<span class="badge badge-info"><i class="fas fa-image"></i> Has Image</span>` : 
            '';
        
        // Date display
        const dateDisplay = episode.dateStart === episode.dateEnd ? 
            episode.dateStart : 
            `${episode.dateStart} - ${episode.dateEnd}`;
        
        episodeItem.innerHTML = `
            <div class="item-header">
                <div class="story-meta">
                    <span class="story-number">Session ${episode.episodeNumber}</span>
                    <span class="story-info">
                        <span class="badge badge-primary">${episode.act.name}</span>
                        <span class="badge badge-secondary">${episode.chapter.name}</span>
                        ${hasImageBadge}
                    </span>
                </div>
                <h3 class="story-title">${episode.title}</h3>
                <div class="story-date-locations">
                    <span class="story-date"><i class="fas fa-calendar-alt"></i> ${dateDisplay}</span>
                    <div class="story-locations">
                        <i class="fas fa-map-marker-alt"></i>
                        <div class="location-tags">${locationDisplay}</div>
                    </div>
                </div>
            </div>
            <div class="item-content">
                <div class="story-preview">${this.getContentPreview(episode.content)}</div>
            </div>
            <div class="item-actions">
                <button class="action-btn edit" title="Edit episode">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" title="Delete episode">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        const editBtn = episodeItem.querySelector('.edit');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.showEditForm(episode));
        }
        
        const deleteBtn = episodeItem.querySelector('.delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                AdminDashboard.UI.showConfirmation({
                    title: 'Delete Story Episode',
                    message: `Are you sure you want to delete "${episode.title}" (Session ${episode.episodeNumber})? This action cannot be undone.`,
                    confirmText: 'Delete',
                    confirmClass: 'btn-danger',
                    onConfirm: () => this.deleteStoryEpisode(episode.id)
                });
            });
        }
        
        return episodeItem;
    },
    
    /**
     * Get a preview of the content (strips HTML tags and limits length)
     */
    getContentPreview(content) {
        if (!content) return 'No content';
        
        // Strip HTML tags
        const strippedContent = content.replace(/<\/?[^>]+(>|$)/g, ' ');
        
        // Limit to 200 characters
        if (strippedContent.length > 200) {
            return strippedContent.substring(0, 200) + '...';
        }
        
        return strippedContent;
    },

    // Add these new methods for Acts management
    openActsManager() {
        const { actsModal, actsList } = this.elements;
        
        // Show loading state
        actsList.innerHTML = `
            <div class="loading-indicator">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading acts...</p>
            </div>
        `;
        
        // Open modal
        AdminDashboard.UI.openModal('acts-modal');
        
        // Render the acts list
        this.renderActsList();
    },
    
    renderActsList() {
        const { actsList } = this.elements;
        
        // Clear list
        actsList.innerHTML = '';
        
        // Show message if no acts
        if (this.availableActs.length === 0) {
            actsList.innerHTML = `
                <div class="empty-message">
                    <p>No acts available. Create your first act!</p>
                </div>
            `;
            return;
        }
        
        // Add each act to the list
        this.availableActs.forEach(act => {
            const item = document.createElement('div');
            item.className = 'act-item';
            item.innerHTML = `
                <div class="act-info">
                    <h4 class="act-name">${act.name}</h4>
                    <p class="act-subtitle">${act.subtitle || ''}</p>
                    <p class="act-id">ID: ${act.id}</p>
                </div>
            `;
            actsList.appendChild(item);
        });
    },
    
    async addNewAct() {
        const { newActId, newActName, newActSubtitle } = this.elements;
        
        const id = newActId.value.trim();
        const name = newActName.value.trim();
        const subtitle = newActSubtitle.value.trim();
        
        // Validate inputs
        if (!id || !name) {
            AdminDashboard.UI.showToast('error', 'Please enter both act ID and name');
            return;
        }
        
        // Validate ID format (lowercase, hyphens, no spaces)
        if (!/^[a-z0-9-]+$/.test(id)) {
            AdminDashboard.UI.showToast('error', 'Act ID must contain only lowercase letters, numbers, and hyphens');
            return;
        }
        
        try {
            this.availableActs = await AdminDashboard.API.request('/admin/api/acts', {
                method: 'POST',
                body: JSON.stringify({ id, name, subtitle })
            });
            
            // Update acts dropdown
            this.updateActsDropdown();
            
            // Render updated list
            this.renderActsList();
            
            // Clear form
            newActId.value = '';
            newActName.value = '';
            newActSubtitle.value = '';
            
            // Show success message
            AdminDashboard.UI.showToast('success', `Act "${name}" added successfully`);
            
        } catch (error) {
            console.error('Error adding act:', error);
            AdminDashboard.UI.showToast('error', error.message || 'Failed to add act');
        }
    },
    
    // Add these new methods for Chapters management
    openChaptersManager() {
        const { chaptersModal, chaptersList } = this.elements;
        
        // Show loading state
        chaptersList.innerHTML = `
            <div class="loading-indicator">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading chapters...</p>
            </div>
        `;
        
        // Open modal
        AdminDashboard.UI.openModal('chapters-modal');
        
        // Render the chapters list
        this.renderChaptersList();
    },
    
    renderChaptersList() {
        const { chaptersList } = this.elements;
        
        // Clear list
        chaptersList.innerHTML = '';
        
        // Show message if no chapters
        if (this.availableChapters.length === 0) {
            chaptersList.innerHTML = `
                <div class="empty-message">
                    <p>No chapters available. Create your first chapter!</p>
                </div>
            `;
            return;
        }
        
        // Add each chapter to the list
        this.availableChapters.forEach(chapter => {
            const item = document.createElement('div');
            item.className = 'chapter-item';
            item.innerHTML = `
                <div class="chapter-info">
                    <h4 class="chapter-name">${chapter.name}</h4>
                    <p class="chapter-subtitle">${chapter.subtitle || ''}</p>
                    <p class="chapter-id">ID: ${chapter.id}</p>
                </div>
            `;
            chaptersList.appendChild(item);
        });
    },
    
    async addNewChapter() {
        const { newChapterId, newChapterName, newChapterSubtitle } = this.elements;
        
        const id = newChapterId.value.trim();
        const name = newChapterName.value.trim();
        const subtitle = newChapterSubtitle.value.trim();
        
        // Validate inputs
        if (!id || !name) {
            AdminDashboard.UI.showToast('error', 'Please enter both chapter ID and name');
            return;
        }
        
        // Validate ID format (lowercase, hyphens, no spaces)
        if (!/^[a-z0-9-]+$/.test(id)) {
            AdminDashboard.UI.showToast('error', 'Chapter ID must contain only lowercase letters, numbers, and hyphens');
            return;
        }
        
        try {
            this.availableChapters = await AdminDashboard.API.request('/admin/api/chapters', {
                method: 'POST',
                body: JSON.stringify({ id, name, subtitle })
            });
            
            // Update chapters dropdown
            this.updateChaptersDropdown();
            
            // Render updated list
            this.renderChaptersList();
            
            // Clear form
            newChapterId.value = '';
            newChapterName.value = '';
            newChapterSubtitle.value = '';
            
            // Show success message
            AdminDashboard.UI.showToast('success', `Chapter "${name}" added successfully`);
            
        } catch (error) {
            console.error('Error adding chapter:', error);
            AdminDashboard.UI.showToast('error', error.message || 'Failed to add chapter');
        }
    }
},
    
    /**
     * Activities Module - Activity tracking
     */
    Activities: {
        /**
         * Load recent activities
         */
        async loadRecentActivities() {
            const activityList = document.getElementById('recent-activity-list');
            if (!activityList) return;
            
            try {
                const activities = await AdminDashboard.API.Activities.getRecent();
                
                // Clear current list
                activityList.innerHTML = '';
                
                if (activities.length === 0) {
                    activityList.innerHTML = `
                        <div class="activity-empty">
                            <p>No recent activity to display</p>
                        </div>
                    `;
                    return;
                }
                
                // Add each activity to the list
                activities.forEach(activity => {
                    const activityItem = this.createActivityItem(activity);
                    activityList.appendChild(activityItem);
                });
                
            } catch (error) {
                console.error('Error loading activities:', error);
                activityList.innerHTML = `
                    <div class="activity-empty">
                        <p>Failed to load recent activities</p>
                    </div>
                `;
            }
        },
        
        /**
         * Add a new activity
         */
        async addActivity(activity) {
            try {
                const savedActivity = await AdminDashboard.API.Activities.add(activity);
                this.updateActivityList(savedActivity);
                return savedActivity;
            } catch (error) {
                console.error('Error saving activity:', error);
                return null;
            }
        },
        
        /**
         * Update activity list with new activity
         */
        updateActivityList(activity) {
            const activityList = document.getElementById('recent-activity-list');
            if (!activityList) return;
            
            // Remove "no activities" message if present
            const emptyState = activityList.querySelector('.activity-empty');
            if (emptyState) {
                emptyState.remove();
            }
            
            // Create new activity item
            const activityItem = this.createActivityItem(activity);
            
            // Add to beginning of list
            activityList.insertBefore(activityItem, activityList.firstChild);
        },
        
        /**
         * Create activity list item
         */
        createActivityItem(activity) {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            // Handle both activity formats
            if (activity.icon && activity.title && activity.description) {
                // New format
                activityItem.innerHTML = `
                    <div class="activity-icon">
                        <i class="fas ${activity.icon}"></i>
                    </div>
                    <div class="activity-details">
                        <h4 class="activity-title">${activity.title}</h4>
                        <p class="activity-description">${activity.description}</p>
                        <p class="activity-time">${this.formatTimestamp(activity.timestamp)}</p>
                    </div>
                `;
            } else {
                // Old format
                const activityMaps = {
                    create: { icon: 'fa-user-plus', title: 'NPC Created' },
                    update: { icon: 'fa-user-edit', title: 'NPC Updated' },
                    delete: { icon: 'fa-user-minus', title: 'NPC Deleted' }
                };
                
                const activityInfo = activityMaps[activity.type] || { icon: 'fa-info-circle', title: 'Activity' };
                
                activityItem.innerHTML = `
                    <div class="activity-icon">
                        <i class="fas ${activityInfo.icon}"></i>
                    </div>
                    <div class="activity-details">
                        <h4 class="activity-title">${activityInfo.title}</h4>
                        <p class="activity-description">${activity.name || activity.description || ''}</p>
                        <p class="activity-time">${this.formatTimestamp(activity.timestamp)}</p>
                    </div>
                `;
            }
            
            return activityItem;
        },
        
        /**
         * Format timestamp for display
         */
        formatTimestamp(timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleString();
        }
    },
    
    /**
     * Settings Module - User settings
     */
    Settings: {
        init() {
            this.bindEvents();
        },
        
        bindEvents() {
            const changePasswordBtn = document.getElementById('change-password-btn');
            
            if (changePasswordBtn) {
                changePasswordBtn.addEventListener('click', () => this.changePassword());
            }
        },
        
        /**
         * Change password
         */
        async changePassword() {
            // Get password fields
            const currentPassword = document.getElementById('current-password')?.value;
            const newPassword = document.getElementById('new-password')?.value;
            const confirmPassword = document.getElementById('confirm-password')?.value;
            
            // Get message elements
            const successEl = document.getElementById('password-success');
            const errorEl = document.getElementById('password-error');
            
            // Clear any previous messages
            if (successEl) successEl.style.display = 'none';
            if (errorEl) errorEl.style.display = 'none';
            
            // Validate passwords
            if (!currentPassword) {
                this.showPasswordError('Please enter your current password');
                return;
            }
            
            if (!newPassword) {
                this.showPasswordError('Please enter a new password');
                return;
            }
            
            if (newPassword.length < 8) {
                this.showPasswordError('New password must be at least 8 characters long');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                this.showPasswordError('New passwords do not match');
                return;
            }
            
            // Get button for loading state
            const changePasswordBtn = document.getElementById('change-password-btn');
            
            // Disable button
            if (changePasswordBtn) {
                changePasswordBtn.disabled = true;
                changePasswordBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
            }
            
            try {
                const result = await AdminDashboard.API.Settings.changePassword(currentPassword, newPassword);
                
                if (result.success) {
                    // Show success message
                    if (successEl) {
                        successEl.style.display = 'block';
                    }
                    
                    // Clear password fields
                    const fields = ['current-password', 'new-password', 'confirm-password'];
                    fields.forEach(id => {
                        const field = document.getElementById(id);
                        if (field) field.value = '';
                    });
                    
                    // Add to recent activity
                    await AdminDashboard.Activities.addActivity({
                        icon: 'fa-key',
                        title: 'Password Changed',
                        description: 'Password was successfully updated',
                        timestamp: new Date().toISOString()
                    });
                    
                    AdminDashboard.UI.showToast('success', 'Password changed successfully!');
                } else {
                    this.showPasswordError(result.error || 'Failed to change password');
                }
            } catch (error) {
                console.error('Error changing password:', error);
                this.showPasswordError('Server error. Please try again.');
                AdminDashboard.UI.showToast('error', 'Failed to change password. Please try again.');
            } finally {
                // Re-enable button
                if (changePasswordBtn) {
                    changePasswordBtn.disabled = false;
                    changePasswordBtn.innerHTML = '<i class="fas fa-save"></i> Update Password';
                }
            }
        },
        
        /**
         * Show password error message
         */
        showPasswordError(message) {
            const errorElement = document.getElementById('password-error');
            if (!errorElement) return;
            
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            // Scroll to error
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Also show toast for better visibility
            AdminDashboard.UI.showToast('error', message);
        }
    },
    
    /**
     * Update dashboard statistics
     */
    async updateDashboardStats() {
        try {
            const npcsCount = document.getElementById('npcs-count');
            if (npcsCount) {
                // Set count from cached data if available
                if (this.NPCs.data && this.NPCs.data.length > 0) {
                    npcsCount.textContent = this.NPCs.data.length;
                } else {
                    // Otherwise fetch from API
                    const npcs = await this.API.NPCs.getAll();
                    npcsCount.textContent = npcs.length;
                }
            }
            
            const timelineCount = document.getElementById('timeline-count');
            if (timelineCount && this.Timeline.data) {
                timelineCount.textContent = this.Timeline.data.length;
            }
        } catch (error) {
            console.error('Error updating dashboard stats:', error);
        }
    },
    
    /**
     * Main initialization function
     */
    init() {
        // Initialize UI first
        this.UI.init();
        
        // Initialize feature modules
        this.NPCs.init();
        this.Timeline.init();
        this.StoryEpisodes.init(); // Add this line to initialize the StoryEpisodes module
        this.Settings.init();
        
        // Load activities
        this.Activities.loadRecentActivities();

        // Set up session refresh interval
        setInterval(async () => {
            try {
                const response = await fetch('/admin/api/refresh-token', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Cache-Control': 'no-cache' }
                });
                
                if (!response.ok) {
                    console.log('Session refresh failed');
                    window.location.href = '/admin/login';
                }
            } catch (error) {
                console.error('Session refresh error:', error);
            }
        }, 4 * 60 * 1000); // Refresh every 4 minutes
    }
};