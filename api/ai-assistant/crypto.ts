import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { productionEnhancedService as enhancedAIService } from '../src/services/productionEnhancedService';

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    res.status(200).json(response);
  } catch (error: any) {
    console.error("Crypto tools error", { error: error.message });
    
    if (error.name === "ZodError") {
      return res.status(400).json({
        error: "Invalid request",
        details: error.errors,
      });
    }

    res.status(500).json({ 
      error: "Failed to execute crypto action",
      message: error.message 
    });
  }
}