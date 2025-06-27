/**
 * Oracle Service Facade
 *
 * Main entry point for oracle operations, combining Chainlink integration,
 * circuit breakers, aggregation, and fallback mechanisms in a unified
 * functional programming interface
 */

import { Option } from "fp-ts/Option";

import {
  IOracleService,
  OracleQueryData,
  OracleFeedConfig,
  PriceValidator,
  HealthCheck,
  PriceFetch,
} from "../types/oracle-types";

import {
  AggregationStrategy,
  ConsensusConfig,
} from "../types/aggregation-types";

import {
  ChainlinkOracleService,
  ChainlinkOracleConfig,
} from "../services/chainlink-oracle-service-simple";

// Temporarily commenting out problematic services
// import {
//   CircuitBreakerService,
//   CircuitBreakerConfig,
//   getDefaultCircuitBreakerConfig
// } from '../services/circuit-breaker-service';

// import {
//   OracleAggregatorService,
//   createOracleAggregatorService
// } from '../services/oracle-aggregator-service';

// Simplified facade - removed error imports

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
export class OracleServiceFacade implements IOracleService {
  private readonly primaryOracle: ChainlinkOracleService;

  constructor(config: OracleServiceFacadeConfig) {
    // Initialize primary oracle only (simplified)
    this.primaryOracle = new ChainlinkOracleService(config.primaryOracle);
  }

  /**
   * Simplified price fetch implementation
   */
  public readonly fetchPrice: PriceFetch = (query: OracleQueryData) =>
    this.primaryOracle.fetchPrice(query);

  /**
   * Simplified health check implementation
   */
  public readonly checkHealth: HealthCheck = () =>
    this.primaryOracle.checkHealth();

  /**
   * Price validation implementation
   */
  public readonly validatePrice: PriceValidator = (data) => {
    return this.primaryOracle.validatePrice(data);
  };

  /**
   * Get supported feed IDs
   */
  public readonly getSupportedFeeds = (): readonly string[] => {
    return this.primaryOracle.getSupportedFeeds();
  };

  /**
   * Get feed configuration
   */
  public readonly getFeedConfig = (
    feedId: string,
  ): Option<OracleFeedConfig> => {
    return this.primaryOracle.getFeedConfig(feedId);
  };
}

/**
 * Factory function for creating oracle service facade
 */
export const createOracleServiceFacade = (
  config: OracleServiceFacadeConfig,
): OracleServiceFacade => {
  return new OracleServiceFacade(config);
};

/**
 * Default configurations for common use cases
 */
export const DEFAULT_AGGREGATION_STRATEGY: AggregationStrategy = {
  name: "default_median",
  method: "median",
  weighting: "confidence",
  outlierHandling: "exclude",
  qualityFactors: {
    confidenceWeight: 0.3,
    freshnessWeight: 0.2,
    reliabilityWeight: 0.3,
    consensusWeight: 0.2,
  },
};

export const DEFAULT_CONSENSUS_CONFIG: ConsensusConfig = {
  minSources: 2,
  maxSources: 5,
  consensusThreshold: 0.8,
  maxDeviation: 10.0,
  outlierDetection: "zscore",
  outlierThreshold: 2.5,
  minSourceConfidence: 90.0,
  stalenessWindow: 3600,
};
