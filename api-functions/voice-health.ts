import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env['FRONTEND_URL'] || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const elevenLabsApiKey = process.env['ELEVENLABS_API_KEY'];
    const isConfigured = !!elevenLabsApiKey;
    
    let apiStatus = 'not_configured';
    let subscription = null;
    
    if (isConfigured) {
      try {
        // Check ElevenLabs API status
        const response = await fetch('https://api.elevenlabs.io/v1/user', {
          headers: {
            'xi-api-key': elevenLabsApiKey,
          },
        });
        
        if (response.ok) {
          apiStatus = 'connected';
          const userData = await response.json();
          
          // Get subscription info
          const subResponse = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
            headers: {
              'xi-api-key': elevenLabsApiKey,
            },
          });
          
          if (subResponse.ok) {
            const subData = await subResponse.json();
            subscription = {
              tier: subData.tier || 'free',
              character_count: subData.character_count || 0,
              character_limit: subData.character_limit || 10000,
              remaining_characters: (subData.character_limit || 10000) - (subData.character_count || 0),
            };
          }
        } else {
          apiStatus = 'error';
        }
      } catch (error) {
        console.error('ElevenLabs API check failed:', error);
        apiStatus = 'error';
      }
    }
    
    res.status(200).json({
      success: true,
      status: 'healthy',
      elevenLabs: {
        configured: isConfigured,
        apiStatus,
        subscription,
      },
      serverless: {
        platform: 'vercel',
        region: process.env['VERCEL_REGION'] || 'unknown',
        environment: process.env['VERCEL_ENV'] || 'development',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}