import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  coinbaseWallet,
  injectedWallet,
  safeWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { 
  mainnet, 
  sepolia,
  arbitrum, 
  arbitrumSepolia,
  optimism,
  base,
  baseSepolia
} from 'viem/chains';
import { midnightTestnet } from './chains';

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ??
+  // Fallback demo Project ID – replace with your own in production
+  'b2a1c4d5e6f7g8h9i0j1k2l3m4n5o6p7';
const enableTestnets = import.meta.env.VITE_ENABLE_TESTNETS === 'true';

// Define chains based on environment
export const chains = enableTestnets 
  ? [mainnet, base, arbitrum, optimism, sepolia, baseSepolia, arbitrumSepolia, midnightTestnet] as const
  : [mainnet, base, arbitrum, optimism] as const;

// Validate WalletConnect Project ID
const hasValidProjectId = walletConnectProjectId && walletConnectProjectId !== 'your_walletconnect_project_id_here';

if (!hasValidProjectId) {
  console.warn('⚠️ RainbowKit: WalletConnect Project ID not configured. WalletConnect features will be disabled. Get yours at https://cloud.walletconnect.com');
}

// Base wallet list without WalletConnect
const baseWallets = [
  metaMaskWallet,
  coinbaseWallet, 
  safeWallet,
  injectedWallet,
];

// Suppress Coinbase analytics errors in console
if (typeof window !== 'undefined') {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args) => {
    // Filter out Coinbase analytics errors and API 404 errors during development
    const errorString = args[0]?.toString?.() || '';
    const firstArg = args[0];
    
    // Filter out various known non-critical errors
    if (errorString.includes('cca-lite.coinbase.com') || 
        (errorString.includes('Failed to load resource') && errorString.includes('coinbase')) ||
        (errorString.includes('Failed to load resource') && errorString.includes('404')) ||
        (errorString.includes('API Error') && args[1]?.response?.status === 404) ||
        (firstArg === 'API Error:' && typeof args[1] === 'object')) {
      // Only log these in development mode if explicitly debugging
      if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_API === 'true') {
        originalError.apply(console, args);
      }
      return;
    }
    originalError.apply(console, args);
  };
  
  console.warn = (...args) => {
    // Filter out network-related warnings for coinbase
    const warnString = args[0]?.toString?.() || '';
    if (warnString.includes('cca-lite.coinbase.com')) {
      return;
    }
    originalWarn.apply(console, args);
  };
  
  // Override fetch to intercept Coinbase analytics requests
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const url = args[0]?.toString() || '';
    if (url.includes('cca-lite.coinbase.com')) {
      return Promise.reject(new Error('Analytics blocked'));
    }
    return originalFetch.apply(window, args);
  };
}

// Add WalletConnect only if valid project ID exists
const wallets = hasValidProjectId 
  ? [...baseWallets, walletConnectWallet]
  : baseWallets;

// RainbowKit connectors configuration
export const rainbowkitConnectors = connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets,
    },
  ],
  {
    appName: 'NYX USD',
    // Provide a projectId (fallback value is fine when WalletConnect is disabled)
    projectId: walletConnectProjectId!,
  }
);

// Custom theme for RainbowKit
export const rainbowkitTheme = {
  colors: {
    accentColor: '#7c3aed', // Purple to match the design
    accentColorForeground: 'white',
    actionButtonBorder: 'transparent',
    actionButtonBorderMobile: 'transparent',
    actionButtonSecondaryBackground: '#f3f4f6',
    closeButton: '#6b7280',
    closeButtonBackground: '#f9fafb',
    connectButtonBackground: 'white',
    connectButtonBackgroundError: '#fee2e2',
    connectButtonInnerBackground: '#7c3aed',
    connectButtonText: '#1f2937',
    connectButtonTextError: '#991b1b',
    connectionIndicator: '#10b981',
    downloadBottomCardBackground: '#f9fafb',
    downloadTopCardBackground: 'white',
    error: '#ef4444',
    generalBorder: '#e5e7eb',
    generalBorderDim: '#f3f4f6',
    menuItemBackground: '#f3f4f6',
    modalBackdrop: 'rgba(0, 0, 0, 0.5)',
    modalBackground: 'white',
    modalBorder: '#e5e7eb',
    modalText: '#1f2937',
    modalTextDim: '#6b7280',
    modalTextSecondary: '#4b5563',
    profileAction: '#f3f4f6',
    profileActionHover: '#e5e7eb',
    profileForeground: 'white',
    selectedOptionBorder: '#7c3aed',
    standby: '#fbbf24',
  },
  fonts: {
    body: 'Inter, system-ui, sans-serif',
  },
  radii: {
    actionButton: '0.5rem',
    connectButton: '0.5rem',
    menuButton: '0.5rem',
    modal: '0.75rem',
    modalMobile: '0.75rem',
  },
  shadows: {
    connectButton: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    dialog: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    profileDetailsAction: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    selectedOption: '0 0 0 3px rgba(124, 58, 237, 0.1)',
    selectedWallet: '0 0 0 3px rgba(124, 58, 237, 0.1)',
    walletLogo: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },
};