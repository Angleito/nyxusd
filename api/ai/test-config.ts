import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Test endpoint to verify AI configuration
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Enable CORS for development
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       process.env.VERCEL_ENV === 'development';
  
  const allowedOrigins = [
    'https://nyxusd.com',
    'https://www.nyxusd.com',
    ...(isDevelopment ? [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:8080'
    ] : [])
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (isDevelopment) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;
  const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

  res.status(200).json({
    success: true,
    config: {
      openRouter: {
        configured: !!openRouterKey,
        keyLength: openRouterKey ? openRouterKey.length : 0,
        keyPrefix: openRouterKey ? openRouterKey.substring(0, 7) + '...' : null
      },
      openAi: {
        configured: !!openAiKey,
        keyLength: openAiKey ? openAiKey.length : 0,
        keyPrefix: openAiKey ? openAiKey.substring(0, 7) + '...' : null
      },
      elevenLabs: {
        configured: !!elevenLabsKey,
        keyLength: elevenLabsKey ? elevenLabsKey.length : 0,
        keyPrefix: elevenLabsKey ? elevenLabsKey.substring(0, 7) + '...' : null
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        APP_NAME: process.env.APP_NAME,
        APP_URL: process.env.APP_URL
      }
    },
    timestamp: new Date().toISOString()
  });
}