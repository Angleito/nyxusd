import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { 
  EmailSubscription, 
  SubscriptionRequest, 
  SubscriptionResponse, 
  SubscriptionCountResponse,
  ErrorResponse 
} from './types/shared.js';
import { setCorsHeaders, handleOptions, validateMethod } from './utils/cors.js';
import { kv } from '@vercel/kv';
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';

/**
 * Email validation regex pattern
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_SUBSCRIPTIONS_PER_IP = 5;

/**
 * Validates email format
 */
const validateEmail = (email: string): E.Either<string, string> => {
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(trimmed) || trimmed.length > 254) {
    return E.left('Invalid email format');
  }
  return E.right(trimmed);
};

/**
 * Gets the client IP address from the request
 */
const getClientIp = (req: VercelRequest): string => {
  const forwarded = req.headers['x-forwarded-for'] as string;
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
};

/**
 * Checks rate limit for IP address
 */
const checkRateLimit = async (ipAddress: string): Promise<E.Either<string, void>> => {
  try {
    const key = `rate_limit:${ipAddress}`;
    const count = await kv.get<number>(key) || 0;
    
    if (count >= MAX_SUBSCRIPTIONS_PER_IP) {
      return E.left('Rate limit exceeded. Please try again later.');
    }
    
    await kv.set(key, count + 1, { ex: RATE_LIMIT_WINDOW / 1000 });
    return E.right(undefined);
  } catch (error) {
    console.error('Rate limit check error:', error);
    return E.right(undefined); // Don't block on rate limit errors
  }
};

/**
 * Stores email subscription in KV
 */
const storeSubscription = async (subscription: EmailSubscription): Promise<E.Either<string, EmailSubscription>> => {
  try {
    const key = `subscription:${subscription.email}`;
    
    // Check if already exists
    const existing = await kv.get<EmailSubscription>(key);
    if (existing) {
      return E.right(existing);
    }
    
    // Store new subscription
    await kv.set(key, subscription);
    
    // Update count
    await kv.incr('subscription_count');
    
    return E.right(subscription);
  } catch (error) {
    console.error('Store subscription error:', error);
    return E.left('Failed to store subscription');
  }
};

/**
 * Handles POST request to create subscription
 */
const handlePost = async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  const { email, source = 'whitepaper-page', metadata }: SubscriptionRequest = req.body || {};
  
  // Validate email
  const validationResult = validateEmail(email || '');
  if (E.isLeft(validationResult)) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: validationResult.left
    };
    res.status(400).json(errorResponse);
    return;
  }
  
  const sanitizedEmail = validationResult.right;
  const ipAddress = getClientIp(req);
  
  // Check rate limit
  const rateLimitResult = await checkRateLimit(ipAddress);
  if (E.isLeft(rateLimitResult)) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: rateLimitResult.left
    };
    res.status(429).json(errorResponse);
    return;
  }
  
  // Create subscription object
  const subscription: EmailSubscription = {
    email: sanitizedEmail,
    subscribedAt: new Date(),
    source,
    ipAddress,
    metadata: {
      ...metadata,
      userAgent: req.headers['user-agent'] as string,
      referrer: req.headers['referer'] as string
    }
  };
  
  // Store subscription
  const storeResult = await storeSubscription(subscription);
  if (E.isLeft(storeResult)) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: storeResult.left
    };
    res.status(500).json(errorResponse);
    return;
  }
  
  const response: SubscriptionResponse = {
    success: true,
    message: 'Successfully subscribed to updates',
    subscription: storeResult.right
  };
  
  res.status(201).json(response);
};

/**
 * Handles GET request to check subscription status
 */
const handleGet = async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  const { email } = req.query;
  
  if (!email || typeof email !== 'string') {
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Email parameter is required'
    };
    res.status(400).json(errorResponse);
    return;
  }
  
  const validationResult = validateEmail(email);
  if (E.isLeft(validationResult)) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: validationResult.left
    };
    res.status(400).json(errorResponse);
    return;
  }
  
  try {
    const key = `subscription:${validationResult.right}`;
    const subscription = await kv.get<EmailSubscription>(key);
    
    const response: SubscriptionResponse = {
      success: true,
      message: subscription ? 'Email is subscribed' : 'Email is not subscribed',
      subscription: subscription || undefined
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Get subscription error:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to check subscription status'
    };
    res.status(500).json(errorResponse);
  }
};

/**
 * Handles DELETE request to unsubscribe
 */
const handleDelete = async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  const { email } = req.query;
  
  if (!email || typeof email !== 'string') {
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Email parameter is required'
    };
    res.status(400).json(errorResponse);
    return;
  }
  
  const validationResult = validateEmail(email);
  if (E.isLeft(validationResult)) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: validationResult.left
    };
    res.status(400).json(errorResponse);
    return;
  }
  
  try {
    const key = `subscription:${validationResult.right}`;
    const existed = await kv.del(key);
    
    if (existed) {
      await kv.decr('subscription_count');
    }
    
    const response: SubscriptionResponse = {
      success: true,
      message: existed ? 'Successfully unsubscribed' : 'Email was not subscribed'
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Delete subscription error:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to unsubscribe'
    };
    res.status(500).json(errorResponse);
  }
};

/**
 * Main handler function
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    handleOptions(res);
    return;
  }
  
  const method = req.method || '';
  
  switch (method) {
    case 'POST':
      await handlePost(req, res);
      break;
    case 'GET':
      await handleGet(req, res);
      break;
    case 'DELETE':
      await handleDelete(req, res);
      break;
    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}