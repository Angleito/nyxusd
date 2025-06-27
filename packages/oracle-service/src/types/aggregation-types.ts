/**
 * Oracle Aggregation Types
 *
 * Types for multi-oracle aggregation, consensus mechanisms,
 * and data source combination strategies
 */

import { z } from "zod";
import { Either } from "fp-ts/Either";
import { Option } from "fp-ts/Option";
import { OracleProvider } from "./chainlink-types";

/**
 * Aggregation weight schema
 */
export const AggregationWeightSchema = z.object({
  /** Oracle provider */
  provider: z.string(),
  /** Weight factor (0-1) */
  weight: z.number().min(0).max(1),
  /** Whether this provider is currently active */
  isActive: z.boolean(),
  /** Provider reliability score */
  reliabilityScore: z.number().min(0).max(100),
});

export type AggregationWeight = z.infer<typeof AggregationWeightSchema>;

/**
 * Aggregation result schema
 */
export const AggregationResultSchema = z.object({
  /** Final aggregated price */
  aggregatedPrice: z.bigint(),
  /** Aggregation method used */
  method: z.enum([
    "median",
    "mean",
    "weighted_average",
    "trimmed_mean",
    "mode",
  ]),
  /** Source data used in aggregation */
  sources: z.array(
    z.object({
      provider: z.string(),
      price: z.bigint(),
      weight: z.number().min(0).max(1),
      confidence: z.number().min(0).max(100),
      included: z.boolean(),
      reason: z.string().optional(),
    }),
  ),
  /** Overall confidence in result */
  confidence: z.number().min(0).max(100),
  /** Statistical measures */
  statistics: z.object({
    /** Standard deviation of source prices */
    standardDeviation: z.number().nonnegative(),
    /** Variance of source prices */
    variance: z.number().nonnegative(),
    /** Median absolute deviation */
    medianAbsoluteDeviation: z.number().nonnegative(),
    /** Range (max - min) */
    range: z.number().nonnegative(),
    /** Interquartile range */
    interquartileRange: z.number().nonnegative(),
  }),
  /** Outlier detection results */
  outliers: z.array(
    z.object({
      provider: z.string(),
      price: z.bigint(),
      deviationScore: z.number(),
      reason: z.string(),
    }),
  ),
  /** Consensus information */
  consensus: z.object({
    /** Agreement level (0-1) */
    agreement: z.number().min(0).max(1),
    /** Number of sources in consensus */
    participantCount: z.number().int().nonnegative(),
    /** Whether consensus threshold was met */
    thresholdMet: z.boolean(),
  }),
  /** Aggregation metadata */
  metadata: z.object({
    /** Timestamp of aggregation */
    timestamp: z.number().int().positive(),
    /** Processing time in milliseconds */
    processingTime: z.number().int().nonnegative(),
    /** Aggregation quality score */
    qualityScore: z.number().min(0).max(100),
  }),
});

export type AggregationResult = z.infer<typeof AggregationResultSchema>;

/**
 * Consensus configuration
 */
export const ConsensusConfigSchema = z.object({
  /** Minimum number of sources required */
  minSources: z.number().int().min(1),
  /** Maximum number of sources to use */
  maxSources: z.number().int().min(1),
  /** Consensus threshold (percentage agreement required) */
  consensusThreshold: z.number().min(0).max(1),
  /** Maximum allowed deviation from median (percentage) */
  maxDeviation: z.number().min(0).max(100),
  /** Outlier detection method */
  outlierDetection: z.enum(["zscore", "iqr", "mad", "isolation_forest"]),
  /** Outlier threshold (standard deviations or similar) */
  outlierThreshold: z.number().positive(),
  /** Minimum confidence required from each source */
  minSourceConfidence: z.number().min(0).max(100),
  /** Time window for data staleness (seconds) */
  stalenessWindow: z.number().int().positive(),
});

export type ConsensusConfig = z.infer<typeof ConsensusConfigSchema>;

/**
 * Multi-oracle data collection result
 */
export const MultiOracleDataSchema = z.object({
  /** Feed identifier */
  feedId: z.string(),
  /** Individual oracle responses */
  responses: z.array(
    z.object({
      provider: z.string(),
      data: z.union([
        z.object({
          success: z.literal(true),
          priceData: z.any(), // OraclePriceData
          responseTime: z.number().int().nonnegative(),
        }),
        z.object({
          success: z.literal(false),
          error: z.string(),
          errorCode: z.string(),
          responseTime: z.number().int().nonnegative(),
        }),
      ]),
      timestamp: z.number().int().positive(),
    }),
  ),
  /** Collection metadata */
  metadata: z.object({
    /** Total collection time */
    totalTime: z.number().int().nonnegative(),
    /** Success rate */
    successRate: z.number().min(0).max(1),
    /** Number of successful responses */
    successfulResponses: z.number().int().nonnegative(),
    /** Number of failed responses */
    failedResponses: z.number().int().nonnegative(),
  }),
});

export type MultiOracleData = z.infer<typeof MultiOracleDataSchema>;

/**
 * Price validation rules for aggregation
 */
export const PriceValidationRulesSchema = z.object({
  /** Minimum price value */
  minPrice: z.bigint().optional(),
  /** Maximum price value */
  maxPrice: z.bigint().optional(),
  /** Maximum deviation from expected price (percentage) */
  maxDeviation: z.number().min(0).max(100).optional(),
  /** Reference price for deviation calculation */
  referencePrice: z.bigint().optional(),
  /** Maximum age of price data (seconds) */
  maxAge: z.number().int().positive().optional(),
  /** Minimum confidence required */
  minConfidence: z.number().min(0).max(100).optional(),
  /** Required decimal precision */
  requiredDecimals: z.number().int().min(0).max(18).optional(),
});

export type PriceValidationRules = z.infer<typeof PriceValidationRulesSchema>;

/**
 * Aggregation strategy configuration
 */
export const AggregationStrategySchema = z.object({
  /** Strategy name */
  name: z.string(),
  /** Aggregation method */
  method: z.enum([
    "median",
    "mean",
    "weighted_average",
    "trimmed_mean",
    "mode",
  ]),
  /** Weighting scheme */
  weighting: z.enum(["equal", "confidence", "reliability", "custom"]),
  /** Custom weights (if using custom weighting) */
  customWeights: z.record(z.string(), z.number().min(0).max(1)).optional(),
  /** Trimming percentage (for trimmed mean) */
  trimPercentage: z.number().min(0).max(0.5).optional(),
  /** Outlier handling */
  outlierHandling: z.enum(["exclude", "cap", "transform", "include"]),
  /** Quality scoring factors */
  qualityFactors: z.object({
    confidenceWeight: z.number().min(0).max(1),
    freshnessWeight: z.number().min(0).max(1),
    reliabilityWeight: z.number().min(0).max(1),
    consensusWeight: z.number().min(0).max(1),
  }),
});

export type AggregationStrategy = z.infer<typeof AggregationStrategySchema>;

/**
 * Oracle performance metrics
 */
export const OraclePerformanceSchema = z.object({
  /** Provider identifier */
  provider: z.string(),
  /** Performance metrics */
  metrics: z.object({
    /** Average response time (ms) */
    avgResponseTime: z.number().nonnegative(),
    /** Success rate (0-1) */
    successRate: z.number().min(0).max(1),
    /** Reliability score (0-100) */
    reliabilityScore: z.number().min(0).max(100),
    /** Data quality score (0-100) */
    dataQualityScore: z.number().min(0).max(100),
    /** Uptime percentage */
    uptime: z.number().min(0).max(100),
    /** Total requests */
    totalRequests: z.number().int().nonnegative(),
    /** Failed requests */
    failedRequests: z.number().int().nonnegative(),
    /** Average confidence */
    avgConfidence: z.number().min(0).max(100),
  }),
  /** Historical statistics */
  historical: z.object({
    /** 24h statistics */
    "24h": z.object({
      successRate: z.number().min(0).max(1),
      avgResponseTime: z.number().nonnegative(),
      requestCount: z.number().int().nonnegative(),
    }),
    /** 7d statistics */
    "7d": z.object({
      successRate: z.number().min(0).max(1),
      avgResponseTime: z.number().nonnegative(),
      requestCount: z.number().int().nonnegative(),
    }),
    /** 30d statistics */
    "30d": z.object({
      successRate: z.number().min(0).max(1),
      avgResponseTime: z.number().nonnegative(),
      requestCount: z.number().int().nonnegative(),
    }),
  }),
  /** Last updated timestamp */
  lastUpdated: z.number().int().positive(),
});

export type OraclePerformance = z.infer<typeof OraclePerformanceSchema>;

/**
 * Functional types for aggregation operations
 */

/** Oracle data collection operation */
export type DataCollector = (
  feedId: string,
  providers: OracleProvider[],
  timeout?: number,
) => Promise<Either<string, MultiOracleData>>;

/** Price aggregation operation */
export type PriceAggregator = (
  data: MultiOracleData,
  strategy: AggregationStrategy,
  consensus: ConsensusConfig,
) => Either<string, AggregationResult>;

/** Outlier detection operation */
export type OutlierDetector = (
  prices: Array<{ provider: string; price: bigint; confidence: number }>,
  method: "zscore" | "iqr" | "mad" | "isolation_forest",
  threshold: number,
) => Array<{ provider: string; isOutlier: boolean; score: number }>;

/** Consensus validator */
export type ConsensusValidator = (
  data: MultiOracleData,
  config: ConsensusConfig,
) => Either<
  string,
  { isValid: boolean; reason?: string; participantCount: number }
>;

/** Quality scorer */
export type QualityScorer = (
  result: AggregationResult,
  sources: MultiOracleData,
  strategy: AggregationStrategy,
) => number;

/**
 * Aggregation service interface
 */
export interface IAggregationService {
  /** Collect data from multiple oracles */
  readonly collectData: DataCollector;

  /** Aggregate collected price data */
  readonly aggregatePrices: PriceAggregator;

  /** Detect outliers in price data */
  readonly detectOutliers: OutlierDetector;

  /** Validate consensus requirements */
  readonly validateConsensus: ConsensusValidator;

  /** Calculate quality score */
  readonly calculateQuality: QualityScorer;

  /** Get provider performance metrics */
  readonly getPerformanceMetrics: (
    provider: string,
  ) => Option<OraclePerformance>;
}
