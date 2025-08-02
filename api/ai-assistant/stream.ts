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

  try {
    const validatedData = requestSchema.parse(req.body);
    const { message, sessionId, context, enableCryptoTools } = validatedData;

    console.log('Streaming request with memory', {
      sessionId,
      hasMemoryContext: !!context.memoryContext,
      hasConversationSummary: !!context.conversationSummary,
    });

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
    res.end();
  } catch (error: any) {
    console.error("Streaming error:", error);
    
    if (error.name === "ZodError") {
      return res.status(400).json({
        error: "Invalid request",
        details: error.errors,
      });
    }

    res.status(500).json({ 
      error: "Streaming failed",
      message: error.message 
    });
  }
}