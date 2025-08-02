import type { VercelRequest, VercelResponse } from '@vercel/node';

// Using CoinGecko API (free tier, no API key required for basic usage)
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';

// Mapping of our symbols to CoinGecko IDs
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  'ETH': 'ethereum',
  'BTC': 'bitcoin',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'USDC': 'usd-coin',
  'USDT': 'tether',
  'DAI': 'dai',
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
    // Get requested feeds from query params or use defaults
    const { feeds } = req.query;
    const requestedSymbols = feeds 
      ? (feeds as string).split(',').map(f => f.trim().toUpperCase())
      : Object.keys(SYMBOL_TO_COINGECKO_ID);

    // Build CoinGecko IDs list
    const coinIds = requestedSymbols
      .map(symbol => SYMBOL_TO_COINGECKO_ID[symbol.replace('/USD', '').replace('-USD', '')])
      .filter(Boolean)
      .join(',');

    if (!coinIds) {
      return res.status(400).json({
        error: "Invalid symbols",
        message: "No valid cryptocurrency symbols provided",
      });
    }

    // Fetch prices from CoinGecko
    const response = await fetch(
      `${COINGECKO_API_URL}?ids=${coinIds}&vs_currencies=usd`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Format prices
    const prices: Record<string, string> = {};
    for (const [symbol, geckoId] of Object.entries(SYMBOL_TO_COINGECKO_ID)) {
      if (data[geckoId]?.usd !== undefined) {
        prices[`${symbol}/USD`] = data[geckoId].usd.toFixed(2);
      }
    }

    res.json({
      timestamp: new Date().toISOString(),
      prices,
      source: "coingecko",
      oracleHealth: 1.0,
    });
  } catch (error) {
    console.error("Oracle prices endpoint error:", error);

    // Return static fallback prices on error
    const fallbackPrices = {
      "ETH/USD": "2450.50",
      "BTC/USD": "42150.75",
      "LINK/USD": "14.50",
      "UNI/USD": "5.85",
      "USDC/USD": "1.00",
      "USDT/USD": "1.00",
      "DAI/USD": "0.999",
    };

    res.json({
      timestamp: new Date().toISOString(),
      prices: fallbackPrices,
      source: "fallback",
      oracleHealth: 0,
      error: "Failed to fetch live prices, using fallback data",
    });
  }
}