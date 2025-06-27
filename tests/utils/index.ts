/**
 * Centralized export for all test utilities
 */

export * from "./jest-setup";
export * from "./result-helpers";
export * from "./data-generators";
export * from "./property-testing";

// Re-export commonly used items
export { ResultTestHelpers as ResultHelpers } from "./result-helpers";
export { DataGenerators as Generators } from "./data-generators";
export { PropertyTesting as PropertyTests } from "./property-testing";

/**
 * Common test utilities bundle
 */
export const TestUtils = {
  Result: require("./result-helpers").ResultTestHelpers,
  Data: require("./data-generators").DataGenerators,
  Property: require("./property-testing").PropertyTesting,
};

/**
 * Test configuration constants
 */
export const TEST_CONFIG = {
  // Property test configuration
  PROPERTY_RUNS: process.env.CI ? 1000 : 100,
  PROPERTY_TIMEOUT: 5000,

  // Performance test thresholds
  MAX_OPERATION_TIME: 1000,
  MAX_LARGE_OPERATION_TIME: 5000,

  // Coverage thresholds
  MIN_COVERAGE: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },

  // Test data sizes
  SMALL_DATASET: 10,
  MEDIUM_DATASET: 100,
  LARGE_DATASET: 1000,
  STRESS_DATASET: 10000,
};
