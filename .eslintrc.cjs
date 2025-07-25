module.exports = {
  extends: [
    'eslint:recommended',
    '@astrojs/eslint-config',
    '@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true
  }
};
