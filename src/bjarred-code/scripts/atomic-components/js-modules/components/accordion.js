/**
 * Atomic Accordion Component
 * Extracted from scripts.js FAQ functionality (lines ~144-155)
 * Session: JS-MOD-001
 */

import { EventHandlerContract, ComponentError } from '../../interfaces/component-contracts.js';
import { eventManager } from '../core/event-manager.js';

/**
 * Manages accordion/FAQ functionality.
 */
export class Accordion {
  constructor(options = {}) {
    this.options = {
      accordionSelector: '.faq-item, details[data-accordion]',
      headerSelector: '.faq-question, summary',
      contentSelector: '.faq-answer, .details-content',
      activeClass: 'active',
      ...options,
    };

    this.selector = this.options.accordionSelector;
    this.accordions = new Map();
    this.init();
  }

  /**
   * Initialize the accordion component
   */
  init() {
    this.setupAccordions();
    this.bindEvents();
    this.emit('vaccine:accordion:ready');
  }

  /**
   * Setup all accordion elements
   */
  setupAccordions() {
    const elements = document.querySelectorAll(this.selector);

    elements.forEach((element, index) => {
      const accordionId = element.id || `accordion-${index}`;

      // Enhanced setup for FAQ data attributes (from original scripts.js)
      this.setupFAQDataAttributes(element);

      // Configure accessibility
      this.setupAccessibility(element, accordionId);

      // Store accordion data
      this.accordions.set(accordionId, {
        element,
        isOpen: element.hasAttribute('open'),
        summary: element.querySelector('summary'),
        content: element.querySelector('.faq-content, .accordion-content, .vaccine-content')
      });
    });
  }

  /**
   * Setup FAQ data attributes for CSS styling
   * Extracted from original setupFAQDataAttributes function
   * @param {Element} element - Accordion element
   */
  setupFAQDataAttributes(element) {
    const summary = element.querySelector('summary');
    if (!summary) return;

    // Extract and store question text for CSS styling (original functionality)
    const questionText = summary.textContent.trim();
    if (questionText && !summary.hasAttribute('data-question')) {
      summary.setAttribute('data-question', questionText);

      // Only clear text content if not already processed
      if (!summary.querySelector('.accordion-title, .vaccine-title')) {
        const titleSpan = document.createElement('span');
        titleSpan.className = 'accordion-title';
        titleSpan.textContent = questionText;

        summary.textContent = '';
        summary.appendChild(titleSpan);
      }
    }
  }

  /**
   * Setup accessibility attributes
   * @param {Element} element - Accordion element
   * @param {string} accordionId - Unique accordion ID
   */
  setupAccessibility(element, accordionId) {
    const summary = element.querySelector('summary');
    const content = element.querySelector('.faq-content, .accordion-content, .vaccine-content');

    if (summary && content) {
      // ARIA attributes
      summary.setAttribute('aria-expanded', element.hasAttribute('open'));
      summary.setAttribute('aria-controls', `${accordionId}-content`);
      summary.setAttribute('id', `${accordionId}-header`);

      content.setAttribute('id', `${accordionId}-content`);
      content.setAttribute('aria-labelledby', `${accordionId}-header`);
      content.setAttribute('role', 'region');

      // Enhanced keyboard navigation
      summary.setAttribute('tabindex', '0');

      // Screen reader announcements
      if (this.options.announceChanges) {
        content.setAttribute('aria-live', 'polite');
      }
    }
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Delegate accordion toggle events
    eventManager.delegate(this.selector + ' summary', 'click', (event) => {
      this.handleToggle(event);
    });

    // Keyboard navigation
    eventManager.delegate(this.selector + ' summary', 'keydown', (event) => {
      this.handleKeydown(event);
    });

    // Monitor toggle events for accessibility updates
    eventManager.delegate(this.selector, 'toggle', (event) => {
      this.handleToggleEvent(event);
    });
  }

  /**
   * Handle accordion toggle
   * @param {Event} event - Click event
   */
  handleToggle(event) {
    const summary = event.currentTarget;
    const accordion = summary.closest(this.selector);
    const accordionId = accordion.id || this.getAccordionId(accordion);

    if (!accordion || !this.accordions.has(accordionId)) return;

    const accordionData = this.accordions.get(accordionId);
    const willOpen = !accordion.hasAttribute('open');

    // Single accordion mode
    if (this.options.single && willOpen) {
      this.closeAllExcept(accordionId);
    }

    // Emit events
    this.emit(willOpen ? 'vaccine:accordion:opening' : 'vaccine:accordion:closing', {
      accordionId,
      element: accordion,
      summary,
      content: accordionData.content
    });

    // Update state tracking
    setTimeout(() => {
      accordionData.isOpen = accordion.hasAttribute('open');
      this.activeAccordion = accordionData.isOpen ? accordionId : null;
    }, 0);
  }

  /**
   * Handle keyboard navigation
   * @param {Event} event - Keyboard event
   */
  handleKeydown(event) {
    const { key } = event;
    const summary = event.currentTarget;
    const accordion = summary.closest(this.selector);

    switch (key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        summary.click();
        break;

      case 'ArrowDown':
        event.preventDefault();
        this.focusNext(summary);
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.focusPrevious(summary);
        break;

      case 'Home':
        event.preventDefault();
        this.focusFirst();
        break;

      case 'End':
        event.preventDefault();
        this.focusLast();
        break;

      case 'Escape':
        if (accordion.hasAttribute('open')) {
          accordion.removeAttribute('open');
          summary.focus();
        }
        break;
    }
  }

  /**
   * Handle native toggle event for accessibility updates
   * @param {Event} event - Toggle event
   */
  handleToggleEvent(event) {
    const accordion = event.target;
    const summary = accordion.querySelector('summary');
    const isOpen = accordion.hasAttribute('open');

    if (summary) {
      summary.setAttribute('aria-expanded', isOpen);

      // Announce state change to screen readers
      if (this.options.announceChanges) {
        this.announceStateChange(accordion, isOpen);
      }
    }

    // Emit completion event
    this.emit('vaccine:accordion:toggled', {
      element: accordion,
      isOpen,
      accordionId: accordion.id || this.getAccordionId(accordion)
    });
  }

  /**
   * Close all accordions except specified one
   * @param {string} exceptId - Accordion ID to keep open
   */
  closeAllExcept(exceptId) {
    this.accordions.forEach((data, id) => {
      if (id !== exceptId && data.isOpen) {
        data.element.removeAttribute('open');
        data.isOpen = false;
      }
    });
  }

  /**
   * Focus next accordion
   * @param {Element} currentSummary - Current summary element
   */
  focusNext(currentSummary) {
    const summaries = Array.from(document.querySelectorAll(this.selector + ' summary'));
    const currentIndex = summaries.indexOf(currentSummary);
    const nextIndex = (currentIndex + 1) % summaries.length;
    summaries[nextIndex].focus();
  }

  /**
   * Focus previous accordion
   * @param {Element} currentSummary - Current summary element
   */
  focusPrevious(currentSummary) {
    const summaries = Array.from(document.querySelectorAll(this.selector + ' summary'));
    const currentIndex = summaries.indexOf(currentSummary);
    const prevIndex = currentIndex === 0 ? summaries.length - 1 : currentIndex - 1;
    summaries[prevIndex].focus();
  }

  /**
   * Focus first accordion
   */
  focusFirst() {
    const firstSummary = document.querySelector(this.selector + ' summary');
    if (firstSummary) firstSummary.focus();
  }

  /**
   * Focus last accordion
   */
  focusLast() {
    const summaries = document.querySelectorAll(this.selector + ' summary');
    const lastSummary = summaries[summaries.length - 1];
    if (lastSummary) lastSummary.focus();
  }

  /**
   * Announce state change to screen readers
   * @param {Element} accordion - Accordion element
   * @param {boolean} isOpen - Whether accordion is open
   */
  announceStateChange(accordion, isOpen) {
    const summary = accordion.querySelector('summary');
    const text = summary ? summary.textContent.trim() : 'Accordion';
    const message = `${text} ${isOpen ? 'expanded' : 'collapsed'}`;

    // Create temporary announcement element
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.classList.add('sr-only');
    announcer.textContent = message;

    document.body.appendChild(announcer);

    // Remove after announcement
    setTimeout(() => {
      if (announcer.parentNode) {
        announcer.parentNode.removeChild(announcer);
      }
    }, 1000);
  }

  /**
   * Get accordion ID from element
   * @param {Element} accordion - Accordion element
   * @returns {string} Accordion ID
   */
  getAccordionId(accordion) {
    const accordionKeys = Array.from(this.accordions.keys());
    return accordionKeys.find(id => this.accordions.get(id).element === accordion) || 'unknown';
  }

  /**
   * Open specific accordion
   * @param {string} accordionId - Accordion ID to open
   */
  open(accordionId) {
    const accordionData = this.accordions.get(accordionId);
    if (accordionData && !accordionData.isOpen) {
      accordionData.element.setAttribute('open', '');
    }
  }

  /**
   * Close specific accordion
   * @param {string} accordionId - Accordion ID to close
   */
  close(accordionId) {
    const accordionData = this.accordions.get(accordionId);
    if (accordionData && accordionData.isOpen) {
      accordionData.element.removeAttribute('open');
    }
  }

  /**
   * Toggle specific accordion
   * @param {string} accordionId - Accordion ID to toggle
   */
  toggle(accordionId) {
    const accordionData = this.accordions.get(accordionId);
    if (accordionData) {
      if (accordionData.isOpen) {
        this.close(accordionId);
      } else {
        this.open(accordionId);
      }
    }
  }

  /**
   * Close all accordions
   */
  closeAll() {
    this.accordions.forEach((data) => {
      if (data.isOpen) {
        data.element.removeAttribute('open');
        data.isOpen = false;
      }
    });
  }

  /**
   * Get accordion state
   * @param {string} accordionId - Accordion ID
   * @returns {Object|null} Accordion state
   */
  getState(accordionId) {
    return this.accordions.get(accordionId) || null;
  }

  /**
   * Destroy component
   */
  destroy() {
    eventManager.off(document, 'click');
    eventManager.off(document, 'keydown');
    eventManager.off(document, 'toggle');
    this.accordions.clear();
    this.emit('vaccine:accordion:destroyed');
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
      single: false,
      announceChanges: true,
      keyboardNavigation: true,
      autoClose: false,
      animationDuration: 300
    };

    return { ...defaults, ...options };
  }
}

// Export for global access
export default Accordion;