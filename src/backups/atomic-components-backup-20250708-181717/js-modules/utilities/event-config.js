/**
 * Event Configuration Utility
 * Centralized event configuration for atomic components
 * Session: JS-MOD-001
 */

export const EventConfig = {
  // Component initialization mapping
  components: {
    lightbox: {
      selector: 'img[data-lightbox], .lightbox-trigger',
      options: {
        lightboxId: 'vaccine-lightbox',
        closeOnEscape: true,
        closeOnBackground: true,
        trapFocus: true,
        restoreFocus: true,
        preventBodyScroll: true
      }
    },
    
    smoothScroll: {
      selector: 'a[href^="#"]:not([data-no-smooth])',
      options: {
        offset: 80,
        speed: 1.5,
        easing: 'ease-in-out',
        updateHash: true,
        manageFocus: true,
        cancelOnInteraction: true
      }
    },
    
    fadeIn: {
      selector: '.fade-in',
      options: {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1,
        animationClass: 'visible'
      }
    },
    
    lazyLoad: {
      selector: 'img[data-src]',
      options: {
        rootMargin: '50px 0px',
        threshold: 0.01,
        fadeIn: true
      }
    },
    
    responsiveImages: {
      selector: 'img[data-fluid]',
      options: {
        breakpoints: [576, 768, 992, 1200],
        quality: 80,
        format: 'auto'
      }
    },
    
    mobileMenu: {
      selector: '.mobile-menu-toggle',
      options: {
        menuSelector: '.mobile-menu',
        closeOnOutsideClick: true,
        trapFocus: true,
        animationDuration: 300
      }
    },
    
    gdprConsent: {
      selector: '#gdpr-consent',
      options: {
        acceptButtonSelector: '#gdpr-accept',
        infoButtonSelector: '#gdpr-info',
        storageKey: 'gdpr-consent',
        autoHide: true
      }
    },
    
    pwaInstall: {
      selector: '#install-pwa',
      options: {
        bannerSelector: '.pwa-banner',
        dismissSelector: '#dismiss-pwa',
        autoPrompt: true,
        deferredPrompt: true
      }
    }
  },

  // Event delegation mappings
  delegation: {
    // Click events
    'click': {
      'img[data-lightbox], .lightbox-trigger': 'lightbox.open',
      'a[href^="#"]:not([data-no-smooth])': 'smoothScroll.navigate',
      '.mobile-menu-toggle': 'mobileMenu.toggle',
      '#gdpr-accept': 'gdprConsent.accept',
      '#gdpr-info': 'gdprConsent.showInfo',
      '#install-pwa': 'pwaInstall.prompt',
      '#dismiss-pwa': 'pwaInstall.dismiss',
      '.lightbox-close': 'lightbox.close',
      '.accordion-toggle': 'accordion.toggle',
      '.price-toggle': 'priceTable.toggle'
    },
    
    // Hover events
    'mouseenter': {
      '.hover-effect': 'hoverEffect.enter',
      '.tooltip-trigger': 'tooltip.show'
    },
    
    'mouseleave': {
      '.hover-effect': 'hoverEffect.leave',
      '.tooltip-trigger': 'tooltip.hide'
    },
    
    // Focus events
    'focus': {
      'input[data-validate]': 'validation.focus',
      '.form-field': 'formField.focus'
    },
    
    // Input events
    'input': {
      'input[data-validate]': 'validation.input',
      'input[data-format]': 'formatter.input'
    },
    
    // Form events
    'submit': {
      'form[data-ajax]': 'ajaxForm.submit',
      'form[data-validate]': 'validation.submit'
    }
  },

  // Debounced events configuration
  debounced: {
    'scroll': {
      delay: 100,
      selectors: {
        window: 'scrollHandler.debounced',
        '.scroll-spy': 'scrollSpy.update'
      }
    },
    
    'resize': {
      delay: 250,
      selectors: {
        window: 'resizeHandler.debounced',
        '.responsive-component': 'responsiveComponent.resize'
      }
    },
    
    'input': {
      delay: 300,
      selectors: {
        'input[type="search"]': 'search.debounced',
        'input[data-live-search]': 'liveSearch.debounced'
      }
    }
  },

  // Throttled events configuration
  throttled: {
    'scroll': {
      limit: 16,
      selectors: {
        window: 'scrollHandler.throttled',
        '.parallax': 'parallax.update'
      }
    },
    
    'mousemove': {
      limit: 16,
      selectors: {
        '.mouse-follow': 'mouseFollow.update',
        '.hover-effect': 'hoverEffect.move'
      }
    },
    
    'resize': {
      limit: 16,
      selectors: {
        window: 'resizeHandler.throttled'
      }
    }
  },

  // Passive events configuration
  passive: {
    'scroll': true,
    'wheel': true,
    'touchstart': true,
    'touchmove': true,
    'touchend': true,
    'mousewheel': true
  },

  // Event priorities (for execution order)
  priorities: {
    'vaccine:app:init': 1,
    'vaccine:component:init': 2,
    'vaccine:component:ready': 3,
    'DOMContentLoaded': 4,
    'load': 5
  },

  // Custom event types
  customEvents: {
    // Application lifecycle
    'vaccine:app:init': 'Application initialization started',
    'vaccine:app:ready': 'Application ready for interaction',
    'vaccine:app:error': 'Application error occurred',
    
    // Component lifecycle
    'vaccine:component:init': 'Component initialization started',
    'vaccine:component:ready': 'Component ready for interaction',
    'vaccine:component:destroy': 'Component being destroyed',
    'vaccine:component:error': 'Component error occurred',
    
    // User interactions
    'vaccine:lightbox:open': 'Lightbox opened',
    'vaccine:lightbox:close': 'Lightbox closed',
    'vaccine:smoothscroll:start': 'Smooth scroll started',
    'vaccine:smoothscroll:complete': 'Smooth scroll completed',
    'vaccine:menu:toggle': 'Mobile menu toggled',
    'vaccine:consent:accept': 'GDPR consent accepted',
    'vaccine:pwa:install': 'PWA installation prompted',
    
    // Performance events
    'vaccine:perf:debounced': 'Event was debounced',
    'vaccine:perf:throttled': 'Event was throttled',
    'vaccine:perf:lazy': 'Lazy loading triggered',
    
    // Error events
    'vaccine:error:image': 'Image loading failed',
    'vaccine:error:network': 'Network request failed',
    'vaccine:error:component': 'Component error occurred'
  },

  // Performance monitoring
  performance: {
    enableMetrics: true,
    trackEvents: [
      'vaccine:lightbox:open',
      'vaccine:smoothscroll:start',
      'vaccine:component:init',
      'vaccine:app:ready'
    ],
    
    thresholds: {
      eventProcessing: 16, // ms
      componentInit: 100,  // ms
      imageLoading: 3000,  // ms
      scrollAnimation: 1000 // ms
    }
  },

  // Accessibility configuration
  accessibility: {
    announceEvents: [
      'vaccine:lightbox:open',
      'vaccine:smoothscroll:complete',
      'vaccine:menu:toggle',
      'vaccine:consent:accept'
    ],
    
    focusManagement: {
      'vaccine:lightbox:open': 'lightbox-close',
      'vaccine:menu:toggle': 'mobile-menu-first-link',
      'vaccine:smoothscroll:complete': 'target-element'
    },
    
    keyboardNavigation: {
      'Escape': ['lightbox.close', 'menu.close', 'modal.close'],
      'Enter': ['button.click', 'link.follow'],
      'Space': ['button.click', 'checkbox.toggle'],
      'Tab': ['focus.next'],
      'ArrowUp': ['menu.previous', 'list.previous'],
      'ArrowDown': ['menu.next', 'list.next']
    }
  },

  // Error handling configuration
  errorHandling: {
    logErrors: true,
    showUserErrors: false,
    fallbackBehaviors: {
      'image-load-error': 'show-placeholder',
      'network-error': 'show-offline-message',
      'component-error': 'graceful-degradation'
    },
    
    retryStrategies: {
      'network-request': { attempts: 3, delay: 1000 },
      'image-loading': { attempts: 2, delay: 500 },
      'component-init': { attempts: 1, delay: 0 }
    }
  }
};

// Export individual configuration sections
export const {
  components,
  delegation,
  debounced,
  throttled,
  passive,
  priorities,
  customEvents,
  performance,
  accessibility,
  errorHandling
} = EventConfig;

// Default export for convenience
export default EventConfig;