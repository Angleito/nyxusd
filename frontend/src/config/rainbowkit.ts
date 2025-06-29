import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { 
  mainnet, 
  sepolia, 
  polygon, 
  polygonMumbai, 
  arbitrum, 
  arbitrumSepolia,
  midnightTestnet 
} from './chains';

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const enableTestnets = import.meta.env.VITE_ENABLE_TESTNETS === 'true';

// Define chains based on environment
const chains = enableTestnets 
  ? [mainnet, sepolia, polygon, polygonMumbai, arbitrum, arbitrumSepolia, midnightTestnet] as const
  : [mainnet, polygon, arbitrum] as const;

// Validate WalletConnect Project ID
const hasValidProjectId = walletConnectProjectId && walletConnectProjectId !== 'your_walletconnect_project_id_here';

if (!hasValidProjectId) {
  console.warn('⚠️ RainbowKit: WalletConnect Project ID not configured. Some wallet features may be limited. Get yours at https://cloud.walletconnect.com');
}

// RainbowKit configuration - only include project ID if valid
export const rainbowkitConfig = getDefaultConfig({
  appName: 'NYX USD',
  projectId: hasValidProjectId ? walletConnectProjectId! : '', // Use empty string if no valid project ID
  chains,
  ssr: false, // Disable SSR to prevent hydration issues
  multiInjectedProviderDiscovery: false, // Reduce connector conflicts
});

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