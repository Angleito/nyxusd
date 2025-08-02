"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultUtils = exports.Err = exports.Ok = exports.Result = void 0;
/**
 * Abstract base class for Result type
 */
class Result {
    /**
     * Creates an Ok Result containing the given value
     * @param value - The value to wrap in an Ok
     * @returns An Ok Result
     */
    static ok(value) {
        return new Ok(value);
    }
    /**
     * Creates an Err Result containing the given error
     * @param error - The error to wrap in an Err
     * @returns An Err Result
     */
    static err(error) {
        return new Err(error);
    }
    /**
     * Executes a computation that may throw and wraps the result in a Result
     * @param computation - Function that may throw an error
     * @param errorMapper - Optional function to transform caught errors
     * @returns Result containing the result or error
     */
    static tryCatch(computation, errorMapper = (e) => e) {
        try {
            return Result.ok(computation());
        }
        catch (error) {
            return Result.err(errorMapper(error));
        }
    }
    /**
     * Executes an async computation that may throw and wraps the result in a Result
     * @param computation - Async function that may throw an error
     * @param errorMapper - Optional function to transform caught errors
     * @returns Promise of Result containing the result or error
     */
    static async tryCatchAsync(computation, errorMapper = (e) => e) {
        try {
            const value = await computation();
            return Result.ok(value);
        }
        catch (error) {
            return Result.err(errorMapper(error));
        }
    }
    /**
     * Creates a Result from a Promise
     * @param promise - Promise to convert
     * @param errorMapper - Optional function to transform rejection reasons
     * @returns Promise of Result
     */
    static fromPromise(promise, errorMapper = (e) => e) {
        return promise
            .then((value) => Result.ok(value))
            .catch((error) => Result.err(errorMapper(error)));
    }
    /**
     * Alias for flatMap (common in functional programming)
     */
    chain(fn) {
        return this.flatMap(fn);
    }
}
exports.Result = Result;
/**
 * Ok variant of Result representing a successful computation
 */
class Ok extends Result {
    constructor(val) {
        super();
        this.val = val;
    }
    isOk() {
        return true;
    }
    isErr() {
        return false;
    }
    map(fn) {
        return new Ok(fn(this.val));
    }
    mapErr(_fn) {
        return this;
    }
    flatMap(fn) {
        return fn(this.val);
    }
    flatMapErr(_fn) {
        return this;
    }
    fold(_onErr, onOk) {
        return onOk(this.val);
    }
    getOrElse(_defaultValue) {
        return this.val;
    }
    getOrElseGet(_fn) {
        return this.val;
    }
    orElse(_alternative) {
        return this;
    }
    orElseGet(_fn) {
        return this;
    }
    ap(resultFn) {
        return resultFn.flatMap((fn) => this.map(fn));
    }
    tap(fn) {
        fn(this.val);
        return this;
    }
    tapErr(_fn) {
        return this;
    }
    toString() {
        return `Ok(${this.val})`;
    }
    toPromise() {
        return Promise.resolve(this.val);
    }
    toArray() {
        return [this.val];
    }
    unwrap() {
        return this.val;
    }
    expect(_message) {
        return this.val;
    }
    /**
     * Gets the Ok value (unsafe - only use when you know it's an Ok)
     */
    get value() {
        return this.val;
    }
}
exports.Ok = Ok;
/**
 * Err variant of Result representing a failed computation
 */
class Err extends Result {
    constructor(error) {
        super();
        this.error = error;
    }
    isOk() {
        return false;
    }
    isErr() {
        return true;
    }
    map(_fn) {
        return this;
    }
    mapErr(fn) {
        return new Err(fn(this.error));
    }
    flatMap(_fn) {
        return this;
    }
    flatMapErr(fn) {
        return fn(this.error);
    }
    fold(onErr, _onOk) {
        return onErr(this.error);
    }
    getOrElse(defaultValue) {
        return defaultValue;
    }
    getOrElseGet(fn) {
        return fn(this.error);
    }
    orElse(alternative) {
        return alternative;
    }
    orElseGet(fn) {
        return fn(this.error);
    }
    ap(_resultFn) {
        return this;
    }
    tap(_fn) {
        return this;
    }
    tapErr(fn) {
        fn(this.error);
        return this;
    }
    toString() {
        return `Err(${this.error})`;
    }
    toPromise() {
        return Promise.reject(this.error);
    }
    toArray() {
        return [];
    }
    unwrap() {
        throw this.error;
    }
    expect(message) {
        if (this.error instanceof Error) {
            throw new Error(`${message}: ${this.error.message}`);
        }
        throw new Error(`${message}: ${this.error}`);
    }
    /**
     * Gets the Err value (unsafe - only use when you know it's an Err)
     */
    get value() {
        return this.error;
    }
}
exports.Err = Err;
/**
 * Utility functions for working with Result
 */
exports.ResultUtils = {
    /**
     * Sequences an array of Results into a Result of array
     * @param results - Array of Results
     * @returns Result containing array of all Ok values or first Err
     */
    sequence(results) {
        const values = [];
        for (const result of results) {
            if (result.isErr()) {
                return result;
            }
            values.push(result.value);
        }
        return Result.ok(values);
    },
    /**
     * Traverses an array with a function that returns Results
     * @param items - Array of items to traverse
     * @param fn - Function that returns Result
     * @returns Result containing array of all success values or first error
     */
    traverse(items, fn) {
        return this.sequence(items.map(fn));
    },
    /**
     * Lifts a function to work with Result values
     * @param fn - Function to lift
     * @returns Function that works with Result values
     */
    lift(fn) {
        return (result) => result.map(fn);
    },
    /**
     * Lifts a binary function to work with Result values
     * @param fn - Binary function to lift
     * @returns Function that works with Result values
     */
    lift2(fn) {
        return (resultA, resultB) => resultA.flatMap((a) => resultB.map((b) => fn(a, b)));
    },
    /**
     * Partitions an array of Results into errors and successes
     * @param results - Array of Results
     * @returns Tuple of [errors, successes]
     */
    partition(results) {
        const errors = [];
        const successes = [];
        for (const result of results) {
            if (result.isErr()) {
                errors.push(result.value);
            }
            else {
                successes.push(result.value);
            }
        }
        return [errors, successes];
    },
    /**
     * Filters an array of Results to only Ok values
     * @param results - Array of Results
     * @returns Array of values from Ok Results
     */
    catOks(results) {
        return results
            .filter((result) => result.isOk())
            .map((result) => result.value);
    },
    /**
     * Filters an array of Results to only Err values
     * @param results - Array of Results
     * @returns Array of errors from Err Results
     */
    catErrs(results) {
        return results
            .filter((result) => result.isErr())
            .map((result) => result.value);
    },
    /**
     * Combines multiple Results into a single Result containing a tuple
     * @param results - Tuple of Results to combine
     * @returns Result containing tuple of all Ok values or first Err
     */
    all(...results) {
        const values = [];
        for (const result of results) {
            if (result.isErr()) {
                return result;
            }
            values.push(result.value);
        }
        return Result.ok(values);
    },
};
//# sourceMappingURL=result.js.map