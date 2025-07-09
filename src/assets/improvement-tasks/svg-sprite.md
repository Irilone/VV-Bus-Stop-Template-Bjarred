# Task: Build SVG Sprite Sheet & Replace Inline Icons

**Owner:** GPT-4.1

## Goal
Centralise icons into a single `sprite.svg` to cut HTML bloat and enable easy theming with `currentColor`.

## Steps
1. **Collect Icons**
   • `grep -R "<svg" src/html | extract` unique icons.
2. **Optimise**
   • Run through `svgo --config .svgo.yml`.
3. **Generate Sprite**
   • Use `svgstore` npm package → `dist/assets/sprite.svg`.
4. **Replace Mark-up**
   • Inline icon →
   ```html
   <svg class="icon icon-chevron"><use href="/assets/sprite.svg#chevron"></use></svg>
   ```
5. **Fallback**
   • Provide PNG sprite for IE11 (if still required).

---
*Done When*: Lighthouse HTML size drops, no broken icons.