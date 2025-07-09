# Task: GitHub Actions CI Workflow

**Owner:** Claude 4 Sonnet

## Objective
Run install, lint, unit + visual tests on every pull request to `main`.

## Implementation Steps
1. **Workflow File**
   • `.github/workflows/ci.yml` triggered on `pull_request` & `push` to `main`.
2. **Jobs**
   **setup**: Checkout code, cache npm, run `npm ci`.
   **lint**: `npm run lint`.
   **unit**: placeholder for Vitest (future).
   **e2e**: `npm run test:e2e -- --update-snapshots=false` on headless Chromium.
3. **Artifacts**
   • Upload diff images on failure.
4. **Branch Protection**
   • Require `ci / e2e` pass before merge.

---
*Success Criteria*: Green checks on PRs; failing diffs block merge.