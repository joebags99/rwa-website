/**
 * Roll With Advantage - Magical Particles System
 * Creates interactive particle effects for magical atmosphere
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles after a short delay to ensure DOM is fully loaded
    setTimeout(() => {
        initializeParticles();
        initializeGlowingParticles();
        initializeEnergyLines();
    }, 500);
});

/**
 * Initialize Background Particles
 * Creates floating particle effects in the background
 */
function initializeParticles() {
    // Skip on mobile devices for better performance
    if (document.body.classList.contains('mobile-device')) return;
    
    const container = document.querySelector('.particles-container');
    if (!container) return;
    
    // Create particles with different colors based on brand palette
    const colorPalette = [
        'rgba(11, 42, 169, 0.5)',    // Primary blue
        'rgba(127, 14, 189, 0.5)',   // Primary purple
        'rgba(195, 10, 61, 0.5)',    // Primary red
        'rgba(251, 251, 215, 0.7)'   // Divine light white
    ];
    
    // Create particles
    for (let i = 0; i < 30; i++) {
        createParticle(container, colorPalette);
    }
    
    // Add mouse interaction
    document.addEventListener('mousemove', (e) => {
        if (Math.random() < 0.1) { // Only create particles occasionally for better performance
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            // Create a particle at mouse position
            createMouseParticle(mouseX, mouseY, colorPalette);
        }
    });
}

/**
 * Create a floating background particle
 */
function createParticle(container, colorPalette) {
    const particle = document.createElement('div');
    particle.className = 'magic-particle';
    
    // Random properties
    const size = Math.random() * 5 + 2; // 2-7px
    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    const posX = Math.random() * 100; // 0-100%
    const posY = Math.random() * 100; // 0-100%
    const duration = Math.random() * 50 + 30; // 30-80s
    const delay = Math.random() * 5; // 0-5s
    
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
        filter: blur(1px);
        box-shadow: 0 0 ${size * 2}px ${color};
        animation: floatParticle ${duration}s ease-in-out ${delay}s infinite;
        z-index: -1;
        pointer-events: none;
    `;
    
    container.appendChild(particle);
    
    // Create animation keyframes dynamically
    const keyframes = `
    @keyframes floatParticle {
        0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0;
        }
        25% {
            opacity: ${Math.random() * 0.3 + 0.1};
        }
        50% {
            transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(180deg);
            opacity: ${Math.random() * 0.5 + 0.2};
        }
        75% {
            opacity: ${Math.random() * 0.3 + 0.1};
        }
        100% {
            transform: translate(0, 0) rotate(360deg);
            opacity: 0;
        }
    }`;
    
    // Add keyframes to document
    if (!document.querySelector('#particle-keyframes')) {
        const style = document.createElement('style');
        style.id = 'particle-keyframes';
        style.innerHTML = keyframes;
        document.head.appendChild(style);
    }
}

/**
 * Create a particle at mouse position for interactive effect
 */
function createMouseParticle(x, y, colorPalette) {
    const particle = document.createElement('div');
    particle.className = 'mouse-particle';
    
    // Random properties
    const size = Math.random() * 8 + 4; // 4-12px
    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    const angle = Math.random() * 360; // 0-360 degrees
    const distance = Math.random() * 100 + 50; // 50-150px
    const duration = Math.random() * 2 + 1; // 1-3s
    
    // Calculate end position
    const radians = angle * (Math.PI / 180);
    const endX = x + Math.cos(radians) * distance;
    const endY = y + Math.sin(radians) * distance;
    
    // Apply styles
    particle.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        left: ${x}px;
        top: ${y}px;
        opacity: ${Math.random() * 0.5 + 0.2};
        filter: blur(1px);
        box-shadow: 0 0 ${size * 2}px ${color};
        pointer-events: none;
        z-index: 9999;
        transition: all ${duration}s ease-out;
    `;
    
    document.body.appendChild(particle);
    
    // Animate to end position
    setTimeout(() => {
        particle.style.left = `${endX}px`;
        particle.style.top = `${endY}px`;
        particle.style.opacity = '0';
        particle.style.width = `${size / 2}px`;
        particle.style.height = `${size / 2}px`;
        
        // Remove particle after animation completes
        setTimeout(() => {
            particle.remove();
        }, duration * 1000);
    }, 10);
}

/**
 * Initialize Glowing Particles
 * Creates animated glowing particles in specific sections
 */
function initializeGlowingParticles() {
    if (document.body.classList.contains('mobile-device')) return;
    
    const glowContainers = document.querySelectorAll('.glowing-particles');
    
    glowContainers.forEach(container => {
        // Create particles
        for (let i = 0; i < 20; i++) {
            createGlowingParticle(container);
        }
    });
}

/**
 * Create a glowing particle for sections with magical effects
 */
function createGlowingParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'glow-particle';
    
    // Random properties
    const size = Math.random() * 10 + 5; // 5-15px
    const posX = Math.random() * 100; // 0-100%
    const posY = Math.random() * 100; // 0-100%
    const duration = Math.random() * 10 + 5; // 5-15s
    const delay = Math.random() * 5; // 0-5s
    
    // Get primary colors
    const colors = [
        'rgba(251, 251, 215, 0.7)', // Divine light white
        'rgba(11, 42, 169, 0.5)',   // Primary blue
        'rgba(127, 14, 189, 0.5)',  // Primary purple
        'rgba(195, 10, 61, 0.5)'    // Primary red
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
        animation: glowParticle ${duration}s ease-in-out ${delay}s infinite;
        z-index: 1;
        pointer-events: none;
    `;
    
    container.appendChild(particle);
    
    // Create animation keyframes dynamically
    const keyframes = `
    @keyframes glowParticle {
        0% {
            transform: scale(0) translate(0, 0);
            opacity: 0;
        }
        25% {
            opacity: ${Math.random() * 0.5 + 0.3};
            transform: scale(${Math.random() * 0.5 + 0.8}) translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px);
        }
        50% {
            opacity: ${Math.random() * 0.7 + 0.3};
            transform: scale(${Math.random() * 0.5 + 1}) translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px);
        }
        75% {
            opacity: ${Math.random() * 0.5 + 0.3};
            transform: scale(${Math.random() * 0.5 + 0.8}) translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px);
        }
        100% {
            transform: scale(0) translate(0, 0);
            opacity: 0;
        }
    }`;
    
    // Add keyframes to document
    if (!document.querySelector('#glow-keyframes')) {
        const style = document.createElement('style');
        style.id = 'glow-keyframes';
        style.innerHTML = keyframes;
        document.head.appendChild(style);
    }
}

/**
 * Initialize Energy Lines
 * Creates animated energy line effects for specific sections
 */
function initializeEnergyLines() {
    if (document.body.classList.contains('mobile-device')) return;
    
    const energyContainers = document.querySelectorAll('.energy-lines');
    
    energyContainers.forEach(container => {
        // Create vertical lines
        for (let i = 0; i < 8; i++) {
            createEnergyLine(container, 'vertical');
        }
        
        // Create horizontal lines
        for (let i = 0; i < 8; i++) {
            createEnergyLine(container, 'horizontal');
        }
    });
}

/**
 * Create an energy line for the DM Advice section
 */
function createEnergyLine(container, direction) {
    const line = document.createElement('div');
    line.className = `energy-line ${direction}`;
    
    // Random properties
    const position = Math.random() * 100; // 0-100%
    const width = direction === 'vertical' ? Math.random() * 1 + 0.5 : Math.random() * 100 + 100; // 0.5-1.5px for vertical, 100-200px for horizontal
    const height = direction === 'horizontal' ? Math.random() * 1 + 0.5 : Math.random() * 100 + 100; // 0.5-1.5px for horizontal, 100-200px for vertical
    const duration = Math.random() * 5 + 3; // 3-8s
    const delay = Math.random() * 5; // 0-5s
    
    // Get primary colors
    const colors = [
        'rgba(11, 42, 169, 0.2)',   // Primary blue
        'rgba(127, 14, 189, 0.2)',  // Primary purple
    ];
    
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Apply styles
    if (direction === 'vertical') {
        line.style.cssText = `
            position: absolute;
            width: ${width}px;
            height: ${height}px;
            background: ${color};
            left: ${position}%;
            top: ${Math.random() * 50}%;
            box-shadow: 0 0 10px ${color};
            animation: moveVertical ${duration}s ease-in-out ${delay}s infinite;
            z-index: 0;
            pointer-events: none;
        `;
    } else {
        line.style.cssText = `
            position: absolute;
            width: ${width}px;
            height: ${height}px;
            background: ${color};
            left: ${Math.random() * 50}%;
            top: ${position}%;
            box-shadow: 0 0 10px ${color};
            animation: moveHorizontal ${duration}s ease-in-out ${delay}s infinite;
            z-index: 0;
            pointer-events: none;
        `;
    }
    
    container.appendChild(line);
    
    // Create animation keyframes dynamically
    if (!document.querySelector('#energy-keyframes')) {
        const keyframes = `
        @keyframes moveVertical {
            0% {
                transform: translateY(-100%) scaleY(1);
                opacity: 0;
            }
            50% {
                opacity: 1;
                transform: translateY(100%) scaleY(1.5);
            }
            100% {
                transform: translateY(300%) scaleY(1);
                opacity: 0;
            }
        }
        
        @keyframes moveHorizontal {
            0% {
                transform: translateX(-100%) scaleX(1);
                opacity: 0;
            }
            50% {
                opacity: 1;
                transform: translateX(100%) scaleX(1.5);
            }
            100% {
                transform: translateX(300%) scaleX(1);
                opacity: 0;
            }
        }`;
        
        const style = document.createElement('style');
        style.id = 'energy-keyframes';
        style.innerHTML = keyframes;
        document.head.appendChild(style);
    }
}

/**
 * Create floating magical elements for specific sections
 * This is called from the main.js file when needed
 */
function createMagicalElements(container, type, count = 5) {
    if (!container || document.body.classList.contains('mobile-device')) return;
    
    // Different element types
    const types = {
        sparkle: {
            className: 'magical-sparkle',
            size: () => Math.random() * 10 + 5, // 5-15px
            color: () => {
                const colors = [
                    'rgba(251, 251, 215, 0.7)', // Divine light white
                    'rgba(255, 215, 0, 0.7)',   // Gold
                    'rgba(127, 14, 189, 0.5)',  // Primary purple
                ];
                return colors[Math.floor(Math.random() * colors.length)];
            },
            animation: 'sparkle'
        },
        orb: {
            className: 'magical-orb',
            size: () => Math.random() * 20 + 10, // 10-30px
            color: () => {
                const colors = [
                    'rgba(11, 42, 169, 0.3)',   // Primary blue
                    'rgba(127, 14, 189, 0.3)',  // Primary purple
                    'rgba(195, 10, 61, 0.3)'    // Primary red
                ];
                return colors[Math.floor(Math.random() * colors.length)];
            },
            animation: 'float'
        },
        rune: {
            className: 'magical-rune',
            size: () => Math.random() * 15 + 10, // 10-25px
            color: () => {
                const colors = [
                    'rgba(251, 251, 215, 0.5)', // Divine light white
                    'rgba(127, 14, 189, 0.4)',  // Primary purple
                ];
                return colors[Math.floor(Math.random() * colors.length)];
            },
            animation: 'pulse'
        }
    };
    
    // Set default type if not valid
    if (!types[type]) type = 'sparkle';
    
    // Create elements
    for (let i = 0; i < count; i++) {
        const element = document.createElement('div');
        element.className = types[type].className;
        
        // Random properties
        const size = types[type].size();
        const color = types[type].color();
        const posX = Math.random() * 100; // 0-100%
        const posY = Math.random() * 100; // 0-100%
        const duration = Math.random() * 8 + 4; // 4-12s
        const delay = Math.random() * 5; // 0-5s
        
        // Apply styles
        element.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            left: ${posX}%;
            top: ${posY}%;
            opacity: 0;
            filter: blur(${size * 0.15}px);
            box-shadow: 0 0 ${size}px ${color};
            animation: ${types[type].animation}Animation ${duration}s ease-in-out ${delay}s infinite;
            z-index: 1;
            pointer-events: none;
        `;
        
        // Add rune symbol if rune type
        if (type === 'rune') {
            const symbols = ['✧', '✦', '✴', '✵', '✶', '✷', '✸', '✹'];
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            element.innerHTML = `<span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: ${size * 0.7}px;">${symbol}</span>`;
        }
        
        container.appendChild(element);
    }
    
    // Create animation keyframes if they don't exist
    if (!document.querySelector('#magical-keyframes')) {
        const keyframes = `
        @keyframes sparkleAnimation {
            0%, 100% {
                transform: scale(0) rotate(0deg);
                opacity: 0;
            }
            20%, 80% {
                opacity: 1;
            }
            50% {
                transform: scale(1) rotate(180deg);
            }
        }
        
        @keyframes floatAnimation {
            0% {
                transform: translateY(0) scale(0.8);
                opacity: 0;
            }
            25% {
                opacity: 0.8;
            }
            50% {
                transform: translateY(-30px) scale(1);
            }
            75% {
                opacity: 0.8;
            }
            100% {
                transform: translateY(0) scale(0.8);
                opacity: 0;
            }
        }
        
        @keyframes pulseAnimation {
            0%, 100% {
                transform: scale(0.7);
                opacity: 0;
            }
            50% {
                transform: scale(1);
                opacity: 0.8;
            }
        }`;
        
        const style = document.createElement('style');
        style.id = 'magical-keyframes';
        style.innerHTML = keyframes;
        document.head.appendChild(style);
    }
}

// Make the function available globally
window.createMagicalElements = createMagicalElements;