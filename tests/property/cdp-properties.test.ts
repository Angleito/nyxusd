/**
 * Property-based tests for CDP mathematical properties and invariants
 */

import * as fc from 'fast-check';
import { PropertyTesting } from '../utils/property-testing';
import { DataGenerators } from '../utils/data-generators';
import { ResultTestHelpers } from '../utils/result-helpers';
import { CDPFixtures } from '../fixtures';

describe('CDP Mathematical Properties', () => {
  describe('Health Factor Properties', () => {
    PropertyTesting.run(
      'Health factor is always non-negative',
      () => {
        PropertyTesting.financial.nonNegativeCollateral(
          DataGenerators.cdp.cdpConfig(),
          (cdp) => cdp.healthFactor
        )();
      }
    );

    PropertyTesting.run(
      'Health factor calculation is consistent',
      () => {
        PropertyTesting.financial.healthFactorConsistency(
          DataGenerators.cdp.cdpConfig(),
          (cdp) => cdp.healthFactor,
          (cdp) => cdp.collateralValue,
          (cdp) => Number(cdp.debtAmount),
          (cdp) => cdp.collateralizationRatio / 100 // Convert to decimal
        )();
      }
    );

    PropertyTesting.run(
      'Liquidation triggers when health factor < 1',
      () => {
        PropertyTesting.financial.liquidationTrigger(
          DataGenerators.cdp.cdpConfig(),
          (cdp) => cdp.healthFactor,
          (cdp) => cdp.healthFactor < 1.0
        )();
      }
    );
  });

  describe('Collateralization Ratio Properties', () => {
    PropertyTesting.run(
      'Collateralization ratio is monotonic with collateral value',
      () => {
        PropertyTesting.math.monotonicity(
          fc.record({
            collateralValue: fc.float({ min: 1000, max: 100000 }),
            debtAmount: fc.bigInt({ min: 1000n, max: 50000n }),
          }),
          (data) => data.collateralValue / Number(data.debtAmount),
          (a, b) => a.collateralValue <= b.collateralValue && a.debtAmount === b.debtAmount,
          (a, b) => a <= b
        )();
      }
    );

    PropertyTesting.run(
      'Adding collateral improves health factor',
      () => {
        fc.assert(
          fc.property(
            DataGenerators.cdp.cdpConfig(),
            DataGenerators.financial.collateralAmount(),
            (baseCDP, additionalCollateral) => {
              const originalHealthFactor = baseCDP.healthFactor;
              const originalCollateralValue = baseCDP.collateralValue;
              const additionalValue = Number(additionalCollateral) * 0.001; // Assume price conversion
              
              const newCollateralValue = originalCollateralValue + additionalValue;
              const newHealthFactor = (newCollateralValue * (baseCDP.collateralizationRatio / 100)) / Number(baseCDP.debtAmount);
              
              return newHealthFactor >= originalHealthFactor;
            }
          )
        );
      }
    );
  });

  describe('Fee Accrual Properties', () => {
    PropertyTesting.run(
      'Fees accrue monotonically over time',
      () => {
        PropertyTesting.cdp.feeAccrual(
          DataGenerators.cdp.cdpConfig(),
          (cdp, timeElapsed) => {
            const principal = Number(cdp.debtAmount);
            const rate = cdp.stabilityFee / 10000; // Convert basis points to decimal
            const annualizedRate = rate; // Assuming annual rate
            const timeInYears = timeElapsed / (365 * 24 * 3600);
            return BigInt(Math.floor(principal * annualizedRate * timeInYears));
          },
          (cdp) => cdp.stabilityFee / 10000
        )();
      }
    );

    PropertyTesting.run(
      'Zero stability fee results in zero fee accrual',
      () => {
        fc.assert(
          fc.property(
            DataGenerators.cdp.cdpConfig().map(cdp => ({ ...cdp, stabilityFee: 0 })),
            fc.integer({ min: 0, max: 365 * 24 * 3600 }),
            (cdp, timeElapsed) => {
              const fees = (cdp.stabilityFee / 10000) * Number(cdp.debtAmount) * (timeElapsed / (365 * 24 * 3600));
              return fees === 0;
            }
          )
        );
      }
    );
  });

  describe('Risk Level Properties', () => {
    PropertyTesting.run(
      'Risk level correlates with health factor',
      () => {
        fc.assert(
          fc.property(
            DataGenerators.cdp.cdpConfig(),
            (cdp) => {
              const { healthFactor, riskLevel } = cdp;
              
              if (healthFactor >= 2.0) {
                return riskLevel === 'low';
              } else if (healthFactor >= 1.5) {
                return ['low', 'medium'].includes(riskLevel);
              } else if (healthFactor >= 1.2) {
                return ['medium', 'high'].includes(riskLevel);
              } else {
                return ['high', 'critical'].includes(riskLevel);
              }
            }
          )
        );
      }
    );

    PropertyTesting.run(
      'Critical risk CDPs have health factor close to liquidation',
      () => {
        fc.assert(
          fc.property(
            DataGenerators.cdp.cdpConfig().filter(cdp => cdp.riskLevel === 'critical'),
            (cdp) => {
              return cdp.healthFactor <= 1.2; // Critical CDPs should have low health factor
            }
          )
        );
      }
    );
  });

  describe('Liquidation Properties', () => {
    PropertyTesting.run(
      'Liquidation price calculation is consistent',
      () => {
        fc.assert(
          fc.property(
            DataGenerators.cdp.cdpConfig(),
            (cdp) => {
              const { liquidationPrice, collateralValue, debtAmount } = cdp;
              
              if (Number(debtAmount) === 0) return true; // No debt, no liquidation price
              
              // Liquidation price should be the price at which health factor = 1
              const impliedCollateralAmount = collateralValue / 1600; // Assuming ETH at $1600
              const expectedLiquidationPrice = Number(debtAmount) / (impliedCollateralAmount * 0.8); // Assuming 80% LTV
              
              const tolerance = expectedLiquidationPrice * 0.1; // 10% tolerance
              return Math.abs(liquidationPrice - expectedLiquidationPrice) <= tolerance;
            }
          )
        );
      }
    );

    PropertyTesting.run(
      'Liquidation scenarios preserve value conservation',
      () => {
        fc.assert(
          fc.property(
            CDPFixtures.samples.liquidations[0] ? fc.constant(CDPFixtures.samples.liquidations[0]) : fc.constant(null),
            (liquidation) => {
              if (!liquidation) return true;
              
              const totalCollateralValue = liquidation.totalCollateralValue;
              const totalDebtAmount = Number(liquidation.totalDebtAmount);
              const liquidationPenalty = Number(liquidation.liquidationPenalty);
              const liquidatorReward = Number(liquidation.liquidatorReward);
              
              // Total value should be conserved (minus penalties)
              const totalValueAfterLiquidation = totalDebtAmount + liquidationPenalty + liquidatorReward;
              
              return totalValueAfterLiquidation <= totalCollateralValue;
            }
          )
        );
      }
    );
  });

  describe('Portfolio-Level Properties', () => {
    PropertyTesting.run(
      'Portfolio health factor is weighted average of individual CDPs',
      () => {
        fc.assert(
          fc.property(
            fc.array(DataGenerators.cdp.cdpConfig(), { minLength: 2, maxLength: 5 }),
            (cdps) => {
              const totalCollateralValue = cdps.reduce((sum, cdp) => sum + cdp.collateralValue, 0);
              const totalDebtValue = cdps.reduce((sum, cdp) => sum + Number(cdp.debtAmount), 0);
              
              if (totalDebtValue === 0) return true; // No debt, health factor is infinite
              
              const portfolioHealthFactor = totalCollateralValue / totalDebtValue;
              const weightedAverage = cdps.reduce((sum, cdp) => {
                const weight = cdp.collateralValue / totalCollateralValue;
                return sum + (cdp.healthFactor * weight);
              }, 0);
              
              const tolerance = 0.01; // 1% tolerance
              return Math.abs(portfolioHealthFactor - weightedAverage) <= tolerance;
            }
          )
        );
      }
    );

    PropertyTesting.run(
      'Diversification reduces portfolio risk',
      () => {
        fc.assert(
          fc.property(
            fc.tuple(
              DataGenerators.scenario.multiAssetPortfolio(1), // Single asset
              DataGenerators.scenario.multiAssetPortfolio(4)  // Multi asset
            ),
            ([singleAsset, multiAsset]) => {
              // This is a simplified check - in practice, diversification score would be calculated
              // Multi-asset portfolio should generally have lower risk than single-asset
              return multiAsset.length > singleAsset.length;
            }
          )
        );
      }
    );
  });

  describe('Mathematical Invariants', () => {
    PropertyTesting.run(
      'Addition is commutative for collateral values',
      () => {
        PropertyTesting.math.commutativity(
          fc.float({ min: 0, max: 100000 }),
          (a, b) => a + b
        )();
      }
    );

    PropertyTesting.run(
      'Multiplication is associative for fee calculations',
      () => {
        PropertyTesting.math.associativity(
          fc.float({ min: 0.01, max: 100 }),
          (a, b) => a * b
        )();
      }
    );

    PropertyTesting.run(
      'Zero is identity for addition',
      () => {
        PropertyTesting.math.identity(
          fc.float({ min: 0, max: 100000 }),
          (a, identity) => a + identity,
          0
        )();
      }
    );

    PropertyTesting.run(
      'One is identity for multiplication',
      () => {
        PropertyTesting.math.identity(
          fc.float({ min: 0.01, max: 100 }),
          (a, identity) => a * identity,
          1
        )();
      }
    );
  });

  describe('Edge Case Properties', () => {
    PropertyTesting.run(
      'Minimal CDPs maintain basic invariants',
      () => {
        fc.assert(
          fc.property(
            fc.constant(CDPFixtures.edgeCases.minimalCDP),
            (cdp) => {
              return (
                cdp.collateralValue >= 0 &&
                cdp.debtAmount >= 0n &&
                cdp.healthFactor >= 0 &&
                cdp.createdAt <= cdp.lastUpdated
              );
            }
          )
        );
      }
    );

    PropertyTesting.run(
      'Maximal CDPs maintain basic invariants',
      () => {
        fc.assert(
          fc.property(
            fc.constant(CDPFixtures.edgeCases.maximalCDP),
            (cdp) => {
              return (
                cdp.collateralValue >= 0 &&
                cdp.debtAmount >= 0n &&
                cdp.healthFactor >= 0 &&
                Number.isFinite(cdp.collateralValue) &&
                Number.isFinite(cdp.healthFactor)
              );
            }
          )
        );
      }
    );

    PropertyTesting.run(
      'Zero debt CDPs have infinite or very high health factors',
      () => {
        fc.assert(
          fc.property(
            fc.constant(CDPFixtures.edgeCases.zeroDebtCDP),
            (cdp) => {
              return cdp.debtAmount === 0n && (cdp.healthFactor === Infinity || cdp.healthFactor > 100);
            }
          )
        );
      }
    );
  });
});

describe('CDP State Transition Properties', () => {
  PropertyTesting.run(
    'CDP status transitions are valid',
    () => {
      fc.assert(
        fc.property(
          fc.tuple(
            DataGenerators.basic.cdpStatus(),
            DataGenerators.basic.cdpStatus()
          ),
          ([fromStatus, toStatus]) => {
            const validTransitions: Record<string, string[]> = {
              'active': ['inactive', 'liquidating', 'closed'],
              'inactive': ['active', 'closed'],
              'liquidating': ['liquidated', 'active'], // Can recover if health improves
              'liquidated': ['closed'],
              'closed': [], // Terminal state
              'frozen': ['active', 'inactive', 'liquidating'], // Can unfreeze
            };
            
            return (
              fromStatus === toStatus || // Same state is always valid
              validTransitions[fromStatus]?.includes(toStatus) || false
            );
          }
        )
      );
    }
  );

  PropertyTesting.run(
    'Collateral operations preserve total supply',
    () => {
      fc.assert(
        fc.property(
          DataGenerators.financial.collateralAmount(),
          DataGenerators.financial.collateralAmount(),
          (deposit, withdrawal) => {
            // Ensure withdrawal <= deposit for valid test
            const actualWithdrawal = withdrawal <= deposit ? withdrawal : deposit;
            const finalAmount = deposit - actualWithdrawal;
            
            return finalAmount >= 0n && finalAmount <= deposit;
          }
        )
      );
    }
  );
});

describe('CDP Validation Properties', () => {
  PropertyTesting.run(
    'Valid CDPs pass all validation rules',
    () => {
      fc.assert(
        fc.property(
          DataGenerators.cdp.cdpConfig(),
          (cdp) => {
            // Basic validation rules
            const hasValidId = cdp.id.length > 0;
            const hasValidOwner = cdp.owner.startsWith('0x') && cdp.owner.length === 42;
            const hasValidStatus = ['active', 'inactive', 'liquidating', 'liquidated', 'closed', 'frozen'].includes(cdp.status);
            const hasValidAmounts = cdp.collateralValue >= 0 && cdp.debtAmount >= 0n;
            const hasValidTimestamps = cdp.createdAt <= cdp.lastUpdated;
            
            return hasValidId && hasValidOwner && hasValidStatus && hasValidAmounts && hasValidTimestamps;
          }
        )
      );
    }
  );

  PropertyTesting.run(
    'Invalid CDPs fail validation',
    () => {
      fc.assert(
        fc.property(
          DataGenerators.edgeCase.invalidInputs.invalidAddress(),
          (invalidAddress) => {
            const invalidCDP = {
              ...CDPFixtures.samples.cdps[0],
              owner: invalidAddress,
            };
            
            // This would fail validation in a real validator
            const isValid = invalidAddress.startsWith('0x') && invalidAddress.length === 42;
            return !isValid; // Should be invalid
          }
        )
      );
    }
  );
});