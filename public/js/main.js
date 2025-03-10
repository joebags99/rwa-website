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
            document.querySelector('.reveal-content').classList.add('show');
            document.querySelector('.magic-line').classList.add('animated');
        }, 300);
    });
    
    // Initialize all components
    initializeDeviceDetection();
    // Custom cursor removed
    initializeMobileMenu();
    initializeParallaxEffects();
    initializeScrollEffects();
    initializeFloatingDice();
    initializeNewsletterForm();
    initializeScrollToTop();
    initializeCardEffects();
    enhanceVideoThumbnails();
    
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
 * Custom Cursor functionality removed
 */

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
 * Initialize video preview functionality
 * Creates a larger preview when clicking on video thumbnails
 */
function enhanceVideoThumbnails() {
    // First, add the video preview container to the body
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
    const videoCards = document.querySelectorAll('.video-card');
    
    videoCards.forEach(card => {
        const thumbnail = card.querySelector('.video-thumbnail');
        if (!thumbnail) return;
        
        const img = thumbnail.querySelector('img');
        if (!img) return;
        
        const titleElement = card.querySelector('.video-info h3');
        const title = titleElement ? titleElement.textContent.trim() : 'Video Preview';
        
        // Show large preview when clicking on the thumbnail
        thumbnail.addEventListener('click', (e) => {
            e.preventDefault();
            
            const imgSrc = img.src;
            previewImage.src = imgSrc;
            previewTitle.textContent = title;
            
            // Show the preview
            previewContainer.classList.add('active');
        });
        
        // Add hover effect to show it's clickable
        thumbnail.style.cursor = 'pointer';
        
        // Add custom hover animation
        thumbnail.addEventListener('mouseenter', () => {
            const overlay = document.createElement('div');
            overlay.className = 'thumbnail-hover-overlay';
            overlay.innerHTML = '<i class="fas fa-search-plus"></i>';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 5;
            `;
            
            const icon = overlay.querySelector('i');
            icon.style.cssText = `
                font-size: 2rem;
                color: white;
                transform: scale(0.8);
                transition: transform 0.3s ease;
            `;
            
            thumbnail.appendChild(overlay);
            
            // Animate the overlay
            setTimeout(() => {
                overlay.style.opacity = '1';
                icon.style.transform = 'scale(1)';
            }, 10);
        });
        
        thumbnail.addEventListener('mouseleave', () => {
            const overlay = thumbnail.querySelector('.thumbnail-hover-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.remove();
                }, 300);
            }
        });
    });
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