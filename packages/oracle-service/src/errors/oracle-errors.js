"use strict";
/**
 * Oracle Error Types
 *
 * Comprehensive error handling for oracle operations following
 * functional programming patterns with detailed error information
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorRetryDelay = exports.isCriticalError = exports.isRecoverableError = exports.createCircuitBreakerError = exports.createPriceDeviationError = exports.createStaleDataError = exports.createDataValidationError = exports.createNetworkError = exports.ValidationErrorSchema = exports.AuthenticationErrorSchema = exports.RateLimitErrorSchema = exports.ConfigurationErrorSchema = exports.AggregationErrorSchema = exports.CircuitBreakerErrorSchema = exports.LowConfidenceErrorSchema = exports.PriceDeviationErrorSchema = exports.StaleDataErrorSchema = exports.DataValidationErrorSchema = exports.NetworkErrorSchema = exports.OracleErrorSchema = void 0;
const zod_1 = require("zod");
/**
 * Base oracle error schema
 */
exports.OracleErrorSchema = zod_1.z.object({
    /** Error type identifier */
    code: zod_1.z.string().min(1),
    /** Human-readable error message */
    message: zod_1.z.string().min(1),
    /** Error severity level */
    severity: zod_1.z.enum(["low", "medium", "high", "critical"]),
    /** Timestamp when error occurred */
    timestamp: zod_1.z.number().int().positive(),
    /** Additional error context */
    context: zod_1.z.record(zod_1.z.unknown()).optional(),
    /** Underlying error cause */
    cause: zod_1.z.unknown().optional(),
    /** Suggested recovery actions */
    recoveryActions: zod_1.z.array(zod_1.z.string()).optional(),
});
/**
 * Specific oracle error types
 */
/** Network/connectivity errors */
exports.NetworkErrorSchema = exports.OracleErrorSchema.extend({
    code: zod_1.z.literal("NETWORK_ERROR"),
    severity: zod_1.z.enum(["medium", "high"]),
    context: zod_1.z
        .object({
        endpoint: zod_1.z.string().optional(),
        statusCode: zod_1.z.number().int().optional(),
        timeout: zod_1.z.boolean().optional(),
    })
        .optional(),
});
/** Invalid oracle data errors */
exports.DataValidationErrorSchema = exports.OracleErrorSchema.extend({
    code: zod_1.z.literal("DATA_VALIDATION_ERROR"),
    severity: zod_1.z.enum(["medium", "high"]),
    context: zod_1.z
        .object({
        feedId: zod_1.z.string().optional(),
        receivedData: zod_1.z.unknown().optional(),
        validationRules: zod_1.z.array(zod_1.z.string()).optional(),
    })
        .optional(),
});
/** Stale data errors */
exports.StaleDataErrorSchema = exports.OracleErrorSchema.extend({
    code: zod_1.z.literal("STALE_DATA_ERROR"),
    severity: zod_1.z.enum(["low", "medium"]),
    context: zod_1.z
        .object({
        feedId: zod_1.z.string().optional(),
        lastUpdate: zod_1.z.number().int().optional(),
        maxAge: zod_1.z.number().int().optional(),
        staleness: zod_1.z.number().int().optional(),
    })
        .optional(),
});
/** Price deviation errors */
exports.PriceDeviationErrorSchema = exports.OracleErrorSchema.extend({
    code: zod_1.z.literal("PRICE_DEVIATION_ERROR"),
    severity: zod_1.z.enum(["medium", "high", "critical"]),
    context: zod_1.z
        .object({
        feedId: zod_1.z.string().optional(),
        currentPrice: zod_1.z.string().optional(),
        expectedPrice: zod_1.z.string().optional(),
        deviation: zod_1.z.number().optional(),
        threshold: zod_1.z.number().optional(),
    })
        .optional(),
});
/** Low confidence errors */
exports.LowConfidenceErrorSchema = exports.OracleErrorSchema.extend({
    code: zod_1.z.literal("LOW_CONFIDENCE_ERROR"),
    severity: zod_1.z.enum(["low", "medium"]),
    context: zod_1.z
        .object({
        feedId: zod_1.z.string().optional(),
        confidence: zod_1.z.number().optional(),
        requiredConfidence: zod_1.z.number().optional(),
        sources: zod_1.z.array(zod_1.z.string()).optional(),
    })
        .optional(),
});
/** Circuit breaker errors */
exports.CircuitBreakerErrorSchema = exports.OracleErrorSchema.extend({
    code: zod_1.z.literal("CIRCUIT_BREAKER_ERROR"),
    severity: zod_1.z.enum(["high", "critical"]),
    context: zod_1.z
        .object({
        feedId: zod_1.z.string().optional(),
        state: zod_1.z.enum(["open", "half_open"]).optional(),
        failureCount: zod_1.z.number().int().optional(),
        lastFailure: zod_1.z.number().int().optional(),
    })
        .optional(),
});
/** Aggregation errors */
exports.AggregationErrorSchema = exports.OracleErrorSchema.extend({
    code: zod_1.z.literal("AGGREGATION_ERROR"),
    severity: zod_1.z.enum(["medium", "high"]),
    context: zod_1.z
        .object({
        method: zod_1.z.string().optional(),
        sourceCount: zod_1.z.number().int().optional(),
        requiredSources: zod_1.z.number().int().optional(),
        failures: zod_1.z.array(zod_1.z.string()).optional(),
    })
        .optional(),
});
/** Configuration errors */
exports.ConfigurationErrorSchema = exports.OracleErrorSchema.extend({
    code: zod_1.z.literal("CONFIGURATION_ERROR"),
    severity: zod_1.z.enum(["medium", "high"]),
    context: zod_1.z
        .object({
        parameter: zod_1.z.string().optional(),
        value: zod_1.z.unknown().optional(),
        expectedType: zod_1.z.string().optional(),
    })
        .optional(),
});
/** Rate limiting errors */
exports.RateLimitErrorSchema = exports.OracleErrorSchema.extend({
    code: zod_1.z.literal("RATE_LIMIT_ERROR"),
    severity: zod_1.z.enum(["low", "medium"]),
    context: zod_1.z
        .object({
        endpoint: zod_1.z.string().optional(),
        limit: zod_1.z.number().int().optional(),
        resetTime: zod_1.z.number().int().optional(),
        retryAfter: zod_1.z.number().int().optional(),
    })
        .optional(),
});
/** Authentication errors */
exports.AuthenticationErrorSchema = exports.OracleErrorSchema.extend({
    code: zod_1.z.literal("AUTHENTICATION_ERROR"),
    severity: zod_1.z.enum(["medium", "high"]),
    context: zod_1.z
        .object({
        provider: zod_1.z.string().optional(),
        endpoint: zod_1.z.string().optional(),
    })
        .optional(),
});
/**
 * Generic validation error for schema validation
 */
exports.ValidationErrorSchema = zod_1.z.object({
    code: zod_1.z.literal("VALIDATION_ERROR"),
    message: zod_1.z.string(),
    field: zod_1.z.string().optional(),
    value: zod_1.z.unknown().optional(),
    details: zod_1.z
        .array(zod_1.z.object({
        path: zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.number()])),
        message: zod_1.z.string(),
        code: zod_1.z.string(),
    }))
        .optional(),
});
/**
 * Error factory functions for creating well-formed errors
 */
const createNetworkError = (message, context) => ({
    code: "NETWORK_ERROR",
    message,
    severity: context?.timeout ? "high" : "medium",
    timestamp: Date.now(),
    context,
    recoveryActions: [
        "Retry request",
        "Check network connectivity",
        "Verify endpoint availability",
    ],
});
exports.createNetworkError = createNetworkError;
const createDataValidationError = (message, context) => ({
    code: "DATA_VALIDATION_ERROR",
    message,
    severity: "high",
    timestamp: Date.now(),
    context,
    recoveryActions: [
        "Verify data format",
        "Check oracle configuration",
        "Contact oracle provider",
    ],
});
exports.createDataValidationError = createDataValidationError;
const createStaleDataError = (message, context) => ({
    code: "STALE_DATA_ERROR",
    message,
    severity: context?.staleness && context.staleness > 3600 ? "medium" : "low",
    timestamp: Date.now(),
    context,
    recoveryActions: [
        "Wait for fresh data",
        "Use alternative oracle",
        "Increase staleness tolerance",
    ],
});
exports.createStaleDataError = createStaleDataError;
const createPriceDeviationError = (message, context) => ({
    code: "PRICE_DEVIATION_ERROR",
    message,
    severity: context?.deviation && context.deviation > 50 ? "critical" : "high",
    timestamp: Date.now(),
    context,
    recoveryActions: [
        "Cross-validate with other oracles",
        "Check for market events",
        "Adjust deviation thresholds",
        "Trigger circuit breaker",
    ],
});
exports.createPriceDeviationError = createPriceDeviationError;
const createCircuitBreakerError = (message, context) => ({
    code: "CIRCUIT_BREAKER_ERROR",
    message,
    severity: "critical",
    timestamp: Date.now(),
    context,
    recoveryActions: [
        "Wait for circuit breaker reset",
        "Use fallback oracle",
        "Manual override if safe",
    ],
});
exports.createCircuitBreakerError = createCircuitBreakerError;
/**
 * Error categorization utilities
 */
const isRecoverableError = (error) => {
    const recoverableErrors = [
        "NETWORK_ERROR",
        "RATE_LIMIT_ERROR",
        "STALE_DATA_ERROR",
    ];
    return recoverableErrors.includes(error.code);
};
exports.isRecoverableError = isRecoverableError;
const isCriticalError = (error) => {
    return (error.severity === "critical" || error.code === "CIRCUIT_BREAKER_ERROR");
};
exports.isCriticalError = isCriticalError;
const getErrorRetryDelay = (error) => {
    switch (error.code) {
        case "NETWORK_ERROR":
            return 1000; // 1 second
        case "RATE_LIMIT_ERROR":
            return error.context?.retryAfter * 1000 || 60000; // Default 1 minute
        case "STALE_DATA_ERROR":
            return 5000; // 5 seconds
        default:
            return 0; // No retry
    }
};
exports.getErrorRetryDelay = getErrorRetryDelay;
//# sourceMappingURL=oracle-errors.js.map