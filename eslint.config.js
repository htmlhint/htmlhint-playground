import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

const strictRules = {
  // Possible problems
  'array-callback-return': 'error',
  'no-await-in-loop': 'error',
  'no-constructor-return': 'error',
  'no-duplicate-imports': 'error',
  'no-promise-executor-return': 'error',
  'no-self-compare': 'error',
  'no-template-curly-in-string': 'error',
  'no-unmodified-loop-condition': 'error',
  'no-unreachable-loop': 'error',
  'no-use-before-define': ['error', { functions: false }],
  'no-unused-vars': ['error', { args: 'after-used', caughtErrors: 'all' }],

  // Suggestions
  curly: ['error', 'all'],
  'default-case-last': 'error',
  'dot-notation': 'error',
  eqeqeq: ['error', 'always'],
  'no-alert': 'error',
  'no-console': ['error', { allow: ['warn', 'error'] }],
  'no-else-return': ['error', { allowElseIf: false }],
  'no-eval': 'error',
  'no-implicit-coercion': 'error',
  'no-implied-eval': 'error',
  'no-lonely-if': 'error',
  'no-new-func': 'error',
  'no-new-wrappers': 'error',
  'no-param-reassign': 'error',
  'no-return-assign': 'error',
  'no-shadow': 'error',
  'no-throw-literal': 'error',
  'no-unneeded-ternary': 'error',
  'no-unused-expressions': 'error',
  'no-useless-computed-key': 'error',
  'no-useless-concat': 'error',
  'no-useless-rename': 'error',
  'no-useless-return': 'error',
  'no-var': 'error',
  'object-shorthand': 'error',
  'prefer-arrow-callback': 'error',
  'prefer-const': 'error',
  'prefer-object-spread': 'error',
  'prefer-rest-params': 'error',
  'prefer-spread': 'error',
  'prefer-template': 'error',
  radix: 'error',
  yoda: 'error'
};

export default [
  {
    ignores: ['**/*.d.ts', '.astro/**', 'dist/**']
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error'
    }
  },
  {
    ...js.configs.recommended,
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      ...strictRules
    }
  },
  {
    files: ['**/*.{ts,mts,cts}'],
    ignores: ['**/*.d.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs.strict.rules,
      ...strictRules,
      // Replaced by TypeScript-aware equivalents
      'no-unused-vars': 'off',
      'no-shadow': 'off',
      'no-use-before-define': 'off',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-use-before-define': ['error', { functions: false }]
    }
  },
  ...astro.configs.recommended,
  {
    files: ['**/*.astro', '**/*.astro/*.{js,ts}'],
    rules: strictRules
  }
];
