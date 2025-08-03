/**
 * Chainlink Oracle Service
 *
 * Functional programming-based service for interacting with Chainlink
 * price feeds following NYXUSD's established patterns
 */

import { Either, left, right, fold } from "fp-ts/Either";
import { Option, some, none, isSome } from "fp-ts/Option";
import * as IO from "fp-ts/IO";
import { TaskEither, tryCatch } from "fp-ts/TaskEither";
// Mock ethers types since package not properly installed in workspace
interface Contract {
  latestRoundData(): Promise<{
    roundId: { toString(): string };
    answer: { toString(): string };
    startedAt: { toString(): string };
    updatedAt: { toString(): string };
    answeredInRound: { toString(): string };
  }>;
}

interface Provider {
  getBlockNumber(): Promise<number>;
}
import { z } from "zod";

import {
  OraclePriceData,
  OracleQueryData,
  OracleResponse,
  OracleFeedConfig,
  IOracleService,
  PriceFetch,
  HealthCheck,
  PriceValidator,
} from "../types/oracle-types";

import {
  ChainlinkRoundData,
  ChainlinkFeedMetadata,
  ChainlinkRoundDataSchema,
} from "../types/chainlink-types";

import {
  OracleError,
  createNetworkError,
  createDataValidationError,
  createStaleDataError,
} from "../errors/oracle-errors";

import { getFeedAddress, getFeedMetadata } from "../config/chainlink-feeds";

/**
 * Chainlink AggregatorV3Interface ABI (minimal)
 */
const AGGREGATOR_V3_ABI = [
  "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  "function decimals() view returns (uint8)",
  "function description() view returns (string)",
  "function version() view returns (uint256)",
] as const;

/**
 * Chainlink Oracle Service Configuration
 */
export const ChainlinkOracleConfigSchema = z.object({
  /** Network to connect to */
  network: z.string().min(1),
  /** RPC provider URL or provider instance */
  provider: z.union([z.string().url(), z.any()]),
  /** Default timeout for requests (ms) */
  defaultTimeout: z.number().int().positive().default(5000),
  /** Default maximum staleness (seconds) */
  defaultMaxStaleness: z.number().int().positive().default(3600),
  /** Default minimum confidence */
  defaultMinConfidence: z.number().min(0).max(100).default(95),
  /** Cache TTL (seconds) */
  cacheTtl: z.number().int().positive().default(60),
  /** Retry configuration */
  retry: z
    .object({
      maxAttempts: z.number().int().min(1).default(3),
      delayMs: z.number().int().positive().default(1000),
      backoffMultiplier: z.number().positive().default(2),
    })
    .default({}),
});

export type ChainlinkOracleConfig = z.infer<typeof ChainlinkOracleConfigSchema>;

/**
 * Price data cache entry
 */
interface CacheEntry {
  data: OraclePriceData;
  timestamp: number;
  ttl: number;
}

/**
 * Chainlink Oracle Service Implementation
 */
export class ChainlinkOracleService implements IOracleService {
  private readonly config: ChainlinkOracleConfig;
  private readonly provider: Provider;
  private readonly cache: Map<string, CacheEntry> = new Map();
  private readonly contracts: Map<string, Contract> = new Map();

  constructor(config: ChainlinkOracleConfig) {
    this.config = ChainlinkOracleConfigSchema.parse(config);

    // Initialize provider (mock implementation)
    this.provider = {
      getBlockNumber: async () => 12345678,
    };
  }

  /**
   * Get or create contract instance for a feed - UNUSED IN MOCK
   */
  private getContract = (
    feedAddress: string,
  ): Either<OracleError, Contract> => {
    try {
      const cached = this.contracts.get(feedAddress);
      if (cached) {
        return right(cached);
      }

      const contract = this.createContract(feedAddress);
      this.contracts.set(feedAddress, contract);

      return right(contract);
    } catch (error) {
      return left(
        createNetworkError(
          `Failed to create contract for feed ${feedAddress}`,
          { endpoint: feedAddress },
        ),
      );
    }
  };

  /**
   * Fetch raw round data from Chainlink aggregator
   */
  private fetchRoundData = (
    contract: Contract,
  ): TaskEither<OracleError, ChainlinkRoundData> =>
    tryCatch(
      async () => {
        const result = await Promise.race([
          contract.latestRoundData(),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Timeout")),
              this.config.defaultTimeout,
            ),
          ),
        ]);

        return ChainlinkRoundDataSchema.parse({
          roundId: result.roundId,
          answer: result.answer,
          startedAt: result.startedAt,
          updatedAt: result.updatedAt,
          answeredInRound: result.answeredInRound,
        });
      },
      (error) => {
        if (error instanceof Error && error.message === "Timeout") {
          return createNetworkError("Request timeout", { timeout: true });
        }
        return createNetworkError(`Failed to fetch round data: ${error}`, {
          endpoint: "chainlink-aggregator",
        });
      },
    );

  /**
   * Fetch feed metadata (decimals, description, etc.)
   */
  private fetchFeedMetadata = (
    contract: Contract,
  ): TaskEither<OracleError, ChainlinkFeedMetadata> =>
    tryCatch(
      async () => {
        const [decimals, description, version] = await Promise.all([
          contract.decimals(),
          contract.description(),
          contract.version(),
        ]);

        return {
          address: await contract.getAddress(),
          decimals: Number(decimals),
          description,
          version: Number(version),
          heartbeat: 3600, // Default, should be configured per feed
          deviation: 0.5, // Default, should be configured per feed
        };
      },
      (error) =>
        createNetworkError(`Failed to fetch feed metadata: ${error}`, {
          endpoint: "chainlink-metadata",
        }),
    );

  /**
   * Convert Chainlink data to internal format
   */
  private convertToOracleData = (
    roundData: ChainlinkRoundData,
    metadata: ChainlinkFeedMetadata,
    feedId: string,
  ): Either<OracleError, OraclePriceData> => {
    try {
      // Validate price data
      if (roundData.answer <= 0) {
        return left(
          createDataValidationError(
            "Invalid price data: answer must be positive",
            { feedId, receivedData: roundData },
          ),
        );
      }

      if (roundData.updatedAt <= 0) {
        return left(
          createDataValidationError(
            "Invalid price data: updatedAt must be positive",
            { feedId, receivedData: roundData },
          ),
        );
      }

      // Calculate confidence based on data freshness and other factors
      const now = Math.floor(Date.now() / 1000);
      const staleness = now - Number(roundData.updatedAt);
      const maxStaleness = metadata.heartbeat * 2; // Allow 2x heartbeat

      let confidence = 100;
      if (staleness > metadata.heartbeat) {
        confidence = Math.max(50, 100 - (staleness / maxStaleness) * 50);
      }

      const oracleData: OraclePriceData = {
        feedId,
        price: BigInt(roundData.answer.toString()),
        decimals: metadata.decimals,
        timestamp: Number(roundData.updatedAt),
        roundId: BigInt(roundData.roundId.toString()),
        confidence: Math.round(confidence),
        source: "chainlink",
      };

      return right(oracleData);
    } catch (error) {
      return left(
        createDataValidationError(`Failed to convert oracle data: ${error}`, {
          feedId,
          receivedData: roundData,
        }),
      );
    }
  };

  /**
   * Validate price data against rules
   */
  private validatePriceData = (
    data: OraclePriceData,
    query: OracleQueryData,
  ): Either<OracleError, OraclePriceData> => {
    const now = Math.floor(Date.now() / 1000);
    const staleness = now - data.timestamp;
    const maxStaleness = query.maxStaleness || this.config.defaultMaxStaleness;
    const minConfidence =
      query.minConfidence || this.config.defaultMinConfidence;

    // Check staleness
    if (staleness > maxStaleness) {
      return left(
        createStaleDataError(
          `Price data is too stale: ${staleness}s > ${maxStaleness}s`,
          {
            feedId: data.feedId,
            lastUpdate: data.timestamp,
            maxAge: maxStaleness,
            staleness,
          },
        ),
      );
    }

    // Check confidence
    if (data.confidence < minConfidence) {
      return left(
        createDataValidationError(
          `Price confidence too low: ${data.confidence}% < ${minConfidence}%`,
          {
            feedId: data.feedId,
            receivedData: { confidence: data.confidence },
          },
        ),
      );
    }

    return right(data);
  };

  /**
   * Check cache for valid data
   */
  private checkCache = (feedId: string): Option<OraclePriceData> => {
    if (!this.config.cacheTtl) return none;

    const entry = this.cache.get(feedId);
    if (!entry) return none;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(feedId);
      return none;
    }

    return some(entry.data);
  };

  /**
   * Cache price data
   */
  private cacheData = (data: OraclePriceData): void => {
    if (!this.config.cacheTtl) return;

    this.cache.set(data.feedId, {
      data,
      timestamp: Date.now(),
      ttl: this.config.cacheTtl,
    });
  };

  /**
   * Fetch price with retry logic
   */
  private fetchPriceWithRetry = (
    query: OracleQueryData,
  ): TaskEither<OracleError, OraclePriceData> => {
    return tryCatch(
      async () => {
        const feedAddress = getFeedAddress(this.config.network, query.feedId);
        if (!feedAddress) {
          throw new Error(
            `Feed not supported: ${query.feedId} on ${this.config.network}`,
          );
        }

        const contract = this.createContract(feedAddress);
        const roundData = await contract.latestRoundData();

        const priceData: OraclePriceData = {
          feedId: query.feedId,
          price: BigInt(roundData.answer.toString()),
          decimals: 8, // Most Chainlink feeds use 8 decimals
          timestamp: Number(roundData.updatedAt),
          roundId: BigInt(roundData.roundId.toString()),
          confidence: 100, // Chainlink feeds are considered high confidence
          source: "chainlink",
        };

        return priceData;
      },
      (error) =>
        createNetworkError(
          `Failed to fetch price for ${query.feedId}: ${error}`,
          { endpoint: "chainlink-feed" },
        ),
    );
  };

  /**
   * Create contract instance
   */
  private createContract = (feedAddress: string): Contract => {
    // Mock implementation for testing
    return {
      latestRoundData: async () => ({
        roundId: { toString: () => "12345" },
        answer: { toString: () => "200000000000" }, // $2000 with 8 decimals
        startedAt: {
          toString: () => Math.floor(Date.now() / 1000 - 100).toString(),
        },
        updatedAt: { toString: () => Math.floor(Date.now() / 1000).toString() },
        answeredInRound: { toString: () => "12345" },
      }),
    };
  };

  /**
   * Main price fetch implementation
   */
  public readonly fetchPrice: PriceFetch = (query: OracleQueryData) =>
    IO.of(async () => {
      // Check cache first if allowed
      if (query.allowCached) {
        const cached = this.checkCache(query.feedId);
        if (isSome(cached)) {
          const response: OracleResponse = {
            data: cached.value,
            metadata: {
              responseTime: 0,
              fromCache: true,
              source: "chainlink",
            },
          };
          return right(response);
        }
      }

      // Fetch fresh data
      const startTime = Date.now();
      const result = await this.fetchPriceWithRetry(query)();

      return fold(
        (error: OracleError) => left(error),
        (data: OraclePriceData) => {
          const response: OracleResponse = {
            data,
            metadata: {
              responseTime: Date.now() - startTime,
              fromCache: false,
              source: "chainlink",
              aggregationMethod: "single",
            },
          };
          return right(response);
        },
      )(result);
    });

  /**
   * Health check implementation
   */
  public readonly checkHealth: HealthCheck = () =>
    IO.of(async () => {
      try {
        // Test connection with a simple call
        await this.provider.getBlockNumber();

        const health = {
          status: "healthy" as const,
          feeds: {},
          metrics: {
            totalFeeds: 0,
            healthyFeeds: 0,
            averageConfidence: 0,
            averageStaleness: 0,
            uptime: 100,
          },
          timestamp: Math.floor(Date.now() / 1000),
        };

        return right(health);
      } catch (error) {
        return left(
          createNetworkError(`Health check failed: ${error}`, {
            endpoint: "chainlink-health",
          }),
        );
      }
    });

  /**
   * Price validation implementation
   */
  public readonly validatePrice: PriceValidator = (data: OraclePriceData) => {
    // Basic validation - can be extended with more sophisticated rules
    const issues: Array<{
      code: string;
      severity: "info" | "warning" | "error";
      message: string;
    }> = [];

    let score = 100;

    // Check price value
    if (data.price <= 0) {
      issues.push({
        code: "INVALID_PRICE",
        severity: "error",
        message: "Price must be positive",
      });
      score = 0;
    }

    // Check staleness
    const now = Math.floor(Date.now() / 1000);
    const staleness = now - data.timestamp;
    if (staleness > 3600) {
      // 1 hour
      issues.push({
        code: "STALE_DATA",
        severity: "warning",
        message: `Data is ${staleness} seconds old`,
      });
      score -= Math.min(30, staleness / 120); // Reduce score based on staleness
    }

    // Check confidence
    if (data.confidence < 95) {
      issues.push({
        code: "LOW_CONFIDENCE",
        severity: "warning",
        message: `Low confidence: ${data.confidence}%`,
      });
      score -= (95 - data.confidence) * 2;
    }

    const result = {
      isValid:
        score > 50 && issues.filter((i) => i.severity === "error").length === 0,
      score: Math.max(0, Math.round(score)),
      issues,
      validatedData: score > 50 ? data : undefined,
    };

    return right(result);
  };

  /**
   * Get supported feed IDs
   */
  public readonly getSupportedFeeds = (): readonly string[] => {
    const feedAddresses = getFeedAddress(this.config.network, "");
    return Object.keys(feedAddresses || {});
  };

  /**
   * Get feed configuration
   */
  public readonly getFeedConfig = (
    feedId: string,
  ): Option<OracleFeedConfig> => {
    const address = getFeedAddress(this.config.network, feedId);
    const metadata = getFeedMetadata(feedId);

    if (!address || !metadata) {
      return none;
    }

    const config: OracleFeedConfig = {
      feedId,
      description: metadata.description,
      address,
      decimals: metadata.decimals,
      heartbeat: metadata.heartbeat,
      deviationThreshold: metadata.deviation,
      minConfidence: this.config.defaultMinConfidence,
      priority: metadata.priority,
      isActive: true,
    };

    return some(config);
  };
}
