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
    const { sessionId } = req.query;
    
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: "Session ID required" });
    }

    console.log("Reset session request", { sessionId });

    enhancedAIService.clearSession(sessionId);
    
    res.status(200).json({ 
      success: true, 
      message: "Session reset successfully",
      sessionId 
    });
  } catch (error: any) {
    console.error("Session reset error", { error: error.message });
    res.status(500).json({ 
      error: "Failed to reset session",
      message: error.message 
    });
  }
}