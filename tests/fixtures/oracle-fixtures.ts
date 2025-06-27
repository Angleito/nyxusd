/**
 * Oracle and price feed test fixtures
 */

/**
 * Sample oracle price feeds
 */
export const sampleOracleFeeds = {
  ETH_USD: {
    feedId: "ETH-USD",
    address: "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
    decimals: 8,
    description: "ETH / USD",
    version: 4,
    heartbeat: 3600, // 1 hour
    deviation: 0.5, // 0.5%
    prices: [
      { timestamp: 1703030400, price: 160000000000, confidence: 99.8 }, // $1600.00
      { timestamp: 1703034000, price: 162500000000, confidence: 99.7 }, // $1625.00
      { timestamp: 1703037600, price: 158000000000, confidence: 99.9 }, // $1580.00
      { timestamp: 1703041200, price: 164000000000, confidence: 99.6 }, // $1640.00
      { timestamp: 1703044800, price: 160500000000, confidence: 99.8 }, // $1605.00
    ],
  },

  BTC_USD: {
    feedId: "BTC-USD",
    address: "0xf4030086522a5beea4988f8ca5b36dbc97bee88c",
    decimals: 8,
    description: "BTC / USD",
    version: 4,
    heartbeat: 3600,
    deviation: 0.5,
    prices: [
      { timestamp: 1703030400, price: 4200000000000, confidence: 99.5 }, // $42000.00
      { timestamp: 1703034000, price: 4180000000000, confidence: 99.6 }, // $41800.00
      { timestamp: 1703037600, price: 4220000000000, confidence: 99.4 }, // $42200.00
      { timestamp: 1703041200, price: 4150000000000, confidence: 99.7 }, // $41500.00
      { timestamp: 1703044800, price: 4190000000000, confidence: 99.5 }, // $41900.00
    ],
  },

  LINK_USD: {
    feedId: "LINK-USD",
    address: "0x2c1d072e956affc0d435cb7ac38ef18d24d9127c",
    decimals: 8,
    description: "LINK / USD",
    version: 4,
    heartbeat: 3600,
    deviation: 1.0,
    prices: [
      { timestamp: 1703030400, price: 1450000000, confidence: 98.9 }, // $14.50
      { timestamp: 1703034000, price: 1425000000, confidence: 99.1 }, // $14.25
      { timestamp: 1703037600, price: 1480000000, confidence: 98.7 }, // $14.80
      { timestamp: 1703041200, price: 1395000000, confidence: 99.3 }, // $13.95
      { timestamp: 1703044800, price: 1460000000, confidence: 98.8 }, // $14.60
    ],
  },

  UNI_USD: {
    feedId: "UNI-USD",
    address: "0x553303d460ee0afb37edff9be42922d8ff63220e",
    decimals: 8,
    description: "UNI / USD",
    version: 4,
    heartbeat: 3600,
    deviation: 1.5,
    prices: [
      { timestamp: 1703030400, price: 585000000, confidence: 98.2 }, // $5.85
      { timestamp: 1703034000, price: 592000000, confidence: 98.4 }, // $5.92
      { timestamp: 1703037600, price: 578000000, confidence: 98.1 }, // $5.78
      { timestamp: 1703041200, price: 600000000, confidence: 98.6 }, // $6.00
      { timestamp: 1703044800, price: 595000000, confidence: 98.3 }, // $5.95
    ],
  },
};

/**
 * Market stress scenarios
 */
export const stressScenarios = {
  /**
   * Black Swan event - 50% crash across all assets
   */
  blackSwan: {
    name: "Black Swan Event",
    description: "50% price crash across all major assets",
    duration: 3600, // 1 hour
    priceShocks: [
      {
        feedId: "ETH-USD",
        shockPercent: -50,
        newPrice: 80000000000, // $800.00
        confidence: 95.0,
      },
      {
        feedId: "BTC-USD",
        shockPercent: -50,
        newPrice: 2100000000000, // $21000.00
        confidence: 95.0,
      },
      {
        feedId: "LINK-USD",
        shockPercent: -50,
        newPrice: 725000000, // $7.25
        confidence: 92.0,
      },
      {
        feedId: "UNI-USD",
        shockPercent: -50,
        newPrice: 292500000, // $2.925
        confidence: 90.0,
      },
    ],
  },

  /**
   * Flash crash - rapid 30% drop followed by recovery
   */
  flashCrash: {
    name: "Flash Crash",
    description: "30% flash crash with partial recovery",
    duration: 900, // 15 minutes
    phases: [
      {
        name: "crash",
        duration: 300, // 5 minutes
        priceShocks: [
          { feedId: "ETH-USD", shockPercent: -30, confidence: 95.0 },
          { feedId: "BTC-USD", shockPercent: -30, confidence: 95.0 },
          { feedId: "LINK-USD", shockPercent: -35, confidence: 90.0 },
          { feedId: "UNI-USD", shockPercent: -40, confidence: 85.0 },
        ],
      },
      {
        name: "recovery",
        duration: 600, // 10 minutes
        priceShocks: [
          { feedId: "ETH-USD", shockPercent: 15, confidence: 98.0 },
          { feedId: "BTC-USD", shockPercent: 15, confidence: 98.0 },
          { feedId: "LINK-USD", shockPercent: 20, confidence: 95.0 },
          { feedId: "UNI-USD", shockPercent: 25, confidence: 92.0 },
        ],
      },
    ],
  },

  /**
   * Gradual bear market - slow decline over days
   */
  bearMarket: {
    name: "Bear Market",
    description: "Gradual 40% decline over 7 days",
    duration: 604800, // 7 days
    dailyDeclines: [
      { day: 1, declinePercent: -8, volatility: 15 },
      { day: 2, declinePercent: -6, volatility: 12 },
      { day: 3, declinePercent: -7, volatility: 18 },
      { day: 4, declinePercent: -5, volatility: 10 },
      { day: 5, declinePercent: -8, volatility: 20 },
      { day: 6, declinePercent: -4, volatility: 8 },
      { day: 7, declinePercent: -6, volatility: 14 },
    ],
  },

  /**
   * Oracle manipulation attack
   */
  oracleAttack: {
    name: "Oracle Manipulation",
    description: "Artificial price manipulation through oracle compromise",
    duration: 1800, // 30 minutes
    manipulations: [
      {
        feedId: "ETH-USD",
        originalPrice: 160000000000,
        manipulatedPrice: 200000000000, // +25%
        confidence: 45.0, // Low confidence indicates potential issue
        detectionDelay: 600, // 10 minutes to detect
      },
      {
        feedId: "LINK-USD",
        originalPrice: 1450000000,
        manipulatedPrice: 2900000000, // +100%
        confidence: 30.0,
        detectionDelay: 300, // 5 minutes to detect
      },
    ],
  },
};

/**
 * Oracle failure scenarios
 */
export const oracleFailures = {
  /**
   * Complete oracle outage
   */
  completeOutage: {
    name: "Complete Oracle Outage",
    description: "All oracle feeds go offline",
    duration: 7200, // 2 hours
    affectedFeeds: ["ETH-USD", "BTC-USD", "LINK-USD", "UNI-USD"],
    fallbackBehavior: "use_last_known_price",
    maxStaleness: 3600, // 1 hour
  },

  /**
   * Partial oracle outage
   */
  partialOutage: {
    name: "Partial Oracle Outage",
    description: "Some oracle feeds go offline",
    duration: 3600, // 1 hour
    affectedFeeds: ["LINK-USD", "UNI-USD"],
    workingFeeds: ["ETH-USD", "BTC-USD"],
    fallbackBehavior: "use_alternative_feeds",
  },

  /**
   * Stale price data
   */
  staleData: {
    name: "Stale Oracle Data",
    description: "Oracle prices become stale but feeds remain online",
    scenarios: [
      {
        feedId: "ETH-USD",
        lastUpdate: 1703030400,
        currentTime: 1703037600, // 2 hours stale
        stalenessThreshold: 3600, // 1 hour max
        action: "reject_price",
      },
      {
        feedId: "LINK-USD",
        lastUpdate: 1703033000,
        currentTime: 1703037600, // 1.27 hours stale
        stalenessThreshold: 3600,
        action: "reject_price",
      },
    ],
  },

  /**
   * Price deviation anomalies
   */
  priceDeviations: {
    name: "Price Deviation Anomalies",
    description: "Prices deviate significantly from expected ranges",
    anomalies: [
      {
        feedId: "ETH-USD",
        expectedPrice: 160000000000,
        reportedPrice: 32000000000, // -80% deviation
        maxDeviation: 10, // 10% max allowed
        action: "circuit_breaker",
      },
      {
        feedId: "BTC-USD",
        expectedPrice: 4200000000000,
        reportedPrice: 8400000000000, // +100% deviation
        maxDeviation: 15, // 15% max allowed
        action: "circuit_breaker",
      },
    ],
  },
};

/**
 * Correlation test data
 */
export const correlationData = {
  /**
   * Historical price correlations
   */
  historical: {
    timeframe: "30_days",
    pairs: [
      {
        asset1: "ETH-USD",
        asset2: "BTC-USD",
        correlation: 0.85,
        pValue: 0.001,
        significance: "high",
      },
      {
        asset1: "ETH-USD",
        asset2: "LINK-USD",
        correlation: 0.72,
        pValue: 0.01,
        significance: "medium",
      },
      {
        asset1: "BTC-USD",
        asset2: "LINK-USD",
        correlation: 0.68,
        pValue: 0.02,
        significance: "medium",
      },
      {
        asset1: "LINK-USD",
        asset2: "UNI-USD",
        correlation: 0.65,
        pValue: 0.03,
        significance: "medium",
      },
    ],
  },

  /**
   * Stress period correlations
   */
  stress: {
    timeframe: "crash_period",
    description: "Correlations during market stress",
    pairs: [
      {
        asset1: "ETH-USD",
        asset2: "BTC-USD",
        normalCorrelation: 0.85,
        stressCorrelation: 0.95, // Higher correlation during stress
        increase: 0.1,
      },
      {
        asset1: "ETH-USD",
        asset2: "LINK-USD",
        normalCorrelation: 0.72,
        stressCorrelation: 0.88,
        increase: 0.16,
      },
    ],
  },
};

/**
 * Price feed validation rules
 */
export const validationRules = {
  /**
   * Basic validation parameters
   */
  basic: {
    maxPriceAge: 3600, // 1 hour
    minConfidence: 95.0,
    maxDeviation: 10.0, // 10%
    minUpdateFrequency: 300, // 5 minutes
  },

  /**
   * Asset-specific validation rules
   */
  assetSpecific: {
    "ETH-USD": {
      minPrice: 50000000000, // $500.00
      maxPrice: 1000000000000, // $10,000.00
      maxVolatility: 20.0, // 20% per hour
      requiredConfidence: 99.0,
    },
    "BTC-USD": {
      minPrice: 1000000000000, // $10,000.00
      maxPrice: 20000000000000, // $200,000.00
      maxVolatility: 15.0, // 15% per hour
      requiredConfidence: 99.5,
    },
    "LINK-USD": {
      minPrice: 100000000, // $1.00
      maxPrice: 10000000000, // $100.00
      maxVolatility: 30.0, // 30% per hour
      requiredConfidence: 98.0,
    },
    "UNI-USD": {
      minPrice: 50000000, // $0.50
      maxPrice: 5000000000, // $50.00
      maxVolatility: 35.0, // 35% per hour
      requiredConfidence: 97.0,
    },
  },

  /**
   * Circuit breaker rules
   */
  circuitBreakers: {
    priceShockThresholds: [
      { threshold: 20, action: "warn", duration: 300 },
      { threshold: 30, action: "pause_operations", duration: 900 },
      { threshold: 50, action: "emergency_shutdown", duration: 3600 },
    ],
    volatilityThresholds: [
      { threshold: 25, action: "increase_monitoring", duration: 1800 },
      { threshold: 40, action: "reduce_leverage", duration: 3600 },
      { threshold: 60, action: "halt_new_positions", duration: 7200 },
    ],
  },
};

/**
 * Mock oracle responses
 */
export const mockOracleResponses = {
  /**
   * Normal operation responses
   */
  normal: {
    latestRoundData: {
      roundId: 18446744073709562345,
      answer: 160000000000, // $1600.00
      startedAt: 1703116795,
      updatedAt: 1703116800,
      answeredInRound: 18446744073709562345,
    },
    decimals: 8,
    description: "ETH / USD",
    version: 4,
  },

  /**
   * Error responses
   */
  errors: {
    noAnswer: {
      roundId: 0,
      answer: 0,
      startedAt: 0,
      updatedAt: 0,
      answeredInRound: 0,
    },
    staleData: {
      roundId: 18446744073709562300,
      answer: 160000000000,
      startedAt: 1703030400,
      updatedAt: 1703030400, // Very old timestamp
      answeredInRound: 18446744073709562300,
    },
    invalidPrice: {
      roundId: 18446744073709562345,
      answer: -160000000000, // Negative price
      startedAt: 1703116795,
      updatedAt: 1703116800,
      answeredInRound: 18446744073709562345,
    },
  },

  /**
   * Timeout scenarios
   */
  timeouts: {
    slow: {
      delay: 5000, // 5 second delay
      response: "normal",
    },
    timeout: {
      delay: 30000, // 30 second timeout
      response: null,
    },
  },
};

/**
 * Export all oracle fixtures
 */
export const OracleFixtures = {
  feeds: sampleOracleFeeds,
  stress: stressScenarios,
  failures: oracleFailures,
  correlations: correlationData,
  validation: validationRules,
  mocks: mockOracleResponses,
};
