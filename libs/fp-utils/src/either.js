"use strict";
/**
 * Either monad implementation for handling computations that can fail.
 * Represents a value that can be either Left (error/failure) or Right (success).
 *
 * The Either type satisfies the monad laws:
 * - Left identity: Either.of(a).flatMap(f) === f(a)
 * - Right identity: m.flatMap(Either.of) === m
 * - Associativity: m.flatMap(f).flatMap(g) === m.flatMap(x => f(x).flatMap(g))
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EitherUtils = exports.Right = exports.Left = exports.Either = void 0;
/**
 * Abstract base class for Either monad
 */
class Either {
    /**
     * Creates a Right Either containing the given value
     * @param value - The value to wrap in a Right
     * @returns A Right Either
     */
    static of(value) {
        return new Right(value);
    }
    /**
     * Creates a Left Either containing the given error value
     * @param error - The error value to wrap in a Left
     * @returns A Left Either
     */
    static left(error) {
        return new Left(error);
    }
    /**
     * Creates a Right Either containing the given value
     * @param value - The value to wrap in a Right
     * @returns A Right Either
     */
    static right(value) {
        return new Right(value);
    }
    /**
     * Executes a computation that may throw and wraps the result in an Either
     * @param computation - Function that may throw an error
     * @returns Either containing the result or error
     */
    static tryCatch(computation, onError = (e) => e) {
        try {
            return Either.right(computation());
        }
        catch (error) {
            return Either.left(onError(error));
        }
    }
    /**
     * Alias for flatMap (common in functional programming)
     */
    chain(fn) {
        return this.flatMap(fn);
    }
}
exports.Either = Either;
/**
 * Left side of Either representing an error or failure case
 */
class Left extends Either {
    constructor(error) {
        super();
        this.error = error;
    }
    isLeft() {
        return true;
    }
    isRight() {
        return false;
    }
    map(_fn) {
        return this;
    }
    mapLeft(fn) {
        return new Left(fn(this.error));
    }
    flatMap(_fn) {
        return this;
    }
    fold(onLeft, _onRight) {
        return onLeft(this.error);
    }
    getOrElse(defaultValue) {
        return defaultValue;
    }
    getOrElseGet(fn) {
        return fn(this.error);
    }
    swap() {
        return new Right(this.error);
    }
    filter(_predicate, _error) {
        return this;
    }
    ap(_eitherFn) {
        return this;
    }
    toString() {
        return `Left(${this.error})`;
    }
    /**
     * Gets the Left value (unsafe - only use when you know it's a Left)
     */
    get value() {
        return this.error;
    }
}
exports.Left = Left;
/**
 * Right side of Either representing a success case
 */
class Right extends Either {
    constructor(val) {
        super();
        this.val = val;
    }
    isLeft() {
        return false;
    }
    isRight() {
        return true;
    }
    map(fn) {
        return new Right(fn(this.val));
    }
    mapLeft(_fn) {
        return this;
    }
    flatMap(fn) {
        return fn(this.val);
    }
    fold(_onLeft, onRight) {
        return onRight(this.val);
    }
    getOrElse(_defaultValue) {
        return this.val;
    }
    getOrElseGet(_fn) {
        return this.val;
    }
    swap() {
        return new Left(this.val);
    }
    filter(predicate, error) {
        return predicate(this.val) ? this : new Left(error);
    }
    ap(eitherFn) {
        return eitherFn.flatMap((fn) => this.map(fn));
    }
    toString() {
        return `Right(${this.val})`;
    }
    /**
     * Gets the Right value (unsafe - only use when you know it's a Right)
     */
    get value() {
        return this.val;
    }
}
exports.Right = Right;
/**
 * Utility functions for working with Either
 */
exports.EitherUtils = {
    /**
     * Sequences an array of Eithers into an Either of array
     * @param eithers - Array of Eithers
     * @returns Either containing array of all Right values or first Left
     */
    sequence(eithers) {
        const results = [];
        for (const either of eithers) {
            if (either.isLeft()) {
                return either;
            }
            results.push(either.value);
        }
        return Either.right(results);
    },
    /**
     * Traverses an array with a function that returns Eithers
     * @param items - Array of items to traverse
     * @param fn - Function that returns Either
     * @returns Either containing array of all success values or first error
     */
    traverse(items, fn) {
        return this.sequence(items.map(fn));
    },
    /**
     * Lifts a function to work with Either values
     * @param fn - Function to lift
     * @returns Function that works with Either values
     */
    lift(fn) {
        return (either) => either.map(fn);
    },
    /**
     * Lifts a binary function to work with Either values
     * @param fn - Binary function to lift
     * @returns Function that works with Either values
     */
    lift2(fn) {
        return (eitherA, eitherB) => eitherA.flatMap((a) => eitherB.map((b) => fn(a, b)));
    },
    /**
     * Partitions an array of Eithers into lefts and rights
     * @param eithers - Array of Eithers
     * @returns Tuple of [lefts, rights]
     */
    partition(eithers) {
        const lefts = [];
        const rights = [];
        for (const either of eithers) {
            if (either.isLeft()) {
                lefts.push(either.value);
            }
            else {
                rights.push(either.value);
            }
        }
        return [lefts, rights];
    },
};
//# sourceMappingURL=either.js.map