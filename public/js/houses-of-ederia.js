/**
 * Houses of Ederia — Shield Hall
 * Banner click opens detail panel; ESC / close button hides it.
 */

(function () {
    'use strict';

    /* ── House Data ────────────────────────────────────────── */
    const HOUSES = {
        falkrest: {
            name: 'House Falkrest',
            motto: '"Beyond the Horizon"',
            accent: '#3A7734',
            glow: 'rgba(58,119,52,0.3)',
            shield: 'assets/images/houses/falkrest-shield-large.png',
            lord: 'assets/images/houses/talon-falkrest.png',
            lordTitle: 'King Talon Falkrest',
            location: 'assets/images/houses/locations/skyhaven.png',
            locationCaption: 'Skyhaven — Seat of House Falkrest',
            basics: [
                { label: 'Colors',  value: 'Green & Gold' },
                { label: 'Sigil',   value: 'A soaring brown falcon over grey mountains' },
                { label: 'Seat',    value: 'Skyhaven' },
                { label: 'Region',  value: 'The Heartlands' },
                { label: 'Current Lord', value: 'King Talon Falkrest' },
            ],
            body: `
                <h3>King of Ederia</h3>
                <p>King Talon Falkrest, current ruler of Ederia, is known for his legacy as a former adventurer and his visionary leadership. Under his rule, the kingdom has expanded its borders and strengthened diplomatic ties with neighboring realms. His adventurous spirit lives on in his children, the heirs to the Crimson Throne.</p>
                <h3>History</h3>
                <p>The origins of Skyhaven trace back to a family of adventurers who made their livelihood through monster hunting and defending people. Their valor earned them the title of "Sentinel" in service to the realm, legitimized by King Alistar Draven almost 80 years ago. Their official recognition marked the rise of House Falkrest as a noble house.</p>
                <p>Their seat, Skyhaven, is filled with artifacts and curiosities from their travels. They are respected for their bravery and resourcefulness but are sometimes seen as unpredictable. Currently, they are the ruling house of Ederia.</p>
                <h3>Notable Members</h3>
                <ul>
                    <li>Late Queen Elendara "The Usurper" Falkrest — Former Queen, Mother to Talon, renowned adventurer</li>
                    <li>King Talon Falkrest — Current King of Ederia and former adventurer</li>
                    <li>Lord Paramount Raynere Falkrest — Current Sentinel of Ederia, former adventurer</li>
                    <li>Prince Edwinn Falkrest — 1st Born Bastard Son of Talon</li>
                    <li>Princess Xanthe Falkrest — 2nd Born Noble Daughter of Talon</li>
                    <li>Princess Cailynn Falkrest — 3rd Born Bastard Daughter of Talon</li>
                    <li>Prince Marik Veltaris-Falkrest — 4th Born Noble Son of Talon</li>
                    <li>Princess Octavia Falkrest — 5th Born Noble Daughter of Talon</li>
                </ul>
                <h3>Banner Houses</h3>
                <ul>
                    <li>House Thalor — Mountain exploration experts</li>
                    <li>House Veyra — Desert exploration specialists</li>
                    <li>House Caltris — Jungle exploration masters</li>
                    <li>House Drakemoor — Trainers of wyverns and knights</li>
                    <li>House Wylder — Guardians of the capital</li>
                </ul>
            `
        },
        veltaris: {
            name: 'House Veltaris',
            motto: '"Through Storms, We Prevail"',
            accent: '#3a7ab8',
            glow: 'rgba(26,75,130,0.3)',
            shield: 'assets/images/houses/veltaris-shield-large.png',
            lord: 'assets/images/houses/geran-veltaris.png',
            lordTitle: 'Lord Paramount Geran Veltaris',
            location: 'assets/images/houses/locations/krackens-reach.png',
            locationCaption: "Kraken's Reach — Seat of House Veltaris",
            basics: [
                { label: 'Colors',  value: 'Blue & Silver' },
                { label: 'Sigil',   value: 'A grey Kraken grasping a ship on dark blue' },
                { label: 'Seat',    value: "Kraken's Reach" },
                { label: 'Region',  value: 'The Eastern Coast' },
                { label: 'Current Lord', value: 'Lord Paramount Geran Veltaris' },
            ],
            body: `
                <h3>History</h3>
                <p>Kraken's Reach was originally a pirate cove, home to some of the most dangerous pirates to ever curse the realms of Illica. The most notorious was Edwinn "Strongjaw" Veltaris, who united the pirates under one banner and established the first pirate nation.</p>
                <p>House Veltaris ruled the seas for several hundred years, bringing fear and respect to their name. During the reign of Niderion the Flaming Fury, the need to spread his influence led Edwinn to ally with House Warendell to end the age of the dragon in Ederia.</p>
                <p>Today, House Veltaris controls the coastal lands and the kingdom's vast navy. Their ships are unmatched in speed and strength, and their sailors are renowned for resilience and navigational skill. Their wealth comes from trade, fishing, and occasional privateering along the Whispering Sea.</p>
                <h3>Notable Members</h3>
                <ul>
                    <li>Lord Paramount Geran Veltaris — Commander of the royal fleet and Lord of Kraken's Reach</li>
                    <li>Lady Sharn Veltaris — Former Queen of Ederia, 1st Born Daughter of Lord Geran</li>
                    <li>Prince Marik Veltaris-Falkrest — Son of Sharn Veltaris</li>
                    <li>The Late Eddwin "Strongjaw" Veltaris — Legendary Air Genasi pirate who unified Kraken's Reach</li>
                </ul>
                <h3>Banner Houses</h3>
                <ul>
                    <li>House Webber — Coastal defense specialists</li>
                    <li>House Maelis — Fishing and trade experts</li>
                    <li>House Rathmere — Naval warfare tacticians</li>
                </ul>
                <h3>Current Status</h3>
                <p>A powerful naval force with growing political influence through their alliance with House Falkrest.</p>
            `
        },
        thornefield: {
            name: 'House Thornefield',
            motto: '"From the Land, Prosperity"',
            accent: '#c8a040',
            glow: 'rgba(122,96,48,0.3)',
            shield: 'assets/images/houses/thornefield-shield-large.png',
            lord: 'assets/images/houses/gareth-thornefield.png',
            lordTitle: 'Lord Gareth Thornefield',
            location: 'assets/images/houses/locations/highfields.png',
            locationCaption: 'Highfields — Seat of House Thornefield',
            basics: [
                { label: 'Colors',  value: 'Tan & Green' },
                { label: 'Sigil',   value: 'A golden sheaf of wheat over a green field' },
                { label: 'Seat',    value: 'Highfields' },
                { label: 'Region',  value: 'The Southern Plains' },
                { label: 'Current Lord', value: 'Lord-Regent Gareth Thornefield' },
            ],
            body: `
                <h3>Breadbasket of Ederia</h3>
                <p>House Thornefield controls the fertile plains that feed the entire kingdom. Their agricultural expertise is unmatched, producing bountiful harvests even in difficult seasons. While not as militarily powerful as other houses, their control of the food supply gives them significant leverage in court politics.</p>
                <h3>History</h3>
                <p>The city of Highfields has always held great sway in these lands, boasting the largest overall population in the region. During the age of the Dragons, House Thornefield was the last to join the cause, wary of their substantial losses—a hesitancy that has left a lasting mark on their reputation, with other houses remaining suspicious of them even 800 years later.</p>
                <p>Today, House Thornefield governs the fertile plains and farmlands of the kingdom. They are the primary suppliers of food for the kingdom and for trade with neighboring lands. Their vast estates are dotted with fields of grain, orchards, and vineyards.</p>
                <h3>Notable Members</h3>
                <ul>
                    <li>Lord Gareth Thornefield — Steady ruler, expert diplomat, unwavering ally, agricultural innovator</li>
                    <li>The Late Lady Gwendolyn Thornefield — Fierce rider, aerial tactician, Triarchy's bane, battlefield legend</li>
                </ul>
                <h3>Banner Houses</h3>
                <ul>
                    <li>House Brackenwood — Forestry and hunting</li>
                    <li>House Eldros — Livestock and herding</li>
                    <li>House Faebrook — Herbology and healing</li>
                    <li>House Greenmire — Grain farming</li>
                    <li>House Varason — Vineyards and winemaking</li>
                    <li>House Thornwell — Orchard and fruit farming</li>
                    <li>House Rivermoor — Riverlands and irrigation</li>
                </ul>
                <h3>Current Status</h3>
                <p>An essential house controlling the kingdom's food supply, though still viewed with some suspicion due to their historical hesitance during crucial conflicts.</p>
            `
        },
        astralor: {
            name: 'House Astralor',
            motto: '"Knowledge is Power"',
            accent: '#2aaeae',
            glow: 'rgba(26,96,96,0.3)',
            shield: 'assets/images/houses/astralor-shield-large.png',
            lord: 'assets/images/houses/vaelora-astralor.png',
            lordTitle: 'Lady Paramount Vaelora Astralor',
            location: 'assets/images/houses/locations/tomehold.png',
            locationCaption: 'Tomehold — Seat of House Astralor',
            basics: [
                { label: 'Colors',  value: 'Silver & Teal' },
                { label: 'Sigil',   value: 'A silver star with a blue aura on white' },
                { label: 'Seat',    value: 'Tomehold' },
                { label: 'Region',  value: 'The Northern Highlands' },
                { label: 'Current Lord', value: 'Lady Vaelora Astralor' },
            ],
            body: `
                <h3>Masters of Magic</h3>
                <p>House Astralor stands as the kingdom's foremost authority on magical knowledge. From their towering library of Tomehold, they research, catalog, and control the arcane arts throughout Ederia. Their upcoming marriage alliance with House Falkrest through Lady Selara and Prince Marik will further cement their influence.</p>
                <h3>History</h3>
                <p>House Astralor's rise to prominence began in 733 AR with the discovery of Ryanite in the previous capital of House Emberlyn. Initially a vassal of House Emberlyn, House Astralor gained independence and power through their exceptional abilities in magic and combat.</p>
                <p>When House Emberlyn rebelled against the king, House Astralor's elite regiment, the "Blades of Xandoria," known for their expertise in mage hunting and execution, played a crucial role in suppressing the Ryanite-infused forces.</p>
                <p>Today, House Astralor is the center of magical knowledge and power in the kingdom. They control Tomehold, a towering structure filled with ancient tomes, magical artifacts, and a vast library of spells.</p>
                <h3>Notable Members</h3>
                <ul>
                    <li>Lady Paramount Vaelora Astralor — Warm matriarch, ruthless hunter, arcane enforcer, master strategist</li>
                    <li>Lady Selara Astralor — Renowned artificer, expert on dragons, betrothed to Prince Marik</li>
                    <li>Master Diviner Lysander Astralor — Master of divination magic</li>
                    <li>Commander Lyria Astralor — Leader of the Blades of Xandoria</li>
                </ul>
                <h3>Banner Houses</h3>
                <ul>
                    <li>House Melanth — Alchemy and potion specialists</li>
                    <li>House Umbren — Dark magic practitioners</li>
                    <li>House Lumere — Diviners and seers</li>
                </ul>
                <h3>Current Status</h3>
                <p>A powerful magical house with close ties to the royal family through the upcoming marriage of Lady Selara to Prince Marik Veltaris-Falkrest.</p>
            `
        },
        eldran: {
            name: 'House Eldran',
            motto: '"By Right of Blood"',
            accent: '#9a72c8',
            glow: 'rgba(91,63,138,0.3)',
            shield: 'assets/images/houses/eldran-shield-large.png',
            lord: 'assets/images/houses/brynja-eldran.png',
            lordTitle: 'Lady Paramount Brynja Eldran',
            location: 'assets/images/houses/locations/stonewatch.png',
            locationCaption: 'Stonewatch — Seat of House Eldran',
            basics: [
                { label: 'Colors',  value: 'Purple & Gold' },
                { label: 'Sigil',   value: 'A Silver Griffon on a purple field' },
                { label: 'Seat',    value: 'Stonewatch' },
                { label: 'Region',  value: 'The Western Mountains' },
                { label: 'Current Lord', value: 'Lady Brynja Eldran' },
            ],
            body: `
                <h3>Ancient Nobility</h3>
                <p>House Eldran stands as the oldest noble house in Ederia, with bloodlines tracing back to the earliest kings. Their vast wealth and careful political maneuvering have maintained their prominence for centuries, though they now swear fealty to House Falkrest while quietly remembering their ancient claim to the throne.</p>
                <h3>History</h3>
                <p>The origins of Stonewatch date back to its foundation within the ruins of an ancient dwarf city. Upon exploring these ruins, House Eldran discovered several magical items and artifacts that remained functional even after the breaking. They kept these powerful artifacts secret, waiting for the opportune moment to leverage them.</p>
                <p>When House Warrendell approached House Eldran with plans to overthrow the Dragon Triarchy, House Eldran was able to offer dragon-slaying weapons and arrows at a high cost. Their claim to the throne is by blood right, with some members tracing their lineage back to Sannira and Tyroch.</p>
                <p>Today, House Eldran is the oldest and wealthiest noble house in the kingdom. Stonewatch is a massive fortress filled with luxurious decorations and historical artifacts.</p>
                <h3>Notable Members</h3>
                <ul>
                    <li>Lady Brynja Eldran — Resilient matriarch, unyielding leader, survivor of tragedy, firm yet fair ruler</li>
                    <li>Knight-Commander Nadja Eldran — Commander of the Crown Claw Knights, loyal war veteran, bonded to her wyvern</li>
                    <li>Lady Alrice Eldran — Shrewd financier, kingdom's treasurer, pragmatic and sharp-minded</li>
                    <li>Ser Cedric Eldran — Once kind, now cruel; ambitious noble, dismissive of his past</li>
                </ul>
                <h3>Banner Houses</h3>
                <ul>
                    <li>House Baelor — Banking and finance</li>
                    <li>House Arden — Trade and commerce</li>
                    <li>House Malgareth — Mining and metallurgy</li>
                    <li>House Varlem — Art and culture</li>
                    <li>House Thrynn — Education and scholarship</li>
                </ul>
                <h3>Current Status</h3>
                <p>The oldest and wealthiest house with a historical claim to the throne, currently maintaining peace through fealty to House Falkrest while wielding significant economic and cultural influence.</p>
            `
        },
        emberlyn: {
            name: 'House Emberlyn',
            motto: '"Faith Forged in Fire"',
            accent: '#e06040',
            glow: 'rgba(139,48,48,0.3)',
            shield: 'assets/images/houses/emberlyn-shield-large.png',
            lord: 'assets/images/houses/iradess-emberlyn.png',
            lordTitle: 'Lady Paramount Iradessa Emberlyn',
            location: 'assets/images/houses/locations/faithspire.png',
            locationCaption: 'Faithspire — Seat of House Emberlyn',
            basics: [
                { label: 'Colors',  value: 'Orange & Cream' },
                { label: 'Sigil',   value: 'A silver anvil with a radiant halo' },
                { label: 'Seat',    value: 'Faithspire' },
                { label: 'Region',  value: 'The Eastern Highlands' },
                { label: 'Current Lord', value: 'Lady Iradessa Emberlyn' },
            ],
            body: `
                <h3>Spiritual Leaders</h3>
                <p>House Emberlyn has transformed from master craftsmen into the kingdom's religious authority. From their grand temple-forge of Faithspire, they guide the spiritual life of Ederia while still crafting some of the finest weapons and armor in the realm. Though once rebellious, they now serve as the moral compass of the kingdom.</p>
                <h3>History</h3>
                <p>Faithspire was built atop a mine rich in Ryanite, a magical crystalline rock with potent properties crucial for powerful magical creations. The discovery of this mineral brought immense wealth to the city and enabled House Emberlyn to rise to power.</p>
                <p>However, this power led to ambition, and House Emberlyn initiated a rebellion to overthrow the king about 400 years ago. The key to House Emberlyn's strength was the Lucidic Spire, a grand tower made from Ryanite and jade, which served as an amplification device for the house's mages.</p>
                <p>In a bid to become a god, Delphanis Emberlyn drew too much power from the spire, causing it to implode—disrupting the magical weave in Ederia, leaving the land devoid of magic for almost 150 years.</p>
                <p>House Emberlyn originated as a house of master craftsmen and blacksmiths but has transformed into the kingdom's primary religious authority. Faithspire is both a grand temple and a forge, symbolizing their dual heritage. The house is known for its strict adherence to the faith of the Flame—a religion that worships the divine aspects of fire and creation, melding the teachings of Vuldros, Solaris, and Damantris.</p>
                <h3>Notable Members</h3>
                <ul>
                    <li>Lady Iradessa Emberlyn — Pious ruler, master strategist, sacred forgemaster, divine seer, unwavering matriarch</li>
                    <li>The Late Marrik "Dragonkin" Emberlyn — Rebellious forgemaster, dragon slayer, battle-hardened smith, quiet hero of Ederia</li>
                </ul>
                <h3>Banner Houses</h3>
                <ul>
                    <li>House Lareth — Monastic orders</li>
                    <li>House Merathis — Holy warriors</li>
                    <li>House Pyrelan — Sacred rituals</li>
                    <li>House Valyra — Divine healing</li>
                    <li>House Thalon — Pilgrimages and holy sites</li>
                    <li>House Elaris — Religious education</li>
                </ul>
                <h3>Current Status</h3>
                <p>A house of respected craftsmen and religious leaders recovering from their historical rebellion, now serving as the spiritual backbone of the kingdom.</p>
            `
        }
    };

    /* ── DOM refs ──────────────────────────────────────────── */
    const banners    = document.querySelectorAll('.house-banner');
    const detail     = document.getElementById('house-detail');
    const closeBtn   = detail.querySelector('.detail-close');

    const elShield   = document.getElementById('detail-shield');
    const elLordImg  = document.getElementById('detail-lord-img');
    const elLordTtl  = document.getElementById('detail-lord-title');
    const elName     = document.getElementById('detail-name');
    const elMotto    = document.getElementById('detail-motto');
    const elBasics   = document.getElementById('detail-basics');
    const elBody     = document.getElementById('detail-body');
    const elLocImg   = document.getElementById('detail-location-img');
    const elLocCap   = document.getElementById('detail-location-caption');

    let activeBanner = null;

    /* ── Populate & open detail ────────────────────────────── */
    function openDetail(houseKey) {
        const h = HOUSES[houseKey];
        if (!h) return;

        // Populate
        elShield.src      = h.shield;
        elShield.alt      = h.name;
        elLordImg.src     = h.lord;
        elLordImg.alt     = h.lordTitle;
        elLordTtl.textContent = h.lordTitle;
        elName.textContent    = h.name;
        elMotto.textContent   = h.motto;

        // Basics grid
        elBasics.innerHTML = h.basics.map(b => `
            <div class="basics-row">
                <span class="basics-label">${b.label}</span>
                <span class="basics-value">${b.value}</span>
            </div>
        `).join('');

        elBody.innerHTML = h.body;

        elLocImg.src = h.location;
        elLocImg.alt = h.locationCaption;
        elLocCap.textContent = h.locationCaption;

        // Accent color
        detail.style.setProperty('--house-accent', h.accent);
        detail.style.setProperty('--house-detail-glow', h.glow);
        elLordImg.style.borderColor = h.accent;

        // Show panel (re-trigger animation by removing + re-adding open)
        detail.classList.remove('open');
        void detail.offsetWidth; // reflow
        detail.classList.add('open');
        detail.setAttribute('aria-hidden', 'false');

        // Scroll content to top
        const content = detail.querySelector('.detail-content');
        if (content) content.scrollTop = 0;

        // Scroll detail into view
        setTimeout(() => detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
    }

    /* ── Close detail ──────────────────────────────────────── */
    function closeDetail() {
        detail.classList.remove('open');
        detail.setAttribute('aria-hidden', 'true');
        if (activeBanner) {
            activeBanner.classList.remove('active');
            activeBanner = null;
        }
    }

    /* ── Banner clicks ─────────────────────────────────────── */
    banners.forEach(btn => {
        btn.addEventListener('click', () => {
            const houseKey = btn.dataset.house;

            // Toggle off if same banner clicked again
            if (activeBanner === btn && detail.classList.contains('open')) {
                closeDetail();
                return;
            }

            // Deactivate previous
            if (activeBanner) activeBanner.classList.remove('active');

            activeBanner = btn;
            btn.classList.add('active');
            openDetail(houseKey);
        });
    });

    /* ── Close button & ESC ────────────────────────────────── */
    closeBtn.addEventListener('click', closeDetail);

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeDetail();
    });

})();
