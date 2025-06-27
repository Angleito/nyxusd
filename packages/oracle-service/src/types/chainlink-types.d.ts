/**
 * Chainlink-specific Types
 *
 * Type definitions for Chainlink oracle integration including
 * AggregatorV3Interface, Chainlink Functions, and feed configurations
 */
import { z } from 'zod';
/**
 * Chainlink AggregatorV3Interface response
 */
export declare const ChainlinkRoundDataSchema: z.ZodObject<{
    /** Round ID */
    roundId: z.ZodBigInt;
    /** Price answer in feed decimals */
    answer: z.ZodBigInt;
    /** Timestamp when round started */
    startedAt: z.ZodBigInt;
    /** Timestamp when round was updated */
    updatedAt: z.ZodBigInt;
    /** Round ID that was answered */
    answeredInRound: z.ZodBigInt;
}, "strip", z.ZodTypeAny, {
    roundId: bigint;
    answer: bigint;
    startedAt: bigint;
    updatedAt: bigint;
    answeredInRound: bigint;
}, {
    roundId: bigint;
    answer: bigint;
    startedAt: bigint;
    updatedAt: bigint;
    answeredInRound: bigint;
}>;
export type ChainlinkRoundData = z.infer<typeof ChainlinkRoundDataSchema>;
/**
 * Chainlink feed metadata
 */
export declare const ChainlinkFeedMetadataSchema: z.ZodObject<{
    /** Feed contract address */
    address: z.ZodString;
    /** Number of decimals */
    decimals: z.ZodNumber;
    /** Feed description */
    description: z.ZodString;
    /** Feed version */
    version: z.ZodNumber;
    /** Heartbeat interval in seconds */
    heartbeat: z.ZodNumber;
    /** Deviation threshold percentage */
    deviation: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    deviation: number;
    decimals: number;
    description: string;
    address: string;
    heartbeat: number;
    version: number;
}, {
    deviation: number;
    decimals: number;
    description: string;
    address: string;
    heartbeat: number;
    version: number;
}>;
export type ChainlinkFeedMetadata = z.infer<typeof ChainlinkFeedMetadataSchema>;
/**
 * Chainlink network configuration
 */
export declare const ChainlinkNetworkConfigSchema: z.ZodObject<{
    /** Network name */
    name: z.ZodString;
    /** Chain ID */
    chainId: z.ZodNumber;
    /** RPC endpoint URL */
    rpcUrl: z.ZodString;
    /** Block explorer URL */
    explorerUrl: z.ZodOptional<z.ZodString>;
    /** Whether this is a testnet */
    isTestnet: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
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
export type ChainlinkNetworkConfig = z.infer<typeof ChainlinkNetworkConfigSchema>;
/**
 * Supported Chainlink networks with their feed addresses
 */
export declare const ChainlinkFeedAddressesSchema: z.ZodObject<{
    /** Ethereum Mainnet */
    ethereum: z.ZodRecord<z.ZodString, z.ZodString>;
    /** Polygon */
    polygon: z.ZodRecord<z.ZodString, z.ZodString>;
    /** Arbitrum */
    arbitrum: z.ZodRecord<z.ZodString, z.ZodString>;
    /** Optimism */
    optimism: z.ZodRecord<z.ZodString, z.ZodString>;
    /** BSC */
    bsc: z.ZodRecord<z.ZodString, z.ZodString>;
    /** Avalanche */
    avalanche: z.ZodRecord<z.ZodString, z.ZodString>;
}, "strip", z.ZodTypeAny, {
    ethereum: Record<string, string>;
    polygon: Record<string, string>;
    arbitrum: Record<string, string>;
    optimism: Record<string, string>;
    bsc: Record<string, string>;
    avalanche: Record<string, string>;
}, {
    ethereum: Record<string, string>;
    polygon: Record<string, string>;
    arbitrum: Record<string, string>;
    optimism: Record<string, string>;
    bsc: Record<string, string>;
    avalanche: Record<string, string>;
}>;
export type ChainlinkFeedAddresses = z.infer<typeof ChainlinkFeedAddressesSchema>;
/**
 * Chainlink Functions types
 */
/** Chainlink Functions request configuration */
export declare const ChainlinkFunctionRequestSchema: z.ZodObject<{
    /** JavaScript source code to execute */
    source: z.ZodString;
    /** Function arguments */
    args: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    /** Encrypted secrets reference */
    secretsLocation: z.ZodOptional<z.ZodEnum<["inline", "remote"]>>;
    /** Secrets data */
    secrets: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    /** DON ID for the request */
    donId: z.ZodOptional<z.ZodString>;
    /** Gas limit for the request */
    gasLimit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    source: string;
    args?: string[] | undefined;
    secretsLocation?: "inline" | "remote" | undefined;
    secrets?: Record<string, string> | undefined;
    donId?: string | undefined;
    gasLimit?: number | undefined;
}, {
    source: string;
    args?: string[] | undefined;
    secretsLocation?: "inline" | "remote" | undefined;
    secrets?: Record<string, string> | undefined;
    donId?: string | undefined;
    gasLimit?: number | undefined;
}>;
export type ChainlinkFunctionRequest = z.infer<typeof ChainlinkFunctionRequestSchema>;
/** Chainlink Functions response */
export declare const ChainlinkFunctionResponseSchema: z.ZodObject<{
    /** Request ID */
    requestId: z.ZodString;
    /** Response data */
    data: z.ZodUnknown;
    /** Error information if request failed */
    error: z.ZodOptional<z.ZodString>;
    /** Gas used */
    gasUsed: z.ZodOptional<z.ZodNumber>;
    /** Response timestamp */
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    timestamp: number;
    requestId: string;
    data?: unknown;
    error?: string | undefined;
    gasUsed?: number | undefined;
}, {
    timestamp: number;
    requestId: string;
    data?: unknown;
    error?: string | undefined;
    gasUsed?: number | undefined;
}>;
export type ChainlinkFunctionResponse = z.infer<typeof ChainlinkFunctionResponseSchema>;
/**
 * AI Oracle types for LLM integration
 */
/** AI risk assessment request */
export declare const AIRiskAssessmentRequestSchema: z.ZodObject<{
    /** Asset information */
    asset: z.ZodObject<{
        symbol: z.ZodString;
        address: z.ZodOptional<z.ZodString>;
        marketCap: z.ZodOptional<z.ZodString>;
        volume24h: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
        address?: string | undefined;
        marketCap?: string | undefined;
        volume24h?: string | undefined;
    }, {
        symbol: string;
        address?: string | undefined;
        marketCap?: string | undefined;
        volume24h?: string | undefined;
    }>;
    /** Current position data */
    position: z.ZodObject<{
        collateralAmount: z.ZodString;
        debtAmount: z.ZodString;
        collateralizationRatio: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        collateralAmount: string;
        debtAmount: string;
        collateralizationRatio: number;
    }, {
        collateralAmount: string;
        debtAmount: string;
        collateralizationRatio: number;
    }>;
    /** Market context */
    market: z.ZodObject<{
        currentPrice: z.ZodString;
        volatility24h: z.ZodOptional<z.ZodNumber>;
        liquidityScore: z.ZodOptional<z.ZodNumber>;
        correlationData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        currentPrice: string;
        volatility24h?: number | undefined;
        liquidityScore?: number | undefined;
        correlationData?: Record<string, number> | undefined;
    }, {
        currentPrice: string;
        volatility24h?: number | undefined;
        liquidityScore?: number | undefined;
        correlationData?: Record<string, number> | undefined;
    }>;
    /** Analysis parameters */
    parameters: z.ZodObject<{
        timeHorizon: z.ZodDefault<z.ZodEnum<["1h", "24h", "7d", "30d"]>>;
        confidenceLevel: z.ZodDefault<z.ZodNumber>;
        stressTestScenarios: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        timeHorizon: "1h" | "24h" | "7d" | "30d";
        confidenceLevel: number;
        stressTestScenarios?: string[] | undefined;
    }, {
        timeHorizon?: "1h" | "24h" | "7d" | "30d" | undefined;
        confidenceLevel?: number | undefined;
        stressTestScenarios?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    asset: {
        symbol: string;
        address?: string | undefined;
        marketCap?: string | undefined;
        volume24h?: string | undefined;
    };
    position: {
        collateralAmount: string;
        debtAmount: string;
        collateralizationRatio: number;
    };
    market: {
        currentPrice: string;
        volatility24h?: number | undefined;
        liquidityScore?: number | undefined;
        correlationData?: Record<string, number> | undefined;
    };
    parameters: {
        timeHorizon: "1h" | "24h" | "7d" | "30d";
        confidenceLevel: number;
        stressTestScenarios?: string[] | undefined;
    };
}, {
    asset: {
        symbol: string;
        address?: string | undefined;
        marketCap?: string | undefined;
        volume24h?: string | undefined;
    };
    position: {
        collateralAmount: string;
        debtAmount: string;
        collateralizationRatio: number;
    };
    market: {
        currentPrice: string;
        volatility24h?: number | undefined;
        liquidityScore?: number | undefined;
        correlationData?: Record<string, number> | undefined;
    };
    parameters: {
        timeHorizon?: "1h" | "24h" | "7d" | "30d" | undefined;
        confidenceLevel?: number | undefined;
        stressTestScenarios?: string[] | undefined;
    };
}>;
export type AIRiskAssessmentRequest = z.infer<typeof AIRiskAssessmentRequestSchema>;
/** AI risk assessment response */
export declare const AIRiskAssessmentResponseSchema: z.ZodObject<{
    /** Risk score (0-100) */
    riskScore: z.ZodNumber;
    /** Confidence in the assessment */
    confidence: z.ZodNumber;
    /** Risk factors identified */
    riskFactors: z.ZodArray<z.ZodObject<{
        factor: z.ZodString;
        impact: z.ZodEnum<["low", "medium", "high"]>;
        probability: z.ZodNumber;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
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
    /** Recommended actions */
    recommendations: z.ZodArray<z.ZodObject<{
        action: z.ZodString;
        priority: z.ZodEnum<["low", "medium", "high"]>;
        rationale: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        priority: "low" | "medium" | "high";
        action: string;
        rationale: string;
    }, {
        priority: "low" | "medium" | "high";
        action: string;
        rationale: string;
    }>, "many">;
    /** Market sentiment analysis */
    sentiment: z.ZodObject<{
        overall: z.ZodEnum<["bearish", "neutral", "bullish"]>;
        score: z.ZodNumber;
        sources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        score: number;
        overall: "bearish" | "neutral" | "bullish";
        sources?: string[] | undefined;
    }, {
        score: number;
        overall: "bearish" | "neutral" | "bullish";
        sources?: string[] | undefined;
    }>;
    /** Liquidation probability */
    liquidationProbability: z.ZodObject<{
        '1h': z.ZodNumber;
        '24h': z.ZodNumber;
        '7d': z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        '1h': number;
        '24h': number;
        '7d': number;
    }, {
        '1h': number;
        '24h': number;
        '7d': number;
    }>;
    /** Response metadata */
    metadata: z.ZodObject<{
        model: z.ZodString;
        processingTime: z.ZodNumber;
        timestamp: z.ZodNumber;
        dataQuality: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        timestamp: number;
        model: string;
        processingTime: number;
        dataQuality: number;
    }, {
        timestamp: number;
        model: string;
        processingTime: number;
        dataQuality: number;
    }>;
}, "strip", z.ZodTypeAny, {
    confidence: number;
    metadata: {
        timestamp: number;
        model: string;
        processingTime: number;
        dataQuality: number;
    };
    riskScore: number;
    riskFactors: {
        description: string;
        factor: string;
        impact: "low" | "medium" | "high";
        probability: number;
    }[];
    recommendations: {
        priority: "low" | "medium" | "high";
        action: string;
        rationale: string;
    }[];
    sentiment: {
        score: number;
        overall: "bearish" | "neutral" | "bullish";
        sources?: string[] | undefined;
    };
    liquidationProbability: {
        '1h': number;
        '24h': number;
        '7d': number;
    };
}, {
    confidence: number;
    metadata: {
        timestamp: number;
        model: string;
        processingTime: number;
        dataQuality: number;
    };
    riskScore: number;
    riskFactors: {
        description: string;
        factor: string;
        impact: "low" | "medium" | "high";
        probability: number;
    }[];
    recommendations: {
        priority: "low" | "medium" | "high";
        action: string;
        rationale: string;
    }[];
    sentiment: {
        score: number;
        overall: "bearish" | "neutral" | "bullish";
        sources?: string[] | undefined;
    };
    liquidationProbability: {
        '1h': number;
        '24h': number;
        '7d': number;
    };
}>;
export type AIRiskAssessmentResponse = z.infer<typeof AIRiskAssessmentResponseSchema>;
/**
 * Oracle provider types
 */
export declare const OracleProviderSchema: z.ZodEnum<["chainlink", "band", "dia", "pyth", "tellor", "api3", "switchboard"]>;
export type OracleProvider = z.infer<typeof OracleProviderSchema>;
/** Multi-provider configuration */
export declare const MultiProviderConfigSchema: z.ZodObject<{
    /** Primary provider */
    primary: z.ZodEnum<["chainlink", "band", "dia", "pyth", "tellor", "api3", "switchboard"]>;
    /** Fallback providers in order of preference */
    fallbacks: z.ZodArray<z.ZodEnum<["chainlink", "band", "dia", "pyth", "tellor", "api3", "switchboard"]>, "many">;
    /** Provider-specific configurations */
    configs: z.ZodRecord<z.ZodString, z.ZodObject<{
        /** Provider API key or authentication */
        apiKey: z.ZodOptional<z.ZodString>;
        /** Provider endpoint URL */
        endpoint: z.ZodOptional<z.ZodString>;
        /** Provider-specific settings */
        settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        endpoint?: string | undefined;
        apiKey?: string | undefined;
        settings?: Record<string, unknown> | undefined;
    }, {
        endpoint?: string | undefined;
        apiKey?: string | undefined;
        settings?: Record<string, unknown> | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    primary: "chainlink" | "band" | "dia" | "pyth" | "tellor" | "api3" | "switchboard";
    fallbacks: ("chainlink" | "band" | "dia" | "pyth" | "tellor" | "api3" | "switchboard")[];
    configs: Record<string, {
        endpoint?: string | undefined;
        apiKey?: string | undefined;
        settings?: Record<string, unknown> | undefined;
    }>;
}, {
    primary: "chainlink" | "band" | "dia" | "pyth" | "tellor" | "api3" | "switchboard";
    fallbacks: ("chainlink" | "band" | "dia" | "pyth" | "tellor" | "api3" | "switchboard")[];
    configs: Record<string, {
        endpoint?: string | undefined;
        apiKey?: string | undefined;
        settings?: Record<string, unknown> | undefined;
    }>;
}>;
export type MultiProviderConfig = z.infer<typeof MultiProviderConfigSchema>;
/**
 * Historical data types for trend analysis
 */
export declare const HistoricalPriceDataSchema: z.ZodObject<{
    /** Asset pair */
    feedId: z.ZodString;
    /** Price data points */
    prices: z.ZodArray<z.ZodObject<{
        timestamp: z.ZodNumber;
        price: z.ZodString;
        volume: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        timestamp: number;
        price: string;
        volume?: string | undefined;
    }, {
        timestamp: number;
        price: string;
        volume?: string | undefined;
    }>, "many">;
    /** Time range */
    timeRange: z.ZodObject<{
        start: z.ZodNumber;
        end: z.ZodNumber;
        interval: z.ZodEnum<["1m", "5m", "15m", "1h", "4h", "1d"]>;
    }, "strip", z.ZodTypeAny, {
        start: number;
        end: number;
        interval: "1h" | "1m" | "5m" | "15m" | "4h" | "1d";
    }, {
        start: number;
        end: number;
        interval: "1h" | "1m" | "5m" | "15m" | "4h" | "1d";
    }>;
}, "strip", z.ZodTypeAny, {
    feedId: string;
    prices: {
        timestamp: number;
        price: string;
        volume?: string | undefined;
    }[];
    timeRange: {
        start: number;
        end: number;
        interval: "1h" | "1m" | "5m" | "15m" | "4h" | "1d";
    };
}, {
    feedId: string;
    prices: {
        timestamp: number;
        price: string;
        volume?: string | undefined;
    }[];
    timeRange: {
        start: number;
        end: number;
        interval: "1h" | "1m" | "5m" | "15m" | "4h" | "1d";
    };
}>;
export type HistoricalPriceData = z.infer<typeof HistoricalPriceDataSchema>;
/**
 * Volatility analysis types
 */
export declare const VolatilityAnalysisSchema: z.ZodObject<{
    /** Asset pair */
    feedId: z.ZodString;
    /** Analysis period */
    period: z.ZodEnum<["1h", "24h", "7d", "30d"]>;
    /** Volatility metrics */
    metrics: z.ZodObject<{
        /** Standard deviation */
        standardDeviation: z.ZodNumber;
        /** Variance */
        variance: z.ZodNumber;
        /** Value at Risk (VaR) */
        valueAtRisk: z.ZodObject<{
            '95%': z.ZodNumber;
            '99%': z.ZodNumber;
            '99.9%': z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            '95%': number;
            '99%': number;
            '99.9%': number;
        }, {
            '95%': number;
            '99%': number;
            '99.9%': number;
        }>;
        /** Maximum drawdown */
        maxDrawdown: z.ZodNumber;
        /** Sharpe ratio */
        sharpeRatio: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        standardDeviation: number;
        variance: number;
        valueAtRisk: {
            '95%': number;
            '99%': number;
            '99.9%': number;
        };
        maxDrawdown: number;
        sharpeRatio?: number | undefined;
    }, {
        standardDeviation: number;
        variance: number;
        valueAtRisk: {
            '95%': number;
            '99%': number;
            '99.9%': number;
        };
        maxDrawdown: number;
        sharpeRatio?: number | undefined;
    }>;
    /** Volatility classification */
    classification: z.ZodEnum<["low", "medium", "high", "extreme"]>;
    /** Analysis timestamp */
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    timestamp: number;
    feedId: string;
    metrics: {
        standardDeviation: number;
        variance: number;
        valueAtRisk: {
            '95%': number;
            '99%': number;
            '99.9%': number;
        };
        maxDrawdown: number;
        sharpeRatio?: number | undefined;
    };
    period: "1h" | "24h" | "7d" | "30d";
    classification: "low" | "medium" | "high" | "extreme";
}, {
    timestamp: number;
    feedId: string;
    metrics: {
        standardDeviation: number;
        variance: number;
        valueAtRisk: {
            '95%': number;
            '99%': number;
            '99.9%': number;
        };
        maxDrawdown: number;
        sharpeRatio?: number | undefined;
    };
    period: "1h" | "24h" | "7d" | "30d";
    classification: "low" | "medium" | "high" | "extreme";
}>;
export type VolatilityAnalysis = z.infer<typeof VolatilityAnalysisSchema>;
/**
 * Correlation analysis types
 */
export declare const CorrelationAnalysisSchema: z.ZodObject<{
    /** Primary asset */
    asset1: z.ZodString;
    /** Secondary asset */
    asset2: z.ZodString;
    /** Correlation coefficient (-1 to 1) */
    correlation: z.ZodNumber;
    /** Statistical significance */
    pValue: z.ZodNumber;
    /** Sample size */
    sampleSize: z.ZodNumber;
    /** Analysis period */
    period: z.ZodEnum<["1h", "24h", "7d", "30d", "90d"]>;
    /** Correlation strength classification */
    strength: z.ZodEnum<["none", "weak", "moderate", "strong", "very_strong"]>;
    /** Analysis timestamp */
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    timestamp: number;
    period: "1h" | "24h" | "7d" | "30d" | "90d";
    asset1: string;
    asset2: string;
    correlation: number;
    pValue: number;
    sampleSize: number;
    strength: "none" | "weak" | "moderate" | "strong" | "very_strong";
}, {
    timestamp: number;
    period: "1h" | "24h" | "7d" | "30d" | "90d";
    asset1: string;
    asset2: string;
    correlation: number;
    pValue: number;
    sampleSize: number;
    strength: "none" | "weak" | "moderate" | "strong" | "very_strong";
}>;
export type CorrelationAnalysis = z.infer<typeof CorrelationAnalysisSchema>;
/**
 * Liquidity analysis types
 */
export declare const LiquidityAnalysisSchema: z.ZodObject<{
    /** Asset pair */
    feedId: z.ZodString;
    /** Liquidity metrics */
    metrics: z.ZodObject<{
        /** Bid-ask spread percentage */
        bidAskSpread: z.ZodNumber;
        /** Market depth ($ amount) */
        marketDepth: z.ZodString;
        /** Average daily volume */
        avgDailyVolume: z.ZodString;
        /** Liquidity score (0-100) */
        liquidityScore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        liquidityScore: number;
        bidAskSpread: number;
        marketDepth: string;
        avgDailyVolume: string;
    }, {
        liquidityScore: number;
        bidAskSpread: number;
        marketDepth: string;
        avgDailyVolume: string;
    }>;
    /** Liquidity classification */
    classification: z.ZodEnum<["very_low", "low", "medium", "high", "very_high"]>;
    /** Exchange data */
    exchanges: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        volume: z.ZodString;
        liquidity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        volume: string;
        liquidity: number;
    }, {
        name: string;
        volume: string;
        liquidity: number;
    }>, "many">;
    /** Analysis timestamp */
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    timestamp: number;
    feedId: string;
    metrics: {
        liquidityScore: number;
        bidAskSpread: number;
        marketDepth: string;
        avgDailyVolume: string;
    };
    classification: "low" | "medium" | "high" | "very_low" | "very_high";
    exchanges: {
        name: string;
        volume: string;
        liquidity: number;
    }[];
}, {
    timestamp: number;
    feedId: string;
    metrics: {
        liquidityScore: number;
        bidAskSpread: number;
        marketDepth: string;
        avgDailyVolume: string;
    };
    classification: "low" | "medium" | "high" | "very_low" | "very_high";
    exchanges: {
        name: string;
        volume: string;
        liquidity: number;
    }[];
}>;
export type LiquidityAnalysis = z.infer<typeof LiquidityAnalysisSchema>;
//# sourceMappingURL=chainlink-types.d.ts.map