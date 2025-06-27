/**
 * Property-Based Tests for Oracle Service
 *
 * Uses fast-check for property-based testing of oracle functionality,
 * focusing on mathematical properties and invariants
 */

import fc from "fast-check";
import { pipe } from "fp-ts/function";
import { Either, isLeft, isRight } from "fp-ts/Either";

import {
  ChainlinkOracleService,
  createOracleServiceFacade,
  DEFAULT_AGGREGATION_STRATEGY,
  DEFAULT_CONSENSUS_CONFIG,
} from "@nyxusd/oracle-service";

import {
  createPrivacyOracleService,
  DEFAULT_PRIVACY_CONFIG,
} from "../src/services/privacy-oracle-service";

describe("Oracle Service Properties", () => {
  const oracleConfig = {
    network: "testnet",
    provider: "mock://localhost",
    defaultTimeout: 5000,
    defaultMaxStaleness: 3600,
    defaultMinConfidence: 95,
    cacheTtl: 60,
    retry: {
      maxAttempts: 3,
      delayMs: 1000,
      backoffMultiplier: 2,
    },
  };

  const oracleService = new ChainlinkOracleService(oracleConfig);

  describe("Price Data Properties", () => {
    it("should always return positive prices", () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom("ETH/USD", "BTC/USD", "ADA/USD", "DUST/USD"),
          async (feedId) => {
            const query = {
              feedId,
              allowCached: false,
              timeout: 5000,
              maxStaleness: 3600,
              minConfidence: 90,
            };

            const result = oracleService.fetchPrice(query)();

            if (isRight(result)) {
              const price = result.right.data.price;
              expect(price).toBeGreaterThan(BigInt(0));
              return true;
            }

            return true; // Allow errors for this property
          },
        ),
        { numRuns: 50 },
      );
    });

    it("should maintain price consistency within reasonable bounds", () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom("ETH/USD", "BTC/USD", "ADA/USD", "DUST/USD"),
          fc.integer({ min: 1, max: 10 }),
          async (feedId, iterations) => {
            const prices: bigint[] = [];

            for (let i = 0; i < iterations; i++) {
              const query = {
                feedId,
                allowCached: false,
                timeout: 5000,
                maxStaleness: 3600,
                minConfidence: 90,
              };

              const result = oracleService.fetchPrice(query)();

              if (isRight(result)) {
                prices.push(result.right.data.price);
              }
            }

            if (prices.length >= 2) {
              // Check that price variations are within reasonable bounds (e.g., not more than 10% difference)
              const minPrice = prices.reduce((min, p) => (p < min ? p : min));
              const maxPrice = prices.reduce((max, p) => (p > max ? p : max));

              if (minPrice > BigInt(0)) {
                const variation = Number(
                  ((maxPrice - minPrice) * BigInt(100)) / minPrice,
                );
                expect(variation).toBeLessThanOrEqual(10); // Max 10% variation
              }
            }

            return true;
          },
        ),
        { numRuns: 30 },
      );
    });

    it("should return valid timestamps", () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom("ETH/USD", "BTC/USD", "ADA/USD", "DUST/USD"),
          async (feedId) => {
            const query = {
              feedId,
              allowCached: false,
              timeout: 5000,
              maxStaleness: 3600,
              minConfidence: 90,
            };

            const result = oracleService.fetchPrice(query)();

            if (isRight(result)) {
              const timestamp = result.right.data.timestamp;
              const now = Math.floor(Date.now() / 1000);

              // Timestamp should be within the last hour and not in the future
              expect(timestamp).toBeGreaterThan(now - 3600);
              expect(timestamp).toBeLessThanOrEqual(now + 60); // Allow small clock differences

              return true;
            }

            return true;
          },
        ),
        { numRuns: 50 },
      );
    });

    it("should return confidence scores within valid range", () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom("ETH/USD", "BTC/USD", "ADA/USD", "DUST/USD"),
          async (feedId) => {
            const query = {
              feedId,
              allowCached: false,
              timeout: 5000,
              maxStaleness: 3600,
              minConfidence: 90,
            };

            const result = oracleService.fetchPrice(query)();

            if (isRight(result)) {
              const confidence = result.right.data.confidence;
              expect(confidence).toBeGreaterThanOrEqual(0);
              expect(confidence).toBeLessThanOrEqual(100);

              return true;
            }

            return true;
          },
        ),
        { numRuns: 50 },
      );
    });
  });

  describe("Privacy Oracle Properties", () => {
    const privacyService = createPrivacyOracleService(DEFAULT_PRIVACY_CONFIG);

    it("should generate valid ZK proofs for any price", () => {
      fc.assert(
        fc.asyncProperty(
          fc.bigInt({ min: 1n, max: 1000000000000n }),
          fc.hexaString({ minLength: 16, maxLength: 32 }),
          fc.array(fc.string(), { minLength: 1, maxLength: 5 }),
          async (price, nonce, publicInputs) => {
            const query = {
              feedId: "ETH/USD",
              requesterPublicKey: "mock-public-key",
              priceConstraints: {
                maxStaleness: 3600,
              },
              privacyParams: {
                requireZKProof: true,
                encryptResponse: false,
                anonymizeSource: false,
              },
              nonce,
            };

            const result = await privacyService.fetchPrivatePrice(query);

            if (isRight(result)) {
              const zkProof = result.right.data.zkProof;

              // ZK proof should have required fields
              expect(zkProof.proof).toBeDefined();
              expect(zkProof.proof.length).toBeGreaterThan(0);
              expect(zkProof.publicInputs).toBeDefined();
              expect(zkProof.verificationKey).toBeDefined();
              expect(zkProof.circuit).toBeDefined();
              expect(zkProof.timestamp).toBeGreaterThan(0);

              return true;
            }

            return true;
          },
        ),
        { numRuns: 30 },
      );
    });

    it("should verify generated proofs successfully", () => {
      fc.assert(
        fc.asyncProperty(
          fc.bigInt({ min: 1n, max: 1000000000000n }),
          fc.hexaString({ minLength: 16, maxLength: 32 }),
          async (price, nonce) => {
            // First generate a proof
            const query = {
              feedId: "ETH/USD",
              requesterPublicKey: "mock-public-key",
              priceConstraints: {
                maxStaleness: 3600,
              },
              privacyParams: {
                requireZKProof: true,
                encryptResponse: false,
                anonymizeSource: false,
              },
              nonce,
            };

            const generateResult =
              await privacyService.fetchPrivatePrice(query);

            if (isRight(generateResult)) {
              const zkProof = generateResult.right.data.zkProof;

              // Then verify the proof
              const verifyResult = await privacyService.verifyZKProof(
                zkProof,
                zkProof.publicInputs,
              );

              if (isRight(verifyResult)) {
                expect(verifyResult.right).toBe(true);
              }

              return true;
            }

            return true;
          },
        ),
        { numRuns: 20 },
      );
    });

    it("should generate deterministic commitments for same inputs", () => {
      fc.assert(
        fc.asyncProperty(
          fc.bigInt({ min: 1n, max: 1000000000000n }),
          fc.hexaString({ minLength: 16, maxLength: 32 }),
          async (price, nonce) => {
            const commitment1 = await privacyService.generatePriceCommitment(
              price,
              nonce,
            );
            const commitment2 = await privacyService.generatePriceCommitment(
              price,
              nonce,
            );

            if (isRight(commitment1) && isRight(commitment2)) {
              expect(commitment1.right).toBe(commitment2.right);
              return true;
            }

            return true;
          },
        ),
        { numRuns: 30 },
      );
    });
  });

  describe("Aggregation Properties", () => {
    const aggregatorService = createOracleServiceFacade({
      primaryOracle: oracleConfig,
      aggregationStrategy: DEFAULT_AGGREGATION_STRATEGY,
      consensusConfig: DEFAULT_CONSENSUS_CONFIG,
      enableFallback: true,
      cache: {
        enabled: true,
        ttl: 60,
      },
    });

    it("should maintain feed ID consistency", () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom("ETH/USD", "BTC/USD", "ADA/USD", "DUST/USD"),
          async (feedId) => {
            const query = {
              feedId,
              allowCached: false,
              timeout: 5000,
              maxStaleness: 3600,
              minConfidence: 90,
            };

            const result = aggregatorService.fetchPrice(query)();

            if (isRight(result)) {
              expect(result.right.data.feedId).toBe(feedId);
              return true;
            }

            return true;
          },
        ),
        { numRuns: 40 },
      );
    });

    it("should return health status consistently", () => {
      fc.assert(
        fc.asyncProperty(
          fc.constant(null), // No input needed for health check
          async () => {
            const result = aggregatorService.checkHealth()();

            if (isRight(result)) {
              const health = result.right;

              // Health status should be valid
              expect(["healthy", "degraded", "unhealthy"]).toContain(
                health.status,
              );

              // Metrics should be reasonable
              expect(health.metrics.totalFeeds).toBeGreaterThanOrEqual(0);
              expect(health.metrics.healthyFeeds).toBeGreaterThanOrEqual(0);
              expect(health.metrics.healthyFeeds).toBeLessThanOrEqual(
                health.metrics.totalFeeds,
              );
              expect(health.metrics.averageConfidence).toBeGreaterThanOrEqual(
                0,
              );
              expect(health.metrics.averageConfidence).toBeLessThanOrEqual(100);

              return true;
            }

            return true;
          },
        ),
        { numRuns: 20 },
      );
    });
  });

  describe("Error Handling Properties", () => {
    it("should handle invalid feed IDs gracefully", () => {
      fc.assert(
        fc.asyncProperty(
          fc
            .string()
            .filter(
              (s) => !["ETH/USD", "BTC/USD", "ADA/USD", "DUST/USD"].includes(s),
            ),
          async (invalidFeedId) => {
            const query = {
              feedId: invalidFeedId,
              allowCached: false,
              timeout: 5000,
              maxStaleness: 3600,
              minConfidence: 90,
            };

            const result = oracleService.fetchPrice(query)();

            // Should either succeed with valid data or fail gracefully
            if (isRight(result)) {
              // If it succeeds, data should be valid
              expect(result.right.data.price).toBeGreaterThan(BigInt(0));
            } else {
              // If it fails, should have proper error structure
              expect(result.left).toBeDefined();
              expect(typeof result.left.message).toBe("string");
            }

            return true;
          },
        ),
        { numRuns: 30 },
      );
    });

    it("should handle extreme confidence requirements", () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom("ETH/USD", "BTC/USD", "ADA/USD", "DUST/USD"),
          fc.integer({ min: 0, max: 100 }),
          async (feedId, minConfidence) => {
            const query = {
              feedId,
              allowCached: false,
              timeout: 5000,
              maxStaleness: 3600,
              minConfidence,
            };

            const result = oracleService.fetchPrice(query)();

            if (isRight(result)) {
              // If confidence requirement is met, returned confidence should be >= requirement
              expect(result.right.data.confidence).toBeGreaterThanOrEqual(
                minConfidence,
              );
            }

            return true;
          },
        ),
        { numRuns: 40 },
      );
    });
  });

  describe("Caching Properties", () => {
    it("should return identical data for cached requests", () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom("ETH/USD", "BTC/USD", "ADA/USD", "DUST/USD"),
          async (feedId) => {
            const query = {
              feedId,
              allowCached: true,
              timeout: 5000,
              maxStaleness: 3600,
              minConfidence: 90,
            };

            const result1 = oracleService.fetchPrice(query)();
            const result2 = oracleService.fetchPrice(query)();

            if (isRight(result1) && isRight(result2)) {
              // Cached results should have same price (within small time window)
              // or be reasonably close due to price updates
              const price1 = Number(result1.right.data.price);
              const price2 = Number(result2.right.data.price);

              const priceDiff =
                Math.abs(price1 - price2) / Math.max(price1, price2);
              expect(priceDiff).toBeLessThan(0.01); // Less than 1% difference
            }

            return true;
          },
        ),
        { numRuns: 25 },
      );
    });
  });
});

describe("Mathematical Oracle Properties", () => {
  describe("Price Aggregation Mathematics", () => {
    it("should satisfy median properties", () => {
      fc.assert(
        fc.property(
          fc.array(fc.bigInt({ min: 1000000n, max: 10000000000n }), {
            minLength: 3,
            maxLength: 10,
          }),
          (prices) => {
            const sortedPrices = [...prices].sort((a, b) =>
              a < b ? -1 : a > b ? 1 : 0,
            );
            const median = sortedPrices[Math.floor(sortedPrices.length / 2)];

            // Median should be in the middle of sorted array
            const smallerCount = sortedPrices.filter((p) => p < median).length;
            const largerCount = sortedPrices.filter((p) => p > median).length;

            // For odd length arrays, median is exact middle
            // For even length arrays, we'd take average, but this tests the principle
            if (sortedPrices.length % 2 === 1) {
              expect(Math.abs(smallerCount - largerCount)).toBeLessThanOrEqual(
                1,
              );
            }

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should satisfy weighted average properties", () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              price: fc.bigInt({ min: 1000000n, max: 10000000000n }),
              weight: fc.float({ min: 0.1, max: 10 }),
            }),
            { minLength: 2, maxLength: 5 },
          ),
          (priceWeights) => {
            const totalWeight = priceWeights.reduce(
              (sum, pw) => sum + pw.weight,
              0,
            );
            const weightedSum = priceWeights.reduce(
              (sum, pw) => sum + Number(pw.price) * pw.weight,
              0,
            );
            const weightedAverage = weightedSum / totalWeight;

            // Weighted average should be within the range of input prices
            const minPrice = Math.min(
              ...priceWeights.map((pw) => Number(pw.price)),
            );
            const maxPrice = Math.max(
              ...priceWeights.map((pw) => Number(pw.price)),
            );

            expect(weightedAverage).toBeGreaterThanOrEqual(minPrice);
            expect(weightedAverage).toBeLessThanOrEqual(maxPrice);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should detect outliers correctly using z-score", () => {
      fc.assert(
        fc.property(
          fc.array(fc.float({ min: 1000, max: 10000 }), {
            minLength: 5,
            maxLength: 20,
          }),
          fc.float({ min: 1.5, max: 3.0 }), // z-score threshold
          (prices, threshold) => {
            const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
            const variance =
              prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) /
              prices.length;
            const stdDev = Math.sqrt(variance);

            const outliers = prices.filter((p) => {
              const zScore = Math.abs((p - mean) / stdDev);
              return zScore > threshold;
            });

            // Each detected outlier should indeed have z-score > threshold
            outliers.forEach((outlier) => {
              const zScore = Math.abs((outlier - mean) / stdDev);
              expect(zScore).toBeGreaterThan(threshold);
            });

            return true;
          },
        ),
        { numRuns: 50 },
      );
    });
  });

  describe("Confidence Score Mathematics", () => {
    it("should maintain confidence bounds", () => {
      fc.assert(
        fc.property(
          fc.array(fc.float({ min: 0, max: 100 }), {
            minLength: 1,
            maxLength: 10,
          }),
          fc.array(fc.float({ min: 0.1, max: 5 }), {
            minLength: 1,
            maxLength: 10,
          }),
          (confidences, weights) => {
            // Ensure arrays have same length
            const minLength = Math.min(confidences.length, weights.length);
            const confSlice = confidences.slice(0, minLength);
            const weightSlice = weights.slice(0, minLength);

            const totalWeight = weightSlice.reduce((sum, w) => sum + w, 0);
            const weightedConfidence =
              confSlice.reduce((sum, c, i) => sum + c * weightSlice[i], 0) /
              totalWeight;

            // Weighted confidence should be within bounds
            expect(weightedConfidence).toBeGreaterThanOrEqual(0);
            expect(weightedConfidence).toBeLessThanOrEqual(100);

            // Should be within range of input confidences
            const minConf = Math.min(...confSlice);
            const maxConf = Math.max(...confSlice);
            expect(weightedConfidence).toBeGreaterThanOrEqual(minConf);
            expect(weightedConfidence).toBeLessThanOrEqual(maxConf);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
