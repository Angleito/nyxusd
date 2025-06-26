# NYXUSD - Functional CDP System on Midnight Protocol

A privacy-preserving Collateralized Debt Position (CDP) system built using functional programming principles on the Midnight Protocol. This project implements a stablecoin backed by collateral assets with privacy-first design and mathematical rigor.

## Architecture Overview

This monorepo follows a functional architecture approach where:

- **Pure Functions**: All business logic is implemented as pure functions without side effects
- **Immutable Data**: State transformations use immutable data structures
- **Type Safety**: Leverages TypeScript's strict mode with comprehensive type definitions
- **Composability**: Small, focused functions that compose into larger operations
- **Error Handling**: Uses functional error handling patterns (Either, Option types)

## Project Structure

```
nyxusd/
├── packages/          # Applications and services
│   ├── cdp-engine/    # Core CDP management engine
│   ├── oracle-service/ # Price oracle aggregation
│   ├── liquidation-engine/ # Liquidation logic
│   ├── governance/    # Governance mechanisms
│   ├── api/          # REST API service
│   └── cli/          # Command-line interface
├── libs/             # Shared libraries
│   ├── core/         # Core business logic
│   ├── types/        # Type definitions
│   ├── utils/        # Utility functions
│   ├── validators/   # Input validation
│   ├── crypto/       # Cryptographic operations
│   ├── contracts/    # Smart contract interfaces
│   ├── midnight-integration/ # Midnight Protocol integration
│   └── functional-utils/ # FP utility functions
└── tools/            # Build and development tools
```

## Key Features

- **Privacy-Preserving**: Built on Midnight Protocol for transaction privacy
- **Functional Design**: Immutable state, pure functions, type safety
- **Modular Architecture**: Composable libraries and services
- **Type-Safe**: Comprehensive TypeScript with strict mode
- **Zero-Knowledge**: Leverages ZK proofs for privacy
- **Decentralized**: No central authority or single points of failure

## Functional Programming Principles

### Pure Functions
All core business logic is implemented as pure functions:

```typescript
// Example: CDP ratio calculation
const calculateCollateralizationRatio = (
  collateralValue: CollateralValue,
  debtAmount: DebtAmount
): CollateralizationRatio => {
  return pipe(
    collateralValue,
    multiply(PRECISION_FACTOR),
    divide(debtAmount),
    CollateralizationRatio.of
  )
}
```

### Immutable State Management
State changes are modeled as transformations:

```typescript
// Example: CDP state transition
const updateCdpCollateral = (
  cdp: Cdp,
  additionalCollateral: CollateralAmount
): Either<CdpError, Cdp> => {
  return pipe(
    cdp,
    addCollateral(additionalCollateral),
    validateMinimumRatio,
    map(recalculateHealth)
  )
}
```

### Error Handling
Uses functional error handling patterns:

```typescript
// Example: Validation chain
const validateCdpOperation = (
  operation: CdpOperation
): Either<ValidationError, ValidatedOperation> => {
  return pipe(
    operation,
    validateCollateralAmount,
    chain(validateDebtAmount),
    chain(validateRatioRequirements),
    map(ValidatedOperation.of)
  )
}
```

## Setup Instructions

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/nyxusd.git
   cd nyxusd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build all packages**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm run test
   ```

5. **Start development environment**
   ```bash
   npm run dev
   ```

### Development Workflow

1. **Create a new library**
   ```bash
   nx generate @nrwl/node:library my-lib --directory=libs
   ```

2. **Create a new package**
   ```bash
   nx generate @nrwl/node:application my-app --directory=packages
   ```

3. **Run specific package/library**
   ```bash
   nx serve my-app
   nx test my-lib
   nx lint my-lib
   ```

4. **Build affected packages**
   ```bash
   npm run build:affected
   ```

5. **Run tests for affected packages**
   ```bash
   npm run test:affected
   ```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build all packages and libraries |
| `npm run test` | Run all tests |
| `npm run lint` | Lint all code |
| `npm run type-check` | TypeScript type checking |
| `npm run format` | Format code with Prettier |
| `npm run validate` | Run full validation (lint + type-check + test) |
| `npm run dev` | Start development servers |
| `npm run graph` | View dependency graph |

## Path Mappings

The project uses TypeScript path mappings for clean imports:

```typescript
// Instead of relative imports
import { CdpEngine } from '../../../packages/cdp-engine/src'

// Use path mappings
import { CdpEngine } from '@nyxusd/cdp-engine'
```

Available path mappings:
- `@nyxusd/core` - Core business logic
- `@nyxusd/types` - Type definitions
- `@nyxusd/utils` - Utility functions
- `@nyxusd/validators` - Input validation
- `@nyxusd/crypto` - Cryptographic operations
- `@nyxusd/contracts` - Smart contract interfaces
- `@nyxusd/midnight-integration` - Midnight Protocol integration
- `@nyxusd/functional-utils` - Functional programming utilities
- `@nyxusd/cdp-engine` - CDP management engine
- `@nyxusd/oracle-service` - Price oracle service
- `@nyxusd/liquidation-engine` - Liquidation engine
- `@nyxusd/governance` - Governance mechanisms
- `@nyxusd/api` - REST API service
- `@nyxusd/cli` - Command-line interface

## Code Style and Conventions

### Naming Conventions
- **Functions**: `camelCase` with descriptive verbs (`calculateRatio`, `validateInput`)
- **Types**: `PascalCase` (`CollateralAmount`, `CdpState`)
- **Constants**: `SCREAMING_SNAKE_CASE` (`MIN_COLLATERAL_RATIO`)
- **Modules**: `kebab-case` (`cdp-engine`, `oracle-service`)

### Function Composition
Use `pipe` for sequential operations:

```typescript
const processTransaction = (tx: Transaction) =>
  pipe(
    tx,
    validateTransaction,
    chain(executeTransaction),
    chain(updateState),
    fold(handleError, handleSuccess)
  )
```

### Type Definitions
Define explicit types for all data:

```typescript
interface Cdp {
  readonly id: CdpId
  readonly owner: Address
  readonly collateral: CollateralAmount
  readonly debt: DebtAmount
  readonly createdAt: Timestamp
}
```

## Testing Strategy

- **Unit Tests**: Test pure functions in isolation
- **Integration Tests**: Test component interactions
- **Property Tests**: Use property-based testing for mathematical operations
- **Type Tests**: Verify TypeScript type correctness

## Contributing

1. Follow functional programming principles
2. Write pure functions where possible
3. Use immutable data structures
4. Include comprehensive type definitions
5. Write tests for all new functionality
6. Follow the established naming conventions

## License

MIT License - see LICENSE file for details.