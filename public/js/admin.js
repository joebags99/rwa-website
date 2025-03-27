/**
 * Roll With Advantage - Admin Dashboard
 * 
 * Core JavaScript for the Roll With Advantage admin interface
 * Structured with modular architecture for maintainability and performance
 * 
 * Version: 2.0.0
 * Author: Roll With Advantage Development Team
 * Last Updated: 2025-03-17
 */

// Use strict mode for better error catching and prevention of common mistakes
'use strict';

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the Admin Dashboard with error handling
    try {
        AdminDashboard.init();
        
    } catch (error) {
        console.error('Failed to initialize Admin Dashboard:', error);
        // Show error message to user
        const errorMessage = `
            <div class="admin-error-message">
                <h3>Dashboard Initialization Error</h3>
                <p>There was a problem loading the dashboard. Please refresh the page or contact support.</p>
                <button onclick="location.reload()">Refresh Page</button>
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', errorMessage);
    }
});

/**
 * Main AdminDashboard Namespace
 * All dashboard functionality is contained within this object to prevent global namespace pollution
 */
window.AdminDashboard = {

    /**
     * Configuration settings for the dashboard
     */
    config: {
        // Session refresh interval in milliseconds (4 minutes)
        sessionRefreshInterval: 4 * 60 * 1000,
        
        // Default toast notification display time in milliseconds
        toastDisplayTime: 3000,
        
        // API endpoints
        apiEndpoints: {
            base: '/admin/api',
            auth: {
                refreshToken: '/admin/api/refresh-token',
                changePassword: '/admin/api/change-password'
            },
            npcs: '/admin/api/npcs',
            timeline: '/admin/api/timeline',
            storyEpisodes: '/admin/api/story-episodes',
            articles: '/admin/api/articles',
            recentActivity: '/admin/api/recent-activity',
            locations: '/admin/api/locations',
            acts: '/admin/api/acts',
            chapters: '/admin/api/chapters'
        }
    },

    /**
     * UI Module - Handle all user interface components and interactions
     */
    UI: {
        // Store cached DOM elements
        elements: {},
        
        // Track event listeners for proper cleanup
        eventListeners: [],
        
        /**
         * Initialize UI components
         * @returns {Object} - The UI module for chaining
         */
        init() {
            try {
                this.cacheElements();
                this.initSidebar();
                this.initModals();
                this.setupGlobalListeners();
                return this;
            } catch (error) {
                console.error('UI initialization error:', error);
                throw new Error('Failed to initialize UI module');
            }
        },
        
        /**
         * Cache commonly used DOM elements for performance
         * @returns {Object} - Object containing cached elements
         */
        cacheElements() {
            try {
                const elements = {
                    // Main UI elements
                    sidebar: document.querySelector('.sidebar'),
                    menuToggle: document.querySelector('.menu-toggle'),
                    menuItems: document.querySelectorAll('.sidebar-menu li:not(.disabled)'),
                    sections: document.querySelectorAll('.content-section'),
                    sectionTitle: document.getElementById('current-section-title'),
                    quickActions: document.querySelectorAll('.action-buttons a:not(.disabled)'),
                    
                    // Modal elements
                    modals: document.querySelectorAll('.modal'),
                    closeButtons: document.querySelectorAll('.close-btn, .modal .btn-secondary'),
                    
                    // Dashboard statistics elements
                    activityList: document.getElementById('recent-activity-list'),
                    npcsCount: document.getElementById('npcs-count'),
                    timelineCount: document.getElementById('timeline-count'),
                    storyCount: document.getElementById('story-count'),
                    articlesCount: document.getElementById('articles-count')
                };
                
                // Log missing critical elements
                const criticalElements = ['sidebar', 'menuItems', 'sections'];
                criticalElements.forEach(key => {
                    if (!elements[key] || (elements[key] instanceof NodeList && elements[key].length === 0)) {
                        console.warn(`Critical UI element not found: ${key}`);
                    }
                });
                
                this.elements = elements;
                return elements;
            } catch (error) {
                console.error('Error caching DOM elements:', error);
                this.elements = {};
                throw new Error('Failed to cache DOM elements');
            }
        },
        
        /**
         * Setup global event listeners
         */
        setupGlobalListeners() {
            // Handle escape key for modals
            this.addEventListenerWithCleanup(document, 'keydown', (e) => {
                if (e.key === 'Escape') {
                    const activeModal = document.querySelector('.modal.active');
                    if (activeModal) {
                        this.closeModal(activeModal);
                    }
                }
            });
            
            // Handle window resize
            this.addEventListenerWithCleanup(window, 'resize', this.handleResize.bind(this));
            
            // Initial resize handling
            this.handleResize();
        },
        
        /**
         * Add event listener with tracking for later cleanup
         * @param {Element} element - DOM element to attach listener to
         * @param {string} eventType - Type of event (click, change, etc.)
         * @param {Function} handler - Event handler function
         * @param {Object} options - Optional event listener options
         */
        addEventListenerWithCleanup(element, eventType, handler, options) {
            if (!element) {
                console.warn(`Cannot add ${eventType} listener to undefined element`);
                return;
            }
            
            element.addEventListener(eventType, handler, options);
            
            this.eventListeners.push({
                element,
                eventType,
                handler,
                options
            });
        },
        
        /**
         * Remove all tracked event listeners
         */
        removeAllEventListeners() {
            this.eventListeners.forEach(({ element, eventType, handler, options }) => {
                element.removeEventListener(eventType, handler, options);
            });
            
            this.eventListeners = [];
        },
        
        /**
         * Handle window resize events
         */
        handleResize() {
            const isMobile = window.innerWidth < 768;
            
            // Close sidebar on mobile if open
            if (isMobile && this.elements.sidebar && this.elements.sidebar.classList.contains('active')) {
                this.elements.sidebar.classList.remove('active');
            }
            
            // Add responsive classes to body
            document.body.classList.toggle('is-mobile', isMobile);
            document.body.classList.toggle('is-desktop', !isMobile);
        },
        
        /**
         * Initialize sidebar and navigation
         */
        initSidebar() {
            const { menuItems, sections, sectionTitle, quickActions, sidebar, menuToggle } = this.elements;
            
            // Skip if required elements are missing
            if (!menuItems || !sections) {
                console.warn('Sidebar initialization skipped: required elements not found');
                return;
            }
            
            // Handle menu item clicks
            menuItems.forEach(item => {
                this.addEventListenerWithCleanup(item, 'click', (e) => {
                    e.preventDefault();
                    
                    const sectionId = item.getAttribute('data-section');
                    if (!sectionId) {
                        console.warn('Menu item clicked with no data-section attribute');
                        return;
                    }
                    
                    // Update active menu item
                    menuItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    
                    // Show the selected section
                    let sectionFound = false;
                    sections.forEach(section => {
                        section.classList.remove('active');
                        if (section.id === `${sectionId}-section`) {
                            section.classList.add('active');
                            sectionFound = true;
                        }
                    });
                    
                    if (!sectionFound) {
                        console.warn(`Section not found for: ${sectionId}`);
                    }
                    
                    // Update section title
                    if (sectionTitle) {
                        const itemLink = item.querySelector('a');
                        sectionTitle.textContent = itemLink ? itemLink.textContent.trim() : sectionId;
                    }
                    
                    // Close sidebar on mobile after selection
                    if (window.innerWidth < 768 && sidebar && sidebar.classList.contains('active')) {
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
            this.addEventListenerWithCleanup(window, 'hashchange', () => this.handleHashChange());
            
            // Quick action buttons on dashboard
            if (quickActions && quickActions.length > 0) {
                quickActions.forEach(action => {
                    this.addEventListenerWithCleanup(action, 'click', (e) => {
                        e.preventDefault();
                        
                        const targetSection = action.getAttribute('data-target');
                        if (!targetSection) {
                            console.warn('Quick action has no data-target attribute');
                            return;
                        }
                        
                        // Trigger click on corresponding menu item
                        const menuItem = document.querySelector(`.sidebar-menu li[data-section="${targetSection}"]`);
                        if (menuItem) {
                            menuItem.click();
                            
                            // Handle special cases for "Create" actions
                            this.handleQuickActionSpecialCases(targetSection, action);
                        } else {
                            console.warn(`No menu item found for target: ${targetSection}`);
                        }
                    });
                });
            }
            
            // Mobile menu toggle
            if (menuToggle && sidebar) {
                this.addEventListenerWithCleanup(menuToggle, 'click', () => {
                    sidebar.classList.toggle('active');
                });
                
                // Close sidebar when clicking outside
                this.addEventListenerWithCleanup(document, 'click', (e) => {
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
        
        /**
         * Handle special cases for quick action buttons
         * @param {string} targetSection - The target section identifier
         * @param {Element} action - The quick action element
         */
        handleQuickActionSpecialCases(targetSection, action) {
            // Check if the action text includes specific keywords
            const actionText = action.textContent.toLowerCase();
            
            setTimeout(() => {
                // Handle NPC creation
                if (targetSection === 'npcs' && actionText.includes('create')) {
                    const createNPCBtn = document.getElementById('create-npc-btn');
                    if (createNPCBtn) {
                        createNPCBtn.click();
                    } else {
                        console.warn('Create NPC button not found');
                    }
                }
                
                // Handle Timeline creation
                if (targetSection === 'timeline' && (actionText.includes('add') || actionText.includes('create'))) {
                    const createTimelineBtn = document.getElementById('create-timeline-btn');
                    if (createTimelineBtn) {
                        createTimelineBtn.click();
                    } else {
                        console.warn('Create Timeline button not found');
                    }
                }
                
                // Handle Story Episode creation
                if (targetSection === 'story' && (actionText.includes('add') || actionText.includes('create'))) {
                    const createStoryBtn = document.getElementById('create-story-btn');
                    if (createStoryBtn) {
                        createStoryBtn.click();
                    } else {
                        console.warn('Create Story button not found');
                    }
                }
                
                // Handle Article creation
                if (targetSection === 'articles' && (actionText.includes('add') || actionText.includes('create'))) {
                    const createArticleBtn = document.getElementById('create-article-btn');
                    if (createArticleBtn) {
                        createArticleBtn.click();
                    } else {
                        console.warn('Create Article button not found');
                    }
                }
            }, 100); // Small delay to ensure section is fully loaded
        },
        
        /**
         * Handle URL hash changes
         */
        handleHashChange() {
            const hash = window.location.hash.substring(1);
            if (!hash) {
                return;
            }
            
            // Find the menu item with this section
            const menuItem = document.querySelector(`.sidebar-menu li[data-section="${hash}"]`);
            if (menuItem && !menuItem.classList.contains('disabled')) {
                // Only trigger click if not already active
                if (!menuItem.classList.contains('active')) {
                    menuItem.click();
                }
            } else {
                console.warn(`No enabled menu item found for hash: ${hash}`);
            }
        },
        
        /**
         * Initialize modals
         */
        initModals() {
            const { modals, closeButtons } = this.elements;
            
            if (!modals || !closeButtons) {
                console.warn('Modal initialization skipped: required elements not found');
                return;
            }
            
            // Close buttons for all modals
            closeButtons.forEach(btn => {
                this.addEventListenerWithCleanup(btn, 'click', () => {
                    const modal = btn.closest('.modal');
                    if (modal) {
                        this.closeModal(modal);
                    } else {
                        console.warn('No parent modal found for close button');
                    }
                });
            });
            
            // Close modal when clicking outside
            modals.forEach(modal => {
                this.addEventListenerWithCleanup(modal, 'click', (e) => {
                    if (e.target === modal) {
                        this.closeModal(modal);
                    }
                });
            });
        },
        
        /**
         * Open a modal
         * @param {string|Element} modalIdentifier - Modal ID or DOM element
         * @returns {Element|null} - The opened modal element or null if not found
         */
        openModal(modalIdentifier) {
            try {
                const modal = this.getModalElement(modalIdentifier);
                
                if (!modal) {
                    console.warn(`Modal not found: ${modalIdentifier}`);
                    return null;
                }
                
                // Close any other open modals
                document.querySelectorAll('.modal.active').forEach(openModal => {
                    if (openModal !== modal) {
                        this.closeModal(openModal);
                    }
                });
                
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Trigger a custom event for other components to listen to
                modal.dispatchEvent(new CustomEvent('modal:opened', {
                    bubbles: true,
                    detail: { modalId: modal.id }
                }));
                
                return modal;
            } catch (error) {
                console.error('Error opening modal:', error);
                return null;
            }
        },
        
        /**
         * Close a modal
         * @param {string|Element} modalIdentifier - Modal ID or DOM element
         * @returns {Element|null} - The closed modal element or null if not found
         */
        closeModal(modalIdentifier) {
            try {
                const modal = this.getModalElement(modalIdentifier);
                
                if (!modal) {
                    console.warn(`Modal not found: ${modalIdentifier}`);
                    return null;
                }
                
                modal.classList.remove('active');
                
                // Only restore scrolling if no other modals are open
                if (document.querySelectorAll('.modal.active').length === 0) {
                    document.body.style.overflow = '';
                }
                
                // Trigger a custom event for other components to listen to
                modal.dispatchEvent(new CustomEvent('modal:closed', {
                    bubbles: true,
                    detail: { modalId: modal.id }
                }));
                
                return modal;
            } catch (error) {
                console.error('Error closing modal:', error);
                return null;
            }
        },
        
        /**
         * Get modal element from identifier
         * @param {string|Element} modalIdentifier - Modal ID or DOM element
         * @returns {Element|null} - The modal element or null if not found
         */
        getModalElement(modalIdentifier) {
            if (!modalIdentifier) {
                return null;
            }
            
            if (typeof modalIdentifier === 'string') {
                return document.getElementById(modalIdentifier);
            }
            
            return modalIdentifier;
        },
        
        /**
         * Show confirmation dialog
         * @param {Object} options - Configuration options
         * @param {string} options.title - Dialog title
         * @param {string} options.message - Dialog message
         * @param {string} options.confirmText - Text for confirm button
         * @param {string} options.confirmClass - CSS class for confirm button
         * @param {Function} options.onConfirm - Callback for confirmation
         * @param {Function} options.onCancel - Callback for cancellation
         * @returns {Element|null} - The modal element or null if not found
         */
        showConfirmation(options = {}) {
            try {
                const modal = document.getElementById('confirm-modal');
                const title = document.getElementById('confirm-title');
                const message = document.getElementById('confirm-message');
                const confirmBtn = document.getElementById('confirm-ok');
                const cancelBtn = document.getElementById('confirm-cancel');
                
                if (!modal || !title || !message || !confirmBtn) {
                    console.error('Confirmation modal elements not found');
                    return null;
                }
                
                // Set content
                title.textContent = options.title || 'Confirmation';
                message.textContent = options.message || 'Are you sure you want to perform this action?';
                confirmBtn.textContent = options.confirmText || 'Confirm';
                
                // Set button class
                confirmBtn.className = 'btn ' + (options.confirmClass || 'btn-danger');
                
                // Remove any existing event listeners by cloning
                const newConfirmBtn = confirmBtn.cloneNode(true);
                const newCancelBtn = cancelBtn ? cancelBtn.cloneNode(true) : null;
                
                confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
                if (cancelBtn && newCancelBtn) {
                    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
                }
                
                // Add confirmation handler
                this.addEventListenerWithCleanup(newConfirmBtn, 'click', () => {
                    if (typeof options.onConfirm === 'function') {
                        options.onConfirm();
                    }
                    this.closeModal(modal);
                });
                
                // Add cancel handler
                if (newCancelBtn) {
                    this.addEventListenerWithCleanup(newCancelBtn, 'click', () => {
                        if (typeof options.onCancel === 'function') {
                            options.onCancel();
                        }
                        this.closeModal(modal);
                    });
                }
                
                // Open the modal
                return this.openModal(modal);
            } catch (error) {
                console.error('Error showing confirmation dialog:', error);
                return null;
            }
        },
        
        /**
         * Show toast notification
         * @param {string} type - Toast type (success, error, warning)
         * @param {string} message - Toast message
         * @param {number} duration - Display duration in milliseconds
         */
        showToast(type, message, duration) {
            try {
                if (!type || !message) {
                    console.warn('Toast notification requires type and message');
                    return;
                }
                
                // Valid toast types
                const validTypes = ['success', 'error', 'warning', 'info'];
                if (!validTypes.includes(type)) {
                    type = 'info';
                }
                
                // Create or get toast container
                let toastContainer = document.getElementById('toast-container');
                if (!toastContainer) {
                    toastContainer = document.createElement('div');
                    toastContainer.id = 'toast-container';
                    document.body.appendChild(toastContainer);
                    
                    // Add container styles if needed
                    if (!document.getElementById('toast-container-styles')) {
                        const style = document.createElement('style');
                        style.id = 'toast-container-styles';
                        style.textContent = `
                            #toast-container {
                                position: fixed;
                                top: 20px;
                                right: 20px;
                                z-index: 9999;
                                display: flex;
                                flex-direction: column;
                                gap: 10px;
                            }
                        `;
                        document.head.appendChild(style);
                    }
                }
                
                // Create toast element
                const toast = document.createElement('div');
                toast.className = `toast toast-${type}`;
                toast.textContent = message;
                
                // Add styles if not already in CSS
                if (!document.getElementById('toast-styles')) {
                    const style = document.createElement('style');
                    style.id = 'toast-styles';
                    style.textContent = `
                        .toast {
                            padding: 12px 20px;
                            border-radius: 4px;
                            color: white;
                            font-family: var(--font-body);
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                            transform: translateY(-10px);
                            opacity: 0;
                            transition: all 0.3s ease;
                            max-width: 400px;
                        }
                        
                        .toast-success {
                            background-color: var(--admin-success, #28a745);
                        }
                        
                        .toast-error {
                            background-color: var(--admin-danger, #dc3545);
                        }
                        
                        .toast-warning {
                            background-color: var(--admin-warning, #ffc107);
                            color: #333;
                        }
                        
                        .toast-info {
                            background-color: var(--admin-info, #17a2b8);
                        }
                        
                        .toast.show {
                            transform: translateY(0);
                            opacity: 1;
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                // Add toast to container
                toastContainer.appendChild(toast);
                
                // Show toast (after small delay to ensure CSS transition works)
                setTimeout(() => {
                    toast.classList.add('show');
                }, 10);
                
                // Set auto-hide timeout
                const toastDuration = duration || AdminDashboard.config.toastDisplayTime;
                
                setTimeout(() => {
                    // Hide toast
                    toast.classList.remove('show');
                    
                    // Remove after transition
                    setTimeout(() => {
                        if (toast.parentNode) {
                            toast.parentNode.removeChild(toast);
                        }
                    }, 300);
                }, toastDuration);
            } catch (error) {
                console.error('Error showing toast notification:', error);
            }
        }
    },
    
    /**
     * API Module - Handle all API communication
     */
    API: {
        /**
         * Make an API request with standardized error handling
         * @param {string} endpoint - API endpoint
         * @param {Object} options - Fetch options
         * @returns {Promise<Object>} - Parsed JSON response
         * @throws {Error} - If the request fails
         */
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
                    
                    
                    // Try to refresh the token
                    const refreshSuccess = await this.refreshToken();
                    
                    if (!refreshSuccess) {
                        
                        this.redirectToLogin();
                        throw new Error('Authentication failed');
                    }
                    
                    // Retry the original request
                    response = await fetch(endpoint, {
                        ...options,
                        headers,
                        credentials: 'include'
                    });
                }
                
                // Handle other error statuses
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.error || `API error: ${response.status}`;
                    
                    // Log detailed error information
                    console.error('API request failed:', {
                        endpoint,
                        status: response.status,
                        statusText: response.statusText,
                        errorData
                    });
                    
                    throw new Error(errorMessage);
                }
                
                // Parse response as JSON
                const data = await response.json();
                return data;
            } catch (error) {
                // Handle network errors
                if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
                    console.error('Network error - Could not connect to API:', endpoint);
                    AdminDashboard.UI.showToast('error', 'Network error. Please check your connection.');
                    
                    // Only redirect to login for authentication errors, not all network errors
                    if (endpoint.includes('/refresh-token')) {
                        this.redirectToLogin();
                    }
                } else {
                    // Log and display other errors
                    console.error(`API request error [${endpoint}]:`, error);
                    
                    // Only show toast for non-auth errors, as auth errors will redirect
                    if (!endpoint.includes('/refresh-token')) {
                        AdminDashboard.UI.showToast('error', error.message || 'An error occurred. Please try again.');
                    }
                }
                
                throw error;
            }
        },
        
        /**
         * Refresh authentication token
         * @returns {Promise<boolean>} - True if refresh was successful
         */
        async refreshToken() {
            try {
                const response = await fetch(AdminDashboard.config.apiEndpoints.auth.refreshToken, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Cache-Control': 'no-cache' }
                });
                
                return response.ok;
            } catch (error) {
                console.error('Token refresh error:', error);
                return false;
            }
        },
        
        /**
         * Redirect to login page
         */
        redirectToLogin() {
            // Save current page for redirect after login
            const currentPath = window.location.pathname + window.location.hash;
            sessionStorage.setItem('adminReturnTo', currentPath);
            
            // Redirect to login
            window.location.href = '/admin/login';
        },
        
        /**
         * NPC API methods
         */
        NPCs: {
            /**
             * Get all NPCs
             * @returns {Promise<Array>} - Array of NPC objects
             */
            async getAll() {
                return AdminDashboard.API.request(AdminDashboard.config.apiEndpoints.npcs);
            },
            
            /**
             * Create a new NPC
             * @param {Object} npcData - NPC data
             * @returns {Promise<Object>} - Created NPC
             */
            async create(npcData) {
                return AdminDashboard.API.request(AdminDashboard.config.apiEndpoints.npcs, {
                    method: 'POST',
                    body: JSON.stringify(npcData)
                });
            },
            
            /**
             * Update an existing NPC
             * @param {string} id - NPC ID
             * @param {Object} npcData - NPC data
             * @returns {Promise<Object>} - Updated NPC
             */
            async update(id, npcData) {
                return AdminDashboard.API.request(`${AdminDashboard.config.apiEndpoints.npcs}/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(npcData)
                });
            },
            
            /**
             * Delete an NPC
             * @param {string} id - NPC ID
             * @returns {Promise<Object>} - API response
             */
            async delete(id) {
                return AdminDashboard.API.request(`${AdminDashboard.config.apiEndpoints.npcs}/${id}`, {
                    method: 'DELETE'
                });
            }
        },
        
        /**
         * Timeline API methods
         */
        Timeline: {
            /**
             * Get all timeline entries
             * @returns {Promise<Array>} - Array of timeline entries
             */
            async getAll() {
                return AdminDashboard.API.request(AdminDashboard.config.apiEndpoints.timeline);
            },
            
            /**
             * Create a new timeline entry
             * @param {Object} timelineData - Timeline entry data
             * @returns {Promise<Object>} - Created timeline entry
             */
            async create(timelineData) {
                return AdminDashboard.API.request(AdminDashboard.config.apiEndpoints.timeline, {
                    method: 'POST',
                    body: JSON.stringify(timelineData)
                });
            },
            
            /**
             * Update an existing timeline entry
             * @param {string} id - Timeline entry ID
             * @param {Object} timelineData - Timeline entry data
             * @returns {Promise<Object>} - Updated timeline entry
             */
            async update(id, timelineData) {
                return AdminDashboard.API.request(`${AdminDashboard.config.apiEndpoints.timeline}/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(timelineData)
                });
            },
            
            /**
             * Delete a timeline entry
             * @param {string} id - Timeline entry ID
             * @returns {Promise<Object>} - API response
             */
            async delete(id) {
                return AdminDashboard.API.request(`${AdminDashboard.config.apiEndpoints.timeline}/${id}`, {
                    method: 'DELETE'
                });
            }
        },
        
        /**
         * Story Episodes API methods
         */
        StoryEpisodes: {
            /**
             * Get all story episodes
             * @returns {Promise<Array>} - Array of story episodes
             */
            async getAll() {
                return AdminDashboard.API.request(AdminDashboard.config.apiEndpoints.storyEpisodes);
            },
            
            /**
             * Create a new story episode
             * @param {Object} episodeData - Episode data
             * @returns {Promise<Object>} - Created episode
             */
            async create(episodeData) {
                return AdminDashboard.API.request(AdminDashboard.config.apiEndpoints.storyEpisodes, {
                    method: 'POST',
                    body: JSON.stringify(episodeData)
                });
            },
            
            /**
             * Update an existing story episode
             * @param {string} id - Episode ID
             * @param {Object} episodeData - Episode data
             * @returns {Promise<Object>} - Updated episode
             */
            async update(id, episodeData) {
                return AdminDashboard.API.request(`${AdminDashboard.config.apiEndpoints.storyEpisodes}/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(episodeData)
                });
            },
            
            /**
             * Delete a story episode
             * @param {string} id - Episode ID
             * @returns {Promise<Object>} - API response
             */
            async delete(id) {
                return AdminDashboard.API.request(`${AdminDashboard.config.apiEndpoints.storyEpisodes}/${id}`, {
                    method: 'DELETE'
                });
            }
        },
        
        /**
         * Articles API methods
         */
        Articles: {
            /**
             * Get all articles
             * @returns {Promise<Array>} - Array of articles
             */
            async getAll() {
                return AdminDashboard.API.request(AdminDashboard.config.apiEndpoints.articles);
            },
            
            /**
             * Create a new article
             * @param {Object} articleData - Article data
             * @returns {Promise<Object>} - Created article
             */
            async create(articleData) {
                return AdminDashboard.API.request(AdminDashboard.config.apiEndpoints.articles, {
                    method: 'POST',
                    body: JSON.stringify(articleData)
                });
            },
            
            /**
             * Update an existing article
             * @param {string} id - Article ID
             * @param {Object} articleData - Article data
             * @returns {Promise<Object>} - Updated article
             */
            async update(id, articleData) {
                return AdminDashboard.API.request(`${AdminDashboard.config.apiEndpoints.articles}/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(articleData)
                });
            },
            
            /**
             * Delete an article
             * @param {string} id - Article ID
             * @returns {Promise<Object>} - API response
             */
            async delete(id) {
                return AdminDashboard.API.request(`${AdminDashboard.config.apiEndpoints.articles}/${id}`, {
                    method: 'DELETE'
                });
            }
        },
        
        /**
         * Activities API methods
         */
        Activities: {
            /**
             * Get recent activities
             * @returns {Promise<Array>} - Array of activity objects
             */
            async getRecent() {
                return AdminDashboard.API.request(AdminDashboard.config.apiEndpoints.recentActivity);
            },
            
            /**
             * Add a new activity
             * @param {Object} activity - Activity data
             * @returns {Promise<Object>} - Created activity
             */
            async add(activity) {
                return AdminDashboard.API.request(AdminDashboard.config.apiEndpoints.recentActivity, {
                    method: 'POST',
                    body: JSON.stringify(activity)
                });
            }
        },
        
        /**
         * Settings API methods
         */
        Settings: {
            /**
             * Change password
             * @param {string} currentPassword - Current password
             * @param {string} newPassword - New password
             * @returns {Promise<Object>} - API response
             */
            async changePassword(currentPassword, newPassword) {
                return AdminDashboard.API.request(AdminDashboard.config.apiEndpoints.auth.changePassword, {
                    method: 'POST',
                    body: JSON.stringify({ currentPassword, newPassword })
                });
            }
        }
    },

    /**
     * Main initialization function
     * Will be expanded as we implement the other modules
     */
    init() {
        // Initialize UI first
        this.UI.init();
        
        // Set up session refresh interval
        this.initSessionRefresh();
        
        // TODO: Initialize remaining modules when implemented
        
        // Listen for hash changes to handle deep linking
        window.addEventListener('hashchange', () => this.UI.handleHashChange());
        
        // Handle initial hash if present
        if (window.location.hash) {
            this.UI.handleHashChange();
        }
    },
    
    /**
     * Initialize session refresh to keep user logged in
     */
    initSessionRefresh() {
        const refreshInterval = setInterval(async () => {
            try {
                const refreshSuccess = await this.API.refreshToken();
                if (!refreshSuccess) {
                    
                    clearInterval(refreshInterval);
                    this.API.redirectToLogin();
                }
            } catch (error) {
                console.error('Session refresh error:', error);
            }
        }, this.config.sessionRefreshInterval);
    }
};

/**
 * NPCs Module - Non-Player Character management functionality
 */
AdminDashboard.NPCs = {
    // Local cache of NPC data
    data: [],
    
    // Track loaded state
    isLoaded: false,
    
    // DOM elements used by this module
    elements: {},
    
    /**
     * Initialize the NPCs module
     * @returns {Object} - The NPCs module for chaining
     */
    init() {
        try {
            this.cacheElements();
            this.bindEvents();      
            
            // Determine if we're on the NPCs page before loading data
            if (document.getElementById('npcs-section')) {
                this.loadNPCs();
            }
            
            return this;
        } catch (error) {
            console.error('Error initializing NPCs module:', error);
            AdminDashboard.UI.showToast('error', 'Failed to initialize NPCs management');
            return this;
        }
    },
    
    /**
     * Cache DOM elements used by this module
     * @returns {Object} - Object containing cached elements
     */
    cacheElements() {
        try {
            this.elements = {
                // NPC list and container elements
                npcList: document.getElementById('npc-list'),
                npcContainer: document.getElementById('npcs-section'),
                npcCount: document.getElementById('npcs-count'),
                
                // Form elements
                createNPCBtn: document.getElementById('create-npc-btn'),
                npcModal: document.getElementById('npc-modal'),
                npcForm: document.getElementById('npc-form'),
                saveNPCBtn: document.getElementById('save-npc'),
                cancelNPCBtn: document.getElementById('cancel-npc'),
                modalTitle: document.getElementById('npc-modal-title'),
                
                // Form fields
                npcId: document.getElementById('npc-id'),
                npcName: document.getElementById('npc-name'),
                npcImportance: document.getElementById('npc-importance'),
                npcAppearance: document.getElementById('npc-appearance'),
                npcRelationship: document.getElementById('npc-relationship'),
                npcCategory: document.getElementById('npc-category'),
                npcDescription: document.getElementById('npc-description'),
                npcQuote: document.getElementById('npc-quote'),
                npcTags: document.getElementById('npc-tags'),
                npcImage: document.getElementById('npc-image'),
                
                // Filter elements
                npcSearch: document.getElementById('npc-search'),
                categoryFilter: document.getElementById('category-filter'),
                relationshipFilter: document.getElementById('relationship-filter')
            };
            
            return this.elements;
        } catch (error) {
            console.error('Error caching NPC DOM elements:', error);
            return {};
        }
    },
    
    /**
     * Bind event listeners to DOM elements
     */
    bindEvents() {
        try {
            const { 
                createNPCBtn, saveNPCBtn, cancelNPCBtn,
                npcSearch, categoryFilter, relationshipFilter,
                npcForm
            } = this.elements;
            
            // Create NPC button
            if (createNPCBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    createNPCBtn, 
                    'click', 
                    (e) => {
                        e.preventDefault();
                        this.showCreateForm();
                    }
                );
            }
            
            // Save NPC button
            if (saveNPCBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    saveNPCBtn, 
                    'click', 
                    (e) => {
                        e.preventDefault();
                        this.saveNPC();
                    }
                );
            }
            
            // Cancel button 
            if (cancelNPCBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    cancelNPCBtn, 
                    'click', 
                    (e) => {
                        e.preventDefault();
                        AdminDashboard.UI.closeModal('npc-modal');
                    }
                );
            }
            
            // Form submit handling to prevent default submission
            if (npcForm) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    npcForm, 
                    'submit', 
                    (e) => {
                        e.preventDefault();
                        this.saveNPC();
                    }
                );
            }
            
            // Search and filters
            if (npcSearch) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    npcSearch, 
                    'input', 
                    () => this.applyFilters()
                );
            }
            
            if (categoryFilter) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    categoryFilter, 
                    'change', 
                    () => this.applyFilters()
                );
            }
            
            if (relationshipFilter) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    relationshipFilter, 
                    'change', 
                    () => this.applyFilters()
                );
            }
            
            // Listen for custom events
            document.addEventListener('npc:reload', () => this.loadNPCs());
        } catch (error) {
            console.error('Error binding NPC event listeners:', error);
        }
    },
    
    /**
     * Load NPCs from API and render them
     * @returns {Promise<Array>} - Array of loaded NPCs
     */
    async loadNPCs() {
        const { npcList } = this.elements;
        
        if (!npcList) {
            console.warn('Cannot load NPCs: npcList element not found');
            return [];
        }
        
        try {
            // Show loading state
            npcList.innerHTML = `
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading NPCs...</p>
                </div>
            `;
            
            // Fetch NPCs from API
            this.data = await AdminDashboard.API.NPCs.getAll();
            this.isLoaded = true;
            
            // Render NPC list
            this.renderNPCList();
            
            // Update dashboard stats
            this.updateNPCCount();
            
            return this.data;
        } catch (error) {
            console.error('Error loading NPCs:', error);
            
            // Show error message in the list
            if (npcList) {
                npcList.innerHTML = `
                    <div class="error-message">
                        <p>Error loading NPCs: ${error.message || 'Unknown error'}</p>
                        <button class="btn btn-primary retry-btn">
                            <i class="fas fa-sync"></i> Retry
                        </button>
                    </div>
                `;
                
                // Add event listener to retry button
                const retryBtn = npcList.querySelector('.retry-btn');
                if (retryBtn) {
                    AdminDashboard.UI.addEventListenerWithCleanup(
                        retryBtn,
                        'click',
                        () => this.loadNPCs()
                    );
                }
            }
            
            AdminDashboard.UI.showToast('error', 'Failed to load NPCs. Please try again.');
            return [];
        }
    },
    
    /**
     * Update the NPC count displayed in the dashboard
     */
    updateNPCCount() {
        const { npcCount } = this.elements;
        
        if (npcCount) {
            npcCount.textContent = this.data.length;
        }
    },
    
    /**
     * Show create NPC form
     */
    showCreateForm() {
        const { npcModal, modalTitle } = this.elements;
        
        if (!npcModal) {
            console.warn('Cannot show create form: npcModal element not found');
            return;
        }
        
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
     * @param {Object} npc - NPC object to edit
     */
    showEditForm(npc) {
        const { npcModal, modalTitle } = this.elements;
        
        if (!npcModal || !npc) {
            console.warn('Cannot show edit form: npcModal element or npc data not found');
            return;
        }
        
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
     * @returns {Promise<Object|null>} - The created/updated NPC or null if validation fails
     */
    async saveNPC() {
        const { npcForm, saveNPCBtn } = this.elements;
        
        // Basic validation
        if (!this.validateNPCForm()) {
            AdminDashboard.UI.showToast('error', 'Please fill in all required fields');
            return null;
        }
        
        // Disable save button to prevent double submission
        if (saveNPCBtn) {
            saveNPCBtn.disabled = true;
            saveNPCBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        }
        
        try {
            // Gather form data
            const npcData = this.getNPCFormData();
            
            let newOrUpdatedNPC;
            let activityData = {};
            
            // Save to API
            if (npcData.id) {
                // Update existing NPC
                newOrUpdatedNPC = await AdminDashboard.API.NPCs.update(npcData.id, npcData);
                
                // Update local cache
                const index = this.data.findIndex(npc => npc.id === npcData.id);
                if (index !== -1) {
                    this.data[index] = newOrUpdatedNPC;
                } else {
                    // If not found (shouldn't happen), add it
                    this.data.push(newOrUpdatedNPC);
                }
                
                // Prepare activity data
                activityData = {
                    icon: 'fa-user-edit',
                    title: 'NPC Updated',
                    description: `Updated NPC: ${npcData.name}`,
                    timestamp: new Date().toISOString()
                };
                
                // Show success message
                AdminDashboard.UI.showToast('success', 'NPC updated successfully!');
            } else {
                // Create new NPC
                newOrUpdatedNPC = await AdminDashboard.API.NPCs.create(npcData);
                
                // Add to local cache
                this.data.push(newOrUpdatedNPC);
                
                // Prepare activity data
                activityData = {
                    icon: 'fa-user-plus',
                    title: 'NPC Created',
                    description: `Created new NPC: ${npcData.name}`,
                    timestamp: new Date().toISOString()
                };
                
                // Show success message
                AdminDashboard.UI.showToast('success', 'NPC created successfully!');
            }
            
            // Close modal
            AdminDashboard.UI.closeModal('npc-modal');
            
            // Update list
            this.renderNPCList();
            
            // Update dashboard stats
            this.updateNPCCount();
            
            // Add to recent activity
            if (AdminDashboard.Activities && typeof AdminDashboard.Activities.addActivity === 'function') {
                await AdminDashboard.Activities.addActivity(activityData);
            }
            
            return newOrUpdatedNPC;
        } catch (error) {
            console.error('Error saving NPC:', error);
            AdminDashboard.UI.showToast('error', 'Error saving NPC: ' + (error.message || 'Unknown error'));
            return null;
        } finally {
            // Re-enable save button
            if (saveNPCBtn) {
                saveNPCBtn.disabled = false;
                saveNPCBtn.innerHTML = '<i class="fas fa-save"></i> Save NPC';
            }
        }
    },
    
    /**
     * Get NPC data from form
     * @returns {Object} - NPC data object
     */
    getNPCFormData() {
        const {
            npcId, npcName, npcImportance, npcAppearance,
            npcRelationship, npcCategory, npcDescription,
            npcQuote, npcTags, npcImage
        } = this.elements;
        
        // Basic data
        const npcData = {
            name: npcName?.value.trim() || '',
            importance: parseInt(npcImportance?.value || '1'),
            appearance: npcAppearance?.value.trim() || '',
            relationship: npcRelationship?.value || 'neutral',
            category: npcCategory?.value || 'commoner',
            description: npcDescription?.value.trim() || '',
            quote: npcQuote?.value.trim() || '',
            imageSrc: npcImage?.value.trim() || 'assets/images/npcs/default.jpg'
        };
        
        // Add ID if editing
        if (npcId && npcId.value) {
            npcData.id = npcId.value;
        }
        
        // Process tags
        if (npcTags && npcTags.value) {
            npcData.tags = npcTags.value
                .split(',')
                .map(tag => tag.trim().toLowerCase())
                .filter(tag => tag); // Remove empty tags
        } else {
            npcData.tags = [];
        }
        
        return npcData;
    },
    
    /**
     * Delete an NPC
     * @param {string} id - NPC ID
     * @returns {Promise<boolean>} - True if deletion was successful
     */
    async deleteNPC(id) {
        if (!id) {
            console.warn('Cannot delete NPC: No ID provided');
            return false;
        }
        
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
            this.updateNPCCount();
            
            // Show success message
            AdminDashboard.UI.showToast('success', 'NPC deleted successfully!');
            
            // Add to recent activity
            if (AdminDashboard.Activities && typeof AdminDashboard.Activities.addActivity === 'function') {
                await AdminDashboard.Activities.addActivity({
                    icon: 'fa-user-minus',
                    title: 'NPC Deleted',
                    description: `Deleted NPC: ${npcName}`,
                    timestamp: new Date().toISOString()
                });
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting NPC:', error);
            AdminDashboard.UI.showToast('error', 'Error deleting NPC: ' + (error.message || 'Unknown error'));
            return false;
        }
    },
    
    /**
     * Validate NPC form
     * @returns {boolean} - True if form is valid
     */
    validateNPCForm() {
        const { npcForm } = this.elements;
        if (!npcForm) {
            console.warn('Cannot validate NPC form: npcForm element not found');
            return false;
        }
        
        const requiredFields = npcForm.querySelectorAll('[required]');
        let valid = true;
        
        // Reset all error states
        npcForm.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });
        
        // Check required fields
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                
                // Add error message if not already present
                if (!field.nextElementSibling?.classList.contains('field-error-msg')) {
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'field-error-msg';
                    errorMsg.textContent = 'This field is required';
                    field.insertAdjacentElement('afterend', errorMsg);
                }
                
                valid = false;
            } else {
                // Remove any existing error message
                const errorMsg = field.nextElementSibling;
                if (errorMsg?.classList.contains('field-error-msg')) {
                    errorMsg.remove();
                }
            }
        });
        
        // Additional validation if needed (e.g., max lengths, format checks)
        if (this.elements.npcName && this.elements.npcName.value.length > 100) {
            this.elements.npcName.classList.add('error');
            AdminDashboard.UI.showToast('error', 'NPC name cannot exceed 100 characters');
            valid = false;
        }
        
        if (!valid) {
            // Focus the first invalid field
            const firstInvalidField = npcForm.querySelector('.error');
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
        }
        
        return valid;
    },
    
    /**
     * Reset NPC form
     */
    resetNPCForm() {
        const { npcForm } = this.elements;
        if (!npcForm) {
            console.warn('Cannot reset NPC form: npcForm element not found');
            return;
        }
        
        // Clear the form
        npcForm.reset();
        
        // Reset hidden ID field
        if (this.elements.npcId) {
            this.elements.npcId.value = '';
        }
        
        // Reset any validation errors
        npcForm.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });
        
        // Remove any error messages
        npcForm.querySelectorAll('.field-error-msg').forEach(msg => {
            msg.remove();
        });
    },
    
    /**
     * Populate NPC form for editing
     * @param {Object} npc - NPC data
     */
    populateNPCForm(npc) {
        if (!npc) {
            console.warn('Cannot populate form: No NPC data provided');
            return;
        }
        
        // Reset form first to clear any previous data
        this.resetNPCForm();
        
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
            'npc-tags': Array.isArray(npc.tags) ? npc.tags.join(', ') : (npc.tags || ''),
            'npc-image': npc.imageSrc || ''
        };
        
        // Update each field if it exists
        Object.entries(fields).forEach(([id, value]) => {
            const field = document.getElementById(id);
            if (field) {
                field.value = value;
            } else {
                console.warn(`Field not found for population: ${id}`);
            }
        });
    },
    
    /**
     * Apply filters to NPC list
     */
    applyFilters() {
        const { npcSearch, categoryFilter, relationshipFilter } = this.elements;
        
        const searchTerm = npcSearch?.value.trim().toLowerCase() || '';
        const category = categoryFilter?.value || '';
        const relationship = relationshipFilter?.value || '';
        
        this.renderNPCList(searchTerm, category, relationship);
    },
    
    /**
     * Render NPC list with optional filters
     * @param {string} searchTerm - Search term to filter by
     * @param {string} categoryFilter - Category to filter by
     * @param {string} relationshipFilter - Relationship to filter by
     */
    renderNPCList(searchTerm = '', categoryFilter = '', relationshipFilter = '') {
        const { npcList } = this.elements;
        if (!npcList) {
            console.warn('Cannot render NPC list: npcList element not found');
            return;
        }
        
        // Only proceed if we have data
        if (!this.isLoaded) {
            npcList.innerHTML = `
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading NPCs...</p>
                </div>
            `;
            this.loadNPCs();
            return;
        }
        
        // Filter NPCs if needed
        let filteredNPCs = [...this.data];
        
        if (searchTerm) {
            filteredNPCs = filteredNPCs.filter(npc => 
                (npc.name?.toLowerCase().includes(searchTerm) || false) || 
                (npc.description?.toLowerCase().includes(searchTerm) || false) ||
                (Array.isArray(npc.tags) && npc.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
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
                    ${!searchTerm && !categoryFilter && !relationshipFilter ? `
                        <button class="btn btn-primary create-new-btn">
                            <i class="fas fa-plus"></i> Create New NPC
                        </button>
                    ` : ''}
                </div>
            `;
            
            // Add event listener to the create button if present
            const createNewBtn = npcList.querySelector('.create-new-btn');
            if (createNewBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    createNewBtn,
                    'click',
                    () => this.showCreateForm()
                );
            }
            
            return;
        }
        
        // Clear list
        npcList.innerHTML = '';
        
        // Sort NPCs by importance (descending) and then by name
        filteredNPCs.sort((a, b) => {
            if (b.importance !== a.importance) {
                return b.importance - a.importance;
            }
            return (a.name || '').localeCompare(b.name || '');
        });
        
        // Add each NPC
        filteredNPCs.forEach(npc => {
            const npcElement = this.createNPCListItem(npc);
            if (npcElement) {
                npcList.appendChild(npcElement);
            }
        });
    },
    
    /**
     * Create NPC list item element
     * @param {Object} npc - NPC data
     * @returns {Element} - NPC list item DOM element
     */
    createNPCListItem(npc) {
        if (!npc || !npc.id) {
            console.warn('Cannot create NPC list item: Invalid NPC data');
            return null;
        }
        
        const npcItem = document.createElement('div');
        npcItem.className = 'npc-item';
        npcItem.setAttribute('data-id', npc.id);
        
        // Format importance as stars
        const importanceStars = '★'.repeat(npc.importance || 0) + '☆'.repeat(3 - (npc.importance || 0));
        
        // Format category display
        const categoryDisplay = `<span class="npc-category category-${npc.category || 'commoner'}">${npc.category || 'commoner'}</span>`;
        
        // Format relationship display
        const relationshipDisplay = `<span class="npc-relation relation-${npc.relationship || 'neutral'}">${npc.relationship || 'neutral'}</span>`;
        
        // Check if image src is provided
        const imageSrc = npc.imageSrc || 'assets/images/npcs/default.jpg';
        
        // Generate tags HTML if available
        let tagsHtml = '';
        if (Array.isArray(npc.tags) && npc.tags.length > 0) {
            tagsHtml = `
                <div class="npc-tags">
                    ${npc.tags.map(tag => `<span class="npc-tag">${tag}</span>`).join('')}
                </div>
            `;
        }
        
        npcItem.innerHTML = `
            <div class="npc-image">
                <img src="${imageSrc}" alt="${npc.name}" onerror="this.src='assets/images/npcs/default.jpg'">
            </div>
            <div class="npc-info">
                <h3 class="npc-name-title">${npc.name || 'Unnamed NPC'}</h3>
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
                ${tagsHtml}
                ${npc.quote ? `<blockquote class="npc-quote">"${npc.quote}"</blockquote>` : ''}
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
            AdminDashboard.UI.addEventListenerWithCleanup(
                editBtn,
                'click',
                () => this.showEditForm(npc)
            );
        }
        
        const deleteBtn = npcItem.querySelector('.delete');
        if (deleteBtn) {
            AdminDashboard.UI.addEventListenerWithCleanup(
                deleteBtn,
                'click',
                () => {
                    AdminDashboard.UI.showConfirmation({
                        title: 'Delete NPC',
                        message: `Are you sure you want to delete "${npc.name}"? This action cannot be undone.`,
                        confirmText: 'Delete',
                        confirmClass: 'btn-danger',
                        onConfirm: () => this.deleteNPC(npc.id),
                        onCancel: () => console.log(`Deletion of NPC "${npc.name}" cancelled`)
                    });
                }
            );
        }
        
        return npcItem;
    }
};

/**
 * Timeline Module - Timeline event management functionality
 */
AdminDashboard.Timeline = {
    // Local cache of timeline data
    data: [], 
    
    // Track loaded state
    isLoaded: false,
    
    // DOM elements used by this module
    elements: {},
    
    /**
     * Initialize the Timeline module
     * @returns {Object} - The Timeline module for chaining
     */
    init() {
        try {
            this.cacheElements();
            this.bindEvents();
            
            // Determine if we're on the Timeline page before loading data
            if (document.getElementById('timeline-section')) {
                this.loadTimelineEntries();
            }
            
            return this;
        } catch (error) {
            console.error('Error initializing Timeline module:', error);
            AdminDashboard.UI.showToast('error', 'Failed to initialize Timeline management');
            return this;
        }
    },
    
    /**
     * Cache DOM elements used by this module
     * @returns {Object} - Object containing cached elements
     */
    cacheElements() {
        try {
            this.elements = {
                // Timeline list and container elements
                timelineList: document.getElementById('timeline-list'),
                timelineContainer: document.getElementById('timeline-section'),
                timelineCount: document.getElementById('timeline-count'),
                
                // Form elements
                createTimelineBtn: document.getElementById('create-timeline-btn'),
                createEventBtn: document.getElementById('create-event-btn'),
                createReignBtn: document.getElementById('create-reign-btn'),
                timelineModal: document.getElementById('timeline-modal'),
                timelineForm: document.getElementById('timeline-form'),
                saveTimelineBtn: document.getElementById('save-timeline'),
                cancelTimelineBtn: document.getElementById('cancel-timeline'),
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
                reignFields: document.getElementById('reign-fields'),
                
                // Filter elements
                timelineSearch: document.getElementById('timeline-search'),
                eraFilter: document.getElementById('era-filter'),
                typeFilter: document.getElementById('type-filter')
            };
            
            return this.elements;
        } catch (error) {
            console.error('Error caching Timeline DOM elements:', error);
            return {};
        }
    },
    
    /**
     * Bind event listeners to DOM elements
     */
    bindEvents() {
        try {
            const { 
                createTimelineBtn, createEventBtn, createReignBtn,
                saveTimelineBtn, cancelTimelineBtn,
                timelineSearch, eraFilter, typeFilter,
                timelineType, timelineForm
            } = this.elements;
            
            // Dropdown behavior for create button
            if (createTimelineBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    createTimelineBtn, 
                    'click', 
                    function(e) {
                        e.preventDefault();
                        const dropdown = this.nextElementSibling;
                        if (!dropdown) return;
                        
                        dropdown.classList.toggle('active');
                        
                        // Close dropdown when clicking outside
                        const closeDropdownListener = function(event) {
                            if (!dropdown.contains(event.target) && event.target !== createTimelineBtn) {
                                dropdown.classList.remove('active');
                                document.removeEventListener('click', closeDropdownListener);
                            }
                        };
                        
                        document.addEventListener('click', closeDropdownListener);
                    }
                );
            }
            
            // Create event button
            if (createEventBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    createEventBtn, 
                    'click', 
                    (e) => {
                        e.preventDefault();
                        this.showCreateForm('event');
                    }
                );
            }
            
            // Create reign break button
            if (createReignBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    createReignBtn, 
                    'click', 
                    (e) => {
                        e.preventDefault();
                        this.showCreateForm('reign-break');
                    }
                );
            }
            
            // Save timeline button
            if (saveTimelineBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    saveTimelineBtn, 
                    'click', 
                    (e) => {
                        e.preventDefault();
                        this.saveTimelineEntry();
                    }
                );
            }
            
            // Cancel button 
            if (cancelTimelineBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    cancelTimelineBtn, 
                    'click', 
                    (e) => {
                        e.preventDefault();
                        AdminDashboard.UI.closeModal('timeline-modal');
                    }
                );
            }
            
            // Form submit handling to prevent default submission
            if (timelineForm) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    timelineForm, 
                    'submit', 
                    (e) => {
                        e.preventDefault();
                        this.saveTimelineEntry();
                    }
                );
            }
            
            // Toggle fields based on entry type
            if (timelineType) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    timelineType, 
                    'change', 
                    () => this.toggleFormFields()
                );
            }
            
            // Search and filters
            if (timelineSearch) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    timelineSearch, 
                    'input', 
                    () => this.applyFilters()
                );
            }
            
            if (eraFilter) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    eraFilter, 
                    'change', 
                    () => this.applyFilters()
                );
            }
            
            if (typeFilter) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    typeFilter, 
                    'change', 
                    () => this.applyFilters()
                );
            }
            
            // Listen for custom events
            document.addEventListener('timeline:reload', () => this.loadTimelineEntries());
        } catch (error) {
            console.error('Error binding Timeline event listeners:', error);
        }
    },
    
    /**
     * Load timeline entries from API and render them
     * @returns {Promise<Array>} - Array of loaded timeline entries
     */
    async loadTimelineEntries() {
        const { timelineList } = this.elements;
        
        if (!timelineList) {
            console.warn('Cannot load timeline entries: timelineList element not found');
            return [];
        }
        
        try {
            // Show loading state
            timelineList.innerHTML = `
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading timeline entries...</p>
                </div>
            `;
            
            // Fetch timeline entries from API
            this.data = await AdminDashboard.API.Timeline.getAll();
            this.isLoaded = true;
            
            // Render timeline list
            this.renderTimelineList();
            
            // Update dashboard stats
            this.updateTimelineCount();
            
            return this.data;
        } catch (error) {
            console.error('Error loading timeline entries:', error);
            
            // Show error message in the list
            if (timelineList) {
                timelineList.innerHTML = `
                    <div class="error-message">
                        <p>Error loading timeline entries: ${error.message || 'Unknown error'}</p>
                        <button class="btn btn-primary retry-btn">
                            <i class="fas fa-sync"></i> Retry
                        </button>
                    </div>
                `;
                
                // Add event listener to retry button
                const retryBtn = timelineList.querySelector('.retry-btn');
                if (retryBtn) {
                    AdminDashboard.UI.addEventListenerWithCleanup(
                        retryBtn,
                        'click',
                        () => this.loadTimelineEntries()
                    );
                }
            }
            
            AdminDashboard.UI.showToast('error', 'Failed to load timeline entries. Please try again.');
            return [];
        }
    },
    
    /**
     * Update the timeline count displayed in the dashboard
     */
    updateTimelineCount() {
        const { timelineCount } = this.elements;
        
        if (timelineCount) {
            timelineCount.textContent = this.data.length;
        }
    },
    
    /**
     * Show create form for timeline entry
     * @param {string} type - Type of entry ('event' or 'reign-break')
     */
    showCreateForm(type = 'event') {
        const { timelineModal, modalTitle, timelineType } = this.elements;
        
        if (!timelineModal || !timelineType) {
            console.warn('Cannot show create form: timelineModal or timelineType element not found');
            return;
        }
        
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
     * @param {Object} entry - Timeline entry to edit
     */
    showEditForm(entry) {
        const { timelineModal, modalTitle, timelineType } = this.elements;
        
        if (!timelineModal || !timelineType || !entry) {
            console.warn('Cannot show edit form: required elements or entry data not found');
            return;
        }
        
        // Change modal title based on type
        if (modalTitle) {
            modalTitle.textContent = entry.type === 'event' ? 'Edit Timeline Event' : 'Edit Reign Change';
        }
        
        // Reset form first to clear any previous data
        this.resetTimelineForm();
        
        // Set type and populate form
        timelineType.value = entry.type || 'event';
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
        
        if (!timelineType || !eventFields || !reignFields) {
            console.warn('Cannot toggle form fields: required elements not found');
            return;
        }
        
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
     * @returns {Promise<Object|null>} - The created/updated timeline entry or null if validation fails
     */
    async saveTimelineEntry() {
        const { timelineForm, saveTimelineBtn } = this.elements;
        
        // Basic validation
        if (!this.validateTimelineForm()) {
            AdminDashboard.UI.showToast('error', 'Please fill in all required fields');
            return null;
        }
        
        // Disable save button to prevent double submission
        if (saveTimelineBtn) {
            saveTimelineBtn.disabled = true;
            saveTimelineBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        }
        
        try {
            // Gather form data
            const entryData = this.getTimelineFormData();
            
            let newOrUpdatedEntry;
            let activityData = {};
            
            // Save to API
            if (entryData.id) {
                // Update existing entry
                newOrUpdatedEntry = await AdminDashboard.API.Timeline.update(entryData.id, entryData);
                
                // Update local cache
                const index = this.data.findIndex(entry => entry.id === entryData.id);
                if (index !== -1) {
                    this.data[index] = newOrUpdatedEntry;
                } else {
                    // If not found (shouldn't happen), add it
                    this.data.push(newOrUpdatedEntry);
                }
                
                // Prepare activity data
                activityData = {
                    icon: 'fa-hourglass-half',
                    title: 'Timeline Entry Updated',
                    description: `Updated ${entryData.type === 'event' ? 'event' : 'reign change'}: ${entryData.title}`,
                    timestamp: new Date().toISOString()
                };
                
                // Show success message
                AdminDashboard.UI.showToast('success', 'Timeline entry updated successfully!');
            } else {
                // Create new entry
                newOrUpdatedEntry = await AdminDashboard.API.Timeline.create(entryData);
                
                // Add to local cache
                this.data.push(newOrUpdatedEntry);
                
                // Prepare activity data
                activityData = {
                    icon: 'fa-hourglass-half',
                    title: 'Timeline Entry Created',
                    description: `Created new ${entryData.type === 'event' ? 'event' : 'reign change'}: ${entryData.title}`,
                    timestamp: new Date().toISOString()
                };
                
                // Show success message
                AdminDashboard.UI.showToast('success', 'Timeline entry created successfully!');
            }
            
            // Close modal
            AdminDashboard.UI.closeModal('timeline-modal');
            
            // Update list
            this.renderTimelineList();
            
            // Update dashboard stats
            this.updateTimelineCount();
            
            // Add to recent activity
            if (AdminDashboard.Activities && typeof AdminDashboard.Activities.addActivity === 'function') {
                await AdminDashboard.Activities.addActivity(activityData);
            }
            
            return newOrUpdatedEntry;
        } catch (error) {
            console.error('Error saving timeline entry:', error);
            AdminDashboard.UI.showToast('error', 'Error saving timeline entry: ' + (error.message || 'Unknown error'));
            return null;
        } finally {
            // Re-enable save button
            if (saveTimelineBtn) {
                saveTimelineBtn.disabled = false;
                saveTimelineBtn.innerHTML = '<i class="fas fa-save"></i> Save';
            }
        }
    },
    
    /**
     * Get timeline entry data from form
     * @returns {Object} - Timeline entry data object
     */
    getTimelineFormData() {
        const {
            timelineId, timelineType, timelineTitle, timelineEra,
            timelineYear, timelineMonth, timelineDay,
            timelineLocation, timelineDescription, timelineImage,
            timelinePosition, timelineBreakType
        } = this.elements;
        
        const entryType = timelineType?.value || 'event';
        
        // Build common data object
        const entryData = {
            type: entryType,
            title: timelineTitle?.value.trim() || '',
            era: timelineEra?.value || 'arcane-reckoning',
            year: parseInt(timelineYear?.value || '0')
        };
        
        // Add ID if editing
        if (timelineId && timelineId.value) {
            entryData.id = timelineId.value;
        }
        
        // Add month and day if provided
        if (timelineMonth && timelineMonth.value) {
            const monthVal = parseInt(timelineMonth.value);
            if (!isNaN(monthVal) && monthVal >= 1 && monthVal <= 12) {
                entryData.month = monthVal;
            }
        }
        
        if (timelineDay && timelineDay.value) {
            const dayVal = parseInt(timelineDay.value);
            if (!isNaN(dayVal) && dayVal >= 1 && dayVal <= 31) {
                entryData.day = dayVal;
            }
        }
        
        // Add type-specific fields
        if (entryType === 'event') {
            // Event-specific fields
            entryData.location = timelineLocation?.value.trim() || '';
            entryData.description = timelineDescription?.value.trim() || '';
            
            // Optional fields
            if (timelineImage && timelineImage.value.trim()) {
                entryData.image = timelineImage.value.trim();
            }
            
            if (timelinePosition && timelinePosition.value) {
                entryData.position = timelinePosition.value;
            }
        } else {
            // Reign break-specific fields
            entryData.breakType = timelineBreakType?.value || 'reign-beginning';
        }
        
        return entryData;
    },
    
    /**
     * Delete a timeline entry
     * @param {string} id - Timeline entry ID
     * @returns {Promise<boolean>} - True if deletion was successful
     */
    async deleteTimelineEntry(id) {
        if (!id) {
            console.warn('Cannot delete timeline entry: No ID provided');
            return false;
        }
        
        try {
            // Find entry before removing
            const deletedEntry = this.data.find(entry => entry.id === id);
            if (!deletedEntry) {
                console.warn(`Timeline entry with ID ${id} not found in local data`);
            }
            
            const entryTitle = deletedEntry ? deletedEntry.title : 'Unknown entry';
            const entryType = deletedEntry ? deletedEntry.type : 'event';
            
            // Delete from API
            await AdminDashboard.API.Timeline.delete(id);
            
            // Remove from local cache
            this.data = this.data.filter(entry => entry.id !== id);
            
            // Update list
            this.renderTimelineList();
            
            // Update dashboard stats
            this.updateTimelineCount();
            
            // Show success message
            AdminDashboard.UI.showToast('success', 'Timeline entry deleted successfully!');
            
            // Add to recent activity
            if (AdminDashboard.Activities && typeof AdminDashboard.Activities.addActivity === 'function') {
                await AdminDashboard.Activities.addActivity({
                    icon: 'fa-trash-alt',
                    title: 'Timeline Entry Deleted',
                    description: `Deleted ${entryType === 'event' ? 'event' : 'reign change'}: ${entryTitle}`,
                    timestamp: new Date().toISOString()
                });
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting timeline entry:', error);
            AdminDashboard.UI.showToast('error', 'Error deleting timeline entry: ' + (error.message || 'Unknown error'));
            return false;
        }
    },
    
    /**
     * Validate timeline form
     * @returns {boolean} - True if form is valid
     */
    validateTimelineForm() {
        const { timelineForm, timelineType } = this.elements;
        
        if (!timelineForm) {
            console.warn('Cannot validate timeline form: timelineForm element not found');
            return false;
        }
        
        const requiredFields = timelineForm.querySelectorAll('[required]');
        let valid = true;
        
        // Reset all error states
        timelineForm.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });
        
        // Check required fields
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                
                // Add error message if not already present
                if (!field.nextElementSibling?.classList.contains('field-error-msg')) {
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'field-error-msg';
                    errorMsg.textContent = 'This field is required';
                    field.insertAdjacentElement('afterend', errorMsg);
                }
                
                valid = false;
            } else {
                // Remove any existing error message
                const errorMsg = field.nextElementSibling;
                if (errorMsg?.classList.contains('field-error-msg')) {
                    errorMsg.remove();
                }
            }
        });
        
        // Additional validation for year (must be a number)
        const yearField = this.elements.timelineYear;
        if (yearField && yearField.value) {
            const yearValue = parseInt(yearField.value);
            if (isNaN(yearValue)) {
                yearField.classList.add('error');
                
                if (!yearField.nextElementSibling?.classList.contains('field-error-msg')) {
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'field-error-msg';
                    errorMsg.textContent = 'Year must be a valid number';
                    yearField.insertAdjacentElement('afterend', errorMsg);
                }
                
                valid = false;
            }
        }
        
        // Validate month (1-12) if provided
        const monthField = this.elements.timelineMonth;
        if (monthField && monthField.value) {
            const monthValue = parseInt(monthField.value);
            if (isNaN(monthValue) || monthValue < 1 || monthValue > 12) {
                monthField.classList.add('error');
                
                if (!monthField.nextElementSibling?.classList.contains('field-error-msg')) {
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'field-error-msg';
                    errorMsg.textContent = 'Month must be between 1 and 12';
                    monthField.insertAdjacentElement('afterend', errorMsg);
                }
                
                valid = false;
            }
        }
        
        // Validate day (1-31) if provided
        const dayField = this.elements.timelineDay;
        if (dayField && dayField.value) {
            const dayValue = parseInt(dayField.value);
            if (isNaN(dayValue) || dayValue < 1 || dayValue > 31) {
                dayField.classList.add('error');
                
                if (!dayField.nextElementSibling?.classList.contains('field-error-msg')) {
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'field-error-msg';
                    errorMsg.textContent = 'Day must be between 1 and 31';
                    dayField.insertAdjacentElement('afterend', errorMsg);
                }
                
                valid = false;
            }
        }
        
        if (!valid) {
            // Focus the first invalid field
            const firstInvalidField = timelineForm.querySelector('.error');
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
        }
        
        return valid;
    },
    
    /**
     * Reset timeline form
     */
    resetTimelineForm() {
        const { timelineForm } = this.elements;
        
        if (!timelineForm) {
            console.warn('Cannot reset timeline form: timelineForm element not found');
            return;
        }
        
        // Clear the form
        timelineForm.reset();
        
        // Reset hidden ID field
        if (this.elements.timelineId) {
            this.elements.timelineId.value = '';
        }
        
        // Reset any validation errors
        timelineForm.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });
        
        // Remove any error messages
        timelineForm.querySelectorAll('.field-error-msg').forEach(msg => {
            msg.remove();
        });
    },
    
    /**
     * Populate timeline form for editing
     * @param {Object} entry - Timeline entry data
     */
    populateTimelineForm(entry) {
        if (!entry) {
            console.warn('Cannot populate form: No timeline entry data provided');
            return;
        }
        
        // Set common fields
        const fields = {
            'timeline-id': entry.id,
            'timeline-type': entry.type || 'event',
            'timeline-title': entry.title || '',
            'timeline-era': entry.era || 'arcane-reckoning',
            'timeline-year': entry.year || '',
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
        
        // Update each field if it exists
        Object.entries(fields).forEach(([id, value]) => {
            const field = document.getElementById(id);
            if (field) {
                field.value = value;
            } else {
                console.warn(`Field not found for population: ${id}`);
            }
        });
    },
    
    /**
     * Apply filters to timeline list
     */
    applyFilters() {
        const { timelineSearch, eraFilter, typeFilter } = this.elements;
        
        const searchTerm = timelineSearch?.value.trim().toLowerCase() || '';
        const era = eraFilter?.value || '';
        const type = typeFilter?.value || '';
        
        this.renderTimelineList(searchTerm, era, type);
    },
    
    /**
     * Render timeline list with optional filters
     * @param {string} searchTerm - Search term to filter by
     * @param {string} eraFilter - Era to filter by
     * @param {string} typeFilter - Type to filter by
     */
    renderTimelineList(searchTerm = '', eraFilter = '', typeFilter = '') {
        const { timelineList } = this.elements;
        
        if (!timelineList) {
            console.warn('Cannot render timeline list: timelineList element not found');
            return;
        }
        
        // Only proceed if we have data
        if (!this.isLoaded) {
            timelineList.innerHTML = `
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading timeline entries...</p>
                </div>
            `;
            this.loadTimelineEntries();
            return;
        }
        
        // Clone the data to avoid modifying the original
        let filteredEntries = [...this.data];
        
        // Apply filters
        if (searchTerm) {
            filteredEntries = filteredEntries.filter(entry => 
                (entry.title?.toLowerCase().includes(searchTerm) || false) || 
                (entry.description?.toLowerCase().includes(searchTerm) || false) ||
                (entry.location?.toLowerCase().includes(searchTerm) || false)
            );
        }
        
        if (eraFilter) {
            filteredEntries = filteredEntries.filter(entry => entry.era === eraFilter);
        }
        
        if (typeFilter) {
            filteredEntries = filteredEntries.filter(entry => entry.type === typeFilter);
        }
        
        // No entries found
        if (filteredEntries.length === 0) {
            timelineList.innerHTML = `
                <div class="empty-message">
                    <p>No timeline entries found. ${searchTerm || eraFilter || typeFilter ? 'Try adjusting your filters.' : 'Create your first timeline entry!'}</p>
                    ${!searchTerm && !eraFilter && !typeFilter ? `
                        <div class="create-buttons">
                            <button class="btn btn-primary create-event-btn">
                                <i class="fas fa-plus"></i> Add Event
                            </button>
                            <button class="btn btn-secondary create-reign-btn">
                                <i class="fas fa-crown"></i> Add Reign Change
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
            
            // Add event listeners to the create buttons if present
            const createEventBtn = timelineList.querySelector('.create-event-btn');
            if (createEventBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    createEventBtn,
                    'click',
                    () => this.showCreateForm('event')
                );
            }
            
            const createReignBtn = timelineList.querySelector('.create-reign-btn');
            if (createReignBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    createReignBtn,
                    'click',
                    () => this.showCreateForm('reign-break')
                );
            }
            
            return;
        }
        
        // Sort by year, month, day (newer first)
        filteredEntries.sort((a, b) => {
            // Primary sort by year (descending)
            if (a.year !== b.year) {
                return b.year - a.year;
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
        
        // Clear list
        timelineList.innerHTML = '';
        
        // Add each entry
        filteredEntries.forEach(entry => {
            const entryElement = this.createTimelineListItem(entry);
            if (entryElement) {
                timelineList.appendChild(entryElement);
            }
        });
    },
    
    /**
     * Create timeline list item element
     * @param {Object} entry - Timeline entry data
     * @returns {Element} - Timeline list item DOM element
     */
    createTimelineListItem(entry) {
        if (!entry || !entry.id) {
            console.warn('Cannot create timeline list item: Invalid entry data');
            return null;
        }
        
        const entryItem = document.createElement('div');
        entryItem.className = `timeline-item ${entry.type === 'reign-break' ? 'reign-item' : 'event-item'}`;
        entryItem.setAttribute('data-id', entry.id);
        
        // Format date display
        let dateDisplay = `Year ${entry.year || 0} A.R.`;
        if (entry.month) {
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            
            const monthIndex = Math.min(Math.max(0, entry.month - 1), 11);
            dateDisplay = `${monthNames[monthIndex]}`;
            
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
        
        const eraDisplay = eraMap[entry.era] || entry.era || 'Unknown Era';
        
        // Different displays for event vs reign break
        if (entry.type === 'event') {
            entryItem.innerHTML = `
                <div class="timeline-item-icon">
                    <i class="fas fa-calendar-day"></i>
                </div>
                <div class="timeline-item-info">
                    <h3 class="timeline-item-title">${entry.title || 'Untitled Event'}</h3>
                    <div class="timeline-item-meta">
                        <span class="timeline-item-date">
                            <i class="fas fa-calendar"></i> ${dateDisplay}
                        </span>
                        <span class="timeline-item-era era-${entry.era || 'unknown'}">
                            <i class="fas fa-history"></i> ${eraDisplay}
                        </span>
                        <span class="timeline-item-location">
                            <i class="fas fa-map-marker-alt"></i> ${entry.location || 'Unknown location'}
                        </span>
                    </div>
                    <p class="timeline-item-description">
                        ${entry.description ? 
                            (entry.description.length > 100 ? 
                                entry.description.substring(0, 100) + '...' : 
                                entry.description) : 
                            'No description'
                        }
                    </p>
                    ${entry.image ? `
                        <div class="timeline-item-image">
                            <img src="${entry.image}" alt="${entry.title}" loading="lazy" onerror="this.style.display='none'" />
                        </div>
                    ` : ''}
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
                '<i class="fas fa-crown" style="color: #C30A3D;"></i>';
            
            const breakTypeText = entry.breakType === 'reign-beginning' ? 
                'Beginning of Reign' : 'End of Reign';
            
            entryItem.innerHTML = `
                <div class="timeline-item-icon reign-icon">
                    <i class="fas fa-crown"></i>
                </div>
                <div class="timeline-item-info">
                    <h3 class="timeline-item-title">${entry.title || 'Untitled Reign Change'}</h3>
                    <div class="timeline-item-meta">
                        <span class="timeline-item-date">
                            <i class="fas fa-calendar"></i> ${dateDisplay}
                        </span>
                        <span class="timeline-item-era era-${entry.era || 'unknown'}">
                            <i class="fas fa-history"></i> ${eraDisplay}
                        </span>
                        <span class="timeline-item-type ${entry.breakType || 'reign-beginning'}">
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
            AdminDashboard.UI.addEventListenerWithCleanup(
                editBtn,
                'click',
                () => this.showEditForm(entry)
            );
        }
        
        const deleteBtn = entryItem.querySelector('.delete');
        if (deleteBtn) {
            AdminDashboard.UI.addEventListenerWithCleanup(
                deleteBtn,
                'click',
                () => {
                    AdminDashboard.UI.showConfirmation({
                        title: `Delete ${entry.type === 'event' ? 'Timeline Event' : 'Reign Change'}`,
                        message: `Are you sure you want to delete "${entry.title}"? This action cannot be undone.`,
                        confirmText: 'Delete',
                        confirmClass: 'btn-danger',
                        onConfirm: () => this.deleteTimelineEntry(entry.id),
                        onCancel: () => console.log(`Deletion of timeline entry "${entry.title}" cancelled`)
                    });
                }
            );
        }
        
        return entryItem;
    }
};

/**
 * StoryEpisodes Module - Story episode management functionality
 */
AdminDashboard.StoryEpisodes = {
    // Local cache of story episode data
    data: [],
    
    // Currently selected locations for the form
    locations: [],
    
    // Available reference data
    availableLocations: [],
    availableActs: [],
    availableChapters: [],
    
    // Track loaded state
    isLoaded: false,
    
    // DOM elements used by this module
    elements: {},
    
    /**
     * Initialize the StoryEpisodes module
     * @returns {Object} - The StoryEpisodes module for chaining
     */
    init() {
        try {
            this.cacheElements();
            this.bindEvents();
            
            // Determine if we're on the Story Episodes page before loading data
            if (document.getElementById('story-section')) {
                this.loadStoryEpisodes();
            }
            
            return this;
        } catch (error) {
            console.error('Error initializing StoryEpisodes module:', error);
            AdminDashboard.UI.showToast('error', 'Failed to initialize Story Episodes management');
            return this;
        }
    },
    
    /**
     * Cache DOM elements used by this module
     * @returns {Object} - Object containing cached elements
     */
    cacheElements() {
        try {
            this.elements = {
                // Main content elements
                storyList: document.getElementById('story-list'),
                storyContainer: document.getElementById('story-section'),
                storyCount: document.getElementById('story-count'),
                
                // Form elements
                createStoryBtn: document.getElementById('create-story-btn'),
                storyModal: document.getElementById('story-modal'),
                storyForm: document.getElementById('story-form'),
                saveStoryBtn: document.getElementById('save-story'),
                cancelStoryBtn: document.getElementById('cancel-story'),
                closeModalBtn: document.getElementById('close-story-modal'),
                modalTitle: document.getElementById('story-modal-title'),
                
                // Basic form fields
                storyId: document.getElementById('story-id'),
                storyTitle: document.getElementById('story-title'),
                storyEpisodeNumber: document.getElementById('story-episode-number'),
                storyDateStart: document.getElementById('story-date-start'),
                storyDateEnd: document.getElementById('story-date-end'),
                storyAct: document.getElementById('story-act'),
                storyChapter: document.getElementById('story-chapter'),
                storyContent: document.getElementById('story-content'),
                storyImage: document.getElementById('story-image'),
                storyImageCaption: document.getElementById('story-image-caption'),
                
                // Location selection elements
                locationChips: document.getElementById('location-chips'),
                locationSearch: document.getElementById('location-search'),
                locationResults: document.getElementById('location-results'),
                manageLocationsBtn: document.getElementById('manage-locations-btn'),
                
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
                
                // Filter elements
                storySearch: document.getElementById('story-search'),
                actFilter: document.getElementById('act-filter'),
                chapterFilter: document.getElementById('chapter-filter')
            };
            
            return this.elements;
        } catch (error) {
            console.error('Error caching StoryEpisodes DOM elements:', error);
            return {};
        }
    },
    
    /**
     * Bind event listeners to DOM elements
     */
    bindEvents() {
        try {
            const {
                createStoryBtn, saveStoryBtn, cancelStoryBtn, closeModalBtn,
                storySearch, actFilter, chapterFilter,
                locationSearch, locationResults, manageLocationsBtn,
                locationsModal, closeLocationsModal, closeLocationsManager,
                newLocationId, newLocationName, addNewLocationBtn,
                locationListSearch,
                manageActsBtn, manageChaptersBtn,
                closeActsModal, closeChaptersModal,
                addActBtn, addChapterBtn,
                storyForm
            } = this.elements;
            
            // Create episode button
            if (createStoryBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    createStoryBtn,
                    'click',
                    (e) => {
                        e.preventDefault();
                        this.showCreateForm();
                    }
                );
            }
            
            // Save episode button
            if (saveStoryBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    saveStoryBtn,
                    'click',
                    (e) => {
                        e.preventDefault();
                        this.saveStoryEpisode();
                    }
                );
            }
            
            // Form submit handling to prevent default submission
            if (storyForm) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    storyForm,
                    'submit',
                    (e) => {
                        e.preventDefault();
                        this.saveStoryEpisode();
                    }
                );
            }
            
            // Cancel and close buttons
            if (cancelStoryBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    cancelStoryBtn,
                    'click',
                    (e) => {
                        e.preventDefault();
                        AdminDashboard.UI.closeModal('story-modal');
                    }
                );
            }
            
            if (closeModalBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    closeModalBtn,
                    'click',
                    (e) => {
                        e.preventDefault();
                        AdminDashboard.UI.closeModal('story-modal');
                    }
                );
            }
            
            // Location search
            if (locationSearch) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    locationSearch,
                    'input',
                    () => this.handleLocationSearch()
                );
                
                AdminDashboard.UI.addEventListenerWithCleanup(
                    locationSearch,
                    'focus',
                    () => this.showLocationResults()
                );
                
                // Hide results when clicking outside
                document.addEventListener('click', (e) => {
                    if (locationResults && 
                        locationSearch && 
                        !locationSearch.contains(e.target) && 
                        !locationResults.contains(e.target)) {
                        locationResults.classList.remove('show');
                    }
                });
            }
            
            // Manage locations button
            if (manageLocationsBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    manageLocationsBtn,
                    'click',
                    (e) => {
                        e.preventDefault();
                        this.openLocationsManager();
                    }
                );
            }
            
            // Locations modal close buttons
            if (closeLocationsModal) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    closeLocationsModal,
                    'click',
                    (e) => {
                        e.preventDefault();
                        AdminDashboard.UI.closeModal('locations-modal');
                    }
                );
            }
            
            if (closeLocationsManager) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    closeLocationsManager,
                    'click',
                    (e) => {
                        e.preventDefault();
                        AdminDashboard.UI.closeModal('locations-modal');
                    }
                );
            }
            
            // Add new location button
            if (addNewLocationBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    addNewLocationBtn,
                    'click',
                    (e) => {
                        e.preventDefault();
                        this.addNewLocation();
                    }
                );
            }
            
            // Location list search
            if (locationListSearch) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    locationListSearch,
                    'input',
                    () => this.filterLocationsList()
                );
            }
            
            // Story list search and filters
            if (storySearch) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    storySearch,
                    'input',
                    () => this.applyFilters()
                );
            }
            
            if (actFilter) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    actFilter,
                    'change',
                    () => this.applyFilters()
                );
            }
            
            if (chapterFilter) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    chapterFilter,
                    'change',
                    () => this.applyFilters()
                );
            }
            
            // Manage Acts button
            if (manageActsBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    manageActsBtn,
                    'click',
                    (e) => {
                        e.preventDefault();
                        this.openActsManager();
                    }
                );
            }
            
            // Manage Chapters button
            if (manageChaptersBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    manageChaptersBtn,
                    'click',
                    (e) => {
                        e.preventDefault();
                        this.openChaptersManager();
                    }
                );
            }
            
            // Close modal buttons
            if (closeActsModal) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    closeActsModal,
                    'click',
                    (e) => {
                        e.preventDefault();
                        AdminDashboard.UI.closeModal('acts-modal');
                    }
                );
            }
            
            if (closeChaptersModal) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    closeChaptersModal,
                    'click',
                    (e) => {
                        e.preventDefault();
                        AdminDashboard.UI.closeModal('chapters-modal');
                    }
                );
            }
            
            // Add Act button
            if (addActBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    addActBtn,
                    'click',
                    (e) => {
                        e.preventDefault();
                        this.addNewAct();
                    }
                );
            }
            
            // Add Chapter button
            if (addChapterBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    addChapterBtn,
                    'click',
                    (e) => {
                        e.preventDefault();
                        this.addNewChapter();
                    }
                );
            }
            
            // Listen for custom events
            document.addEventListener('story:reload', () => this.loadStoryEpisodes());
        } catch (error) {
            console.error('Error binding StoryEpisodes event listeners:', error);
        }
    },
    
    /**
     * Load story episodes from API and render them
     * @returns {Promise<Array>} - Array of loaded story episodes
     */
    async loadStoryEpisodes() {
        const { storyList } = this.elements;
        
        if (!storyList) {
            console.warn('Cannot load story episodes: storyList element not found');
            return [];
        }
        
        try {
            // Show loading state
            storyList.innerHTML = `
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading story episodes...</p>
                </div>
            `;
            
            // Load all necessary data with Promise.all for concurrent fetching
            const [episodes, locations, acts, chapters] = await Promise.all([
                AdminDashboard.API.StoryEpisodes.getAll(),
                this.loadAvailableLocations(),
                this.loadAvailableActs(),
                this.loadAvailableChapters()
            ]);
            
            // Store data
            this.data = episodes;
            this.isLoaded = true;
            
            // Render episode list
            this.renderStoryList();
            
            // Update dashboard stats
            this.updateStoryCount();
            
            return this.data;
        } catch (error) {
            console.error('Error loading story episodes:', error);
            
            // Show error message in the list
            if (storyList) {
                storyList.innerHTML = `
                    <div class="error-message">
                        <p>Error loading story episodes: ${error.message || 'Unknown error'}</p>
                        <button class="btn btn-primary retry-btn">
                            <i class="fas fa-sync"></i> Retry
                        </button>
                    </div>
                `;
                
                // Add event listener to retry button
                const retryBtn = storyList.querySelector('.retry-btn');
                if (retryBtn) {
                    AdminDashboard.UI.addEventListenerWithCleanup(
                        retryBtn,
                        'click',
                        () => this.loadStoryEpisodes()
                    );
                }
            }
            
            AdminDashboard.UI.showToast('error', 'Failed to load story episodes. Please try again.');
            return [];
        }
    },
    
    /**
     * Update the story count displayed in the dashboard
     */
    updateStoryCount() {
        const { storyCount } = this.elements;
        
        if (storyCount) {
            storyCount.textContent = this.data.length;
        }
    },
    
    /**
     * Load available locations from API
     * @returns {Promise<Array>} - Array of available locations
     */
    async loadAvailableLocations() {
        try {
            this.availableLocations = await AdminDashboard.API.request(
                AdminDashboard.config.apiEndpoints.locations
            );
            
            return this.availableLocations;
        } catch (error) {
            console.error('Error loading available locations:', error);
            this.availableLocations = [];
            throw new Error('Failed to load locations: ' + (error.message || 'Unknown error'));
        }
    },
    
    /**
     * Load available acts from API
     * @returns {Promise<Array>} - Array of available acts
     */
    async loadAvailableActs() {
        try {
            this.availableActs = await AdminDashboard.API.request(
                AdminDashboard.config.apiEndpoints.acts
            );
            
            this.updateActsDropdown();
            return this.availableActs;
        } catch (error) {
            console.error('Error loading available acts:', error);
            this.availableActs = [];
            throw new Error('Failed to load acts: ' + (error.message || 'Unknown error'));
        }
    },
    
    /**
     * Load available chapters from API
     * @returns {Promise<Array>} - Array of available chapters
     */
    async loadAvailableChapters() {
        try {
            this.availableChapters = await AdminDashboard.API.request(
                AdminDashboard.config.apiEndpoints.chapters
            );
            
            this.updateChaptersDropdown();
            return this.availableChapters;
        } catch (error) {
            console.error('Error loading available chapters:', error);
            this.availableChapters = [];
            throw new Error('Failed to load chapters: ' + (error.message || 'Unknown error'));
        }
    },
    
    /**
     * Update acts dropdown with available acts
     */
    updateActsDropdown() {
        const actDropdown = this.elements.storyAct;
        const actFilter = this.elements.actFilter;
        
        this.updateDropdown(actDropdown, this.availableActs, 'act');
        this.updateDropdown(actFilter, this.availableActs, 'filter');
    },
    
    /**
     * Update chapters dropdown with available chapters
     */
    updateChaptersDropdown() {
        const chapterDropdown = this.elements.storyChapter;
        const chapterFilter = this.elements.chapterFilter;
        
        this.updateDropdown(chapterDropdown, this.availableChapters, 'chapter');
        this.updateDropdown(chapterFilter, this.availableChapters, 'filter');
    },
    
    /**
     * Update a dropdown with options
     * @param {Element} dropdown - The dropdown element to update
     * @param {Array} items - The items to add as options
     * @param {string} type - The type of dropdown ('act', 'chapter', or 'filter')
     */
    updateDropdown(dropdown, items, type) {
        if (!dropdown) return;
        
        // Save current selection
        const currentValue = dropdown.value;
        
        // Clear dropdown
        dropdown.innerHTML = '';
        
        // Add empty option for filter dropdowns
        if (type === 'filter') {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = `All ${type === 'act' ? 'Acts' : 'Chapters'}`;
            dropdown.appendChild(option);
        }
        
        // Add options
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            dropdown.appendChild(option);
        });
        
        // Restore selection if possible
        if (items.some(item => item.id === currentValue)) {
            dropdown.value = currentValue;
        }
    },
    
    /**
     * Show create episode form
     */
    showCreateForm() {
        const { storyModal, modalTitle } = this.elements;
        
        if (!storyModal) {
            console.warn('Cannot show create form: storyModal element not found');
            return;
        }
        
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
     * @param {Object} episode - Story episode to edit
     */
    showEditForm(episode) {
        const { storyModal, modalTitle } = this.elements;
        
        if (!storyModal || !episode) {
            console.warn('Cannot show edit form: storyModal element or episode data not found');
            return;
        }
        
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
     * @returns {Promise<Object|null>} - The created/updated episode or null if validation fails
     */
    async saveStoryEpisode() {
        const { storyForm, saveStoryBtn } = this.elements;
        
        // Basic validation
        if (!this.validateStoryForm()) {
            AdminDashboard.UI.showToast('error', 'Please fill in all required fields');
            return null;
        }
        
        // Disable save button to prevent double submission
        if (saveStoryBtn) {
            saveStoryBtn.disabled = true;
            saveStoryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        }
        
        try {
            // Gather form data
            const episodeData = this.getStoryFormData();
            
            let newOrUpdatedEpisode;
            let activityData = {};
            
            // Save to API
            if (episodeData.id) {
                // Update existing episode
                newOrUpdatedEpisode = await AdminDashboard.API.StoryEpisodes.update(
                    episodeData.id, 
                    episodeData
                );
                
                // Update local cache
                const index = this.data.findIndex(episode => episode.id === episodeData.id);
                if (index !== -1) {
                    this.data[index] = newOrUpdatedEpisode;
                } else {
                    // If not found (shouldn't happen), add it
                    this.data.push(newOrUpdatedEpisode);
                }
                
                // Prepare activity data
                activityData = {
                    icon: 'fa-book-open',
                    title: 'Story Episode Updated',
                    description: `Updated story episode: ${episodeData.title}`,
                    timestamp: new Date().toISOString()
                };
                
                // Show success message
                AdminDashboard.UI.showToast('success', 'Story episode updated successfully!');
            } else {
                // Create new episode
                newOrUpdatedEpisode = await AdminDashboard.API.StoryEpisodes.create(episodeData);
                
                // Add to local cache
                this.data.push(newOrUpdatedEpisode);
                
                // Prepare activity data
                activityData = {
                    icon: 'fa-book-open',
                    title: 'Story Episode Created',
                    description: `Created new story episode: ${episodeData.title}`,
                    timestamp: new Date().toISOString()
                };
                
                // Show success message
                AdminDashboard.UI.showToast('success', 'Story episode created successfully!');
            }
            
            // Close modal
            AdminDashboard.UI.closeModal('story-modal');
            
            // Update list
            this.renderStoryList();
            
            // Update dashboard stats
            this.updateStoryCount();
            
            // Add to recent activity
            if (AdminDashboard.Activities && typeof AdminDashboard.Activities.addActivity === 'function') {
                await AdminDashboard.Activities.addActivity(activityData);
            }
            
            return newOrUpdatedEpisode;
        } catch (error) {
            console.error('Error saving story episode:', error);
            AdminDashboard.UI.showToast('error', 'Error saving story episode: ' + (error.message || 'Unknown error'));
            return null;
        } finally {
            // Re-enable save button
            if (saveStoryBtn) {
                saveStoryBtn.disabled = false;
                saveStoryBtn.innerHTML = '<i class="fas fa-save"></i> Save Episode';
            }
        }
    },
    
    /**
     * Get story episode data from form
     * @returns {Object} - Story episode data
     */
    getStoryFormData() {
        const {
            storyId, storyTitle, storyEpisodeNumber,
            storyDateStart, storyDateEnd, storyAct, storyChapter,
            storyContent, storyImage, storyImageCaption
        } = this.elements;
        
        // Find selected act and chapter
        const actId = storyAct?.value || '';
        const chapterId = storyChapter?.value || '';
        
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
        const contentValue = storyContent?.value || '';
        const contentLines = contentValue.trim().split('\n');
        
        for (const line of contentLines) {
            if (line.trim() !== '') {
                contentHtml += `<p>${this.sanitizeHtml(line.trim())}</p>`;
            }
        }
        
        // Use date end if provided, otherwise use date start
        const dateStart = storyDateStart?.value.trim() || '';
        const dateEnd = storyDateEnd?.value.trim() || dateStart;
        
        const episodeData = {
            title: storyTitle?.value.trim() || '',
            episodeNumber: parseInt(storyEpisodeNumber?.value || '0'),
            dateStart,
            dateEnd,
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
            image: storyImage?.value.trim() || null,
            imageCaption: storyImageCaption?.value.trim() || null
        };
        
        // Add ID if editing
        if (storyId && storyId.value) {
            episodeData.id = storyId.value;
        }
        
        return episodeData;
    },
    
    /**
     * Sanitize HTML to prevent XSS
     * @param {string} html - HTML string to sanitize
     * @returns {string} - Sanitized HTML
     */
    sanitizeHtml(html) {
        const temp = document.createElement('div');
        temp.textContent = html;
        return temp.innerHTML;
    },
    
    /**
     * Delete a story episode
     * @param {string} id - Story episode ID
     * @returns {Promise<boolean>} - True if deletion was successful
     */
    async deleteStoryEpisode(id) {
        if (!id) {
            console.warn('Cannot delete story episode: No ID provided');
            return false;
        }
        
        try {
            // Find episode name before removing
            const deletedEpisode = this.data.find(episode => episode.id === id);
            if (!deletedEpisode) {
                console.warn(`Story episode with ID ${id} not found in local data`);
            }
            
            const episodeTitle = deletedEpisode ? deletedEpisode.title : 'Unknown episode';
            
            // Delete from API
            await AdminDashboard.API.StoryEpisodes.delete(id);
            
            // Remove from local cache
            this.data = this.data.filter(episode => episode.id !== id);
            
            // Update list
            this.renderStoryList();
            
            // Update dashboard stats
            this.updateStoryCount();
            
            // Show success message
            AdminDashboard.UI.showToast('success', 'Story episode deleted successfully!');
            
            // Add to recent activity
            if (AdminDashboard.Activities && typeof AdminDashboard.Activities.addActivity === 'function') {
                await AdminDashboard.Activities.addActivity({
                    icon: 'fa-trash-alt',
                    title: 'Story Episode Deleted',
                    description: `Deleted story episode: ${episodeTitle}`,
                    timestamp: new Date().toISOString()
                });
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting story episode:', error);
            AdminDashboard.UI.showToast('error', 'Error deleting story episode: ' + (error.message || 'Unknown error'));
            return false;
        }
    },
    
    /**
     * Handle location search within the story modal
     */
    handleLocationSearch() {
        const { locationSearch, locationResults } = this.elements;
        
        if (!locationSearch || !locationResults) {
            console.warn('Cannot handle location search: required elements not found');
            return;
        }
        
        const searchTerm = locationSearch.value.trim().toLowerCase();
        
        // Clear previous results
        locationResults.innerHTML = '';
        
        if (!searchTerm) {
            locationResults.classList.remove('show');
            return;
        }
        
        // Filter locations by search term (match by ID or name)
        const matchingLocations = this.availableLocations.filter(loc => 
            (loc.id?.toLowerCase().includes(searchTerm) || false) || 
            (loc.name?.toLowerCase().includes(searchTerm) || false)
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
                    <span class="location-result-name">${loc.name || 'Unnamed'}</span>
                    <span class="location-result-id">${loc.id || 'no-id'}</span>
                `;
                
                AdminDashboard.UI.addEventListenerWithCleanup(
                    item,
                    'click',
                    () => this.selectLocation(loc)
                );
                
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
        
        if (!locationSearch || !locationResults) {
            console.warn('Cannot show location results: required elements not found');
            return;
        }
        
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
                        <span class="location-result-name">${loc.name || 'Unnamed'}</span>
                        <span class="location-result-id">${loc.id || 'no-id'}</span>
                    `;
                    
                    AdminDashboard.UI.addEventListenerWithCleanup(
                        item,
                        'click',
                        () => this.selectLocation(loc)
                    );
                    
                    locationResults.appendChild(item);
                });
                
                if (this.availableLocations.length > 10) {
                    const moreItem = document.createElement('div');
                    moreItem.className = 'location-result-item more-locations';
                    moreItem.textContent = `Type to search more locations...`;
                    locationResults.appendChild(moreItem);
                }
            }
            
            locationResults.classList.add('show');
        }
    },
    
    /**
     * Select a location from the dropdown
     * @param {Object} location - Location to select
     */
    selectLocation(location) {
        const { locationSearch, locationResults } = this.elements;
        
        if (!location || !location.id) {
            console.warn('Cannot select location: Invalid location data');
            return;
        }
        
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
        if (locationSearch) {
            locationSearch.value = '';
        }
        
        if (locationResults) {
            locationResults.classList.remove('show');
        }
    },
    
    /**
     * Open the locations manager modal
     */
    openLocationsManager() {
        const { locationsModal, locationsList } = this.elements;
        
        if (!locationsModal || !locationsList) {
            console.warn('Cannot open locations manager: required elements not found');
            return;
        }
        
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
        this.loadAvailableLocations()
            .then(() => {
                this.renderLocationsList();
            })
            .catch(error => {
                locationsList.innerHTML = `
                    <div class="error-message">
                        <p>Error loading locations: ${error.message || 'Unknown error'}</p>
                        <button class="btn btn-primary retry-btn">
                            <i class="fas fa-sync"></i> Retry
                        </button>
                    </div>
                `;
                
                // Add event listener to retry button
                const retryBtn = locationsList.querySelector('.retry-btn');
                if (retryBtn) {
                    AdminDashboard.UI.addEventListenerWithCleanup(
                        retryBtn,
                        'click',
                        () => {
                            this.loadAvailableLocations()
                                .then(() => this.renderLocationsList());
                        }
                    );
                }
            });
    },
    
    /**
     * Add a new location to the system
     */
    async addNewLocation() {
        const { newLocationId, newLocationName, locationsList } = this.elements;
        
        if (!newLocationId || !newLocationName) {
            console.warn('Cannot add new location: required form elements not found');
            return;
        }
        
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
            // Show loading state if location list exists
            if (locationsList) {
                locationsList.innerHTML = `
                    <div class="loading-indicator">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Adding location...</p>
                    </div>
                `;
            }
            
            // Use the centralized API request method to add the location
            this.availableLocations = await AdminDashboard.API.request(
                AdminDashboard.config.apiEndpoints.locations, 
                {
                    method: 'POST',
                    body: JSON.stringify({ id, name })
                }
            );
            
            // Render updated list
            this.renderLocationsList();
            
            // Clear form
            newLocationId.value = '';
            newLocationName.value = '';
            
            // Show success message
            AdminDashboard.UI.showToast('success', `Location "${name}" added successfully`);
        } catch (error) {
            console.error('Error adding location:', error);
            AdminDashboard.UI.showToast('error', 'Failed to add location: ' + (error.message || 'Unknown error'));
            
            // Reset location list
            this.renderLocationsList();
        }
    },
    
    /**
     * Render the list of available locations in the manager modal
     */
    renderLocationsList() {
        const { locationsList, locationListSearch } = this.elements;
        
        if (!locationsList) {
            console.warn('Cannot render locations list: locationsList element not found');
            return;
        }
        
        // Get search term if any
        const searchTerm = locationListSearch ? locationListSearch.value.trim().toLowerCase() : '';
        
        // Filter locations if search term is provided
        let locationsToShow = this.availableLocations;
        if (searchTerm) {
            locationsToShow = this.availableLocations.filter(loc => 
                (loc.id?.toLowerCase().includes(searchTerm) || false) || 
                (loc.name?.toLowerCase().includes(searchTerm) || false)
            );
        }
        
        // Clear list
        locationsList.innerHTML = '';
        
        // Show message if no locations
        if (locationsToShow.length === 0) {
            locationsList.innerHTML = `
                <div class="empty-message">
                    <p>${searchTerm ? 'No matching locations found' : 'No locations available'}</p>
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
                    <span class="location-info-name">${loc.name || 'Unnamed'}</span>
                    <span class="location-info-id">${loc.id || 'no-id'}</span>
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
                AdminDashboard.UI.addEventListenerWithCleanup(
                    addBtn,
                    'click',
                    () => {
                        this.selectLocation(loc);
                        AdminDashboard.UI.showToast('success', `Added "${loc.name}" to episode`);
                    }
                );
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
     * @param {string} id - Location ID to remove
     */
    removeLocation(id) {
        if (!id) {
            console.warn('Cannot remove location: No ID provided');
            return;
        }
        
        this.locations = this.locations.filter(loc => loc.id !== id);
        this.renderLocationChips();
    },
    
    /**
     * Render location chips in the form
     */
    renderLocationChips() {
        const { locationChips } = this.elements;
        
        if (!locationChips) {
            console.warn('Cannot render location chips: locationChips element not found');
            return;
        }
        
        locationChips.innerHTML = '';
        
        this.locations.forEach(loc => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.innerHTML = `
                <span class="chip-text">${loc.name || 'Unnamed'} (${loc.id || 'no-id'})</span>
                <button type="button" class="chip-remove" data-id="${loc.id || ''}">×</button>
            `;
            locationChips.appendChild(chip);
            
            // Add remove event
            const removeBtn = chip.querySelector('.chip-remove');
            if (removeBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    removeBtn,
                    'click',
                    () => this.removeLocation(loc.id)
                );
            }
        });
    },
    
    /**
     * Validate story form
     * @returns {boolean} - True if form is valid
     */
    validateStoryForm() {
        const { storyForm } = this.elements;
        
        if (!storyForm) {
            console.warn('Cannot validate story form: storyForm element not found');
            return false;
        }
        
        const requiredFields = storyForm.querySelectorAll('[required]');
        let valid = true;
        
        // Reset all error states
        storyForm.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });
        
        // Check required fields
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                
                // Add error message if not already present
                if (!field.nextElementSibling?.classList.contains('field-error-msg')) {
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'field-error-msg';
                    errorMsg.textContent = 'This field is required';
                    field.insertAdjacentElement('afterend', errorMsg);
                }
                
                valid = false;
            } else {
                // Remove any existing error message
                const errorMsg = field.nextElementSibling;
                if (errorMsg?.classList.contains('field-error-msg')) {
                    errorMsg.remove();
                }
            }
        });
        
        // Validate that at least one location is added
        if (this.locations.length === 0) {
            AdminDashboard.UI.showToast('error', 'Please add at least one location.');
            
            if (this.elements.locationSearch) {
                this.elements.locationSearch.classList.add('error');
                
                // Add error message if not already present
                if (!this.elements.locationSearch.nextElementSibling?.classList.contains('field-error-msg')) {
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'field-error-msg';
                    errorMsg.textContent = 'At least one location is required';
                    this.elements.locationSearch.insertAdjacentElement('afterend', errorMsg);
                }
            }
            
            valid = false;
        } else if (this.elements.locationSearch) {
            this.elements.locationSearch.classList.remove('error');
            
            // Remove any existing error message
            const errorMsg = this.elements.locationSearch.nextElementSibling;
            if (errorMsg?.classList.contains('field-error-msg')) {
                errorMsg.remove();
            }
        }
        
        // Additional validation for episode number (must be a number)
        const episodeNumberField = this.elements.storyEpisodeNumber;
        if (episodeNumberField && episodeNumberField.value) {
            const episodeValue = parseInt(episodeNumberField.value);
            if (isNaN(episodeValue) || episodeValue < 1) {
                episodeNumberField.classList.add('error');
                
                if (!episodeNumberField.nextElementSibling?.classList.contains('field-error-msg')) {
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'field-error-msg';
                    errorMsg.textContent = 'Episode number must be a positive number';
                    episodeNumberField.insertAdjacentElement('afterend', errorMsg);
                }
                
                valid = false;
            }
        }
        
        if (!valid) {
            // Focus the first invalid field
            const firstInvalidField = storyForm.querySelector('.error');
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
        }
        
        return valid;
    },
    
    /**
     * Reset story form
     */
    resetStoryForm() {
        const { storyForm } = this.elements;
        
        if (!storyForm) {
            console.warn('Cannot reset story form: storyForm element not found');
            return;
        }
        
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
        
        // Remove any error messages
        storyForm.querySelectorAll('.field-error-msg').forEach(msg => {
            msg.remove();
        });
        
        // Set default date to today if field exists
        if (this.elements.storyDateStart) {
            const today = new Date().toISOString().split('T')[0];
            this.elements.storyDateStart.value = today;
        }
    },
    
    /**
     * Populate story form for editing
     * @param {Object} episode - Story episode data
     */
    populateStoryForm(episode) {
        if (!episode) {
            console.warn('Cannot populate form: No episode data provided');
            return;
        }
        
        // Reset form first to clear any previous data
        this.resetStoryForm();
        
        // Set basic fields
        const fields = {
            'story-id': episode.id,
            'story-title': episode.title,
            'story-episode-number': episode.episodeNumber,
            'story-date-start': episode.dateStart,
            'story-date-end': episode.dateEnd === episode.dateStart ? '' : episode.dateEnd,
            'story-act': episode.act?.id,
            'story-chapter': episode.chapter?.id
        };
        
        // Update each field if it exists
        Object.entries(fields).forEach(([id, value]) => {
            const field = document.getElementById(id);
            if (field) {
                field.value = value;
            } else {
                console.warn(`Field not found for population: ${id}`);
            }
        });
        
        // Set additional fields if they exist
        if (this.elements.storyImage) {
            this.elements.storyImage.value = episode.image || '';
        }
        
        if (this.elements.storyImageCaption) {
            this.elements.storyImageCaption.value = episode.imageCaption || '';
        }
        
        // Set locations
        this.locations = episode.locations ? [...episode.locations] : [];
        this.renderLocationChips();
        
        // Set content - convert from HTML to plain text with line breaks
        if (this.elements.storyContent) {
            let content = episode.content || '';
            content = content.replace(/<p>(.*?)<\/p>/g, '$1\n');
            this.elements.storyContent.value = content.trim();
        }
    },
    
    /**
     * Open the acts manager modal
     */
    async openActsManager() {
        const { actsModal, actsList } = this.elements;
        
        if (!actsModal || !actsList) {
            console.warn('Cannot open acts manager: required elements not found');
            return;
        }
        
        // Show loading state
        actsList.innerHTML = `
            <div class="loading-indicator">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading acts...</p>
            </div>
        `;
        
        // Open modal
        AdminDashboard.UI.openModal(actsModal);
        
        try {
            // Fetch latest acts
            await this.loadAvailableActs();
            
            // Render the acts list
            this.renderActsList();
        } catch (error) {
            actsList.innerHTML = `
                <div class="error-message">
                    <p>Error loading acts: ${error.message || 'Unknown error'}</p>
                    <button class="btn btn-primary retry-btn">
                        <i class="fas fa-sync"></i> Retry
                    </button>
                </div>
            `;
            
            // Add event listener to retry button
            const retryBtn = actsList.querySelector('.retry-btn');
            if (retryBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    retryBtn,
                    'click',
                    () => this.loadAvailableActs().then(() => this.renderActsList())
                );
            }
        }
    },
    
    /**
     * Render the acts list in the manager modal
     */
    renderActsList() {
        const { actsList } = this.elements;
        
        if (!actsList) {
            console.warn('Cannot render acts list: actsList element not found');
            return;
        }
        
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
                    <h4 class="act-name">${act.name || 'Unnamed Act'}</h4>
                    <p class="act-subtitle">${act.subtitle || ''}</p>
                    <p class="act-id">ID: ${act.id || 'no-id'}</p>
                </div>
            `;
            actsList.appendChild(item);
        });
    },
    
    /**
     * Add a new act
     */
    async addNewAct() {
        const { newActId, newActName, newActSubtitle, actsList } = this.elements;
        
        if (!newActId || !newActName) {
            console.warn('Cannot add new act: required form elements not found');
            return;
        }
        
        const id = newActId.value.trim();
        const name = newActName.value.trim();
        const subtitle = newActSubtitle?.value.trim() || '';
        
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
            // Show loading state if acts list exists
            if (actsList) {
                actsList.innerHTML = `
                    <div class="loading-indicator">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Adding act...</p>
                    </div>
                `;
            }
            
            // Add new act via API
            this.availableActs = await AdminDashboard.API.request(
                AdminDashboard.config.apiEndpoints.acts,
                {
                    method: 'POST',
                    body: JSON.stringify({ id, name, subtitle })
                }
            );
            
            // Update acts dropdown
            this.updateActsDropdown();
            
            // Render updated list
            this.renderActsList();
            
            // Clear form
            newActId.value = '';
            newActName.value = '';
            if (newActSubtitle) {
                newActSubtitle.value = '';
            }
            
            // Show success message
            AdminDashboard.UI.showToast('success', `Act "${name}" added successfully`);
        } catch (error) {
            console.error('Error adding act:', error);
            AdminDashboard.UI.showToast('error', 'Failed to add act: ' + (error.message || 'Unknown error'));
            
            // Reset acts list
            this.renderActsList();
        }
    },
    
    /**
     * Open the chapters manager modal
     */
    async openChaptersManager() {
        const { chaptersModal, chaptersList } = this.elements;
        
        if (!chaptersModal || !chaptersList) {
            console.warn('Cannot open chapters manager: required elements not found');
            return;
        }
        
        // Show loading state
        chaptersList.innerHTML = `
            <div class="loading-indicator">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading chapters...</p>
            </div>
        `;
        
        // Open modal
        AdminDashboard.UI.openModal(chaptersModal);
        
        try {
            // Fetch latest chapters
            await this.loadAvailableChapters();
            
            // Render the chapters list
            this.renderChaptersList();
        } catch (error) {
            chaptersList.innerHTML = `
                <div class="error-message">
                    <p>Error loading chapters: ${error.message || 'Unknown error'}</p>
                    <button class="btn btn-primary retry-btn">
                        <i class="fas fa-sync"></i> Retry
                    </button>
                </div>
            `;
            
            // Add event listener to retry button
            const retryBtn = chaptersList.querySelector('.retry-btn');
            if (retryBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    retryBtn,
                    'click',
                    () => this.loadAvailableChapters().then(() => this.renderChaptersList())
                );
            }
        }
    },
    
    /**
     * Render the chapters list in the manager modal
     */
    renderChaptersList() {
        const { chaptersList } = this.elements;
        
        if (!chaptersList) {
            console.warn('Cannot render chapters list: chaptersList element not found');
            return;
        }
        
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
                    <h4 class="chapter-name">${chapter.name || 'Unnamed Chapter'}</h4>
                    <p class="chapter-subtitle">${chapter.subtitle || ''}</p>
                    <p class="chapter-id">ID: ${chapter.id || 'no-id'}</p>
                </div>
            `;
            chaptersList.appendChild(item);
        });
    },
    
    /**
     * Add a new chapter
     */
    async addNewChapter() {
        const { newChapterId, newChapterName, newChapterSubtitle, chaptersList } = this.elements;
        
        if (!newChapterId || !newChapterName) {
            console.warn('Cannot add new chapter: required form elements not found');
            return;
        }
        
        const id = newChapterId.value.trim();
        const name = newChapterName.value.trim();
        const subtitle = newChapterSubtitle?.value.trim() || '';
        
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
            // Show loading state if chapters list exists
            if (chaptersList) {
                chaptersList.innerHTML = `
                    <div class="loading-indicator">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Adding chapter...</p>
                    </div>
                `;
            }
            
            // Add new chapter via API
            this.availableChapters = await AdminDashboard.API.request(
                AdminDashboard.config.apiEndpoints.chapters,
                {
                    method: 'POST',
                    body: JSON.stringify({ id, name, subtitle })
                }
            );
            
            // Update chapters dropdown
            this.updateChaptersDropdown();
            
            // Render updated list
            this.renderChaptersList();
            
            // Clear form
            newChapterId.value = '';
            newChapterName.value = '';
            if (newChapterSubtitle) {
                newChapterSubtitle.value = '';
            }
            
            // Show success message
            AdminDashboard.UI.showToast('success', `Chapter "${name}" added successfully`);
        } catch (error) {
            console.error('Error adding chapter:', error);
            AdminDashboard.UI.showToast('error', 'Failed to add chapter: ' + (error.message || 'Unknown error'));
            
            // Reset chapters list
            this.renderChaptersList();
        }
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
     * @param {string} searchTerm - Search term to filter by
     * @param {string} actFilter - Act to filter by
     * @param {string} chapterFilter - Chapter to filter by
     */
    renderStoryList(searchTerm = '', actFilter = '', chapterFilter = '') {
        const { storyList } = this.elements;
        
        if (!storyList) {
            console.warn('Cannot render story list: storyList element not found');
            return;
        }
        
        // Only proceed if we have data
        if (!this.isLoaded) {
            storyList.innerHTML = `
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading story episodes...</p>
                </div>
            `;
            this.loadStoryEpisodes();
            return;
        }
        
        // Filter story episodes if needed
        let filteredEpisodes = [...this.data];
        
        // Apply filters
        if (searchTerm) {
            filteredEpisodes = filteredEpisodes.filter(episode => 
                (episode.title?.toLowerCase().includes(searchTerm) || false) || 
                (episode.content?.toLowerCase().includes(searchTerm) || false) ||
                (episode.locations && episode.locations.some(loc => 
                    (loc.name?.toLowerCase().includes(searchTerm) || false) || 
                    (loc.id?.toLowerCase().includes(searchTerm) || false)
                ))
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
                    ${!searchTerm && !actFilter && !chapterFilter ? `
                        <button class="btn btn-primary create-new-btn">
                            <i class="fas fa-plus"></i> Create New Episode
                        </button>
                    ` : ''}
                </div>
            `;
            
            // Add event listener to the create button if present
            const createNewBtn = storyList.querySelector('.create-new-btn');
            if (createNewBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    createNewBtn,
                    'click',
                    () => this.showCreateForm()
                );
            }
            
            return;
        }
        
        // Clear list
        storyList.innerHTML = '';
        
        // Sort by episode number
        filteredEpisodes.sort((a, b) => {
            const numA = parseInt(a.episodeNumber || '0');
            const numB = parseInt(b.episodeNumber || '0');
            return numA - numB;
        });
        
        // Add each episode
        filteredEpisodes.forEach(episode => {
            const episodeElement = this.createStoryListItem(episode);
            if (episodeElement) {
                storyList.appendChild(episodeElement);
            }
        });
    },
    
    /**
     * Create story list item element
     * @param {Object} episode - Story episode data
     * @returns {Element} - Story list item DOM element
     */
    createStoryListItem(episode) {
        if (!episode || !episode.id) {
            console.warn('Cannot create story list item: Invalid episode data');
            return null;
        }
        
        const episodeItem = document.createElement('div');
        episodeItem.className = 'story-item';
        episodeItem.setAttribute('data-id', episode.id);
        
        // Location display
        let locationDisplay = '';
        if (episode.locations && episode.locations.length > 0) {
            locationDisplay = episode.locations
                .map(loc => `<span class="location-tag">${loc.name || loc.id || 'Unknown'}</span>`)
                .join(' ');
        } else {
            locationDisplay = '<span class="location-tag">No locations</span>';
        }
        
        // Image badge
        const hasImageBadge = episode.image ? 
            `<span class="badge badge-info"><i class="fas fa-image"></i> Has Image</span>` : 
            '';
        
        // Date display
        let dateDisplay = episode.dateStart || 'No date';
        if (episode.dateEnd && episode.dateEnd !== episode.dateStart) {
            dateDisplay = `${episode.dateStart} - ${episode.dateEnd}`;
        }
        
        // Act and chapter display
        const actName = episode.act?.name || 'Unknown Act';
        const chapterName = episode.chapter?.name || 'Unknown Chapter';
        
        episodeItem.innerHTML = `
            <div class="item-header">
                <div class="story-meta">
                    <span class="story-number">Session ${episode.episodeNumber || 'X'}</span>
                    <span class="story-info">
                        <span class="badge badge-primary">${actName}</span>
                        <span class="badge badge-secondary">${chapterName}</span>
                        ${hasImageBadge}
                    </span>
                </div>
                <h3 class="story-title">${episode.title || 'Untitled Episode'}</h3>
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
                ${episode.image ? `
                <button class="action-btn view-image" title="View image">
                    <i class="fas fa-image"></i>
                </button>
                ` : ''}
            </div>
        `;
        
        // Add event listeners
        const editBtn = episodeItem.querySelector('.edit');
        if (editBtn) {
            AdminDashboard.UI.addEventListenerWithCleanup(
                editBtn,
                'click',
                () => this.showEditForm(episode)
            );
        }
        
        const deleteBtn = episodeItem.querySelector('.delete');
        if (deleteBtn) {
            AdminDashboard.UI.addEventListenerWithCleanup(
                deleteBtn,
                'click',
                () => {
                    AdminDashboard.UI.showConfirmation({
                        title: 'Delete Story Episode',
                        message: `Are you sure you want to delete "${episode.title}" (Session ${episode.episodeNumber})? This action cannot be undone.`,
                        confirmText: 'Delete',
                        confirmClass: 'btn-danger',
                        onConfirm: () => this.deleteStoryEpisode(episode.id),
                        onCancel: () => console.log(`Deletion of episode "${episode.title}" cancelled`)
                    });
                }
            );
        }
        
        const viewImageBtn = episodeItem.querySelector('.view-image');
        if (viewImageBtn && episode.image) {
            AdminDashboard.UI.addEventListenerWithCleanup(
                viewImageBtn,
                'click',
                () => {
                    // Create a modal to show the image
                    const modal = document.createElement('div');
                    modal.className = 'modal image-preview-modal';
                    modal.innerHTML = `
                        <div class="modal-content">
                            <div class="modal-header">
                                <h3>${episode.title}</h3>
                                <button class="close-btn">&times;</button>
                            </div>
                            <div class="modal-body">
                                <img src="${episode.image}" alt="${episode.title}" style="max-width:100%;">
                                ${episode.imageCaption ? `<p class="image-caption">${episode.imageCaption}</p>` : ''}
                            </div>
                        </div>
                    `;
                    
                    document.body.appendChild(modal);
                    
                    // Add close handler
                    const closeBtn = modal.querySelector('.close-btn');
                    if (closeBtn) {
                        closeBtn.addEventListener('click', () => {
                            document.body.removeChild(modal);
                        });
                    }
                    
                    // Close when clicking outside
                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) {
                            document.body.removeChild(modal);
                        }
                    });
                    
                    // Show modal
                    setTimeout(() => {
                        modal.classList.add('active');
                    }, 10);
                }
            );
        }
        
        return episodeItem;
    },
    
    /**
     * Get a preview of the content (strips HTML tags and limits length)
     * @param {string} content - HTML content
     * @returns {string} - Content preview
     */
    getContentPreview(content) {
        if (!content) return 'No content';
        
        // Strip HTML tags
        const strippedContent = content.replace(/<\/?[^>]+(>|$)/g, ' ').replace(/\s+/g, ' ').trim();
        
        // Limit to 200 characters
        if (strippedContent.length > 200) {
            return strippedContent.substring(0, 200) + '...';
        }
        
        return strippedContent;
    }
};

/**
 * Articles Module - Article content management functionality
 */
AdminDashboard.Articles = {
    // Local cache of article data
    data: [],
    
    // Track loaded state
    isLoaded: false,
    
    // DOM elements used by this module
    elements: {},
    
    /**
     * Initialize the Articles module
     * @returns {Object} - The Articles module for chaining
     */
    init() {
        try {
            this.cacheElements();
            this.bindEvents();
            
            // Add markdown toolbar
            this.initMarkdownToolbar();
            
            // Determine if we're on the Articles page before loading data
            if (document.getElementById('articles-section')) {
                this.loadArticles();
            }
            
            return this;
        } catch (error) {
            console.error('Error initializing Articles module:', error);
            AdminDashboard.UI.showToast('error', 'Failed to initialize Articles management');
            return this;
        }
    },
    
    /**
     * Initialize markdown toolbar for the content editor
     */
    initMarkdownToolbar() {
        const { contentEditor } = this.elements;
        if (!contentEditor) {
            console.warn('Cannot initialize markdown toolbar: contentEditor element not found');
            return;
        }
        
        // Create toolbar container
        const toolbarContainer = document.createElement('div');
        toolbarContainer.className = 'markdown-toolbar';
        
        // Define toolbar buttons
        const buttons = [
            { icon: 'fa-heading', title: 'Heading 1', action: () => this.insertMarkdown('# ', '', 'Heading text') },
            { icon: 'fa-heading', title: 'Heading 2', action: () => this.insertMarkdown('## ', '', 'Heading text'), style: 'font-size: 0.9em;' },
            { icon: 'fa-heading', title: 'Heading 3', action: () => this.insertMarkdown('### ', '', 'Heading text'), style: 'font-size: 0.8em;' },
            { icon: 'fa-bold', title: 'Bold', action: () => this.insertMarkdown('**', '**', 'bold text') },
            { icon: 'fa-italic', title: 'Italic', action: () => this.insertMarkdown('*', '*', 'italic text') },
            { icon: 'fa-list-ul', title: 'Bullet List', action: () => this.insertMarkdown('- ', '', 'List item') },
            { icon: 'fa-list-ol', title: 'Numbered List', action: () => this.insertMarkdown('1. ', '', 'List item') },
            { icon: 'fa-quote-right', title: 'Blockquote', action: () => this.insertMarkdown('> ', '', 'Blockquote text') },
            { icon: 'fa-link', title: 'Link', action: () => this.insertMarkdown('[', '](url)', 'link text') },
            { icon: 'fa-image', title: 'Image', action: () => this.insertMarkdown('![', '](image-url)', 'alt text') },
            { icon: 'fa-code', title: 'Code', action: () => this.insertMarkdown('`', '`', 'code') },
            { icon: 'fa-code', title: 'Code Block', action: () => this.insertMarkdown('```\n', '\n```', 'code block') },
            { icon: 'fa-minus', title: 'Horizontal Rule', action: () => this.insertMarkdown('\n---\n', '', '') }
        ];
        
        // Create and append buttons to toolbar
        buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'markdown-tool-btn';
            btn.title = button.title;
            btn.innerHTML = `<i class="fas ${button.icon}"></i>`;
            
            if (button.style) {
                btn.setAttribute('style', button.style);
            }
            
            // Add click event
            AdminDashboard.UI.addEventListenerWithCleanup(
                btn,
                'click',
                (e) => {
                    e.preventDefault();
                    button.action();
                }
            );
            
            toolbarContainer.appendChild(btn);
        });
        
        // Insert toolbar before content editor
        contentEditor.parentNode.insertBefore(toolbarContainer, contentEditor);
        
        // Add CSS if not already in stylesheet
        if (!document.getElementById('markdown-toolbar-styles')) {
            const style = document.createElement('style');
            style.id = 'markdown-toolbar-styles';
            style.textContent = `
                .markdown-toolbar {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 5px;
                    padding: 8px;
                    background: #f5f5f5;
                    border: 1px solid #ddd;
                    border-bottom: none;
                    border-radius: 4px 4px 0 0;
                }
                
                .markdown-tool-btn {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #fff;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .markdown-tool-btn:hover {
                    background: #e9e9e9;
                }
                
                .markdown-tool-btn:active {
                    background: #ddd;
                }
                
                .markdown-tool-btn i {
                    color: #555;
                }
                
                #article-content {
                    border-top-left-radius: 0;
                    border-top-right-radius: 0;
                }
            `;
            
            document.head.appendChild(style);
        }
    },
    
    /**
     * Insert markdown syntax at cursor position or around selected text
     * @param {string} before - Text to insert before selection
     * @param {string} after - Text to insert after selection
     * @param {string} placeholder - Text to use if no selection
     */
    insertMarkdown(before, after, placeholder) {
        const { contentEditor } = this.elements;
        if (!contentEditor) return;
        
        // Save current scroll position
        const scrollPos = contentEditor.scrollTop;
        
        // Get selection positions
        const start = contentEditor.selectionStart;
        const end = contentEditor.selectionEnd;
        const selectedText = contentEditor.value.substring(start, end);
        
        // Determine text to insert
        const textToInsert = selectedText || placeholder;
        
        // Insert markdown
        contentEditor.value = 
            contentEditor.value.substring(0, start) + 
            before + 
            textToInsert + 
            after + 
            contentEditor.value.substring(end);
        
        // Set cursor position after insertion
        const newPosition = start + before.length + textToInsert.length + after.length;
        
        // Focus and select the inserted text
        contentEditor.focus();
        if (selectedText) {
            // If there was already selected text, just place cursor at end
            contentEditor.setSelectionRange(newPosition, newPosition);
        } else {
            // If placeholder was used, select it for easy replacement
            contentEditor.setSelectionRange(start + before.length, start + before.length + placeholder.length);
        }
        
        // Restore scroll position
        contentEditor.scrollTop = scrollPos;
    },
    /**
     * Cache DOM elements used by this module
     * @returns {Object} - Object containing cached elements
     */
    cacheElements() {
        try {
            this.elements = {
                // Main content elements
                articlesList: document.getElementById('articles-list'),
                articlesContainer: document.getElementById('articles-section'),
                articlesCount: document.getElementById('articles-count'),
                
                // Form elements
                createArticleBtn: document.getElementById('create-article-btn'),
                articleModal: document.getElementById('article-modal'),
                articleForm: document.getElementById('article-form'),
                saveArticleBtn: document.getElementById('save-article'),
                cancelArticleBtn: document.getElementById('cancel-article'),
                closeModalBtn: document.getElementById('close-article-modal'),
                modalTitle: document.getElementById('article-modal-title'),
                
                // Form fields
                articleId: document.getElementById('article-id'),
                articleTitle: document.getElementById('article-title'),
                articleSubtitle: document.getElementById('article-subtitle'),
                articleExcerpt: document.getElementById('article-excerpt'),
                articleImage: document.getElementById('article-image'),
                articleDate: document.getElementById('article-date'),
                articleFeatured: document.getElementById('article-featured'),
                articleStatus: document.getElementById('article-status'),
                articleAuthor: document.getElementById('article-author'),
                articleContent: document.getElementById('article-content'),
                articleReadTime: document.getElementById('article-read-time'),
                articleRelatedVideo: document.getElementById('article-related-video'),
                
                // Tag management
                articleTagsInput: document.getElementById('article-tags-input'),
                tagDisplay: document.getElementById('tag-display'),
                
                // Content preview
                contentEditor: document.getElementById('article-content'),
                contentPreview: document.getElementById('content-preview'),
                previewToggle: document.getElementById('preview-toggle'),
                
                // SEO fields
                seoTitle: document.getElementById('seo-title'),
                seoDescription: document.getElementById('seo-description'),
                seoKeywords: document.getElementById('seo-keywords'),
                
                // Filter elements
                articleSearch: document.getElementById('article-search'),
                tagFilter: document.getElementById('tag-filter'),
                statusFilter: document.getElementById('status-filter')
            };
            
            return this.elements;
        } catch (error) {
            console.error('Error caching Articles DOM elements:', error);
            return {};
        }
    },
    
    /**
     * Bind event listeners to DOM elements
     */
    bindEvents() {
        try {
            const { 
                createArticleBtn, saveArticleBtn, cancelArticleBtn, closeModalBtn,
                articleSearch, tagFilter, statusFilter,
                articleTagsInput, previewToggle, articleForm
            } = this.elements;
            
            // Create article button
            if (createArticleBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    createArticleBtn,
                    'click',
                    (e) => {
                        e.preventDefault();
                        this.showCreateForm();
                    }
                );
            }
            
            // Save article button
            if (saveArticleBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    saveArticleBtn,
                    'click',
                    (e) => {
                        e.preventDefault();
                        this.saveArticle();
                    }
                );
            }
            
            // Form submit handling to prevent default submission
            if (articleForm) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    articleForm,
                    'submit',
                    (e) => {
                        e.preventDefault();
                        this.saveArticle();
                    }
                );
            }
            
            // Cancel and close buttons
            if (cancelArticleBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    cancelArticleBtn,
                    'click',
                    (e) => {
                        e.preventDefault();
                        AdminDashboard.UI.closeModal('article-modal');
                    }
                );
            }
            
            if (closeModalBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    closeModalBtn,
                    'click',
                    (e) => {
                        e.preventDefault();
                        AdminDashboard.UI.closeModal('article-modal');
                    }
                );
            }
            
            // Tags input handling
            if (articleTagsInput) {
                // Add tag when Enter is pressed
                AdminDashboard.UI.addEventListenerWithCleanup(
                    articleTagsInput,
                    'keydown',
                    (e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            const tagValue = articleTagsInput.value.trim();
                            if (tagValue) {
                                this.addTag(tagValue);
                                articleTagsInput.value = '';
                            }
                        }
                    }
                );
                
                // Add tag when input loses focus
                AdminDashboard.UI.addEventListenerWithCleanup(
                    articleTagsInput,
                    'blur',
                    () => {
                        const tagValue = articleTagsInput.value.trim();
                        if (tagValue) {
                            this.addTag(tagValue);
                            articleTagsInput.value = '';
                        }
                    }
                );
            }
            
            // Content preview toggle
            if (previewToggle) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    previewToggle,
                    'click',
                    (e) => {
                        e.preventDefault();
                        this.togglePreview();
                    }
                );
            }
            
            // Search and filters
            if (articleSearch) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    articleSearch,
                    'input',
                    () => this.applyFilters()
                );
            }
            
            if (tagFilter) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    tagFilter,
                    'change',
                    () => this.applyFilters()
                );
            }
            
            if (statusFilter) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    statusFilter,
                    'change',
                    () => this.applyFilters()
                );
            }
            
            // Listen for custom events
            document.addEventListener('articles:reload', () => this.loadArticles());
        } catch (error) {
            console.error('Error binding Articles event listeners:', error);
        }
    },
    
    /**
     * Load articles from API and render them
     * @returns {Promise<Array>} - Array of loaded articles
     */
    async loadArticles() {
        const { articlesList } = this.elements;
        
        if (!articlesList) {
            console.warn('Cannot load articles: articlesList element not found');
            return [];
        }
        
        try {
            // Show loading state
            articlesList.innerHTML = `
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading articles...</p>
                </div>
            `;
            
            // Fetch articles from API
            this.data = await AdminDashboard.API.Articles.getAll();
            this.isLoaded = true;
            
            // Render article list
            this.renderArticleList();
            
            // Update dashboard stats
            this.updateArticlesCount();
            
            // Update tag filter options
            this.updateTagFilter();
            
            return this.data;
        } catch (error) {
            console.error('Error loading articles:', error);
            
            // Show error message in the list
            if (articlesList) {
                articlesList.innerHTML = `
                    <div class="error-message">
                        <p>Error loading articles: ${error.message || 'Unknown error'}</p>
                        <button class="btn btn-primary retry-btn">
                            <i class="fas fa-sync"></i> Retry
                        </button>
                    </div>
                `;
                
                // Add event listener to retry button
                const retryBtn = articlesList.querySelector('.retry-btn');
                if (retryBtn) {
                    AdminDashboard.UI.addEventListenerWithCleanup(
                        retryBtn,
                        'click',
                        () => this.loadArticles()
                    );
                }
            }
            
            AdminDashboard.UI.showToast('error', 'Failed to load articles. Please try again.');
            return [];
        }
    },
    
    /**
     * Update tag filter with all available tags
     */
    updateTagFilter() {
        const { tagFilter } = this.elements;
        
        if (!tagFilter) {
            return;
        }
        
        try {
            // Extract all unique tags from articles
            const tags = new Set();
            
            this.data.forEach(article => {
                if (article.tags && Array.isArray(article.tags)) {
                    article.tags.forEach(tag => {
                        if (tag && typeof tag === 'string') {
                            tags.add(tag.trim());
                        }
                    });
                }
            });
            
            // Sort tags alphabetically
            const sortedTags = Array.from(tags).sort();
            
            // Save current selection
            const currentValue = tagFilter.value;
            
            // Clear current options but keep the default "All Tags" option
            tagFilter.innerHTML = '<option value="">All Tags</option>';
            
            // Add tag options
            sortedTags.forEach(tag => {
                const option = document.createElement('option');
                option.value = tag;
                option.textContent = tag;
                tagFilter.appendChild(option);
            });
            
            // Restore selection if possible
            if (sortedTags.includes(currentValue)) {
                tagFilter.value = currentValue;
            }
        } catch (error) {
            console.error('Error updating tag filter:', error);
        }
    },
    
    /**
     * Update the articles count displayed in the dashboard
     */
    updateArticlesCount() {
        const { articlesCount } = this.elements;
        
        if (articlesCount) {
            articlesCount.textContent = this.data.length;
        }
    },
    
    /**
     * Show create article form
     */
    showCreateForm() {
        const { articleModal, modalTitle } = this.elements;
        
        if (!articleModal) {
            console.warn('Cannot show create form: articleModal element not found');
            return;
        }
        
        // Reset form
        this.resetArticleForm();
        
        // Change modal title to Create
        if (modalTitle) {
            modalTitle.textContent = 'Create New Article';
        }
        
        // Open modal
        AdminDashboard.UI.openModal(articleModal);
    },
    
    /**
     * Show edit article form
     * @param {Object} article - Article to edit
     */
    showEditForm(article) {
        const { articleModal, modalTitle } = this.elements;
        
        if (!articleModal || !article) {
            console.warn('Cannot show edit form: articleModal element or article data not found');
            return;
        }
        
        // Change modal title to Edit
        if (modalTitle) {
            modalTitle.textContent = 'Edit Article';
        }
        
        // Populate form
        this.populateArticleForm(article);
        
        // Open modal
        AdminDashboard.UI.openModal(articleModal);
    },
    
    /**
     * Toggle content preview
     */
    togglePreview() {
        const { contentEditor, contentPreview, previewToggle } = this.elements;
        
        if (!contentEditor || !contentPreview || !previewToggle) {
            console.warn('Cannot toggle preview: required elements not found');
            return;
        }
        
        const isPreviewVisible = contentPreview.style.display !== 'none';
        
        if (isPreviewVisible) {
            // Hide preview
            contentPreview.style.display = 'none';
            contentEditor.style.display = '';
            previewToggle.innerHTML = '<i class="fas fa-eye"></i> Preview';
        } else {
            // Show preview
            contentPreview.style.display = '';
            contentEditor.style.display = 'none';
            previewToggle.innerHTML = '<i class="fas fa-edit"></i> Edit';
            
            // Get content
            const content = contentEditor.value || '';
            
            // Convert to HTML
            const html = this.markdownToHtml(content);
            
            // Set preview content
            contentPreview.innerHTML = html;
        }
    },
    
    /**
     * Convert markdown to HTML
     * @param {string} markdown - Markdown text
     * @returns {string} - HTML text
     */
    markdownToHtml(markdown) {
        if (!markdown) return '';
        
        try {
            // Basic conversion with security measures
            return markdown
                // Escape HTML to prevent XSS
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                // Headers
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
                .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
                // Bold
                .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                // Italic
                .replace(/\*(.*?)\*/gim, '<em>$1</em>')
                .replace(/_(.*?)_/gim, '<em>$1</em>')
                // Links (safely)
                .replace(/\[(.*?)\]\((.*?)\)/gim, (match, text, url) => {
                    // Only allow http/https URLs
                    const safeUrl = url.startsWith('http') ? url : '#';
                    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
                })
                // Lists
                .replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>')
                .replace(/^- (.*$)/gim, '<ul><li>$1</li></ul>')
                .replace(/^\d+\. (.*$)/gim, '<ol><li>$1</li></ol>')
                // Horizontal rule
                .replace(/^---$/gim, '<hr>')
                // Blockquote
                .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
                // Code blocks
                .replace(/```([^`]+)```/gim, '<pre><code>$1</code></pre>')
                // Inline code
                .replace(/`([^`]+)`/gim, '<code>$1</code>')
                // Paragraphs
                .replace(/^\s*(\n)?(.+)/gim, function(m) {
                    return /\<(\/)?(h\d|ul|ol|li|blockquote|pre|code|hr)\>/.test(m) ? m : '<p>' + m + '</p>';
                })
                // Clean up extra tags
                .replace(/<\/ul>\s*<ul>/gim, '')
                .replace(/<\/ol>\s*<ol>/gim, '')
                .replace(/<\/blockquote>\s*<blockquote>/gim, '');
        } catch (error) {
            console.error('Error converting markdown to HTML:', error);
            return '<p>Error rendering content preview.</p>';
        }
    },
    
    /**
     * Save article (create or update)
     * @returns {Promise<Object|null>} - The created/updated article or null if validation fails
     */
    async saveArticle() {
        const { articleForm, saveArticleBtn } = this.elements;
        
        // Basic validation
        if (!this.validateArticleForm()) {
            AdminDashboard.UI.showToast('error', 'Please fill in all required fields');
            return null;
        }
        
        // Disable save button to prevent double submission
        if (saveArticleBtn) {
            saveArticleBtn.disabled = true;
            saveArticleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        }
        
        try {
            // Gather form data
            const articleData = this.getArticleFormData();
            
            let newOrUpdatedArticle;
            let activityData = {};
            
            // Save to API
            if (articleData.id) {
                // Update existing article
                newOrUpdatedArticle = await AdminDashboard.API.Articles.update(
                    articleData.id, 
                    articleData
                );
                
                // Update local cache
                const index = this.data.findIndex(article => article.id === articleData.id);
                if (index !== -1) {
                    this.data[index] = newOrUpdatedArticle;
                } else {
                    // If not found (shouldn't happen), add it
                    this.data.push(newOrUpdatedArticle);
                }
                
                // Prepare activity data
                activityData = {
                    icon: 'fa-scroll',
                    title: 'Article Updated',
                    description: `Updated article: ${articleData.title}`,
                    timestamp: new Date().toISOString()
                };
                
                // Show success message
                AdminDashboard.UI.showToast('success', 'Article updated successfully!');
            } else {
                // Create new article
                newOrUpdatedArticle = await AdminDashboard.API.Articles.create(articleData);
                
                // Add to local cache
                this.data.push(newOrUpdatedArticle);
                
                // Prepare activity data
                activityData = {
                    icon: 'fa-scroll',
                    title: 'Article Created',
                    description: `Created new article: ${articleData.title}`,
                    timestamp: new Date().toISOString()
                };
                
                // Show success message
                AdminDashboard.UI.showToast('success', 'Article created successfully!');
            }
            
            // Close modal
            AdminDashboard.UI.closeModal('article-modal');
            
            // Update list
            this.renderArticleList();
            
            // Update dashboard stats
            this.updateArticlesCount();
            
            // Update tag filter options
            this.updateTagFilter();
            
            // Add to recent activity
            if (AdminDashboard.Activities && typeof AdminDashboard.Activities.addActivity === 'function') {
                await AdminDashboard.Activities.addActivity(activityData);
            }
            
            return newOrUpdatedArticle;
        } catch (error) {
            console.error('Error saving article:', error);
            AdminDashboard.UI.showToast('error', 'Error saving article: ' + (error.message || 'Unknown error'));
            return null;
        } finally {
            // Re-enable save button
            if (saveArticleBtn) {
                saveArticleBtn.disabled = false;
                saveArticleBtn.innerHTML = '<i class="fas fa-save"></i> Save Article';
            }
        }
    },
    
    /**
     * Get article data from form
     * @returns {Object} - Article data
     */
    getArticleFormData() {
        const {
            articleId, articleTitle, articleSubtitle, articleExcerpt,
            articleImage, articleDate, articleFeatured, articleStatus,
            articleAuthor, articleContent, articleReadTime, articleRelatedVideo,
            seoTitle, seoDescription, seoKeywords
        } = this.elements;
        
        // Get tags from tag display
        const tags = Array.from(document.querySelectorAll('.tag-item'))
            .map(tag => tag.textContent.replace('×', '').trim());
        
        // Extract video ID from URL if provided
        const videoId = articleRelatedVideo && articleRelatedVideo.value ? 
            this.extractVideoId(articleRelatedVideo.value.trim()) : null;
        
        const articleData = {
            title: articleTitle?.value.trim() || '',
            subtitle: articleSubtitle?.value.trim() || null,
            excerpt: articleExcerpt?.value.trim() || null,
            image: articleImage?.value.trim() || null,
            date: articleDate?.value || new Date().toISOString().split('T')[0],
            featured: articleFeatured?.checked || false,
            status: articleStatus?.value || 'draft',
            tags: tags,
            content: articleContent?.value.trim() || '',
            author: articleAuthor?.value.trim() || 'Roll With Advantage',
            readTime: parseInt(articleReadTime?.value) || null,
            relatedVideo: articleRelatedVideo?.value.trim() || null,
            videoId: videoId,
            seo: {
                metaTitle: seoTitle?.value.trim() || null,
                metaDescription: seoDescription?.value.trim() || null,
                keywords: seoKeywords?.value.trim() || null
            }
        };
        
        // Add ID if editing
        if (articleId && articleId.value) {
            articleData.id = articleId.value;
        }
        
        return articleData;
    },
    
    /**
     * Delete an article
     * @param {string} id - Article ID
     * @returns {Promise<boolean>} - True if deletion was successful
     */
    async deleteArticle(id) {
        if (!id) {
            console.warn('Cannot delete article: No ID provided');
            return false;
        }
        
        try {
            // Find article name before removing
            const deletedArticle = this.data.find(article => article.id === id);
            if (!deletedArticle) {
                console.warn(`Article with ID ${id} not found in local data`);
            }
            
            const articleTitle = deletedArticle ? deletedArticle.title : 'Unknown article';
            
            // Delete from API
            await AdminDashboard.API.Articles.delete(id);
            
            // Remove from local cache
            this.data = this.data.filter(article => article.id !== id);
            
            // Update list
            this.renderArticleList();
            
            // Update dashboard stats
            this.updateArticlesCount();
            
            // Update tag filter options
            this.updateTagFilter();
            
            // Show success message
            AdminDashboard.UI.showToast('success', 'Article deleted successfully!');
            
            // Add to recent activity
            if (AdminDashboard.Activities && typeof AdminDashboard.Activities.addActivity === 'function') {
                await AdminDashboard.Activities.addActivity({
                    icon: 'fa-trash-alt',
                    title: 'Article Deleted',
                    description: `Deleted article: ${articleTitle}`,
                    timestamp: new Date().toISOString()
                });
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting article:', error);
            AdminDashboard.UI.showToast('error', 'Error deleting article: ' + (error.message || 'Unknown error'));
            return false;
        }
    },
    
    /**
     * Apply filters to article list
     */
    applyFilters() {
        const { articleSearch, tagFilter, statusFilter } = this.elements;
        
        const searchTerm = articleSearch?.value.trim().toLowerCase() || '';
        const tag = tagFilter?.value || '';
        const status = statusFilter?.value || '';
        
        this.renderArticleList(searchTerm, tag, status);
    },
    
    /**
     * Render article list with optional filters
     * @param {string} searchTerm - Search term to filter by
     * @param {string} tagFilter - Tag to filter by
     * @param {string} statusFilter - Status to filter by
     */
    renderArticleList(searchTerm = '', tagFilter = '', statusFilter = '') {
        const { articlesList } = this.elements;
        
        if (!articlesList) {
            console.warn('Cannot render article list: articlesList element not found');
            return;
        }
        
        // Only proceed if we have data
        if (!this.isLoaded) {
            articlesList.innerHTML = `
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading articles...</p>
                </div>
            `;
            this.loadArticles();
            return;
        }
        
        // Filter articles if needed
        let filteredArticles = [...this.data];
        
        // Apply filters
        if (searchTerm) {
            filteredArticles = filteredArticles.filter(article => 
                (article.title?.toLowerCase().includes(searchTerm) || false) || 
                (article.excerpt?.toLowerCase().includes(searchTerm) || false) ||
                (article.content?.toLowerCase().includes(searchTerm) || false) ||
                (article.tags && Array.isArray(article.tags) && article.tags.some(tag => 
                    tag?.toLowerCase().includes(searchTerm) || false
                ))
            );
        }
        
        if (tagFilter) {
            filteredArticles = filteredArticles.filter(article => 
                article.tags && Array.isArray(article.tags) && article.tags.some(tag => 
                    tag?.toLowerCase() === tagFilter.toLowerCase()
                )
            );
        }
        
        if (statusFilter) {
            filteredArticles = filteredArticles.filter(article => 
                article.status === statusFilter
            );
        }
        
        // No articles found
        if (filteredArticles.length === 0) {
            articlesList.innerHTML = `
                <div class="empty-message">
                    <p>No articles found. ${searchTerm || tagFilter || statusFilter ? 'Try adjusting your filters.' : 'Create your first article!'}</p>
                    ${!searchTerm && !tagFilter && !statusFilter ? `
                        <button class="btn btn-primary create-new-btn">
                            <i class="fas fa-plus"></i> Create New Article
                        </button>
                    ` : ''}
                </div>
            `;
            
            // Add event listener to the create button if present
            const createNewBtn = articlesList.querySelector('.create-new-btn');
            if (createNewBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    createNewBtn,
                    'click',
                    () => this.showCreateForm()
                );
            }
            
            return;
        }
        
        // Clear list
        articlesList.innerHTML = '';
        
        // Sort by date (newest first)
        filteredArticles.sort((a, b) => {
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            return dateB - dateA;
        });
        
        // Add each article
        filteredArticles.forEach(article => {
            const articleElement = this.createArticleListItem(article);
            if (articleElement) {
                articlesList.appendChild(articleElement);
            }
        });
    },
    
    /**
     * Create article list item element
     * @param {Object} article - Article data
     * @returns {Element} - Article list item DOM element
     */
    createArticleListItem(article) {
        if (!article || !article.id) {
            console.warn('Cannot create article list item: Invalid article data');
            return null;
        }
        
        const articleItem = document.createElement('div');
        articleItem.className = 'article-item';
        articleItem.setAttribute('data-id', article.id);
        
        // Format status badge
        let statusClass = 'status-draft';
        if (article.status === 'published') {
            statusClass = 'status-published';
        } else if (article.status === 'archived') {
            statusClass = 'status-archived';
        }
        
        // Format tags HTML if available
        let tagsHtml = '';
        if (article.tags && Array.isArray(article.tags) && article.tags.length > 0) {
            tagsHtml = article.tags
                .map(tag => `<span class="article-tag">${tag || ''}</span>`)
                .join('');
        } else {
            tagsHtml = '<span class="no-tags">No tags</span>';
        }
        
        // Format date
        const formattedDate = this.formatDate(article.date);
        
        // Create article item
        articleItem.innerHTML = `
            <div class="article-item-header">
                <h3 class="article-item-title">
                    ${article.title || 'Untitled Article'}
                    ${article.featured ? '<span class="article-featured" title="Featured Article"><i class="fas fa-star"></i></span>' : ''}
                </h3>
                <div class="article-item-status ${statusClass}">
                    ${article.status ? article.status.charAt(0).toUpperCase() + article.status.slice(1) : 'Draft'}
                </div>
            </div>
            <div class="article-item-content">
                <div class="article-item-info">
                    <div class="article-item-meta">
                        <span class="article-item-date"><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
                        ${article.author ? `<span class="article-item-author"><i class="far fa-user"></i> ${article.author}</span>` : ''}
                        ${article.readTime ? `<span class="article-item-read-time"><i class="far fa-clock"></i> ${article.readTime} min read</span>` : ''}
                    </div>
                    <div class="article-item-excerpt">${article.excerpt || this.truncateText(article.content, 150)}</div>
                    <div class="article-item-tags">${tagsHtml}</div>
                </div>
                ${article.image ? `
                <div class="article-item-image">
                    <img src="${article.image}" alt="${article.title}" loading="lazy" onerror="this.src='/assets/images/article-placeholder.jpg'">
                </div>
                ` : ''}
            </div>
            <div class="article-item-actions">
                <a href="/article/${article.id}" target="_blank" class="action-btn view" title="View Article">
                    <i class="fas fa-eye"></i>
                </a>
                <button class="action-btn edit" title="Edit Article">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" title="Delete Article">
                    <i class="fas fa-trash-alt"></i>
                </button>
                ${article.videoId ? `
                <a href="https://www.youtube.com/watch?v=${article.videoId}" target="_blank" class="action-btn video" title="Watch Related Video">
                    <i class="fab fa-youtube"></i>
                </a>
                ` : ''}
            </div>
        `;
        
        // Add event listeners
        const editBtn = articleItem.querySelector('.edit');
        if (editBtn) {
            AdminDashboard.UI.addEventListenerWithCleanup(
                editBtn,
                'click',
                () => this.showEditForm(article)
            );
        }
        
        const deleteBtn = articleItem.querySelector('.delete');
        if (deleteBtn) {
            AdminDashboard.UI.addEventListenerWithCleanup(
                deleteBtn,
                'click',
                () => {
                    AdminDashboard.UI.showConfirmation({
                        title: 'Delete Article',
                        message: `Are you sure you want to delete "${article.title}"? This action cannot be undone.`,
                        confirmText: 'Delete',
                        confirmClass: 'btn-danger',
                        onConfirm: () => this.deleteArticle(article.id),
                        onCancel: () => console.log(`Deletion of article "${article.title}" cancelled`)
                    });
                }
            );
        }
        
        return articleItem;
    },
    
    /**
     * Validate article form
     * @returns {boolean} - True if form is valid
     */
    validateArticleForm() {
        const { articleForm } = this.elements;
        
        if (!articleForm) {
            console.warn('Cannot validate article form: articleForm element not found');
            return false;
        }
        
        const requiredFields = articleForm.querySelectorAll('[required]');
        let valid = true;
        
        // Reset all error states
        articleForm.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });
        
        // Check required fields
        requiredFields.forEach(field => {
            if ((field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') && !field.value.trim()) {
                field.classList.add('error');
                
                // Add error message if not already present
                if (!field.nextElementSibling?.classList.contains('field-error-msg')) {
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'field-error-msg';
                    errorMsg.textContent = 'This field is required';
                    field.insertAdjacentElement('afterend', errorMsg);
                }
                
                valid = false;
            } else {
                // Remove any existing error message
                const errorMsg = field.nextElementSibling;
                if (errorMsg?.classList.contains('field-error-msg')) {
                    errorMsg.remove();
                }
            }
        });
        
        // Validate URL fields
        const urlFields = [
            this.elements.articleImage,
            this.elements.articleRelatedVideo
        ];
        
        urlFields.forEach(field => {
            if (field && field.value.trim()) {
                // Basic URL validation
                const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+\/?)([^\s]*)?$/;
                if (!urlPattern.test(field.value.trim())) {
                    field.classList.add('error');
                    
                    // Add error message if not already present
                    if (!field.nextElementSibling?.classList.contains('field-error-msg')) {
                        const errorMsg = document.createElement('div');
                        errorMsg.className = 'field-error-msg';
                        errorMsg.textContent = 'Please enter a valid URL';
                        field.insertAdjacentElement('afterend', errorMsg);
                    }
                    
                    valid = false;
                }
            }
        });
        
        // Validate read time as a number
        const readTimeField = this.elements.articleReadTime;
        if (readTimeField && readTimeField.value.trim()) {
            const readTimeValue = parseInt(readTimeField.value);
            if (isNaN(readTimeValue) || readTimeValue < 1) {
                readTimeField.classList.add('error');
                
                // Add error message if not already present
                if (!readTimeField.nextElementSibling?.classList.contains('field-error-msg')) {
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'field-error-msg';
                    errorMsg.textContent = 'Read time must be a positive number';
                    readTimeField.insertAdjacentElement('afterend', errorMsg);
                }
                
                valid = false;
            }
        }
        
        if (!valid) {
            // Focus the first invalid field
            const firstInvalidField = articleForm.querySelector('.error');
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
        }
        
        return valid;
    },
    
    /**
     * Reset article form
     */
    resetArticleForm() {
        const { articleForm } = this.elements;
        
        if (!articleForm) {
            console.warn('Cannot reset article form: articleForm element not found');
            return;
        }
        
        // Clear the form
        articleForm.reset();
        
        // Reset hidden ID field
        if (this.elements.articleId) {
            this.elements.articleId.value = '';
        }
        
        // Reset tags
        const tagDisplay = this.elements.tagDisplay;
        if (tagDisplay) {
            tagDisplay.innerHTML = '';
        }
        
        // Reset content preview
        if (this.elements.contentPreview) {
            this.elements.contentPreview.innerHTML = '';
            this.elements.contentPreview.style.display = 'none';
        }
        
        if (this.elements.contentEditor) {
            this.elements.contentEditor.style.display = '';
        }
        
        if (this.elements.previewToggle) {
            this.elements.previewToggle.innerHTML = '<i class="fas fa-eye"></i> Preview';
        }
        
        // Set default date to today
        if (this.elements.articleDate) {
            const today = new Date().toISOString().split('T')[0];
            this.elements.articleDate.value = today;
        }
        
        // Reset any validation errors
        articleForm.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });
        
        // Remove any error messages
        articleForm.querySelectorAll('.field-error-msg').forEach(msg => {
            msg.remove();
        });
    },
    
    /**
     * Populate article form for editing
     * @param {Object} article - Article data
     */
    populateArticleForm(article) {
        if (!article) {
            console.warn('Cannot populate form: No article data provided');
            return;
        }
        
        // Reset form first to clear any previous data
        this.resetArticleForm();
        
        // Set form fields
        const fields = {
            'article-id': article.id,
            'article-title': article.title || '',
            'article-subtitle': article.subtitle || '',
            'article-excerpt': article.excerpt || '',
            'article-image': article.image || '',
            'article-date': article.date || new Date().toISOString().split('T')[0],
            'article-featured': article.featured || false,
            'article-status': article.status || 'draft',
            'article-author': article.author || '',
            'article-read-time': article.readTime || '',
            'article-related-video': article.relatedVideo || '',
            'article-content': article.content || '',
            'seo-title': article.seo?.metaTitle || '',
            'seo-description': article.seo?.metaDescription || '',
            'seo-keywords': article.seo?.keywords || ''
        };
        
        // Update each field if it exists
        Object.entries(fields).forEach(([id, value]) => {
            const field = document.getElementById(id);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = value;
                } else {
                    field.value = value;
                }
            } else {
                console.warn(`Field not found for population: ${id}`);
            }
        });
        
        // Set tags
        if (article.tags && Array.isArray(article.tags)) {
            const tagDisplay = this.elements.tagDisplay;
            if (tagDisplay) {
                tagDisplay.innerHTML = '';
                article.tags.forEach(tag => {
                    if (tag && typeof tag === 'string') {
                        this.addTag(tag, false); // Don't check duplicates for initial population
                    }
                });
            }
        }
    },
    
    /**
     * Add a tag to the form
     * @param {string} tag - Tag text
     * @param {boolean} checkDuplicate - Whether to check for duplicates
     */
    addTag(tag, checkDuplicate = true) {
        if (!tag) {
            return;
        }
        
        const tagDisplay = this.elements.tagDisplay;
        if (!tagDisplay) {
            console.warn('Cannot add tag: tagDisplay element not found');
            return;
        }
        
        // Normalize tag
        tag = tag.trim();
        if (!tag) {
            return;
        }
        
        // Check for duplicate
        if (checkDuplicate) {
            const existingTags = Array.from(tagDisplay.querySelectorAll('.tag-item'))
                .map(el => el.textContent.replace('×', '').trim());
            
            if (existingTags.includes(tag)) {
                // Show error that tag already exists
                AdminDashboard.UI.showToast('error', `Tag "${tag}" already exists`);
                return;
            }
        }
        
        // Create tag element
        const tagEl = document.createElement('span');
        tagEl.className = 'tag-item';
        tagEl.textContent = tag;
        
        // Add remove button
        const removeBtn = document.createElement('span');
        removeBtn.className = 'tag-remove';
        removeBtn.innerHTML = '&times;';
        
        AdminDashboard.UI.addEventListenerWithCleanup(
            removeBtn,
            'click',
            () => {
                tagEl.remove();
            }
        );
        
        tagEl.appendChild(removeBtn);
        tagDisplay.appendChild(tagEl);
    },
    
    /**
     * Format date to readable string
     * @param {string} dateString - ISO date string
     * @returns {string} - Formatted date
     */
    formatDate(dateString) {
        if (!dateString) return 'No date';
        
        try {
            const date = new Date(dateString);
            
            // Check if date is invalid
            if (isNaN(date.getTime())) return dateString;
            
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString || 'Unknown date';
        }
    },
    
    /**
     * Truncate text to specified length with ellipsis
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} - Truncated text
     */
    truncateText(text, maxLength) {
        if (!text) return '';
        
        // Remove HTML tags
        const plainText = text.replace(/(<([^>]+)>)/gi, '');
        
        if (plainText.length <= maxLength) return plainText;
        
        // Find the last space before maxLength
        const lastSpace = plainText.lastIndexOf(' ', maxLength);
        
        // If no space found, just cut at maxLength
        const truncated = lastSpace > 0 ? plainText.substring(0, lastSpace) : plainText.substring(0, maxLength);
        
        return truncated + '...';
    },
    
    /**
     * Extract YouTube video ID from URL
     * @param {string} url - YouTube URL
     * @returns {string|null} - Video ID or null if not found
     */
    extractVideoId(url) {
        if (!url) return null;
        
        try {
            // Extract video ID from different YouTube URL formats
            const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
            const match = url.match(regExp);
            
            return (match && match[7] && match[7].length === 11) ? match[7] : null;
        } catch (error) {
            console.error('Error extracting video ID:', error);
            return null;
        }
    }
},

/**
 * Activities Module - Activity tracking and display
 */
AdminDashboard.Activities = {
    // DOM elements used by this module
    elements: {},
    
    /**
     * Initialize the Activities module
     * @returns {Object} - The Activities module for chaining
     */
    init() {
        try {
            this.cacheElements();
            this.loadRecentActivities();
            return this;
        } catch (error) {
            console.error('Error initializing Activities module:', error);
            return this;
        }
    },
    
    /**
     * Cache DOM elements used by this module
     * @returns {Object} - Object containing cached elements
     */
    cacheElements() {
        try {
            this.elements = {
                activityList: document.getElementById('recent-activity-list')
            };
            
            return this.elements;
        } catch (error) {
            console.error('Error caching Activities DOM elements:', error);
            return {};
        }
    },
    
    /**
     * Load recent activities
     */
    async loadRecentActivities() {
        const { activityList } = this.elements;
        
        if (!activityList) {
            console.warn('Cannot load activities: activityList element not found');
            return;
        }
        
        try {
            // Show loading state
            activityList.innerHTML = `
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading recent activity...</p>
                </div>
            `;
            
            // Fetch activities from API
            const activities = await AdminDashboard.API.Activities.getRecent();
            
            // Clear list
            activityList.innerHTML = '';
            
            // Show message if no activities
            if (!activities || activities.length === 0) {
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
                if (activityItem) {
                    activityList.appendChild(activityItem);
                }
            });
        } catch (error) {
            console.error('Error loading activities:', error);
            
            activityList.innerHTML = `
                <div class="error-message">
                    <p>Failed to load recent activities</p>
                    <button class="btn btn-secondary retry-btn">
                        <i class="fas fa-sync"></i> Retry
                    </button>
                </div>
            `;
            
            // Add event listener to retry button
            const retryBtn = activityList.querySelector('.retry-btn');
            if (retryBtn) {
                AdminDashboard.UI.addEventListenerWithCleanup(
                    retryBtn,
                    'click',
                    () => this.loadRecentActivities()
                );
            }
        }
    },
    
    /**
     * Add a new activity
     * @param {Object} activity - Activity data
     * @returns {Promise<Object|null>} - Created activity or null if failed
     */
    async addActivity(activity) {
        if (!activity || !activity.title || !activity.description) {
            console.warn('Cannot add activity: Invalid activity data');
            return null;
        }
        
        try {
            // Ensure timestamp is set
            if (!activity.timestamp) {
                activity.timestamp = new Date().toISOString();
            }
            
            // Save activity to API
            const savedActivity = await AdminDashboard.API.Activities.add(activity);
            
            // Update activity list if visible
            this.updateActivityList(savedActivity);
            
            return savedActivity;
        } catch (error) {
            console.error('Error saving activity:', error);
            return null;
        }
    },
    
    /**
     * Update activity list with new activity
     * @param {Object} activity - Activity to add to the list
     */
    updateActivityList(activity) {
        const { activityList } = this.elements;
        if (!activityList || !activity) {
            return;
        }
        
        // Remove "no activities" message if present
        const emptyState = activityList.querySelector('.activity-empty');
        if (emptyState) {
            emptyState.remove();
        }
        
        // Create new activity item
        const activityItem = this.createActivityItem(activity);
        if (!activityItem) {
            return;
        }
        
        // Add to beginning of list
        if (activityList.firstChild) {
            activityList.insertBefore(activityItem, activityList.firstChild);
        } else {
            activityList.appendChild(activityItem);
        }
        
        // Limit to maximum 20 items for performance
        const maxActivities = 20;
        const activities = activityList.querySelectorAll('.activity-item');
        if (activities.length > maxActivities) {
            for (let i = maxActivities; i < activities.length; i++) {
                activities[i].remove();
            }
        }
    },
    
    /**
     * Create activity list item
     * @param {Object} activity - Activity data
     * @returns {Element|null} - Activity item DOM element or null if invalid
     */
    createActivityItem(activity) {
        if (!activity || (!activity.title && !activity.type)) {
            return null;
        }
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        // Handle both activity formats (new and old)
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
            // Old format (for backward compatibility)
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
     * @param {string} timestamp - ISO timestamp
     * @returns {string} - Formatted time string
     */
    formatTimestamp(timestamp) {
        if (!timestamp) {
            return 'Unknown time';
        }
        
        try {
            const date = new Date(timestamp);
            
            // Check if date is invalid
            if (isNaN(date.getTime())) {
                return timestamp;
            }
            
            // If today, show only time
            const now = new Date();
            const isToday = date.getDate() === now.getDate() && 
                          date.getMonth() === now.getMonth() &&
                          date.getFullYear() === now.getFullYear();
                          
            if (isToday) {
                return date.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            
            // If this year, show date without year
            const isThisYear = date.getFullYear() === now.getFullYear();
            if (isThisYear) {
                return date.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                }) + ' ' + date.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            
            // Otherwise show full date
            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }) + ' ' + date.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting timestamp:', error);
            return timestamp || 'Unknown time';
        }
    }
},

/**
 * Settings Module - User settings management
 */
AdminDashboard.Settings = {
    // DOM elements used by this module
    elements: {},
    
    /**
     * Initialize the Settings module
     * @returns {Object} - The Settings module for chaining
     */
    init() {
        try {
            this.cacheElements();
            this.bindEvents();
            return this;
        } catch (error) {
            console.error('Error initializing Settings module:', error);
            return this;
        }
    },
    
    /**
     * Cache DOM elements used by this module
     * @returns {Object} - Object containing cached elements
     */
    cacheElements() {
        try {
            this.elements = {
                // Password change elements
                changePasswordBtn: document.getElementById('change-password-btn'),
                currentPassword: document.getElementById('current-password'),
                newPassword: document.getElementById('new-password'),
                confirmPassword: document.getElementById('confirm-password'),
                passwordSuccess: document.getElementById('password-success'),
                passwordError: document.getElementById('password-error'),
                
                // Other settings elements can be added here
                settingsSection: document.getElementById('settings-section')
            };
            
            return this.elements;
        } catch (error) {
            console.error('Error caching Settings DOM elements:', error);
            return {};
        }
    },
    
    /**
     * Bind event listeners to DOM elements
     */
    bindEvents() {
        const { changePasswordBtn, settingsSection } = this.elements;
        
        // Only bind events if we're on the settings section
        if (!settingsSection) {
            return;
        }
        
        if (changePasswordBtn) {
            AdminDashboard.UI.addEventListenerWithCleanup(
                changePasswordBtn,
                'click',
                (e) => {
                    e.preventDefault();
                    this.changePassword();
                }
            );
        }
    },
    
    /**
     * Change user password
     */
    async changePassword() {
        const { 
            currentPassword, newPassword, confirmPassword,
            passwordSuccess, passwordError, changePasswordBtn
        } = this.elements;
        
        // Clear any previous messages
        if (passwordSuccess) {
            passwordSuccess.style.display = 'none';
        }
        
        if (passwordError) {
            passwordError.style.display = 'none';
        }
        
        // Input validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showPasswordError('Required password fields are missing from the form');
            return;
        }
        
        const currentPasswordValue = currentPassword.value;
        const newPasswordValue = newPassword.value;
        const confirmPasswordValue = confirmPassword.value;
        
        if (!currentPasswordValue) {
            this.showPasswordError('Please enter your current password');
            currentPassword.focus();
            return;
        }
        
        if (!newPasswordValue) {
            this.showPasswordError('Please enter a new password');
            newPassword.focus();
            return;
        }
        
        if (newPasswordValue.length < 8) {
            this.showPasswordError('New password must be at least 8 characters long');
            newPassword.focus();
            return;
        }
        
        if (newPasswordValue !== confirmPasswordValue) {
            this.showPasswordError('New passwords do not match');
            confirmPassword.focus();
            return;
        }
        
        // Show loading state
        if (changePasswordBtn) {
            changePasswordBtn.disabled = true;
            changePasswordBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        }
        
        try {
            // Call API to change password
            const result = await AdminDashboard.API.Settings.changePassword(
                currentPasswordValue, 
                newPasswordValue
            );
            
            if (result && result.success) {
                // Show success message
                if (passwordSuccess) {
                    passwordSuccess.textContent = 'Password successfully changed';
                    passwordSuccess.style.display = 'block';
                }
                
                // Clear password fields
                currentPassword.value = '';
                newPassword.value = '';
                confirmPassword.value = '';
                
                // Add to recent activity
                if (AdminDashboard.Activities && typeof AdminDashboard.Activities.addActivity === 'function') {
                    await AdminDashboard.Activities.addActivity({
                        icon: 'fa-key',
                        title: 'Password Changed',
                        description: 'Password was successfully updated',
                        timestamp: new Date().toISOString()
                    });
                }
                
                AdminDashboard.UI.showToast('success', 'Password changed successfully!');
            } else {
                // Show error message
                this.showPasswordError(result?.error || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            this.showPasswordError('Server error. Please try again.');
        } finally {
            // Reset button
            if (changePasswordBtn) {
                changePasswordBtn.disabled = false;
                changePasswordBtn.innerHTML = '<i class="fas fa-save"></i> Update Password';
            }
        }
    },
    
    /**
     * Show password error message
     * @param {string} message - Error message to display
     */
    showPasswordError(message) {
        const { passwordError } = this.elements;
        
        // Show in error element if exists
        if (passwordError) {
            passwordError.textContent = message;
            passwordError.style.display = 'block';
            
            // Scroll to error
            passwordError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Also show toast for better visibility
        AdminDashboard.UI.showToast('error', message);
    }
};

/**
 * Update dashboard statistics
 */
AdminDashboard.updateDashboardStats = function() {
    try {
        // Update NPC count
        const npcsCount = document.getElementById('npcs-count');
        if (npcsCount) {
            if (this.NPCs.data && this.NPCs.data.length > 0) {
                npcsCount.textContent = this.NPCs.data.length;
            } else {
                // Fetch from API if not cached
                this.API.NPCs.getAll()
                    .then(npcs => {
                        npcsCount.textContent = npcs.length;
                    })
                    .catch(error => {
                        console.error('Error fetching NPC count:', error);
                        npcsCount.textContent = '?';
                    });
            }
        }
        
        // Update timeline count
        const timelineCount = document.getElementById('timeline-count');
        if (timelineCount) {
            if (this.Timeline.data && this.Timeline.data.length > 0) {
                timelineCount.textContent = this.Timeline.data.length;
            } else {
                // Fetch from API if not cached
                this.API.Timeline.getAll()
                    .then(timeline => {
                        timelineCount.textContent = timeline.length;
                    })
                    .catch(error => {
                        console.error('Error fetching timeline count:', error);
                        timelineCount.textContent = '?';
                    });
            }
        }
        
        // Update story count
        const storyCount = document.getElementById('story-count');
        if (storyCount) {
            if (this.StoryEpisodes.data && this.StoryEpisodes.data.length > 0) {
                storyCount.textContent = this.StoryEpisodes.data.length;
            } else {
                // Fetch from API if not cached
                this.API.StoryEpisodes.getAll()
                    .then(episodes => {
                        storyCount.textContent = episodes.length;
                    })
                    .catch(error => {
                        console.error('Error fetching story count:', error);
                        storyCount.textContent = '?';
                    });
            }
        }
        
        // Update articles count
        const articlesCount = document.getElementById('articles-count');
        if (articlesCount) {
            if (this.Articles.data && this.Articles.data.length > 0) {
                articlesCount.textContent = this.Articles.data.length;
            } else {
                // Fetch from API if not cached
                this.API.Articles.getAll()
                    .then(articles => {
                        articlesCount.textContent = articles.length;
                    })
                    .catch(error => {
                        console.error('Error fetching articles count:', error);
                        articlesCount.textContent = '?';
                    });
            }
        }
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
    }
},

/**
 * Clean up resources and prepare for page unload
 */
AdminDashboard.cleanup = function() {
    // Remove all event listeners
    if (this.UI && typeof this.UI.removeAllEventListeners === 'function') {
        this.UI.removeAllEventListeners();
    }
    
    // Clear any pending timeouts
    if (this._sessionRefreshInterval) {
        clearInterval(this._sessionRefreshInterval);
    }
    
    
};

/**
 * Main initialization function
 */
AdminDashboard.init = function() {
    try {
        // Show initialization message
        
        
        // Initialize UI module first
        this.UI.init();
        
        // Set up session refresh interval
        this._sessionRefreshInterval = this.initSessionRefresh();
        
        // Initialize all feature modules
        const modules = [
            { name: 'NPCs', module: this.NPCs },
            { name: 'Timeline', module: this.Timeline },
            { name: 'StoryEpisodes', module: this.StoryEpisodes },
            { name: 'Articles', module: this.Articles },
            { name: 'Activities', module: this.Activities },
            { name: 'Settings', module: this.Settings }
        ];
        
        modules.forEach(({ name, module }) => {
            try {
                if (module && typeof module.init === 'function') {
                    module.init();
                }
            } catch (moduleError) {
                console.error(`Error initializing ${name} module:`, moduleError);
                AdminDashboard.UI.showToast('error', `Failed to initialize ${name} module`);
            }
        });
        
        // Update dashboard stats
        this.updateDashboardStats();
        
        // Listen for hash changes to handle deep linking
        window.addEventListener('hashchange', () => this.UI.handleHashChange());
        
        // Handle initial hash if present
        if (window.location.hash) {
            this.UI.handleHashChange();
        }
        
        // Set up cleanup on page unload
        window.addEventListener('beforeunload', () => this.cleanup());
        
        
    } catch (error) {
        console.error('Fatal error during Admin Dashboard initialization:', error);
        
        // Show error message to user
        const errorMessage = `
            <div class="admin-error-message">
                <h3>Dashboard Initialization Error</h3>
                <p>There was a problem loading the dashboard. Please refresh the page or contact support.</p>
                <p class="error-details">${error.message || 'Unknown error'}</p>
                <button onclick="location.reload()" class="btn btn-primary">Refresh Page</button>
            </div>
        `;
        
        const container = document.querySelector('main') || document.body;
        if (container) {
            container.insertAdjacentHTML('afterbegin', errorMessage);
        }
    }
};

/**
 * Initialize session refresh to keep user logged in
 * @returns {number} - Interval ID for cleanup
 */
AdminDashboard.initSessionRefresh = function() {
    const refreshInterval = this.config.sessionRefreshInterval;
    
    const intervalId = setInterval(async () => {
        try {
            const refreshSuccess = await this.API.refreshToken();
            if (!refreshSuccess) {
                
                clearInterval(intervalId);
                this.API.redirectToLogin();
            }
        } catch (error) {
            console.error('Session refresh error:', error);
        }
    }, refreshInterval);
    
    return intervalId;
}