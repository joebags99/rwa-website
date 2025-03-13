/**
 * Roll With Advantage - Admin Dashboard JavaScript
 * 
 * This file handles all interactive functionality for the admin dashboard:
 * - Navigation and sections
 * - CRUD operations for NPCs
 * - Modal interactions
 * - Authentication
 * - Form validation and submission
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin dashboard
    initAdminDashboard();
});

/**
 * Initialize all dashboard functionality
 */
function initAdminDashboard() {
    // Initialize sidebar navigation
    initSidebar();
    
    // Initialize modals
    initModals();

    // Initialize recent activities
    loadRecentActivities();
    
    // Initialize NPC management
    initNPCManagement();
    
    // Initialize settings
    initSettings();
    
    // Load initial data
    loadDashboardData();
}

/**
 * Initialize sidebar navigation
 */
function initSidebar() {
    const menuItems = document.querySelectorAll('.sidebar-menu li:not(.disabled)');
    const sections = document.querySelectorAll('.content-section');
    const sectionTitle = document.getElementById('current-section-title');
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    // Handle menu item clicks
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sectionId = this.getAttribute('data-section');
            
            // Update active menu item
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Show the selected section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${sectionId}-section`) {
                    section.classList.add('active');
                }
            });
            
            // Update section title
            if (sectionTitle) {
                sectionTitle.textContent = this.querySelector('a').textContent.trim();
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
    function handleHash() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            // Find the menu item with this section
            const menuItem = document.querySelector(`.sidebar-menu li[data-section="${hash}"]`);
            if (menuItem && !menuItem.classList.contains('disabled')) {
                menuItem.click();
            }
        }
    }
    
    // Check hash on page load
    handleHash();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHash);
    
    // Quick action buttons on dashboard
    const quickActions = document.querySelectorAll('.action-buttons a:not(.disabled)');
    quickActions.forEach(action => {
        action.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-target');
            if (targetSection) {
                const menuItem = document.querySelector(`.sidebar-menu li[data-section="${targetSection}"]`);
                if (menuItem) {
                    menuItem.click();
                    
                    // If this is the NPCs section and has a "Create" button
                    if (targetSection === 'npcs' && this.textContent.includes('Create')) {
                        // Click the create NPC button
                        const createNPCBtn = document.getElementById('create-npc-btn');
                        if (createNPCBtn) {
                            setTimeout(() => {
                                createNPCBtn.click();
                            }, 100);
                        }
                    }
                }
            }
        });
    });
    
    // Mobile menu toggle
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
        
        // Close sidebar when clicking outside
        document.addEventListener('click', function(e) {
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
}

/**
 * Initialize modals
 */
function initModals() {
    const modals = document.querySelectorAll('.modal');
    
    // Close buttons for all modals
    document.querySelectorAll('.close-btn, .modal .btn-secondary').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });
    
    // Close modal when clicking outside
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal);
            }
        }
    });
}

/**
 * Open a modal
 * @param {HTMLElement} modal - The modal element to open
 */
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Close a modal
 * @param {HTMLElement} modal - The modal element to close
 */
function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Show confirmation modal
 * @param {Object} options - Configuration options
 * @param {string} options.title - Modal title
 * @param {string} options.message - Confirmation message
 * @param {string} options.confirmText - Text for confirm button
 * @param {string} options.confirmClass - CSS class for confirm button
 * @param {Function} options.onConfirm - Callback function on confirmation
 */
function showConfirmation(options) {
    const modal = document.getElementById('confirm-modal');
    const title = document.getElementById('confirm-title');
    const message = document.getElementById('confirm-message');
    const confirmBtn = document.getElementById('confirm-ok');
    const cancelBtn = document.getElementById('confirm-cancel');
    
    // Set content
    title.textContent = options.title || 'Confirmation';
    message.textContent = options.message || 'Are you sure you want to perform this action?';
    confirmBtn.textContent = options.confirmText || 'Confirm';
    
    // Set button class
    confirmBtn.className = 'btn ' + (options.confirmClass || 'btn-danger');
    
    // Set confirm action
    const confirmHandler = function() {
        if (typeof options.onConfirm === 'function') {
            options.onConfirm();
        }
        closeModal(modal);
        confirmBtn.removeEventListener('click', confirmHandler);
    };
    
    // Remove any existing event listeners
    const oldConfirm = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(oldConfirm, confirmBtn);
    
    // Add new event listener
    oldConfirm.addEventListener('click', confirmHandler);
    
    // Open the modal
    openModal(modal);
}

/**
 * Initialize NPC management functionality
 */
function initNPCManagement() {
    // Get necessary elements
    const createNPCBtn = document.getElementById('create-npc-btn');
    const npcModal = document.getElementById('npc-modal');
    const npcForm = document.getElementById('npc-form');
    const saveNPCBtn = document.getElementById('save-npc');
    const cancelNPCBtn = document.getElementById('cancel-npc');
    const npcList = document.getElementById('npc-list');
    const npcSearch = document.getElementById('npc-search');
    const categoryFilter = document.getElementById('category-filter');
    const relationshipFilter = document.getElementById('relationship-filter');
    
    // Local cache of NPC data
    let npcs = [];
    
    // Create NPC button click
    if (createNPCBtn) {
        createNPCBtn.addEventListener('click', function() {
            // Reset form
            resetNPCForm();
            
            // Change modal title to Create
            document.getElementById('npc-modal-title').textContent = 'Create New NPC';
            
            // Open modal
            openModal(npcModal);
        });
    }
    
    // Cancel button click
    if (cancelNPCBtn) {
        cancelNPCBtn.addEventListener('click', function() {
            closeModal(npcModal);
        });
    }
    
    // Save NPC button click
    if (saveNPCBtn && npcForm) {
        saveNPCBtn.addEventListener('click', function() {
            // Basic validation
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
            
            if (!valid) {
                return; // Don't proceed if validation fails
            }
            
            // Gather form data
            const npcId = document.getElementById('npc-id').value;
            const npcData = {
                name: document.getElementById('npc-name').value.trim(),
                importance: parseInt(document.getElementById('npc-importance').value),
                appearance: document.getElementById('npc-appearance').value.trim(),
                relationship: document.getElementById('npc-relationship').value,
                category: document.getElementById('npc-category').value,
                description: document.getElementById('npc-description').value.trim(),
                quote: document.getElementById('npc-quote').value.trim(),
                tags: document.getElementById('npc-tags').value.trim().split(',').map(tag => tag.trim().toLowerCase()),
                imageSrc: document.getElementById('npc-image').value.trim() || 'assets/images/npcs/default.jpg'
            };
            
            // Save to API
            if (npcId) {
                // Update existing NPC
                updateNPC(npcId, npcData);
            } else {
                // Create new NPC
                createNPC(npcData);
            }
        });
    }
    
    // Fetch all NPCs
    async function fetchNPCs() {
        try {
            // Show loading state
            npcList.innerHTML = `
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading NPCs...</p>
                </div>
            `;
            
            const response = await fetch('/admin/api/npcs');
            
            if (!response.ok) {
                throw new Error('Failed to fetch NPCs');
            }
            
            npcs = await response.json();
            
            renderNPCList(npcs);
            updateDashboardStats();
            
            return npcs;
        } catch (error) {
            console.error('Error fetching NPCs:', error);
            
            npcList.innerHTML = `
                <div class="error-message">
                    <p>Error loading NPCs. Please try again.</p>
                    <button class="btn btn-primary" onclick="initNPCManagement()">Retry</button>
                </div>
            `;
        }
    }
    
    // Create new NPC
    async function createNPC(npcData) {
        try {
            // Disable save button
            saveNPCBtn.disabled = true;
            saveNPCBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            
            const response = await fetch('/admin/api/npcs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(npcData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to create NPC');
            }
            
            const newNPC = await response.json();
            
            // Add to local cache
            npcs.push(newNPC);
            
            // Close modal
            closeModal(npcModal);
            
            // Update list
            renderNPCList(npcs);
            updateDashboardStats();
            
            // Show success message
            showSuccessToast('NPC created successfully!');
            
            // Add to recent activity
            addRecentActivity({
                icon: 'fa-user-plus',
                title: 'NPC Created',
                description: `Created new NPC: ${npcData.name}`,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error creating NPC:', error);
            alert('Error creating NPC. Please try again.');
        } finally {
            // Re-enable save button
            saveNPCBtn.disabled = false;
            saveNPCBtn.innerHTML = '<i class="fas fa-save"></i> Save NPC';
        }
    }
    
    // Update existing NPC
    async function updateNPC(id, npcData) {
        try {
            saveNPCBtn.disabled = true;
            saveNPCBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
            
            let response = await fetch(`/admin/api/npcs/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Important for sending cookies
                body: JSON.stringify(npcData)
            });
            
            // If unauthorized, try to refresh token and retry the request
            if (response.status === 401) {
                await refreshAuthToken();
                
                // Retry the request with new token
                response = await fetch(`/admin/api/npcs/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify(npcData)
                });
            }
            
            if (!response.ok) {
                throw new Error('Failed to update NPC');
            }
            
            const updatedNPC = await response.json();
            
            // Update in local cache
            const index = npcs.findIndex(npc => npc.id === id);
            if (index !== -1) {
                npcs[index] = updatedNPC;
            }
            
            // Close modal
            closeModal(npcModal);
            
            // Update list
            renderNPCList(npcs);
            
            // Show success message
            showSuccessToast('NPC updated successfully!');
            
            // Add to recent activity
            addRecentActivity({
                icon: 'fa-user-edit',
                title: 'NPC Updated',
                description: `Updated NPC: ${npcData.name}`,
                timestamp: new Date().toISOString()
            });

            } catch (error) {
                console.error('Error updating NPC:', error);
                if (error.message === 'Failed to refresh token') {
                    window.location.href = '/admin/login';
                } else {
                    alert('Error updating NPC. Please try again.');
                }
            } finally {
                saveNPCBtn.disabled = false;
                saveNPCBtn.innerHTML = '<i class="fas fa-save"></i> Save NPC';
            }
        }
            
    // Delete NPC
    async function deleteNPC(id) {
        try {
            const response = await fetch(`/admin/api/npcs/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete NPC');
            }
            
            // Find NPC name before removing
            const deletedNPC = npcs.find(npc => npc.id === id);
            const npcName = deletedNPC ? deletedNPC.name : 'Unknown NPC';
            
            // Remove from local cache
            npcs = npcs.filter(npc => npc.id !== id);
            
            // Update list
            renderNPCList(npcs);
            updateDashboardStats();
            
            // Show success message
            showSuccessToast('NPC deleted successfully!');
            
            // Add to recent activity
            addRecentActivity({
                icon: 'fa-user-minus',
                title: 'NPC Deleted',
                description: `Deleted NPC: ${npcName}`,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error deleting NPC:', error);
            alert('Error deleting NPC. Please try again.');
        }
    }
    
    // Reset NPC form
    function resetNPCForm() {
        if (!npcForm) return;
        
        // Clear the form
        npcForm.reset();
        
        // Reset hidden ID field
        document.getElementById('npc-id').value = '';
        
        // Reset any validation errors
        npcForm.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });
    }
    
    // Populate NPC form for editing
    function populateNPCForm(npc) {
        if (!npcForm) return;
        
        // Set the form fields
        document.getElementById('npc-id').value = npc.id;
        document.getElementById('npc-name').value = npc.name;
        document.getElementById('npc-importance').value = npc.importance;
        document.getElementById('npc-appearance').value = npc.appearance;
        document.getElementById('npc-relationship').value = npc.relationship;
        document.getElementById('npc-category').value = npc.category;
        document.getElementById('npc-description').value = npc.description;
        document.getElementById('npc-quote').value = npc.quote;
        document.getElementById('npc-tags').value = Array.isArray(npc.tags) ? npc.tags.join(', ') : npc.tags;
        document.getElementById('npc-image').value = npc.imageSrc || '';
    }
    
    // Render NPC list
    function renderNPCList(npcData, searchTerm = '', categoryFilter = '', relationshipFilter = '') {
        if (!npcList) return;
        
        // Filter NPCs if needed
        let filteredNPCs = npcData;
        
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
                            <span>${npc.appearance}</span>
                        </span>
                        <span class="npc-meta-item">
                            ${relationshipDisplay}
                        </span>
                        <span class="npc-meta-item">
                            ${categoryDisplay}
                        </span>
                    </div>
                    <p class="npc-description">${npc.description}</p>
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
            npcItem.querySelector('.edit').addEventListener('click', function() {
                // Change modal title to Edit
                document.getElementById('npc-modal-title').textContent = 'Edit NPC';
                
                // Populate form
                populateNPCForm(npc);
                
                // Open modal
                openModal(npcModal);
            });
            
            npcItem.querySelector('.delete').addEventListener('click', function() {
                showConfirmation({
                    title: 'Delete NPC',
                    message: `Are you sure you want to delete "${npc.name}"? This action cannot be undone.`,
                    confirmText: 'Delete',
                    confirmClass: 'btn-danger',
                    onConfirm: () => deleteNPC(npc.id)
                });
            });
            
            npcList.appendChild(npcItem);
        });
    }
    
    // Initialize search and filters
    if (npcSearch) {
        npcSearch.addEventListener('input', function() {
            const searchTerm = this.value.trim();
            const category = categoryFilter ? categoryFilter.value : '';
            const relationship = relationshipFilter ? relationshipFilter.value : '';
            renderNPCList(npcs, searchTerm, category, relationship);
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            const searchTerm = npcSearch ? npcSearch.value.trim() : '';
            const category = this.value;
            const relationship = relationshipFilter ? relationshipFilter.value : '';
            renderNPCList(npcs, searchTerm, category, relationship);
        });
    }
    
    if (relationshipFilter) {
        relationshipFilter.addEventListener('change', function() {
            const searchTerm = npcSearch ? npcSearch.value.trim() : '';
            const category = categoryFilter ? categoryFilter.value : '';
            const relationship = this.value;
            renderNPCList(npcs, searchTerm, category, relationship);
        });
    }
    
    // Load NPCs on initialization
    fetchNPCs();
}

// Add this function to handle token refresh
async function refreshAuthToken() {
    try {
        const response = await fetch('/admin/api/refresh-token', {
            method: 'POST',
            credentials: 'include' // Important for sending cookies
        });
        
        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Token refresh failed:', error);
        // Redirect to login if token refresh fails
        window.location.href = '/admin/login';
        throw error;
    }
}

/**
 * Initialize settings functionality
 */
function initSettings() {
    const changePasswordBtn = document.getElementById('change-password-btn');
    
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', async function() {
            // Get password fields
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Clear any previous messages
            document.getElementById('password-success').style.display = 'none';
            document.getElementById('password-error').style.display = 'none';
            
            // Validate passwords
            if (!currentPassword) {
                showPasswordError('Please enter your current password');
                return;
            }
            
            if (!newPassword) {
                showPasswordError('Please enter a new password');
                return;
            }
            
            if (newPassword.length < 8) {
                showPasswordError('New password must be at least 8 characters long');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showPasswordError('New passwords do not match');
                return;
            }
            
            // Disable button
            changePasswordBtn.disabled = true;
            changePasswordBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
            
            try {
                const response = await fetch('/admin/api/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        currentPassword,
                        newPassword
                    })
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    // Show success message
                    document.getElementById('password-success').style.display = 'block';
                    
                    // Clear password fields
                    document.getElementById('current-password').value = '';
                    document.getElementById('new-password').value = '';
                    document.getElementById('confirm-password').value = '';
                    
                    // Add to recent activity
                    addRecentActivity({
                        type: 'security',
                        entity: 'password',
                        action: 'changed'
                    });
                } else {
                    showPasswordError(data.error || 'Failed to change password');
                }
            } catch (error) {
                console.error('Error changing password:', error);
                showPasswordError('Server error. Please try again.');
            } finally {
                // Re-enable button
                changePasswordBtn.disabled = false;
                changePasswordBtn.innerHTML = '<i class="fas fa-save"></i> Update Password';
            }
        });
    }
    
    function showPasswordError(message) {
        const errorElement = document.getElementById('password-error');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Scroll to error
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Load dashboard data and update UI
 */
async function loadDashboardData() {
    try {
        // Fetch NPCs for dashboard stats
        const response = await fetch('/admin/api/npcs');
        
        if (response.ok) {
            const npcs = await response.json();
            
            // Update NPC count
            const npcsCount = document.getElementById('npcs-count');
            if (npcsCount) {
                npcsCount.textContent = npcs.length;
            }
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

/**
 * Update dashboard statistics
 */
function updateDashboardStats() {
    // Update NPC count on dashboard
    const npcsCount = document.getElementById('npcs-count');
    if (npcsCount) {
        fetch('/admin/api/npcs')
            .then(response => response.json())
            .then(npcs => {
                npcsCount.textContent = npcs.length;
            })
            .catch(error => {
                console.error('Error fetching NPC count:', error);
            });
    }
}

// Move these functions together, after the initModals() function:

/**
 * Activity Management Functions
 */
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

function updateActivityList(activity) {
    const activityList = document.getElementById('recent-activity-list');
    
    // Remove "no activities" message if present
    const emptyState = activityList.querySelector('.activity-empty');
    if (emptyState) {
        emptyState.remove();
    }

    // Create new activity item
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
                <p class="activity-time">${formatTimestamp(activity.timestamp)}</p>
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
                <p class="activity-description">${activity.name}</p>
                <p class="activity-time">${formatTimestamp(activity.timestamp)}</p>
            </div>
        `;
    }

    // Add to beginning of list
    activityList.insertBefore(activityItem, activityList.firstChild);
}

// Update the loadRecentActivities function
async function loadRecentActivities() {
    try {
        const response = await fetch('/admin/api/recent-activity');
        if (!response.ok) {
            throw new Error('Failed to fetch activities');
        }

        const activities = await response.json();
        const activityList = document.getElementById('recent-activity-list');
        
        if (!activityList) return;

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

        // Add each activity to the list (they should already be sorted from the backend)
        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';

            // Handle both activity formats
            if (activity.icon && activity.title && activity.description) {
                activityItem.innerHTML = `
                    <div class="activity-icon">
                        <i class="fas ${activity.icon}"></i>
                    </div>
                    <div class="activity-details">
                        <h4 class="activity-title">${activity.title}</h4>
                        <p class="activity-description">${activity.description}</p>
                        <p class="activity-time">${formatTimestamp(activity.timestamp)}</p>
                    </div>
                `;
            } else {
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
                        <p class="activity-description">${activity.name}</p>
                        <p class="activity-time">${formatTimestamp(activity.timestamp)}</p>
                    </div>
                `;
            }

            // Insert at the beginning of the list
            activityList.insertBefore(activityItem, activityList.firstChild);
        });
    } catch (error) {
        console.error('Error loading activities:', error);
    }
}

async function addRecentActivity(activity) {
    try {
        const response = await fetch('/admin/api/recent-activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(activity)
        });

        if (!response.ok) {
            throw new Error('Failed to save activity');
        }

        const savedActivity = await response.json();
        updateActivityList(savedActivity);
    } catch (error) {
        console.error('Error saving activity:', error);
    }
}

/**
 * Show a success toast notification
 * @param {string} message - Message to display
 */
function showSuccessToast(message) {
    // Create toast element if it doesn't exist
    let toast = document.getElementById('success-toast');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'success-toast';
        toast.className = 'toast toast-success';
        document.body.appendChild(toast);
        
        // Add styles if not already in CSS
        const style = document.createElement('style');
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
            
            .toast.show {
                transform: translateY(0);
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
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