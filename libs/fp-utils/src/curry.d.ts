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
export type Curry5<A, B, C, D, E, R> = (a: A) => (b: B) => (c: C) => (d: D) => (e: E) => R;
/**
 * Curries a function of arity 2
 * @param fn - Function to curry
 * @returns Curried function
 */
export declare function curry2<A, B, R>(fn: (a: A, b: B) => R): Curry2<A, B, R>;
/**
 * Curries a function of arity 3
 * @param fn - Function to curry
 * @returns Curried function
 */
export declare function curry3<A, B, C, R>(fn: (a: A, b: B, c: C) => R): Curry3<A, B, C, R>;
/**
 * Curries a function of arity 4
 * @param fn - Function to curry
 * @returns Curried function
 */
export declare function curry4<A, B, C, D, R>(fn: (a: A, b: B, c: C, d: D) => R): Curry4<A, B, C, D, R>;
/**
 * Curries a function of arity 5
 * @param fn - Function to curry
 * @returns Curried function
 */
export declare function curry5<A, B, C, D, E, R>(fn: (a: A, b: B, c: C, d: D, e: E) => R): Curry5<A, B, C, D, E, R>;
/**
 * Generic curry function that automatically curries based on function arity
 * @param fn - Function to curry
 * @returns Curried function
 */
export declare function curry<T extends any[], R>(fn: (...args: T) => R): any;
/**
 * Uncurries a curried function back to its original form
 * @param fn - Curried function to uncurry
 * @param arity - Expected arity of the uncurried function
 * @returns Uncurried function
 */
export declare function uncurry<T extends any[], R>(fn: (...args: any[]) => any, arity: number): (...args: T) => R;
/**
 * Partially applies arguments to a function
 * @param fn - Function to partially apply
 * @param args - Arguments to apply
 * @returns Partially applied function
 */
export declare function partial<T extends any[], U extends any[], R>(fn: (...args: [...T, ...U]) => R, ...args: T): (...rest: U) => R;
/**
 * Partially applies arguments from the right
 * @param fn - Function to partially apply
 * @param args - Arguments to apply from the right
 * @returns Partially applied function
 */
export declare function partialRight<T extends any[], U extends any[], R>(fn: (...args: [...T, ...U]) => R, ...args: U): (...rest: T) => R;
/**
 * Flips the order of the first two arguments of a function
 * @param fn - Function to flip
 * @returns Function with flipped arguments
 */
export declare function flip<A, B, Rest extends any[], R>(fn: (a: A, b: B, ...rest: Rest) => R): (b: B, a: A, ...rest: Rest) => R;
/**
 * Creates a function that ignores extra arguments beyond the specified arity
 * @param arity - Number of arguments to accept
 * @param fn - Function to limit
 * @returns Function that accepts only the specified number of arguments
 */
export declare function arity<T extends any[], R>(n: number, fn: (...args: T) => R): (...args: any[]) => R;
/**
 * Creates a unary function (accepts only one argument)
 * @param fn - Function to make unary
 * @returns Unary function
 */
export declare function unary<T, R>(fn: (arg: T, ...rest: any[]) => R): (arg: T) => R;
/**
 * Creates a binary function (accepts only two arguments)
 * @param fn - Function to make binary
 * @returns Binary function
 */
export declare function binary<A, B, R>(fn: (a: A, b: B, ...rest: any[]) => R): (a: A, b: B) => R;
/**
 * Creates a function that spreads an array argument to function parameters
 * @param fn - Function to spread arguments to
 * @returns Function that accepts an array argument
 */
export declare function spread<T extends any[], R>(fn: (...args: T) => R): (args: T) => R;
/**
 * Creates a function that collects arguments into an array
 * @param fn - Function that accepts an array
 * @returns Function that accepts individual arguments
 */
export declare function unspread<T extends any[], R>(fn: (args: T) => R): (...args: T) => R;
/**
 * Creates a function that calls the original function with arguments in reverse order
 * @param fn - Function to reverse arguments for
 * @returns Function with reversed arguments
 */
export declare function reverseArgs<T extends any[], R>(fn: (...args: T) => R): (...args: T) => R;
/**
 * Utility functions for currying and partial application
 */
export declare const CurryUtils: {
    /**
     * Creates a curried add function
     */
    add: Curry2<number, number, number>;
    /**
     * Creates a curried subtract function
     */
    subtract: Curry2<number, number, number>;
    /**
     * Creates a curried multiply function
     */
    multiply: Curry2<number, number, number>;
    /**
     * Creates a curried divide function
     */
    divide: Curry2<number, number, number>;
    /**
     * Creates a curried modulo function
     */
    modulo: Curry2<number, number, number>;
    /**
     * Creates a curried power function
     */
    power: Curry2<number, number, number>;
    /**
     * Creates a curried greater than function
     */
    gt: Curry2<number, number, boolean>;
    /**
     * Creates a curried greater than or equal function
     */
    gte: Curry2<number, number, boolean>;
    /**
     * Creates a curried less than function
     */
    lt: Curry2<number, number, boolean>;
    /**
     * Creates a curried less than or equal function
     */
    lte: Curry2<number, number, boolean>;
    /**
     * Creates a curried equals function
     */
    equals: <T>(a: T) => (b: T) => boolean;
    /**
     * Creates a curried not equals function
     */
    notEquals: <T>(a: T) => (b: T) => boolean;
    /**
     * Creates a curried string contains function
     */
    contains: Curry2<string, string, boolean>;
    /**
     * Creates a curried string starts with function
     */
    startsWith: Curry2<string, string, boolean>;
    /**
     * Creates a curried string ends with function
     */
    endsWith: Curry2<string, string, boolean>;
    /**
     * Creates a curried array get function
     */
    get: <T>(a: number) => (b: T[]) => T | undefined;
    /**
     * Creates a curried array has function
     */
    has: <T>(a: T) => (b: T[]) => boolean;
    /**
     * Creates a curried object property getter
     */
    prop: <T, K extends keyof T>(a: K) => (b: T) => T[K];
    /**
     * Creates a curried object property setter
     */
    setProp: <T, K extends keyof T>(a: K) => (b: T[K]) => (c: T) => T;
    /**
     * Creates a curried map function
     */
    map: <T, U>(a: (item: T) => U) => (b: T[]) => U[];
    /**
     * Creates a curried filter function
     */
    filter: <T>(a: (item: T) => boolean) => (b: T[]) => T[];
    /**
     * Creates a curried reduce function
     */
    reduce: <T, U>(a: (acc: U, item: T) => U) => (b: U) => (c: T[]) => U;
    /**
     * Creates a curried find function
     */
    find: <T>(a: (item: T) => boolean) => (b: T[]) => T | undefined;
    /**
     * Creates a curried some function
     */
    some: <T>(a: (item: T) => boolean) => (b: T[]) => boolean;
    /**
     * Creates a curried every function
     */
    every: <T>(a: (item: T) => boolean) => (b: T[]) => boolean;
    /**
     * Creates a curried concat function
     */
    concat: <T>(a: T[]) => (b: T[]) => T[];
    /**
     * Creates a curried slice function
     */
    slice: <T>(a: number) => (b: number) => (c: T[]) => T[];
    /**
     * Creates a curried join function
     */
    join: Curry2<string, string[], string>;
    /**
     * Creates a curried split function
     */
    split: Curry2<string, string, string[]>;
    /**
     * Creates a curried replace function
     */
    replace: Curry3<string | RegExp, string, string, string>;
    /**
     * Creates a curried match function
     */
    match: Curry2<RegExp, string, RegExpMatchArray | null>;
    /**
     * Creates a curried test function for regex
     */
    test: Curry2<RegExp, string, boolean>;
};
//# sourceMappingURL=curry.d.ts.map