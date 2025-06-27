/**
 * Oracle Aggregator Service
 * 
 * Multi-oracle aggregation service with consensus mechanisms,
 * outlier detection, and fallback strategies using functional
 * programming patterns
 */

import { pipe } from 'fp-ts/function';
import { Either, left, right, chain, map, fold } from 'fp-ts/Either';
import { Option, some, none, fromNullable } from 'fp-ts/Option';
import { IO } from 'fp-ts/IO';
import { TaskEither, tryCatch } from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';

import {
  IOracleService,
  OracleQuery,
  OracleResponse,
  OraclePriceData,
  OracleProvider
} from '../types/oracle-types';

import {
  IAggregationService,
  MultiOracleData,
  AggregationResult,
  AggregationStrategy,
  ConsensusConfig,
  AggregationWeight,
  OraclePerformance,
  DataCollector,
  PriceAggregator,
  OutlierDetector,
  ConsensusValidator,
  QualityScorer
} from '../types/aggregation-types';

import {
  OracleError,
  AggregationError,
  createAggregationError,
  createDataValidationError,
  createLowConfidenceError
} from '../errors/oracle-errors';

/**
 * Oracle Aggregator Service Implementation
 */
export class OracleAggregatorService implements IAggregationService {
  private readonly oracles: Map<OracleProvider, IOracleService> = new Map();
  private readonly weights: Map<OracleProvider, AggregationWeight> = new Map();
  private readonly performanceHistory: Map<OracleProvider, OraclePerformance> = new Map();

  constructor(
    oracles: Array<{ provider: OracleProvider; service: IOracleService; weight?: AggregationWeight }>
  ) {
    oracles.forEach(({ provider, service, weight }) => {
      this.oracles.set(provider, service);
      if (weight) {
        this.weights.set(provider, weight);
      }
    });
  }

  /**
   * Collect data from multiple oracle sources
   */
  public readonly collectData: DataCollector = async (
    feedId: string,
    providers: OracleProvider[],
    timeout = 10000
  ): Promise<Either<string, MultiOracleData>> => {
    const query: OracleQuery = {
      feedId,
      timeout,
      allowCached: true,
    };

    const startTime = Date.now();
    
    try {
      // Collect data from all providers in parallel
      const responsePromises = providers.map(async (provider) => {
        const oracle = this.oracles.get(provider);
        if (!oracle) {
          return {
            provider,
            data: {
              success: false as const,
              error: `Oracle not available: ${provider}`,
              errorCode: 'ORACLE_NOT_AVAILABLE',
              responseTime: 0,
            },
            timestamp: Date.now(),
          };
        }

        const providerStartTime = Date.now();
        
        try {
          const result = await oracle.fetchPrice(query)();
          const responseTime = Date.now() - providerStartTime;
          
          if (Either.isRight(result)) {
            return {
              provider,
              data: {
                success: true as const,
                priceData: result.right.data,
                responseTime,
              },
              timestamp: Date.now(),
            };
          } else {
            return {
              provider,
              data: {
                success: false as const,
                error: result.left.message,
                errorCode: result.left.code,
                responseTime,
              },
              timestamp: Date.now(),
            };
          }
        } catch (error) {
          const responseTime = Date.now() - providerStartTime;
          return {
            provider,
            data: {
              success: false as const,
              error: error instanceof Error ? error.message : 'Unknown error',
              errorCode: 'PROVIDER_ERROR',
              responseTime,
            },
            timestamp: Date.now(),
          };
        }
      });

      const responses = await Promise.all(responsePromises);
      const totalTime = Date.now() - startTime;
      
      const successfulResponses = responses.filter(r => r.data.success).length;
      const failedResponses = responses.length - successfulResponses;
      
      const result: MultiOracleData = {
        feedId,
        responses,
        metadata: {
          totalTime,
          successRate: successfulResponses / responses.length,
          successfulResponses,
          failedResponses,
        },
      };

      return right(result);
    } catch (error) {
      return left(`Failed to collect oracle data: ${error}`);
    }
  };

  /**
   * Aggregate collected price data using specified strategy
   */
  public readonly aggregatePrices: PriceAggregator = (
    data: MultiOracleData,
    strategy: AggregationStrategy,
    consensus: ConsensusConfig
  ): Either<string, AggregationResult> => {
    try {
      // Extract successful price data
      const successfulData = data.responses
        .filter(r => r.data.success)
        .map(r => ({
          provider: r.provider,
          priceData: (r.data as any).priceData as OraclePriceData,
        }));

      if (successfulData.length < consensus.minSources) {
        return left(
          `Insufficient sources: ${successfulData.length} < ${consensus.minSources}`
        );
      }

      // Apply consensus validation
      const consensusResult = this.validateConsensus(data, consensus);
      if (Either.isLeft(consensusResult) || !consensusResult.right.isValid) {
        return left(consensusResult.right?.reason || 'Consensus validation failed');
      }

      // Filter by confidence and staleness
      const validData = successfulData.filter(({ priceData }) => {
        const now = Math.floor(Date.now() / 1000);
        const staleness = now - priceData.timestamp;
        
        return (
          priceData.confidence >= consensus.minSourceConfidence &&
          staleness <= consensus.stalenessWindow
        );
      });

      if (validData.length < consensus.minSources) {
        return left(
          `Insufficient valid sources after filtering: ${validData.length} < ${consensus.minSources}`
        );
      }

      // Detect outliers
      const prices = validData.map(({ provider, priceData }) => ({
        provider,
        price: priceData.price,
        confidence: priceData.confidence,
      }));

      const outlierResults = this.detectOutliers(
        prices,
        consensus.outlierDetection,
        consensus.outlierThreshold
      );

      // Filter out outliers
      const filteredData = validData.filter(({ provider }) => {
        const outlierResult = outlierResults.find(r => r.provider === provider);
        return !outlierResult?.isOutlier;
      });

      const outliers = validData
        .filter(({ provider }) => {
          const outlierResult = outlierResults.find(r => r.provider === provider);
          return outlierResult?.isOutlier;
        })
        .map(({ provider, priceData }) => {
          const outlierResult = outlierResults.find(r => r.provider === provider)!;
          return {
            provider,
            price: priceData.price,
            deviationScore: outlierResult.score,
            reason: `Outlier detected using ${consensus.outlierDetection}`,
          };
        });

      if (filteredData.length < consensus.minSources) {
        return left(
          `Insufficient sources after outlier removal: ${filteredData.length} < ${consensus.minSources}`
        );
      }

      // Calculate aggregated price
      const aggregationResult = this.calculateAggregatedPrice(
        filteredData.map(d => d.priceData),
        strategy
      );

      if (Either.isLeft(aggregationResult)) {
        return left(aggregationResult.left);
      }

      const aggregatedPrice = aggregationResult.right;

      // Calculate statistics
      const allPrices = filteredData.map(d => Number(d.priceData.price));
      const statistics = this.calculateStatistics(allPrices);

      // Calculate overall confidence
      const weightedConfidence = this.calculateWeightedConfidence(
        filteredData.map(d => d.priceData),
        strategy
      );

      // Create aggregation sources
      const sources = filteredData.map(({ provider, priceData }) => {
        const weight = this.getProviderWeight(provider, strategy);
        return {
          provider,
          price: priceData.price,
          weight,
          confidence: priceData.confidence,
          included: true,
          reason: 'Passed all validation checks',
        };
      });

      // Add excluded sources
      const excludedSources = data.responses
        .filter(r => !r.data.success || !filteredData.some(fd => fd.provider === r.provider))
        .map(r => ({
          provider: r.provider,
          price: r.data.success ? (r.data as any).priceData.price : BigInt(0),
          weight: 0,
          confidence: r.data.success ? (r.data as any).priceData.confidence : 0,
          included: false,
          reason: r.data.success ? 'Excluded as outlier' : `Error: ${r.data.errorCode}`,
        }));

      const allSources = [...sources, ...excludedSources];

      // Calculate consensus information
      const consensusInfo = {
        agreement: this.calculateAgreement(filteredData.map(d => d.priceData)),
        participantCount: filteredData.length,
        thresholdMet: consensusResult.right.participantCount >= consensus.minSources,
      };

      // Calculate quality score
      const qualityScore = this.calculateQuality(
        {
          aggregatedPrice,
          method: strategy.method,
          sources: allSources,
          confidence: weightedConfidence,
          statistics,
          outliers,
          consensus: consensusInfo,
          metadata: {
            timestamp: Math.floor(Date.now() / 1000),
            processingTime: 0,
            qualityScore: 0,
          },
        },
        data,
        strategy
      );

      const result: AggregationResult = {
        aggregatedPrice,
        method: strategy.method,
        sources: allSources,
        confidence: weightedConfidence,
        statistics,
        outliers,
        consensus: consensusInfo,
        metadata: {
          timestamp: Math.floor(Date.now() / 1000),
          processingTime: data.metadata.totalTime,
          qualityScore,
        },
      };

      return right(result);
    } catch (error) {
      return left(`Aggregation failed: ${error}`);
    }
  };

  /**
   * Detect outliers in price data
   */
  public readonly detectOutliers: OutlierDetector = (
    prices,
    method,
    threshold
  ) => {
    try {
      switch (method) {
        case 'zscore':
          return this.detectOutliersZScore(prices, threshold);
        case 'iqr':
          return this.detectOutliersIQR(prices, threshold);
        case 'mad':
          return this.detectOutliersMAD(prices, threshold);
        case 'isolation_forest':
          return this.detectOutliersIsolationForest(prices, threshold);
        default:
          return prices.map(p => ({ ...p, isOutlier: false, score: 0 }));
      }
    } catch (error) {
      // Fallback: no outliers detected on error
      return prices.map(p => ({ ...p, isOutlier: false, score: 0 }));
    }
  };

  /**
   * Validate consensus requirements
   */
  public readonly validateConsensus: ConsensusValidator = (data, config) => {
    try {
      const successfulResponses = data.responses.filter(r => r.data.success);
      
      if (successfulResponses.length < config.minSources) {
        return left(
          `Insufficient successful responses: ${successfulResponses.length} < ${config.minSources}`
        );
      }

      const validResponses = successfulResponses.filter(r => {
        const priceData = (r.data as any).priceData as OraclePriceData;
        const now = Math.floor(Date.now() / 1000);
        const staleness = now - priceData.timestamp;
        
        return (
          priceData.confidence >= config.minSourceConfidence &&
          staleness <= config.stalenessWindow
        );
      });

      if (validResponses.length < config.minSources) {
        return right({
          isValid: false,
          reason: `Insufficient valid responses after filtering: ${validResponses.length} < ${config.minSources}`,
          participantCount: validResponses.length,
        });
      }

      // Check consensus threshold
      const prices = validResponses.map(r => Number((r.data as any).priceData.price));
      const agreement = this.calculatePriceAgreement(prices, config.maxDeviation);
      
      if (agreement < config.consensusThreshold) {
        return right({
          isValid: false,
          reason: `Price agreement ${(agreement * 100).toFixed(1)}% below threshold ${(config.consensusThreshold * 100).toFixed(1)}%`,
          participantCount: validResponses.length,
        });
      }

      return right({
        isValid: true,
        participantCount: validResponses.length,
      });
    } catch (error) {
      return left(`Consensus validation failed: ${error}`);
    }
  };

  /**
   * Calculate quality score for aggregation result
   */
  public readonly calculateQuality: QualityScorer = (result, sources, strategy) => {
    try {
      let score = 100;

      // Factor 1: Source count (more sources = higher quality)
      const sourceRatio = result.sources.filter(s => s.included).length / sources.responses.length;
      const sourceScore = sourceRatio * 100;
      
      // Factor 2: Consensus agreement
      const agreementScore = result.consensus.agreement * 100;
      
      // Factor 3: Average confidence
      const confidenceScore = result.confidence;
      
      // Factor 4: Statistical measures (lower deviation = higher quality)
      const deviationScore = Math.max(0, 100 - (result.statistics.standardDeviation / 100));
      
      // Factor 5: Outlier penalty
      const outlierPenalty = result.outliers.length * 10;
      
      // Weighted combination based on strategy quality factors
      const factors = strategy.qualityFactors;
      const weightedScore = (
        sourceScore * factors.reliabilityWeight +
        agreementScore * factors.consensusWeight +
        confidenceScore * factors.confidenceWeight +
        deviationScore * factors.freshnessWeight
      ) / Object.values(factors).reduce((sum, weight) => sum + weight, 0);
      
      score = Math.max(0, Math.min(100, weightedScore - outlierPenalty));
      
      return Math.round(score);
    } catch (error) {
      return 50; // Default moderate score on error
    }
  };

  /**
   * Get provider performance metrics
   */
  public readonly getPerformanceMetrics = (provider: string): Option<OraclePerformance> => {
    return fromNullable(this.performanceHistory.get(provider as OracleProvider));
  };

  /**
   * Private helper methods
   */

  private readonly calculateAggregatedPrice = (
    prices: OraclePriceData[],
    strategy: AggregationStrategy
  ): Either<string, bigint> => {
    try {
      const values = prices.map(p => p.price);
      
      switch (strategy.method) {
        case 'median':
          return right(this.calculateMedian(values));
        case 'mean':
          return right(this.calculateMean(values));
        case 'weighted_average':
          return right(this.calculateWeightedAverage(prices, strategy));
        case 'trimmed_mean':
          return right(this.calculateTrimmedMean(values, strategy.trimPercentage || 0.1));
        case 'mode':
          return right(this.calculateMode(values));
        default:
          return left(`Unsupported aggregation method: ${strategy.method}`);
      }
    } catch (error) {
      return left(`Price calculation failed: ${error}`);
    }
  };

  private readonly calculateMedian = (values: bigint[]): bigint => {
    const sorted = [...values].sort((a, b) => Number(a - b));
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / BigInt(2);
    } else {
      return sorted[mid];
    }
  };

  private readonly calculateMean = (values: bigint[]): bigint => {
    const sum = values.reduce((acc, val) => acc + val, BigInt(0));
    return sum / BigInt(values.length);
  };

  private readonly calculateWeightedAverage = (
    prices: OraclePriceData[],
    strategy: AggregationStrategy
  ): bigint => {
    let weightedSum = BigInt(0);
    let totalWeight = 0;
    
    prices.forEach((priceData) => {
      const weight = this.getProviderWeight(priceData.source as OracleProvider, strategy);
      weightedSum += priceData.price * BigInt(Math.round(weight * 10000));
      totalWeight += weight;
    });
    
    return weightedSum / BigInt(Math.round(totalWeight * 10000));
  };

  private readonly calculateTrimmedMean = (values: bigint[], trimPercent: number): bigint => {
    const sorted = [...values].sort((a, b) => Number(a - b));
    const trimCount = Math.floor(sorted.length * trimPercent);
    const trimmed = sorted.slice(trimCount, sorted.length - trimCount);
    
    const sum = trimmed.reduce((acc, val) => acc + val, BigInt(0));
    return sum / BigInt(trimmed.length);
  };

  private readonly calculateMode = (values: bigint[]): bigint => {
    const frequency = new Map<string, number>();
    
    values.forEach(val => {
      const key = val.toString();
      frequency.set(key, (frequency.get(key) || 0) + 1);
    });
    
    let maxFreq = 0;
    let mode = values[0];
    
    frequency.forEach((freq, val) => {
      if (freq > maxFreq) {
        maxFreq = freq;
        mode = BigInt(val);
      }
    });
    
    return mode;
  };

  private readonly getProviderWeight = (
    provider: OracleProvider,
    strategy: AggregationStrategy
  ): number => {
    const weight = this.weights.get(provider);
    
    switch (strategy.weighting) {
      case 'equal':
        return 1.0;
      case 'confidence':
        return weight?.reliabilityScore || 50; // Use reliability as proxy for confidence
      case 'reliability':
        return weight?.reliabilityScore || 50;
      case 'custom':
        return strategy.customWeights?.[provider] || 1.0;
      default:
        return 1.0;
    }
  };

  private readonly calculateStatistics = (values: number[]) => {
    const n = values.length;
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const standardDeviation = Math.sqrt(variance);
    
    const sorted = [...values].sort((a, b) => a - b);
    const range = sorted[sorted.length - 1] - sorted[0];
    
    const q1Index = Math.floor(n * 0.25);
    const q3Index = Math.floor(n * 0.75);
    const interquartileRange = sorted[q3Index] - sorted[q1Index];
    
    const median = n % 2 === 0 
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];
    
    const medianAbsoluteDeviation = values
      .map(val => Math.abs(val - median))
      .sort((a, b) => a - b)[Math.floor(n / 2)];
    
    return {
      standardDeviation,
      variance,
      medianAbsoluteDeviation,
      range,
      interquartileRange,
    };
  };

  private readonly calculateWeightedConfidence = (
    prices: OraclePriceData[],
    strategy: AggregationStrategy
  ): number => {
    let weightedSum = 0;
    let totalWeight = 0;
    
    prices.forEach((priceData) => {
      const weight = this.getProviderWeight(priceData.source as OracleProvider, strategy);
      weightedSum += priceData.confidence * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  };

  private readonly calculateAgreement = (prices: OraclePriceData[]): number => {
    if (prices.length < 2) return 1.0;
    
    const values = prices.map(p => Number(p.price));
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const maxDeviation = Math.max(...values.map(val => Math.abs(val - mean) / mean));
    
    return Math.max(0, 1 - maxDeviation);
  };

  private readonly calculatePriceAgreement = (prices: number[], maxDeviation: number): number => {
    if (prices.length < 2) return 1.0;
    
    const median = this.calculateMedianNumber(prices);
    const agreementCount = prices.filter(price => {
      const deviation = Math.abs(price - median) / median * 100;
      return deviation <= maxDeviation;
    }).length;
    
    return agreementCount / prices.length;
  };

  private readonly calculateMedianNumber = (values: number[]): number => {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      return sorted[mid];
    }
  };

  // Outlier detection methods
  private readonly detectOutliersZScore = (
    prices: Array<{ provider: string; price: bigint; confidence: number }>,
    threshold: number
  ) => {
    const values = prices.map(p => Number(p.price));
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
    
    return prices.map((p, i) => {
      const zScore = Math.abs((values[i] - mean) / std);
      return {
        provider: p.provider,
        isOutlier: zScore > threshold,
        score: zScore,
      };
    });
  };

  private readonly detectOutliersIQR = (
    prices: Array<{ provider: string; price: bigint; confidence: number }>,
    threshold: number
  ) => {
    const values = prices.map(p => Number(p.price));
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    
    const q1 = sorted[Math.floor(n * 0.25)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const iqr = q3 - q1;
    
    const lowerBound = q1 - threshold * iqr;
    const upperBound = q3 + threshold * iqr;
    
    return prices.map((p, i) => {
      const value = values[i];
      const isOutlier = value < lowerBound || value > upperBound;
      const score = Math.min(
        Math.abs(value - lowerBound) / iqr,
        Math.abs(value - upperBound) / iqr
      );
      
      return {
        provider: p.provider,
        isOutlier,
        score,
      };
    });
  };

  private readonly detectOutliersMAD = (
    prices: Array<{ provider: string; price: bigint; confidence: number }>,
    threshold: number
  ) => {
    const values = prices.map(p => Number(p.price));
    const median = this.calculateMedianNumber(values);
    const deviations = values.map(val => Math.abs(val - median));
    const mad = this.calculateMedianNumber(deviations);
    
    return prices.map((p, i) => {
      const modifiedZScore = 0.6745 * Math.abs(values[i] - median) / mad;
      return {
        provider: p.provider,
        isOutlier: modifiedZScore > threshold,
        score: modifiedZScore,
      };
    });
  };

  private readonly detectOutliersIsolationForest = (
    prices: Array<{ provider: string; price: bigint; confidence: number }>,
    threshold: number
  ) => {
    // Simplified isolation forest - in practice, you'd use a proper implementation
    // For now, fall back to Z-score method
    return this.detectOutliersZScore(prices, threshold);
  };
}

/**
 * Factory function for creating oracle aggregator service
 */
export const createOracleAggregatorService = (
  oracles: Array<{ provider: OracleProvider; service: IOracleService; weight?: AggregationWeight }>
): OracleAggregatorService => {
  return new OracleAggregatorService(oracles);
};