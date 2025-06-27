/**
 * Function composition utilities for creating pipelines and combining functions.
 * Provides pipe (left-to-right) and compose (right-to-left) function composition.
 */

/**
 * Identity function - returns its input unchanged
 * @param x - Input value
 * @returns The same input value
 */
export const identity = <T>(x: T): T => x;

/**
 * Constant function - returns a function that always returns the same value
 * @param value - Value to always return
 * @returns Function that always returns the value
 */
export const constant =
  <T>(value: T) =>
  (): T =>
    value;

/**
 * Pipe function - composes functions from left to right
 * Applies functions in order: f1(f2(f3(...args)))
 */

// Pipe overloads for different arities
export function pipe<A>(value: A): A;
export function pipe<A, B>(value: A, fn1: (a: A) => B): B;
export function pipe<A, B, C>(value: A, fn1: (a: A) => B, fn2: (b: B) => C): C;
export function pipe<A, B, C, D>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
): D;
export function pipe<A, B, C, D, E>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
): E;
export function pipe<A, B, C, D, E, F>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
): F;
export function pipe<A, B, C, D, E, F, G>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
): G;
export function pipe<A, B, C, D, E, F, G, H>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
): H;
export function pipe<A, B, C, D, E, F, G, H, I>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I,
): I;
export function pipe<A, B, C, D, E, F, G, H, I, J>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I,
  fn9: (i: I) => J,
): J;
export function pipe<A, B, C, D, E, F, G, H, I, J, K>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I,
  fn9: (i: I) => J,
  fn10: (j: J) => K,
): K;

// Implementation
export function pipe(value: any, ...fns: Function[]): any {
  return fns.reduce((acc, fn) => fn(acc), value);
}

/**
 * Compose function - composes functions from right to left
 * Applies functions in reverse order: f1(f2(f3(...args)))
 */

// Compose overloads for different arities
export function compose<A>(fn1: (a: A) => A): (a: A) => A;
export function compose<A, B>(fn1: (b: B) => A, fn2: (a: A) => B): (a: A) => A;
export function compose<A, B, C>(
  fn1: (c: C) => A,
  fn2: (b: B) => C,
  fn3: (a: A) => B,
): (a: A) => A;
export function compose<A, B, C, D>(
  fn1: (d: D) => A,
  fn2: (c: C) => D,
  fn3: (b: B) => C,
  fn4: (a: A) => B,
): (a: A) => A;
export function compose<A, B, C, D, E>(
  fn1: (e: E) => A,
  fn2: (d: D) => E,
  fn3: (c: C) => D,
  fn4: (b: B) => C,
  fn5: (a: A) => B,
): (a: A) => A;
export function compose<A, B, C, D, E, F>(
  fn1: (f: F) => A,
  fn2: (e: E) => F,
  fn3: (d: D) => E,
  fn4: (c: C) => D,
  fn5: (b: B) => C,
  fn6: (a: A) => B,
): (a: A) => A;
export function compose<A, B, C, D, E, F, G>(
  fn1: (g: G) => A,
  fn2: (f: F) => G,
  fn3: (e: E) => F,
  fn4: (d: D) => E,
  fn5: (c: C) => D,
  fn6: (b: B) => C,
  fn7: (a: A) => B,
): (a: A) => A;
export function compose<A, B, C, D, E, F, G, H>(
  fn1: (h: H) => A,
  fn2: (g: G) => H,
  fn3: (f: F) => G,
  fn4: (e: E) => F,
  fn5: (d: D) => E,
  fn6: (c: C) => D,
  fn7: (b: B) => C,
  fn8: (a: A) => B,
): (a: A) => A;
export function compose<A, B, C, D, E, F, G, H, I>(
  fn1: (i: I) => A,
  fn2: (h: H) => I,
  fn3: (g: G) => H,
  fn4: (f: F) => G,
  fn5: (e: E) => F,
  fn6: (d: D) => E,
  fn7: (c: C) => D,
  fn8: (b: B) => C,
  fn9: (a: A) => B,
): (a: A) => A;
export function compose<A, B, C, D, E, F, G, H, I, J>(
  fn1: (j: J) => A,
  fn2: (i: I) => J,
  fn3: (h: H) => I,
  fn4: (g: G) => H,
  fn5: (f: F) => G,
  fn6: (e: E) => F,
  fn7: (d: D) => E,
  fn8: (c: C) => D,
  fn9: (b: B) => C,
  fn10: (a: A) => B,
): (a: A) => A;

// Implementation
export function compose(...fns: Function[]): Function {
  return (value: any) => fns.reduceRight((acc, fn) => fn(acc), value);
}

/**
 * Flow function - alias for pipe that works with function composition
 * Creates a function that pipes its argument through the given functions
 */
export function flow<A, B>(fn1: (a: A) => B): (a: A) => B;
export function flow<A, B, C>(fn1: (a: A) => B, fn2: (b: B) => C): (a: A) => C;
export function flow<A, B, C, D>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
): (a: A) => D;
export function flow<A, B, C, D, E>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
): (a: A) => E;
export function flow<A, B, C, D, E, F>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
): (a: A) => F;
export function flow<A, B, C, D, E, F, G>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
): (a: A) => G;
export function flow<A, B, C, D, E, F, G, H>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
): (a: A) => H;
export function flow<A, B, C, D, E, F, G, H, I>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I,
): (a: A) => I;
export function flow<A, B, C, D, E, F, G, H, I, J>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I,
  fn9: (i: I) => J,
): (a: A) => J;
export function flow<A, B, C, D, E, F, G, H, I, J, K>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I,
  fn9: (i: I) => J,
  fn10: (j: J) => K,
): (a: A) => K;

// Implementation
export function flow(...fns: Function[]): Function {
  return (value: any) => fns.reduce((acc, fn) => fn(acc), value);
}

/**
 * Utility functions for function composition
 */
export const ComposeUtils = {
  /**
   * Creates a function that applies a predicate and branches to different functions
   * @param predicate - Condition to test
   * @param onTrue - Function to apply if predicate is true
   * @param onFalse - Function to apply if predicate is false
   * @returns Branching function
   */
  branch:
    <T, U>(
      predicate: (value: T) => boolean,
      onTrue: (value: T) => U,
      onFalse: (value: T) => U,
    ) =>
    (value: T): U => {
      return predicate(value) ? onTrue(value) : onFalse(value);
    },

  /**
   * Creates a function that applies different functions based on conditions
   * @param cases - Array of [predicate, function] pairs
   * @param defaultFn - Default function if no predicates match
   * @returns Function that applies the first matching case
   */
  cond:
    <T, U>(
      cases: Array<[(value: T) => boolean, (value: T) => U]>,
      defaultFn: (value: T) => U,
    ) =>
    (value: T): U => {
      for (const [predicate, fn] of cases) {
        if (predicate(value)) {
          return fn(value);
        }
      }
      return defaultFn(value);
    },

  /**
   * Creates a function that applies a transformation only if predicate is true
   * @param predicate - Condition to test
   * @param transform - Function to apply if predicate is true
   * @returns Function that conditionally transforms
   */
  when:
    <T>(predicate: (value: T) => boolean, transform: (value: T) => T) =>
    (value: T): T => {
      return predicate(value) ? transform(value) : value;
    },

  /**
   * Creates a function that applies a transformation only if predicate is false
   * @param predicate - Condition to test
   * @param transform - Function to apply if predicate is false
   * @returns Function that conditionally transforms
   */
  unless:
    <T>(predicate: (value: T) => boolean, transform: (value: T) => T) =>
    (value: T): T => {
      return predicate(value) ? value : transform(value);
    },

  /**
   * Creates a function that applies a side effect and returns the original value
   * @param sideEffect - Function to execute for side effects
   * @returns Function that applies side effect and returns original value
   */
  tap:
    <T>(sideEffect: (value: T) => void) =>
    (value: T): T => {
      sideEffect(value);
      return value;
    },

  /**
   * Creates a function that traces values through a pipeline for debugging
   * @param label - Optional label for the trace
   * @returns Function that logs the value and returns it unchanged
   */
  trace:
    <T>(label?: string) =>
    (value: T): T => {
      const message = label ? `${label}:` : "Trace:";
      console.log(message, value);
      return value;
    },

  /**
   * Memoizes a function to cache results based on arguments
   * @param fn - Function to memoize
   * @param keyFn - Optional function to generate cache key
   * @returns Memoized function
   */
  memoize: <T extends any[], U>(
    fn: (...args: T) => U,
    keyFn: (...args: T) => string = (...args) => JSON.stringify(args),
  ) => {
    const cache = new Map<string, U>();
    return (...args: T): U => {
      const key = keyFn(...args);
      if (cache.has(key)) {
        return cache.get(key)!;
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    };
  },

  /**
   * Creates a debounced version of a function
   * @param fn - Function to debounce
   * @param delay - Delay in milliseconds
   * @returns Debounced function
   */
  debounce: <T extends any[]>(fn: (...args: T) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout | null = null;
    return (...args: T): void => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  },

  /**
   * Creates a throttled version of a function
   * @param fn - Function to throttle
   * @param interval - Interval in milliseconds
   * @returns Throttled function
   */
  throttle: <T extends any[], U>(fn: (...args: T) => U, interval: number) => {
    let lastCall = 0;
    return (...args: T): U | undefined => {
      const now = Date.now();
      if (now - lastCall >= interval) {
        lastCall = now;
        return fn(...args);
      }
      return undefined;
    };
  },

  /**
   * Creates a function that retries on failure
   * @param fn - Function to retry
   * @param maxAttempts - Maximum number of attempts
   * @param delay - Delay between attempts in milliseconds
   * @returns Function that retries on failure
   */
  retry:
    <T extends any[], U>(
      fn: (...args: T) => U,
      maxAttempts: number,
      delay: number = 0,
    ) =>
    (...args: T): U => {
      let lastError: Error;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          return fn(...args);
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));

          if (attempt < maxAttempts - 1 && delay > 0) {
            // Synchronous delay
            const start = Date.now();
            while (Date.now() - start < delay) {
              // Busy wait
            }
          }
        }
      }

      throw lastError!;
    },
};
