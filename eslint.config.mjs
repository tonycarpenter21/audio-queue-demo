import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';

export default [
  { 
    files: ['**/*.{ts,jsx,tsx}'],
    ignores: ['eslint.config.mjs', '**/build/**', '**/dist/**', './src/audio']
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    rules: {
      // JS rules
      'comma-dangle': ['warn', 'never'],
      'comma-spacing': ['error', { before: false, after: true }],
      'key-spacing': ['error', { afterColon: true }],
      'keyword-spacing': 'error',
      'no-console': 'warn',
      'object-curly-spacing': ['error', 'always'],
      'sort-keys': ['warn', 'asc', { caseSensitive: true, natural: true, minKeys: 2 }],
      'space-before-blocks': 'warn',

      // Typescript rules
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-inferrable-types': 'off',

      // React rules
      'react/display-name': 'warn',
      'react/jsx-fragments': 'warn',
      'react/jsx-no-undef': 'warn',
      'react/jsx-sort-props': 'warn',
      'react/jsx-uses-react': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react/prop-types': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/self-closing-comp': 'warn'
    }
  },
  {
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
];