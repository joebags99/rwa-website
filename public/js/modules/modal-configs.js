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
    },

    /**
     * Character Modal Configuration
     */
    character: {
        id: 'character-modal',
        title: 'Create Character',
        fields: [
            {
                type: 'row',
                fields: [
                    {
                        id: 'name',
                        label: 'Character Name',
                        type: 'text',
                        required: true,
                        placeholder: 'Thorin Ironforge'
                    },
                    {
                        id: 'player',
                        label: 'Player Name',
                        type: 'text',
                        required: true,
                        placeholder: 'John Smith'
                    }
                ]
            },
            {
                type: 'row',
                fields: [
                    {
                        id: 'race',
                        label: 'Race',
                        type: 'text',
                        required: true,
                        placeholder: 'Dwarf'
                    },
                    {
                        id: 'classes',
                        label: 'Class(es)',
                        type: 'text',
                        required: true,
                        placeholder: 'Cleric 3 (Life Domain)',
                        help: 'Format: "Class Level" or "Class Level (Subclass)". For multiclass use "/" - e.g., "Fighter 3 / Wizard 2"'
                    }
                ]
            },
            {
                id: 'avatarUrl',
                label: 'Avatar URL',
                type: 'url',
                help: 'Character portrait image URL'
            },
            {
                id: 'accentColor',
                label: 'Accent Color',
                type: 'text',
                placeholder: '#7F0EBD',
                help: 'Hex color code for character theme (e.g., #FF5733)'
            },
            {
                id: 'displayOrder',
                label: 'Display Order',
                type: 'number',
                placeholder: '1',
                min: 1,
                help: 'Order to display character in the lineup (1 = first, lower numbers appear first)'
            }
        ],
        options: {
            footerButtons: [
                { id: 'cancel', text: 'Cancel', class: 'btn btn-secondary', action: 'close' },
                { id: 'save', text: 'Save Character', class: 'btn btn-primary', icon: 'fas fa-save', action: 'submit' }
            ]
        }
    },

    /**
     * Character Snapshot Modal Configuration
     */
    snapshot: {
        id: 'snapshot-modal',
        title: 'Add Character Snapshot',
        fields: [
            {
                type: 'row',
                fields: [
                    {
                        id: 'act',
                        label: 'Act',
                        type: 'number',
                        required: true,
                        placeholder: '1',
                        min: 1
                    },
                    {
                        id: 'chapter',
                        label: 'Chapter',
                        type: 'number',
                        required: true,
                        placeholder: '1',
                        min: 1
                    }
                ]
            },
            {
                id: 'date',
                label: 'Date',
                type: 'date',
                required: true
            },
            {
                id: 'notes',
                label: 'DM Notes',
                type: 'textarea',
                rows: 4,
                help: 'Optional notes about this point in the story'
            }
        ],
        options: {
            footerButtons: [
                { id: 'cancel', text: 'Cancel', class: 'btn btn-secondary', action: 'close' },
                { id: 'save', text: 'Save Snapshot', class: 'btn btn-primary', icon: 'fas fa-save', action: 'submit' }
            ]
        }
    },

    /**
     * Bookmarklet Instructions Modal Configuration
     */
    bookmarklet: {
        id: 'bookmarklet-modal',
        title: 'D&D Beyond Character Importer',
        fields: [
            {
                type: 'html',
                content: `
                    <div class="bookmarklet-instructions">
                        <p><strong>How to use:</strong></p>
                        <ol>
                            <li>Drag the button below to your bookmarks bar</li>
                            <li>Navigate to any D&D Beyond character sheet</li>
                            <li>Click the bookmark to import the character</li>
                        </ol>

                        <div class="bookmarklet-button-container" style="text-align: center; margin: 20px 0; padding: 20px; background: var(--bg-tertiary); border-radius: 8px;">
                            <a href="" id="bookmarklet-link" class="btn btn-lg btn-primary" style="font-size: 18px; padding: 15px 30px;">
                                <i class="fas fa-dragon"></i> Import from D&D Beyond
                            </a>
                            <p style="margin-top: 15px; font-size: 14px; color: var(--text-secondary);">
                                ⬆️ Drag this button to your bookmarks bar
                            </p>
                        </div>

                        <div class="alert alert-info" style="margin-top: 20px; padding: 15px; background: rgba(13, 110, 253, 0.1); border-left: 4px solid #0d6efd; border-radius: 4px;">
                            <i class="fas fa-info-circle"></i>
                            <strong>Note:</strong> Make sure you're logged in to this admin panel before using the bookmarklet.
                        </div>

                        <details style="margin-top: 20px;">
                            <summary style="cursor: pointer; font-weight: bold; padding: 10px; background: var(--bg-secondary); border-radius: 4px;">
                                <i class="fas fa-code"></i> Manual Installation
                            </summary>
                            <div style="margin-top: 10px; padding: 15px; background: var(--bg-tertiary); border-radius: 4px;">
                                <p>If drag-and-drop doesn't work, follow these steps:</p>
                                <ol>
                                    <li>Create a new bookmark in your browser</li>
                                    <li>Set the bookmark name to: <code>Import D&D Character</code></li>
                                    <li>Copy the code below and paste it as the URL</li>
                                </ol>
                                <textarea id="bookmarklet-code" readonly style="width: 100%; height: 150px; font-family: monospace; font-size: 12px; margin-top: 10px; padding: 10px; background: #1a1a1a; color: #0f0; border: 1px solid #444; border-radius: 4px;"></textarea>
                                <button id="copy-bookmarklet" class="btn btn-secondary" style="margin-top: 10px;">
                                    <i class="fas fa-copy"></i> Copy Code
                                </button>
                            </div>
                        </details>
                    </div>
                `
            }
        ],
        options: {
            footerButtons: [
                { id: 'close', text: 'Close', class: 'btn btn-primary', action: 'close' }
            ]
        }
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModalConfigs;
}
