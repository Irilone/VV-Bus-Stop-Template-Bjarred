/**
 * Atomic Price Toggle Component
 * Handles radio button switching for price table columns
 * Session: JS-MOD-001
 */

import { EventHandlerContract, ComponentError } from '../../interfaces/component-contracts.js';
import { eventManager } from '../core/event-manager.js';

/**
 * Manages the price toggle functionality (e.g., private vs. public).
 */
export class PriceToggle {
  constructor(selector = '.price-toggle-input', options = {}) {
    this.selector = selector;
    this.options = this.mergeOptions(options);
    this.toggles = new Map();
    this.currentView = 'ordinary';
    this.priceTable = null;

    this.init();
  }

  /**
   * Initialize the price toggle component
   */
  init() {
    this.findPriceTable();
    this.setupToggles();
    this.bindEvents();
    this.setInitialState();
    this.emit('vaccine:price-toggle:ready');
  }

  /**
   * Find and cache the price table element
   */
  findPriceTable() {
    this.priceTable = document.querySelector('.price-table, table[class*="price"]');

    if (!this.priceTable) {
      throw new ComponentError('Price table not found', 'PRICE_TABLE_MISSING');
    }

    // Ensure table has proper class for CSS targeting
    if (!this.priceTable.classList.contains('price-table')) {
      this.priceTable.classList.add('price-table');
    }
  }

  /**
   * Setup all toggle elements
   */
  setupToggles() {
    const toggleInputs = document.querySelectorAll(this.selector);

    toggleInputs.forEach((input) => {
      const toggleId = input.id;
      const label = document.querySelector(`label[for="${toggleId}"]`);
      const priceType = this.extractPriceType(toggleId, input);

      if (!toggleId || !label) {
        console.warn('Price toggle missing ID or label:', input);
        return;
      }

      // Setup accessibility
      this.setupAccessibility(input, label);

      // Store toggle data
      this.toggles.set(toggleId, {
        input,
        label,
        priceType,
        isActive: input.checked,
        columnSelector: this.getColumnSelector(priceType)
      });
    });

    // Validate we have required toggles
    this.validateToggles();
  }

  /**
   * Extract price type from toggle element
   * @param {string} toggleId - Toggle input ID
   * @param {Element} input - Toggle input element
   * @returns {string} Price type
   */
  extractPriceType(toggleId, input) {
    // Map common price toggle patterns
    const priceTypeMap = {
      'v-ord': 'ordinary',
      'v-pen': 'pensioner',
      'v-stu': 'student',
      'price-ordinary': 'ordinary',
      'price-pensioner': 'pensioner',
      'price-student': 'student'
    };

    // Try ID-based mapping first
    if (priceTypeMap[toggleId]) {
      return priceTypeMap[toggleId];
    }

    // Try data attribute
    if (input.dataset.priceType) {
      return input.dataset.priceType;
    }

    // Try value attribute
    if (input.value && ['ordinary', 'pensioner', 'student'].includes(input.value)) {
      return input.value;
    }

    // Fallback to ID pattern matching
    if (toggleId.includes('ord')) return 'ordinary';
    if (toggleId.includes('pen')) return 'pensioner';
    if (toggleId.includes('stu')) return 'student';

    return 'ordinary'; // Default fallback
  }

  /**
   * Get column selector for price type
   * @param {string} priceType - Price type
   * @returns {string} CSS selector for columns
   */
  getColumnSelector(priceType) {
    const selectorMap = {
      'ordinary': 'th:nth-child(2), td:nth-child(2)',
      'pensioner': 'th:nth-child(3), td:nth-child(3)',
      'student': 'th:nth-child(4), td:nth-child(4)'
    };

    return selectorMap[priceType] || selectorMap.ordinary;
  }

  /**
   * Setup accessibility attributes
   * @param {Element} input - Toggle input
   * @param {Element} label - Associated label
   */
  setupAccessibility(input, label) {
    // ARIA attributes for radio group
    input.setAttribute('role', 'radio');
    input.setAttribute('aria-describedby', 'price-view-description');

    // Screen reader description
    if (!document.getElementById('price-view-description')) {
      const description = document.createElement('div');
      description.id = 'price-view-description';
      description.className = 'sr-only';
      description.textContent = 'Choose a price view to see relevant pricing information';

      const priceContainer = input.closest('.price-toggles, .price-box');
      if (priceContainer) {
        priceContainer.appendChild(description);
      }
    }

    // Enhanced labels
    if (label && !label.getAttribute('data-enhanced')) {
      label.setAttribute('data-enhanced', 'true');
      label.setAttribute('tabindex', '0');

      // Add price type for screen readers
      const priceType = this.extractPriceType(input.id, input);
      const srText = document.createElement('span');
      srText.className = 'sr-only';
      srText.textContent = ` (${priceType} prices)`;
      label.appendChild(srText);
    }
  }

  /**
   * Validate required toggles exist
   */
  validateToggles() {
    const requiredTypes = ['ordinary'];
    const availableTypes = Array.from(this.toggles.values()).map(t => t.priceType);

    const missing = requiredTypes.filter(type => !availableTypes.includes(type));
    if (missing.length > 0) {
      throw new ComponentError(`Missing required price toggles: ${missing.join(', ')}`, 'TOGGLES_MISSING');
    }
  }

  /**
   * Set initial state
   */
  setInitialState() {
    // Find checked toggle or default to ordinary
    let activeToggle = null;

    for (const [id, toggle] of this.toggles) {
      if (toggle.input.checked) {
        activeToggle = toggle;
        break;
      }
    }

    // Default to ordinary if none checked
    if (!activeToggle) {
      const ordinaryToggle = Array.from(this.toggles.values())
        .find(t => t.priceType === 'ordinary');

      if (ordinaryToggle) {
        ordinaryToggle.input.checked = true;
        activeToggle = ordinaryToggle;
      }
    }

    if (activeToggle) {
      this.currentView = activeToggle.priceType;
      this.updateTableView(activeToggle.priceType);
    }
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Toggle change events
    eventManager.delegate(this.selector, 'change', (event) => {
      this.handleToggleChange(event);
    });

    // Keyboard navigation for labels
    eventManager.delegate('label[for]', 'keydown', (event) => {
      this.handleLabelKeydown(event);
    });

    // Click events for labels
    eventManager.delegate('label[for]', 'click', (event) => {
      this.handleLabelClick(event);
    });
  }

  /**
   * Handle toggle change
   * @param {Event} event - Change event
   */
  handleToggleChange(event) {
    const input = event.target;
    const toggleId = input.id;
    const toggle = this.toggles.get(toggleId);

    if (!toggle || !input.checked) return;

    const previousView = this.currentView;
    this.currentView = toggle.priceType;

    // Update visual state
    this.updateTogglesState();
    this.updateTableView(toggle.priceType);

    // Emit change event
    this.emit('vaccine:price-toggle:changed', {
      previousView,
      currentView: this.currentView,
      toggle: toggle,
      priceTable: this.priceTable
    });

    // Announce change to screen readers
    this.announceViewChange(toggle);
  }

  /**
   * Handle label keyboard navigation
   * @param {Event} event - Keydown event
   */
  handleLabelKeydown(event) {
    const label = event.currentTarget;
    const inputId = label.getAttribute('for');

    if (!inputId || !this.toggles.has(inputId)) return;

    const { key } = event;

    switch (key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        const input = document.getElementById(inputId);
        if (input) {
          input.checked = true;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        this.focusPreviousToggle(label);
        break;

      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextToggle(label);
        break;
    }
  }

  /**
   * Handle label click for accessibility
   * @param {Event} event - Click event
   */
  handleLabelClick(event) {
    const label = event.currentTarget;
    const inputId = label.getAttribute('for');

    if (inputId && this.toggles.has(inputId)) {
      // Ensure focus management
      setTimeout(() => {
        const input = document.getElementById(inputId);
        if (input) {
          input.focus();
        }
      }, 100);
    }
  }

  /**
   * Update toggles visual state
   */
  updateTogglesState() {
    this.toggles.forEach((toggle) => {
      const isActive = toggle.input.checked;
      toggle.isActive = isActive;

      // Update label state
      toggle.label.classList.toggle('active', isActive);
      toggle.label.setAttribute('aria-pressed', isActive);
    });
  }

  /**
   * Update table view based on price type
   * @param {string} priceType - Selected price type
   */
  updateTableView(priceType) {
    if (!this.priceTable) return;

    // Use CSS body class to control column visibility
    // This leverages existing CSS: body:has(#v-pen:checked) .price-table th:nth-child(3)
    document.body.className = document.body.className
      .replace(/price-view-\w+/g, '')
      .trim();

    document.body.classList.add(`price-view-${priceType}`);

    // Fallback: Direct style manipulation if CSS doesn't handle it
    if (this.options.fallbackStyling) {
      this.applyFallbackStyling(priceType);
    }

    // Update table accessibility
    this.updateTableAccessibility(priceType);
  }

  /**
   * Apply fallback styling for column visibility
   * @param {string} priceType - Selected price type
   */
  applyFallbackStyling(priceType) {
    const allColumns = this.priceTable.querySelectorAll('th, td');

    // Hide all price columns first
    allColumns.forEach(cell => {
      const cellIndex = Array.from(cell.parentNode.children).indexOf(cell) + 1;
      if (cellIndex >= 2) { // Price columns start from 2nd
        cell.style.display = 'none';
      }
    });

    // Show selected price column
    const toggle = Array.from(this.toggles.values()).find(t => t.priceType === priceType);
    if (toggle) {
      const selectedColumns = this.priceTable.querySelectorAll(toggle.columnSelector);
      selectedColumns.forEach(cell => {
        cell.style.display = '';
      });
    }
  }

  /**
   * Update table accessibility
   * @param {string} priceType - Current price type
   */
  updateTableAccessibility(priceType) {
    // Update table caption or summary
    let caption = this.priceTable.querySelector('caption');
    if (!caption) {
      caption = document.createElement('caption');
      this.priceTable.insertBefore(caption, this.priceTable.firstChild);
    }

    const priceTypeLabels = {
      'ordinary': 'Ordinarie priser',
      'pensioner': 'Pensionärspriser (10% rabatt)',
      'student': 'Studentpriser (15% rabatt)'
    };

    caption.textContent = `Prislista - ${priceTypeLabels[priceType] || priceTypeLabels.ordinary}`;

    // Update aria-label for table
    this.priceTable.setAttribute('aria-label',
      `Vaccinationspriser för ${priceTypeLabels[priceType] || priceTypeLabels.ordinary}`);
  }

  /**
   * Focus next toggle
   * @param {Element} currentLabel - Current label element
   */
  focusNextToggle(currentLabel) {
    const labels = Array.from(document.querySelectorAll('label[for]'))
      .filter(label => this.toggles.has(label.getAttribute('for')));

    const currentIndex = labels.indexOf(currentLabel);
    const nextIndex = (currentIndex + 1) % labels.length;
    labels[nextIndex].focus();
  }

  /**
   * Focus previous toggle
   * @param {Element} currentLabel - Current label element
   */
  focusPreviousToggle(currentLabel) {
    const labels = Array.from(document.querySelectorAll('label[for]'))
      .filter(label => this.toggles.has(label.getAttribute('for')));

    const currentIndex = labels.indexOf(currentLabel);
    const prevIndex = currentIndex === 0 ? labels.length - 1 : currentIndex - 1;
    labels[prevIndex].focus();
  }

  /**
   * Announce view change to screen readers
   * @param {Object} toggle - Active toggle data
   */
  announceViewChange(toggle) {
    const message = `Pristabell bytt till ${toggle.label.textContent.trim()}`;

    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.classList.add('sr-only');
    announcer.textContent = message;

    document.body.appendChild(announcer);

    setTimeout(() => {
      if (announcer.parentNode) {
        announcer.parentNode.removeChild(announcer);
      }
    }, 1000);
  }

  /**
   * Switch to specific price view
   * @param {string} priceType - Price type to switch to
   */
  switchTo(priceType) {
    const toggle = Array.from(this.toggles.values()).find(t => t.priceType === priceType);

    if (toggle) {
      toggle.input.checked = true;
      toggle.input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  /**
   * Get current price view
   * @returns {string} Current price type
   */
  getCurrentView() {
    return this.currentView;
  }

  /**
   * Get available price types
   * @returns {Array} Array of available price types
   */
  getAvailableViews() {
    return Array.from(this.toggles.values()).map(t => t.priceType);
  }

  /**
   * Destroy component
   */
  destroy() {
    eventManager.off(document, 'change');
    eventManager.off(document, 'keydown');
    eventManager.off(document, 'click');

    this.toggles.clear();

    // Remove body classes
    document.body.className = document.body.className
      .replace(/price-view-\w+/g, '')
      .trim();

    this.emit('vaccine:price-toggle:destroyed');
  }

  /**
   * Emit custom event
   * @param {string} eventType - Event type
   * @param {Object} detail - Event data
   * @returns {boolean}
   */
  emit(eventType, detail = {}) {
    return eventManager.emit(eventType, detail);
  }

  /**
   * Merge options with defaults
   * @param {Object} options - User options
   * @returns {Object} Merged options
   */
  mergeOptions(options) {
    const defaults = {
      fallbackStyling: false,
      announceChanges: true,
      keyboardNavigation: true,
      defaultView: 'ordinary'
    };

    return { ...defaults, ...options };
  }
}

// Export for global access
export default PriceToggle;