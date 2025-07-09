module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: false,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:promise/recommended',
    'plugin:jsonc/recommended-with-json',
    'prettier',
  ],
  plugins: ['import', 'promise', 'jsonc'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.mjs', '.cjs'],
      },
    },
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'import/no-unresolved': 'off',
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', ['sibling', 'parent'], 'index'],
        'newlines-between': 'always',
      },
    ],
    'jsonc/array-bracket-spacing': ['error', 'never'],
  },
  overrides: [
    {
      files: ['**/*.json'],
      parser: 'jsonc-eslint-parser',
    },
  ],
};