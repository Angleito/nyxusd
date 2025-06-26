/**
 * Jest global setup and configuration
 * This file is executed before all tests run
 */

import { Result } from '@nyxusd/functional-utils';

// Extend Jest matchers for Result types
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOk(): R;
      toBeErr(): R;
      toBeOkWith(expected: any): R;
      toBeErrWith(expected: any): R;
      toSatisfyProperty(property: string): R;
    }
  }
}

// Custom matchers for Result type
expect.extend({
  /**
   * Matches if Result is Ok
   */
  toBeOk(received: Result<any, any>) {
    const pass = received.isOk();
    return {
      message: () =>
        pass
          ? `Expected Result not to be Ok, but it was Ok(${received.isOk() ? (received as any).value : 'unknown'})`
          : `Expected Result to be Ok, but it was Err(${received.isErr() ? (received as any).value : 'unknown'})`,
      pass,
    };
  },

  /**
   * Matches if Result is Err
   */
  toBeErr(received: Result<any, any>) {
    const pass = received.isErr();
    return {
      message: () =>
        pass
          ? `Expected Result not to be Err, but it was Err(${received.isErr() ? (received as any).value : 'unknown'})`
          : `Expected Result to be Err, but it was Ok(${received.isOk() ? (received as any).value : 'unknown'})`,
      pass,
    };
  },

  /**
   * Matches if Result is Ok with specific value
   */
  toBeOkWith(received: Result<any, any>, expected: any) {
    if (!received.isOk()) {
      return {
        message: () => `Expected Result to be Ok with ${expected}, but it was Err(${(received as any).value})`,
        pass: false,
      };
    }
    
    const actualValue = (received as any).value;
    const pass = this.equals(actualValue, expected);
    
    return {
      message: () =>
        pass
          ? `Expected Result not to be Ok with ${this.utils.printExpected(expected)}, but it was`
          : `Expected Result to be Ok with ${this.utils.printExpected(expected)}, but got ${this.utils.printReceived(actualValue)}`,
      pass,
    };
  },

  /**
   * Matches if Result is Err with specific error
   */
  toBeErrWith(received: Result<any, any>, expected: any) {
    if (!received.isErr()) {
      return {
        message: () => `Expected Result to be Err with ${expected}, but it was Ok(${(received as any).value})`,
        pass: false,
      };
    }
    
    const actualError = (received as any).value;
    const pass = this.equals(actualError, expected);
    
    return {
      message: () =>
        pass
          ? `Expected Result not to be Err with ${this.utils.printExpected(expected)}, but it was`
          : `Expected Result to be Err with ${this.utils.printExpected(expected)}, but got ${this.utils.printReceived(actualError)}`,
      pass,
    };
  },

  /**
   * Matches if value satisfies a mathematical property
   */
  toSatisfyProperty(received: any, property: string) {
    let pass = false;
    let message = '';

    try {
      switch (property) {
        case 'positive':
          pass = typeof received === 'number' && received > 0;
          message = `Expected ${received} to be positive`;
          break;
        case 'non-negative':
          pass = typeof received === 'number' && received >= 0;
          message = `Expected ${received} to be non-negative`;
          break;
        case 'integer':
          pass = typeof received === 'number' && Number.isInteger(received);
          message = `Expected ${received} to be an integer`;
          break;
        case 'finite':
          pass = typeof received === 'number' && Number.isFinite(received);
          message = `Expected ${received} to be finite`;
          break;
        case 'valid-percentage':
          pass = typeof received === 'number' && received >= 0 && received <= 100;
          message = `Expected ${received} to be a valid percentage (0-100)`;
          break;
        case 'valid-basis-points':
          pass = typeof received === 'number' && Number.isInteger(received) && received >= 0 && received <= 10000;
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

// Global timeout for async operations
jest.setTimeout(30000);

// Mock console methods in tests to reduce noise
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Setup for property-based testing
export const PROPERTY_TEST_CONFIG = {
  // Number of test cases to generate for property tests
  numRuns: process.env.CI ? 1000 : 100,
  
  // Timeout for individual property test runs
  timeout: 5000,
  
  // Seed for reproducible test runs
  seed: process.env.FAST_CHECK_SEED ? parseInt(process.env.FAST_CHECK_SEED, 10) : Date.now(),
  
  // Verbose output in CI
  verbose: Boolean(process.env.CI),
};