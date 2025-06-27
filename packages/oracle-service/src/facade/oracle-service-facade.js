"use strict";
/**
 * Oracle Service Facade
 *
 * Main entry point for oracle operations, combining Chainlink integration,
 * circuit breakers, aggregation, and fallback mechanisms in a unified
 * functional programming interface
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONSENSUS_CONFIG = exports.DEFAULT_AGGREGATION_STRATEGY = exports.createOracleServiceFacade = exports.OracleServiceFacade = void 0;
const chainlink_oracle_service_simple_1 = require("../services/chainlink-oracle-service-simple");
/**
 * Simplified Oracle Service Facade Implementation
 */
class OracleServiceFacade {
    constructor(config) {
        /**
         * Simplified price fetch implementation
         */
        this.fetchPrice = (query) => this.primaryOracle.fetchPrice(query);
        /**
         * Simplified health check implementation
         */
        this.checkHealth = () => this.primaryOracle.checkHealth();
        /**
         * Price validation implementation
         */
        this.validatePrice = (data) => {
            return this.primaryOracle.validatePrice(data);
        };
        /**
         * Get supported feed IDs
         */
        this.getSupportedFeeds = () => {
            return this.primaryOracle.getSupportedFeeds();
        };
        /**
         * Get feed configuration
         */
        this.getFeedConfig = (feedId) => {
            return this.primaryOracle.getFeedConfig(feedId);
        };
        // Initialize primary oracle only (simplified)
        this.primaryOracle = new chainlink_oracle_service_simple_1.ChainlinkOracleService(config.primaryOracle);
    }
}
exports.OracleServiceFacade = OracleServiceFacade;
/**
 * Factory function for creating oracle service facade
 */
const createOracleServiceFacade = (config) => {
    return new OracleServiceFacade(config);
};
exports.createOracleServiceFacade = createOracleServiceFacade;
/**
 * Default configurations for common use cases
 */
exports.DEFAULT_AGGREGATION_STRATEGY = {
    name: 'default_median',
    method: 'median',
    weighting: 'confidence',
    outlierHandling: 'exclude',
    qualityFactors: {
        confidenceWeight: 0.3,
        freshnessWeight: 0.2,
        reliabilityWeight: 0.3,
        consensusWeight: 0.2,
    },
};
exports.DEFAULT_CONSENSUS_CONFIG = {
    minSources: 2,
    maxSources: 5,
    consensusThreshold: 0.8,
    maxDeviation: 10.0,
    outlierDetection: 'zscore',
    outlierThreshold: 2.5,
    minSourceConfidence: 90.0,
    stalenessWindow: 3600,
};
//# sourceMappingURL=oracle-service-facade.js.map