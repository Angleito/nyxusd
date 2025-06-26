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
export abstract class Either<L, R> {
  /**
   * Creates a Right Either containing the given value
   * @param value - The value to wrap in a Right
   * @returns A Right Either
   */
  static of<L, R>(value: R): Either<L, R> {
    return new Right(value);
  }

  /**
   * Creates a Left Either containing the given error value
   * @param error - The error value to wrap in a Left
   * @returns A Left Either
   */
  static left<L, R>(error: L): Either<L, R> {
    return new Left(error);
  }

  /**
   * Creates a Right Either containing the given value
   * @param value - The value to wrap in a Right
   * @returns A Right Either
   */
  static right<L, R>(value: R): Either<L, R> {
    return new Right(value);
  }

  /**
   * Executes a computation that may throw and wraps the result in an Either
   * @param computation - Function that may throw an error
   * @returns Either containing the result or error
   */
  static tryCatch<L, R>(
    computation: () => R,
    onError: (error: unknown) => L = (e) => e as L
  ): Either<L, R> {
    try {
      return Either.right(computation());
    } catch (error) {
      return Either.left(onError(error));
    }
  }

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
  chain<U>(fn: (value: R) => Either<L, U>): Either<L, U> {
    return this.flatMap(fn);
  }

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
export class Left<L, R> extends Either<L, R> {
  constructor(private readonly error: L) {
    super();
  }

  isLeft(): this is Left<L, R> {
    return true;
  }

  isRight(): this is Right<L, R> {
    return false;
  }

  map<U>(_fn: (value: R) => U): Either<L, U> {
    return this as any;
  }

  mapLeft<U>(fn: (error: L) => U): Either<U, R> {
    return new Left(fn(this.error));
  }

  flatMap<U>(_fn: (value: R) => Either<L, U>): Either<L, U> {
    return this as any;
  }

  fold<U>(onLeft: (error: L) => U, _onRight: (value: R) => U): U {
    return onLeft(this.error);
  }

  getOrElse(defaultValue: R): R {
    return defaultValue;
  }

  getOrElseGet(fn: (error: L) => R): R {
    return fn(this.error);
  }

  swap(): Either<R, L> {
    return new Right(this.error);
  }

  filter(_predicate: (value: R) => boolean, _error: L): Either<L, R> {
    return this;
  }

  ap<U>(_eitherFn: Either<L, (value: R) => U>): Either<L, U> {
    return this as any;
  }

  toString(): string {
    return `Left(${this.error})`;
  }

  /**
   * Gets the Left value (unsafe - only use when you know it's a Left)
   */
  get value(): L {
    return this.error;
  }
}

/**
 * Right side of Either representing a success case
 */
export class Right<L, R> extends Either<L, R> {
  constructor(private readonly val: R) {
    super();
  }

  isLeft(): this is Left<L, R> {
    return false;
  }

  isRight(): this is Right<L, R> {
    return true;
  }

  map<U>(fn: (value: R) => U): Either<L, U> {
    return new Right(fn(this.val));
  }

  mapLeft<U>(_fn: (error: L) => U): Either<U, R> {
    return this as any;
  }

  flatMap<U>(fn: (value: R) => Either<L, U>): Either<L, U> {
    return fn(this.val);
  }

  fold<U>(_onLeft: (error: L) => U, onRight: (value: R) => U): U {
    return onRight(this.val);
  }

  getOrElse(_defaultValue: R): R {
    return this.val;
  }

  getOrElseGet(_fn: (error: L) => R): R {
    return this.val;
  }

  swap(): Either<R, L> {
    return new Left(this.val);
  }

  filter(predicate: (value: R) => boolean, error: L): Either<L, R> {
    return predicate(this.val) ? this : new Left(error);
  }

  ap<U>(eitherFn: Either<L, (value: R) => U>): Either<L, U> {
    return eitherFn.flatMap(fn => this.map(fn));
  }

  toString(): string {
    return `Right(${this.val})`;
  }

  /**
   * Gets the Right value (unsafe - only use when you know it's a Right)
   */
  get value(): R {
    return this.val;
  }
}

/**
 * Utility functions for working with Either
 */
export const EitherUtils = {
  /**
   * Sequences an array of Eithers into an Either of array
   * @param eithers - Array of Eithers
   * @returns Either containing array of all Right values or first Left
   */
  sequence<L, R>(eithers: Either<L, R>[]): Either<L, R[]> {
    const results: R[] = [];
    for (const either of eithers) {
      if (either.isLeft()) {
        return either as Either<L, R[]>;
      }
      results.push((either as Right<L, R>).value);
    }
    return Either.right(results);
  },

  /**
   * Traverses an array with a function that returns Eithers
   * @param items - Array of items to traverse
   * @param fn - Function that returns Either
   * @returns Either containing array of all success values or first error
   */
  traverse<A, L, R>(
    items: A[],
    fn: (item: A) => Either<L, R>
  ): Either<L, R[]> {
    return this.sequence(items.map(fn));
  },

  /**
   * Lifts a function to work with Either values
   * @param fn - Function to lift
   * @returns Function that works with Either values
   */
  lift<A, B>(fn: (a: A) => B): <L>(either: Either<L, A>) => Either<L, B> {
    return <L>(either: Either<L, A>) => either.map(fn);
  },

  /**
   * Lifts a binary function to work with Either values
   * @param fn - Binary function to lift
   * @returns Function that works with Either values
   */
  lift2<A, B, C>(
    fn: (a: A, b: B) => C
  ): <L>(eitherA: Either<L, A>, eitherB: Either<L, B>) => Either<L, C> {
    return <L>(eitherA: Either<L, A>, eitherB: Either<L, B>) =>
      eitherA.flatMap(a => eitherB.map(b => fn(a, b)));
  },

  /**
   * Partitions an array of Eithers into lefts and rights
   * @param eithers - Array of Eithers
   * @returns Tuple of [lefts, rights]
   */
  partition<L, R>(eithers: Either<L, R>[]): [L[], R[]] {
    const lefts: L[] = [];
    const rights: R[] = [];
    
    for (const either of eithers) {
      if (either.isLeft()) {
        lefts.push((either as Left<L, R>).value);
      } else {
        rights.push((either as Right<L, R>).value);
      }
    }
    
    return [lefts, rights];
  }
};