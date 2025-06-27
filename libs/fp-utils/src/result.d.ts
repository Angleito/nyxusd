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
export declare abstract class Result<T, E = Error> {
  /**
   * Creates an Ok Result containing the given value
   * @param value - The value to wrap in an Ok
   * @returns An Ok Result
   */
  static ok<T, E = Error>(value: T): Result<T, E>;
  /**
   * Creates an Err Result containing the given error
   * @param error - The error to wrap in an Err
   * @returns An Err Result
   */
  static err<T, E = Error>(error: E): Result<T, E>;
  /**
   * Executes a computation that may throw and wraps the result in a Result
   * @param computation - Function that may throw an error
   * @param errorMapper - Optional function to transform caught errors
   * @returns Result containing the result or error
   */
  static tryCatch<T, E = Error>(
    computation: () => T,
    errorMapper?: (error: unknown) => E,
  ): Result<T, E>;
  /**
   * Executes an async computation that may throw and wraps the result in a Result
   * @param computation - Async function that may throw an error
   * @param errorMapper - Optional function to transform caught errors
   * @returns Promise of Result containing the result or error
   */
  static tryCatchAsync<T, E = Error>(
    computation: () => Promise<T>,
    errorMapper?: (error: unknown) => E,
  ): Promise<Result<T, E>>;
  /**
   * Creates a Result from a Promise
   * @param promise - Promise to convert
   * @param errorMapper - Optional function to transform rejection reasons
   * @returns Promise of Result
   */
  static fromPromise<T, E = Error>(
    promise: Promise<T>,
    errorMapper?: (error: unknown) => E,
  ): Promise<Result<T, E>>;
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
  chain<U>(fn: (value: T) => Result<U, E>): Result<U, E>;
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
export declare class Ok<T, E = Error> extends Result<T, E> {
  private readonly val;
  constructor(val: T);
  isOk(): this is Ok<T, E>;
  isErr(): this is Err<T, E>;
  map<U>(fn: (value: T) => U): Result<U, E>;
  mapErr<F>(_fn: (error: E) => F): Result<T, F>;
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>;
  flatMapErr<F>(_fn: (error: E) => Result<T, F>): Result<T, F>;
  fold<U>(_onErr: (error: E) => U, onOk: (value: T) => U): U;
  getOrElse(_defaultValue: T): T;
  getOrElseGet(_fn: (error: E) => T): T;
  orElse(_alternative: Result<T, E>): Result<T, E>;
  orElseGet(_fn: (error: E) => Result<T, E>): Result<T, E>;
  ap<U>(resultFn: Result<(value: T) => U, E>): Result<U, E>;
  tap(fn: (value: T) => void): Result<T, E>;
  tapErr(_fn: (error: E) => void): Result<T, E>;
  toString(): string;
  toPromise(): Promise<T>;
  toArray(): T[];
  unwrap(): T;
  expect(_message: string): T;
  /**
   * Gets the Ok value (unsafe - only use when you know it's an Ok)
   */
  get value(): T;
}
/**
 * Err variant of Result representing a failed computation
 */
export declare class Err<T, E = Error> extends Result<T, E> {
  private readonly error;
  constructor(error: E);
  isOk(): this is Ok<T, E>;
  isErr(): this is Err<T, E>;
  map<U>(_fn: (value: T) => U): Result<U, E>;
  mapErr<F>(fn: (error: E) => F): Result<T, F>;
  flatMap<U>(_fn: (value: T) => Result<U, E>): Result<U, E>;
  flatMapErr<F>(fn: (error: E) => Result<T, F>): Result<T, F>;
  fold<U>(onErr: (error: E) => U, _onOk: (value: T) => U): U;
  getOrElse(defaultValue: T): T;
  getOrElseGet(fn: (error: E) => T): T;
  orElse(alternative: Result<T, E>): Result<T, E>;
  orElseGet(fn: (error: E) => Result<T, E>): Result<T, E>;
  ap<U>(_resultFn: Result<(value: T) => U, E>): Result<U, E>;
  tap(_fn: (value: T) => void): Result<T, E>;
  tapErr(fn: (error: E) => void): Result<T, E>;
  toString(): string;
  toPromise(): Promise<T>;
  toArray(): T[];
  unwrap(): T;
  expect(message: string): T;
  /**
   * Gets the Err value (unsafe - only use when you know it's an Err)
   */
  get value(): E;
}
/**
 * Utility functions for working with Result
 */
export declare const ResultUtils: {
  /**
   * Sequences an array of Results into a Result of array
   * @param results - Array of Results
   * @returns Result containing array of all Ok values or first Err
   */
  sequence<T, E>(results: Result<T, E>[]): Result<T[], E>;
  /**
   * Traverses an array with a function that returns Results
   * @param items - Array of items to traverse
   * @param fn - Function that returns Result
   * @returns Result containing array of all success values or first error
   */
  traverse<A, T, E>(items: A[], fn: (item: A) => Result<T, E>): Result<T[], E>;
  /**
   * Lifts a function to work with Result values
   * @param fn - Function to lift
   * @returns Function that works with Result values
   */
  lift<A, B>(fn: (a: A) => B): <E>(result: Result<A, E>) => Result<B, E>;
  /**
   * Lifts a binary function to work with Result values
   * @param fn - Binary function to lift
   * @returns Function that works with Result values
   */
  lift2<A, B, C>(
    fn: (a: A, b: B) => C,
  ): <E>(resultA: Result<A, E>, resultB: Result<B, E>) => Result<C, E>;
  /**
   * Partitions an array of Results into errors and successes
   * @param results - Array of Results
   * @returns Tuple of [errors, successes]
   */
  partition<T, E>(results: Result<T, E>[]): [E[], T[]];
  /**
   * Filters an array of Results to only Ok values
   * @param results - Array of Results
   * @returns Array of values from Ok Results
   */
  catOks<T, E>(results: Result<T, E>[]): T[];
  /**
   * Filters an array of Results to only Err values
   * @param results - Array of Results
   * @returns Array of errors from Err Results
   */
  catErrs<T, E>(results: Result<T, E>[]): E[];
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
  >;
};
//# sourceMappingURL=result.d.ts.map
