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
        }
    },
    
    /**
     * Auth Module - Handle authentication
     */
    Auth: {
        async refreshToken() {
            try {
                const response = await fetch('/admin/api/refresh-token', {
                    method: 'POST',
                    headers: { 'Cache-Control': 'no-cache' },
                    credentials: 'include'
                });
                
                if (!response.ok) return false;
                
                const data = await response.json();
                return data.success;
            } catch (error) {
                console.error('Token refresh failed:', error);
                return false;
            }
        },
        
        redirectToLogin() {
            window.location.href = '/admin/login';
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