import { ethers } from 'ethers';
import { TokenInfo } from '../tokenService';

export interface OdosQuoteRequest {
  chainId: number;
  inputTokens: Array<{
    tokenAddress: string;
    amount: string;
  }>;
  outputTokens: Array<{
    tokenAddress: string;
    proportion: number;
  }>;
  userAddress: string;
  slippageLimitPercent?: number;
  referralCode?: string;
  disableRFQs?: boolean;
  compact?: boolean;
}

export interface OdosQuoteResponse {
  inTokens: Array<{
    tokenAddress: string;
    amount: string;
  }>;
  outTokens: Array<{
    tokenAddress: string;
    amount: string;
  }>;
  outAmounts: string[];
  gasEstimate: number;
  gasEstimateValue: string;
  inValues: string[];
  outValues: string[];
  netOutValue: string;
  priceImpact: number;
  percentDiff: number;
  partnerFeePercent: number;
  pathId: string;
  pathViz?: any;
  blockNumber: number;
}

export interface OdosAssembleRequest {
  userAddress: string;
  pathId: string;
  simulate?: boolean;
}

export interface OdosAssembleResponse {
  deprecated?: string;
  blockNumber: number;
  gasEstimate: number;
  gasEstimateValue: string;
  inputTokens: Array<{
    tokenAddress: string;
    amount: string;
  }>;
  outputTokens: Array<{
    tokenAddress: string;
    amount: string;
  }>;
  netOutValue: string;
  outValues: string[];
  transaction: {
    to: string;
    from: string;
    data: string;
    value: string;
    gas: number;
    gasPrice: string;
    nonce: number;
  };
  simulation?: {
    isSuccess: boolean;
    amountsOut: string[];
    gasEstimate: number;
    simulationError?: any;
  };
}

export class OdosService {
  private static instance: OdosService;
  private readonly baseUrl = 'https://api.odos.xyz';
  private readonly headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  static getInstance(): OdosService {
    if (!OdosService.instance) {
      OdosService.instance = new OdosService();
    }
    return OdosService.instance;
  }

  /**
   * Get quote for a swap
   */
  async getQuote(
    chainId: number,
    inputToken: string,
    outputToken: string,
    amount: string,
    userAddress: string,
    slippage: number = 1
  ): Promise<OdosQuoteResponse> {
    const request: OdosQuoteRequest = {
      chainId,
      inputTokens: [
        {
          tokenAddress: inputToken,
          amount,
        },
      ],
      outputTokens: [
        {
          tokenAddress: outputToken,
          proportion: 1,
        },
      ],
      userAddress,
      slippageLimitPercent: slippage,
      referralCode: 2109965136, // Optional: Add your referral code
      disableRFQs: false,
      compact: true,
    };

    try {
      const response = await fetch(`${this.baseUrl}/sor/quote/v2`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Odos quote failed: ${error}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Odos quote:', error);
      throw error;
    }
  }

  /**
   * Assemble transaction for execution
   */
  async assembleTransaction(
    userAddress: string,
    pathId: string,
    simulate: boolean = true
  ): Promise<OdosAssembleResponse> {
    const request: OdosAssembleRequest = {
      userAddress,
      pathId,
      simulate,
    };

    try {
      const response = await fetch(`${this.baseUrl}/sor/assemble`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Odos assemble failed: ${error}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error assembling Odos transaction:', error);
      throw error;
    }
  }

  /**
   * Execute a complete swap flow
   */
  async executeSwap(
    chainId: number,
    inputToken: string,
    outputToken: string,
    amount: string,
    userAddress: string,
    slippage: number = 1
  ): Promise<{
    quote: OdosQuoteResponse;
    transaction: OdosAssembleResponse;
  }> {
    // Step 1: Get quote
    const quote = await this.getQuote(
      chainId,
      inputToken,
      outputToken,
      amount,
      userAddress,
      slippage
    );

    // Step 2: Assemble transaction
    const transaction = await this.assembleTransaction(
      userAddress,
      quote.pathId,
      true // Simulate first
    );

    // Check simulation result
    if (transaction.simulation && !transaction.simulation.isSuccess) {
      throw new Error(
        `Swap simulation failed: ${transaction.simulation.simulationError}`
      );
    }

    return { quote, transaction };
  }

  /**
   * Format swap quote for display
   */
  formatQuote(quote: OdosQuoteResponse): {
    inputAmount: string;
    outputAmount: string;
    priceImpact: string;
    gasEstimate: string;
    route: string;
  } {
    const inputAmount = ethers.formatUnits(
      quote.inTokens[0].amount,
      18 // Default to 18, should use actual token decimals
    );
    const outputAmount = ethers.formatUnits(
      quote.outAmounts[0],
      18 // Default to 18, should use actual token decimals
    );

    return {
      inputAmount,
      outputAmount,
      priceImpact: `${(quote.priceImpact * 100).toFixed(2)}%`,
      gasEstimate: ethers.formatEther(quote.gasEstimateValue),
      route: quote.pathViz ? 'Optimized route via Odos' : 'Direct swap',
    };
  }

  /**
   * Get supported chains
   */
  getSupportedChains(): Array<{ id: number; name: string }> {
    return [
      { id: 1, name: 'Ethereum' },
      { id: 10, name: 'Optimism' },
      { id: 56, name: 'BSC' },
      { id: 137, name: 'Polygon' },
      { id: 250, name: 'Fantom' },
      { id: 324, name: 'zkSync Era' },
      { id: 8453, name: 'Base' },
      { id: 42161, name: 'Arbitrum' },
      { id: 43114, name: 'Avalanche' },
    ];
  }

  /**
   * Check if chain is supported
   */
  isChainSupported(chainId: number): boolean {
    return this.getSupportedChains().some((chain) => chain.id === chainId);
  }

  /**
   * Get router address for a specific chain
   */
  getRouterAddress(chainId: number): string {
    // Odos V2 router addresses
    const routers: Record<number, string> = {
      1: '0xCf5540fFFCdC3d510B18bFcA6d2b9987b0772559', // Ethereum
      10: '0xCa423977156BB05b13A2BA3b76Bc5419E2fE9680', // Optimism
      56: '0x89b8AA89FDd0507a99d334CBe3C808fAFC7d850A', // BSC
      137: '0x4E3288c9ca110bCC82bf38F09A7b425c095d92Bf', // Polygon
      250: '0xD0c22A5435F4E8E5770C1fAFb5374015FC12F7cD', // Fantom
      324: '0x4bBa932E9792A2b917D47830C93a9BC79320E4f7', // zkSync Era
      8453: '0x19cEeAd7105607Cd444F5ad10dd51356436095a1', // Base
      42161: '0xa669e7A0d4b3e4Fa48af2dE86BD4CD7126Be4e13', // Arbitrum
      43114: '0x88de50B233052e4Fb783d4F6db78Cc34fEa3e9FC', // Avalanche
    };

    return routers[chainId] || '';
  }

  /**
   * Validate swap parameters
   */
  validateSwapParams(
    inputToken: string,
    outputToken: string,
    amount: string
  ): { valid: boolean; error?: string } {
    // Check addresses
    if (!ethers.isAddress(inputToken)) {
      return { valid: false, error: 'Invalid input token address' };
    }
    if (!ethers.isAddress(outputToken)) {
      return { valid: false, error: 'Invalid output token address' };
    }

    // Check amount
    try {
      const parsedAmount = BigInt(amount);
      if (parsedAmount <= 0n) {
        return { valid: false, error: 'Amount must be greater than 0' };
      }
    } catch {
      return { valid: false, error: 'Invalid amount format' };
    }

    // Check tokens are different
    if (inputToken.toLowerCase() === outputToken.toLowerCase()) {
      return { valid: false, error: 'Cannot swap token to itself' };
    }

    return { valid: true };
  }

  /**
   * Estimate gas for a swap
   */
  async estimateGas(
    chainId: number,
    inputToken: string,
    outputToken: string,
    amount: string,
    userAddress: string
  ): Promise<{ gas: number; gasPrice: string; totalCost: string }> {
    const quote = await this.getQuote(
      chainId,
      inputToken,
      outputToken,
      amount,
      userAddress
    );

    return {
      gas: quote.gasEstimate,
      gasPrice: '0', // Would need to fetch current gas price
      totalCost: quote.gasEstimateValue,
    };
  }
}

export const odosService = OdosService.getInstance();