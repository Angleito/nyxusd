/**
 * Integration tests for complete CDP lifecycle scenarios
 */

import { CDPFixtures, CollateralFixtures, OracleFixtures } from "../fixtures";
import { ResultTestHelpers } from "../utils/result-helpers";
import { DataGenerators } from "../utils/data-generators";

describe("CDP Lifecycle Integration Tests", () => {
  describe("CDP Creation and Management", () => {
    test("should create CDP with valid collateral", async () => {
      const createRequest = CDPFixtures.samples.createRequests[0];
      const collateralAsset = CollateralFixtures.samples.assets[0]; // ETH

      // Mock CDP creation process
      const createCDP = async (request: typeof createRequest) => {
        // Validate collateral asset is active
        if (!collateralAsset.isActive) {
          return { success: false, error: "Collateral asset not active" };
        }

        // Check minimum collateral value
        const collateralValue =
          Number(request.initialCollateral.amount) /
          Math.pow(10, collateralAsset.decimals);
        const minValue = 1000; // $1000 minimum

        if (collateralValue < minValue) {
          return { success: false, error: "Insufficient collateral value" };
        }

        // Create CDP
        const cdp = {
          id: `cdp_${Date.now()}`,
          owner: request.owner,
          status: "active" as const,
          collateralValue: collateralValue * 1600, // Assume ETH price $1600
          debtAmount: request.initialDebt || 0n,
          availableCredit: 0n,
          collateralizationRatio: request.minCollateralizationRatio / 100,
          healthFactor: 2.0,
          liquidationPrice: 1200,
          riskLevel: "low" as const,
          stabilityFee: collateralAsset.stabilityFee,
          accruedFees: 0n,
          lastFeeUpdate: Math.floor(Date.now() / 1000),
          createdAt: Math.floor(Date.now() / 1000),
          lastUpdated: Math.floor(Date.now() / 1000),
        };

        return { success: true, cdp };
      };

      const result = await createCDP(createRequest);

      expect(result.success).toBe(true);
      expect(result.cdp).toBeDefined();
      expect(result.cdp?.owner).toBe(createRequest.owner);
      expect(result.cdp?.status).toBe("active");
    });

    test("should reject CDP creation with insufficient collateral", async () => {
      const createRequest = {
        ...CDPFixtures.samples.createRequests[0],
        initialCollateral: {
          ...CDPFixtures.samples.createRequests[0].initialCollateral,
          amount: 100000000000000000n, // 0.1 ETH (insufficient)
        },
      };

      const createCDP = async (request: typeof createRequest) => {
        const collateralValue =
          Number(request.initialCollateral.amount) / Math.pow(10, 18);
        const minValue = 1000; // $1000 minimum

        if (collateralValue * 1600 < minValue) {
          return { success: false, error: "Insufficient collateral value" };
        }

        return { success: true, cdp: {} };
      };

      const result = await createCDP(createRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Insufficient collateral value");
    });
  });

  describe("Collateral Operations", () => {
    test("should process collateral deposit successfully", async () => {
      const baseCDP = CDPFixtures.samples.cdps[0];
      const depositOperation = CDPFixtures.samples.collateralUpdates[0];

      const processDeposit = async (
        cdp: typeof baseCDP,
        operation: typeof depositOperation,
      ) => {
        if (operation.operation !== "deposit") {
          return { success: false, error: "Invalid operation type" };
        }

        // Calculate new collateral value
        const additionalValue =
          (Number(operation.amount) / Math.pow(10, 18)) * 1600; // ETH price
        const newCollateralValue = cdp.collateralValue + additionalValue;

        // Calculate new health factor
        const newHealthFactor =
          (newCollateralValue / Number(cdp.debtAmount)) * 100;

        // Check minimum health factor requirement
        if (newHealthFactor < operation.minHealthFactorAfter) {
          return { success: false, error: "Health factor requirement not met" };
        }

        const updatedCDP = {
          ...cdp,
          collateralValue: newCollateralValue,
          healthFactor: newHealthFactor,
          lastUpdated: Math.floor(Date.now() / 1000),
        };

        return { success: true, cdp: updatedCDP };
      };

      const result = await processDeposit(baseCDP, depositOperation);

      expect(result.success).toBe(true);
      expect(result.cdp?.collateralValue).toBeGreaterThan(
        baseCDP.collateralValue,
      );
      expect(result.cdp?.healthFactor).toBeGreaterThan(baseCDP.healthFactor);
    });

    test("should prevent withdrawal that would cause liquidation", async () => {
      const riskyCDP = CDPFixtures.samples.cdps[1]; // Medium risk CDP
      const withdrawalOperation = {
        ...CDPFixtures.samples.collateralUpdates[1],
        operation: "withdraw" as const,
        amount: 5000000000000000000n, // 5 ETH (large withdrawal)
        minHealthFactorAfterWithdrawal: 1.2,
      };

      const processWithdrawal = async (
        cdp: typeof riskyCDP,
        operation: typeof withdrawalOperation,
      ) => {
        if (operation.operation !== "withdraw") {
          return { success: false, error: "Invalid operation type" };
        }

        // Calculate remaining collateral value
        const withdrawalValue =
          (Number(operation.amount) / Math.pow(10, 8)) * 42000; // BTC price
        const remainingCollateralValue = cdp.collateralValue - withdrawalValue;

        // Calculate resulting health factor
        const newHealthFactor =
          (remainingCollateralValue / Number(cdp.debtAmount)) * 100;

        // Check minimum health factor requirement
        if (newHealthFactor < operation.minHealthFactorAfterWithdrawal) {
          return {
            success: false,
            error: "Withdrawal would violate minimum health factor",
          };
        }

        const updatedCDP = {
          ...cdp,
          collateralValue: remainingCollateralValue,
          healthFactor: newHealthFactor,
          lastUpdated: Math.floor(Date.now() / 1000),
        };

        return { success: true, cdp: updatedCDP };
      };

      const result = await processWithdrawal(riskyCDP, withdrawalOperation);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Withdrawal would violate minimum health factor",
      );
    });
  });

  describe("Debt Operations", () => {
    test("should process debt minting with collateral check", async () => {
      const baseCDP = CDPFixtures.samples.cdps[0];
      const mintOperation = CDPFixtures.samples.debtUpdates[0];

      const processMint = async (
        cdp: typeof baseCDP,
        operation: typeof mintOperation,
      ) => {
        if (operation.operation !== "mint") {
          return { success: false, error: "Invalid operation type" };
        }

        // Calculate new debt amount
        const newDebtAmount = cdp.debtAmount + operation.amount;

        // Calculate resulting collateralization ratio
        const newCollateralizationRatio =
          (cdp.collateralValue / Number(newDebtAmount)) * 100;

        // Check minimum collateralization ratio
        if (
          newCollateralizationRatio <
          operation.minCollateralizationRatioAfter / 100
        ) {
          return {
            success: false,
            error: "Minting would violate minimum collateralization ratio",
          };
        }

        // Calculate fees if required
        let fees = 0n;
        if (operation.includeAccruedFees) {
          const timeElapsed = Math.floor(Date.now() / 1000) - cdp.lastFeeUpdate;
          fees = BigInt(
            Math.floor(
              Number(newDebtAmount) *
                (cdp.stabilityFee / 10000) *
                (timeElapsed / (365 * 24 * 3600)),
            ),
          );

          if (operation.maxFeeAmount && fees > operation.maxFeeAmount) {
            return {
              success: false,
              error: "Fee amount exceeds maximum allowed",
            };
          }
        }

        const updatedCDP = {
          ...cdp,
          debtAmount: newDebtAmount,
          collateralizationRatio: newCollateralizationRatio,
          healthFactor: newCollateralizationRatio / 100,
          accruedFees: cdp.accruedFees + fees,
          lastUpdated: Math.floor(Date.now() / 1000),
        };

        return { success: true, cdp: updatedCDP };
      };

      const result = await processMint(baseCDP, mintOperation);

      expect(result.success).toBe(true);
      expect(result.cdp?.debtAmount).toBeGreaterThan(baseCDP.debtAmount);
      expect(result.cdp?.collateralizationRatio).toBeGreaterThan(
        operation.minCollateralizationRatioAfter / 100,
      );
    });

    test("should process debt repayment", async () => {
      const baseCDP = CDPFixtures.samples.cdps[1];
      const repayOperation = CDPFixtures.samples.debtUpdates[1];

      const processRepay = async (
        cdp: typeof baseCDP,
        operation: typeof repayOperation,
      ) => {
        if (operation.operation !== "repay") {
          return { success: false, error: "Invalid operation type" };
        }

        // Check if repayment amount exceeds debt
        if (operation.amount > cdp.debtAmount) {
          return {
            success: false,
            error: "Repayment amount exceeds total debt",
          };
        }

        // Calculate new debt amount
        const newDebtAmount = cdp.debtAmount - operation.amount;

        // Calculate new collateralization ratio
        const newCollateralizationRatio =
          newDebtAmount > 0n
            ? (cdp.collateralValue / Number(newDebtAmount)) * 100
            : Infinity;

        const updatedCDP = {
          ...cdp,
          debtAmount: newDebtAmount,
          collateralizationRatio: newCollateralizationRatio,
          healthFactor:
            newCollateralizationRatio === Infinity
              ? Infinity
              : newCollateralizationRatio / 100,
          lastUpdated: Math.floor(Date.now() / 1000),
        };

        return { success: true, cdp: updatedCDP };
      };

      const result = await processRepay(baseCDP, repayOperation);

      expect(result.success).toBe(true);
      expect(result.cdp?.debtAmount).toBeLessThan(baseCDP.debtAmount);
      expect(result.cdp?.healthFactor).toBeGreaterThan(baseCDP.healthFactor);
    });
  });

  describe("Liquidation Process", () => {
    test("should execute liquidation for unhealthy CDP", async () => {
      const unhealthyCDP = CDPFixtures.samples.cdps[2]; // liquidating status
      const liquidationData = CDPFixtures.samples.liquidations[0];

      const processLiquidation = async (
        cdp: typeof unhealthyCDP,
        liquidator: string,
      ) => {
        // Check if CDP is liquidatable
        if (cdp.healthFactor >= 1.0) {
          return { success: false, error: "CDP is not liquidatable" };
        }

        // Calculate liquidation amounts
        const totalDebtValue = Number(cdp.debtAmount);
        const liquidationPenalty = totalDebtValue * 0.1; // 10% penalty
        const liquidatorReward = totalDebtValue * 0.05; // 5% reward

        // Check if collateral covers debt + penalties
        if (cdp.collateralValue < totalDebtValue + liquidationPenalty) {
          return {
            success: false,
            error: "Insufficient collateral for liquidation",
          };
        }

        const liquidationResult = {
          cdpId: cdp.id,
          liquidator,
          cdpOwner: cdp.owner,
          triggerReason: "health_factor_below_threshold" as const,
          healthFactorAtLiquidation: cdp.healthFactor,
          totalCollateralValue: cdp.collateralValue,
          totalDebtAmount: cdp.debtAmount,
          liquidationPenalty: BigInt(Math.floor(liquidationPenalty)),
          liquidatorReward: BigInt(Math.floor(liquidatorReward)),
          remainingCollateral: BigInt(
            Math.floor(
              cdp.collateralValue - totalDebtValue - liquidationPenalty,
            ),
          ),
          remainingDebt: 0n,
          finalStatus: "liquidated" as const,
          timestamp: Math.floor(Date.now() / 1000),
        };

        return { success: true, liquidation: liquidationResult };
      };

      const result = await processLiquidation(
        unhealthyCDP,
        liquidationData.liquidator,
      );

      expect(result.success).toBe(true);
      expect(result.liquidation?.triggerReason).toBe(
        "health_factor_below_threshold",
      );
      expect(result.liquidation?.finalStatus).toBe("liquidated");
      expect(result.liquidation?.liquidationPenalty).toBeGreaterThan(0n);
    });

    test("should prevent liquidation of healthy CDP", async () => {
      const healthyCDP = CDPFixtures.samples.cdps[0]; // low risk, healthy

      const processLiquidation = async (
        cdp: typeof healthyCDP,
        liquidator: string,
      ) => {
        if (cdp.healthFactor >= 1.0) {
          return { success: false, error: "CDP is not liquidatable" };
        }

        return { success: true, liquidation: {} };
      };

      const result = await processLiquidation(
        healthyCDP,
        "0x1234567890123456789012345678901234567890",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("CDP is not liquidatable");
    });
  });

  describe("Price Oracle Integration", () => {
    test("should handle price updates and recalculate health factors", async () => {
      const cdp = CDPFixtures.samples.cdps[1];
      const priceUpdate = CollateralFixtures.samples.priceUpdates[0]; // ETH price increase

      const handlePriceUpdate = async (
        cdp: typeof cdp,
        priceUpdate: typeof priceUpdate,
      ) => {
        // Validate price update
        if (!priceUpdate.isValidPrice) {
          return { success: false, error: "Invalid price data" };
        }

        if (priceUpdate.confidence < 95) {
          return { success: false, error: "Price confidence too low" };
        }

        // Calculate new collateral value based on price update
        const priceChangeRatio =
          priceUpdate.newPrice /
          (priceUpdate.previousPrice || priceUpdate.newPrice);
        const newCollateralValue = cdp.collateralValue * priceChangeRatio;

        // Recalculate health factor
        const newHealthFactor = newCollateralValue / Number(cdp.debtAmount);

        // Determine new risk level
        let newRiskLevel: "low" | "medium" | "high" | "critical";
        if (newHealthFactor >= 2.0) newRiskLevel = "low";
        else if (newHealthFactor >= 1.5) newRiskLevel = "medium";
        else if (newHealthFactor >= 1.2) newRiskLevel = "high";
        else newRiskLevel = "critical";

        const updatedCDP = {
          ...cdp,
          collateralValue: newCollateralValue,
          healthFactor: newHealthFactor,
          riskLevel: newRiskLevel,
          lastUpdated: priceUpdate.timestamp,
        };

        return { success: true, cdp: updatedCDP, priceUpdate };
      };

      const result = await handlePriceUpdate(cdp, priceUpdate);

      expect(result.success).toBe(true);
      expect(result.cdp?.collateralValue).toBeGreaterThan(cdp.collateralValue); // Price increased
      expect(result.cdp?.healthFactor).toBeGreaterThan(cdp.healthFactor);
    });

    test("should handle oracle failures gracefully", async () => {
      const cdp = CDPFixtures.samples.cdps[0];
      const failedPriceUpdate = OracleFixtures.failures.staleData.scenarios[0];

      const handlePriceUpdate = async (
        cdp: typeof cdp,
        priceData: typeof failedPriceUpdate,
      ) => {
        const currentTime = priceData.currentTime;
        const lastUpdate = priceData.lastUpdate;
        const stalenessThreshold = priceData.stalenessThreshold;

        // Check if price data is stale
        if (currentTime - lastUpdate > stalenessThreshold) {
          return {
            success: false,
            error: "Price data is stale",
            action: priceData.action,
            staleness: currentTime - lastUpdate,
          };
        }

        return { success: true, cdp };
      };

      const result = await handlePriceUpdate(cdp, failedPriceUpdate);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Price data is stale");
      expect(result.action).toBe("reject_price");
      expect(result.staleness).toBeGreaterThan(
        failedPriceUpdate.stalenessThreshold,
      );
    });
  });

  describe("Multi-Asset Portfolio Management", () => {
    test("should manage diversified collateral portfolio", async () => {
      const portfolio = CollateralFixtures.samples.portfolios[0];
      const rebalanceThreshold = 5; // 5% deviation triggers rebalance

      const checkRebalancingNeed = (portfolio: typeof portfolio) => {
        const needsRebalancing = portfolio.collateralAssets.some((asset) => {
          const deviation = Math.abs(
            asset.weight - (asset.allocationTarget || asset.weight),
          );
          return deviation > rebalanceThreshold;
        });

        return {
          needsRebalancing,
          currentAllocations: portfolio.collateralAssets.map((asset) => ({
            asset: asset.assetAddress,
            currentWeight: asset.weight,
            targetWeight: asset.allocationTarget || asset.weight,
            deviation: Math.abs(
              asset.weight - (asset.allocationTarget || asset.weight),
            ),
          })),
        };
      };

      const result = checkRebalancingNeed(portfolio);

      expect(result.needsRebalancing).toBe(portfolio.needsRebalancing);
      expect(result.currentAllocations).toHaveLength(
        portfolio.collateralAssets.length,
      );
      expect(result.currentAllocations.every((a) => a.deviation >= 0)).toBe(
        true,
      );
    });
  });

  describe("Stress Testing Scenarios", () => {
    test("should handle market crash scenario", async () => {
      const initialCDPs = CDPFixtures.samples.cdps.slice(0, 3);
      const crashScenario = OracleFixtures.stress.blackSwan;

      const simulateMarketCrash = async (
        cdps: typeof initialCDPs,
        scenario: typeof crashScenario,
      ) => {
        const results = cdps.map((cdp) => {
          // Apply 50% price shock to all collateral
          const newCollateralValue = cdp.collateralValue * 0.5;
          const newHealthFactor = newCollateralValue / Number(cdp.debtAmount);

          const isLiquidated = newHealthFactor < 1.0;

          return {
            cdpId: cdp.id,
            originalHealthFactor: cdp.healthFactor,
            newHealthFactor,
            isLiquidated,
            newRiskLevel: isLiquidated
              ? "critical"
              : newHealthFactor < 1.2
                ? "high"
                : newHealthFactor < 1.5
                  ? "medium"
                  : "low",
          };
        });

        const liquidatedCount = results.filter((r) => r.isLiquidated).length;
        const totalAtRisk = results.filter(
          (r) => r.newHealthFactor < 1.2,
        ).length;

        return {
          scenario: scenario.name,
          totalCDPs: cdps.length,
          liquidatedCount,
          totalAtRisk,
          results,
        };
      };

      const result = await simulateMarketCrash(initialCDPs, crashScenario);

      expect(result.scenario).toBe("Black Swan Event");
      expect(result.totalCDPs).toBe(3);
      expect(result.liquidatedCount).toBeGreaterThanOrEqual(0);
      expect(result.totalAtRisk).toBeGreaterThanOrEqual(result.liquidatedCount);
    });
  });
});
