/**
 * Option monad implementation for handling nullable/undefined values.
 * Represents a value that may or may not be present (Some or None).
 *
 * The Option type satisfies the monad laws:
 * - Left identity: Option.of(a).flatMap(f) === f(a)
 * - Right identity: m.flatMap(Option.of) === m
 * - Associativity: m.flatMap(f).flatMap(g) === m.flatMap(x => f(x).flatMap(g))
 */

/**
 * Abstract base class for Option monad
 */
export abstract class Option<T> {
  /**
   * Creates a Some Option containing the given value, or None if value is null/undefined
   * @param value - The value to wrap in an Option
   * @returns Some if value is not null/undefined, None otherwise
   */
  static of<T>(value: T | null | undefined): Option<T> {
    return value != null ? new Some(value) : new None<T>();
  }

  /**
   * Creates a Some Option containing the given value
   * @param value - The value to wrap in a Some
   * @returns A Some Option
   */
  static some<T>(value: T): Option<T> {
    return new Some(value);
  }

  /**
   * Creates a None Option
   * @returns A None Option
   */
  static none<T>(): Option<T> {
    return new None<T>();
  }

  /**
   * Creates an Option from a nullable value
   * @param value - Potentially null/undefined value
   * @returns Some if value exists, None otherwise
   */
  static fromNullable<T>(value: T | null | undefined): Option<T> {
    return Option.of(value);
  }

  /**
   * Executes a computation that may return null/undefined and wraps result in Option
   * @param computation - Function that may return null/undefined
   * @returns Option containing the result
   */
  static tryCatch<T>(computation: () => T | null | undefined): Option<T> {
    try {
      return Option.of(computation());
    } catch {
      return Option.none<T>();
    }
  }

  /**
   * Checks if this Option is a Some
   */
  abstract isSome(): this is Some<T>;

  /**
   * Checks if this Option is a None
   */
  abstract isNone(): this is None<T>;

  /**
   * Maps a function over the Some value, leaving None unchanged
   * @param fn - Function to apply to Some value
   * @returns New Option with transformed Some value or None
   */
  abstract map<U>(fn: (value: T) => U): Option<U>;

  /**
   * Flat maps a function over the Some value, allowing for chaining operations
   * @param fn - Function that returns an Option
   * @returns Flattened Option result
   */
  abstract flatMap<U>(fn: (value: T) => Option<U>): Option<U>;

  /**
   * Alias for flatMap (common in functional programming)
   */
  chain<U>(fn: (value: T) => Option<U>): Option<U> {
    return this.flatMap(fn);
  }

  /**
   * Folds the Option into a value by applying one of two functions
   * @param onNone - Function to apply if None
   * @param onSome - Function to apply if Some
   * @returns Result of applying the appropriate function
   */
  abstract fold<U>(onNone: () => U, onSome: (value: T) => U): U;

  /**
   * Returns the Some value or the provided default if None
   * @param defaultValue - Default value to return if None
   * @returns The Some value or default
   */
  abstract getOrElse(defaultValue: T): T;

  /**
   * Returns the Some value or the result of the provided function if None
   * @param fn - Function to compute default value
   * @returns The Some value or computed default
   */
  abstract getOrElseGet(fn: () => T): T;

  /**
   * Returns this Option if Some, otherwise returns the alternative
   * @param alternative - Alternative Option to return if this is None
   * @returns This Option if Some, otherwise alternative
   */
  abstract orElse(alternative: Option<T>): Option<T>;

  /**
   * Returns this Option if Some, otherwise returns the result of the function
   * @param fn - Function that returns an alternative Option
   * @returns This Option if Some, otherwise result of fn
   */
  abstract orElseGet(fn: () => Option<T>): Option<T>;

  /**
   * Filters the Some value with a predicate, converting to None if predicate fails
   * @param predicate - Predicate to test Some value
   * @returns Option that passes the predicate or None
   */
  abstract filter(predicate: (value: T) => boolean): Option<T>;

  /**
   * Filters the Some value with a predicate, keeping only values that don't match
   * @param predicate - Predicate to test Some value
   * @returns Option that doesn't pass the predicate or None
   */
  abstract filterNot(predicate: (value: T) => boolean): Option<T>;

  /**
   * Returns Some if this Option is None, None if this Option is Some
   * @param value - Value to wrap in Some if this is None
   * @returns Opposite Option
   */
  abstract flip<U>(value: U): Option<U>;

  /**
   * Applies a function wrapped in an Option to this Option's value
   * @param optionFn - Option containing a function
   * @returns Option with function applied
   */
  abstract ap<U>(optionFn: Option<(value: T) => U>): Option<U>;

  /**
   * Converts Option to Array
   * @returns Array with one element if Some, empty array if None
   */
  abstract toArray(): T[];

  /**
   * Converts Option to string representation
   */
  abstract toString(): string;

  /**
   * Executes a side effect if Option is Some
   * @param fn - Side effect function
   * @returns This Option unchanged
   */
  abstract tap(fn: (value: T) => void): Option<T>;

  /**
   * Converts Option to nullable value
   * @returns The value if Some, null if None
   */
  abstract toNullable(): T | null;

  /**
   * Converts Option to undefined value
   * @returns The value if Some, undefined if None
   */
  abstract toUndefined(): T | undefined;
}

/**
 * Some variant of Option representing a present value
 */
export class Some<T> extends Option<T> {
  constructor(private readonly val: T) {
    super();
  }

  isSome(): this is Some<T> {
    return true;
  }

  isNone(): this is None<T> {
    return false;
  }

  map<U>(fn: (value: T) => U): Option<U> {
    return new Some(fn(this.val));
  }

  flatMap<U>(fn: (value: T) => Option<U>): Option<U> {
    return fn(this.val);
  }

  fold<U>(_onNone: () => U, onSome: (value: T) => U): U {
    return onSome(this.val);
  }

  getOrElse(_defaultValue: T): T {
    return this.val;
  }

  getOrElseGet(_fn: () => T): T {
    return this.val;
  }

  orElse(_alternative: Option<T>): Option<T> {
    return this;
  }

  orElseGet(_fn: () => Option<T>): Option<T> {
    return this;
  }

  filter(predicate: (value: T) => boolean): Option<T> {
    return predicate(this.val) ? this : new None<T>();
  }

  filterNot(predicate: (value: T) => boolean): Option<T> {
    return !predicate(this.val) ? this : new None<T>();
  }

  flip<U>(_value: U): Option<U> {
    return new None<U>();
  }

  ap<U>(optionFn: Option<(value: T) => U>): Option<U> {
    return optionFn.flatMap((fn) => this.map(fn));
  }

  toArray(): T[] {
    return [this.val];
  }

  toString(): string {
    return `Some(${this.val})`;
  }

  tap(fn: (value: T) => void): Option<T> {
    fn(this.val);
    return this;
  }

  toNullable(): T | null {
    return this.val;
  }

  toUndefined(): T | undefined {
    return this.val;
  }

  /**
   * Gets the Some value (unsafe - only use when you know it's a Some)
   */
  get value(): T {
    return this.val;
  }
}

/**
 * None variant of Option representing an absent value
 */
export class None<T> extends Option<T> {
  isSome(): this is Some<T> {
    return false;
  }

  isNone(): this is None<T> {
    return true;
  }

  map<U>(_fn: (value: T) => U): Option<U> {
    return this as any;
  }

  flatMap<U>(_fn: (value: T) => Option<U>): Option<U> {
    return this as any;
  }

  fold<U>(onNone: () => U, _onSome: (value: T) => U): U {
    return onNone();
  }

  getOrElse(defaultValue: T): T {
    return defaultValue;
  }

  getOrElseGet(fn: () => T): T {
    return fn();
  }

  orElse(alternative: Option<T>): Option<T> {
    return alternative;
  }

  orElseGet(fn: () => Option<T>): Option<T> {
    return fn();
  }

  filter(_predicate: (value: T) => boolean): Option<T> {
    return this;
  }

  filterNot(_predicate: (value: T) => boolean): Option<T> {
    return this;
  }

  flip<U>(value: U): Option<U> {
    return new Some(value);
  }

  ap<U>(_optionFn: Option<(value: T) => U>): Option<U> {
    return this as any;
  }

  toArray(): T[] {
    return [];
  }

  toString(): string {
    return "None";
  }

  tap(_fn: (value: T) => void): Option<T> {
    return this;
  }

  toNullable(): T | null {
    return null;
  }

  toUndefined(): T | undefined {
    return undefined;
  }
}

/**
 * Utility functions for working with Option
 */
export const OptionUtils = {
  /**
   * Sequences an array of Options into an Option of array
   * @param options - Array of Options
   * @returns Option containing array of all Some values or None if any is None
   */
  sequence<T>(options: Option<T>[]): Option<T[]> {
    const results: T[] = [];
    for (const option of options) {
      if (option.isNone()) {
        return Option.none<T[]>();
      }
      results.push((option as Some<T>).value);
    }
    return Option.some(results);
  },

  /**
   * Traverses an array with a function that returns Options
   * @param items - Array of items to traverse
   * @param fn - Function that returns Option
   * @returns Option containing array of all success values or None if any fails
   */
  traverse<A, B>(items: A[], fn: (item: A) => Option<B>): Option<B[]> {
    return this.sequence(items.map(fn));
  },

  /**
   * Lifts a function to work with Option values
   * @param fn - Function to lift
   * @returns Function that works with Option values
   */
  lift<A, B>(fn: (a: A) => B): (option: Option<A>) => Option<B> {
    return (option: Option<A>) => option.map(fn);
  },

  /**
   * Lifts a binary function to work with Option values
   * @param fn - Binary function to lift
   * @returns Function that works with Option values
   */
  lift2<A, B, C>(
    fn: (a: A, b: B) => C,
  ): (optionA: Option<A>, optionB: Option<B>) => Option<C> {
    return (optionA: Option<A>, optionB: Option<B>) =>
      optionA.flatMap((a) => optionB.map((b) => fn(a, b)));
  },

  /**
   * Lifts a ternary function to work with Option values
   * @param fn - Ternary function to lift
   * @returns Function that works with Option values
   */
  lift3<A, B, C, D>(
    fn: (a: A, b: B, c: C) => D,
  ): (optionA: Option<A>, optionB: Option<B>, optionC: Option<C>) => Option<D> {
    return (optionA: Option<A>, optionB: Option<B>, optionC: Option<C>) =>
      optionA.flatMap((a) =>
        optionB.flatMap((b) => optionC.map((c) => fn(a, b, c))),
      );
  },

  /**
   * Filters an array of Options to only Some values
   * @param options - Array of Options
   * @returns Array of values from Some Options
   */
  catOptions<T>(options: Option<T>[]): T[] {
    return options
      .filter((option) => option.isSome())
      .map((option) => (option as Some<T>).value);
  },

  /**
   * Maps and filters in one operation
   * @param items - Array of items
   * @param fn - Function that returns Option
   * @returns Array of values from Some results
   */
  mapFilter<A, B>(items: A[], fn: (item: A) => Option<B>): B[] {
    return this.catOptions(items.map(fn));
  },

  /**
   * Finds the first Some value in an array of Options
   * @param options - Array of Options
   * @returns First Some Option or None if all are None
   */
  firstSome<T>(options: Option<T>[]): Option<T> {
    for (const option of options) {
      if (option.isSome()) {
        return option;
      }
    }
    return Option.none<T>();
  },
};
