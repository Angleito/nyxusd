import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ExtendedTokenInfo, ApiResponse } from '../types/shared';
import { BASE_EXTENDED_TOKENS, BASE_CHAIN_ID } from '../constants/tokens';
import { setCorsHeaders, handleOptions, validateMethod, sendMethodNotAllowed } from '../utils/cors';

// CoinGecko API response type definitions
interface CoinGeckoToken {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly image: string;
  readonly current_price: number;
  readonly market_cap: number;
  readonly market_cap_rank: number;
  readonly platforms: Record<string, string>;
}

type CoinGeckoApiResponse = ReadonlyArray<CoinGeckoToken>;

// Transform CoinGecko token to our ExtendedTokenInfo format
function transformCoinGeckoToken(token: CoinGeckoToken): ExtendedTokenInfo | null {
  // Only include tokens that have a Base chain address
  const baseAddress = token.platforms?.['base'];
  if (!baseAddress) {
    return null;
  }
  
  return {
    id: token.id,
    symbol: token.symbol.toUpperCase(),
    name: token.name,
    address: baseAddress,
    decimals: 18, // Default for Base chain tokens
    image: token.image,
    platforms: token.platforms,
    chainId: BASE_CHAIN_ID,
    tags: []
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res, { methods: 'GET,OPTIONS' });

  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }

  if (!validateMethod(req.method, ['GET'])) {
    return sendMethodNotAllowed(res, ['GET']);
  }

  try {
    const limit = parseInt(req.query['limit'] as string) || 50;
    
    // Try to fetch from CoinGecko
    const coingeckoUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`;
    
    try {
      const response = await fetch(coingeckoUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NyxUSD/1.0'
        }
      });
      
      if (response.ok) {
        const data: CoinGeckoApiResponse = await response.json();
        
        // Transform and filter CoinGecko tokens to only include Base chain tokens
        const externalTokens: ExtendedTokenInfo[] = data
          .map(transformCoinGeckoToken)
          .filter((token): token is ExtendedTokenInfo => token !== null)
          .slice(0, Math.max(0, limit - BASE_EXTENDED_TOKENS.length));
        
        const apiResponse: ApiResponse<{ tokens: ExtendedTokenInfo[] }> = {
          success: true,
          data: { 
            tokens: [...BASE_EXTENDED_TOKENS, ...externalTokens].slice(0, limit)
          },
          timestamp: new Date().toISOString()
        };
        return res.status(200).json(apiResponse);
      }
    } catch (error) {
      console.error('CoinGecko API error:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    // Fallback to static list when external API fails
    const fallbackResponse: ApiResponse<{ tokens: ExtendedTokenInfo[] }> = {
      success: true,
      data: { tokens: BASE_EXTENDED_TOKENS.slice(0, limit) },
      timestamp: new Date().toISOString()
    };
    return res.status(200).json(fallbackResponse);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Token API error:', errorMessage);
    
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to fetch tokens',
      timestamp: new Date().toISOString()
    };
    return res.status(500).json(errorResponse);
  }
}