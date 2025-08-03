import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { BaseToken, ApiResponse } from '../../types/shared';
import { BASE_CORE_TOKENS, BASE_CHAIN_ID } from '../../constants/tokens';
import { setCorsHeaders, handleOptions, validateMethod, sendMethodNotAllowed } from '../../utils/cors';

// Odos API response type for token data
interface OdosTokenResponse {
  readonly address: string;
  readonly symbol: string;
  readonly name: string;
  readonly decimals: number;
  readonly logoURI?: string;
}

type OdosApiResponse = ReadonlyArray<OdosTokenResponse>;

// Transform Odos token to our BaseToken format
function transformOdosToken(token: OdosTokenResponse): BaseToken {
  return {
    symbol: token.symbol,
    name: token.name,
    address: token.address,
    decimals: token.decimals
  };
}

// Validate chainId parameter
function validateChainId(chainId: string | string[] | undefined): chainId is string {
  return typeof chainId === 'string' && /^\d+$/.test(chainId);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res, { methods: 'GET,OPTIONS' });

  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }

  if (!validateMethod(req.method, ['GET'])) {
    return sendMethodNotAllowed(res, ['GET']);
  }

  const { chainId } = req.query;
  
  // Validate chainId parameter
  if (!validateChainId(chainId)) {
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Invalid chainId parameter. Must be a numeric string.',
      timestamp: new Date().toISOString()
    };
    return res.status(400).json(errorResponse);
  }
  
  // Only support Base chain for now
  if (chainId !== BASE_CHAIN_ID.toString()) {
    const emptyResponse: ApiResponse<ReadonlyArray<BaseToken>> = {
      success: true,
      data: [],
      timestamp: new Date().toISOString()
    };
    return res.status(200).json(emptyResponse);
  }

  try {
    // Try to fetch from Odos API
    const odosUrl = `https://api.odos.xyz/info/tokens/${chainId}`;
    
    try {
      const response = await fetch(odosUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NyxUSD/1.0'
        },
signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (response.ok) {
        const data: OdosApiResponse = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const tokens = data.map(transformOdosToken);
          const successResponse: ApiResponse<ReadonlyArray<BaseToken>> = {
            success: true,
            data: tokens,
            timestamp: new Date().toISOString()
          };
          return res.status(200).json(successResponse);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown Odos API error';
      console.error('Odos API error:', errorMessage);
    }
    
    // Fallback to static list when external API fails
    const fallbackResponse: ApiResponse<ReadonlyArray<BaseToken>> = {
      success: true,
      data: BASE_CORE_TOKENS,
      timestamp: new Date().toISOString()
    };
    return res.status(200).json(fallbackResponse);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Odos token API error:', errorMessage);
    
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to fetch tokens',
      timestamp: new Date().toISOString()
    };
    return res.status(500).json(errorResponse);
  }
}