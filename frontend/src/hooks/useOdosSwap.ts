import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import type { WalletClient, PublicClient, Address } from 'viem';
import axios from 'axios';

interface SwapQuoteParams {
  inputToken: Address;
  outputToken: Address;
  inputAmount: bigint;
  slippageTolerance: number;
  userAddress: Address;
}

interface SwapQuote {
  inputAmount: string;
  outputAmount: string;
  priceImpact: number;
  gasEstimate: string;
  pathId: string;
  routerAddress: Address;
  callData: `0x${string}`;
  value: string;
}

export function useOdosSwap() {
  const { address } = useAccount();
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://nyxusd.vercel.app/api/swap'
    : 'http://localhost:3000/api/swap';

  const fetchQuote = useCallback(async (params: SwapQuoteParams) => {
    setIsLoadingQuote(true);
    setQuoteError(null);
    setQuote(null);

    try {
      const response = await axios.post(`${API_URL}?action=quote`, {
        inputToken: params.inputToken,
        outputToken: params.outputToken,
        inputAmount: params.inputAmount.toString(),
        slippageTolerance: params.slippageTolerance,
        userAddress: params.userAddress,
      });

      if (response.data.success) {
        setQuote(response.data.data);
      } else {
        setQuoteError(response.data.error || 'Failed to fetch quote');
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      if (axios.isAxiosError(error)) {
        setQuoteError(error.response?.data?.details || error.message);
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
        to: quote.routerAddress,
        data: quote.callData,
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

  const getSupportedTokens = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}?action=tokens`);
      if (response.data.success) {
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
      const response = await axios.post(`${API_URL}?action=validate`, {
        inputToken,
        outputToken,
      });
      return response.data.success && response.data.data.isSupported;
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