/**
 * Emergency Mobile JavaScript Fixes
 * Applied from Codebase-fix-session1.md
 * Critical hotfixes for immediate deployment
 */

(function() {
  'use strict';

  // Emergency table wrapper fix
  function wrapTablesWithScrollContainer() {
    const tables = document.querySelectorAll('.location-schedule, .price-table');
    tables.forEach(table => {
      if (!table.parentElement.classList.contains('table-scroll-container')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-scroll-container';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wrapTablesWithScrollContainer);
  } else {
    wrapTablesWithScrollContainer();
  }

})();