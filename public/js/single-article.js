const SingleArticle = {
    article: null,
    elements: {},
    
    init() {
        
        this.cacheElements();
        const articleId = this.getArticleIdFromUrl();
        
        if (!articleId) {
            this.showError('Article not found - no ID provided');
            return;
        }
        
        this.loadArticle(articleId);
    },
    
    cacheElements() {
        this.elements = {
            articleContainer: document.getElementById('article-container'),
            articleContent: document.getElementById('article-content'),
            articleTitle: document.getElementById('article-title'),
            articleSubtitle: document.getElementById('article-subtitle'),
            articleImage: document.getElementById('article-image'),
            articleMeta: document.getElementById('article-meta'),
            articleTags: document.getElementById('article-tags'),
            relatedArticles: document.getElementById('related-articles'),
            errorContainer: document.getElementById('error-container')
        };
    },
    
    getArticleIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    },
    
    async loadArticle(articleId) {
        try {
            
            
            const response = await fetch(`/api/articles/${articleId}`);
            if (!response.ok) throw new Error('Article not found');
            
            this.article = await response.json();
            
            
            this.renderArticle();
            document.title = `${this.article.title} - Roll With Advantage`;
            
        } catch (error) {
            console.error('Error loading article:', error);
            this.showError('Article not found or could not be loaded');
        }
    },
    
    renderArticle() {
        const { articleContent, articleTitle, articleSubtitle, 
                articleImage, articleMeta, articleTags } = this.elements;
        
        // Set title and subtitle
        if (articleTitle) articleTitle.textContent = this.article.title;
        if (articleSubtitle && this.article.subtitle) {
            articleSubtitle.textContent = this.article.subtitle;
            articleSubtitle.style.display = 'block';
        }
        
        // Set image
        if (articleImage && this.article.image) {
            articleImage.src = this.article.image;
            articleImage.alt = this.article.title;
            articleImage.style.display = 'block';
        }
        
        // Set meta information
        if (articleMeta) {
            const formattedDate = this.formatDate(this.article.date || this.article.createdAt);
            articleMeta.innerHTML = `
                <span class="article-date"><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
                ${this.article.readTime ? `<span class="article-read-time"><i class="far fa-clock"></i> ${this.article.readTime} min read</span>` : ''}
                ${this.article.author ? `<span class="article-author"><i class="far fa-user"></i> ${this.article.author}</span>` : ''}
            `;
        }
        
        // Set tags
        if (articleTags && this.article.tags && this.article.tags.length > 0) {
            articleTags.innerHTML = this.article.tags.map(tag => 
                `<span class="article-tag">${this.capitalizeTag(tag)}</span>`
            ).join('');
        }
        
            // Add YouTube video if available
    if (this.article.relatedVideo || this.article.youtubeVideo) {
        const videoUrl = this.article.relatedVideo || this.article.youtubeVideo;
        const videoId = this.getYouTubeId(videoUrl);
        
        if (videoId) {
            // Create video container after the article header
            const videoContainer = document.createElement('div');
            videoContainer.className = 'article-video-container';
            videoContainer.innerHTML = `
                <iframe 
                    src="https://www.youtube.com/embed/${videoId}" 
                    title="YouTube video player" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            `;

              // Insert after the header or before the content
              const header = document.querySelector('.article-header');
              if (header && header.nextElementSibling) {
                  header.parentNode.insertBefore(videoContainer, header.nextElementSibling);
              } else if (articleContent) {
                  articleContent.parentNode.insertBefore(videoContainer, articleContent);
              }
          }
      }

        // Set content - convert markdown to HTML
        if (articleContent) {
            if (typeof marked !== 'undefined') {
                articleContent.innerHTML = marked.parse(this.article.content || '');
            } else {
                articleContent.innerHTML = this.article.content || '';
            }
        }
        
        // Setup share buttons
        this.setupShareButtons();
        
        // Fetch related articles
        this.fetchRelatedArticles();
    },

    // Helper function to extract YouTube video ID from URL
    getYouTubeId(url) {
        if (!url) return null;
        
        // Regular expression to match YouTube URL patterns
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        
        return (match && match[2].length === 11) ? match[2] : null;
    },
    
    setupShareButtons() {
        const shareTwitter = document.getElementById('share-twitter');
        const shareFacebook = document.getElementById('share-facebook');
        const shareReddit = document.getElementById('share-reddit');
        
        const pageUrl = window.location.href;
        const title = encodeURIComponent(this.article.title);
        
        if (shareTwitter) {
            shareTwitter.href = `https://twitter.com/intent/tweet?text=${title}&url=${encodeURIComponent(pageUrl)}`;
        }
        
        if (shareFacebook) {
            shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
        }
        
        if (shareReddit) {
            shareReddit.href = `https://www.reddit.com/submit?url=${encodeURIComponent(pageUrl)}&title=${title}`;
        }
    },
    
    async fetchRelatedArticles() {
        const { relatedArticles } = this.elements;
        if (!relatedArticles || !this.article.tags || this.article.tags.length === 0) return;
        
        try {
            const response = await fetch('/api/articles');
            if (!response.ok) return;
            
            const articles = await response.json();
            
            // Find articles with matching tags, excluding current article
            const related = articles
                .filter(article => 
                    article.id !== this.article.id && 
                    article.tags && 
                    article.tags.some(tag => this.article.tags.includes(tag))
                )
                .slice(0, 3); // Limit to 3 related articles
                
            if (related.length === 0) {
                relatedArticles.style.display = 'none';
                return;
            }
                
            // Build related articles section
            const relatedTitle = document.createElement('h3');
            relatedTitle.className = 'related-title';
            relatedTitle.textContent = 'Related Articles';
            
            const relatedGrid = document.createElement('div');
            relatedGrid.className = 'related-grid';
            
            related.forEach(article => {
                relatedGrid.appendChild(this.createArticleCard(article));
            });
            
            relatedArticles.innerHTML = '';
            relatedArticles.appendChild(relatedTitle);
            relatedArticles.appendChild(relatedGrid);
            
        } catch (error) {
            console.error('Error fetching related articles:', error);
            relatedArticles.style.display = 'none';
        }
    },
    
    createArticleCard(article) {
        const card = document.createElement('div');
        card.className = 'article-card';
        
        const formattedDate = this.formatDate(article.date || article.createdAt);
        
        card.innerHTML = `
            <div class="article-image">
                ${article.image ? `<img src="${article.image}" alt="${article.title}">` : ''}
            </div>
            <div class="article-content">
                <div class="article-meta">
                    <div class="article-date"><i class="far fa-calendar-alt"></i> ${formattedDate}</div>
                </div>
                <h3 class="article-title">${article.title}</h3>
                <a href="/article?id=${article.id}" class="article-card-link">Read Article</a>
            </div>
        `;
        
        return card;
    },
    
    showError(message) {
        const { errorContainer, articleContainer } = this.elements;
        
        if (articleContainer) {
            articleContainer.style.display = 'none';
        }
        
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="error-box">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Oops! Something went wrong</h3>
                    <p>${message}</p>
                    <a href="/articles.html" class="btn btn-primary">Back to Articles</a>
                </div>
            `;
            errorContainer.style.display = 'block';
        }
    },
    
    formatDate(dateString) {
        if (!dateString) return 'Unknown date';
        
        const date = new Date(dateString);
        
        // Check if date is invalid
        if (isNaN(date.getTime())) return 'Unknown date';
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    capitalizeTag(tag) {
        if (!tag) return '';
        
        return tag.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    SingleArticle.init();
});