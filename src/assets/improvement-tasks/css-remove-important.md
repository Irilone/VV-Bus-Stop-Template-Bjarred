# Task: Remove Legacy `!important` Declarations

**Owner:** GPT-4.1

## Goal
Audit all project stylesheets and eliminate unnecessary `!important` flags, replacing them with properly scoped selectors or utility classes to restore cascade integrity.

## Why It Matters
* Simplifies future overrides and maintenance.
* Lowers specificity creep, improving theming/dark-mode support.
* Enables utilities like Stylelint to catch genuine conflicts.

## Step-by-Step Plan
1. **Discovery**
   • `grep -R "!important" src/**/*.css` → export list to `reports/important-usage.txt`.
   • Categorise each match as: _utility_, _component_, or _legacy_.
2. **Utility Review**
   • Keep `!important` only in sanctioned utility classes (e.g., `.visually-hidden`).
3. **Component Refactor**
   • For each component rule using `!important`, attempt to raise selector specificity (nest under `#vaccine-bjarred-app` where possible) or split into sub-selectors.
4. **Automated Lint**
   • Add Stylelint rule `declaration-no-important: [true, { severity: "warning" }]` scoped to `src/css/**/*.css`.
5. **Regression Check**
   • Run visual diff tests (see `playwright-tests.md`).
6. **PR Checklist**
   • Zero `!important` outside approved utilities.
   • All unit snapshots pass.

---
*Completion Criteria*: Stylelint report shows zero violations for `!important` misuse.