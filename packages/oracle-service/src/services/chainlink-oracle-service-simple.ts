/**
 * Simplified Chainlink Oracle Service
 * 
 * Mock implementation for testing package structure
 */

import { right } from 'fp-ts/Either';
import { Option, some, none, isSome } from 'fp-ts/Option';
import * as IO from 'fp-ts/IO';
import { z } from 'zod';

import { 
  OraclePriceData, 
  OracleQueryData, 
  OracleResponse, 
  OracleFeedConfig,
  IOracleService,
  PriceFetch,
  HealthCheck,
  PriceValidator,
  OracleHealth
} from '../types/oracle-types';

/**
 * Simplified configuration
 */
export const ChainlinkOracleConfigSchema = z.object({
  network: z.string().min(1),
  provider: z.union([z.string().url(), z.any()]),
  defaultTimeout: z.number().int().positive().default(5000),
  defaultMaxStaleness: z.number().int().positive().default(3600),
  defaultMinConfidence: z.number().min(0).max(100).default(95),
  cacheTtl: z.number().int().positive().default(60),
  retry: z.object({
    maxAttempts: z.number().int().min(1).default(3),
    delayMs: z.number().int().positive().default(1000),
    backoffMultiplier: z.number().positive().default(2),
  }).default({}),
});

export type ChainlinkOracleConfig = z.infer<typeof ChainlinkOracleConfigSchema>;

/**
 * Simplified Chainlink Oracle Service
 */
export class ChainlinkOracleService implements IOracleService {
  private readonly cache: Map<string, { data: OraclePriceData; timestamp: number; ttl: number }> = new Map();

  constructor(config: ChainlinkOracleConfig) {
    ChainlinkOracleConfigSchema.parse(config);
  }

  /**
   * Simplified price fetch implementation
   */
  public readonly fetchPrice: PriceFetch = (query: OracleQueryData) => {
    // Check cache first if allowed
    if (query.allowCached) {
      const cached = this.checkCache(query.feedId);
      if (isSome(cached)) {
        const response: OracleResponse = {
          data: cached.value,
          metadata: {
            responseTime: 0,
            fromCache: true,
            source: 'chainlink',
          },
        };
        return IO.of(right(response));
      }
    }

    // Real price mapping for supported assets
    const realPrices: Record<string, bigint> = {
      'ETH/USD': BigInt('340000000000'), // $3400 with 8 decimals
      'BTC/USD': BigInt('9800000000000'), // $98000 with 8 decimals  
      'ADA/USD': BigInt('108000000'), // $1.08 with 8 decimals
      'DUST/USD': BigInt('15000000'), // $0.15 with 8 decimals
    };

    const basePrice = realPrices[query.feedId] || BigInt('100000000000'); // Default $1000
    
    // Add small random variation to simulate real price movement
    const variation = Math.floor(Math.random() * 200) - 100; // ±1% variation
    const variationAmount = (basePrice * BigInt(variation)) / BigInt(10000);
    const finalPrice = basePrice + variationAmount;

    const realPrice: OraclePriceData = {
      feedId: query.feedId,
      price: finalPrice,
      decimals: 8,
      timestamp: Math.floor(Date.now() / 1000),
      roundId: BigInt(Math.floor(Math.random() * 1000000) + 100000),
      confidence: 95 + Math.floor(Math.random() * 5), // 95-99% confidence
      source: 'chainlink',
    };

    const response: OracleResponse = {
      data: realPrice,
      metadata: {
        responseTime: 120 + Math.floor(Math.random() * 80), // 120-200ms
        fromCache: false,
        source: 'chainlink',
        aggregationMethod: 'single',
      },
    };

    return IO.of(right(response));
  };

  /**
   * Simplified health check
   */
  public readonly checkHealth: HealthCheck = () => {
    const health: OracleHealth = {
      status: 'healthy',
      feeds: {},
      metrics: {
        totalFeeds: 1,
        healthyFeeds: 1,
        averageConfidence: 100,
        averageStaleness: 0,
        uptime: 100,
      },
      timestamp: Math.floor(Date.now() / 1000),
    };

    return IO.of(right(health));
  };

  /**
   * Mock price validation
   */
  public readonly validatePrice: PriceValidator = (data) => {
    return right({
      isValid: true,
      score: 100,
      issues: [],
      validatedData: data,
    });
  };

  /**
   * Get supported feed IDs
   */
  public readonly getSupportedFeeds = (): readonly string[] => {
    return ['ETH/USD', 'BTC/USD', 'ADA/USD', 'DUST/USD'];
  };

  /**
   * Get feed configuration
   */
  public readonly getFeedConfig = (feedId: string): Option<OracleFeedConfig> => {
    // Mock feed config
    const config: OracleFeedConfig = {
      feedId,
      description: `Mock ${feedId} feed`,
      address: '0x0000000000000000000000000000000000000000',
      decimals: 8,
      heartbeat: 3600,
      deviationThreshold: 0.5,
      minConfidence: 95,
      priority: 1,
      isActive: true,
    };

    return some(config);
  };

  /**
   * Simple cache check
   */
  private checkCache = (feedId: string): Option<OraclePriceData> => {
    const entry = this.cache.get(feedId);
    if (!entry) {
      return none;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(feedId);
      return none;
    }

    return some(entry.data);
  };
}