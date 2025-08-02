/**
 * IO monad implementation for managing side effects in a pure functional way.
 * Represents a computation that performs side effects when executed.
 *
 * The IO type satisfies the monad laws:
 * - Left identity: IO.of(a).flatMap(f) === f(a)
 * - Right identity: m.flatMap(IO.of) === m
 * - Associativity: m.flatMap(f).flatMap(g) === m.flatMap(x => f(x).flatMap(g))
 */
import { Result } from "./result";
/**
 * IO monad for encapsulating side effects
 */
export declare class IO<T> {
    private readonly computation;
    /**
     * Creates an IO that wraps the given computation
     * @param computation - The side-effectful computation to wrap
     */
    constructor(computation: () => T);
    /**
     * Creates an IO that returns the given value without side effects
     * @param value - The value to wrap in an IO
     * @returns An IO containing the value
     */
    static of<T>(value: T): IO<T>;
    /**
     * Creates an IO from a side-effectful computation
     * @param computation - The computation to wrap
     * @returns An IO containing the computation
     */
    static from<T>(computation: () => T): IO<T>;
    /**
     * Creates an IO that performs no operation and returns void
     * @returns An IO that does nothing
     */
    static unit(): IO<void>;
    /**
     * Creates an IO that always throws the given error
     * @param error - The error to throw
     * @returns An IO that throws when executed
     */
    static fail<T>(error: Error): IO<T>;
    /**
     * Maps a function over the IO's result
     * @param fn - Function to apply to the result
     * @returns New IO with transformed result
     */
    map<U>(fn: (value: T) => U): IO<U>;
    /**
     * Flat maps a function over the IO's result, allowing for chaining
     * @param fn - Function that returns an IO
     * @returns Flattened IO result
     */
    flatMap<U>(fn: (value: T) => IO<U>): IO<U>;
    /**
     * Alias for flatMap (common in functional programming)
     */
    chain<U>(fn: (value: T) => IO<U>): IO<U>;
    /**
     * Applies a function wrapped in an IO to this IO's value
     * @param ioFn - IO containing a function
     * @returns IO with function applied
     */
    ap<U>(ioFn: IO<(value: T) => U>): IO<U>;
    /**
     * Executes this IO and then the provided IO, returning the second result
     * @param next - IO to execute after this one
     * @returns Result of the second IO
     */
    then<U>(next: IO<U>): IO<U>;
    /**
     * Executes this IO and returns its result, ignoring the next IO's result
     * @param next - IO to execute after this one
     * @returns Result of this IO
     */
    before<U>(next: IO<U>): IO<T>;
    /**
     * Executes a side effect with the IO's result and returns the original result
     * @param fn - Side effect function
     * @returns This IO unchanged
     */
    tap(fn: (value: T) => void): IO<T>;
    /**
     * Executes a side effect IO with the result and returns the original result
     * @param fn - Function that returns an IO for side effects
     * @returns This IO with side effects applied
     */
    tapIO(fn: (value: T) => IO<any>): IO<T>;
    /**
     * Catches errors and recovers with an alternative IO
     * @param recovery - Function that returns recovery IO from error
     * @returns IO that recovers from errors
     */
    recover(recovery: (error: Error) => IO<T>): IO<T>;
    /**
     * Catches errors and recovers with a default value
     * @param defaultValue - Default value to use on error
     * @returns IO that provides default on error
     */
    recoverWith(defaultValue: T): IO<T>;
    /**
     * Converts the IO to a safe version that returns a Result
     * @returns IO that returns Result instead of throwing
     */
    attempt(): IO<Result<T, Error>>;
    /**
     * Repeats this IO a specified number of times
     * @param times - Number of times to repeat
     * @returns IO that repeats the computation
     */
    repeat(times: number): IO<T[]>;
    /**
     * Retries this IO up to a maximum number of attempts on failure
     * @param maxAttempts - Maximum number of retry attempts
     * @param delay - Optional delay between retries in milliseconds
     * @returns IO that retries on failure
     */
    retry(maxAttempts: number, delay?: number): IO<T>;
    /**
     * Times out the IO after a specified duration
     * @param timeoutMs - Timeout in milliseconds
     * @param timeoutError - Optional custom timeout error
     * @returns IO that times out
     */
    timeout(timeoutMs: number, timeoutError?: Error): IO<T>;
    /**
     * Measures the execution time of this IO
     * @returns IO that returns a tuple of [result, executionTimeMs]
     */
    timed(): IO<[T, number]>;
    /**
     * Filters the IO result with a predicate, throwing an error if predicate fails
     * @param predicate - Predicate to test the result
     * @param error - Error to throw if predicate fails
     * @returns IO that validates the result
     */
    filter(predicate: (value: T) => boolean, error: Error): IO<T>;
    /**
     * Executes the IO computation and returns the result
     * @returns The result of the computation
     */
    run(): T;
    /**
     * Alias for run() - executes the IO computation
     * @returns The result of the computation
     */
    execute(): T;
    /**
     * Converts the IO to a Promise
     * @returns Promise that resolves with the IO result
     */
    toPromise(): Promise<T>;
    /**
     * Converts the IO to a string representation
     */
    toString(): string;
}
/**
 * Utility functions for working with IO
 */
export declare const IOUtils: {
    /**
     * Sequences an array of IOs into an IO of array
     * @param ios - Array of IOs
     * @returns IO containing array of all results
     */
    sequence<T>(ios: IO<T>[]): IO<T[]>;
    /**
     * Traverses an array with a function that returns IOs
     * @param items - Array of items to traverse
     * @param fn - Function that returns IO
     * @returns IO containing array of all results
     */
    traverse<A, B>(items: A[], fn: (item: A) => IO<B>): IO<B[]>;
    /**
     * Executes IOs in parallel (as much as possible in synchronous context)
     * @param ios - Array of IOs to execute
     * @returns IO containing array of results
     */
    parallel<T>(ios: IO<T>[]): IO<T[]>;
    /**
     * Races multiple IOs and returns the first successful result
     * Note: In synchronous context, this just executes the first IO
     * @param ios - Array of IOs to race
     * @returns IO containing the first result
     */
    race<T>(ios: IO<T>[]): IO<T>;
    /**
     * Lifts a function to work with IO values
     * @param fn - Function to lift
     * @returns Function that works with IO values
     */
    lift<A, B>(fn: (a: A) => B): (io: IO<A>) => IO<B>;
    /**
     * Lifts a binary function to work with IO values
     * @param fn - Binary function to lift
     * @returns Function that works with IO values
     */
    lift2<A, B, C>(fn: (a: A, b: B) => C): (ioA: IO<A>, ioB: IO<B>) => IO<C>;
    /**
     * Creates an IO that performs console.log
     * @param message - Message to log
     * @returns IO that logs the message
     */
    log(message: any): IO<void>;
    /**
     * Creates an IO that performs console.error
     * @param message - Error message to log
     * @returns IO that logs the error
     */
    logError(message: any): IO<void>;
    /**
     * Creates an IO that reads from localStorage
     * @param key - Storage key
     * @returns IO that reads from storage
     */
    readStorage(key: string): IO<string | null>;
    /**
     * Creates an IO that writes to localStorage
     * @param key - Storage key
     * @param value - Value to store
     * @returns IO that writes to storage
     */
    writeStorage(key: string, value: string): IO<void>;
    /**
     * Creates an IO that gets the current timestamp
     * @returns IO that returns current timestamp
     */
    now(): IO<number>;
    /**
     * Creates an IO that generates a random number
     * @returns IO that returns a random number
     */
    random(): IO<number>;
    /**
     * Creates an IO that delays execution (busy wait)
     * @param ms - Milliseconds to delay
     * @returns IO that delays
     */
    delay(ms: number): IO<void>;
    /**
     * Conditionally executes an IO
     * @param condition - Condition to check
     * @param ioTrue - IO to execute if true
     * @param ioFalse - IO to execute if false
     * @returns Conditional IO
     */
    when<T>(condition: boolean, ioTrue: IO<T>, ioFalse: IO<T>): IO<T>;
    /**
     * Executes an IO only if condition is true, otherwise returns unit
     * @param condition - Condition to check
     * @param io - IO to execute if true
     * @returns Conditional IO or unit
     */
    unless(condition: boolean, io: IO<void>): IO<void>;
};
//# sourceMappingURL=io.d.ts.map