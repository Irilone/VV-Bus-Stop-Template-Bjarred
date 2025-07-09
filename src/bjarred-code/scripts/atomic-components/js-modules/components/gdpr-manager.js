/**
 * Atomic GDPR Consent Manager Component
 * Extracted from secure GDPR functionality in scripts.js
 * Session: JS-MOD-001
 */

import { EventHandlerContract, ComponentError } from '../../interfaces/component-contracts.js';
import { eventManager } from '../core/event-manager.js';

/**
 * Manages GDPR compliance features like cookie consent and tracking scripts.
 * @version 1.0
 */
export class GdprManager {
  constructor(options = {}) {
    this.options = this.mergeOptions(options);
    this.banner = null;
    this.consentGiven = false;
    this.cookieKey = 'vaccine_gdpr_consent';
    this.expiryDays = 365;

    this.init();
  }

  /**
   * Initialize the GDPR manager
   */
  init() {
    this.checkExistingConsent();

    if (!this.consentGiven) {
      this.createBanner();
      this.showBanner();
    }

    this.emit('vaccine:gdpr:ready');
  }

  /**
   * Check for existing consent
   */
  checkExistingConsent() {
    const consent = this.getCookie(this.cookieKey);
    this.consentGiven = consent === 'accepted';

    if (this.consentGiven) {
      this.emit('vaccine:gdpr:consent-found', { consent: 'accepted' });
    }
  }

  /**
   * Create GDPR banner using secure DOM methods
   */
  createBanner() {
    // Remove existing banner if present
    const existingBanner = document.querySelector('.gdpr-banner');
    if (existingBanner) {
      existingBanner.remove();
    }

    // Create banner container
    this.banner = document.createElement('div');
    this.banner.className = 'gdpr-banner';
    this.banner.setAttribute('role', 'dialog');
    this.banner.setAttribute('aria-label', 'Cookie consent');
    this.banner.setAttribute('aria-describedby', 'gdpr-message');

    // Create banner content structure
    const contentWrapper = this.createContentWrapper();
    const message = this.createMessage();
    const buttonGroup = this.createButtonGroup();

    // Assemble banner
    contentWrapper.appendChild(this.createIcon());
    contentWrapper.appendChild(message);
    contentWrapper.appendChild(buttonGroup);

    this.banner.appendChild(contentWrapper);

    // Apply styling
    this.applyBannerStyles();

    // Bind events
    this.bindBannerEvents();

    return this.banner;
  }

  /**
   * Create content wrapper
   * @returns {Element} Content wrapper element
   */
  createContentWrapper() {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    `;
    return wrapper;
  }

  /**
   * Create cookie icon
   * @returns {Element} Icon element
   */
  createIcon() {
    const iconWrapper = document.createElement('div');
    iconWrapper.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0.75rem;
    `;

    const iconCircle = document.createElement('div');
    iconCircle.style.cssText = `
      background: #40E0D0;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    `;

    const iconText = document.createElement('span');
    iconText.style.fontSize = '16px';
    iconText.textContent = '🍪';
    iconText.setAttribute('aria-hidden', 'true');

    iconCircle.appendChild(iconText);
    iconWrapper.appendChild(iconCircle);

    return iconWrapper;
  }

  /**
   * Create message element
   * @returns {Element} Message element
   */
  createMessage() {
    const message = document.createElement('p');
    message.id = 'gdpr-message';
    message.style.cssText = `
      flex: 1;
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.4;
      color: #ffffff;
    `;

    message.textContent = this.options.message;

    return message;
  }

  /**
   * Create button group
   * @returns {Element} Button group element
   */
  createButtonGroup() {
    const buttonGroup = document.createElement('div');
    buttonGroup.style.cssText = `
      display: flex;
      gap: 0.5rem;
      flex-shrink: 0;
    `;

    const acceptButton = this.createButton('accept', this.options.acceptText);
    const infoButton = this.createButton('info', this.options.infoText);

    buttonGroup.appendChild(acceptButton);
    buttonGroup.appendChild(infoButton);

    return buttonGroup;
  }

  /**
   * Create button element
   * @param {string} type - Button type (accept/info)
   * @param {string} text - Button text
   * @returns {Element} Button element
   */
  createButton(type, text) {
    const button = document.createElement('button');
    button.id = `gdpr-${type}`;
    button.type = 'button';
    button.textContent = text;

    // Base button styles
    const baseStyles = `
      border: none;
      border-radius: 4px;
      padding: 0.5rem 1.2rem;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s, color 0.2s, border 0.2s;
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    if (type === 'accept') {
      button.style.cssText = baseStyles + `
        background: #012363;
        color: #fff;
      `;
      button.setAttribute('aria-describedby', 'gdpr-message');
    } else {
      button.style.cssText = baseStyles + `
        background: transparent;
        color: #012363;
        border: 1.5px solid #012363;
      `;
    }

    // Add hover effects via CSS classes
    button.addEventListener('mouseenter', () => {
      if (type === 'accept') {
        button.style.background = '#0B496E';
      } else {
        button.style.background = '#012363';
        button.style.color = '#fff';
      }
    });

    button.addEventListener('mouseleave', () => {
      if (type === 'accept') {
        button.style.background = '#012363';
      } else {
        button.style.background = 'transparent';
        button.style.color = '#012363';
      }
    });

    return button;
  }

  /**
   * Apply banner styling
   */
  applyBannerStyles() {
    this.banner.style.cssText = `
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
      width: 100vw;
      background: #f8f9fa;
      color: #222;
      padding: var(--space-md, 1rem);
      box-shadow: 0 -2px 10px rgba(0,0,0,0.08);
      font-size: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: background 0.3s, color 0.3s, transform 0.3s ease;
      transform: translateY(100%);
      font-family: var(--ff-primary, 'Filson Pro', sans-serif);
    `;
  }

  /**
   * Bind banner event listeners
   */
  bindBannerEvents() {
    const acceptButton = this.banner.querySelector('#gdpr-accept');
    const infoButton = this.banner.querySelector('#gdpr-info');

    if (acceptButton) {
      eventManager.on(acceptButton, 'click', () => {
        this.acceptConsent();
      });
    }

    if (infoButton) {
      eventManager.on(infoButton, 'click', () => {
        this.showInfo();
      });
    }

    // Keyboard navigation
    eventManager.on(this.banner, 'keydown', (event) => {
      this.handleKeyNavigation(event);
    });

    // Focus management
    this.setupFocusTrap();
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
   * Setup focus trap for accessibility
   */
  setupFocusTrap() {
    const focusableElements = this.banner.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    eventManager.on(this.banner, 'keydown', (event) => {
      if (event.key === 'Tab') {
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
    });
  }

  /**
   * Handle keyboard navigation
   * @param {Event} event - Keyboard event
   */
  handleKeyNavigation(event) {
    switch (event.key) {
      case 'Escape':
        // Allow dismissal with escape if configured
        if (this.options.allowEscapeClose) {
          this.acceptConsent();
        }
        break;

      case 'Enter':
        if (event.target.tagName === 'BUTTON') {
          event.target.click();
        }
        break;
    }
  }

  /**
   * Show banner with animation
   */
  showBanner() {
    if (!this.banner) return;

    // Add to DOM
    document.body.appendChild(this.banner);

    // Animate in
    requestAnimationFrame(() => {
      this.banner.style.transform = 'translateY(0)';
    });

    // Focus first interactive element
    setTimeout(() => {
      const firstButton = this.banner.querySelector('button');
      if (firstButton) {
        firstButton.focus();
      }
    }, 300);

    // Announce to screen readers
    this.announceToScreenReader('Cookie consent banner is now visible');

    this.emit('vaccine:gdpr:banner-shown');
  }

  /**
   * Hide banner with animation
   */
  hideBanner() {
    if (!this.banner) return;

    this.banner.style.transform = 'translateY(100%)';

    setTimeout(() => {
      if (this.banner && this.banner.parentNode) {
        this.banner.parentNode.removeChild(this.banner);
      }
    }, 300);

    this.emit('vaccine:gdpr:banner-hidden');
  }

  /**
   * Accept consent
   */
  acceptConsent() {
    this.consentGiven = true;

    // Store consent
    this.setCookie(this.cookieKey, 'accepted', this.expiryDays);

    // Hide banner
    this.hideBanner();

    // Announce to screen readers
    this.announceToScreenReader('Cookie consent accepted');

    // Emit events
    this.emit('vaccine:gdpr:consent-accepted');

    // Initialize tracking if configured
    if (this.options.enableTracking) {
      this.initializeTracking();
    }
  }

  /**
   * Show information
   */
  showInfo() {
    if (this.options.infoUrl) {
      window.open(this.options.infoUrl, '_blank', 'noopener,noreferrer');
    } else if (this.options.infoCallback) {
      this.options.infoCallback();
    } else {
      // Default info modal
      this.showInfoModal();
    }

    this.emit('vaccine:gdpr:info-shown');
  }

  /**
   * Show default info modal
   */
  showInfoModal() {
    const message = `
      Vi använder endast tekniskt nödvändiga cookies för att säkerställa att vår tjänst fungerar korrekt.
      Inga personuppgifter lagras utan ditt samtycke enligt GDPR.

      Tekniska cookies inkluderar:
      - Sessionscookies för säkerhet
      - Funktionella cookies för användarupplevelse
      - Inga marknadsföringscookies
    `;

    if (window.confirm(message)) {
      this.acceptConsent();
    }
  }

  /**
   * Initialize tracking (if enabled)
   */
  initializeTracking() {
    // Only technical/necessary tracking
    console.log('GDPR: Initializing necessary tracking only');

    this.emit('vaccine:gdpr:tracking-initialized');
  }

  /**
   * Announce to screen readers
   * @param {string} message - Message to announce
   */
  announceToScreenReader(message) {
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
   * Set cookie
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @param {number} days - Expiry days
   */
  setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));

    const cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure`;

    // Only set if HTTPS or localhost
    if (location.protocol === 'https:' || location.hostname === 'localhost') {
      document.cookie = cookieString;
    } else {
      // Fallback for development
      document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
    }
  }

  /**
   * Get cookie
   * @param {string} name - Cookie name
   * @returns {string|null} Cookie value
   */
  getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }

    return null;
  }

  /**
   * Delete cookie
   * @param {string} name - Cookie name
   */
  deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  /**
   * Reset consent (for testing)
   */
  resetConsent() {
    this.deleteCookie(this.cookieKey);
    this.consentGiven = false;

    if (this.banner && this.banner.parentNode) {
      this.banner.parentNode.removeChild(this.banner);
    }

    this.init();
    this.emit('vaccine:gdpr:consent-reset');
  }

  /**
   * Check if consent has been given
   * @returns {boolean} Whether consent has been given
   */
  hasConsent() {
    return this.consentGiven;
  }

  /**
   * Get consent status
   * @returns {Object} Consent status
   */
  getConsentStatus() {
    return {
      given: this.consentGiven,
      timestamp: this.getCookie(this.cookieKey + '_timestamp'),
      version: this.options.version
    };
  }

  /**
   * Destroy component
   */
  destroy() {
    if (this.banner) {
      // Remove event listeners
      eventManager.off(this.banner, 'click');
      eventManager.off(this.banner, 'keydown');

      // Remove from DOM
      if (this.banner.parentNode) {
        this.banner.parentNode.removeChild(this.banner);
      }
    }

    this.banner = null;
    this.emit('vaccine:gdpr:destroyed');
  }

  /**
   * Merge options with defaults
   * @param {Object} options - User options
   * @returns {Object} Merged options
   */
  mergeOptions(options) {
    const defaults = {
      message: 'Vi använder endast tekniskt nödvändiga cookies för att säkerställa att vår tjänst fungerar korrekt. Inga personuppgifter lagras utan ditt samtycke enligt GDPR.',
      acceptText: 'Acceptera',
      infoText: 'Läs mer',
      infoUrl: null,
      infoCallback: null,
      allowEscapeClose: false,
      enableTracking: false,
      version: '1.0',
      expiryDays: 365
    };

    return { ...defaults, ...options };
  }
}

// Export for global access
export default GdprManager;