const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  {
    ignores: [
      '.expo/**',
      '.agents/**',
      '.codex/**',
      'coverage/**',
      'dist/**',
      'node_modules/**',
      'package-lock.json',
    ],
  },
  ...expoConfig,
];
