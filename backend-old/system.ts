import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Generate dynamic stats based on current time for realistic data
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // Use day of year to generate consistent but changing values
  const baseCollateral = 250000 + (dayOfYear * 1000);
  const baseDebt = 180000 + (dayOfYear * 500);
  const ratio = Math.floor((baseCollateral / baseDebt) * 100);

  res.json({
    totalCollateral: (baseCollateral * 1e18).toString(),
    totalDebt: (baseDebt * 1e18).toString(),
    systemCollateralizationRatio: ratio,
    stabilityFeeRate: 500, // 5% APR in basis points
    liquidationRatio: 150, // 150%
    emergencyShutdown: false,
    supportedCollaterals: [
      {
        type: "WETH",
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        liquidationRatio: 150,
        stabilityFee: 500,
        debtCeiling: "1000000000000000000000000", // $1M
        currentDebt: "180000000000000000000000", // $180,000
        priceOracle: "Chainlink",
        status: "active",
      },
      {
        type: "WBTC",
        address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        liquidationRatio: 150,
        stabilityFee: 550,
        debtCeiling: "500000000000000000000000", // $500k
        currentDebt: "0",
        priceOracle: "Chainlink",
        status: "active",
      },
      {
        type: "LINK",
        address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
        liquidationRatio: 175,
        stabilityFee: 600,
        debtCeiling: "250000000000000000000000", // $250k
        currentDebt: "0",
        priceOracle: "Chainlink",
        status: "coming_soon",
      },
    ],
    chainSupport: [
      {
        chain: "ethereum",
        chainId: 1,
        status: "active",
        contracts: {
          cdpManager: "0x0000000000000000000000000000000000000001",
          nyxUSD: "0x0000000000000000000000000000000000000002",
          oracle: "0x0000000000000000000000000000000000000003",
        },
      },
      {
        chain: "polygon",
        chainId: 137,
        status: "active",
        contracts: {
          cdpManager: "0x0000000000000000000000000000000000000001",
          nyxUSD: "0x0000000000000000000000000000000000000002",
          oracle: "0x0000000000000000000000000000000000000003",
        },
      },
      {
        chain: "arbitrum",
        chainId: 42161,
        status: "coming_soon",
        contracts: null,
      },
      {
        chain: "midnight",
        chainId: 99999,
        status: "planned",
        contracts: null,
      },
    ],
    metrics: {
      totalCDPs: 15,
      activeCDPs: 12,
      liquidatedCDPs: 3,
      averageCollateralizationRatio: 185,
      totalValueLocked: "250000000000000000000000", // $250,000
      volume24h: "45000000000000000000000", // $45,000
      uniqueUsers: 8,
    },
    protocolVersion: "1.0.0",
    lastUpdate: new Date().toISOString(),
  });
}