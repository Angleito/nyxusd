"use strict";
/**
 * Oracle Aggregation Types
 *
 * Types for multi-oracle aggregation, consensus mechanisms,
 * and data source combination strategies
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OraclePerformanceSchema = exports.AggregationStrategySchema = exports.PriceValidationRulesSchema = exports.MultiOracleDataSchema = exports.ConsensusConfigSchema = exports.AggregationResultSchema = exports.AggregationWeightSchema = void 0;
const zod_1 = require("zod");
/**
 * Aggregation weight schema
 */
exports.AggregationWeightSchema = zod_1.z.object({
    /** Oracle provider */
    provider: zod_1.z.string(),
    /** Weight factor (0-1) */
    weight: zod_1.z.number().min(0).max(1),
    /** Whether this provider is currently active */
    isActive: zod_1.z.boolean(),
    /** Provider reliability score */
    reliabilityScore: zod_1.z.number().min(0).max(100),
});
/**
 * Aggregation result schema
 */
exports.AggregationResultSchema = zod_1.z.object({
    /** Final aggregated price */
    aggregatedPrice: zod_1.z.bigint(),
    /** Aggregation method used */
    method: zod_1.z.enum([
        "median",
        "mean",
        "weighted_average",
        "trimmed_mean",
        "mode",
    ]),
    /** Source data used in aggregation */
    sources: zod_1.z.array(zod_1.z.object({
        provider: zod_1.z.string(),
        price: zod_1.z.bigint(),
        weight: zod_1.z.number().min(0).max(1),
        confidence: zod_1.z.number().min(0).max(100),
        included: zod_1.z.boolean(),
        reason: zod_1.z.string().optional(),
    })),
    /** Overall confidence in result */
    confidence: zod_1.z.number().min(0).max(100),
    /** Statistical measures */
    statistics: zod_1.z.object({
        /** Standard deviation of source prices */
        standardDeviation: zod_1.z.number().nonnegative(),
        /** Variance of source prices */
        variance: zod_1.z.number().nonnegative(),
        /** Median absolute deviation */
        medianAbsoluteDeviation: zod_1.z.number().nonnegative(),
        /** Range (max - min) */
        range: zod_1.z.number().nonnegative(),
        /** Interquartile range */
        interquartileRange: zod_1.z.number().nonnegative(),
    }),
    /** Outlier detection results */
    outliers: zod_1.z.array(zod_1.z.object({
        provider: zod_1.z.string(),
        price: zod_1.z.bigint(),
        deviationScore: zod_1.z.number(),
        reason: zod_1.z.string(),
    })),
    /** Consensus information */
    consensus: zod_1.z.object({
        /** Agreement level (0-1) */
        agreement: zod_1.z.number().min(0).max(1),
        /** Number of sources in consensus */
        participantCount: zod_1.z.number().int().nonnegative(),
        /** Whether consensus threshold was met */
        thresholdMet: zod_1.z.boolean(),
    }),
    /** Aggregation metadata */
    metadata: zod_1.z.object({
        /** Timestamp of aggregation */
        timestamp: zod_1.z.number().int().positive(),
        /** Processing time in milliseconds */
        processingTime: zod_1.z.number().int().nonnegative(),
        /** Aggregation quality score */
        qualityScore: zod_1.z.number().min(0).max(100),
    }),
});
/**
 * Consensus configuration
 */
exports.ConsensusConfigSchema = zod_1.z.object({
    /** Minimum number of sources required */
    minSources: zod_1.z.number().int().min(1),
    /** Maximum number of sources to use */
    maxSources: zod_1.z.number().int().min(1),
    /** Consensus threshold (percentage agreement required) */
    consensusThreshold: zod_1.z.number().min(0).max(1),
    /** Maximum allowed deviation from median (percentage) */
    maxDeviation: zod_1.z.number().min(0).max(100),
    /** Outlier detection method */
    outlierDetection: zod_1.z.enum(["zscore", "iqr", "mad", "isolation_forest"]),
    /** Outlier threshold (standard deviations or similar) */
    outlierThreshold: zod_1.z.number().positive(),
    /** Minimum confidence required from each source */
    minSourceConfidence: zod_1.z.number().min(0).max(100),
    /** Time window for data staleness (seconds) */
    stalenessWindow: zod_1.z.number().int().positive(),
});
/**
 * Multi-oracle data collection result
 */
exports.MultiOracleDataSchema = zod_1.z.object({
    /** Feed identifier */
    feedId: zod_1.z.string(),
    /** Individual oracle responses */
    responses: zod_1.z.array(zod_1.z.object({
        provider: zod_1.z.string(),
        data: zod_1.z.union([
            zod_1.z.object({
                success: zod_1.z.literal(true),
                priceData: zod_1.z.any(), // OraclePriceData
                responseTime: zod_1.z.number().int().nonnegative(),
            }),
            zod_1.z.object({
                success: zod_1.z.literal(false),
                error: zod_1.z.string(),
                errorCode: zod_1.z.string(),
                responseTime: zod_1.z.number().int().nonnegative(),
            }),
        ]),
        timestamp: zod_1.z.number().int().positive(),
    })),
    /** Collection metadata */
    metadata: zod_1.z.object({
        /** Total collection time */
        totalTime: zod_1.z.number().int().nonnegative(),
        /** Success rate */
        successRate: zod_1.z.number().min(0).max(1),
        /** Number of successful responses */
        successfulResponses: zod_1.z.number().int().nonnegative(),
        /** Number of failed responses */
        failedResponses: zod_1.z.number().int().nonnegative(),
    }),
});
/**
 * Price validation rules for aggregation
 */
exports.PriceValidationRulesSchema = zod_1.z.object({
    /** Minimum price value */
    minPrice: zod_1.z.bigint().optional(),
    /** Maximum price value */
    maxPrice: zod_1.z.bigint().optional(),
    /** Maximum deviation from expected price (percentage) */
    maxDeviation: zod_1.z.number().min(0).max(100).optional(),
    /** Reference price for deviation calculation */
    referencePrice: zod_1.z.bigint().optional(),
    /** Maximum age of price data (seconds) */
    maxAge: zod_1.z.number().int().positive().optional(),
    /** Minimum confidence required */
    minConfidence: zod_1.z.number().min(0).max(100).optional(),
    /** Required decimal precision */
    requiredDecimals: zod_1.z.number().int().min(0).max(18).optional(),
});
/**
 * Aggregation strategy configuration
 */
exports.AggregationStrategySchema = zod_1.z.object({
    /** Strategy name */
    name: zod_1.z.string(),
    /** Aggregation method */
    method: zod_1.z.enum([
        "median",
        "mean",
        "weighted_average",
        "trimmed_mean",
        "mode",
    ]),
    /** Weighting scheme */
    weighting: zod_1.z.enum(["equal", "confidence", "reliability", "custom"]),
    /** Custom weights (if using custom weighting) */
    customWeights: zod_1.z.record(zod_1.z.string(), zod_1.z.number().min(0).max(1)).optional(),
    /** Trimming percentage (for trimmed mean) */
    trimPercentage: zod_1.z.number().min(0).max(0.5).optional(),
    /** Outlier handling */
    outlierHandling: zod_1.z.enum(["exclude", "cap", "transform", "include"]),
    /** Quality scoring factors */
    qualityFactors: zod_1.z.object({
        confidenceWeight: zod_1.z.number().min(0).max(1),
        freshnessWeight: zod_1.z.number().min(0).max(1),
        reliabilityWeight: zod_1.z.number().min(0).max(1),
        consensusWeight: zod_1.z.number().min(0).max(1),
    }),
});
/**
 * Oracle performance metrics
 */
exports.OraclePerformanceSchema = zod_1.z.object({
    /** Provider identifier */
    provider: zod_1.z.string(),
    /** Performance metrics */
    metrics: zod_1.z.object({
        /** Average response time (ms) */
        avgResponseTime: zod_1.z.number().nonnegative(),
        /** Success rate (0-1) */
        successRate: zod_1.z.number().min(0).max(1),
        /** Reliability score (0-100) */
        reliabilityScore: zod_1.z.number().min(0).max(100),
        /** Data quality score (0-100) */
        dataQualityScore: zod_1.z.number().min(0).max(100),
        /** Uptime percentage */
        uptime: zod_1.z.number().min(0).max(100),
        /** Total requests */
        totalRequests: zod_1.z.number().int().nonnegative(),
        /** Failed requests */
        failedRequests: zod_1.z.number().int().nonnegative(),
        /** Average confidence */
        avgConfidence: zod_1.z.number().min(0).max(100),
    }),
    /** Historical statistics */
    historical: zod_1.z.object({
        /** 24h statistics */
        "24h": zod_1.z.object({
            successRate: zod_1.z.number().min(0).max(1),
            avgResponseTime: zod_1.z.number().nonnegative(),
            requestCount: zod_1.z.number().int().nonnegative(),
        }),
        /** 7d statistics */
        "7d": zod_1.z.object({
            successRate: zod_1.z.number().min(0).max(1),
            avgResponseTime: zod_1.z.number().nonnegative(),
            requestCount: zod_1.z.number().int().nonnegative(),
        }),
        /** 30d statistics */
        "30d": zod_1.z.object({
            successRate: zod_1.z.number().min(0).max(1),
            avgResponseTime: zod_1.z.number().nonnegative(),
            requestCount: zod_1.z.number().int().nonnegative(),
        }),
    }),
    /** Last updated timestamp */
    lastUpdated: zod_1.z.number().int().positive(),
});
//# sourceMappingURL=aggregation-types.js.map