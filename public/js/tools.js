/**
 * Roll With Advantage - Tools Page JavaScript
 * This file contains tools page specific functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize enhanced tool card effects
    initializeToolCardEffects();
    
    // Initialize floating elements
    initializeFloatingElements();
    
    // Initialize get started cards hover effects
    initializeGetStartedCards();
    
    // Add special animation to the action examples
    initializeActionExamples();
});

/**
 * Enhanced 3D hover effect for tool cards
 */
function initializeToolCardEffects() {
    const toolCards = document.querySelectorAll('.tool-card-lg');
    
    toolCards.forEach(card => {
        // Store original transform values
        const originalTransform = {
            transform: card.style.transform,
            boxShadow: card.style.boxShadow
        };
        
        // Add mousemove event for 3D effect
        card.addEventListener('mousemove', function(e) {
            // Get position of mouse relative to card
            const rect = card.getBoundingClientRect();
            const cardWidth = rect.width;
            const cardHeight = rect.height;
            
            // Calculate mouse position in normalized coordinates (-0.5 to 0.5)
            const xVal = (e.clientX - rect.left) / cardWidth - 0.5;
            const yVal = (e.clientY - rect.top) / cardHeight - 0.5;
            
            // Calculate rotation values (limit to small angles)
            const rotateX = -yVal * 5; // Inverted for natural feel
            const rotateY = xVal * 5;
            
            // Apply 3D transform
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            
            // Enhance shadow based on mouse position
            const shadowX = xVal * 20;
            const shadowY = yVal * 20;
            card.style.boxShadow = `
                ${shadowX}px ${shadowY}px 30px rgba(11, 42, 169, 0.2),
                0 0 20px rgba(127, 14, 189, 0.2)
            `;
            
            // Move icon and preview with mouse for parallax effect
            const icon = card.querySelector('.tool-icon');
            const preview = card.querySelector('.tool-screenshot');
            
            if (icon) {
                icon.style.transform = `translate(${xVal * 15}px, ${yVal * 15}px) scale(1.1) rotate(${xVal * 10}deg)`;
            }
            
            if (preview) {
                preview.style.transform = `scale(1.05) translate(${xVal * -20}px, ${yVal * -20}px)`;
            }
        });
        
        // Reset on mouse leave
        card.addEventListener('mouseleave', function() {
            // Return to original state
            card.style.transform = originalTransform.transform || 'perspective(1000px) rotateX(0) rotateY(0) rotateZ(0)';
            card.style.boxShadow = originalTransform.boxShadow || '';
            
            // Reset icon and preview
            const icon = card.querySelector('.tool-icon');
            const preview = card.querySelector('.tool-screenshot');
            
            if (icon) {
                icon.style.transform = '';
            }
            
            if (preview) {
                preview.style.transform = '';
            }
        });
    });
}

/**
 * Create floating magical elements on the tools page
 */
function initializeFloatingElements() {
    // Only add effects if not on mobile
    if (document.body.classList.contains('mobile-device')) return;
    
    // Create magical particles for the tools sections
    const sections = document.querySelectorAll('.section-appear');
    
    sections.forEach(section => {
        // Add magical particles container to each section
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'section-particles';
        section.prepend(particlesContainer);
        
        // Create particles
        for (let i = 0; i < 15; i++) {
            createMagicalParticle(particlesContainer);
        }
    });
    
    // Create floating dice in specific sections
    const toolsHero = document.querySelector('.tools-hero');
    if (toolsHero) {
        const diceContainer = toolsHero.querySelector('.floating-dice-container');
        if (diceContainer) {
            for (let i = 0; i < 12; i++) {
                createFloatingDie(diceContainer);
            }
        }
    }
}

/**
 * Create a magical floating particle
 */
function createMagicalParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'magical-particle';
    
    // Random properties
    const size = Math.random() * 8 + 3; // 3-11px
    const posX = Math.random() * 100; // 0-100%
    const posY = Math.random() * 100; // 0-100%
    const duration = Math.random() * 30 + 15; // 15-45s
    const delay = Math.random() * 15; // 0-15s
    
    // Color based on brand palette
    const colors = [
        'rgba(11, 42, 169, 0.3)',  // Primary blue
        'rgba(127, 14, 189, 0.3)', // Primary purple
        'rgba(195, 10, 61, 0.3)',  // Primary red
        'rgba(251, 251, 215, 0.5)' // Divine light white
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Apply styles
    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        left: ${posX}%;
        top: ${posY}%;
        opacity: 0;
        filter: blur(2px);
        box-shadow: 0 0 ${size * 2}px ${color};
        z-index: -1;
        pointer-events: none;
    `;
    
    // Add animation
    particle.style.animation = `floatParticle ${duration}s ease-in-out ${delay}s infinite`;
    
    container.appendChild(particle);
}

/**
 * Create a floating die
 */
function createFloatingDie(container) {
    const die = document.createElement('div');
    die.className = 'floating-dice';
    
    // Random properties
    const diceTypes = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];
    const diceType = diceTypes[Math.floor(Math.random() * diceTypes.length)];
    die.classList.add(diceType);
    
    const size = Math.random() * 30 + 30; // 30-60px
    const posX = Math.random() * 100; // 0-100%
    const posY = Math.random() * 100; // 0-100%
    const delay = Math.random() * 5; // 0-5s
    const duration = Math.random() * 10 + 15; // 15-25s
    const rotation = Math.random() * 360; // 0-360 degrees
    
    // Apply styles
    die.style.width = `${size}px`;
    die.style.height = `${size}px`;
    die.style.left = `${posX}%`;
    die.style.top = `${posY}%`;
    die.style.transform = `rotate(${rotation}deg)`;
    die.style.animationDelay = `${delay}s`;
    die.style.animationDuration = `${duration}s`;
    
    container.appendChild(die);
}

/**
 * Initialize hover effects for "Get Started" cards
 */
function initializeGetStartedCards() {
    const cards = document.querySelectorAll('.get-started-card');
    
    cards.forEach((card, index) => {
        // Add hover effect with staggered delay
        card.addEventListener('mouseenter', function() {
            setTimeout(() => {
                // Create magical sparkle effect
                for (let i = 0; i < 5; i++) {
                    createSparkle(card);
                }
            }, index * 100);
        });
    });
}

/**
 * Create sparkle animation for Get Started cards
 */
function createSparkle(parent) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    
    // Random position within the element
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const size = Math.random() * 8 + 4; // 4-12px
    
    // Random colors based on brand palette
    const colors = [
        'rgba(11, 42, 169, 0.8)',  // Primary blue
        'rgba(127, 14, 189, 0.8)', // Primary purple
        'rgba(195, 10, 61, 0.8)',  // Primary red
        'rgba(251, 251, 215, 0.9)' // Divine light white
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Apply styles
    sparkle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        left: ${posX}%;
        top: ${posY}%;
        pointer-events: none;
        z-index: 10;
        box-shadow: 0 0 ${size * 2}px ${color};
        animation: sparkleAnim 1s ease-out forwards;
    `;
    
    parent.appendChild(sparkle);
    
    // Remove sparkle after animation completes
    setTimeout(() => {
        sparkle.remove();
    }, 1000);
}

/**
 * Initialize scroll animation for action examples
 */
function initializeActionExamples() {
    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('action-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    // Observe each action example
    const examples = document.querySelectorAll('.action-example');
    examples.forEach((example, index) => {
        // Add staggered animation class
        example.style.transitionDelay = `${index * 0.2}s`;
        observer.observe(example);
    });
}

// Add global sparkle animation
if (!document.querySelector('#sparkle-keyframes')) {
    const style = document.createElement('style');
    style.id = 'sparkle-keyframes';
    style.innerHTML = `
        @keyframes sparkleAnim {
            0% {
                transform: scale(0) rotate(0deg);
                opacity: 0;
            }
            50% {
                opacity: 1;
            }
            100% {
                transform: scale(1.5) rotate(90deg);
                opacity: 0;
            }
        }
        
        @keyframes floatParticle {
            0% {
                transform: translate(0, 0) rotate(0deg);
                opacity: 0;
            }
            25% {
                opacity: 0.8;
            }
            50% {
                transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px) rotate(180deg);
                opacity: 1;
            }
            75% {
                opacity: 0.8;
            }
            100% {
                transform: translate(0, 0) rotate(360deg);
                opacity: 0;
            }
        }
        
        .action-example {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .action-example.action-visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        .section-particles {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Handle special effects for the mini dice in tool previews
 */
document.addEventListener('mousemove', function(e) {
    const diceSet = document.querySelector('.mini-dice-set');
    if (!diceSet) return;
    
    // Get parent container position
    const container = diceSet.closest('.tool-preview-lg');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    
    // Check if mouse is over the container
    if (
        e.clientX >= rect.left && 
        e.clientX <= rect.right && 
        e.clientY >= rect.top && 
        e.clientY <= rect.bottom
    ) {
        // Get all dice in the set
        const dice = diceSet.querySelectorAll('.mini-die');
        
        // Calculate mouse position relative to container
        const relX = (e.clientX - rect.left) / rect.width;
        const relY = (e.clientY - rect.top) / rect.height;
        
        // Move each die slightly based on mouse position
        dice.forEach((die, index) => {
            const offsetX = (relX - 0.5) * 30 * (index % 3 + 1);
            const offsetY = (relY - 0.5) * 30 * (index % 2 + 1);
            
            die.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${offsetX + offsetY}deg)`;
        });
    } else {
        // Reset positions when mouse leaves container
        const dice = diceSet.querySelectorAll('.mini-die');
        dice.forEach(die => {
            die.style.transform = '';
        });
    }
});

// Make functions globally available
window.createMagicalParticle = createMagicalParticle;
window.createFloatingDie = createFloatingDie;
window.createSparkle = createSparkle;