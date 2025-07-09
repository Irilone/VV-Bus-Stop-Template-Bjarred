/**
 * Atomic Event Manager
 * Centralized event handling with delegation, debouncing, and throttling
 * Session: JS-MOD-001
 */

import { EventManagerContract, ComponentError } from '../../interfaces/component-contracts.js';

/**
 * High-performance atomic event manager
 * Implements the complete event management system
 */
export class EventManager extends EventManagerContract {
  constructor(options = {}) {
    super();
    
    this.options = this.mergeOptions(options);
    this.delegatedEvents = new Map();
    this.debouncedEvents = new Map();
    this.throttledEvents = new Map();
    this.eventCache = new Map();
    
    // Performance tracking
    this.metrics = {
      eventsRegistered: 0,
      eventsTriggered: 0,
      delegatedEvents: 0,
      debouncedEvents: 0,
      throttledEvents: 0
    };
    
    this.init();
  }

  /**
   * Initialize the event manager
   */
  init() {
    this.setupGlobalHandlers();
    this.loadEventTypes();
    this.emit('vaccine:eventmanager:ready');
  }

  /**
   * Load event configuration from design tokens
   */
  async loadEventTypes() {
    try {
      const response = await fetch('/src/js/atomic-components/design-tokens/event-types.json');
      this.eventTypes = await response.json();
    } catch (error) {
      console.warn('Could not load event types, using defaults');
      this.eventTypes = this.getDefaultEventTypes();
    }
  }

  /**
   * Setup global event handlers for delegation
   */
  setupGlobalHandlers() {
    // Use single global handler for all delegated events
    this.globalHandler = this.createGlobalHandler();
    
    // Common event types for delegation
    const eventTypes = [
      'click', 'mouseenter', 'mouseleave', 'focus', 'blur',
      'input', 'change', 'keydown', 'keyup', 'submit'
    ];
    
    eventTypes.forEach(eventType => {
      document.addEventListener(eventType, this.globalHandler, {
        passive: this.isPassiveEvent(eventType),
        capture: true
      });
    });
  }

  /**
   * Create optimized global event handler
   */
  createGlobalHandler() {
    return (event) => {
      this.metrics.eventsTriggered++;
      
      const eventKey = `${event.type}`;
      const delegators = this.delegatedEvents.get(eventKey);
      
      if (!delegators || delegators.size === 0) return;
      
      // Walk up the DOM tree to find matching selectors
      let element = event.target;
      const matchedHandlers = [];
      
      while (element && element !== document) {
        delegators.forEach((handlers, selector) => {
          if (element.matches && element.matches(selector)) {
            handlers.forEach(handler => {
              matchedHandlers.push({ handler, element, selector });
            });
          }
        });
        element = element.parentElement;
      }
      
      // Execute matched handlers in reverse order (most specific first)
      matchedHandlers.reverse().forEach(({ handler, element, selector }) => {
        try {
          const boundEvent = Object.assign({}, event, {
            delegateTarget: element,
            currentSelector: selector
          });
          handler.call(element, boundEvent);
        } catch (error) {
          this.handleError(error, 'delegation', { selector, event: event.type });
        }
      });
    };
  }

  /**
   * Delegate event listener to descendants
   * @param {string} selector - CSS selector for delegation
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   */
  delegate(selector, event, handler, options = {}) {
    this.validateDelegationParams(selector, event, handler);
    
    const eventKey = event;
    
    if (!this.delegatedEvents.has(eventKey)) {
      this.delegatedEvents.set(eventKey, new Map());
    }
    
    const eventMap = this.delegatedEvents.get(eventKey);
    
    if (!eventMap.has(selector)) {
      eventMap.set(selector, new Set());
    }
    
    eventMap.get(selector).add(handler);
    
    this.metrics.eventsRegistered++;
    this.metrics.delegatedEvents++;
    
    // Store handler reference for removal
    this.storeHandlerReference(selector, event, handler, 'delegate');
    
    return this;
  }

  /**
   * Remove delegated event listener
   * @param {string} selector - CSS selector
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   */
  undelegate(selector, event, handler) {
    const eventKey = event;
    const eventMap = this.delegatedEvents.get(eventKey);
    
    if (!eventMap || !eventMap.has(selector)) return this;
    
    const handlers = eventMap.get(selector);
    handlers.delete(handler);
    
    // Clean up empty maps
    if (handlers.size === 0) {
      eventMap.delete(selector);
      if (eventMap.size === 0) {
        this.delegatedEvents.delete(eventKey);
      }
    }
    
    this.removeHandlerReference(selector, event, handler);
    
    return this;
  }

  /**
   * Add debounced event listener
   * @param {Element|string} element - Target element or selector
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {number} delay - Debounce delay
   * @param {Object} options - Event options
   */
  debounce(element, event, handler, delay = null, options = {}) {
    const target = this.resolveElement(element);
    const actualDelay = delay || this.getDefaultDelay('debounce', event);
    
    const debouncedHandler = this.createDebouncedHandler(handler, actualDelay);
    
    target.addEventListener(event, debouncedHandler, {
      passive: this.isPassiveEvent(event),
      ...options
    });
    
    this.metrics.eventsRegistered++;
    this.metrics.debouncedEvents++;
    
    // Store for cleanup
    this.storeHandlerReference(element, event, handler, 'debounce', {
      debouncedHandler,
      delay: actualDelay
    });
    
    return this;
  }

  /**
   * Add throttled event listener
   * @param {Element|string} element - Target element or selector
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {number} limit - Throttle limit
   * @param {Object} options - Event options
   */
  throttle(element, event, handler, limit = null, options = {}) {
    const target = this.resolveElement(element);
    const actualLimit = limit || this.getDefaultDelay('throttle', event);
    
    const throttledHandler = this.createThrottledHandler(handler, actualLimit);
    
    target.addEventListener(event, throttledHandler, {
      passive: this.isPassiveEvent(event),
      ...options
    });
    
    this.metrics.eventsRegistered++;
    this.metrics.throttledEvents++;
    
    // Store for cleanup
    this.storeHandlerReference(element, event, handler, 'throttle', {
      throttledHandler,
      limit: actualLimit
    });
    
    return this;
  }

  /**
   * Create debounced handler function
   * @param {Function} handler - Original handler
   * @param {number} delay - Debounce delay
   * @returns {Function} Debounced handler
   */
  createDebouncedHandler(handler, delay) {
    let timeoutId;
    
    return function debouncedHandler(event) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handler.call(this, event);
      }, delay);
    };
  }

  /**
   * Create throttled handler function
   * @param {Function} handler - Original handler
   * @param {number} limit - Throttle limit
   * @returns {Function} Throttled handler
   */
  createThrottledHandler(handler, limit) {
    let lastCall = 0;
    let timeoutId;
    
    return function throttledHandler(event) {
      const now = Date.now();
      
      if (now - lastCall >= limit) {
        lastCall = now;
        handler.call(this, event);
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          lastCall = Date.now();
          handler.call(this, event);
        }, limit - (now - lastCall));
      }
    };
  }

  /**
   * Add regular event listener with automatic cleanup
   * @param {Element|string} element - Target element or selector
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   */
  on(element, event, handler, options = {}) {
    const target = this.resolveElement(element);
    
    target.addEventListener(event, handler, {
      passive: this.isPassiveEvent(event),
      ...options
    });
    
    this.metrics.eventsRegistered++;
    this.storeHandlerReference(element, event, handler, 'standard');
    
    return this;
  }

  /**
   * Remove event listener
   * @param {Element|string} element - Target element or selector
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   */
  off(element, event, handler) {
    const target = this.resolveElement(element);
    const handlerRef = this.getHandlerReference(element, event, handler);
    
    if (handlerRef) {
      const actualHandler = handlerRef.metadata?.debouncedHandler || 
                           handlerRef.metadata?.throttledHandler || 
                           handler;
      
      target.removeEventListener(event, actualHandler);
      this.removeHandlerReference(element, event, handler);
    }
    
    return this;
  }

  /**
   * Add one-time event listener
   * @param {Element|string} element - Target element or selector
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   */
  once(element, event, handler, options = {}) {
    const target = this.resolveElement(element);
    
    const onceHandler = (event) => {
      handler.call(target, event);
      this.off(element, event, onceHandler);
    };
    
    return this.on(element, event, onceHandler, { ...options, once: true });
  }

  /**
   * Emit custom event
   * @param {string} eventType - Event type
   * @param {Object} detail - Event data
   * @param {Element} target - Target element (default: document)
   * @returns {boolean} True if event was not cancelled
   */
  emit(eventType, detail = {}, target = document) {
    const event = new CustomEvent(eventType, {
      detail,
      bubbles: true,
      cancelable: true
    });
    
    return target.dispatchEvent(event);
  }

  /**
   * Store handler reference for cleanup
   */
  storeHandlerReference(element, event, handler, type, metadata = {}) {
    const key = this.createHandlerKey(element, event, handler);
    this.eventCache.set(key, {
      element,
      event,
      handler,
      type,
      metadata,
      timestamp: Date.now()
    });
  }

  /**
   * Get stored handler reference
   */
  getHandlerReference(element, event, handler) {
    const key = this.createHandlerKey(element, event, handler);
    return this.eventCache.get(key);
  }

  /**
   * Remove handler reference
   */
  removeHandlerReference(element, event, handler) {
    const key = this.createHandlerKey(element, event, handler);
    this.eventCache.delete(key);
  }

  /**
   * Create unique key for handler reference
   */
  createHandlerKey(element, event, handler) {
    const elementId = element instanceof Element ? 
      element.dataset.eventId || (element.dataset.eventId = `elem_${Date.now()}_${Math.random()}`) :
      element;
    
    return `${elementId}_${event}_${handler.name || 'anonymous'}`;
  }

  /**
   * Resolve element from selector or element
   * @param {Element|string} element - Element or selector
   * @returns {Element}
   */
  resolveElement(element) {
    if (typeof element === 'string') {
      const found = document.querySelector(element);
      if (!found) {
        throw new ComponentError(`Element not found: ${element}`, 'EventManager');
      }
      return found;
    }
    
    if (!(element instanceof Element)) {
      throw new ComponentError('Invalid element provided', 'EventManager');
    }
    
    return element;
  }

  /**
   * Check if event should be passive
   * @param {string} eventType - Event type
   * @returns {boolean}
   */
  isPassiveEvent(eventType) {
    const passiveEvents = this.eventTypes?.eventConfig?.passive || {
      scroll: true,
      wheel: true,
      touchstart: true,
      touchmove: true
    };
    
    return Boolean(passiveEvents[eventType]);
  }

  /**
   * Get default delay for debounce/throttle
   * @param {string} type - 'debounce' or 'throttle'
   * @param {string} event - Event type
   * @returns {number}
   */
  getDefaultDelay(type, event) {
    const config = this.eventTypes?.eventConfig || {};
    const delays = config[type] || {};
    
    const defaults = {
      debounce: { scroll: 100, resize: 250, input: 300, search: 500 },
      throttle: { mousemove: 16, scroll: 16, resize: 16 }
    };
    
    return delays[event] || defaults[type][event] || 250;
  }

  /**
   * Validate delegation parameters
   */
  validateDelegationParams(selector, event, handler) {
    if (typeof selector !== 'string') {
      throw new ComponentError('Selector must be a string', 'EventManager');
    }
    
    if (typeof event !== 'string') {
      throw new ComponentError('Event type must be a string', 'EventManager');
    }
    
    if (typeof handler !== 'function') {
      throw new ComponentError('Handler must be a function', 'EventManager');
    }
  }

  /**
   * Handle errors in event system
   */
  handleError(error, context, details = {}) {
    console.error(`EventManager Error in ${context}:`, error, details);
    
    this.emit('vaccine:eventmanager:error', {
      error: error.message,
      context,
      details,
      timestamp: Date.now()
    });
  }

  /**
   * Get default event types configuration
   */
  getDefaultEventTypes() {
    return {
      eventTypes: {
        user: ['click', 'hover', 'focus', 'blur', 'input', 'change'],
        custom: ['vaccine:component:ready', 'vaccine:app:ready'],
        performance: ['vaccine:perf:debounced', 'vaccine:perf:throttled']
      },
      eventConfig: {
        debounce: { scroll: 100, resize: 250, input: 300 },
        throttle: { mousemove: 16, scroll: 16, resize: 16 },
        passive: { scroll: true, wheel: true, touchstart: true }
      }
    };
  }

  /**
   * Merge options with defaults
   */
  mergeOptions(options) {
    const defaults = {
      enableMetrics: true,
      errorHandling: true,
      autoCleanup: true,
      maxCacheSize: 1000
    };
    
    return { ...defaults, ...options };
  }

  /**
   * Get performance metrics
   * @returns {Object}
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Clean up all event listeners and references
   */
  destroy() {
    // Remove all stored handlers
    this.eventCache.forEach((ref, key) => {
      try {
        this.off(ref.element, ref.event, ref.handler);
      } catch (error) {
        console.warn('Error cleaning up event handler:', error);
      }
    });
    
    // Clear all maps
    this.delegatedEvents.clear();
    this.debouncedEvents.clear();
    this.throttledEvents.clear();
    this.eventCache.clear();
    
    // Remove global handlers
    if (this.globalHandler) {
      const eventTypes = [
        'click', 'mouseenter', 'mouseleave', 'focus', 'blur',
        'input', 'change', 'keydown', 'keyup', 'submit'
      ];
      
      eventTypes.forEach(eventType => {
        document.removeEventListener(eventType, this.globalHandler, true);
      });
    }
    
    this.emit('vaccine:eventmanager:destroyed');
  }
}

// Create singleton instance
export const eventManager = new EventManager();

// Export for global access
if (typeof window !== 'undefined') {
  window.VaccineEventManager = eventManager;
}