/**
 * Consolidated Validation Utilities for NyxUSD
 * Centralizes all validation logic to eliminate duplication
 */

// Re-export everything from the comprehensive validators package
export * from '@nyxusd/validators';

// Additional CDP-specific validators
export const CDP_VALIDATORS = {
  healthFactor: (value: unknown) => {
    if (typeof value !== 'number' || value <= 0) {
      return { success: false, error: 'Invalid health factor' };
    }
    return { success: true, data: value };
  },
  
  collateralizationRatio: (value: unknown) => {
    if (typeof value !== 'number' || value < 100 || value > 50000) {
      return { success: false, error: 'Invalid collateralization ratio' };
    }
    return { success: true, data: value };
  }
};

// Mathematical utilities (consolidated from multiple places)
export const MATH_UTILS = {
  calculateHealthFactor: (collateralValue: bigint, debtValue: bigint, liquidationRatio: number): number => {
    if (debtValue === 0n) return Infinity;
    const ratio = Number(collateralValue) / Number(debtValue);
    return ratio / (liquidationRatio / 10000);
  },
  
  calculateInterest: (principal: bigint, rate: number, time: number): bigint => {
    const ratePerSecond = rate / (365.25 * 24 * 60 * 60);
    const multiplier = Math.floor((1 + ratePerSecond * time) * 1000000);
    return (principal * BigInt(multiplier)) / 1000000n;
  },
  
  isValidBasisPoints: (value: number): boolean => {
    return Number.isInteger(value) && value >= 0 && value <= 10000;
  }
};

// Error handling utilities (consolidated)
export const ERROR_UTILS = {
  createValidationError: (code: string, message: string, field?: string) => ({
    code,
    message,
    field,
    timestamp: Date.now()
  }),
  
  isValidationError: (error: unknown): boolean => {
    return typeof error === 'object' && error !== null && 'code' in error;
  }
};

// Common sanitization functions (simplified from multiple implementations)
export const SANITIZE = {
  address: (input: unknown): string => {
    const str = String(input).toLowerCase().trim();
    return str.startsWith('0x') && str.length === 42 ? str : '';
  },
  
  amount: (input: unknown): string => {
    return String(input).replace(/[^\d.]/g, '').split('.').slice(0, 2).join('.');
  },
  
  removeHtml: (input: string): string => {
    return input.replace(/<[^>]*>/g, '');
  }
};
