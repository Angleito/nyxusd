/**
 * Currying and partial application utilities for functional programming.
 * Provides functions to transform functions into curried versions and apply partial arguments.
 */
/**
 * Curries a function of arity 2
 * @param fn - Function to curry
 * @returns Curried function
 */
export function curry2(fn) {
  return (a) => (b) => fn(a, b);
}
/**
 * Curries a function of arity 3
 * @param fn - Function to curry
 * @returns Curried function
 */
export function curry3(fn) {
  return (a) => (b) => (c) => fn(a, b, c);
}
/**
 * Curries a function of arity 4
 * @param fn - Function to curry
 * @returns Curried function
 */
export function curry4(fn) {
  return (a) => (b) => (c) => (d) => fn(a, b, c, d);
}
/**
 * Curries a function of arity 5
 * @param fn - Function to curry
 * @returns Curried function
 */
export function curry5(fn) {
  return (a) => (b) => (c) => (d) => (e) => fn(a, b, c, d, e);
}
/**
 * Generic curry function that automatically curries based on function arity
 * @param fn - Function to curry
 * @returns Curried function
 */
export function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return (...nextArgs) => curried(...args, ...nextArgs);
  };
}
/**
 * Uncurries a curried function back to its original form
 * @param fn - Curried function to uncurry
 * @param arity - Expected arity of the uncurried function
 * @returns Uncurried function
 */
export function uncurry(fn, arity) {
  return (...args) => {
    let result = fn;
    for (let i = 0; i < arity && i < args.length; i++) {
      result = result(args[i]);
    }
    return result;
  };
}
/**
 * Partially applies arguments to a function
 * @param fn - Function to partially apply
 * @param args - Arguments to apply
 * @returns Partially applied function
 */
export function partial(fn, ...args) {
  return (...rest) => fn(...args, ...rest);
}
/**
 * Partially applies arguments from the right
 * @param fn - Function to partially apply
 * @param args - Arguments to apply from the right
 * @returns Partially applied function
 */
export function partialRight(fn, ...args) {
  return (...rest) => fn(...rest, ...args);
}
/**
 * Flips the order of the first two arguments of a function
 * @param fn - Function to flip
 * @returns Function with flipped arguments
 */
export function flip(fn) {
  return (b, a, ...rest) => fn(a, b, ...rest);
}
/**
 * Creates a function that ignores extra arguments beyond the specified arity
 * @param arity - Number of arguments to accept
 * @param fn - Function to limit
 * @returns Function that accepts only the specified number of arguments
 */
export function arity(n, fn) {
  return (...args) => fn(...args.slice(0, n));
}
/**
 * Creates a unary function (accepts only one argument)
 * @param fn - Function to make unary
 * @returns Unary function
 */
export function unary(fn) {
  return (arg) => fn(arg);
}
/**
 * Creates a binary function (accepts only two arguments)
 * @param fn - Function to make binary
 * @returns Binary function
 */
export function binary(fn) {
  return (a, b) => fn(a, b);
}
/**
 * Creates a function that spreads an array argument to function parameters
 * @param fn - Function to spread arguments to
 * @returns Function that accepts an array argument
 */
export function spread(fn) {
  return (args) => fn(...args);
}
/**
 * Creates a function that collects arguments into an array
 * @param fn - Function that accepts an array
 * @returns Function that accepts individual arguments
 */
export function unspread(fn) {
  return (...args) => fn(args);
}
/**
 * Creates a function that calls the original function with arguments in reverse order
 * @param fn - Function to reverse arguments for
 * @returns Function with reversed arguments
 */
export function reverseArgs(fn) {
  return (...args) => fn(...args.reverse());
}
/**
 * Utility functions for currying and partial application
 */
export const CurryUtils = {
  /**
   * Creates a curried add function
   */
  add: curry2((a, b) => a + b),
  /**
   * Creates a curried subtract function
   */
  subtract: curry2((a, b) => a - b),
  /**
   * Creates a curried multiply function
   */
  multiply: curry2((a, b) => a * b),
  /**
   * Creates a curried divide function
   */
  divide: curry2((a, b) => a / b),
  /**
   * Creates a curried modulo function
   */
  modulo: curry2((a, b) => a % b),
  /**
   * Creates a curried power function
   */
  power: curry2((base, exponent) => Math.pow(base, exponent)),
  /**
   * Creates a curried greater than function
   */
  gt: curry2((a, b) => a > b),
  /**
   * Creates a curried greater than or equal function
   */
  gte: curry2((a, b) => a >= b),
  /**
   * Creates a curried less than function
   */
  lt: curry2((a, b) => a < b),
  /**
   * Creates a curried less than or equal function
   */
  lte: curry2((a, b) => a <= b),
  /**
   * Creates a curried equals function
   */
  equals: curry2((a, b) => a === b),
  /**
   * Creates a curried not equals function
   */
  notEquals: curry2((a, b) => a !== b),
  /**
   * Creates a curried string contains function
   */
  contains: curry2((substring, string) => string.includes(substring)),
  /**
   * Creates a curried string starts with function
   */
  startsWith: curry2((prefix, string) => string.startsWith(prefix)),
  /**
   * Creates a curried string ends with function
   */
  endsWith: curry2((suffix, string) => string.endsWith(suffix)),
  /**
   * Creates a curried array get function
   */
  get: curry2((index, array) => array[index]),
  /**
   * Creates a curried array has function
   */
  has: curry2((item, array) => array.includes(item)),
  /**
   * Creates a curried object property getter
   */
  prop: curry2((key, obj) => obj[key]),
  /**
   * Creates a curried object property setter
   */
  setProp: curry3((key, value, obj) => ({ ...obj, [key]: value })),
  /**
   * Creates a curried map function
   */
  map: curry2((fn, array) => array.map(fn)),
  /**
   * Creates a curried filter function
   */
  filter: curry2((predicate, array) => array.filter(predicate)),
  /**
   * Creates a curried reduce function
   */
  reduce: curry3((reducer, initial, array) => array.reduce(reducer, initial)),
  /**
   * Creates a curried find function
   */
  find: curry2((predicate, array) => array.find(predicate)),
  /**
   * Creates a curried some function
   */
  some: curry2((predicate, array) => array.some(predicate)),
  /**
   * Creates a curried every function
   */
  every: curry2((predicate, array) => array.every(predicate)),
  /**
   * Creates a curried concat function
   */
  concat: curry2((array1, array2) => array1.concat(array2)),
  /**
   * Creates a curried slice function
   */
  slice: curry3((start, end, array) => array.slice(start, end)),
  /**
   * Creates a curried join function
   */
  join: curry2((separator, array) => array.join(separator)),
  /**
   * Creates a curried split function
   */
  split: curry2((separator, string) => string.split(separator)),
  /**
   * Creates a curried replace function
   */
  replace: curry3((search, replacement, string) =>
    string.replace(search, replacement),
  ),
  /**
   * Creates a curried match function
   */
  match: curry2((regex, string) => string.match(regex)),
  /**
   * Creates a curried test function for regex
   */
  test: curry2((regex, string) => regex.test(string)),
};
//# sourceMappingURL=curry.js.map
