/**
 * Oracle Configuration
 *
 * Centralized configuration for oracle services with environment-specific
 * settings and validation
 */

import { z } from "zod";
import { ChainlinkOracleConfigSchema } from "../services/chainlink-oracle-service";

import { CircuitBreakerConfigSchema } from "../types/oracle-types";

import { DEFAULT_CIRCUIT_BREAKER_CONFIGS } from "../services/circuit-breaker-service";

import {
  AggregationStrategySchema,
  ConsensusConfigSchema,
} from "../types/aggregation-types";

import { CHAINLINK_NETWORKS, CHAINLINK_TESTNETS } from "./chainlink-feeds";

/**
 * Environment-specific oracle configuration
 */
export const OracleEnvironmentConfigSchema = z
  .object({
    /** Environment name */
    environment: z.enum(["development", "staging", "production"]),

    /** Network configuration */
    network: z.object({
      name: z.string(),
      chainId: z.number().int().positive(),
      rpcUrl: z.string().url(),
      isTestnet: z.boolean(),
    }),

    /** Oracle service configurations */
    oracles: z.object({
      primary: ChainlinkOracleConfigSchema,
      fallbacks: z.array(ChainlinkOracleConfigSchema).optional(),
    }),

    /** Circuit breaker configuration */
    circuitBreaker: CircuitBreakerConfigSchema.optional(),

    /** Aggregation configuration */
    aggregation: z
      .object({
        strategy: AggregationStrategySchema.optional(),
        consensus: ConsensusConfigSchema.optional(),
        enabled: z.boolean().default(false),
      })
      .optional(),

    /** Cache configuration */
    cache: z
      .object({
        enabled: z.boolean().default(true),
        ttl: z.number().int().positive().default(60),
        maxSize: z.number().int().positive().default(1000),
      })
      .optional(),

    /** Monitoring configuration */
    monitoring: z
      .object({
        enabled: z.boolean().default(true),
        metricsInterval: z.number().int().positive().default(60),
        healthCheckInterval: z.number().int().positive().default(30),
        alertThresholds: z
          .object({
            failureRate: z.number().min(0).max(1).default(0.1),
            responseTime: z.number().positive().default(5000),
            staleness: z.number().int().positive().default(3600),
          })
          .optional(),
      })
      .optional(),

    /** API keys and authentication */
    auth: z
      .object({
        chainlinkApiKey: z.string().optional(),
        infuraProjectId: z.string().optional(),
        alchemyApiKey: z.string().optional(),
      })
      .optional(),
  })
  .strict();

export type OracleEnvironmentConfig = z.infer<
  typeof OracleEnvironmentConfigSchema
>;

/**
 * Default configurations for each environment
 */
export const DEFAULT_ORACLE_CONFIGS: Record<
  string,
  Partial<OracleEnvironmentConfig>
> = {
  development: {
    environment: "development",
    network: {
      name: "Ethereum Sepolia",
      chainId: 11155111,
      rpcUrl: "https://sepolia.infura.io/v3/demo",
      isTestnet: true,
    },
    oracles: {
      primary: {
        network: "sepolia",
        provider: "https://sepolia.infura.io/v3/demo",
        defaultTimeout: 10000,
        defaultMaxStaleness: 7200, // 2 hours for testnet
        defaultMinConfidence: 90,
        cacheTtl: 300, // 5 minutes
        retry: {
          maxAttempts: 3,
          delayMs: 1000,
          backoffMultiplier: 2,
        },
      },
    },
    circuitBreaker: DEFAULT_CIRCUIT_BREAKER_CONFIGS.oracle_price_feed,
    cache: {
      enabled: true,
      ttl: 300, // 5 minutes
      maxSize: 100,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 120,
      healthCheckInterval: 60,
      alertThresholds: {
        failureRate: 0.2, // 20% for development
        responseTime: 10000, // 10 seconds
        staleness: 7200, // 2 hours
      },
    },
  },

  staging: {
    environment: "staging",
    network: {
      name: "Ethereum Sepolia",
      chainId: 11155111,
      rpcUrl: "https://sepolia.infura.io/v3/demo",
      isTestnet: true,
    },
    oracles: {
      primary: {
        network: "sepolia",
        provider: "https://sepolia.infura.io/v3/demo",
        defaultTimeout: 5000,
        defaultMaxStaleness: 3600, // 1 hour
        defaultMinConfidence: 95,
        cacheTtl: 60, // 1 minute
        retry: {
          maxAttempts: 3,
          delayMs: 1000,
          backoffMultiplier: 2,
        },
      },
      fallbacks: [
        {
          network: "sepolia",
          provider: "https://sepolia.alchemy.com/v2/demo",
          defaultTimeout: 5000,
          defaultMaxStaleness: 3600,
          defaultMinConfidence: 95,
          cacheTtl: 60,
          retry: {
            maxAttempts: 2,
            delayMs: 1500,
            backoffMultiplier: 2,
          },
        },
      ],
    },
    circuitBreaker: DEFAULT_CIRCUIT_BREAKER_CONFIGS.oracle_price_feed,
    aggregation: {
      enabled: true,
      strategy: {
        name: "staging_consensus",
        method: "median",
        weighting: "confidence",
        outlierHandling: "exclude",
        qualityFactors: {
          confidenceWeight: 0.3,
          freshnessWeight: 0.2,
          reliabilityWeight: 0.3,
          consensusWeight: 0.2,
        },
      },
      consensus: {
        minSources: 2,
        maxSources: 3,
        consensusThreshold: 0.8,
        maxDeviation: 5.0,
        outlierDetection: "zscore",
        outlierThreshold: 2.0,
        minSourceConfidence: 95.0,
        stalenessWindow: 3600,
      },
    },
    cache: {
      enabled: true,
      ttl: 60,
      maxSize: 500,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 60,
      healthCheckInterval: 30,
      alertThresholds: {
        failureRate: 0.15, // 15% for staging
        responseTime: 7500,
        staleness: 3600,
      },
    },
  },

  production: {
    environment: "production",
    network: {
      name: "Ethereum Mainnet",
      chainId: 1,
      rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/demo",
      isTestnet: false,
    },
    oracles: {
      primary: {
        network: "ethereum",
        provider: "https://eth-mainnet.g.alchemy.com/v2/demo",
        defaultTimeout: 3000,
        defaultMaxStaleness: 3600, // 1 hour
        defaultMinConfidence: 99,
        cacheTtl: 30, // 30 seconds
        retry: {
          maxAttempts: 5,
          delayMs: 500,
          backoffMultiplier: 1.5,
        },
      },
      fallbacks: [
        {
          network: "ethereum",
          provider: "https://mainnet.infura.io/v3/demo",
          defaultTimeout: 3000,
          defaultMaxStaleness: 3600,
          defaultMinConfidence: 99,
          cacheTtl: 30,
          retry: {
            maxAttempts: 3,
            delayMs: 750,
            backoffMultiplier: 1.5,
          },
        },
        {
          network: "ethereum",
          provider: "https://eth-mainnet.public.blastapi.io",
          defaultTimeout: 4000,
          defaultMaxStaleness: 3600,
          defaultMinConfidence: 98,
          cacheTtl: 30,
          retry: {
            maxAttempts: 2,
            delayMs: 1000,
            backoffMultiplier: 2,
          },
        },
      ],
    },
    circuitBreaker: {
      ...DEFAULT_CIRCUIT_BREAKER_CONFIGS.oracle_price_feed,
      failureThreshold: 3, // Stricter for production
      maxPriceDeviation: 10.0, // 10% for production
    },
    aggregation: {
      enabled: true,
      strategy: {
        name: "production_weighted",
        method: "weighted_average",
        weighting: "reliability",
        outlierHandling: "exclude",
        qualityFactors: {
          confidenceWeight: 0.4,
          freshnessWeight: 0.3,
          reliabilityWeight: 0.2,
          consensusWeight: 0.1,
        },
      },
      consensus: {
        minSources: 2,
        maxSources: 3,
        consensusThreshold: 0.9,
        maxDeviation: 3.0, // Stricter for production
        outlierDetection: "mad",
        outlierThreshold: 2.0,
        minSourceConfidence: 99.0,
        stalenessWindow: 3600,
      },
    },
    cache: {
      enabled: true,
      ttl: 30,
      maxSize: 1000,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 30,
      healthCheckInterval: 15,
      alertThresholds: {
        failureRate: 0.05, // 5% for production
        responseTime: 3000,
        staleness: 3600,
      },
    },
  },
};

/**
 * Configuration validation and loading
 */
export const validateOracleConfig = (
  config: unknown,
): z.SafeParseReturnType<OracleEnvironmentConfig> => {
  return OracleEnvironmentConfigSchema.safeParse(config);
};

/**
 * Load configuration from environment variables
 */
export const loadOracleConfigFromEnv = (): OracleEnvironmentConfig => {
  const environment =
    (process.env["NODE_ENV"] as "development" | "staging" | "production") ||
    "development";
  const defaultConfig = DEFAULT_ORACLE_CONFIGS[environment];

  // Override with environment variables
  const config: Partial<OracleEnvironmentConfig> = {
    ...defaultConfig,
    environment,
  };

  // Network overrides
  if (process.env["ORACLE_NETWORK_RPC_URL"]) {
    config.network = {
      ...config.network!,
      rpcUrl: process.env["ORACLE_NETWORK_RPC_URL"],
    };
  }

  if (process.env["ORACLE_NETWORK_CHAIN_ID"]) {
    config.network = {
      ...config.network!,
      chainId: parseInt(process.env["ORACLE_NETWORK_CHAIN_ID"], 10),
    };
  }

  // Oracle configuration overrides
  if (process.env["ORACLE_PRIMARY_RPC_URL"]) {
    config.oracles = {
      ...config.oracles!,
      primary: {
        ...config.oracles!.primary!,
        provider: process.env["ORACLE_PRIMARY_RPC_URL"],
      },
    };
  }

  if (process.env["ORACLE_TIMEOUT"]) {
    const timeout = parseInt(process.env["ORACLE_TIMEOUT"], 10);
    config.oracles = {
      ...config.oracles!,
      primary: {
        ...config.oracles!.primary!,
        defaultTimeout: timeout,
      },
    };
  }

  if (process.env["ORACLE_MIN_CONFIDENCE"]) {
    const minConfidence = parseFloat(process.env["ORACLE_MIN_CONFIDENCE"]);
    config.oracles = {
      ...config.oracles!,
      primary: {
        ...config.oracles!.primary!,
        defaultMinConfidence: minConfidence,
      },
    };
  }

  // Cache configuration overrides
  if (process.env["ORACLE_CACHE_ENABLED"]) {
    config.cache = {
      ...config.cache!,
      enabled: process.env["ORACLE_CACHE_ENABLED"].toLowerCase() === "true",
    };
  }

  if (process.env["ORACLE_CACHE_TTL"]) {
    config.cache = {
      ...config.cache!,
      ttl: parseInt(process.env["ORACLE_CACHE_TTL"], 10),
    };
  }

  // Authentication overrides
  if (
    process.env["CHAINLINK_API_KEY"] ||
    process.env["INFURA_PROJECT_ID"] ||
    process.env["ALCHEMY_API_KEY"]
  ) {
    config.auth = {
      chainlinkApiKey: process.env["CHAINLINK_API_KEY"],
      infuraProjectId: process.env["INFURA_PROJECT_ID"],
      alchemyApiKey: process.env["ALCHEMY_API_KEY"],
    };
  }

  // Validate the final configuration
  const validation = validateOracleConfig(config);

  if (!validation.success) {
    throw new Error(
      `Invalid oracle configuration: ${validation.error.message}`,
    );
  }

  return validation.data;
};

/**
 * Get configuration for specific environment
 */
export const getOracleConfig = (
  environment: keyof typeof DEFAULT_ORACLE_CONFIGS,
): OracleEnvironmentConfig => {
  const config = DEFAULT_ORACLE_CONFIGS[environment];

  if (!config) {
    throw new Error(`Unknown environment: ${environment}`);
  }

  const validation = validateOracleConfig(config);

  if (!validation.success) {
    throw new Error(
      `Invalid configuration for environment ${environment}: ${validation.error.message}`,
    );
  }

  return validation.data;
};

/**
 * Create network-specific RPC URLs with API keys
 */
export const createRpcUrl = (
  network: string,
  provider: "infura" | "alchemy" | "public",
  apiKey?: string,
): string => {
  const networkConfig =
    CHAINLINK_NETWORKS[network] || CHAINLINK_TESTNETS[network];

  if (!networkConfig) {
    throw new Error(`Unsupported network: ${network}`);
  }

  switch (provider) {
    case "infura":
      if (!apiKey) throw new Error("Infura API key required");
      if (network === "ethereum")
        return `https://mainnet.infura.io/v3/${apiKey}`;
      if (network === "sepolia")
        return `https://sepolia.infura.io/v3/${apiKey}`;
      if (network === "polygon")
        return `https://polygon-mainnet.infura.io/v3/${apiKey}`;
      if (network === "arbitrum")
        return `https://arbitrum-mainnet.infura.io/v3/${apiKey}`;
      if (network === "optimism")
        return `https://optimism-mainnet.infura.io/v3/${apiKey}`;
      break;

    case "alchemy":
      if (!apiKey) throw new Error("Alchemy API key required");
      if (network === "ethereum")
        return `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;
      if (network === "sepolia")
        return `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
      if (network === "polygon")
        return `https://polygon-mainnet.g.alchemy.com/v2/${apiKey}`;
      if (network === "arbitrum")
        return `https://arb-mainnet.g.alchemy.com/v2/${apiKey}`;
      if (network === "optimism")
        return `https://opt-mainnet.g.alchemy.com/v2/${apiKey}`;
      break;

    case "public":
      return networkConfig.rpcUrl;

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }

  throw new Error(
    `No RPC URL available for network ${network} with provider ${provider}`,
  );
};

/**
 * Environment variable names for easy reference
 */
export const ORACLE_ENV_VARS = {
  NODE_ENV: "NODE_ENV",
  ORACLE_NETWORK_RPC_URL: "ORACLE_NETWORK_RPC_URL",
  ORACLE_NETWORK_CHAIN_ID: "ORACLE_NETWORK_CHAIN_ID",
  ORACLE_PRIMARY_RPC_URL: "ORACLE_PRIMARY_RPC_URL",
  ORACLE_TIMEOUT: "ORACLE_TIMEOUT",
  ORACLE_MIN_CONFIDENCE: "ORACLE_MIN_CONFIDENCE",
  ORACLE_CACHE_ENABLED: "ORACLE_CACHE_ENABLED",
  ORACLE_CACHE_TTL: "ORACLE_CACHE_TTL",
  CHAINLINK_API_KEY: "CHAINLINK_API_KEY",
  INFURA_PROJECT_ID: "INFURA_PROJECT_ID",
  ALCHEMY_API_KEY: "ALCHEMY_API_KEY",
} as const;
