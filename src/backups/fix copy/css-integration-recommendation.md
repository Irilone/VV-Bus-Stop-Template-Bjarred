# CSS Integration Recommendation for FAQ Optimization

## Recommended Approach: ADD `faq-optimized.css` WITHOUT removing existing FAQ styles

### Why this approach is better:

1. **Higher Specificity**: The `faq-optimized.css` uses more specific selectors like `#vaccine-bjarred-app .faq-item` which will override the existing styles in `styletest.css`

2. **Safer Rollback**: If issues arise, you can simply remove the new CSS file without breaking existing functionality

3. **Cleaner Code**: The optimized CSS is focused and clean, while the existing CSS has many legacy patterns and !important declarations

4. **Better Maintenance**: Separate files make it easier to track what's optimized vs legacy

### Integration Steps:

1. **Load Order**: Include `faq-optimized.css` AFTER `styletest.css` in your HTML
2. **File Structure**: Keep both files separate for now
3. **Testing**: Test thoroughly with the new styles
4. **Future Cleanup**: Once confirmed working, gradually remove conflicting styles from `styletest.css`

### Example HTML Integration:
```html
<link rel="stylesheet" href="styletest.css">
<link rel="stylesheet" href="faq-optimized.css">
<script src="faq-toggle.js"></script>
```

### Key Benefits of faq-optimized.css:

- ✅ **1-2 Row Display**: Uses `line-clamp` and `max-height` to ensure FAQ questions don't exceed 2 rows
- ✅ **Advanced Hyphenation**: Swedish-specific hyphenation with `hyphens: auto` and soft hyphens
- ✅ **Word Breaking**: Modern `word-break: break-word` and `overflow-wrap: break-word`
- ✅ **Responsive Typography**: Proper clamp() usage for all screen sizes
- ✅ **Maintained Gradient**: Fixes the background color issue
- ✅ **Performance**: CSS containment and optimized animations
- ✅ **Accessibility**: High contrast and reduced motion support

### Conflicts Handled:

The optimized CSS will override these problematic styles from `styletest.css`:
- Complex grid layouts causing duplicate titles
- Background color issues when FAQ is opened
- Inconsistent typography scaling
- Missing hyphenation support

### Testing Checklist:

- [ ] FAQ questions display in 1-2 rows maximum
- [ ] Gradient background maintained when opening/closing
- [ ] No duplicate titles
- [ ] Smooth animations and hover effects
- [ ] Proper keyboard navigation
- [ ] Responsive behavior on mobile devices
- [ ] Swedish hyphenation works correctly

## Conclusion

**Add `faq-optimized.css` as an additional stylesheet** rather than removing existing FAQ styles. This provides the safest path forward with immediate benefits and easier maintenance.