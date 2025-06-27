/**
 * Circuit Breaker Service
 * 
 * Implements circuit breaker pattern for oracle operations following
 * functional programming principles with automatic failure detection
 * and recovery mechanisms
 */

import { pipe } from 'fp-ts/function';
import { Either, left, right, chain, map, fold } from 'fp-ts/Either';
import { Option, some, none, fromNullable } from 'fp-ts/Option';
import { IO } from 'fp-ts/IO';
import { TaskEither, tryCatch } from 'fp-ts/TaskEither';

import {
  CircuitBreakerState,
  CircuitBreakerConfig,
  OraclePriceData,
  OracleQuery,
  OracleResponse
} from '../types/oracle-types';

import {
  OracleError,
  createCircuitBreakerError,
  createPriceDeviationError,
  createNetworkError
} from '../errors/oracle-errors';

/**
 * Circuit breaker status information
 */
export interface CircuitBreakerStatus {
  readonly state: CircuitBreakerState;
  readonly failureCount: number;
  readonly successCount: number;
  readonly lastFailure?: number;
  readonly lastSuccess?: number;
  readonly nextAttempt?: number;
}

/**
 * Circuit breaker metrics
 */
export interface CircuitBreakerMetrics {
  readonly totalRequests: number;
  readonly successfulRequests: number;
  readonly failedRequests: number;
  readonly circuitOpenCount: number;
  readonly averageResponseTime: number;
  readonly failureRate: number;
}

/**
 * Price deviation detector
 */
interface PriceDeviationResult {
  readonly hasDeviation: boolean;
  readonly deviationPercent: number;
  readonly currentPrice: bigint;
  readonly referencePrice: bigint;
}

/**
 * Circuit breaker operation wrapper
 */
type CircuitBreakerOperation<T> = () => TaskEither<OracleError, T>;

/**
 * Circuit Breaker Service Implementation
 */
export class CircuitBreakerService {
  private readonly config: CircuitBreakerConfig;
  private readonly status: Map<string, CircuitBreakerStatus> = new Map();
  private readonly metrics: Map<string, CircuitBreakerMetrics> = new Map();
  private readonly priceHistory: Map<string, OraclePriceData[]> = new Map();
  private readonly responseTimeHistory: Map<string, number[]> = new Map();

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  /**
   * Execute operation with circuit breaker protection
   */
  public readonly execute = <T>(
    operationId: string,
    operation: CircuitBreakerOperation<T>
  ): TaskEither<OracleError, T> => {
    return pipe(
      this.checkCircuitState(operationId),
      TaskEither.fromEither,
      TaskEither.chain(() => this.executeWithMonitoring(operationId, operation))
    );
  };

  /**
   * Check current circuit state
   */
  private readonly checkCircuitState = (operationId: string): Either<OracleError, void> => {
    const status = this.getStatus(operationId);
    
    switch (status.state) {
      case 'closed':
        // Normal operation
        return right(undefined);
        
      case 'open':
        // Circuit is open, check if we should try half-open
        const now = Date.now();
        if (status.nextAttempt && now >= status.nextAttempt) {
          this.transitionToHalfOpen(operationId);
          return right(undefined);
        }
        
        return left(createCircuitBreakerError(
          `Circuit breaker is open for operation ${operationId}`,
          {
            feedId: operationId,
            state: 'open',
            failureCount: status.failureCount,
            lastFailure: status.lastFailure,
          }
        ));
        
      case 'half_open':
        // Allow limited requests to test if service has recovered
        return right(undefined);
        
      default:
        return left(createCircuitBreakerError(
          `Unknown circuit breaker state: ${status.state}`,
          { feedId: operationId }
        ));
    }
  };

  /**
   * Execute operation with monitoring and failure detection
   */
  private readonly executeWithMonitoring = <T>(
    operationId: string,
    operation: CircuitBreakerOperation<T>
  ): TaskEither<OracleError, T> => {
    const startTime = Date.now();
    
    return pipe(
      operation(),
      TaskEither.bimap(
        // Handle error
        (error) => {
          const responseTime = Date.now() - startTime;
          this.recordFailure(operationId, error, responseTime);
          return error;
        },
        // Handle success
        (result) => {
          const responseTime = Date.now() - startTime;
          this.recordSuccess(operationId, result, responseTime);
          return result;
        }
      )
    );
  };

  /**
   * Record successful operation
   */
  private readonly recordSuccess = <T>(
    operationId: string,
    result: T,
    responseTime: number
  ): void => {
    const status = this.getStatus(operationId);
    const newStatus: CircuitBreakerStatus = {
      ...status,
      successCount: status.successCount + 1,
      lastSuccess: Date.now(),
    };

    // Check if we should close the circuit
    if (status.state === 'half_open' && newStatus.successCount >= this.config.successThreshold) {
      this.transitionToClosed(operationId);
    } else {
      this.updateStatus(operationId, newStatus);
    }

    // Update metrics
    this.updateMetrics(operationId, true, responseTime);
    
    // Record response time
    this.recordResponseTime(operationId, responseTime);

    // If this is oracle price data, record it for deviation detection
    if (this.isOraclePriceData(result)) {
      this.recordPriceData(operationId, result as unknown as OraclePriceData);
    }
  };

  /**
   * Record failed operation
   */
  private readonly recordFailure = (
    operationId: string,
    error: OracleError,
    responseTime: number
  ): void => {
    const status = this.getStatus(operationId);
    const newStatus: CircuitBreakerStatus = {
      ...status,
      failureCount: status.failureCount + 1,
      successCount: 0, // Reset success count on failure
      lastFailure: Date.now(),
    };

    // Check if we should open the circuit
    if (newStatus.failureCount >= this.config.failureThreshold) {
      this.transitionToOpen(operationId);
    } else {
      this.updateStatus(operationId, newStatus);
    }

    // Update metrics
    this.updateMetrics(operationId, false, responseTime);
    
    // Record response time
    this.recordResponseTime(operationId, responseTime);
  };

  /**
   * Detect price deviations that might indicate oracle manipulation
   */
  public readonly detectPriceDeviation = (
    feedId: string,
    newPrice: OraclePriceData
  ): Either<OracleError, PriceDeviationResult> => {
    const history = this.priceHistory.get(feedId) || [];
    
    if (history.length === 0) {
      return right({
        hasDeviation: false,
        deviationPercent: 0,
        currentPrice: newPrice.price,
        referencePrice: newPrice.price,
      });
    }

    // Use median of recent prices as reference
    const recentPrices = history.slice(-5).map(p => p.price);
    const sortedPrices = recentPrices.sort((a, b) => Number(a - b));
    const referencePrice = sortedPrices[Math.floor(sortedPrices.length / 2)];

    // Calculate deviation percentage
    const deviationPercent = Number(
      newPrice.price > referencePrice
        ? ((newPrice.price - referencePrice) * BigInt(10000)) / referencePrice
        : ((referencePrice - newPrice.price) * BigInt(10000)) / referencePrice
    ) / 100;

    const hasDeviation = deviationPercent > this.config.maxPriceDeviation;

    if (hasDeviation) {
      return left(createPriceDeviationError(
        `Price deviation ${deviationPercent.toFixed(2)}% exceeds threshold ${this.config.maxPriceDeviation}%`,
        {
          feedId,
          currentPrice: newPrice.price.toString(),
          expectedPrice: referencePrice.toString(),
          deviation: deviationPercent,
          threshold: this.config.maxPriceDeviation,
        }
      ));
    }

    return right({
      hasDeviation,
      deviationPercent,
      currentPrice: newPrice.price,
      referencePrice,
    });
  };

  /**
   * Get fallback value for failed oracle operation
   */
  public readonly getFallbackValue = (feedId: string): Option<OraclePriceData> => {
    const history = this.priceHistory.get(feedId);
    if (!history || history.length === 0) {
      return none;
    }

    // Return most recent valid price data
    const latest = history[history.length - 1];
    const now = Math.floor(Date.now() / 1000);
    const staleness = now - latest.timestamp;

    // Only use as fallback if not too stale (max 2x monitoring window)
    if (staleness <= (this.config.monitoringWindow * 2) / 1000) {
      return some({
        ...latest,
        confidence: Math.max(50, latest.confidence - 20), // Reduce confidence for fallback
        source: `${latest.source}-fallback`,
      });
    }

    return none;
  };

  /**
   * Get circuit breaker status
   */
  public readonly getCircuitStatus = (operationId: string): CircuitBreakerStatus => {
    return this.getStatus(operationId);
  };

  /**
   * Get circuit breaker metrics
   */
  public readonly getMetrics = (operationId: string): CircuitBreakerMetrics => {
    return this.metrics.get(operationId) || this.createDefaultMetrics();
  };

  /**
   * Reset circuit breaker (for testing/admin purposes)
   */
  public readonly reset = (operationId: string): void => {
    this.status.delete(operationId);
    this.metrics.delete(operationId);
    this.priceHistory.delete(operationId);
    this.responseTimeHistory.delete(operationId);
  };

  /**
   * Get health status for all circuits
   */
  public readonly getHealthStatus = (): Record<string, {
    status: CircuitBreakerState;
    health: 'healthy' | 'degraded' | 'critical';
    metrics: CircuitBreakerMetrics;
  }> => {
    const result: Record<string, any> = {};
    
    for (const [operationId, status] of this.status.entries()) {
      const metrics = this.getMetrics(operationId);
      let health: 'healthy' | 'degraded' | 'critical';
      
      if (status.state === 'open') {
        health = 'critical';
      } else if (status.state === 'half_open' || metrics.failureRate > 0.1) {
        health = 'degraded';
      } else {
        health = 'healthy';
      }
      
      result[operationId] = {
        status: status.state,
        health,
        metrics,
      };
    }
    
    return result;
  };

  /**
   * Private helper methods
   */

  private readonly getStatus = (operationId: string): CircuitBreakerStatus => {
    return this.status.get(operationId) || this.createDefaultStatus();
  };

  private readonly updateStatus = (operationId: string, status: CircuitBreakerStatus): void => {
    this.status.set(operationId, status);
  };

  private readonly createDefaultStatus = (): CircuitBreakerStatus => ({
    state: 'closed',
    failureCount: 0,
    successCount: 0,
  });

  private readonly transitionToOpen = (operationId: string): void => {
    const nextAttempt = Date.now() + this.config.timeout;
    this.updateStatus(operationId, {
      ...this.getStatus(operationId),
      state: 'open',
      nextAttempt,
    });
    
    // Update metrics
    const metrics = this.getMetrics(operationId);
    this.metrics.set(operationId, {
      ...metrics,
      circuitOpenCount: metrics.circuitOpenCount + 1,
    });
  };

  private readonly transitionToHalfOpen = (operationId: string): void => {
    this.updateStatus(operationId, {
      ...this.getStatus(operationId),
      state: 'half_open',
      successCount: 0,
      nextAttempt: undefined,
    });
  };

  private readonly transitionToClosed = (operationId: string): void => {
    this.updateStatus(operationId, {
      ...this.getStatus(operationId),
      state: 'closed',
      failureCount: 0,
      successCount: 0,
    });
  };

  private readonly updateMetrics = (
    operationId: string,
    success: boolean,
    responseTime: number
  ): void => {
    const current = this.getMetrics(operationId);
    
    const totalRequests = current.totalRequests + 1;
    const successfulRequests = current.successfulRequests + (success ? 1 : 0);
    const failedRequests = current.failedRequests + (success ? 0 : 1);
    
    const averageResponseTime = 
      (current.averageResponseTime * current.totalRequests + responseTime) / totalRequests;
    
    const failureRate = failedRequests / totalRequests;

    this.metrics.set(operationId, {
      totalRequests,
      successfulRequests,
      failedRequests,
      circuitOpenCount: current.circuitOpenCount,
      averageResponseTime,
      failureRate,
    });
  };

  private readonly createDefaultMetrics = (): CircuitBreakerMetrics => ({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    circuitOpenCount: 0,
    averageResponseTime: 0,
    failureRate: 0,
  });

  private readonly recordPriceData = (feedId: string, priceData: OraclePriceData): void => {
    const history = this.priceHistory.get(feedId) || [];
    history.push(priceData);
    
    // Keep only recent history (last 50 data points)
    if (history.length > 50) {
      history.shift();
    }
    
    this.priceHistory.set(feedId, history);
  };

  private readonly recordResponseTime = (operationId: string, responseTime: number): void => {
    const history = this.responseTimeHistory.get(operationId) || [];
    history.push(responseTime);
    
    // Keep only recent history (last 100 response times)
    if (history.length > 100) {
      history.shift();
    }
    
    this.responseTimeHistory.set(operationId, history);
  };

  private readonly isOraclePriceData = (value: unknown): value is OraclePriceData => {
    return (
      typeof value === 'object' &&
      value !== null &&
      'feedId' in value &&
      'price' in value &&
      'timestamp' in value
    );
  };
}

/**
 * Factory function for creating circuit breaker service
 */
export const createCircuitBreakerService = (
  config: CircuitBreakerConfig
): CircuitBreakerService => {
  return new CircuitBreakerService(config);
};

/**
 * Default circuit breaker configurations for different use cases
 */
export const DEFAULT_CIRCUIT_BREAKER_CONFIGS = {
  oracle_price_feed: {
    failureThreshold: 5,
    successThreshold: 3,
    timeout: 60000, // 1 minute
    maxPriceDeviation: 20.0, // 20%
    monitoringWindow: 300000, // 5 minutes
  },
  oracle_aggregation: {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 30000, // 30 seconds
    maxPriceDeviation: 15.0, // 15%
    monitoringWindow: 180000, // 3 minutes
  },
  chainlink_functions: {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 120000, // 2 minutes
    maxPriceDeviation: 25.0, // 25%
    monitoringWindow: 600000, // 10 minutes
  },
} as const;

/**
 * Get default configuration for circuit breaker type
 */
export const getDefaultCircuitBreakerConfig = (
  type: keyof typeof DEFAULT_CIRCUIT_BREAKER_CONFIGS
): CircuitBreakerConfig => {
  return DEFAULT_CIRCUIT_BREAKER_CONFIGS[type];
};