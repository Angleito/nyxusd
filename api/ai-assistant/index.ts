import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { productionEnhancedService as enhancedAIService, EnhancedAIContext } from '../src/services/productionEnhancedService';

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const USE_MOCK_AI = process.env['USE_MOCK_AI'] === "true";

  try {
    const validatedData = requestSchema.parse(req.body);
    const { message, sessionId, context, enableCryptoTools } = validatedData;

    console.log("Enhanced chat request with memory and Langchain", {
      sessionId,
      conversationStep: context.conversationStep,
      enableCryptoTools,
      hasWalletData: !!context.walletData,
      hasMemoryContext: !!context.memoryContext,
      hasConversationSummary: !!context.conversationSummary,
    });

    if (USE_MOCK_AI) {
      const mockResponse = {
        message: `Mock response with memory and tailored prompts: I understand "${message}". ${context.memoryContext ? 'I remember our previous conversation.' : ''} ${context.conversationSummary ? `Summary: ${context.conversationSummary}` : ''} Crypto tools ${enableCryptoTools ? 'enabled' : 'disabled'}.`,
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

    // Generate response with Langchain and tailored prompts
    const response = await enhancedAIService.generateResponse(enhancedContext);

    console.log("AI Response with tailored prompts generated", {
      sessionId,
      toolsUsed: response.toolsUsed?.length || 0,
      hasRecommendations: !!response.recommendations,
      responseLength: response.message?.length || 0,
      usedMemoryContext: !!context.memoryContext,
      usedLangchain: true,
    });

    res.status(200).json(response);
  } catch (error: any) {
    console.error("Error in ai-assistant endpoint", {
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