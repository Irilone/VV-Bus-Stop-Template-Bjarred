# CSS Analysis Report: style.css

## Overview
This report analyzes the current state of `style.css` after extracting media queries to `media-exp.css`. With Shadow DOM encapsulation now in place, many `!important` declarations can be safely removed.

## Current Statistics
- **Total !important declarations**: 936
- **File size**: Reduced after media query extraction
- **Shadow DOM**: All blocks are now encapsulated

## !important Declarations Analysis

### Safe to Remove (High Priority)

These !important declarations can be removed immediately without affecting styling due to Shadow DOM encapsulation:

#### 1. **Basic Typography Properties** (~200 removals)
```css
/* Remove !important from these as Shadow DOM prevents external cascade */
font-family: var(--ff-primary) !important; → font-family: var(--ff-primary);
font-size: var(--fs-body) !important; → font-size: var(--fs-body);
font-weight: var(--fw-normal) !important; → font-weight: var(--fw-normal);
line-height: var(--lh-body) !important; → line-height: var(--lh-body);
color: var(--clr-body) !important; → color: var(--clr-body);
```

#### 2. **Spacing Properties on Custom Classes** (~150 removals)
```css
/* Custom classes within #vaccine-bjarred-app don't need !important */
.price-box { margin: 0 !important; } → .price-box { margin: 0; }
.faq-item { padding: var(--PXR-4) !important; } → .faq-item { padding: var(--PXR-4); }
.vaccine-heading { margin: var(--space-sm) 0 !important; } → .vaccine-heading { margin: var(--space-sm) 0; }
```

#### 3. **Display Properties on Unique Elements** (~100 removals)
```css
/* Unique selectors don't need forcing */
.bus-gallery-row { display: flex !important; } → .bus-gallery-row { display: flex; }
.faq-section { display: flex !important; } → .faq-section { display: flex; }
```

### Keep for Now (Medium Priority)

These !important declarations should be kept temporarily:

#### 1. **CMS Override Styles** (~200 keep)
```css
/* Keep these to override Episerver defaults */
html body h2 { width: clamp(...) !important; } /* Overrides CMS */
.section.row { display: none !important; } /* Hides CMS elements */
```

#### 2. **State-based Styles** (~100 keep)
```css
/* Keep for state management */
.faq-item[open] { border-color: var(--clr-accent) !important; }
body:has(#v-pen:checked) .price-table td:nth-child(3) { display: table-cell !important; }
```

#### 3. **Critical Layout Fixes** (~50 keep)
```css
/* Keep for layout stability */
body { overflow-x: hidden !important; }
html { scroll-behavior: smooth !important; }
```

## Additional Improvements

### 1. **CSS Variable Consolidation**
- Merge duplicate variable definitions
- Create semantic aliases (e.g., `--spacing-section: var(--space-lg)`)
- Remove unused CSS variables

### 2. **Selector Optimization**
```css
/* Before */
html body .price-table.price-table thead th { ... }

/* After (with Shadow DOM) */
.price-table thead th { ... }
```

### 3. **Property Grouping**
Group related properties together:
```css
/* Layout properties */
.element {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  /* Spacing */
  margin: var(--space-md);
  padding: var(--space-sm);
  
  /* Visual */
  background: var(--clr-bg);
  border-radius: var(--radius-md);
}
```

### 4. **Remove Vendor Prefixes**
With modern browser support, remove unnecessary prefixes:
```css
/* Remove these */
-webkit-font-smoothing: antialiased !important;
-moz-osx-font-smoothing: grayscale !important;
-webkit-text-rendering: optimizeLegibility !important;
-moz-text-rendering: optimizeLegibility !important;

/* Keep only */
font-smoothing: antialiased;
text-rendering: optimizeLegibility;
```

### 5. **Consolidate Duplicate Rules**
Many rules are repeated with slight variations. Consolidate:
```css
/* Multiple similar rules */
.price-table th { padding: var(--CLAMP-8) !important; }
.price-table td { padding: var(--CLAMP-8) !important; }

/* Consolidated */
.price-table th,
.price-table td { padding: var(--CLAMP-8); }
```

## Implementation Strategy

### Phase 1: Quick Wins (1-2 hours)
1. Remove !important from all custom class typography
2. Remove !important from spacing on unique selectors
3. Remove vendor prefixes
4. Test each section independently

### Phase 2: Selector Simplification (2-3 hours)
1. Simplify overly specific selectors
2. Remove `html body` prefixes where not needed
3. Consolidate duplicate rules
4. Test CMS integration

### Phase 3: Deep Optimization (3-4 hours)
1. Reorganize file structure by component
2. Create CSS variable system documentation
3. Add comments for remaining !important uses
4. Performance testing

## Expected Results

After implementing these changes:
- **File size reduction**: ~30-40%
- **Specificity reduction**: From ~936 !important to ~350
- **Maintainability**: Significantly improved
- **Performance**: Faster parsing and rendering
- **Developer experience**: Cleaner, more logical code

## Testing Checklist

- [ ] All visual styles remain intact
- [ ] Episerver CMS integration works
- [ ] Mobile responsiveness maintained
- [ ] No style conflicts with CMS
- [ ] Print styles function correctly
- [ ] Dark mode still works
- [ ] Accessibility features preserved

## Notes

1. **Shadow DOM Benefits**: With Shadow DOM encapsulation, the cascade is isolated, making most !important declarations unnecessary.

2. **CMS Considerations**: Some !important declarations interfacing with Episerver should be kept and documented.

3. **Progressive Enhancement**: Remove !important incrementally, testing after each batch.

4. **Documentation**: Add comments explaining why any remaining !important declarations are necessary.