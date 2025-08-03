interface TokenInfo {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly address?: string;
  readonly decimals?: number;
  readonly logoURI?: string;
  readonly chainId: number;
  readonly tags?: ReadonlyArray<string>;
}

interface CoinGeckoToken {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly platforms: Record<string, string>;
}

interface CoinGeckoAssetPlatform {
  readonly id: string;
  readonly chain_identifier: number | null;
  readonly name: string;
  readonly shortname: string;
}

class TokenService {
  private static instance: TokenService;
  private baseApiUrl = (import.meta.env['MODE'] === 'production') 
    ? '/api' 
    : 'http://localhost:8080/api'; // Backend API endpoint
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
  private readonly fallbackTokens: ReadonlyArray<TokenInfo> = [
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

  private getFromCache(key: string): ReadonlyArray<TokenInfo> | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: ReadonlyArray<TokenInfo>): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Get comprehensive token list from multiple sources (CoinGecko + Odos)
   */
  async getBaseChainTokens(limit = 500): Promise<ReadonlyArray<TokenInfo>> {
    const cacheKey = `comprehensive-base-tokens-${limit}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    console.log('🔍 Fetching comprehensive token list from multiple sources...');

    try {
      // Fetch from multiple sources in parallel
      const [coingeckoTokens, odosTokens] = await Promise.allSettled([
        this.fetchCoinGeckoTokens(limit),
        this.fetchOdosTokens()
      ]);

      let allTokens = [...this.fallbackTokens]; // Start with fallback
      const addressSet = new Set<string>();
      
      // Add tokens to set to avoid duplicates
      this.fallbackTokens.forEach(token => {
        if (token.address) {
          addressSet.add(token.address.toLowerCase());
        }
      });

      // Process CoinGecko tokens
      if (coingeckoTokens.status === 'fulfilled' && coingeckoTokens.value.length > 0) {
        console.log(`✅ Found ${coingeckoTokens.value.length} tokens from CoinGecko`);
        coingeckoTokens.value.forEach(token => {
          const address = token.address?.toLowerCase();
          if (address && !addressSet.has(address)) {
            allTokens.push(token);
            addressSet.add(address);
          }
        });
      } else {
        console.warn('⚠️ CoinGecko token fetch failed:', coingeckoTokens.status === 'rejected' ? coingeckoTokens.reason : 'No tokens returned');
      }

      // Process Odos tokens
      if (odosTokens.status === 'fulfilled' && odosTokens.value.length > 0) {
        console.log(`✅ Found ${odosTokens.value.length} tokens from Odos`);
        odosTokens.value.forEach(token => {
          const address = token.address?.toLowerCase();
          if (address && !addressSet.has(address)) {
            allTokens.push(token);
            addressSet.add(address);
          }
        });
      } else {
        console.warn('⚠️ Odos token fetch failed:', odosTokens.status === 'rejected' ? odosTokens.reason : 'No tokens returned');
      }

      // Sort by popularity (market cap, then alphabetically)
      allTokens.sort((a, b) => {
        // Priority tokens first
        const priorityA = this.getTokenPriority(a.symbol);
        const priorityB = this.getTokenPriority(b.symbol);
        if (priorityA !== priorityB) return priorityA - priorityB;
        
        // Then alphabetically
        return a.symbol.localeCompare(b.symbol);
      });

      console.log(`🚀 Total unique tokens found: ${allTokens.length}`);
      
      this.setCache(cacheKey, allTokens);
      return allTokens;

    } catch (error) {
      console.error('❌ Failed to fetch comprehensive token list:', error);
      return this.fallbackTokens;
    }
  }

  /**
   * Fetch tokens from CoinGecko via backend API
   */
  private async fetchCoinGeckoTokens(limit: number): Promise<ReadonlyArray<TokenInfo>> {
    const response = await fetch(`${this.baseApiUrl}/tokens/base?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && Array.isArray(data.tokens)) {
      return data.tokens.map((token: CoinGeckoToken) => ({
        id: token.id,
        symbol: token.symbol.toUpperCase(),
        name: token.name,
        address: token.platforms?.base || token.address,
        decimals: token.decimals || 18,
        logoURI: token.image,
        chainId: this.baseChainId,
        tags: this.inferTokenTags(token)
      }));
    }
    
    return [];
  }

  /**
   * Fetch tokens directly from Odos API
   */
  private async fetchOdosTokens(): Promise<ReadonlyArray<TokenInfo>> {
    try {
      const response = await fetch(`${this.baseApiUrl}/odos/tokens/${this.baseChainId}`);
      
      if (!response.ok) {
        console.warn(`⚠️ Odos token fetch failed: API returned ${response.status}`);
        return [];
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('⚠️ Odos token fetch failed: Response is not JSON');
        return [];
      }
      
      const tokens = await response.json();
      
      if (Array.isArray(tokens)) {
        return tokens.map((token: { symbol?: string; name?: string; address?: string; decimals?: number }) => ({
          id: token.symbol?.toLowerCase() || 'unknown',
          symbol: token.symbol?.toUpperCase() || 'UNKNOWN',
          name: token.name || token.symbol || 'Unknown Token',
          address: token.address,
          decimals: token.decimals || 18,
          logoURI: undefined,
          chainId: this.baseChainId,
          tags: this.inferTokenTags(token)
        }));
      } else {
        console.warn('⚠️ Odos token fetch failed: No tokens returned');
        return [];
      }
    } catch (error) {
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.warn('⚠️ Odos token fetch failed: Invalid JSON response (likely HTML error page)');
      } else {
        console.warn('⚠️ Odos token fetch failed:', error);
      }
      return [];
    }
  }

  /**
   * Get token priority for sorting (lower = higher priority)
   */
  private getTokenPriority(symbol: string): number {
    const priorities: Record<string, number> = {
      'ETH': 1,
      'WETH': 2,
      'USDC': 3,
      'USDT': 4,
      'DAI': 5,
      'AERO': 6,
      'MORPHO': 7,
      'BRETT': 8,
      'DEGEN': 9,
      'HIGHER': 10
    };
    
    return priorities[symbol] || 100;
  }

  /**
   * Search for tokens by name or symbol
   */
  async searchTokens(query: string): Promise<ReadonlyArray<TokenInfo>> {
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
  async getPopularTokens(): Promise<ReadonlyArray<TokenInfo>> {
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
  private inferTokenTags(token: { readonly name?: string; readonly symbol?: string }): ReadonlyArray<string> {
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