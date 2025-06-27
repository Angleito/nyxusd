/**
 * Result type implementation for explicit error handling.
 * Represents a computation that can either succeed (Ok) or fail (Err).
 * Similar to Either but specifically designed for error handling scenarios.
 *
 * The Result type satisfies the monad laws:
 * - Left identity: Result.ok(a).flatMap(f) === f(a)
 * - Right identity: m.flatMap(Result.ok) === m
 * - Associativity: m.flatMap(f).flatMap(g) === m.flatMap(x => f(x).flatMap(g))
 */

/**
 * Abstract base class for Result type
 */
export abstract class Result<T, E = Error> {
  /**
   * Creates an Ok Result containing the given value
   * @param value - The value to wrap in an Ok
   * @returns An Ok Result
   */
  static ok<T, E = Error>(value: T): Result<T, E> {
    return new Ok(value);
  }

  /**
   * Creates an Err Result containing the given error
   * @param error - The error to wrap in an Err
   * @returns An Err Result
   */
  static err<T, E = Error>(error: E): Result<T, E> {
    return new Err(error);
  }

  /**
   * Executes a computation that may throw and wraps the result in a Result
   * @param computation - Function that may throw an error
   * @param errorMapper - Optional function to transform caught errors
   * @returns Result containing the result or error
   */
  static tryCatch<T, E = Error>(
    computation: () => T,
    errorMapper: (error: unknown) => E = (e) => e as E,
  ): Result<T, E> {
    try {
      return Result.ok(computation());
    } catch (error) {
      return Result.err(errorMapper(error));
    }
  }

  /**
   * Executes an async computation that may throw and wraps the result in a Result
   * @param computation - Async function that may throw an error
   * @param errorMapper - Optional function to transform caught errors
   * @returns Promise of Result containing the result or error
   */
  static async tryCatchAsync<T, E = Error>(
    computation: () => Promise<T>,
    errorMapper: (error: unknown) => E = (e) => e as E,
  ): Promise<Result<T, E>> {
    try {
      const value = await computation();
      return Result.ok(value);
    } catch (error) {
      return Result.err(errorMapper(error));
    }
  }

  /**
   * Creates a Result from a Promise
   * @param promise - Promise to convert
   * @param errorMapper - Optional function to transform rejection reasons
   * @returns Promise of Result
   */
  static fromPromise<T, E = Error>(
    promise: Promise<T>,
    errorMapper: (error: unknown) => E = (e) => e as E,
  ): Promise<Result<T, E>> {
    return promise
      .then((value) => Result.ok<T, E>(value))
      .catch((error) => Result.err<T, E>(errorMapper(error)));
  }

  /**
   * Checks if this Result is an Ok
   */
  abstract isOk(): this is Ok<T, E>;

  /**
   * Checks if this Result is an Err
   */
  abstract isErr(): this is Err<T, E>;

  /**
   * Maps a function over the Ok value, leaving Err unchanged
   * @param fn - Function to apply to Ok value
   * @returns New Result with transformed Ok value or unchanged Err
   */
  abstract map<U>(fn: (value: T) => U): Result<U, E>;

  /**
   * Maps a function over the Err value, leaving Ok unchanged
   * @param fn - Function to apply to Err value
   * @returns New Result with transformed Err value or unchanged Ok
   */
  abstract mapErr<F>(fn: (error: E) => F): Result<T, F>;

  /**
   * Flat maps a function over the Ok value, allowing for chaining operations
   * @param fn - Function that returns a Result
   * @returns Flattened Result
   */
  abstract flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>;

  /**
   * Alias for flatMap (common in functional programming)
   */
  chain<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this.flatMap(fn);
  }

  /**
   * Flat maps a function over the Err value
   * @param fn - Function that returns a Result
   * @returns Flattened Result
   */
  abstract flatMapErr<F>(fn: (error: E) => Result<T, F>): Result<T, F>;

  /**
   * Folds the Result into a single value by applying one of two functions
   * @param onErr - Function to apply if Err
   * @param onOk - Function to apply if Ok
   * @returns Result of applying the appropriate function
   */
  abstract fold<U>(onErr: (error: E) => U, onOk: (value: T) => U): U;

  /**
   * Returns the Ok value or the provided default if Err
   * @param defaultValue - Default value to return if Err
   * @returns The Ok value or default
   */
  abstract getOrElse(defaultValue: T): T;

  /**
   * Returns the Ok value or the result of the provided function if Err
   * @param fn - Function to compute default value from Err
   * @returns The Ok value or computed default
   */
  abstract getOrElseGet(fn: (error: E) => T): T;

  /**
   * Returns this Result if Ok, otherwise returns the alternative
   * @param alternative - Alternative Result to return if this is Err
   * @returns This Result if Ok, otherwise alternative
   */
  abstract orElse(alternative: Result<T, E>): Result<T, E>;

  /**
   * Returns this Result if Ok, otherwise returns the result of the function
   * @param fn - Function that returns an alternative Result
   * @returns This Result if Ok, otherwise result of fn
   */
  abstract orElseGet(fn: (error: E) => Result<T, E>): Result<T, E>;

  /**
   * Applies a function wrapped in a Result to this Result's value
   * @param resultFn - Result containing a function
   * @returns Result with function applied
   */
  abstract ap<U>(resultFn: Result<(value: T) => U, E>): Result<U, E>;

  /**
   * Executes a side effect if Result is Ok
   * @param fn - Side effect function
   * @returns This Result unchanged
   */
  abstract tap(fn: (value: T) => void): Result<T, E>;

  /**
   * Executes a side effect if Result is Err
   * @param fn - Side effect function
   * @returns This Result unchanged
   */
  abstract tapErr(fn: (error: E) => void): Result<T, E>;

  /**
   * Converts Result to string representation
   */
  abstract toString(): string;

  /**
   * Converts Result to Promise
   * @returns Promise that resolves with Ok value or rejects with Err value
   */
  abstract toPromise(): Promise<T>;

  /**
   * Converts Result to array
   * @returns Array with one element if Ok, empty array if Err
   */
  abstract toArray(): T[];

  /**
   * Unwraps the Ok value or throws the Err value
   * @returns The Ok value
   * @throws The Err value if this is an Err
   */
  abstract unwrap(): T;

  /**
   * Unwraps the Ok value or throws with a custom message
   * @param message - Error message to throw if Err
   * @returns The Ok value
   * @throws Error with custom message if this is an Err
   */
  abstract expect(message: string): T;
}

/**
 * Ok variant of Result representing a successful computation
 */
export class Ok<T, E = Error> extends Result<T, E> {
  constructor(private readonly val: T) {
    super();
  }

  isOk(): this is Ok<T, E> {
    return true;
  }

  isErr(): this is Err<T, E> {
    return false;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return new Ok(fn(this.val));
  }

  mapErr<F>(_fn: (error: E) => F): Result<T, F> {
    return this as any;
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.val);
  }

  flatMapErr<F>(_fn: (error: E) => Result<T, F>): Result<T, F> {
    return this as any;
  }

  fold<U>(_onErr: (error: E) => U, onOk: (value: T) => U): U {
    return onOk(this.val);
  }

  getOrElse(_defaultValue: T): T {
    return this.val;
  }

  getOrElseGet(_fn: (error: E) => T): T {
    return this.val;
  }

  orElse(_alternative: Result<T, E>): Result<T, E> {
    return this;
  }

  orElseGet(_fn: (error: E) => Result<T, E>): Result<T, E> {
    return this;
  }

  ap<U>(resultFn: Result<(value: T) => U, E>): Result<U, E> {
    return resultFn.flatMap((fn) => this.map(fn));
  }

  tap(fn: (value: T) => void): Result<T, E> {
    fn(this.val);
    return this;
  }

  tapErr(_fn: (error: E) => void): Result<T, E> {
    return this;
  }

  toString(): string {
    return `Ok(${this.val})`;
  }

  toPromise(): Promise<T> {
    return Promise.resolve(this.val);
  }

  toArray(): T[] {
    return [this.val];
  }

  unwrap(): T {
    return this.val;
  }

  expect(_message: string): T {
    return this.val;
  }

  /**
   * Gets the Ok value (unsafe - only use when you know it's an Ok)
   */
  get value(): T {
    return this.val;
  }
}

/**
 * Err variant of Result representing a failed computation
 */
export class Err<T, E = Error> extends Result<T, E> {
  constructor(private readonly error: E) {
    super();
  }

  isOk(): this is Ok<T, E> {
    return false;
  }

  isErr(): this is Err<T, E> {
    return true;
  }

  map<U>(_fn: (value: T) => U): Result<U, E> {
    return this as any;
  }

  mapErr<F>(fn: (error: E) => F): Result<T, F> {
    return new Err(fn(this.error));
  }

  flatMap<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
    return this as any;
  }

  flatMapErr<F>(fn: (error: E) => Result<T, F>): Result<T, F> {
    return fn(this.error);
  }

  fold<U>(onErr: (error: E) => U, _onOk: (value: T) => U): U {
    return onErr(this.error);
  }

  getOrElse(defaultValue: T): T {
    return defaultValue;
  }

  getOrElseGet(fn: (error: E) => T): T {
    return fn(this.error);
  }

  orElse(alternative: Result<T, E>): Result<T, E> {
    return alternative;
  }

  orElseGet(fn: (error: E) => Result<T, E>): Result<T, E> {
    return fn(this.error);
  }

  ap<U>(_resultFn: Result<(value: T) => U, E>): Result<U, E> {
    return this as any;
  }

  tap(_fn: (value: T) => void): Result<T, E> {
    return this;
  }

  tapErr(fn: (error: E) => void): Result<T, E> {
    fn(this.error);
    return this;
  }

  toString(): string {
    return `Err(${this.error})`;
  }

  toPromise(): Promise<T> {
    return Promise.reject(this.error);
  }

  toArray(): T[] {
    return [];
  }

  unwrap(): T {
    throw this.error;
  }

  expect(message: string): T {
    if (this.error instanceof Error) {
      throw new Error(`${message}: ${this.error.message}`);
    }
    throw new Error(`${message}: ${this.error}`);
  }

  /**
   * Gets the Err value (unsafe - only use when you know it's an Err)
   */
  get value(): E {
    return this.error;
  }
}

/**
 * Utility functions for working with Result
 */
export const ResultUtils = {
  /**
   * Sequences an array of Results into a Result of array
   * @param results - Array of Results
   * @returns Result containing array of all Ok values or first Err
   */
  sequence<T, E>(results: Result<T, E>[]): Result<T[], E> {
    const values: T[] = [];
    for (const result of results) {
      if (result.isErr()) {
        return result as Result<T[], E>;
      }
      values.push((result as Ok<T, E>).value);
    }
    return Result.ok(values);
  },

  /**
   * Traverses an array with a function that returns Results
   * @param items - Array of items to traverse
   * @param fn - Function that returns Result
   * @returns Result containing array of all success values or first error
   */
  traverse<A, T, E>(items: A[], fn: (item: A) => Result<T, E>): Result<T[], E> {
    return this.sequence(items.map(fn));
  },

  /**
   * Lifts a function to work with Result values
   * @param fn - Function to lift
   * @returns Function that works with Result values
   */
  lift<A, B>(fn: (a: A) => B): <E>(result: Result<A, E>) => Result<B, E> {
    return <E>(result: Result<A, E>) => result.map(fn);
  },

  /**
   * Lifts a binary function to work with Result values
   * @param fn - Binary function to lift
   * @returns Function that works with Result values
   */
  lift2<A, B, C>(
    fn: (a: A, b: B) => C,
  ): <E>(resultA: Result<A, E>, resultB: Result<B, E>) => Result<C, E> {
    return <E>(resultA: Result<A, E>, resultB: Result<B, E>) =>
      resultA.flatMap((a) => resultB.map((b) => fn(a, b)));
  },

  /**
   * Partitions an array of Results into errors and successes
   * @param results - Array of Results
   * @returns Tuple of [errors, successes]
   */
  partition<T, E>(results: Result<T, E>[]): [E[], T[]] {
    const errors: E[] = [];
    const successes: T[] = [];

    for (const result of results) {
      if (result.isErr()) {
        errors.push((result as Err<T, E>).value);
      } else {
        successes.push((result as Ok<T, E>).value);
      }
    }

    return [errors, successes];
  },

  /**
   * Filters an array of Results to only Ok values
   * @param results - Array of Results
   * @returns Array of values from Ok Results
   */
  catOks<T, E>(results: Result<T, E>[]): T[] {
    return results
      .filter((result) => result.isOk())
      .map((result) => (result as Ok<T, E>).value);
  },

  /**
   * Filters an array of Results to only Err values
   * @param results - Array of Results
   * @returns Array of errors from Err Results
   */
  catErrs<T, E>(results: Result<T, E>[]): E[] {
    return results
      .filter((result) => result.isErr())
      .map((result) => (result as Err<T, E>).value);
  },

  /**
   * Combines multiple Results into a single Result containing a tuple
   * @param results - Tuple of Results to combine
   * @returns Result containing tuple of all Ok values or first Err
   */
  all<T extends readonly Result<any, any>[]>(
    ...results: T
  ): Result<
    { [K in keyof T]: T[K] extends Result<infer U, any> ? U : never },
    T[number] extends Result<any, infer E> ? E : never
  > {
    const values: any[] = [];
    for (const result of results) {
      if (result.isErr()) {
        return result as any;
      }
      values.push((result as Ok<any, any>).value);
    }
    return Result.ok(values as any);
  },
};
