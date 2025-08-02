"use strict";
/**
 * Option monad implementation for handling nullable/undefined values.
 * Represents a value that may or may not be present (Some or None).
 *
 * The Option type satisfies the monad laws:
 * - Left identity: Option.of(a).flatMap(f) === f(a)
 * - Right identity: m.flatMap(Option.of) === m
 * - Associativity: m.flatMap(f).flatMap(g) === m.flatMap(x => f(x).flatMap(g))
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionUtils = exports.None = exports.Some = exports.Option = void 0;
/**
 * Abstract base class for Option monad
 */
class Option {
    /**
     * Creates a Some Option containing the given value, or None if value is null/undefined
     * @param value - The value to wrap in an Option
     * @returns Some if value is not null/undefined, None otherwise
     */
    static of(value) {
        return value != null ? new Some(value) : new None();
    }
    /**
     * Creates a Some Option containing the given value
     * @param value - The value to wrap in a Some
     * @returns A Some Option
     */
    static some(value) {
        return new Some(value);
    }
    /**
     * Creates a None Option
     * @returns A None Option
     */
    static none() {
        return new None();
    }
    /**
     * Creates an Option from a nullable value
     * @param value - Potentially null/undefined value
     * @returns Some if value exists, None otherwise
     */
    static fromNullable(value) {
        return Option.of(value);
    }
    /**
     * Executes a computation that may return null/undefined and wraps result in Option
     * @param computation - Function that may return null/undefined
     * @returns Option containing the result
     */
    static tryCatch(computation) {
        try {
            return Option.of(computation());
        }
        catch {
            return Option.none();
        }
    }
    /**
     * Alias for flatMap (common in functional programming)
     */
    chain(fn) {
        return this.flatMap(fn);
    }
}
exports.Option = Option;
/**
 * Some variant of Option representing a present value
 */
class Some extends Option {
    constructor(val) {
        super();
        this.val = val;
    }
    isSome() {
        return true;
    }
    isNone() {
        return false;
    }
    map(fn) {
        return new Some(fn(this.val));
    }
    flatMap(fn) {
        return fn(this.val);
    }
    fold(_onNone, onSome) {
        return onSome(this.val);
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
    filter(predicate) {
        return predicate(this.val) ? this : new None();
    }
    filterNot(predicate) {
        return !predicate(this.val) ? this : new None();
    }
    flip(_value) {
        return new None();
    }
    ap(optionFn) {
        return optionFn.flatMap((fn) => this.map(fn));
    }
    toArray() {
        return [this.val];
    }
    toString() {
        return `Some(${this.val})`;
    }
    tap(fn) {
        fn(this.val);
        return this;
    }
    toNullable() {
        return this.val;
    }
    toUndefined() {
        return this.val;
    }
    /**
     * Gets the Some value (unsafe - only use when you know it's a Some)
     */
    get value() {
        return this.val;
    }
}
exports.Some = Some;
/**
 * None variant of Option representing an absent value
 */
class None extends Option {
    isSome() {
        return false;
    }
    isNone() {
        return true;
    }
    map(_fn) {
        return this;
    }
    flatMap(_fn) {
        return this;
    }
    fold(onNone, _onSome) {
        return onNone();
    }
    getOrElse(defaultValue) {
        return defaultValue;
    }
    getOrElseGet(fn) {
        return fn();
    }
    orElse(alternative) {
        return alternative;
    }
    orElseGet(fn) {
        return fn();
    }
    filter(_predicate) {
        return this;
    }
    filterNot(_predicate) {
        return this;
    }
    flip(value) {
        return new Some(value);
    }
    ap(_optionFn) {
        return this;
    }
    toArray() {
        return [];
    }
    toString() {
        return "None";
    }
    tap(_fn) {
        return this;
    }
    toNullable() {
        return null;
    }
    toUndefined() {
        return undefined;
    }
}
exports.None = None;
/**
 * Utility functions for working with Option
 */
exports.OptionUtils = {
    /**
     * Sequences an array of Options into an Option of array
     * @param options - Array of Options
     * @returns Option containing array of all Some values or None if any is None
     */
    sequence(options) {
        const results = [];
        for (const option of options) {
            if (option.isNone()) {
                return Option.none();
            }
            results.push(option.value);
        }
        return Option.some(results);
    },
    /**
     * Traverses an array with a function that returns Options
     * @param items - Array of items to traverse
     * @param fn - Function that returns Option
     * @returns Option containing array of all success values or None if any fails
     */
    traverse(items, fn) {
        return this.sequence(items.map(fn));
    },
    /**
     * Lifts a function to work with Option values
     * @param fn - Function to lift
     * @returns Function that works with Option values
     */
    lift(fn) {
        return (option) => option.map(fn);
    },
    /**
     * Lifts a binary function to work with Option values
     * @param fn - Binary function to lift
     * @returns Function that works with Option values
     */
    lift2(fn) {
        return (optionA, optionB) => optionA.flatMap((a) => optionB.map((b) => fn(a, b)));
    },
    /**
     * Lifts a ternary function to work with Option values
     * @param fn - Ternary function to lift
     * @returns Function that works with Option values
     */
    lift3(fn) {
        return (optionA, optionB, optionC) => optionA.flatMap((a) => optionB.flatMap((b) => optionC.map((c) => fn(a, b, c))));
    },
    /**
     * Filters an array of Options to only Some values
     * @param options - Array of Options
     * @returns Array of values from Some Options
     */
    catOptions(options) {
        return options
            .filter((option) => option.isSome())
            .map((option) => option.value);
    },
    /**
     * Maps and filters in one operation
     * @param items - Array of items
     * @param fn - Function that returns Option
     * @returns Array of values from Some results
     */
    mapFilter(items, fn) {
        return this.catOptions(items.map(fn));
    },
    /**
     * Finds the first Some value in an array of Options
     * @param options - Array of Options
     * @returns First Some Option or None if all are None
     */
    firstSome(options) {
        for (const option of options) {
            if (option.isSome()) {
                return option;
            }
        }
        return Option.none();
    },
};
//# sourceMappingURL=option.js.map