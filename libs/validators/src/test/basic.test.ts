/**
 * Basic tests for the validation library
 * These tests ensure that the core validation functionality works correctly
 */

import {
  AddressSchema,
  AmountSchema,
  PriceSchema,
  BigIntSchema,
  validate,
  sanitizeAddress,
  sanitizeAmount,
  CommonValidators,
  sampleData,
} from "../index";

describe("@nyxusd/validators - Basic Tests", () => {
  describe("Address Validation", () => {
    it("should validate correct Ethereum addresses", () => {
      const validAddresses = [
        "0x742d35Cc6634C0532925a3b8D",
        "0xA0b86a33E6441b8bD39f9b6c2F3c0d7",
        "0x1234567890123456789012345678901234567890",
      ];

      validAddresses.forEach((address) => {
        const result = validate(AddressSchema, address);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(address.toLowerCase());
        }
      });
    });

    it("should reject invalid addresses", () => {
      const invalidAddresses = [
        "not-an-address",
        "0x742d35Cc6634C0532925a3b8", // Too short
        "0x742d35Cc6634C0532925a3b8DG", // Invalid character
        "", // Empty
        null,
        undefined,
      ];

      invalidAddresses.forEach((address) => {
        const result = validate(AddressSchema, address);
        expect(result.success).toBe(false);
      });
    });

    it("should sanitize addresses correctly", () => {
      const testCases = [
        {
          input: "  0X742D35CC6634C0532925A3B8D  ",
          expected: "0x742d35cc6634c0532925a3b8d",
        },
        {
          input: "0xA0B86A33E6441B8BD39F9B6C2F3C0D7",
          expected: "0xa0b86a33e6441b8bd39f9b6c2f3c0d7",
        },
        { input: "invalid", expected: "" },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sanitizeAddress(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe("Amount Validation", () => {
    it("should validate positive BigInt amounts", () => {
      const validAmounts = [
        "1000000000000000000", // 1 ETH in wei
        "500000000000000000000", // 500 tokens
        BigInt("1000"),
        1000,
      ];

      validAmounts.forEach((amount) => {
        const result = validate(AmountSchema, amount);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(typeof result.data).toBe("bigint");
          expect(result.data > 0n).toBe(true);
        }
      });
    });

    it("should reject invalid amounts", () => {
      const invalidAmounts = [
        "-1000", // Negative
        "not-a-number",
        "",
        null,
        undefined,
      ];

      invalidAmounts.forEach((amount) => {
        const result = validate(AmountSchema, amount);
        expect(result.success).toBe(false);
      });
    });

    it("should sanitize amounts correctly", () => {
      const testCases = [
        { input: "1,000.50", expected: "1000500000000000000000" },
        { input: "100", expected: "100000000000000000000" },
        { input: "invalid", expected: "0000000000000000000" },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sanitizeAmount(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe("Price Validation", () => {
    it("should validate positive prices with correct precision", () => {
      const validPrices = [
        1234.56,
        0.000001, // Minimum precision
        10000.123456,
      ];

      validPrices.forEach((price) => {
        const result = validate(PriceSchema, price);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBeGreaterThan(0);
          expect(Number.isFinite(result.data)).toBe(true);
        }
      });
    });

    it("should reject invalid prices", () => {
      const invalidPrices = [
        -100, // Negative
        0, // Zero
        Infinity,
        NaN,
        "not-a-number",
      ];

      invalidPrices.forEach((price) => {
        const result = validate(PriceSchema, price);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("BigInt Schema", () => {
    it("should handle various BigInt input formats", () => {
      const testCases = [
        { input: BigInt("1000"), expected: BigInt("1000") },
        { input: "1000", expected: BigInt("1000") },
        { input: 1000, expected: BigInt("1000") },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = validate(BigIntSchema, input);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(expected);
        }
      });
    });

    it("should reject negative BigInt values", () => {
      const invalidInputs = [BigInt("-1000"), "-1000", -1000];

      invalidInputs.forEach((input) => {
        const result = validate(BigIntSchema, input);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Common Validators", () => {
    it("should provide working validator functions", () => {
      const addressResult = CommonValidators.address(sampleData.validAddress);
      expect(addressResult.success).toBe(true);

      const amountResult = CommonValidators.amount(sampleData.validAmount);
      expect(amountResult.success).toBe(true);

      const priceResult = CommonValidators.price(sampleData.validPrice);
      expect(priceResult.success).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should provide detailed error information", () => {
      const result = validate(AddressSchema, "invalid-address");
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBeDefined();
        expect(result.error.message).toBeDefined();
        expect(typeof result.error.message).toBe("string");
        expect(result.error.message.length).toBeGreaterThan(0);
      }
    });

    it("should include field information in validation errors", () => {
      const result = validate(AddressSchema, "invalid");
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.details).toBeDefined();
        expect(result.error.details?.issues).toBeDefined();
      }
    });
  });

  describe("Sample Data", () => {
    it("should provide valid sample data", () => {
      expect(sampleData.validAddress).toBeDefined();
      expect(sampleData.validAmount).toBeDefined();
      expect(sampleData.validPrice).toBeDefined();
      expect(sampleData.validCDP).toBeDefined();
      expect(sampleData.validCollateralConfig).toBeDefined();

      // Validate that sample data actually passes validation
      const addressResult = validate(AddressSchema, sampleData.validAddress);
      expect(addressResult.success).toBe(true);

      const amountResult = validate(AmountSchema, sampleData.validAmount);
      expect(amountResult.success).toBe(true);

      const priceResult = validate(PriceSchema, sampleData.validPrice);
      expect(priceResult.success).toBe(true);
    });
  });
});

describe("Integration Tests", () => {
  it("should handle complex validation scenarios", () => {
    // Test that we can validate a complete CDP creation scenario
    const cdpCreationData = {
      owner: sampleData.validAddress,
      initialCollateral: {
        assetAddress: sampleData.validAddress,
        amount: sampleData.validAmount,
      },
      minCollateralizationRatio: 15000,
      timestamp: Date.now(),
    };

    // This tests that our schemas work together correctly
    const ownerResult = validate(AddressSchema, cdpCreationData.owner);
    const assetResult = validate(
      AddressSchema,
      cdpCreationData.initialCollateral.assetAddress,
    );
    const amountResult = validate(
      AmountSchema,
      cdpCreationData.initialCollateral.amount,
    );

    expect(ownerResult.success).toBe(true);
    expect(assetResult.success).toBe(true);
    expect(amountResult.success).toBe(true);
  });

  it("should maintain data integrity through validation pipeline", () => {
    const originalAddress = "  0X742D35CC6634C0532925A3B8D  ";

    // Sanitize first
    const sanitized = sanitizeAddress(originalAddress);
    expect(sanitized).toBe("0x742d35cc6634c0532925a3b8d");

    // Then validate
    const validated = validate(AddressSchema, sanitized);
    expect(validated.success).toBe(true);

    if (validated.success) {
      expect(validated.data).toBe(sanitized);
    }
  });
});
