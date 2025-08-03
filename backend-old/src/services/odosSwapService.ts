import { Address, encodeFunctionData, parseAbi } from 'viem';

export interface UnifiedSwapRequest {
  inputToken: Address;
  outputToken: Address;
  inputAmount: bigint;
  slippageTolerance: number; // e.g., 0.005 for 0.5%
  userAddress: Address;
  deadline?: number;
}

export interface OdosQuoteResponse {
  inTokenAddress: string;
  outTokenAddress: string;
  inAmounts: string[];
  outAmounts: string[];
  gasEstimate: number;
  dataGasEstimate: number;
  gweiPerGas: number;
  gasEstimateValue: string;
  inValues: string[];
  outValues: string[];
  netOutValue: string;
  priceImpact: number;
  percentDiff: number;
  partnerFeePercent: number;
  pathId: string;
  pathViz: Array<{
    action: string;
    protocol: string;
    tokenIn: string[];
    tokenOut: string[];
  }>;
}

export interface OdosAssembleResponse {
  transaction: {
    gas: string;
    gasPrice: string;
    value: string;
    to: string;
    from: string;
    data: string;
    nonce: number;
    chainId: number;
  };
  simulation?: {
    isSuccess: boolean;
    amountOut: string;
    gasEstimate: number;
  };
}

export interface UnifiedSwapQuote {
  inputAmount: bigint;
  outputAmount: bigint;
  priceImpact: number;
  gasEstimate: bigint;
  pathId: string;
  routerAddress: Address;
  callData: `0x${string}`;
  value: bigint;
}

export class OdosSwapService {
  private readonly apiBaseUrl = 'https://api.odos.xyz';
  private readonly chainId: number;
  private readonly routerAddress: Address;

  constructor(chainId: number = 8453) { // Base chain by default
    this.chainId = chainId;
    // Odos router address for Base chain
    this.routerAddress = '0x19ceBd57CACe0a54a88614a9dDa6f05bFADB5084' as Address;
  }

  /**
   * Get complete swap quote with transaction data
   */
  async getSwapQuote(request: UnifiedSwapRequest): Promise<UnifiedSwapQuote> {
    // Step 1: Get quote from Odos API
    const odosQuote = await this.getOdosQuote(request);
    
    // Step 2: Get assembled transaction data from Odos
    const assembleData = await this.getOdosAssembleData(odosQuote.pathId, request.userAddress);
    
    // Step 3: Prepare unified quote response
    return {
      inputAmount: request.inputAmount,
      outputAmount: BigInt(odosQuote.outAmounts[0]),
      priceImpact: odosQuote.priceImpact / 100, // Convert percentage to decimal
      gasEstimate: BigInt(odosQuote.gasEstimate),
      pathId: odosQuote.pathId,
      routerAddress: assembleData.transaction.to as Address,
      callData: assembleData.transaction.data as `0x${string}`,
      value: BigInt(assembleData.transaction.value || '0'),
    };
  }

  /**
   * Get quote from Odos API
   */
  private async getOdosQuote(request: UnifiedSwapRequest): Promise<OdosQuoteResponse> {
    const quoteRequest = {
      chainId: this.chainId,
      inputTokens: [{
        tokenAddress: request.inputToken === '0x0000000000000000000000000000000000000000' 
          ? '0x0000000000000000000000000000000000000000' 
          : request.inputToken,
        amount: request.inputAmount.toString()
      }],
      outputTokens: [{
        tokenAddress: request.outputToken === '0x0000000000000000000000000000000000000000'
          ? '0x0000000000000000000000000000000000000000'
          : request.outputToken,
        proportion: 1
      }],
      slippageLimitPercent: request.slippageTolerance * 100, // Convert to percentage
      userAddr: request.userAddress,
      referralCode: 0,
      disableRFQs: false,
      compact: true
    };

    const response = await fetch(`${this.apiBaseUrl}/sor/quote/v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quoteRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Odos quote API error: ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Get assembled transaction data from Odos API
   */
  private async getOdosAssembleData(pathId: string, userAddress: Address): Promise<OdosAssembleResponse> {
    const assembleRequest = {
      userAddr: userAddress,
      pathId: pathId,
      simulate: true
    };

    const response = await fetch(`${this.apiBaseUrl}/sor/assemble`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assembleRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Odos assemble API error: ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Get supported tokens from Odos API
   */
  async getSupportedTokens(): Promise<Array<{ address: string; symbol: string; decimals: number; name: string }>> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/info/tokens/${this.chainId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch supported tokens: ${response.statusText}`);
      }

      const tokens = await response.json();
      return Object.values(tokens);
    } catch (error) {
      console.error('Error fetching Odos supported tokens:', error);
      return [];
    }
  }

  /**
   * Validate token pair is supported
   */
  async isTokenPairSupported(tokenIn: Address, tokenOut: Address): Promise<boolean> {
    try {
      const supportedTokens = await this.getSupportedTokens();
      const addressSet = new Set(supportedTokens.map(t => t.address.toLowerCase()));
      
      const tokenInLower = tokenIn.toLowerCase();
      const tokenOutLower = tokenOut.toLowerCase();
      
      // ETH is always supported
      const isTokenInSupported = tokenInLower === '0x0000000000000000000000000000000000000000' || 
                                 addressSet.has(tokenInLower);
      const isTokenOutSupported = tokenOutLower === '0x0000000000000000000000000000000000000000' || 
                                  addressSet.has(tokenOutLower);
      
      return isTokenInSupported && isTokenOutSupported;
    } catch (error) {
      console.error('Error checking token pair support:', error);
      return false;
    }
  }

  /**
   * Check if Odos API is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/info/chains`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        return false;
      }

      const chains = await response.json();
      return Array.isArray(chains) && chains.some((chain: any) => chain.chainId === this.chainId);
    } catch {
      return false;
    }
  }

  /**
   * Get router address for the current chain
   */
  getRouterAddress(): Address {
    return this.routerAddress;
  }
}

// Singleton instance for Base chain
let odosSwapService: OdosSwapService | null = null;

export function getOdosSwapService(chainId: number = 8453): OdosSwapService {
  if (!odosSwapService || odosSwapService['chainId'] !== chainId) {
    odosSwapService = new OdosSwapService(chainId);
  }
  return odosSwapService;
}