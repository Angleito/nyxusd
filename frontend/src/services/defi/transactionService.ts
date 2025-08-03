import { 
  writeContract, 
  waitForTransactionReceipt,
  readContract,
  getBalance,
  getAccount
} from '@wagmi/core';
import { parseUnits, formatUnits, isAddress } from 'viem';
import { odosService, OdosAssembleResponse } from './odosService';
import { swapDetectionService } from '../swapDetectionService';
import { tokenService } from '../tokenService';

export interface TransactionRequest {
  to: string;
  from: string;
  data: string;
  value: string;
  gas?: number;
  gasPrice?: string;
}

export interface SwapRequest {
  inputToken: string;
  outputToken: string;
  amount: string;
  slippage?: number;
  userAddress: string;
  chainId: number;
}

export interface SwapResult {
  success: boolean;
  txHash?: string;
  error?: string;
  inputAmount?: string;
  outputAmount?: string;
  priceImpact?: string;
}

export interface TokenApproval {
  token: string;
  spender: string;
  amount: string;
}

// ERC20 ABI for approve function
const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
];

export class TransactionService {
  private static instance: TransactionService;

  static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  /**
   * Execute a swap transaction
   */
  async executeSwap(request: SwapRequest): Promise<SwapResult> {
    try {
      // Validate inputs
      const validation = odosService.validateSwapParams(
        request.inputToken,
        request.outputToken,
        request.amount
      );
      
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Note: Chain switching should be handled by the UI using useNetwork hook
      // The transaction will be sent on the currently connected chain

      // Get swap quote and transaction from Odos
      const { quote, transaction } = await odosService.executeSwap(
        request.chainId,
        request.inputToken,
        request.outputToken,
        request.amount,
        request.userAddress,
        request.slippage || 1
      );

      // Check and handle token approval if needed
      if (request.inputToken !== '0x0000000000000000000000000000000000000000') {
        const approvalNeeded = await this.checkApproval(
          request.inputToken,
          transaction.transaction.to,
          request.amount,
          request.userAddress
        );

        if (approvalNeeded) {
          const approvalResult = await this.approveToken({
            token: request.inputToken,
            spender: transaction.transaction.to,
            amount: request.amount
          });

          if (!approvalResult.success) {
            return {
              success: false,
              error: `Token approval failed: ${approvalResult.error}`
            };
          }
        }
      }

      // Execute the swap transaction
      const txResult = await this.sendTransaction(transaction.transaction);

      if (txResult.success) {
        const formattedQuote = odosService.formatQuote(quote);
        return {
          success: true,
          txHash: txResult.hash,
          inputAmount: formattedQuote.inputAmount,
          outputAmount: formattedQuote.outputAmount,
          priceImpact: formattedQuote.priceImpact
        };
      } else {
        return {
          success: false,
          error: txResult.error
        };
      }
    } catch (error: any) {
      console.error('Swap execution error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  /**
   * Send a transaction using wagmi
   */
  async sendTransaction(tx: TransactionRequest): Promise<{
    success: boolean;
    hash?: string;
    error?: string;
  }> {
    try {
      // For raw transactions, we need to use a different approach
      // The transaction should be sent directly with the data
      const account = getAccount();
      if (!account.address) {
        return {
          success: false,
          error: 'No wallet connected'
        };
      }

      // Since wagmi v2 doesn't have a direct raw transaction method,
      // we'll need to handle this differently
      // For now, return an error indicating the transaction needs to be handled differently
      console.error('Raw transaction sending needs to be implemented with viem directly');
      return {
        success: false,
        error: 'Transaction execution needs to be updated for wagmi v2'
      };
    } catch (error: any) {
      console.error('Transaction error:', error);
      return {
        success: false,
        error: error.message || 'Transaction failed'
      };
    }
  }

  /**
   * Check if token approval is needed
   */
  async checkApproval(
    token: string,
    spender: string,
    amount: string,
    owner: string
  ): Promise<boolean> {
    try {
      const allowance = await readContract({
        address: token as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [owner as `0x${string}`, spender as `0x${string}`]
      });

      return BigInt(allowance as string) < BigInt(amount);
    } catch (error) {
      console.error('Error checking allowance:', error);
      return true; // Assume approval needed if check fails
    }
  }

  /**
   * Approve token spending
   */
  async approveToken(approval: TokenApproval): Promise<{
    success: boolean;
    hash?: string;
    error?: string;
  }> {
    try {
      const hash = await writeContract({
        address: approval.token as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [
          approval.spender as `0x${string}`,
          BigInt(approval.amount)
        ]
      });

      const receipt = await waitForTransactionReceipt({
        hash,
        confirmations: 1
      });

      if (receipt.status === 'success') {
        return {
          success: true,
          hash: receipt.transactionHash
        };
      } else {
        return {
          success: false,
          error: 'Approval failed'
        };
      }
    } catch (error: any) {
      console.error('Approval error:', error);
      return {
        success: false,
        error: error.message || 'Approval failed'
      };
    }
  }

  /**
   * Get token balance
   */
  async getTokenBalance(
    token: string,
    address: string
  ): Promise<{ balance: string; formatted: string }> {
    try {
      if (token === '0x0000000000000000000000000000000000000000') {
        // Native token (ETH)
        const balance = await getBalance({
          address: address as `0x${string}`
        });
        return {
          balance: balance.value.toString(),
          formatted: balance.formatted
        };
      } else {
        // ERC20 token
        const balance = await readContract({
          address: token as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [address as `0x${string}`]
        });

        // Get token info for decimals
        const tokenInfo = await tokenService.getTokenByAddress(token);
        const decimals = tokenInfo?.decimals || 18;

        return {
          balance: balance.toString(),
          formatted: formatUnits(BigInt(balance as string), decimals)
        };
      }
    } catch (error) {
      console.error('Error getting balance:', error);
      return {
        balance: '0',
        formatted: '0'
      };
    }
  }

  /**
   * Check if the user is on the correct chain
   * Chain switching should be handled by the UI using wagmi hooks
   */
  isCorrectChain(chainId: number): boolean {
    // This should be checked in the component using useNetwork hook
    // Keeping this method for compatibility but it should not perform switching
    console.warn('Chain switching should be handled by UI components using wagmi hooks');
    return true;
  }

  /**
   * Format amount with proper decimals
   */
  formatAmount(amount: string, decimals: number): string {
    try {
      return parseUnits(amount, decimals).toString();
    } catch {
      return '0';
    }
  }

  /**
   * Parse swap intent and prepare swap request
   */
  async parseAndPrepareSwap(
    message: string,
    userAddress: string,
    chainId: number
  ): Promise<SwapRequest | null> {
    const swapIntent = await swapDetectionService.detectSwapIntentAsync(message);
    
    if (!swapIntent.isSwapIntent || !swapIntent.inputToken || !swapIntent.outputToken) {
      return null;
    }

    // Get token details
    const inputTokenDetails = await swapDetectionService.getTokenDetailsAsync(
      swapIntent.inputToken
    );
    const outputTokenDetails = await swapDetectionService.getTokenDetailsAsync(
      swapIntent.outputToken
    );

    if (!inputTokenDetails || !outputTokenDetails) {
      return null;
    }

    // Handle amount
    let amount = swapIntent.amount || '1'; // Default to 1 token
    
    if (swapIntent.isPercentage) {
      // Convert percentage to actual amount
      const balance = await this.getTokenBalance(
        inputTokenDetails.address,
        userAddress
      );
      const percentage = parseFloat(swapIntent.amount || '100') / 100;
      amount = (parseFloat(balance.formatted) * percentage).toString();
    }

    // Format amount with proper decimals
    const formattedAmount = this.formatAmount(
      amount,
      inputTokenDetails.decimals
    );

    return {
      inputToken: inputTokenDetails.address,
      outputToken: outputTokenDetails.address,
      amount: formattedAmount,
      slippage: 1,
      userAddress,
      chainId
    };
  }

  /**
   * Validate user has sufficient balance
   */
  async validateBalance(
    token: string,
    amount: string,
    userAddress: string
  ): Promise<{ valid: boolean; error?: string }> {
    const balance = await this.getTokenBalance(token, userAddress);
    
    if (BigInt(balance.balance) < BigInt(amount)) {
      return {
        valid: false,
        error: `Insufficient balance. You have ${balance.formatted} tokens.`
      };
    }

    return { valid: true };
  }
}

export const transactionService = TransactionService.getInstance();