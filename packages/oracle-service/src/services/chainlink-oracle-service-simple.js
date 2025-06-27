"use strict";
/**
 * Simplified Chainlink Oracle Service
 *
 * Mock implementation for testing package structure
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainlinkOracleService = exports.ChainlinkOracleConfigSchema = void 0;
const tslib_1 = require("tslib");
const Either_1 = require("fp-ts/Either");
const Option_1 = require("fp-ts/Option");
const IO = tslib_1.__importStar(require("fp-ts/IO"));
const zod_1 = require("zod");
/**
 * Simplified configuration
 */
exports.ChainlinkOracleConfigSchema = zod_1.z.object({
    network: zod_1.z.string().min(1),
    provider: zod_1.z.union([zod_1.z.string().url(), zod_1.z.any()]),
    defaultTimeout: zod_1.z.number().int().positive().default(5000),
    defaultMaxStaleness: zod_1.z.number().int().positive().default(3600),
    defaultMinConfidence: zod_1.z.number().min(0).max(100).default(95),
    cacheTtl: zod_1.z.number().int().positive().default(60),
    retry: zod_1.z.object({
        maxAttempts: zod_1.z.number().int().min(1).default(3),
        delayMs: zod_1.z.number().int().positive().default(1000),
        backoffMultiplier: zod_1.z.number().positive().default(2),
    }).default({}),
});
/**
 * Simplified Chainlink Oracle Service
 */
class ChainlinkOracleService {
    constructor(config) {
        this.cache = new Map();
        /**
         * Simplified price fetch implementation
         */
        this.fetchPrice = (query) => {
            // Check cache first if allowed
            if (query.allowCached) {
                const cached = this.checkCache(query.feedId);
                if ((0, Option_1.isSome)(cached)) {
                    const response = {
                        data: cached.value,
                        metadata: {
                            responseTime: 0,
                            fromCache: true,
                            source: 'chainlink',
                        },
                    };
                    return IO.of((0, Either_1.right)(response));
                }
            }
            // Real price mapping for supported assets
            const realPrices = {
                'ETH/USD': BigInt('340000000000'), // $3400 with 8 decimals
                'BTC/USD': BigInt('9800000000000'), // $98000 with 8 decimals  
                'ADA/USD': BigInt('108000000'), // $1.08 with 8 decimals
                'DUST/USD': BigInt('15000000'), // $0.15 with 8 decimals
            };
            const basePrice = realPrices[query.feedId] || BigInt('100000000000'); // Default $1000
            // Add small random variation to simulate real price movement
            const variation = Math.floor(Math.random() * 200) - 100; // ±1% variation
            const variationAmount = (basePrice * BigInt(variation)) / BigInt(10000);
            const finalPrice = basePrice + variationAmount;
            const realPrice = {
                feedId: query.feedId,
                price: finalPrice,
                decimals: 8,
                timestamp: Math.floor(Date.now() / 1000),
                roundId: BigInt(Math.floor(Math.random() * 1000000) + 100000),
                confidence: 95 + Math.floor(Math.random() * 5), // 95-99% confidence
                source: 'chainlink',
            };
            const response = {
                data: realPrice,
                metadata: {
                    responseTime: 120 + Math.floor(Math.random() * 80), // 120-200ms
                    fromCache: false,
                    source: 'chainlink',
                    aggregationMethod: 'single',
                },
            };
            return IO.of((0, Either_1.right)(response));
        };
        /**
         * Simplified health check
         */
        this.checkHealth = () => {
            const health = {
                status: 'healthy',
                feeds: {},
                metrics: {
                    totalFeeds: 1,
                    healthyFeeds: 1,
                    averageConfidence: 100,
                    averageStaleness: 0,
                    uptime: 100,
                },
                timestamp: Math.floor(Date.now() / 1000),
            };
            return IO.of((0, Either_1.right)(health));
        };
        /**
         * Mock price validation
         */
        this.validatePrice = (data) => {
            return (0, Either_1.right)({
                isValid: true,
                score: 100,
                issues: [],
                validatedData: data,
            });
        };
        /**
         * Get supported feed IDs
         */
        this.getSupportedFeeds = () => {
            return ['ETH/USD', 'BTC/USD', 'ADA/USD', 'DUST/USD'];
        };
        /**
         * Get feed configuration
         */
        this.getFeedConfig = (feedId) => {
            // Mock feed config
            const config = {
                feedId,
                description: `Mock ${feedId} feed`,
                address: '0x0000000000000000000000000000000000000000',
                decimals: 8,
                heartbeat: 3600,
                deviationThreshold: 0.5,
                minConfidence: 95,
                priority: 1,
                isActive: true,
            };
            return (0, Option_1.some)(config);
        };
        /**
         * Simple cache check
         */
        this.checkCache = (feedId) => {
            const entry = this.cache.get(feedId);
            if (!entry) {
                return Option_1.none;
            }
            const now = Date.now();
            if (now - entry.timestamp > entry.ttl * 1000) {
                this.cache.delete(feedId);
                return Option_1.none;
            }
            return (0, Option_1.some)(entry.data);
        };
        exports.ChainlinkOracleConfigSchema.parse(config);
    }
}
exports.ChainlinkOracleService = ChainlinkOracleService;
//# sourceMappingURL=chainlink-oracle-service-simple.js.map