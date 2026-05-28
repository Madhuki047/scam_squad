// ESM-friendly Jest config. The test script sets
// NODE_OPTIONS=--experimental-vm-modules so `import` works in tests.
export default {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  globalSetup: "<rootDir>/tests/globalSetup.js",
  globalTeardown: "<rootDir>/tests/globalTeardown.js",
  transform: {},
  testTimeout: 60000,
  verbose: true,
};
