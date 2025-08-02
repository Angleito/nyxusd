import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { productionEnhancedService as enhancedAIService, EnhancedAIContext } from './src/services/productionEnhancedService';

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
    memoryContext: z.string().optional(),
    conversationSummary: z.string().optional(),
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const USE_MOCK_AI = process.env['USE_MOCK_AI'] === "true";

  // Extract the path after /api/ai-assistant
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const path = url.pathname.replace('/api/ai-assistant', '');

  console.log('AI Assistant request:', {
    path,
    method: req.method,
    hasMockAI: USE_MOCK_AI,
  });

  // Handle different endpoints
  try {
    // Main chat endpoint (both root and /chat)
    if ((path === '' || path === '/' || path === '/chat') && req.method === 'POST') {
      const validatedData = requestSchema.parse(req.body);
      const { message, sessionId, context, enableCryptoTools } = validatedData;

      console.log("Enhanced chat request with memory", {
        sessionId,
        conversationStep: context.conversationStep,
        enableCryptoTools,
        hasWalletData: !!context.walletData,
        hasMemoryContext: !!context.memoryContext,
        hasConversationSummary: !!context.conversationSummary,
      });

      if (USE_MOCK_AI) {
        const mockResponse = {
          message: `Mock response with memory: I understand "${message}". ${context.memoryContext ? 'I remember our previous conversation.' : ''} ${context.conversationSummary ? `Summary: ${context.conversationSummary}` : ''} Crypto tools ${enableCryptoTools ? 'enabled' : 'disabled'}.`,
          toolsUsed: enableCryptoTools ? ['mock_tool'] : undefined,
          conversationStep: context.conversationStep,
        };
        return res.status(200).json(mockResponse);
      }

      const enhancedContext: EnhancedAIContext = {
        sessionId,
        userMessage: message,
        conversationStep: context.conversationStep,
        userProfile: context.userProfile,
        walletData: context.walletData,
        enableCryptoTools,
        memoryContext: context.memoryContext,
        conversationSummary: context.conversationSummary,
      };

      const response = await enhancedAIService.generateResponse(enhancedContext);

      console.log("AI Response with tailored prompts generated", {
        sessionId,
        toolsUsed: response.toolsUsed?.length || 0,
        hasRecommendations: !!response.recommendations,
        responseLength: response.message?.length || 0,
        usedMemoryContext: !!context.memoryContext,
      });

      return res.status(200).json(response);
    }

    // Stream endpoint
    if (path === '/stream' && req.method === 'POST') {
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
        memoryContext: context.memoryContext,
        conversationSummary: context.conversationSummary,
      };

      await enhancedAIService.streamResponse(
        enhancedContext,
        (chunk: string) => {
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
      );

      res.write("data: [DONE]\n\n");
      return res.end();
    }

    // Crypto tools endpoint
    if (path === '/crypto' && req.method === 'POST') {
      const { sessionId, action, params } = cryptoRequestSchema.parse(req.body);

      console.log("Crypto tools request", { sessionId, action, params });

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

      return res.status(200).json(response);
    }

    // Portfolio analysis endpoint
    if (path === '/portfolio/analyze' && req.method === 'POST') {
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
      
      return res.status(200).json(response);
    }

    // DeFi opportunities endpoint
    if (path === '/defi/opportunities' && req.method === 'GET') {
      const sessionId = req.query.sessionId as string || 'default';
      const chain = req.query.chain as string;

      const response = await enhancedAIService.generateResponse({
        sessionId,
        userMessage: `Show me DeFi opportunities ${chain ? `on ${chain}` : ''}`,
        enableCryptoTools: true,
      });
      
      return res.status(200).json(response);
    }

    // Market analysis endpoint
    if (path === '/market/analysis' && req.method === 'GET') {
      const sessionId = req.query.sessionId as string || 'default';
      
      const response = await enhancedAIService.generateResponse({
        sessionId,
        userMessage: 'Give me a comprehensive market analysis',
        enableCryptoTools: true,
      });
      
      return res.status(200).json(response);
    }

    // Reset session endpoint
    if (path.startsWith('/reset/') && req.method === 'POST') {
      const sessionId = path.replace('/reset/', '');
      enhancedAIService.clearSession(sessionId);
      return res.status(200).json({ success: true, message: "Session reset" });
    }

    // Health check endpoint
    if (path === '/health' && req.method === 'GET') {
      const status = await enhancedAIService.getServiceStatus();
      const integrationTest = await enhancedAIService.testIntegration();
      
      return res.status(200).json({
        status: integrationTest ? "healthy" : "degraded",
        service: "Enhanced AI with MCP and Langchain",
        ...status,
        integrationTest,
        useMockAI: USE_MOCK_AI,
        memoryEnabled: true,
        tailoredPrompts: true,
      });
    }

    // Tools endpoint
    if (path === '/tools' && req.method === 'GET') {
      return res.status(200).json({
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
        langchain: {
          enabled: true,
          memorySupport: true,
          tailoredPrompts: true,
        },
      });
    }

    // 404 for unknown paths
    return res.status(404).json({ error: `Endpoint not found: ${path}` });

  } catch (error: any) {
    console.error("Error in ai-assistant endpoint", {
      path,
      error: error.message,
      stack: error.stack,
      name: error.name,
    });

    if (error.name === "ZodError") {
      return res.status(400).json({
        error: "Invalid request",
        details: error.errors,
      });
    }

    res.status(500).json({
      error: "Internal server error",
      message: "Failed to process your request. Please try again.",
    });
  }
}