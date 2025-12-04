/**
 * Modal Configurations
 *
 * Defines modal configurations for all admin resources
 * Used with ModalFactory to generate modals dynamically
 *
 * @version 3.0.0
 */

'use strict';

window.ModalConfigs = {
    /**
     * NPC Modal Configuration
     */
    npc: {
        id: 'npc-modal',
        title: 'Create New NPC',
        fields: [
            {
                id: 'name',
                label: 'Name & Title',
                type: 'text',
                required: true,
                placeholder: 'Example: King Talon Falkrest, "the Kind"'
            },
            {
                type: 'row',
                fields: [
                    {
                        id: 'importance',
                        label: 'Importance',
                        type: 'select',
                        required: true,
                        options: [
                            { value: '1', label: '1 Star (Minor)' },
                            { value: '2', label: '2 Stars (Supporting)' },
                            { value: '3', label: '3 Stars (Major)' }
                        ]
                    },
                    {
                        id: 'appearance',
                        label: 'First Appearance',
                        type: 'text',
                        required: true,
                        help: 'Example: "Episode 2" or "Session 5"'
                    }
                ]
            },
            {
                type: 'row',
                fields: [
                    {
                        id: 'relationship',
                        label: 'Relationship',
                        type: 'select',
                        required: true,
                        options: ['ally', 'friendly', 'neutral', 'hostile', 'unknown']
                    },
                    {
                        id: 'category',
                        label: 'Category',
                        type: 'select',
                        required: true,
                        options: ['royal', 'pastoral', 'militant', 'religious']
                    }
                ]
            },
            {
                id: 'description',
                label: 'Brief Description',
                type: 'textarea',
                required: true,
                rows: 4
            },
            {
                id: 'quote',
                label: 'Memorable Quote',
                type: 'textarea',
                required: true,
                rows: 2
            },
            {
                id: 'tags',
                label: 'Tags',
                type: 'text',
                required: true,
                help: 'Comma-separated tags (e.g., "ederian, nobility, clergy")'
            },
            {
                id: 'image',
                label: 'Image URL',
                type: 'text',
                help: 'URL to character image (leave blank to use default)'
            }
        ],
        options: {
            footerButtons: [
                { id: 'cancel', text: 'Cancel', class: 'btn btn-secondary', action: 'close' },
                { id: 'save', text: 'Save NPC', class: 'btn btn-primary', icon: 'fas fa-save', action: 'submit' }
            ]
        }
    },

    /**
     * Timeline Modal Configuration
     */
    timeline: {
        id: 'timeline-modal',
        title: 'Create Timeline Entry',
        fields: [
            {
                id: 'type',
                label: 'Entry Type',
                type: 'select',
                required: true,
                options: [
                    { value: 'event', label: 'Event' },
                    { value: 'reign-break', label: 'Reign Break' }
                ]
            },
            {
                id: 'title',
                label: 'Title',
                type: 'text',
                required: true,
                placeholder: 'Event or reign name'
            },
            {
                id: 'era',
                label: 'Era',
                type: 'select',
                required: true,
                options: ['Ancient Era', 'Classical Era', 'Medieval Era', 'Modern Era']
            },
            {
                type: 'row',
                fields: [
                    {
                        id: 'year',
                        label: 'Year',
                        type: 'number',
                        required: true,
                        placeholder: 'e.g., 1247'
                    },
                    {
                        id: 'month',
                        label: 'Month (Optional)',
                        type: 'text',
                        placeholder: 'e.g., Tir'
                    }
                ]
            },
            {
                id: 'description',
                label: 'Description',
                type: 'textarea',
                required: true,
                rows: 5
            },
            {
                id: 'significance',
                label: 'Significance',
                type: 'select',
                required: true,
                options: [
                    { value: 'low', label: 'Low - Minor event' },
                    { value: 'medium', label: 'Medium - Notable event' },
                    { value: 'high', label: 'High - Major turning point' }
                ]
            },
            {
                id: 'tags',
                label: 'Tags',
                type: 'text',
                help: 'Comma-separated tags'
            }
        ],
        options: {
            footerButtons: [
                { id: 'cancel', text: 'Cancel', class: 'btn btn-secondary', action: 'close' },
                { id: 'save', text: 'Save Entry', class: 'btn btn-primary', icon: 'fas fa-save', action: 'submit' }
            ]
        }
    },

    /**
     * Story Episode Modal Configuration
     */
    story: {
        id: 'story-modal',
        title: 'Create Story Episode',
        fields: [
            {
                type: 'row',
                fields: [
                    {
                        id: 'episodeNumber',
                        label: 'Episode Number',
                        type: 'number',
                        required: true,
                        placeholder: '1'
                    },
                    {
                        id: 'sessionDate',
                        label: 'Session Date',
                        type: 'date',
                        required: true
                    }
                ]
            },
            {
                id: 'title',
                label: 'Episode Title',
                type: 'text',
                required: true,
                placeholder: 'The Beginning of the End'
            },
            {
                id: 'act',
                label: 'Act',
                type: 'select',
                required: true,
                options: [] // Will be populated dynamically
            },
            {
                id: 'chapter',
                label: 'Chapter',
                type: 'select',
                required: true,
                options: [] // Will be populated dynamically
            },
            {
                id: 'summary',
                label: 'Episode Summary',
                type: 'textarea',
                required: true,
                rows: 6,
                placeholder: 'Brief summary of the episode events...'
            },
            {
                id: 'keyMoments',
                label: 'Key Moments',
                type: 'textarea',
                required: false,
                rows: 4,
                help: 'Notable moments, separated by newlines'
            },
            {
                id: 'locations',
                label: 'Locations Visited',
                type: 'text',
                help: 'Comma-separated location names'
            },
            {
                id: 'npcsIntroduced',
                label: 'NPCs Introduced',
                type: 'text',
                help: 'Comma-separated NPC names'
            },
            {
                id: 'youtubeUrl',
                label: 'YouTube URL',
                type: 'url',
                placeholder: 'https://www.youtube.com/watch?v=...'
            }
        ],
        options: {
            footerButtons: [
                { id: 'cancel', text: 'Cancel', class: 'btn btn-secondary', action: 'close' },
                { id: 'save', text: 'Save Episode', class: 'btn btn-primary', icon: 'fas fa-save', action: 'submit' }
            ]
        }
    },

    /**
     * Article Modal Configuration
     */
    article: {
        id: 'article-modal',
        title: 'Create Article',
        fields: [
            {
                id: 'title',
                label: 'Article Title',
                type: 'text',
                required: true,
                placeholder: 'How to Run Epic Boss Battles'
            },
            {
                type: 'row',
                fields: [
                    {
                        id: 'category',
                        label: 'Category',
                        type: 'select',
                        required: true,
                        options: ['Combat', 'Roleplay', 'World Building', 'Player Management', 'General']
                    },
                    {
                        id: 'difficulty',
                        label: 'Difficulty',
                        type: 'select',
                        required: true,
                        options: ['Beginner', 'Intermediate', 'Advanced']
                    }
                ]
            },
            {
                id: 'excerpt',
                label: 'Excerpt',
                type: 'textarea',
                required: true,
                rows: 3,
                help: 'Brief description for the article card'
            },
            {
                id: 'content',
                label: 'Content (Markdown)',
                type: 'textarea',
                required: true,
                rows: 12,
                help: 'Full article content in Markdown format'
            },
            {
                id: 'tags',
                label: 'Tags',
                type: 'text',
                required: true,
                help: 'Comma-separated tags (e.g., "combat, boss battles, tactics")'
            },
            {
                id: 'featuredImage',
                label: 'Featured Image URL',
                type: 'url',
                help: 'URL to featured image (optional)'
            },
            {
                id: 'status',
                label: 'Status',
                type: 'select',
                required: true,
                options: [
                    { value: 'draft', label: 'Draft' },
                    { value: 'published', label: 'Published' }
                ]
            }
        ],
        options: {
            footerButtons: [
                { id: 'cancel', text: 'Cancel', class: 'btn btn-secondary', action: 'close' },
                { id: 'save', text: 'Save Article', class: 'btn btn-primary', icon: 'fas fa-save', action: 'submit' }
            ]
        }
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModalConfigs;
}
