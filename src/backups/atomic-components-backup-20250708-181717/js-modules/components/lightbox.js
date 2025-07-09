/**
 * Atomic Lightbox Component
 * Extracted from scripts.js lines 202-255
 * Session: JS-MOD-001
 */

import { EventHandlerContract, ComponentError } from '../../interfaces/component-contracts.js';
import { eventManager } from '../core/event-manager.js';

export class Lightbox extends EventHandlerContract {
  constructor(selector = 'img[data-lightbox]', options = {}) {
    super();
    
    this.selector = selector;
    this.options = this.mergeOptions(options);
    this.lightboxElement = null;
    this.isOpen = false;
    this.lastFocusedElement = null;
    this.originalBodyOverflow = null;
    
    this.init();
  }

  /**
   * Initialize the lightbox component
   */
  init() {
    this.createLightboxElement();
    this.bindEvents();
    this.emit('vaccine:lightbox:ready');
  }

  /**
   * Create the lightbox DOM element
   */
  createLightboxElement() {
    if (document.getElementById(this.options.lightboxId)) {
      this.lightboxElement = document.getElementById(this.options.lightboxId);
      return;
    }

    this.lightboxElement = document.createElement('div');
    this.lightboxElement.id = this.options.lightboxId;
    this.lightboxElement.className = 'lightbox-overlay';
    this.lightboxElement.setAttribute('role', 'dialog');
    this.lightboxElement.setAttribute('aria-modal', 'true');
    this.lightboxElement.setAttribute('aria-hidden', 'true');
    this.lightboxElement.setAttribute('aria-labelledby', 'lightbox-title');
    
    this.lightboxElement.innerHTML = `
      <div class="lightbox-container">
        <div class="lightbox-content">
          <img class="lightbox-image" alt="" />
          <div class="lightbox-title" id="lightbox-title"></div>
          <button class="lightbox-close" aria-label="Stäng lightbox">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.lightboxElement);
  }

  /**
   * Bind event listeners using atomic event manager
   */
  bindEvents() {
    // Delegate click events to all lightbox triggers
    eventManager.delegate(this.selector, 'click', this.handleTriggerClick.bind(this));
    
    // Lightbox close events
    eventManager.on(this.lightboxElement, 'click', this.handleBackgroundClick.bind(this));
    eventManager.on(this.lightboxElement.querySelector('.lightbox-close'), 'click', this.close.bind(this));
    
    // Keyboard events
    eventManager.on(document, 'keydown', this.handleKeydown.bind(this));
    
    // Prevent image dragging
    eventManager.delegate('.lightbox-image', 'dragstart', (e) => e.preventDefault());
    
    // Image error handling
    eventManager.on(this.lightboxElement.querySelector('.lightbox-image'), 'error', this.handleImageError.bind(this));
  }

  /**
   * Handle trigger click event
   * @param {Event} event - Click event
   */
  handleTriggerClick(event) {
    event.preventDefault();
    
    const img = event.currentTarget;
    const src = img.src || img.dataset.src;
    const alt = img.alt || img.dataset.alt || '';
    const title = img.title || img.dataset.title || '';
    
    if (!src) {
      console.warn('Lightbox: No image source found');
      return;
    }

    this.open(src, alt, title);
  }

  /**
   * Open lightbox with image
   * @param {string} imageSrc - Image source URL
   * @param {string} imageAlt - Image alt text
   * @param {string} imageTitle - Image title
   */
  open(imageSrc, imageAlt = '', imageTitle = '') {
    if (this.isOpen) return;

    this.lastFocusedElement = document.activeElement;
    this.originalBodyOverflow = document.body.style.overflow;
    
    // Set image data
    const lightboxImage = this.lightboxElement.querySelector('.lightbox-image');
    const lightboxTitle = this.lightboxElement.querySelector('.lightbox-title');
    
    lightboxImage.src = imageSrc;
    lightboxImage.alt = imageAlt;
    lightboxTitle.textContent = imageTitle;
    
    // Show lightbox
    this.lightboxElement.style.display = 'flex';
    this.lightboxElement.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Focus management
    requestAnimationFrame(() => {
      this.lightboxElement.querySelector('.lightbox-close').focus();
    });
    
    this.isOpen = true;
    this.emit('vaccine:lightbox:opened', { src: imageSrc, alt: imageAlt, title: imageTitle });
  }

  /**
   * Close lightbox
   */
  close() {
    if (!this.isOpen) return;

    this.lightboxElement.style.display = 'none';
    this.lightboxElement.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = this.originalBodyOverflow;
    
    // Restore focus
    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
    }
    
    this.isOpen = false;
    this.emit('vaccine:lightbox:closed');
  }

  /**
   * Handle background click
   * @param {Event} event - Click event
   */
  handleBackgroundClick(event) {
    if (event.target === this.lightboxElement || 
        event.target.classList.contains('lightbox-container')) {
      this.close();
    }
  }

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeydown(event) {
    if (!this.isOpen) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      
      case 'Tab':
        this.trapFocus(event);
        break;
    }
  }

  /**
   * Trap focus within lightbox
   * @param {KeyboardEvent} event - Tab key event
   */
  trapFocus(event) {
    const focusableElements = this.lightboxElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey) {
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  /**
   * Handle image loading errors
   * @param {Event} event - Error event
   */
  handleImageError(event) {
    const img = event.target;
    const container = img.closest('.lightbox-content');
    
    container.innerHTML = `
      <div class="lightbox-error">
        <p>Bilden kunde inte laddas</p>
        <button class="lightbox-close" aria-label="Stäng lightbox">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    `;
    
    // Re-bind close event
    eventManager.on(container.querySelector('.lightbox-close'), 'click', this.close.bind(this));
    
    this.emit('vaccine:lightbox:error', { src: img.src });
  }

  /**
   * Add event listener
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   */
  on(event, handler, options = {}) {
    eventManager.on(this.lightboxElement, event, handler, options);
    return this;
  }

  /**
   * Remove event listener
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   */
  off(event, handler) {
    eventManager.off(this.lightboxElement, event, handler);
    return this;
  }

  /**
   * Add one-time event listener
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   */
  once(event, handler) {
    eventManager.once(this.lightboxElement, event, handler);
    return this;
  }

  /**
   * Emit custom event
   * @param {string} eventType - Event type
   * @param {Object} detail - Event data
   */
  emit(eventType, detail = {}) {
    return eventManager.emit(eventType, detail, this.lightboxElement);
  }

  /**
   * Get component configuration
   * @returns {Object}
   */
  getConfig() {
    return { ...this.options };
  }

  /**
   * Update component configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    this.options = this.mergeOptions(newConfig);
    this.emit('vaccine:lightbox:config-updated', this.options);
  }

  /**
   * Get component state
   * @returns {Object}
   */
  getState() {
    return {
      isOpen: this.isOpen,
      selector: this.selector,
      hasElement: Boolean(this.lightboxElement),
      lastFocusedElement: this.lastFocusedElement
    };
  }

  /**
   * Merge options with defaults
   * @param {Object} options - User options
   * @returns {Object} Merged options
   */
  mergeOptions(options) {
    const defaults = {
      lightboxId: 'vaccine-lightbox',
      closeOnEscape: true,
      closeOnBackground: true,
      trapFocus: true,
      restoreFocus: true,
      preventBodyScroll: true,
      fadeAnimation: true,
      errorMessage: 'Bilden kunde inte laddas'
    };
    
    return { ...defaults, ...options };
  }

  /**
   * Destroy component and clean up
   */
  destroy() {
    if (this.isOpen) {
      this.close();
    }
    
    // Remove event listeners through event manager
    eventManager.undelegate(this.selector, 'click', this.handleTriggerClick);
    
    // Remove lightbox element
    if (this.lightboxElement && this.lightboxElement.parentNode) {
      this.lightboxElement.parentNode.removeChild(this.lightboxElement);
    }
    
    // Reset state
    this.lightboxElement = null;
    this.isOpen = false;
    this.lastFocusedElement = null;
    
    this.emit('vaccine:lightbox:destroyed');
  }
}