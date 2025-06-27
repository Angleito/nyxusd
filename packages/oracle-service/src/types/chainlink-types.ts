/**
 * Chainlink-specific Types
 *
 * Type definitions for Chainlink oracle integration including
 * AggregatorV3Interface, Chainlink Functions, and feed configurations
 */

import { z } from "zod";

/**
 * Chainlink AggregatorV3Interface response
 */
export const ChainlinkRoundDataSchema = z.object({
  /** Round ID */
  roundId: z.bigint(),
  /** Price answer in feed decimals */
  answer: z.bigint(),
  /** Timestamp when round started */
  startedAt: z.bigint(),
  /** Timestamp when round was updated */
  updatedAt: z.bigint(),
  /** Round ID that was answered */
  answeredInRound: z.bigint(),
});

export type ChainlinkRoundData = z.infer<typeof ChainlinkRoundDataSchema>;

/**
 * Chainlink feed metadata
 */
export const ChainlinkFeedMetadataSchema = z.object({
  /** Feed contract address */
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  /** Number of decimals */
  decimals: z.number().int().min(0).max(18),
  /** Feed description */
  description: z.string(),
  /** Feed version */
  version: z.number().int().positive(),
  /** Heartbeat interval in seconds */
  heartbeat: z.number().int().positive(),
  /** Deviation threshold percentage */
  deviation: z.number().min(0).max(100),
});

export type ChainlinkFeedMetadata = z.infer<typeof ChainlinkFeedMetadataSchema>;

/**
 * Chainlink network configuration
 */
export const ChainlinkNetworkConfigSchema = z.object({
  /** Network name */
  name: z.string(),
  /** Chain ID */
  chainId: z.number().int().positive(),
  /** RPC endpoint URL */
  rpcUrl: z.string().url(),
  /** Block explorer URL */
  explorerUrl: z.string().url().optional(),
  /** Whether this is a testnet */
  isTestnet: z.boolean(),
});

export type ChainlinkNetworkConfig = z.infer<
  typeof ChainlinkNetworkConfigSchema
>;

/**
 * Supported Chainlink networks with their feed addresses
 */
export const ChainlinkFeedAddressesSchema = z.object({
  /** Ethereum Mainnet */
  ethereum: z.record(z.string(), z.string()),
  /** Polygon */
  polygon: z.record(z.string(), z.string()),
  /** Arbitrum */
  arbitrum: z.record(z.string(), z.string()),
  /** Optimism */
  optimism: z.record(z.string(), z.string()),
  /** BSC */
  bsc: z.record(z.string(), z.string()),
  /** Avalanche */
  avalanche: z.record(z.string(), z.string()),
});

export type ChainlinkFeedAddresses = z.infer<
  typeof ChainlinkFeedAddressesSchema
>;

/**
 * Chainlink Functions types
 */

/** Chainlink Functions request configuration */
export const ChainlinkFunctionRequestSchema = z.object({
  /** JavaScript source code to execute */
  source: z.string().min(1),
  /** Function arguments */
  args: z.array(z.string()).optional(),
  /** Encrypted secrets reference */
  secretsLocation: z.enum(["inline", "remote"]).optional(),
  /** Secrets data */
  secrets: z.record(z.string(), z.string()).optional(),
  /** DON ID for the request */
  donId: z.string().optional(),
  /** Gas limit for the request */
  gasLimit: z.number().int().positive().optional(),
});

export type ChainlinkFunctionRequest = z.infer<
  typeof ChainlinkFunctionRequestSchema
>;

/** Chainlink Functions response */
export const ChainlinkFunctionResponseSchema = z.object({
  /** Request ID */
  requestId: z.string(),
  /** Response data */
  data: z.unknown(),
  /** Error information if request failed */
  error: z.string().optional(),
  /** Gas used */
  gasUsed: z.number().int().nonnegative().optional(),
  /** Response timestamp */
  timestamp: z.number().int().positive(),
});

export type ChainlinkFunctionResponse = z.infer<
  typeof ChainlinkFunctionResponseSchema
>;

/**
 * AI Oracle types for LLM integration
 */

/** AI risk assessment request */
export const AIRiskAssessmentRequestSchema = z.object({
  /** Asset information */
  asset: z.object({
    symbol: z.string(),
    address: z.string().optional(),
    marketCap: z.string().optional(),
    volume24h: z.string().optional(),
  }),
  /** Current position data */
  position: z.object({
    collateralAmount: z.string(),
    debtAmount: z.string(),
    collateralizationRatio: z.number(),
  }),
  /** Market context */
  market: z.object({
    currentPrice: z.string(),
    volatility24h: z.number().optional(),
    liquidityScore: z.number().optional(),
    correlationData: z.record(z.string(), z.number()).optional(),
  }),
  /** Analysis parameters */
  parameters: z.object({
    timeHorizon: z.enum(["1h", "24h", "7d", "30d"]).default("24h"),
    confidenceLevel: z.number().min(0).max(1).default(0.95),
    stressTestScenarios: z.array(z.string()).optional(),
  }),
});

export type AIRiskAssessmentRequest = z.infer<
  typeof AIRiskAssessmentRequestSchema
>;

/** AI risk assessment response */
export const AIRiskAssessmentResponseSchema = z.object({
  /** Risk score (0-100) */
  riskScore: z.number().min(0).max(100),
  /** Confidence in the assessment */
  confidence: z.number().min(0).max(1),
  /** Risk factors identified */
  riskFactors: z.array(
    z.object({
      factor: z.string(),
      impact: z.enum(["low", "medium", "high"]),
      probability: z.number().min(0).max(1),
      description: z.string(),
    }),
  ),
  /** Recommended actions */
  recommendations: z.array(
    z.object({
      action: z.string(),
      priority: z.enum(["low", "medium", "high"]),
      rationale: z.string(),
    }),
  ),
  /** Market sentiment analysis */
  sentiment: z.object({
    overall: z.enum(["bearish", "neutral", "bullish"]),
    score: z.number().min(-1).max(1),
    sources: z.array(z.string()).optional(),
  }),
  /** Liquidation probability */
  liquidationProbability: z.object({
    "1h": z.number().min(0).max(1),
    "24h": z.number().min(0).max(1),
    "7d": z.number().min(0).max(1),
  }),
  /** Response metadata */
  metadata: z.object({
    model: z.string(),
    processingTime: z.number().int().nonnegative(),
    timestamp: z.number().int().positive(),
    dataQuality: z.number().min(0).max(1),
  }),
});

export type AIRiskAssessmentResponse = z.infer<
  typeof AIRiskAssessmentResponseSchema
>;

/**
 * Oracle provider types
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

export type OracleProvider = z.infer<typeof OracleProviderSchema>;

/** Multi-provider configuration */
export const MultiProviderConfigSchema = z.object({
  /** Primary provider */
  primary: OracleProviderSchema,
  /** Fallback providers in order of preference */
  fallbacks: z.array(OracleProviderSchema),
  /** Provider-specific configurations */
  configs: z.record(
    z.string(),
    z.object({
      /** Provider API key or authentication */
      apiKey: z.string().optional(),
      /** Provider endpoint URL */
      endpoint: z.string().url().optional(),
      /** Provider-specific settings */
      settings: z.record(z.string(), z.unknown()).optional(),
    }),
  ),
});

export type MultiProviderConfig = z.infer<typeof MultiProviderConfigSchema>;

/**
 * Historical data types for trend analysis
 */
export const HistoricalPriceDataSchema = z.object({
  /** Asset pair */
  feedId: z.string(),
  /** Price data points */
  prices: z.array(
    z.object({
      timestamp: z.number().int().positive(),
      price: z.string(),
      volume: z.string().optional(),
    }),
  ),
  /** Time range */
  timeRange: z.object({
    start: z.number().int().positive(),
    end: z.number().int().positive(),
    interval: z.enum(["1m", "5m", "15m", "1h", "4h", "1d"]),
  }),
});

export type HistoricalPriceData = z.infer<typeof HistoricalPriceDataSchema>;

/**
 * Volatility analysis types
 */
export const VolatilityAnalysisSchema = z.object({
  /** Asset pair */
  feedId: z.string(),
  /** Analysis period */
  period: z.enum(["1h", "24h", "7d", "30d"]),
  /** Volatility metrics */
  metrics: z.object({
    /** Standard deviation */
    standardDeviation: z.number().nonnegative(),
    /** Variance */
    variance: z.number().nonnegative(),
    /** Value at Risk (VaR) */
    valueAtRisk: z.object({
      "95%": z.number(),
      "99%": z.number(),
      "99.9%": z.number(),
    }),
    /** Maximum drawdown */
    maxDrawdown: z.number().min(-1).max(0),
    /** Sharpe ratio */
    sharpeRatio: z.number().optional(),
  }),
  /** Volatility classification */
  classification: z.enum(["low", "medium", "high", "extreme"]),
  /** Analysis timestamp */
  timestamp: z.number().int().positive(),
});

export type VolatilityAnalysis = z.infer<typeof VolatilityAnalysisSchema>;

/**
 * Correlation analysis types
 */
export const CorrelationAnalysisSchema = z.object({
  /** Primary asset */
  asset1: z.string(),
  /** Secondary asset */
  asset2: z.string(),
  /** Correlation coefficient (-1 to 1) */
  correlation: z.number().min(-1).max(1),
  /** Statistical significance */
  pValue: z.number().min(0).max(1),
  /** Sample size */
  sampleSize: z.number().int().positive(),
  /** Analysis period */
  period: z.enum(["1h", "24h", "7d", "30d", "90d"]),
  /** Correlation strength classification */
  strength: z.enum(["none", "weak", "moderate", "strong", "very_strong"]),
  /** Analysis timestamp */
  timestamp: z.number().int().positive(),
});

export type CorrelationAnalysis = z.infer<typeof CorrelationAnalysisSchema>;

/**
 * Liquidity analysis types
 */
export const LiquidityAnalysisSchema = z.object({
  /** Asset pair */
  feedId: z.string(),
  /** Liquidity metrics */
  metrics: z.object({
    /** Bid-ask spread percentage */
    bidAskSpread: z.number().nonnegative(),
    /** Market depth ($ amount) */
    marketDepth: z.string(),
    /** Average daily volume */
    avgDailyVolume: z.string(),
    /** Liquidity score (0-100) */
    liquidityScore: z.number().min(0).max(100),
  }),
  /** Liquidity classification */
  classification: z.enum(["very_low", "low", "medium", "high", "very_high"]),
  /** Exchange data */
  exchanges: z.array(
    z.object({
      name: z.string(),
      volume: z.string(),
      liquidity: z.number().min(0).max(100),
    }),
  ),
  /** Analysis timestamp */
  timestamp: z.number().int().positive(),
});

export type LiquidityAnalysis = z.infer<typeof LiquidityAnalysisSchema>;
