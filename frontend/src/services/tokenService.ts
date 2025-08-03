interface TokenInfo {
  id: string;
  symbol: string;
  name: string;
  address?: string;
  decimals?: number;
  logoURI?: string;
  chainId: number;
  tags?: string[];
}

interface CoinGeckoToken {
  id: string;
  symbol: string;
  name: string;
  platforms: Record<string, string>;
}

interface CoinGeckoAssetPlatform {
  id: string;
  chain_identifier: number | null;
  name: string;
  shortname: string;
}

class TokenService {
  private static instance: TokenService;
  private baseApiUrl = '/api'; // Frontend API endpoint
  private cache: Map<string, { data: TokenInfo[]; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  private baseChainId = 8453; // Base mainnet chain ID

  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  // Fallback token list for Base chain (used if API fails)
  private fallbackTokens: TokenInfo[] = [
    {
      id: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      chainId: this.baseChainId,
      tags: ['native']
    },
    {
      id: 'weth',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      chainId: this.baseChainId
    },
    {
      id: 'usd-coin',
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      decimals: 6,
      chainId: this.baseChainId,
      tags: ['stablecoin']
    },
    {
      id: 'tether',
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
      decimals: 6,
      chainId: this.baseChainId,
      tags: ['stablecoin']
    },
    {
      id: 'dai',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
      decimals: 18,
      chainId: this.baseChainId,
      tags: ['stablecoin']
    },
    {
      id: 'aerodrome-finance',
      symbol: 'AERO',
      name: 'Aerodrome Finance',
      address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
      decimals: 18,
      chainId: this.baseChainId
    },
    {
      id: 'brett',
      symbol: 'BRETT',
      name: 'Brett',
      address: '0x532f27101965dd16442E59d40670FaF5ebb142E4',
      decimals: 18,
      chainId: this.baseChainId,
      tags: ['meme']
    },
    {
      id: 'degen-base',
      symbol: 'DEGEN',
      name: 'Degen',
      address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
      decimals: 18,
      chainId: this.baseChainId,
      tags: ['meme']
    },
    {
      id: 'higher',
      symbol: 'HIGHER',
      name: 'Higher',
      address: '0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe',
      decimals: 18,
      chainId: this.baseChainId,
      tags: ['meme']
    },
    {
      id: 'morpho',
      symbol: 'MORPHO',
      name: 'Morpho',
      address: '0xbaa5cc21fd487b8fcc2f632f3f4e8d37262a0842',
      decimals: 18,
      chainId: this.baseChainId,
      tags: ['defi']
    }
  ];

  private getFromCache(key: string): TokenInfo[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: TokenInfo[]): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Get Base chain tokens from CoinGecko via backend API
   */
  async getBaseChainTokens(limit = 100): Promise<TokenInfo[]> {
    const cacheKey = `base-tokens-${limit}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Try to fetch from backend API that calls CoinGecko
      const response = await fetch(`${this.baseApiUrl}/tokens/base?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.tokens)) {
        const tokens: TokenInfo[] = data.tokens.map((token: any) => ({
          id: token.id,
          symbol: token.symbol.toUpperCase(),
          name: token.name,
          address: token.platforms?.base || token.address,
          decimals: token.decimals || 18,
          logoURI: token.image,
          chainId: this.baseChainId,
          tags: this.inferTokenTags(token)
        }));
        
        this.setCache(cacheKey, tokens);
        return tokens;
      }
    } catch (error) {
      console.warn('Failed to fetch tokens from CoinGecko API, using fallback:', error);
    }

    // Return fallback tokens if API fails
    return this.fallbackTokens;
  }

  /**
   * Search for tokens by name or symbol
   */
  async searchTokens(query: string): Promise<TokenInfo[]> {
    const allTokens = await this.getBaseChainTokens();
    const lowerQuery = query.toLowerCase();
    
    return allTokens.filter(token =>
      token.symbol.toLowerCase().includes(lowerQuery) ||
      token.name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get token by symbol
   */
  async getTokenBySymbol(symbol: string): Promise<TokenInfo | null> {
    const allTokens = await this.getBaseChainTokens();
    return allTokens.find(token => 
      token.symbol.toUpperCase() === symbol.toUpperCase()
    ) || null;
  }

  /**
   * Get popular tokens for trading
   */
  async getPopularTokens(): Promise<TokenInfo[]> {
    const allTokens = await this.getBaseChainTokens();
    
    // Prioritize tokens by category
    const prioritySymbols = ['ETH', 'WETH', 'USDC', 'USDT', 'DAI', 'AERO', 'MORPHO', 'BRETT', 'DEGEN', 'HIGHER'];
    
    const popular = prioritySymbols
      .map(symbol => allTokens.find(token => token.symbol === symbol))
      .filter(Boolean) as TokenInfo[];
    
    // Add any additional tokens not in priority list
    const remainingTokens = allTokens
      .filter(token => !prioritySymbols.includes(token.symbol))
      .slice(0, 20 - popular.length);
    
    return [...popular, ...remainingTokens];
  }

  /**
   * Infer token tags based on token data
   */
  private inferTokenTags(token: any): string[] {
    const tags: string[] = [];
    const name = token.name?.toLowerCase() || '';
    const symbol = token.symbol?.toLowerCase() || '';
    
    if (symbol === 'eth' || name.includes('ethereum')) {
      tags.push('native');
    }
    
    if (name.includes('usd') || name.includes('dai') || symbol.includes('usd')) {
      tags.push('stablecoin');
    }
    
    if (name.includes('wrapped') || symbol.startsWith('w')) {
      tags.push('wrapped');
    }
    
    if (['brett', 'degen', 'pepe', 'shib', 'doge'].some(meme => 
      name.includes(meme) || symbol.includes(meme)
    )) {
      tags.push('meme');
    }
    
    if (['aero', 'uni', 'curve', 'morpho', 'aave', 'compound'].some(defi => 
      name.includes(defi) || symbol.includes(defi)
    )) {
      tags.push('defi');
    }
    
    return tags;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const tokenService = TokenService.getInstance();
export type { TokenInfo };