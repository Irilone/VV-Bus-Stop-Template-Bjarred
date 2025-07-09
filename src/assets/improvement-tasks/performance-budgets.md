# Task: Lighthouse & Pa11y Performance Budgets

**Owner:** Claude 4 Sonnet

## Objective
Fail CI if performance (< 90) or accessibility (< 95) regress on PRs.

## Roadmap
1. **Tooling**
   • `npm i -D lighthouse-ci pa11y-ci`.
2. **Budget File**
   • `lighthouserc.json` with budgets: TTFC < 2 s, CLS < 0.1, JS < 175 KB.
3. **Script**
   • `npm run audit:perf` → `lhci autorun --collect.url=http://localhost:8080`.
   • `npm run audit:a11y` → `pa11y-ci dist/index.html`.
4. **CI Hook**
   • Append to `ci.yml` after test job.
5. **Reporting**
   • Upload HTML reports; comment summary on PR.

---
*Success*: PR blocked if scores fall below thresholds.