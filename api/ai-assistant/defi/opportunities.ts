import type { VercelRequest, VercelResponse } from '@vercel/node';
import { productionEnhancedService as enhancedAIService } from '../../src/services/productionEnhancedService';

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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sessionId = req.query.sessionId as string || 'default';
    const chain = req.query.chain as string;

    console.log("DeFi opportunities request", { sessionId, chain });

    const response = await enhancedAIService.generateResponse({
      sessionId,
      userMessage: `Show me DeFi opportunities with yield analysis ${chain ? `on ${chain}` : 'across all chains'}`,
      enableCryptoTools: true,
    });
    
    res.status(200).json(response);
  } catch (error: any) {
    console.error("DeFi opportunities error", { error: error.message });
    res.status(500).json({ 
      error: "Failed to fetch DeFi opportunities",
      message: error.message 
    });
  }
}