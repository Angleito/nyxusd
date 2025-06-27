/**
 * Wallet integration for NYXUSD frontend
 * Provides wallet connection, account management, and transaction handling
 */

// Simplified wallet config for demonstration
export const wagmiConfig = {
  chains: ["mainnet", "sepolia"],
  connectors: ["injected", "metaMask", "walletConnect"],
};

// Wallet connection states
export type WalletState = {
  isConnected: boolean;
  isConnecting: boolean;
  address?: string;
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
  const divisor = BigInt(10 ** decimals);
  const quotient = balance / divisor;
  const remainder = balance % divisor;

  const quotientStr = quotient.toString();
  const remainderStr = remainder.toString().padStart(decimals, "0");

  // Trim trailing zeros from remainder
  const trimmedRemainder = remainderStr.replace(/0+$/, "");

  if (trimmedRemainder === "") {
    return quotientStr;
  }

  return `${quotientStr}.${trimmedRemainder}`;
};

export const formatAddress = (address: string): string => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Error handling
export const getWalletErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Common wallet error messages
    if (error.message.includes("User rejected")) {
      return "Connection rejected by user";
    }
    if (error.message.includes("No provider")) {
      return "No wallet found. Please install MetaMask or another Web3 wallet.";
    }
    if (error.message.includes("Unsupported chain")) {
      return "Unsupported network. Please switch to Ethereum Mainnet or Sepolia.";
    }
    return error.message;
  }
  return "An unknown error occurred";
};

// Transaction utilities
export const waitForTransaction = async (hash: string): Promise<boolean> => {
  // This would integrate with wagmi's waitForTransaction
  // For now, return a mock implementation
  console.log(`Waiting for transaction: ${hash}`);
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 2000);
  });
};
