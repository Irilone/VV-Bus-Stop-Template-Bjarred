# Task: Playwright Visual Regression Suite

**Owner:** GPT-4.1

## Goal
Automate cross-breakpoint visual testing for critical components (Header, Nav, FAQ, Price Table, Schedule Table).

## Steps
1. **Setup**
   • `npm i -D @playwright/test playwright-chromium pixelmatch`.
2. **Config**
   • Create `playwright.config.ts` with viewports: xs (375×667), sm (576×812), md (768×1024), lg (992×1080), xl (1200×1080), xxl (1400×1080).
3. **Scenarios**
   • Navigate to local build (`dist/index.html`).
   • Capture snapshots of each target component state (e.g., FAQ open/closed).
4. **CI Integration**
   • Add `npm run test:e2e` script.
   • Store baselines under `tests/baseline/`.
5. **Thresholds**
   • Use `pixelmatch` diff ≤ 0.1%.

---
*Done When*: PR fails on unexpected visual drift across any breakpoint.