import express, { Request, Response } from "express";
import { z } from "zod";
import dotenv from "dotenv";
import { aiLogger, aiMetrics, performanceLogger, aiRequestLogger } from "../utils/logger";
import { productionEnhancedService as enhancedAIService, EnhancedAIContext } from "../services/productionEnhancedService";

dotenv.config();

const router = express.Router();

const USE_MOCK_AI = process.env.USE_MOCK_AI === "true";

const requestSchema = z.object({
  message: z.string().min(1).max(1000),
  sessionId: z.string(),
  context: z.object({
    conversationStep: z.string().optional(),
    userProfile: z.object({
      experience: z.string().optional(),
      riskTolerance: z.string().optional(),
      investmentGoals: z.array(z.string()).optional(),
    }).optional(),
    walletData: z.object({
      address: z.string().optional(),
      balance: z.number().optional(),
      holdings: z.array(z.object({
        symbol: z.string(),
        amount: z.number(),
        purchasePrice: z.number().optional(),
      })).optional(),
    }).optional(),
  }),
  enableCryptoTools: z.boolean().default(true),
});

const cryptoRequestSchema = z.object({
  sessionId: z.string(),
  action: z.enum(['price', 'trends', 'portfolio', 'defi', 'market_analysis']),
  params: z.object({
    symbol: z.string().optional(),
    timeframe: z.string().optional(),
    holdings: z.array(z.object({
      symbol: z.string(),
      amount: z.number(),
      purchasePrice: z.number().optional(),
    })).optional(),
    protocol: z.string().optional(),
    chain: z.string().optional(),
  }).optional(),
});

router.use(aiRequestLogger);

router.post("/chat", async (req: Request, res: Response) => {
  const timer = performanceLogger.startTimer("enhanced-ai-chat-request");

  try {
    const validatedData = requestSchema.parse(req.body);
    const { message, sessionId, context, enableCryptoTools } = validatedData;

    aiLogger.info("Enhanced chat request", {
      sessionId,
      conversationStep: context.conversationStep,
      enableCryptoTools,
      hasWalletData: !!context.walletData,
    });

    if (USE_MOCK_AI) {
      const mockResponse = {
        message: `Mock response: I understand "${message}". Crypto tools ${enableCryptoTools ? 'enabled' : 'disabled'}.`,
        toolsUsed: enableCryptoTools ? ['mock_tool'] : undefined,
      };
      return res.json(mockResponse);
    }

    const enhancedContext: EnhancedAIContext = {
      sessionId,
      userMessage: message,
      conversationStep: context.conversationStep,
      userProfile: context.userProfile,
      walletData: context.walletData,
      enableCryptoTools,
    };

    const response = await enhancedAIService.generateResponse(enhancedContext);

    if (response.toolsUsed) {
      aiMetrics.logIntent({ action: 'crypto_tools_used', confidence: 1 }, 1);
    }

    timer.end({
      sessionId,
      toolsUsed: response.toolsUsed?.length || 0,
      hasRecommendations: !!response.recommendations,
    });

    res.json(response);
  } catch (error: any) {
    aiMetrics.logError(error, {
      endpoint: "/enhanced/chat",
      sessionId: req.body?.sessionId,
    });
    timer.end({ error: true, errorType: error.name });

    if (error.name === "ZodError") {
      aiLogger.error("Validation error", { errors: error.errors });
      return res.status(400).json({
        error: "Invalid request",
        details: error.errors,
      });
    }

    aiLogger.error("Error in enhanced chat endpoint", {
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      error: "Internal server error",
      message: "Failed to process your request. Please try again.",
    });
  }
});

router.post("/chat/stream", async (req: Request, res: Response) => {
  try {
    const validatedData = requestSchema.parse(req.body);
    const { message, sessionId, context, enableCryptoTools } = validatedData;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const enhancedContext: EnhancedAIContext = {
      sessionId,
      userMessage: message,
      conversationStep: context.conversationStep,
      userProfile: context.userProfile,
      walletData: context.walletData,
      enableCryptoTools,
    };

    await enhancedAIService.streamResponse(
      enhancedContext,
      (chunk: string) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }
    );

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    aiLogger.error("Streaming error:", error);
    res.status(500).json({ error: "Streaming failed" });
  }
});

router.post("/crypto", async (req: Request, res: Response) => {
  const timer = performanceLogger.startTimer("crypto-tools-request");

  try {
    const { sessionId, action, params } = cryptoRequestSchema.parse(req.body);

    aiLogger.info("Crypto tools request", { sessionId, action, params });

    let response;

    switch (action) {
      case 'price':
        if (!params?.symbol) {
          return res.status(400).json({ error: "Symbol required for price action" });
        }
        response = await enhancedAIService.generateResponse({
          sessionId,
          userMessage: `What is the current price of ${params.symbol}?`,
          enableCryptoTools: true,
        });
        break;

      case 'trends':
        response = await enhancedAIService.generateResponse({
          sessionId,
          userMessage: `Show me market trends for ${params?.timeframe || '24h'}`,
          enableCryptoTools: true,
        });
        break;

      case 'portfolio':
        if (!params?.holdings || params.holdings.length === 0) {
          return res.status(400).json({ error: "Holdings required for portfolio analysis" });
        }
        response = await enhancedAIService.generateResponse({
          sessionId,
          userMessage: `Analyze this portfolio: ${JSON.stringify(params.holdings)}`,
          enableCryptoTools: true,
          walletData: { holdings: params.holdings }
        });
        break;

      case 'defi':
        response = await enhancedAIService.generateResponse({
          sessionId,
          userMessage: `Show me DeFi opportunities ${params?.chain ? `on ${params.chain}` : ''}`,
          enableCryptoTools: true,
        });
        break;

      case 'market_analysis':
        response = await enhancedAIService.generateResponse({
          sessionId,
          userMessage: 'Give me a comprehensive market analysis',
          enableCryptoTools: true,
        });
        break;

      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    timer.end({ sessionId, action });
    res.json(response);
  } catch (error: any) {
    timer.end({ error: true });
    aiLogger.error("Crypto tools error", { error: error.message });
    res.status(500).json({ error: "Failed to execute crypto action" });
  }
});

router.post("/portfolio/analyze", async (req: Request, res: Response) => {
  try {
    const { sessionId, holdings } = req.body;

    if (!holdings || holdings.length === 0) {
      return res.status(400).json({ error: "Holdings required" });
    }

    const response = await enhancedAIService.generateResponse({
      sessionId,
      userMessage: `Analyze this portfolio: ${JSON.stringify(holdings)}`,
      enableCryptoTools: true,
      walletData: { holdings }
    });
    res.json(response);
  } catch (error: any) {
    aiLogger.error("Portfolio analysis error", { error });
    res.status(500).json({ error: "Portfolio analysis failed" });
  }
});

router.get("/defi/opportunities", async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.sessionId as string || 'default';
    const chain = req.query.chain as string;

    const response = await enhancedAIService.generateResponse({
      sessionId,
      userMessage: `Show me DeFi opportunities ${chain ? `on ${chain}` : ''}`,
      enableCryptoTools: true,
    });
    res.json(response);
  } catch (error: any) {
    aiLogger.error("DeFi opportunities error", { error });
    res.status(500).json({ error: "Failed to fetch DeFi opportunities" });
  }
});

router.get("/market/analysis", async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.sessionId as string || 'default';
    
    const response = await enhancedAIService.generateResponse({
      sessionId,
      userMessage: 'Give me a comprehensive market analysis',
      enableCryptoTools: true,
    });
    res.json(response);
  } catch (error: any) {
    aiLogger.error("Market analysis error", { error });
    res.status(500).json({ error: "Failed to generate market analysis" });
  }
});

router.post("/reset/:sessionId", (req: Request, res: Response) => {
  const { sessionId } = req.params;

  enhancedAIService.clearSession(sessionId);

  res.json({ success: true, message: "Session reset" });
});

router.get("/health", async (req: Request, res: Response) => {
  const status = await enhancedAIService.getServiceStatus();
  const integrationTest = await enhancedAIService.testIntegration();
  
  res.json({
    status: integrationTest ? "healthy" : "degraded",
    service: "Enhanced AI with MCP",
    ...status,
    integrationTest,
    useMockAI: USE_MOCK_AI,
  });
});

router.get("/tools", (req: Request, res: Response) => {
  res.json({
    tools: [
      {
        name: "crypto_price",
        description: "Get current cryptocurrency prices",
        params: ["symbol"],
      },
      {
        name: "market_trends",
        description: "Analyze market trends and sentiment",
        params: ["timeframe"],
      },
      {
        name: "portfolio_analysis",
        description: "Analyze portfolio risk and performance",
        params: ["holdings"],
      },
      {
        name: "defi_rates",
        description: "Get DeFi yield rates",
        params: ["protocol", "chain"],
      },
    ],
    mcp: {
      connected: true,
      server: "crypto-intelligence-mcp",
    },
  });
});

setInterval(() => {
  enhancedAIService.getServiceStatus().then(status => {
    if (status.activeSessions > 100) {
      aiLogger.warn("High number of active sessions", { count: status.activeSessions });
    }
  });
}, 60000);

export default router;