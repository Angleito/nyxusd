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
export { Either, Left, Right, EitherUtils } from './either';
export { Option, Some, None, OptionUtils } from './option';
export { Result, Ok, Err, ResultUtils } from './result';
export { IO, IOUtils } from './io';
export { identity, constant, pipe, compose, flow, ComposeUtils } from './compose';
export { curry, curry2, curry3, curry4, curry5, uncurry, partial, partialRight, flip, arity, unary, binary, spread, unspread, reverseArgs, CurryUtils, type Curry1, type Curry2, type Curry3, type Curry4, type Curry5 } from './curry';
import { Either, Left, Right } from './either';
import { Option, Some, None } from './option';
import { Result, Ok, Err } from './result';
import { IO } from './io';
import { pipe, compose, flow } from './compose';
import { curry, curry2, curry3, curry4, curry5, partial, partialRight, flip } from './curry';
/**
 * Main FP namespace containing commonly used utilities
 */
export declare const FP: {
    readonly add: import("./curry").Curry2<number, number, number>;
    readonly subtract: import("./curry").Curry2<number, number, number>;
    readonly multiply: import("./curry").Curry2<number, number, number>;
    readonly divide: import("./curry").Curry2<number, number, number>;
    readonly modulo: import("./curry").Curry2<number, number, number>;
    readonly power: import("./curry").Curry2<number, number, number>;
    readonly gt: import("./curry").Curry2<number, number, boolean>;
    readonly gte: import("./curry").Curry2<number, number, boolean>;
    readonly lt: import("./curry").Curry2<number, number, boolean>;
    readonly lte: import("./curry").Curry2<number, number, boolean>;
    readonly equals: <T>(a: T) => (b: T) => boolean;
    readonly notEquals: <T>(a: T) => (b: T) => boolean;
    readonly contains: import("./curry").Curry2<string, string, boolean>;
    readonly startsWith: import("./curry").Curry2<string, string, boolean>;
    readonly endsWith: import("./curry").Curry2<string, string, boolean>;
    readonly get: <T>(a: number) => (b: T[]) => T | undefined;
    readonly has: <T>(a: T) => (b: T[]) => boolean;
    readonly prop: <T, K extends keyof T>(a: K) => (b: T) => T[K];
    readonly setProp: <T, K extends keyof T>(a: K) => (b: T[K]) => (c: T) => T;
    readonly map: <T, U>(a: (item: T) => U) => (b: T[]) => U[];
    readonly filter: <T>(a: (item: T) => boolean) => (b: T[]) => T[];
    readonly reduce: <T, U>(a: (acc: U, item: T) => U) => (b: U) => (c: T[]) => U;
    readonly find: <T>(a: (item: T) => boolean) => (b: T[]) => T | undefined;
    readonly some: <T>(a: (item: T) => boolean) => (b: T[]) => boolean;
    readonly every: <T>(a: (item: T) => boolean) => (b: T[]) => boolean;
    readonly concat: <T>(a: T[]) => (b: T[]) => T[];
    readonly slice: <T>(a: number) => (b: number) => (c: T[]) => T[];
    readonly join: import("./curry").Curry2<string, string[], string>;
    readonly split: import("./curry").Curry2<string, string, string[]>;
    readonly replace: import("./curry").Curry3<string | RegExp, string, string, string>;
    readonly match: import("./curry").Curry2<RegExp, string, RegExpMatchArray | null>;
    readonly test: import("./curry").Curry2<RegExp, string, boolean>;
    readonly branch: <T, U>(predicate: (value: T) => boolean, onTrue: (value: T) => U, onFalse: (value: T) => U) => (value: T) => U;
    readonly cond: <T, U>(cases: Array<[(value: T) => boolean, (value: T) => U]>, defaultFn: (value: T) => U) => (value: T) => U;
    readonly when: <T>(predicate: (value: T) => boolean, transform: (value: T) => T) => (value: T) => T;
    readonly unless: <T>(predicate: (value: T) => boolean, transform: (value: T) => T) => (value: T) => T;
    readonly tap: <T>(sideEffect: (value: T) => void) => (value: T) => T;
    readonly trace: <T>(label?: string) => (value: T) => T;
    readonly memoize: <T extends any[], U>(fn: (...args: T) => U, keyFn?: (...args: T) => string) => (...args: T) => U;
    readonly debounce: <T extends any[]>(fn: (...args: T) => void, delay: number) => (...args: T) => void;
    readonly throttle: <T extends any[], U>(fn: (...args: T) => U, interval: number) => (...args: T) => U | undefined;
    readonly retry: <T extends any[], U>(fn: (...args: T) => U, maxAttempts: number, delay?: number) => (...args: T) => U;
    readonly sequence: <T>(ios: IO<T>[]) => IO<T[]>;
    readonly traverse: <A, B>(items: A[], fn: (item: A) => IO<B>) => IO<B[]>;
    readonly parallel: <T>(ios: IO<T>[]) => IO<T[]>;
    readonly race: <T>(ios: IO<T>[]) => IO<T>;
    readonly lift: <A, B>(fn: (a: A) => B) => (io: IO<A>) => IO<B>;
    readonly lift2: <A, B, C>(fn: (a: A, b: B) => C) => (ioA: IO<A>, ioB: IO<B>) => IO<C>;
    readonly log: (message: any) => IO<void>;
    readonly logError: (message: any) => IO<void>;
    readonly readStorage: (key: string) => IO<string | null>;
    readonly writeStorage: (key: string, value: string) => IO<void>;
    readonly now: () => IO<number>;
    readonly random: () => IO<number>;
    readonly delay: (ms: number) => IO<void>;
    readonly partition: <T, E>(results: Result<T, E>[]) => [E[], T[]];
    readonly catOks: <T, E>(results: Result<T, E>[]) => T[];
    readonly catErrs: <T, E>(results: Result<T, E>[]) => E[];
    readonly all: <T extends readonly Result<any, any>[]>(...results: T) => Result<{ [K in keyof T]: T[K] extends Result<infer U, any> ? U : never; }, T[number] extends Result<any, infer E> ? E : never>;
    readonly lift3: <A, B, C, D>(fn: (a: A, b: B, c: C) => D) => (optionA: Option<A>, optionB: Option<B>, optionC: Option<C>) => Option<D>;
    readonly catOptions: <T>(options: Option<T>[]) => T[];
    readonly mapFilter: <A, B>(items: A[], fn: (item: A) => Option<B>) => B[];
    readonly firstSome: <T>(options: Option<T>[]) => Option<T>;
    readonly Either: typeof Either;
    readonly Left: typeof Left;
    readonly Right: typeof Right;
    readonly Option: typeof Option;
    readonly Some: typeof Some;
    readonly None: typeof None;
    readonly Result: typeof Result;
    readonly Ok: typeof Ok;
    readonly Err: typeof Err;
    readonly IO: typeof IO;
    readonly identity: <T>(x: T) => T;
    readonly constant: <T>(value: T) => () => T;
    readonly pipe: typeof pipe;
    readonly compose: typeof compose;
    readonly flow: typeof flow;
    readonly curry: typeof curry;
    readonly curry2: typeof curry2;
    readonly curry3: typeof curry3;
    readonly curry4: typeof curry4;
    readonly curry5: typeof curry5;
    readonly partial: typeof partial;
    readonly partialRight: typeof partialRight;
    readonly flip: typeof flip;
};
/**
 * Type-level utilities for functional programming
 */
export declare namespace FPTypes {
    /**
     * Extract the success type from an Either
     */
    type EitherRight<T> = T extends Either<any, infer R> ? R : never;
    /**
     * Extract the error type from an Either
     */
    type EitherLeft<T> = T extends Either<infer L, any> ? L : never;
    /**
     * Extract the success type from a Result
     */
    type ResultOk<T> = T extends Result<infer O, any> ? O : never;
    /**
     * Extract the error type from a Result
     */
    type ResultErr<T> = T extends Result<any, infer E> ? E : never;
    /**
     * Extract the value type from an IO
     */
    type IOValue<T> = T extends IO<infer V> ? V : never;
    /**
     * Function type that can be curried
     */
    type Curryable<T extends any[], R> = (...args: T) => R;
    /**
     * Return type of a curried function
     */
    type CurriedFunction<T extends any[], R> = T extends [infer A, ...infer Rest] ? Rest extends any[] ? (arg: A) => CurriedFunction<Rest, R> : (arg: A) => R : R;
    /**
     * Predicate function type
     */
    type Predicate<T> = (value: T) => boolean;
    /**
     * Mapper function type
     */
    type Mapper<T, U> = (value: T) => U;
    /**
     * Reducer function type
     */
    type Reducer<T, U> = (accumulator: U, current: T) => U;
    /**
     * Side effect function type
     */
    type SideEffect<T> = (value: T) => void;
    /**
     * Comparer function type
     */
    type Comparer<T> = (a: T, b: T) => number;
    /**
     * Equality function type
     */
    type Equality<T> = (a: T, b: T) => boolean;
}
/**
 * Common functional programming patterns and combinators
 */
export declare const Combinators: {
    /**
     * K combinator (constant function)
     * @param x - Value to return
     * @returns Function that ignores its argument and returns x
     */
    readonly K: <T, U>(x: T) => (_: U) => T;
    /**
     * I combinator (identity function)
     * @param x - Input value
     * @returns Same input value
     */
    readonly I: <T>(x: T) => T;
    /**
     * S combinator (substitution)
     * @param f - First function
     * @param g - Second function
     * @param x - Input value
     * @returns Result of f(x)(g(x))
     */
    readonly S: <T, U, V>(f: (x: T) => (y: U) => V, g: (x: T) => U) => (x: T) => V;
    /**
     * B combinator (composition)
     * @param f - First function
     * @param g - Second function
     * @param x - Input value
     * @returns Result of f(g(x))
     */
    readonly B: <T, U, V>(f: (y: U) => V, g: (x: T) => U) => (x: T) => V;
    /**
     * C combinator (flip)
     * @param f - Function to flip
     * @param x - First argument
     * @param y - Second argument
     * @returns Result of f(y)(x)
     */
    readonly C: <T, U, V>(f: (x: T) => (y: U) => V) => (y: U) => (x: T) => V;
    /**
     * W combinator (duplication)
     * @param f - Binary function
     * @param x - Input value
     * @returns Result of f(x)(x)
     */
    readonly W: <T, U>(f: (x: T) => (y: T) => U) => (x: T) => U;
};
/**
 * Validation utilities for functional programming
 */
export declare const Validation: {
    /**
     * Validates that a value is not null or undefined
     * @param value - Value to validate
     * @returns Option containing the value if valid
     */
    readonly notNullish: <T>(value: T | null | undefined) => Option<T>;
    /**
     * Validates that a string is not empty
     * @param str - String to validate
     * @returns Option containing the string if not empty
     */
    readonly notEmpty: (str: string) => Option<unknown>;
    /**
     * Validates that an array is not empty
     * @param arr - Array to validate
     * @returns Option containing the array if not empty
     */
    readonly notEmptyArray: <T>(arr: T[]) => Option<unknown>;
    /**
     * Validates that a number is positive
     * @param num - Number to validate
     * @returns Option containing the number if positive
     */
    readonly positive: (num: number) => Option<unknown>;
    /**
     * Validates that a number is non-negative
     * @param num - Number to validate
     * @returns Option containing the number if non-negative
     */
    readonly nonNegative: (num: number) => Option<unknown>;
    /**
     * Validates using a predicate function
     * @param predicate - Predicate to test
     * @param value - Value to validate
     * @returns Option containing the value if predicate passes
     */
    readonly validate: <T>(predicate: (value: T) => boolean, value: T) => Option<unknown>;
    /**
     * Validates email format using regex
     * @param email - Email to validate
     * @returns Option containing the email if valid
     */
    readonly email: (email: string) => Option<unknown>;
    /**
     * Validates URL format
     * @param url - URL to validate
     * @returns Option containing the URL if valid
     */
    readonly url: (url: string) => Option<unknown>;
};
export default FP;
//# sourceMappingURL=index.d.ts.map