/**
 * Roll With Advantage - Main JavaScript
 * This file contains core functionality for the website
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeMobileMenu();
    initializeNewsletterForm();
    
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
 * Mobile Menu Toggle
 */
function initializeMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('nav ul');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Toggle menu icon
            const spans = this.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
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
 * Newsletter Form Submission
 */
function initializeNewsletterForm() {
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (validateEmail(email)) {
                // In a real implementation, you would send this to your backend or email service
                // For now, we'll just show a success message
                newsletterForm.innerHTML = '<p class="success-message">Thank you for subscribing! You\'ll receive updates soon.</p>';
            } else {
                // Show error message
                const errorMessage = document.createElement('p');
                errorMessage.classList.add('error-message');
                errorMessage.style.color = 'yellow';
                errorMessage.style.marginTop = '10px';
                errorMessage.textContent = 'Please enter a valid email address.';
                
                // Remove any existing error messages
                const existingError = newsletterForm.querySelector('.error-message');
                if (existingError) {
                    existingError.remove();
                }
                
                newsletterForm.appendChild(errorMessage);
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
 * Dice Roller Functionality
 * This will be implemented on the tools.html page
 */
function initializeDiceRoller() {
    const diceContainer = document.querySelector('.dice-roller');
    const rollButton = diceContainer.querySelector('.roll-button');
    const resultContainer = diceContainer.querySelector('.roll-result');
    const diceInputs = diceContainer.querySelectorAll('.dice-input');
    
    rollButton.addEventListener('click', function() {
        let results = [];
        let total = 0;
        
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
        
        displayResults(results, total, resultContainer);
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
 * Display dice roll results
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
    
    container.innerHTML = html;
    
    // Add animation to the dice
    const diceElements = container.querySelectorAll('.die');
    diceElements.forEach((die, index) => {
        die.style.animationDelay = `${index * 0.05}s`;
        die.classList.add('roll-in');
    });
}

/**
 * Character Quiz Functionality
 * This will be implemented on the tools.html page
 */
function initializeCharacterQuiz() {
    // This will be implemented in a separate file
}

/**
 * Interactive Map Functionality
 * This will be implemented on the tools.html page
 */
function initializeInteractiveMap() {
    // This will be implemented in a separate file
}