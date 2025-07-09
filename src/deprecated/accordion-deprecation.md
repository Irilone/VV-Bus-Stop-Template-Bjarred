# Accordion.js Deprecation Notice

## Status: **DEPRECATED** ⚠️

**Date:** January 9, 2025  
**Reason:** Replaced by unified `faq-toggle.js` solution

## Migration Path

### ❌ **Old (accordion.js):**
```javascript
import { Accordion } from './accordion.js';

const accordion = new Accordion({
  accordionSelector: '.faq-item, details[data-accordion]',
  single: false,
  announceChanges: true
});
```

### ✅ **New (faq-toggle.js):**
```javascript
// Auto-initializes on DOM ready
window.faqToggle = new FAQToggle({
  selector: '.faq-item, details[data-faq], details[data-accordion]',
  singleOpen: false,
  announceChanges: true,
  maintainBackground: true
});
```

## Why Replace?

### **Issues with accordion.js:**
1. **Missing Dependencies**: Imports `EventHandlerContract` and `eventManager` that don't exist
2. **Module Complexity**: ES6 imports not compatible with current architecture
3. **Limited FAQ Support**: No Swedish text optimization or background color fixes
4. **Duplicate Functionality**: 80% overlap with faq-toggle.js

### **Benefits of faq-toggle.js:**
1. **Unified Solution**: Handles both FAQ (Block 6) and Vaccine Info (Block 5)
2. **No Dependencies**: Standalone implementation
3. **Swedish Optimization**: Text shortening and hyphenation
4. **Background Maintenance**: Fixes gradient background issues
5. **Design System Integration**: Uses CSS variables from styletest.css

## Compatibility

### **Selectors Supported:**
- `.faq-item` (FAQ content)
- `details[data-accordion]` (Vaccine info)
- `details[data-faq]` (FAQ content)

### **Content Classes:**
- `.faq-content` (FAQ answers)
- `.vaccine-content` (Vaccine info)
- `.accordion-content` (General accordion)
- `.faq-answer` (FAQ answers)
- `.details-content` (General details)

### **Events Maintained:**
- `vaccine:faq:ready` (new)
- `vaccine:accordion:ready` (backward compatibility)
- `vaccine:faq:toggled` (enhanced)
- `vaccine:accordion:toggled` (backward compatibility)

## Migration Steps

1. **Remove accordion.js** from your project
2. **Update imports** to use faq-toggle.js
3. **Update scripts-atomic.js** to only include faqToggle
4. **Test FAQ and Vaccine Info** blocks for functionality
5. **Verify CSS styling** works with both content types

## File Status

- **accordion.js**: ❌ Remove (deprecated)
- **faq-toggle.js**: ✅ Use (active)
- **faq-optimized.css**: ✅ Use (supports both)

## Notes

- The unified solution is backward compatible with existing selectors
- Swedish text optimization only applies to `.faq-item` elements
- Background color maintenance works for both FAQ and vaccine info
- All accessibility features are preserved and enhanced

**Action Required:** Remove accordion.js and update references to use faq-toggle.js