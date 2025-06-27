"use strict";
/**
 * Core Oracle Types
 *
 * Functional programming-based type definitions for oracle operations
 * following the established NYXUSD patterns with immutable data structures
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerConfigSchema = exports.CircuitBreakerStateSchema = exports.AggregationConfigSchema = exports.AggregationMethodSchema = exports.PriceValidationResultSchema = exports.OracleResponseSchema = exports.OracleQuerySchema = exports.OracleHealthSchema = exports.OracleStatusSchema = exports.OracleFeedConfigSchema = exports.OraclePriceDataSchema = void 0;
const zod_1 = require("zod");
/**
 * Base oracle data structure
 */
exports.OraclePriceDataSchema = zod_1.z.object({
    /** Asset pair identifier (e.g., "ETH-USD") */
    feedId: zod_1.z.string().min(1),
    /** Price value in the feed's decimal precision */
    price: zod_1.z.bigint().positive(),
    /** Number of decimal places for the price */
    decimals: zod_1.z.number().int().min(0).max(18),
    /** Unix timestamp of the price update */
    timestamp: zod_1.z.number().int().positive(),
    /** Round ID from the oracle aggregator */
    roundId: zod_1.z.bigint().positive(),
    /** Confidence percentage (0-100) */
    confidence: zod_1.z.number().min(0).max(100),
    /** Oracle data source identifier */
    source: zod_1.z.string().min(1),
});
/**
 * Oracle feed configuration
 */
exports.OracleFeedConfigSchema = zod_1.z.object({
    /** Unique feed identifier */
    feedId: zod_1.z.string().min(1),
    /** Human-readable description */
    description: zod_1.z.string().min(1),
    /** Oracle contract address */
    address: zod_1.z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    /** Number of decimals in price data */
    decimals: zod_1.z.number().int().min(0).max(18),
    /** Maximum acceptable age of price data (seconds) */
    heartbeat: zod_1.z.number().int().positive(),
    /** Maximum acceptable price deviation (percentage) */
    deviationThreshold: zod_1.z.number().min(0).max(100),
    /** Minimum confidence required */
    minConfidence: zod_1.z.number().min(0).max(100),
    /** Feed priority for aggregation (higher = more important) */
    priority: zod_1.z.number().int().min(1).max(10),
    /** Whether this feed is currently active */
    isActive: zod_1.z.boolean(),
});
/**
 * Oracle service status
 */
exports.OracleStatusSchema = zod_1.z.enum([
    "healthy",
    "degraded",
    "critical",
    "offline",
]);
/**
 * Oracle health information
 */
exports.OracleHealthSchema = zod_1.z.object({
    /** Overall oracle service status */
    status: exports.OracleStatusSchema,
    /** Individual feed statuses */
    feeds: zod_1.z.record(zod_1.z.string(), zod_1.z.object({
        status: exports.OracleStatusSchema,
        lastUpdate: zod_1.z.number().int().positive(),
        staleness: zod_1.z.number().int().nonnegative(),
        confidence: zod_1.z.number().min(0).max(100),
        errorCount: zod_1.z.number().int().nonnegative(),
    })),
    /** System-wide metrics */
    metrics: zod_1.z.object({
        totalFeeds: zod_1.z.number().int().nonnegative(),
        healthyFeeds: zod_1.z.number().int().nonnegative(),
        averageConfidence: zod_1.z.number().min(0).max(100),
        averageStaleness: zod_1.z.number().int().nonnegative(),
        uptime: zod_1.z.number().min(0).max(100),
    }),
    /** Timestamp of health check */
    timestamp: zod_1.z.number().int().positive(),
});
/**
 * Oracle query parameters
 */
exports.OracleQuerySchema = zod_1.z.object({
    /** Asset pair to query */
    feedId: zod_1.z.string().min(1),
    /** Maximum acceptable staleness (seconds) */
    maxStaleness: zod_1.z.number().int().positive().optional(),
    /** Minimum required confidence */
    minConfidence: zod_1.z.number().min(0).max(100).optional(),
    /** Whether to use cached data if available */
    allowCached: zod_1.z.boolean().default(true),
    /** Timeout for the query (milliseconds) */
    timeout: zod_1.z.number().int().positive().default(5000),
});
/**
 * Oracle response with metadata
 */
exports.OracleResponseSchema = zod_1.z.object({
    /** Price data */
    data: exports.OraclePriceDataSchema,
    /** Response metadata */
    metadata: zod_1.z.object({
        /** Response time in milliseconds */
        responseTime: zod_1.z.number().int().nonnegative(),
        /** Whether data came from cache */
        fromCache: zod_1.z.boolean(),
        /** Data source used */
        source: zod_1.z.string(),
        /** Aggregation method if multiple sources used */
        aggregationMethod: zod_1.z
            .enum(["single", "median", "weighted_average"])
            .optional(),
    }),
});
/**
 * Price validation result
 */
exports.PriceValidationResultSchema = zod_1.z.object({
    /** Whether the price passed validation */
    isValid: zod_1.z.boolean(),
    /** Validation score (0-100) */
    score: zod_1.z.number().min(0).max(100),
    /** List of validation issues */
    issues: zod_1.z.array(zod_1.z.object({
        code: zod_1.z.string(),
        severity: zod_1.z.enum(["info", "warning", "error"]),
        message: zod_1.z.string(),
        metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
    })),
    /** Validated price data (if valid) */
    validatedData: exports.OraclePriceDataSchema.optional(),
});
/**
 * Oracle aggregation types
 */
exports.AggregationMethodSchema = zod_1.z.enum([
    "median",
    "mean",
    "weighted_average",
    "trimmed_mean",
    "mode",
]);
exports.AggregationConfigSchema = zod_1.z.object({
    /** Aggregation method to use */
    method: exports.AggregationMethodSchema,
    /** Minimum number of sources required */
    minSources: zod_1.z.number().int().min(1),
    /** Maximum number of sources to use */
    maxSources: zod_1.z.number().int().min(1),
    /** Outlier detection threshold (standard deviations) */
    outlierThreshold: zod_1.z.number().positive().default(2.5),
    /** Confidence weighting factor */
    confidenceWeight: zod_1.z.number().min(0).max(1).default(0.5),
    /** Recency weighting factor */
    recencyWeight: zod_1.z.number().min(0).max(1).default(0.3),
});
/**
 * Circuit breaker types
 */
exports.CircuitBreakerStateSchema = zod_1.z.enum([
    "closed", // Normal operation
    "open", // Circuit breaker triggered
    "half_open", // Testing if service has recovered
]);
exports.CircuitBreakerConfigSchema = zod_1.z.object({
    /** Failure threshold to open circuit */
    failureThreshold: zod_1.z.number().int().min(1),
    /** Success threshold to close circuit */
    successThreshold: zod_1.z.number().int().min(1),
    /** Timeout before trying half-open state (milliseconds) */
    timeout: zod_1.z.number().int().positive(),
    /** Maximum price deviation before triggering (percentage) */
    maxPriceDeviation: zod_1.z.number().min(0).max(100),
    /** Monitor window size (milliseconds) */
    monitoringWindow: zod_1.z.number().int().positive(),
});
//# sourceMappingURL=oracle-types.js.map