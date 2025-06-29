# Wallet Integration

This directory contains the wallet connection components and utilities for the NYX USD platform.

## Overview

The wallet integration supports multiple popular crypto wallets through wagmi and RainbowKit:

### Supported Wallets
- **MetaMask** - Most popular browser extension wallet
- **Coinbase Wallet** - Browser extension and mobile app
- **Rainbow Wallet** - Modern wallet with great UX
- **WalletConnect** - Supports 300+ wallets via QR code
- **Safe (Gnosis Safe)** - Multi-sig wallet support
- **Midnight Wallet** - Custom integration for Midnight Protocol (prepared)
- **Injected Wallets** - Any browser wallet that injects web3

## Components

### WalletConnectButton
A custom wallet connection button with dropdown connector selection.
```tsx
import { WalletConnectButton } from './components/wallet/WalletConnectButton';

<WalletConnectButton className="my-custom-class" />
```

### RainbowKitButton
Pre-built wallet connection UI from RainbowKit with multiple variants:
```tsx
import { RainbowKitButton, CustomConnectButton } from './components/wallet/RainbowKitButton';

// Default RainbowKit button
<RainbowKitButton showBalance={true} />

// Custom styled to match app design
<CustomConnectButton />
```

### WalletStatus
Displays comprehensive wallet connection status with error handling:
```tsx
import { WalletStatus } from './components/wallet/WalletStatus';

<WalletStatus />
```

### WalletDemo
Example implementation showing all wallet connection options:
```tsx
import { WalletDemo } from './components/wallet/WalletDemo';

<WalletDemo />
```

## Configuration

### Environment Variables
Create a `.env` file based on `.env.example`:
```env
# Ethereum RPC URLs
VITE_ALCHEMY_API_KEY=your_alchemy_api_key
VITE_INFURA_API_KEY=your_infura_api_key

# WalletConnect Project ID
VITE_WALLETCONNECT_PROJECT_ID=your_project_id

# Midnight Network
VITE_MIDNIGHT_RPC_URL=https://rpc.testnet-02.midnight.network
VITE_MIDNIGHT_INDEXER_URL=https://indexer.testnet-02.midnight.network/api/v1/graphql
VITE_MIDNIGHT_INDEXER_WS_URL=wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws
VITE_MIDNIGHT_PROVING_SERVER_URL=http://localhost:6300

# Network Configuration
VITE_DEFAULT_CHAIN=mainnet
VITE_ENABLE_TESTNETS=false
```

### Chains Configuration
Supported chains are configured in `config/chains.ts`:
- Ethereum Mainnet
- Sepolia Testnet
- Polygon
- Mumbai Testnet
- Arbitrum
- Arbitrum Sepolia
- Midnight Testnet (custom)

## Custom Hooks

### useWallet
Comprehensive wallet management hook with error handling:
```tsx
import { useWallet } from './hooks/useWallet';

const {
  address,
  isConnected,
  balance,
  connect,
  disconnect,
  switchChain,
  error,
  isLoading
} = useWallet();
```

### useWalletEvents
Monitor wallet events:
```tsx
import { useWalletEvents } from './hooks/useWallet';

useWalletEvents({
  onConnect: (address) => console.log('Connected:', address),
  onDisconnect: () => console.log('Disconnected'),
  onChainChange: (chainId) => console.log('Chain changed:', chainId),
  onAccountChange: (address) => console.log('Account changed:', address)
});
```

## Utilities

### Formatting Functions
```tsx
import { formatAddress, formatBalance, getChainName } from './lib/wallet';

formatAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f89590') // 0x742d...9590
formatBalance(BigInt('1000000000000000000'), 18) // 1
getChainName(1) // Ethereum
```

### Validation Functions
```tsx
import { isValidAddress, parseTokenAmount } from './lib/wallet';

isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f89590') // true
parseTokenAmount('1.5', 18) // 1500000000000000000n
```

## Midnight Protocol Integration

The Midnight wallet connector is prepared in `connectors/midnightConnector.ts`. When the official Midnight wallet SDK is available, update the connector to:

1. Install the Midnight wallet packages:
```bash
npm install @midnight-ntwrk/wallet @midnight-ntwrk/wallet-api
```

2. Update the connector to use the real Midnight SDK
3. Handle NIGHT and DUST token balances
4. Implement zero-knowledge proof generation for transactions

## Usage Examples

### Basic Implementation
```tsx
import { WalletProvider } from './providers/WalletProvider';
import { CustomConnectButton } from './components/wallet/RainbowKitButton';

function App() {
  return (
    <WalletProvider>
      <div className="app">
        <header>
          <CustomConnectButton />
        </header>
        {/* Your app content */}
      </div>
    </WalletProvider>
  );
}
```

### With Status Display
```tsx
import { WalletStatus } from './components/wallet/WalletStatus';
import { useAccount } from 'wagmi';

function Dashboard() {
  const { isConnected } = useAccount();
  
  return (
    <div>
      <WalletStatus />
      {isConnected && (
        <div>
          {/* Show protected content */}
        </div>
      )}
    </div>
  );
}
```

## Testing

To test wallet connections:

1. Install a supported wallet extension (e.g., MetaMask)
2. Run the development server
3. Click "Connect Wallet" and select your wallet
4. Approve the connection in your wallet
5. Test network switching and disconnection

## Security Considerations

- Never store private keys or seeds in the frontend
- Always validate addresses before transactions
- Use proper error handling for all wallet operations
- Implement rate limiting for RPC calls
- Consider implementing transaction simulation before execution