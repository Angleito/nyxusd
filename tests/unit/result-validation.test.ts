/**
 * Unit tests for Result type validation and error handling
 */

import { Result } from '@nyxusd/functional-utils';
import { ResultTestHelpers } from '../utils/result-helpers';
import { CDPFixtures } from '../fixtures';

describe('Result Type Validation', () => {
  describe('Basic Result Operations', () => {
    test('should create Ok Result', () => {
      const result = Result.ok(42);
      expect(result).toBeOk();
      expect(result).toBeOkWith(42);
    });

    test('should create Err Result', () => {
      const result = Result.err('error message');
      expect(result).toBeErr();
      expect(result).toBeErrWith('error message');
    });

    test('should map over Ok values', () => {
      const result = Result.ok(10)
        .map(x => x * 2)
        .map(x => x + 1);
      
      expect(result).toBeOkWith(21);
    });

    test('should not map over Err values', () => {
      const result = Result.err('initial error')
        .map((x: number) => x * 2)
        .map((x: number) => x + 1);
      
      expect(result).toBeErrWith('initial error');
    });

    test('should chain Ok operations', () => {
      const result = Result.ok(10)
        .flatMap(x => x > 5 ? Result.ok(x * 2) : Result.err('too small'))
        .flatMap(x => x < 30 ? Result.ok(x + 1) : Result.err('too large'));
      
      expect(result).toBeOkWith(21);
    });

    test('should stop chaining on first error', () => {
      const result = Result.ok(2)
        .flatMap(x => x > 5 ? Result.ok(x * 2) : Result.err('too small'))
        .flatMap(x => x < 30 ? Result.ok(x + 1) : Result.err('too large'));
      
      expect(result).toBeErrWith('too small');
    });
  });

  describe('Result Monad Laws', () => {
    const f = (x: number) => Result.ok(x * 2);
    const g = (x: number) => Result.ok(x + 1);

    test('left identity: Result.ok(a).flatMap(f) === f(a)', () => {
      const value = 42;
      const left = Result.ok(value).flatMap(f);
      const right = f(value);
      
      expect(left.toString()).toBe(right.toString());
    });

    test('right identity: m.flatMap(Result.ok) === m', () => {
      const okResult = Result.ok(42);
      const errResult = Result.err('error');
      
      const okLeft = okResult.flatMap(Result.ok);
      const errLeft = errResult.flatMap(Result.ok);
      
      expect(okLeft.toString()).toBe(okResult.toString());
      expect(errLeft.toString()).toBe(errResult.toString());
    });

    test('associativity: m.flatMap(f).flatMap(g) === m.flatMap(x => f(x).flatMap(g))', () => {
      const result = Result.ok(10);
      
      const left = result.flatMap(f).flatMap(g);
      const right = result.flatMap(x => f(x).flatMap(g));
      
      expect(left.toString()).toBe(right.toString());
    });
  });

  describe('Result Utility Functions', () => {
    test('should sequence array of Ok Results', () => {
      const results = [Result.ok(1), Result.ok(2), Result.ok(3)];
      const sequenced = ResultTestHelpers.sequence(results);
      
      expect(sequenced).toBeOkWith([1, 2, 3]);
    });

    test('should fail on first Err in sequence', () => {
      const results = [Result.ok(1), Result.err('error'), Result.ok(3)];
      const sequenced = ResultTestHelpers.sequence(results);
      
      expect(sequenced).toBeErrWith('error');
    });

    test('should traverse array with function', () => {
      const items = [1, 2, 3];
      const fn = (x: number) => x > 0 ? Result.ok(x * 2) : Result.err('negative');
      const traversed = ResultTestHelpers.traverse(items, fn);
      
      expect(traversed).toBeOkWith([2, 4, 6]);
    });

    test('should fail traverse on first error', () => {
      const items = [1, -2, 3];
      const fn = (x: number) => x > 0 ? Result.ok(x * 2) : Result.err('negative');
      const traversed = ResultTestHelpers.traverse(items, fn);
      
      expect(traversed).toBeErrWith('negative');
    });
  });

  describe('Result Error Handling', () => {
    test('should handle try-catch operations', () => {
      const safeOperation = () => Result.tryCatch(
        () => JSON.parse('{"valid": "json"}'),
        (error) => `Parse error: ${error}`
      );
      
      const result = safeOperation();
      expect(result).toBeOk();
      expect(ResultTestHelpers.expectOk(result)).toEqual({ valid: 'json' });
    });

    test('should catch errors in try-catch operations', () => {
      const unsafeOperation = () => Result.tryCatch(
        () => JSON.parse('invalid json'),
        (error) => `Parse error: ${error}`
      );
      
      const result = unsafeOperation();
      expect(result).toBeErr();
      expect(ResultTestHelpers.expectErr(result)).toMatch(/Parse error/);
    });

    test('should handle async try-catch operations', async () => {
      const safeAsyncOperation = () => Result.tryCatchAsync(
        async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return 'success';
        },
        (error) => `Async error: ${error}`
      );
      
      const result = await safeAsyncOperation();
      expect(result).toBeOkWith('success');
    });

    test('should catch async errors', async () => {
      const unsafeAsyncOperation = () => Result.tryCatchAsync(
        async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          throw new Error('Async failure');
        },
        (error) => `Async error: ${error}`
      );
      
      const result = await unsafeAsyncOperation();
      expect(result).toBeErr();
      expect(ResultTestHelpers.expectErr(result)).toMatch(/Async error/);
    });
  });

  describe('Result with CDP Validation', () => {
    test('should validate valid CDP', () => {
      const validCDP = CDPFixtures.samples.cdps[0];
      
      const validateCDP = (cdp: any) => {
        if (!cdp.id || cdp.id.length === 0) {
          return Result.err('CDP ID is required');
        }
        if (cdp.collateralValue < 0) {
          return Result.err('Collateral value cannot be negative');
        }
        if (cdp.debtAmount < 0n) {
          return Result.err('Debt amount cannot be negative');
        }
        return Result.ok(cdp);
      };
      
      const result = validateCDP(validCDP);
      expect(result).toBeOk();
      expect(ResultTestHelpers.expectOk(result)).toEqual(validCDP);
    });

    test('should fail validation for invalid CDP', () => {
      const invalidCDP = {
        ...CDPFixtures.samples.cdps[0],
        id: '', // Invalid empty ID
      };
      
      const validateCDP = (cdp: any) => {
        if (!cdp.id || cdp.id.length === 0) {
          return Result.err('CDP ID is required');
        }
        if (cdp.collateralValue < 0) {
          return Result.err('Collateral value cannot be negative');
        }
        return Result.ok(cdp);
      };
      
      const result = validateCDP(invalidCDP);
      expect(result).toBeErrWith('CDP ID is required');
    });

    test('should chain CDP validation operations', () => {
      const cdp = CDPFixtures.samples.cdps[0];
      
      const validateCDPId = (cdp: any) => 
        cdp.id && cdp.id.length > 0 
          ? Result.ok(cdp) 
          : Result.err('Invalid CDP ID');
      
      const validateCollateral = (cdp: any) =>
        cdp.collateralValue >= 0
          ? Result.ok(cdp)
          : Result.err('Invalid collateral value');
      
      const validateDebt = (cdp: any) =>
        cdp.debtAmount >= 0n
          ? Result.ok(cdp)
          : Result.err('Invalid debt amount');
      
      const result = Result.ok(cdp)
        .flatMap(validateCDPId)
        .flatMap(validateCollateral)
        .flatMap(validateDebt);
      
      expect(result).toBeOk();
    });

    test('should fail on first validation error in chain', () => {
      const invalidCDP = {
        ...CDPFixtures.samples.cdps[0],
        collateralValue: -1000, // Invalid negative value
      };
      
      const validateCDPId = (cdp: any) => 
        cdp.id && cdp.id.length > 0 
          ? Result.ok(cdp) 
          : Result.err('Invalid CDP ID');
      
      const validateCollateral = (cdp: any) =>
        cdp.collateralValue >= 0
          ? Result.ok(cdp)
          : Result.err('Invalid collateral value');
      
      const validateDebt = (cdp: any) =>
        cdp.debtAmount >= 0n
          ? Result.ok(cdp)
          : Result.err('Invalid debt amount');
      
      const result = Result.ok(invalidCDP)
        .flatMap(validateCDPId)
        .flatMap(validateCollateral)
        .flatMap(validateDebt);
      
      expect(result).toBeErrWith('Invalid collateral value');
    });
  });

  describe('Result Performance', () => {
    test('should handle large number of operations efficiently', async () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => i);
      
      const { timeMs } = await ResultTestHelpers.performance.measureTime(
        () => {
          return ResultTestHelpers.traverse(
            largeArray,
            (x) => Result.ok(x * 2)
          );
        },
        'Large array traverse operation'
      );
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(timeMs).toBeLessThan(1000);
    });

    test('should benchmark Result operations', async () => {
      const results = Array.from({ length: 1000 }, () => Result.ok(Math.random()));
      
      const operations = {
        'map': (results: Result<number, string>[]) => 
          results.map(r => r.map(x => x * 2)),
        'flatMap': (results: Result<number, string>[]) => 
          results.map(r => r.flatMap(x => Result.ok(x + 1))),
        'sequence': (results: Result<number, string>[]) => 
          ResultTestHelpers.sequence(results),
      };
      
      const benchmarks = await ResultTestHelpers.performance.benchmarkResultOperations(
        results,
        operations,
        10 // 10 iterations
      );
      
      // All operations should complete quickly
      Object.values(benchmarks).forEach(avgTime => {
        expect(avgTime).toBeLessThan(100); // 100ms average
      });
    });
  });

  describe('Result Custom Matchers', () => {
    test('should use custom toBeOk matcher', () => {
      const result = Result.ok(42);
      expect(result).toBeOk();
    });

    test('should use custom toBeErr matcher', () => {
      const result = Result.err('error');
      expect(result).toBeErr();
    });

    test('should use custom toBeOkWith matcher', () => {
      const result = Result.ok({ value: 42 });
      expect(result).toBeOkWith({ value: 42 });
    });

    test('should use custom toBeErrWith matcher', () => {
      const result = Result.err(new Error('test error'));
      expect(result).toBeErrWith(new Error('test error'));
    });

    test('should use custom toSatisfyProperty matcher', () => {
      expect(42).toSatisfyProperty('positive');
      expect(0).toSatisfyProperty('non-negative');
      expect(5).toSatisfyProperty('integer');
      expect(3.14159).toSatisfyProperty('finite');
      expect(75.5).toSatisfyProperty('valid-percentage');
      expect(7500).toSatisfyProperty('valid-basis-points');
    });
  });
});