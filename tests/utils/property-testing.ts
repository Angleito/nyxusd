/**
 * Property-based testing utilities for NYXUSD
 */

import * as fc from 'fast-check';
import { Result } from '@nyxusd/functional-utils';
import { PROPERTY_TEST_CONFIG } from './jest-setup';

/**
 * Configuration for property tests
 */
export interface PropertyTestConfig {
  numRuns?: number;
  timeout?: number;
  seed?: number;
  verbose?: boolean;
  skipAllAfterTimeLimit?: number;
  interruptAfterTimeLimit?: number;
}

/**
 * Mathematical property testing utilities
 */
export const MathProperties = {
  /**
   * Test associativity: (a op b) op c = a op (b op c)
   */
  associativity: <T>(
    gen: fc.Arbitrary<T>,
    operation: (a: T, b: T) => T,
    equals: (a: T, b: T) => boolean = (a, b) => a === b
  ) => (config?: PropertyTestConfig) => {
    const testConfig = { ...PROPERTY_TEST_CONFIG, ...config };
    
    fc.assert(
      fc.property(gen, gen, gen, (a, b, c) => {
        const left = operation(operation(a, b), c);
        const right = operation(a, operation(b, c));
        return equals(left, right);
      }),
      testConfig
    );
  },

  /**
   * Test commutativity: a op b = b op a
   */
  commutativity: <T>(
    gen: fc.Arbitrary<T>,
    operation: (a: T, b: T) => T,
    equals: (a: T, b: T) => boolean = (a, b) => a === b
  ) => (config?: PropertyTestConfig) => {
    const testConfig = { ...PROPERTY_TEST_CONFIG, ...config };
    
    fc.assert(
      fc.property(gen, gen, (a, b) => {
        const left = operation(a, b);
        const right = operation(b, a);
        return equals(left, right);
      }),
      testConfig
    );
  },

  /**
   * Test identity: a op identity = a
   */
  identity: <T>(
    gen: fc.Arbitrary<T>,
    operation: (a: T, identity: T) => T,
    identity: T,
    equals: (a: T, b: T) => boolean = (a, b) => a === b
  ) => (config?: PropertyTestConfig) => {
    const testConfig = { ...PROPERTY_TEST_CONFIG, ...config };
    
    fc.assert(
      fc.property(gen, (a) => {
        const result = operation(a, identity);
        return equals(result, a);
      }),
      testConfig
    );
  },

  /**
   * Test monotonicity: a <= b implies f(a) <= f(b)
   */
  monotonicity: <T, U>(
    gen: fc.Arbitrary<T>,
    operation: (a: T) => U,
    compare: (a: T, b: T) => boolean,
    compareResult: (a: U, b: U) => boolean
  ) => (config?: PropertyTestConfig) => {
    const testConfig = { ...PROPERTY_TEST_CONFIG, ...config };
    
    fc.assert(
      fc.property(gen, gen, (a, b) => {
        if (compare(a, b)) {
          const resultA = operation(a);
          const resultB = operation(b);
          return compareResult(resultA, resultB);
        }
        return true;
      }),
      testConfig
    );
  },

  /**
   * Test idempotence: f(f(a)) = f(a)
   */
  idempotence: <T>(
    gen: fc.Arbitrary<T>,
    operation: (a: T) => T,
    equals: (a: T, b: T) => boolean = (a, b) => a === b
  ) => (config?: PropertyTestConfig) => {
    const testConfig = { ...PROPERTY_TEST_CONFIG, ...config };
    
    fc.assert(
      fc.property(gen, (a) => {
        const once = operation(a);
        const twice = operation(once);
        return equals(once, twice);
      }),
      testConfig
    );
  },

  /**
   * Test distributivity: a op (b op2 c) = (a op b) op2 (a op c)
   */
  distributivity: <T>(
    gen: fc.Arbitrary<T>,
    op1: (a: T, b: T) => T,
    op2: (a: T, b: T) => T,
    equals: (a: T, b: T) => boolean = (a, b) => a === b
  ) => (config?: PropertyTestConfig) => {
    const testConfig = { ...PROPERTY_TEST_CONFIG, ...config };
    
    fc.assert(
      fc.property(gen, gen, gen, (a, b, c) => {
        const left = op1(a, op2(b, c));
        const right = op2(op1(a, b), op1(a, c));
        return equals(left, right);
      }),
      testConfig
    );
  },
};

/**
 * Financial property testing utilities
 */
export const FinancialProperties = {
  /**
   * Test that collateral value is always non-negative
   */
  nonNegativeCollateral: <T>(
    gen: fc.Arbitrary<T>,
    getCollateralValue: (input: T) => number
  ) => (config?: PropertyTestConfig) => {
    const testConfig = { ...PROPERTY_TEST_CONFIG, ...config };
    
    fc.assert(
      fc.property(gen, (input) => {
        const value = getCollateralValue(input);
        return value >= 0;
      }),
      testConfig
    );
  },

  /**
   * Test that health factor calculation is consistent
   */
  healthFactorConsistency: <T>(
    gen: fc.Arbitrary<T>,
    getHealthFactor: (input: T) => number,
    getCollateralValue: (input: T) => number,
    getDebtValue: (input: T) => number,
    getLiquidationThreshold: (input: T) => number
  ) => (config?: PropertyTestConfig) => {
    const testConfig = { ...PROPERTY_TEST_CONFIG, ...config };
    
    fc.assert(
      fc.property(gen, (input) => {
        const healthFactor = getHealthFactor(input);
        const collateral = getCollateralValue(input);
        const debt = getDebtValue(input);
        const threshold = getLiquidationThreshold(input);
        
        if (debt === 0) return true; // No debt means infinite health factor
        
        const expectedHealthFactor = (collateral * threshold) / debt;
        const tolerance = 0.0001; // Small tolerance for floating point errors
        
        return Math.abs(healthFactor - expectedHealthFactor) < tolerance;
      }),
      testConfig
    );
  },

  /**
   * Test that liquidation occurs when health factor < 1
   */
  liquidationTrigger: <T>(
    gen: fc.Arbitrary<T>,
    getHealthFactor: (input: T) => number,
    shouldLiquidate: (input: T) => boolean
  ) => (config?: PropertyTestConfig) => {
    const testConfig = { ...PROPERTY_TEST_CONFIG, ...config };
    
    fc.assert(
      fc.property(gen, (input) => {
        const healthFactor = getHealthFactor(input);
        const liquidate = shouldLiquidate(input);
        
        if (healthFactor < 1) {
          return liquidate; // Should liquidate when health factor < 1
        } else if (healthFactor > 1.1) {
          return !liquidate; // Should not liquidate when health factor > 1.1
        }
        
        return true; // Ambiguous zone, either is acceptable
      }),
      testConfig
    );
  },

  /**
   * Test that collateralization ratio is preserved under operations
   */
  collateralizationRatioPreservation: <T>(
    gen: fc.Arbitrary<T>,
    operation: (input: T) => T,
    getCollateralizationRatio: (input: T) => number,
    tolerance: number = 0.001
  ) => (config?: PropertyTestConfig) => {
    const testConfig = { ...PROPERTY_TEST_CONFIG, ...config };
    
    fc.assert(
      fc.property(gen, (input) => {
        const originalRatio = getCollateralizationRatio(input);
        const afterOperation = operation(input);
        const newRatio = getCollateralizationRatio(afterOperation);
        
        return Math.abs(originalRatio - newRatio) < tolerance;
      }),
      testConfig
    );
  },

  /**
   * Test price impact relationships
   */
  priceImpactMonotonicity: <T>(
    gen: fc.Arbitrary<T>,
    getPriceImpact: (input: T, amount: number) => number
  ) => (config?: PropertyTestConfig) => {
    const testConfig = { ...PROPERTY_TEST_CONFIG, ...config };
    
    fc.assert(
      fc.property(gen, fc.float({ min: 0, max: 1000000 }), fc.float({ min: 0, max: 1000000 }), (input, amount1, amount2) => {
        if (amount1 === amount2) return true;
        
        const impact1 = getPriceImpact(input, amount1);
        const impact2 = getPriceImpact(input, amount2);
        
        // Larger amounts should have larger or equal price impact
        if (amount1 < amount2) {
          return Math.abs(impact1) <= Math.abs(impact2);
        } else {
          return Math.abs(impact2) <= Math.abs(impact1);
        }
      }),
      testConfig
    );
  },
};

/**
 * Result type property testing utilities
 */
export const ResultProperties = {
  /**
   * Test Result monad laws
   */
  monadLaws: <T, U, V, E>(
    genT: fc.Arbitrary<T>,
    genU: fc.Arbitrary<U>,
    genE: fc.Arbitrary<E>,
    f: (value: T) => Result<U, E>,
    g: (value: U) => Result<V, E>
  ) => (config?: PropertyTestConfig) => {
    const testConfig = { ...PROPERTY_TEST_CONFIG, ...config };
    
    // Left identity
    fc.assert(
      fc.property(genT, (value) => {
        const left = Result.ok(value).flatMap(f);
        const right = f(value);
        return left.toString() === right.toString();
      }),
      { ...testConfig, name: 'Result left identity' }
    );

    // Right identity
    fc.assert(
      fc.property(genT, genE, (value, error) => {
        const okResult = Result.ok(value);
        const errResult = Result.err(error);
        
        const okLeft = okResult.flatMap(Result.ok);
        const errLeft = errResult.flatMap(Result.ok);
        
        return okLeft.toString() === okResult.toString() &&
               errLeft.toString() === errResult.toString();
      }),
      { ...testConfig, name: 'Result right identity' }
    );

    // Associativity
    fc.assert(
      fc.property(genT, genE, (value, error) => {
        const okResult = Result.ok(value);
        const errResult = Result.err(error);
        
        const okLeft = okResult.flatMap(f).flatMap(g);
        const okRight = okResult.flatMap(x => f(x).flatMap(g));
        
        const errLeft = errResult.flatMap(f).flatMap(g);
        const errRight = errResult.flatMap(x => f(x).flatMap(g));
        
        return okLeft.toString() === okRight.toString() &&
               errLeft.toString() === errRight.toString();
      }),
      { ...testConfig, name: 'Result associativity' }
    );
  },

  /**
   * Test that Result transformations preserve type safety
   */
  typeSafety: <T, U, E>(
    genT: fc.Arbitrary<T>,
    genE: fc.Arbitrary<E>,
    transform: (value: T) => U,
    isValidT: (value: unknown) => value is T,
    isValidU: (value: unknown) => value is U,
    isValidE: (value: unknown) => value is E
  ) => (config?: PropertyTestConfig) => {
    const testConfig = { ...PROPERTY_TEST_CONFIG, ...config };
    
    fc.assert(
      fc.property(genT, genE, (value, error) => {
        const okResult = Result.ok(value);
        const errResult = Result.err(error);
        
        const mappedOk = okResult.map(transform);
        const mappedErr = errResult.map(transform);
        
        // Ok should transform to Ok with transformed value
        if (mappedOk.isOk()) {
          const transformedValue = (mappedOk as any).value;
          return isValidU(transformedValue);
        }
        
        // Err should remain Err with same error
        if (mappedErr.isErr()) {
          const errorValue = (mappedErr as any).value;
          return isValidE(errorValue);
        }
        
        return true;
      }),
      testConfig
    );
  },

  /**
   * Test error propagation
   */
  errorPropagation: <T, U, E>(
    genT: fc.Arbitrary<T>,
    genE: fc.Arbitrary<E>,
    operation: (value: T) => Result<U, E>
  ) => (config?: PropertyTestConfig) => {
    const testConfig = { ...PROPERTY_TEST_CONFIG, ...config };
    
    fc.assert(
      fc.property(genT, genE, (value, error1) => {
        const errResult = Result.err<T, E>(error1);
        const chainedResult = errResult.flatMap(operation);
        
        // Error should propagate through the chain
        return chainedResult.isErr() && 
               (chainedResult as any).value === error1;
      }),
      testConfig
    );
  },
};

/**
 * CDP-specific property testing utilities
 */
export const CDPProperties = {
  /**
   * Test CDP invariants
   */
  cdpInvariants: <T>(
    gen: fc.Arbitrary<T>,
    getCDP: (input: T) => any
  ) => (config?: PropertyTestConfig) => {
    const testConfig = { ...PROPERTY_TEST_CONFIG, ...config };
    
    fc.assert(
      fc.property(gen, (input) => {
        const cdp = getCDP(input);
        
        // Basic invariants
        const collateralNonNegative = cdp.collateralValue >= 0;
        const debtNonNegative = cdp.debtAmount >= 0n;
        const healthFactorNonNegative = cdp.healthFactor >= 0;
        const timestampsValid = cdp.createdAt <= cdp.lastUpdated;
        
        return collateralNonNegative && 
               debtNonNegative && 
               healthFactorNonNegative && 
               timestampsValid;
      }),
      testConfig
    );
  },

  /**
   * Test liquidation scenarios
   */
  liquidationScenarios: <T>(
    gen: fc.Arbitrary<T>,
    liquidate: (input: T) => any,
    isLiquidatable: (input: T) => boolean
  ) => (config?: PropertyTestConfig) => {
    const testConfig = { ...PROPERTY_TEST_CONFIG, ...config };
    
    fc.assert(
      fc.property(gen, (input) => {
        const shouldLiquidate = isLiquidatable(input);
        const liquidationResult = liquidate(input);
        
        if (shouldLiquidate) {
          // Should be able to liquidate
          return liquidationResult.isOk();
        } else {
          // Should not be able to liquidate healthy positions
          return liquidationResult.isErr();
        }
      }),
      testConfig
    );
  },

  /**
   * Test fee accrual properties
   */
  feeAccrual: <T>(
    gen: fc.Arbitrary<T>,
    calculateFees: (input: T, timeElapsed: number) => bigint,
    getFeeRate: (input: T) => number
  ) => (config?: PropertyTestConfig) => {
    const testConfig = { ...PROPERTY_TEST_CONFIG, ...config };
    
    fc.assert(
      fc.property(gen, fc.integer({ min: 0, max: 365 * 24 * 3600 }), (input, timeElapsed) => {
        const fees = calculateFees(input, timeElapsed);
        const feeRate = getFeeRate(input);
        
        // Fees should be non-negative
        const feesNonNegative = fees >= 0n;
        
        // Fees should increase with time (for positive rates)
        let feesIncreaseWithTime = true;
        if (timeElapsed > 0 && feeRate > 0) {
          const shorterFees = calculateFees(input, timeElapsed / 2);
          feesIncreaseWithTime = fees >= shorterFees;
        }
        
        return feesNonNegative && feesIncreaseWithTime;
      }),
      testConfig
    );
  },
};

/**
 * Utility for running property tests with common configuration
 */
export const runPropertyTest = (
  description: string,
  property: () => void,
  config?: PropertyTestConfig
) => {
  const testConfig = { ...PROPERTY_TEST_CONFIG, ...config };
  
  test(description, () => {
    property();
  }, testConfig.timeout);
};

/**
 * Utility for running multiple related property tests
 */
export const runPropertySuite = (
  suiteName: string,
  properties: Record<string, () => void>,
  config?: PropertyTestConfig
) => {
  describe(suiteName, () => {
    Object.entries(properties).forEach(([name, property]) => {
      runPropertyTest(name, property, config);
    });
  });
};

/**
 * Export all property testing utilities
 */
export const PropertyTesting = {
  math: MathProperties,
  financial: FinancialProperties,
  result: ResultProperties,
  cdp: CDPProperties,
  run: runPropertyTest,
  suite: runPropertySuite,
  config: PROPERTY_TEST_CONFIG,
};