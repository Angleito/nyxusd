/**
 * Oracle Validation Schemas
 *
 * Comprehensive Zod schemas for oracle data validation
 * integrated with the NYXUSD validation system
 */

import { z } from "zod";
import { AddressSchema, TimestampSchema } from "./common.js";

/**
 * Basic oracle data schemas
 */

// Oracle feed identifier (e.g., "ETH-USD", "BTC-USD")
export const OracleFeedIdSchema = z
  .string()
  .min(1)
  .max(50)
  .regex(
    /^[A-Z]{2,10}-[A-Z]{2,10}$/,
    "Feed ID must be in format ASSET-QUOTE (e.g., ETH-USD)",
  );

// Oracle confidence percentage (0-100)
export const ConfidenceSchema = z
  .number()
  .min(0, "Confidence cannot be negative")
  .max(100, "Confidence cannot exceed 100%")
  .multipleOf(0.1, "Confidence must have at most 1 decimal place");

// Oracle round ID
export const RoundIdSchema = z
  .bigint()
  .refine((val) => val > 0n, "Round ID must be positive");

// Oracle price with decimals
export const OraclePriceSchema = z.object({
  value: z.bigint().refine((val) => val > 0n, "Price value must be positive"),
  decimals: z.number().int().min(0).max(18),
});

/**
 * Core oracle data structure
 */
export const OraclePriceDataSchema = z
  .object({
    feedId: OracleFeedIdSchema,
    price: z.bigint().refine((val) => val > 0n, "Price must be positive"),
    decimals: z.number().int().min(0).max(18),
    timestamp: TimestampSchema,
    roundId: RoundIdSchema,
    confidence: ConfidenceSchema,
    source: z.string().min(1).max(50),
  })
  .strict()
  .refine(
    (data) => {
      // Ensure timestamp is not in the future (allow 5 minutes for clock skew)
      const maxFutureTime = Math.floor(Date.now() / 1000) + 300;
      return data.timestamp <= maxFutureTime;
    },
    {
      message: "Oracle timestamp cannot be more than 5 minutes in the future",
      path: ["timestamp"],
    },
  );

/**
 * Oracle query schemas
 */
export const OracleQuerySchema = z
  .object({
    feedId: OracleFeedIdSchema,
    maxStaleness: z.number().int().positive().max(86400).optional(), // Max 24 hours
    minConfidence: ConfidenceSchema.optional(),
    allowCached: z.boolean().default(true),
    timeout: z.number().int().min(1000).max(30000).default(5000), // 1-30 seconds
  })
  .strict();

/**
 * Oracle feed configuration
 */
export const OracleFeedConfigSchema = z
  .object({
    feedId: OracleFeedIdSchema,
    description: z.string().min(1).max(100),
    address: AddressSchema,
    decimals: z.number().int().min(0).max(18),
    heartbeat: z.number().int().positive().max(86400), // Max 24 hours
    deviationThreshold: z.number().min(0).max(100),
    minConfidence: ConfidenceSchema,
    priority: z.number().int().min(1).max(10),
    isActive: z.boolean(),
    category: z.enum(["crypto", "stablecoin", "commodity", "forex"]).optional(),
  })
  .strict();

/**
 * Oracle health schemas
 */
export const OracleStatusSchema = z.enum([
  "healthy",
  "degraded",
  "critical",
  "offline",
]);

export const OracleFeedHealthSchema = z
  .object({
    status: OracleStatusSchema,
    lastUpdate: TimestampSchema,
    staleness: z.number().int().nonnegative(),
    confidence: ConfidenceSchema,
    errorCount: z.number().int().nonnegative(),
    averageResponseTime: z.number().nonnegative().optional(),
  })
  .strict();

export const OracleHealthSchema = z
  .object({
    status: OracleStatusSchema,
    feeds: z.record(OracleFeedIdSchema, OracleFeedHealthSchema),
    metrics: z
      .object({
        totalFeeds: z.number().int().nonnegative(),
        healthyFeeds: z.number().int().nonnegative(),
        averageConfidence: ConfidenceSchema,
        averageStaleness: z.number().int().nonnegative(),
        uptime: z.number().min(0).max(100),
      })
      .strict(),
    timestamp: TimestampSchema,
  })
  .strict();

/**
 * Oracle response schemas
 */
export const OracleResponseMetadataSchema = z
  .object({
    responseTime: z.number().int().nonnegative(),
    fromCache: z.boolean(),
    source: z.string().min(1).max(50),
    aggregationMethod: z
      .enum(["single", "median", "weighted_average"])
      .optional(),
  })
  .strict();

export const OracleResponseSchema = z
  .object({
    data: OraclePriceDataSchema,
    metadata: OracleResponseMetadataSchema,
  })
  .strict();

/**
 * Chainlink-specific schemas
 */
export const ChainlinkRoundDataSchema = z
  .object({
    roundId: RoundIdSchema,
    answer: z.bigint().refine((val) => val > 0n, "Answer must be positive"),
    startedAt: z
      .bigint()
      .refine((val) => val >= 0n, "StartedAt must be non-negative"),
    updatedAt: z
      .bigint()
      .refine((val) => val >= 0n, "UpdatedAt must be non-negative"),
    answeredInRound: RoundIdSchema,
  })
  .strict()
  .refine((data) => data.updatedAt >= data.startedAt, {
    message: "updatedAt must be >= startedAt",
    path: ["updatedAt"],
  })
  .refine(
    (data) => {
      // Check for reasonable processing time (max 1 hour)
      const processingTime = Number(data.updatedAt - data.startedAt);
      return processingTime <= 3600;
    },
    {
      message: "Round processing time cannot exceed 1 hour",
      path: ["updatedAt"],
    },
  );

export const ChainlinkFeedMetadataSchema = z
  .object({
    address: AddressSchema,
    decimals: z.number().int().min(0).max(18),
    description: z.string().min(1).max(100),
    version: z.number().int().positive(),
    heartbeat: z.number().int().positive(),
    deviation: z.number().min(0).max(100),
  })
  .strict();

/**
 * Price validation schemas
 */
export const PriceValidationRulesSchema = z
  .object({
    minPrice: z
      .bigint()
      .refine((val) => val > 0n, "MinPrice must be positive")
      .optional(),
    maxPrice: z
      .bigint()
      .refine((val) => val > 0n, "MaxPrice must be positive")
      .optional(),
    maxDeviation: z.number().min(0).max(100).optional(),
    referencePrice: z
      .bigint()
      .refine((val) => val > 0n, "ReferencePrice must be positive")
      .optional(),
    maxAge: z.number().int().positive().optional(),
    minConfidence: ConfidenceSchema.optional(),
    requiredDecimals: z.number().int().min(0).max(18).optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (data.minPrice && data.maxPrice) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: "minPrice must be <= maxPrice",
      path: ["maxPrice"],
    },
  );

export const PriceValidationIssueSchema = z
  .object({
    code: z.string().min(1),
    severity: z.enum(["info", "warning", "error"]),
    message: z.string().min(1),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

export const PriceValidationResultSchema = z
  .object({
    isValid: z.boolean(),
    score: z.number().min(0).max(100),
    issues: z.array(PriceValidationIssueSchema),
    validatedData: OraclePriceDataSchema.optional(),
  })
  .strict();

/**
 * Multi-oracle aggregation schemas
 */
export const AggregationMethodSchema = z.enum([
  "median",
  "mean",
  "weighted_average",
  "trimmed_mean",
  "mode",
]);

export const AggregationSourceSchema = z
  .object({
    provider: z.string().min(1).max(20),
    price: z
      .bigint()
      .refine((val) => val > 0n, "Source price must be positive"),
    weight: z.number().min(0).max(1),
    confidence: ConfidenceSchema,
    included: z.boolean(),
    reason: z.string().optional(),
  })
  .strict();

export const AggregationStatisticsSchema = z
  .object({
    standardDeviation: z.number().nonnegative(),
    variance: z.number().nonnegative(),
    medianAbsoluteDeviation: z.number().nonnegative(),
    range: z.number().nonnegative(),
    interquartileRange: z.number().nonnegative(),
  })
  .strict();

export const AggregationOutlierSchema = z
  .object({
    provider: z.string().min(1),
    price: z.bigint(),
    deviationScore: z.number(),
    reason: z.string().min(1),
  })
  .strict();

export const ConsensusInfoSchema = z
  .object({
    agreement: z.number().min(0).max(1),
    participantCount: z.number().int().nonnegative(),
    thresholdMet: z.boolean(),
  })
  .strict();

export const AggregationResultSchema = z
  .object({
    aggregatedPrice: z
      .bigint()
      .refine((val) => val > 0n, "Aggregated price must be positive"),
    method: AggregationMethodSchema,
    sources: z.array(AggregationSourceSchema).min(1),
    confidence: ConfidenceSchema,
    statistics: AggregationStatisticsSchema,
    outliers: z.array(AggregationOutlierSchema),
    consensus: ConsensusInfoSchema,
    metadata: z
      .object({
        timestamp: TimestampSchema,
        processingTime: z.number().int().nonnegative(),
        qualityScore: z.number().min(0).max(100),
      })
      .strict(),
  })
  .strict();

/**
 * Oracle service configuration schemas
 */
export const OracleProviderSchema = z.enum([
  "chainlink",
  "band",
  "dia",
  "pyth",
  "tellor",
  "api3",
  "switchboard",
]);

export const OracleNetworkConfigSchema = z
  .object({
    name: z.string().min(1),
    chainId: z.number().int().positive(),
    rpcUrl: z.string().url(),
    explorerUrl: z.string().url().optional(),
    isTestnet: z.boolean(),
  })
  .strict();

export const RetryConfigSchema = z
  .object({
    maxAttempts: z.number().int().min(1).max(10),
    delayMs: z.number().int().positive(),
    backoffMultiplier: z.number().positive(),
  })
  .strict();

export const OracleServiceConfigSchema = z
  .object({
    network: z.string().min(1),
    provider: z.union([z.string().url(), z.any()]),
    defaultTimeout: z.number().int().positive().max(30000),
    defaultMaxStaleness: z.number().int().positive().max(86400),
    defaultMinConfidence: ConfidenceSchema,
    cacheTtl: z.number().int().positive().max(3600),
    retry: RetryConfigSchema,
  })
  .strict();

/**
 * Circuit breaker schemas
 */
export const CircuitBreakerStateSchema = z.enum([
  "closed",
  "open",
  "half_open",
]);

export const CircuitBreakerConfigSchema = z
  .object({
    failureThreshold: z.number().int().min(1).max(100),
    successThreshold: z.number().int().min(1).max(100),
    timeout: z.number().int().positive(),
    maxPriceDeviation: z.number().min(0).max(100),
    monitoringWindow: z.number().int().positive(),
  })
  .strict();

export const CircuitBreakerStatusSchema = z
  .object({
    state: CircuitBreakerStateSchema,
    failureCount: z.number().int().nonnegative(),
    successCount: z.number().int().nonnegative(),
    lastFailure: TimestampSchema.optional(),
    lastSuccess: TimestampSchema.optional(),
    nextAttempt: TimestampSchema.optional(),
  })
  .strict();

/**
 * AI Oracle schemas for LLM integration
 */
export const AIRiskFactorSchema = z
  .object({
    factor: z.string().min(1),
    impact: z.enum(["low", "medium", "high"]),
    probability: z.number().min(0).max(1),
    description: z.string().min(1),
  })
  .strict();

export const AIRecommendationSchema = z
  .object({
    action: z.string().min(1),
    priority: z.enum(["low", "medium", "high"]),
    rationale: z.string().min(1),
  })
  .strict();

export const AISentimentSchema = z
  .object({
    overall: z.enum(["bearish", "neutral", "bullish"]),
    score: z.number().min(-1).max(1),
    sources: z.array(z.string()).optional(),
  })
  .strict();

export const AIRiskAssessmentSchema = z
  .object({
    riskScore: z.number().min(0).max(100),
    confidence: z.number().min(0).max(1),
    riskFactors: z.array(AIRiskFactorSchema),
    recommendations: z.array(AIRecommendationSchema),
    sentiment: AISentimentSchema,
    liquidationProbability: z
      .object({
        "1h": z.number().min(0).max(1),
        "24h": z.number().min(0).max(1),
        "7d": z.number().min(0).max(1),
      })
      .strict(),
    metadata: z
      .object({
        model: z.string().min(1),
        processingTime: z.number().int().nonnegative(),
        timestamp: TimestampSchema,
        dataQuality: z.number().min(0).max(1),
      })
      .strict(),
  })
  .strict();

/**
 * Asset-specific validation presets
 */
export const ORACLE_VALIDATION_PRESETS = {
  "ETH-USD": PriceValidationRulesSchema.parse({
    minPrice: BigInt("1000000000"), // $10.00 with 8 decimals
    maxPrice: BigInt("10000000000000"), // $100,000 with 8 decimals
    maxDeviation: 20.0,
    maxAge: 3600,
    minConfidence: 95.0,
  }),
  "BTC-USD": PriceValidationRulesSchema.parse({
    minPrice: BigInt("500000000000"), // $5,000 with 8 decimals
    maxPrice: BigInt("50000000000000"), // $500,000 with 8 decimals
    maxDeviation: 15.0,
    maxAge: 3600,
    minConfidence: 95.0,
  }),
  "USDC-USD": PriceValidationRulesSchema.parse({
    minPrice: BigInt("95000000"), // $0.95 with 8 decimals
    maxPrice: BigInt("105000000"), // $1.05 with 8 decimals
    maxDeviation: 2.0,
    maxAge: 86400,
    minConfidence: 99.0,
  }),
  "USDT-USD": PriceValidationRulesSchema.parse({
    minPrice: BigInt("95000000"), // $0.95 with 8 decimals
    maxPrice: BigInt("105000000"), // $1.05 with 8 decimals
    maxDeviation: 2.0,
    maxAge: 86400,
    minConfidence: 99.0,
  }),
  "DAI-USD": PriceValidationRulesSchema.parse({
    minPrice: BigInt("95000000"), // $0.95 with 8 decimals
    maxPrice: BigInt("105000000"), // $1.05 with 8 decimals
    maxDeviation: 2.0,
    maxAge: 86400,
    minConfidence: 99.0,
  }),
} as const;

/**
 * Oracle error schemas for comprehensive error handling
 */
export const OracleErrorSchema = z
  .object({
    code: z.string().min(1),
    message: z.string().min(1),
    severity: z.enum(["low", "medium", "high", "critical"]),
    timestamp: TimestampSchema,
    context: z.record(z.unknown()).optional(),
    cause: z.unknown().optional(),
    recoveryActions: z.array(z.string()).optional(),
  })
  .strict();

// Specific oracle error types
export const NetworkErrorSchema = OracleErrorSchema.extend({
  code: z.literal("NETWORK_ERROR"),
  context: z
    .object({
      endpoint: z.string().optional(),
      statusCode: z.number().int().optional(),
      timeout: z.boolean().optional(),
    })
    .optional(),
});

export const DataValidationErrorSchema = OracleErrorSchema.extend({
  code: z.literal("DATA_VALIDATION_ERROR"),
  context: z
    .object({
      feedId: z.string().optional(),
      receivedData: z.unknown().optional(),
      validationRules: z.array(z.string()).optional(),
    })
    .optional(),
});

export const StaleDataErrorSchema = OracleErrorSchema.extend({
  code: z.literal("STALE_DATA_ERROR"),
  context: z
    .object({
      feedId: z.string().optional(),
      lastUpdate: TimestampSchema.optional(),
      maxAge: z.number().int().optional(),
      staleness: z.number().int().optional(),
    })
    .optional(),
});

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
