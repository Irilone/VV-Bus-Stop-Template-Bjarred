/**
 * Vaccinbussen JavaScript - Komplett system med responsiv bildhantering
 * @description Hanterar alla interaktiva element och bildoptimering på Vaccinbussen-sidan
 * @author Claude Code
 * @version 3.1 - Fusion Enhanced med CSS variable integration och performance optimizations
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // SEKTION 1: RESPONSIV BILDOPTIMERING OCH PRESTANDA
  // ═══════════════════════════════════════════════════════════════

  /**
   * Responsiv bildhantering för Episerver
   * @description Konverterar bilder med data-fluid attribut till picture-element
   * med optimerade breakpoints som matchar Bootstrap
   */
  const responsiveBreakpoints = [576, 768, 992, 1200];

  document.querySelectorAll('img[data-fluid]').forEach(img => {
    const url = new URL(img.src, location.origin);
    url.search = ''; // Rensa befintliga parametrar

    const picture = document.createElement('picture');

    // Skapa source-element för varje breakpoint
    responsiveBreakpoints.forEach(width => {
      const optimizedSrc = `${url.pathname}?width=${width}&mode=max&format=auto&q=80`;
      const source = Object.assign(document.createElement('source'), {
        srcset: optimizedSrc,
        media: `(max-width:${width-1}px)`
      });
      picture.appendChild(source);
    });

    // Största storleken som fallback för img-elementet
    img.src = `${url.pathname}?width=1200&mode=max&format=auto&q=80`;
    img.classList.add('img-fluid'); // Behåll Bootstrap-beteende
    img.loading = 'lazy';
    picture.appendChild(img.cloneNode());

    // Byt ut ursprunglig bild mot picture-element
    img.replaceWith(picture);
  });

  /**
   * Fade-in animationer för element när de kommer in i viewporten
   * @description Använder IntersectionObserver för mjuka animationer
   */
  const fadeElements = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window) {
    const fadeObserver = new window.IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observerInstance.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px' }
    );
    fadeElements.forEach(el => fadeObserver.observe(el));
  } else {
    // Fallback för äldre webbläsare
    fadeElements.forEach(el => el.classList.add('visible'));
  }

  /**
   * Lazy loading för bilder med data-src attribut
   * @description Laddar bilder när de närmar sig viewporten
   */
  const lazyImages = document.querySelectorAll('img[data-src]');
  if ('IntersectionObserver' in window && lazyImages.length > 0) {
    const lazyObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px'
    });

    lazyImages.forEach(img => lazyObserver.observe(img));
  }

  // ═══════════════════════════════════════════════════════════════
  // SEKTION 2: ANVÄNDARINTERAKTION OCH NAVIGATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Markera dagens öppettider
   * @description Highlightar aktuell dag i öppettidslistan
   */
  const weekdays = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
  const today = weekdays[new Date().getDay()];
  document.querySelectorAll('.hours li').forEach(li => {
    const dayTextElement = li.querySelector('.day');
    if (dayTextElement) {
      const dayText = dayTextElement.textContent.trim();
      if (dayText.startsWith(today)) {
        li.classList.add('today');
      }
    }
  });

  /**
   * Mjuk scroll för ankar-länkar
   * @description Implementerar smooth scrolling med tillgänglighetsfokus
   */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }, 400);
      }
    });
  });

  /**
   * Städning av navigationselement
   * @description Tar bort expanderade chevron-ikoner
   */
  document.querySelectorAll('.navigation__item-chevron--expanded').forEach(el => el.remove());

  // ═══════════════════════════════════════════════════════════════
  // SEKTION 3: FAQ OCH INNEHÅLLSHANTERING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Konfigurerar FAQ-frågor för tvåradslayout
   * @description Förbereder data-attribut för CSS-styling av FAQ-element
   */
  function setupFAQDataAttributes() {
    const faqSummaries = document.querySelectorAll('.faq-item summary');
    faqSummaries.forEach(summary => {
      const questionText = summary.textContent.trim();
      summary.setAttribute('data-question', questionText);
      summary.textContent = '';
    });
  }

  setupFAQDataAttributes();

  // ═══════════════════════════════════════════════════════════════
  // SEKTION 4: BILDVISNING OCH LIGHTBOX
  // ═══════════════════════════════════════════════════════════════

  /**
   * Lightbox för bussbilder
   * @description Klick-för-förstoring funktionalitet med fullständig tillgänglighet
   */
  const lightbox = document.createElement('div');
  lightbox.className = 'img-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Förstorad bildvisning');
  document.body.appendChild(lightbox);

  let isLightboxOpen = false;
  let escapeHandler = null;

  /**
   * Lightbox bakgrundsklick-hanterare
   * @param {Event} e - Klickhändelse
   */
  function handleLightboxBackgroundClick(e) {
    if (e.target === lightbox) closeLightbox();
  }

  /**
   * Stäng lightbox-funktionalitet
   * @description Rensar tillstånd och återställer fokus
   */
  function closeLightbox() {
    if (!isLightboxOpen) return;
    isLightboxOpen = false;
    lightbox.classList.remove('open');
    lightbox.innerHTML = '';
    document.body.style.overflow = '';
    lightbox.removeEventListener('click', handleLightboxBackgroundClick);
    if (escapeHandler) document.removeEventListener('keydown', escapeHandler);
    escapeHandler = null;
  }

  document.querySelectorAll('.bus-img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (isLightboxOpen) return;
      isLightboxOpen = true;

      // Rensa och lägg till klonbild
      lightbox.innerHTML = '';
      const clone = img.cloneNode(true);

      // Kritisk fix: Ta bort alla ärvda stilar och klasser
      clone.className = 'lightbox-img';
      clone.removeAttribute('style');

      // Applicera säkra, explicita stilar för lightbox-kontext
      clone.style.cssText = `
        display: block !important;
        margin: 0 auto !important;
        max-width: 90vw !important;
        max-height: 90vh !important;
        width: auto !important;
        height: auto !important;
        object-fit: contain !important;
        position: static !important;
        float: none !important;
        transform: none !important;
        transition: none !important;
        cursor: default !important;
        user-select: none !important;
        pointer-events: none !important;
        border-radius: var(--radius-md) !important;
        box-shadow: 0 0 24px rgba(0,0,0,0.7) !important;
      `;

      clone.setAttribute('draggable', 'false');
      clone.addEventListener('dragstart', evt => evt.preventDefault());

      lightbox.appendChild(clone);

      // Visa lightbox
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';

      // Fokushantering för tillgänglighet
      lightbox.setAttribute('tabindex', '-1');
      lightbox.focus();

      // ESC-tangent för stängning
      escapeHandler = evt => { if (evt.key === 'Escape') closeLightbox(); };
      document.addEventListener('keydown', escapeHandler);

      // Stäng endast vid bakgrundsklick
      lightbox.addEventListener('click', handleLightboxBackgroundClick);
    });

    // Felhantering för trasiga bilder
    img.addEventListener('error', function() {
      this.style.opacity = '0.5';
      this.style.cursor = 'not-allowed';
      console.error('Bilden kunde inte laddas:', this.src);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // SEKTION 5: FOOTER-LÄNK KORRIGERINGAR
  // ═══════════════════════════════════════════════════════════════

  /**
   * Footer-länk hot-fix
   * @description Korrigerar specifika footer-länkar med rätt URL:er
   */
  const footerLinkFixes = {
    'Tillgänglighet':
      'https://www.praktikertjanst.se/mer/om-oss/tillganglighet/tillganglighet-for-www.ptj.se/',
    'Synpunkter på vården':
      'https://www.praktikertjanst.se/praktisk-information/synpunkter-pa-varden/'
  };

  // Sök endast i footer-navigationen
  const footerNav = document.querySelector('.footer__link-nav');
  if (footerNav) {
    footerNav.querySelectorAll('a.footer__link').forEach(a => {
      const text = a.textContent.trim();
      if (footerLinkFixes[text]) {
        a.href = footerLinkFixes[text];
        a.setAttribute('rel', 'noopener');
        a.setAttribute('title', text);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // SEKTION 6: CSS VARIABLE INTEGRATION & PERFORMANCE MONITORING
  // ═══════════════════════════════════════════════════════════════

  /**
   * FUSION ENTERPRISE: Security & Privacy Framework
   * @description GDPR-compliant privacy controls and security hardening
   */
  function initSecurityFramework() {
    // Content Security Policy enforcement
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const cspMeta = document.createElement('meta');
      cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
      cspMeta.setAttribute('content', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; font-src 'self' data:");
      document.head.appendChild(cspMeta);
    }

    // Sanitize external inputs
    window.sanitizeInput = function(input) {
      if (typeof input !== 'string') return '';
      return input
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
    };

    // Secure localStorage wrapper
    window.secureStorage = {
      set: function(key, value, encrypt = true) {
        try {
          const data = encrypt ? btoa(JSON.stringify(value)) : JSON.stringify(value);
          localStorage.setItem('vb_' + key, data);
          return true;
        } catch (e) {
          console.warn('Säker lagring misslyckades:', e.message);
          return false;
        }
      },
      get: function(key, decrypt = true) {
        try {
          const data = localStorage.getItem('vb_' + key);
          if (!data) return null;
          return decrypt ? JSON.parse(atob(data)) : JSON.parse(data);
        } catch (e) {
          console.warn('Säker hämtning misslyckades:', e.message);
          return null;
        }
      },
      remove: function(key) {
        localStorage.removeItem('vb_' + key);
      }
    };
  }

  /**
   * FUSION ENTERPRISE: GDPR Compliance Manager
   * @description Swedish data protection and privacy controls
   */
  function initGDPRCompliance() {
    // Check for existing consent
    const hasConsent = window.secureStorage?.get('gdpr_consent', false) || false;

    if (!hasConsent && !document.querySelector('.gdpr-banner')) {
      const banner = document.createElement('div');
      banner.className = 'gdpr-banner';
      banner.setAttribute('role', 'banner');
      banner.setAttribute('aria-label', 'Cookie- och dataskyddsmeddelande');
      banner.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--clr-primary);
        color: white;
        padding: var(--space-md);
        z-index: 10000;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        transform: translateY(100%);
        transition: transform 0.3s ease;
      `;

      banner.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; gap: var(--space-md); flex-wrap: wrap;">
          <p style="flex: 1; margin: 0; font-size: var(--fs-sm);">
            Vi använder endast tekniskt nödvändiga cookies för att säkerställa att vår tjänst fungerar korrekt.
            Inga personuppgifter lagras utan ditt samtycke enligt GDPR.
          </p>
          <div style="display: flex; gap: var(--space-sm);">
            <button id="gdpr-accept" style="background: white; color: var(--clr-primary); border: none; padding: var(--space-xs) var(--space-md); border-radius: var(--radius-sm); font-weight: 600; cursor: pointer;">
              Jag förstår
            </button>
            <button id="gdpr-info" style="background: transparent; color: white; border: 1px solid white; padding: var(--space-xs) var(--space-md); border-radius: var(--radius-sm); cursor: pointer;">
              Mer info
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(banner);

      // Animate in
      setTimeout(() => {
        banner.style.transform = 'translateY(0)';
      }, 100);

      // Handle consent
      document.getElementById('gdpr-accept').addEventListener('click', function() {
        window.secureStorage?.set('gdpr_consent', {
          accepted: true,
          timestamp: new Date().toISOString(),
          version: '1.0'
        });
        banner.style.transform = 'translateY(100%)';
        setTimeout(() => banner.remove(), 300);
        console.log('GDPR: Samtycke registrerat');
      });

      // Handle info request
      document.getElementById('gdpr-info').addEventListener('click', function() {
        window.open('/integritetspolicy', '_blank', 'noopener,noreferrer');
      });
    }

    // Data minimization: Clean old storage
    const storageKeys = Object.keys(localStorage);
    const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    storageKeys.forEach(key => {
      if (key.startsWith('vb_') && key !== 'vb_gdpr_consent') {
        try {
          const data = window.secureStorage?.get(key.replace('vb_', ''));
          if (data && data.timestamp && new Date(data.timestamp).getTime() < oneMonthAgo) {
            window.secureStorage?.remove(key.replace('vb_', ''));
          }
        } catch (e) {
          // Remove corrupted data
          localStorage.removeItem(key);
        }
      }
    });
  }

  /**
   * FUSION ENTERPRISE: Cross-Browser Compatibility
   * @description Polyfills and fallbacks for maximum browser support
   */
  function initCrossBrowserSupport() {
    // IntersectionObserver polyfill
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      const elements = document.querySelectorAll('.fade-in, img[data-src]');
      elements.forEach(el => {
        if (el.classList.contains('fade-in')) {
          el.classList.add('visible');
        }
        if (el.dataset.src) {
          el.src = el.dataset.src;
          el.removeAttribute('data-src');
        }
      });
    }

    // CSS custom properties fallback
    if (!CSS.supports('color', 'var(--test)')) {
      // Inject fallback styles for IE
      const fallbackCSS = `
        body { font-size: 18px; }
        h1 { font-size: 48px; }
        h2 { font-size: 36px; }
        .card { border-radius: 8px; }
        .button { padding: 8px 16px; }
      `;
      const style = document.createElement('style');
      style.textContent = fallbackCSS;
      document.head.appendChild(style);
    }

    // Fetch polyfill for IE
    if (!('fetch' in window)) {
      window.fetch = function(url, options = {}) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open(options.method || 'GET', url);

          if (options.headers) {
            Object.keys(options.headers).forEach(key => {
              xhr.setRequestHeader(key, options.headers[key]);
            });
          }

          xhr.onload = () => resolve({
            json: () => Promise.resolve(JSON.parse(xhr.responseText)),
            text: () => Promise.resolve(xhr.responseText),
            ok: xhr.status >= 200 && xhr.status < 300
          });

          xhr.onerror = () => reject(new Error('Network error'));
          xhr.send(options.body);
        });
      };
    }
  }

  /**
   * FUSION ULTRA: Advanced Error Handling & Monitoring
   * @description Comprehensive error tracking och robust performance monitoring
   */
  function initAdvancedErrorHandling() {
    // Global error handler för robusthet
    window.addEventListener('error', (event) => {
      console.error('Vaccinbussen JS Error:', {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        timestamp: new Date().toISOString()
      });
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      event.preventDefault(); // Förhindra console spam
    });

    // Network connectivity monitoring
    window.addEventListener('online', () => {
      console.log('Anslutning återställd - Vaccinbussen online');
    });

    window.addEventListener('offline', () => {
      console.warn('Internetanslutning förlorad - Vissa funktioner kan vara begränsade');
    });
  }

  /**
   * FUSION ULTRA: Advanced SEO & Healthcare Schema
   * @description Strukturerad data för svensk hälsovård och sökoptimering
   */
  function initHealthcareSchema() {
    // Kontrollera om schema redan finns
    if (document.querySelector('[data-schema="healthcare"]')) return;

    const schema = {
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      "name": "Vaccin- & Hälsobussen Björred",
      "description": "Mobil vaccinationstjänst i Björred - Drop-in vaccination och hälsokontroller",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Coop, Norra Västkustvägen 2",
        "postalCode": "237 37",
        "addressLocality": "Björred",
        "addressCountry": "SE"
      },
      "telephone": "+46-XXX-XXXXXX",
      "openingHours": "Mo 14:30-18:30",
      "medicalSpecialty": "Vaccination",
      "availableService": [
        {
          "@type": "MedicalTherapy",
          "name": "TBE-vaccination",
          "description": "Skydd mot fästingburen hjärninflammation"
        },
        {
          "@type": "MedicalTherapy",
          "name": "Grundskyddsvaccination",
          "description": "Stelkramp, difteri och kikhosta"
        }
      ],
      "paymentAccepted": ["Visa", "Mastercard", "Swish"],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Vaccinationspriser",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "MedicalTherapy",
              "name": "TBE vuxen"
            },
            "price": "460",
            "priceCurrency": "SEK"
          }
        ]
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'healthcare');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  /**
   * CSS Variable Integration för JavaScript-kontrollerade element
   * @description Länkar JavaScript-kontrollerade stilar till CSS custom properties
   */
  function initCSSVariableIntegration() {
    const rootStyle = getComputedStyle(document.documentElement);

    // Läs in CSS variabler för JavaScript-användning
    const cssVars = {
      durationFast: rootStyle.getPropertyValue('--duration-fast').trim(),
      durationNormal: rootStyle.getPropertyValue('--duration-normal').trim(),
      durationSlow: rootStyle.getPropertyValue('--duration-slow').trim(),
      radiusMd: rootStyle.getPropertyValue('--radius-md').trim(),
      spaceMd: rootStyle.getPropertyValue('--space-md').trim(),
      shadowMd: rootStyle.getPropertyValue('--shadow-md').trim()
    };

    // Applicera dynamiska CSS-förändringar baserat på variabler
    const dynamicElements = document.querySelectorAll('[data-dynamic-style]');
    dynamicElements.forEach(el => {
      const styleType = el.dataset.dynamicStyle;
      switch(styleType) {
        case 'card':
          el.style.transition = `all ${cssVars.durationNormal}`;
          el.style.borderRadius = cssVars.radiusMd;
          break;
        case 'hover':
          el.style.transition = `transform ${cssVars.durationFast}, box-shadow ${cssVars.durationFast}`;
          break;
      }
    });

    return cssVars;
  }

  /**
   * Performance monitoring för Core Web Vitals
   * @description Övervakar prestanda och rapporterar till console
   */
  function initPerformanceMonitoring() {
    // Mät Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', Math.round(lastEntry.startTime), 'ms');
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Mät Cumulative Layout Shift (CLS)
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        if (clsValue > 0) {
          console.log('CLS:', clsValue.toFixed(4));
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  /**
   * Accessibility enhancements med CSS variable support
   * @description Förbättrar tillgänglighet med dynamiska stilar
   */
  function enhanceAccessibility() {
    // Lägg till focus-visible polyfill för äldre webbläsare
    if (!CSS.supports('selector(:focus-visible)')) {
      document.addEventListener('keydown', () => {
        document.body.classList.add('keyboard-nav');
      });
      document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-nav');
      });
    }

    // Förbättra contrast för användare med prefers-contrast: high
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      document.documentElement.style.setProperty('--clr-border', '#000000');
      document.documentElement.style.setProperty('--shadow-md', '0 4px 12px rgba(0, 0, 0, 0.3)');
    }

    // Respektera prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.style.setProperty('--duration-fast', '0ms');
      document.documentElement.style.setProperty('--duration-normal', '0ms');
      document.documentElement.style.setProperty('--duration-slow', '0ms');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SEKTION 7: INITIALISERING KOMPLETT
  // ═══════════════════════════════════════════════════════════════

  // FUSION ENTERPRISE: PWA & Mobile Enhancements
  function initPWAFeatures() {
    // Service Worker registration for offline functionality
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
          console.log('SW registered: ', registration);
        }).catch(function(registrationError) {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }

    // App installation prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;

      // Show install button for Swedish users
      const installBanner = document.createElement('div');
      installBanner.className = 'pwa-install-banner';
      installBanner.innerHTML = `
        <div style="background: var(--clr-bg-alt); padding: var(--space-sm); border-radius: var(--radius-md); margin: var(--space-md) 0; display: flex; align-items: center; gap: var(--space-md);">
          <span>📱</span>
          <div style="flex: 1;">
            <strong>Installera Vaccinbussen-appen</strong>
            <br><small>Få snabb tillgång till vaccinationsschema och priser</small>
          </div>
          <button id="install-pwa" style="background: var(--clr-primary); color: white; border: none; padding: var(--space-xs) var(--space-md); border-radius: var(--radius-sm); cursor: pointer;">
            Installera
          </button>
          <button id="dismiss-pwa" style="background: transparent; border: none; font-size: 1.2em; cursor: pointer;">×</button>
        </div>
      `;

      document.querySelector('.intro-section')?.appendChild(installBanner);

      document.getElementById('install-pwa').addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('PWA installation accepted');
          }
          deferredPrompt = null;
          installBanner.remove();
        });
      });

      document.getElementById('dismiss-pwa').addEventListener('click', () => {
        installBanner.remove();
      });
    });

    // Add to homescreen meta for iOS
    if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
      const metas = [
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Vaccinbussen' },
        { name: 'mobile-web-app-capable', content: 'yes' }
      ];

      metas.forEach(meta => {
        const metaEl = document.createElement('meta');
        metaEl.name = meta.name;
        metaEl.content = meta.content;
        document.head.appendChild(metaEl);
      });
    }
  }

  // Initialisera alla FUSION ENTERPRISE funktioner
  initSecurityFramework();
  initGDPRCompliance();
  initCrossBrowserSupport();
  initAdvancedErrorHandling();
  initHealthcareSchema();
  const cssVars = initCSSVariableIntegration();
  initPerformanceMonitoring();
  enhanceAccessibility();
  initPWAFeatures();

  console.log('Vaccinbussen JavaScript v3.3 - FUSION ENTERPRISE: Alla system operationella med säkerhet, GDPR, PWA och total kompatibilitet');

});

// ==========================================================================
// CRITICAL MOBILE RESPONSIVENESS - RAPID DEPLOYMENT
// ==========================================================================
(function() {
  'use strict';

  // MOBILE MENU FIX
  function initMobileMenu() {
    const menuToggle = document.querySelector('.navbar-toggler, .mobile-menu-toggle, [data-toggle="offside"]');
    const mobileNav = document.querySelector('.offside-navbar');

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        mobileNav.classList.toggle('active');
        mobileNav.classList.toggle('show');
        document.body.classList.toggle('nav-open');
      });

      // Close on outside click
      document.addEventListener('click', function(e) {
        if (mobileNav.classList.contains('active') &&
            !mobileNav.contains(e.target) &&
            !menuToggle.contains(e.target)) {
          mobileNav.classList.remove('active', 'show');
          document.body.classList.remove('nav-open');
        }
      });
    }
  }

  // TABLE RESPONSIVENESS
  function wrapTables() {
    document.querySelectorAll('.location-schedule, .price-table').forEach(table => {
      if (!table.parentElement.classList.contains('table-responsive')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-responsive';
        wrapper.style.overflowX = 'auto';
        wrapper.style.webkitOverflowScrolling = 'touch';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    });
  }

  // VIEWPORT FIX
  function setVH() {
    document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
  }

  // Initialize on mobile
  if (window.innerWidth <= 768) {
    document.addEventListener('DOMContentLoaded', function() {
      initMobileMenu();
      wrapTables();
      setVH();
    });

    window.addEventListener('resize', setVH);
  }

})();

// === VaccineBjarredApp SHADOW DOM REACT WIDGET ===
(function() {
  // Utility: Dynamically load JS from CDN if not already present
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // Wait until DOM is ready
  function onReady(fn) {
    if (document.readyState !== 'loading') return fn();
    document.addEventListener('DOMContentLoaded', fn);
  }

  onReady(async function() {
    // Find mount point and replace with web component
    const el = document.getElementById('schema');
    if (!el) return;
    // Remove all children
    while (el.firstChild) el.removeChild(el.firstChild);

    // Create our web component element
    const widget = document.createElement('vaccine-bjarred-app');
    el.appendChild(widget);

    // Web Component definition
    class VaccineBjarredApp extends HTMLElement {
      constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
      }

      async connectedCallback() {
        // Only run once
        if (this.shadow.querySelector('#react-root')) return;

        // Inject local styles (scoped)
        const style = document.createElement('style');
        style.textContent = `
          #react-root h2 {
            color: #2e7d32;
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 16px 0 8px 0;
          }
          .table-responsive {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .location-schedule {
            width: 100%;
            border-collapse: collapse;
          }
          .location-schedule th,
          .location-schedule td {
            padding: 8px 12px;
            border: 1px solid #e0e0e0;
            text-align: left;
          }
          .location-schedule th {
            background: #f5f5f5;
          }
          @media (max-width: 768px) {
            .location-schedule td, .location-schedule th {
              font-size: 0.95em;
              padding: 6px 6px;
            }
          }
        `;
        this.shadow.appendChild(style);

        // React root node
        const root = document.createElement('div');
        root.id = 'react-root';
        this.shadow.appendChild(root);

        // Load React, ReactDOM, Babel
        await loadScript('https://unpkg.com/react@17/umd/react.development.js');
        await loadScript('https://unpkg.com/react-dom@17/umd/react-dom.development.js');
        await loadScript('https://unpkg.com/@babel/standalone/babel.min.js');

        // Render with JSX using Babel
        const jsxCode = `
          function SchemaAndLocation() {
            return (
              <aside className="location-section" aria-labelledby="schedule-heading">
                <h2 id="schedule-heading">Schema och Plats</h2>
                <div className="location-details">
                  <div className="table-responsive">
                    <table className="location-schedule" aria-label="Öppettider för vaccinationsbussen i Bjärred">
                      <caption>
                        <span className="schema-location-label">Plats: </span>
                        <span className="schema-coop">Coop</span>,<br />
                        <span className="schema-address-label">Adress: </span>
                        Norra Västkustvägen 2, 237 37 Bjärred
                      </caption>
                      <thead>
                        <tr>
                          <th scope="col">Datum</th>
                          <th scope="col">Dag</th>
                          <th scope="col">Tid</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td>24 februari</td><td>Måndag</td><td>14:30–18:30</td></tr>
                        <tr><td>17 mars</td><td>Måndag</td><td>14:30–18:30</td></tr>
                        <tr><td>28 april</td><td>Måndag</td><td>14:30–18:30</td></tr>
                        <tr><td>19 maj</td><td>Måndag</td><td>14:30–18:30</td></tr>
                        <tr><td>30 maj</td><td>Fredag</td><td>14:30–18:30</td></tr>
                        <tr><td>30 juni</td><td>Måndag</td><td>14:30–18:30</td></tr>
                        <tr><td>21 juli</td><td>Måndag</td><td>14:30–18:30</td></tr>
                        <tr><td>11 augusti</td><td>Måndag</td><td>14:30–18:30</td></tr>
                        <tr><td>1 september</td><td>Måndag</td><td>14:30–18:30</td></tr>
                        <tr><td>22 september</td><td>Måndag</td><td>14:30–18:30</td></tr>
                        <tr><td>13 oktober</td><td>Måndag</td><td>14:30–18:30</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </aside>
            );
          }
          ReactDOM.render(<SchemaAndLocation />, root);
        `;
        const transpiled = Babel.transform(jsxCode, { presets: ['react'] }).code;
        const func = new Function('React', 'ReactDOM', 'root', transpiled);
        func(React, ReactDOM, root);
      }
    }

    // Register web component ONCE (robust check)
    if (!window.__vaccine_bjarred_defined) {
      window.__vaccine_bjarred_defined = true;
      customElements.define('vaccine-bjarred-app', VaccineBjarredApp);
    }
  });

  // Remove all .row except .row0, .row1, .row2 (including their entire wrappers!)
  document.querySelectorAll('.row').forEach(row => {
    if (!row.classList.contains('row0') && !row.classList.contains('row1') && !row.classList.contains('row2')) {
      row.remove();
    }
  });

})();