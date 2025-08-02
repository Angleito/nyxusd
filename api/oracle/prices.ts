import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Fallback price data - simulated oracle prices
 */
const FALLBACK_PRICES = {
  "ETH/USD": "2450.50",
  "BTC/USD": "42150.75",
  "LINK/USD": "14.50",
  "UNI/USD": "5.85",
  "USDC/USD": "1.00",
  "USDT/USD": "1.00",
  "DAI/USD": "0.999",
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simple mock oracle response
    // In production, this would connect to real oracle services
    res.json({
      timestamp: new Date().toISOString(),
      prices: FALLBACK_PRICES,
      source: "mock-oracle",
      oracleHealth: 1.0,
      message: "Using mock oracle prices. Configure oracle service for real data."
    });
  } catch (error) {
    console.error("Oracle prices endpoint error:", error);

    res.status(500).json({
      timestamp: new Date().toISOString(),
      prices: FALLBACK_PRICES,
      source: "fallback",
      error: "Internal server error",
    });
  }
}