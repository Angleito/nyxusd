import { useAccount, useBalance, useChainId, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { useCallback, useEffect, useState } from 'react';
import { mainnet } from 'viem/chains';
import type { Address } from 'viem';

/**
 * Custom hook that provides a unified interface for wallet operations
 * with proper error handling and loading states
 */
export function useWallet() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const { connect, connectors, error: connectError, isPending } = useConnect();
  const { disconnect, error: disconnectError } = useDisconnect();
  const { switchChain, error: switchError, isPending: isSwitching } = useSwitchChain();
  const chainId = useChainId();
  
  const { data: balance, isLoading: isBalanceLoading, error: balanceError } = useBalance({
    address,
    watch: true, // Auto-refresh balance
  });

  // Combined error state
  const [error, setError] = useState<Error | null>(null);

  // Update error state when any wallet operation fails
  useEffect(() => {
    if (connectError) setError(connectError);
    else if (disconnectError) setError(disconnectError);
    else if (switchError) setError(switchError);
    else if (balanceError) setError(balanceError);
    else setError(null);
  }, [connectError, disconnectError, switchError, balanceError]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Safe connect with error handling
  const safeConnect = useCallback(async (connector: any) => {
    try {
      setError(null);
      await connect({ connector });
    } catch (err) {
      setError(err as Error);
      console.error('Failed to connect wallet:', err);
    }
  }, [connect]);

  // Safe disconnect with error handling
  const safeDisconnect = useCallback(async () => {
    try {
      setError(null);
      await disconnect();
    } catch (err) {
      setError(err as Error);
      console.error('Failed to disconnect wallet:', err);
    }
  }, [disconnect]);

  // Switch to a specific chain
  const switchToChain = useCallback(async (targetChainId: number) => {
    try {
      setError(null);
      await switchChain({ chainId: targetChainId });
    } catch (err) {
      setError(err as Error);
      console.error('Failed to switch chain:', err);
    }
  }, [switchChain]);

  // Switch to mainnet helper
  const switchToMainnet = useCallback(() => {
    return switchToChain(mainnet.id);
  }, [switchToChain]);

  // Check if on wrong network
  const isWrongNetwork = isConnected && chainId !== mainnet.id;

  // Combined loading state
  const isLoading = isConnecting || isPending || isSwitching || isBalanceLoading;

  return {
    // Account info
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    chainId,
    
    // Balance info
    balance: balance ? {
      value: balance.value,
      formatted: balance.formatted,
      symbol: balance.symbol,
      decimals: balance.decimals,
    } : null,
    
    // Connectors
    connectors,
    
    // Actions
    connect: safeConnect,
    disconnect: safeDisconnect,
    switchChain: switchToChain,
    switchToMainnet,
    
    // States
    isLoading,
    isWrongNetwork,
    error,
    
    // Error clearing
    clearError: () => setError(null),
  };
}

/**
 * Hook to monitor wallet events
 */
export function useWalletEvents(handlers: {
  onConnect?: (address: Address) => void;
  onDisconnect?: () => void;
  onChainChange?: (chainId: number) => void;
  onAccountChange?: (address: Address) => void;
}) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  // Track previous values to detect changes
  const [prevAddress, setPrevAddress] = useState<Address | undefined>();
  const [prevChainId, setPrevChainId] = useState<number>();
  const [prevConnected, setPrevConnected] = useState(false);

  useEffect(() => {
    // Handle connection
    if (isConnected && !prevConnected && address) {
      handlers.onConnect?.(address);
    }
    
    // Handle disconnection
    if (!isConnected && prevConnected) {
      handlers.onDisconnect?.();
    }
    
    // Handle account change
    if (address && prevAddress && address !== prevAddress) {
      handlers.onAccountChange?.(address);
    }
    
    // Handle chain change
    if (chainId !== prevChainId && prevChainId !== undefined) {
      handlers.onChainChange?.(chainId);
    }
    
    // Update previous values
    setPrevAddress(address);
    setPrevChainId(chainId);
    setPrevConnected(isConnected);
  }, [address, chainId, isConnected, prevAddress, prevChainId, prevConnected, handlers]);
}