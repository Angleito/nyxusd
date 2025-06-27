/**
 * Oracle Service Tests
 *
 * Basic tests to verify oracle service package exports and structure
 */

describe("Oracle Service Package", () => {
  test("should export basic oracle service components", () => {
    // Test basic import functionality
    expect(() => {
      const {
        createOracleServiceFacade,
        DEFAULT_AGGREGATION_STRATEGY,
        DEFAULT_CONSENSUS_CONFIG,
      } = require("@nyxusd/oracle-service");

      expect(createOracleServiceFacade).toBeDefined();
      expect(DEFAULT_AGGREGATION_STRATEGY).toBeDefined();
      expect(DEFAULT_CONSENSUS_CONFIG).toBeDefined();
    }).not.toThrow();
  });

  test("should have oracle validation schemas available", () => {
    // Test that our validation schemas are properly exported from validators package
    const { CommonValidators } = require("@nyxusd/validators");

    expect(CommonValidators.oraclePriceData).toBeDefined();
    expect(CommonValidators.oracleQuery).toBeDefined();
    expect(CommonValidators.chainlinkRoundData).toBeDefined();
  });

  test("should export oracle types", () => {
    expect(() => {
      const oracleService = require("@nyxusd/oracle-service");

      // Check that basic types and schemas are exported
      expect(oracleService.OracleQuerySchema).toBeDefined();
      expect(oracleService.OracleResponseSchema).toBeDefined();
      expect(oracleService.ChainlinkRoundDataSchema).toBeDefined();
    }).not.toThrow();
  });
});
