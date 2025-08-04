import { useState, useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';
import type { WalletClient, PublicClient, Address } from 'viem';
import axios from 'axios';

// Import shared API types
interface SwapQuoteParams {
  readonly inputToken: Address;
  readonly outputToken: Address;
  readonly inputAmount: bigint;
  readonly slippageTolerance: number;
  readonly userAddress: Address;
}

// Updated to match API shared types
interface SwapQuote {
  readonly inputAmount: string;
  readonly outputAmount: string;
  readonly priceImpact: number;
  readonly gasEstimate: string;
  readonly pathId: string;
  readonly routerAddress: string;
  readonly callData: string;
  readonly value: string;
}

// API Response type matching shared types
interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly timestamp?: string;
}

export function useOdosSwap() {
  const { address } = useAccount();
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const API_URL = useMemo(() => 
    import.meta.env.MODE === 'production' 
      ? 'https://nyxusd.com/api/swap'
      : 'http://localhost:3000/api/swap',
    []
  );

  const fetchQuote = useCallback(async (params: SwapQuoteParams) => {
    setIsLoadingQuote(true);
    setQuoteError(null);
    setQuote(null);

    try {
      const response = await axios.post<ApiResponse<SwapQuote>>(`${API_URL}?action=quote`, {
        inputToken: params.inputToken,
        outputToken: params.outputToken,
        inputAmount: params.inputAmount.toString(),
        slippageTolerance: params.slippageTolerance,
        userAddress: params.userAddress,
      });

      if (response.data.success && response.data.data) {
        setQuote(response.data.data);
      } else {
        setQuoteError(response.data.error || 'Failed to fetch quote');
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message;
        setQuoteError(errorMessage);
      } else if (error instanceof Error) {
        setQuoteError(error.message);
      } else {
        setQuoteError('Failed to fetch swap quote');
      }
    } finally {
      setIsLoadingQuote(false);
    }
  }, [API_URL]);

  const executeSwap = useCallback(async (
    walletClient: WalletClient,
    publicClient: PublicClient
  ): Promise<string | null> => {
    if (!quote || !address) {
      setExecutionError('No quote available or wallet not connected');
      return null;
    }

    setIsExecuting(true);
    setExecutionError(null);

    try {
      // Send transaction through wallet
      const hash = await walletClient.sendTransaction({
        to: quote.routerAddress as Address,
        data: quote.callData as `0x${string}`,
        value: BigInt(quote.value),
        account: address,
        chain: walletClient.chain,
      });

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 1,
      });

      if (receipt.status === 'success') {
        setQuote(null); // Clear quote after successful swap
        return hash;
      } else {
        setExecutionError('Transaction failed');
        return null;
      }
    } catch (error) {
      console.error('Error executing swap:', error);
      if (error instanceof Error) {
        setExecutionError(error.message);
      } else {
        setExecutionError('Failed to execute swap');
      }
      return null;
    } finally {
      setIsExecuting(false);
    }
  }, [quote, address]);

  const getSupportedTokens = useCallback(async (): Promise<unknown[]> => {
    try {
      const response = await axios.get<ApiResponse<unknown[]>>(`${API_URL}?action=tokens`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching supported tokens:', error);
      return [];
    }
  }, [API_URL]);

  const validateTokenPair = useCallback(async (
    inputToken: Address,
    outputToken: Address
  ): Promise<boolean> => {
    try {
      const response = await axios.post<ApiResponse<{ readonly isSupported: boolean }>>(`${API_URL}?action=validate`, {
        inputToken,
        outputToken,
      });
      return response.data.success && response.data.data?.isSupported === true;
    } catch (error) {
      console.error('Error validating token pair:', error);
      return false;
    }
  }, [API_URL]);

  return {
    quote,
    isLoadingQuote,
    quoteError,
    executeSwap,
    isExecuting,
    executionError,
    getSupportedTokens,
    validateTokenPair,
    fetchQuote,
  };
}