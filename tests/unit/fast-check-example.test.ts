/**
 * Example property-based test using fast-check
 */

import * as fc from 'fast-check';

describe('Fast-Check Property Testing', () => {
  test('addition is commutative', () => {
    fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => {
      return a + b === b + a;
    }));
  });

  test('multiplication is associative', () => {
    fc.assert(fc.property(
      fc.integer({ min: -100, max: 100 }),
      fc.integer({ min: -100, max: 100 }),
      fc.integer({ min: -100, max: 100 }),
      (a, b, c) => {
        return (a * b) * c === a * (b * c);
      }
    ));
  });

  test('string concatenation properties', () => {
    fc.assert(fc.property(fc.string(), fc.string(), (s1, s2) => {
      const result = s1 + s2;
      return result.length === s1.length + s2.length;
    }));
  });

  test('array reverse is involutive', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
      const reversed = arr.slice().reverse();
      const doubleReversed = reversed.slice().reverse();
      return JSON.stringify(arr) === JSON.stringify(doubleReversed);
    }));
  });

  test('financial calculation properties', () => {
    const calculateInterest = (principal: number, rate: number, time: number) => {
      return principal * rate * time;
    };

    fc.assert(fc.property(
      fc.float({ min: Math.fround(1), max: Math.fround(100000), noNaN: true }),
      fc.float({ min: Math.fround(0.01), max: Math.fround(0.5), noNaN: true }),
      fc.float({ min: Math.fround(0.1), max: Math.fround(10), noNaN: true }),
      (principal, rate, time) => {
        const interest = calculateInterest(principal, rate, time);
        
        // Interest should be non-negative for positive inputs
        if (principal > 0 && rate > 0 && time > 0) {
          return interest > 0;
        }
        
        // Zero principal should result in zero interest
        if (principal === 0) {
          return interest === 0;
        }
        
        return true;
      }
    ));
  });

  test('percentage validation properties', () => {
    const isValidPercentage = (value: number) => {
      return value >= 0 && value <= 100 && Number.isFinite(value);
    };

    fc.assert(fc.property(
      fc.float({ min: Math.fround(0), max: Math.fround(100), noNaN: true }),
      (percentage) => {
        return isValidPercentage(percentage);
      }
    ));
  });

  test('basis points validation properties', () => {
    const isValidBasisPoints = (value: number) => {
      return Number.isInteger(value) && value >= 0 && value <= 10000;
    };

    fc.assert(fc.property(
      fc.integer({ min: 0, max: 10000 }),
      (basisPoints) => {
        return isValidBasisPoints(basisPoints);
      }
    ));
  });
});