/**
 * Token Constants
 * 
 * Centralized Base chain token definitions to eliminate
 * redundancy across multiple API endpoints.
 */

import type { BaseToken, ExtendedTokenInfo } from '../types/shared';

// Base Chain Configuration
export const BASE_CHAIN_ID = 8453;

// Core Base Chain Tokens - Minimal interface for swap operations
export const BASE_CORE_TOKENS: ReadonlyArray<BaseToken> = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    decimals: 18
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
    decimals: 6
  },
  {
    symbol: 'AERO',
    name: 'Aerodrome Finance',
    address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
    decimals: 18
  },
  {
    symbol: 'MORPHO',
    name: 'Morpho',
    address: '0xBa661B0c4D2c5BE456F7D625c3Ae34C18411f821',
    decimals: 18
  },
  {
    symbol: 'BRETT',
    name: 'Brett',
    address: '0x532f27101965dd16442E59d40670FaF4eBb142Bd',
    decimals: 18
  },
  {
    symbol: 'DEGEN',
    name: 'Degen',
    address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
    decimals: 18
  },
  {
    symbol: 'HIGHER',
    name: 'Higher',
    address: '0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe',
    decimals: 18
  },
  {
    symbol: 'HYUSD',
    name: 'HYUSD Stablecoin',
    address: '0xCc7FF230365bD730eE4B352cC2492CEdAC49383e',
    decimals: 18
  }
] as const;

// Extended token information for frontend services
export const BASE_EXTENDED_TOKENS: ReadonlyArray<ExtendedTokenInfo> = BASE_CORE_TOKENS.map(token => ({
  ...token,
  id: token.symbol.toLowerCase(),
  chainId: BASE_CHAIN_ID,
  platforms: { base: token.address },
  tags: inferTokenTags(token)
}));

// Token tag inference utility
function inferTokenTags(token: BaseToken): ReadonlyArray<string> {
  const tags: string[] = [];
  const name = token.name.toLowerCase();
  const symbol = token.symbol.toLowerCase();
  
  if (symbol === 'eth' || name.includes('ethereum')) {
    tags.push('native');
  }
  
  if (name.includes('usd') || name.includes('dai') || symbol.includes('usd')) {
    tags.push('stablecoin');
  }
  
  if (name.includes('wrapped') || symbol.startsWith('w')) {
    tags.push('wrapped');
  }
  
  if (['brett', 'degen', 'higher'].includes(symbol)) {
    tags.push('meme');
  }
  
  if (['aero', 'morpho'].includes(symbol)) {
    tags.push('defi');
  }
  
  return tags;
}

// Token priority for sorting (lower = higher priority)
export const TOKEN_PRIORITIES: Record<string, number> = {
  ETH: 1,
  WETH: 2,
  USDC: 3,
  USDT: 4,
  DAI: 5,
  AERO: 6,
  MORPHO: 7,
  BRETT: 8,
  DEGEN: 9,
  HIGHER: 10,
  HYUSD: 11
} as const;

// Get token by symbol with type safety
export function getTokenBySymbol(symbol: string): BaseToken | undefined {
  return BASE_CORE_TOKENS.find(token => 
    token.symbol.toUpperCase() === symbol.toUpperCase()
  );
}

// Get token priority for sorting
export function getTokenPriority(symbol: string): number {
  return TOKEN_PRIORITIES[symbol.toUpperCase()] || 100;
}