import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleOptions, validateMethod, sendMethodNotAllowed } from './utils/cors.js';
import type { ApiResponse } from './types/shared.js';

type RiskTier = 'safe' | 'medium' | 'high';

interface Pool {
  readonly id: string;
  readonly name: string;          // Main name from whitepaper
  readonly subName: string;       // Degen sub-name
  readonly risk: RiskTier;
  readonly description: string;   // From whitepaper sections
  readonly perfectFor: ReadonlyArray<string>;
  readonly targetChains: ReadonlyArray<string>;
}

const POOLS: ReadonlyArray<Pool> = [
  {
    id: 'safe',
    name: 'Safe Pool',
    subName: 'SAFU Chad HODLer',
    risk: 'safe',
    description:
      'Prioritizes capital preservation with steady returns via established protocols (e.g., Aave, Compound). Zero leverage, diversified, continuous monitoring and rebalancing for optimal risk-adjusted yield.',
    perfectFor: ['Conservative investors', 'Treasuries', 'Long-term holdings'],
    targetChains: ['Base', 'Sui'],
  },
  {
    id: 'medium',
    name: 'Medium Pool',
    subName: 'DeFi Gigachad Stimmies',
    risk: 'medium',
    description:
      'Balances growth with controlled risk. Employs moderate leverage across established protocols on Base and Sui. Dynamically adjusts positions and auto-deleverages during volatility with liquidation protection.',
    perfectFor: ['Balanced growth seekers', 'Medium-term horizons'],
    targetChains: ['Base', 'Sui'],
  },
  {
    id: 'high',
    name: 'High Risk Pool',
    subName: 'WAGMI Ape Max Leverage',
    risk: 'high',
    description:
      'Aggressive yield opportunities across new launches, concentrated liquidity, and advanced strategies. Accepts higher risk with mandatory stop-losses and continuous monitoring.',
    perfectFor: ['Experienced yield farmers', 'Risk-tolerant investors'],
    targetChains: ['Base', 'Sui'],
  },
] as const;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  setCorsHeaders(res, { methods: 'GET,OPTIONS', cache: 's-maxage=60, stale-while-revalidate=120' });

  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }

  if (!validateMethod(req.method, ['GET'])) {
    return sendMethodNotAllowed(res, ['GET']);
  }

  const response: ApiResponse<ReadonlyArray<Pool>> = {
    success: true,
    data: POOLS,
    timestamp: new Date().toISOString(),
  };

  res.status(200).json(response);
}