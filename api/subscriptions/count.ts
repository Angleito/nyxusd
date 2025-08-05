import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { SubscriptionCountResponse, ErrorResponse } from '../types/shared.js';
import { setCorsHeaders, handleOptions } from '../utils/cors.js';
import { kv } from '@vercel/kv';

/**
 * Handles GET request to get subscription count
 * This is an admin endpoint for metrics
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    handleOptions(res);
    return;
  }
  
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    const count = await kv.get<number>('subscription_count') || 0;
    
    const response: SubscriptionCountResponse = {
      success: true,
      count,
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Get subscription count error:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to fetch subscription count'
    };
    res.status(500).json(errorResponse);
  }
}