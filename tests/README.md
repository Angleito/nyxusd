# NYXUSD Test Infrastructure

This directory contains comprehensive testing infrastructure for the NYXUSD project, including unit tests, integration tests, property-based tests, and testing utilities.

## Directory Structure

```
tests/
├── unit/                   # Unit tests for individual components
├── integration/            # Integration tests for component interactions
├── property/              # Property-based tests for mathematical properties
├── fixtures/              # Test data and sample configurations
├── utils/                 # Testing utilities and helpers
└── README.md             # This file
```

## Test Types

### Unit Tests (`./unit/`)

Unit tests focus on testing individual functions and components in isolation. They use mocks and stubs to isolate the system under test.

**Example:**
```typescript
import { Result } from '@nyxusd/functional-utils';
import { ResultTestHelpers } from '../utils/result-helpers';

test('should validate CDP successfully', () => {
  const result = validateCDP(validCDPData);
  expect(result).toBeOk();
  expect(ResultTestHelpers.expectOk(result)).toEqual(expectedCDP);
});
```

### Integration Tests (`./integration/`)

Integration tests verify that different components work together correctly. They test complete workflows and data flows between components.

**Example:**
```typescript
test('should complete CDP liquidation process', async () => {
  const result = await liquidateCDP(unhealthyCDP);
  expect(result.success).toBe(true);
  expect(result.liquidation.finalStatus).toBe('liquidated');
});
```

### Property-Based Tests (`./property/`)

Property-based tests use fast-check to generate random test data and verify mathematical properties and invariants hold across a wide range of inputs.

**Example:**
```typescript
import * as fc from 'fast-check';
import { PropertyTesting } from '../utils/property-testing';

PropertyTesting.run(
  'Health factor is always non-negative',
  () => {
    fc.assert(
      fc.property(
        DataGenerators.cdp.cdpConfig(),
        (cdp) => cdp.healthFactor >= 0
      )
    );
  }
);
```

## Test Utilities

### Result Helpers (`./utils/result-helpers.ts`)

Utilities for testing Result types with custom matchers and assertion helpers:

```typescript
import { ResultTestHelpers } from './utils/result-helpers';

// Custom matchers
expect(result).toBeOk();
expect(result).toBeErrWith('error message');

// Assertion helpers
const value = ResultTestHelpers.expectOk(result);
const error = ResultTestHelpers.expectErr(result);
```

### Data Generators (`./utils/data-generators.ts`)

Fast-check generators for creating test data:

```typescript
import { DataGenerators } from './utils/data-generators';

// Generate valid CDP configuration
const cdpGen = DataGenerators.cdp.cdpConfig();

// Generate financial data
const priceGen = DataGenerators.financial.price();
const amountGen = DataGenerators.financial.collateralAmount();
```

### Property Testing (`./utils/property-testing.ts`)

Utilities for property-based testing with pre-defined mathematical properties:

```typescript
import { PropertyTesting } from './utils/property-testing';

// Test mathematical properties
PropertyTesting.math.associativity(gen, operation)();
PropertyTesting.financial.healthFactorConsistency(gen, ...functions)();
```

## Test Fixtures

### Sample Data (`./fixtures/`)

Comprehensive test data including:

- **CDP Fixtures**: Sample CDPs, operations, liquidations
- **Collateral Fixtures**: Asset configurations, balances, operations  
- **Oracle Fixtures**: Price feeds, stress scenarios, failure modes

```typescript
import { CDPFixtures, CollateralFixtures } from './fixtures';

const sampleCDP = CDPFixtures.samples.cdps[0];
const ethAsset = CollateralFixtures.samples.assets[0];
```

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Types
```bash
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:property       # Property-based tests only
```

### With Coverage
```bash
npm run test:coverage       # All tests with coverage
npm run test:coverage:unit  # Unit tests with coverage
```

### Watch Mode
```bash
npm run test:watch          # Watch mode for development
```

## Configuration

### Jest Configuration

The test infrastructure uses Jest with TypeScript support:

- **jest.config.js**: Root configuration with project setup
- **jest.preset.js**: Shared configuration for all packages
- Individual package configurations extend the preset

### Property Test Configuration

Property-based tests are configured in `./utils/jest-setup.ts`:

```typescript
export const PROPERTY_TEST_CONFIG = {
  numRuns: process.env.CI ? 1000 : 100,  // More runs in CI
  timeout: 5000,                         // 5 second timeout
  seed: process.env.FAST_CHECK_SEED,     // Reproducible tests
  verbose: Boolean(process.env.CI),      // Verbose in CI
};
```

## Custom Matchers

The test infrastructure provides custom Jest matchers for Result types:

```typescript
expect(result).toBeOk();                    // Check if Result is Ok
expect(result).toBeErr();                   // Check if Result is Err
expect(result).toBeOkWith(expectedValue);   // Check Ok with specific value
expect(result).toBeErrWith(expectedError);  // Check Err with specific error
expect(value).toSatisfyProperty('positive'); // Check mathematical properties
```

## Mathematical Properties Tested

The property-based tests verify mathematical invariants including:

### CDP Properties
- Health factor non-negativity
- Collateralization ratio monotonicity
- Fee accrual over time
- Liquidation thresholds

### Financial Mathematics
- Interest rate calculations
- Present/future value relationships
- Risk metric calculations
- Portfolio value properties

### Result Type Properties
- Monad laws (left identity, right identity, associativity)
- Type safety preservation
- Error propagation

## Performance Testing

Performance utilities are included for benchmarking:

```typescript
import { ResultTestHelpers } from './utils/result-helpers';

// Measure operation time
const { result, timeMs } = await ResultTestHelpers.performance.measureTime(
  () => expensiveOperation(),
  'Operation description'
);

// Benchmark multiple operations
const benchmarks = await ResultTestHelpers.performance.benchmarkResultOperations(
  testData,
  operations,
  iterations
);
```

## Best Practices

### Writing Tests

1. **Use descriptive test names** that explain what is being tested
2. **Follow the AAA pattern**: Arrange, Act, Assert
3. **Test both happy path and error cases**
4. **Use property-based tests for mathematical functions**
5. **Mock external dependencies in unit tests**

### Test Data

1. **Use fixtures for complex test data**
2. **Generate random data for property tests**
3. **Include edge cases and boundary conditions**
4. **Test with both valid and invalid inputs**

### Performance

1. **Set reasonable timeout limits**
2. **Use performance tests for critical paths**
3. **Monitor test execution time in CI**
4. **Profile slow tests and optimize**

## Continuous Integration

The test infrastructure is designed for CI/CD:

- **Parallel execution** with Jest workers
- **Coverage reporting** with multiple formats
- **Property test scaling** based on environment
- **Test result artifacts** for debugging

## Debugging Tests

### Verbose Output
```bash
npm test -- --verbose
```

### Run Single Test File
```bash
npm test -- tests/unit/result-validation.test.ts
```

### Debug Property Tests
```bash
FAST_CHECK_SEED=42 npm run test:property
```

### Coverage Reports
Coverage reports are generated in the `coverage/` directory with:
- HTML reports for browser viewing
- LCOV reports for CI integration
- JSON reports for programmatic access

## Contributing

When adding new tests:

1. Place unit tests in `./unit/`
2. Place integration tests in `./integration/`
3. Add property-based tests for mathematical functions
4. Create fixtures for complex test data
5. Update this README for new testing patterns

For questions about the test infrastructure, see the test utility documentation or contact the development team.