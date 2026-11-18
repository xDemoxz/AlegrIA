module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: { react: { version: 'detect' } },
  plugins: ['react-refresh'],
  ignorePatterns: ['dist', 'node_modules', 'playwright-report', 'test-results'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    // Este repo exporta constantes junto a componentes; la regla no aporta.
    'react-refresh/only-export-components': 'off',
  },
  overrides: [
    { files: ['**/*.test.js', '**/*.test.jsx', 'e2e/**/*.js'], env: { node: true } },
  ],
};
