/**
 * Pool types shared in the frontend app
 * Mirrors the backend response from /api/pools
 */

export type RiskTier = 'safe' | 'medium' | 'high';

export interface Pool {
  readonly id: string;
  readonly name: string;        // Main whitepaper name
  readonly subName: string;     // Degen sub-name
  readonly risk: RiskTier;
  readonly description: string;
  readonly perfectFor: ReadonlyArray<string>;
  readonly targetChains: ReadonlyArray<string>;
}

/**
 * API envelope used across endpoints
 */
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly timestamp?: string;
}