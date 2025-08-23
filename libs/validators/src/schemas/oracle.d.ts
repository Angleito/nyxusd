/**
 * Oracle Validation Schemas
 *
 * Comprehensive Zod schemas for oracle data validation
 * integrated with the NYXUSD validation system
 */
import { z } from "zod";
/**
 * Basic oracle data schemas
 */
export declare const OracleFeedIdSchema: z.ZodString;
export declare const ConfidenceSchema: z.ZodNumber;
export declare const RoundIdSchema: z.ZodEffects<z.ZodBigInt, bigint, bigint>;
export declare const OraclePriceSchema: z.ZodObject<{
    value: z.ZodEffects<z.ZodBigInt, bigint, bigint>;
    decimals: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    value: bigint;
    decimals: number;
}, {
    value: bigint;
    decimals: number;
}>;
/**
 * Core oracle data structure
 */
export declare const OraclePriceDataSchema: z.ZodEffects<z.ZodObject<{
    feedId: z.ZodString;
    price: z.ZodEffects<z.ZodBigInt, bigint, bigint>;
    decimals: z.ZodNumber;
    timestamp: z.ZodNumber;
    roundId: z.ZodEffects<z.ZodBigInt, bigint, bigint>;
    confidence: z.ZodNumber;
    source: z.ZodString;
}, "strict", z.ZodTypeAny, {
    timestamp: number;
    decimals: number;
    confidence: number;
    price: bigint;
    feedId: string;
    roundId: bigint;
    source: string;
}, {
    timestamp: number;
    decimals: number;
    confidence: number;
    price: bigint;
    feedId: string;
    roundId: bigint;
    source: string;
}>, {
    timestamp: number;
    decimals: number;
    confidence: number;
    price: bigint;
    feedId: string;
    roundId: bigint;
    source: string;
}, {
    timestamp: number;
    decimals: number;
    confidence: number;
    price: bigint;
    feedId: string;
    roundId: bigint;
    source: string;
}>;
/**
 * Oracle query schemas
 */
export declare const OracleQuerySchema: z.ZodObject<{
    feedId: z.ZodString;
    maxStaleness: z.ZodOptional<z.ZodNumber>;
    minConfidence: z.ZodOptional<z.ZodNumber>;
    allowCached: z.ZodDefault<z.ZodBoolean>;
    timeout: z.ZodDefault<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    feedId: string;
    allowCached: boolean;
    timeout: number;
    maxStaleness?: number | undefined;
    minConfidence?: number | undefined;
}, {
    feedId: string;
    maxStaleness?: number | undefined;
    minConfidence?: number | undefined;
    allowCached?: boolean | undefined;
    timeout?: number | undefined;
}>;
/**
 * Oracle feed configuration
 */
export declare const OracleFeedConfigSchema: z.ZodObject<{
    feedId: z.ZodString;
    description: z.ZodString;
    address: z.ZodEffects<z.ZodString, string, string>;
    decimals: z.ZodNumber;
    heartbeat: z.ZodNumber;
    deviationThreshold: z.ZodNumber;
    minConfidence: z.ZodNumber;
    priority: z.ZodNumber;
    isActive: z.ZodBoolean;
    category: z.ZodOptional<z.ZodEnum<["crypto", "stablecoin", "commodity", "forex"]>>;
}, "strict", z.ZodTypeAny, {
    address: string;
    decimals: number;
    isActive: boolean;
    description: string;
    priority: number;
    feedId: string;
    minConfidence: number;
    heartbeat: number;
    deviationThreshold: number;
    category?: "crypto" | "stablecoin" | "commodity" | "forex" | undefined;
}, {
    address: string;
    decimals: number;
    isActive: boolean;
    description: string;
    priority: number;
    feedId: string;
    minConfidence: number;
    heartbeat: number;
    deviationThreshold: number;
    category?: "crypto" | "stablecoin" | "commodity" | "forex" | undefined;
}>;
/**
 * Oracle health schemas
 */
export declare const OracleStatusSchema: z.ZodEnum<["healthy", "degraded", "critical", "offline"]>;
export declare const OracleFeedHealthSchema: z.ZodObject<{
    status: z.ZodEnum<["healthy", "degraded", "critical", "offline"]>;
    lastUpdate: z.ZodNumber;
    staleness: z.ZodNumber;
    confidence: z.ZodNumber;
    errorCount: z.ZodNumber;
    averageResponseTime: z.ZodOptional<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    status: "critical" | "healthy" | "degraded" | "offline";
    confidence: number;
    lastUpdate: number;
    staleness: number;
    errorCount: number;
    averageResponseTime?: number | undefined;
}, {
    status: "critical" | "healthy" | "degraded" | "offline";
    confidence: number;
    lastUpdate: number;
    staleness: number;
    errorCount: number;
    averageResponseTime?: number | undefined;
}>;
export declare const OracleHealthSchema: z.ZodObject<{
    status: z.ZodEnum<["healthy", "degraded", "critical", "offline"]>;
    feeds: z.ZodRecord<z.ZodString, z.ZodObject<{
        status: z.ZodEnum<["healthy", "degraded", "critical", "offline"]>;
        lastUpdate: z.ZodNumber;
        staleness: z.ZodNumber;
        confidence: z.ZodNumber;
        errorCount: z.ZodNumber;
        averageResponseTime: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        status: "critical" | "healthy" | "degraded" | "offline";
        confidence: number;
        lastUpdate: number;
        staleness: number;
        errorCount: number;
        averageResponseTime?: number | undefined;
    }, {
        status: "critical" | "healthy" | "degraded" | "offline";
        confidence: number;
        lastUpdate: number;
        staleness: number;
        errorCount: number;
        averageResponseTime?: number | undefined;
    }>>;
    metrics: z.ZodObject<{
        totalFeeds: z.ZodNumber;
        healthyFeeds: z.ZodNumber;
        averageConfidence: z.ZodNumber;
        averageStaleness: z.ZodNumber;
        uptime: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
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
    timestamp: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    timestamp: number;
    status: "critical" | "healthy" | "degraded" | "offline";
    feeds: Record<string, {
        status: "critical" | "healthy" | "degraded" | "offline";
        confidence: number;
        lastUpdate: number;
        staleness: number;
        errorCount: number;
        averageResponseTime?: number | undefined;
    }>;
    metrics: {
        totalFeeds: number;
        healthyFeeds: number;
        averageConfidence: number;
        averageStaleness: number;
        uptime: number;
    };
}, {
    timestamp: number;
    status: "critical" | "healthy" | "degraded" | "offline";
    feeds: Record<string, {
        status: "critical" | "healthy" | "degraded" | "offline";
        confidence: number;
        lastUpdate: number;
        staleness: number;
        errorCount: number;
        averageResponseTime?: number | undefined;
    }>;
    metrics: {
        totalFeeds: number;
        healthyFeeds: number;
        averageConfidence: number;
        averageStaleness: number;
        uptime: number;
    };
}>;
/**
 * Oracle response schemas
 */
export declare const OracleResponseMetadataSchema: z.ZodObject<{
    responseTime: z.ZodNumber;
    fromCache: z.ZodBoolean;
    source: z.ZodString;
    aggregationMethod: z.ZodOptional<z.ZodEnum<["single", "median", "weighted_average"]>>;
}, "strict", z.ZodTypeAny, {
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
export declare const OracleResponseSchema: z.ZodObject<{
    data: z.ZodEffects<z.ZodObject<{
        feedId: z.ZodString;
        price: z.ZodEffects<z.ZodBigInt, bigint, bigint>;
        decimals: z.ZodNumber;
        timestamp: z.ZodNumber;
        roundId: z.ZodEffects<z.ZodBigInt, bigint, bigint>;
        confidence: z.ZodNumber;
        source: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        timestamp: number;
        decimals: number;
        confidence: number;
        price: bigint;
        feedId: string;
        roundId: bigint;
        source: string;
    }, {
        timestamp: number;
        decimals: number;
        confidence: number;
        price: bigint;
        feedId: string;
        roundId: bigint;
        source: string;
    }>, {
        timestamp: number;
        decimals: number;
        confidence: number;
        price: bigint;
        feedId: string;
        roundId: bigint;
        source: string;
    }, {
        timestamp: number;
        decimals: number;
        confidence: number;
        price: bigint;
        feedId: string;
        roundId: bigint;
        source: string;
    }>;
    metadata: z.ZodObject<{
        responseTime: z.ZodNumber;
        fromCache: z.ZodBoolean;
        source: z.ZodString;
        aggregationMethod: z.ZodOptional<z.ZodEnum<["single", "median", "weighted_average"]>>;
    }, "strict", z.ZodTypeAny, {
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
}, "strict", z.ZodTypeAny, {
    metadata: {
        source: string;
        responseTime: number;
        fromCache: boolean;
        aggregationMethod?: "single" | "median" | "weighted_average" | undefined;
    };
    data: {
        timestamp: number;
        decimals: number;
        confidence: number;
        price: bigint;
        feedId: string;
        roundId: bigint;
        source: string;
    };
}, {
    metadata: {
        source: string;
        responseTime: number;
        fromCache: boolean;
        aggregationMethod?: "single" | "median" | "weighted_average" | undefined;
    };
    data: {
        timestamp: number;
        decimals: number;
        confidence: number;
        price: bigint;
        feedId: string;
        roundId: bigint;
        source: string;
    };
}>;
/**
 * Chainlink-specific schemas
 */
export declare const ChainlinkRoundDataSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    roundId: z.ZodEffects<z.ZodBigInt, bigint, bigint>;
    answer: z.ZodEffects<z.ZodBigInt, bigint, bigint>;
    startedAt: z.ZodEffects<z.ZodBigInt, bigint, bigint>;
    updatedAt: z.ZodEffects<z.ZodBigInt, bigint, bigint>;
    answeredInRound: z.ZodEffects<z.ZodBigInt, bigint, bigint>;
}, "strict", z.ZodTypeAny, {
    updatedAt: bigint;
    roundId: bigint;
    answer: bigint;
    startedAt: bigint;
    answeredInRound: bigint;
}, {
    updatedAt: bigint;
    roundId: bigint;
    answer: bigint;
    startedAt: bigint;
    answeredInRound: bigint;
}>, {
    updatedAt: bigint;
    roundId: bigint;
    answer: bigint;
    startedAt: bigint;
    answeredInRound: bigint;
}, {
    updatedAt: bigint;
    roundId: bigint;
    answer: bigint;
    startedAt: bigint;
    answeredInRound: bigint;
}>, {
    updatedAt: bigint;
    roundId: bigint;
    answer: bigint;
    startedAt: bigint;
    answeredInRound: bigint;
}, {
    updatedAt: bigint;
    roundId: bigint;
    answer: bigint;
    startedAt: bigint;
    answeredInRound: bigint;
}>;
export declare const ChainlinkFeedMetadataSchema: z.ZodObject<{
    address: z.ZodEffects<z.ZodString, string, string>;
    decimals: z.ZodNumber;
    description: z.ZodString;
    version: z.ZodNumber;
    heartbeat: z.ZodNumber;
    deviation: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    address: string;
    decimals: number;
    description: string;
    heartbeat: number;
    version: number;
    deviation: number;
}, {
    address: string;
    decimals: number;
    description: string;
    heartbeat: number;
    version: number;
    deviation: number;
}>;
/**
 * Price validation schemas
 */
export declare const PriceValidationRulesSchema: z.ZodEffects<z.ZodObject<{
    minPrice: z.ZodOptional<z.ZodEffects<z.ZodBigInt, bigint, bigint>>;
    maxPrice: z.ZodOptional<z.ZodEffects<z.ZodBigInt, bigint, bigint>>;
    maxDeviation: z.ZodOptional<z.ZodNumber>;
    referencePrice: z.ZodOptional<z.ZodEffects<z.ZodBigInt, bigint, bigint>>;
    maxAge: z.ZodOptional<z.ZodNumber>;
    minConfidence: z.ZodOptional<z.ZodNumber>;
    requiredDecimals: z.ZodOptional<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    minConfidence?: number | undefined;
    minPrice?: bigint | undefined;
    maxPrice?: bigint | undefined;
    maxDeviation?: number | undefined;
    referencePrice?: bigint | undefined;
    maxAge?: number | undefined;
    requiredDecimals?: number | undefined;
}, {
    minConfidence?: number | undefined;
    minPrice?: bigint | undefined;
    maxPrice?: bigint | undefined;
    maxDeviation?: number | undefined;
    referencePrice?: bigint | undefined;
    maxAge?: number | undefined;
    requiredDecimals?: number | undefined;
}>, {
    minConfidence?: number | undefined;
    minPrice?: bigint | undefined;
    maxPrice?: bigint | undefined;
    maxDeviation?: number | undefined;
    referencePrice?: bigint | undefined;
    maxAge?: number | undefined;
    requiredDecimals?: number | undefined;
}, {
    minConfidence?: number | undefined;
    minPrice?: bigint | undefined;
    maxPrice?: bigint | undefined;
    maxDeviation?: number | undefined;
    referencePrice?: bigint | undefined;
    maxAge?: number | undefined;
    requiredDecimals?: number | undefined;
}>;
export declare const PriceValidationIssueSchema: z.ZodObject<{
    code: z.ZodString;
    severity: z.ZodEnum<["info", "warning", "error"]>;
    message: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strict", z.ZodTypeAny, {
    code: string;
    message: string;
    severity: "info" | "error" | "warning";
    metadata?: Record<string, unknown> | undefined;
}, {
    code: string;
    message: string;
    severity: "info" | "error" | "warning";
    metadata?: Record<string, unknown> | undefined;
}>;
export declare const PriceValidationResultSchema: z.ZodObject<{
    isValid: z.ZodBoolean;
    score: z.ZodNumber;
    issues: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        severity: z.ZodEnum<["info", "warning", "error"]>;
        message: z.ZodString;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strict", z.ZodTypeAny, {
        code: string;
        message: string;
        severity: "info" | "error" | "warning";
        metadata?: Record<string, unknown> | undefined;
    }, {
        code: string;
        message: string;
        severity: "info" | "error" | "warning";
        metadata?: Record<string, unknown> | undefined;
    }>, "many">;
    validatedData: z.ZodOptional<z.ZodEffects<z.ZodObject<{
        feedId: z.ZodString;
        price: z.ZodEffects<z.ZodBigInt, bigint, bigint>;
        decimals: z.ZodNumber;
        timestamp: z.ZodNumber;
        roundId: z.ZodEffects<z.ZodBigInt, bigint, bigint>;
        confidence: z.ZodNumber;
        source: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        timestamp: number;
        decimals: number;
        confidence: number;
        price: bigint;
        feedId: string;
        roundId: bigint;
        source: string;
    }, {
        timestamp: number;
        decimals: number;
        confidence: number;
        price: bigint;
        feedId: string;
        roundId: bigint;
        source: string;
    }>, {
        timestamp: number;
        decimals: number;
        confidence: number;
        price: bigint;
        feedId: string;
        roundId: bigint;
        source: string;
    }, {
        timestamp: number;
        decimals: number;
        confidence: number;
        price: bigint;
        feedId: string;
        roundId: bigint;
        source: string;
    }>>;
}, "strict", z.ZodTypeAny, {
    issues: {
        code: string;
        message: string;
        severity: "info" | "error" | "warning";
        metadata?: Record<string, unknown> | undefined;
    }[];
    isValid: boolean;
    score: number;
    validatedData?: {
        timestamp: number;
        decimals: number;
        confidence: number;
        price: bigint;
        feedId: string;
        roundId: bigint;
        source: string;
    } | undefined;
}, {
    issues: {
        code: string;
        message: string;
        severity: "info" | "error" | "warning";
        metadata?: Record<string, unknown> | undefined;
    }[];
    isValid: boolean;
    score: number;
    validatedData?: {
        timestamp: number;
        decimals: number;
        confidence: number;
        price: bigint;
        feedId: string;
        roundId: bigint;
        source: string;
    } | undefined;
}>;
/**
 * Multi-oracle aggregation schemas
 */
export declare const AggregationMethodSchema: z.ZodEnum<["median", "mean", "weighted_average", "trimmed_mean", "mode"]>;
export declare const AggregationSourceSchema: z.ZodObject<{
    provider: z.ZodString;
    price: z.ZodEffects<z.ZodBigInt, bigint, bigint>;
    weight: z.ZodNumber;
    confidence: z.ZodNumber;
    included: z.ZodBoolean;
    reason: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    confidence: number;
    provider: string;
    weight: number;
    price: bigint;
    included: boolean;
    reason?: string | undefined;
}, {
    confidence: number;
    provider: string;
    weight: number;
    price: bigint;
    included: boolean;
    reason?: string | undefined;
}>;
export declare const AggregationStatisticsSchema: z.ZodObject<{
    standardDeviation: z.ZodNumber;
    variance: z.ZodNumber;
    medianAbsoluteDeviation: z.ZodNumber;
    range: z.ZodNumber;
    interquartileRange: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
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
export declare const AggregationOutlierSchema: z.ZodObject<{
    provider: z.ZodString;
    price: z.ZodBigInt;
    deviationScore: z.ZodNumber;
    reason: z.ZodString;
}, "strict", z.ZodTypeAny, {
    provider: string;
    price: bigint;
    reason: string;
    deviationScore: number;
}, {
    provider: string;
    price: bigint;
    reason: string;
    deviationScore: number;
}>;
export declare const ConsensusInfoSchema: z.ZodObject<{
    agreement: z.ZodNumber;
    participantCount: z.ZodNumber;
    thresholdMet: z.ZodBoolean;
}, "strict", z.ZodTypeAny, {
    agreement: number;
    participantCount: number;
    thresholdMet: boolean;
}, {
    agreement: number;
    participantCount: number;
    thresholdMet: boolean;
}>;
export declare const AggregationResultSchema: z.ZodObject<{
    aggregatedPrice: z.ZodEffects<z.ZodBigInt, bigint, bigint>;
    method: z.ZodEnum<["median", "mean", "weighted_average", "trimmed_mean", "mode"]>;
    sources: z.ZodArray<z.ZodObject<{
        provider: z.ZodString;
        price: z.ZodEffects<z.ZodBigInt, bigint, bigint>;
        weight: z.ZodNumber;
        confidence: z.ZodNumber;
        included: z.ZodBoolean;
        reason: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        confidence: number;
        provider: string;
        weight: number;
        price: bigint;
        included: boolean;
        reason?: string | undefined;
    }, {
        confidence: number;
        provider: string;
        weight: number;
        price: bigint;
        included: boolean;
        reason?: string | undefined;
    }>, "many">;
    confidence: z.ZodNumber;
    statistics: z.ZodObject<{
        standardDeviation: z.ZodNumber;
        variance: z.ZodNumber;
        medianAbsoluteDeviation: z.ZodNumber;
        range: z.ZodNumber;
        interquartileRange: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
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
    outliers: z.ZodArray<z.ZodObject<{
        provider: z.ZodString;
        price: z.ZodBigInt;
        deviationScore: z.ZodNumber;
        reason: z.ZodString;
    }, "strict", z.ZodTypeAny, {
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
    consensus: z.ZodObject<{
        agreement: z.ZodNumber;
        participantCount: z.ZodNumber;
        thresholdMet: z.ZodBoolean;
    }, "strict", z.ZodTypeAny, {
        agreement: number;
        participantCount: number;
        thresholdMet: boolean;
    }, {
        agreement: number;
        participantCount: number;
        thresholdMet: boolean;
    }>;
    metadata: z.ZodObject<{
        timestamp: z.ZodNumber;
        processingTime: z.ZodNumber;
        qualityScore: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        timestamp: number;
        processingTime: number;
        qualityScore: number;
    }, {
        timestamp: number;
        processingTime: number;
        qualityScore: number;
    }>;
}, "strict", z.ZodTypeAny, {
    metadata: {
        timestamp: number;
        processingTime: number;
        qualityScore: number;
    };
    confidence: number;
    aggregatedPrice: bigint;
    method: "median" | "weighted_average" | "mean" | "trimmed_mean" | "mode";
    sources: {
        confidence: number;
        provider: string;
        weight: number;
        price: bigint;
        included: boolean;
        reason?: string | undefined;
    }[];
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
    metadata: {
        timestamp: number;
        processingTime: number;
        qualityScore: number;
    };
    confidence: number;
    aggregatedPrice: bigint;
    method: "median" | "weighted_average" | "mean" | "trimmed_mean" | "mode";
    sources: {
        confidence: number;
        provider: string;
        weight: number;
        price: bigint;
        included: boolean;
        reason?: string | undefined;
    }[];
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
/**
 * Oracle service configuration schemas
 */
export declare const OracleProviderSchema: z.ZodEnum<["chainlink", "band", "dia", "pyth", "tellor", "api3", "switchboard"]>;
export declare const OracleNetworkConfigSchema: z.ZodObject<{
    name: z.ZodString;
    chainId: z.ZodNumber;
    rpcUrl: z.ZodString;
    explorerUrl: z.ZodOptional<z.ZodString>;
    isTestnet: z.ZodBoolean;
}, "strict", z.ZodTypeAny, {
    name: string;
    chainId: number;
    rpcUrl: string;
    isTestnet: boolean;
    explorerUrl?: string | undefined;
}, {
    name: string;
    chainId: number;
    rpcUrl: string;
    isTestnet: boolean;
    explorerUrl?: string | undefined;
}>;
export declare const RetryConfigSchema: z.ZodObject<{
    maxAttempts: z.ZodNumber;
    delayMs: z.ZodNumber;
    backoffMultiplier: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    maxAttempts: number;
    delayMs: number;
    backoffMultiplier: number;
}, {
    maxAttempts: number;
    delayMs: number;
    backoffMultiplier: number;
}>;
export declare const OracleServiceConfigSchema: z.ZodObject<{
    network: z.ZodString;
    provider: z.ZodUnion<[z.ZodString, z.ZodAny]>;
    defaultTimeout: z.ZodNumber;
    defaultMaxStaleness: z.ZodNumber;
    defaultMinConfidence: z.ZodNumber;
    cacheTtl: z.ZodNumber;
    retry: z.ZodObject<{
        maxAttempts: z.ZodNumber;
        delayMs: z.ZodNumber;
        backoffMultiplier: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        maxAttempts: number;
        delayMs: number;
        backoffMultiplier: number;
    }, {
        maxAttempts: number;
        delayMs: number;
        backoffMultiplier: number;
    }>;
}, "strict", z.ZodTypeAny, {
    network: string;
    defaultTimeout: number;
    defaultMaxStaleness: number;
    defaultMinConfidence: number;
    cacheTtl: number;
    retry: {
        maxAttempts: number;
        delayMs: number;
        backoffMultiplier: number;
    };
    provider?: any;
}, {
    network: string;
    defaultTimeout: number;
    defaultMaxStaleness: number;
    defaultMinConfidence: number;
    cacheTtl: number;
    retry: {
        maxAttempts: number;
        delayMs: number;
        backoffMultiplier: number;
    };
    provider?: any;
}>;
/**
 * Circuit breaker schemas
 */
export declare const CircuitBreakerStateSchema: z.ZodEnum<["closed", "open", "half_open"]>;
export declare const CircuitBreakerConfigSchema: z.ZodObject<{
    failureThreshold: z.ZodNumber;
    successThreshold: z.ZodNumber;
    timeout: z.ZodNumber;
    maxPriceDeviation: z.ZodNumber;
    monitoringWindow: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
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
export declare const CircuitBreakerStatusSchema: z.ZodObject<{
    state: z.ZodEnum<["closed", "open", "half_open"]>;
    failureCount: z.ZodNumber;
    successCount: z.ZodNumber;
    lastFailure: z.ZodOptional<z.ZodNumber>;
    lastSuccess: z.ZodOptional<z.ZodNumber>;
    nextAttempt: z.ZodOptional<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    state: "closed" | "open" | "half_open";
    failureCount: number;
    successCount: number;
    lastFailure?: number | undefined;
    lastSuccess?: number | undefined;
    nextAttempt?: number | undefined;
}, {
    state: "closed" | "open" | "half_open";
    failureCount: number;
    successCount: number;
    lastFailure?: number | undefined;
    lastSuccess?: number | undefined;
    nextAttempt?: number | undefined;
}>;
/**
 * AI Oracle schemas for LLM integration
 */
export declare const AIRiskFactorSchema: z.ZodObject<{
    factor: z.ZodString;
    impact: z.ZodEnum<["low", "medium", "high"]>;
    probability: z.ZodNumber;
    description: z.ZodString;
}, "strict", z.ZodTypeAny, {
    description: string;
    factor: string;
    impact: "low" | "medium" | "high";
    probability: number;
}, {
    description: string;
    factor: string;
    impact: "low" | "medium" | "high";
    probability: number;
}>;
export declare const AIRecommendationSchema: z.ZodObject<{
    action: z.ZodString;
    priority: z.ZodEnum<["low", "medium", "high"]>;
    rationale: z.ZodString;
}, "strict", z.ZodTypeAny, {
    priority: "low" | "medium" | "high";
    action: string;
    rationale: string;
}, {
    priority: "low" | "medium" | "high";
    action: string;
    rationale: string;
}>;
export declare const AISentimentSchema: z.ZodObject<{
    overall: z.ZodEnum<["bearish", "neutral", "bullish"]>;
    score: z.ZodNumber;
    sources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strict", z.ZodTypeAny, {
    score: number;
    overall: "bearish" | "neutral" | "bullish";
    sources?: string[] | undefined;
}, {
    score: number;
    overall: "bearish" | "neutral" | "bullish";
    sources?: string[] | undefined;
}>;
export declare const AIRiskAssessmentSchema: z.ZodObject<{
    riskScore: z.ZodNumber;
    confidence: z.ZodNumber;
    riskFactors: z.ZodArray<z.ZodObject<{
        factor: z.ZodString;
        impact: z.ZodEnum<["low", "medium", "high"]>;
        probability: z.ZodNumber;
        description: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        description: string;
        factor: string;
        impact: "low" | "medium" | "high";
        probability: number;
    }, {
        description: string;
        factor: string;
        impact: "low" | "medium" | "high";
        probability: number;
    }>, "many">;
    recommendations: z.ZodArray<z.ZodObject<{
        action: z.ZodString;
        priority: z.ZodEnum<["low", "medium", "high"]>;
        rationale: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        priority: "low" | "medium" | "high";
        action: string;
        rationale: string;
    }, {
        priority: "low" | "medium" | "high";
        action: string;
        rationale: string;
    }>, "many">;
    sentiment: z.ZodObject<{
        overall: z.ZodEnum<["bearish", "neutral", "bullish"]>;
        score: z.ZodNumber;
        sources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strict", z.ZodTypeAny, {
        score: number;
        overall: "bearish" | "neutral" | "bullish";
        sources?: string[] | undefined;
    }, {
        score: number;
        overall: "bearish" | "neutral" | "bullish";
        sources?: string[] | undefined;
    }>;
    liquidationProbability: z.ZodObject<{
        "1h": z.ZodNumber;
        "24h": z.ZodNumber;
        "7d": z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        "1h": number;
        "24h": number;
        "7d": number;
    }, {
        "1h": number;
        "24h": number;
        "7d": number;
    }>;
    metadata: z.ZodObject<{
        model: z.ZodString;
        processingTime: z.ZodNumber;
        timestamp: z.ZodNumber;
        dataQuality: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        timestamp: number;
        processingTime: number;
        model: string;
        dataQuality: number;
    }, {
        timestamp: number;
        processingTime: number;
        model: string;
        dataQuality: number;
    }>;
}, "strict", z.ZodTypeAny, {
    metadata: {
        timestamp: number;
        processingTime: number;
        model: string;
        dataQuality: number;
    };
    confidence: number;
    recommendations: {
        priority: "low" | "medium" | "high";
        action: string;
        rationale: string;
    }[];
    riskScore: number;
    riskFactors: {
        description: string;
        factor: string;
        impact: "low" | "medium" | "high";
        probability: number;
    }[];
    sentiment: {
        score: number;
        overall: "bearish" | "neutral" | "bullish";
        sources?: string[] | undefined;
    };
    liquidationProbability: {
        "1h": number;
        "24h": number;
        "7d": number;
    };
}, {
    metadata: {
        timestamp: number;
        processingTime: number;
        model: string;
        dataQuality: number;
    };
    confidence: number;
    recommendations: {
        priority: "low" | "medium" | "high";
        action: string;
        rationale: string;
    }[];
    riskScore: number;
    riskFactors: {
        description: string;
        factor: string;
        impact: "low" | "medium" | "high";
        probability: number;
    }[];
    sentiment: {
        score: number;
        overall: "bearish" | "neutral" | "bullish";
        sources?: string[] | undefined;
    };
    liquidationProbability: {
        "1h": number;
        "24h": number;
        "7d": number;
    };
}>;
/**
 * Asset-specific validation presets
 */
export declare const ORACLE_VALIDATION_PRESETS: {
    readonly "ETH-USD": {
        minConfidence?: number | undefined;
        minPrice?: bigint | undefined;
        maxPrice?: bigint | undefined;
        maxDeviation?: number | undefined;
        referencePrice?: bigint | undefined;
        maxAge?: number | undefined;
        requiredDecimals?: number | undefined;
    };
    readonly "BTC-USD": {
        minConfidence?: number | undefined;
        minPrice?: bigint | undefined;
        maxPrice?: bigint | undefined;
        maxDeviation?: number | undefined;
        referencePrice?: bigint | undefined;
        maxAge?: number | undefined;
        requiredDecimals?: number | undefined;
    };
    readonly "USDC-USD": {
        minConfidence?: number | undefined;
        minPrice?: bigint | undefined;
        maxPrice?: bigint | undefined;
        maxDeviation?: number | undefined;
        referencePrice?: bigint | undefined;
        maxAge?: number | undefined;
        requiredDecimals?: number | undefined;
    };
    readonly "USDT-USD": {
        minConfidence?: number | undefined;
        minPrice?: bigint | undefined;
        maxPrice?: bigint | undefined;
        maxDeviation?: number | undefined;
        referencePrice?: bigint | undefined;
        maxAge?: number | undefined;
        requiredDecimals?: number | undefined;
    };
    readonly "DAI-USD": {
        minConfidence?: number | undefined;
        minPrice?: bigint | undefined;
        maxPrice?: bigint | undefined;
        maxDeviation?: number | undefined;
        referencePrice?: bigint | undefined;
        maxAge?: number | undefined;
        requiredDecimals?: number | undefined;
    };
};
/**
 * Oracle error schemas for comprehensive error handling
 */
export declare const OracleErrorSchema: z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
    timestamp: z.ZodNumber;
    context: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    cause: z.ZodOptional<z.ZodUnknown>;
    recoveryActions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strict", z.ZodTypeAny, {
    code: string;
    timestamp: number;
    message: string;
    severity: "low" | "medium" | "high" | "critical";
    context?: Record<string, unknown> | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}, {
    code: string;
    timestamp: number;
    message: string;
    severity: "low" | "medium" | "high" | "critical";
    context?: Record<string, unknown> | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}>;
export declare const NetworkErrorSchema: z.ZodObject<{
    message: z.ZodString;
    severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
    timestamp: z.ZodNumber;
    cause: z.ZodOptional<z.ZodUnknown>;
    recoveryActions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    code: z.ZodLiteral<"NETWORK_ERROR">;
    context: z.ZodOptional<z.ZodObject<{
        endpoint: z.ZodOptional<z.ZodString>;
        statusCode: z.ZodOptional<z.ZodNumber>;
        timeout: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        timeout?: boolean | undefined;
        endpoint?: string | undefined;
        statusCode?: number | undefined;
    }, {
        timeout?: boolean | undefined;
        endpoint?: string | undefined;
        statusCode?: number | undefined;
    }>>;
}, "strict", z.ZodTypeAny, {
    code: "NETWORK_ERROR";
    timestamp: number;
    message: string;
    severity: "low" | "medium" | "high" | "critical";
    context?: {
        timeout?: boolean | undefined;
        endpoint?: string | undefined;
        statusCode?: number | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}, {
    code: "NETWORK_ERROR";
    timestamp: number;
    message: string;
    severity: "low" | "medium" | "high" | "critical";
    context?: {
        timeout?: boolean | undefined;
        endpoint?: string | undefined;
        statusCode?: number | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}>;
export declare const DataValidationErrorSchema: z.ZodObject<{
    message: z.ZodString;
    severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
    timestamp: z.ZodNumber;
    cause: z.ZodOptional<z.ZodUnknown>;
    recoveryActions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    code: z.ZodLiteral<"DATA_VALIDATION_ERROR">;
    context: z.ZodOptional<z.ZodObject<{
        feedId: z.ZodOptional<z.ZodString>;
        receivedData: z.ZodOptional<z.ZodUnknown>;
        validationRules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        feedId?: string | undefined;
        receivedData?: unknown;
        validationRules?: string[] | undefined;
    }, {
        feedId?: string | undefined;
        receivedData?: unknown;
        validationRules?: string[] | undefined;
    }>>;
}, "strict", z.ZodTypeAny, {
    code: "DATA_VALIDATION_ERROR";
    timestamp: number;
    message: string;
    severity: "low" | "medium" | "high" | "critical";
    context?: {
        feedId?: string | undefined;
        receivedData?: unknown;
        validationRules?: string[] | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}, {
    code: "DATA_VALIDATION_ERROR";
    timestamp: number;
    message: string;
    severity: "low" | "medium" | "high" | "critical";
    context?: {
        feedId?: string | undefined;
        receivedData?: unknown;
        validationRules?: string[] | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}>;
export declare const StaleDataErrorSchema: z.ZodObject<{
    message: z.ZodString;
    severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
    timestamp: z.ZodNumber;
    cause: z.ZodOptional<z.ZodUnknown>;
    recoveryActions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    code: z.ZodLiteral<"STALE_DATA_ERROR">;
    context: z.ZodOptional<z.ZodObject<{
        feedId: z.ZodOptional<z.ZodString>;
        lastUpdate: z.ZodOptional<z.ZodNumber>;
        maxAge: z.ZodOptional<z.ZodNumber>;
        staleness: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        feedId?: string | undefined;
        lastUpdate?: number | undefined;
        staleness?: number | undefined;
        maxAge?: number | undefined;
    }, {
        feedId?: string | undefined;
        lastUpdate?: number | undefined;
        staleness?: number | undefined;
        maxAge?: number | undefined;
    }>>;
}, "strict", z.ZodTypeAny, {
    code: "STALE_DATA_ERROR";
    timestamp: number;
    message: string;
    severity: "low" | "medium" | "high" | "critical";
    context?: {
        feedId?: string | undefined;
        lastUpdate?: number | undefined;
        staleness?: number | undefined;
        maxAge?: number | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}, {
    code: "STALE_DATA_ERROR";
    timestamp: number;
    message: string;
    severity: "low" | "medium" | "high" | "critical";
    context?: {
        feedId?: string | undefined;
        lastUpdate?: number | undefined;
        staleness?: number | undefined;
        maxAge?: number | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}>;
/**
 * Export type inferfaces for TypeScript
 */
export type OracleFeedId = z.infer<typeof OracleFeedIdSchema>;
export type OraclePriceData = z.infer<typeof OraclePriceDataSchema>;
export type OracleQuery = z.infer<typeof OracleQuerySchema>;
export type OracleFeedConfig = z.infer<typeof OracleFeedConfigSchema>;
export type OracleHealth = z.infer<typeof OracleHealthSchema>;
export type OracleResponse = z.infer<typeof OracleResponseSchema>;
export type ChainlinkRoundData = z.infer<typeof ChainlinkRoundDataSchema>;
export type PriceValidationResult = z.infer<typeof PriceValidationResultSchema>;
export type AggregationResult = z.infer<typeof AggregationResultSchema>;
export type AIRiskAssessment = z.infer<typeof AIRiskAssessmentSchema>;
export type CircuitBreakerStatus = z.infer<typeof CircuitBreakerStatusSchema>;
export type OracleError = z.infer<typeof OracleErrorSchema>;
//# sourceMappingURL=oracle.d.ts.map