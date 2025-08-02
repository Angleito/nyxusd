# @nyxusd/cdp-sdk

Unified SDK for NyxUSD CDP (Collateralized Debt Position) operations across multiple blockchains.

This package provides a simple, consistent interface for interacting with CDPs on different blockchain networks. It abstracts away the blockchain-specific implementation details and provides a unified API for all CDP operations.

## Features

- Unified interface for multi-chain CDP operations
- Runtime switching between blockchain networks
- Re-exports core types for convenience
- Built on top of @nyxusd/cdp-core and @nyxusd/cdp-adapters

## Installation

```bash
npm install @nyxusd/cdp-sdk
```

## Usage

```typescript
import { NyxUSD_CDP_SDK } from '@nyxusd/cdp-sdk';

// Initialize the SDK with a specific blockchain
const cdpSDK = new NyxUSD_CDP_SDK({
  chain: 'ethereum',
  config: {
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
    contracts: {
      cdpManager: '0x...',
      nyxUSD: '0x...',
      oracle: '0x...',
    }
  }
});

// Create a CDP
const result = await cdpSDK.createCDP(params);

// Switch to a different blockchain
cdpSDK.switchChain({
  chain: 'polygon',
  config: polygonConfig
});
```

## Package Structure

```
src/
└── index.ts         # Unified SDK implementation
```

The SDK automatically selects the appropriate blockchain adapter based on the configuration and provides a consistent API for all CDP operations.