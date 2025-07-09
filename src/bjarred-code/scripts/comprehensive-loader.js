(function() {
  'use strict';

  // Configuration
  const BASE_URL = '/globalassets/vaccincenter-varvet/';
  const CACHE_BUSTER = '?v=' + new Date().getTime();

  // Define all resources to load
  const RESOURCES = {
    // CSS files - load first for proper styling
    css: [
      'styles/styles-min-vb.css',
      'styles/style.css',
      'styles/table-responsive.css',
      'styles/vb-header.css',
      'styles/vb-tables.css'
    ],

    // External JavaScript libraries - load before our modules
    externalJs: [
      'scripts/external-scripts/tailwind.js',
      'scripts/external-scripts/local-bs.js'
    ],

    // Design tokens and configuration - load before components
    config: [
      'scripts/atomic-components/design-tokens/event-types.json'
    ],

    // Core interfaces and contracts - load before implementations
    interfaces: [
      'scripts/atomic-components/interfaces/component-contracts.js'
    ],

    // Core modules - load before components
    core: [
      'scripts/atomic-components/js-modules/utilities/event-config.js',
      'scripts/atomic-components/js-modules/core/event-manager.js'
    ],

    // Component modules - load after core
    components: [
      'scripts/atomic-components/js-modules/components/faq-toggle.js'
    ],

    // Main application script - load last
    main: [
      'scripts/scripts-atomic.js'
    ]
  };

  // Utility functions
  const createLoadPromise = (element) => {
    return new Promise((resolve, reject) => {
      element.onload = resolve;
      element.onerror = reject;
    });
  };

  const loadCSS = (href) => {
    return new Promise((resolve, reject) => {
      // Check if CSS is already loaded
      const existing = document.querySelector(`link[href*="${href.split('?')[0]}"]`);
      if (existing) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = BASE_URL + href + CACHE_BUSTER;
      link.crossOrigin = 'anonymous';

      link.onload = resolve;
      link.onerror = reject;

      document.head.appendChild(link);
    });
  };

  const loadJS = (src, isModule = false) => {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      const existing = document.querySelector(`script[src*="${src.split('?')[0]}"]`);
      if (existing) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      if (isModule) {
        script.type = 'module';
      }
      script.src = BASE_URL + src + CACHE_BUSTER;
      script.async = false; // Maintain loading order
      script.crossOrigin = 'anonymous';

      script.onload = resolve;
      script.onerror = reject;

      document.body.appendChild(script);
    });
  };

  const loadJSON = (src) => {
    return fetch(BASE_URL + src + CACHE_BUSTER)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Store JSON data globally for access by other modules
        window.VaccineBjarredConfig = window.VaccineBjarredConfig || {};
        const configKey = src.split('/').pop().replace('.json', '');
        window.VaccineBjarredConfig[configKey] = data;
        return data;
      });
  };

  // Sequential loading function
  const loadResourcesSequentially = async (resources, loader) => {
    const results = [];
    for (const resource of resources) {
      try {
        const result = await loader(resource);
        results.push(result);
        console.log(`✓ Loaded: ${resource}`);
      } catch (error) {
        console.error(`✗ Failed to load: ${resource}`, error);
        // Continue loading other resources even if one fails
      }
    }
    return results;
  };

  // Main loading function
  const loadAllResources = async () => {
    try {
      console.log('🚀 Starting comprehensive resource loading...');

      // Phase 1: Load CSS files (parallel for performance)
      console.log('📄 Loading CSS files...');
      await Promise.all(RESOURCES.css.map(loadCSS));

      // Phase 2: Load external JavaScript libraries
      console.log('📚 Loading external JavaScript libraries...');
      await loadResourcesSequentially(RESOURCES.externalJs, (src) => loadJS(src, false));

      // Phase 3: Load configuration JSON files
      console.log('⚙️ Loading configuration files...');
      await loadResourcesSequentially(RESOURCES.config, loadJSON);

      // Phase 4: Load interface definitions
      console.log('🏗️ Loading interfaces and contracts...');
      await loadResourcesSequentially(RESOURCES.interfaces, (src) => loadJS(src, true));

      // Phase 5: Load core modules
      console.log('🔧 Loading core modules...');
      await loadResourcesSequentially(RESOURCES.core, (src) => loadJS(src, true));

      // Phase 6: Load component modules
      console.log('🧩 Loading component modules...');
      await loadResourcesSequentially(RESOURCES.components, (src) => loadJS(src, true));

      // Phase 7: Load main application script
      console.log('🎯 Loading main application...');
      await loadResourcesSequentially(RESOURCES.main, (src) => loadJS(src, true));

      console.log('✅ All resources loaded successfully!');

      // Dispatch custom event to notify that all resources are loaded
      const event = new CustomEvent('vaccineBjarredResourcesLoaded', {
        detail: {
          timestamp: new Date().toISOString(),
          loadedResources: RESOURCES
        }
      });
      document.dispatchEvent(event);

    } catch (error) {
      console.error('❌ Error during resource loading:', error);

      // Dispatch error event
      const errorEvent = new CustomEvent('vaccineBjarredResourcesError', {
        detail: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });
      document.dispatchEvent(errorEvent);
    }
  };

  // Feature detection and polyfill loading
  const checkSupportAndLoad = () => {
    // Check for modern browser features
    const supportsModules = 'noModule' in HTMLScriptElement.prototype;
    const supportsES6 = (() => {
      try {
        return new Function('() => {}'), true;
      } catch (e) {
        return false;
      }
    })();

    if (!supportsModules || !supportsES6) {
      console.warn('⚠️ Browser may not fully support ES6 modules. Loading fallback...');
      // You could load polyfills here if needed
    }

    // Start loading
    loadAllResources();
  };

  // Start the loading process
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkSupportAndLoad);
  } else {
    checkSupportAndLoad();
  }

  // Export utilities for debugging
  window.VaccineBjarredLoader = {
    loadCSS,
    loadJS,
    loadJSON,
    loadAllResources,
    RESOURCES
  };

})();