/**
 * Roll With Advantage - Articles System
 * 
 * This file handles the article listing, filtering, and viewing functionality
 */

// Articles Module
const Articles = {
    // Store all articles data
    allArticles: [],
    // Current filtered articles
    filteredArticles: [],
    // Current page
    currentPage: 1,
    // Items per page
    itemsPerPage: 9,
    // Currently active tag filter
    activeTag: 'all',
    // Current search query
    searchQuery: '',
    // Current sort method
    currentSort: 'newest',
    // All available tags
    availableTags: [],
    
    // DOM Elements
    elements: {},
    
    /**
     * Initialize the articles module
     */
    init() {
        
        
        this.cacheElements();
        this.bindEvents();
        this.loadArticles();
        this.initRSSCopy();
    },
    
    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            articlesList: document.getElementById('articles-list'),
            pagination: document.getElementById('pagination'),
            tagCloud: document.getElementById('tag-cloud'),
            searchInput: document.getElementById('article-search'),
            searchButton: document.getElementById('search-btn'),
            sortSelect: document.getElementById('sort-select'),
            modal: document.getElementById('article-preview-modal'),
            modalContent: document.querySelector('.article-preview-container'),
            modalClose: document.querySelector('.close-modal'),
            rssUrl: document.getElementById('rss-url'),
            copyRssBtn: document.getElementById('copy-rss-btn')
        };
        
        return this.elements;
    },
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        const { searchInput, searchButton, sortSelect } = this.elements;
        
        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                // Debounce search to avoid too many refreshes
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.searchQuery = searchInput.value.trim();
                    this.filterArticles();
                }, 300);
            });
        }
        
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                this.searchQuery = searchInput.value.trim();
                this.filterArticles();
            });
        }
        
        // Sort functionality
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.currentSort = sortSelect.value;
                this.sortArticles();
                this.renderArticles();
            });
        }
        
        // Setup scroll event for sticky header
        window.addEventListener('scroll', () => {
            const controls = document.querySelector('.article-controls');
            if (controls && window.scrollY > 150) {
                controls.classList.add('scrolled');
            } else if (controls) {
                controls.classList.remove('scrolled');
            }
        });
    },
    
    /**
     * Initialize RSS copy button
     */
    initRSSCopy() {
        const { rssUrl, copyRssBtn } = this.elements;
        
        if (copyRssBtn && rssUrl) {
            copyRssBtn.addEventListener('click', () => {
                rssUrl.select();
                document.execCommand('copy');
                
                // Show success state
                copyRssBtn.innerHTML = '<i class="fas fa-check"></i>';
                copyRssBtn.style.backgroundColor = '#28a745';
                
                // Reset after 2 seconds
                setTimeout(() => {
                    copyRssBtn.innerHTML = '<i class="fas fa-copy"></i>';
                    copyRssBtn.style.backgroundColor = '';
                }, 2000);
            });
        }
    },
    
    /**
     * Load articles data from API
     */
    async loadArticles() {
        const { articlesList } = this.elements;
        
        try {
            // Show loading state
            if (articlesList) {
                articlesList.innerHTML = `
                    <div class="loading-state">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading articles...</p>
                    </div>
                `;
            }
            
            // Fetch articles from API
            const response = await fetch('/api/articles');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch articles: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!Array.isArray(data)) {
                throw new Error('Invalid data format - expected an array');
            }
            
            // Store the articles
            this.allArticles = data;
            this.filteredArticles = [...data];
            
            // Extract all unique tags
            this.extractTags();
            
            // Render tag cloud
            this.renderTagCloud();
            
            // Sort articles
            this.sortArticles();
            
            // Render articles
            this.renderArticles();
            
        } catch (error) {
            console.error('Error loading articles:', error);
            
            if (articlesList) {
                articlesList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>Error Loading Articles</h3>
                        <p>There was a problem loading the articles. Please try again later.</p>
                        <button class="btn btn-primary" onclick="Articles.loadArticles()">Retry</button>
                    </div>
                `;
            }
        }
    },
    
    /**
     * Extract all unique tags from the articles
     */
    extractTags() {
        const tagSet = new Set();
        
        this.allArticles.forEach(article => {
            if (article.tags && Array.isArray(article.tags)) {
                article.tags.forEach(tag => tagSet.add(tag.toLowerCase()));
            }
        });
        
        this.availableTags = Array.from(tagSet).sort();
        
    },
    
    /**
     * Render tag cloud
     */
    renderTagCloud() {
        const { tagCloud } = this.elements;
        
        if (!tagCloud) return;
        
        // Clear previous tags, but keep the "All" tag
        tagCloud.innerHTML = `<span class="tag active" data-tag="all">All</span>`;
        
        // Add each tag
        this.availableTags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.setAttribute('data-tag', tag);
            tagElement.textContent = this.capitalizeTag(tag);
            
            // Add click event
            tagElement.addEventListener('click', () => this.handleTagClick(tag));
            
            tagCloud.appendChild(tagElement);
        });
        
        // Add event to the "All" tag
        const allTag = tagCloud.querySelector('[data-tag="all"]');
        if (allTag) {
            allTag.addEventListener('click', () => this.handleTagClick('all'));
        }
    },
    
    /**
     * Handle tag click
     */
    handleTagClick(tag) {
        if (this.activeTag === tag) return; // Already active
        
        // Update active tag
        this.activeTag = tag;
        
        // Update visual state
        const { tagCloud } = this.elements;
        if (tagCloud) {
            // Remove active class from all tags
            tagCloud.querySelectorAll('.tag').forEach(el => {
                el.classList.remove('active');
            });
            
            // Add active class to clicked tag
            const activeTagElement = tagCloud.querySelector(`[data-tag="${tag}"]`);
            if (activeTagElement) {
                activeTagElement.classList.add('active');
            }
        }
        
        // Filter articles
        this.filterArticles();
    },
    
    /**
     * Filter articles based on tag and search query
     */
    filterArticles() {
        const tag = this.activeTag;
        const query = this.searchQuery.toLowerCase();
        
        // Reset to first page
        this.currentPage = 1;
        
        if (tag === 'all' && !query) {
            // No filters applied
            this.filteredArticles = [...this.allArticles];
        } else {
            // Apply filters
            this.filteredArticles = this.allArticles.filter(article => {
                // Check tag filter
                const passesTagFilter = tag === 'all' || 
                    (article.tags && article.tags.map(t => t.toLowerCase()).includes(tag));
                
                // Check search filter
                const passesSearchFilter = !query || 
                    article.title.toLowerCase().includes(query) ||
                    article.excerpt.toLowerCase().includes(query) ||
                    (article.content && article.content.toLowerCase().includes(query));
                
                return passesTagFilter && passesSearchFilter;
            });
        }
        
        // Sort the filtered articles
        this.sortArticles();
        
        // Render the filtered articles
        this.renderArticles();
    },
    
    /**
     * Sort articles based on current sort method
     */
    sortArticles() {
        switch (this.currentSort) {
            case 'newest':
                this.filteredArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'oldest':
                this.filteredArticles.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'title-asc':
                this.filteredArticles.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-desc':
                this.filteredArticles.sort((a, b) => b.title.localeCompare(a.title));
                break;
            default:
                this.filteredArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
    },
    
    /**
     * Render articles to the page
     */
    renderArticles() {
        const { articlesList, pagination } = this.elements;
        
        if (!articlesList) return;
        
        // Calculate pagination
        const totalArticles = this.filteredArticles.length;
        const totalPages = Math.ceil(totalArticles / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const articlesToShow = this.filteredArticles.slice(startIndex, endIndex);
        
        // Clear current content
        articlesList.innerHTML = '';
        
        // Check if no articles match the filters
        if (totalArticles === 0) {
            articlesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No Articles Found</h3>
                    <p>No articles match your search criteria. Try adjusting your filters or search query.</p>
                    <button class="btn btn-primary" onclick="Articles.resetFilters()">Reset Filters</button>
                </div>
            `;
            
            // Clear pagination
            if (pagination) {
                pagination.innerHTML = '';
            }
            
            return;
        }
        
        // Render each article
        articlesToShow.forEach(article => {
            articlesList.appendChild(this.createArticleCard(article));
        });
        
        // Render pagination
        if (pagination) {
            this.renderPagination(totalPages);
        }
    },
    
    /**
     * Create article card element
     */
    createArticleCard(article) {
        const card = document.createElement('div');
        card.className = 'article-card';
        
        // Format date
        const formattedDate = this.formatDate(article.date);
        
        // Get article URL - it might be a full URL or just an ID
        const articleUrl = article.url || `/article/${article.id}`;
        
        // Format tags
        const tagElements = article.tags && article.tags.length > 0
            ? article.tags.map(tag => `<span class="article-tag">${this.capitalizeTag(tag)}</span>`).join('')
            : '';
        
        // Create card content
        card.innerHTML = `
            <div class="article-image">
                <img src="${article.image || '/assets/images/article-placeholder.jpg'}" alt="${article.title}">
                ${article.featured ? '<span class="article-badge">Featured</span>' : ''}
            </div>
            <div class="article-content">
                <div class="article-meta">
                    <span class="article-date"><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
                    ${article.readTime ? `<span class="article-read-time"><i class="far fa-clock"></i> ${article.readTime} min read</span>` : ''}
                </div>
                <h3 class="article-title">${article.title}</h3>
                <p class="article-excerpt">${article.excerpt || this.truncateText(article.content, 120)}</p>
                <div class="article-tags">
                    ${tagElements}
                </div>
                <a href="javascript:void(0)" class="article-card-link" data-article-id="${article.id}">Read Article</a>
            </div>
        `;
        
        // Add event listener for the read article link
        const readLink = card.querySelector('.article-card-link');
        if (readLink) {
            readLink.href = `/article?id=${article.id}`;
        }
        
        return card;
    },
    
    /**
     * Render pagination controls
     */
    renderPagination(totalPages) {
        const { pagination } = this.elements;
        
        if (!pagination) return;
        
        // Clear current pagination
        pagination.innerHTML = '';
        
        // Don't show pagination if only one page
        if (totalPages <= 1) return;
        
        // Previous button
        const prevButton = document.createElement('span');
        prevButton.className = `page-item ${this.currentPage === 1 ? 'disabled' : ''}`;
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        
        if (this.currentPage > 1) {
            prevButton.addEventListener('click', () => this.changePage(this.currentPage - 1));
        }
        
        pagination.appendChild(prevButton);
        
        // Page numbers
        // Handle lots of pages
        const maxPagesToShow = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        
        // Adjust if we're near the end
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        
        // First page link if not in range
        if (startPage > 1) {
            const firstPage = document.createElement('span');
            firstPage.className = 'page-item';
            firstPage.textContent = '1';
            firstPage.addEventListener('click', () => this.changePage(1));
            pagination.appendChild(firstPage);
            
            // Ellipsis if needed
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'page-item disabled';
                ellipsis.innerHTML = '&hellip;';
                pagination.appendChild(ellipsis);
            }
        }
        
        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            const pageLink = document.createElement('span');
            pageLink.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
            pageLink.textContent = i.toString();
            
            if (i !== this.currentPage) {
                pageLink.addEventListener('click', () => this.changePage(i));
            }
            
            pagination.appendChild(pageLink);
        }
        
        // Last page link if not in range
        if (endPage < totalPages) {
            // Ellipsis if needed
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'page-item disabled';
                ellipsis.innerHTML = '&hellip;';
                pagination.appendChild(ellipsis);
            }
            
            const lastPage = document.createElement('span');
            lastPage.className = 'page-item';
            lastPage.textContent = totalPages.toString();
            lastPage.addEventListener('click', () => this.changePage(totalPages));
            pagination.appendChild(lastPage);
        }
        
        // Next button
        const nextButton = document.createElement('span');
        nextButton.className = `page-item ${this.currentPage === totalPages ? 'disabled' : ''}`;
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        
        if (this.currentPage < totalPages) {
            nextButton.addEventListener('click', () => this.changePage(this.currentPage + 1));
        }
        
        pagination.appendChild(nextButton);
    },
    
    /**
     * Change page
     */
    changePage(pageNumber) {
        if (pageNumber === this.currentPage) return;
        
        this.currentPage = pageNumber;
        this.renderArticles();
        
        // Scroll to top of articles
        const articlesSection = document.querySelector('.articles-section');
        if (articlesSection) {
            articlesSection.scrollIntoView({ behavior: 'smooth' });
        }
    },
    
    /**
     * Reset all filters
     */
    resetFilters() {
        // Reset active tag
        this.activeTag = 'all';
        
        // Update tag cloud
        const { tagCloud, searchInput, sortSelect } = this.elements;
        if (tagCloud) {
            tagCloud.querySelectorAll('.tag').forEach(el => {
                el.classList.remove('active');
                if (el.getAttribute('data-tag') === 'all') {
                    el.classList.add('active');
                }
            });
        }
        
        // Reset search
        this.searchQuery = '';
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Reset sort
        this.currentSort = 'newest';
        if (sortSelect) {
            sortSelect.value = 'newest';
        }
        
        // Reset to first page
        this.currentPage = 1;
        
        // Reset filtered articles
        this.filteredArticles = [...this.allArticles];
        
        // Sort and render
        this.sortArticles();
        this.renderArticles();
    },
    
    /**
     * Open article preview modal
     */
    async openArticlePreview(article) {
        const { modal, modalContent } = this.elements;
        
        // Show loading state
        modalContent.innerHTML = `
            <div class="article-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading article...</p>
            </div>
        `;
        
        // Show modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        try {
            // Fetch full article content if needed
            let fullArticle = article;
            
            if (!article.content || article.loadFull) {
                const response = await fetch(`/api/articles/${article.id}`);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch article: ${response.status}`);
                }
                
                fullArticle = await response.json();
            }
            
            // Render article content
            this.renderArticleContent(fullArticle);
            
        } catch (error) {
            console.error('Error loading article:', error);
            
            modalContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Error Loading Article</h3>
                    <p>There was a problem loading the article. Please try again later.</p>
                    <button class="btn btn-primary" onclick="Articles.closeModal()">Close</button>
                </div>
            `;
        }
    },
    
    /**
     * Render article content in the modal
     */
    renderArticleContent(article) {
        const { modalContent } = this.elements;
        
        if (!modalContent) return;
        
        // Format date
        const formattedDate = this.formatDate(article.date);
        
        // Format tags
        const tagElements = article.tags && article.tags.length > 0
            ? article.tags.map(tag => `<span class="article-tag">${this.capitalizeTag(tag)}</span>`).join('')
            : '';
        
        // Convert markdown content to HTML if needed
        let htmlContent = article.content;
        if (typeof marked !== 'undefined' && article.content && article.content.includes('#')) {
            htmlContent = marked.parse(article.content);
        }
        
        // Create article content
        modalContent.innerHTML = `
            <article class="article-full">
                <div class="article-header">
                    ${article.image ? `<img src="${article.image}" alt="${article.title}" class="article-header-image">` : ''}
                    <div class="article-header-meta">
                        <span class="article-date"><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
                        ${article.readTime ? `<span class="article-read-time"><i class="far fa-clock"></i> ${article.readTime} min read</span>` : ''}
                        ${article.author ? `<span class="article-author"><i class="far fa-user"></i> ${article.author}</span>` : ''}
                    </div>
                    <h1 class="article-header-title">${article.title}</h1>
                    ${article.subtitle ? `<h2 class="article-header-subtitle">${article.subtitle}</h2>` : ''}
                    <div class="article-header-tags">
                        ${tagElements}
                    </div>
                </div>
                <div class="article-content-body">
                    ${htmlContent}
                </div>
                <div class="article-footer">
                    <div class="article-share">
                        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.origin + '/article/' + article.id)}" target="_blank" class="share-btn share-twitter" title="Share on Twitter">
                            <i class="fab fa-twitter"></i>
                        </a>
                        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/article/' + article.id)}" target="_blank" class="share-btn share-facebook" title="Share on Facebook">
                            <i class="fab fa-facebook-f"></i>
                        </a>
                        <a href="https://www.reddit.com/submit?url=${encodeURIComponent(window.location.origin + '/article/' + article.id)}&title=${encodeURIComponent(article.title)}" target="_blank" class="share-btn share-reddit" title="Share on Reddit">
                            <i class="fab fa-reddit-alien"></i>
                        </a>
                    </div>
                    <a href="/article/${article.id}" class="btn btn-primary">View Full Article</a>
                </div>
            </article>
        `;
    },
    
    /**
     * Close the modal
     */
    closeModal() {
        const { modal } = this.elements;
        
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        }
    },
    
    /**
     * Format date to readable string
     */
    formatDate(dateString) {
        if (!dateString) return 'Unknown date';
        
        const date = new Date(dateString);
        
        // Check if date is invalid
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    /**
     * Capitalize first letter of each word in a tag
     */
    capitalizeTag(tag) {
        if (!tag) return '';
        
        return tag.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    },
    
    /**
     * Truncate text to specified length with ellipsis
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
     * Render article list with filters
     */
    renderArticleList(searchTerm = '', tagFilter = '', statusFilter = '') {
        const { articlesList, articleCount } = this.elements;
        
        if (!articlesList) return;
        
        // Filter articles based on search term, tag filter, and status filter
        this.filteredArticles = this.filterArticles(searchTerm, tagFilter, statusFilter);
        
        // Calculate pagination
        const totalPages = Math.ceil(this.filteredArticles.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedArticles = this.filteredArticles.slice(startIndex, startIndex + this.itemsPerPage);
        
        // Show article count if element exists
        if (articleCount) {
            articleCount.textContent = `Showing ${Math.min(this.filteredArticles.length, paginatedArticles.length)} of ${this.filteredArticles.length} articles`;
        }
        
        // Clear previous articles
        articlesList.innerHTML = '';
        
        // If no articles, show empty state
        if (paginatedArticles.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="far fa-newspaper"></i>
                <h3>No articles found</h3>
                <p>Try adjusting your filters or search term</p>
            `;
            articlesList.appendChild(emptyState);
            return;
        }
        
        // Add articles to the list
        paginatedArticles.forEach(article => {
            const articleElement = this.createArticleListItem(article);
            articlesList.appendChild(articleElement);
        });
        
        // Update pagination
        this.updatePagination(totalPages);
    },

    /**
     * Create article list item element
     */
    createArticleListItem(article) {
        const item = document.createElement('div');
        item.className = 'article-card';
        
        // Create tag elements
        const tagElements = article.tags && article.tags.length > 0
            ? article.tags.map(tag => `<span class="article-tag">${this.capitalizeTag(tag)}</span>`).join('')
            : '';
        
        // Format date
        const formattedDate = this.formatDate(article.date || article.createdAt);
        
        // Create excerpt
        const excerpt = this.truncateText(article.excerpt || article.content, 150);
        
        item.innerHTML = `
            <div class="article-image">
                ${article.image ? `<img src="${article.image}" alt="${article.title}">` : ''}
                ${article.featured ? `<div class="article-badge">Featured</div>` : ''}
            </div>
            <div class="article-content">
                <div class="article-meta">
                    <div class="article-date"><i class="far fa-calendar-alt"></i> ${formattedDate}</div>
                </div>
                <h3 class="article-title">${article.title}</h3>
                <p class="article-excerpt">${excerpt}</p>
                <div class="article-tags">
                    ${tagElements}
                </div>
                <a href="/article?id=${article.id}" class="article-card-link">Read Article</a>
            </div>
        `;
        
        item.querySelector('.article-card-link').href = `/article?id=${article.id}`;
        
        return item;
    }
};

// Initialize the Articles module when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize only if we're on the articles page
    if (document.getElementById('articles-list')) {
        Articles.init();
    }
});