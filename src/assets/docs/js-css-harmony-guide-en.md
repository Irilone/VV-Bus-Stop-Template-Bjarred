# Harmonizing JavaScript and CSS Styling

This guide explains how to manipulate styling while keeping JavaScript and CSS working together without conflicts. It focuses on best practices for structuring code, using classes and variables, and ensuring maintainability.

## 1. Keep Responsibilities Separate

- **CSS** should handle visual styling such as layout, typography and colors.
- **JavaScript** should handle behavior such as user interaction, data manipulation and dynamic content.
- Avoid mixing inline style manipulations with complex logic. Instead, toggle classes or CSS custom properties from JavaScript.

## 2. Use Consistent Naming Conventions

- Follow a naming convention like BEM (Block__Element--Modifier) for classes.
- Match JavaScript module names with the components they manipulate.
- Use data attributes (e.g., `data-js="accordion"`) to connect JavaScript behaviors without polluting CSS class names.

## 3. Create a Central Style Theme

- Define CSS variables for common values like colors, spacing and fonts in a root or theme file.
- Update variables through JavaScript to apply global changes (e.g., dark mode) instead of altering individual styles.

```css
:root {
  --primary-color: #0069aa;
  --gap-large: 2rem;
}
```

```javascript
function toggleDarkMode() {
  document.documentElement.style.setProperty('--primary-color', '#ffffff');
}
```

## 4. Manage State with Classes

- Add or remove classes to trigger CSS transitions and animations.
- Keep a set of utility classes (e.g., `.is-active`, `.is-hidden`) for common states.
- Avoid setting style properties directly from JavaScript unless necessary.

```javascript
button.addEventListener('click', () => {
  panel.classList.toggle('is-active');
});
```

## 5. Avoid Style Conflicts

- Use scoped selectors or component-specific wrappers to keep styles from leaking.
- When dynamically injecting HTML, ensure that classes match existing CSS rules.
- Document dependencies between JavaScript modules and CSS files in comments or documentation.

## 6. Optimize for Performance

- Batch DOM reads and writes to prevent layout thrashing.
- Use `requestAnimationFrame` for high-frequency updates like animations.
- Minify and bundle CSS and JavaScript for production to reduce load times.

## 7. Testing and Debugging

- Use browser devtools to inspect applied classes and styles.
- Unit test JavaScript modules to verify that they apply the correct classes.
- Manually test that style changes respond as expected in different browsers.

## 8. Repo Specific Examples

### Tuning the FAQ accordion

The FAQ section uses `faq-toggle.js` from `src/bjarred-code/scripts/atomic-components/js-modules/components`. Styles live in `style.css` under `#vaccine-bjarred-app .faq-item`.
Adjust the gradient or primary color with the CSS variables defined at the top of `style.css`:

```css
#vaccine-bjarred-app {
  --grad-price-table: linear-gradient(145deg, #ffb347 0%, #ffcc33 60%, #ffdd55 100%);
}
```

JavaScript lets you control the accordion programmatically:

```javascript
// Open the first FAQ item
window.faqToggle.open('faq-0');

// React to toggles
document.addEventListener('vaccine:faq:toggled', (e) => {
  console.log('FAQ toggled', e.detail);
});
```

### Styling the responsive tables

Tables are handled by `responsive-table.js` together with `vb-tables.css` and `table-responsive.css`.
Colors come from variables like `--grad-price-table` and `--grad-location-table`.

```css
#vaccine-bjarred-app {
  --grad-location-table: linear-gradient(to left, #ffe1a8 40%, #ffedd5 100%);
}
```

To customize behavior you can create the component with options:

```javascript
window.tableComponent = new ResponsiveTable('.price-table', {
  showScrollIndicators: false,
  scrollSensitivity: 75
});
```

These examples show how CSS variables and component APIs keep styling and behavior in sync.

## Conclusion

Maintaining harmony between JavaScript and CSS requires a clear separation of concerns, consistent conventions, and careful state management. By following these practices, you can build dynamic interfaces that remain easy to maintain and extend.
