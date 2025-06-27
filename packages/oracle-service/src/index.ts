/**
 * Oracle Service Package
 *
 * Provides Oracle integration for the NYXUSD CDP system with support for:
 * - Chainlink price feeds
 * - AI-enhanced risk assessment via Chainlink Functions
 * - Privacy-preserving oracle data consumption
 * - Multi-oracle aggregation and consensus
 * - Circuit breakers and fallback mechanisms
 */

// Core oracle types and interfaces
export * from "./types/oracle-types";
export * from "./types/chainlink-types";
export * from "./types/aggregation-types";
// export * from './types/privacy-types';

// Oracle service implementations
export * from "./services/chainlink-oracle-service-simple";
// Temporarily excluding other services due to compilation issues
// export * from './services/oracle-aggregator-service';
// export * from './services/circuit-breaker-service';

// Privacy-preserving oracle services - temporarily disabled for compilation
// export * from './services/privacy-oracle-service';
// export * from './types/privacy-types';

// Validation and error handling
// Temporarily excluding oracle-validation due to compilation issues
// export * from './validation/oracle-validation';
export * from "./errors/oracle-errors";

// Configuration exports - temporarily excluded due to compilation issues
// export {
//   OracleEnvironmentConfig,
//   DEFAULT_ORACLE_CONFIGS as ORACLE_ENV_CONFIGS,
//   getOracleConfig as getOracleEnvironmentConfig,
//   validateOracleConfig,
//   loadOracleConfigFromEnv
// } from './config/oracle-config';

// export {
//   CHAINLINK_FEED_ADDRESSES,
//   CHAINLINK_NETWORKS,
//   CHAINLINK_TESTNETS,
//   FEED_METADATA,
//   DEFAULT_ORACLE_CONFIGS as CHAINLINK_ORACLE_CONFIGS,
//   getOracleConfig as getChainlinkOracleConfig,
//   getFeedAddress,
//   getSupportedFeeds,
//   getFeedMetadata
// } from './config/chainlink-feeds';

// Main oracle service facade
export {
  OracleServiceFacade,
  createOracleServiceFacade,
  DEFAULT_AGGREGATION_STRATEGY,
  DEFAULT_CONSENSUS_CONFIG,
} from "./facade/oracle-service-facade";
