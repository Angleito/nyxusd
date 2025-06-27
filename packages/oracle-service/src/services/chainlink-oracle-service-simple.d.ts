/**
 * Simplified Chainlink Oracle Service
 *
 * Mock implementation for testing package structure
 */
import { Option } from "fp-ts/Option";
import { z } from "zod";
import { OracleFeedConfig, IOracleService, PriceFetch, HealthCheck, PriceValidator } from "../types/oracle-types";
/**
 * Simplified configuration
 */
export declare const ChainlinkOracleConfigSchema: z.ZodObject<{
    network: z.ZodString;
    provider: z.ZodUnion<[z.ZodString, z.ZodAny]>;
    defaultTimeout: z.ZodDefault<z.ZodNumber>;
    defaultMaxStaleness: z.ZodDefault<z.ZodNumber>;
    defaultMinConfidence: z.ZodDefault<z.ZodNumber>;
    cacheTtl: z.ZodDefault<z.ZodNumber>;
    retry: z.ZodDefault<z.ZodObject<{
        maxAttempts: z.ZodDefault<z.ZodNumber>;
        delayMs: z.ZodDefault<z.ZodNumber>;
        backoffMultiplier: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maxAttempts: number;
        delayMs: number;
        backoffMultiplier: number;
    }, {
        maxAttempts?: number | undefined;
        delayMs?: number | undefined;
        backoffMultiplier?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
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
    provider?: any;
    defaultTimeout?: number | undefined;
    defaultMaxStaleness?: number | undefined;
    defaultMinConfidence?: number | undefined;
    cacheTtl?: number | undefined;
    retry?: {
        maxAttempts?: number | undefined;
        delayMs?: number | undefined;
        backoffMultiplier?: number | undefined;
    } | undefined;
}>;
export type ChainlinkOracleConfig = z.infer<typeof ChainlinkOracleConfigSchema>;
/**
 * Simplified Chainlink Oracle Service
 */
export declare class ChainlinkOracleService implements IOracleService {
    private readonly cache;
    constructor(config: ChainlinkOracleConfig);
    /**
     * Simplified price fetch implementation
     */
    readonly fetchPrice: PriceFetch;
    /**
     * Simplified health check
     */
    readonly checkHealth: HealthCheck;
    /**
     * Mock price validation
     */
    readonly validatePrice: PriceValidator;
    /**
     * Get supported feed IDs
     */
    readonly getSupportedFeeds: () => readonly string[];
    /**
     * Get feed configuration
     */
    readonly getFeedConfig: (feedId: string) => Option<OracleFeedConfig>;
    /**
     * Simple cache check
     */
    private checkCache;
}
//# sourceMappingURL=chainlink-oracle-service-simple.d.ts.map