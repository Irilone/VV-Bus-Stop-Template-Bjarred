#!/usr/bin/env bash
# tools/setup-and-lint.sh
# 1  Initialise node project (if needed)
[ -f package.json ] || npm init -y

# 2  Install ESLint + Prettier stack
npm i -D eslint@^8 eslint-plugin-import@^2 eslint-plugin-promise@^6 \
         eslint-plugin-jsonc@^2 prettier@^3

# 3  Install Stylelint 15 LTS + addons (stable path)
npm i -D stylelint@^15 stylelint-config-standard@^34 \
         stylelint-config-standard-scss@^9 \
         stylelint-order@^6 postcss-scss@^4

# 4  Install HTMLHint
npm i -D htmlhint@^1

# 5  Wire handy npm scripts (overwrites if they exist)
npm pkg set "scripts.lint:css"="stylelint --fix \"src/**/*.css\""
npm pkg set "scripts.lint:js"="eslint --fix \"src/**/*.js\""
npm pkg set "scripts.lint:html"="htmlhint \"src/**/*.html\""
npm pkg set "scripts.lint"="npm run lint:css && npm run lint:js && npm run lint:html"

echo "✅  Linters & scripts installed.  Running first full lint…"

# 6  Run the linters once
npm run lint