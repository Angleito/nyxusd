/**
 * Wallet integration for NYXUSD frontend
 * Provides wallet connection, account management, and transaction handling
 */

import { formatUnits, parseUnits } from 'viem';
import type { Address } from 'viem';

// Wallet connection states
export type WalletState = {
  isConnected: boolean;
  isConnecting: boolean;
  address?: Address;
  chainId?: number;
  balance?: bigint;
  error?: string;
};

// Initial wallet state
export const initialWalletState: WalletState = {
  isConnected: false,
  isConnecting: false,
};

// Wallet connection utilities
export const formatBalance = (balance: bigint, decimals = 18): string => {
  // Use viem's formatUnits for accurate formatting
  const formatted = formatUnits(balance, decimals);
  
  // Remove trailing zeros and decimal point if whole number
  const trimmed = formatted.replace(/\.?0+$/, '');
  
  // Limit to 6 decimal places for display
  const parts = trimmed.split('.');
  if (parts[1] && parts[1].length > 6) {
    return `${parts[0]}.${parts[1].substring(0, 6)}`;
  }
  
  return trimmed;
};

export const formatAddress = (address: string): string => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Error handling
export const getWalletErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Common wallet error messages
    if (error.message.includes("User rejected") || error.message.includes("user rejected")) {
      return "Connection cancelled by user";
    }
    if (error.message.includes("No provider") || error.message.includes("Connector not found")) {
      return "No wallet found. Please install MetaMask or another Web3 wallet.";
    }
    if (error.message.includes("Unsupported chain") || error.message.includes("Chain mismatch")) {
      return "Unsupported network. Please switch to a supported network.";
    }
    if (error.message.includes("Already pending")) {
      return "Connection already in progress";
    }
    if (error.message.includes("Resource unavailable")) {
      return "Wallet is locked. Please unlock your wallet and try again.";
    }
    // Return a more user-friendly version of the error
    if (error.message.length > 100) {
      return "Connection failed. Please try again.";
    }
    return error.message;
  }
  return "An unexpected error occurred";
};

// Chain utilities
export const getChainName = (chainId: number): string => {
  const chainNames: Record<number, string> = {
    1: 'Ethereum',
    11155111: 'Sepolia',
    137: 'Polygon',
    80001: 'Mumbai',
    42161: 'Arbitrum',
    421614: 'Arbitrum Sepolia',
    99999: 'Midnight Testnet',
  };
  return chainNames[chainId] || `Chain ${chainId}`;
};

// Parse token amounts for transactions
export const parseTokenAmount = (amount: string, decimals = 18): bigint => {
  try {
    return parseUnits(amount, decimals);
  } catch {
    return BigInt(0);
  }
};

// Check if address is valid
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};
