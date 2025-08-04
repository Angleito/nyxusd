import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ApiResponse } from '../types/shared.js';
import { setCorsHeaders, handleOptions, validateMethod, sendMethodNotAllowed } from '../utils/cors.js';

// CoinGecko API for real price data
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Token IDs for CoinGecko API mapping
const TOKEN_MAPPINGS: Record<string, string> = {
  'ETH': 'ethereum',
  'BTC': 'bitcoin',
  'USDC': 'usd-coin',
  'USDT': 'tether',
  'DAI': 'dai',
  'WBTC': 'wrapped-bitcoin',
  'WETH': 'weth',
  'MATIC': 'matic-network',
  'ARB': 'arbitrum',
  'OP': 'optimism',
  'AERO': 'aerodrome-finance',
  'MORPHO': 'morpho',
  'BRETT': 'brett',
  'DEGEN': 'degen-base',
  'HIGHER': 'higher'
} as const;

// CoinGecko API response types
interface CoinGeckoPriceResponse {
  readonly [tokenId: string]: {
    readonly usd: number;
  };
}

// Oracle price data structure
interface OraclePriceData {
  readonly [symbol: string]: number | string;
  readonly timestamp: string;
}

// Fallback prices for when API is unavailable
const FALLBACK_PRICES: Record<string, number> = {
  ETH: 2245.67,
  BTC: 43567.89,
  USDC: 1.00,
  USDT: 1.00,
  DAI: 0.9998,
  WBTC: 43567.89,
  WETH: 2245.67,
  AERO: 0.85,
  MORPHO: 1.25,
  BRETT: 0.089,
  DEGEN: 0.012,
  HIGHER: 0.045,
  NYX: 1.25 // Custom protocol token
} as const;

async function fetchRealPrices(): Promise<Record<string, number>> {
  try {
    const ids = Object.values(TOKEN_MAPPINGS).join(',');
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NyxUSD/1.0'
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000)
      }
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data: CoinGeckoPriceResponse = await response.json();
    
    // Transform the data to our format with type safety
    const prices: Record<string, number> = {};
    for (const [symbol, geckoId] of Object.entries(TOKEN_MAPPINGS)) {
      const priceData = data[geckoId];
      if (priceData?.usd && typeof priceData.usd === 'number') {
        prices[symbol] = priceData.usd;
      } else {
        // Use fallback price if API data is missing
        const fallbackPrice = FALLBACK_PRICES[symbol];
        if (fallbackPrice !== undefined) {
          prices[symbol] = fallbackPrice;
        }
      }
    }
    
    // Add NYX token (custom protocol token)
    prices['NYX'] = FALLBACK_PRICES['NYX'];
    
    return prices;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown CoinGecko error';
    console.error('Failed to fetch prices from CoinGecko:', errorMessage);
    
    // Return fallback prices when API fails
    return { ...FALLBACK_PRICES };
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers with caching for price data
  setCorsHeaders(res, { 
    methods: 'GET,OPTIONS', 
    cache: 's-maxage=60, stale-while-revalidate' 
  });

  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }

  if (!validateMethod(req.method, ['GET'])) {
    return sendMethodNotAllowed(res, ['GET']);
  }

  try {
    const prices = await fetchRealPrices();
    
    const priceData: OraclePriceData = {
      ...prices,
      timestamp: new Date().toISOString()
    };
    
    const successResponse: ApiResponse<OraclePriceData> = {
      success: true,
      data: priceData,
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json(successResponse);
    return;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Oracle prices error:', errorMessage);
    
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to fetch oracle prices',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(errorResponse);
    return;
  }
}