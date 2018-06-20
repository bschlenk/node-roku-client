module.exports = {
  setupTestFrameworkScriptFile: '<rootDir>/lib/setupTests.js',
  collectCoverageFrom: [
    'lib/**/*.js',
    '!lib/index.js',
    '!lib/keys.js',
  ],
  coverageThreshold: {
    global: {
      functions: 80,
      lines: 80,
    },
  },
};
