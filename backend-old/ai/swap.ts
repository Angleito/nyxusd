import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOdosSwapService } from '../src/services/odosSwapService';

// Enable CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeaders(corsHeaders).end();
  }

  const { action } = req.query;

  try {
    const swapService = getOdosSwapService();

    switch (action) {
      case 'quote': {
        if (req.method !== 'POST') {
          return res.status(405).setHeaders(corsHeaders).json({ 
            error: 'Method not allowed' 
          });
        }

        const { 
          inputToken, 
          outputToken, 
          inputAmount, 
          slippageTolerance = 0.005,
          userAddress 
        } = req.body;

        if (!inputToken || !outputToken || !inputAmount || !userAddress) {
          return res.status(400).setHeaders(corsHeaders).json({ 
            error: 'Missing required parameters' 
          });
        }

        try {
          const quote = await swapService.getSwapQuote({
            inputToken,
            outputToken,
            inputAmount: BigInt(inputAmount),
            slippageTolerance,
            userAddress,
          });

          return res.status(200).setHeaders(corsHeaders).json({
            success: true,
            data: {
              inputAmount: quote.inputAmount.toString(),
              outputAmount: quote.outputAmount.toString(),
              priceImpact: quote.priceImpact,
              gasEstimate: quote.gasEstimate.toString(),
              pathId: quote.pathId,
              routerAddress: quote.routerAddress,
              callData: quote.callData,
              value: quote.value.toString(),
            }
          });
        } catch (error) {
          console.error('Error getting swap quote:', error);
          return res.status(500).setHeaders(corsHeaders).json({ 
            error: 'Failed to get swap quote',
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      case 'tokens': {
        if (req.method !== 'GET') {
          return res.status(405).setHeaders(corsHeaders).json({ 
            error: 'Method not allowed' 
          });
        }

        try {
          const tokens = await swapService.getSupportedTokens();
          
          return res.status(200).setHeaders(corsHeaders).json({
            success: true,
            data: tokens
          });
        } catch (error) {
          console.error('Error fetching supported tokens:', error);
          return res.status(500).setHeaders(corsHeaders).json({ 
            error: 'Failed to fetch supported tokens' 
          });
        }
      }

      case 'validate': {
        if (req.method !== 'POST') {
          return res.status(405).setHeaders(corsHeaders).json({ 
            error: 'Method not allowed' 
          });
        }

        const { inputToken, outputToken } = req.body;

        if (!inputToken || !outputToken) {
          return res.status(400).setHeaders(corsHeaders).json({ 
            error: 'Missing token addresses' 
          });
        }

        try {
          const isSupported = await swapService.isTokenPairSupported(
            inputToken,
            outputToken
          );

          return res.status(200).setHeaders(corsHeaders).json({
            success: true,
            data: { isSupported }
          });
        } catch (error) {
          console.error('Error validating token pair:', error);
          return res.status(500).setHeaders(corsHeaders).json({ 
            error: 'Failed to validate token pair' 
          });
        }
      }

      case 'status': {
        if (req.method !== 'GET') {
          return res.status(405).setHeaders(corsHeaders).json({ 
            error: 'Method not allowed' 
          });
        }

        try {
          const isAvailable = await swapService.isAvailable();
          const routerAddress = swapService.getRouterAddress();

          return res.status(200).setHeaders(corsHeaders).json({
            success: true,
            data: {
              isAvailable,
              routerAddress,
              chainId: 8453, // Base chain
              serviceName: 'Odos Protocol'
            }
          });
        } catch (error) {
          console.error('Error checking service status:', error);
          return res.status(500).setHeaders(corsHeaders).json({ 
            error: 'Failed to check service status' 
          });
        }
      }

      default:
        return res.status(400).setHeaders(corsHeaders).json({ 
          error: 'Invalid action. Supported actions: quote, tokens, validate, status' 
        });
    }
  } catch (error) {
    console.error('Swap API error:', error);
    return res.status(500).setHeaders(corsHeaders).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}