/**
 * Oracle Aggregation Types
 *
 * Types for multi-oracle aggregation, consensus mechanisms,
 * and data source combination strategies
 */
import { z } from 'zod';
import { Either } from 'fp-ts/Either';
import { Option } from 'fp-ts/Option';
import { OracleProvider } from './chainlink-types';
/**
 * Aggregation weight schema
 */
export declare const AggregationWeightSchema: z.ZodObject<{
    /** Oracle provider */
    provider: z.ZodString;
    /** Weight factor (0-1) */
    weight: z.ZodNumber;
    /** Whether this provider is currently active */
    isActive: z.ZodBoolean;
    /** Provider reliability score */
    reliabilityScore: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    provider: string;
    isActive: boolean;
    weight: number;
    reliabilityScore: number;
}, {
    provider: string;
    isActive: boolean;
    weight: number;
    reliabilityScore: number;
}>;
export type AggregationWeight = z.infer<typeof AggregationWeightSchema>;
/**
 * Aggregation result schema
 */
export declare const AggregationResultSchema: z.ZodObject<{
    /** Final aggregated price */
    aggregatedPrice: z.ZodBigInt;
    /** Aggregation method used */
    method: z.ZodEnum<["median", "mean", "weighted_average", "trimmed_mean", "mode"]>;
    /** Source data used in aggregation */
    sources: z.ZodArray<z.ZodObject<{
        provider: z.ZodString;
        price: z.ZodBigInt;
        weight: z.ZodNumber;
        confidence: z.ZodNumber;
        included: z.ZodBoolean;
        reason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        confidence: number;
        provider: string;
        price: bigint;
        weight: number;
        included: boolean;
        reason?: string | undefined;
    }, {
        confidence: number;
        provider: string;
        price: bigint;
        weight: number;
        included: boolean;
        reason?: string | undefined;
    }>, "many">;
    /** Overall confidence in result */
    confidence: z.ZodNumber;
    /** Statistical measures */
    statistics: z.ZodObject<{
        /** Standard deviation of source prices */
        standardDeviation: z.ZodNumber;
        /** Variance of source prices */
        variance: z.ZodNumber;
        /** Median absolute deviation */
        medianAbsoluteDeviation: z.ZodNumber;
        /** Range (max - min) */
        range: z.ZodNumber;
        /** Interquartile range */
        interquartileRange: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        standardDeviation: number;
        variance: number;
        medianAbsoluteDeviation: number;
        range: number;
        interquartileRange: number;
    }, {
        standardDeviation: number;
        variance: number;
        medianAbsoluteDeviation: number;
        range: number;
        interquartileRange: number;
    }>;
    /** Outlier detection results */
    outliers: z.ZodArray<z.ZodObject<{
        provider: z.ZodString;
        price: z.ZodBigInt;
        deviationScore: z.ZodNumber;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        provider: string;
        price: bigint;
        reason: string;
        deviationScore: number;
    }, {
        provider: string;
        price: bigint;
        reason: string;
        deviationScore: number;
    }>, "many">;
    /** Consensus information */
    consensus: z.ZodObject<{
        /** Agreement level (0-1) */
        agreement: z.ZodNumber;
        /** Number of sources in consensus */
        participantCount: z.ZodNumber;
        /** Whether consensus threshold was met */
        thresholdMet: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        agreement: number;
        participantCount: number;
        thresholdMet: boolean;
    }, {
        agreement: number;
        participantCount: number;
        thresholdMet: boolean;
    }>;
    /** Aggregation metadata */
    metadata: z.ZodObject<{
        /** Timestamp of aggregation */
        timestamp: z.ZodNumber;
        /** Processing time in milliseconds */
        processingTime: z.ZodNumber;
        /** Aggregation quality score */
        qualityScore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        timestamp: number;
        processingTime: number;
        qualityScore: number;
    }, {
        timestamp: number;
        processingTime: number;
        qualityScore: number;
    }>;
}, "strip", z.ZodTypeAny, {
    confidence: number;
    sources: {
        confidence: number;
        provider: string;
        price: bigint;
        weight: number;
        included: boolean;
        reason?: string | undefined;
    }[];
    method: "median" | "weighted_average" | "mean" | "trimmed_mean" | "mode";
    metadata: {
        timestamp: number;
        processingTime: number;
        qualityScore: number;
    };
    aggregatedPrice: bigint;
    statistics: {
        standardDeviation: number;
        variance: number;
        medianAbsoluteDeviation: number;
        range: number;
        interquartileRange: number;
    };
    outliers: {
        provider: string;
        price: bigint;
        reason: string;
        deviationScore: number;
    }[];
    consensus: {
        agreement: number;
        participantCount: number;
        thresholdMet: boolean;
    };
}, {
    confidence: number;
    sources: {
        confidence: number;
        provider: string;
        price: bigint;
        weight: number;
        included: boolean;
        reason?: string | undefined;
    }[];
    method: "median" | "weighted_average" | "mean" | "trimmed_mean" | "mode";
    metadata: {
        timestamp: number;
        processingTime: number;
        qualityScore: number;
    };
    aggregatedPrice: bigint;
    statistics: {
        standardDeviation: number;
        variance: number;
        medianAbsoluteDeviation: number;
        range: number;
        interquartileRange: number;
    };
    outliers: {
        provider: string;
        price: bigint;
        reason: string;
        deviationScore: number;
    }[];
    consensus: {
        agreement: number;
        participantCount: number;
        thresholdMet: boolean;
    };
}>;
export type AggregationResult = z.infer<typeof AggregationResultSchema>;
/**
 * Consensus configuration
 */
export declare const ConsensusConfigSchema: z.ZodObject<{
    /** Minimum number of sources required */
    minSources: z.ZodNumber;
    /** Maximum number of sources to use */
    maxSources: z.ZodNumber;
    /** Consensus threshold (percentage agreement required) */
    consensusThreshold: z.ZodNumber;
    /** Maximum allowed deviation from median (percentage) */
    maxDeviation: z.ZodNumber;
    /** Outlier detection method */
    outlierDetection: z.ZodEnum<["zscore", "iqr", "mad", "isolation_forest"]>;
    /** Outlier threshold (standard deviations or similar) */
    outlierThreshold: z.ZodNumber;
    /** Minimum confidence required from each source */
    minSourceConfidence: z.ZodNumber;
    /** Time window for data staleness (seconds) */
    stalenessWindow: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    minSources: number;
    maxSources: number;
    outlierThreshold: number;
    consensusThreshold: number;
    maxDeviation: number;
    outlierDetection: "zscore" | "iqr" | "mad" | "isolation_forest";
    minSourceConfidence: number;
    stalenessWindow: number;
}, {
    minSources: number;
    maxSources: number;
    outlierThreshold: number;
    consensusThreshold: number;
    maxDeviation: number;
    outlierDetection: "zscore" | "iqr" | "mad" | "isolation_forest";
    minSourceConfidence: number;
    stalenessWindow: number;
}>;
export type ConsensusConfig = z.infer<typeof ConsensusConfigSchema>;
/**
 * Multi-oracle data collection result
 */
export declare const MultiOracleDataSchema: z.ZodObject<{
    /** Feed identifier */
    feedId: z.ZodString;
    /** Individual oracle responses */
    responses: z.ZodArray<z.ZodObject<{
        provider: z.ZodString;
        data: z.ZodUnion<[z.ZodObject<{
            success: z.ZodLiteral<true>;
            priceData: z.ZodAny;
            responseTime: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            responseTime: number;
            success: true;
            priceData?: any;
        }, {
            responseTime: number;
            success: true;
            priceData?: any;
        }>, z.ZodObject<{
            success: z.ZodLiteral<false>;
            error: z.ZodString;
            errorCode: z.ZodString;
            responseTime: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            responseTime: number;
            error: string;
            success: false;
            errorCode: string;
        }, {
            responseTime: number;
            error: string;
            success: false;
            errorCode: string;
        }>]>;
        timestamp: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        timestamp: number;
        provider: string;
        data: {
            responseTime: number;
            success: true;
            priceData?: any;
        } | {
            responseTime: number;
            error: string;
            success: false;
            errorCode: string;
        };
    }, {
        timestamp: number;
        provider: string;
        data: {
            responseTime: number;
            success: true;
            priceData?: any;
        } | {
            responseTime: number;
            error: string;
            success: false;
            errorCode: string;
        };
    }>, "many">;
    /** Collection metadata */
    metadata: z.ZodObject<{
        /** Total collection time */
        totalTime: z.ZodNumber;
        /** Success rate */
        successRate: z.ZodNumber;
        /** Number of successful responses */
        successfulResponses: z.ZodNumber;
        /** Number of failed responses */
        failedResponses: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        totalTime: number;
        successRate: number;
        successfulResponses: number;
        failedResponses: number;
    }, {
        totalTime: number;
        successRate: number;
        successfulResponses: number;
        failedResponses: number;
    }>;
}, "strip", z.ZodTypeAny, {
    feedId: string;
    metadata: {
        totalTime: number;
        successRate: number;
        successfulResponses: number;
        failedResponses: number;
    };
    responses: {
        timestamp: number;
        provider: string;
        data: {
            responseTime: number;
            success: true;
            priceData?: any;
        } | {
            responseTime: number;
            error: string;
            success: false;
            errorCode: string;
        };
    }[];
}, {
    feedId: string;
    metadata: {
        totalTime: number;
        successRate: number;
        successfulResponses: number;
        failedResponses: number;
    };
    responses: {
        timestamp: number;
        provider: string;
        data: {
            responseTime: number;
            success: true;
            priceData?: any;
        } | {
            responseTime: number;
            error: string;
            success: false;
            errorCode: string;
        };
    }[];
}>;
export type MultiOracleData = z.infer<typeof MultiOracleDataSchema>;
/**
 * Price validation rules for aggregation
 */
export declare const PriceValidationRulesSchema: z.ZodObject<{
    /** Minimum price value */
    minPrice: z.ZodOptional<z.ZodBigInt>;
    /** Maximum price value */
    maxPrice: z.ZodOptional<z.ZodBigInt>;
    /** Maximum deviation from expected price (percentage) */
    maxDeviation: z.ZodOptional<z.ZodNumber>;
    /** Reference price for deviation calculation */
    referencePrice: z.ZodOptional<z.ZodBigInt>;
    /** Maximum age of price data (seconds) */
    maxAge: z.ZodOptional<z.ZodNumber>;
    /** Minimum confidence required */
    minConfidence: z.ZodOptional<z.ZodNumber>;
    /** Required decimal precision */
    requiredDecimals: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    maxAge?: number | undefined;
    minConfidence?: number | undefined;
    maxDeviation?: number | undefined;
    minPrice?: bigint | undefined;
    maxPrice?: bigint | undefined;
    referencePrice?: bigint | undefined;
    requiredDecimals?: number | undefined;
}, {
    maxAge?: number | undefined;
    minConfidence?: number | undefined;
    maxDeviation?: number | undefined;
    minPrice?: bigint | undefined;
    maxPrice?: bigint | undefined;
    referencePrice?: bigint | undefined;
    requiredDecimals?: number | undefined;
}>;
export type PriceValidationRules = z.infer<typeof PriceValidationRulesSchema>;
/**
 * Aggregation strategy configuration
 */
export declare const AggregationStrategySchema: z.ZodObject<{
    /** Strategy name */
    name: z.ZodString;
    /** Aggregation method */
    method: z.ZodEnum<["median", "mean", "weighted_average", "trimmed_mean", "mode"]>;
    /** Weighting scheme */
    weighting: z.ZodEnum<["equal", "confidence", "reliability", "custom"]>;
    /** Custom weights (if using custom weighting) */
    customWeights: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    /** Trimming percentage (for trimmed mean) */
    trimPercentage: z.ZodOptional<z.ZodNumber>;
    /** Outlier handling */
    outlierHandling: z.ZodEnum<["exclude", "cap", "transform", "include"]>;
    /** Quality scoring factors */
    qualityFactors: z.ZodObject<{
        confidenceWeight: z.ZodNumber;
        freshnessWeight: z.ZodNumber;
        reliabilityWeight: z.ZodNumber;
        consensusWeight: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        confidenceWeight: number;
        freshnessWeight: number;
        reliabilityWeight: number;
        consensusWeight: number;
    }, {
        confidenceWeight: number;
        freshnessWeight: number;
        reliabilityWeight: number;
        consensusWeight: number;
    }>;
}, "strip", z.ZodTypeAny, {
    method: "median" | "weighted_average" | "mean" | "trimmed_mean" | "mode";
    name: string;
    weighting: "custom" | "confidence" | "equal" | "reliability";
    outlierHandling: "exclude" | "cap" | "transform" | "include";
    qualityFactors: {
        confidenceWeight: number;
        freshnessWeight: number;
        reliabilityWeight: number;
        consensusWeight: number;
    };
    customWeights?: Record<string, number> | undefined;
    trimPercentage?: number | undefined;
}, {
    method: "median" | "weighted_average" | "mean" | "trimmed_mean" | "mode";
    name: string;
    weighting: "custom" | "confidence" | "equal" | "reliability";
    outlierHandling: "exclude" | "cap" | "transform" | "include";
    qualityFactors: {
        confidenceWeight: number;
        freshnessWeight: number;
        reliabilityWeight: number;
        consensusWeight: number;
    };
    customWeights?: Record<string, number> | undefined;
    trimPercentage?: number | undefined;
}>;
export type AggregationStrategy = z.infer<typeof AggregationStrategySchema>;
/**
 * Oracle performance metrics
 */
export declare const OraclePerformanceSchema: z.ZodObject<{
    /** Provider identifier */
    provider: z.ZodString;
    /** Performance metrics */
    metrics: z.ZodObject<{
        /** Average response time (ms) */
        avgResponseTime: z.ZodNumber;
        /** Success rate (0-1) */
        successRate: z.ZodNumber;
        /** Reliability score (0-100) */
        reliabilityScore: z.ZodNumber;
        /** Data quality score (0-100) */
        dataQualityScore: z.ZodNumber;
        /** Uptime percentage */
        uptime: z.ZodNumber;
        /** Total requests */
        totalRequests: z.ZodNumber;
        /** Failed requests */
        failedRequests: z.ZodNumber;
        /** Average confidence */
        avgConfidence: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        uptime: number;
        reliabilityScore: number;
        successRate: number;
        avgResponseTime: number;
        dataQualityScore: number;
        totalRequests: number;
        failedRequests: number;
        avgConfidence: number;
    }, {
        uptime: number;
        reliabilityScore: number;
        successRate: number;
        avgResponseTime: number;
        dataQualityScore: number;
        totalRequests: number;
        failedRequests: number;
        avgConfidence: number;
    }>;
    /** Historical statistics */
    historical: z.ZodObject<{
        /** 24h statistics */
        '24h': z.ZodObject<{
            successRate: z.ZodNumber;
            avgResponseTime: z.ZodNumber;
            requestCount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            successRate: number;
            avgResponseTime: number;
            requestCount: number;
        }, {
            successRate: number;
            avgResponseTime: number;
            requestCount: number;
        }>;
        /** 7d statistics */
        '7d': z.ZodObject<{
            successRate: z.ZodNumber;
            avgResponseTime: z.ZodNumber;
            requestCount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            successRate: number;
            avgResponseTime: number;
            requestCount: number;
        }, {
            successRate: number;
            avgResponseTime: number;
            requestCount: number;
        }>;
        /** 30d statistics */
        '30d': z.ZodObject<{
            successRate: z.ZodNumber;
            avgResponseTime: z.ZodNumber;
            requestCount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            successRate: number;
            avgResponseTime: number;
            requestCount: number;
        }, {
            successRate: number;
            avgResponseTime: number;
            requestCount: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        '24h': {
            successRate: number;
            avgResponseTime: number;
            requestCount: number;
        };
        '7d': {
            successRate: number;
            avgResponseTime: number;
            requestCount: number;
        };
        '30d': {
            successRate: number;
            avgResponseTime: number;
            requestCount: number;
        };
    }, {
        '24h': {
            successRate: number;
            avgResponseTime: number;
            requestCount: number;
        };
        '7d': {
            successRate: number;
            avgResponseTime: number;
            requestCount: number;
        };
        '30d': {
            successRate: number;
            avgResponseTime: number;
            requestCount: number;
        };
    }>;
    /** Last updated timestamp */
    lastUpdated: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    provider: string;
    metrics: {
        uptime: number;
        reliabilityScore: number;
        successRate: number;
        avgResponseTime: number;
        dataQualityScore: number;
        totalRequests: number;
        failedRequests: number;
        avgConfidence: number;
    };
    historical: {
        '24h': {
            successRate: number;
            avgResponseTime: number;
            requestCount: number;
        };
        '7d': {
            successRate: number;
            avgResponseTime: number;
            requestCount: number;
        };
        '30d': {
            successRate: number;
            avgResponseTime: number;
            requestCount: number;
        };
    };
    lastUpdated: number;
}, {
    provider: string;
    metrics: {
        uptime: number;
        reliabilityScore: number;
        successRate: number;
        avgResponseTime: number;
        dataQualityScore: number;
        totalRequests: number;
        failedRequests: number;
        avgConfidence: number;
    };
    historical: {
        '24h': {
            successRate: number;
            avgResponseTime: number;
            requestCount: number;
        };
        '7d': {
            successRate: number;
            avgResponseTime: number;
            requestCount: number;
        };
        '30d': {
            successRate: number;
            avgResponseTime: number;
            requestCount: number;
        };
    };
    lastUpdated: number;
}>;
export type OraclePerformance = z.infer<typeof OraclePerformanceSchema>;
/**
 * Functional types for aggregation operations
 */
/** Oracle data collection operation */
export type DataCollector = (feedId: string, providers: OracleProvider[], timeout?: number) => Promise<Either<string, MultiOracleData>>;
/** Price aggregation operation */
export type PriceAggregator = (data: MultiOracleData, strategy: AggregationStrategy, consensus: ConsensusConfig) => Either<string, AggregationResult>;
/** Outlier detection operation */
export type OutlierDetector = (prices: Array<{
    provider: string;
    price: bigint;
    confidence: number;
}>, method: 'zscore' | 'iqr' | 'mad' | 'isolation_forest', threshold: number) => Array<{
    provider: string;
    isOutlier: boolean;
    score: number;
}>;
/** Consensus validator */
export type ConsensusValidator = (data: MultiOracleData, config: ConsensusConfig) => Either<string, {
    isValid: boolean;
    reason?: string;
    participantCount: number;
}>;
/** Quality scorer */
export type QualityScorer = (result: AggregationResult, sources: MultiOracleData, strategy: AggregationStrategy) => number;
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
    readonly getPerformanceMetrics: (provider: string) => Option<OraclePerformance>;
}
//# sourceMappingURL=aggregation-types.d.ts.map