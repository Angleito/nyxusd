/**
 * Core Oracle Types
 *
 * Functional programming-based type definitions for oracle operations
 * following the established NYXUSD patterns with immutable data structures
 */
import { z } from 'zod';
import { Either } from 'fp-ts/Either';
import { Option } from 'fp-ts/Option';
import { IO } from 'fp-ts/IO';
import type { OracleError, ValidationError } from '../errors/oracle-errors';
/**
 * Base oracle data structure
 */
export declare const OraclePriceDataSchema: z.ZodObject<{
    /** Asset pair identifier (e.g., "ETH-USD") */
    feedId: z.ZodString;
    /** Price value in the feed's decimal precision */
    price: z.ZodBigInt;
    /** Number of decimal places for the price */
    decimals: z.ZodNumber;
    /** Unix timestamp of the price update */
    timestamp: z.ZodNumber;
    /** Round ID from the oracle aggregator */
    roundId: z.ZodBigInt;
    /** Confidence percentage (0-100) */
    confidence: z.ZodNumber;
    /** Oracle data source identifier */
    source: z.ZodString;
}, "strip", z.ZodTypeAny, {
    timestamp: number;
    feedId: string;
    confidence: number;
    price: bigint;
    decimals: number;
    roundId: bigint;
    source: string;
}, {
    timestamp: number;
    feedId: string;
    confidence: number;
    price: bigint;
    decimals: number;
    roundId: bigint;
    source: string;
}>;
export type OraclePriceData = z.infer<typeof OraclePriceDataSchema>;
/**
 * Oracle feed configuration
 */
export declare const OracleFeedConfigSchema: z.ZodObject<{
    /** Unique feed identifier */
    feedId: z.ZodString;
    /** Human-readable description */
    description: z.ZodString;
    /** Oracle contract address */
    address: z.ZodString;
    /** Number of decimals in price data */
    decimals: z.ZodNumber;
    /** Maximum acceptable age of price data (seconds) */
    heartbeat: z.ZodNumber;
    /** Maximum acceptable price deviation (percentage) */
    deviationThreshold: z.ZodNumber;
    /** Minimum confidence required */
    minConfidence: z.ZodNumber;
    /** Feed priority for aggregation (higher = more important) */
    priority: z.ZodNumber;
    /** Whether this feed is currently active */
    isActive: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    feedId: string;
    decimals: number;
    description: string;
    address: string;
    heartbeat: number;
    deviationThreshold: number;
    minConfidence: number;
    priority: number;
    isActive: boolean;
}, {
    feedId: string;
    decimals: number;
    description: string;
    address: string;
    heartbeat: number;
    deviationThreshold: number;
    minConfidence: number;
    priority: number;
    isActive: boolean;
}>;
export type OracleFeedConfig = z.infer<typeof OracleFeedConfigSchema>;
/**
 * Oracle service status
 */
export declare const OracleStatusSchema: z.ZodEnum<["healthy", "degraded", "critical", "offline"]>;
export type OracleStatus = z.infer<typeof OracleStatusSchema>;
/**
 * Oracle health information
 */
export declare const OracleHealthSchema: z.ZodObject<{
    /** Overall oracle service status */
    status: z.ZodEnum<["healthy", "degraded", "critical", "offline"]>;
    /** Individual feed statuses */
    feeds: z.ZodRecord<z.ZodString, z.ZodObject<{
        status: z.ZodEnum<["healthy", "degraded", "critical", "offline"]>;
        lastUpdate: z.ZodNumber;
        staleness: z.ZodNumber;
        confidence: z.ZodNumber;
        errorCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        status: "critical" | "healthy" | "degraded" | "offline";
        lastUpdate: number;
        staleness: number;
        confidence: number;
        errorCount: number;
    }, {
        status: "critical" | "healthy" | "degraded" | "offline";
        lastUpdate: number;
        staleness: number;
        confidence: number;
        errorCount: number;
    }>>;
    /** System-wide metrics */
    metrics: z.ZodObject<{
        totalFeeds: z.ZodNumber;
        healthyFeeds: z.ZodNumber;
        averageConfidence: z.ZodNumber;
        averageStaleness: z.ZodNumber;
        uptime: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        totalFeeds: number;
        healthyFeeds: number;
        averageConfidence: number;
        averageStaleness: number;
        uptime: number;
    }, {
        totalFeeds: number;
        healthyFeeds: number;
        averageConfidence: number;
        averageStaleness: number;
        uptime: number;
    }>;
    /** Timestamp of health check */
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    status: "critical" | "healthy" | "degraded" | "offline";
    timestamp: number;
    feeds: Record<string, {
        status: "critical" | "healthy" | "degraded" | "offline";
        lastUpdate: number;
        staleness: number;
        confidence: number;
        errorCount: number;
    }>;
    metrics: {
        totalFeeds: number;
        healthyFeeds: number;
        averageConfidence: number;
        averageStaleness: number;
        uptime: number;
    };
}, {
    status: "critical" | "healthy" | "degraded" | "offline";
    timestamp: number;
    feeds: Record<string, {
        status: "critical" | "healthy" | "degraded" | "offline";
        lastUpdate: number;
        staleness: number;
        confidence: number;
        errorCount: number;
    }>;
    metrics: {
        totalFeeds: number;
        healthyFeeds: number;
        averageConfidence: number;
        averageStaleness: number;
        uptime: number;
    };
}>;
export type OracleHealth = z.infer<typeof OracleHealthSchema>;
/**
 * Oracle query parameters
 */
export declare const OracleQuerySchema: z.ZodObject<{
    /** Asset pair to query */
    feedId: z.ZodString;
    /** Maximum acceptable staleness (seconds) */
    maxStaleness: z.ZodOptional<z.ZodNumber>;
    /** Minimum required confidence */
    minConfidence: z.ZodOptional<z.ZodNumber>;
    /** Whether to use cached data if available */
    allowCached: z.ZodDefault<z.ZodBoolean>;
    /** Timeout for the query (milliseconds) */
    timeout: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    timeout: number;
    feedId: string;
    allowCached: boolean;
    minConfidence?: number | undefined;
    maxStaleness?: number | undefined;
}, {
    feedId: string;
    timeout?: number | undefined;
    minConfidence?: number | undefined;
    maxStaleness?: number | undefined;
    allowCached?: boolean | undefined;
}>;
export type OracleQueryData = z.infer<typeof OracleQuerySchema>;
/**
 * Oracle response with metadata
 */
export declare const OracleResponseSchema: z.ZodObject<{
    /** Price data */
    data: z.ZodObject<{
        /** Asset pair identifier (e.g., "ETH-USD") */
        feedId: z.ZodString;
        /** Price value in the feed's decimal precision */
        price: z.ZodBigInt;
        /** Number of decimal places for the price */
        decimals: z.ZodNumber;
        /** Unix timestamp of the price update */
        timestamp: z.ZodNumber;
        /** Round ID from the oracle aggregator */
        roundId: z.ZodBigInt;
        /** Confidence percentage (0-100) */
        confidence: z.ZodNumber;
        /** Oracle data source identifier */
        source: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        timestamp: number;
        feedId: string;
        confidence: number;
        price: bigint;
        decimals: number;
        roundId: bigint;
        source: string;
    }, {
        timestamp: number;
        feedId: string;
        confidence: number;
        price: bigint;
        decimals: number;
        roundId: bigint;
        source: string;
    }>;
    /** Response metadata */
    metadata: z.ZodObject<{
        /** Response time in milliseconds */
        responseTime: z.ZodNumber;
        /** Whether data came from cache */
        fromCache: z.ZodBoolean;
        /** Data source used */
        source: z.ZodString;
        /** Aggregation method if multiple sources used */
        aggregationMethod: z.ZodOptional<z.ZodEnum<["single", "median", "weighted_average"]>>;
    }, "strip", z.ZodTypeAny, {
        source: string;
        responseTime: number;
        fromCache: boolean;
        aggregationMethod?: "single" | "median" | "weighted_average" | undefined;
    }, {
        source: string;
        responseTime: number;
        fromCache: boolean;
        aggregationMethod?: "single" | "median" | "weighted_average" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    data: {
        timestamp: number;
        feedId: string;
        confidence: number;
        price: bigint;
        decimals: number;
        roundId: bigint;
        source: string;
    };
    metadata: {
        source: string;
        responseTime: number;
        fromCache: boolean;
        aggregationMethod?: "single" | "median" | "weighted_average" | undefined;
    };
}, {
    data: {
        timestamp: number;
        feedId: string;
        confidence: number;
        price: bigint;
        decimals: number;
        roundId: bigint;
        source: string;
    };
    metadata: {
        source: string;
        responseTime: number;
        fromCache: boolean;
        aggregationMethod?: "single" | "median" | "weighted_average" | undefined;
    };
}>;
export type OracleResponse = z.infer<typeof OracleResponseSchema>;
/**
 * Price validation result
 */
export declare const PriceValidationResultSchema: z.ZodObject<{
    /** Whether the price passed validation */
    isValid: z.ZodBoolean;
    /** Validation score (0-100) */
    score: z.ZodNumber;
    /** List of validation issues */
    issues: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        severity: z.ZodEnum<["info", "warning", "error"]>;
        message: z.ZodString;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        severity: "info" | "warning" | "error";
        metadata?: Record<string, unknown> | undefined;
    }, {
        code: string;
        message: string;
        severity: "info" | "warning" | "error";
        metadata?: Record<string, unknown> | undefined;
    }>, "many">;
    /** Validated price data (if valid) */
    validatedData: z.ZodOptional<z.ZodObject<{
        /** Asset pair identifier (e.g., "ETH-USD") */
        feedId: z.ZodString;
        /** Price value in the feed's decimal precision */
        price: z.ZodBigInt;
        /** Number of decimal places for the price */
        decimals: z.ZodNumber;
        /** Unix timestamp of the price update */
        timestamp: z.ZodNumber;
        /** Round ID from the oracle aggregator */
        roundId: z.ZodBigInt;
        /** Confidence percentage (0-100) */
        confidence: z.ZodNumber;
        /** Oracle data source identifier */
        source: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        timestamp: number;
        feedId: string;
        confidence: number;
        price: bigint;
        decimals: number;
        roundId: bigint;
        source: string;
    }, {
        timestamp: number;
        feedId: string;
        confidence: number;
        price: bigint;
        decimals: number;
        roundId: bigint;
        source: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    issues: {
        code: string;
        message: string;
        severity: "info" | "warning" | "error";
        metadata?: Record<string, unknown> | undefined;
    }[];
    isValid: boolean;
    score: number;
    validatedData?: {
        timestamp: number;
        feedId: string;
        confidence: number;
        price: bigint;
        decimals: number;
        roundId: bigint;
        source: string;
    } | undefined;
}, {
    issues: {
        code: string;
        message: string;
        severity: "info" | "warning" | "error";
        metadata?: Record<string, unknown> | undefined;
    }[];
    isValid: boolean;
    score: number;
    validatedData?: {
        timestamp: number;
        feedId: string;
        confidence: number;
        price: bigint;
        decimals: number;
        roundId: bigint;
        source: string;
    } | undefined;
}>;
export type PriceValidationResult = z.infer<typeof PriceValidationResultSchema>;
/**
 * Functional oracle operation types
 */
/** Oracle operation that may fail */
export type OracleOperation<A> = IO<Either<OracleError, A>>;
/** Oracle operation that may return no data */
export type OracleQuery<A> = IO<Option<A>>;
/** Oracle price fetch operation */
export type PriceFetch = (query: OracleQueryData) => OracleOperation<OracleResponse>;
/** Oracle health check operation */
export type HealthCheck = () => OracleOperation<OracleHealth>;
/** Price validation operation */
export type PriceValidator = (data: OraclePriceData) => Either<ValidationError, PriceValidationResult>;
/**
 * Oracle service interface
 */
export interface IOracleService {
    /** Fetch current price data */
    readonly fetchPrice: PriceFetch;
    /** Check oracle service health */
    readonly checkHealth: HealthCheck;
    /** Validate price data */
    readonly validatePrice: PriceValidator;
    /** Get supported feed IDs */
    readonly getSupportedFeeds: () => readonly string[];
    /** Get feed configuration */
    readonly getFeedConfig: (feedId: string) => Option<OracleFeedConfig>;
}
/**
 * Oracle aggregation types
 */
export declare const AggregationMethodSchema: z.ZodEnum<["median", "mean", "weighted_average", "trimmed_mean", "mode"]>;
export type AggregationMethod = z.infer<typeof AggregationMethodSchema>;
export declare const AggregationConfigSchema: z.ZodObject<{
    /** Aggregation method to use */
    method: z.ZodEnum<["median", "mean", "weighted_average", "trimmed_mean", "mode"]>;
    /** Minimum number of sources required */
    minSources: z.ZodNumber;
    /** Maximum number of sources to use */
    maxSources: z.ZodNumber;
    /** Outlier detection threshold (standard deviations) */
    outlierThreshold: z.ZodDefault<z.ZodNumber>;
    /** Confidence weighting factor */
    confidenceWeight: z.ZodDefault<z.ZodNumber>;
    /** Recency weighting factor */
    recencyWeight: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    method: "median" | "weighted_average" | "mean" | "trimmed_mean" | "mode";
    minSources: number;
    maxSources: number;
    outlierThreshold: number;
    confidenceWeight: number;
    recencyWeight: number;
}, {
    method: "median" | "weighted_average" | "mean" | "trimmed_mean" | "mode";
    minSources: number;
    maxSources: number;
    outlierThreshold?: number | undefined;
    confidenceWeight?: number | undefined;
    recencyWeight?: number | undefined;
}>;
export type AggregationConfig = z.infer<typeof AggregationConfigSchema>;
/**
 * Circuit breaker types
 */
export declare const CircuitBreakerStateSchema: z.ZodEnum<["closed", "open", "half_open"]>;
export type CircuitBreakerState = z.infer<typeof CircuitBreakerStateSchema>;
export declare const CircuitBreakerConfigSchema: z.ZodObject<{
    /** Failure threshold to open circuit */
    failureThreshold: z.ZodNumber;
    /** Success threshold to close circuit */
    successThreshold: z.ZodNumber;
    /** Timeout before trying half-open state (milliseconds) */
    timeout: z.ZodNumber;
    /** Maximum price deviation before triggering (percentage) */
    maxPriceDeviation: z.ZodNumber;
    /** Monitor window size (milliseconds) */
    monitoringWindow: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    timeout: number;
    failureThreshold: number;
    successThreshold: number;
    maxPriceDeviation: number;
    monitoringWindow: number;
}, {
    timeout: number;
    failureThreshold: number;
    successThreshold: number;
    maxPriceDeviation: number;
    monitoringWindow: number;
}>;
export type CircuitBreakerConfig = z.infer<typeof CircuitBreakerConfigSchema>;
export type { OracleError, ValidationError } from '../errors/oracle-errors';
//# sourceMappingURL=oracle-types.d.ts.map