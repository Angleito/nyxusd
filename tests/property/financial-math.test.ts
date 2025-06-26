/**
 * Property-based tests for financial mathematical functions
 */

import * as fc from 'fast-check';
import { PropertyTesting } from '../utils/property-testing';
import { DataGenerators } from '../utils/data-generators';

describe('Financial Mathematics Properties', () => {
  describe('Interest Rate Calculations', () => {
    /**
     * Simple interest calculation: I = P * r * t
     */
    const calculateSimpleInterest = (principal: number, rate: number, time: number): number => {
      return principal * rate * time;
    };

    /**
     * Compound interest calculation: A = P(1 + r)^t
     */
    const calculateCompoundInterest = (principal: number, rate: number, time: number): number => {
      return principal * Math.pow(1 + rate, time);
    };

    PropertyTesting.run(
      'Simple interest is linear with time',
      () => {
        PropertyTesting.math.monotonicity(
          fc.record({
            principal: fc.float({ min: 1000, max: 100000 }),
            rate: fc.float({ min: 0.01, max: 0.20 }),
            time: fc.float({ min: 0, max: 10 }),
          }),
          (params) => calculateSimpleInterest(params.principal, params.rate, params.time),
          (a, b) => a.principal === b.principal && a.rate === b.rate && a.time <= b.time,
          (a, b) => a <= b
        )();
      }
    );

    PropertyTesting.run(
      'Compound interest grows exponentially',
      () => {
        fc.assert(
          fc.property(
            fc.float({ min: 1000, max: 100000 }),
            fc.float({ min: 0.01, max: 0.20 }),
            fc.float({ min: 1, max: 10 }),
            (principal, rate, time) => {
              const compoundInterest = calculateCompoundInterest(principal, rate, time);
              const simpleInterest = calculateSimpleInterest(principal, rate, time) + principal;
              
              // Compound interest should be greater than simple interest for positive rates and time > 1
              return time <= 1 || rate <= 0 || compoundInterest >= simpleInterest;
            }
          )
        );
      }
    );

    PropertyTesting.run(
      'Zero interest rate yields zero interest',
      () => {
        fc.assert(
          fc.property(
            fc.float({ min: 1000, max: 100000 }),
            fc.float({ min: 0, max: 10 }),
            (principal, time) => {
              const simpleInterest = calculateSimpleInterest(principal, 0, time);
              const compoundInterest = calculateCompoundInterest(principal, 0, time);
              
              return simpleInterest === 0 && compoundInterest === principal;
            }
          )
        );
      }
    );
  });

  describe('Present Value Calculations', () => {
    /**
     * Present value calculation: PV = FV / (1 + r)^t
     */
    const calculatePresentValue = (futureValue: number, discountRate: number, time: number): number => {
      return futureValue / Math.pow(1 + discountRate, time);
    };

    /**
     * Future value calculation: FV = PV * (1 + r)^t
     */
    const calculateFutureValue = (presentValue: number, interestRate: number, time: number): number => {
      return presentValue * Math.pow(1 + interestRate, time);
    };

    PropertyTesting.run(
      'Present value and future value are inverse operations',
      () => {
        fc.assert(
          fc.property(
            fc.float({ min: 1000, max: 100000 }),
            fc.float({ min: 0.01, max: 0.20 }),
            fc.float({ min: 0.1, max: 10 }),
            (value, rate, time) => {
              const futureValue = calculateFutureValue(value, rate, time);
              const backToPresentValue = calculatePresentValue(futureValue, rate, time);
              
              const tolerance = value * 0.0001; // 0.01% tolerance for floating point errors
              return Math.abs(backToPresentValue - value) <= tolerance;
            }
          )
        );
      }
    );

    PropertyTesting.run(
      'Present value decreases with higher discount rates',
      () => {
        PropertyTesting.math.monotonicity(
          fc.record({
            futureValue: fc.float({ min: 1000, max: 100000 }),
            discountRate: fc.float({ min: 0.01, max: 0.50 }),
            time: fc.float({ min: 0.1, max: 10 }),
          }),
          (params) => calculatePresentValue(params.futureValue, params.discountRate, params.time),
          (a, b) => a.futureValue === b.futureValue && a.time === b.time && a.discountRate <= b.discountRate,
          (a, b) => a >= b // Higher discount rate -> lower present value
        )();
      }
    );
  });

  describe('Risk Metrics', () => {
    /**
     * Sharpe ratio calculation: (return - risk_free_rate) / volatility
     */
    const calculateSharpeRatio = (returns: number, riskFreeRate: number, volatility: number): number => {
      if (volatility === 0) return returns > riskFreeRate ? Infinity : 0;
      return (returns - riskFreeRate) / volatility;
    };

    /**
     * Value at Risk (simplified): mean - (confidence_level * std_dev)
     */
    const calculateVaR = (mean: number, stdDev: number, confidenceLevel: number): number => {
      // Using normal distribution approximation
      const zScore = confidenceLevel === 0.95 ? 1.645 : confidenceLevel === 0.99 ? 2.326 : 1.96;
      return mean - (zScore * stdDev);
    };

    PropertyTesting.run(
      'Sharpe ratio increases with higher returns (constant volatility)',
      () => {
        PropertyTesting.math.monotonicity(
          fc.record({
            returns: fc.float({ min: 0.01, max: 0.50 }),
            riskFreeRate: fc.float({ min: 0.001, max: 0.05 }),
            volatility: fc.float({ min: 0.01, max: 0.30 }),
          }),
          (params) => calculateSharpeRatio(params.returns, params.riskFreeRate, params.volatility),
          (a, b) => a.riskFreeRate === b.riskFreeRate && a.volatility === b.volatility && a.returns <= b.returns,
          (a, b) => a <= b
        )();
      }
    );

    PropertyTesting.run(
      'VaR becomes more negative with higher volatility',
      () => {
        fc.assert(
          fc.property(
            fc.float({ min: 0.05, max: 0.20 }),
            fc.tuple(
              fc.float({ min: 0.10, max: 0.50 }),
              fc.float({ min: 0.51, max: 1.00 })
            ),
            fc.constantFrom(0.95, 0.99),
            (mean, [vol1, vol2], confidence) => {
              const var1 = calculateVaR(mean, vol1, confidence);
              const var2 = calculateVaR(mean, vol2, confidence);
              
              // Higher volatility should result in more negative VaR
              return var2 <= var1;
            }
          )
        );
      }
    );

    PropertyTesting.run(
      'Sharpe ratio is undefined for zero volatility with excess returns',
      () => {
        fc.assert(
          fc.property(
            fc.float({ min: 0.05, max: 0.20 }),
            fc.float({ min: 0.01, max: 0.04 }),
            (returns, riskFreeRate) => {
              fc.pre(returns > riskFreeRate); // Ensure we have excess returns
              
              const sharpeRatio = calculateSharpeRatio(returns, riskFreeRate, 0);
              return sharpeRatio === Infinity;
            }
          )
        );
      }
    );
  });

  describe('Loan-to-Value Calculations', () => {
    /**
     * LTV calculation: loan_amount / collateral_value
     */
    const calculateLTV = (loanAmount: number, collateralValue: number): number => {
      if (collateralValue === 0) return Infinity;
      return loanAmount / collateralValue;
    };

    /**
     * Maximum loan amount: collateral_value * max_ltv
     */
    const calculateMaxLoan = (collateralValue: number, maxLTV: number): number => {
      return collateralValue * maxLTV;
    };

    PropertyTesting.run(
      'LTV is bounded between 0 and 1 for healthy loans',
      () => {
        fc.assert(
          fc.property(
            fc.float({ min: 1000, max: 100000 }),
            fc.float({ min: 500, max: 80000 }),
            (collateralValue, loanAmount) => {
              fc.pre(loanAmount <= collateralValue); // Healthy loan condition
              
              const ltv = calculateLTV(loanAmount, collateralValue);
              return ltv >= 0 && ltv <= 1;
            }
          )
        );
      }
    );

    PropertyTesting.run(
      'Maximum loan amount is proportional to collateral value',
      () => {
        PropertyTesting.math.monotonicity(
          fc.record({
            collateralValue: fc.float({ min: 1000, max: 100000 }),
            maxLTV: fc.float({ min: 0.5, max: 0.8 }),
          }),
          (params) => calculateMaxLoan(params.collateralValue, params.maxLTV),
          (a, b) => a.maxLTV === b.maxLTV && a.collateralValue <= b.collateralValue,
          (a, b) => a <= b
        )();
      }
    );

    PropertyTesting.run(
      'LTV calculation is commutative for scaling',
      () => {
        fc.assert(
          fc.property(
            fc.float({ min: 1000, max: 100000 }),
            fc.float({ min: 500, max: 50000 }),
            fc.float({ min: 1.1, max: 10 }),
            (collateralValue, loanAmount, scale) => {
              const ltv1 = calculateLTV(loanAmount, collateralValue);
              const ltv2 = calculateLTV(loanAmount * scale, collateralValue * scale);
              
              const tolerance = 0.0001;
              return Math.abs(ltv1 - ltv2) <= tolerance;
            }
          )
        );
      }
    );
  });

  describe('Liquidation Calculations', () => {
    /**
     * Liquidation threshold check
     */
    const isLiquidatable = (collateralValue: number, debtValue: number, liquidationThreshold: number): boolean => {
      if (debtValue === 0) return false;
      const ltv = collateralValue / debtValue;
      return ltv < liquidationThreshold;
    };

    /**
     * Liquidation penalty calculation
     */
    const calculateLiquidationPenalty = (liquidatedAmount: number, penaltyRate: number): number => {
      return liquidatedAmount * penaltyRate;
    };

    PropertyTesting.run(
      'Liquidation penalty is proportional to liquidated amount',
      () => {
        PropertyTesting.math.monotonicity(
          fc.record({
            liquidatedAmount: fc.float({ min: 1000, max: 100000 }),
            penaltyRate: fc.float({ min: 0.05, max: 0.20 }),
          }),
          (params) => calculateLiquidationPenalty(params.liquidatedAmount, params.penaltyRate),
          (a, b) => a.penaltyRate === b.penaltyRate && a.liquidatedAmount <= b.liquidatedAmount,
          (a, b) => a <= b
        )();
      }
    );

    PropertyTesting.run(
      'Liquidation occurs when collateral value drops below threshold',
      () => {
        fc.assert(
          fc.property(
            fc.float({ min: 1000, max: 100000 }),
            fc.float({ min: 500, max: 80000 }),
            fc.float({ min: 1.2, max: 2.0 }),
            (collateralValue, debtValue, liquidationThreshold) => {
              const shouldLiquidate = isLiquidatable(collateralValue, debtValue, liquidationThreshold);
              const actualRatio = collateralValue / debtValue;
              
              return shouldLiquidate === (actualRatio < liquidationThreshold);
            }
          )
        );
      }
    );

    PropertyTesting.run(
      'Zero penalty rate results in zero penalty',
      () => {
        fc.assert(
          fc.property(
            fc.float({ min: 1000, max: 100000 }),
            (liquidatedAmount) => {
              const penalty = calculateLiquidationPenalty(liquidatedAmount, 0);
              return penalty === 0;
            }
          )
        );
      }
    );
  });

  describe('Portfolio Calculations', () => {
    /**
     * Portfolio value calculation
     */
    const calculatePortfolioValue = (assets: Array<{ amount: number; price: number }>): number => {
      return assets.reduce((total, asset) => total + (asset.amount * asset.price), 0);
    };

    /**
     * Portfolio weight calculation
     */
    const calculateAssetWeight = (assetValue: number, portfolioValue: number): number => {
      if (portfolioValue === 0) return 0;
      return assetValue / portfolioValue;
    };

    PropertyTesting.run(
      'Portfolio weights sum to 1',
      () => {
        fc.assert(
          fc.property(
            fc.array(
              fc.record({
                amount: fc.float({ min: 1, max: 1000 }),
                price: fc.float({ min: 1, max: 1000 }),
              }),
              { minLength: 2, maxLength: 10 }
            ),
            (assets) => {
              const portfolioValue = calculatePortfolioValue(assets);
              const weights = assets.map(asset => calculateAssetWeight(asset.amount * asset.price, portfolioValue));
              const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
              
              const tolerance = 0.0001;
              return Math.abs(totalWeight - 1) <= tolerance;
            }
          )
        );
      }
    );

    PropertyTesting.run(
      'Portfolio value scales linearly with all prices',
      () => {
        fc.assert(
          fc.property(
            fc.array(
              fc.record({
                amount: fc.float({ min: 1, max: 1000 }),
                price: fc.float({ min: 1, max: 1000 }),
              }),
              { minLength: 1, maxLength: 5 }
            ),
            fc.float({ min: 1.1, max: 10 }),
            (assets, scale) => {
              const originalValue = calculatePortfolioValue(assets);
              const scaledAssets = assets.map(asset => ({ ...asset, price: asset.price * scale }));
              const scaledValue = calculatePortfolioValue(scaledAssets);
              
              const tolerance = originalValue * 0.0001;
              return Math.abs(scaledValue - (originalValue * scale)) <= tolerance;
            }
          )
        );
      }
    );
  });

  describe('Price Impact Models', () => {
    /**
     * Linear price impact model
     */
    const calculateLinearPriceImpact = (tradeSize: number, liquidity: number): number => {
      if (liquidity === 0) return Infinity;
      return tradeSize / liquidity;
    };

    /**
     * Square root price impact model
     */
    const calculateSqrtPriceImpact = (tradeSize: number, liquidity: number): number => {
      if (liquidity === 0) return Infinity;
      return Math.sqrt(tradeSize / liquidity);
    };

    PropertyTesting.run(
      'Price impact increases monotonically with trade size',
      () => {
        PropertyTesting.math.monotonicity(
          fc.record({
            tradeSize: fc.float({ min: 100, max: 100000 }),
            liquidity: fc.float({ min: 10000, max: 1000000 }),
          }),
          (params) => calculateLinearPriceImpact(params.tradeSize, params.liquidity),
          (a, b) => a.liquidity === b.liquidity && a.tradeSize <= b.tradeSize,
          (a, b) => a <= b
        )();
      }
    );

    PropertyTesting.run(
      'Square root model has lower impact than linear for large trades',
      () => {
        fc.assert(
          fc.property(
            fc.float({ min: 10000, max: 1000000 }),
            fc.float({ min: 100000, max: 10000000 }),
            (tradeSize, liquidity) => {
              fc.pre(tradeSize > liquidity * 0.1); // Large trade condition
              
              const linearImpact = calculateLinearPriceImpact(tradeSize, liquidity);
              const sqrtImpact = calculateSqrtPriceImpact(tradeSize, liquidity);
              
              return sqrtImpact <= linearImpact;
            }
          )
        );
      }
    );

    PropertyTesting.run(
      'Zero trade size results in zero price impact',
      () => {
        fc.assert(
          fc.property(
            fc.float({ min: 1000, max: 1000000 }),
            (liquidity) => {
              const linearImpact = calculateLinearPriceImpact(0, liquidity);
              const sqrtImpact = calculateSqrtPriceImpact(0, liquidity);
              
              return linearImpact === 0 && sqrtImpact === 0;
            }
          )
        );
      }
    );
  });
});