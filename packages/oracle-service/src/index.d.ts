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
export * from './types/oracle-types';
export * from './types/chainlink-types';
export * from './types/aggregation-types';
export * from './services/chainlink-oracle-service-simple';
export * from './errors/oracle-errors';
export { OracleServiceFacade, createOracleServiceFacade, DEFAULT_AGGREGATION_STRATEGY, DEFAULT_CONSENSUS_CONFIG } from './facade/oracle-service-facade';
//# sourceMappingURL=index.d.ts.map