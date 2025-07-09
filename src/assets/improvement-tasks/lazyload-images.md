# Task: Fix Lazy Loading & Fluid Images in `1.html` & `3.html`

**Owner:** GPT-4.1

## Goal
Refactor `<img>` elements to combine Bootstrap’s `.img-fluid` responsiveness with native `loading="lazy"`, data-src placeholders, and our custom JS lazy-loader.

## Rationale
* Reduces initial payload on mobile connections.
* Maintains responsive behaviour without layout shift.

## Plan
1. **Audit Current Mark-up**
   • Inspect `src/html/1.html` & `src/html/3.html` for `<img>` tags.
2. **Update HTML**
   • Replace `src="…"` with `data-src`.
   • Add `class="img-fluid lazyload"` & `loading="lazy"`.
3. **Enhance JS Loader**
   • Ensure `scripts-atomic.js` registers an `IntersectionObserver` to swap `data-src` → `src` on enter.
4. **Fallback**
   • Provide noscript `<img>` fallback for SEO.
5. **Test**
   • Lighthouse performance score > 90 on mobile.
   • No console errors.

---
*Done When*: Images load on scroll, retain aspect-ratio, and CLS metric remains < 0.1.