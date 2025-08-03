import axios from 'axios';

interface TokenPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  circulating_supply: number;
  total_supply: number;
  ath: number;
  ath_change_percentage: number;
  last_updated: string;
}

interface SimplePrice {
  usd: number;
  usd_24h_change?: number;
  usd_market_cap?: number;
  usd_24h_vol?: number;
}

interface TrendingToken {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  price_btc: number;
}

class CoinGeckoService {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private proBaseUrl = 'https://pro-api.coingecko.com/api/v3';
  private apiKey = process.env['COINGECKO_API_KEY'];
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 60000; // 1 minute cache
  private rateLimitDelay = this.apiKey ? 500 : 1100; // Pro tier: 500ms, Free tier: 1100ms
  private lastCallTime = 0;

  constructor() {
    if (this.apiKey) {
      console.log('🔑 CoinGecko API configured with Pro API key');
    } else {
      console.log('📊 CoinGecko API configured with free tier (no API key)');
    }
  }

  // Token ID mappings for common tokens
  private tokenIdMap: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'USDC': 'usd-coin',
    'USDT': 'tether',
    'DAI': 'dai',
    'WETH': 'weth',
    'AAVE': 'aave',
    'UNI': 'uniswap',
    'LINK': 'chainlink',
    'MATIC': 'matic-network',
    'SOL': 'solana',
    'AVAX': 'avalanche-2',
    'DOT': 'polkadot',
    'ATOM': 'cosmos',
    'NEAR': 'near',
    'OP': 'optimism',
    'ARB': 'arbitrum',
    'PEPE': 'pepe',
    'SHIB': 'shiba-inu',
    'DOGE': 'dogecoin',
    'BRETT': 'brett',
    'AERO': 'aerodrome-finance',
    'DEGEN': 'degen-base',
    'HIGHER': 'higher',
  };

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    if (timeSinceLastCall < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastCall));
    }
    this.lastCallTime = Date.now();
  }

  private getCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}_${JSON.stringify(params || {})}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getTokenId(symbol: string): string {
    return this.tokenIdMap[symbol.toUpperCase()] || symbol.toLowerCase();
  }

  private getApiUrl(): string {
    return this.apiKey ? this.proBaseUrl : this.baseUrl;
  }

  private getRequestConfig(): any {
    const config: any = {};
    if (this.apiKey) {
      config.headers = {
        'x-cg-pro-api-key': this.apiKey
      };
    }
    return config;
  }

  async getTokenPrice(symbol: string): Promise<TokenPrice | null> {
    try {
      const tokenId = this.getTokenId(symbol);
      const cacheKey = this.getCacheKey('price', { tokenId });
      
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      await this.enforceRateLimit();

      const url = `${this.getApiUrl()}/coins/markets`;
      const config = this.getRequestConfig();
      
      const response = await axios.get(url, {
        ...config,
        params: {
          vs_currency: 'usd',
          ids: tokenId,
          order: 'market_cap_desc',
          per_page: 1,
          page: 1,
          sparkline: false,
          locale: 'en'
        }
      });

      if (response.data && response.data.length > 0) {
        const data = response.data[0];
        this.setCache(cacheKey, data);
        return data;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return null;
    }
  }

  async getMultipleTokenPrices(symbols: string[]): Promise<Record<string, TokenPrice>> {
    try {
      const tokenIds = symbols.map(s => this.getTokenId(s));
      const cacheKey = this.getCacheKey('prices', { tokenIds });
      
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      await this.enforceRateLimit();

      const url = `${this.getApiUrl()}/coins/markets`;
      const config = this.getRequestConfig();

      const response = await axios.get(url, {
        ...config,
        params: {
          vs_currency: 'usd',
          ids: tokenIds.join(','),
          order: 'market_cap_desc',
          per_page: 100,
          page: 1,
          sparkline: false,
          locale: 'en'
        }
      });

      const result: Record<string, TokenPrice> = {};
      
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((token: TokenPrice) => {
          // Map back to original symbol
          const symbol = symbols.find(s => 
            this.getTokenId(s) === token.id
          ) || token.symbol.toUpperCase();
          result[symbol] = token;
        });
      }

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching multiple token prices:', error);
      return {};
    }
  }

  async getSimplePrice(tokenIds: string[], includeMktCap = true, include24hrVol = true, include24hrChange = true): Promise<Record<string, SimplePrice>> {
    try {
      const cacheKey = this.getCacheKey('simple', { tokenIds, includeMktCap, include24hrVol, include24hrChange });
      
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      await this.enforceRateLimit();

      const url = `${this.getApiUrl()}/simple/price`;
      const config = this.getRequestConfig();

      const response = await axios.get(url, {
        ...config,
        params: {
          ids: tokenIds.join(','),
          vs_currencies: 'usd',
          include_market_cap: includeMktCap,
          include_24hr_vol: include24hrVol,
          include_24hr_change: include24hrChange
        }
      });

      if (response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }

      return {};
    } catch (error) {
      console.error('Error fetching simple prices:', error);
      return {};
    }
  }

  async getTrendingTokens(): Promise<TrendingToken[]> {
    try {
      const cacheKey = this.getCacheKey('trending');
      
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      await this.enforceRateLimit();

      const url = `${this.getApiUrl()}/search/trending`;
      const config = this.getRequestConfig();

      const response = await axios.get(url, config);

      if (response.data && response.data.coins) {
        const trending = response.data.coins.map((item: any) => item.item);
        this.setCache(cacheKey, trending);
        return trending;
      }

      return [];
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
      return [];
    }
  }

  async getMarketData(page = 1, perPage = 100): Promise<TokenPrice[]> {
    try {
      const cacheKey = this.getCacheKey('market', { page, perPage });
      
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      await this.enforceRateLimit();

      const url = `${this.getApiUrl()}/coins/markets`;
      const config = this.getRequestConfig();

      const response = await axios.get(url, {
        ...config,
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: perPage,
          page: page,
          sparkline: false,
          locale: 'en'
        }
      });

      if (response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }

      return [];
    } catch (error) {
      console.error('Error fetching market data:', error);
      return [];
    }
  }

  async searchTokens(query: string): Promise<any[]> {
    try {
      const cacheKey = this.getCacheKey('search', { query });
      
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      await this.enforceRateLimit();

      const url = `${this.getApiUrl()}/search`;
      const config = this.getRequestConfig();

      const response = await axios.get(url, {
        ...config,
        params: { query }
      });

      if (response.data && response.data.coins) {
        this.setCache(cacheKey, response.data.coins);
        return response.data.coins;
      }

      return [];
    } catch (error) {
      console.error('Error searching tokens:', error);
      return [];
    }
  }

  formatPriceResponse(token: TokenPrice): string {
    const priceFormatted = token.current_price < 0.01 
      ? token.current_price.toExponential(2)
      : token.current_price.toLocaleString('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: token.current_price < 1 ? 6 : 2
        });

    const changeEmoji = token.price_change_percentage_24h > 0 ? '📈' : '📉';
    const changeColor = token.price_change_percentage_24h > 0 ? '+' : '';

    return `**${token.name} (${token.symbol.toUpperCase()})**
Price: ${priceFormatted}
24h Change: ${changeEmoji} ${changeColor}${token.price_change_percentage_24h.toFixed(2)}%
Market Cap: $${(token.market_cap / 1e9).toFixed(2)}B
24h Volume: $${(token.total_volume / 1e6).toFixed(2)}M
Rank: #${token.market_cap_rank}`;
  }

  formatMultiplePrices(tokens: Record<string, TokenPrice>): string {
    const formatted = Object.entries(tokens)
      .sort((a, b) => (b[1].market_cap || 0) - (a[1].market_cap || 0))
      .map(([symbol, data]) => {
        const price = data.current_price < 0.01 
          ? data.current_price.toExponential(2)
          : data.current_price.toLocaleString('en-US', { 
              style: 'currency', 
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: data.current_price < 1 ? 6 : 2
            });
        const changeEmoji = data.price_change_percentage_24h > 0 ? '📈' : '📉';
        const change = data.price_change_percentage_24h.toFixed(2);
        
        return `• **${symbol}**: ${price} ${changeEmoji} ${change}%`;
      })
      .join('\n');

    return `**Current Prices:**\n${formatted}`;
  }

  clearCache(): void {
    this.cache.clear();
  }

  setCacheTimeout(timeout: number): void {
    this.cacheTimeout = timeout;
  }
}

export const coingeckoService = new CoinGeckoService();