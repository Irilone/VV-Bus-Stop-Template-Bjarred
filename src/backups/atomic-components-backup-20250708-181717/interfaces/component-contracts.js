/**
 * Component Interface Contracts for Atomic Architecture
 * Defines the expected API for all atomic components
 * Session: JS-MOD-001
 */

/**
 * Base Component Interface
 * All atomic components must implement this interface
 */
export class ComponentContract {
  /**
   * Component constructor
   * @param {Element|string} element - DOM element or selector
   * @param {Object} options - Configuration options
   */
  constructor(element, options = {}) {
    throw new Error('ComponentContract is abstract and must be implemented');
  }

  /**
   * Initialize the component
   * @returns {Promise<void>|void}
   */
  init() {
    throw new Error('init() method must be implemented');
  }

  /**
   * Destroy the component and clean up
   * @returns {void}
   */
  destroy() {
    throw new Error('destroy() method must be implemented');
  }

  /**
   * Get component configuration
   * @returns {Object}
   */
  getConfig() {
    throw new Error('getConfig() method must be implemented');
  }

  /**
   * Update component configuration
   * @param {Object} newConfig - New configuration options
   * @returns {void}
   */
  updateConfig(newConfig) {
    throw new Error('updateConfig() method must be implemented');
  }

  /**
   * Get component state
   * @returns {Object}
   */
  getState() {
    throw new Error('getState() method must be implemented');
  }

  /**
   * Emit custom event
   * @param {string} eventType - Event type
   * @param {Object} detail - Event data
   * @returns {boolean}
   */
  emit(eventType, detail = {}) {
    throw new Error('emit() method must be implemented');
  }
}

/**
 * Event Handler Interface
 * For components that handle events
 */
export class EventHandlerContract extends ComponentContract {
  /**
   * Add event listener
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   * @returns {void}
   */
  on(event, handler, options = {}) {
    throw new Error('on() method must be implemented');
  }

  /**
   * Remove event listener
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @returns {void}
   */
  off(event, handler) {
    throw new Error('off() method must be implemented');
  }

  /**
   * Add one-time event listener
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @returns {void}
   */
  once(event, handler) {
    throw new Error('once() method must be implemented');
  }
}

/**
 * Configurable Component Interface
 * For components with complex configuration
 */
export class ConfigurableContract extends ComponentContract {
  /**
   * Validate configuration object
   * @param {Object} config - Configuration to validate
   * @returns {Object} - Validated configuration
   * @throws {Error} - If configuration is invalid
   */
  validateConfig(config) {
    throw new Error('validateConfig() method must be implemented');
  }

  /**
   * Merge configuration with defaults
   * @param {Object} config - User configuration
   * @returns {Object} - Merged configuration
   */
  mergeConfig(config) {
    throw new Error('mergeConfig() method must be implemented');
  }

  /**
   * Get default configuration
   * @returns {Object}
   */
  getDefaults() {
    throw new Error('getDefaults() method must be implemented');
  }
}

/**
 * Responsive Component Interface
 * For components that respond to viewport changes
 */
export class ResponsiveContract extends ComponentContract {
  /**
   * Handle resize events
   * @param {Object} dimensions - Viewport dimensions
   * @returns {void}
   */
  onResize(dimensions) {
    throw new Error('onResize() method must be implemented');
  }

  /**
   * Handle breakpoint changes
   * @param {string} breakpoint - Current breakpoint
   * @returns {void}
   */
  onBreakpointChange(breakpoint) {
    throw new Error('onBreakpointChange() method must be implemented');
  }

  /**
   * Get current breakpoint
   * @returns {string}
   */
  getCurrentBreakpoint() {
    throw new Error('getCurrentBreakpoint() method must be implemented');
  }
}

/**
 * Accessible Component Interface
 * For components with accessibility features
 */
export class AccessibleContract extends ComponentContract {
  /**
   * Set ARIA attributes
   * @param {Object} attributes - ARIA attributes to set
   * @returns {void}
   */
  setAriaAttributes(attributes) {
    throw new Error('setAriaAttributes() method must be implemented');
  }

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} event - Keyboard event
   * @returns {void}
   */
  onKeyboardInteraction(event) {
    throw new Error('onKeyboardInteraction() method must be implemented');
  }

  /**
   * Announce to screen readers
   * @param {string} message - Message to announce
   * @param {string} priority - Announcement priority (polite|assertive)
   * @returns {void}
   */
  announce(message, priority = 'polite') {
    throw new Error('announce() method must be implemented');
  }
}

/**
 * Component Factory Interface
 * For creating component instances
 */
export class ComponentFactory {
  /**
   * Create component instance
   * @param {string} type - Component type
   * @param {Element} element - DOM element
   * @param {Object} options - Configuration options
   * @returns {ComponentContract}
   */
  static create(type, element, options = {}) {
    throw new Error('ComponentFactory.create() must be implemented');
  }

  /**
   * Register component type
   * @param {string} type - Component type
   * @param {Function} constructor - Component constructor
   * @returns {void}
   */
  static register(type, constructor) {
    throw new Error('ComponentFactory.register() must be implemented');
  }

  /**
   * Get registered component types
   * @returns {Array<string>}
   */
  static getTypes() {
    throw new Error('ComponentFactory.getTypes() must be implemented');
  }
}

/**
 * Event Manager Interface
 * For centralized event management
 */
export class EventManagerContract {
  /**
   * Add event listener with delegation
   * @param {string} selector - CSS selector for delegation
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   * @returns {void}
   */
  delegate(selector, event, handler, options = {}) {
    throw new Error('delegate() method must be implemented');
  }

  /**
   * Remove delegated event listener
   * @param {string} selector - CSS selector
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @returns {void}
   */
  undelegate(selector, event, handler) {
    throw new Error('undelegate() method must be implemented');
  }

  /**
   * Add debounced event listener
   * @param {Element} element - Target element
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {number} delay - Debounce delay
   * @returns {void}
   */
  debounce(element, event, handler, delay) {
    throw new Error('debounce() method must be implemented');
  }

  /**
   * Add throttled event listener
   * @param {Element} element - Target element
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {number} limit - Throttle limit
   * @returns {void}
   */
  throttle(element, event, handler, limit) {
    throw new Error('throttle() method must be implemented');
  }
}

/**
 * Utility validation functions
 */
export const ValidationUtils = {
  /**
   * Check if value is a DOM element
   * @param {*} value - Value to check
   * @returns {boolean}
   */
  isElement(value) {
    return value instanceof Element || value instanceof HTMLDocument;
  },

  /**
   * Check if value is a valid selector string
   * @param {*} value - Value to check
   * @returns {boolean}
   */
  isSelector(value) {
    if (typeof value !== 'string') return false;
    try {
      document.querySelector(value);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if value is a function
   * @param {*} value - Value to check
   * @returns {boolean}
   */
  isFunction(value) {
    return typeof value === 'function';
  },

  /**
   * Check if value is a plain object
   * @param {*} value - Value to check
   * @returns {boolean}
   */
  isPlainObject(value) {
    return value && typeof value === 'object' && value.constructor === Object;
  }
};

/**
 * Error classes for component system
 */
export class ComponentError extends Error {
  constructor(message, component, code = 'COMPONENT_ERROR') {
    super(message);
    this.name = 'ComponentError';
    this.component = component;
    this.code = code;
  }
}

export class ConfigurationError extends ComponentError {
  constructor(message, component, invalidKeys = []) {
    super(message, component, 'CONFIG_ERROR');
    this.name = 'ConfigurationError';
    this.invalidKeys = invalidKeys;
  }
}

export class ElementError extends ComponentError {
  constructor(message, selector) {
    super(message, null, 'ELEMENT_ERROR');
    this.name = 'ElementError';
    this.selector = selector;
  }
}