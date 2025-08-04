import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownUp, Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { useOdosSwap } from '../../hooks/useOdosSwap';
import { swapDetectionService } from '../../services/swapDetectionService';
import { tokenService, TokenInfo } from '../../services/tokenService';
import { TokenSearch } from './TokenSearch';

interface SwapInterfaceProps {
  readonly initialInputToken?: string;
  readonly initialOutputToken?: string;
  readonly initialAmount?: string;
  readonly onSwapComplete?: (txHash: string) => void;
  readonly onCancel?: () => void;
  readonly embedded?: boolean;
}

export const SwapInterface: React.FC<SwapInterfaceProps> = ({
  initialInputToken = 'AERO',
  initialOutputToken = 'ETH',
  initialAmount = '',
  onSwapComplete,
  onCancel,
  embedded = false
}) => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  
  const [inputToken, setInputToken] = useState(initialInputToken);
  const [outputToken, setOutputToken] = useState(initialOutputToken);
  const [inputAmount, setInputAmount] = useState(initialAmount);
  const [slippage, setSlippage] = useState('0.5');
  const [availableTokens, setAvailableTokens] = useState<TokenInfo[]>([]);
  const [tokensLoading, setTokensLoading] = useState(true);
  
  const {
    quote: quoteData,
    isLoadingQuote,
    quoteError,
    executeSwap,
    isExecuting,
    executionError,
    fetchQuote
  } = useOdosSwap();

  // Fetch available tokens on component mount
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setTokensLoading(true);
        const tokens = await tokenService.getPopularTokens();
       setAvailableTokens([...tokens]);
      } catch (error) {
        console.error('Failed to fetch tokens:', error);
        // Fallback to empty array - component will show loading state
      } finally {
        setTokensLoading(false);
      }
    };

    fetchTokens();
  }, []);

  // Memoize token details to prevent unnecessary re-calculations
  const inputTokenDetails = useMemo(() => {
    const details = swapDetectionService.getTokenDetails(inputToken);
    if (!details) {
      // Try to find from available tokens as fallback
      const tokenInfo = availableTokens.find(t => t.symbol === inputToken);
      if (tokenInfo && tokenInfo.address && tokenInfo.decimals) {
        return {
          symbol: tokenInfo.symbol,
          address: tokenInfo.address,
          decimals: tokenInfo.decimals
        };
      }
    }
    return details;
  }, [inputToken, availableTokens]);
  
  const outputTokenDetails = useMemo(() => {
    const details = swapDetectionService.getTokenDetails(outputToken);
    if (!details) {
      // Try to find from available tokens as fallback
      const tokenInfo = availableTokens.find(t => t.symbol === outputToken);
      if (tokenInfo && tokenInfo.address && tokenInfo.decimals) {
        return {
          symbol: tokenInfo.symbol,
          address: tokenInfo.address,
          decimals: tokenInfo.decimals
        };
      }
    }
    return details;
  }, [outputToken, availableTokens]);

  // Fetch quote when inputs change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (inputAmount && parseFloat(inputAmount) > 0 && address && inputTokenDetails && outputTokenDetails) {
        const amountInWei = parseUnits(inputAmount, inputTokenDetails.decimals);
        
        fetchQuote({
          inputToken: inputTokenDetails.address as `0x${string}`,
          outputToken: outputTokenDetails.address as `0x${string}`,
          inputAmount: amountInWei,
          slippageTolerance: parseFloat(slippage) / 100,
          userAddress: address
        });
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [inputAmount, slippage, address, fetchQuote, inputTokenDetails, outputTokenDetails]);

  const handleSwap = useCallback(async (): Promise<void> => {
    if (!walletClient || !publicClient || !address) {
      console.error('Wallet not connected');
      return;
    }

    if (!quoteData) {
      console.error('No quote available');
      return;
    }

    try {
      const txHash = await executeSwap(walletClient, publicClient);
      if (txHash && onSwapComplete) {
        onSwapComplete(txHash);
      }
    } catch (error) {
      console.error('Swap execution failed:', error);
    }
  }, [walletClient, publicClient, address, quoteData, executeSwap, onSwapComplete]);

  const switchTokens = useCallback((): void => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setInputAmount('');
  }, [inputToken, outputToken]);

  const formatOutputAmount = useCallback((): string => {
    if (!quoteData) return '0.00';
    
    const details = outputTokenDetails;
    if (!details) return '0.00';
    
    try {
      return formatUnits(BigInt(quoteData.outputAmount), details.decimals);
    } catch (error) {
      console.error('Error formatting output amount:', error);
      return '0.00';
    }
  }, [quoteData, outputTokenDetails]);

  const containerClass = embedded 
    ? "bg-gray-900/50 rounded-lg p-4 border border-purple-800/30"
    : "bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 rounded-2xl p-6 border border-purple-800/30 shadow-2xl";

  return (
    <motion.div
      className={containerClass}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Swap Tokens</h3>
        {embedded && onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* From Token */}
      <div className="space-y-2 mb-4">
        <label className="text-sm text-gray-400">From</label>
        <div className="flex space-x-2">
          <input
            type="number"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 px-4 py-3 bg-gray-800/70 border border-purple-700/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          <div className="min-w-48">
            <TokenSearch
              selectedToken={inputToken}
              onTokenSelect={setInputToken}
              availableTokens={availableTokens}
              tokensLoading={tokensLoading}
              placeholder="Search input token..."
            />
          </div>
        </div>
      </div>

      {/* Switch Button */}
      <div className="flex justify-center my-2">
        <motion.button
          onClick={switchTokens}
          className="p-2 bg-purple-800/30 hover:bg-purple-700/40 rounded-full transition-colors"
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowDownUp className="w-5 h-5 text-purple-400" />
        </motion.button>
      </div>

      {/* To Token */}
      <div className="space-y-2 mb-4">
        <label className="text-sm text-gray-400">To</label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={isLoadingQuote ? 'Loading...' : formatOutputAmount()}
            readOnly
            className="flex-1 px-4 py-3 bg-gray-800/50 border border-purple-700/30 rounded-lg text-white placeholder-gray-500"
          />
          <div className="min-w-48">
            <TokenSearch
              selectedToken={outputToken}
              onTokenSelect={setOutputToken}
              availableTokens={availableTokens}
              tokensLoading={tokensLoading}
              placeholder="Search output token..."
            />
          </div>
        </div>
      </div>

      {/* Quote Details */}
      {quoteData && !isLoadingQuote && (
        <motion.div
          className="mb-4 p-3 bg-gray-800/30 rounded-lg border border-purple-700/20"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Price Impact</span>
              <span className={`${quoteData.priceImpact > 3 ? 'text-red-400' : 'text-green-400'}`}>
                {quoteData.priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Est. Gas</span>
              <span className="text-gray-300">
                {(() => {
                  try {
                    return formatUnits(BigInt(quoteData.gasEstimate), 9) + ' ETH';
                  } catch (error) {
                    console.error('Error formatting gas estimate:', error);
                    return 'N/A';
                  }
                })()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Route</span>
              <span className="text-gray-300">Odos Protocol</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Slippage Settings */}
      <div className="mb-4">
        <label className="text-sm text-gray-400">Slippage Tolerance</label>
        <div className="flex space-x-2 mt-1">
          {['0.5', '1.0', '2.0'].map((value) => (
            <button
              key={value}
              onClick={() => setSlippage(value)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                slippage === value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70'
              }`}
            >
              {value}%
            </button>
          ))}
          <input
            type="number"
            value={slippage}
            onChange={(e) => setSlippage(e.target.value)}
            className="flex-1 px-3 py-1 bg-gray-800/50 border border-purple-700/30 rounded-lg text-white text-sm"
            placeholder="Custom"
          />
        </div>
      </div>

      {/* Error Messages */}
      <AnimatePresence>
        {(quoteError || executionError) && (
          <motion.div
            className="mb-4 p-3 bg-red-900/20 border border-red-800/30 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <p className="text-sm text-red-400">
                {quoteError || executionError}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Button */}
      <motion.button
        onClick={handleSwap}
        disabled={!isConnected || !quoteData || isExecuting || isLoadingQuote}
        className={`w-full py-3 rounded-lg font-semibold transition-all ${
          !isConnected
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : !quoteData || isLoadingQuote
            ? 'bg-purple-800/50 text-purple-300 cursor-not-allowed'
            : isExecuting
            ? 'bg-purple-600/50 text-white cursor-wait'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
        }`}
        whileHover={isConnected && quoteData && !isExecuting ? { scale: 1.02 } : {}}
        whileTap={isConnected && quoteData && !isExecuting ? { scale: 0.98 } : {}}
      >
        {!isConnected ? (
          'Connect Wallet'
        ) : isExecuting ? (
          <span className="flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Executing Swap...</span>
          </span>
        ) : isLoadingQuote ? (
          <span className="flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Fetching Quote...</span>
          </span>
        ) : !quoteData ? (
          'Enter Amount'
        ) : (
          'Swap'
        )}
      </motion.button>

      {/* Info */}
      {!embedded && (
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
            <p className="text-xs text-blue-400">
              Swaps are executed through Odos Protocol on Base chain for optimal routing and best prices.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};