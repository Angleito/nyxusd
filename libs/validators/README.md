# @nyxusd/validators

A comprehensive validation library with Zod schemas for the NyxUSD CDP system. This library provides runtime type validation, data sanitization, and functional composition patterns for secure and reliable data handling.

## Features

- **Runtime Type Validation**: Comprehensive Zod schemas for all CDP system types
- **Data Sanitization**: Security-focused input sanitization to prevent common vulnerabilities
- **Functional Composition**: Result types and functional patterns for error handling
- **BigInt Support**: Custom BigInt validation utilities for blockchain amounts
- **Security First**: Built-in protection against XSS, SQL injection, and other common attacks
- **TypeScript Integration**: Full TypeScript support with type inference from schemas

## Installation

```bash
npm install @nyxusd/validators
```

## Quick Start

```typescript
import { 
  CommonValidators, 
  AddressSchema, 
  AmountSchema,
  validate,
  sanitizeAddress 
} from '@nyxusd/validators';

// Basic validation
const addressResult = CommonValidators.address('0x742d35Cc6634C0532925a3b8D');
if (addressResult.success) {
  console.log('Valid address:', addressResult.data);
} else {
  console.error('Invalid address:', addressResult.error.message);
}

// Sanitization
const cleanAddress = sanitizeAddress('  0X742D35CC6634C0532925A3B8D  ');
console.log(cleanAddress); // '0x742d35cc6634c0532925a3b8d'

// Complex validation
const cdpData = {
  owner: '0x742d35Cc6634C0532925a3b8D',
  collateralValue: 1000.50,
  debtAmount: '500000000000000000000', // 500 tokens in wei
  healthFactor: 2.5
};

const result = validate(CDPSchema, cdpData);
if (result.success) {
  // Data is fully validated and typed
  console.log('CDP Health Factor:', result.data.healthFactor);
}
```

## Core Schemas

### Common Schemas

```typescript
import { 
  AddressSchema,
  AmountSchema,
  PriceSchema,
  BigIntSchema,
  TimestampSchema,
  HashSchema,
  BasisPointsSchema,
  PercentageSchema 
} from '@nyxusd/validators';

// Address validation (Ethereum format)
const address = AddressSchema.parse('0x742d35Cc6634C0532925a3b8D');

// Amount validation (BigInt)
const amount = AmountSchema.parse('1000000000000000000'); // 1 ETH in wei

// Price validation (with precision limits)
const price = PriceSchema.parse(1234.567890); // Rounded to 6 decimals

// Basis points (0-10000 = 0-100%)
const liquidationThreshold = BasisPointsSchema.parse(8000); // 80%
```

### CDP Schemas

```typescript
import { 
  CDPSchema,
  CreateCDPSchema,
  CDPCollateralUpdateSchema,
  CDPDebtUpdateSchema,
  CDPLiquidationSchema 
} from '@nyxusd/validators';

// Create a new CDP
const createCdpData = {
  owner: '0x742d35Cc6634C0532925a3b8D',
  initialCollateral: {
    assetAddress: '0xA0b86a33E6441b8bD39f9b6c2F3c0d7',
    amount: '1000000000000000000000' // 1000 tokens
  },
  minCollateralizationRatio: 15000 // 150%
};

const result = validate(CreateCDPSchema, createCdpData);
```

### Collateral Schemas

```typescript
import { 
  CollateralAssetConfigSchema,
  CollateralDepositSchema,
  CollateralWithdrawalSchema,
  CollateralLiquidationSchema 
} from '@nyxusd/validators';

// Configure a collateral asset
const assetConfig = {
  address: '0xA0b86a33E6441b8bD39f9b6c2F3c0d7',
  symbol: 'WETH',
  name: 'Wrapped Ethereum',
  decimals: 18,
  assetType: 'wrapped',
  isActive: true,
  liquidationThreshold: 8000, // 80%
  liquidationPenalty: 1000,   // 10%
  maxLoanToValue: 7500,       // 75%
  // ... other required fields
};

const configResult = validate(CollateralAssetConfigSchema, assetConfig);
```

## Validation Functions

### Basic Validation

```typescript
import { validate, validateAsync, Result } from '@nyxusd/validators';

// Synchronous validation
const result: Result<Address, ValidationError> = validate(AddressSchema, userInput);

if (result.success) {
  // result.data is typed as Address
  console.log('Valid address:', result.data);
} else {
  // result.error contains validation details
  console.error('Validation failed:', result.error.message);
}

// Asynchronous validation
const asyncResult = await validateAsync(ComplexSchema, userData);
```

### Functional Composition

```typescript
import { chain, map, combine, alt } from '@nyxusd/validators';

// Chain validations
const result = chain(
  validate(AddressSchema, userAddress),
  (address) => validateUserPermissions(address)
);

// Map over successful results
const upperCaseResult = map(
  validate(z.string(), userInput),
  (str) => str.toUpperCase()
);

// Combine multiple validations
const combinedResult = combine(
  validate(AddressSchema, address),
  validate(AmountSchema, amount),
  validate(PriceSchema, price)
);

// Alternative validation (first success)
const fallbackResult = alt(
  validate(EmailSchema, input),
  validate(UsernameSchema, input)
);
```

### Batch Validation

```typescript
import { validateBatch, validateArray } from '@nyxusd/validators';

// Validate multiple items of the same type
const addresses = ['0x742d35Cc...', '0xA0b86a33...', '0x1234567...'];
const batchResult = validateBatch(AddressSchema, addresses, {
  maxItems: 100,
  failFast: true
});

// Validate array with individual error reporting
const arrayResult = validateArray(AmountSchema, amounts);
if (!arrayResult.success) {
  // arrayResult.error contains array of ValidationError
  arrayResult.error.forEach((error, index) => {
    console.error(`Item ${index}:`, error.message);
  });
}
```

## Sanitization

### Basic Sanitization

```typescript
import { 
  sanitizeString,
  sanitizeAddress,
  sanitizeAmount,
  sanitizePrice,
  sanitizeUserContent 
} from '@nyxusd/validators';

// Address sanitization
const cleanAddress = sanitizeAddress('  0X742D35CC6634C0532925A3B8D  ');
// Result: '0x742d35cc6634c0532925a3b8d'

// Amount sanitization (converts to BigInt string)
const cleanAmount = sanitizeAmount('1,000.50');
// Result: '1000500000000000000000' (with 18 decimals)

// User content sanitization
const cleanContent = sanitizeUserContent('<script>alert("xss")</script>Hello');
// Result: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;Hello'
```

### Custom Sanitization

```typescript
import { sanitizeString, SanitizationOptions } from '@nyxusd/validators';

const options: SanitizationOptions = {
  maxLength: 50,
  allowedChars: /a-zA-Z0-9\s\-_/,
  trim: true,
  toLowerCase: true,
  escapeHtml: true,
  removeSqlKeywords: true
};

const sanitized = sanitizeString(userInput, options);
```

### Object Sanitization

```typescript
import { sanitizeObject, sanitizeBatch } from '@nyxusd/validators';

// Sanitize entire objects
const sanitizedUser = sanitizeObject(userData, {
  email: sanitizeEmail,
  address: sanitizeAddress,
  amount: sanitizeAmount
});

// Batch sanitization
const sanitized = sanitizeBatch(formData, {
  name: (value) => sanitizeString(value, { maxLength: 100 }),
  email: sanitizeEmail,
  address: sanitizeAddress
});
```

## Error Handling

### Validation Errors

```typescript
interface ValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly details?: Record<string, unknown>;
}

// Example error handling
const result = validate(CDPSchema, userData);
if (!result.success) {
  const error = result.error;
  console.error(`Validation failed: ${error.message}`);
  console.error(`Field: ${error.field}`);
  console.error(`Code: ${error.code}`);
  
  if (error.details) {
    console.error('Details:', error.details);
  }
}
```

### Custom Error Messages

```typescript
import { z } from 'zod';

const CustomAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Please provide a valid Ethereum address')
  .transform((val) => val.toLowerCase());

const result = validate(CustomAddressSchema, userInput);
```

## Advanced Usage

### Conditional Validation

```typescript
import { createConditionalSchema } from '@nyxusd/validators';

const ConditionalSchema = createConditionalSchema(
  (data: any) => data.type === 'cdp',
  CDPSchema,
  CollateralSchema
);
```

### Versioned Schemas

```typescript
import { createVersionedSchema } from '@nyxusd/validators';

const VersionedCDPSchema = createVersionedSchema({
  'v1': CDPSchemaV1,
  'v2': CDPSchemaV2,
  'latest': CDPSchemaV2
});

const result = validate(VersionedCDPSchema, {
  version: 'v2',
  data: cdpData
});
```

### Validation Middleware

```typescript
import { createValidationMiddleware } from '@nyxusd/validators';

const validateCDP = createValidationMiddleware(CDPSchema, { sanitize: true });

validateCDP(
  userData,
  (validatedData) => {
    // Process validated data
    console.log('Valid CDP:', validatedData);
  },
  (error) => {
    // Handle validation error
    console.error('Validation failed:', error.message);
  }
);
```

## Performance Monitoring

```typescript
import { validationMetrics } from '@nyxusd/validators';

// Metrics are automatically collected
const metrics = validationMetrics.getMetrics();
console.log('Total validations:', metrics.totalValidations);
console.log('Success rate:', metrics.successfulValidations / metrics.totalValidations);
console.log('Average validation time:', metrics.averageValidationTime);
```

## Security Features

- **XSS Prevention**: HTML escaping and content sanitization
- **SQL Injection Protection**: Keyword filtering and parameterization
- **Input Length Limits**: Configurable maximum lengths to prevent DoS
- **Character Filtering**: Whitelist-based character validation
- **Null Byte Removal**: Protection against null byte attacks
- **Case Normalization**: Consistent case handling for addresses and hashes

## Best Practices

1. **Always Validate External Input**: Never trust user input or external API responses
2. **Sanitize Before Validation**: Clean data before applying validation rules
3. **Use Result Types**: Handle validation failures gracefully with Result types
4. **Compose Validations**: Build complex validations from simple, reusable components
5. **Monitor Performance**: Track validation metrics in production
6. **Version Your Schemas**: Plan for schema evolution and backward compatibility

## Contributing

When adding new validation schemas:

1. Follow the existing naming conventions
2. Include comprehensive JSDoc comments
3. Add corresponding TypeScript type exports
4. Include sanitization functions for new data types
5. Add tests for all validation scenarios
6. Update this documentation

## License

MIT License - see LICENSE file for details.