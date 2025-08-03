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
    // Mock price data for now
    const prices = {
      ETH: 2245.67,
      BTC: 43567.89,
      USDC: 1.00,
      USDT: 1.00,
      DAI: 0.9998,
      NYX: 1.25,
      WBTC: 43567.89,
      WETH: 2245.67,
      timestamp: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      data: prices
    });
  } catch (error) {
    console.error('Oracle prices error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch oracle prices'
    });
  }
}