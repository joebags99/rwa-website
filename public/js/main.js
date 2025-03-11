/**
 * Roll With Advantage - Enhanced Main JavaScript
 * This file contains core functionality for the website with advanced animations and effects
 */

document.addEventListener('DOMContentLoaded', function() {
    // Remove loading class once everything is loaded
    window.addEventListener('load', function() {
        document.body.classList.remove('loading');
        document.querySelector('.preloader').classList.add('fade-out');
        setTimeout(() => {
            document.querySelector('.preloader').style.display = 'none';
        }, 500);
        
        // Show hero content after a small delay
        setTimeout(() => {
            document.querySelector('.reveal-content')?.classList.add('show');
            document.querySelector('.magic-line')?.classList.add('animated');
        }, 300);
    });
    
    // Initialize all components
    initializeDeviceDetection();
    initializeMobileMenu();
    initializeParallaxEffects();
    initializeScrollEffects();
    initializeFloatingDice();
    initializeNewsletterForm();
    initializeScrollToTop();
    initializeCardEffects();
    
    // We'll initialize thumbnails after a slight delay to ensure DOM is loaded
    setTimeout(enhanceVideoThumbnails, 300);
    
    // If we're on the tools page, initialize those components
    if (document.querySelector('.dice-roller')) {
        initializeDiceRoller();
    }
    
    if (document.querySelector('.character-quiz')) {
        initializeCharacterQuiz();
    }
    
    if (document.querySelector('.interactive-map')) {
        initializeInteractiveMap();
    }
});

/**
 * Initialize Device Detection
 * Detects mobile devices to disable certain effects
 */
function initializeDeviceDetection() {
    // Check if device is a mobile/touch device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                    || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    
    if (isMobile) {
        document.body.classList.add('mobile-device');
        
        // Disable parallax and certain animations on mobile for better performance
        const parallaxElements = document.querySelectorAll('.parallax-section, .section-background');
        parallaxElements.forEach(element => {
            element.classList.add('no-parallax');
        });
    }
}

/**
 * Initialize Mobile Menu Toggle
 */
function initializeMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('nav ul');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
            
            // Toggle menu icon
            const spans = this.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navMenu.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                if (navMenu.classList.contains('active')) {
                    mobileMenuToggle.click();
                }
            }
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (navMenu.classList.contains('active')) {
                    mobileMenuToggle.click();
                }
            });
        });
    }
}

/**
 * Initialize Parallax Effects
 * Creates subtle movement on scroll for background elements
 */
function initializeParallaxEffects() {
    if (document.body.classList.contains('mobile-device')) return;
    
    const parallaxElements = document.querySelectorAll('.parallax-section');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        parallaxElements.forEach(element => {
            const sectionTop = element.offsetTop;
            const sectionHeight = element.offsetHeight;
            const viewportHeight = window.innerHeight;
            
            // Check if section is visible
            if (scrollY + viewportHeight > sectionTop && scrollY < sectionTop + sectionHeight) {
                const yPos = (scrollY - sectionTop) * 0.1;
                
                // Apply parallax effect to background
                const background = element.querySelector('.section-background, .hero-background');
                if (background) {
                    background.style.transform = `translateY(${yPos}px)`;
                }
                
                // Apply parallax effect to floating elements
                const floatingElements = element.querySelectorAll('.float-element, .float-dice');
                if (floatingElements.length > 0) {
                    floatingElements.forEach((el, index) => {
                        const speed = 0.05 + (index * 0.01);
                        el.style.transform = `translateY(${yPos * speed * (index % 2 === 0 ? 1 : -1)}px)`;
                    });
                }
            }
        });
    });
    
    // Header scroll effect
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/**
 * Initialize Scroll Effects
 * Adds animations and effects triggered by scrolling
 */
function initializeScrollEffects() {
    const sections = document.querySelectorAll('.section-appear');
    
    // Create a new Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                
                // Add staggered animations to child elements if needed
                const animateElements = entry.target.querySelectorAll('.stagger-animate');
                if (animateElements.length > 0) {
                    animateElements.forEach((el, index) => {
                        setTimeout(() => {
                            el.classList.add('animated');
                        }, 150 * index);
                    });
                }
                
                // Animate tool cards with delay
                const toolCards = entry.target.querySelectorAll('.tool-card');
                if (toolCards.length > 0) {
                    toolCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 150 * index);
                    });
                }
            }
        });
    }, { threshold: 0.1 });
    
    // Observe each section
    sections.forEach(section => {
        observer.observe(section);
        
        // Set initial state for tool cards
        const toolCards = section.querySelectorAll('.tool-card');
        if (toolCards.length > 0) {
            toolCards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
            });
        }
    });
}

/**
 * Initialize Floating Dice
 * Creates floating dice elements in the hero section
 */
function initializeFloatingDice() {
    if (document.body.classList.contains('mobile-device')) return;
    
    const container = document.querySelector('.floating-dice-container');
    if (!container) return;
    
    // Create floating dice
    for (let i = 0; i < 10; i++) {
        const dice = document.createElement('div');
        dice.classList.add('floating-dice');
        dice.classList.add('d20');

        // Random position, size and animation
        const size = Math.random() * 30 + 30; // 30-60px
        const posX = Math.random() * 100; // 0-100%
        const posY = Math.random() * 100; // 0-100%
        const delay = Math.random() * 5; // 0-5s
        const duration = Math.random() * 10 + 15; // 15-25s
        
        dice.style.width = `${size}px`;
        dice.style.height = `${size}px`;
        dice.style.left = `${posX}%`;
        dice.style.top = `${posY}%`;
        dice.style.animationDelay = `${delay}s`;
        dice.style.animationDuration = `${duration}s`;
        
        container.appendChild(dice);
    }
}

/**
 * Initialize Newsletter Form Submission
 */
function initializeNewsletterForm() {
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (validateEmail(email)) {
                // Add submission animation
                newsletterForm.classList.add('submitted');
                
                // In a real implementation, you would send this to your backend or email service
                // For now, we'll just show a success message after a short delay
                setTimeout(() => {
                    newsletterForm.innerHTML = '<p class="success-message">Thank you for subscribing! You\'ll receive updates soon.</p>';
                }, 1000);
            } else {
                // Show error message with animation
                const errorMessage = document.createElement('p');
                errorMessage.classList.add('error-message');
                errorMessage.style.color = 'yellow';
                errorMessage.style.marginTop = '10px';
                errorMessage.textContent = 'Please enter a valid email address.';
                errorMessage.style.opacity = '0';
                errorMessage.style.transform = 'translateY(-10px)';
                errorMessage.style.transition = 'all 0.3s ease';
                
                // Remove any existing error messages
                const existingError = newsletterForm.querySelector('.error-message');
                if (existingError) {
                    existingError.remove();
                }
                
                newsletterForm.appendChild(errorMessage);
                
                // Trigger animation
                setTimeout(() => {
                    errorMessage.style.opacity = '1';
                    errorMessage.style.transform = 'translateY(0)';
                }, 10);
                
                // Add shake animation to input
                emailInput.classList.add('shake');
                setTimeout(() => {
                    emailInput.classList.remove('shake');
                }, 500);
            }
        });
    }
}

/**
 * Email validation
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Initialize Scroll to Top Button
 */
function initializeScrollToTop() {
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    if (!scrollTopBtn) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });
    
    // Smooth scroll to top
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Initialize Card Effects
 * Adds hover and tilt effects to cards
 */
function initializeCardEffects() {
    if (document.body.classList.contains('mobile-device')) return;
    
    // 3D Tilt effect for tool cards - improved mouse tracking
    const toolCards = document.querySelectorAll('.tool-card');
    
    toolCards.forEach(card => {
        // Store original transform to return to when mouse leaves
        const originalTransform = card.style.transform;
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top; // y position within the element
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;
            
            // Apply rotation based on mouse position - with reduced values
            card.style.transform = `perspective(1000px) rotateX(${deltaY * -2}deg) rotateY(${deltaX * 2}deg) translateZ(5px)`;
            
            // Move icon with reduced movement
            const icon = card.querySelector('.tool-icon');
            if (icon) {
                icon.style.transform = `translateX(${deltaX * 4}px) translateY(${deltaY * 4}px)`;
            }
            
            // Move preview with reduced movement
            const preview = card.querySelector('.tool-preview');
            if (preview) {
                preview.style.transform = `translateX(${deltaX * -6}px) translateY(${deltaY * -6}px)`;
            }
        });
        
        card.addEventListener('mouseleave', () => {
            // Reset to original flat state when mouse leaves
            card.style.transform = originalTransform || 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            
            // Reset icon position
            const icon = card.querySelector('.tool-icon');
            if (icon) {
                icon.style.transform = '';
            }
            
            // Reset preview position
            const preview = card.querySelector('.tool-preview');
            if (preview) {
                preview.style.transform = '';
            }
        });
        
        // Add tool preview animations
        const toolType = card.getAttribute('data-tool');
        if (toolType === 'dice') {
            animateMiniDice(card.querySelector('.mini-dice'));
        } else if (toolType === 'quiz') {
            animateQuizOptions(card.querySelector('.quiz-options'));
        } else if (toolType === 'map') {
            animateMapMarker(card.querySelector('.map-marker'));
        }
    });
    
    // Hover effect for video cards
    const videoCards = document.querySelectorAll('.video-card');
    
    videoCards.forEach(card => {
        // Store original transform to return to when mouse leaves
        const originalTransform = card.style.transform;
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;
            
            // Even less intense tilt for video cards
            card.style.transform = `perspective(1000px) rotateX(${deltaY * -1.5}deg) rotateY(${deltaX * 1.5}deg) translateY(-5px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            // Reset to original flat state when mouse leaves
            card.style.transform = originalTransform || '';
        });
    });
}

/**
 * Animate Mini Dice in Tool Card
 */
function animateMiniDice(element) {
    if (!element) return;
    
    let rotation = 0;
    
    setInterval(() => {
        rotation += 2;
        element.style.transform = `rotate(${rotation}deg)`;
    }, 50);
}

/**
 * Animate Quiz Options in Tool Card
 */
function animateQuizOptions(element) {
    if (!element) return;
    
    const options = element.querySelectorAll('.option');
    
    setInterval(() => {
        options.forEach((option, index) => {
            setTimeout(() => {
                option.style.backgroundColor = 'rgba(127, 14, 189, 0.3)';
                
                setTimeout(() => {
                    option.style.backgroundColor = 'rgba(11, 42, 169, 0.2)';
                }, 300);
            }, index * 200);
        });
    }, 2000);
}

/**
 * Animate Map Marker in Tool Card
 */
function animateMapMarker(element) {
    if (!element) return;
    
    let scale = 1;
    let growing = false;
    
    setInterval(() => {
        if (growing) {
            scale += 0.02;
            if (scale >= 1.2) growing = false;
        } else {
            scale -= 0.02;
            if (scale <= 0.8) growing = true;
        }
        
        element.style.transform = `scale(${scale})`;
    }, 50);
}

/**
 * Dice Roller Functionality
 * This will be implemented on the tools.html page
 */
function initializeDiceRoller() {
    const diceContainer = document.querySelector('.dice-roller');
    if (!diceContainer) return;
    
    const rollButton = diceContainer.querySelector('.roll-button');
    const resultContainer = diceContainer.querySelector('.roll-result');
    const diceInputs = diceContainer.querySelectorAll('.dice-input');
    
    rollButton.addEventListener('click', function() {
        // Add rolling animation to button
        rollButton.classList.add('rolling');
        
        let results = [];
        let total = 0;
        
        // Create dice roll sound effect
        const rollSound = new Audio('assets/sounds/dice-roll.mp3');
        rollSound.volume = 0.5;
        rollSound.play();
        
        diceInputs.forEach(input => {
            const diceType = input.dataset.dice;
            const diceCount = parseInt(input.value) || 0;
            
            if (diceCount > 0) {
                const rolls = rollDice(diceCount, parseInt(diceType.substring(1)));
                results.push({
                    type: diceType,
                    rolls: rolls,
                    sum: rolls.reduce((a, b) => a + b, 0)
                });
                total += rolls.reduce((a, b) => a + b, 0);
            }
        });
        
        // Delay display to allow for animation
        setTimeout(() => {
            displayResults(results, total, resultContainer);
            rollButton.classList.remove('rolling');
        }, 1000);
    });
}

/**
 * More advanced dice animation
 */
function animateEnhancedDice(element) {
    const dice = element.querySelector('.mini-dice') || element;
    
    // Create a more random, realistic dice rolling effect
    let rotX = 0, rotY = 0, rotZ = 0;
    let speedX = Math.random() * 10 + 5;
    let speedY = Math.random() * 10 + 5;
    let speedZ = Math.random() * 5 + 3;
    
    // Update animation frame by frame
    function updateDice() {
        rotX += speedX;
        rotY += speedY;
        rotZ += speedZ;
        
        // Add slight changes to speed for natural feel
        speedX += (Math.random() - 0.5) * 0.2;
        speedY += (Math.random() - 0.5) * 0.2;
        
        // Keep speeds in bounds
        speedX = Math.max(3, Math.min(12, speedX));
        speedY = Math.max(3, Math.min(12, speedY));
        
        // Apply the 3D rotation
        dice.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`;
        
        requestAnimationFrame(updateDice);
    }
    
    // Start the animation
    updateDice();
}

/**
 * Roll a specified number of dice with a given number of sides
 */
function rollDice(count, sides) {
    const results = [];
    for (let i = 0; i < count; i++) {
        results.push(Math.floor(Math.random() * sides) + 1);
    }
    return results;
}

/**
 * Initialize the tilt effect on all tool cards
 */
function initializeTiltEffect() {
    const toolCards = document.querySelectorAll('.tool-card');
    
    toolCards.forEach(card => {
        // Add the js-tilt class for styling
        card.classList.add('js-tilt');
        
        // Add a glare effect element
        const glareElement = document.createElement('div');
        glareElement.className = 'js-tilt-glare';
        card.appendChild(glareElement);
        
        // Apply tilt depth classes to important elements
        const icon = card.querySelector('.tool-icon');
        if (icon) icon.classList.add('tilt-child', 'tilt-depth-3');
        
        const heading = card.querySelector('h3');
        if (heading) heading.classList.add('tilt-child', 'tilt-depth-2');
        
        const paragraph = card.querySelector('p');
        if (paragraph) paragraph.classList.add('tilt-child', 'tilt-depth-1');
        
        const button = card.querySelector('.btn');
        if (button) button.classList.add('tilt-child', 'tilt-depth-4');
        
        const preview = card.querySelector('.tool-preview');
        if (preview) preview.classList.add('tilt-child', 'tilt-depth-2');
        
        // Store the card's dimensions and position
        let rect = card.getBoundingClientRect();
        
        // Update dimensions on window resize
        window.addEventListener('resize', () => {
            rect = card.getBoundingClientRect();
        });
        
        // Add mouse move event for tilt effect
        card.addEventListener('mousemove', e => {
            applyTiltEffect(e, card, glareElement, rect);
        });
        
        // Reset on mouse leave
        card.addEventListener('mouseleave', () => {
            resetTiltEffect(card);
        });
        
        // Update on scroll to handle position changes
        window.addEventListener('scroll', () => {
            rect = card.getBoundingClientRect();
        });
    });
}

/**
 * Apply the tilt effect based on mouse position
 * 
 * @param {MouseEvent} e - The mouse event
 * @param {HTMLElement} card - The card element
 * @param {HTMLElement} glare - The glare element
 * @param {DOMRect} rect - The card's bounding rectangle
 */
function applyTiltEffect(e, card, glare, rect) {
    // Calculate mouse position relative to card
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Convert to percentage (0-100)
    const xPercent = mouseX / rect.width * 100;
    const yPercent = mouseY / rect.height * 100;
    
    // Calculate the tilt amount based on mouse position
    // -10 to +10 degrees for a pleasing effect
    const tiltX = ((yPercent - 50) / 50) * -10; // Inverted for natural feel
    const tiltY = ((xPercent - 50) / 50) * 10;
    
    // Apply the 3D transform
    card.style.transform = `perspective(1000px) 
                          rotateX(${tiltX}deg) 
                          rotateY(${tiltY}deg) 
                          scale3d(1.02, 1.02, 1.02)`;
    
    // Update glare position
    glare.style.setProperty('--x', `${xPercent}%`);
    glare.style.setProperty('--y', `${yPercent}%`);
}

/**
 * Reset the tilt effect to neutral position
 * 
 * @param {HTMLElement} card - The card element
 */
function resetTiltEffect(card) {
    // Smooth transition back to flat
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
}

/**
 * Apply enhanced animation to tool card previews
 * This is a more advanced version of the animations
 */
function enhanceToolPreviews() {
    const toolCards = document.querySelectorAll('.tool-card');
    
    toolCards.forEach(card => {
        const toolType = card.getAttribute('data-tool');
        const preview = card.querySelector('.tool-preview');
        
        if (toolType && preview) {
            // Different animations based on tool type
            switch(toolType) {
                case 'dice':
                    animateEnhancedDice(preview);
                    break;
                case 'quiz':
                    animateEnhancedQuiz(preview);
                    break;
                case 'map':
                    animateEnhancedMap(preview);
                    break;
            }
        }
    });
}

/**
 * Enhanced video thumbnail preview functionality
 * Creates a larger preview when clicking on video thumbnails
 */
function enhanceVideoThumbnails() {
    console.log('Initializing enhanced video thumbnails');
    
    // First, add the video preview container to the body if it doesn't exist
    if (!document.getElementById('video-preview-container')) {
        const previewContainer = document.createElement('div');
        previewContainer.id = 'video-preview-container';
        previewContainer.className = 'video-preview-container';
        previewContainer.innerHTML = `
            <div class="video-preview-inner">
                <img class="video-preview-image" src="" alt="Video preview">
                <div class="video-preview-overlay">
                    <i class="fas fa-play-circle video-preview-play"></i>
                </div>
                <h3 class="video-preview-title"></h3>
                <i class="fas fa-times video-preview-close"></i>
            </div>
        `;
        document.body.appendChild(previewContainer);
        
        // Close preview when clicking the close button
        const closeButton = previewContainer.querySelector('.video-preview-close');
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            previewContainer.classList.remove('active');
        });
        
        // Close preview when clicking outside the preview
        previewContainer.addEventListener('click', (e) => {
            if (e.target === previewContainer) {
                previewContainer.classList.remove('active');
            }
        });
        
        // Close preview when pressing Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                previewContainer.classList.remove('active');
            }
        });
    }
    
    // Get the preview container
    const previewContainer = document.getElementById('video-preview-container');
    const previewImage = previewContainer.querySelector('.video-preview-image');
    const previewTitle = previewContainer.querySelector('.video-preview-title');
    
    // Add click event to all video thumbnails
    const videoThumbnails = document.querySelectorAll('.video-thumbnail');
    
    console.log(`Found ${videoThumbnails.length} video thumbnails`);
    
    videoThumbnails.forEach(thumbnail => {
        const img = thumbnail.querySelector('img');
        if (!img) {
            console.warn('Thumbnail has no image element:', thumbnail);
            return;
        }
        
        // Find the parent video card and get the title
        const videoCard = thumbnail.closest('.video-card');
        const titleElement = videoCard ? videoCard.querySelector('.video-info h3') : null;
        const title = titleElement ? titleElement.textContent.trim() : 'Video Preview';
        
        // Get the original thumbnail URL (for debugging)
        console.log(`Thumbnail image src: ${img.src}`);
        
        // Make sure the thumbnail is properly styled
        thumbnail.style.cursor = 'pointer';
        
        // Create a separate click handler function that we can reference
        function thumbnailClickHandler(e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent event bubbling
            
            console.log('Thumbnail clicked, opening preview');
            
            // Show loading state
            previewContainer.classList.add('loading');
            
            // Get the video URL from the anchor tag
            const videoUrl = thumbnail.getAttribute('href');
            
            // Set the image source and title
            previewImage.src = img.src;
            previewTitle.textContent = title;
            
            // When image loads, remove loading state
            previewImage.onload = function() {
                previewContainer.classList.remove('loading');
            };
            
            // Show the preview
            previewContainer.classList.add('active');
            
            // Add click handler to play button to navigate to video
            const playButton = previewContainer.querySelector('.video-preview-play');
            if (playButton) {
                playButton.onclick = function(e) {
                    e.stopPropagation();
                    if (videoUrl) {
                        window.open(videoUrl, '_blank');
                    }
                };
            }
        }
        
        // Remove any existing click handlers to avoid duplicates
        thumbnail.removeEventListener('click', thumbnailClickHandler);
        
        // Add the click handler
        thumbnail.addEventListener('click', thumbnailClickHandler);
    });
    
    console.log(`Enhanced ${videoThumbnails.length} video thumbnails`);
}

/**
 * Helper function to get a better thumbnail URL for a video
 * @param {Object} video - Video object from the YouTube API
 * @param {String} videoId - YouTube video ID
 * @returns {String} - Best available thumbnail URL
 */
function getBestThumbnailUrl(video, videoId) {
    // Check for available thumbnails in the video object
    if (video && video.thumbnails) {
        if (video.thumbnails.maxres) return video.thumbnails.maxres.url;
        if (video.thumbnails.high) return video.thumbnails.high.url;
        if (video.thumbnails.medium) return video.thumbnails.medium.url;
        if (video.thumbnails.standard) return video.thumbnails.standard.url;
        if (video.thumbnails.default) return video.thumbnails.default.url;
    }
    
    // Fallback to direct YouTube thumbnail URL
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Handle thumbnail loading errors
 * @param {HTMLImageElement} img - Image element that failed to load
 * @param {String} videoId - YouTube video ID
 */
function handleThumbnailError(img, videoId) {
    console.warn(`Failed to load thumbnail for video ID: ${videoId}`);
    
    // Try lower quality thumbnail
    img.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    
    // If that also fails, use a placeholder
    img.onerror = function() {
        img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUAAAAC0CAMAAADROZcIAAAAMFBMVEXy8vL6+vr19fX4+Pjt7e3v7+/r6+v29vb8/Pzp6eno6Oj7+/vz8/Px8fHu7u7q6urfXciFAAACFUlEQVR4nO3a61LDIBCA0YY2Ul/3f7Ga6YxttOhaDsGZ5ftlQnYJEJMQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAZ5jQJIaQ0jV3H3GrXAVSTPXIdc4vvOoA08sBjq5nHXceHrDyy2Hrby04DKOqRh6pHbtN1AFnLI4stu8suA0hdB1BnPPKr6/dBjxxejWXeZQA+hqHrAGq6G8u86wD2m17/G0t9Ky3xysV39XfyRlz//AZVebzSLO887wcBAAAAAAAAAAAAAID3YuO49K6/1D2t93DXW3T5tW3b9vq75qp52TaWaTR5qbcMdbxnGT+Wsc01QI90a8cRzrK8lNvE+FjmFnmpu92tbeRHo5vj0g8w9pj9GDfywy0R+jLjSJkfJZnxrOG6PuNXfLBr4cdGkZ9mHKh4udv11IvnMbpd6LvOIu/1I75Jkb/OLnHPNznyGd+a3fTF+hSJvf8y7kMvQ4/uUVvJzMa3O6RY5Ne9xUfxrTRN0x+qNnnKbwxLmbMsPXzwVxWnPLk8yfE/bv1+C3PxxdcU+aLrPlPkC6XkPi9ZfrxSfmD8kOUbCwAAAAAAAAAAAAAAb+/8+YXz1ydenF7/euT4sU9+6Lv4AZc/gn3m/MsXJa+Dj19/EjlfvNKYpnl+c+KVqXn98+nnbxM//wWv8O/56S8JAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAnfQPuQgV9cnTEJQAAAABJRU5ErkJggg==';
        img.onerror = null;
        
        // Remove loading class if it exists
        if (img.parentNode) {
            img.parentNode.classList.remove('loading');
        }
    };
}

/**
 * Display dice roll results with enhanced animation
 */
function displayResults(results, total, container) {
    if (results.length === 0) {
        container.innerHTML = '<p>Please select at least one die to roll.</p>';
        return;
    }
    
    let html = '<div class="roll-details">';
    
    results.forEach(result => {
        html += `<div class="dice-result">
            <h4>${result.type} (${result.rolls.length})</h4>
            <div class="dice-values">
                ${result.rolls.map(roll => `<span class="die">${roll}</span>`).join('')}
            </div>
            <p>Sum: ${result.sum}</p>
        </div>`;
    });
    
    html += `<div class="roll-total">
        <h3>Total: ${total}</h3>
    </div>`;
    
    html += '</div>';
    
    // Use fade-out/fade-in animation for better effect
    container.classList.add('fade-out');
    
    setTimeout(() => {
        container.innerHTML = html;
        container.classList.remove('fade-out');
        container.classList.add('fade-in');
        
        // Add animation to the dice
        const diceElements = container.querySelectorAll('.die');
        diceElements.forEach((die, index) => {
            die.style.animationDelay = `${index * 0.05}s`;
            die.classList.add('roll-in');
            
            // Add glow effect based on value
            const value = parseInt(die.textContent);
            const sides = result ? parseInt(result.type.substring(1)) : 20;
            
            if (value === 20 || value === sides) {
                die.classList.add('critical-success');
            } else if (value === 1) {
                die.classList.add('critical-fail');
            }
        });
        
        setTimeout(() => {
            container.classList.remove('fade-in');
        }, 1000);
    }, 300);
}

/**
 * Character Quiz Functionality
 * This will be implemented on the tools.html page
 */
function initializeCharacterQuiz() {
    // This will be implemented in a separate file
    console.log('Character Quiz Ready');
}

/**
 * Interactive Map Functionality
 * This will be implemented on the tools.html page
 */
function initializeInteractiveMap() {
    // This will be implemented in a separate file
    console.log('Interactive Map Ready');
}

// Make these functions globally available
window.enhanceVideoThumbnails = enhanceVideoThumbnails;
window.getBestThumbnailUrl = getBestThumbnailUrl;
window.handleThumbnailError = handleThumbnailError;