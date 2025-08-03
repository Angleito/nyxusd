import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

interface SwapQuoteRequest {
  inputToken: string;
  outputToken: string;
  inputAmount: string;
  slippageTolerance: number;
  userAddress: string;
}

interface SwapExecuteRequest extends SwapQuoteRequest {
  pathId: string;
  routerAddress: string;
  callData: string;
  value: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS for nyxusd.com
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://nyxusd.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const action = req.query.action as string;

  try {
    if (action === 'quote') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed for quote action' });
      }

      const quoteRequest = req.body as SwapQuoteRequest;
      
      // Validate required fields
      if (!quoteRequest.inputToken || !quoteRequest.outputToken || !quoteRequest.inputAmount || !quoteRequest.userAddress) {
        return res.status(400).json({ 
          error: 'Missing required fields: inputToken, outputToken, inputAmount, userAddress' 
        });
      }

      // Call Odos API for quote
      const odosQuoteResponse = await axios.post('https://api.odos.xyz/sor/quote/v2', {
        chainId: 8453, // Base chain
        inputTokens: [{
          tokenAddress: quoteRequest.inputToken,
          amount: quoteRequest.inputAmount
        }],
        outputTokens: [{
          tokenAddress: quoteRequest.outputToken,
          proportion: 1
        }],
        userAddr: quoteRequest.userAddress,
        slippageLimitPercent: quoteRequest.slippageTolerance,
        sourceBlacklist: [],
        sourceWhitelist: [],
        simulate: false,
        pathViz: false,
        disableRFQs: false
      });

      const odosQuote = odosQuoteResponse.data;

      // Transform Odos response to our format
      const quote = {
        inputAmount: quoteRequest.inputAmount,
        outputAmount: odosQuote.outAmounts[0],
        priceImpact: odosQuote.priceImpact || 0,
        gasEstimate: odosQuote.gasEstimate?.toString() || '0',
        pathId: odosQuote.pathId,
        routerAddress: odosQuote.transaction?.to || '',
        callData: odosQuote.transaction?.data || '0x',
        value: odosQuote.transaction?.value || '0'
      };

      res.status(200).json({ success: true, data: quote });

    } else if (action === 'execute') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed for execute action' });
      }

      const executeRequest = req.body as SwapExecuteRequest;
      
      // Call Odos API to assemble transaction
      const odosAssembleResponse = await axios.post('https://api.odos.xyz/sor/assemble', {
        userAddr: executeRequest.userAddress,
        pathId: executeRequest.pathId,
        simulate: false
      });

      const transaction = odosAssembleResponse.data.transaction;

      res.status(200).json({ 
        success: true, 
        data: {
          to: transaction.to,
          data: transaction.data,
          value: transaction.value,
          gasLimit: transaction.gas
        }
      });

    } else {
      res.status(400).json({ error: 'Invalid action. Use "quote" or "execute"' });
    }

  } catch (error) {
    console.error('Swap API error:', error);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;
      res.status(status).json({ 
        success: false, 
        error: `Odos API error: ${message}` 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  }
}