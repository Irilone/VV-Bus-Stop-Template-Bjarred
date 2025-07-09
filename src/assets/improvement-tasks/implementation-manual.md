# 📚 Improvement Tasks – Implementation Manual

Welcome! This manual explains **how to execute the modular enhancement tasks** stored in this `improvement-tasks/` folder. It is aimed at any contributor (human or AI agent) who will be working through the backlog.

---

## 📂 Folder Overview

| File | Purpose |
|------|---------|
| `css-remove-important.md` | Remove legacy `!important` flags and restore cascade integrity. |
| `lazyload-images.md` | Refactor images in `1.html` & `3.html` for native + JS-powered lazy-loading. |
| `playwright-tests.md` | Add cross-breakpoint visual regression suite with Playwright. |
| `ci-workflow.md` | Create GitHub Actions pipeline to lint & test on every PR. |
| `css-custom-properties-migration.md` | Migrate root CSS variables to `@property`. |
| `accessibility-queries.md` | Add `prefers-contrast` & `dynamic-range` media-query support. |
| `svg-sprite.md` | Build SVG sprite sheet and replace inline SVG icons. |
| `performance-budgets.md` | Enforce Lighthouse + Pa11y budgets in CI. |

> **Tip:** Each file is self-contained. Open it to see the detailed step-by-step plan, owner model, and completion criteria.

---

## 🛠️ Prerequisites

1. **Node.js ≥ 18** (with npm).
2. Local clone of this repo and ability to push feature branches.
3. `npm ci` run at least once to install linters and tooling.
4. Familiarity with GitHub Flow (feature branch → PR → review → merge).

---

## 🗂️ Recommended Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feat/<task-id>
```

Use the task’s filename slug for clarity, e.g. `feat/css-remove-important`.

### 2. Read the Task File

Open the corresponding `.md` file and read the **Goal**, **Step-by-Step Plan**, and **Success Criteria**.

### 3. Execute Steps Locally

Follow the checklist in order. Most tasks reference commands—copy-paste them or adapt as needed.

### 4. Run Lint & Tests

```bash
npm run lint           # all three linters
npm run test:e2e       # if Playwright tests exist
```

### 5. Commit Work Incrementally

```bash
git add -p
git commit -m "feat(css): removed 85% of !important flags (task #A-1 step 3)"
```

### 6. Push & Open Pull Request

GitHub Actions will run automatically via `ci-workflow.md` once merged.

### 7. Address Review Comments

Make any requested changes and re-push.

### 8. Merge & Delete Branch

After all checks pass and approvals are in, squash-merge the PR.

---

## 🔄 Task Ordering Strategy

1. **CSS Foundation**
   • `css-remove-important.md`
   • `css-custom-properties-migration.md`
2. **Accessibility & Performance**
   • `accessibility-queries.md`
   • `lazyload-images.md`
3. **Component Optimisation**
   • `svg-sprite.md`
4. **Testing & CI**
   • `playwright-tests.md`
   • `performance-budgets.md`
   • `ci-workflow.md`

> Tackle tasks in the above order to minimise merge conflicts and ensure the CI pipeline is in place before heavy visual diffs are introduced.

---

## 🤖 Model Ownership

| Owner | Strengths | Assigned Tasks |
|-------|-----------|----------------|
| **GPT-4.1** | Precise code edits, AST manipulation, complex CSS refactor. | css-remove-important, lazyload-images, playwright-tests, css-custom-properties-migration, accessibility-queries, svg-sprite |
| **Claude 4 Sonnet** | Prose-heavy YAML/Markdown authoring, config orchestration. | ci-workflow, performance-budgets |

When collaborating, ensure each model focuses on its strengths but cross-review each other’s PRs for holistic quality.

---

## ✅ Definition of Done Checklist

- [ ] All success criteria in the task file met.
- [ ] No new lint errors (`npm run lint`).
- [ ] Unit / visual tests pass (`npm run test` / `npm run test:e2e`).
- [ ] CI pipeline green on PR.
- [ ] Documentation updated if needed.

---

Happy hacking! 🎉