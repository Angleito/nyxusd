"use strict";
/**
 * IO monad implementation for managing side effects in a pure functional way.
 * Represents a computation that performs side effects when executed.
 *
 * The IO type satisfies the monad laws:
 * - Left identity: IO.of(a).flatMap(f) === f(a)
 * - Right identity: m.flatMap(IO.of) === m
 * - Associativity: m.flatMap(f).flatMap(g) === m.flatMap(x => f(x).flatMap(g))
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IOUtils = exports.IO = void 0;
const result_1 = require("./result");
/**
 * IO monad for encapsulating side effects
 */
class IO {
    /**
     * Creates an IO that wraps the given computation
     * @param computation - The side-effectful computation to wrap
     */
    constructor(computation) {
        this.computation = computation;
    }
    /**
     * Creates an IO that returns the given value without side effects
     * @param value - The value to wrap in an IO
     * @returns An IO containing the value
     */
    static of(value) {
        return new IO(() => value);
    }
    /**
     * Creates an IO from a side-effectful computation
     * @param computation - The computation to wrap
     * @returns An IO containing the computation
     */
    static from(computation) {
        return new IO(computation);
    }
    /**
     * Creates an IO that performs no operation and returns void
     * @returns An IO that does nothing
     */
    static unit() {
        return new IO(() => { });
    }
    /**
     * Creates an IO that always throws the given error
     * @param error - The error to throw
     * @returns An IO that throws when executed
     */
    static fail(error) {
        return new IO(() => {
            throw error;
        });
    }
    /**
     * Maps a function over the IO's result
     * @param fn - Function to apply to the result
     * @returns New IO with transformed result
     */
    map(fn) {
        return new IO(() => fn(this.computation()));
    }
    /**
     * Flat maps a function over the IO's result, allowing for chaining
     * @param fn - Function that returns an IO
     * @returns Flattened IO result
     */
    flatMap(fn) {
        return new IO(() => fn(this.computation()).run());
    }
    /**
     * Alias for flatMap (common in functional programming)
     */
    chain(fn) {
        return this.flatMap(fn);
    }
    /**
     * Applies a function wrapped in an IO to this IO's value
     * @param ioFn - IO containing a function
     * @returns IO with function applied
     */
    ap(ioFn) {
        return ioFn.flatMap((fn) => this.map(fn));
    }
    /**
     * Executes this IO and then the provided IO, returning the second result
     * @param next - IO to execute after this one
     * @returns Result of the second IO
     */
    then(next) {
        return this.flatMap(() => next);
    }
    /**
     * Executes this IO and returns its result, ignoring the next IO's result
     * @param next - IO to execute after this one
     * @returns Result of this IO
     */
    before(next) {
        return this.flatMap((value) => next.map(() => value));
    }
    /**
     * Executes a side effect with the IO's result and returns the original result
     * @param fn - Side effect function
     * @returns This IO unchanged
     */
    tap(fn) {
        return this.map((value) => {
            fn(value);
            return value;
        });
    }
    /**
     * Executes a side effect IO with the result and returns the original result
     * @param fn - Function that returns an IO for side effects
     * @returns This IO with side effects applied
     */
    tapIO(fn) {
        return this.flatMap((value) => fn(value).map(() => value));
    }
    /**
     * Catches errors and recovers with an alternative IO
     * @param recovery - Function that returns recovery IO from error
     * @returns IO that recovers from errors
     */
    recover(recovery) {
        return new IO(() => {
            try {
                return this.computation();
            }
            catch (error) {
                if (error instanceof Error) {
                    return recovery(error).run();
                }
                return recovery(new Error(String(error))).run();
            }
        });
    }
    /**
     * Catches errors and recovers with a default value
     * @param defaultValue - Default value to use on error
     * @returns IO that provides default on error
     */
    recoverWith(defaultValue) {
        return this.recover(() => IO.of(defaultValue));
    }
    /**
     * Converts the IO to a safe version that returns a Result
     * @returns IO that returns Result instead of throwing
     */
    attempt() {
        return new IO(() => {
            try {
                return result_1.Result.ok(this.computation());
            }
            catch (error) {
                return result_1.Result.err(error instanceof Error ? error : new Error(String(error)));
            }
        });
    }
    /**
     * Repeats this IO a specified number of times
     * @param times - Number of times to repeat
     * @returns IO that repeats the computation
     */
    repeat(times) {
        return new IO(() => {
            const results = [];
            for (let i = 0; i < times; i++) {
                results.push(this.computation());
            }
            return results;
        });
    }
    /**
     * Retries this IO up to a maximum number of attempts on failure
     * @param maxAttempts - Maximum number of retry attempts
     * @param delay - Optional delay between retries in milliseconds
     * @returns IO that retries on failure
     */
    retry(maxAttempts, delay) {
        return new IO(() => {
            let lastError;
            for (let attempt = 0; attempt <= maxAttempts; attempt++) {
                try {
                    return this.computation();
                }
                catch (error) {
                    lastError = error instanceof Error ? error : new Error(String(error));
                    if (attempt < maxAttempts && delay && delay > 0) {
                        // Synchronous delay (not recommended for production, but keeps IO pure)
                        const start = Date.now();
                        while (Date.now() - start < delay) {
                            // Busy wait
                        }
                    }
                }
            }
            throw lastError ?? new Error("Maximum retry attempts exceeded");
        });
    }
    /**
     * Times out the IO after a specified duration
     * @param timeoutMs - Timeout in milliseconds
     * @param timeoutError - Optional custom timeout error
     * @returns IO that times out
     */
    timeout(timeoutMs, timeoutError) {
        return new IO(() => {
            const startTime = Date.now();
            const result = this.computation();
            const elapsed = Date.now() - startTime;
            if (elapsed > timeoutMs) {
                throw (timeoutError || new Error(`Operation timed out after ${timeoutMs}ms`));
            }
            return result;
        });
    }
    /**
     * Measures the execution time of this IO
     * @returns IO that returns a tuple of [result, executionTimeMs]
     */
    timed() {
        return new IO(() => {
            const start = Date.now();
            const result = this.computation();
            const end = Date.now();
            return [result, end - start];
        });
    }
    /**
     * Filters the IO result with a predicate, throwing an error if predicate fails
     * @param predicate - Predicate to test the result
     * @param error - Error to throw if predicate fails
     * @returns IO that validates the result
     */
    filter(predicate, error) {
        return this.map((value) => {
            if (!predicate(value)) {
                throw error;
            }
            return value;
        });
    }
    /**
     * Executes the IO computation and returns the result
     * @returns The result of the computation
     */
    run() {
        return this.computation();
    }
    /**
     * Alias for run() - executes the IO computation
     * @returns The result of the computation
     */
    execute() {
        return this.run();
    }
    /**
     * Converts the IO to a Promise
     * @returns Promise that resolves with the IO result
     */
    toPromise() {
        return new Promise((resolve, reject) => {
            try {
                resolve(this.run());
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /**
     * Converts the IO to a string representation
     */
    toString() {
        return "IO(<computation>)";
    }
}
exports.IO = IO;
/**
 * Utility functions for working with IO
 */
exports.IOUtils = {
    /**
     * Sequences an array of IOs into an IO of array
     * @param ios - Array of IOs
     * @returns IO containing array of all results
     */
    sequence(ios) {
        return new IO(() => ios.map((io) => io.run()));
    },
    /**
     * Traverses an array with a function that returns IOs
     * @param items - Array of items to traverse
     * @param fn - Function that returns IO
     * @returns IO containing array of all results
     */
    traverse(items, fn) {
        return this.sequence(items.map(fn));
    },
    /**
     * Executes IOs in parallel (as much as possible in synchronous context)
     * @param ios - Array of IOs to execute
     * @returns IO containing array of results
     */
    parallel(ios) {
        return this.sequence(ios);
    },
    /**
     * Races multiple IOs and returns the first successful result
     * Note: In synchronous context, this just executes the first IO
     * @param ios - Array of IOs to race
     * @returns IO containing the first result
     */
    race(ios) {
        return new IO(() => {
            if (ios.length === 0) {
                throw new Error("Cannot race empty array of IOs");
            }
            return ios[0].run();
        });
    },
    /**
     * Lifts a function to work with IO values
     * @param fn - Function to lift
     * @returns Function that works with IO values
     */
    lift(fn) {
        return (io) => io.map(fn);
    },
    /**
     * Lifts a binary function to work with IO values
     * @param fn - Binary function to lift
     * @returns Function that works with IO values
     */
    lift2(fn) {
        return (ioA, ioB) => ioA.flatMap((a) => ioB.map((b) => fn(a, b)));
    },
    /**
     * Creates an IO that performs console.log
     * @param message - Message to log
     * @returns IO that logs the message
     */
    log(message) {
        return new IO(() => console.log(message));
    },
    /**
     * Creates an IO that performs console.error
     * @param message - Error message to log
     * @returns IO that logs the error
     */
    logError(message) {
        return new IO(() => console.error(message));
    },
    /**
     * Creates an IO that reads from localStorage
     * @param key - Storage key
     * @returns IO that reads from storage
     */
    readStorage(key) {
        return new IO(() => {
            if (typeof localStorage !== "undefined") {
                return localStorage.getItem(key);
            }
            throw new Error("localStorage is not available");
        });
    },
    /**
     * Creates an IO that writes to localStorage
     * @param key - Storage key
     * @param value - Value to store
     * @returns IO that writes to storage
     */
    writeStorage(key, value) {
        return new IO(() => {
            if (typeof localStorage !== "undefined") {
                localStorage.setItem(key, value);
            }
            else {
                throw new Error("localStorage is not available");
            }
        });
    },
    /**
     * Creates an IO that gets the current timestamp
     * @returns IO that returns current timestamp
     */
    now() {
        return new IO(() => Date.now());
    },
    /**
     * Creates an IO that generates a random number
     * @returns IO that returns a random number
     */
    random() {
        return new IO(() => Math.random());
    },
    /**
     * Creates an IO that delays execution (busy wait)
     * @param ms - Milliseconds to delay
     * @returns IO that delays
     */
    delay(ms) {
        return new IO(() => {
            const start = Date.now();
            while (Date.now() - start < ms) {
                // Busy wait
            }
        });
    },
    /**
     * Conditionally executes an IO
     * @param condition - Condition to check
     * @param ioTrue - IO to execute if true
     * @param ioFalse - IO to execute if false
     * @returns Conditional IO
     */
    when(condition, ioTrue, ioFalse) {
        return condition ? ioTrue : ioFalse;
    },
    /**
     * Executes an IO only if condition is true, otherwise returns unit
     * @param condition - Condition to check
     * @param io - IO to execute if true
     * @returns Conditional IO or unit
     */
    unless(condition, io) {
        return condition ? IO.unit() : io;
    },
};
//# sourceMappingURL=io.js.map