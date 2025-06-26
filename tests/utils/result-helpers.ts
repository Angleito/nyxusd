/**
 * Test utilities for working with Result types
 */

import { Result } from '@nyxusd/functional-utils';

/**
 * Assertion helpers for Result types
 */
export const ResultAssertions = {
  /**
   * Assert that Result is Ok and return the value
   */
  expectOk<T, E>(result: Result<T, E>): T {
    if (result.isErr()) {
      throw new Error(`Expected Ok but got Err: ${(result as any).value}`);
    }
    return (result as any).value;
  },

  /**
   * Assert that Result is Err and return the error
   */
  expectErr<T, E>(result: Result<T, E>): E {
    if (result.isOk()) {
      throw new Error(`Expected Err but got Ok: ${(result as any).value}`);
    }
    return (result as any).value;
  },

  /**
   * Assert that Result is Ok with specific value
   */
  expectOkWith<T, E>(result: Result<T, E>, expected: T): void {
    const value = this.expectOk(result);
    expect(value).toEqual(expected);
  },

  /**
   * Assert that Result is Err with specific error
   */
  expectErrWith<T, E>(result: Result<T, E>, expected: E): void {
    const error = this.expectErr(result);
    expect(error).toEqual(expected);
  },

  /**
   * Assert that all Results in array are Ok
   */
  expectAllOk<T, E>(results: Result<T, E>[]): T[] {
    const values: T[] = [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.isErr()) {
        throw new Error(`Expected all Results to be Ok, but index ${i} was Err: ${(result as any).value}`);
      }
      values.push((result as any).value);
    }
    return values;
  },

  /**
   * Assert that at least one Result in array is Err
   */
  expectSomeErr<T, E>(results: Result<T, E>[]): boolean {
    return results.some(result => result.isErr());
  },

  /**
   * Assert that Result satisfies a predicate
   */
  expectResultSatisfies<T, E>(
    result: Result<T, E>,
    predicate: (value: T) => boolean,
    message?: string
  ): void {
    const value = this.expectOk(result);
    if (!predicate(value)) {
      throw new Error(message || `Result value does not satisfy predicate: ${value}`);
    }
  },
};

/**
 * Helper functions for testing Result transformations
 */
export const ResultTestUtils = {
  /**
   * Create a sequence of Results for testing
   */
  createResultSequence<T, E>(
    values: T[],
    errors: E[],
    pattern: ('ok' | 'err')[]
  ): Result<T, E>[] {
    const results: Result<T, E>[] = [];
    let valueIndex = 0;
    let errorIndex = 0;

    for (const type of pattern) {
      if (type === 'ok') {
        if (valueIndex >= values.length) {
          throw new Error('Not enough values for ok pattern');
        }
        results.push(Result.ok(values[valueIndex++]));
      } else {
        if (errorIndex >= errors.length) {
          throw new Error('Not enough errors for err pattern');
        }
        results.push(Result.err(errors[errorIndex++]));
      }
    }

    return results;
  },

  /**
   * Test Result monadic laws
   */
  testMonadicLaws: {
    /**
     * Left identity: Result.ok(a).flatMap(f) === f(a)
     */
    leftIdentity<T, U, E>(
      value: T,
      f: (value: T) => Result<U, E>
    ): boolean {
      const left = Result.ok(value).flatMap(f);
      const right = f(value);
      return left.toString() === right.toString();
    },

    /**
     * Right identity: m.flatMap(Result.ok) === m
     */
    rightIdentity<T, E>(m: Result<T, E>): boolean {
      const left = m.flatMap(Result.ok);
      return left.toString() === m.toString();
    },

    /**
     * Associativity: m.flatMap(f).flatMap(g) === m.flatMap(x => f(x).flatMap(g))
     */
    associativity<T, U, V, E>(
      m: Result<T, E>,
      f: (value: T) => Result<U, E>,
      g: (value: U) => Result<V, E>
    ): boolean {
      const left = m.flatMap(f).flatMap(g);
      const right = m.flatMap(x => f(x).flatMap(g));
      return left.toString() === right.toString();
    },
  },

  /**
   * Test that Result transformations preserve properties
   */
  testPropertyPreservation<T, U, E>(
    result: Result<T, E>,
    transform: (result: Result<T, E>) => Result<U, E>,
    property: (value: U) => boolean,
    description: string
  ): void {
    const transformed = transform(result);
    if (transformed.isOk()) {
      const value = (transformed as any).value;
      if (!property(value)) {
        throw new Error(`Property "${description}" not preserved after transformation. Value: ${value}`);
      }
    }
  },

  /**
   * Create mock Result for testing
   */
  mockResult: {
    ok<T>(value: T): jest.SpyInstance & Result<T, never> {
      const result = Result.ok(value);
      return jest.fn().mockReturnValue(result) as any;
    },

    err<E>(error: E): jest.SpyInstance & Result<never, E> {
      const result = Result.err(error);
      return jest.fn().mockReturnValue(result) as any;
    },

    okOnce<T>(value: T): jest.SpyInstance {
      return jest.fn().mockResolvedValueOnce(Result.ok(value));
    },

    errOnce<E>(error: E): jest.SpyInstance {
      return jest.fn().mockResolvedValueOnce(Result.err(error));
    },
  },
};

/**
 * Performance testing utilities for Result types
 */
export const ResultPerformanceUtils = {
  /**
   * Measure time for Result operations
   */
  async measureTime<T>(
    operation: () => Promise<T> | T,
    description: string
  ): Promise<{ result: T; timeMs: number }> {
    const start = performance.now();
    const result = await operation();
    const end = performance.now();
    const timeMs = end - start;
    
    console.log(`${description}: ${timeMs.toFixed(2)}ms`);
    return { result, timeMs };
  },

  /**
   * Test Result operation performance
   */
  async testResultPerformance<T, E>(
    results: Result<T, E>[],
    operation: (results: Result<T, E>[]) => Result<T[], E>,
    maxTimeMs: number,
    description: string
  ): Promise<void> {
    const { timeMs } = await this.measureTime(
      () => operation(results),
      description
    );

    if (timeMs > maxTimeMs) {
      throw new Error(`Performance test failed: ${description} took ${timeMs}ms, expected < ${maxTimeMs}ms`);
    }
  },

  /**
   * Benchmark Result operations
   */
  async benchmarkResultOperations<T, E>(
    results: Result<T, E>[],
    operations: Record<string, (results: Result<T, E>[]) => any>,
    iterations: number = 100
  ): Promise<Record<string, number>> {
    const benchmarks: Record<string, number> = {};

    for (const [name, operation] of Object.entries(operations)) {
      const times: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        operation(results);
        const end = performance.now();
        times.push(end - start);
      }

      benchmarks[name] = times.reduce((sum, time) => sum + time, 0) / times.length;
    }

    return benchmarks;
  },
};

/**
 * Export all utilities as a single object
 */
export const ResultTestHelpers = {
  ...ResultAssertions,
  ...ResultTestUtils,
  performance: ResultPerformanceUtils,
};

// Re-export for convenience
export { Result };