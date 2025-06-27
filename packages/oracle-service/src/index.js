"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONSENSUS_CONFIG = exports.DEFAULT_AGGREGATION_STRATEGY = exports.createOracleServiceFacade = exports.OracleServiceFacade = void 0;
const tslib_1 = require("tslib");
// Core oracle types and interfaces
tslib_1.__exportStar(require("./types/oracle-types"), exports);
tslib_1.__exportStar(require("./types/chainlink-types"), exports);
tslib_1.__exportStar(require("./types/aggregation-types"), exports);
// export * from './types/privacy-types';
// Oracle service implementations
tslib_1.__exportStar(require("./services/chainlink-oracle-service-simple"), exports);
// Temporarily excluding other services due to compilation issues
// export * from './services/oracle-aggregator-service';
// export * from './services/circuit-breaker-service';
// Privacy-preserving oracle services - temporarily disabled for compilation
// export * from './services/privacy-oracle-service';
// export * from './types/privacy-types';
// Validation and error handling
// Temporarily excluding oracle-validation due to compilation issues
// export * from './validation/oracle-validation';
tslib_1.__exportStar(require("./errors/oracle-errors"), exports);
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
var oracle_service_facade_1 = require("./facade/oracle-service-facade");
Object.defineProperty(exports, "OracleServiceFacade", { enumerable: true, get: function () { return oracle_service_facade_1.OracleServiceFacade; } });
Object.defineProperty(exports, "createOracleServiceFacade", { enumerable: true, get: function () { return oracle_service_facade_1.createOracleServiceFacade; } });
Object.defineProperty(exports, "DEFAULT_AGGREGATION_STRATEGY", { enumerable: true, get: function () { return oracle_service_facade_1.DEFAULT_AGGREGATION_STRATEGY; } });
Object.defineProperty(exports, "DEFAULT_CONSENSUS_CONFIG", { enumerable: true, get: function () { return oracle_service_facade_1.DEFAULT_CONSENSUS_CONFIG; } });
//# sourceMappingURL=index.js.map