/**
 * CORS Utility Functions
 * 
 * Centralized CORS configuration to eliminate redundant code
 * across API endpoints and ensure consistent security headers.
 */

import type { VercelResponse } from '@vercel/node';

// Standard CORS headers with development support
const isDevelopment = process.env.NODE_ENV === 'development' || 
                     process.env.VERCEL_ENV === 'development';

const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': isDevelopment ? '*' : 'https://nyxusd.com',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
} as const;

/**
 * Set standard CORS headers for nyxusd.com origin
 */
export function setCorsHeaders(
  res: VercelResponse, 
  options: {
    readonly methods?: string;
    readonly cache?: string;
  } = {}
): void {
  const methods = options.methods || CORS_HEADERS['Access-Control-Allow-Methods'];
  
  res.setHeader('Access-Control-Allow-Credentials', CORS_HEADERS['Access-Control-Allow-Credentials']);
  res.setHeader('Access-Control-Allow-Origin', CORS_HEADERS['Access-Control-Allow-Origin']);
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', CORS_HEADERS['Access-Control-Allow-Headers']);
  
  if (options.cache) {
    res.setHeader('Cache-Control', options.cache);
  }
}

/**
 * Handle preflight OPTIONS request
 */
export function handleOptions(res: VercelResponse): void {
  res.status(200).end();
}

/**
 * Validate HTTP method against allowed methods
 */
export function validateMethod(
  method: string | undefined, 
  allowedMethods: ReadonlyArray<string>
): boolean {
  return method !== undefined && allowedMethods.includes(method);
}

/**
 * Send method not allowed response
 */
export function sendMethodNotAllowed(
  res: VercelResponse, 
  allowedMethods: ReadonlyArray<string>
): void {
  res.status(405).json({ 
    success: false, 
    error: `Method not allowed. Allowed methods: ${allowedMethods.join(', ')}` 
  });
}