/**
 * Atomic Smooth Scroll Component
 * Extracted from scripts.js lines 118-132
 * Session: JS-MOD-001
 */

import { EventHandlerContract, ComponentError } from '../../interfaces/component-contracts.js';
import { eventManager } from '../core/event-manager.js';

/**
 * Provides smooth scrolling for anchor links.
 */
export class SmoothScroll {
  constructor(selector = 'a[href^="#"]', options = {}) {
    this.selector = selector;
    this.options = this.mergeOptions(options);
    this.activeScrolls = new Set();

    this.init();
  }

  /**
   * Initialize the smooth scroll component
   */
  init() {
    this.bindEvents();
    this.emit('vaccine:smoothscroll:ready');
  }

  /**
   * Bind event listeners using atomic event manager
   */
  bindEvents() {
    // Validate selector
    if (typeof this.selector !== 'string') {
      console.error('SmoothScroll: selector must be a string, got:', typeof this.selector, this.selector);
      return;
    }

    // Delegate click events to all anchor links
    eventManager.delegate(this.selector, 'click', this.handleClick.bind(this));

    // Cancel scroll on user interaction
    if (this.options.cancelOnInteraction) {
      eventManager.on(document, 'wheel', this.cancelActiveScrolls.bind(this), { passive: true });
      eventManager.on(document, 'touchstart', this.cancelActiveScrolls.bind(this), { passive: true });
      eventManager.on(document, 'keydown', this.handleKeyDown.bind(this));
    }
  }

  /**
   * Handle anchor link clicks
   * @param {Event} event - Click event
   */
  handleClick(event) {
    const anchor = event.currentTarget;
    const href = anchor.getAttribute('href');

    // Skip if not a hash link or external link
    if (!href || !href.startsWith('#') || href === '#') {
      return;
    }

    // Skip if disabled
    if (anchor.hasAttribute('data-no-smooth') || anchor.classList.contains('no-smooth')) {
      return;
    }

    const targetId = href.slice(1);
    const targetElement = document.getElementById(targetId);

    if (!targetElement) {
      console.warn(`SmoothScroll: Target element not found: ${targetId}`);
      return;
    }

    event.preventDefault();

    this.scrollTo(targetElement, {
      trigger: anchor,
      hash: href
    });
  }

  /**
   * Scroll to target element
   * @param {Element} targetElement - Target element to scroll to
   * @param {Object} options - Scroll options
   */
  scrollTo(targetElement, options = {}) {
    const scrollOptions = {
      ...this.options,
      ...options
    };

    // Calculate target position
    const targetRect = targetElement.getBoundingClientRect();
    const targetPosition = window.pageYOffset + targetRect.top - scrollOptions.offset;

    // Cancel any active scrolls
    this.cancelActiveScrolls();

    // Emit scroll start event
    this.emit('vaccine:smoothscroll:start', {
      target: targetElement,
      targetPosition,
      trigger: options.trigger
    });

    // Perform scroll
    if (this.options.useNativeScroll && 'scrollBehavior' in document.documentElement.style) {
      this.nativeScrollTo(targetElement, scrollOptions);
    } else {
      this.animatedScrollTo(targetPosition, scrollOptions);
    }

    // Update hash if enabled
    if (scrollOptions.updateHash && options.hash) {
      this.updateHash(options.hash);
    }

    // Manage focus
    if (scrollOptions.manageFocus) {
      this.manageFocus(targetElement);
    }
  }

  /**
   * Use native smooth scroll
   * @param {Element} targetElement - Target element
   * @param {Object} options - Scroll options
   */
  nativeScrollTo(targetElement, options) {
    const scrollId = Symbol('nativeScroll');
    this.activeScrolls.add(scrollId);

    window.scrollTo({
      top: window.pageYOffset + targetElement.getBoundingClientRect().top - options.offset,
      behavior: 'smooth'
    });

    // Listen for scroll end (approximation)
    const checkScrollEnd = () => {
      if (!this.activeScrolls.has(scrollId)) return;

      const currentPos = window.pageYOffset;
      const targetPos = window.pageYOffset + targetElement.getBoundingClientRect().top - options.offset;

      if (Math.abs(currentPos - targetPos) < 5) {
        this.activeScrolls.delete(scrollId);
        this.emit('vaccine:smoothscroll:complete', {
          target: targetElement,
          finalPosition: currentPos
        });
      } else {
        requestAnimationFrame(checkScrollEnd);
      }
    };

    requestAnimationFrame(checkScrollEnd);
  }

  /**
   * Use animated scroll with easing
   * @param {number} targetPosition - Target scroll position
   * @param {Object} options - Scroll options
   */
  animatedScrollTo(targetPosition, options) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = this.calculateDuration(Math.abs(distance));
    const startTime = performance.now();

    const scrollId = Symbol('animatedScroll');
    this.activeScrolls.add(scrollId);

    const animateScroll = (currentTime) => {
      if (!this.activeScrolls.has(scrollId)) return;

      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      // Apply easing function
      const easedProgress = this.applyEasing(progress, options.easing);

      // Calculate current position
      const currentPosition = startPosition + (distance * easedProgress);

      // Scroll to position
      window.scrollTo(0, currentPosition);

      // Continue animation or complete
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        this.activeScrolls.delete(scrollId);
        this.emit('vaccine:smoothscroll:complete', {
          finalPosition: currentPosition,
          duration: elapsedTime
        });
      }
    };

    requestAnimationFrame(animateScroll);
  }

  /**
   * Calculate scroll duration based on distance
   * @param {number} distance - Scroll distance
   * @returns {number} Duration in milliseconds
   */
  calculateDuration(distance) {
    const baseSpeed = this.options.speed;
    const minDuration = this.options.minDuration;
    const maxDuration = this.options.maxDuration;

    // Calculate duration based on distance
    const calculatedDuration = Math.abs(distance) / baseSpeed;

    // Clamp between min and max
    return Math.max(minDuration, Math.min(maxDuration, calculatedDuration));
  }

  /**
   * Apply easing function
   * @param {number} progress - Animation progress (0-1)
   * @param {string} easing - Easing function name
   * @returns {number} Eased progress
   */
  applyEasing(progress, easing) {
    switch (easing) {
      case 'linear':
        return progress;

      case 'ease-in':
        return progress * progress;

      case 'ease-out':
        return 1 - Math.pow(1 - progress, 2);

      case 'ease-in-out':
      default:
        return progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    }
  }

  /**
   * Update URL hash
   * @param {string} hash - Hash to update
   */
  updateHash(hash) {
    if (history.pushState) {
      history.pushState(null, null, hash);
    } else {
      location.hash = hash;
    }
  }

  /**
   * Manage focus on target element
   * @param {Element} targetElement - Target element
   */
  manageFocus(targetElement) {
    // Set tabindex if not already focusable
    if (!targetElement.hasAttribute('tabindex')) {
      targetElement.setAttribute('tabindex', '-1');
    }

    // Focus after a brief delay to ensure scroll completion
    setTimeout(() => {
      targetElement.focus();

      // Announce to screen readers
      if (this.options.announceToScreenReaders) {
        this.announceToScreenReaders(`Navigerat till ${targetElement.textContent || targetElement.id}`);
      }
    }, 100);
  }

  /**
   * Announce to screen readers
   * @param {string} message - Message to announce
   */
  announceToScreenReaders(message) {
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
   * Cancel all active scrolls
   */
  cancelActiveScrolls() {
    this.activeScrolls.clear();
    this.emit('vaccine:smoothscroll:cancelled');
  }

  /**
   * Handle keyboard interactions that should cancel scroll
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyDown(event) {
    const cancelKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Space'];

    if (cancelKeys.includes(event.key)) {
      this.cancelActiveScrolls();
    }
  }

  /**
   * Add event listener
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   */
  on(event, handler, options = {}) {
    eventManager.on(document, event, handler, options);
    return this;
  }

  /**
   * Remove event listener
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   */
  off(event, handler) {
    eventManager.off(document, event, handler);
    return this;
  }

  /**
   * Add one-time event listener
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   */
  once(event, handler) {
    eventManager.once(document, event, handler);
    return this;
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
    this.emit('vaccine:smoothscroll:config-updated', this.options);
  }

  /**
   * Get component state
   * @returns {Object}
   */
  getState() {
    return {
      selector: this.selector,
      activeScrolls: this.activeScrolls.size,
      isScrolling: this.activeScrolls.size > 0
    };
  }

  /**
   * Merge options with defaults
   * @param {Object} options - User options
   * @returns {Object} Merged options
   */
  mergeOptions(options) {
    const defaults = {
      offset: 0,
      speed: 1, // pixels per millisecond
      minDuration: 250,
      maxDuration: 1500,
      easing: 'ease-in-out',
      updateHash: true,
      manageFocus: true,
      announceToScreenReaders: true,
      cancelOnInteraction: true,
      useNativeScroll: false
    };

    return { ...defaults, ...options };
  }

  /**
   * Destroy component and clean up
   */
  destroy() {
    this.cancelActiveScrolls();

    // Remove event listeners through event manager
    eventManager.undelegate(this.selector, 'click', this.handleClick);

    if (this.options.cancelOnInteraction) {
      eventManager.off(document, 'wheel', this.cancelActiveScrolls);
      eventManager.off(document, 'touchstart', this.cancelActiveScrolls);
      eventManager.off(document, 'keydown', this.handleKeyDown);
    }

    this.emit('vaccine:smoothscroll:destroyed');
  }
}