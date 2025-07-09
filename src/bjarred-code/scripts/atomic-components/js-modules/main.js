/**
 * Vaccinbussen - Main Application Orchestrator
 *
 * This file imports and initializes all atomic components, serving as the
 * primary entry point for the site's interactive functionality.
 *
 * Session: JS-MOD-001
 * @author Gemini
 * @version 1.0
 */

import { eventManager } from './core/event-manager.js';

export class VaccineBjarredApp {
  constructor(config = {}) {
    this.config = this.mergeDefaultConfig(config);
    this.components = {};
    this.init();
  }

  /**
   * Merge user config with default component configurations
   */
  mergeDefaultConfig(userConfig) {
    const defaultConfig = {
      accordion: {
        accordionSelector: '.faq-item, details[data-accordion]',
        single: false,
        announceChanges: true
      },
      gdprManager: {
        bannerSelector: '#gdpr-banner',
        autoShow: true,
        cookieKey: 'vaccine_gdpr_consent'
      },
      lightbox: {
        selector: 'img[data-lightbox], .lightbox-trigger',
        fadeInDuration: 300,
        fadeOutDuration: 200
      },
      priceToggle: {
        selector: 'input[name="price-view"], .price-toggle-input',
        defaultView: 'ordinary',
        announceChanges: true
      },
      pwaInstall: {
        containerSelector: '#pwa-install-container, .pwa-install',
        autoShow: true,
        deferredPromptTimeout: 5000
      },
      responsiveTable: {
        selector: '.location-schedule, .price-table, .table-responsive, table[data-responsive]',
        breakpoint: 768,
        scrollIndicators: true
      },
      smoothScroll: {
        selector: 'a[href^="#"], .smooth-scroll',
        duration: 800,
        easing: 'ease-in-out'
      }
    };

    // Deep merge user config with defaults
    const mergedConfig = { ...defaultConfig };
    for (const key in userConfig) {
      if (userConfig.hasOwnProperty(key)) {
        mergedConfig[key] = { ...defaultConfig[key], ...userConfig[key] };
      }
    }

    return mergedConfig;
  }

  async init() {
    console.log('VaccineApp: Initializing all atomic components with cache busting...');
    const timestamp = new Date().getTime();

    const componentModules = [
      'accordion', 'gdpr-manager', 'lightbox', 'price-toggle',
      'pwa-install', 'responsive-table', 'smooth-scroll'
    ];

    const classMap = {
      'accordion': 'Accordion',
      'gdpr-manager': 'GdprManager',
      'lightbox': 'Lightbox',
      'price-toggle': 'PriceToggle',
      'pwa-install': 'PwaInstall',
      'responsive-table': 'ResponsiveTable',
      'smooth-scroll': 'SmoothScroll'
    };

    try {
      for (const moduleName of componentModules) {
        const path = `./components/${moduleName}.js?v=${timestamp}`;
        const className = classMap[moduleName];

        try {
          const module = await import(path);
          const ComponentClass = module[className];

          if (ComponentClass) {
            const componentConfigKey = className.charAt(0).toLowerCase() + className.slice(1);
            const componentConfig = this.config[componentConfigKey] || {};
            
            // Handle different component constructor signatures
            let component;
            
            try {
              // Check if required DOM elements exist before instantiation
              let canInstantiate = true;
              
              if (className === 'Lightbox') {
                const lightboxElements = document.querySelectorAll(componentConfig.selector || 'img[data-lightbox], .lightbox-trigger');
                if (lightboxElements.length === 0) {
                  console.log(`⚠️  Component ${className} skipped - no lightbox elements found`);
                  canInstantiate = false;
                }
                if (canInstantiate) component = new ComponentClass(componentConfig.selector, componentConfig);
              } else if (className === 'SmoothScroll') {
                const smoothScrollElements = document.querySelectorAll(componentConfig.selector || 'a[href^="#"], .smooth-scroll');
                if (smoothScrollElements.length === 0) {
                  console.log(`⚠️  Component ${className} skipped - no smooth scroll elements found`);
                  canInstantiate = false;
                } else {
                  console.log(`✅ Found ${smoothScrollElements.length} smooth scroll element(s):`, [...smoothScrollElements].map(el => el.getAttribute('href') || el.className));
                }
                if (canInstantiate) component = new ComponentClass(componentConfig.selector, componentConfig);
              } else if (className === 'ResponsiveTable') {
                const tableElements = document.querySelectorAll(componentConfig.selector || '.location-schedule, .price-table, .table-responsive, table[data-responsive]');
                if (tableElements.length === 0) {
                  console.log(`⚠️  Component ${className} skipped - no responsive table elements found`);
                  canInstantiate = false;
                } else {
                  console.log(`✅ Found ${tableElements.length} table(s) for ResponsiveTable:`, [...tableElements].map(t => t.className));
                }
                if (canInstantiate) component = new ComponentClass(componentConfig.selector, componentConfig);
              } else if (className === 'PwaInstall') {
                const pwaElements = document.querySelectorAll(componentConfig.containerSelector || '#pwa-install-container, .pwa-install');
                if (pwaElements.length === 0) {
                  console.log(`⚠️  Component ${className} skipped - no PWA install container found`);
                  canInstantiate = false;
                }
                if (canInstantiate) component = new ComponentClass(componentConfig);
              } else if (className === 'GdprManager') {
                component = new ComponentClass(componentConfig);
              } else if (className === 'Accordion') {
                component = new ComponentClass(componentConfig);
              } else if (className === 'PriceToggle') {
                component = new ComponentClass(componentConfig.selector, componentConfig);
              } else {
                component = new ComponentClass(componentConfig);
              }
              
              if (canInstantiate) {
                this.components[componentConfigKey] = component;
                console.log(`✅ Component ${className} loaded successfully.`);
              }
            } catch (constructorError) {
              console.error(`❌ Failed to instantiate ${className}:`, constructorError);
            }
          } else {
            console.error(`❌ Component class ${className} not found in module ${moduleName}`);
          }
        } catch (moduleError) {
          console.error(`❌ Failed to load module ${moduleName}.js`, moduleError);
        }
      }
      console.log('VaccineApp: All components initialized successfully.');
      console.log('Active components:', this.components);
    } catch (error) {
      console.error('❌ A critical error occurred during component initialization:', error);
    }
  }
}