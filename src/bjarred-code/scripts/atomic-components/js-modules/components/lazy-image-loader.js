/**
 * Vaccincenter Varvet - Enhanced Lazy Image Loader
 * Combines native loading="lazy" with Intersection Observer fallback
 * Optimized for EpiServer CMS and mobile health bus imagery
 */

class VaccincenterLazyImageLoader {
  constructor(options = {}) {
    this.config = {
      // CSS selectors
      imageSelector: 'img[data-src]',
      lazyClass: 'lazy',
      loadingClass: 'lazy-loading',
      loadedClass: 'lazy-loaded',
      errorClass: 'lazy-error',

      // Intersection Observer settings
      rootMargin: '50px 0px',
      threshold: 0.01,

      // Performance settings
      enableNativeLazyLoading: true,
      fallbackForOlderBrowsers: true,

      // Placeholder settings
      useBlurredPlaceholder: true,
      placeholderColor: '#f0f0f0',

      // Animation settings
      fadeInDuration: 300,

      // Debug mode
      debug: false,

      ...options
    };

    this.observer = null;
    this.images = [];
    this.isNativeLazyLoadingSupported = 'loading' in HTMLImageElement.prototype;

    this.init();
  }

  /**
   * Initialize the lazy loader
   */
  init() {
    this.log('🖼️ Initializing Vaccincenter Lazy Image Loader');
    this.log(`Native lazy loading supported: ${this.isNativeLazyLoadingSupported}`);

    // Find all images that need lazy loading
    this.findImages();

    // Set up loading strategy based on browser support
    if (this.isNativeLazyLoadingSupported && this.config.enableNativeLazyLoading) {
      this.setupNativeLazyLoading();
    }

    // Always set up Intersection Observer for additional features
    if (this.config.fallbackForOlderBrowsers || !this.isNativeLazyLoadingSupported) {
      this.setupIntersectionObserver();
    }

    // Apply initial styles
    this.applyInitialStyles();

    this.log(`Found ${this.images.length} images for lazy loading`);
  }

  /**
   * Find all images that should be lazy loaded
   */
  findImages() {
    // Find images with data-src attribute
    const dataSrcImages = Array.from(document.querySelectorAll(this.config.imageSelector));

    // Find images with lazy class
    const lazyClassImages = Array.from(document.querySelectorAll(`img.${this.config.lazyClass}`));

    // Combine and deduplicate
    const allImages = [...new Set([...dataSrcImages, ...lazyClassImages])];

    this.images = allImages.filter(img => {
      // Skip if already processed
      if (img.dataset.lazyProcessed) return false;

      // Mark as processed
      img.dataset.lazyProcessed = 'true';

      return true;
    });
  }

  /**
   * Setup native lazy loading for supported browsers
   */
  setupNativeLazyLoading() {
    this.images.forEach(img => {
      // Add native loading attribute if not present
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }

      // If data-src is present, set up the src swap
      if (img.dataset.src && !img.src) {
        img.src = img.dataset.src;
      }

      // Add loading class
      img.classList.add(this.config.loadingClass);

      // Listen for load event
      img.addEventListener('load', () => this.onImageLoad(img));
      img.addEventListener('error', () => this.onImageError(img));
    });
  }

  /**
   * Setup Intersection Observer for fallback and enhanced features
   */
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      this.log('⚠️ IntersectionObserver not supported, loading all images immediately');
      this.loadAllImages();
      return;
    }

    const options = {
      root: null,
      rootMargin: this.config.rootMargin,
      threshold: this.config.threshold
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, options);

    // Observe all images
    this.images.forEach(img => {
      // Only observe if not using native lazy loading or if it needs fallback
      if (!this.isNativeLazyLoadingSupported || img.dataset.forceObserver) {
        this.observer.observe(img);
      }
    });
  }

  /**
   * Load a specific image
   */
  loadImage(img) {
    if (img.dataset.loaded) return;

    img.classList.add(this.config.loadingClass);

    // Create a new image to preload
    const imageLoader = new Image();

    imageLoader.onload = () => {
      // Swap the source
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }

      this.onImageLoad(img);
    };

    imageLoader.onerror = () => {
      this.onImageError(img);
    };

    // Start loading
    const srcToLoad = img.dataset.src || img.src;
    if (srcToLoad) {
      imageLoader.src = srcToLoad;
    }
  }

  /**
   * Handle successful image load
   */
  onImageLoad(img) {
    img.dataset.loaded = 'true';
    img.classList.remove(this.config.loadingClass);
    img.classList.add(this.config.loadedClass);

    // Apply fade-in animation
    if (this.config.fadeInDuration > 0) {
      img.style.transition = `opacity ${this.config.fadeInDuration}ms ease-in-out`;
      img.style.opacity = '1';
    }

    // Dispatch custom event
    const event = new CustomEvent('vaccincenter:imageLoaded', {
      detail: { image: img, src: img.src }
    });
    document.dispatchEvent(event);

    this.log(`✅ Image loaded: ${img.src || img.dataset.src}`);
  }

  /**
   * Handle image load error
   */
  onImageError(img) {
    img.classList.remove(this.config.loadingClass);
    img.classList.add(this.config.errorClass);

    // Set fallback image if available
    if (img.dataset.fallback) {
      img.src = img.dataset.fallback;
    }

    // Dispatch error event
    const event = new CustomEvent('vaccincenter:imageError', {
      detail: { image: img, src: img.src || img.dataset.src }
    });
    document.dispatchEvent(event);

    this.log(`❌ Image failed to load: ${img.src || img.dataset.src}`);
  }

  /**
   * Apply initial styles for better UX
   */
  applyInitialStyles() {
    // Create CSS for lazy loading states
    const style = document.createElement('style');
    style.textContent = `
      .${this.config.lazyClass} {
        transition: opacity ${this.config.fadeInDuration}ms ease-in-out;
      }

      .${this.config.loadingClass} {
        opacity: 0.6;
        background-color: ${this.config.placeholderColor};
        background-image: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        background-size: 200px 100%;
        background-repeat: no-repeat;
        animation: vaccincenter-loading-shimmer 1.5s infinite;
      }

      .${this.config.loadedClass} {
        opacity: 1;
      }

      .${this.config.errorClass} {
        opacity: 0.5;
        filter: grayscale(1);
      }

      @keyframes vaccincenter-loading-shimmer {
        0% { background-position: -200px 0; }
        100% { background-position: calc(200px + 100%) 0; }
      }

      /* Vaccincenter specific styles */
      .bus-img.${this.config.loadingClass} {
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      }

      .img-blue-glow.${this.config.loadedClass} {
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Load all images immediately (fallback)
   */
  loadAllImages() {
    this.images.forEach(img => this.loadImage(img));
  }

  /**
   * Add new images dynamically
   */
  addImages(newImages) {
    const imagesToAdd = Array.isArray(newImages) ? newImages : [newImages];

    imagesToAdd.forEach(img => {
      if (img.dataset.lazyProcessed) return;

      this.images.push(img);
      img.dataset.lazyProcessed = 'true';

      if (this.observer) {
        this.observer.observe(img);
      } else {
        this.loadImage(img);
      }
    });
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.images = [];
  }

  /**
   * Debug logging
   */
  log(message) {
    if (this.config.debug) {
      console.log(`[VaccincenterLazyLoader] ${message}`);
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.VaccincenterLazyLoader = new VaccincenterLazyImageLoader({
      debug: false
    });
  });
} else {
  window.VaccincenterLazyLoader = new VaccincenterLazyImageLoader({
    debug: false
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VaccincenterLazyImageLoader;
}

// Add to window for global access
window.VaccincenterLazyImageLoader = VaccincenterLazyImageLoader;