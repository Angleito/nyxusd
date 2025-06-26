/**
 * @fileoverview Functional Programming Utilities Library
 * 
 * A comprehensive functional programming utilities library for TypeScript applications.
 * Provides core monads (Either, Option, Result, IO) and functional programming utilities
 * following functional programming best practices and the Hindley-Milner type system.
 * 
 * @author Midnight Protocol Team
 * @version 1.0.0
 * @license MIT
 */

// Core Monads
export {
  Either,
  Left,
  Right,
  EitherUtils
} from './either';

export {
  Option,
  Some,
  None,
  OptionUtils
} from './option';

export {
  Result,
  Ok,
  Err,
  ResultUtils
} from './result';

export {
  IO,
  IOUtils
} from './io';

// Function Composition Utilities
export {
  identity,
  constant,
  pipe,
  compose,
  flow,
  ComposeUtils
} from './compose';

// Currying and Partial Application
export {
  curry,
  curry2,
  curry3,
  curry4,
  curry5,
  uncurry,
  partial,
  partialRight,
  flip,
  arity,
  unary,
  binary,
  spread,
  unspread,
  reverseArgs,
  CurryUtils,
  // Type exports
  type Curry1,
  type Curry2,
  type Curry3,
  type Curry4,
  type Curry5
} from './curry';

// Import for internal use
import { Either, Left, Right, EitherUtils } from './either';
import { Option, Some, None, OptionUtils } from './option';
import { Result, Ok, Err, ResultUtils } from './result';
import { IO, IOUtils } from './io';
import { identity, constant, pipe, compose, flow, ComposeUtils } from './compose';
import { curry, curry2, curry3, curry4, curry5, partial, partialRight, flip, CurryUtils } from './curry';

/**
 * Main FP namespace containing commonly used utilities
 */
export const FP = {
  // Monads
  Either,
  Left,
  Right,
  Option,
  Some,
  None,
  Result,
  Ok,
  Err,
  IO,

  // Composition
  identity,
  constant,
  pipe,
  compose,
  flow,

  // Currying
  curry,
  curry2,
  curry3,
  curry4,
  curry5,
  partial,
  partialRight,
  flip,

  // Utilities
  ...EitherUtils,
  ...OptionUtils,
  ...ResultUtils,
  ...IOUtils,
  ...ComposeUtils,
  ...CurryUtils
} as const;

/**
 * Type-level utilities for functional programming
 */
export namespace FPTypes {
  /**
   * Extract the success type from an Either
   */
  export type EitherRight<T> = T extends Either<any, infer R> ? R : never;

  /**
   * Extract the error type from an Either
   */
  export type EitherLeft<T> = T extends Either<infer L, any> ? L : never;

  /**
   * Extract the success type from a Result
   */
  export type ResultOk<T> = T extends Result<infer O, any> ? O : never;

  /**
   * Extract the error type from a Result
   */
  export type ResultErr<T> = T extends Result<any, infer E> ? E : never;

  /**
   * Extract the value type from an IO
   */
  export type IOValue<T> = T extends IO<infer V> ? V : never;

  /**
   * Function type that can be curried
   */
  export type Curryable<T extends any[], R> = (...args: T) => R;

  /**
   * Return type of a curried function
   */
  export type CurriedFunction<T extends any[], R> = T extends [infer A, ...infer Rest]
    ? Rest extends any[]
      ? (arg: A) => CurriedFunction<Rest, R>
      : (arg: A) => R
    : R;

  /**
   * Predicate function type
   */
  export type Predicate<T> = (value: T) => boolean;

  /**
   * Mapper function type
   */
  export type Mapper<T, U> = (value: T) => U;

  /**
   * Reducer function type
   */
  export type Reducer<T, U> = (accumulator: U, current: T) => U;

  /**
   * Side effect function type
   */
  export type SideEffect<T> = (value: T) => void;

  /**
   * Comparer function type
   */
  export type Comparer<T> = (a: T, b: T) => number;

  /**
   * Equality function type
   */
  export type Equality<T> = (a: T, b: T) => boolean;
}

/**
 * Common functional programming patterns and combinators
 */
export const Combinators = {
  /**
   * K combinator (constant function)
   * @param x - Value to return
   * @returns Function that ignores its argument and returns x
   */
  K: <T, U>(x: T) => (_: U): T => x,

  /**
   * I combinator (identity function)
   * @param x - Input value
   * @returns Same input value
   */
  I: <T>(x: T): T => x,

  /**
   * S combinator (substitution)
   * @param f - First function
   * @param g - Second function
   * @param x - Input value
   * @returns Result of f(x)(g(x))
   */
  S: <T, U, V>(f: (x: T) => (y: U) => V, g: (x: T) => U) => (x: T): V => f(x)(g(x)),

  /**
   * B combinator (composition)
   * @param f - First function
   * @param g - Second function
   * @param x - Input value
   * @returns Result of f(g(x))
   */
  B: <T, U, V>(f: (y: U) => V, g: (x: T) => U) => (x: T): V => f(g(x)),

  /**
   * C combinator (flip)
   * @param f - Function to flip
   * @param x - First argument
   * @param y - Second argument
   * @returns Result of f(y)(x)
   */
  C: <T, U, V>(f: (x: T) => (y: U) => V) => (y: U) => (x: T): V => f(x)(y),

  /**
   * W combinator (duplication)
   * @param f - Binary function
   * @param x - Input value
   * @returns Result of f(x)(x)
   */
  W: <T, U>(f: (x: T) => (y: T) => U) => (x: T): U => f(x)(x)
} as const;

/**
 * Validation utilities for functional programming
 */
export const Validation = {
  /**
   * Validates that a value is not null or undefined
   * @param value - Value to validate
   * @returns Option containing the value if valid
   */
  notNullish: <T>(value: T | null | undefined) => Option.fromNullable(value),

  /**
   * Validates that a string is not empty
   * @param str - String to validate
   * @returns Option containing the string if not empty
   */
  notEmpty: (str: string) => 
    str.length > 0 ? Option.some(str) : Option.none(),

  /**
   * Validates that an array is not empty
   * @param arr - Array to validate
   * @returns Option containing the array if not empty
   */
  notEmptyArray: <T>(arr: T[]) =>
    arr.length > 0 ? Option.some(arr) : Option.none(),

  /**
   * Validates that a number is positive
   * @param num - Number to validate
   * @returns Option containing the number if positive
   */
  positive: (num: number) =>
    num > 0 ? Option.some(num) : Option.none(),

  /**
   * Validates that a number is non-negative
   * @param num - Number to validate
   * @returns Option containing the number if non-negative
   */
  nonNegative: (num: number) =>
    num >= 0 ? Option.some(num) : Option.none(),

  /**
   * Validates using a predicate function
   * @param predicate - Predicate to test
   * @param value - Value to validate
   * @returns Option containing the value if predicate passes
   */
  validate: <T>(predicate: (value: T) => boolean, value: T) =>
    predicate(value) ? Option.some(value) : Option.none(),

  /**
   * Validates email format using regex
   * @param email - Email to validate
   * @returns Option containing the email if valid
   */
  email: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? Option.some(email) : Option.none();
  },

  /**
   * Validates URL format
   * @param url - URL to validate
   * @returns Option containing the URL if valid
   */
  url: (url: string) => {
    try {
      new URL(url);
      return Option.some(url);
    } catch {
      return Option.none();
    }
  }
} as const;

// Default export
export default FP;