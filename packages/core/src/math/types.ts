/**
 * Local type definitions for mathematical operations
 *
 * This module provides local type definitions to ensure the math module
 * can be compiled independently without cross-project dependencies.
 *
 * @packageDocumentation
 */

/**
 * Result type for explicit error handling
 * Represents a computation that can either succeed (Ok) or fail (Err).
 */
export abstract class Result<T, E = Error> {
  /**
   * Creates an Ok Result containing the given value
   */
  static ok<T, E = Error>(value: T): Result<T, E> {
    return new Ok(value);
  }

  /**
   * Creates an Err Result containing the given error
   */
  static err<T, E = Error>(error: E): Result<T, E> {
    return new Err(error);
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
   */
  abstract map<U>(fn: (value: T) => U): Result<U, E>;

  /**
   * Maps a function over the Err value, leaving Ok unchanged
   */
  abstract mapErr<F>(fn: (error: E) => F): Result<T, F>;

  /**
   * Flat maps a function over the Ok value, allowing for chaining operations
   */
  abstract flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>;

  /**
   * Returns the Ok value or the provided default if Err
   */
  abstract getOrElse(defaultValue: T): T;

  /**
   * Returns the Ok value or throws the Err value
   */
  abstract unwrap(): T;

  /**
   * Returns the Ok value or throws with a custom message
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

  getOrElse(_defaultValue: T): T {
    return this.val;
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

  getOrElse(defaultValue: T): T {
    return defaultValue;
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
