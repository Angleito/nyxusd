/**
 * Oracle Service Facade
 *
 * Main entry point for oracle operations, combining Chainlink integration,
 * circuit breakers, aggregation, and fallback mechanisms in a unified
 * functional programming interface
 */
import { Option } from "fp-ts/Option";
import { IOracleService, OracleFeedConfig, PriceValidator, HealthCheck, PriceFetch } from "../types/oracle-types";
import { AggregationStrategy, ConsensusConfig } from "../types/aggregation-types";
import { ChainlinkOracleConfig } from "../services/chainlink-oracle-service-simple";
/**
 * Simplified oracle service facade configuration
 */
interface OracleServiceFacadeConfig {
    /** Primary oracle configuration */
    primaryOracle: ChainlinkOracleConfig;
    /** Fallback oracle configurations */
    fallbackOracles?: ChainlinkOracleConfig[];
    /** Aggregation strategy */
    aggregationStrategy?: AggregationStrategy;
    /** Consensus configuration */
    consensusConfig?: ConsensusConfig;
    /** Enable fallback mechanisms */
    enableFallback?: boolean;
    /** Cache configuration */
    cache?: {
        enabled: boolean;
        ttl: number;
    };
}
/**
 * Simplified Oracle Service Facade Implementation
 */
export declare class OracleServiceFacade implements IOracleService {
    private readonly primaryOracle;
    constructor(config: OracleServiceFacadeConfig);
    /**
     * Simplified price fetch implementation
     */
    readonly fetchPrice: PriceFetch;
    /**
     * Simplified health check implementation
     */
    readonly checkHealth: HealthCheck;
    /**
     * Price validation implementation
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
}
/**
 * Factory function for creating oracle service facade
 */
export declare const createOracleServiceFacade: (config: OracleServiceFacadeConfig) => OracleServiceFacade;
/**
 * Default configurations for common use cases
 */
export declare const DEFAULT_AGGREGATION_STRATEGY: AggregationStrategy;
export declare const DEFAULT_CONSENSUS_CONFIG: ConsensusConfig;
export {};
//# sourceMappingURL=oracle-service-facade.d.ts.map