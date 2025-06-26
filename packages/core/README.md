# @nyxusd/core

Core business logic package for the NyxUSD CDP system on Midnight protocol.

## Overview

This package contains the fundamental types and interfaces for the NyxUSD system, following functional programming principles with immutable data structures and comprehensive type safety.

## Structure

```
src/
├── cdp/          # CDP business logic (placeholder)
├── math/         # Financial mathematics operations (placeholder)
├── validation/   # Validation functions (placeholder)
├── types/        # Type definitions
│   ├── cdp.ts           # CDP types and interfaces
│   ├── collateral.ts    # Collateral types and interfaces
│   ├── state.ts         # System and application state types
│   └── index.ts         # Type exports
└── index.ts      # Main package exports
```

## Key Features

- **Immutable Data Structures**: All interfaces use readonly properties
- **Type Safety**: Extensive use of TypeScript discriminated unions
- **Functional Programming**: Designed for functional composition patterns
- **BigInt Support**: Precision-safe financial calculations
- **Error Handling**: Result/Either patterns for error management
- **Comprehensive Documentation**: JSDoc comments throughout

## Type Definitions

### CDP Types (`src/types/cdp.ts`)
- `CDP`: Core CDP data structure
- `CDPState`: CDP lifecycle states
- `CDPConfig`: Configuration parameters
- `CDPOperation`: Operation types
- `CDPError`: Error types

### Collateral Types (`src/types/collateral.ts`)
- `CollateralType`: Collateral type definitions
- `Collateral`: Individual collateral positions
- `CollateralPrice`: Price information
- `CollateralOperation`: Operation types

### State Types (`src/types/state.ts`)
- `SystemState`: Global system state
- `AppState`: Complete application state
- `UserState`: User-specific state
- Error and loading states

## Usage

```typescript
import { 
  CDP, 
  CDPState, 
  CollateralType, 
  SystemState 
} from '@nyxusd/core'

// Type-safe CDP operations
const cdp: CDP = {
  // ... CDP properties
}
```

## Development

- `npm run build`: Compile TypeScript
- `npm run typecheck`: Type checking only
- `npm run test`: Run tests (when implemented)

## Dependencies

- `fp-ts`: Functional programming utilities
- `immutable`: Immutable data structures
- `io-ts`: Runtime type validation

Note: Dependencies are configured but not yet installed in the development environment.