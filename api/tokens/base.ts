import { VercelRequest, VercelResponse } from '@vercel/node';

interface TokenInfo {
  id: string;
  symbol: string;
  name: string;
  address?: string;
  decimals?: number;
  image?: string;
  platforms?: Record<string, string>;
}

const fallbackTokens: TokenInfo[] = [
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    platforms: { base: '0x0000000000000000000000000000000000000000' }
  },
  {
    id: 'wrapped-ethereum',
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18,
    platforms: { base: '0x4200000000000000000000000000000000000006' }
  },
  {
    id: 'usd-coin',
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
    platforms: { base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' }
  },
  {
    id: 'dai',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    decimals: 18,
    platforms: { base: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb' }
  },
  {
    id: 'tether',
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
    decimals: 6,
    platforms: { base: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2' }
  },
  {
    id: 'aerodrome-finance',
    symbol: 'AERO',
    name: 'Aerodrome Finance',
    address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
    decimals: 18,
    platforms: { base: '0x940181a94A35A4569E4529A3CDfB74e38FD98631' }
  },
  {
    id: 'morpho',
    symbol: 'MORPHO',
    name: 'Morpho',
    address: '0xBa661B0c4D2c5BE456F7D625c3Ae34C18411f821',
    decimals: 18,
    platforms: { base: '0xBa661B0c4D2c5BE456F7D625c3Ae34C18411f821' }
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

  try {
    const limit = parseInt(req.query.limit as string) || 50;
    
    // Try to fetch from CoinGecko
    const coingeckoUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`;
    
    try {
      const response = await fetch(coingeckoUrl);
      
      if (response.ok) {
        const data = await response.json();
        const tokens = data.map((token: any) => ({
          id: token.id,
          symbol: token.symbol,
          name: token.name,
          image: token.image,
          decimals: 18,
          platforms: {}
        }));
        
        return res.status(200).json({
          success: true,
          tokens: [...fallbackTokens, ...tokens].slice(0, limit)
        });
      }
    } catch (error) {
      console.error('CoinGecko API error:', error);
    }
    
    // Fallback to static list
    return res.status(200).json({
      success: true,
      tokens: fallbackTokens.slice(0, limit)
    });
    
  } catch (error) {
    console.error('Token API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch tokens'
    });
  }
}