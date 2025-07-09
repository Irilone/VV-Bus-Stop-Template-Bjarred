#!/usr/bin/env bash
# setup-linters.sh  –  initialise package.json (if missing) and install linter stacks

set -e

# 1. Initialise package.json if this is NOT yet a Node project
[ -f package.json ] || npm init -y

# 2. ESLint + Prettier stack
npm install --save-dev \
  eslint@^8 \
  eslint-plugin-import@^2 \
  eslint-plugin-promise@^6 \
  eslint-plugin-jsonc@^2 \
  prettier@^3

# 3. Stylelint stack (v15 – stable)
npm install --save-dev \
  stylelint@^15 \
  stylelint-config-standard@^34 \
  stylelint-config-standard-scss@^9 \
  stylelint-order@^6 \
  postcss-scss@^4

# 4. HTMLHint CLI
npm install --save-dev htmlhint@^1

# 5. Convenience npm scripts
npm pkg set "scripts.lint:css"="stylelint \"src/**/*.css\""
npm pkg set "scripts.lint:js"="eslint \"src/**/*.js\""
npm pkg set "scripts.lint:html"="htmlhint \"src/**/*.html\""
npm pkg set "scripts.lint"="npm run lint:css && npm run lint:js && npm run lint:html"

echo -e \"\\n✅  Linter tooling installed.  Run:  npm run lint\\n\"