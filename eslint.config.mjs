/* eslint-disable sort-keys */
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';

export default [
  { ignores: ['eslint.config.mjs', 'build/**', 'dist/**', 'scripts/**', 'src/audio/*.mp3'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  // The strictest typescript-eslint presets, with type information.
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: { project: './tsconfig.json', tsconfigRootDir: import.meta.dirname }
    }
  },
  pluginReact.configs.flat.recommended,
  {
    plugins: { 'react-hooks': pluginReactHooks },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'error'
    }
  },
  {
    rules: {
      // JS rules
      'comma-dangle': ['error', 'never'],
      'comma-spacing': ['error', { after: true, before: false }],
      eqeqeq: ['error', 'always'],
      'key-spacing': ['error', { afterColon: true }],
      'keyword-spacing': 'error',
      'no-console': 'error',
      'object-curly-spacing': ['error', 'always'],
      'sort-keys': ['error', 'asc', { caseSensitive: true, minKeys: 2, natural: true }],
      'space-before-blocks': 'error',

      // TypeScript rules
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      // Truthiness checks only on booleans and objects: `if (count)` hides the 0 case.
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        { allowNullableObject: true, allowNumber: false, allowString: false }
      ],
      // Off on purpose (readability), as in the library: explicit types are house style,
      // `() => doThing()` shorthands are clearer than braces.
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      // Conflicts with no-non-null-assertion (it rewrites casts into `!`).
      '@typescript-eslint/non-nullable-type-assertion-style': 'off',

      // React rules
      'react/display-name': 'error',
      'react/jsx-fragments': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-sort-props': 'error',
      'react/no-unescaped-entities': 'error',
      // TypeScript checks props; prop-types would duplicate it.
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/self-closing-comp': 'error'
    }
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', 'src/setupTests.ts'],
    languageOptions: { globals: globals.jest },
    rules: { '@typescript-eslint/unbound-method': 'off' }
  },
  {
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
];
