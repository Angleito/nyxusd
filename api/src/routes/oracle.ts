/**
 * Oracle API Routes
 *
 * REST API endpoints for oracle price feeds using the new oracle service
 * with proper error handling and fallback mechanisms
 */

import { Router, Request, Response } from "express";
import { z } from "zod";

// Dynamic imports to handle potential build issues during development
let oracleService: any = null;
// OracleServiceFacade is loaded dynamically
let createOracleServiceFacade: any = null;
let DEFAULT_AGGREGATION_STRATEGY: any = null;
let DEFAULT_CONSENSUS_CONFIG: any = null;

// Initialize oracle service lazily
const initializeOracleService = async () => {
  if (!oracleService) {
    try {
      const oracleModule = await import("@nyxusd/oracle-service");
      // OracleServiceFacade = oracleModule.OracleServiceFacade;
      createOracleServiceFacade = oracleModule.createOracleServiceFacade;
      DEFAULT_AGGREGATION_STRATEGY = oracleModule.DEFAULT_AGGREGATION_STRATEGY;
      DEFAULT_CONSENSUS_CONFIG = oracleModule.DEFAULT_CONSENSUS_CONFIG;

      const oracleConfig = {
        primaryOracle: {
          network:
            process.env['NODE_ENV'] === "production" ? "ethereum" : "sepolia",
          provider:
            process.env['ORACLE_RPC_URL'] || "https://sepolia.infura.io/v3/demo",
          defaultTimeout: parseInt(process.env['ORACLE_TIMEOUT'] || "5000", 10),
          defaultMaxStaleness: parseInt(
            process.env['ORACLE_MAX_STALENESS'] || "3600",
            10,
          ),
          defaultMinConfidence: parseFloat(
            process.env['ORACLE_MIN_CONFIDENCE'] || "95",
          ),
          cacheTtl: parseInt(process.env['ORACLE_CACHE_TTL'] || "60", 10),
          retry: {
            maxAttempts: 3,
            delayMs: 1000,
            backoffMultiplier: 2,
          },
        },
        enableFallback: process.env['ORACLE_ENABLE_FALLBACK'] !== "false",
        aggregationStrategy: DEFAULT_AGGREGATION_STRATEGY,
        consensusConfig: DEFAULT_CONSENSUS_CONFIG,
        cache: {
          enabled: process.env['ORACLE_CACHE_ENABLED'] !== "false",
          ttl: parseInt(process.env['ORACLE_CACHE_TTL'] || "60", 10),
        },
      };

      oracleService = createOracleServiceFacade(oracleConfig);
    } catch (error) {
      console.warn("Failed to initialize oracle service:", error);
      oracleService = null;
    }
  }

  return oracleService;
};

const router = Router();

/**
 * Query parameter schemas
 */
const PriceQuerySchema = z.object({
  feeds: z.string().optional(),
  format: z.enum(["compact", "detailed"]).default("compact"),
  maxStaleness: z.string().transform(Number).optional(),
  minConfidence: z.string().transform(Number).optional(),
});

const HealthQuerySchema = z.object({
  detailed: z
    .string()
    .transform((val) => val === "true")
    .default(false),
});

/**
 * Fallback price data
 */
const FALLBACK_PRICES = {
  "ETH/USD": "2450.50",
  "BTC/USD": "42150.75",
  "LINK/USD": "14.50",
  "UNI/USD": "5.85",
  "USDC/USD": "1.00",
  "USDT/USD": "1.00",
  "DAI/USD": "0.999",
};

/**
 * GET /api/oracle/prices
 * Fetch current oracle prices
 */
router.get("/prices", async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const queryValidation = PriceQuerySchema.safeParse(req.query);
    if (!queryValidation.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid query parameters",
        details: queryValidation.error.errors,
      });
    }

    const { feeds, format, maxStaleness, minConfidence } = queryValidation.data;

    // Initialize oracle service
    const oracle = await initializeOracleService();

    if (!oracle) {
      return res.json({
        timestamp: new Date().toISOString(),
        prices: FALLBACK_PRICES,
        source: "fallback",
        reason: "Oracle service unavailable",
      });
    }

    // Determine which feeds to fetch
    const requestedFeeds = feeds
      ? feeds.split(",").map((f) => f.trim().replace("/", "-"))
      : [
          "ETH-USD",
          "BTC-USD",
          "LINK-USD",
          "UNI-USD",
          "USDC-USD",
          "USDT-USD",
          "DAI-USD",
        ];

    // Fetch prices
    const pricePromises = requestedFeeds.map(async (feedId) => {
      try {
        const query = {
          feedId,
          allowCached: true,
          timeout: 5000,
          maxStaleness,
          minConfidence,
        };

        const result = await oracle.fetchPrice(query)();

        if (result._tag === "Right") {
          const priceData = result.right.data;
          const formattedPrice =
            Number(priceData.price) / Math.pow(10, priceData.decimals);

          return {
            feedId,
            success: true,
            data: {
              price: formattedPrice.toFixed(priceData.decimals <= 2 ? 2 : 6),
              confidence: priceData.confidence,
              timestamp: priceData.timestamp,
              source: priceData.source,
              roundId: priceData.roundId.toString(),
              staleness: Math.floor(Date.now() / 1000) - priceData.timestamp,
            },
            metadata: result.right.metadata,
          };
        } else {
          return {
            feedId,
            success: false,
            error: result.left.message,
            code: result.left.code,
          };
        }
      } catch (error) {
        return {
          feedId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          code: "FETCH_ERROR",
        };
      }
    });

    const results = await Promise.all(pricePromises);
    const successfulResults = results.filter((r) => r.success);
    const failedResults = results.filter((r) => !r.success);

    if (format === "detailed") {
      // Return detailed format with individual feed results
      res.json({
        timestamp: new Date().toISOString(),
        feeds: results,
        summary: {
          total: results.length,
          successful: successfulResults.length,
          failed: failedResults.length,
          healthScore: successfulResults.length / results.length,
        },
        source: successfulResults.length > 0 ? "chainlink" : "fallback",
      });
    } else {
      // Return compact format matching existing API
      const prices: Record<string, string> = {};

      successfulResults.forEach((result) => {
        if (result.success && result.data) {
          const displayPair = result.feedId.replace("-", "/");
          prices[displayPair] = result.data.price;
        }
      });

      // Add fallback prices for failed feeds
      failedResults.forEach((result) => {
        const displayPair = result.feedId.replace("-", "/");
        const fallbackPrice =
          FALLBACK_PRICES[displayPair as keyof typeof FALLBACK_PRICES];
        if (fallbackPrice) {
          prices[displayPair] = fallbackPrice;
        }
      });

      res.json({
        timestamp: new Date().toISOString(),
        prices,
        source: successfulResults.length > 0 ? "chainlink" : "fallback",
        oracleHealth: successfulResults.length / results.length,
        errors:
          failedResults.length > 0
            ? failedResults.map((r) => ({
                feed: r.feedId,
                error: r.error,
              }))
            : undefined,
      });
    }
  } catch (error) {
    console.error("Oracle prices endpoint error:", error);

    res.status(500).json({
      timestamp: new Date().toISOString(),
      prices: FALLBACK_PRICES,
      source: "fallback",
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/oracle/health
 * Get oracle service health status
 */
router.get("/health", async (req: Request, res: Response) => {
  try {
    const queryValidation = HealthQuerySchema.safeParse(req.query);
    if (!queryValidation.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid query parameters",
      });
    }

    const { detailed } = queryValidation.data;

    const oracle = await initializeOracleService();

    if (!oracle) {
      return res.json({
        status: "offline",
        message: "Oracle service not available",
        timestamp: new Date().toISOString(),
      });
    }

    // Get health status
    const healthResult = await oracle.checkHealth()();

    if (healthResult._tag === "Left") {
      return res.status(503).json({
        status: "unhealthy",
        error: healthResult.left.message,
        timestamp: new Date().toISOString(),
      });
    }

    const health = healthResult.right;

    if (detailed) {
      // Include additional metrics
      const metrics = oracle.getMetrics();
      const circuitStatus = oracle.getCircuitBreakerStatus("ETH-USD"); // Sample feed

      res.json({
        ...health,
        metrics,
        circuitBreaker: {
          sampleFeed: circuitStatus,
        },
        supportedFeeds: oracle.getSupportedFeeds(),
      });
    } else {
      res.json({
        status: health.status,
        uptime: health.metrics.uptime,
        healthyFeeds: health.metrics.healthyFeeds,
        totalFeeds: health.metrics.totalFeeds,
        averageConfidence: health.metrics.averageConfidence,
        timestamp: new Date(health.timestamp * 1000).toISOString(),
      });
    }
  } catch (error) {
    console.error("Oracle health endpoint error:", error);

    res.status(500).json({
      status: "error",
      error: "Health check failed",
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/oracle/feeds
 * Get list of supported feeds
 */
router.get("/feeds", async (req: Request, res: Response) => {
  try {
    const oracle = await initializeOracleService();

    if (!oracle) {
      return res.json({
        feeds: Object.keys(FALLBACK_PRICES),
        source: "fallback",
        timestamp: new Date().toISOString(),
      });
    }

    const supportedFeeds = oracle.getSupportedFeeds();
    const feedConfigs = supportedFeeds.map((feedId) => {
      const config = oracle.getFeedConfig(feedId);
      return config._tag === "Some"
        ? {
            feedId,
            ...config.value,
          }
        : {
            feedId,
            description: `${feedId} price feed`,
            isActive: true,
          };
    });

    res.json({
      feeds: feedConfigs,
      total: feedConfigs.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Oracle feeds endpoint error:", error);

    res.status(500).json({
      error: "Failed to fetch supported feeds",
      feeds: Object.keys(FALLBACK_PRICES),
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/oracle/validate
 * Validate price data
 */
router.post("/validate", async (req: Request, res: Response) => {
  try {
    const oracle = await initializeOracleService();

    if (!oracle) {
      return res.status(503).json({
        success: false,
        error: "Oracle service not available",
      });
    }

    const validationResult = oracle.validatePrice(req.body);

    if (validationResult._tag === "Left") {
      return res.status(400).json({
        success: false,
        error: validationResult.left.message,
      });
    }

    res.json({
      success: true,
      validation: validationResult.right,
    });
  } catch (error) {
    console.error("Oracle validation endpoint error:", error);

    res.status(500).json({
      success: false,
      error: "Validation failed",
    });
  }
});

export default router;
