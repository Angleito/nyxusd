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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, holdings } = req.body;

    if (!holdings || holdings.length === 0) {
      return res.status(400).json({ error: "Holdings required for portfolio analysis" });
    }

    console.log("Portfolio analysis request", { sessionId, holdings: holdings.length });

    const response = await enhancedAIService.generateResponse({
      sessionId: sessionId || 'default',
      userMessage: `Analyze this portfolio with tailored recommendations: ${JSON.stringify(holdings)}`,
      enableCryptoTools: true,
      walletData: { holdings }
    });
    
    res.status(200).json(response);
  } catch (error: any) {
    console.error("Portfolio analysis error", { error: error.message });
    res.status(500).json({ 
      error: "Portfolio analysis failed",
      message: error.message 
    });
  }
}