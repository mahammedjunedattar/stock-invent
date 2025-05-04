import reactRecommended from 'eslint-plugin-react/configs/recommended';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import hooks from 'eslint-plugin-react-hooks';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    plugins: {
      '@next/next': next,
      'jsx-a11y': jsxA11y,
      'react-hooks': hooks,
    },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,
      ...reactRecommended.rules,
      ...hooks.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'jsx-a11y/alt-text': 'error',
    },
  },
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
  },
  {
    ignores: [
      'node_modules/',
      '.next/',
      'dist/',
      'build/',
      'public/',
      '*.config.js'
    ],
  },
];