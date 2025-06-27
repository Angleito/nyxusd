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
export { Either, Left, Right, EitherUtils } from "./either";
export { Option, Some, None, OptionUtils } from "./option";
export { Result, Ok, Err, ResultUtils } from "./result";
export { IO, IOUtils } from "./io";
// Function Composition Utilities
export {
  identity,
  constant,
  pipe,
  compose,
  flow,
  ComposeUtils,
} from "./compose";
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
} from "./curry";
// Import for internal use
import { Either, Left, Right, EitherUtils } from "./either";
import { Option, Some, None, OptionUtils } from "./option";
import { Result, Ok, Err, ResultUtils } from "./result";
import { IO, IOUtils } from "./io";
import {
  identity,
  constant,
  pipe,
  compose,
  flow,
  ComposeUtils,
} from "./compose";
import {
  curry,
  curry2,
  curry3,
  curry4,
  curry5,
  partial,
  partialRight,
  flip,
  CurryUtils,
} from "./curry";
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
  ...CurryUtils,
};
/**
 * Common functional programming patterns and combinators
 */
export const Combinators = {
  /**
   * K combinator (constant function)
   * @param x - Value to return
   * @returns Function that ignores its argument and returns x
   */
  K: (x) => (_) => x,
  /**
   * I combinator (identity function)
   * @param x - Input value
   * @returns Same input value
   */
  I: (x) => x,
  /**
   * S combinator (substitution)
   * @param f - First function
   * @param g - Second function
   * @param x - Input value
   * @returns Result of f(x)(g(x))
   */
  S: (f, g) => (x) => f(x)(g(x)),
  /**
   * B combinator (composition)
   * @param f - First function
   * @param g - Second function
   * @param x - Input value
   * @returns Result of f(g(x))
   */
  B: (f, g) => (x) => f(g(x)),
  /**
   * C combinator (flip)
   * @param f - Function to flip
   * @param x - First argument
   * @param y - Second argument
   * @returns Result of f(y)(x)
   */
  C: (f) => (y) => (x) => f(x)(y),
  /**
   * W combinator (duplication)
   * @param f - Binary function
   * @param x - Input value
   * @returns Result of f(x)(x)
   */
  W: (f) => (x) => f(x)(x),
};
/**
 * Validation utilities for functional programming
 */
export const Validation = {
  /**
   * Validates that a value is not null or undefined
   * @param value - Value to validate
   * @returns Option containing the value if valid
   */
  notNullish: (value) => Option.fromNullable(value),
  /**
   * Validates that a string is not empty
   * @param str - String to validate
   * @returns Option containing the string if not empty
   */
  notEmpty: (str) => (str.length > 0 ? Option.some(str) : Option.none()),
  /**
   * Validates that an array is not empty
   * @param arr - Array to validate
   * @returns Option containing the array if not empty
   */
  notEmptyArray: (arr) => (arr.length > 0 ? Option.some(arr) : Option.none()),
  /**
   * Validates that a number is positive
   * @param num - Number to validate
   * @returns Option containing the number if positive
   */
  positive: (num) => (num > 0 ? Option.some(num) : Option.none()),
  /**
   * Validates that a number is non-negative
   * @param num - Number to validate
   * @returns Option containing the number if non-negative
   */
  nonNegative: (num) => (num >= 0 ? Option.some(num) : Option.none()),
  /**
   * Validates using a predicate function
   * @param predicate - Predicate to test
   * @param value - Value to validate
   * @returns Option containing the value if predicate passes
   */
  validate: (predicate, value) =>
    predicate(value) ? Option.some(value) : Option.none(),
  /**
   * Validates email format using regex
   * @param email - Email to validate
   * @returns Option containing the email if valid
   */
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? Option.some(email) : Option.none();
  },
  /**
   * Validates URL format
   * @param url - URL to validate
   * @returns Option containing the URL if valid
   */
  url: (url) => {
    try {
      new URL(url);
      return Option.some(url);
    } catch {
      return Option.none();
    }
  },
};
// Default export
export default FP;
//# sourceMappingURL=index.js.map
