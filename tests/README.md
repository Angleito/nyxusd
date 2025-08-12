# NyxUSD Tests

Simplified test suite for NyxUSD project.

## Structure

- `unit/` - Unit tests
- `integration/` - Integration tests  
- `property/` - Property-based tests
- `utils/` - Shared test utilities

## Running Tests

```bash
npm test              # All tests
npm run test:unit     # Unit tests only
npm run test:integration  # Integration tests only
```

## Test Utilities

Import shared utilities from `utils/testUtils.ts` to avoid duplication:

```typescript
import { testUtils } from './utils/testUtils';

const mockCDP = testUtils.generateMockCDP();
const mockWallet = testUtils.generateMockWallet();
```
