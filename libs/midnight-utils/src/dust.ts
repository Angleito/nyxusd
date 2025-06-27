/**
 * DUST Token Utilities for Midnight Protocol
 *
 * DUST is the native utility token of the Midnight blockchain used for:
 * - Transaction fees
 * - Staking rewards
 * - Governance participation
 * - Privacy computation costs
 *
 * This module provides utilities for DUST token calculations, conversions,
 * balance validations, and transaction cost estimations.
 */

import { Result } from "@nyxusd/fp-utils";

/**
 * DUST token precision and constants
 */
export const DUST_CONSTANTS = {
  /** DUST has 18 decimal places */
  DECIMALS: 18,
  /** Minimum DUST unit (1 wei equivalent) */
  MIN_UNIT: BigInt(1),
  /** 1 DUST in minimum units */
  ONE_DUST: BigInt(10) ** BigInt(18),
  /** Maximum safe DUST amount to prevent overflow */
  MAX_SAFE_AMOUNT: BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
  /** Minimum transaction fee in DUST units */
  MIN_TRANSACTION_FEE: BigInt(10) ** BigInt(15), // 0.001 DUST
  /** Base gas price in DUST units */
  BASE_GAS_PRICE: BigInt(10) ** BigInt(12), // 0.000001 DUST
} as const;

/**
 * Transaction types with different complexity scores
 */
export enum TransactionType {
  SIMPLE_TRANSFER = "simple_transfer",
  SHIELDED_TRANSFER = "shielded_transfer",
  CONTRACT_CALL = "contract_call",
  MULTI_PARTY = "multi_party",
  PRIVACY_COMPUTATION = "privacy_computation",
}

/**
 * Transaction complexity scoring for fee estimation
 */
export const TRANSACTION_COMPLEXITY: Record<TransactionType, number> = {
  [TransactionType.SIMPLE_TRANSFER]: 1,
  [TransactionType.SHIELDED_TRANSFER]: 3,
  [TransactionType.CONTRACT_CALL]: 2,
  [TransactionType.MULTI_PARTY]: 4,
  [TransactionType.PRIVACY_COMPUTATION]: 5,
} as const;

/**
 * Error types for DUST operations
 */
export type DustError =
  | { type: "INVALID_AMOUNT"; message: string }
  | { type: "INSUFFICIENT_BALANCE"; message: string }
  | { type: "OVERFLOW_ERROR"; message: string }
  | { type: "INVALID_ADDRESS"; message: string }
  | { type: "NEGATIVE_TIME"; message: string }
  | { type: "INVALID_TRANSACTION_TYPE"; message: string };

/**
 * DUST amount representation with validation
 */
export interface DustAmount {
  readonly value: bigint;
  readonly formatted: string;
}

/**
 * Transaction cost estimation result
 */
export interface TransactionCost {
  readonly baseFee: bigint;
  readonly complexityFee: bigint;
  readonly totalFee: bigint;
  readonly gasEstimate: bigint;
}

/**
 * Address balance information
 */
export interface AddressBalance {
  readonly address: string;
  readonly available: bigint;
  readonly staked: bigint;
  readonly locked: bigint;
  readonly total: bigint;
}

/**
 * Creates a validated DUST amount
 * @param amount - Amount in DUST units (as string, number, or bigint)
 * @returns Result containing DustAmount or error
 */
export const createDustAmount = (
  amount: string | number | bigint,
): Result<DustAmount, DustError> => {
  return Result.tryCatch(
    () => {
      const value = typeof amount === "bigint" ? amount : BigInt(amount);

      if (value < 0n) {
        throw new Error("Amount cannot be negative");
      }

      if (value > DUST_CONSTANTS.MAX_SAFE_AMOUNT) {
        throw new Error("Amount exceeds maximum safe value");
      }

      const formatted = formatDustAmount(value);

      return { value, formatted };
    },
    (error): DustError => ({
      type: "INVALID_AMOUNT",
      message: `Invalid DUST amount: ${error instanceof Error ? error.message : "Unknown error"}`,
    }),
  );
};

/**
 * Formats DUST amount for display (converts from smallest units to DUST)
 * @param amount - Amount in smallest DUST units
 * @returns Formatted string with appropriate decimal places
 */
export const formatDustAmount = (amount: bigint): string => {
  const dustAmount = amount / DUST_CONSTANTS.ONE_DUST;
  const remainder = amount % DUST_CONSTANTS.ONE_DUST;

  if (remainder === 0n) {
    return dustAmount.toString();
  }

  const fractional = remainder.toString().padStart(18, "0").replace(/0+$/, "");
  return `${dustAmount}.${fractional}`;
};

/**
 * Parses DUST amount from string (converts from DUST to smallest units)
 * @param dustString - String representation of DUST amount
 * @returns Result containing amount in smallest units or error
 */
export const parseDustAmount = (
  dustString: string,
): Result<bigint, DustError> => {
  return Result.tryCatch(
    () => {
      const trimmed = dustString.trim();

      if (!trimmed || !/^-?\d+(\.\d+)?$/.test(trimmed)) {
        throw new Error("Invalid number format");
      }

      const [whole, fractional = ""] = trimmed.split(".");
      if (!whole) {
        throw new Error("Invalid number format - missing whole part");
      }
      const wholeBig = BigInt(whole);

      if (wholeBig < 0n) {
        throw new Error("Amount cannot be negative");
      }

      const fractionalPadded = fractional.padEnd(18, "0").slice(0, 18);
      const fractionalBig = BigInt(fractionalPadded);

      const totalAmount = wholeBig * DUST_CONSTANTS.ONE_DUST + fractionalBig;

      if (totalAmount > DUST_CONSTANTS.MAX_SAFE_AMOUNT) {
        throw new Error("Amount exceeds maximum safe value");
      }

      return totalAmount;
    },
    (error): DustError => ({
      type: "INVALID_AMOUNT",
      message: `Invalid DUST string: ${error instanceof Error ? error.message : "Unknown error"}`,
    }),
  );
};

/**
 * Calculates DUST generation based on staked amount and time elapsed
 * In Midnight, stakers earn DUST rewards over time
 * @param nightAmount - Amount of NIGHT tokens staked (in smallest units)
 * @param timeElapsed - Time elapsed in seconds
 * @returns Result containing generated DUST amount or error
 */
export const calculateDustGeneration = (
  nightAmount: bigint,
  timeElapsed: number,
): Result<bigint, DustError> => {
  return Result.tryCatch(
    () => {
      if (nightAmount < 0n) {
        throw new Error("NIGHT amount cannot be negative");
      }

      if (timeElapsed < 0) {
        throw new Error("Time elapsed cannot be negative");
      }

      // Mock reward rate: 5% annual yield
      // Formula: (stakedAmount * annualRate * timeElapsed) / (365 * 24 * 3600)
      const annualRateNumerator = 5n;
      const annualRateDenominator = 100n;
      const secondsPerYear = 365n * 24n * 3600n;

      const timeElapsedBig = BigInt(Math.floor(timeElapsed));
      const dustGenerated =
        (nightAmount * annualRateNumerator * timeElapsedBig) /
        (annualRateDenominator * secondsPerYear);

      return dustGenerated;
    },
    (error): DustError => {
      if (error instanceof Error && error.message.includes("negative")) {
        return {
          type: "NEGATIVE_TIME",
          message: error.message,
        };
      }
      return {
        type: "INVALID_AMOUNT",
        message: `DUST generation calculation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    },
  );
};

/**
 * Converts DUST amount to transaction fee units
 * @param dustAmount - Amount of DUST to convert
 * @returns Result containing fee in gas units or error
 */
export const convertDustToTransactionFee = (
  dustAmount: bigint,
): Result<bigint, DustError> => {
  return Result.tryCatch(
    () => {
      if (dustAmount < 0n) {
        throw new Error("DUST amount cannot be negative");
      }

      if (dustAmount < DUST_CONSTANTS.MIN_TRANSACTION_FEE) {
        throw new Error("DUST amount below minimum transaction fee");
      }

      // Convert DUST to gas units using base gas price
      const gasUnits = dustAmount / DUST_CONSTANTS.BASE_GAS_PRICE;

      return gasUnits;
    },
    (error): DustError => ({
      type: "INVALID_AMOUNT",
      message: `DUST to fee conversion failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }),
  );
};

/**
 * Validates if an address has sufficient DUST balance for a transaction
 * @param address - Address to check (mock validation)
 * @param requiredDust - Required DUST amount
 * @returns Result containing boolean validation result or error
 */
export const validateDustBalance = (
  address: string,
  requiredDust: bigint,
): Result<boolean, DustError> => {
  return Result.tryCatch(
    () => {
      // Basic address validation (mock)
      if (!address || address.length < 20) {
        throw new Error("Invalid address format");
      }

      if (requiredDust < 0n) {
        throw new Error("Required DUST amount cannot be negative");
      }

      // Mock balance check - in real implementation, this would query the blockchain
      // For now, we'll simulate that addresses starting with 'rich' have sufficient balance
      const hasBalance =
        address.toLowerCase().includes("rich") ||
        requiredDust <= DUST_CONSTANTS.ONE_DUST;

      return hasBalance;
    },
    (error): DustError => {
      if (error instanceof Error && error.message.includes("address")) {
        return {
          type: "INVALID_ADDRESS",
          message: error.message,
        };
      }
      return {
        type: "INVALID_AMOUNT",
        message: `Balance validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    },
  );
};

/**
 * Estimates transaction cost based on type and complexity
 * @param transactionType - Type of transaction
 * @param complexityScore - Additional complexity multiplier (1.0 = normal)
 * @returns Result containing transaction cost breakdown or error
 */
export const estimateTransactionCost = (
  transactionType: TransactionType,
  complexityScore: number = 1.0,
): Result<TransactionCost, DustError> => {
  return Result.tryCatch(
    () => {
      if (!(transactionType in TRANSACTION_COMPLEXITY)) {
        throw new Error(`Unknown transaction type: ${transactionType}`);
      }

      if (complexityScore < 0) {
        throw new Error("Complexity score cannot be negative");
      }

      const baseComplexity = TRANSACTION_COMPLEXITY[transactionType];
      const totalComplexity = baseComplexity * complexityScore;

      // Base fee calculation
      const baseFee = DUST_CONSTANTS.MIN_TRANSACTION_FEE;

      // Complexity fee calculation
      const complexityFee = BigInt(
        Math.floor(Number(baseFee) * totalComplexity),
      );

      // Total fee
      const totalFee = baseFee + complexityFee;

      // Gas estimate
      const gasEstimate = totalFee / DUST_CONSTANTS.BASE_GAS_PRICE;

      return {
        baseFee,
        complexityFee,
        totalFee,
        gasEstimate,
      };
    },
    (error): DustError => {
      if (
        error instanceof Error &&
        error.message.includes("transaction type")
      ) {
        return {
          type: "INVALID_TRANSACTION_TYPE",
          message: error.message,
        };
      }
      return {
        type: "INVALID_AMOUNT",
        message: `Transaction cost estimation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    },
  );
};

/**
 * Gets mock balance information for an address
 * @param address - Address to query
 * @returns Result containing balance information or error
 */
export const getAddressBalance = (
  address: string,
): Result<AddressBalance, DustError> => {
  return Result.tryCatch(
    () => {
      if (!address || address.length < 20) {
        throw new Error("Invalid address format");
      }

      // Mock balance data - in real implementation, this would query the blockchain
      const isRich = address.toLowerCase().includes("rich");
      const baseAmount = isRich
        ? DUST_CONSTANTS.ONE_DUST * 1000n
        : DUST_CONSTANTS.ONE_DUST;

      const available = baseAmount;
      const staked = baseAmount / 2n;
      const locked = baseAmount / 10n;
      const total = available + staked + locked;

      return {
        address,
        available,
        staked,
        locked,
        total,
      };
    },
    (error): DustError => ({
      type: "INVALID_ADDRESS",
      message: `Failed to get balance: ${error instanceof Error ? error.message : "Unknown error"}`,
    }),
  );
};

/**
 * Converts between different DUST denominations
 * @param amount - Amount to convert
 * @param from - Source denomination ('dust' | 'mdust' | 'units')
 * @param to - Target denomination ('dust' | 'mdust' | 'units')
 * @returns Result containing converted amount or error
 */
export const convertDustDenomination = (
  amount: bigint,
  from: "dust" | "mdust" | "units",
  to: "dust" | "mdust" | "units",
): Result<bigint, DustError> => {
  return Result.tryCatch(
    () => {
      if (amount < 0n) {
        throw new Error("Amount cannot be negative");
      }

      // Define conversion factors
      const conversions = {
        dust: DUST_CONSTANTS.ONE_DUST, // 1 DUST = 10^18 units
        mdust: DUST_CONSTANTS.ONE_DUST / 1000n, // 1 mDUST = 10^15 units
        units: 1n, // 1 unit = 1 unit
      };

      if (!(from in conversions) || !(to in conversions)) {
        throw new Error("Invalid denomination");
      }

      // Convert to base units first, then to target denomination
      const baseUnits = amount * conversions[from];
      const convertedAmount = baseUnits / conversions[to];

      return convertedAmount;
    },
    (error): DustError => ({
      type: "INVALID_AMOUNT",
      message: `Denomination conversion failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }),
  );
};

/**
 * Utility functions for working with DUST amounts
 */
export const DustUtils = {
  /**
   * Adds two DUST amounts safely
   */
  add: (a: bigint, b: bigint): Result<bigint, DustError> => {
    return Result.tryCatch(
      () => {
        const result = a + b;
        if (result > DUST_CONSTANTS.MAX_SAFE_AMOUNT) {
          throw new Error("Addition would cause overflow");
        }
        return result;
      },
      (): DustError => ({
        type: "OVERFLOW_ERROR",
        message: "DUST addition overflow",
      }),
    );
  },

  /**
   * Subtracts two DUST amounts safely
   */
  subtract: (a: bigint, b: bigint): Result<bigint, DustError> => {
    return Result.tryCatch(
      () => {
        if (b > a) {
          throw new Error("Subtraction would result in negative amount");
        }
        return a - b;
      },
      (): DustError => ({
        type: "INVALID_AMOUNT",
        message: "DUST subtraction would be negative",
      }),
    );
  },

  /**
   * Multiplies DUST amount by a factor safely
   */
  multiply: (amount: bigint, factor: number): Result<bigint, DustError> => {
    return Result.tryCatch(
      () => {
        if (factor < 0) {
          throw new Error("Factor cannot be negative");
        }
        const result = (amount * BigInt(Math.floor(factor * 1000))) / 1000n;
        if (result > DUST_CONSTANTS.MAX_SAFE_AMOUNT) {
          throw new Error("Multiplication would cause overflow");
        }
        return result;
      },
      (): DustError => ({
        type: "OVERFLOW_ERROR",
        message: "DUST multiplication overflow",
      }),
    );
  },

  /**
   * Compares two DUST amounts
   */
  compare: (a: bigint, b: bigint): -1 | 0 | 1 => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  },

  /**
   * Checks if amount is zero
   */
  isZero: (amount: bigint): boolean => amount === 0n,

  /**
   * Gets the minimum of two amounts
   */
  min: (a: bigint, b: bigint): bigint => (a < b ? a : b),

  /**
   * Gets the maximum of two amounts
   */
  max: (a: bigint, b: bigint): bigint => (a > b ? a : b),
} as const;
