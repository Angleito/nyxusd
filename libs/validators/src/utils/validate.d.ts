import { z } from "zod";
/**
 * Generic validation functions with Result types for error handling
 * Integrates with fp-utils Result types for functional composition
 */
export type Result<T, E = Error> = {
    readonly success: true;
    readonly data: T;
} | {
    readonly success: false;
    readonly error: E;
};
export interface ValidationError {
    readonly code: string;
    readonly message: string;
    readonly field?: string | undefined;
    readonly details?: Record<string, unknown> | undefined;
}
export interface ValidationOptions {
    readonly abortEarly?: boolean;
    readonly stripUnknown?: boolean;
    readonly errorMap?: z.ZodErrorMap;
    readonly context?: Record<string, unknown>;
}
/**
 * Core validation functions
 */
export declare const success: <T>(data: T) => Result<T, ValidationError>;
export declare const failure: (error: ValidationError) => Result<never, ValidationError>;
export declare const zodErrorToValidationError: (zodError: z.ZodError, context?: Record<string, unknown>) => ValidationError;
export declare const validate: <T>(schema: z.ZodSchema<T>, data: unknown, options?: ValidationOptions) => Result<T, ValidationError>;
export declare const validateAsync: <T>(schema: z.ZodSchema<T>, data: unknown, options?: ValidationOptions) => Promise<Result<T, ValidationError>>;
export declare const validatePartial: <T extends Record<string, unknown>>(schema: z.ZodObject<z.ZodRawShape>, data: unknown, options?: ValidationOptions) => Result<Partial<T>, ValidationError>;
export declare const validateArray: <T>(schema: z.ZodSchema<T>, array: unknown[], options?: ValidationOptions) => Result<T[], ValidationError[]>;
export declare const validateObject: <T extends Record<string, z.ZodSchema<any>>>(schemaObj: T, data: Record<string, unknown>, options?: ValidationOptions) => Result<{ [K in keyof T]: z.infer<T[K]>; }, Record<string, ValidationError>>;
/**
 * Functional composition utilities
 */
export declare const chain: <T, U>(result: Result<T, ValidationError>, fn: (data: T) => Result<U, ValidationError>) => Result<U, ValidationError>;
export declare const map: <T, U>(result: Result<T, ValidationError>, fn: (data: T) => U) => Result<U, ValidationError>;
export declare const apply: <T, U>(resultFn: Result<(data: T) => U, ValidationError>, result: Result<T, ValidationError>) => Result<U, ValidationError>;
export declare const combine: <T extends readonly unknown[]>(...results: { [K in keyof T]: Result<T[K], ValidationError>; }) => Result<T, ValidationError[]>;
export declare const alt: <T>(first: Result<T, ValidationError>, second: Result<T, ValidationError>) => Result<T, ValidationError>;
/**
 * Utility functions for common validation patterns
 */
export declare const createValidator: <T>(schema: z.ZodSchema<T>, options?: ValidationOptions) => (data: unknown) => Result<T, ValidationError>;
export declare const createAsyncValidator: <T>(schema: z.ZodSchema<T>, options?: ValidationOptions) => (data: unknown) => Promise<Result<T, ValidationError>>;
export declare const validateAndTransform: <T, U>(schema: z.ZodSchema<T>, data: unknown, transform: (data: T) => U, options?: ValidationOptions) => Result<U, ValidationError>;
export declare const validateWithSideEffects: <T>(schema: z.ZodSchema<T>, data: unknown, onSuccess?: (data: T) => void, onError?: (error: ValidationError) => void, options?: ValidationOptions) => Result<T, ValidationError>;
export declare const validateIf: <T>(condition: boolean, schema: z.ZodSchema<T>, data: unknown, options?: ValidationOptions) => Result<T | undefined, ValidationError>;
export declare const validateWithRetry: <T>(schema: z.ZodSchema<T>, dataProvider: () => unknown, maxRetries?: number, options?: ValidationOptions) => Result<T, ValidationError>;
/**
 * Type guards and predicates
 */
export declare const isSuccess: <T>(result: Result<T, ValidationError>) => result is {
    success: true;
    data: T;
};
export declare const isFailure: <T>(result: Result<T, ValidationError>) => result is {
    success: false;
    error: ValidationError;
};
export declare const unwrap: <T>(result: Result<T, ValidationError>) => T;
export declare const unwrapOr: <T>(result: Result<T, ValidationError>, defaultValue: T) => T;
export declare const unwrapOrElse: <T>(result: Result<T, ValidationError>, defaultFn: (error: ValidationError) => T) => T;
//# sourceMappingURL=validate.d.ts.map