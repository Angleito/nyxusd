import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { createClient } from "redis";

// Import routes
import oracleRoutes from "./routes/oracle";
import aiRoutes from "./routes/ai";
import enhancedAIRoutes from "./routes/enhancedAI";
import voiceRoutes from "./routes/voice";
import memoryRoutes from "./routes/memory";

// Import CDP operations
import { NyxUSD_CDP_SDK, CDPCreationParams, CDP } from '@nyxusd/cdp-sdk';

// Initialize CDP SDK with default configuration
const cdpSDK = new NyxUSD_CDP_SDK({
  chain: process.env.DEFAULT_CHAIN || 'ethereum',
  config: {
    chainId: parseInt(process.env.CHAIN_ID || '1'),
    rpcUrl: process.env.RPC_URL || 'https://mainnet.infura.io/v3/demo',
    contracts: {
      cdpManager: process.env.CDP_MANAGER_CONTRACT || '0x0000000000000000000000000000000000000001',
      nyxUSD: process.env.NYXUSD_CONTRACT || '0x0000000000000000000000000000000000000002',
      oracle: process.env.ORACLE_CONTRACT || '0x0000000000000000000000000000000000000003',
    }
  }
});

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan("combined"));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Redis client for caching
let redisClient: any;
if (process.env.NODE_ENV === "production") {
  redisClient = createClient({
    url: process.env.REDIS_URL || "redis://redis:6379",
  });
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
    services: {
      api: "running",
      redis: redisClient?.isReady ? "connected" : "disconnected",
    },
  });
});

// CDP operations endpoints
app.get("/api/cdp", async (req, res) => {
  try {
    // Get system stats from the CDP SDK
    const statsResult = await cdpSDK.getSystemStats();
    
    if (!statsResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch CDP system stats",
        error: statsResult.error
      });
    }
    
    // Get CDPs by owner if owner parameter is provided
    const { owner } = req.query;
    let cdpData: CDP[] = [];
    
    if (owner && typeof owner === 'string') {
      const ownerResult = await cdpSDK.getCDPsByOwner(owner);
      if (ownerResult.success) {
        cdpData = ownerResult.data;
      }
    }
    
    res.json({
      cdps: cdpData,
      totalCDPs: statsResult.data.totalCDPs,
      totalCollateralValue: statsResult.data.totalCollateral,
      totalDebtIssued: statsResult.data.totalDebt,
      ...statsResult.data
    });
  } catch (error) {
    console.error("CDP API Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

app.post("/api/cdp/create", async (req, res) => {
  try {
    const { collateralType, collateralAmount, debtAmount, owner } = req.body;

    // Validate required parameters
    if (!collateralType || !collateralAmount || !debtAmount || !owner) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters",
        required: ["collateralType", "collateralAmount", "debtAmount", "owner"]
      });
    }

    // Create CDP using the SDK
    // Note: In a real implementation, you would need to provide proper config values
    const creationParams: CDPCreationParams = {
      owner,
      collateralType,
      collateralAmount: BigInt(collateralAmount),
      debtAmount: BigInt(debtAmount),
      config: {
        minCollateralizationRatio: 15000, // 150%
        liquidationRatio: 13000, // 130%
        stabilityFeeRate: 0.05, // 5% annual
        liquidationPenalty: 0.1, // 10%
        debtCeiling: BigInt("1000000000000000000000000"), // 1M NYXUSD
        minDebtAmount: BigInt("100000000000000000000"), // 100 NYXUSD
      }
    };

    const result = await cdpSDK.createCDP(creationParams);

    if (result.success) {
      res.status(201).json({
        success: true,
        cdp: result.data,
        message: "CDP created successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "CDP creation failed",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("CDP Creation Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

app.post("/api/cdp/:id/deposit", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    // Validate required parameters
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: amount"
      });
    }

    // In a real implementation, you would need to provide proper deposit parameters
    // For now, we'll mock the deposit operation
    const result = await cdpSDK.depositCollateral({
      cdpId: id,
      depositAmount: BigInt(amount),
      // Additional parameters would be required in a real implementation
    });

    if (result.success) {
      res.json({
        success: true,
        cdpId: id,
        depositAmount: amount,
        ...result.data,
        message: "Collateral deposited successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        cdpId: id,
        message: "Collateral deposit failed",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("CDP Deposit Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

app.post("/api/cdp/:id/withdraw", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    // Validate required parameters
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: amount"
      });
    }

    // In a real implementation, you would need to provide proper withdrawal parameters
    // For now, we'll mock the withdrawal operation
    const result = await cdpSDK.withdrawCollateral({
      cdpId: id,
      withdrawAmount: BigInt(amount),
      // Additional parameters would be required in a real implementation
    });

    if (result.success) {
      res.json({
        success: true,
        cdpId: id,
        withdrawAmount: amount,
        ...result.data,
        message: "Collateral withdrawn successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        cdpId: id,
        message: "Collateral withdrawal failed",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("CDP Withdraw Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

app.post("/api/cdp/:id/mint", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    // Validate required parameters
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: amount"
      });
    }

    // In a real implementation, you would need to provide proper mint parameters
    // For now, we'll mock the mint operation
    const result = await cdpSDK.mintDebt({
      cdpId: id,
      mintAmount: BigInt(amount),
      // Additional parameters would be required in a real implementation
    });

    if (result.success) {
      res.json({
        success: true,
        cdpId: id,
        mintAmount: amount,
        ...result.data,
        message: "nyxUSD minted successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        cdpId: id,
        message: "nyxUSD minting failed",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("CDP Mint Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

app.post("/api/cdp/:id/burn", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    // Validate required parameters
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: amount"
      });
    }

    // In a real implementation, you would need to provide proper burn parameters
    // For now, we'll mock the burn operation
    const result = await cdpSDK.burnDebt({
      cdpId: id,
      burnAmount: BigInt(amount),
      // Additional parameters would be required in a real implementation
    });

    if (result.success) {
      res.json({
        success: true,
        cdpId: id,
        burnAmount: amount,
        ...result.data,
        message: "nyxUSD burned successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        cdpId: id,
        message: "nyxUSD burning failed",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("CDP Burn Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Oracle routes
app.use("/api/oracle", oracleRoutes);

// AI routes
app.use("/api/ai", aiRoutes);

// Enhanced AI routes with MCP integration
app.use("/api/ai/enhanced", enhancedAIRoutes);

// Voice routes for ElevenLabs integration
app.use("/api/voice", voiceRoutes);

// Memory routes for Vercel KV/Blob storage
app.use("/api/memory", memoryRoutes);

// Import token and swap services
import { coingeckoService } from './services/coingeckoService';
import { getOdosSwapService } from './services/odosSwapService';

// Token API endpoints
app.get("/api/tokens/base", async (req, res) => {
  try {
    const { limit = '100' } = req.query;
    const tokenLimit = Math.min(parseInt(limit as string, 10) || 100, 500);

    console.log(`🔍 Fetching comprehensive Base chain tokens (limit: ${tokenLimit})...`);
    
    // Get multiple pages of market data to capture more tokens
    const pages = Math.ceil(tokenLimit / 250); // CoinGecko max per page is 250
    const allTokenPromises = [];
    
    for (let page = 1; page <= pages; page++) {
      allTokenPromises.push(coingeckoService.getMarketData(page, Math.min(250, tokenLimit - (page - 1) * 250)));
    }
    
    const allTokenPages = await Promise.allSettled(allTokenPromises);
    let allMarketTokens: any[] = [];
    
    allTokenPages.forEach((page, index) => {
      if (page.status === 'fulfilled' && Array.isArray(page.value)) {
        allMarketTokens.push(...page.value);
        console.log(`✅ Page ${index + 1}: Found ${page.value.length} tokens`);
      } else {
        console.warn(`⚠️ Page ${index + 1} failed:`, page.status === 'rejected' ? page.reason : 'No data');
      }
    });

    console.log(`📊 Total market tokens fetched: ${allMarketTokens.length}`);

    // Essential Base tokens (always include these)
    const essentialBaseTokens = [
      { symbol: 'ETH', id: 'ethereum', address: '0x0000000000000000000000000000000000000000', decimals: 18, name: 'Ethereum' },
      { symbol: 'WETH', id: 'weth', address: '0x4200000000000000000000000000000000000006', decimals: 18, name: 'Wrapped Ether' },
      { symbol: 'USDC', id: 'usd-coin', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, name: 'USD Coin' },
      { symbol: 'USDT', id: 'tether', address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', decimals: 6, name: 'Tether USD' },
      { symbol: 'DAI', id: 'dai', address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', decimals: 18, name: 'Dai Stablecoin' },
      { symbol: 'AERO', id: 'aerodrome-finance', address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', decimals: 18, name: 'Aerodrome Finance' },
      { symbol: 'MORPHO', id: 'morpho', address: '0xbaa5cc21fd487b8fcc2f632f3f4e8d37262a0842', decimals: 18, name: 'Morpho' },
      { symbol: 'BRETT', id: 'brett', address: '0x532f27101965dd16442E59d40670FaF5ebb142E4', decimals: 18, name: 'Brett' },
      { symbol: 'DEGEN', id: 'degen-base', address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', decimals: 18, name: 'Degen' },
      { symbol: 'HIGHER', id: 'higher', address: '0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe', decimals: 18, name: 'Higher' },
      { symbol: 'HYUSD', id: 'high-yield-usd', address: '0x4f5fbc1ce8b23c6ae46c26bbb0c43e68a425bdc1', decimals: 18, name: 'High Yield USD' },
      { symbol: 'CBETH', id: 'coinbase-wrapped-staked-eth', address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', decimals: 18, name: 'Coinbase Wrapped Staked ETH' },
      { symbol: 'WSTETH', id: 'wrapped-steth', address: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452', decimals: 18, name: 'Wrapped liquid staked Ether 2.0' },
    ];

    // Combine essential tokens with market data
    const tokens = essentialBaseTokens.map(token => ({
      id: token.id,
      symbol: token.symbol,
      name: token.name,
      platforms: { base: token.address },
      decimals: token.decimals,
      current_price: 0,
      market_cap: 0,
      market_cap_rank: 999
    }));

    // Add additional market tokens if available
    const existingSymbols = new Set(essentialBaseTokens.map(t => t.symbol.toLowerCase()));
    allMarketTokens.slice(0, Math.max(0, tokenLimit - tokens.length)).forEach(token => {
      if (!existingSymbols.has(token.symbol.toLowerCase())) {
        tokens.push({
          ...token,
          platforms: { base: '0x0000000000000000000000000000000000000000' }, // Placeholder
          decimals: 18
        });
      }
    });

    console.log(`✅ Returning ${tokens.length} Base tokens`);

    return res.status(200).json({
      success: true,
      tokens: tokens.slice(0, tokenLimit)
    });

  } catch (error) {
    console.error('Error fetching Base tokens:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch Base tokens'
    });
  }
});

// Odos API endpoints
app.get("/api/odos/tokens/:chainId", async (req, res) => {
  try {
    const { chainId } = req.params;
    const parsedChainId = chainId ? parseInt(chainId as string, 10) : 8453;

    console.log(`🔍 Fetching Odos tokens for chain ${parsedChainId}...`);

    const odosService = getOdosSwapService(parsedChainId);
    
    // Check if Odos is available for this chain
    const isAvailable = await odosService.isAvailable();
    if (!isAvailable) {
      console.warn(`⚠️ Odos not available for chain ${parsedChainId}`);
      return res.status(200).json([]);
    }

    // Get supported tokens
    const tokens = await odosService.getSupportedTokens();
    
    console.log(`✅ Odos returned ${tokens.length} tokens for chain ${parsedChainId}`);
    
    return res.status(200).json(tokens);

  } catch (error) {
    console.error('Error fetching Odos tokens:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch Odos tokens' 
    });
  }
});

// System information endpoints
app.get("/api/system", (req, res) => {
  res.json({
    totalCollateral: "250000000000000000000000", // $250,000
    totalDebt: "180000000000000000000000", // $180,000
    systemCollateralizationRatio: 139, // 139%
    stabilityFeeRate: 500, // 5% APR in basis points
    liquidationRatio: 150, // 150%
    emergencyShutdown: false,
    supportedCollaterals: [
      {
        type: "WETH",
        name: "Wrapped Ethereum",
        decimals: 18,
        liquidationRatio: 150,
        stabilityFee: 500,
        debtCeiling: "50000000000000000000000000", // $50M
      },
      {
        type: "WBTC",
        name: "Wrapped Bitcoin",
        decimals: 8,
        liquidationRatio: 150,
        stabilityFee: 300,
        debtCeiling: "25000000000000000000000000", // $25M
      },
    ],
  });
});

// Oracle price feeds (real Chainlink integration)
app.get("/api/oracle/prices", async (req, res) => {
  try {
    // Import oracle service (dynamic import to handle potential build issues)
    const {
      createOracleServiceFacade,
      DEFAULT_AGGREGATION_STRATEGY,
      DEFAULT_CONSENSUS_CONFIG,
    } = await import("@nyxusd/oracle-service");

    // Create oracle service configuration
    const oracleConfig = {
      primaryOracle: {
        network: process.env.NODE_ENV === "production" ? "ethereum" : "sepolia",
        provider:
          process.env.ORACLE_RPC_URL || "https://sepolia.infura.io/v3/demo",
        defaultTimeout: 5000,
        defaultMaxStaleness: 3600,
        defaultMinConfidence: 95,
        cacheTtl: 60,
        retry: {
          maxAttempts: 3,
          delayMs: 1000,
          backoffMultiplier: 2,
        },
      },
      enableFallback: true,
      aggregationStrategy: DEFAULT_AGGREGATION_STRATEGY,
      consensusConfig: DEFAULT_CONSENSUS_CONFIG,
      cache: {
        enabled: true,
        ttl: 60,
      },
    };

    // Create oracle service
    const oracleService = createOracleServiceFacade(oracleConfig);

    // Fetch prices for supported feeds
    const supportedFeeds = [
      "ETH-USD",
      "BTC-USD",
      "LINK-USD",
      "USDC-USD",
      "DAI-USD",
    ];
    const pricePromises = supportedFeeds.map(async (feedId) => {
      try {
        const query = { feedId, allowCached: true, timeout: 5000 };
        const result = await oracleService.fetchPrice(query)();

        if (result._tag === "Right") {
          const priceData = result.right.data;
          // Convert price to human-readable format
          const price =
            Number(priceData.price) / Math.pow(10, priceData.decimals);
          return {
            feedId,
            price: price.toFixed(2),
            confidence: priceData.confidence,
            timestamp: priceData.timestamp,
            source: priceData.source,
          };
        } else {
          console.warn(`Failed to fetch price for ${feedId}:`, result.left);
          return null;
        }
      } catch (error) {
        console.warn(`Error fetching price for ${feedId}:`, error);
        return null;
      }
    });

    const priceResults = await Promise.all(pricePromises);
    const validPrices = priceResults.filter((p) => p !== null);

    // Format response to match existing API structure
    const prices: Record<string, string> = {};
    validPrices.forEach((price) => {
      if (price) {
        const displayPair = price.feedId.replace("-", "/");
        prices[displayPair] = price.price;
      }
    });

    // Add fallback prices if oracle fails
    if (Object.keys(prices).length === 0) {
      console.warn("All oracle requests failed, using fallback prices");
      prices["ETH/USD"] = "2450.50";
      prices["BTC/USD"] = "42150.75";
      prices["LINK/USD"] = "14.50";
      prices["USDC/USD"] = "1.00";
      prices["DAI/USD"] = "0.999";
    }

    res.json({
      timestamp: new Date().toISOString(),
      prices,
      source: validPrices.length > 0 ? "chainlink" : "fallback",
      oracleHealth: validPrices.length / supportedFeeds.length,
    });
  } catch (error) {
    console.error("Oracle service error:", error);

    // Fallback to mock data on error
    res.json({
      timestamp: new Date().toISOString(),
      prices: {
        "ETH/USD": "2450.50",
        "BTC/USD": "42150.75",
        "LINK/USD": "14.50",
        "USDC/USD": "1.00",
        "DAI/USD": "0.999",
      },
      source: "fallback",
      error: "Oracle service unavailable",
    });
  }
});

// Error handling middleware
app.use(
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("API Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  },
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Start server
async function startServer() {
  try {
    if (redisClient) {
      await redisClient.connect();
      console.log("Connected to Redis");
    }

    app.listen(PORT, () => {
      console.log(`🚀 NyxUSD API server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📈 CDP API: http://localhost:${PORT}/api/cdp`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

export default app;
