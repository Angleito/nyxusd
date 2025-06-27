"use strict";
/**
 * Chainlink-specific Types
 *
 * Type definitions for Chainlink oracle integration including
 * AggregatorV3Interface, Chainlink Functions, and feed configurations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidityAnalysisSchema = exports.CorrelationAnalysisSchema = exports.VolatilityAnalysisSchema = exports.HistoricalPriceDataSchema = exports.MultiProviderConfigSchema = exports.OracleProviderSchema = exports.AIRiskAssessmentResponseSchema = exports.AIRiskAssessmentRequestSchema = exports.ChainlinkFunctionResponseSchema = exports.ChainlinkFunctionRequestSchema = exports.ChainlinkFeedAddressesSchema = exports.ChainlinkNetworkConfigSchema = exports.ChainlinkFeedMetadataSchema = exports.ChainlinkRoundDataSchema = void 0;
const zod_1 = require("zod");
/**
 * Chainlink AggregatorV3Interface response
 */
exports.ChainlinkRoundDataSchema = zod_1.z.object({
    /** Round ID */
    roundId: zod_1.z.bigint(),
    /** Price answer in feed decimals */
    answer: zod_1.z.bigint(),
    /** Timestamp when round started */
    startedAt: zod_1.z.bigint(),
    /** Timestamp when round was updated */
    updatedAt: zod_1.z.bigint(),
    /** Round ID that was answered */
    answeredInRound: zod_1.z.bigint(),
});
/**
 * Chainlink feed metadata
 */
exports.ChainlinkFeedMetadataSchema = zod_1.z.object({
    /** Feed contract address */
    address: zod_1.z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    /** Number of decimals */
    decimals: zod_1.z.number().int().min(0).max(18),
    /** Feed description */
    description: zod_1.z.string(),
    /** Feed version */
    version: zod_1.z.number().int().positive(),
    /** Heartbeat interval in seconds */
    heartbeat: zod_1.z.number().int().positive(),
    /** Deviation threshold percentage */
    deviation: zod_1.z.number().min(0).max(100),
});
/**
 * Chainlink network configuration
 */
exports.ChainlinkNetworkConfigSchema = zod_1.z.object({
    /** Network name */
    name: zod_1.z.string(),
    /** Chain ID */
    chainId: zod_1.z.number().int().positive(),
    /** RPC endpoint URL */
    rpcUrl: zod_1.z.string().url(),
    /** Block explorer URL */
    explorerUrl: zod_1.z.string().url().optional(),
    /** Whether this is a testnet */
    isTestnet: zod_1.z.boolean(),
});
/**
 * Supported Chainlink networks with their feed addresses
 */
exports.ChainlinkFeedAddressesSchema = zod_1.z.object({
    /** Ethereum Mainnet */
    ethereum: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
    /** Polygon */
    polygon: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
    /** Arbitrum */
    arbitrum: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
    /** Optimism */
    optimism: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
    /** BSC */
    bsc: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
    /** Avalanche */
    avalanche: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
});
/**
 * Chainlink Functions types
 */
/** Chainlink Functions request configuration */
exports.ChainlinkFunctionRequestSchema = zod_1.z.object({
    /** JavaScript source code to execute */
    source: zod_1.z.string().min(1),
    /** Function arguments */
    args: zod_1.z.array(zod_1.z.string()).optional(),
    /** Encrypted secrets reference */
    secretsLocation: zod_1.z.enum(['inline', 'remote']).optional(),
    /** Secrets data */
    secrets: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
    /** DON ID for the request */
    donId: zod_1.z.string().optional(),
    /** Gas limit for the request */
    gasLimit: zod_1.z.number().int().positive().optional(),
});
/** Chainlink Functions response */
exports.ChainlinkFunctionResponseSchema = zod_1.z.object({
    /** Request ID */
    requestId: zod_1.z.string(),
    /** Response data */
    data: zod_1.z.unknown(),
    /** Error information if request failed */
    error: zod_1.z.string().optional(),
    /** Gas used */
    gasUsed: zod_1.z.number().int().nonnegative().optional(),
    /** Response timestamp */
    timestamp: zod_1.z.number().int().positive(),
});
/**
 * AI Oracle types for LLM integration
 */
/** AI risk assessment request */
exports.AIRiskAssessmentRequestSchema = zod_1.z.object({
    /** Asset information */
    asset: zod_1.z.object({
        symbol: zod_1.z.string(),
        address: zod_1.z.string().optional(),
        marketCap: zod_1.z.string().optional(),
        volume24h: zod_1.z.string().optional(),
    }),
    /** Current position data */
    position: zod_1.z.object({
        collateralAmount: zod_1.z.string(),
        debtAmount: zod_1.z.string(),
        collateralizationRatio: zod_1.z.number(),
    }),
    /** Market context */
    market: zod_1.z.object({
        currentPrice: zod_1.z.string(),
        volatility24h: zod_1.z.number().optional(),
        liquidityScore: zod_1.z.number().optional(),
        correlationData: zod_1.z.record(zod_1.z.string(), zod_1.z.number()).optional(),
    }),
    /** Analysis parameters */
    parameters: zod_1.z.object({
        timeHorizon: zod_1.z.enum(['1h', '24h', '7d', '30d']).default('24h'),
        confidenceLevel: zod_1.z.number().min(0).max(1).default(0.95),
        stressTestScenarios: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
/** AI risk assessment response */
exports.AIRiskAssessmentResponseSchema = zod_1.z.object({
    /** Risk score (0-100) */
    riskScore: zod_1.z.number().min(0).max(100),
    /** Confidence in the assessment */
    confidence: zod_1.z.number().min(0).max(1),
    /** Risk factors identified */
    riskFactors: zod_1.z.array(zod_1.z.object({
        factor: zod_1.z.string(),
        impact: zod_1.z.enum(['low', 'medium', 'high']),
        probability: zod_1.z.number().min(0).max(1),
        description: zod_1.z.string(),
    })),
    /** Recommended actions */
    recommendations: zod_1.z.array(zod_1.z.object({
        action: zod_1.z.string(),
        priority: zod_1.z.enum(['low', 'medium', 'high']),
        rationale: zod_1.z.string(),
    })),
    /** Market sentiment analysis */
    sentiment: zod_1.z.object({
        overall: zod_1.z.enum(['bearish', 'neutral', 'bullish']),
        score: zod_1.z.number().min(-1).max(1),
        sources: zod_1.z.array(zod_1.z.string()).optional(),
    }),
    /** Liquidation probability */
    liquidationProbability: zod_1.z.object({
        '1h': zod_1.z.number().min(0).max(1),
        '24h': zod_1.z.number().min(0).max(1),
        '7d': zod_1.z.number().min(0).max(1),
    }),
    /** Response metadata */
    metadata: zod_1.z.object({
        model: zod_1.z.string(),
        processingTime: zod_1.z.number().int().nonnegative(),
        timestamp: zod_1.z.number().int().positive(),
        dataQuality: zod_1.z.number().min(0).max(1),
    }),
});
/**
 * Oracle provider types
 */
exports.OracleProviderSchema = zod_1.z.enum([
    'chainlink',
    'band',
    'dia',
    'pyth',
    'tellor',
    'api3',
    'switchboard'
]);
/** Multi-provider configuration */
exports.MultiProviderConfigSchema = zod_1.z.object({
    /** Primary provider */
    primary: exports.OracleProviderSchema,
    /** Fallback providers in order of preference */
    fallbacks: zod_1.z.array(exports.OracleProviderSchema),
    /** Provider-specific configurations */
    configs: zod_1.z.record(zod_1.z.string(), zod_1.z.object({
        /** Provider API key or authentication */
        apiKey: zod_1.z.string().optional(),
        /** Provider endpoint URL */
        endpoint: zod_1.z.string().url().optional(),
        /** Provider-specific settings */
        settings: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    })),
});
/**
 * Historical data types for trend analysis
 */
exports.HistoricalPriceDataSchema = zod_1.z.object({
    /** Asset pair */
    feedId: zod_1.z.string(),
    /** Price data points */
    prices: zod_1.z.array(zod_1.z.object({
        timestamp: zod_1.z.number().int().positive(),
        price: zod_1.z.string(),
        volume: zod_1.z.string().optional(),
    })),
    /** Time range */
    timeRange: zod_1.z.object({
        start: zod_1.z.number().int().positive(),
        end: zod_1.z.number().int().positive(),
        interval: zod_1.z.enum(['1m', '5m', '15m', '1h', '4h', '1d']),
    }),
});
/**
 * Volatility analysis types
 */
exports.VolatilityAnalysisSchema = zod_1.z.object({
    /** Asset pair */
    feedId: zod_1.z.string(),
    /** Analysis period */
    period: zod_1.z.enum(['1h', '24h', '7d', '30d']),
    /** Volatility metrics */
    metrics: zod_1.z.object({
        /** Standard deviation */
        standardDeviation: zod_1.z.number().nonnegative(),
        /** Variance */
        variance: zod_1.z.number().nonnegative(),
        /** Value at Risk (VaR) */
        valueAtRisk: zod_1.z.object({
            '95%': zod_1.z.number(),
            '99%': zod_1.z.number(),
            '99.9%': zod_1.z.number(),
        }),
        /** Maximum drawdown */
        maxDrawdown: zod_1.z.number().min(-1).max(0),
        /** Sharpe ratio */
        sharpeRatio: zod_1.z.number().optional(),
    }),
    /** Volatility classification */
    classification: zod_1.z.enum(['low', 'medium', 'high', 'extreme']),
    /** Analysis timestamp */
    timestamp: zod_1.z.number().int().positive(),
});
/**
 * Correlation analysis types
 */
exports.CorrelationAnalysisSchema = zod_1.z.object({
    /** Primary asset */
    asset1: zod_1.z.string(),
    /** Secondary asset */
    asset2: zod_1.z.string(),
    /** Correlation coefficient (-1 to 1) */
    correlation: zod_1.z.number().min(-1).max(1),
    /** Statistical significance */
    pValue: zod_1.z.number().min(0).max(1),
    /** Sample size */
    sampleSize: zod_1.z.number().int().positive(),
    /** Analysis period */
    period: zod_1.z.enum(['1h', '24h', '7d', '30d', '90d']),
    /** Correlation strength classification */
    strength: zod_1.z.enum(['none', 'weak', 'moderate', 'strong', 'very_strong']),
    /** Analysis timestamp */
    timestamp: zod_1.z.number().int().positive(),
});
/**
 * Liquidity analysis types
 */
exports.LiquidityAnalysisSchema = zod_1.z.object({
    /** Asset pair */
    feedId: zod_1.z.string(),
    /** Liquidity metrics */
    metrics: zod_1.z.object({
        /** Bid-ask spread percentage */
        bidAskSpread: zod_1.z.number().nonnegative(),
        /** Market depth ($ amount) */
        marketDepth: zod_1.z.string(),
        /** Average daily volume */
        avgDailyVolume: zod_1.z.string(),
        /** Liquidity score (0-100) */
        liquidityScore: zod_1.z.number().min(0).max(100),
    }),
    /** Liquidity classification */
    classification: zod_1.z.enum(['very_low', 'low', 'medium', 'high', 'very_high']),
    /** Exchange data */
    exchanges: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        volume: zod_1.z.string(),
        liquidity: zod_1.z.number().min(0).max(100),
    })),
    /** Analysis timestamp */
    timestamp: zod_1.z.number().int().positive(),
});
//# sourceMappingURL=chainlink-types.js.map