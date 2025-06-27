/**
 * Example usage of the validation library
 * This file demonstrates how to use the various validation schemas and utilities
 */

import {
  // Schemas
  AddressSchema,
  AmountSchema,
  PriceSchema,
  CDPSchema,
  CreateCDPSchema,
  CollateralDepositSchema,

  // Validation functions
  validate,
  validateBatch,
  chain,
  combine,

  // Sanitization functions
  sanitizeAddress,
  sanitizeAmount,
  sanitizeString,

  // Common validators
  CommonValidators,
} from "./index.js";

/**
 * Basic validation examples
 */

// Example 1: Address validation
export const validateAddressExample = () => {
  console.log("=== Address Validation Example ===");

  const validAddress = "0x742D35Cc6634C0532925a3b8D";
  const invalidAddress = "not-an-address";

  const result1 = CommonValidators.address(validAddress);
  const result2 = CommonValidators.address(invalidAddress);

  console.log(
    "Valid address result:",
    result1.success ? result1.data : result1.error.message,
  );
  console.log(
    "Invalid address result:",
    result2.success ? result2.data : result2.error.message,
  );
};

// Example 2: Amount validation
export const validateAmountExample = () => {
  console.log("\n=== Amount Validation Example ===");

  const validAmount = "1000000000000000000"; // 1 ETH in wei
  const invalidAmount = "-500";

  const result1 = validate(AmountSchema, validAmount);
  const result2 = validate(AmountSchema, invalidAmount);

  console.log("Valid amount result:", result1.success);
  console.log(
    "Invalid amount result:",
    result2.success ? result2.data : result2.error.message,
  );
};

// Example 3: CDP creation validation
export const validateCDPCreationExample = () => {
  console.log("\n=== CDP Creation Validation Example ===");

  const validCDPData = {
    owner: "0x742d35Cc6634C0532925a3b8D",
    initialCollateral: {
      assetAddress: "0xA0b86a33E6441b8bD39f9b6c2F3c0d7",
      amount: "1000000000000000000000", // 1000 tokens
    },
    minCollateralizationRatio: 15000, // 150%
    timestamp: Date.now(),
  };

  const invalidCDPData = {
    owner: "invalid-address",
    initialCollateral: {
      assetAddress: "0xA0b86a33E6441b8bD39f9b6c2F3c0d7",
      amount: "-1000", // Negative amount
    },
  };

  const result1 = validate(CreateCDPSchema, validCDPData);
  const result2 = validate(CreateCDPSchema, invalidCDPData);

  console.log("Valid CDP creation:", result1.success);
  console.log(
    "Invalid CDP creation:",
    result2.success ? "Success" : `Error: ${result2.error.message}`,
  );
};

/**
 * Functional composition examples
 */

// Example 4: Chaining validations
export const chainValidationExample = () => {
  console.log("\n=== Chain Validation Example ===");

  const userAddress = "0x742d35Cc6634C0532925a3b8D";

  // Simulate a function that checks if address has sufficient balance
  const checkBalance = (address: string) => {
    // Mock balance check
    const mockBalance = BigInt("1000000000000000000000"); // 1000 tokens
    if (mockBalance > BigInt("500000000000000000000")) {
      // > 500 tokens
      return {
        success: true as const,
        data: { address, balance: mockBalance.toString() },
      };
    }
    return {
      success: false as const,
      error: { code: "INSUFFICIENT_BALANCE", message: "Insufficient balance" },
    };
  };

  const result = chain(validate(AddressSchema, userAddress), (validAddress) =>
    checkBalance(validAddress),
  );

  console.log(
    "Chained validation result:",
    result.success ? "Valid with sufficient balance" : result.error.message,
  );
};

// Example 5: Combining multiple validations
export const combineValidationExample = () => {
  console.log("\n=== Combine Validation Example ===");

  const address = "0x742d35Cc6634C0532925a3b8D";
  const amount = "1000000000000000000";
  const price = 1234.56;

  const result = combine(
    validate(AddressSchema, address),
    validate(AmountSchema, amount),
    validate(PriceSchema, price),
  );

  if (result.success) {
    const [validAddress, validAmount, validPrice] = result.data;
    console.log("All validations passed:", {
      validAddress,
      validAmount,
      validPrice,
    });
  } else {
    console.log("Some validations failed:", result.error.length, "errors");
  }
};

/**
 * Sanitization examples
 */

// Example 6: Address sanitization
export const sanitizationExample = () => {
  console.log("\n=== Sanitization Example ===");

  const dirtyAddress = "  0X742D35CC6634C0532925A3B8D  ";
  const dirtyAmount = "1,000.50 ETH";
  const dirtyString = '<script>alert("xss")</script>Hello World!';

  const cleanAddress = sanitizeAddress(dirtyAddress);
  const cleanAmount = sanitizeAmount(dirtyAmount);
  const cleanString = sanitizeString(dirtyString, {
    escapeHtml: true,
    maxLength: 100,
    trim: true,
  });

  console.log("Original address:", `"${dirtyAddress}"`);
  console.log("Sanitized address:", `"${cleanAddress}"`);
  console.log("Original amount:", `"${dirtyAmount}"`);
  console.log("Sanitized amount:", `"${cleanAmount}"`);
  console.log("Original string:", `"${dirtyString}"`);
  console.log("Sanitized string:", `"${cleanString}"`);
};

/**
 * Batch validation examples
 */

// Example 7: Batch validation
export const batchValidationExample = () => {
  console.log("\n=== Batch Validation Example ===");

  const addresses = [
    "0x742d35Cc6634C0532925a3b8D",
    "0xA0b86a33E6441b8bD39f9b6c2F3c0d7",
    "invalid-address",
    "0x1234567890123456789012345678901234567890",
  ];

  const result = validateBatch(AddressSchema, addresses, {
    maxItems: 10,
    failFast: false,
  });

  if (result.success) {
    console.log("All addresses valid:", result.data);
  } else {
    console.log("Batch validation failed:", result.error.message);
  }
};

/**
 * Advanced usage examples
 */

// Example 8: Collateral deposit validation
export const collateralDepositExample = () => {
  console.log("\n=== Collateral Deposit Example ===");

  const depositData = {
    cdpId: "cdp-12345",
    assetAddress: "0xA0b86a33E6441b8bD39f9b6c2F3c0d7",
    amount: "500000000000000000000", // 500 tokens
    depositor: "0x742d35Cc6634C0532925a3b8D",
    minHealthFactor: 1.2,
    slippageTolerance: 100, // 1%
    timestamp: Date.now(),
  };

  const result = validate(CollateralDepositSchema, depositData);

  if (result.success) {
    console.log("Collateral deposit validation passed:", {
      cdpId: result.data.cdpId,
      amount: result.data.amount,
      depositor: result.data.depositor,
    });
  } else {
    console.log("Collateral deposit validation failed:", result.error.message);
  }
};

/**
 * Error handling examples
 */

// Example 9: Detailed error handling
export const errorHandlingExample = () => {
  console.log("\n=== Error Handling Example ===");

  const invalidData = {
    owner: "not-an-address",
    status: "invalid-status",
    collateralValue: -100,
    debtAmount: "not-a-number",
    healthFactor: "invalid",
  };

  const result = validate(CDPSchema, invalidData);

  if (!result.success) {
    console.log("Validation error details:");
    console.log("- Code:", result.error.code);
    console.log("- Message:", result.error.message);
    console.log("- Field:", result.error.field);
    if (result.error.details) {
      console.log("- Details:", JSON.stringify(result.error.details, null, 2));
    }
  }
};

/**
 * Performance demonstration
 */

// Example 10: Performance measurement
export const performanceExample = () => {
  console.log("\n=== Performance Example ===");

  const testData = Array.from(
    { length: 1000 },
    (_, i) => `0x${i.toString(16).padStart(40, "0")}`,
  );

  console.time("Batch validation of 1000 addresses");
  const result = validateBatch(AddressSchema, testData);
  console.timeEnd("Batch validation of 1000 addresses");

  console.log(
    "Validation result:",
    result.success ? "All valid" : "Some failed",
  );
};

/**
 * Run all examples
 */
export const runAllExamples = () => {
  console.log("🚀 Running @nyxusd/validators examples...\n");

  try {
    validateAddressExample();
    validateAmountExample();
    validateCDPCreationExample();
    chainValidationExample();
    combineValidationExample();
    sanitizationExample();
    batchValidationExample();
    collateralDepositExample();
    errorHandlingExample();
    performanceExample();

    console.log("\n✅ All examples completed successfully!");
  } catch (error) {
    console.error("\n❌ Error running examples:", error);
  }
};

// Export sample data for testing
export const sampleData = {
  validAddress: "0x742d35Cc6634C0532925a3b8D",
  validAmount: "1000000000000000000000",
  validPrice: 1234.56,
  validTimestamp: Date.now(),
  validHash:
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",

  validCDP: {
    id: "cdp-12345",
    owner: "0x742d35Cc6634C0532925a3b8D",
    status: "active" as const,
    collateralValue: 2000.0,
    debtAmount: "1000000000000000000000",
    availableCredit: "500000000000000000000",
    collateralizationRatio: 200.0,
    healthFactor: 2.0,
    liquidationPrice: 800.0,
    riskLevel: "low" as const,
    stabilityFee: 500, // 5%
    accruedFees: "10000000000000000000",
    lastFeeUpdate: Date.now(),
    createdAt: Date.now() - 86400000, // 1 day ago
    lastUpdated: Date.now(),
  },

  validCollateralConfig: {
    address: "0xA0b86a33E6441b8bD39f9b6c2F3c0d7",
    symbol: "WETH",
    name: "Wrapped Ethereum",
    decimals: 18,
    assetType: "wrapped" as const,
    isActive: true,
    liquidationThreshold: 8000, // 80%
    liquidationPenalty: 1000, // 10%
    maxLoanToValue: 7500, // 75%
    minCollateralRatio: 15000, // 150%
    stabilityFee: 500, // 5%
    debtCeiling: "10000000000000000000000000", // 10M tokens
    debtFloor: "1000000000000000000000", // 1K tokens
    oracleAddress: "0x1234567890123456789012345678901234567890",
    oraclePriceFeedId: "WETH-USD",
    priceValidityPeriod: 300, // 5 minutes
    chainId: 1,
    network: "mainnet" as const,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
};

// If this file is run directly, execute all examples
// Note: This would work in ES modules environment
// if (import.meta.url === `file://${process.argv[1]}`) {
//   runAllExamples();
// }
