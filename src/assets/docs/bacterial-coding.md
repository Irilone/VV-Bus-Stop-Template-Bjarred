## 1. **Distilled Core Bacterial Coding Rules**

> **Bacterial Coding Style Guide**
>
> * **Small:** Write functions and modules as small as possible. Prefer single-purpose, <50 line “genes.”
> * **Modular:** Favor decoupled, interchangeable pieces—avoid global state, hidden dependencies, or magic imports.
> * **Self-Contained:** Each code snippet should run, test, and demonstrate value *without* requiring knowledge of surrounding code.
> * **Copy-Paste Friendly:** Code should be trivially copy-pasteable—no unexplained external dependencies, setup, or context.
> * **Rapid Prototyping:** Optimize for immediate value and reuse, not for elaborate abstractions.
> * **Horizontal Transfer:** Make it easy for anyone to grab, remix, and drop code anywhere. If code can’t become a GitHub gist, it’s too coupled.
> * **Eukaryotic Backbone:** Use a single, more organized monorepo for larger, complex coordination—but favor “bacterial” modules inside.
> * **Inventiveness:** Prefer inventive, minimal, mix-and-match snippets—use the monorepo backbone only for critical integration or cross-module orchestration.

---

## 2. **Format for Each Tool/Platform**

### **A. For Warp (Terminal AI, Prompting Rules)**

```
# Bacterial Coding Warp Rules
- Write all scripts as single-file, self-contained utilities.
- Each shell command, alias, or script should run independently, require minimal environment assumptions, and document any requirements inline.
- Avoid chaining more than 2-3 commands; break larger flows into discrete scripts.
- Make every snippet easy to copy-paste into another shell session, with no setup.
- Prefer POSIX-compliant, portable syntax unless strictly necessary.
```

### **B. For Cursor (IDE, AI-Powered)**

```
# Bacterial Coding Cursor Prompts
- Every function/class/block must be able to run or test alone—no hidden imports or context.
- When writing code: default to 'exportable snippets.'
- Structure folders so each file can be imported or copied anywhere with minimal friction.
- Show an example of using the function/class at the bottom of each file.
- Annotate dependencies (even local ones) at the top—never assume project-wide globals.
```

### **C. For GitHub Copilot (Prompting/Instructions in repo or .copilot)**

```
# Copilot Coding Style Guide (Bacterial Mode)
- Generate small, single-purpose functions and utilities
- Write code that works stand-alone: no magic context, no shared state unless declared in the same snippet
- Avoid coupled, multi-step chains unless wrapping them in a function/class
- Show minimal usage inline or as tests/examples
- Each suggestion should be gist-worthy
```

### **D. For Jules, Codex, Cursor Background Agents**

```
# Background Agent Coding DNA
- When suggesting code, prefer the smallest self-contained implementation
- Avoid referencing surrounding files unless strictly necessary
- If multiple snippets are needed, return each as an isolated cell or block
- Annotate all requirements and assumptions with comments in the snippet
- Always ask: could this be copy-pasted and work immediately?
```

### **E. For GitHub README (Community/Contributor-Facing)**

```
## Coding Style: Bacterial DNA

- Write code in small, reusable “genes” (functions, files, utilities)
- Each snippet should be trivially copy-pasteable, and runnable/testable in isolation
- Prefer minimal, explicit imports—avoid relying on context from elsewhere in the repo
- Make it easy for contributors to grab, remix, and transfer code between projects (“horizontal gene transfer”)
- Large features? Integrate using a modular “monorepo backbone,” but maximize the % of code that fits the “bacterial” style for open source vibrance and reuse

> If your code could become a GitHub Gist, you’re doing it right!
```

---

## 3. **Combined/Unified Ruleset (For All Contexts)**

* **Small, Modular, Self-Contained, Copy-Pasteable**
* **Trivial to Test/Run Independently**
* **Minimal/Explicit Dependencies**
* **Optimized for Remixing**
* **Monorepo only for complex, coupled features**
* **Encourage community contribution and "horizontal gene transfer"**
