# @nyxusd/cdp-adapters

Blockchain adapters for the NyxUSD CDP (Collateralized Debt Position) system.

This package provides adapter implementations for different blockchain networks, allowing the CDP system to operate across multiple chains while maintaining a consistent interface.

## Features

- Adapter pattern implementation for blockchain operations
- Support for Ethereum, Polygon, Arbitrum, and Midnight networks
- Unified interface for all CDP operations
- Easy to extend with new blockchain networks

## Installation

```bash
npm install @nyxusd/cdp-adapters
```

## Usage

```typescript
import { createCDPAdapter } from '@nyxusd/cdp-adapters';

// Create an adapter for a specific blockchain
const ethereumAdapter = createCDPAdapter('ethereum', config);
const polygonAdapter = createCDPAdapter('polygon', config);
```

## Package Structure

```
src/
├── types.ts         # Adapter interface definitions
├── baseAdapter.ts   # Base adapter class
├── ethereum/        # Ethereum adapter implementation
├── polygon/         # Polygon adapter implementation
├── arbitrum/        # Arbitrum adapter implementation
└── midnight/        # Midnight adapter implementation
```

Each adapter implements the same interface but handles blockchain-specific concerns such as transaction signing, contract address resolution, and network configuration.