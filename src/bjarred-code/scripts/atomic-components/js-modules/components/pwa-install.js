/**
 * Atomic PWA Install Component
 * Extracted from PWA functionality in scripts.js
 * Session: JS-MOD-001
 */

import { EventHandlerContract, ComponentError } from '../../interfaces/component-contracts.js';
import { eventManager } from '../core/event-manager.js';

export class PwaInstall {
  constructor(options = {}) {
    this.options = this.mergeOptions(options);
    this.installBanner = null;
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.dismissalKey = 'pwa_install_dismissed';

    this.init();
  }

  /**
   * Initialize the PWA install component
   */
  init() {
    this.checkInstallability();
    this.bindEvents();
    this.emit('vaccine:pwa:ready');
  }

  /**
   * Check PWA installability
   */
  checkInstallability() {
    // Check if already installed
    if (this.isPWAInstalled()) {
      this.isInstalled = true;
      this.emit('vaccine:pwa:already-installed');
      return;
    }

    // Check if user has dismissed the prompt
    if (this.isDismissed()) {
      this.emit('vaccine:pwa:dismissed');
      return;
    }

    // Check if browser supports PWA installation
    if (!this.isBrowserSupported()) {
      console.log('PWA: Browser does not support installation');
      return;
    }

    // Wait for beforeinstallprompt event
    this.waitForInstallPrompt();
  }

  /**
   * Check if PWA is already installed
   * @returns {boolean} Whether PWA is installed
   */
  isPWAInstalled() {
    // Check for display mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    // Check for iOS standalone mode
    if (window.navigator.standalone === true) {
      return true;
    }

    // Check for Android TWA
    if (document.referrer.includes('android-app://')) {
      return true;
    }

    return false;
  }

  /**
   * Check if user has dismissed the install prompt
   * @returns {boolean} Whether prompt was dismissed
   */
  isDismissed() {
    const dismissed = localStorage.getItem(this.dismissalKey);
    if (!dismissed) return false;

    const dismissedDate = new Date(dismissed);
    const now = new Date();
    const daysSinceDismissal = Math.floor((now - dismissedDate) / (1000 * 60 * 60 * 24));

    // Show again after configured days
    return daysSinceDismissal < this.options.dismissalDays;
  }

  /**
   * Check if browser supports PWA installation
   * @returns {boolean} Whether browser supports PWA
   */
  isBrowserSupported() {
    // Modern browsers with beforeinstallprompt support
    return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
  }

  /**
   * Wait for install prompt event
   */
  waitForInstallPrompt() {
    // Listen for beforeinstallprompt event
    eventManager.on(window, 'beforeinstallprompt', (event) => {
      this.handleInstallPrompt(event);
    });

    // Fallback: Show banner after delay if no prompt event
    setTimeout(() => {
      if (!this.deferredPrompt && !this.isInstalled) {
        this.showInstallBanner();
      }
    }, this.options.showDelay);
  }

  /**
   * Handle install prompt event
   * @param {Event} event - Before install prompt event
   */
  handleInstallPrompt(event) {
    // Prevent default browser install prompt
    event.preventDefault();

    // Store the event for later use
    this.deferredPrompt = event;

    // Show custom install banner
    this.showInstallBanner();

    this.emit('vaccine:pwa:prompt-available', { event });
  }

  /**
   * Show install banner using secure DOM methods
   */
  showInstallBanner() {
    if (this.installBanner) return; // Already shown

    // Create banner container
    this.installBanner = document.createElement('div');
    this.installBanner.className = 'pwa-install-banner';
    this.installBanner.setAttribute('role', 'dialog');
    this.installBanner.setAttribute('aria-label', 'Install app');
    this.installBanner.setAttribute('aria-describedby', 'pwa-message');

    // Create banner content
    const content = this.createBannerContent();
    this.installBanner.appendChild(content);

    // Apply styling
    this.applyBannerStyles();

    // Bind events
    this.bindBannerEvents();

    // Add to DOM with animation
    this.insertBanner();

    this.emit('vaccine:pwa:banner-shown');
  }

  /**
   * Create banner content structure
   * @returns {Element} Content element
   */
  createBannerContent() {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      background: var(--clr-bg-alt, #eef5ff);
      padding: var(--space-sm, 0.75rem);
      border-radius: var(--radius-md, 8px);
      margin: var(--space-md, 1rem) 0;
      display: flex;
      align-items: center;
      gap: var(--space-md, 1rem);
      box-shadow: 0 2px 8px rgba(1, 35, 99, 0.1);
      border: 1px solid var(--clr-border, #e0e0e0);
    `;

    // App icon
    const icon = this.createIcon();
    wrapper.appendChild(icon);

    // Message content
    const messageContent = this.createMessageContent();
    wrapper.appendChild(messageContent);

    // Install button
    const installButton = this.createInstallButton();
    wrapper.appendChild(installButton);

    // Dismiss button
    const dismissButton = this.createDismissButton();
    wrapper.appendChild(dismissButton);

    return wrapper;
  }

  /**
   * Create app icon
   * @returns {Element} Icon element
   */
  createIcon() {
    const icon = document.createElement('span');
    icon.style.cssText = `
      font-size: 1.5rem;
      flex-shrink: 0;
    `;
    icon.textContent = '📱';
    icon.setAttribute('aria-hidden', 'true');

    return icon;
  }

  /**
   * Create message content
   * @returns {Element} Message element
   */
  createMessageContent() {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      flex: 1;
      min-width: 0;
    `;

    const title = document.createElement('strong');
    title.textContent = this.options.title;
    title.style.cssText = `
      display: block;
      color: var(--clr-primary, #012363);
      font-size: 1rem;
      margin-bottom: 0.25rem;
    `;

    const description = document.createElement('small');
    description.id = 'pwa-message';
    description.textContent = this.options.description;
    description.style.cssText = `
      display: block;
      color: var(--clr-body, #333);
      font-size: 0.875rem;
      line-height: 1.3;
    `;

    messageDiv.appendChild(title);
    messageDiv.appendChild(description);

    return messageDiv;
  }

  /**
   * Create install button
   * @returns {Element} Install button element
   */
  createInstallButton() {
    const button = document.createElement('button');
    button.id = 'install-pwa';
    button.type = 'button';
    button.textContent = this.options.installText;

    button.style.cssText = `
      background: var(--clr-primary, #012363);
      color: white;
      border: none;
      padding: var(--space-xs, 0.5rem) var(--space-md, 1rem);
      border-radius: var(--radius-sm, 4px);
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      min-height: 44px;
      white-space: nowrap;
      transition: background 0.2s ease;
      flex-shrink: 0;
    `;

    // Hover effects
    button.addEventListener('mouseenter', () => {
      button.style.background = 'var(--clr-primary-dark, #0B496E)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = 'var(--clr-primary, #012363)';
    });

    return button;
  }

  /**
   * Create dismiss button
   * @returns {Element} Dismiss button element
   */
  createDismissButton() {
    const button = document.createElement('button');
    button.id = 'dismiss-pwa';
    button.type = 'button';
    button.setAttribute('aria-label', 'Dismiss install prompt');
    button.textContent = '×';

    button.style.cssText = `
      background: transparent;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--clr-body, #333);
      padding: 0.25rem;
      border-radius: var(--radius-sm, 4px);
      min-height: 44px;
      min-width: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.2s ease;
    `;

    // Hover effects
    button.addEventListener('mouseenter', () => {
      button.style.background = 'rgba(0, 0, 0, 0.1)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = 'transparent';
    });

    return button;
  }

  /**
   * Apply banner styling
   */
  applyBannerStyles() {
    this.installBanner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      background: var(--clr-bg, #ffffff);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-100%);
      transition: transform 0.3s ease;
      padding: var(--space-sm, 0.75rem);
      font-family: var(--ff-primary, 'Filson Pro', sans-serif);
    `;
  }

  /**
   * Bind banner event listeners
   */
  bindBannerEvents() {
    const installButton = this.installBanner.querySelector('#install-pwa');
    const dismissButton = this.installBanner.querySelector('#dismiss-pwa');

    if (installButton) {
      eventManager.on(installButton, 'click', () => {
        this.triggerInstall();
      });
    }

    if (dismissButton) {
      eventManager.on(dismissButton, 'click', () => {
        this.dismissBanner();
      });
    }

    // Keyboard navigation
    eventManager.on(this.installBanner, 'keydown', (event) => {
      this.handleKeyNavigation(event);
    });
  }

  /**
   * Insert banner into DOM with animation
   */
  insertBanner() {
    // Find insertion point
    const containerSelector = this.options.container;
    if (typeof containerSelector !== 'string') {
      console.error('PwaInstall: container must be a string selector, got:', typeof containerSelector, containerSelector);
      return;
    }
    
    const targetContainer = document.querySelector(containerSelector) || document.body;

    if (this.options.position === 'after-header') {
      const header = document.querySelector('header, .header');
      if (header && header.parentNode) {
        header.parentNode.insertBefore(this.installBanner, header.nextSibling);
      } else {
        targetContainer.insertBefore(this.installBanner, targetContainer.firstChild);
      }
    } else {
      targetContainer.insertBefore(this.installBanner, targetContainer.firstChild);
    }

    // Animate in
    requestAnimationFrame(() => {
      this.installBanner.style.transform = 'translateY(0)';
    });
  }

  /**
   * Handle keyboard navigation
   * @param {Event} event - Keyboard event
   */
  handleKeyNavigation(event) {
    switch (event.key) {
      case 'Escape':
        this.dismissBanner();
        break;

      case 'Enter':
        if (event.target.id === 'install-pwa') {
          this.triggerInstall();
        } else if (event.target.id === 'dismiss-pwa') {
          this.dismissBanner();
        }
        break;
    }
  }

  /**
   * Trigger PWA installation
   */
  async triggerInstall() {
    if (!this.deferredPrompt) {
      // Fallback for browsers without native prompt
      this.showManualInstructions();
      return;
    }

    try {
      // Show the install prompt
      this.deferredPrompt.prompt();

      // Wait for user response
      const { outcome } = await this.deferredPrompt.userChoice;

      this.emit('vaccine:pwa:install-prompted', { outcome });

      if (outcome === 'accepted') {
        this.handleInstallSuccess();
      } else {
        this.handleInstallDismissal();
      }

      // Clear the deferred prompt
      this.deferredPrompt = null;

    } catch (error) {
      console.error('PWA Install Error:', error);
      this.emit('vaccine:pwa:install-error', { error });
    }
  }

  /**
   * Show manual installation instructions
   */
  showManualInstructions() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    let instructions = '';

    if (isIOS) {
      instructions = 'För att installera appen:\n1. Tryck på dela-knappen (⬆️)\n2. Välj "Lägg till på hemskärmen"\n3. Tryck "Lägg till"';
    } else if (isAndroid) {
      instructions = 'För att installera appen:\n1. Öppna webbläsarmenyn (⋮)\n2. Välj "Lägg till på hemskärmen"\n3. Tryck "Lägg till"';
    } else {
      instructions = 'För att installera appen:\n1. Klicka på installations-ikonen i adressfältet\n2. Eller använd webbläsarmenyn och välj "Installera app"';
    }

    alert(instructions);

    this.emit('vaccine:pwa:manual-instructions-shown', { platform: isIOS ? 'ios' : isAndroid ? 'android' : 'desktop' });
  }

  /**
   * Handle successful installation
   */
  handleInstallSuccess() {
    this.isInstalled = true;
    this.hideBanner();

    // Show success message
    this.showSuccessMessage();

    this.emit('vaccine:pwa:install-success');
  }

  /**
   * Handle installation dismissal
   */
  handleInstallDismissal() {
    this.storeDismissal();
    this.hideBanner();

    this.emit('vaccine:pwa:install-dismissed');
  }

  /**
   * Show success message
   */
  showSuccessMessage() {
    const message = 'Tack! Appen har installerats på din enhet.';

    // Create temporary success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 1rem;
      right: 1rem;
      background: #4CAF50;
      color: white;
      padding: 1rem;
      border-radius: var(--radius-md, 8px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 10001;
      font-family: var(--ff-primary, 'Filson Pro', sans-serif);
      max-width: 300px;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after delay
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  /**
   * Dismiss banner
   */
  dismissBanner() {
    this.storeDismissal();
    this.hideBanner();
    this.emit('vaccine:pwa:banner-dismissed');
  }

  /**
   * Hide banner with animation
   */
  hideBanner() {
    if (!this.installBanner) return;

    this.installBanner.style.transform = 'translateY(-100%)';

    setTimeout(() => {
      if (this.installBanner && this.installBanner.parentNode) {
        this.installBanner.parentNode.removeChild(this.installBanner);
      }
      this.installBanner = null;
    }, 300);
  }

  /**
   * Store dismissal timestamp
   */
  storeDismissal() {
    localStorage.setItem(this.dismissalKey, new Date().toISOString());
  }

  /**
   * Bind global events
   */
  bindEvents() {
    // Listen for app installed event
    eventManager.on(window, 'appinstalled', (event) => {
      this.handleAppInstalled(event);
    });

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addListener((event) => {
      if (event.matches) {
        this.handleAppInstalled();
      }
    });
  }

  /**
   * Handle app installed event
   * @param {Event} event - App installed event
   */
  handleAppInstalled(event = null) {
    this.isInstalled = true;
    this.hideBanner();

    console.log('PWA has been installed');
    this.emit('vaccine:pwa:app-installed', { event });
  }

  /**
   * Check if PWA is currently installed
   * @returns {boolean} Installation status
   */
  getInstallationStatus() {
    return {
      isInstalled: this.isInstalled,
      canInstall: !!this.deferredPrompt,
      isDismissed: this.isDismissed(),
      isSupported: this.isBrowserSupported()
    };
  }

  /**
   * Manually show install banner (for testing)
   */
  forceShowBanner() {
    // Clear dismissal
    localStorage.removeItem(this.dismissalKey);

    // Show banner
    this.showInstallBanner();
  }

  /**
   * Reset component state (for testing)
   */
  reset() {
    localStorage.removeItem(this.dismissalKey);
    this.hideBanner();
    this.deferredPrompt = null;
    this.isInstalled = false;

    this.init();
    this.emit('vaccine:pwa:reset');
  }

  /**
   * Destroy component
   */
  destroy() {
    // Remove event listeners
    eventManager.off(window, 'beforeinstallprompt');
    eventManager.off(window, 'appinstalled');

    if (this.installBanner) {
      eventManager.off(this.installBanner, 'click');
      eventManager.off(this.installBanner, 'keydown');
    }

    // Remove from DOM
    this.hideBanner();

    this.emit('vaccine:pwa:destroyed');
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
      title: 'Installera Vaccinbussen-appen',
      description: 'Få snabb tillgång till vaccinationsschema och priser',
      installText: 'Installera',
      showDelay: 5000,
      dismissalDays: 7,
      container: '#vaccine-bjarred-app',
      position: 'after-header',
      autoShow: true
    };

    return { ...defaults, ...options };
  }
}

// Export for global access
export default PwaInstall;