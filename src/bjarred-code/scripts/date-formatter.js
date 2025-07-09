/**
 * Date Formatter Module for Vaccine Bjarred Tables
 * Responsive Swedish date formatting with breakpoint detection
 * Session: COMP-ISO-002
 */

(function() {
    'use strict';

    /**
     * Swedish date formatter with responsive behavior
     */
    class SwedishDateFormatter {
        constructor() {
            this.locale = 'sv-SE';
            this.breakpoints = {
                micro: 280,     // 'd/M' format + remove weekday column
                tiny: 350,      // 'dd/MM' format + single letters
                small: 420,     // 'dd-MM-yy' format + 3-letter weekdays
                medium: 520,    // 'dd/MM-yyyy' format + full weekdays
                large: 680      // 'dd mmmm yyyy' format + full weekdays
            };
            
            this.monthNames = {
                full: [
                    'januari', 'februari', 'mars', 'april', 'maj', 'juni',
                    'juli', 'augusti', 'september', 'oktober', 'november', 'december'
                ],
                short: [
                    'jan', 'feb', 'mar', 'apr', 'maj', 'jun',
                    'jul', 'aug', 'sep', 'okt', 'nov', 'dec'
                ]
            };
            
            this.dayNames = {
                full: ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'],
                short: ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'],
                minimal: ['M', 'Ti', 'O', 'To', 'F', 'L', 'S'] // Unique letters with Ti/To for conflicts
            };
            
            this.init();
        }
        
        /**
         * Initialize the date formatter
         */
        init() {
            this.setupResizeObserver();
            this.formatExistingDates();
        }
        
        /**
         * Set up container size observation for responsive formatting
         */
        setupResizeObserver() {
            if (!window.ResizeObserver) {
                // Fallback to window resize for older browsers
                window.addEventListener('resize', this.debounce(() => {
                    this.formatExistingDates();
                }, 250));
                return;
            }
            
            const tableContainers = document.querySelectorAll('#vaccine-bjarred-app .table-scroll-container');
            
            this.resizeObserver = new ResizeObserver(entries => {
                entries.forEach(entry => {
                    this.updateDateFormatsInContainer(entry.target);
                });
            });
            
            tableContainers.forEach(container => {
                this.resizeObserver.observe(container);
            });
        }
        
        /**
         * Update date formats within a specific container
         * @param {Element} container - The container element
         */
        updateDateFormatsInContainer(container) {
            const width = container.offsetWidth;
            const formatType = this.getFormatType(width);
            
            // Format date elements
            const timeElements = container.querySelectorAll('time[datetime]');
            timeElements.forEach(timeEl => {
                this.formatTimeElement(timeEl, formatType);
            });
            
            const dateElements = container.querySelectorAll('[data-date]');
            dateElements.forEach(dateEl => {
                this.formatDateElement(dateEl, formatType);
            });
            
            // Handle weekday column visibility and formatting
            this.updateWeekdayColumn(container, formatType);
            
            // Highlight current date and weekday
            this.highlightCurrentDate(container);
            
            // Ensure all table cells remain on one row
            this.enforceTableCellSingleRow(container);
        }
        
        /**
         * Determine the appropriate format type based on container width
         * @param {number} width - Container width in pixels
         * @returns {string} Format type
         */
        getFormatType(width) {
            if (width < this.breakpoints.micro) return 'micro';      // 'd/M'
            if (width < this.breakpoints.tiny) return 'tiny';        // 'dd/MM' 
            if (width < this.breakpoints.small) return 'small';      // 'dd-MM-yy'
            if (width < this.breakpoints.medium) return 'medium';    // 'dd/MM-yyyy'
            if (width < this.breakpoints.large) return 'large';      // 'dd mmmm yyyy'
            return 'full';                                           // 'dd mmmm yyyy' (same as large)
        }
        
        /**
         * Format a time element based on its datetime attribute
         * @param {Element} timeEl - The time element
         * @param {string} formatType - The format type to use
         */
        formatTimeElement(timeEl, formatType) {
            const datetime = timeEl.getAttribute('datetime');
            if (!datetime) return;
            
            try {
                const date = new Date(datetime);
                const formattedDate = this.formatDate(date, formatType);
                
                // Store original text if not already stored
                if (!timeEl.hasAttribute('data-original-text')) {
                    timeEl.setAttribute('data-original-text', timeEl.textContent);
                }
                
                timeEl.textContent = formattedDate;
            } catch (error) {
                console.warn('Date formatting error:', error);
            }
        }
        
        /**
         * Format a date element based on its data-date attribute
         * @param {Element} dateEl - The date element
         * @param {string} formatType - The format type to use
         */
        formatDateElement(dateEl, formatType) {
            const dateString = dateEl.getAttribute('data-date');
            if (!dateString) return;
            
            try {
                const date = new Date(dateString);
                const formattedDate = this.formatDate(date, formatType);
                
                // Store original text if not already stored
                if (!dateEl.hasAttribute('data-original-text')) {
                    dateEl.setAttribute('data-original-text', dateEl.textContent);
                }
                
                dateEl.textContent = formattedDate;
            } catch (error) {
                console.warn('Date formatting error:', error);
            }
        }
        
        /**
         * Format a date according to the specified format type
         * @param {Date} date - The date to format
         * @param {string} formatType - The format type
         * @returns {string} Formatted date string
         */
        formatDate(date, formatType = 'full') {
            const day = date.getDate();
            const month = date.getMonth();
            const year = date.getFullYear();
            const paddedDay = day.toString().padStart(2, '0');
            const paddedMonth = (month + 1).toString().padStart(2, '0');
            const shortYear = year.toString().slice(-2);
            
            switch (formatType) {
                case 'micro':
                    // 'd/M' format - examples: '9/5', '23/12'
                    return `${day}/${month + 1}`;
                    
                case 'tiny':
                    // 'dd/MM' format - examples: '23/12', '09/05'
                    return `${paddedDay}/${paddedMonth}`;
                    
                case 'small':
                    // 'dd-MM-yy' format - examples: '25/02-25', '09/12-24'
                    return `${paddedDay}/${paddedMonth}-${shortYear}`;
                    
                case 'medium':
                    // 'dd/MM-yyyy' format - examples: '21/03-2025', '09/12-2024'
                    return `${paddedDay}/${paddedMonth}-${year}`;
                    
                case 'large':
                case 'full':
                default:
                    // 'dd mmmm yyyy' format - examples: '23 jan 2025', '31 okt 2025', '20 april 2025'
                    return `${day} ${this.monthNames.short[month]} ${year}`;
            }
        }
        
        /**
         * Format existing dates in the document
         */
        formatExistingDates() {
            const containers = document.querySelectorAll('#vaccine-bjarred-app .table-scroll-container');
            containers.forEach(container => {
                this.updateDateFormatsInContainer(container);
            });
        }
        
        /**
         * Add responsive day name formatting
         * @param {Date} date - The date object
         * @param {string} formatType - The format type
         * @returns {string} Formatted day name
         */
        formatDayName(date, formatType = 'full') {
            const dayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1; // Adjust for Monday start
            
            switch (formatType) {
                case 'micro':
                    return null; // Remove weekday column entirely
                case 'tiny':
                    return this.dayNames.minimal[dayOfWeek]; // Single letters: M, Ti, O, To, F, L, S
                case 'small':
                    return this.dayNames.short[dayOfWeek]; // 3 letters: Mån, Tis, Ons, Tor, Fre, Lör, Sön
                case 'medium':
                case 'large':
                case 'full':
                default:
                    return this.dayNames.full[dayOfWeek]; // Full: Måndag, Tisdag, etc.
            }
        }
        
        /**
         * Update weekday column visibility and formatting
         * @param {Element} container - The table container
         * @param {string} formatType - The format type
         */
        updateWeekdayColumn(container, formatType) {
            const table = container.querySelector('table');
            if (!table) return;
            
            // Find weekday column (usually first or second column)
            const weekdayHeaders = table.querySelectorAll('th');
            const weekdayCells = table.querySelectorAll('td');
            
            let weekdayColumnIndex = -1;
            
            // Detect weekday column by checking header content
            weekdayHeaders.forEach((header, index) => {
                const headerText = header.textContent.toLowerCase().trim();
                if (headerText.includes('dag') || headerText.includes('vecka') || 
                    this.dayNames.full.some(day => headerText.includes(day.toLowerCase())) ||
                    this.dayNames.short.some(day => headerText.includes(day.toLowerCase()))) {
                    weekdayColumnIndex = index;
                }
            });
            
            // If no header found, try to detect by cell content
            if (weekdayColumnIndex === -1) {
                const firstRowCells = table.querySelectorAll('tbody tr:first-child td');
                firstRowCells.forEach((cell, index) => {
                    const cellText = cell.textContent.toLowerCase().trim();
                    if (this.dayNames.full.some(day => cellText.includes(day.toLowerCase())) ||
                        this.dayNames.short.some(day => cellText.includes(day.toLowerCase()))) {
                        weekdayColumnIndex = index;
                    }
                });
            }
            
            if (weekdayColumnIndex === -1) return; // No weekday column found
            
            if (formatType === 'micro') {
                // Hide weekday column entirely
                this.hideWeekdayColumn(table, weekdayColumnIndex);
            } else {
                // Show and format weekday column
                this.showWeekdayColumn(table, weekdayColumnIndex);
                this.formatWeekdayColumn(table, weekdayColumnIndex, formatType);
            }
        }

        /**
         * Hide weekday column
         * @param {Element} table - The table element
         * @param {number} columnIndex - The column index to hide
         */
        hideWeekdayColumn(table, columnIndex) {
            const selector = `th:nth-child(${columnIndex + 1}), td:nth-child(${columnIndex + 1})`;
            const cells = table.querySelectorAll(selector);
            
            cells.forEach(cell => {
                cell.style.display = 'none';
                cell.setAttribute('data-weekday-hidden', 'true');
            });
        }

        /**
         * Show weekday column
         * @param {Element} table - The table element
         * @param {number} columnIndex - The column index to show
         */
        showWeekdayColumn(table, columnIndex) {
            const selector = `th:nth-child(${columnIndex + 1}), td:nth-child(${columnIndex + 1})`;
            const cells = table.querySelectorAll(selector);
            
            cells.forEach(cell => {
                if (cell.getAttribute('data-weekday-hidden') === 'true') {
                    cell.style.display = '';
                    cell.removeAttribute('data-weekday-hidden');
                }
            });
        }

        /**
         * Format weekday column content
         * @param {Element} table - The table element
         * @param {number} columnIndex - The column index
         * @param {string} formatType - The format type
         */
        formatWeekdayColumn(table, columnIndex, formatType) {
            const selector = `td:nth-child(${columnIndex + 1})`;
            const cells = table.querySelectorAll(selector);
            
            cells.forEach(cell => {
                const originalText = cell.getAttribute('data-original-day') || cell.textContent.trim();
                if (!cell.hasAttribute('data-original-day')) {
                    cell.setAttribute('data-original-day', originalText);
                }
                
                // Try to parse the day name and reformat
                const dayIndex = this.findDayIndex(originalText);
                if (dayIndex !== -1) {
                    const formattedDay = this.formatDayByIndex(dayIndex, formatType);
                    if (formattedDay) {
                        cell.textContent = formattedDay;
                    }
                }
            });
        }

        /**
         * Find day index from text
         * @param {string} text - The text to parse
         * @returns {number} Day index or -1 if not found
         */
        findDayIndex(text) {
            const lowerText = text.toLowerCase().trim();
            
            // Check full names
            let index = this.dayNames.full.findIndex(day => lowerText.includes(day.toLowerCase()));
            if (index !== -1) return index;
            
            // Check short names
            index = this.dayNames.short.findIndex(day => lowerText.includes(day.toLowerCase()));
            if (index !== -1) return index;
            
            // Check minimal names
            index = this.dayNames.minimal.findIndex(day => lowerText === day.toLowerCase());
            if (index !== -1) return index;
            
            return -1;
        }

        /**
         * Highlight current date and weekday with increased font weight
         * @param {Element} container - The table container
         */
        highlightCurrentDate(container) {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize to start of day
            
            const tables = container.querySelectorAll('table');
            
            tables.forEach(table => {
                const rows = table.querySelectorAll('tbody tr');
                
                rows.forEach(row => {
                    // Find date cell (usually first column or contains time element)
                    const timeElement = row.querySelector('time[datetime]');
                    const dateCells = row.querySelectorAll('td');
                    
                    let rowDate = null;
                    let dateCell = null;
                    
                    if (timeElement) {
                        const datetime = timeElement.getAttribute('datetime');
                        if (datetime) {
                            rowDate = new Date(datetime);
                            rowDate.setHours(0, 0, 0, 0);
                            dateCell = timeElement.closest('td');
                        }
                    }
                    
                    // If no time element, try to parse first cell content
                    if (!rowDate && dateCells.length > 0) {
                        const firstCell = dateCells[0];
                        const cellText = firstCell.textContent.trim();
                        
                        // Try to parse various date formats
                        const parsedDate = this.parseSwedishDate(cellText);
                        if (parsedDate) {
                            rowDate = parsedDate;
                            dateCell = firstCell;
                        }
                    }
                    
                    // Check if this row represents today
                    if (rowDate && this.isSameDay(rowDate, today)) {
                        this.highlightCurrentDateRow(row, dateCell);
                    } else {
                        this.removeCurrentDateHighlight(row);
                    }
                });
            });
        }

        /**
         * Check if two dates are the same day
         * @param {Date} date1 - First date
         * @param {Date} date2 - Second date
         * @returns {boolean} True if same day
         */
        isSameDay(date1, date2) {
            return date1.getFullYear() === date2.getFullYear() &&
                   date1.getMonth() === date2.getMonth() &&
                   date1.getDate() === date2.getDate();
        }

        /**
         * Parse Swedish date text to Date object
         * @param {string} dateText - The date text to parse
         * @returns {Date|null} Parsed date or null
         */
        parseSwedishDate(dateText) {
            const text = dateText.toLowerCase().trim();
            
            // Try ISO format first (from datetime attribute)
            let date = new Date(dateText);
            if (!isNaN(date.getTime())) {
                return date;
            }
            
            // Try Swedish month names
            const monthRegex = /(januari|februari|mars|april|maj|juni|juli|augusti|september|oktober|november|december|jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)/;
            const match = text.match(/(\d{1,2})\s*(januari|februari|mars|april|maj|juni|juli|augusti|september|oktober|november|december|jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)\s*(\d{4})?/);
            
            if (match) {
                const day = parseInt(match[1]);
                const monthName = match[2];
                const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
                
                // Map month names to numbers
                const monthMap = {
                    'januari': 0, 'jan': 0,
                    'februari': 1, 'feb': 1,
                    'mars': 2, 'mar': 2,
                    'april': 3, 'apr': 3,
                    'maj': 4,
                    'juni': 5, 'jun': 5,
                    'juli': 6, 'jul': 6,
                    'augusti': 7, 'aug': 7,
                    'september': 8, 'sep': 8,
                    'oktober': 9, 'okt': 9,
                    'november': 10, 'nov': 10,
                    'december': 11, 'dec': 11
                };
                
                const month = monthMap[monthName];
                if (month !== undefined) {
                    return new Date(year, month, day);
                }
            }
            
            // Try numeric formats (dd/mm, dd/mm/yy, dd/mm/yyyy, etc.)
            const numericMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
            if (numericMatch) {
                const day = parseInt(numericMatch[1]);
                const month = parseInt(numericMatch[2]) - 1; // Month is 0-indexed
                let year = numericMatch[3] ? parseInt(numericMatch[3]) : new Date().getFullYear();
                
                // Handle 2-digit years
                if (year < 100) {
                    year += year < 50 ? 2000 : 1900;
                }
                
                return new Date(year, month, day);
            }
            
            return null;
        }

        /**
         * Highlight current date row with increased font weight
         * @param {Element} row - The table row
         * @param {Element} dateCell - The date cell
         */
        highlightCurrentDateRow(row, dateCell) {
            // Add current date class for CSS targeting
            row.classList.add('current-date-row');
            row.setAttribute('data-current-date', 'true');
            
            // Find all cells in the row
            const cells = row.querySelectorAll('td');
            
            cells.forEach((cell, index) => {
                // Store original font weight if not already stored
                if (!cell.hasAttribute('data-original-font-weight')) {
                    const computedStyle = window.getComputedStyle(cell);
                    cell.setAttribute('data-original-font-weight', computedStyle.fontWeight);
                }
                
                // Get current font weight and increase by 100 (Filson Pro compatible)
                const originalWeight = this.parseDesignSystemWeight(cell.getAttribute('data-original-font-weight')) || 400;
                const newWeight = this.getNextFilsonProWeight(originalWeight, 100);
                
                // Apply increased font weight using design system variable
                this.applyDesignSystemWeight(cell, newWeight);
                cell.classList.add('current-date-cell');
                
                // Special handling for date and weekday cells
                if (index === 0 || cell.querySelector('time[datetime]')) {
                    // Date cell - make it extra bold (+200)
                    const dateWeight = this.getNextFilsonProWeight(originalWeight, 200);
                    this.applyDesignSystemWeight(cell, dateWeight);
                    cell.classList.add('current-date-highlight');
                }
                
                // Check if this is likely a weekday cell
                const cellText = cell.textContent.toLowerCase().trim();
                if (this.isWeekdayText(cellText)) {
                    // Weekday cell - make it extra bold (+200)
                    const weekdayWeight = this.getNextFilsonProWeight(originalWeight, 200);
                    this.applyDesignSystemWeight(cell, weekdayWeight);
                    cell.classList.add('current-weekday-highlight');
                }
            });
        }

        /**
         * Parse weight from design system variables or numeric values
         * @param {string} weightValue - The font weight value
         * @returns {number} Numeric font weight
         */
        parseDesignSystemWeight(weightValue) {
            if (!weightValue) return 400;
            
            // Handle numeric values
            const numericWeight = parseInt(weightValue);
            if (!isNaN(numericWeight)) {
                return numericWeight;
            }
            
            // Handle CSS keywords
            const weightMap = {
                'normal': 400,
                'bold': 700,
                'bolder': 700,
                'lighter': 300,
                'light': 300,
                'medium': 500,
                'semi-bold': 600,
                'extra-bold': 800,
                'black': 900
            };
            
            return weightMap[weightValue.toLowerCase()] || 400;
        }

        /**
         * Get next Filson Pro compatible weight (increments of 100)
         * @param {number} currentWeight - Current font weight
         * @param {number} increase - Amount to increase
         * @returns {number} New font weight
         */
        getNextFilsonProWeight(currentWeight, increase) {
            const filsonProWeights = [300, 400, 500, 600, 700, 800, 900];
            const targetWeight = currentWeight + increase;
            
            // Find the closest available weight that's >= target
            for (let weight of filsonProWeights) {
                if (weight >= targetWeight) {
                    return weight;
                }
            }
            
            // If target exceeds max, return max
            return 900;
        }

        /**
         * Apply design system font weight variable
         * @param {Element} element - Element to apply weight to
         * @param {number} weight - Font weight value
         */
        applyDesignSystemWeight(element, weight) {
            // Map weight to design system variables (based on styletest.css)
            const weightToVariable = {
                300: '300', // Light not defined in design system, use fallback
                400: 'var(--fw-normal, 400)',
                500: 'var(--fw-regular, 500)',
                600: 'var(--fw-medium, 600)',
                700: 'var(--fw-bold, 700)',
                800: 'var(--fw-heavy, 800)',
                900: 'var(--fw-black, 900)'
            };
            
            // Apply design system variable or fallback to numeric
            const weightValue = weightToVariable[weight] || weight.toString();
            element.style.fontWeight = weightValue;
            
            // Store the applied weight for debugging
            element.setAttribute('data-applied-weight', weight.toString());
        }

        /**
         * Remove current date highlighting
         * @param {Element} row - The table row
         */
        removeCurrentDateHighlight(row) {
            row.classList.remove('current-date-row');
            row.removeAttribute('data-current-date');
            
            const cells = row.querySelectorAll('td');
            cells.forEach(cell => {
                // Restore original font weight using design system
                const originalWeight = cell.getAttribute('data-original-font-weight');
                if (originalWeight) {
                    const numericWeight = this.parseDesignSystemWeight(originalWeight);
                    this.applyDesignSystemWeight(cell, numericWeight);
                } else {
                    // Remove the style entirely to let CSS cascade take over
                    cell.style.fontWeight = '';
                }
                
                // Remove classes and debugging attributes
                cell.classList.remove('current-date-cell', 'current-date-highlight', 'current-weekday-highlight');
                cell.removeAttribute('data-applied-weight');
            });
        }

        /**
         * Check if text represents a weekday
         * @param {string} text - Text to check
         * @returns {boolean} True if text is a weekday
         */
        isWeekdayText(text) {
            const lowerText = text.toLowerCase().trim();
            
            // Check against all weekday formats
            return this.dayNames.full.some(day => lowerText.includes(day.toLowerCase())) ||
                   this.dayNames.short.some(day => lowerText.includes(day.toLowerCase())) ||
                   this.dayNames.minimal.some(day => lowerText === day.toLowerCase());
        }

        /**
         * Enforce single row for all table cells
         * @param {Element} container - The table container
         */
        enforceTableCellSingleRow(container) {
            const tables = container.querySelectorAll('table');
            
            tables.forEach(table => {
                const cells = table.querySelectorAll('td, th');
                cells.forEach(cell => {
                    // Apply CSS to ensure single row
                    cell.style.whiteSpace = 'nowrap';
                    cell.style.overflow = 'hidden';
                    cell.style.textOverflow = 'ellipsis';
                    cell.style.maxWidth = '100px'; // Prevent excessive width
                });
            });
        }

        /**
         * Update day names in table cells (legacy method, kept for compatibility)
         */
        updateDayNames() {
            const containers = document.querySelectorAll('#vaccine-bjarred-app .table-scroll-container');
            containers.forEach(container => {
                this.updateDateFormatsInContainer(container);
            });
        }
        
        /**
         * Format day name by index
         * @param {number} dayIndex - Day index (0 = Monday)
         * @param {string} formatType - Format type
         * @returns {string} Formatted day name
         */
        formatDayByIndex(dayIndex, formatType) {
            switch (formatType) {
                case 'minimal':
                    return this.dayNames.minimal[dayIndex];
                case 'short':
                    return this.dayNames.short[dayIndex];
                case 'medium':
                case 'full':
                default:
                    return this.dayNames.full[dayIndex];
            }
        }
        
        /**
         * Check if a date is upcoming (within next 30 days)
         * @param {Date} date - The date to check
         * @returns {boolean} True if date is upcoming
         */
        isUpcoming(date) {
            const now = new Date();
            const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
            return date >= now && date <= thirtyDaysFromNow;
        }
        
        /**
         * Add upcoming date indicators
         */
        addUpcomingIndicators() {
            const timeElements = document.querySelectorAll('#vaccine-bjarred-app time[datetime]');
            
            timeElements.forEach(timeEl => {
                const datetime = timeEl.getAttribute('datetime');
                if (!datetime) return;
                
                try {
                    const date = new Date(datetime);
                    const row = timeEl.closest('tr');
                    
                    if (this.isUpcoming(date) && row) {
                        row.setAttribute('data-upcoming', 'true');
                        row.setAttribute('aria-label', 'Kommande datum');
                    }
                } catch (error) {
                    console.warn('Date parsing error:', error);
                }
            });
        }
        
        /**
         * Debounce function for performance optimization
         * @param {Function} func - Function to debounce
         * @param {number} wait - Wait time in milliseconds
         * @returns {Function} Debounced function
         */
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
        
        /**
         * Destroy the formatter and clean up
         */
        destroy() {
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
            }
        }
    }

    /**
     * Initialize the date formatter when DOM is ready
     */
    function initDateFormatter() {
        // Check if we're in the vaccine app context
        if (!document.querySelector('#vaccine-bjarred-app')) {
            return;
        }
        
        window.VaccineDateFormatter = new SwedishDateFormatter();
        
        // Add upcoming indicators after initial formatting
        setTimeout(() => {
            window.VaccineDateFormatter.addUpcomingIndicators();
            window.VaccineDateFormatter.updateDayNames();
        }, 100);
        
        console.log('✓ Swedish Date Formatter initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDateFormatter);
    } else {
        initDateFormatter();
    }

    // Export for manual initialization if needed
    window.SwedishDateFormatter = SwedishDateFormatter;

})();