"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validation = exports.Combinators = exports.FP = exports.CurryUtils = exports.reverseArgs = exports.unspread = exports.spread = exports.binary = exports.unary = exports.arity = exports.flip = exports.partialRight = exports.partial = exports.uncurry = exports.curry5 = exports.curry4 = exports.curry3 = exports.curry2 = exports.curry = exports.ComposeUtils = exports.flow = exports.compose = exports.pipe = exports.constant = exports.identity = exports.IOUtils = exports.IO = exports.ResultUtils = exports.Err = exports.Ok = exports.Result = exports.OptionUtils = exports.None = exports.Some = exports.Option = exports.EitherUtils = exports.Right = exports.Left = exports.Either = void 0;
// Core Monads
var either_1 = require("./either");
Object.defineProperty(exports, "Either", { enumerable: true, get: function () { return either_1.Either; } });
Object.defineProperty(exports, "Left", { enumerable: true, get: function () { return either_1.Left; } });
Object.defineProperty(exports, "Right", { enumerable: true, get: function () { return either_1.Right; } });
Object.defineProperty(exports, "EitherUtils", { enumerable: true, get: function () { return either_1.EitherUtils; } });
var option_1 = require("./option");
Object.defineProperty(exports, "Option", { enumerable: true, get: function () { return option_1.Option; } });
Object.defineProperty(exports, "Some", { enumerable: true, get: function () { return option_1.Some; } });
Object.defineProperty(exports, "None", { enumerable: true, get: function () { return option_1.None; } });
Object.defineProperty(exports, "OptionUtils", { enumerable: true, get: function () { return option_1.OptionUtils; } });
var result_1 = require("./result");
Object.defineProperty(exports, "Result", { enumerable: true, get: function () { return result_1.Result; } });
Object.defineProperty(exports, "Ok", { enumerable: true, get: function () { return result_1.Ok; } });
Object.defineProperty(exports, "Err", { enumerable: true, get: function () { return result_1.Err; } });
Object.defineProperty(exports, "ResultUtils", { enumerable: true, get: function () { return result_1.ResultUtils; } });
var io_1 = require("./io");
Object.defineProperty(exports, "IO", { enumerable: true, get: function () { return io_1.IO; } });
Object.defineProperty(exports, "IOUtils", { enumerable: true, get: function () { return io_1.IOUtils; } });
// Function Composition Utilities
var compose_1 = require("./compose");
Object.defineProperty(exports, "identity", { enumerable: true, get: function () { return compose_1.identity; } });
Object.defineProperty(exports, "constant", { enumerable: true, get: function () { return compose_1.constant; } });
Object.defineProperty(exports, "pipe", { enumerable: true, get: function () { return compose_1.pipe; } });
Object.defineProperty(exports, "compose", { enumerable: true, get: function () { return compose_1.compose; } });
Object.defineProperty(exports, "flow", { enumerable: true, get: function () { return compose_1.flow; } });
Object.defineProperty(exports, "ComposeUtils", { enumerable: true, get: function () { return compose_1.ComposeUtils; } });
// Currying and Partial Application
var curry_1 = require("./curry");
Object.defineProperty(exports, "curry", { enumerable: true, get: function () { return curry_1.curry; } });
Object.defineProperty(exports, "curry2", { enumerable: true, get: function () { return curry_1.curry2; } });
Object.defineProperty(exports, "curry3", { enumerable: true, get: function () { return curry_1.curry3; } });
Object.defineProperty(exports, "curry4", { enumerable: true, get: function () { return curry_1.curry4; } });
Object.defineProperty(exports, "curry5", { enumerable: true, get: function () { return curry_1.curry5; } });
Object.defineProperty(exports, "uncurry", { enumerable: true, get: function () { return curry_1.uncurry; } });
Object.defineProperty(exports, "partial", { enumerable: true, get: function () { return curry_1.partial; } });
Object.defineProperty(exports, "partialRight", { enumerable: true, get: function () { return curry_1.partialRight; } });
Object.defineProperty(exports, "flip", { enumerable: true, get: function () { return curry_1.flip; } });
Object.defineProperty(exports, "arity", { enumerable: true, get: function () { return curry_1.arity; } });
Object.defineProperty(exports, "unary", { enumerable: true, get: function () { return curry_1.unary; } });
Object.defineProperty(exports, "binary", { enumerable: true, get: function () { return curry_1.binary; } });
Object.defineProperty(exports, "spread", { enumerable: true, get: function () { return curry_1.spread; } });
Object.defineProperty(exports, "unspread", { enumerable: true, get: function () { return curry_1.unspread; } });
Object.defineProperty(exports, "reverseArgs", { enumerable: true, get: function () { return curry_1.reverseArgs; } });
Object.defineProperty(exports, "CurryUtils", { enumerable: true, get: function () { return curry_1.CurryUtils; } });
// Import for internal use
const either_2 = require("./either");
const option_2 = require("./option");
const result_2 = require("./result");
const io_2 = require("./io");
const compose_2 = require("./compose");
const curry_2 = require("./curry");
/**
 * Main FP namespace containing commonly used utilities
 */
exports.FP = {
    // Monads
    Either: either_2.Either,
    Left: either_2.Left,
    Right: either_2.Right,
    Option: option_2.Option,
    Some: option_2.Some,
    None: option_2.None,
    Result: result_2.Result,
    Ok: result_2.Ok,
    Err: result_2.Err,
    IO: io_2.IO,
    // Composition
    identity: compose_2.identity,
    constant: compose_2.constant,
    pipe: compose_2.pipe,
    compose: compose_2.compose,
    flow: compose_2.flow,
    // Currying
    curry: curry_2.curry,
    curry2: curry_2.curry2,
    curry3: curry_2.curry3,
    curry4: curry_2.curry4,
    curry5: curry_2.curry5,
    partial: curry_2.partial,
    partialRight: curry_2.partialRight,
    flip: curry_2.flip,
    // Utilities
    ...either_2.EitherUtils,
    ...option_2.OptionUtils,
    ...result_2.ResultUtils,
    ...io_2.IOUtils,
    ...compose_2.ComposeUtils,
    ...curry_2.CurryUtils,
};
/**
 * Common functional programming patterns and combinators
 */
exports.Combinators = {
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
exports.Validation = {
    /**
     * Validates that a value is not null or undefined
     * @param value - Value to validate
     * @returns Option containing the value if valid
     */
    notNullish: (value) => option_2.Option.fromNullable(value),
    /**
     * Validates that a string is not empty
     * @param str - String to validate
     * @returns Option containing the string if not empty
     */
    notEmpty: (str) => str.length > 0 ? option_2.Option.some(str) : option_2.Option.none(),
    /**
     * Validates that an array is not empty
     * @param arr - Array to validate
     * @returns Option containing the array if not empty
     */
    notEmptyArray: (arr) => arr.length > 0 ? option_2.Option.some(arr) : option_2.Option.none(),
    /**
     * Validates that a number is positive
     * @param num - Number to validate
     * @returns Option containing the number if positive
     */
    positive: (num) => (num > 0 ? option_2.Option.some(num) : option_2.Option.none()),
    /**
     * Validates that a number is non-negative
     * @param num - Number to validate
     * @returns Option containing the number if non-negative
     */
    nonNegative: (num) => (num >= 0 ? option_2.Option.some(num) : option_2.Option.none()),
    /**
     * Validates using a predicate function
     * @param predicate - Predicate to test
     * @param value - Value to validate
     * @returns Option containing the value if predicate passes
     */
    validate: (predicate, value) => predicate(value) ? option_2.Option.some(value) : option_2.Option.none(),
    /**
     * Validates email format using regex
     * @param email - Email to validate
     * @returns Option containing the email if valid
     */
    email: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) ? option_2.Option.some(email) : option_2.Option.none();
    },
    /**
     * Validates URL format
     * @param url - URL to validate
     * @returns Option containing the URL if valid
     */
    url: (url) => {
        try {
            new URL(url);
            return option_2.Option.some(url);
        }
        catch {
            return option_2.Option.none();
        }
    },
};
// Default export
exports.default = exports.FP;
//# sourceMappingURL=index.js.map