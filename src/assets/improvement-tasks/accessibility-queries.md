# Task: Add `prefers-contrast` & `dynamic-range` Media Queries

**Owner:** GPT-4.1

## Purpose
Enhance accessibility and HDR support by responding to user contrast preferences and display capabilities.

## Action Plan
1. **Contrast Query**
   • Wrap high-contrast overrides:
   ```css
   @media (prefers-contrast: more) {
     :root { --clr-border: #ffffff; }
   }
   ```
2. **HDR Query**
   • Optimize gradients/images for HDR:
   ```css
   @media (dynamic-range: high) {
     .hero-image { filter: contrast(110%); }
   }
   ```
3. **Audit Components**
   • FAQ gradients, price tables, nav backgrounds.
4. **Testing**
   • Use Chrome DevTools rendering modes.
5. **Documentation**
   • Update design-tokens guide.

---
*Completion Metric*: WCAG AA contrast passes in both normal & high-contrast modes.