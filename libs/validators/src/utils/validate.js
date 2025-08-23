/**
 * Core validation functions
 */
// Success and error result constructors
export const success = (data) => ({
    success: true,
    data,
});
export const failure = (error) => ({
    success: false,
    error,
});
// Convert Zod error to ValidationError
export const zodErrorToValidationError = (zodError, context) => {
    const firstIssue = zodError.issues[0];
    const fieldPath = firstIssue?.path.join(".");
    return {
        code: firstIssue?.code || "VALIDATION_ERROR",
        message: firstIssue?.message || "Validation failed",
        field: fieldPath && fieldPath.length > 0 ? fieldPath : undefined,
        details: {
            issues: zodError.issues,
            ...context,
        },
    };
};
// Generic validation function
export const validate = (schema, data, options) => {
    try {
        const result = schema.safeParse(data);
        if (result.success) {
            return success(result.data);
        }
        return failure(zodErrorToValidationError(result.error, options?.context));
    }
    catch (error) {
        return failure({
            code: "UNEXPECTED_ERROR",
            message: error instanceof Error ? error.message : "Unexpected validation error",
            details: { originalError: error, ...options?.context },
        });
    }
};
// Async validation function
export const validateAsync = async (schema, data, options) => {
    try {
        const result = await schema.safeParseAsync(data);
        if (result.success) {
            return success(result.data);
        }
        return failure(zodErrorToValidationError(result.error, options?.context));
    }
    catch (error) {
        return failure({
            code: "UNEXPECTED_ERROR",
            message: error instanceof Error
                ? error.message
                : "Unexpected async validation error",
            details: { originalError: error, ...options?.context },
        });
    }
};
// Partial validation (allows partial objects)
export const validatePartial = (schema, data, options) => {
    const partialSchema = schema.partial();
    return validate(partialSchema, data, options);
};
// Array validation with individual error reporting
export const validateArray = (schema, array, options) => {
    const results = array.map((item, index) => validate(schema, item, {
        ...options,
        context: { ...options?.context, arrayIndex: index },
    }));
    const errors = [];
    const successes = [];
    results.forEach((result, index) => {
        if (result.success) {
            successes.push(result.data);
        }
        else {
            errors.push({
                ...result.error,
                field: `[${index}]${result.error.field ? "." + result.error.field : ""}`,
            });
        }
    });
    if (errors.length > 0) {
        return { success: false, error: errors };
    }
    return { success: true, data: successes };
};
// Object validation with field-level error reporting
export const validateObject = (schemaObj, data, options) => {
    const results = {};
    const errors = {};
    const successes = {};
    Object.entries(schemaObj).forEach(([key, schema]) => {
        const result = validate(schema, data[key], {
            ...options,
            context: { ...options?.context, field: key },
        });
        results[key] = result;
        if (result.success) {
            successes[key] = result.data;
        }
        else {
            errors[key] = result.error;
        }
    });
    if (Object.keys(errors).length > 0) {
        return { success: false, error: errors };
    }
    return {
        success: true,
        data: successes,
    };
};
/**
 * Functional composition utilities
 */
// Chain validations (monadic bind)
export const chain = (result, fn) => {
    if (result.success) {
        return fn(result.data);
    }
    return result;
};
// Map over successful validation result
export const map = (result, fn) => {
    if (result.success) {
        return success(fn(result.data));
    }
    return { success: false, error: result.error };
};
// Apply function to validation result (ap)
export const apply = (resultFn, result) => {
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
    return {
        success: false,
        error: { code: "UNKNOWN_ERROR", message: "Unknown error" },
    };
};
// Combine multiple validation results
export const combine = (...results) => {
    const errors = [];
    const successes = [];
    results.forEach((result, index) => {
        if (result.success) {
            successes[index] = result.data;
        }
        else {
            errors.push(result.error);
        }
    });
    if (errors.length > 0) {
        return { success: false, error: errors };
    }
    return { success: true, data: successes };
};
// Alternative operator (return first successful result)
export const alt = (first, second) => {
    if (first.success) {
        return first;
    }
    return second;
};
/**
 * Utility functions for common validation patterns
 */
// Create a validator function from a schema
export const createValidator = (schema, options) => (data) => validate(schema, data, options);
// Create an async validator function from a schema
export const createAsyncValidator = (schema, options) => (data) => validateAsync(schema, data, options);
// Validate with transformation
export const validateAndTransform = (schema, data, transform, options) => {
    const result = validate(schema, data, options);
    return map(result, transform);
};
// Validate with side effects (logging, metrics, etc.)
export const validateWithSideEffects = (schema, data, onSuccess, onError, options) => {
    const result = validate(schema, data, options);
    if (result.success && onSuccess) {
        onSuccess(result.data);
    }
    else if (!result.success && onError) {
        onError(result.error);
    }
    return result;
};
// Conditional validation
export const validateIf = (condition, schema, data, options) => {
    if (!condition) {
        return success(undefined);
    }
    return validate(schema, data, options);
};
// Validation with retry logic
export const validateWithRetry = (schema, dataProvider, maxRetries = 3, options) => {
    let lastError = null;
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
        }
        catch (error) {
            lastError = {
                code: "DATA_PROVIDER_ERROR",
                message: error instanceof Error ? error.message : "Data provider failed",
                details: { attempt: attempt + 1, originalError: error },
            };
        }
    }
    return failure(lastError || {
        code: "UNKNOWN_ERROR",
        message: "Validation failed after all retries",
        details: { maxRetries },
    });
};
/**
 * Type guards and predicates
 */
// Check if result is successful
export const isSuccess = (result) => result.success;
// Check if result is failure
export const isFailure = (result) => !result.success;
// Extract data from successful result or throw
export const unwrap = (result) => {
    if (result.success) {
        return result.data;
    }
    throw new Error(`Validation failed: ${result.error.message}`);
};
// Extract data from successful result or return default
export const unwrapOr = (result, defaultValue) => {
    if (result.success) {
        return result.data;
    }
    return defaultValue;
};
// Extract data from successful result or compute default
export const unwrapOrElse = (result, defaultFn) => {
    if (result.success) {
        return result.data;
    }
    return defaultFn(result.error);
};
//# sourceMappingURL=validate.js.map