/**
 * Modal Factory - Dynamic Modal Generation
 *
 * Creates modals dynamically based on configuration, eliminating duplicate HTML
 * Provides consistent API for all modal operations
 *
 * @version 3.0.0
 */

'use strict';

window.ModalFactory = {
    // Track all created modals
    modals: new Map(),

    // Default configuration
    defaults: {
        closeOnBackdrop: true,
        closeOnEscape: true,
        showFooter: true,
        footerButtons: [
            { id: 'cancel', text: 'Cancel', class: 'btn btn-secondary', action: 'close' },
            { id: 'save', text: 'Save', class: 'btn btn-primary', icon: 'fas fa-save', action: 'submit' }
        ]
    },

    /**
     * Create a new modal
     * @param {Object} config - Modal configuration
     * @param {string} config.id - Unique modal ID
     * @param {string} config.title - Modal title
     * @param {Array} config.fields - Array of form field configurations
     * @param {Function} config.onSave - Callback when save button clicked
     * @param {Function} config.onCancel - Callback when cancel/close clicked
     * @param {Object} config.options - Additional options
     * @returns {Object} - Modal API object
     */
    create(config) {
        if (!config.id) {
            throw new Error('Modal ID is required');
        }

        if (this.modals.has(config.id)) {
            console.warn(`Modal '${config.id}' already exists. Returning existing modal.`);
            return this.modals.get(config.id);
        }

        const options = { ...this.defaults, ...config.options };

        // Create modal DOM structure
        const modalElement = this._buildModalDOM(config, options);
        document.body.appendChild(modalElement);

        // Create modal API
        const modalAPI = {
            id: config.id,
            element: modalElement,
            open: () => this.open(config.id),
            close: () => this.close(config.id),
            setTitle: (title) => this.setTitle(config.id, title),
            setData: (data) => this.setData(config.id, data),
            getData: () => this.getData(config.id),
            reset: () => this.reset(config.id),
            destroy: () => this.destroy(config.id),
            config,
            options
        };

        // Store modal
        this.modals.set(config.id, modalAPI);

        // Bind events
        this._bindEvents(config.id, config, options);

        console.log(`✓ Modal created: ${config.id}`);
        return modalAPI;
    },

    /**
     * Build modal DOM structure
     * @private
     */
    _buildModalDOM(config, options) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = config.id;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', `${config.id}-title`);
        modal.setAttribute('aria-hidden', 'true');

        const dialog = document.createElement('div');
        dialog.className = 'modal-dialog';

        const content = document.createElement('div');
        content.className = 'modal-content';

        // Header
        const header = this._buildHeader(config);
        content.appendChild(header);

        // Body
        const body = this._buildBody(config);
        content.appendChild(body);

        // Footer
        if (options.showFooter) {
            const footer = this._buildFooter(config, options);
            content.appendChild(footer);
        }

        dialog.appendChild(content);
        modal.appendChild(dialog);

        return modal;
    },

    /**
     * Build modal header
     * @private
     */
    _buildHeader(config) {
        const header = document.createElement('div');
        header.className = 'modal-header';

        const title = document.createElement('h2');
        title.id = `${config.id}-title`;
        title.textContent = config.title || 'Modal';
        header.appendChild(title);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.dataset.action = 'close';
        header.appendChild(closeBtn);

        return header;
    },

    /**
     * Build modal body with form
     * @private
     */
    _buildBody(config) {
        const body = document.createElement('div');
        body.className = 'modal-body';

        const form = document.createElement('form');
        form.id = `${config.id}-form`;
        form.setAttribute('novalidate', '');

        // Hidden ID field
        const hiddenId = document.createElement('input');
        hiddenId.type = 'hidden';
        hiddenId.id = `${config.id}-id`;
        form.appendChild(hiddenId);

        // Build form fields
        if (config.fields && config.fields.length > 0) {
            config.fields.forEach(fieldConfig => {
                const fieldElement = this._buildField(config.id, fieldConfig);
                form.appendChild(fieldElement);
            });
        }

        body.appendChild(form);
        return body;
    },

    /**
     * Build form field based on configuration
     * @private
     */
    _buildField(modalId, fieldConfig) {
        const { id, label, type, required, options, placeholder, help, rows, cols } = fieldConfig;

        // Handle form-row (multiple fields in a row)
        if (type === 'row') {
            const row = document.createElement('div');
            row.className = 'form-row';
            fieldConfig.fields.forEach(subField => {
                row.appendChild(this._buildField(modalId, subField));
            });
            return row;
        }

        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        // Label
        if (label) {
            const labelEl = document.createElement('label');
            labelEl.setAttribute('for', `${modalId}-${id}`);
            labelEl.textContent = label;
            if (required) {
                const requiredSpan = document.createElement('span');
                requiredSpan.className = 'required';
                requiredSpan.textContent = ' *';
                labelEl.appendChild(requiredSpan);
            }
            formGroup.appendChild(labelEl);
        }

        // Input element
        let input;

        switch (type) {
            case 'textarea':
                input = document.createElement('textarea');
                input.rows = rows || 3;
                if (cols) input.cols = cols;
                break;

            case 'select':
                input = document.createElement('select');
                if (options && Array.isArray(options)) {
                    options.forEach(opt => {
                        const option = document.createElement('option');
                        option.value = typeof opt === 'object' ? opt.value : opt;
                        option.textContent = typeof opt === 'object' ? opt.label : opt;
                        input.appendChild(option);
                    });
                }
                break;

            default:
                input = document.createElement('input');
                input.type = type || 'text';
        }

        input.id = `${modalId}-${id}`;
        input.className = 'form-control';
        input.dataset.fieldId = id;

        if (required) input.required = true;
        if (placeholder) input.placeholder = placeholder;

        formGroup.appendChild(input);

        // Help text
        if (help) {
            const small = document.createElement('small');
            small.textContent = help;
            formGroup.appendChild(small);
        }

        return formGroup;
    },

    /**
     * Build modal footer
     * @private
     */
    _buildFooter(config, options) {
        const footer = document.createElement('div');
        footer.className = 'modal-footer';

        options.footerButtons.forEach(btnConfig => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.id = `${config.id}-${btnConfig.id}`;
            btn.className = btnConfig.class;
            btn.dataset.action = btnConfig.action;

            if (btnConfig.icon) {
                const icon = document.createElement('i');
                icon.className = btnConfig.icon;
                btn.appendChild(icon);
                btn.appendChild(document.createTextNode(' '));
            }

            btn.appendChild(document.createTextNode(btnConfig.text));
            footer.appendChild(btn);
        });

        return footer;
    },

    /**
     * Bind event listeners
     * @private
     */
    _bindEvents(modalId, config, options) {
        const modalEl = document.getElementById(modalId);
        if (!modalEl) return;

        // Close button
        const closeBtn = modalEl.querySelector('[data-action="close"]');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (config.onCancel) config.onCancel();
                this.close(modalId);
            });
        }

        // Cancel button
        const cancelBtn = modalEl.querySelector('[data-action="close"]');
        if (cancelBtn && cancelBtn !== closeBtn) {
            cancelBtn.addEventListener('click', () => {
                if (config.onCancel) config.onCancel();
                this.close(modalId);
            });
        }

        // Save/Submit button
        const saveBtn = modalEl.querySelector('[data-action="submit"]');
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const form = modalEl.querySelector('form');

                if (form && form.checkValidity && !form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                const data = this.getData(modalId);

                if (config.onSave) {
                    const result = config.onSave(data);
                    // Close modal unless onSave returns false
                    if (result !== false) {
                        this.close(modalId);
                    }
                }
            });
        }

        // Form submit
        const form = modalEl.querySelector('form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (saveBtn) saveBtn.click();
            });
        }

        // Backdrop click
        if (options.closeOnBackdrop) {
            modalEl.addEventListener('click', (e) => {
                if (e.target === modalEl) {
                    if (config.onCancel) config.onCancel();
                    this.close(modalId);
                }
            });
        }

        // Escape key
        if (options.closeOnEscape) {
            const escapeHandler = (e) => {
                if (e.key === 'Escape' && modalEl.classList.contains('active')) {
                    if (config.onCancel) config.onCancel();
                    this.close(modalId);
                }
            };
            document.addEventListener('keydown', escapeHandler);
            // Store handler for cleanup
            modalEl.dataset.escapeHandler = 'registered';
        }
    },

    /**
     * Open a modal
     */
    open(modalId) {
        const modal = this.modals.get(modalId);
        if (!modal) {
            console.error(`Modal '${modalId}' not found`);
            return;
        }

        modal.element.classList.add('active');
        modal.element.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Focus first input
        setTimeout(() => {
            const firstInput = modal.element.querySelector('input:not([type="hidden"]), textarea, select');
            if (firstInput) firstInput.focus();
        }, 100);

        console.log(`✓ Modal opened: ${modalId}`);
    },

    /**
     * Close a modal
     */
    close(modalId) {
        const modal = this.modals.get(modalId);
        if (!modal) {
            console.error(`Modal '${modalId}' not found`);
            return;
        }

        // Remove focus from any focused element inside the modal before hiding
        // This prevents aria-hidden accessibility warnings
        const focusedElement = modal.element.querySelector(':focus');
        if (focusedElement) {
            focusedElement.blur();
        }

        modal.element.classList.remove('active');
        modal.element.setAttribute('aria-hidden', 'true');

        // Only restore scrolling if no other modals are open
        const openModals = document.querySelectorAll('.modal.active');
        if (openModals.length === 0) {
            document.body.style.overflow = '';
        }

        console.log(`✓ Modal closed: ${modalId}`);
    },

    /**
     * Set modal title
     */
    setTitle(modalId, title) {
        const modal = this.modals.get(modalId);
        if (!modal) return;

        const titleEl = modal.element.querySelector(`#${modalId}-title`);
        if (titleEl) titleEl.textContent = title;
    },

    /**
     * Set form data
     */
    setData(modalId, data) {
        const modal = this.modals.get(modalId);
        if (!modal) {
            console.warn(`⚠️ setData: Modal "${modalId}" not found`);
            return;
        }

        const form = modal.element.querySelector('form');
        if (!form) {
            console.warn(`⚠️ setData: Form not found in modal "${modalId}"`);
            return;
        }

        console.log(`📝 setData for ${modalId}:`, data);

        Object.keys(data).forEach(key => {
            // Build selector - only include #modalId-id for the 'id' key specifically
            let selector = `[data-field-id="${key}"], #${modalId}-${key}`;
            if (key === 'id') {
                selector += `, #${modalId}-id`;
            }

            const input = form.querySelector(selector);

            console.log(`  - Field "${key}":`, input ? '✓ Found' : '✗ Not found', `(selector: ${selector})`);

            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = data[key];
                } else {
                    input.value = data[key] || '';
                }
                console.log(`    Set value to:`, input.value || input.checked);
            }
        });

        // Verify values persist after a short delay
        setTimeout(() => {
            console.log(`🔍 Verifying values after 100ms:`);
            Object.keys(data).forEach(key => {
                let selector = `[data-field-id="${key}"], #${modalId}-${key}`;
                if (key === 'id') {
                    selector += `, #${modalId}-id`;
                }
                const input = form.querySelector(selector);
                if (input) {
                    const currentValue = input.type === 'checkbox' ? input.checked : input.value;
                    const expectedValue = data[key] || '';
                    const matches = currentValue == expectedValue;
                    console.log(`  - ${key}: ${matches ? '✓' : '✗'} (expected: "${expectedValue}", actual: "${currentValue}")`);
                }
            });
        }, 100);
    },

    /**
     * Get form data
     */
    getData(modalId) {
        const modal = this.modals.get(modalId);
        if (!modal) return {};

        const form = modal.element.querySelector('form');
        if (!form) return {};

        const data = {};
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            const fieldId = input.dataset.fieldId || input.id.replace(`${modalId}-`, '');

            if (input.type === 'checkbox') {
                data[fieldId] = input.checked;
            } else if (input.type !== 'hidden' || input.id.endsWith('-id')) {
                data[fieldId] = input.value;
            }
        });

        return data;
    },

    /**
     * Reset form
     */
    reset(modalId) {
        const modal = this.modals.get(modalId);
        if (!modal) return;

        const form = modal.element.querySelector('form');
        if (form) form.reset();
    },

    /**
     * Destroy a modal
     */
    destroy(modalId) {
        const modal = this.modals.get(modalId);
        if (!modal) return;

        modal.element.remove();
        this.modals.delete(modalId);

        console.log(`✓ Modal destroyed: ${modalId}`);
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModalFactory;
}
