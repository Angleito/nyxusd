import { z } from 'zod';

/**
 * Generic validation functions with Result types for error handling
 * Integrates with fp-utils Result types for functional composition
 */

// Result type definitions (to match fp-utils pattern)
export type Result<T, E = Error> = 
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

// Validation error types
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

// Success and error result constructors
export const success = <T>(data: T): Result<T, ValidationError> => ({
  success: true,
  data,
});

export const failure = (error: ValidationError): Result<never, ValidationError> => ({
  success: false,
  error,
});

// Convert Zod error to ValidationError
export const zodErrorToValidationError = (
  zodError: z.ZodError,
  context?: Record<string, unknown>
): ValidationError => {
  const firstIssue = zodError.issues[0];
  const fieldPath = firstIssue?.path.join('.');
  return {
    code: firstIssue?.code || 'VALIDATION_ERROR',
    message: firstIssue?.message || 'Validation failed',
    field: fieldPath && fieldPath.length > 0 ? fieldPath : undefined,
    details: {
      issues: zodError.issues,
      ...context,
    },
  };
};

// Generic validation function
export const validate = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  options?: ValidationOptions
): Result<T, ValidationError> => {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return success(result.data);
    }
    
    return failure(zodErrorToValidationError(result.error, options?.context));
  } catch (error) {
    return failure({
      code: 'UNEXPECTED_ERROR',
      message: error instanceof Error ? error.message : 'Unexpected validation error',
      details: { originalError: error, ...options?.context },
    });
  }
};

// Async validation function
export const validateAsync = async <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  options?: ValidationOptions
): Promise<Result<T, ValidationError>> => {
  try {
    const result = await schema.safeParseAsync(data);
    
    if (result.success) {
      return success(result.data);
    }
    
    return failure(zodErrorToValidationError(result.error, options?.context));
  } catch (error) {
    return failure({
      code: 'UNEXPECTED_ERROR',
      message: error instanceof Error ? error.message : 'Unexpected async validation error',
      details: { originalError: error, ...options?.context },
    });
  }
};

// Partial validation (allows partial objects)
export const validatePartial = <T extends Record<string, unknown>>(
  schema: z.ZodObject<z.ZodRawShape>,
  data: unknown,
  options?: ValidationOptions
): Result<Partial<T>, ValidationError> => {
  const partialSchema = schema.partial();
  return validate(partialSchema, data, options) as Result<Partial<T>, ValidationError>;
};

// Array validation with individual error reporting
export const validateArray = <T>(
  schema: z.ZodSchema<T>,
  array: unknown[],
  options?: ValidationOptions
): Result<T[], ValidationError[]> => {
  const results: Array<Result<T, ValidationError>> = array.map((item, index) =>
    validate(schema, item, {
      ...options,
      context: { ...options?.context, arrayIndex: index },
    })
  );
  
  const errors: ValidationError[] = [];
  const successes: T[] = [];
  
  results.forEach((result, index) => {
    if (result.success) {
      successes.push(result.data);
    } else {
      errors.push({
        ...result.error,
        field: `[${index}]${result.error.field ? '.' + result.error.field : ''}`,
      });
    }
  });
  
  if (errors.length > 0) {
    return { success: false, error: errors };
  }
  
  return { success: true, data: successes };
};

// Object validation with field-level error reporting
export const validateObject = <T extends Record<string, z.ZodSchema<any>>>(
  schemaObj: T,
  data: Record<string, unknown>,
  options?: ValidationOptions
): Result<{ [K in keyof T]: z.infer<T[K]> }, Record<string, ValidationError>> => {
  const results: Record<string, Result<any, ValidationError>> = {};
  const errors: Record<string, ValidationError> = {};
  const successes: Record<string, any> = {};
  
  Object.entries(schemaObj).forEach(([key, schema]) => {
    const result = validate(schema, data[key], {
      ...options,
      context: { ...options?.context, field: key },
    });
    
    results[key] = result;
    
    if (result.success) {
      successes[key] = result.data;
    } else {
      errors[key] = result.error;
    }
  });
  
  if (Object.keys(errors).length > 0) {
    return { success: false, error: errors };
  }
  
  return { success: true, data: successes as { [K in keyof T]: z.infer<T[K]> } };
};

/**
 * Functional composition utilities
 */

// Chain validations (monadic bind)
export const chain = <T, U>(
  result: Result<T, ValidationError>,
  fn: (data: T) => Result<U, ValidationError>
): Result<U, ValidationError> => {
  if (result.success) {
    return fn(result.data);
  }
  return result;
};

// Map over successful validation result
export const map = <T, U>(
  result: Result<T, ValidationError>,
  fn: (data: T) => U
): Result<U, ValidationError> => {
  if (result.success) {
    return success(fn(result.data));
  }
  return { success: false, error: result.error };
};

// Apply function to validation result (ap)
export const apply = <T, U>(
  resultFn: Result<(data: T) => U, ValidationError>,
  result: Result<T, ValidationError>
): Result<U, ValidationError> => {
  if (resultFn.success && result.success) {
    return success(resultFn.data(result.data));
  }
  
  // Return the first error encountered
  if (!resultFn.success) {
    return { success: false, error: resultFn.error };
  }
  
  if (!result.success) {
    return { success: false, error: result.error };
  }
  
  // This should never happen due to the check above, but TypeScript needs it
  return { success: false, error: { code: 'UNKNOWN_ERROR', message: 'Unknown error' } };
};

// Combine multiple validation results
export const combine = <T extends readonly unknown[]>(
  ...results: { [K in keyof T]: Result<T[K], ValidationError> }
): Result<T, ValidationError[]> => {
  const errors: ValidationError[] = [];
  const successes: unknown[] = [];
  
  results.forEach((result, index) => {
    if (result.success) {
      successes[index] = result.data;
    } else {
      errors.push(result.error);
    }
  });
  
  if (errors.length > 0) {
    return { success: false, error: errors };
  }
  
  return { success: true, data: successes as unknown as T };
};

// Alternative operator (return first successful result)
export const alt = <T>(
  first: Result<T, ValidationError>,
  second: Result<T, ValidationError>
): Result<T, ValidationError> => {
  if (first.success) {
    return first;
  }
  return second;
};

/**
 * Utility functions for common validation patterns
 */

// Create a validator function from a schema
export const createValidator = <T>(schema: z.ZodSchema<T>, options?: ValidationOptions) =>
  (data: unknown): Result<T, ValidationError> => validate(schema, data, options);

// Create an async validator function from a schema
export const createAsyncValidator = <T>(schema: z.ZodSchema<T>, options?: ValidationOptions) =>
  (data: unknown): Promise<Result<T, ValidationError>> => validateAsync(schema, data, options);

// Validate with transformation
export const validateAndTransform = <T, U>(
  schema: z.ZodSchema<T>,
  data: unknown,
  transform: (data: T) => U,
  options?: ValidationOptions
): Result<U, ValidationError> => {
  const result = validate(schema, data, options);
  return map(result, transform);
};

// Validate with side effects (logging, metrics, etc.)
export const validateWithSideEffects = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  onSuccess?: (data: T) => void,
  onError?: (error: ValidationError) => void,
  options?: ValidationOptions
): Result<T, ValidationError> => {
  const result = validate(schema, data, options);
  
  if (result.success && onSuccess) {
    onSuccess(result.data);
  } else if (!result.success && onError) {
    onError(result.error);
  }
  
  return result;
};

// Conditional validation
export const validateIf = <T>(
  condition: boolean,
  schema: z.ZodSchema<T>,
  data: unknown,
  options?: ValidationOptions
): Result<T | undefined, ValidationError> => {
  if (!condition) {
    return success(undefined);
  }
  return validate(schema, data, options);
};

// Validation with retry logic
export const validateWithRetry = <T>(
  schema: z.ZodSchema<T>,
  dataProvider: () => unknown,
  maxRetries: number = 3,
  options?: ValidationOptions
): Result<T, ValidationError> => {
  let lastError: ValidationError | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const data = dataProvider();
      const result = validate(schema, data, {
        ...options,
        context: { ...options?.context, attempt: attempt + 1 },
      });
      
      if (result.success) {
        return result;
      }
      
      lastError = result.error;
    } catch (error) {
      lastError = {
        code: 'DATA_PROVIDER_ERROR',
        message: error instanceof Error ? error.message : 'Data provider failed',
        details: { attempt: attempt + 1, originalError: error },
      };
    }
  }
  
  return failure(lastError || {
    code: 'UNKNOWN_ERROR',
    message: 'Validation failed after all retries',
    details: { maxRetries },
  });
};

/**
 * Type guards and predicates
 */

// Check if result is successful
export const isSuccess = <T>(result: Result<T, ValidationError>): result is { success: true; data: T } =>
  result.success;

// Check if result is failure
export const isFailure = <T>(result: Result<T, ValidationError>): result is { success: false; error: ValidationError } =>
  !result.success;

// Extract data from successful result or throw
export const unwrap = <T>(result: Result<T, ValidationError>): T => {
  if (result.success) {
    return result.data;
  }
  throw new Error(`Validation failed: ${result.error.message}`);
};

// Extract data from successful result or return default
export const unwrapOr = <T>(result: Result<T, ValidationError>, defaultValue: T): T => {
  if (result.success) {
    return result.data;
  }
  return defaultValue;
};

// Extract data from successful result or compute default
export const unwrapOrElse = <T>(
  result: Result<T, ValidationError>,
  defaultFn: (error: ValidationError) => T
): T => {
  if (result.success) {
    return result.data;
  }
  return defaultFn(result.error);
};