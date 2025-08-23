/**
 * Currying and partial application utilities for functional programming.
 * Provides functions to transform functions into curried versions and apply partial arguments.
 */

/**
 * Curried function type definitions for different arities
 */
export type Curry1<A, R> = (a: A) => R;
export type Curry2<A, B, R> = (a: A) => (b: B) => R;
export type Curry3<A, B, C, R> = (a: A) => (b: B) => (c: C) => R;
export type Curry4<A, B, C, D, R> = (a: A) => (b: B) => (c: C) => (d: D) => R;
export type Curry5<A, B, C, D, E, R> = (
  a: A,
) => (b: B) => (c: C) => (d: D) => (e: E) => R;

/**
 * Curries a function of arity 2
 * @param fn - Function to curry
 * @returns Curried function
 */
export function curry2<A, B, R>(fn: (a: A, b: B) => R): Curry2<A, B, R> {
  return (a: A) => (b: B) => fn(a, b);
}

/**
 * Curries a function of arity 3
 * @param fn - Function to curry
 * @returns Curried function
 */
export function curry3<A, B, C, R>(
  fn: (a: A, b: B, c: C) => R,
): Curry3<A, B, C, R> {
  return (a: A) => (b: B) => (c: C) => fn(a, b, c);
}

/**
 * Curries a function of arity 4
 * @param fn - Function to curry
 * @returns Curried function
 */
export function curry4<A, B, C, D, R>(
  fn: (a: A, b: B, c: C, d: D) => R,
): Curry4<A, B, C, D, R> {
  return (a: A) => (b: B) => (c: C) => (d: D) => fn(a, b, c, d);
}

/**
 * Curries a function of arity 5
 * @param fn - Function to curry
 * @returns Curried function
 */
export function curry5<A, B, C, D, E, R>(
  fn: (a: A, b: B, c: C, d: D, e: E) => R,
): Curry5<A, B, C, D, E, R> {
  return (a: A) => (b: B) => (c: C) => (d: D) => (e: E) => fn(a, b, c, d, e);
}

/**
 * Generic curry function that automatically curries based on function arity
 * @param fn - Function to curry
 * @returns Curried function
 */
export function curry<T extends any[], R>(fn: (...args: T) => R): any {
  return function curried(...args: any[]): any {
    if (args.length >= fn.length) {
      return fn(...(args as T));
    }
    return (...nextArgs: any[]) => curried(...args, ...nextArgs);
  };
}

/**
 * Uncurries a curried function back to its original form
 * @param fn - Curried function to uncurry
 * @param arity - Expected arity of the uncurried function
 * @returns Uncurried function
 */
export function uncurry<T extends any[], R>(
  fn: (...args: any[]) => any,
  arity: number,
): (...args: T) => R {
  return (...args: T): R => {
    let result: any = fn;
    for (let i = 0; i < arity && i < args.length; i++) {
      result = result(args[i]);
    }
    return result as R;
  };
}

/**
 * Partially applies arguments to a function
 * @param fn - Function to partially apply
 * @param args - Arguments to apply
 * @returns Partially applied function
 */
export function partial<T extends any[], U extends any[], R>(
  fn: (...args: [...T, ...U]) => R,
  ...args: T
): (...rest: U) => R {
  return (...rest: U) => fn(...args, ...rest);
}

/**
 * Partially applies arguments from the right
 * @param fn - Function to partially apply
 * @param args - Arguments to apply from the right
 * @returns Partially applied function
 */
export function partialRight<T extends any[], U extends any[], R>(
  fn: (...args: [...T, ...U]) => R,
  ...args: U
): (...rest: T) => R {
  return (...rest: T) => fn(...rest, ...args);
}

/**
 * Flips the order of the first two arguments of a function
 * @param fn - Function to flip
 * @returns Function with flipped arguments
 */
export function flip<A, B, Rest extends any[], R>(
  fn: (a: A, b: B, ...rest: Rest) => R,
): (b: B, a: A, ...rest: Rest) => R {
  return (b: B, a: A, ...rest: Rest) => fn(a, b, ...rest);
}

/**
 * Creates a function that ignores extra arguments beyond the specified arity
 * @param arity - Number of arguments to accept
 * @param fn - Function to limit
 * @returns Function that accepts only the specified number of arguments
 */
export function arity<T extends any[], R>(
  n: number,
  fn: (...args: T) => R,
): (...args: any[]) => R {
  return (...args: any[]) => fn(...(args.slice(0, n) as T));
}

/**
 * Creates a unary function (accepts only one argument)
 * @param fn - Function to make unary
 * @returns Unary function
 */
export function unary<T, R>(fn: (arg: T, ...rest: any[]) => R): (arg: T) => R {
  return (arg: T) => fn(arg);
}

/**
 * Creates a binary function (accepts only two arguments)
 * @param fn - Function to make binary
 * @returns Binary function
 */
export function binary<A, B, R>(
  fn: (a: A, b: B, ...rest: any[]) => R,
): (a: A, b: B) => R {
  return (a: A, b: B) => fn(a, b);
}

/**
 * Creates a function that spreads an array argument to function parameters
 * @param fn - Function to spread arguments to
 * @returns Function that accepts an array argument
 */
export function spread<T extends any[], R>(
  fn: (...args: T) => R,
): (args: T) => R {
  return (args: T) => fn(...args);
}

/**
 * Creates a function that collects arguments into an array
 * @param fn - Function that accepts an array
 * @returns Function that accepts individual arguments
 */
export function unspread<T extends any[], R>(
  fn: (args: T) => R,
): (...args: T) => R {
  return (...args: T) => fn(args);
}

/**
 * Creates a function that calls the original function with arguments in reverse order
 * @param fn - Function to reverse arguments for
 * @returns Function with reversed arguments
 */
export function reverseArgs<T extends any[], R>(
  fn: (...args: T) => R,
): (...args: T) => R {
  return (...args: T) => fn(...(args.reverse() as T));
}

/**
 * Utility functions for currying and partial application
 */
export const CurryUtils = {
  /**
   * Creates a curried add function
   */
  add: curry2((a: number, b: number): number => a + b),

  /**
   * Creates a curried subtract function
   */
  subtract: curry2((a: number, b: number): number => a - b),

  /**
   * Creates a curried multiply function
   */
  multiply: curry2((a: number, b: number): number => a * b),

  /**
   * Creates a curried divide function
   */
  divide: curry2((a: number, b: number): number => a / b),

  /**
   * Creates a curried modulo function
   */
  modulo: curry2((a: number, b: number): number => a % b),

  /**
   * Creates a curried power function
   */
  power: curry2((base: number, exponent: number): number =>
    Math.pow(base, exponent),
  ),

  /**
   * Creates a curried greater than function
   */
  gt: curry2((a: number, b: number): boolean => a > b),

  /**
   * Creates a curried greater than or equal function
   */
  gte: curry2((a: number, b: number): boolean => a >= b),

  /**
   * Creates a curried less than function
   */
  lt: curry2((a: number, b: number): boolean => a < b),

  /**
   * Creates a curried less than or equal function
   */
  lte: curry2((a: number, b: number): boolean => a <= b),

  /**
   * Creates a curried equals function
   */
  equals: curry2(<T>(a: T, b: T): boolean => a === b),

  /**
   * Creates a curried not equals function
   */
  notEquals: curry2(<T>(a: T, b: T): boolean => a !== b),

  /**
   * Creates a curried string contains function
   */
  contains: curry2((substring: string, string: string): boolean =>
    string.includes(substring),
  ),

  /**
   * Creates a curried string starts with function
   */
  startsWith: curry2((prefix: string, string: string): boolean =>
    string.startsWith(prefix),
  ),

  /**
   * Creates a curried string ends with function
   */
  endsWith: curry2((suffix: string, string: string): boolean =>
    string.endsWith(suffix),
  ),

  /**
   * Creates a curried array get function
   */
  get: curry2(<T>(index: number, array: T[]): T | undefined => array[index]),

  /**
   * Creates a curried array has function
   */
  has: curry2(<T>(item: T, array: T[]): boolean => array.includes(item)),

  /**
   * Creates a curried object property getter
   */
  prop: curry2(<T, K extends keyof T>(key: K, obj: T): T[K] => obj[key]),

  /**
   * Creates a curried object property setter
   */
  setProp: curry3(
    <T, K extends keyof T>(key: K, value: T[K], obj: T): T => ({
      ...obj,
      [key]: value,
    }),
  ),

  /**
   * Creates a curried map function
   */
  map: curry2(<T, U>(fn: (item: T) => U, array: T[]): U[] => array.map(fn)),

  /**
   * Creates a curried filter function
   */
  filter: curry2(<T>(predicate: (item: T) => boolean, array: T[]): T[] =>
    array.filter(predicate),
  ),

  /**
   * Creates a curried reduce function
   */
  reduce: curry3(
    <T, U>(reducer: (acc: U, item: T) => U, initial: U, array: T[]): U =>
      array.reduce(reducer, initial),
  ),

  /**
   * Creates a curried find function
   */
  find: curry2(
    <T>(predicate: (item: T) => boolean, array: T[]): T | undefined =>
      array.find(predicate),
  ),

  /**
   * Creates a curried some function
   */
  some: curry2(<T>(predicate: (item: T) => boolean, array: T[]): boolean =>
    array.some(predicate),
  ),

  /**
   * Creates a curried every function
   */
  every: curry2(<T>(predicate: (item: T) => boolean, array: T[]): boolean =>
    array.every(predicate),
  ),

  /**
   * Creates a curried concat function
   */
  concat: curry2(<T>(array1: T[], array2: T[]): T[] => array1.concat(array2)),

  /**
   * Creates a curried slice function
   */
  slice: curry3(<T>(start: number, end: number, array: T[]): T[] =>
    array.slice(start, end),
  ),

  /**
   * Creates a curried join function
   */
  join: curry2((separator: string, array: string[]): string =>
    array.join(separator),
  ),

  /**
   * Creates a curried split function
   */
  split: curry2((separator: string, string: string): string[] =>
    string.split(separator),
  ),

  /**
   * Creates a curried replace function
   */
  replace: curry3(
    (search: string | RegExp, replacement: string, string: string): string =>
      string.replace(search, replacement),
  ),

  /**
   * Creates a curried match function
   */
  match: curry2((regex: RegExp, string: string): RegExpMatchArray | null =>
    string.match(regex),
  ),

  /**
   * Creates a curried test function for regex
   */
  test: curry2((regex: RegExp, string: string): boolean => regex.test(string)),
};
