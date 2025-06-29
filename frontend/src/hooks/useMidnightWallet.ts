import { useState, useEffect, useCallback } from 'react';
import { 
  isMidnightWalletInstalled, 
  requestMidnightWalletInstall,
  getMidnightWalletStatus 
} from '../connectors/midnightConnector';

export interface MidnightWalletState {
  installed: boolean;
  connected: boolean;
  address?: string;
  balance?: bigint;
  network?: string;
  loading: boolean;
  error?: string;
}

/**
 * Hook for managing Midnight wallet (Lace) specific functionality
 * Provides detection, connection status, and Midnight-specific features
 */
export function useMidnightWallet() {
  const [state, setState] = useState<MidnightWalletState>({
    installed: false,
    connected: false,
    loading: true,
  });

  // Check wallet installation and connection status
  const checkWalletStatus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const status = await getMidnightWalletStatus();
      
      if (status.connected && window.midnight?.mnLace) {
        try {
          const walletApi = await window.midnight.mnLace.enable();
          const walletState = await walletApi.state();
          
          setState({
            installed: status.installed,
            connected: status.connected,
            address: walletState.address,
            balance: walletState.balance,
            network: walletState.network,
            loading: false,
          });
        } catch (error) {
          setState({
            installed: status.installed,
            connected: false,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to get wallet state',
          });
        }
      } else {
        setState({
          installed: status.installed,
          connected: status.connected,
          loading: false,
        });
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to check wallet status',
      }));
    }
  }, []);

  // Connect to Midnight wallet
  const connect = useCallback(async () => {
    if (!isMidnightWalletInstalled()) {
      requestMidnightWalletInstall();
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));
      
      const mnLace = window.midnight!.mnLace!;
      const walletApi = await mnLace.enable();
      const walletState = await walletApi.state();
      
      setState({
        installed: true,
        connected: true,
        address: walletState.address,
        balance: walletState.balance,
        network: walletState.network,
        loading: false,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Midnight wallet',
      }));
    }
  }, []);

  // Get service configuration
  const getServiceConfig = useCallback(async () => {
    if (!window.midnight?.mnLace) {
      throw new Error('Midnight wallet not available');
    }
    
    return await window.midnight.mnLace.serviceUriConfig();
  }, []);

  // Check for wallet installation on mount
  useEffect(() => {
    checkWalletStatus();
  }, [checkWalletStatus]);

  // Listen for wallet events
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkWalletStatus();
      }
    };

    const handleFocus = () => {
      checkWalletStatus();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkWalletStatus]);

  return {
    ...state,
    connect,
    refresh: checkWalletStatus,
    installWallet: requestMidnightWalletInstall,
    getServiceConfig,
  };
}

/**
 * Hook for detecting if Midnight wallet is available
 */
export function useMidnightWalletDetection() {
  const [installed, setInstalled] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkInstallation = () => {
      setInstalled(isMidnightWalletInstalled());
      setChecked(true);
    };

    // Check immediately
    checkInstallation();

    // Check again after a delay in case the wallet is still loading
    const timer = setTimeout(checkInstallation, 1000);

    return () => clearTimeout(timer);
  }, []);

  return { installed, checked };
}