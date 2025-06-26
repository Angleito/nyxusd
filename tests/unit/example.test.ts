/**
 * Simple example test to verify test infrastructure
 */

describe('Test Infrastructure Verification', () => {
  test('should run basic test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should work with async operations', async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });

  test('should work with custom property matcher', () => {
    expect(42).toSatisfyProperty('positive');
    expect(0).toSatisfyProperty('non-negative');
    expect(75.5).toSatisfyProperty('valid-percentage');
    expect(7500).toSatisfyProperty('valid-basis-points');
  });
});

describe('Mathematical Functions', () => {
  const add = (a: number, b: number) => a + b;
  const multiply = (a: number, b: number) => a * b;

  test('addition should be commutative', () => {
    expect(add(3, 5)).toBe(add(5, 3));
  });

  test('multiplication should be associative', () => {
    expect(multiply(multiply(2, 3), 4)).toBe(multiply(2, multiply(3, 4)));
  });

  test('addition with zero should be identity', () => {
    expect(add(42, 0)).toBe(42);
    expect(add(0, 42)).toBe(42);
  });

  test('multiplication with one should be identity', () => {
    expect(multiply(42, 1)).toBe(42);
    expect(multiply(1, 42)).toBe(42);
  });
});