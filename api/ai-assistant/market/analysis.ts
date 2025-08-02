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
    
    console.log("Market analysis request", { sessionId });

    const response = await enhancedAIService.generateResponse({
      sessionId,
      userMessage: 'Give me a comprehensive market analysis with AI-powered insights and trends',
      enableCryptoTools: true,
    });
    
    res.status(200).json(response);
  } catch (error: any) {
    console.error("Market analysis error", { error: error.message });
    res.status(500).json({ 
      error: "Failed to generate market analysis",
      message: error.message 
    });
  }
}