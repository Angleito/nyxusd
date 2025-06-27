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
export const OraclePriceDataSchema = z.object({
  /** Asset pair identifier (e.g., "ETH-USD") */
  feedId: z.string().min(1),
  /** Price value in the feed's decimal precision */
  price: z.bigint().positive(),
  /** Number of decimal places for the price */
  decimals: z.number().int().min(0).max(18),
  /** Unix timestamp of the price update */
  timestamp: z.number().int().positive(),
  /** Round ID from the oracle aggregator */
  roundId: z.bigint().positive(),
  /** Confidence percentage (0-100) */
  confidence: z.number().min(0).max(100),
  /** Oracle data source identifier */
  source: z.string().min(1),
});

export type OraclePriceData = z.infer<typeof OraclePriceDataSchema>;

/**
 * Oracle feed configuration
 */
export const OracleFeedConfigSchema = z.object({
  /** Unique feed identifier */
  feedId: z.string().min(1),
  /** Human-readable description */
  description: z.string().min(1),
  /** Oracle contract address */
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  /** Number of decimals in price data */
  decimals: z.number().int().min(0).max(18),
  /** Maximum acceptable age of price data (seconds) */
  heartbeat: z.number().int().positive(),
  /** Maximum acceptable price deviation (percentage) */
  deviationThreshold: z.number().min(0).max(100),
  /** Minimum confidence required */
  minConfidence: z.number().min(0).max(100),
  /** Feed priority for aggregation (higher = more important) */
  priority: z.number().int().min(1).max(10),
  /** Whether this feed is currently active */
  isActive: z.boolean(),
});

export type OracleFeedConfig = z.infer<typeof OracleFeedConfigSchema>;

/**
 * Oracle service status
 */
export const OracleStatusSchema = z.enum([
  'healthy',
  'degraded',
  'critical',
  'offline'
]);

export type OracleStatus = z.infer<typeof OracleStatusSchema>;

/**
 * Oracle health information
 */
export const OracleHealthSchema = z.object({
  /** Overall oracle service status */
  status: OracleStatusSchema,
  /** Individual feed statuses */
  feeds: z.record(z.string(), z.object({
    status: OracleStatusSchema,
    lastUpdate: z.number().int().positive(),
    staleness: z.number().int().nonnegative(),
    confidence: z.number().min(0).max(100),
    errorCount: z.number().int().nonnegative(),
  })),
  /** System-wide metrics */
  metrics: z.object({
    totalFeeds: z.number().int().nonnegative(),
    healthyFeeds: z.number().int().nonnegative(),
    averageConfidence: z.number().min(0).max(100),
    averageStaleness: z.number().int().nonnegative(),
    uptime: z.number().min(0).max(100),
  }),
  /** Timestamp of health check */
  timestamp: z.number().int().positive(),
});

export type OracleHealth = z.infer<typeof OracleHealthSchema>;

/**
 * Oracle query parameters
 */
export const OracleQuerySchema = z.object({
  /** Asset pair to query */
  feedId: z.string().min(1),
  /** Maximum acceptable staleness (seconds) */
  maxStaleness: z.number().int().positive().optional(),
  /** Minimum required confidence */
  minConfidence: z.number().min(0).max(100).optional(),
  /** Whether to use cached data if available */
  allowCached: z.boolean().default(true),
  /** Timeout for the query (milliseconds) */
  timeout: z.number().int().positive().default(5000),
});

export type OracleQueryData = z.infer<typeof OracleQuerySchema>;

/**
 * Oracle response with metadata
 */
export const OracleResponseSchema = z.object({
  /** Price data */
  data: OraclePriceDataSchema,
  /** Response metadata */
  metadata: z.object({
    /** Response time in milliseconds */
    responseTime: z.number().int().nonnegative(),
    /** Whether data came from cache */
    fromCache: z.boolean(),
    /** Data source used */
    source: z.string(),
    /** Aggregation method if multiple sources used */
    aggregationMethod: z.enum(['single', 'median', 'weighted_average']).optional(),
  }),
});

export type OracleResponse = z.infer<typeof OracleResponseSchema>;

/**
 * Price validation result
 */
export const PriceValidationResultSchema = z.object({
  /** Whether the price passed validation */
  isValid: z.boolean(),
  /** Validation score (0-100) */
  score: z.number().min(0).max(100),
  /** List of validation issues */
  issues: z.array(z.object({
    code: z.string(),
    severity: z.enum(['info', 'warning', 'error']),
    message: z.string(),
    metadata: z.record(z.unknown()).optional(),
  })),
  /** Validated price data (if valid) */
  validatedData: OraclePriceDataSchema.optional(),
});

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
export const AggregationMethodSchema = z.enum([
  'median',
  'mean',
  'weighted_average',
  'trimmed_mean',
  'mode'
]);

export type AggregationMethod = z.infer<typeof AggregationMethodSchema>;

export const AggregationConfigSchema = z.object({
  /** Aggregation method to use */
  method: AggregationMethodSchema,
  /** Minimum number of sources required */
  minSources: z.number().int().min(1),
  /** Maximum number of sources to use */
  maxSources: z.number().int().min(1),
  /** Outlier detection threshold (standard deviations) */
  outlierThreshold: z.number().positive().default(2.5),
  /** Confidence weighting factor */
  confidenceWeight: z.number().min(0).max(1).default(0.5),
  /** Recency weighting factor */
  recencyWeight: z.number().min(0).max(1).default(0.3),
});

export type AggregationConfig = z.infer<typeof AggregationConfigSchema>;

/**
 * Circuit breaker types
 */
export const CircuitBreakerStateSchema = z.enum([
  'closed',    // Normal operation
  'open',      // Circuit breaker triggered
  'half_open'  // Testing if service has recovered
]);

export type CircuitBreakerState = z.infer<typeof CircuitBreakerStateSchema>;

export const CircuitBreakerConfigSchema = z.object({
  /** Failure threshold to open circuit */
  failureThreshold: z.number().int().min(1),
  /** Success threshold to close circuit */
  successThreshold: z.number().int().min(1),
  /** Timeout before trying half-open state (milliseconds) */
  timeout: z.number().int().positive(),
  /** Maximum price deviation before triggering (percentage) */
  maxPriceDeviation: z.number().min(0).max(100),
  /** Monitor window size (milliseconds) */
  monitoringWindow: z.number().int().positive(),
});

export type CircuitBreakerConfig = z.infer<typeof CircuitBreakerConfigSchema>;

// Re-export common error types
export type { OracleError, ValidationError } from '../errors/oracle-errors';