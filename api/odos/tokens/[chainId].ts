import { VercelRequest, VercelResponse } from '@vercel/node';

interface OdosToken {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
}

const baseTokens: OdosToken[] = [
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
    address: '0x532f27101965dd16442E59d40670FaF4eBB142Bd',
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
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS for nyxusd.com
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://nyxusd.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const chainId = req.query.chainId as string;
  
  // Only support Base chain (8453) for now
  if (chainId !== '8453') {
    return res.status(200).json([]);
  }

  try {
    // Try to fetch from Odos API
    const odosUrl = `https://api.odos.xyz/info/tokens/${chainId}`;
    
    try {
      const response = await fetch(odosUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NyxUSD/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return res.status(200).json(data);
        }
      }
    } catch (error) {
      console.error('Odos API error:', error);
    }
    
    // Fallback to static list
    return res.status(200).json(baseTokens);
    
  } catch (error) {
    console.error('Odos token API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch tokens'
    });
  }
}