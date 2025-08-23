/**
 * @nyxusd/validators - Shared validation library with Zod schemas
 *
 * This library provides comprehensive validation schemas and utilities for the NyxUSD CDP system.
 * It includes runtime type validation, data sanitization, and functional composition patterns.
 */
// Re-export all schemas
export * from "./schemas/common.js";
export * from "./schemas/collateral.js";
export * from "./schemas/cdp.js";
export * from "./schemas/oracle.js";
// Re-export all utilities
export * from "./utils/validate.js";
export * from "./utils/sanitize.js";
// Export commonly used Zod types for convenience
export { z } from "zod";
/**
 * Validation presets for common use cases
 */
import { z } from "zod";
import { AddressSchema, AmountSchema, PriceSchema, BigIntSchema, TimestampSchema, HashSchema, } from "./schemas/common.js";
import { CollateralDepositSchema, CollateralWithdrawalSchema, } from "./schemas/collateral.js";
import { CreateCDPSchema, CDPCollateralUpdateSchema, CDPDebtUpdateSchema, } from "./schemas/cdp.js";
import { OraclePriceDataSchema, OracleQuerySchema, OracleFeedConfigSchema, ChainlinkRoundDataSchema, PriceValidationResultSchema, } from "./schemas/oracle.js";
import { validate, createValidator } from "./utils/validate.js";
import { sanitizeAddress, sanitizeAmount, sanitizePrice, } from "./utils/sanitize.js";
// Common validation presets
export const CommonValidators = {
    // Basic types
    address: createValidator(AddressSchema),
    amount: createValidator(AmountSchema),
    price: createValidator(PriceSchema),
    bigint: createValidator(BigIntSchema),
    timestamp: createValidator(TimestampSchema),
    hash: createValidator(HashSchema),
    // Complex operations
    collateralDeposit: createValidator(CollateralDepositSchema),
    collateralWithdrawal: createValidator(CollateralWithdrawalSchema),
    createCDP: createValidator(CreateCDPSchema),
    cdpCollateralUpdate: createValidator(CDPCollateralUpdateSchema),
    cdpDebtUpdate: createValidator(CDPDebtUpdateSchema),
    // Oracle validators
    oraclePriceData: createValidator(OraclePriceDataSchema),
    oracleQuery: createValidator(OracleQuerySchema),
    oracleFeedConfig: createValidator(OracleFeedConfigSchema),
    chainlinkRoundData: createValidator(ChainlinkRoundDataSchema),
    priceValidationResult: createValidator(PriceValidationResultSchema),
};
// Sanitization presets
export const CommonSanitizers = {
    address: sanitizeAddress,
    amount: sanitizeAmount,
    price: sanitizePrice,
};
/**
 * High-level validation functions for common workflows
 */
// Transaction validation pipeline
export const validateTransaction = (transaction) => {
    const TransactionSchema = z.object({
        hash: HashSchema,
        from: AddressSchema,
        to: AddressSchema,
        value: AmountSchema,
        gasPrice: AmountSchema,
        gasLimit: AmountSchema,
        nonce: z.number().int().nonnegative(),
        timestamp: TimestampSchema,
    });
    return validate(TransactionSchema, transaction);
};
// User input validation pipeline with sanitization
export const validateUserInput = (schema, input, sanitize = true) => {
    if (sanitize && typeof input === "object" && input !== null) {
        // Apply basic sanitization to string fields
        const sanitizedInput = Object.fromEntries(Object.entries(input).map(([key, value]) => [
            key,
            typeof value === "string" ? value.trim() : value,
        ]));
        return validate(schema, sanitizedInput);
    }
    return validate(schema, input);
};
// API request validation
export const validateApiRequest = (schema, request, options = {}) => {
    // Size check
    if (options.maxSize) {
        const size = JSON.stringify(request).length;
        if (size > options.maxSize) {
            return {
                success: false,
                error: {
                    code: "REQUEST_TOO_LARGE",
                    message: `Request size ${size} exceeds maximum ${options.maxSize}`,
                },
            };
        }
    }
    return validateUserInput(schema, request, options.sanitize);
};
/**
 * Batch validation utilities
 */
// Validate multiple items of the same type
export const validateBatch = (schema, items, options = {}) => {
    if (options.maxItems && items.length > options.maxItems) {
        return {
            success: false,
            error: {
                code: "TOO_MANY_ITEMS",
                message: `Batch size ${items.length} exceeds maximum ${options.maxItems}`,
            },
        };
    }
    const results = items.map((item, index) => {
        const result = validate(schema, item, { context: { batchIndex: index } });
        if (!result.success && options.failFast) {
            return result;
        }
        return result;
    });
    // Check if any validation failed
    const errors = results.filter((result) => !result.success);
    if (errors.length > 0) {
        return {
            success: false,
            error: {
                code: "BATCH_VALIDATION_FAILED",
                message: `${errors.length} items failed validation`,
                details: { errors, totalItems: items.length },
            },
        };
    }
    return {
        success: true,
        data: results.map((result) => result.data),
    };
};
/**
 * Schema composition utilities
 */
// Create conditional schemas
export const createConditionalSchema = (condition, schemaA, schemaB) => {
    return z.union([schemaA, schemaB]).superRefine((data, ctx) => {
        if (condition(data)) {
            const result = schemaA.safeParse(data);
            if (!result.success) {
                result.error.issues.forEach((issue) => ctx.addIssue(issue));
            }
        }
        else {
            const result = schemaB.safeParse(data);
            if (!result.success) {
                result.error.issues.forEach((issue) => ctx.addIssue(issue));
            }
        }
    });
};
// Create versioned schemas
export const createVersionedSchema = (schemas, defaultVersion = "latest") => {
    return z
        .object({
        version: z.string().optional().default(defaultVersion),
        data: z.unknown(),
    })
        .superRefine((input, ctx) => {
        const version = input.version || defaultVersion;
        const schema = schemas[version];
        if (!schema) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Unsupported version: ${version}`,
                path: ["version"],
            });
            return;
        }
        const result = schema.safeParse(input.data);
        if (!result.success) {
            result.error.issues.forEach((issue) => {
                ctx.addIssue({
                    ...issue,
                    path: ["data", ...issue.path],
                });
            });
        }
    });
};
// Create validation middleware
export const createValidationMiddleware = (schema, options = {}) => {
    return (data, next, error) => {
        const result = validateUserInput(schema, data, options.sanitize);
        if (result.success) {
            next(result.data);
        }
        else {
            error(new Error(`Validation failed: ${result.error.message}`));
        }
    };
};
/**
 * Testing utilities
 */
// Generate sample data for testing
export const generateSampleData = (schema) => {
    // This is a basic implementation - in practice, you might want to use
    // a library like @faker-js/faker for more realistic test data
    try {
        // Try to parse an empty object to see what's required
        const result = schema.safeParse({});
        if (result.success) {
            return result.data;
        }
        // For now, return empty object - in practice, you'd generate
        // appropriate sample data based on the schema structure
        return {};
    }
    catch {
        return {};
    }
};
// Simple metrics collector (in production, you'd use a proper metrics system)
export class ValidationMetricsCollector {
    constructor() {
        this.metrics = {
            totalValidations: 0,
            successfulValidations: 0,
            failedValidations: 0,
            averageValidationTime: 0,
            schemaUsageStats: {},
        };
    }
    recordValidation(schemaName, success, duration) {
        this.metrics.totalValidations++;
        this.metrics.schemaUsageStats[schemaName] =
            (this.metrics.schemaUsageStats[schemaName] || 0) + 1;
        if (success) {
            this.metrics.successfulValidations++;
        }
        else {
            this.metrics.failedValidations++;
        }
        // Update average validation time
        const totalTime = this.metrics.averageValidationTime * (this.metrics.totalValidations - 1);
        this.metrics.averageValidationTime =
            (totalTime + duration) / this.metrics.totalValidations;
    }
    getMetrics() {
        return { ...this.metrics };
    }
    reset() {
        this.metrics = {
            totalValidations: 0,
            successfulValidations: 0,
            failedValidations: 0,
            averageValidationTime: 0,
            schemaUsageStats: {},
        };
    }
}
// Global metrics collector instance
export const validationMetrics = new ValidationMetricsCollector();
//# sourceMappingURL=index.js.map