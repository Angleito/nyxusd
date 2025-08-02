import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from "zod";

const USE_MOCK_AI = process.env.USE_MOCK_AI === "true" || process.env.OPENROUTER_API_KEY === undefined;

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

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

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

    if (USE_MOCK_AI) {
      const mockResponse = {
        message: `I understand you're asking about "${message}". As your personal AI assistant, I can help you with crypto investments, portfolio analysis, and DeFi strategies. ${enableCryptoTools ? 'I have crypto tools enabled to provide real-time data.' : ''} What specific aspect would you like to explore?`,
        toolsUsed: enableCryptoTools ? ['mock_price_tool'] : undefined,
        recommendations: context.userProfile ? [
          "Based on your profile, consider diversifying your portfolio",
          "Look into yield farming opportunities on established protocols",
          "Consider dollar-cost averaging for long-term positions"
        ] : undefined,
      };
      return res.json(mockResponse);
    }

    // If OpenRouter API key is configured, use the real service
    // This would require importing and using the actual service
    // For now, returning mock response
    const response = {
      message: `Processing your request: "${message}"`,
      toolsUsed: enableCryptoTools ? ['analysis_tool'] : undefined,
    };

    res.json(response);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        error: "Invalid request",
        details: error.errors,
      });
    }

    console.error("Error in enhanced chat endpoint:", error);

    res.status(500).json({
      error: "Internal server error",
      message: "Failed to process your request. Please try again.",
    });
  }
}