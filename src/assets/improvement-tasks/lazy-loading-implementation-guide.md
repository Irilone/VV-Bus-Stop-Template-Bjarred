# Lazy Loading Implementation Guide - Vaccincenter Varvet

## 🎯 **RECOMMENDED: Use This HTML Structure**

```html
<!-- ✅ BEST: Modern approach with fallback -->
<img class="bus-img img-blue-glow img-fluid lazy"
     src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3C/svg%3E"
     data-src="https://www.ptj.se/49f8f5/globalassets/vaccincenter-varvet/images/bus-malmo.jpg"
     data-fallback="https://www.ptj.se/49f8f5/globalassets/vaccincenter-varvet/images/placeholder-bus.jpg"
     loading="lazy"
     alt="Vaccincenter mobile health bus in Malmö">
```

## 📋 **HTML Patterns for Different Use Cases**

### 🚐 **Bus Images**
```html
<img class="bus-img img-blue-glow img-fluid lazy"
     src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='100%25' height='100%25' fill='%231e3a8a'/%3E%3C/svg%3E"
     data-src="/images/vaccincenter-bus.jpg"
     loading="lazy"
     alt="Vaccincenter mobile health bus">
```

### 🏥 **Clinic Images**
```html
<img class="clinic-img img-fluid lazy"
     src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3C/svg%3E"
     data-src="/images/clinic-malmoe.jpg"
     loading="lazy"
     alt="Vaccincenter clinic in Malmö">
```

### 👥 **Staff/Team Images**
```html
<img class="staff-img rounded-circle lazy"
     src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23e5e7eb'/%3E%3C/svg%3E"
     data-src="/images/staff/dr-andersson.jpg"
     loading="lazy"
     alt="Dr. Andersson - Vaccincenter specialist">
```

## ⚙️ **How It Works**

### 1. **Native Browser Support (96%+ browsers)**
- Uses `loading="lazy"` attribute
- No JavaScript required for basic functionality
- Automatic viewport detection

### 2. **Enhanced Features via JavaScript**
- Smooth fade-in animations
- Loading shimmer effects
- Error handling with fallbacks
- Custom events for tracking

### 3. **Progressive Enhancement**
- Works without JavaScript
- Enhanced experience with JavaScript
- Automatic fallback for old browsers

## 🎨 **Visual States**

### **Loading State**
- Placeholder with shimmer animation
- Blue gradient for bus images
- Smooth opacity transition

### **Loaded State**
- Full opacity reveal
- Blue glow effect for `.img-blue-glow`
- Custom event dispatched

### **Error State**
- Fallback image if available
- Grayscale filter
- Error event dispatched

## 🔧 **Configuration Options**

You can customize the lazy loader:

```javascript
// Custom configuration
window.VaccincenterLazyLoader = new VaccincenterLazyImageLoader({
  // Timing
  fadeInDuration: 500,          // Longer fade-in
  rootMargin: '100px 0px',      // Load images 100px before viewport

  // Styling
  placeholderColor: '#1e3a8a',  // Vaccincenter blue

  // Debug
  debug: true                   // Enable console logging
});
```

## 📱 **EpiServer Integration**

The lazy loader is automatically included in your EpiServer setup via the comprehensive loader:

```javascript
// Automatically loaded:
https://www.ptj.se/49f936/globalassets/vaccincenter-varvet/scripts/atomic-components/js-modules/components/lazy-image-loader.js
```

## 🚨 **Migration from Existing Images**

### **From Simple Images**
```html
<!-- OLD -->
<img class="bus-img img-blue-glow img-fluid" src="bus.jpg" alt="Bus">

<!-- NEW -->
<img class="bus-img img-blue-glow img-fluid lazy"
     src="data:image/svg+xml,..."
     data-src="bus.jpg"
     loading="lazy"
     alt="Bus">
```

### **From Bootstrap Images**
```html
<!-- OLD -->
<img class="img-fluid" src="clinic.jpg">

<!-- NEW -->
<img class="img-fluid lazy"
     src="data:image/svg+xml,..."
     data-src="clinic.jpg"
     loading="lazy">
```

## 📊 **Performance Benefits**

- **Faster initial page load** - Images load only when needed
- **Reduced bandwidth** - Saves mobile data for users
- **Better user experience** - Smooth loading animations
- **SEO friendly** - Native lazy loading is search engine optimized

## 🎯 **Best Practices**

1. **Always include `alt` attributes** for accessibility
2. **Use appropriate placeholder dimensions** to prevent layout shift
3. **Include `data-fallback`** for critical images
4. **Test on slow connections** to verify loading behavior
5. **Use semantic CSS classes** like `bus-img`, `clinic-img`

## 🔍 **Debugging**

Enable debug mode to see loading progress:

```javascript
// In browser console
window.VaccincenterLazyLoader.config.debug = true;
```

Watch for custom events:

```javascript
document.addEventListener('vaccincenter:imageLoaded', (e) => {
  console.log('Image loaded:', e.detail.image);
});

document.addEventListener('vaccincenter:imageError', (e) => {
  console.log('Image failed:', e.detail.image);
});
```

## ✅ **Your Answer: Use This Format**

For your specific case, use:

```html
<img class="bus-img img-blue-glow img-fluid lazy"
     src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='100%25' height='100%25' fill='%231e3a8a'/%3E%3C/svg%3E"
     data-src="actual-image.jpg"
     loading="lazy"
     alt="Description">
```

This combines:
- ✅ **Native `loading="lazy"`** for modern browsers
- ✅ **Class `lazy`** for enhanced JavaScript features
- ✅ **Data-src pattern** for controlled loading
- ✅ **Inline SVG placeholder** to prevent layout shift