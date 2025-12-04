/**
 * D&D Beyond Character Importer Bookmarklet
 *
 * This bookmarklet extracts character data from D&D Beyond character sheets
 * and sends it to your Roll With Advantage website.
 *
 * Installation:
 * 1. Create a new bookmark in your browser
 * 2. Copy the minified code from the admin panel
 * 3. Paste it as the URL of the bookmark
 * 4. Visit a D&D Beyond character sheet
 * 5. Click the bookmark to import the character
 */

(function() {
    'use strict';

    // Configuration - Update this with your website URL
    const API_ENDPOINT = window.location.origin + '/admin/api/characters/import-from-dndbeyond';

    // Check if we're on a D&D Beyond character sheet
    if (!window.location.hostname.includes('dndbeyond.com') || !window.location.pathname.includes('/characters/')) {
        alert('⚠️ Please navigate to a D&D Beyond character sheet first!');
        return;
    }

    // Helper function to safely get text content
    function getText(selector, defaultValue = '') {
        const element = document.querySelector(selector);
        return element ? element.textContent.trim() : defaultValue;
    }

    // Helper function to safely get attribute
    function getAttribute(selector, attribute, defaultValue = '') {
        const element = document.querySelector(selector);
        return element ? element.getAttribute(attribute) || defaultValue : defaultValue;
    }

    // Helper function to parse number from text
    function parseNumber(text) {
        const match = text.match(/-?\d+/);
        return match ? parseInt(match[0], 10) : 0;
    }

    // Helper function to parse modifier
    function parseModifier(text) {
        const match = text.match(/([+-]?\d+)/);
        return match ? parseInt(match[1], 10) : 0;
    }

    console.log('🎲 D&D Beyond Character Importer - Starting extraction...');

    try {
        // Extract basic character info
        const characterData = {
            name: getText('.ddbc-character-name'),
            player: '', // D&D Beyond doesn't show player name on sheet
            race: getText('.ddbc-character-summary__race'),
            classes: [],
            level: 0,
            xp: 0,

            // Ability Scores
            abilities: {
                strength: { score: 0, modifier: 0 },
                dexterity: { score: 0, modifier: 0 },
                constitution: { score: 0, modifier: 0 },
                intelligence: { score: 0, modifier: 0 },
                wisdom: { score: 0, modifier: 0 },
                charisma: { score: 0, modifier: 0 }
            },

            // Combat Stats
            hp: { current: 0, max: 0, temp: 0 },
            ac: 0,
            proficiencyBonus: 0,
            initiative: 0,
            speed: 0,

            // Skills
            skills: [],
            proficiencies: [],

            // Equipment & Inventory
            equipment: [],
            currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },

            // Features & Traits
            features: [],

            // Spells
            spells: [],
            spellSlots: {},

            // Avatar
            avatarUrl: '',

            // Metadata
            importDate: new Date().toISOString(),
            source: 'dndbeyond'
        };

        // Extract character name and race
        console.log('📝 Character Name:', characterData.name);
        console.log('🧝 Race:', characterData.race);

        // Extract classes and level
        const classInfo = getText('.ddbc-character-summary__classes');
        if (classInfo) {
            // Parse "Class Level / Class Level" format
            const classMatches = classInfo.matchAll(/(\w+(?:\s\w+)?)\s+(\d+)/g);
            for (const match of classMatches) {
                characterData.classes.push({
                    name: match[1],
                    level: parseInt(match[2], 10),
                    subclass: '' // Will be extracted from features if available
                });
                characterData.level += parseInt(match[2], 10);
            }
        }
        console.log('⚔️ Classes:', characterData.classes);
        console.log('📊 Total Level:', characterData.level);

        // Extract XP
        const xpText = getText('.ddbc-xp-bar__label');
        if (xpText) {
            const xpMatch = xpText.match(/(\d+)\s*\/\s*(\d+)/);
            if (xpMatch) {
                characterData.xp = parseInt(xpMatch[1], 10);
            }
        }

        // Extract ability scores
        const abilityNames = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        document.querySelectorAll('.ddbc-ability-summary').forEach((ability, index) => {
            if (index < abilityNames.length) {
                const abilityName = abilityNames[index];
                const score = parseNumber(getText('.ddbc-ability-summary__primary .ddbc-signed-number__number', ability));
                const modifier = parseModifier(getText('.ddbc-ability-summary__secondary', ability));

                characterData.abilities[abilityName] = {
                    score: score,
                    modifier: modifier
                };
            }
        });
        console.log('💪 Abilities extracted:', characterData.abilities);

        // Extract HP
        const hpCurrent = parseNumber(getText('.ct-health-summary__hp-current'));
        const hpMax = parseNumber(getText('.ct-health-summary__hp-max'));
        const hpTemp = parseNumber(getText('.ct-health-summary__hp-temp'));
        characterData.hp = { current: hpCurrent, max: hpMax, temp: hpTemp };
        console.log('❤️ HP:', characterData.hp);

        // Extract AC
        characterData.ac = parseNumber(getText('.ddbc-armor-class-box__value'));
        console.log('🛡️ AC:', characterData.ac);

        // Extract Initiative
        characterData.initiative = parseModifier(getText('.ddbc-initiative-box__value'));
        console.log('⚡ Initiative:', characterData.initiative);

        // Extract Speed
        characterData.speed = parseNumber(getText('.ddbc-speed-box__value'));
        console.log('🏃 Speed:', characterData.speed);

        // Calculate proficiency bonus (based on level)
        characterData.proficiencyBonus = Math.floor((characterData.level - 1) / 4) + 2;
        console.log('✨ Proficiency Bonus:', characterData.proficiencyBonus);

        // Extract Skills
        document.querySelectorAll('.ct-skills__item').forEach(skillElement => {
            const skillName = getText('.ct-skills__col--skill', skillElement);
            const skillModifier = parseModifier(getText('.ct-skills__col--modifier', skillElement));
            const isProficient = skillElement.classList.contains('ct-skills__item--proficient');

            if (skillName) {
                characterData.skills.push({
                    name: skillName,
                    modifier: skillModifier,
                    proficient: isProficient
                });
            }
        });
        console.log('🎯 Skills:', characterData.skills.length, 'skills extracted');

        // Extract Equipment
        document.querySelectorAll('.ddbc-inventory-slot').forEach(itemElement => {
            const itemName = getText('.ddbc-inventory-slot__name', itemElement);
            const itemQuantity = getText('.ddbc-inventory-slot__quantity', itemElement);

            if (itemName) {
                characterData.equipment.push({
                    name: itemName,
                    quantity: itemQuantity ? parseInt(itemQuantity, 10) : 1,
                    equipped: itemElement.classList.contains('ddbc-inventory-slot--equipped')
                });
            }
        });
        console.log('🎒 Equipment:', characterData.equipment.length, 'items extracted');

        // Extract Currency
        const currencyTypes = ['cp', 'sp', 'ep', 'gp', 'pp'];
        document.querySelectorAll('.ddbc-currency-item').forEach((currencyElement, index) => {
            if (index < currencyTypes.length) {
                const amount = parseNumber(getText('.ddbc-currency-item__value', currencyElement));
                characterData.currency[currencyTypes[index]] = amount;
            }
        });
        console.log('💰 Currency:', characterData.currency);

        // Extract Features & Traits
        document.querySelectorAll('.ct-feature-snippet, .ddbc-feature-list__item').forEach(featureElement => {
            const featureName = getText('.ct-feature-snippet__heading, .ddbc-feature-list__name', featureElement);
            const featureDescription = getText('.ct-feature-snippet__content, .ddbc-feature-list__description', featureElement);

            if (featureName) {
                characterData.features.push({
                    name: featureName,
                    description: featureDescription
                });
            }
        });
        console.log('⭐ Features:', characterData.features.length, 'features extracted');

        // Extract Spells
        document.querySelectorAll('.ct-spells__spell').forEach(spellElement => {
            const spellName = getText('.ct-spell-name__text, .ct-spells__spell-name', spellElement);
            const spellLevel = getText('.ct-spell-level-casting__level', spellElement);

            if (spellName) {
                characterData.spells.push({
                    name: spellName,
                    level: spellLevel,
                    prepared: spellElement.classList.contains('ct-spells__spell--prepared')
                });
            }
        });
        console.log('🔮 Spells:', characterData.spells.length, 'spells extracted');

        // Extract spell slots
        document.querySelectorAll('.ct-spell-level-slots__info').forEach(slotElement => {
            const levelText = getText('.ct-spell-level-slots__level', slotElement);
            const slotsText = getText('.ct-spell-level-slots__count', slotElement);

            if (levelText && slotsText) {
                const levelMatch = levelText.match(/\d+/);
                const slotsMatch = slotsText.match(/(\d+)\s*\/\s*(\d+)/);

                if (levelMatch && slotsMatch) {
                    const level = parseInt(levelMatch[0], 10);
                    characterData.spellSlots[`level${level}`] = {
                        used: parseInt(slotsMatch[1], 10),
                        total: parseInt(slotsMatch[2], 10)
                    };
                }
            }
        });

        // Extract avatar/portrait URL
        const avatarElement = document.querySelector('.ddbc-character-avatar__portrait, .ct-character-header-desktop__avatar-image');
        if (avatarElement) {
            const avatarUrl = avatarElement.src || avatarElement.style.backgroundImage?.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1];
            if (avatarUrl) {
                characterData.avatarUrl = avatarUrl;
                console.log('🖼️ Avatar URL:', characterData.avatarUrl);
            }
        }

        console.log('✅ Extraction complete!');
        console.log('📦 Character Data:', characterData);

        // Show loading notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #7F0EBD;
            color: white;
            padding: 20px 30px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 999999;
            font-family: Arial, sans-serif;
            font-size: 16px;
            font-weight: bold;
            animation: slideIn 0.3s ease-out;
        `;
        notification.innerHTML = '🎲 Importing character to Roll With Advantage...';
        document.body.appendChild(notification);

        // Send data to API
        fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include session cookie
            body: JSON.stringify(characterData)
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Not authenticated. Please log in to your admin panel first.');
                }
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ Import successful:', data);
            notification.style.background = '#28a745';
            notification.innerHTML = `✅ Character "${characterData.name}" imported successfully!<br><small>Level ${characterData.level} ${characterData.race}</small>`;

            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s';
                setTimeout(() => notification.remove(), 500);
            }, 4000);
        })
        .catch(error => {
            console.error('❌ Import failed:', error);
            notification.style.background = '#dc3545';
            notification.innerHTML = `❌ Import failed!<br><small>${error.message}</small>`;

            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s';
                setTimeout(() => notification.remove(), 500);
            }, 5000);
        });

    } catch (error) {
        console.error('❌ Extraction error:', error);
        alert(`❌ Error extracting character data:\n\n${error.message}\n\nPlease make sure you're on a D&D Beyond character sheet page.`);
    }
})();
