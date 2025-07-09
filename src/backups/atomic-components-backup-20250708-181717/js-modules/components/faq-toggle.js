/**
 * FAQ Toggle Component
 * Similar to price-toggle.js but for FAQ/Details elements
 * Handles accordion behavior, background colors, and accessibility
 */

class FAQToggle {
    constructor(options = {}) {
        this.options = {
            selector: '.faq-item, details[data-faq], details[data-accordion]',
            summarySelector: '.vaccine-summary, summary, .faq-question',
            contentSelector: '.faq-content, .vaccine-content, .accordion-content, .faq-answer, .details-content',
            activeClass: 'active',
            singleOpen: false, // Allow multiple FAQs open at once
            maintainBackground: true,
            announceChanges: true,
            ...options
        };
        
        this.faqs = new Map();
        this.currentlyOpen = new Set();
        
        this.init();
    }

    /**
     * Initialize the FAQ toggle component
     */
    init() {
        this.setupFAQs();
        this.bindEvents();
        this.fixDuplicateTitles();
        this.emit('vaccine:faq:ready');
        this.emit('vaccine:accordion:ready'); // Backward compatibility
    }

    /**
     * Setup all FAQ elements
     */
    setupFAQs() {
        const faqElements = document.querySelectorAll(this.options.selector);
        
        faqElements.forEach((element, index) => {
            // Fix class name inconsistency
            if (element.classList.contains('faq-item-')) {
                element.classList.remove('faq-item-');
                element.classList.add('faq-item');
            }
            
            const faqId = element.id || `faq-${index}`;
            const summary = element.querySelector(this.options.summarySelector);
            const content = element.querySelector(this.options.contentSelector);
            
            if (!summary || !content) {
                console.warn('FAQ element missing summary or content:', element);
                return;
            }
            
            // Setup accessibility
            this.setupAccessibility(element, summary, content, faqId);
            
            // Fix background color styling
            this.fixBackgroundStyling(element);
            
            // Store FAQ data
            this.faqs.set(faqId, {
                element,
                summary,
                content,
                isOpen: element.hasAttribute('open'),
                originalQuestion: summary.textContent.trim()
            });
            
            // Track initially open FAQs
            if (element.hasAttribute('open')) {
                this.currentlyOpen.add(faqId);
            }
        });
    }

    /**
     * Setup accessibility attributes
     */
    setupAccessibility(element, summary, content, faqId) {
        // Ensure proper ARIA attributes
        summary.setAttribute('aria-expanded', element.hasAttribute('open'));
        summary.setAttribute('aria-controls', `${faqId}-content`);
        summary.setAttribute('id', `${faqId}-header`);
        
        content.setAttribute('id', `${faqId}-content`);
        content.setAttribute('aria-labelledby', `${faqId}-header`);
        content.setAttribute('role', 'region');
        
        // Ensure proper tabindex
        if (!summary.hasAttribute('tabindex')) {
            summary.setAttribute('tabindex', '0');
        }
    }

    /**
     * Fix background color styling issues
     */
    fixBackgroundStyling(element) {
        if (!this.options.maintainBackground) return;
        
        // Ensure consistent gradient background
        const originalStyle = element.style.background;
        const gradientBg = 'linear-gradient(145deg, #5a8fc7 0%, #4a7bb0 60%, #406ba0 100%)';
        
        // Apply consistent background
        element.style.background = gradientBg;
        
        // Store original for potential restoration
        element.setAttribute('data-original-bg', originalStyle);
        
        // Ensure background persists when opened
        element.addEventListener('toggle', () => {
            setTimeout(() => {
                if (this.options.maintainBackground) {
                    element.style.background = gradientBg;
                }
            }, 10);
        });
    }

    /**
     * Fix duplicate titles issue and optimize Swedish text
     */
    fixDuplicateTitles() {
        this.faqs.forEach((faq, faqId) => {
            const summary = faq.summary;
            
            // Remove any existing duplicate content
            const existingSpans = summary.querySelectorAll('.accordion-title, .vaccine-title');
            existingSpans.forEach(span => span.remove());
            
            // Clean up any data attributes that might cause duplicates
            if (summary.hasAttribute('data-question')) {
                const question = summary.getAttribute('data-question');
                if (question && question.trim() !== summary.textContent.trim()) {
                    summary.textContent = question;
                }
            }
            
            // Get clean text and optimize it
            let cleanText = summary.textContent.trim();
            if (cleanText) {
                // Optimize Swedish text for 1-2 row display (for FAQ items only)
                if (faq.element.classList.contains('faq-item')) {
                    cleanText = this.optimizeSwedishText(cleanText);
                }
                
                summary.innerHTML = '';
                const titleSpan = document.createElement('span');
                // Use appropriate class based on content type
                if (faq.element.classList.contains('faq-item')) {
                    titleSpan.className = 'faq-title-text';
                } else {
                    titleSpan.className = 'accordion-title';
                }
                titleSpan.textContent = cleanText;
                
                // Add soft hyphens for better word breaking (FAQ items only)
                if (faq.element.classList.contains('faq-item')) {
                    this.addSoftHyphens(titleSpan);
                }
                
                summary.appendChild(titleSpan);
            }
        });
    }

    /**
     * Optimize Swedish text for better 1-2 row display
     */
    optimizeSwedishText(text) {
        // Dictionary of Swedish text optimizations
        const optimizations = {
            // Long words -> shorter alternatives
            'vaccinationer': 'vaccin',
            'betalningsalternativ': 'betalning',
            'vaccinationskort': 'vaccinbevis',
            'vaccinationsintyg': 'vaccinbevis',
            'läkarrecept': 'recept',
            'vårdnadshavare': 'förälder',
            'förkonsultation': 'konsultation',
            'barnvaccinationer': 'barnvaccin',
            'minderåriga': 'barn',
            'dokumentation': 'dokument',
            'journalsystem': 'journal',
            'hälsokontroll': 'hälsocheck',
            'blodtrycket': 'blodtryck',
            'järnvärdet': 'järnvärde',
            'blodsockret': 'blodsocker',
            'individuell rådgivning': 'rådgivning',
            'hälsosituation': 'hälsa',
            'skriftligt samtycke': 'skriftligt ok',
            'internationella': 'intern.',
            'exponering': 'utsättning',
            'tidigare doser': 'tidigare vaccin',
            'lämpligt schema': 'schema',
            
            // Phrases -> shorter versions
            'Behöver jag boka tid eller har ni drop-in?': 'Behöver jag boka tid?',
            'Vilket vaccin passar mig och behöver jag läkarrecept?': 'Vilket vaccin passar mig?',
            'Vilka betalningsalternativ accepterar ni?': 'Vilka betalningar tar ni?',
            'Kan barn vaccineras i bussen?': 'Kan barn vaccineras?',
            'Behöver jag ta med vaccinationskort / journal?': 'Behöver jag ta med vaccinbevis?',
            'Behöver jag boka tid för vaccination?': 'Behöver jag boka tid?',
            'Erbjuder ni rådgivning om vaccinationer?': 'Erbjuder ni rådgivning?',
            'Kan ni utfärda vaccinationsintyg?': 'Kan ni ge vaccinbevis?',
            'Vad gör jag vid akut behov av vaccination?': 'Vad gör jag vid akut behov?',
            
            // Common long words
            'tidigare': 'förra',
            'genomföra': 'göra',
            'självklarhet': 'givet',
            'effektiva': 'bra',
            'väntetiderna': 'väntetider',
            'tyvärr': 'nej',
            'möjlig': 'ok',
            'sällskap': 'med',
            'oftast': 'ofta',
            'lämpligt': 'bra'
        };
        
        let optimizedText = text;
        
        // Apply optimizations
        Object.entries(optimizations).forEach(([long, short]) => {
            // Case-insensitive replacement
            const regex = new RegExp(long.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            optimizedText = optimizedText.replace(regex, short);
        });
        
        // Remove redundant words
        optimizedText = optimizedText
            .replace(/\b(alltid|alltid)\b/gi, '') // Remove "alltid" 
            .replace(/\b(eller|och)\s+/gi, '/ ') // Replace "eller/och" with "/"
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();
        
        // Ensure question ends with ?
        if (!optimizedText.endsWith('?') && text.includes('?')) {
            optimizedText += '?';
        }
        
        return optimizedText;
    }

    /**
     * Add soft hyphens for better word breaking in Swedish
     */
    addSoftHyphens(element) {
        const text = element.textContent;
        const words = text.split(' ');
        
        const hyphenatedWords = words.map(word => {
            // Add soft hyphens to Swedish compound words
            if (word.length > 8) {
                return word
                    .replace(/([a-z])([A-Z])/g, '$1\u00AD$2') // CamelCase
                    .replace(/(vaccin|betaln|dokument|journal|hälso|förälder|barn)/gi, '$1\u00AD') // Common Swedish prefixes
                    .replace(/(ation|ning|het|dom|skap)/gi, '\u00AD$1') // Common Swedish suffixes
                    .replace(/([aeiouåäö])([bcdfghjklmnpqrstvwxz]{2,})/gi, '$1\u00AD$2') // Vowel + consonant clusters
                    .replace(/([bcdfghjklmnpqrstvwxz])([aeiouåäö])/gi, '$1\u00AD$2'); // Consonant + vowel
            }
            return word;
        });
        
        element.innerHTML = hyphenatedWords.join(' ');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Handle summary clicks
        document.addEventListener('click', (event) => {
            const summary = event.target.closest(this.options.summarySelector);
            if (!summary) return;
            
            const faqElement = summary.closest(this.options.selector);
            if (!faqElement) return;
            
            this.handleFAQToggle(faqElement, summary);
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (event) => {
            const summary = event.target.closest(this.options.summarySelector);
            if (!summary) return;
            
            this.handleKeydown(event, summary);
        });

        // Handle native toggle events
        document.addEventListener('toggle', (event) => {
            const faqElement = event.target.closest(this.options.selector);
            if (!faqElement) return;
            
            this.handleToggleEvent(faqElement);
        });
    }

    /**
     * Handle FAQ toggle
     */
    handleFAQToggle(faqElement, summary) {
        const faqId = this.getFAQId(faqElement);
        const faqData = this.faqs.get(faqId);
        
        if (!faqData) return;
        
        const willOpen = !faqElement.hasAttribute('open');
        
        // Single open mode
        if (this.options.singleOpen && willOpen) {
            this.closeAll();
        }
        
        // Update tracking
        if (willOpen) {
            this.currentlyOpen.add(faqId);
        } else {
            this.currentlyOpen.delete(faqId);
        }
        
        // Emit events
        this.emit(willOpen ? 'vaccine:faq:opening' : 'vaccine:faq:closing', {
            faqId,
            element: faqElement,
            summary,
            content: faqData.content
        });
        
        // Ensure background is maintained
        if (this.options.maintainBackground) {
            setTimeout(() => {
                this.fixBackgroundStyling(faqElement);
            }, 50);
        }
    }

    /**
     * Handle keyboard navigation
     */
    handleKeydown(event, summary) {
        const { key } = event;
        
        switch (key) {
            case 'Enter':
            case ' ':
                event.preventDefault();
                summary.click();
                break;
                
            case 'ArrowDown':
                event.preventDefault();
                this.focusNext(summary);
                break;
                
            case 'ArrowUp':
                event.preventDefault();
                this.focusPrevious(summary);
                break;
                
            case 'Home':
                event.preventDefault();
                this.focusFirst();
                break;
                
            case 'End':
                event.preventDefault();
                this.focusLast();
                break;
                
            case 'Escape':
                const faqElement = summary.closest(this.options.selector);
                if (faqElement && faqElement.hasAttribute('open')) {
                    faqElement.removeAttribute('open');
                    summary.focus();
                }
                break;
        }
    }

    /**
     * Handle native toggle events
     */
    handleToggleEvent(faqElement) {
        const faqId = this.getFAQId(faqElement);
        const faqData = this.faqs.get(faqId);
        
        if (!faqData) return;
        
        const isOpen = faqElement.hasAttribute('open');
        
        // Update accessibility
        faqData.summary.setAttribute('aria-expanded', isOpen);
        
        // Update tracking
        faqData.isOpen = isOpen;
        
        // Maintain background
        if (this.options.maintainBackground) {
            this.fixBackgroundStyling(faqElement);
        }
        
        // Announce state change to screen readers
        if (this.options.announceChanges) {
            this.announceStateChange(faqElement, isOpen);
        }
        
        // Emit completion event
        this.emit('vaccine:faq:toggled', {
            faqId,
            element: faqElement,
            isOpen,
            summary: faqData.summary,
            content: faqData.content
        });
    }

    /**
     * Focus navigation methods
     */
    focusNext(currentSummary) {
        const summaries = this.getAllSummaries();
        const currentIndex = summaries.indexOf(currentSummary);
        const nextIndex = (currentIndex + 1) % summaries.length;
        summaries[nextIndex].focus();
    }

    focusPrevious(currentSummary) {
        const summaries = this.getAllSummaries();
        const currentIndex = summaries.indexOf(currentSummary);
        const prevIndex = currentIndex === 0 ? summaries.length - 1 : currentIndex - 1;
        summaries[prevIndex].focus();
    }

    focusFirst() {
        const summaries = this.getAllSummaries();
        if (summaries.length > 0) summaries[0].focus();
    }

    focusLast() {
        const summaries = this.getAllSummaries();
        if (summaries.length > 0) summaries[summaries.length - 1].focus();
    }

    getAllSummaries() {
        return Array.from(document.querySelectorAll(this.options.summarySelector))
            .filter(summary => summary.closest(this.options.selector));
    }

    /**
     * Get FAQ ID from element
     */
    getFAQId(faqElement) {
        return Array.from(this.faqs.keys()).find(id => 
            this.faqs.get(id).element === faqElement
        ) || 'unknown';
    }

    /**
     * Public API methods
     */
    open(faqId) {
        const faqData = this.faqs.get(faqId);
        if (faqData && !faqData.isOpen) {
            faqData.element.setAttribute('open', '');
        }
    }

    close(faqId) {
        const faqData = this.faqs.get(faqId);
        if (faqData && faqData.isOpen) {
            faqData.element.removeAttribute('open');
        }
    }

    toggle(faqId) {
        const faqData = this.faqs.get(faqId);
        if (faqData) {
            if (faqData.isOpen) {
                this.close(faqId);
            } else {
                this.open(faqId);
            }
        }
    }

    closeAll() {
        this.faqs.forEach((faqData, faqId) => {
            if (faqData.isOpen) {
                faqData.element.removeAttribute('open');
            }
        });
        this.currentlyOpen.clear();
    }

    openAll() {
        this.faqs.forEach((faqData, faqId) => {
            if (!faqData.isOpen) {
                faqData.element.setAttribute('open', '');
            }
        });
    }

    /**
     * Get FAQ state
     */
    getState(faqId) {
        return this.faqs.get(faqId) || null;
    }

    getCurrentlyOpen() {
        return Array.from(this.currentlyOpen);
    }

    /**
     * Announce state change to screen readers
     * @param {Element} faqElement - FAQ element
     * @param {boolean} isOpen - Whether element is open
     */
    announceStateChange(faqElement, isOpen) {
        const summary = faqElement.querySelector('summary');
        const text = summary ? summary.textContent.trim() : 'Accordion';
        const message = `${text} ${isOpen ? 'expanded' : 'collapsed'}`;

        // Create temporary announcement element
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.classList.add('sr-only');
        announcer.textContent = message;

        document.body.appendChild(announcer);

        // Remove after announcement
        setTimeout(() => {
            if (announcer.parentNode) {
                announcer.parentNode.removeChild(announcer);
            }
        }, 1000);
    }

    /**
     * Destroy component
     */
    destroy() {
        // Remove event listeners
        document.removeEventListener('click', this.handleFAQToggle);
        document.removeEventListener('keydown', this.handleKeydown);
        document.removeEventListener('toggle', this.handleToggleEvent);
        
        // Clear data
        this.faqs.clear();
        this.currentlyOpen.clear();
        
        this.emit('vaccine:faq:destroyed');
    }

    /**
     * Emit custom event
     */
    emit(eventType, detail = {}) {
        const event = new CustomEvent(eventType, {
            detail,
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(event);
        return !event.defaultPrevented;
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize FAQ toggle with default options
    window.faqToggle = new FAQToggle({
        maintainBackground: true,
        singleOpen: false // Allow multiple FAQs open
    });
});

// Export for manual initialization
window.FAQToggle = FAQToggle;