/**
 * Rate Limiting Utility
 * 
 * Simple in-memory rate limiter for API endpoints
 * In production, consider using Redis or Vercel's Edge Config
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory storage for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: VercelRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Skip counting successful requests
  message?: string; // Custom error message
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
  message: 'Too many requests, please try again later.'
};

/**
 * Get client identifier from request
 */
function getDefaultKey(req: VercelRequest): string {
  // Use X-Forwarded-For header if available (Vercel sets this)
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' 
    ? forwarded.split(',')[0].trim() 
    : req.socket?.remoteAddress || 'unknown';
  
  // Include path to allow different limits per endpoint
  return `${ip}:${req.url || '/'}`;
}

/**
 * Rate limiting middleware
 */
export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const options = { ...defaultConfig, ...config };
  
  return async (req: VercelRequest, res: VercelResponse, next?: () => Promise<void>) => {
    const key = options.keyGenerator?.(req) || getDefaultKey(req);
    const now = Date.now();
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      entry = {
        count: 0,
        resetTime: now + options.windowMs
      };
      rateLimitStore.set(key, entry);
    }
    
    // Increment request count
    entry.count++;
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', options.maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.maxRequests - entry.count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());
    
    // Check if limit exceeded
    if (entry.count > options.maxRequests) {
      res.setHeader('Retry-After', Math.ceil((entry.resetTime - now) / 1000).toString());
      res.status(429).json({
        success: false,
        error: options.message,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      });
      return;
    }
    
    // Continue to next handler
    if (next) {
      await next();
    }
  };
}

/**
 * Create rate limiter with custom configuration
 */
export function createRateLimiter(config: Partial<RateLimitConfig>) {
  return rateLimit(config);
}

/**
 * Common rate limit configurations
 */
export const rateLimiters = {
  // Strict limit for authentication endpoints
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per 15 minutes
    message: 'Too many authentication attempts, please try again later.'
  }),
  
  // Standard API limit
  api: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  }),
  
  // Lenient limit for read-only endpoints
  read: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 120, // 120 requests per minute
  }),
  
  // Strict limit for expensive operations
  expensive: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
    message: 'Rate limit exceeded for resource-intensive operations.'
  })
};

/**
 * Apply rate limiting to Vercel serverless function
 */
export function withRateLimit(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void>,
  config?: Partial<RateLimitConfig>
) {
  const limiter = rateLimit(config);
  
  return async (req: VercelRequest, res: VercelResponse) => {
    await limiter(req, res, async () => {
      await handler(req, res);
    });
  };
}