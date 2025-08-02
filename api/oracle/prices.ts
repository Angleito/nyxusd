import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from "zod";

// Dynamic imports to handle potential build issues during development
let oracleService: any = null;
let OracleServiceFacade: any = null;
let createOracleServiceFacade: any = null;
let DEFAULT_AGGREGATION_STRATEGY: any = null;
let DEFAULT_CONSENSUS_CONFIG: any = null;

// Initialize oracle service lazily
const initializeOracleService = async () => {
  if (!oracleService) {
    try {
      const oracleModule = await import("@nyxusd/oracle-service");
      OracleServiceFacade = oracleModule.OracleServiceFacade;
      createOracleServiceFacade = oracleModule.createOracleServiceFacade;
      DEFAULT_AGGREGATION_STRATEGY = oracleModule.DEFAULT_AGGREGATION_STRATEGY;
      DEFAULT_CONSENSUS_CONFIG = oracleModule.DEFAULT_CONSENSUS_CONFIG;

      const oracleConfig = {
        primaryOracle: {
          network:
            process.env.NODE_ENV === "production" ? "ethereum" : "sepolia",
          provider:
            process.env.ORACLE_RPC_URL || "https://sepolia.infura.io/v3/demo",
          defaultTimeout: parseInt(process.env.ORACLE_TIMEOUT || "5000", 10),
          defaultMaxStaleness: parseInt(
            process.env.ORACLE_MAX_STALENESS || "3600",
            10,
          ),
          defaultMinConfidence: parseFloat(
            process.env.ORACLE_MIN_CONFIDENCE || "95",
          ),
          cacheTtl: parseInt(process.env.ORACLE_CACHE_TTL || "60", 10),
          retry: {
            maxAttempts: 3,
            delayMs: 1000,
            backoffMultiplier: 2,
          },
        },
        enableFallback: process.env.ORACLE_ENABLE_FALLBACK !== "false",
        aggregationStrategy: DEFAULT_AGGREGATION_STRATEGY,
        consensusConfig: DEFAULT_CONSENSUS_CONFIG,
        cache: {
          enabled: process.env.ORACLE_CACHE_ENABLED !== "false",
          ttl: parseInt(process.env.ORACLE_CACHE_TTL || "60", 10),
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

/**
 * Query parameter schemas
 */
const PriceQuerySchema = z.object({
  feeds: z.string().optional(),
  format: z.enum(["compact", "detailed"]).default("compact"),
  maxStaleness: z.string().transform(Number).optional(),
  minConfidence: z.string().transform(Number).optional(),
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

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}