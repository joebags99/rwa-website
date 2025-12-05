/**
 * Admin Modals Initialization
 *
 * Initializes all modals using ModalFactory
 * Provides bridge between ModalFactory and existing AdminDashboard code
 *
 * @version 3.0.0
 */

'use strict';

(function() {
    // Wait for dependencies to load
    if (typeof ModalFactory === 'undefined' || typeof ModalConfigs === 'undefined') {
        console.error('ModalFactory or ModalConfigs not loaded');
        return;
    }

    /**
     * Initialize all admin modals
     */
    window.initializeAdminModals = function() {
        console.log('📦 Initializing admin modals...');

        // Create NPC Modal
        const npcModal = ModalFactory.create({
            ...ModalConfigs.npc,
            onSave: (data) => {
                if (window.AdminDashboard && window.AdminDashboard.NPCs) {
                    // Map modal field IDs to NPC object properties
                    const npcData = {
                        name: data.name,
                        importance: data.importance,
                        appearance: data.appearance,
                        relationship: data.relationship,
                        category: data.category,
                        description: data.description,
                        quote: data.quote,
                        tags: data.tags,
                        image: data.image
                    };

                    // If editing existing NPC
                    if (data.id) {
                        npcData.id = data.id;
                        AdminDashboard.NPCs._updateNPC(npcData);
                    } else {
                        AdminDashboard.NPCs._createNPC(npcData);
                    }
                }
            },
            onCancel: () => {
                console.log('NPC modal cancelled');
            }
        });

        // Create Timeline Modal
        const timelineModal = ModalFactory.create({
            ...ModalConfigs.timeline,
            onSave: (data) => {
                if (window.AdminDashboard && window.AdminDashboard.Timeline) {
                    const timelineData = {
                        type: data.type,
                        title: data.title,
                        era: data.era,
                        year: data.year,
                        month: data.month,
                        description: data.description,
                        significance: data.significance,
                        tags: data.tags
                    };

                    if (data.id) {
                        timelineData.id = data.id;
                        AdminDashboard.Timeline._updateEntry(timelineData);
                    } else {
                        AdminDashboard.Timeline._createEntry(timelineData);
                    }
                }
            }
        });

        // Create Story Episode Modal
        const storyModal = ModalFactory.create({
            ...ModalConfigs.story,
            onSave: (data) => {
                if (window.AdminDashboard && window.AdminDashboard.StoryEpisodes) {
                    const episodeData = {
                        episodeNumber: data.episodeNumber,
                        sessionDate: data.sessionDate,
                        title: data.title,
                        act: data.act,
                        chapter: data.chapter,
                        summary: data.summary,
                        keyMoments: data.keyMoments,
                        locations: data.locations,
                        npcsIntroduced: data.npcsIntroduced,
                        youtubeUrl: data.youtubeUrl
                    };

                    if (data.id) {
                        episodeData.id = data.id;
                        AdminDashboard.StoryEpisodes._updateEpisode(episodeData);
                    } else {
                        AdminDashboard.StoryEpisodes._createEpisode(episodeData);
                    }
                }
            }
        });

        // Create Article Modal
        const articleModal = ModalFactory.create({
            ...ModalConfigs.article,
            onSave: (data) => {
                if (window.AdminDashboard && window.AdminDashboard.Articles) {
                    const articleData = {
                        title: data.title,
                        category: data.category,
                        difficulty: data.difficulty,
                        excerpt: data.excerpt,
                        content: data.content,
                        tags: data.tags,
                        featuredImage: data.featuredImage,
                        status: data.status
                    };

                    if (data.id) {
                        articleData.id = data.id;
                        AdminDashboard.Articles._updateArticle(articleData);
                    } else {
                        AdminDashboard.Articles._createArticle(articleData);
                    }
                }
            }
        });

        // Create Character Modal
        const characterModal = ModalFactory.create({
            ...ModalConfigs.character,
            onSave: (data) => {
                if (window.AdminDashboard && window.AdminDashboard.Characters) {
                    const characterData = {
                        name: data.name,
                        player: data.player,
                        race: data.race,
                        classes: data.classes,
                        avatarUrl: data.avatarUrl,
                        accentColor: data.accentColor || '#7F0EBD'
                    };

                    if (data.id) {
                        characterData.id = data.id;
                        AdminDashboard.Characters._updateCharacter(characterData);
                    } else {
                        AdminDashboard.Characters._createCharacter(characterData);
                    }
                }
            }
        });

        // Create Snapshot Modal
        const snapshotModal = ModalFactory.create({
            ...ModalConfigs.snapshot,
            onSave: (data) => {
                if (window.AdminDashboard && window.AdminDashboard.Characters) {
                    const snapshotData = {
                        act: data.act,
                        chapter: data.chapter,
                        date: data.date,
                        notes: data.notes,
                        data: {} // Will be populated by D&D Beyond import or manual entry
                    };

                    // Get the character ID from the modal's stored state
                    const characterId = snapshotModal.characterId;

                    if (!characterId) {
                        console.error('No character ID set for snapshot');
                        return;
                    }

                    if (data.id) {
                        snapshotData.id = data.id;
                        AdminDashboard.Characters._updateSnapshot(characterId, snapshotData);
                    } else {
                        AdminDashboard.Characters._createSnapshot(characterId, snapshotData);
                    }
                }
            }
        });

        // Create Bookmarklet Instructions Modal
        const bookmarkletModal = ModalFactory.create(ModalConfigs.bookmarklet);

        // Expose modals for easy access
        window.AdminModals = {
            npc: npcModal,
            timeline: timelineModal,
            story: storyModal,
            article: articleModal,
            character: characterModal,
            snapshot: snapshotModal,
            bookmarklet: bookmarkletModal
        };

        console.log('✅ All admin modals initialized');
        return window.AdminModals;
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAdminModals);
    } else {
        // DOM already loaded
        setTimeout(initializeAdminModals, 100);
    }
})();
