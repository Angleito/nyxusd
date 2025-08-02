"use strict";
/**
 * Function composition utilities for creating pipelines and combining functions.
 * Provides pipe (left-to-right) and compose (right-to-left) function composition.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComposeUtils = exports.constant = exports.identity = void 0;
exports.pipe = pipe;
exports.compose = compose;
exports.flow = flow;
/**
 * Identity function - returns its input unchanged
 * @param x - Input value
 * @returns The same input value
 */
const identity = (x) => x;
exports.identity = identity;
/**
 * Constant function - returns a function that always returns the same value
 * @param value - Value to always return
 * @returns Function that always returns the value
 */
const constant = (value) => () => value;
exports.constant = constant;
// Implementation
function pipe(value, ...fns) {
    return fns.reduce((acc, fn) => fn(acc), value);
}
// Implementation
function compose(...fns) {
    return (value) => fns.reduceRight((acc, fn) => fn(acc), value);
}
// Implementation
function flow(...fns) {
    return (value) => fns.reduce((acc, fn) => fn(acc), value);
}
/**
 * Utility functions for function composition
 */
exports.ComposeUtils = {
    /**
     * Creates a function that applies a predicate and branches to different functions
     * @param predicate - Condition to test
     * @param onTrue - Function to apply if predicate is true
     * @param onFalse - Function to apply if predicate is false
     * @returns Branching function
     */
    branch: (predicate, onTrue, onFalse) => (value) => {
        return predicate(value) ? onTrue(value) : onFalse(value);
    },
    /**
     * Creates a function that applies different functions based on conditions
     * @param cases - Array of [predicate, function] pairs
     * @param defaultFn - Default function if no predicates match
     * @returns Function that applies the first matching case
     */
    cond: (cases, defaultFn) => (value) => {
        for (const [predicate, fn] of cases) {
            if (predicate(value)) {
                return fn(value);
            }
        }
        return defaultFn(value);
    },
    /**
     * Creates a function that applies a transformation only if predicate is true
     * @param predicate - Condition to test
     * @param transform - Function to apply if predicate is true
     * @returns Function that conditionally transforms
     */
    when: (predicate, transform) => (value) => {
        return predicate(value) ? transform(value) : value;
    },
    /**
     * Creates a function that applies a transformation only if predicate is false
     * @param predicate - Condition to test
     * @param transform - Function to apply if predicate is false
     * @returns Function that conditionally transforms
     */
    unless: (predicate, transform) => (value) => {
        return predicate(value) ? value : transform(value);
    },
    /**
     * Creates a function that applies a side effect and returns the original value
     * @param sideEffect - Function to execute for side effects
     * @returns Function that applies side effect and returns original value
     */
    tap: (sideEffect) => (value) => {
        sideEffect(value);
        return value;
    },
    /**
     * Creates a function that traces values through a pipeline for debugging
     * @param label - Optional label for the trace
     * @returns Function that logs the value and returns it unchanged
     */
    trace: (label) => (value) => {
        const message = label ? `${label}:` : "Trace:";
        console.log(message, value);
        return value;
    },
    /**
     * Memoizes a function to cache results based on arguments
     * @param fn - Function to memoize
     * @param keyFn - Optional function to generate cache key
     * @returns Memoized function
     */
    memoize: (fn, keyFn = (...args) => JSON.stringify(args)) => {
        const cache = new Map();
        return (...args) => {
            const key = keyFn(...args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = fn(...args);
            cache.set(key, result);
            return result;
        };
    },
    /**
     * Creates a debounced version of a function
     * @param fn - Function to debounce
     * @param delay - Delay in milliseconds
     * @returns Debounced function
     */
    debounce: (fn, delay) => {
        let timeoutId = null;
        return (...args) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => fn(...args), delay);
        };
    },
    /**
     * Creates a throttled version of a function
     * @param fn - Function to throttle
     * @param interval - Interval in milliseconds
     * @returns Throttled function
     */
    throttle: (fn, interval) => {
        let lastCall = 0;
        return (...args) => {
            const now = Date.now();
            if (now - lastCall >= interval) {
                lastCall = now;
                return fn(...args);
            }
            return undefined;
        };
    },
    /**
     * Creates a function that retries on failure
     * @param fn - Function to retry
     * @param maxAttempts - Maximum number of attempts
     * @param delay - Delay between attempts in milliseconds
     * @returns Function that retries on failure
     */
    retry: (fn, maxAttempts, delay = 0) => (...args) => {
        let lastError;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                return fn(...args);
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                if (attempt < maxAttempts - 1 && delay > 0) {
                    // Synchronous delay
                    const start = Date.now();
                    while (Date.now() - start < delay) {
                        // Busy wait
                    }
                }
            }
        }
        throw lastError;
    },
};
//# sourceMappingURL=compose.js.map