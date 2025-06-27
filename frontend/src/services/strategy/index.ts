/**
 * Strategy Services Index
 *
 * Centralized exports for all strategy-related services
 */

export { StrategyService } from "./strategyService";
export { ProtocolIntegrationService } from "./protocolIntegrationService";
export { YieldAggregatorService } from "./yieldAggregatorService";
export { CDPLeverageService } from "./cdpLeverageService";

// Re-export types for convenience
export type {
  Strategy,
  StrategyCreationParams,
  StrategyFilters,
  StrategyTemplate,
  SimulationResult,
  PerformanceDataPoint,
  Protocol,
  ProtocolId,
  ProtocolPosition,
  Asset,
  PositionType,
  StrategyAllocation,
  LeverageConfig,
  PerformanceMetrics,
  RiskMetrics,
} from "../../types/strategy";
