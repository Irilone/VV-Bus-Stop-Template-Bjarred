/**
 * Atomic Responsive Table Component
 * Handles horizontal scrolling and mobile table optimization
 * Session: JS-MOD-001
 */

import { EventHandlerContract, ComponentError } from '../../interfaces/component-contracts.js';
import { eventManager } from '../core/event-manager.js';

/**
 * Makes tables responsive by wrapping them in a container.
 */
export class ResponsiveTable {
  constructor(selector = '.location-schedule, .price-table, table', options = {}) {
    this.selector = selector;
    this.options = this.mergeOptions(options);
    this.tables = new Map();
    this.scrollObservers = new WeakMap();
    this.resizeObserver = null;

    this.init();
  }

  /**
   * Initialize the responsive table component
   */
  init() {
    this.setupTables();
    this.bindEvents();
    this.setupResizeObserver();
    this.emit('vaccine:responsive-table:ready');
  }

  /**
   * Setup all table elements
   */
  setupTables() {
    // Validate selector
    if (typeof this.selector !== 'string') {
      console.error('ResponsiveTable: selector must be a string, got:', typeof this.selector, this.selector);
      return;
    }

    const tableElements = document.querySelectorAll(this.selector);

    tableElements.forEach((table, index) => {
      const tableId = table.id || `responsive-table-${index}`;

      // Create scroll container wrapper
      const wrapper = this.createScrollWrapper(table, tableId);

      // Setup table accessibility
      this.setupTableAccessibility(table, tableId);

      // Setup scroll indicators
      const indicators = this.setupScrollIndicators(wrapper);

      // Store table data
      this.tables.set(tableId, {
        table,
        wrapper,
        indicators,
        isScrollable: false,
        scrollPosition: 0,
        maxScroll: 0
      });

      // Initial scroll state check
      this.checkScrollability(tableId);
    });
  }

  /**
   * Create scroll wrapper for table
   * @param {Element} table - Table element
   * @param {string} tableId - Table ID
   * @returns {Element} Wrapper element
   */
  createScrollWrapper(table, tableId) {
    // Check if already wrapped
    if (table.parentElement?.classList.contains('table-scroll-container')) {
      return table.parentElement;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll-container';
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', 'Scrollable table');
    wrapper.setAttribute('tabindex', '0');
    wrapper.setAttribute('data-table-id', tableId);

    // Insert wrapper
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);

    // Add responsive styling
    this.applyResponsiveStyles(wrapper);

    return wrapper;
  }

  /**
   * Apply responsive styles to wrapper
   * @param {Element} wrapper - Wrapper element
   */
  applyResponsiveStyles(wrapper) {
    const styles = {
      overflowX: 'auto',
      overflowY: 'hidden',
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'thin',
      msOverflowStyle: 'auto',
      position: 'relative',
      border: '1px solid var(--clr-border, #e0e0e0)',
      borderRadius: 'var(--radius-md, 8px)',
      background: 'var(--clr-bg, #ffffff)',
      marginBottom: 'var(--space-md, 1rem)'
    };

    Object.assign(wrapper.style, styles);

    // Add scroll behavior class
    wrapper.classList.add('responsive-table-wrapper');
  }

  /**
   * Setup table accessibility
   * @param {Element} table - Table element
   * @param {string} tableId - Table ID
   */
  setupTableAccessibility(table, tableId) {
    // Ensure table has proper attributes
    if (!table.getAttribute('role')) {
      table.setAttribute('role', 'table');
    }

    // Add table summary if missing
    if (!table.querySelector('caption') && this.options.addCaption) {
      this.addTableCaption(table);
    }

    // Setup header relationships
    this.setupHeaderRelationships(table);

    // Add scroll instructions for screen readers
    this.addScrollInstructions(table, tableId);
  }

  /**
   * Add table caption
   * @param {Element} table - Table element
   */
  addTableCaption(table) {
    const caption = document.createElement('caption');

    // Determine caption text based on table content
    let captionText = 'Data table';

    if (table.classList.contains('location-schedule')) {
      captionText = 'Vaccination schedule and location information';
    } else if (table.classList.contains('price-table')) {
      captionText = 'Vaccination pricing information';
    }

    caption.textContent = captionText;
    caption.classList.add('sr-only'); // Hidden but accessible

    table.insertBefore(caption, table.firstChild);
  }

  /**
   * Setup header relationships for accessibility
   * @param {Element} table - Table element
   */
  setupHeaderRelationships(table) {
    const headers = table.querySelectorAll('th');
    const cells = table.querySelectorAll('td');

    // Add IDs to headers
    headers.forEach((header, index) => {
      if (!header.id) {
        header.id = `header-${Date.now()}-${index}`;
      }

      if (!header.getAttribute('scope')) {
        // Determine scope based on position
        const row = header.parentElement;
        const headerIndex = Array.from(row.children).indexOf(header);
        header.setAttribute('scope', headerIndex === 0 ? 'row' : 'col');
      }
    });

    // Link cells to headers
    cells.forEach(cell => {
      if (!cell.getAttribute('headers')) {
        const row = cell.parentElement;
        const cellIndex = Array.from(row.children).indexOf(cell);
        const headerRow = table.querySelector('thead tr, tr:first-child');

        if (headerRow) {
          const correspondingHeader = headerRow.children[cellIndex];
          if (correspondingHeader && correspondingHeader.id) {
            cell.setAttribute('headers', correspondingHeader.id);
          }
        }
      }
    });
  }

  /**
   * Add scroll instructions for screen readers
   * @param {Element} table - Table element
   * @param {string} tableId - Table ID
   */
  addScrollInstructions(table, tableId) {
    if (document.getElementById(`${tableId}-scroll-hint`)) return;

    const hint = document.createElement('div');
    hint.id = `${tableId}-scroll-hint`;
    hint.className = 'sr-only';
    hint.setAttribute('aria-live', 'polite');
    hint.textContent = 'Use arrow keys or swipe to scroll horizontally in this table';

    table.parentElement.insertBefore(hint, table);
  }

  /**
   * Setup scroll indicators
   * @param {Element} wrapper - Wrapper element
   * @returns {Object} Indicator elements
   */
  setupScrollIndicators(wrapper) {
    if (!this.options.showScrollIndicators) {
      return { left: null, right: null };
    }

    const leftIndicator = this.createScrollIndicator('left');
    const rightIndicator = this.createScrollIndicator('right');

    wrapper.appendChild(leftIndicator);
    wrapper.appendChild(rightIndicator);

    return { left: leftIndicator, right: rightIndicator };
  }

  /**
   * Create scroll indicator
   * @param {string} direction - Indicator direction
   * @returns {Element} Indicator element
   */
  createScrollIndicator(direction) {
    const indicator = document.createElement('div');
    indicator.className = `scroll-indicator scroll-indicator--${direction}`;
    indicator.setAttribute('aria-hidden', 'true');
    indicator.innerHTML = direction === 'left' ? '◀' : '▶';

    const styles = {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '0.5rem',
      borderRadius: '50%',
      fontSize: '0.8rem',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity 0.3s ease',
      zIndex: '10',
      [direction]: '0.5rem'
    };

    Object.assign(indicator.style, styles);

    return indicator;
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Scroll events for each table wrapper
    this.tables.forEach((tableData, tableId) => {
      const { wrapper } = tableData;

      eventManager.on(wrapper, 'scroll', (event) => {
        this.handleScroll(event, tableId);
      });

      // Keyboard navigation
      eventManager.on(wrapper, 'keydown', (event) => {
        this.handleKeyboardNavigation(event, tableId);
      });

      // Focus events for accessibility
      eventManager.on(wrapper, 'focus', (event) => {
        this.handleFocus(event, tableId);
      });

      eventManager.on(wrapper, 'blur', (event) => {
        this.handleBlur(event, tableId);
      });
    });

    // Window resize events
    window.addEventListener('resize', this.debounce(() => {
      this.handleResize();
    }, 250));
  }

  /**
   * Setup resize observer for dynamic content
   */
  setupResizeObserver() {
    if (!window.ResizeObserver) return;

    this.resizeObserver = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        const wrapper = entry.target;
        const tableId = wrapper.getAttribute('data-table-id');
        if (tableId && this.tables.has(tableId)) {
          this.checkScrollability(tableId);
        }
      });
    });

    // Observe all table wrappers
    this.tables.forEach(({ wrapper }) => {
      this.resizeObserver.observe(wrapper);
    });
  }

  /**
   * Handle scroll events
   * @param {Event} event - Scroll event
   * @param {string} tableId - Table ID
   */
  handleScroll(event, tableId) {
    const wrapper = event.currentTarget;
    const tableData = this.tables.get(tableId);

    if (!tableData) return;

    const scrollLeft = wrapper.scrollLeft;
    const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;

    // Update table data
    tableData.scrollPosition = scrollLeft;
    tableData.maxScroll = maxScroll;

    // Update scroll indicators
    this.updateScrollIndicators(tableId);

    // Emit scroll event
    this.emit('vaccine:table:scroll', {
      tableId,
      scrollLeft,
      maxScroll,
      scrollPercentage: maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0
    });

    // Update accessibility
    this.updateScrollAccessibility(tableId);
  }

  /**
   * Handle keyboard navigation
   * @param {Event} event - Keyboard event
   * @param {string} tableId - Table ID
   */
  handleKeyboardNavigation(event, tableId) {
    const { key } = event;
    const tableData = this.tables.get(tableId);

    if (!tableData || !tableData.isScrollable) return;

    const { wrapper } = tableData;
    const scrollAmount = 50;

    switch (key) {
      case 'ArrowLeft':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          wrapper.scrollLeft = Math.max(0, wrapper.scrollLeft - scrollAmount);
        }
        break;

      case 'ArrowRight':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          wrapper.scrollLeft = Math.min(
            wrapper.scrollWidth - wrapper.clientWidth,
            wrapper.scrollLeft + scrollAmount
          );
        }
        break;

      case 'Home':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          wrapper.scrollLeft = 0;
        }
        break;

      case 'End':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          wrapper.scrollLeft = wrapper.scrollWidth - wrapper.clientWidth;
        }
        break;
    }
  }

  /**
   * Handle focus events
   * @param {Event} event - Focus event
   * @param {string} tableId - Table ID
   */
  handleFocus(event, tableId) {
    const tableData = this.tables.get(tableId);

    if (tableData && tableData.isScrollable) {
      // Show scroll instructions
      this.showScrollInstructions(tableId);
    }
  }

  /**
   * Handle blur events
   * @param {Event} event - Blur event
   * @param {string} tableId - Table ID
   */
  handleBlur(event, tableId) {
    // Hide scroll instructions after a delay
    setTimeout(() => {
      this.hideScrollInstructions(tableId);
    }, 100);
  }

  /**
   * Handle window resize
   */
  handleResize() {
    this.tables.forEach((tableData, tableId) => {
      this.checkScrollability(tableId);
    });
  }

  /**
   * Check if table needs horizontal scrolling
   * @param {string} tableId - Table ID
   */
  checkScrollability(tableId) {
    const tableData = this.tables.get(tableId);
    if (!tableData) return;

    const { wrapper, table } = tableData;
    const wasScrollable = tableData.isScrollable;

    // Check if content overflows
    const isScrollable = table.scrollWidth > wrapper.clientWidth;
    tableData.isScrollable = isScrollable;

    // Update wrapper attributes
    wrapper.setAttribute('data-scrollable', isScrollable);
    wrapper.classList.toggle('is-scrollable', isScrollable);

    // Update scroll indicators
    this.updateScrollIndicators(tableId);

    // Emit event if state changed
    if (wasScrollable !== isScrollable) {
      this.emit('vaccine:table:scrollability-changed', {
        tableId,
        isScrollable,
        wrapper,
        table
      });
    }
  }

  /**
   * Update scroll indicators
   * @param {string} tableId - Table ID
   */
  updateScrollIndicators(tableId) {
    const tableData = this.tables.get(tableId);
    if (!tableData || !tableData.indicators.left) return;

    const { wrapper, indicators, isScrollable, scrollPosition, maxScroll } = tableData;

    if (!isScrollable) {
      indicators.left.style.opacity = '0';
      indicators.right.style.opacity = '0';
      return;
    }

    // Show/hide left indicator
    indicators.left.style.opacity = scrollPosition > 0 ? '1' : '0';

    // Show/hide right indicator
    indicators.right.style.opacity = scrollPosition < maxScroll ? '1' : '0';
  }

  /**
   * Update scroll accessibility
   * @param {string} tableId - Table ID
   */
  updateScrollAccessibility(tableId) {
    const tableData = this.tables.get(tableId);
    if (!tableData) return;

    const { wrapper, scrollPosition, maxScroll } = tableData;
    const scrollPercentage = maxScroll > 0 ? (scrollPosition / maxScroll) * 100 : 0;

    // Update aria-valuenow for scroll position
    wrapper.setAttribute('aria-valuenow', Math.round(scrollPercentage));
    wrapper.setAttribute('aria-valuemin', '0');
    wrapper.setAttribute('aria-valuemax', '100');
    wrapper.setAttribute('aria-valuetext', `${Math.round(scrollPercentage)}% scrolled`);
  }

  /**
   * Show scroll instructions
   * @param {string} tableId - Table ID
   */
  showScrollInstructions(tableId) {
    const hint = document.getElementById(`${tableId}-scroll-hint`);
    if (hint) {
      hint.textContent = 'Use Ctrl+Arrow keys to scroll horizontally, or swipe on touch devices';
    }
  }

  /**
   * Hide scroll instructions
   * @param {string} tableId - Table ID
   */
  hideScrollInstructions(tableId) {
    const hint = document.getElementById(`${tableId}-scroll-hint`);
    if (hint) {
      hint.textContent = '';
    }
  }

  /**
   * Scroll table to specific position
   * @param {string} tableId - Table ID
   * @param {number} position - Scroll position (0-100)
   */
  scrollTo(tableId, position) {
    const tableData = this.tables.get(tableId);
    if (!tableData) return;

    const { wrapper } = tableData;
    const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
    const targetScroll = (position / 100) * maxScroll;

    wrapper.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  }

  /**
   * Scroll table to start
   * @param {string} tableId - Table ID
   */
  scrollToStart(tableId) {
    this.scrollTo(tableId, 0);
  }

  /**
   * Scroll table to end
   * @param {string} tableId - Table ID
   */
  scrollToEnd(tableId) {
    this.scrollTo(tableId, 100);
  }

  /**
   * Get table scroll state
   * @param {string} tableId - Table ID
   * @returns {Object|null} Scroll state
   */
  getScrollState(tableId) {
    const tableData = this.tables.get(tableId);
    if (!tableData) return null;

    const { scrollPosition, maxScroll, isScrollable } = tableData;

    return {
      scrollPosition,
      maxScroll,
      isScrollable,
      scrollPercentage: maxScroll > 0 ? (scrollPosition / maxScroll) * 100 : 0
    };
  }

  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Destroy component
   */
  destroy() {
    // Clean up resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // Remove event listeners
    this.tables.forEach(({ wrapper }) => {
      eventManager.off(wrapper, 'scroll');
      eventManager.off(wrapper, 'keydown');
      eventManager.off(wrapper, 'focus');
      eventManager.off(wrapper, 'blur');
    });

    eventManager.off(window, 'resize');

    // Clean up DOM
    this.tables.forEach(({ wrapper, indicators }) => {
      if (indicators.left) indicators.left.remove();
      if (indicators.right) indicators.right.remove();
    });

    this.tables.clear();
    this.emit('vaccine:responsive-table:destroyed');
  }

  /**
   * Emit custom event
   * @param {string} eventType - Event type
   * @param {Object} detail - Event data
   */
  emit(eventType, detail = {}) {
    return eventManager.emit(eventType, detail, document);
  }

  /**
   * Merge options with defaults
   * @param {Object} options - User options
   * @returns {Object} Merged options
   */
  mergeOptions(options) {
    const defaults = {
      showScrollIndicators: true,
      addCaption: true,
      keyboardNavigation: true,
      smoothScroll: true,
      scrollSensitivity: 50
    };

    return { ...defaults, ...options };
  }
}

// Export for global access
export default ResponsiveTable;