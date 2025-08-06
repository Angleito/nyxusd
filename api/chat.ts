import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleOptions, validateMethod, sendMethodNotAllowed } from './utils/cors';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Set CORS headers
  setCorsHeaders(res, { methods: 'POST,OPTIONS' });
  
  if (req.method === 'OPTIONS') {
    handleOptions(res);
    return;
  }

  if (!validateMethod(req.method, ['POST'])) {
    sendMethodNotAllowed(res, ['POST']);
    return;
  }

  try {
    // For now, return a simple response indicating the endpoint is working
    // This should be replaced with actual chat logic when backend is properly configured
    const { message } = req.body || {};
    
    if (!message) {
      res.status(400).json({
        success: false,
        error: 'Message is required'
      });
      return;
    }

    // Simple echo response for now
    res.status(200).json({
      success: true,
      response: `Chat endpoint received: "${message}". Backend AI integration pending.`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}