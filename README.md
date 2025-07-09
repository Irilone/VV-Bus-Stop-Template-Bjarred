# VV

A modern web application for VV, providing comprehensive vaccination and health services across Sweden.

## About VV

VV is a leading healthcare provider specializing in vaccination services and preventive healthcare. We operate through multiple service channels to ensure accessible healthcare for everyone:

- **🏥 Malmö Clinic** - Our primary vaccination center in Malmö
- **🏥 Lund Clinic** - Full-service vaccination facility in Lund
- **🚐 Mobile Health Bus** - Traveling throughout Sweden to bring healthcare directly to communities

## Project Overview

This repository contains the complete web application for VV, featuring a modern, accessible, and responsive design built with vanilla JavaScript and CSS. The application provides essential functionality for patients to access vaccination information, schedules, pricing, and location details.

## Key Features

### 🎯 Core Functionality
- **Interactive FAQ System** - Comprehensive vaccine information with accessible accordion components
- **Dynamic Price Tables** - Toggle between different vaccination packages and pricing tiers
- **Location Schedules** - Real-time clinic hours and availability
- **Responsive Image Gallery** - Showcasing our facilities and mobile health bus
- **GDPR Compliant** - Full privacy compliance with cookie management

### ♿ Accessibility & UX
- **WCAG 2.1 AA Compliant** - Full accessibility support
- **Keyboard Navigation** - Complete keyboard accessibility
- **Screen Reader Support** - ARIA labels and semantic HTML
- **Responsive Design** - Mobile-first approach with breakpoint optimization
- **Dark Mode Support** - Automatic theme detection and manual toggle

### 🚀 Performance & Technology
- **Modern JavaScript** - ES6+ modules with fallback support
- **CSS Custom Properties** - Design system with consistent theming
- **Progressive Web App** - Installable with offline capabilities
- **Optimized Images** - WebP format with lazy loading
- **Smooth Animations** - CSS-based animations with reduced motion support

## Project Structure

```
src/
├── assets/                    # Static assets and configuration
│   ├── docs/                 # Project documentation
│   ├── images/               # Optimized images and SVG assets
│   ├── improvement-tasks/    # Development roadmap and tasks
│   ├── lint-config/         # Code quality configuration
│   ├── tests/               # Test files and test data
│   └── tools/               # Development and build tools
├── backups/                  # Version backups and migration files
├── bjarred-code/            # Main application code
│   ├── html/                # HTML templates and pages
│   ├── scripts/             # JavaScript modules and components
│   │   ├── atomic-components/   # Modular component system
│   │   │   ├── design-tokens/   # Design system configuration
│   │   │   ├── interfaces/      # Component contracts and types
│   │   │   ├── js-modules/      # Core JavaScript modules
│   │   │   │   ├── components/  # UI components
│   │   │   │   ├── core/        # Core functionality
│   │   │   │   └── utilities/   # Helper functions
│   │   └── date-formatter.js    # Swedish date localization
│   └── styles/              # CSS stylesheets
│       ├── style.css            # Main stylesheet
│       ├── table-responsive.css # Table responsiveness
│       ├── vb-header.css        # Header components
│       └── vb-tables.css        # Table styling
└── deprecated/              # Legacy code and migration notes
```

## Getting Started

### Prerequisites

- Node.js 16+ (for development tools)
- Modern web browser (Chrome 88+, Firefox 85+, Safari 14+)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd template-bus-stop-bjarred/src
   ```

2. **Install development dependencies**
   ```bash
   npm install
   ```

3. **Set up linting tools**
   ```bash
   chmod +x assets/tools/setup_linters.sh
   ./assets/tools/setup_linters.sh
   ```

### Development Workflow

1. **Start development server**
   ```bash
   # Using any static file server
   npx live-server bjarred-code/html/
   ```

2. **Run linting and formatting**
   ```bash
   ./assets/tools/setup-and-lint.sh
   ```

3. **Test responsive design**
   - Open browser developer tools
   - Test across mobile, tablet, and desktop viewports
   - Verify accessibility with screen readers

## Core Components

### JavaScript Modules

- **EventManager** - Centralized event handling system
- **FAQToggle** - Interactive FAQ accordion component
- **PriceToggle** - Dynamic pricing table switcher
- **ResponsiveTable** - Mobile-optimized table handling
- **Lightbox** - Image gallery with keyboard navigation
- **GdprManager** - Cookie consent and privacy management
- **SmoothScroll** - Accessibility-aware smooth scrolling
- **PwaInstall** - Progressive web app installation prompts

### CSS Architecture

- **Design Tokens** - Consistent spacing, colors, and typography
- **Component Styles** - Modular, reusable component styling
- **Responsive Utilities** - Mobile-first responsive helpers
- **Accessibility Styles** - High contrast and reduced motion support

## Browser Support

- **Chrome** 88+
- **Firefox** 85+
- **Safari** 14+
- **Edge** 88+
- **Mobile Safari** iOS 14+
- **Chrome Mobile** 88+

## Performance

- **Lighthouse Score** 95+ across all metrics
- **Core Web Vitals** Optimized for Google's performance standards
- **Bundle Size** < 50KB gzipped JavaScript
- **Image Optimization** WebP with JPEG fallbacks

## Accessibility

This application meets WCAG 2.1 AA standards and includes:

- Semantic HTML structure
- ARIA labels and landmarks
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Reduced motion preferences
- Focus management
- Color contrast compliance

## Contributing

### Code Standards

- **JavaScript** - ES6+ modules with JSDoc documentation
- **CSS** - BEM methodology with CSS custom properties
- **HTML** - Semantic, accessible markup
- **Linting** - ESLint, Stylelint, HTMLHint, and Prettier

### Development Guidelines

1. Follow the existing component architecture
2. Maintain accessibility standards
3. Write comprehensive tests
4. Update documentation for new features
5. Ensure mobile-first responsive design

### Pull Request Process

1. Create feature branch from `main`
2. Run linting tools before committing
3. Test across supported browsers
4. Validate accessibility with screen readers
5. Submit PR with detailed description

## Testing

Run the test suite with:
```bash
# Manual testing with provided test files
open assets/tests/faq-test.html
open assets/tests/date-formatter-test.html
```

## Deployment

The application is designed for static hosting and can be deployed to:

- **Static Hosting** - Netlify, Vercel, GitHub Pages
- **CDN** - CloudFront, Cloudflare
- **Traditional Hosting** - Any web server with HTML/CSS/JS support

## License

This project is proprietary software for VV. All rights reserved.

## Contact

**VV**
- 📧 Email: [Contact information]
- 🌐 Website: [Website URL]
- 📍 Malmö Clinic: [Address]
- 📍 Lund Clinic: [Address]

## Support

For technical support or questions about this codebase, please contact the development team or create an issue in the project repository.

---

*Making healthcare accessible to everyone across Sweden* 🇸🇪
