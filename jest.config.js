module.exports = {
  setupFiles: [
    "./setup/jest-setup.js",
  ],
  collectCoverageFrom: [
    "lib/**/*.js",
    "!lib/index.js",
    "!lib/keys.js",
  ],
  coverageThreshold: {
    global: {
      functions: 80,
      lines: 80,
    },
  },
};
