# Task: Migrate Root CSS Custom Properties to `@property`

**Owner:** GPT-4.1

## Goal
Define high-use custom properties with `@property` to unlock typed values, better dev-tools introspection, and future animation capabilities.

## Steps
1. **Inventory**
   • Extract top-level vars from `:root` in `style.css` & `styletest.css`.
2. **Define**
   • For each color/length, prepend:
   ```css
   @property --clr-primary {
     syntax: '<color>';
     inherits: true;
     initial-value: #5a8fc7;
   }
   ```
3. **Fallback**
   • Provide legacy vars first for Safari 14-.
   • Use `@supports (color: oklch(0 0 0)) { … }` gates.
4. **Build Impact**
   • Ensure PostCSS (if added later) preserves at-rules.
5. **Test**
   • Manual dark-mode toggle still works.

---
*Done When*: No console warnings; variables show typed definitions in Chrome DevTools.