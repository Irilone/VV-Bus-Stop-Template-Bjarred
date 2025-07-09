(function() {
  'use strict';

  // EpiServer Configuration
  const EPISERVER_DOMAIN = 'https://www.ptj.se';
  const SITE_PATH = '/globalassets/vaccincenter-varvet/';

  // EpiServer version hashes for different resource types
  const VERSION_HASHES = {
    css: '49f8f5',           // CSS files version hash
    coreJs: '49f946',        // Core JS modules version hash
    componentJs: '49f936',   // Component JS modules version hash
    interfaceJs: '49f961',   // Interface contracts version hash
    configJson: '49f952',    // Design tokens/config version hash
    externalJs: '49f941',    // External scripts version hash
    bootstrapJs: '49f80a'    // Bootstrap/local scripts version hash
  };

  // Build URLs with EpiServer version hashes
  const buildEpiServerURL = (path, versionType) => {
    const hash = VERSION_HASHES[versionType] || VERSION_HASHES.css;
    return `${EPISERVER_DOMAIN}/${hash}${SITE_PATH}${path}`;
  };

  // Define all resources to load with EpiServer URLs
  const RESOURCES = {
    // CSS files - load first for proper styling
    css: [
      { url: buildEpiServerURL('styles/styles-min-vb.css', 'css'), name: 'Main VB Styles' },
      { url: buildEpiServerURL('styles/style.css', 'css'), name: 'Base Styles' },
      { url: buildEpiServerURL('styles/table-responsive.css', 'css'), name: 'Responsive Tables' },
      { url: buildEpiServerURL('styles/vb-header.css', 'css'), name: 'VB Header Styles' },
      { url: buildEpiServerURL('styles/vb-tables.css', 'css'), name: 'VB Table Styles' }
    ],

    // External JavaScript libraries - load before our modules
    externalJs: [
      { url: buildEpiServerURL('scripts/external-scripts/tailwind.js', 'externalJs'), name: 'Tailwind CSS' },
      { url: buildEpiServerURL('scripts/external-scripts/local-bs.js', 'bootstrapJs'), name: 'Local Bootstrap' }
    ],

    // Design tokens and configuration - load before components
    config: [
      { url: buildEpiServerURL('scripts/atomic-components/design-tokens/event-types.json', 'configJson'), name: 'Event Types Config' }
    ],

    // Core interfaces and contracts - load before implementations
    interfaces: [
      { url: buildEpiServerURL('scripts/atomic-components/interfaces/component-contracts.js', 'interfaceJs'), name: 'Component Contracts' }
    ],

    // Core modules - load before components
    core: [
      { url: buildEpiServerURL('scripts/atomic-components/js-modules/utilities/event-config.js', 'coreJs'), name: 'Event Configuration' },
      { url: buildEpiServerURL('scripts/atomic-components/js-modules/core/event-manager.js', 'coreJs'), name: 'Event Manager' }
    ],

    // Component modules - load after core
    components: [
      { url: buildEpiServerURL('scripts/atomic-components/js-modules/components/faq-toggle.js', 'componentJs'), name: 'FAQ Toggle Component' },
      { url: buildEpiServerURL('scripts/atomic-components/js-modules/components/lazy-image-loader.js', 'componentJs'), name: 'Lazy Image Loader' }
    ]
  };

  // Utility functions
  const createLoadPromise = (element) => {
    return new Promise((resolve, reject) => {
      element.onload = resolve;
      element.onerror = reject;
    });
  };

  const loadCSS = (resourceObj) => {
    return new Promise((resolve, reject) => {
      const { url, name } = resourceObj;

      // Check if CSS is already loaded
      const existing = document.querySelector(`link[href="${url}"]`);
      if (existing) {
        console.log(`↩️ Already loaded: ${name}`);
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = url;
      link.crossOrigin = 'anonymous';

      link.onload = () => {
        console.log(`✅ CSS loaded: ${name}`);
        resolve();
      };
      link.onerror = (error) => {
        console.error(`❌ CSS failed: ${name} - ${url}`, error);
        reject(error);
      };

      document.head.appendChild(link);
    });
  };

  const loadJS = (resourceObj, isModule = false) => {
    return new Promise((resolve, reject) => {
      const { url, name } = resourceObj;

      // Check if script is already loaded
      const existing = document.querySelector(`script[src="${url}"]`);
      if (existing) {
        console.log(`↩️ Already loaded: ${name}`);
        resolve();
        return;
      }

      const script = document.createElement('script');
      if (isModule) {
        script.type = 'module';
      }
      script.src = url;
      script.async = false; // Maintain loading order
      script.crossOrigin = 'anonymous';

      script.onload = () => {
        console.log(`✅ JS loaded: ${name}`);
        resolve();
      };
      script.onerror = (error) => {
        console.error(`❌ JS failed: ${name} - ${url}`, error);
        reject(error);
      };

      document.body.appendChild(script);
    });
  };

  const loadJSON = (resourceObj) => {
    const { url, name } = resourceObj;

    return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Store JSON data globally for access by other modules
        window.VaccineBjarredConfig = window.VaccineBjarredConfig || {};
        const configKey = url.split('/').pop().replace('.json', '');
        window.VaccineBjarredConfig[configKey] = data;
        console.log(`✅ Config loaded: ${name}`);
        return data;
      })
      .catch(error => {
        console.error(`❌ Config failed: ${name} - ${url}`, error);
        throw error;
      });
  };

  // Sequential loading function with enhanced error handling
  const loadResourcesSequentially = async (resources, loader) => {
    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const resource of resources) {
      try {
        const result = await loader(resource);
        results.push(result);
        successCount++;
      } catch (error) {
        console.error(`⚠️ Failed to load: ${resource.name}`, error);
        failCount++;
        // Continue loading other resources even if one fails
      }
    }

    console.log(`📊 Batch complete: ${successCount} success, ${failCount} failed`);
    return results;
  };

  // Enhanced parallel loading for CSS
  const loadCSSParallel = async (resources) => {
    console.log('📄 Loading CSS files in parallel...');
    const promises = resources.map(resource => loadCSS(resource));

    try {
      await Promise.allSettled(promises);
      const successCount = resources.length;
      console.log(`✨ CSS loading complete: ${successCount} files processed`);
    } catch (error) {
      console.warn('⚠️ Some CSS files failed to load, but continuing...', error);
    }
  };

  // Main loading function
  const loadAllResources = async () => {
    try {
      console.log('🚀 Starting EpiServer VaccincenterVarvet resource loading...');
      console.log(`🌐 Domain: ${EPISERVER_DOMAIN}`);
      console.log(`📁 Site Path: ${SITE_PATH}`);

      // Phase 1: Load CSS files (parallel for performance)
      await loadCSSParallel(RESOURCES.css);

      // Phase 2: Load external JavaScript libraries
      console.log('📚 Loading external JavaScript libraries...');
      await loadResourcesSequentially(RESOURCES.externalJs, (resource) => loadJS(resource, false));

      // Phase 3: Load configuration JSON files
      console.log('⚙️ Loading configuration files...');
      await loadResourcesSequentially(RESOURCES.config, loadJSON);

      // Phase 4: Load interface definitions
      console.log('🏗️ Loading interfaces and contracts...');
      await loadResourcesSequentially(RESOURCES.interfaces, (resource) => loadJS(resource, true));

      // Phase 5: Load core modules
      console.log('🔧 Loading core modules...');
      await loadResourcesSequentially(RESOURCES.core, (resource) => loadJS(resource, true));

      // Phase 6: Load component modules
      console.log('🧩 Loading component modules...');
      await loadResourcesSequentially(RESOURCES.components, (resource) => loadJS(resource, true));

      console.log('✅ All EpiServer resources loaded successfully!');

      // Dispatch custom event to notify that all resources are loaded
      const event = new CustomEvent('vaccineBjarredEpiServerResourcesLoaded', {
        detail: {
          timestamp: new Date().toISOString(),
          loadedResources: RESOURCES,
          episerver: {
            domain: EPISERVER_DOMAIN,
            sitePath: SITE_PATH,
            versionHashes: VERSION_HASHES
          }
        }
      });
      document.dispatchEvent(event);

      // Initialize any post-load functionality
      initializeVaccincenterComponents();

    } catch (error) {
      console.error('❌ Critical error during EpiServer resource loading:', error);

      // Dispatch error event
      const errorEvent = new CustomEvent('vaccineBjarredEpiServerResourcesError', {
        detail: {
          error: error.message,
          timestamp: new Date().toISOString(),
          episerver: {
            domain: EPISERVER_DOMAIN,
            sitePath: SITE_PATH
          }
        }
      });
      document.dispatchEvent(errorEvent);
    }
  };

  // Initialize components after all resources are loaded
  const initializeVaccincenterComponents = () => {
    try {
      console.log('🎯 Initializing Vaccincenter components...');

      // Wait a short moment for all scripts to register
      setTimeout(() => {
                // Trigger FAQ initialization if available
        if (window.VaccincenterFAQ && typeof window.VaccincenterFAQ.init === 'function') {
          window.VaccincenterFAQ.init();
          console.log('✅ FAQ component initialized');
        }

        // Trigger event manager initialization if available
        if (window.VBEventManager && typeof window.VBEventManager.initialize === 'function') {
          window.VBEventManager.initialize();
          console.log('✅ Event Manager initialized');
        }

        // Trigger lazy image loader initialization if available
        if (window.VaccincenterLazyLoader && typeof window.VaccincenterLazyLoader.addImages === 'function') {
          // Re-scan for any new images that may have been added
          const newImages = document.querySelectorAll('img.lazy:not([data-lazy-processed])');
          if (newImages.length > 0) {
            window.VaccincenterLazyLoader.addImages(Array.from(newImages));
            console.log('✅ Lazy Image Loader refreshed');
          }
        }

        // Dispatch initialization complete event
        const initEvent = new CustomEvent('vaccineBjarredComponentsInitialized', {
          detail: { timestamp: new Date().toISOString() }
        });
        document.dispatchEvent(initEvent);

      }, 100);

    } catch (error) {
      console.warn('⚠️ Component initialization had issues:', error);
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
      console.warn('⚠️ Browser may not fully support ES6 modules. EpiServer compatibility mode...');
      // Continue anyway as EpiServer usually handles legacy browsers
    }

    // Check EpiServer environment
    if (window.EPiServer || document.querySelector('[data-episerver]')) {
      console.log('🏢 EpiServer environment detected');
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

  // Export utilities for debugging and EpiServer integration
  window.VaccineBjarredEpiServerLoader = {
    loadCSS,
    loadJS,
    loadJSON,
    loadAllResources,
    buildEpiServerURL,
    RESOURCES,
    VERSION_HASHES,
    EPISERVER_DOMAIN,
    SITE_PATH
  };

  // EpiServer-specific event listeners
  if (window.EPiServer) {
    // Listen for EpiServer edit mode changes
    document.addEventListener('episerver.contentSaved', function(e) {
      console.log('📝 EpiServer content saved, resources may need refresh');
    });

    document.addEventListener('episerver.contentPublished', function(e) {
      console.log('📢 EpiServer content published, checking for updates');
    });
  }

})();