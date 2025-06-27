// Local functional programming utilities to avoid workspace dependency issues in Vercel

// Simple pipe function  
export function pipe<T, U>(value: T, fn: (val: T) => U): U {
  return fn(value);
}

// Simple curry function
export function curry<A, B, C>(fn: (a: A, b: B) => C): (a: A) => (b: B) => C {
  return (a: A) => (b: B) => fn(a, b);
}

// Result type classes
export class Ok<T, E> {
  public readonly value: T;
  
  constructor(value: T) {
    this.value = value;
  }
  
  isOk(): this is Ok<T, E> { 
    return true; 
  }
  
  isErr(): this is Err<T, E> { 
    return false; 
  }
}

export class Err<T, E> {
  public readonly value: E;
  
  constructor(value: E) {
    this.value = value;
  }
  
  isOk(): this is Ok<T, E> { 
    return false; 
  }
  
  isErr(): this is Err<T, E> { 
    return true; 
  }
}

// Result type
export type Result<T, E> = Ok<T, E> | Err<T, E>;

// Option type classes
export class Some<T> {
  public readonly value: T;
  
  constructor(value: T) {
    this.value = value;
  }
  
  isSome(): this is Some<T> { 
    return true; 
  }
  
  isNone(): this is None { 
    return false; 
  }
}

export class None {
  isSome(): this is Some<any> { 
    return false; 
  }
  
  isNone(): this is None { 
    return true; 
  }
}

// Option type
export type Option<T> = Some<T> | None;

// Either type classes
export class Left<L, R> {
  public readonly value: L;
  
  constructor(value: L) {
    this.value = value;
  }
  
  isLeft(): this is Left<L, R> { 
    return true; 
  }
  
  isRight(): this is Right<L, R> { 
    return false; 
  }
}

export class Right<L, R> {
  public readonly value: R;
  
  constructor(value: R) {
    this.value = value;
  }
  
  isLeft(): this is Left<L, R> { 
    return false; 
  }
  
  isRight(): this is Right<L, R> { 
    return true; 
  }
}

// Either type
export type Either<L, R> = Left<L, R> | Right<L, R>;