/**
 * Performance Optimization and Caching Layers
 * 
 * Provides performance optimizations for oracle operations including
 * intelligent caching, request batching, and response compression
 */

import { Either, left, right } from 'fp-ts/Either';
import { Option, some, none, isSome } from 'fp-ts/Option';

/**
 * Cache Configuration
 */
export interface CacheConfig {
  readonly maxSize: number;
  readonly defaultTtl: number;
  readonly compressionEnabled: boolean;
  readonly persistToDisk: boolean;
  readonly evictionStrategy: 'lru' | 'lfu' | 'ttl' | 'fifo';
}

/**
 * Cache Entry
 */
interface CacheEntry<T> {
  readonly data: T;
  readonly timestamp: number;
  readonly ttl: number;
  readonly accessCount: number;
  readonly lastAccessed: number;
  readonly compressed: boolean;
  readonly size: number;
}

/**
 * Performance Metrics
 */
export interface PerformanceMetrics {
  readonly cacheHits: number;
  readonly cacheMisses: number;
  readonly totalRequests: number;
  readonly averageResponseTime: number;
  readonly compressionRatio: number;
  readonly memoryUsage: number;
  readonly evictions: number;
}

/**
 * Batch Request Configuration
 */
export interface BatchConfig {
  readonly maxBatchSize: number;
  readonly batchTimeoutMs: number;
  readonly enableAutoFlush: boolean;
  readonly priorityThreshold: number;
}

/**
 * High-Performance Cache Implementation
 */
export class HighPerformanceCache<T> {
  private readonly cache = new Map<string, CacheEntry<T>>();
  private readonly config: CacheConfig;
  private readonly metrics: PerformanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    totalRequests: 0,
    averageResponseTime: 0,
    compressionRatio: 0,
    memoryUsage: 0,
    evictions: 0,
  };

  constructor(config: CacheConfig) {
    this.config = config;
  }

  /**
   * Get item from cache
   */
  get(key: string): Option<T> {
    const startTime = Date.now();
    this.updateMetrics('totalRequests', this.metrics.totalRequests + 1);

    const entry = this.cache.get(key);
    
    if (!entry) {
      this.updateMetrics('cacheMisses', this.metrics.cacheMisses + 1);
      this.updateResponseTime(Date.now() - startTime);
      return none;
    }

    // Check TTL
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key);
      this.updateMetrics('cacheMisses', this.metrics.cacheMisses + 1);
      this.updateResponseTime(Date.now() - startTime);
      return none;
    }

    // Update access patterns for LFU
    const updatedEntry: CacheEntry<T> = {
      ...entry,
      accessCount: entry.accessCount + 1,
      lastAccessed: now,
    };
    this.cache.set(key, updatedEntry);

    this.updateMetrics('cacheHits', this.metrics.cacheHits + 1);
    this.updateResponseTime(Date.now() - startTime);

    return some(this.decompressIfNeeded(entry.data, entry.compressed));
  }

  /**
   * Set item in cache
   */
  set(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const effectiveTtl = ttl || this.config.defaultTtl;
    
    // Compress data if enabled
    const { data, compressed, size } = this.compressIfNeeded(value);

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: effectiveTtl,
      accessCount: 1,
      lastAccessed: now,
      compressed,
      size,
    };

    // Check if we need to evict
    if (this.cache.size >= this.config.maxSize) {
      this.evictEntries(1);
    }

    this.cache.set(key, entry);
    this.updateMemoryUsage();
  }

  /**
   * Batch get multiple keys
   */
  getBatch(keys: readonly string[]): Map<string, T> {
    const results = new Map<string, T>();
    
    keys.forEach(key => {
      const result = this.get(key);
      if (isSome(result)) {
        results.set(key, result.value);
      }
    });

    return results;
  }

  /**
   * Batch set multiple key-value pairs
   */
  setBatch(entries: readonly { key: string; value: T; ttl?: number }[]): void {
    entries.forEach(({ key, value, ttl }) => {
      this.set(key, value, ttl);
    });
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
    this.updateMemoryUsage();
  }

  /**
   * Get cache statistics
   */
  getStats(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get cache hit ratio
   */
  getHitRatio(): number {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    return total > 0 ? this.metrics.cacheHits / total : 0;
  }

  // Private methods

  private evictEntries(count: number): void {
    const entries = Array.from(this.cache.entries());
    
    let toEvict: string[] = [];

    switch (this.config.evictionStrategy) {
      case 'lru':
        toEvict = entries
          .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)
          .slice(0, count)
          .map(([key]) => key);
        break;

      case 'lfu':
        toEvict = entries
          .sort(([, a], [, b]) => a.accessCount - b.accessCount)
          .slice(0, count)
          .map(([key]) => key);
        break;

      case 'ttl':
        const now = Date.now();
        toEvict = entries
          .sort(([, a], [, b]) => {
            const aExpiry = a.timestamp + a.ttl * 1000;
            const bExpiry = b.timestamp + b.ttl * 1000;
            return aExpiry - bExpiry;
          })
          .slice(0, count)
          .map(([key]) => key);
        break;

      case 'fifo':
        toEvict = entries
          .sort(([, a], [, b]) => a.timestamp - b.timestamp)
          .slice(0, count)
          .map(([key]) => key);
        break;
    }

    toEvict.forEach(key => this.cache.delete(key));
    this.updateMetrics('evictions', this.metrics.evictions + toEvict.length);
    this.updateMemoryUsage();
  }

  private compressIfNeeded(data: T): { data: T; compressed: boolean; size: number } {
    if (!this.config.compressionEnabled) {
      return {
        data,
        compressed: false,
        size: this.estimateSize(data),
      };
    }

    // Simple compression simulation - in production would use actual compression
    const serialized = JSON.stringify(data);
    const originalSize = serialized.length;
    
    if (originalSize > 1000) { // Only compress larger objects
      // Simulate compression (in reality would use gzip, lz4, etc.)
      const compressedData = data; // Mock - would be actual compressed data
      const compressedSize = Math.floor(originalSize * 0.7); // Assume 30% compression
      
      this.updateCompressionRatio(originalSize, compressedSize);
      
      return {
        data: compressedData,
        compressed: true,
        size: compressedSize,
      };
    }

    return {
      data,
      compressed: false,
      size: originalSize,
    };
  }

  private decompressIfNeeded(data: T, compressed: boolean): T {
    if (!compressed) {
      return data;
    }

    // Mock decompression - in production would actually decompress
    return data;
  }

  private estimateSize(data: T): number {
    // Simple size estimation
    return JSON.stringify(data).length;
  }

  private updateMetrics(key: keyof PerformanceMetrics, value: number): void {
    (this.metrics as any)[key] = value;
  }

  private updateResponseTime(responseTime: number): void {
    const total = this.metrics.totalRequests;
    this.updateMetrics(
      'averageResponseTime',
      (this.metrics.averageResponseTime * (total - 1) + responseTime) / total
    );
  }

  private updateCompressionRatio(original: number, compressed: number): void {
    const ratio = compressed / original;
    this.updateMetrics(
      'compressionRatio',
      (this.metrics.compressionRatio + ratio) / 2
    );
  }

  private updateMemoryUsage(): void {
    const totalSize = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.size, 0);
    this.updateMetrics('memoryUsage', totalSize);
  }
}

/**
 * Request Batcher for optimizing multiple oracle requests
 */
export class RequestBatcher<TRequest, TResponse> {
  private readonly pendingRequests = new Map<string, {
    request: TRequest;
    resolve: (value: TResponse) => void;
    reject: (error: any) => void;
    timestamp: number;
    priority: number;
  }>();

  private readonly config: BatchConfig;
  private batchTimer: NodeJS.Timeout | null = null;

  constructor(
    config: BatchConfig,
    private readonly batchHandler: (requests: TRequest[]) => Promise<TResponse[]>
  ) {
    this.config = config;
  }

  /**
   * Add request to batch
   */
  async addRequest(
    key: string,
    request: TRequest,
    priority: number = 0
  ): Promise<TResponse> {
    return new Promise<TResponse>((resolve, reject) => {
      this.pendingRequests.set(key, {
        request,
        resolve,
        reject,
        timestamp: Date.now(),
        priority,
      });

      // Auto-flush if high priority or batch is full
      if (priority >= this.config.priorityThreshold || 
          this.pendingRequests.size >= this.config.maxBatchSize) {
        this.flush();
      } else if (this.config.enableAutoFlush && !this.batchTimer) {
        // Set timer for auto-flush
        this.batchTimer = setTimeout(() => {
          this.flush();
        }, this.config.batchTimeoutMs);
      }
    });
  }

  /**
   * Manually flush pending requests
   */
  async flush(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.pendingRequests.size === 0) {
      return;
    }

    const requests = Array.from(this.pendingRequests.values());
    const requestData = requests.map(r => r.request);

    this.pendingRequests.clear();

    try {
      const responses = await this.batchHandler(requestData);
      
      // Resolve individual promises
      requests.forEach((req, index) => {
        if (index < responses.length) {
          req.resolve(responses[index]);
        } else {
          req.reject(new Error('Response not found for request'));
        }
      });
    } catch (error) {
      // Reject all pending requests
      requests.forEach(req => req.reject(error));
    }
  }

  /**
   * Get pending request count
   */
  getPendingCount(): number {
    return this.pendingRequests.size;
  }
}

/**
 * Default cache configurations
 */
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxSize: 1000,
  defaultTtl: 300, // 5 minutes
  compressionEnabled: true,
  persistToDisk: false,
  evictionStrategy: 'lru',
};

export const HIGH_PERFORMANCE_CACHE_CONFIG: CacheConfig = {
  maxSize: 10000,
  defaultTtl: 60, // 1 minute
  compressionEnabled: true,
  persistToDisk: true,
  evictionStrategy: 'lfu',
};

export const DEFAULT_BATCH_CONFIG: BatchConfig = {
  maxBatchSize: 10,
  batchTimeoutMs: 100,
  enableAutoFlush: true,
  priorityThreshold: 5,
};

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private readonly metrics = new Map<string, number[]>();

  /**
   * Record a performance measurement
   */
  record(metric: string, value: number): void {
    const values = this.metrics.get(metric) || [];
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
    
    this.metrics.set(metric, values);
  }

  /**
   * Get average for a metric
   */
  getAverage(metric: string): number {
    const values = this.metrics.get(metric) || [];
    return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
  }

  /**
   * Get percentile for a metric
   */
  getPercentile(metric: string, percentile: number): number {
    const values = this.metrics.get(metric) || [];
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Get all metrics summary
   */
  getSummary(): Record<string, { avg: number; p95: number; p99: number }> {
    const summary: Record<string, { avg: number; p95: number; p99: number }> = {};
    
    this.metrics.forEach((values, metric) => {
      summary[metric] = {
        avg: this.getAverage(metric),
        p95: this.getPercentile(metric, 95),
        p99: this.getPercentile(metric, 99),
      };
    });

    return summary;
  }
}