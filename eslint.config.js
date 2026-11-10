import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist/**', 'dist-cms/**', 'node_modules/**', '.next/**', 'next-env.d.ts'] },
  // Root config files, test specs and scripts run in Node.js
  {
    files: ['*.config.js', 'tests/**/*.js', 'scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Keep these as warnings — existing codebase has many; not from refactor
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  // The navigation port's implementations export hooks next to Link by design (one import path for both builds).
  {
    files: ['src/next/navigation.jsx', 'src/app/navigation.jsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
];
