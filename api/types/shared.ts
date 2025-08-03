/**
 * Shared API Types
 * 
 * Consolidated type definitions used across multiple API endpoints
 * to eliminate redundancy and ensure consistency.
 */

// Common API Response Structure
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly timestamp?: string;
}

// Token Types - Unified across all endpoints
export interface BaseToken {
  readonly symbol: string;
  readonly name: string;
  readonly address: string;
  readonly decimals: number;
}

export interface ExtendedTokenInfo extends BaseToken {
  readonly id: string;
  readonly image?: string;
  readonly platforms?: Record<string, string>;
  readonly chainId?: number;
  readonly tags?: ReadonlyArray<string>;
  readonly logoURI?: string;
}

// Swap Types - Consolidated
export interface SwapQuoteRequest {
  readonly inputToken: string;
  readonly outputToken: string;
  readonly inputAmount: string;
  readonly slippageTolerance: number;
  readonly userAddress: string;
}

export interface SwapQuote {
  readonly inputAmount: string;
  readonly outputAmount: string;
  readonly priceImpact: number;
  readonly gasEstimate: string;
  readonly pathId: string;
  readonly routerAddress: string;
  readonly callData: string;
  readonly value: string;
}

export interface SwapExecuteRequest extends SwapQuoteRequest {
  readonly pathId: string;
  readonly routerAddress: string;
  readonly callData: string;
  readonly value: string;
}

// System Health Types
export interface SystemMetrics {
  readonly status: 'operational' | 'degraded' | 'down';
  readonly apiStatus: 'healthy' | 'degraded' | 'down';
  readonly oracleStatus: 'active' | 'inactive' | 'degraded';
  readonly cdpEngineStatus: 'running' | 'stopped' | 'maintenance';
  readonly lastUpdate: string;
  readonly uptime: number;
  readonly metrics: {
    readonly totalCDPs: number;
    readonly totalValueLocked: number;
    readonly averageCollateralization: number;
    readonly liquidationThreshold: number;
    readonly stabilityFee: number;
    readonly protocolVersion: string;
  };
  readonly performance: {
    readonly apiLatency: string;
    readonly oracleLatency: string;
    readonly blockchainLatency: string;
    readonly avgResponseTime: string;
  };
  readonly chains: Record<string, {
    readonly status: 'active' | 'inactive' | 'degraded';
    readonly blockHeight: number;
  }>;
}

// Common Validation Error Types
export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code?: string;
}

export interface ErrorResponse {
  readonly success: false;
  readonly error: string;
  readonly details?: string;
  readonly validationErrors?: ReadonlyArray<ValidationError>;
}