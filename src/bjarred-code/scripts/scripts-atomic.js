(function() {
  'use strict';

  // --- MASTER CONFIGURATION ---
  const VACCINE_APP_CONFIG = {
    // Paths
    legacyScriptPath: 'https://www.ptj.se/49f763/globalassets/vaccincenter-varvet/scripts/legacy/scripts.js',
    // Component-specific options
    lightbox: {
      selector: '.lightbox-trigger, img[data-lightbox]',
      closeOnEscape: true,
      trapFocus: true
    },
    smoothScroll: {
      selector: 'a[href^="#"]:not([data-no-smooth])',
      offset: 80
    },
    priceToggle: {
      selector: 'input[name="price-view"]',
      tableSelector: '.price-table'
    },
    responsiveTable: {
      selector: '.location-schedule, .price-table',
      scrollHint: true
    },
    faqToggle: {
      selector: '.faq-item, details[data-faq], details[data-accordion]',
      maintainBackground: true,
      singleOpen: false
    },
    gdprManager: {
      bannerSelector: '#gdpr-banner',
      acceptSelector: '#gdpr-accept',
      storageKey: 'vaccine-gdpr-consent'
    },
    pwaInstall: {
      triggerSelector: '#install-pwa',
      bannerSelector: '.pwa-install-banner'
    },
    // Development mode
    debug: window.location.hostname === 'localhost'
  };

  // --- LOADER LOGIC ---
  function supportsModules() {
    try {
      new Function('import("")');
      return true;
    } catch (err) {
      return false;
    }
  }

  function loadLegacyFallback(path) {
    if (!path) {
      console.error('Legacy script path not provided.');
      return;
    }
    console.log('📦 Loading legacy script fallback...');
    const script = document.createElement('script');
    script.src = path;
    script.defer = true;
    document.head.appendChild(script);
    console.log('✅ Legacy fallback initialized.');
  }

  async function loadModernApp(config) {
    try {
      console.log('🚀 Loading Atomic Components System...');
      const cacheBust = `?v=${new Date().getTime()}`;
      const modulePath = `https://www.ptj.se/49f763/globalassets/vaccincenter-varvet/scripts/atomic-components/js-modules/main.js${cacheBust}`;

      const { VaccineBjarredApp } = await import(modulePath);

      if (typeof VaccineBjarredApp === 'function') {
        window.vaccineApp = new VaccineBjarredApp(config);
        console.log('✅ Atomic Components System Loaded Successfully.');
      } else {
        throw new Error('VaccineBjarredApp is not a constructor. Check main.js.');
      }
    } catch (error) {
      console.error('❌ Failed to load modern app, falling back to legacy.', error);
      loadLegacyFallback(config.legacyScriptPath);
    }
  }

  // --- INITIALIZATION ---
  if (supportsModules()) {
    loadModernApp(VACCINE_APP_CONFIG);
  } else {
    loadLegacyFallback(VACCINE_APP_CONFIG.legacyScriptPath);
  }

})();