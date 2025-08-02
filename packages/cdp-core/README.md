# @nyxusd/cdp-core

Core business logic for the NyxUSD CDP (Collateralized Debt Position) system.

This package contains all the pure business logic implementations for CDP operations, validation, and state management functions. All functions follow functional programming principles with immutable data structures and explicit error handling using Result types.

## Features

- Pure functional approach with no side effects
- BigInt arithmetic for precise financial calculations
- Comprehensive validation and error handling
- Type-safe operations with branded types
- Modular design for easy testing and extension

## Installation

```bash
npm install @nyxusd/cdp-core
```

## Usage

```typescript
import { createCDP, validateCDPCreation } from '@nyxusd/cdp-core';

// Use the core functions directly
const result = createCDP(params, context);
```

## Package Structure

```
src/
├── create.ts         # CDP creation functions
├── deposit.ts        # Collateral deposit functions
├── withdraw.ts       # Collateral withdrawal functions
├── mint.ts          # Debt minting functions
├── burn.ts          # Debt burning functions
└── types.ts         # Core CDP type definitions
```

This package is intended to be used by blockchain adapters and the unified SDK.