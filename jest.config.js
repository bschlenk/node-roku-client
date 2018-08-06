module.exports = {
  testEnvironment: 'node',
  setupTestFrameworkScriptFile: '<rootDir>/lib/setupTests.js',
  moduleFileExtensions: [
    'js',
    'ts',
    'json',
    'node'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testRegex: '/__tests__/.*\\.test\\.(ts)$',
  collectCoverageFrom: [
    'lib/**/*.ts',
    '!lib/index.js',
    '!lib/keys.js',
    '!**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      functions: 80,
      lines: 80,
    },
  },
};
