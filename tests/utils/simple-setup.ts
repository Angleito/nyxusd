/**
 * Simple Jest setup without external dependencies
 */

// Extend Jest matchers for basic mathematical properties
declare global {
  namespace jest {
    interface Matchers<R> {
      toSatisfyProperty(property: string): R;
    }
  }
}

// Custom matchers for mathematical properties
expect.extend({
  /**
   * Matches if value satisfies a mathematical property
   */
  toSatisfyProperty(received: any, property: string) {
    let pass = false;
    let message = "";

    try {
      switch (property) {
        case "positive":
          pass = typeof received === "number" && received > 0;
          message = `Expected ${received} to be positive`;
          break;
        case "non-negative":
          pass = typeof received === "number" && received >= 0;
          message = `Expected ${received} to be non-negative`;
          break;
        case "integer":
          pass = typeof received === "number" && Number.isInteger(received);
          message = `Expected ${received} to be an integer`;
          break;
        case "finite":
          pass = typeof received === "number" && Number.isFinite(received);
          message = `Expected ${received} to be finite`;
          break;
        case "valid-percentage":
          pass =
            typeof received === "number" && received >= 0 && received <= 100;
          message = `Expected ${received} to be a valid percentage (0-100)`;
          break;
        case "valid-basis-points":
          pass =
            typeof received === "number" &&
            Number.isInteger(received) &&
            received >= 0 &&
            received <= 10000;
          message = `Expected ${received} to be valid basis points (0-10000)`;
          break;
        default:
          throw new Error(`Unknown property: ${property}`);
      }
    } catch (error) {
      return {
        message: () => `Property check failed: ${error}`,
        pass: false,
      };
    }

    return {
      message: () => message,
      pass,
    };
  },
});

// Global test configuration
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
});

// Setup for property-based testing
export const PROPERTY_TEST_CONFIG = {
  // Number of test cases to generate for property tests
  numRuns: process.env["CI"] ? 1000 : 100,

  // Timeout for individual property test runs
  timeout: 5000,

  // Seed for reproducible test runs
  seed: process.env["FAST_CHECK_SEED"]
    ? parseInt(process.env["FAST_CHECK_SEED"], 10)
    : Date.now(),

  // Verbose output in CI
  verbose: Boolean(process.env["CI"]),
};
