/**
 * Either monad implementation for handling computations that can fail.
 * Represents a value that can be either Left (error/failure) or Right (success).
 *
 * The Either type satisfies the monad laws:
 * - Left identity: Either.of(a).flatMap(f) === f(a)
 * - Right identity: m.flatMap(Either.of) === m
 * - Associativity: m.flatMap(f).flatMap(g) === m.flatMap(x => f(x).flatMap(g))
 */
/**
 * Abstract base class for Either monad
 */
export declare abstract class Either<L, R> {
  /**
   * Creates a Right Either containing the given value
   * @param value - The value to wrap in a Right
   * @returns A Right Either
   */
  static of<L, R>(value: R): Either<L, R>;
  /**
   * Creates a Left Either containing the given error value
   * @param error - The error value to wrap in a Left
   * @returns A Left Either
   */
  static left<L, R>(error: L): Either<L, R>;
  /**
   * Creates a Right Either containing the given value
   * @param value - The value to wrap in a Right
   * @returns A Right Either
   */
  static right<L, R>(value: R): Either<L, R>;
  /**
   * Executes a computation that may throw and wraps the result in an Either
   * @param computation - Function that may throw an error
   * @returns Either containing the result or error
   */
  static tryCatch<L, R>(
    computation: () => R,
    onError?: (error: unknown) => L,
  ): Either<L, R>;
  /**
   * Checks if this Either is a Left
   */
  abstract isLeft(): this is Left<L, R>;
  /**
   * Checks if this Either is a Right
   */
  abstract isRight(): this is Right<L, R>;
  /**
   * Maps a function over the Right value, leaving Left unchanged
   * @param fn - Function to apply to Right value
   * @returns New Either with transformed Right value or unchanged Left
   */
  abstract map<U>(fn: (value: R) => U): Either<L, U>;
  /**
   * Maps a function over the Left value, leaving Right unchanged
   * @param fn - Function to apply to Left value
   * @returns New Either with transformed Left value or unchanged Right
   */
  abstract mapLeft<U>(fn: (error: L) => U): Either<U, R>;
  /**
   * Flat maps a function over the Right value, allowing for chaining operations
   * @param fn - Function that returns an Either
   * @returns Flattened Either result
   */
  abstract flatMap<U>(fn: (value: R) => Either<L, U>): Either<L, U>;
  /**
   * Alias for flatMap (common in functional programming)
   */
  chain<U>(fn: (value: R) => Either<L, U>): Either<L, U>;
  /**
   * Folds the Either into a single value by applying one of two functions
   * @param onLeft - Function to apply if Left
   * @param onRight - Function to apply if Right
   * @returns Result of applying the appropriate function
   */
  abstract fold<U>(onLeft: (error: L) => U, onRight: (value: R) => U): U;
  /**
   * Returns the Right value or the provided default if Left
   * @param defaultValue - Default value to return if Left
   * @returns The Right value or default
   */
  abstract getOrElse(defaultValue: R): R;
  /**
   * Returns the Right value or the result of the provided function if Left
   * @param fn - Function to compute default value from Left
   * @returns The Right value or computed default
   */
  abstract getOrElseGet(fn: (error: L) => R): R;
  /**
   * Swaps Left and Right
   * @returns Either with Left and Right swapped
   */
  abstract swap(): Either<R, L>;
  /**
   * Filters the Right value with a predicate, converting to Left if predicate fails
   * @param predicate - Predicate to test Right value
   * @param error - Error to use if predicate fails
   * @returns Either that passes the predicate or Left with error
   */
  abstract filter(predicate: (value: R) => boolean, error: L): Either<L, R>;
  /**
   * Applies a function wrapped in an Either to this Either's value
   * @param eitherFn - Either containing a function
   * @returns Either with function applied
   */
  abstract ap<U>(eitherFn: Either<L, (value: R) => U>): Either<L, U>;
  /**
   * Converts Either to string representation
   */
  abstract toString(): string;
}
/**
 * Left side of Either representing an error or failure case
 */
export declare class Left<L, R> extends Either<L, R> {
  private readonly error;
  constructor(error: L);
  isLeft(): this is Left<L, R>;
  isRight(): this is Right<L, R>;
  map<U>(_fn: (value: R) => U): Either<L, U>;
  mapLeft<U>(fn: (error: L) => U): Either<U, R>;
  flatMap<U>(_fn: (value: R) => Either<L, U>): Either<L, U>;
  fold<U>(onLeft: (error: L) => U, _onRight: (value: R) => U): U;
  getOrElse(defaultValue: R): R;
  getOrElseGet(fn: (error: L) => R): R;
  swap(): Either<R, L>;
  filter(_predicate: (value: R) => boolean, _error: L): Either<L, R>;
  ap<U>(_eitherFn: Either<L, (value: R) => U>): Either<L, U>;
  toString(): string;
  /**
   * Gets the Left value (unsafe - only use when you know it's a Left)
   */
  get value(): L;
}
/**
 * Right side of Either representing a success case
 */
export declare class Right<L, R> extends Either<L, R> {
  private readonly val;
  constructor(val: R);
  isLeft(): this is Left<L, R>;
  isRight(): this is Right<L, R>;
  map<U>(fn: (value: R) => U): Either<L, U>;
  mapLeft<U>(_fn: (error: L) => U): Either<U, R>;
  flatMap<U>(fn: (value: R) => Either<L, U>): Either<L, U>;
  fold<U>(_onLeft: (error: L) => U, onRight: (value: R) => U): U;
  getOrElse(_defaultValue: R): R;
  getOrElseGet(_fn: (error: L) => R): R;
  swap(): Either<R, L>;
  filter(predicate: (value: R) => boolean, error: L): Either<L, R>;
  ap<U>(eitherFn: Either<L, (value: R) => U>): Either<L, U>;
  toString(): string;
  /**
   * Gets the Right value (unsafe - only use when you know it's a Right)
   */
  get value(): R;
}
/**
 * Utility functions for working with Either
 */
export declare const EitherUtils: {
  /**
   * Sequences an array of Eithers into an Either of array
   * @param eithers - Array of Eithers
   * @returns Either containing array of all Right values or first Left
   */
  sequence<L, R>(eithers: Either<L, R>[]): Either<L, R[]>;
  /**
   * Traverses an array with a function that returns Eithers
   * @param items - Array of items to traverse
   * @param fn - Function that returns Either
   * @returns Either containing array of all success values or first error
   */
  traverse<A, L, R>(items: A[], fn: (item: A) => Either<L, R>): Either<L, R[]>;
  /**
   * Lifts a function to work with Either values
   * @param fn - Function to lift
   * @returns Function that works with Either values
   */
  lift<A, B>(fn: (a: A) => B): <L>(either: Either<L, A>) => Either<L, B>;
  /**
   * Lifts a binary function to work with Either values
   * @param fn - Binary function to lift
   * @returns Function that works with Either values
   */
  lift2<A, B, C>(
    fn: (a: A, b: B) => C,
  ): <L>(eitherA: Either<L, A>, eitherB: Either<L, B>) => Either<L, C>;
  /**
   * Partitions an array of Eithers into lefts and rights
   * @param eithers - Array of Eithers
   * @returns Tuple of [lefts, rights]
   */
  partition<L, R>(eithers: Either<L, R>[]): [L[], R[]];
};
//# sourceMappingURL=either.d.ts.map
