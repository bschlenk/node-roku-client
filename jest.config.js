module.exports = {
  preset: 'ts-jest',
  collectCoverage: true,
  collectCoverageFrom: [
    'lib/**/*.ts',
    '!lib/index.ts',
    '!lib/keys.ts',
    '!**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      functions: 80,
      lines: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/lib/setupTests.js'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
};
