/**
 * Roll With Advantage - Dice Roller
 * An interactive dice roller for D&D and other tabletop RPGs
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeDiceRoller();
});

/**
 * Initialize the dice roller functionality
 */
function initializeDiceRoller() {
    // Get DOM elements
    const selectedDiceArea = document.getElementById('selected-dice-area');
    const diceAnimationArea = document.getElementById('dice-animation-area');
    const diceOptions = document.querySelectorAll('.dice-option');
    const increaseButtons = document.querySelectorAll('.counter-increase');
    const decreaseButtons = document.querySelectorAll('.counter-decrease');
    const rollButton = document.getElementById('roll-btn');
    const clearButton = document.getElementById('clear-btn');
    const resultsArea = document.getElementById('dice-results');
    const modifierInput = document.getElementById('modifier');
    const increaseModifier = document.getElementById('increase-modifier');
    const decreaseModifier = document.getElementById('decrease-modifier');
    const presetButtons = document.querySelectorAll('.preset-roll');
    const historyList = document.getElementById('roll-history');
    const clearHistoryButton = document.getElementById('clear-history-btn');
    
    // Audio elements
    const diceRollSound = document.getElementById('dice-roll-sound');
    const diceClickSound = document.getElementById('dice-click-sound');
    const successSound = document.getElementById('success-sound');
    
    // State variables
    let selectedDice = {
        d4: 0,
        d6: 0,
        d8: 0,
        d10: 0,
        d12: 0,
        d20: 0,
        d100: 0
    };
    
    let rollHistory = [];
    
    // Load history from localStorage if available
    if (localStorage.getItem('diceRollHistory')) {
        try {
            rollHistory = JSON.parse(localStorage.getItem('diceRollHistory'));
            renderHistory();
        } catch (e) {
            console.error('Error loading dice roll history:', e);
        }
    }
    
    // Initialize with empty results message
    resultsArea.innerHTML = `
        <div class="roll-message">
            <p>Select dice and click "Roll Dice" to see your results</p>
        </div>
    `;
    
    // Add event listeners for dice options
    diceOptions.forEach(option => {
        option.addEventListener('click', function() {
            const diceType = this.getAttribute('data-dice');
            addDie(diceType);
        });
    });
    
    // Add event listeners for counter buttons
    increaseButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering the parent click
            const diceType = this.getAttribute('data-dice');
            addDie(diceType);
        });
    });
    
    decreaseButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering the parent click
            const diceType = this.getAttribute('data-dice');
            removeDie(diceType);
        });
    });
    
    // Roll button
    rollButton.addEventListener('click', function() {
        rollDice();
    });
    
    // Clear button
    clearButton.addEventListener('click', function() {
        clearDice();
    });
    
    // Modifier buttons
    increaseModifier.addEventListener('click', function() {
        const currentValue = parseInt(modifierInput.value) || 0;
        if (currentValue < 20) {
            modifierInput.value = currentValue + 1;
        }
    });
    
    decreaseModifier.addEventListener('click', function() {
        const currentValue = parseInt(modifierInput.value) || 0;
        if (currentValue > -20) {
            modifierInput.value = currentValue - 1;
        }
    });
    
    // Preset roll buttons
    presetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const presetType = this.getAttribute('data-preset');
            applyPreset(presetType);
        });
    });
    
    // Clear history button
    clearHistoryButton.addEventListener('click', function() {
        clearHistory();
    });
    
    /**
     * Add a die to the selected dice
     * @param {string} diceType - The type of die (d4, d6, etc.)
     */
    function addDie(diceType) {
        // Play click sound
        if (diceClickSound) {
            diceClickSound.currentTime = 0;
            diceClickSound.play().catch(e => console.log('Error playing sound:', e));
        }
        
        // Update count
        selectedDice[diceType]++;
        updateDiceDisplay();
        updateCounters();
    }
    
    /**
     * Remove a die from the selected dice
     * @param {string} diceType - The type of die (d4, d6, etc.)
     */
    function removeDie(diceType) {
        if (selectedDice[diceType] > 0) {
            // Play click sound
            if (diceClickSound) {
                diceClickSound.currentTime = 0;
                diceClickSound.play().catch(e => console.log('Error playing sound:', e));
            }
            
            // Update count
            selectedDice[diceType]--;
            updateDiceDisplay();
            updateCounters();
        }
    }
    
    /**
     * Update the display of selected dice
     */
    function updateDiceDisplay() {
        // Check if there are any dice selected
        const hasDice = Object.values(selectedDice).some(count => count > 0);
        
        if (!hasDice) {
            selectedDiceArea.innerHTML = `
                <div class="no-dice-message">
                    <p>Select dice from below to add them to your roll</p>
                    <i class="fas fa-arrow-down animated-arrow"></i>
                </div>
            `;
            return;
        }
        
        // Clear the area first
        selectedDiceArea.innerHTML = '';
        
        // Add a die element for each selected die
        Object.entries(selectedDice).forEach(([diceType, count]) => {
            if (count > 0) {
                // Create ONE element per die type with a count indicator
                const dieElement = document.createElement('div');
                dieElement.className = `selected-die ${diceType}`;
                dieElement.setAttribute('data-type', diceType);
                
                // Add count indicator only if count > 1
                if (count > 1) {
                    const countDisplay = document.createElement('div');
                    countDisplay.className = 'die-count';
                    countDisplay.textContent = count;
                    dieElement.appendChild(countDisplay);
                }
                
                // Add click handler to remove die
                dieElement.addEventListener('click', () => removeDie(diceType));
                
                selectedDiceArea.appendChild(dieElement);
            }
        });
    }
    
    /**
     * Update the counter displays
     */
    function updateCounters() {
        Object.entries(selectedDice).forEach(([diceType, count]) => {
            const counter = document.getElementById(`${diceType}-counter`);
            if (counter) {
                counter.textContent = count;
            }
        });
        
        // Update the dice options to show selection state
        diceOptions.forEach(option => {
            const diceType = option.getAttribute('data-dice');
            if (selectedDice[diceType] > 0) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }
    
    /**
     * Roll the selected dice
     */
    function rollDice() {
        // Check if there are any dice selected
        const hasDice = Object.values(selectedDice).some(count => count > 0);
        
        if (!hasDice) {
            resultsArea.innerHTML = `
                <div class="roll-message">
                    <p>Please select at least one die to roll</p>
                </div>
            `;
            return;
        }
        
        // Add rolling animation to button
        rollButton.classList.add('rolling');
        
        // Play rolling sound
        if (diceRollSound) {
            diceRollSound.currentTime = 0;
            diceRollSound.play().catch(e => console.log('Error playing sound:', e));
        }
        
        // Clear the animation area first
        diceAnimationArea.innerHTML = '';
        
        // Prepare results
        let results = [];
        let total = 0;
        
        // Roll each type of die and show animation
        Object.entries(selectedDice).forEach(([diceType, count]) => {
            if (count > 0) {
                const sides = parseInt(diceType.substring(1));
                const rolls = rollDiceType(count, sides);
                
                // Create animated dice for each roll
                rolls.forEach(rollValue => {
                    const animatedDie = document.createElement('div');
                    animatedDie.className = `rolling-die ${diceType}`;
                    animatedDie.setAttribute('data-value', rollValue);
                    animatedDie.setAttribute('data-sides', sides);
                    
                    diceAnimationArea.appendChild(animatedDie);
                });
                
                results.push({
                    type: diceType,
                    rolls: rolls,
                    sum: rolls.reduce((a, b) => a + b, 0)
                });
                total += rolls.reduce((a, b) => a + b, 0);
            }
        });
        
        // Add modifier
        const modifier = parseInt(modifierInput.value) || 0;
        total += modifier;
        
        // Create a roll record for history
        const rollRecord = {
            timestamp: new Date(),
            dice: { ...selectedDice },
            results: results,
            modifier: modifier,
            total: total
        };
        
        // Add to history
        rollHistory.unshift(rollRecord);
        if (rollHistory.length > 20) {
            rollHistory.pop(); // Keep only the last 20 rolls
        }
        
        // Save to localStorage
        saveHistory();
        
        // Update history display
        renderHistory();
        
        // Store current dice selection before clearing
        const previousDice = { ...selectedDice };
        
        // Clear selected dice after rolling (but keep the results displayed)
        Object.keys(selectedDice).forEach(key => {
            selectedDice[key] = 0;
        });
        updateCounters();
        updateDiceDisplay();
        
        // Delay display for animation
        setTimeout(() => {
            displayRollResults(results, total, modifier);
            rollButton.classList.remove('rolling');
            
            // Play success sound for high rolls (natural 20)
            const hasNatural20 = results.some(result => 
                result.type === 'd20' && result.rolls.includes(20)
            );
            
            if (hasNatural20 && successSound) {
                successSound.currentTime = 0;
                successSound.play().catch(e => console.log('Error playing sound:', e));
            }
        }, 1500);
    }
    
    /**
     * Roll a specific number of dice with a given number of sides
     * @param {number} count - Number of dice to roll
     * @param {number} sides - Number of sides on each die
     * @returns {number[]} Array of roll results
     */
    function rollDiceType(count, sides) {
        const results = [];
        for (let i = 0; i < count; i++) {
            results.push(Math.floor(Math.random() * sides) + 1);
        }
        return results;
    }
    
    /**
     * Display the roll results
     * @param {Array} results - Array of roll results
     * @param {number} total - Total of all rolls
     * @param {number} modifier - The modifier value
     */
    function displayRollResults(results, total, modifier) {
        resultsArea.classList.add('has-results');
        
        let html = '<div class="roll-details">';
        
        results.forEach(result => {
            const diceType = result.type;
            const sides = parseInt(diceType.substring(1));
            
            html += `<div class="dice-result">
                <h4>${result.type.toUpperCase()} (${result.rolls.length})</h4>
                <div class="dice-values">
                    ${result.rolls.map(roll => {
                        let classes = 'die';
                        // Mark critical successes (max value) and critical fails (1 on d20)
                        if (roll === sides) {
                            classes += ' critical-success';
                        } else if (diceType === 'd20' && roll === 1) {
                            classes += ' critical-fail';
                        }
                        return `<span class="${classes}">${roll}</span>`;
                    }).join('')}
                </div>
                <p>Sum: ${result.sum}</p>
            </div>`;
        });
        
        // Show modifier if not zero
        if (modifier !== 0) {
            html += `<div class="dice-result">
                <h4>MODIFIER</h4>
                <div class="dice-values">
                    <span class="die" style="background-color: var(--primary-purple);">${modifier > 0 ? '+' + modifier : modifier}</span>
                </div>
                <p>Modifier: ${modifier > 0 ? '+' + modifier : modifier}</p>
            </div>`;
        }
        
        html += `<div class="roll-total">
            <h3>Total: ${total}</h3>
        </div>`;
        
        html += '</div>';
        
        // Use fade-out/fade-in animation
        resultsArea.classList.add('fade-out');
        
        setTimeout(() => {
            resultsArea.innerHTML = html;
            resultsArea.classList.remove('fade-out');
            resultsArea.classList.add('fade-in');
            
            // Add animation to the dice
            const diceElements = resultsArea.querySelectorAll('.die');
            diceElements.forEach((die, index) => {
                die.style.animationDelay = `${index * 0.05}s`;
                die.classList.add('roll-in');
            });
            
            setTimeout(() => {
                resultsArea.classList.remove('fade-in');
            }, 1000);
        }, 300);
    }
    
    /**
     * Clear all selected dice
     */
    function clearDice() {
        // Reset all dice counts
        Object.keys(selectedDice).forEach(key => {
            selectedDice[key] = 0;
        });
        
        // Reset modifier
        modifierInput.value = 0;
        
        // Update displays
        updateDiceDisplay();
        updateCounters();
        
        // Clear animation area
        diceAnimationArea.innerHTML = '';
        
        // Reset results area
        resultsArea.classList.remove('has-results');
        resultsArea.innerHTML = `
            <div class="roll-message">
                <p>Select dice and click "Roll Dice" to see your results</p>
            </div>
        `;
    }
    
    /**
     * Apply a preset dice roll
     * @param {string} presetType - The type of preset roll
     */
    function applyPreset(presetType) {
        // Clear current dice first
        clearDice();
        
        // Apply the preset
        switch (presetType) {
            case 'attack':
                selectedDice.d20 = 1;
                break;
            case 'damage-s':
                selectedDice.d6 = 1;
                break;
            case 'damage-m':
                selectedDice.d8 = 1;
                break;
            case 'damage-l':
                selectedDice.d10 = 1;
                break;
            case 'sneak':
                selectedDice.d6 = 4;
                break;
            case 'healing':
                selectedDice.d4 = 2;
                modifierInput.value = 2;
                break;
            case 'fireball':
                selectedDice.d6 = 8;
                break;
            case 'check':
                selectedDice.d20 = 1;
                break;
            default:
                return;
        }
        
        // Update displays
        updateDiceDisplay();
        updateCounters();
        
        // Play click sound
        if (diceClickSound) {
            diceClickSound.currentTime = 0;
            diceClickSound.play().catch(e => console.log('Error playing sound:', e));
        }
    }
    
    /**
     * Render the roll history
     */
    function renderHistory() {
        if (rollHistory.length === 0) {
            historyList.innerHTML = `
                <div class="empty-history-message">
                    <p>Your roll history will appear here</p>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = '';
        
        rollHistory.forEach((record, index) => {
            // Create dice summary text
            const diceSummary = Object.entries(record.dice)
                .filter(([_, count]) => count > 0)
                .map(([type, count]) => `${count}${type}`)
                .join(' + ');
            
            // Format modifier text
            const modifierText = record.modifier !== 0 
                ? (record.modifier > 0 ? ` + ${record.modifier}` : ` ${record.modifier}`) 
                : '';
            
            // Format time
            const time = formatTime(record.timestamp);
            
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-details">
                    <div class="history-title">Roll #${rollHistory.length - index}</div>
                    <div class="history-dice">${diceSummary}${modifierText}</div>
                    <div class="history-time">${time}</div>
                </div>
                <div class="history-result">${record.total}</div>
                <button class="history-reroll" data-index="${index}">
                    <i class="fas fa-redo-alt"></i>
                </button>
            `;
            
            historyList.appendChild(historyItem);
        });
        
        // Add click handlers for reroll buttons
        document.querySelectorAll('.history-reroll').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                rerollFromHistory(index);
            });
        });
    }
    
    /**
     * Format timestamp for display
     * @param {Date|string} timestamp - The timestamp to format
     * @returns {string} Formatted time string
     */
    function formatTime(timestamp) {
        const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) {
            return 'Just now';
        } else if (diffMins < 60) {
            return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
        } else if (diffMins < 1440) {
            const hours = Math.floor(diffMins / 60);
            return `${hours} hour${hours === 1 ? '' : 's'} ago`;
        } else {
            return date.toLocaleString();
        }
    }
    
    /**
     * Re-roll dice from a history record
     * @param {number} index - Index in the history array
     */
    function rerollFromHistory(index) {
        const record = rollHistory[index];
        
        // Set the dice configuration
        selectedDice = { ...record.dice };
        
        // Set the modifier
        modifierInput.value = record.modifier;
        
        // Update displays
        updateDiceDisplay();
        updateCounters();
        
        // Scroll to the top
        window.scrollTo({
            top: selectedDiceArea.offsetTop - 100,
            behavior: 'smooth'
        });
        
        // Add highlight effect to roll button
        rollButton.classList.add('highlight');
        setTimeout(() => {
            rollButton.classList.remove('highlight');
        }, 1500);
        
        // Automatically roll after setting up the dice
        setTimeout(() => {
            rollDice();
        }, 500);
    }
    
    /**
     * Save roll history to localStorage
     */
    function saveHistory() {
        try {
            // Convert Date objects to strings for storage
            const historyForStorage = rollHistory.map(record => ({
                ...record,
                timestamp: record.timestamp.toISOString()
            }));
            
            localStorage.setItem('diceRollHistory', JSON.stringify(historyForStorage));
        } catch (e) {
            console.error('Error saving dice roll history:', e);
        }
    }
    
    /**
     * Clear the roll history
     */
    function clearHistory() {
        rollHistory = [];
        renderHistory();
        localStorage.removeItem('diceRollHistory');
    }
    
    // Create floating magical elements
    setTimeout(() => {
        if (typeof window.createMagicalElements === 'function') {
            const diceRollerContainer = document.querySelector('.dice-roller-main');
            window.createMagicalElements(diceRollerContainer, 'sparkle', 10);
        }
    }, 1000);
}

  /* You can copy this and add it to your JS file if the CSS doesn't work */
  function createVisualDie(diceType, count) {
    const dieEl = document.createElement('div');
    dieEl.className = `selected-die ${diceType}`;
    
    // Add text label as fallback
    const label = document.createElement('span');
    label.textContent = diceType.toUpperCase();
    label.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-weight:bold;';
    dieEl.appendChild(label);
    
    // Add count if needed
    if (count > 1) {
      const countEl = document.createElement('div');
      countEl.className = 'die-count';
      countEl.textContent = count;
      dieEl.appendChild(countEl);
    }
    
    return dieEl;
  }

// Enhanced function to add a die to the selected area
function addDie(diceType) {
    // Play click sound
    if (diceClickSound) {
        diceClickSound.currentTime = 0;
        diceClickSound.play().catch(e => console.log('Error playing sound:', e));
    }
    
    // Update count
    selectedDice[diceType]++;
    
    // Log the selection for debugging
    console.log(`Added ${diceType}, current count: ${selectedDice[diceType]}`);
    
    updateDiceDisplay();
    updateCounters();
}

// Improved function for rolling animation
function rollDice() {
    // Check if there are any dice selected
    const hasDice = Object.values(selectedDice).some(count => count > 0);
    
    if (!hasDice) {
        resultsArea.innerHTML = `
            <div class="roll-message">
                <p>Please select at least one die to roll</p>
            </div>
        `;
        return;
    }
    
    // Add rolling animation to button
    rollButton.classList.add('rolling');
    
    // Play rolling sound
    if (diceRollSound) {
        diceRollSound.currentTime = 0;
        diceRollSound.play().catch(e => console.log('Error playing sound:', e));
    }
    
    // Clear the animation area first
    diceAnimationArea.innerHTML = '';
    
    // Log the dice being rolled
    console.log("Rolling dice:", selectedDice);
    
    // Prepare results
    let results = [];
    let total = 0;
    
    // Roll each type of die and show animation
    Object.entries(selectedDice).forEach(([diceType, count]) => {
        if (count > 0) {
            const sides = parseInt(diceType.substring(1));
            const rolls = rollDiceType(count, sides);
            
            console.log(`Rolling ${count} ${diceType} dice: ${rolls.join(', ')}`);
            
            // Create animated dice for each roll - with a small delay between them
            rolls.forEach((rollValue, index) => {
                setTimeout(() => {
                    const animatedDie = document.createElement('div');
                    animatedDie.className = `rolling-die ${diceType}`;
                    animatedDie.setAttribute('data-value', rollValue);
                    animatedDie.setAttribute('data-sides', sides);
                    
                    diceAnimationArea.appendChild(animatedDie);
                    
                    // Log each die added to animation area
                    console.log(`Added ${diceType} with value ${rollValue} to animation area`);
                }, index * 100); // Stagger the appearance slightly
            });
            
            results.push({
                type: diceType,
                rolls: rolls,
                sum: rolls.reduce((a, b) => a + b, 0)
            });
            total += rolls.reduce((a, b) => a + b, 0);
        }
    });
    
    // Add modifier
    const modifier = parseInt(modifierInput.value) || 0;
    total += modifier;
    
    // Create a roll record for history
    const rollRecord = {
        timestamp: new Date(),
        dice: { ...selectedDice },
        results: results,
        modifier: modifier,
        total: total
    };
    
    // Add to history
    rollHistory.unshift(rollRecord);
    if (rollHistory.length > 20) {
        rollHistory.pop(); // Keep only the last 20 rolls
    }
    
    // Save to localStorage
    saveHistory();
    
    // Update history display
    renderHistory();
    
    // Store current dice selection before clearing
    const previousDice = { ...selectedDice };
    
    // Clear selected dice after rolling (but keep the results displayed)
    Object.keys(selectedDice).forEach(key => {
        selectedDice[key] = 0;
    });
    updateCounters();
    updateDiceDisplay();
    
    // Delay display for animation
    setTimeout(() => {
        displayRollResults(results, total, modifier);
        rollButton.classList.remove('rolling');
        
        // Play success sound for high rolls (natural 20)
        const hasNatural20 = results.some(result => 
            result.type === 'd20' && result.rolls.includes(20)
        );
        
        if (hasNatural20 && successSound) {
            successSound.currentTime = 0;
            successSound.play().catch(e => console.log('Error playing sound:', e));
        }
    }, 1500);
}

/**
 * Adds a 3D effect to dice on hover
 * This is automatically called by the main.js file
 */
function enhanceDiceHoverEffects() {
    const diceImages = document.querySelectorAll('.dice-image, .selected-die, .rolling-die');
    
    diceImages.forEach(die => {
        die.addEventListener('mousemove', function(e) {
            // Get position of mouse relative to die
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate rotation based on mouse position
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateY = ((x - centerX) / centerX) * 15; // Max 15 degrees
            const rotateX = ((centerY - y) / centerY) * 15; // Max 15 degrees
            
            // Apply the rotation
            this.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
        });
        
        die.addEventListener('mouseleave', function() {
            // Reset the rotation when mouse leaves
            this.style.transform = 'rotateY(0deg) rotateX(0deg)';
        });
    });
}

// Make the function globally available
window.enhanceDiceHoverEffects = enhanceDiceHoverEffects;