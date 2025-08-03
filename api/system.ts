import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Mock system health data
    const systemHealth = {
      status: 'operational',
      apiStatus: 'healthy',
      oracleStatus: 'active',
      cdpEngineStatus: 'running',
      lastUpdate: new Date().toISOString(),
      metrics: {
        totalCDPs: 156,
        totalValueLocked: 12567890.45,
        averageCollateralization: 175.5,
        liquidationThreshold: 150,
        stabilityFee: 2.5
      },
      performance: {
        apiLatency: '45ms',
        oracleLatency: '120ms',
        blockchainLatency: '250ms'
      }
    };

    return res.status(200).json({
      success: true,
      data: systemHealth
    });
  } catch (error) {
    console.error('System health error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch system health'
    });
  }
}