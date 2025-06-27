// Local functional programming utilities to avoid workspace dependency issues in Vercel

// Simple pipe function
export const pipe = <T>(value: T) => ({
  pipe: <U>(fn: (val: T) => U) => pipe(fn(value))
});

// Simple curry function
export const curry = <A, B, C>(fn: (a: A, b: B) => C) => (a: A) => (b: B) => fn(a, b);

// Simple Result type implementation
export class Ok<T, E> {
  constructor(public readonly value: T) {}
  isOk(): this is Ok<T, E> { return true; }
  isErr(): this is Err<T, E> { return false; }
}

export class Err<T, E> {
  constructor(public readonly value: E) {}
  isOk(): this is Ok<T, E> { return false; }
  isErr(): this is Err<T, E> { return true; }
}

export type Result<T, E> = Ok<T, E> | Err<T, E>;

// Simple Option type
export class Some<T> {
  constructor(public readonly value: T) {}
  isSome(): this is Some<T> { return true; }
  isNone(): this is None { return false; }
}

export class None {
  isSome(): this is Some<any> { return false; }
  isNone(): this is None { return true; }
}

export type Option<T> = Some<T> | None;

// Simple Either type
export class Left<L, R> {
  constructor(public readonly value: L) {}
  isLeft(): this is Left<L, R> { return true; }
  isRight(): this is Right<L, R> { return false; }
}

export class Right<L, R> {
  constructor(public readonly value: R) {}
  isLeft(): this is Left<L, R> { return false; }
  isRight(): this is Right<L, R> { return true; }
}

export type Either<L, R> = Left<L, R> | Right<L, R>;