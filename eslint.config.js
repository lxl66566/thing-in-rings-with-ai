// Flat ESLint config.
//
// Layers (last wins):
//   1. eslint recommended + import-x             — generic bugs, import hygiene
//   2. typescript-eslint strict/stylistic (type-aware) — needs type info, catches
//      floating promises, unsafe `any` leakage, etc.
//   3. perfectionist + regexp                    — opinionated consistency
//   4. eslint-plugin-solid (flat/typescript)     — SolidJS reactivity pitfalls
//   5. eslint-config-prettier                    — disable formatting conflicts
//
// Fast rule-only feedback also runs via oxlint (see .oxlintrc.json); ESLint is
// kept for the type-aware and Solid-specific rules oxlint can't do yet.
import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import prettier from 'eslint-config-prettier';
import { importX } from 'eslint-plugin-import-x';
import { configs as perfectionist } from 'eslint-plugin-perfectionist';
import { configs as regexpConfigs } from 'eslint-plugin-regexp';
import solidPlugin from 'eslint-plugin-solid';
import tseslint from 'typescript-eslint';

// The package ships a CJS default export; normalise it.
const solid = solidPlugin.default ?? solidPlugin;

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
  js.configs.recommended,
  importX.flatConfigs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  perfectionist['recommended-natural'],
  regexpConfigs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { solid },
    rules: {
      // SolidJS reactivity & pattern rules — the main reason we lint.
      ...solid.configs['flat/typescript'].rules,
    },
  },
  {
    files: ['src/**/*.{test,spec}.{ts,tsx}'],
    ...vitest.configs.recommended,
    rules: {
      ...vitest.configs.recommended.rules,
      // Tests legitimately read signals outside tracked scopes.
      'solid/reactivity': 'off',
    },
  },
  // Plain JS files (like this config) have no project type info.
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    rules: {
      // --- low-value typescript-eslint rules ---
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-for-in-array': 'off',
      '@typescript-eslint/no-invalid-void-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/require-await': 'off',
      'import-x/no-named-as-default': 'off',
      'import-x/no-unresolved': 'off',
      'no-unassigned-vars': 'off',
      'no-undef': 'off',
      'no-underscore-dangle': 'off',
      // --- rules from plugins not loaded in ESLint ---
      'oxc/no-map-spread': 'off',
      // Import ordering is owned by oxfmt's built-in sortImports (run via
      // `oxfmt`, which executes *after* `eslint --fix` in lint-staged).
      // Perfectionist's sort-imports rules can conflict, so disable the
      // redundant ESLint rules; all other Perfectionist rules
      // (sort-objects, sort-object-types, …) stay.
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-named-imports': 'off',
      'prefer-const': 'error',
      'promise/always-return': 'off',
    },
  },
  prettier,
);
