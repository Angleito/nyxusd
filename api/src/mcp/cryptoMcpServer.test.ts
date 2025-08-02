import CryptoMcpServer from './cryptoMcpServer';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

describe('CryptoMcpServer', () => {
  let server: CryptoMcpServer;
  let mockServer: any;

  beforeEach(() => {
    server = new CryptoMcpServer();
    mockServer = (server as any).server;
  });

  describe('Tool Handlers', () => {
    test('should list available tools', async () => {
      const handler = mockServer._requestHandlers.get('tools/list');
      const result = await handler({ method: 'tools/list' });
      
      expect(result.tools).toHaveLength(4);
      expect(result.tools.map((t: any) => t.name)).toEqual([
        'get_crypto_price',
        'get_market_trends',
        'analyze_portfolio',
        'get_defi_rates',
      ]);
    });

    test('should get crypto price', async () => {
      const handler = mockServer._requestHandlers.get('tools/call');
      const result = await handler({
        method: 'tools/call',
        params: {
          name: 'get_crypto_price',
          arguments: { symbol: 'BTC' },
        },
      });

      const content = JSON.parse(result.content[0].text);
      expect(content).toHaveProperty('symbol', 'BTC');
      expect(content).toHaveProperty('price');
      expect(content).toHaveProperty('marketCap');
      expect(content).toHaveProperty('timestamp');
    });

    test('should analyze portfolio', async () => {
      const handler = mockServer._requestHandlers.get('tools/call');
      const result = await handler({
        method: 'tools/call',
        params: {
          name: 'analyze_portfolio',
          arguments: {
            holdings: [
              { symbol: 'BTC', amount: 1, purchasePrice: 50000 },
              { symbol: 'ETH', amount: 10, purchasePrice: 3000 },
            ],
          },
        },
      });

      const analysis = JSON.parse(result.content[0].text);
      expect(analysis).toHaveProperty('totalValue');
      expect(analysis).toHaveProperty('totalPnL');
      expect(analysis).toHaveProperty('riskScore');
      expect(analysis).toHaveProperty('diversificationScore');
      expect(analysis).toHaveProperty('recommendations');
      expect(analysis.breakdown).toHaveLength(2);
    });

    test('should handle unknown tool error', async () => {
      const handler = mockServer._requestHandlers.get('tools/call');
      
      await expect(
        handler({
          method: 'tools/call',
          params: {
            name: 'unknown_tool',
            arguments: {},
          },
        })
      ).rejects.toThrow(McpError);
    });
  });

  describe('Resource Handlers', () => {
    test('should list available resources', async () => {
      const handler = mockServer._requestHandlers.get('resources/list');
      const result = await handler({ method: 'resources/list' });
      
      expect(result.resources).toHaveLength(4);
      expect(result.resources.map((r: any) => r.uri)).toEqual([
        'crypto://market/overview',
        'crypto://prices/top100',
        'crypto://defi/tvl',
        'crypto://history/btc',
      ]);
    });

    test('should read market overview resource', async () => {
      const handler = mockServer._requestHandlers.get('resources/read');
      const result = await handler({
        method: 'resources/read',
        params: { uri: 'crypto://market/overview' },
      });

      const data = JSON.parse(result.contents[0].text);
      expect(data).toHaveProperty('totalMarketCap');
      expect(data).toHaveProperty('btcDominance');
      expect(data).toHaveProperty('defiTVL');
    });

    test('should handle unknown resource error', async () => {
      const handler = mockServer._requestHandlers.get('resources/read');
      
      await expect(
        handler({
          method: 'resources/read',
          params: { uri: 'crypto://unknown/resource' },
        })
      ).rejects.toThrow(McpError);
    });
  });

  describe('Prompt Handlers', () => {
    test('should list available prompts', async () => {
      const handler = mockServer._requestHandlers.get('prompts/list');
      const result = await handler({ method: 'prompts/list' });
      
      expect(result.prompts).toHaveLength(4);
      expect(result.prompts.map((p: any) => p.name)).toEqual([
        'market_analysis',
        'portfolio_review',
        'defi_opportunities',
        'risk_assessment',
      ]);
    });

    test('should get market analysis prompt', async () => {
      const handler = mockServer._requestHandlers.get('prompts/get');
      const result = await handler({
        method: 'prompts/get',
        params: { name: 'market_analysis' },
      });

      expect(result.description).toBe('Analyze current crypto market conditions');
      expect(result.messages[0].content.text).toContain('market analysis');
      expect(result.messages[0].content.text).toContain('sentiment');
    });

    test('should handle unknown prompt error', async () => {
      const handler = mockServer._requestHandlers.get('prompts/get');
      
      await expect(
        handler({
          method: 'prompts/get',
          params: { name: 'unknown_prompt' },
        })
      ).rejects.toThrow(McpError);
    });
  });

  describe('Market Trends', () => {
    test('should get market trends for different timeframes', async () => {
      const handler = mockServer._requestHandlers.get('tools/call');
      
      for (const timeframe of ['1h', '24h', '7d', '30d']) {
        const result = await handler({
          method: 'tools/call',
          params: {
            name: 'get_market_trends',
            arguments: { timeframe },
          },
        });

        const trends = JSON.parse(result.content[0].text);
        expect(trends).toHaveProperty('trendType');
        expect(trends).toHaveProperty('sentiment');
        expect(trends).toHaveProperty('topGainers');
        expect(trends).toHaveProperty('topLosers');
      }
    });
  });

  describe('DeFi Rates', () => {
    test('should get DeFi rates for specific protocol', async () => {
      const handler = mockServer._requestHandlers.get('tools/call');
      const result = await handler({
        method: 'tools/call',
        params: {
          name: 'get_defi_rates',
          arguments: {
            protocol: 'Aave',
            chain: 'ethereum',
          },
        },
      });

      const rates = JSON.parse(result.content[0].text);
      expect(Array.isArray(rates)).toBe(true);
      rates.forEach((rate: any) => {
        expect(rate).toHaveProperty('protocol');
        expect(rate).toHaveProperty('chain');
        expect(rate).toHaveProperty('apy');
        expect(rate).toHaveProperty('tvl');
        expect(rate).toHaveProperty('risk');
      });
    });

    test('should get DeFi rates for all protocols', async () => {
      const handler = mockServer._requestHandlers.get('tools/call');
      const result = await handler({
        method: 'tools/call',
        params: {
          name: 'get_defi_rates',
          arguments: {
            protocol: 'all',
            chain: 'all',
          },
        },
      });

      const rates = JSON.parse(result.content[0].text);
      expect(rates.length).toBeGreaterThan(5);
    });
  });

  describe('Caching', () => {
    test('should cache price data', async () => {
      const handler = mockServer._requestHandlers.get('tools/call');
      
      const result1 = await handler({
        method: 'tools/call',
        params: {
          name: 'get_crypto_price',
          arguments: { symbol: 'ETH' },
        },
      });
      
      const result2 = await handler({
        method: 'tools/call',
        params: {
          name: 'get_crypto_price',
          arguments: { symbol: 'ETH' },
        },
      });
      
      expect(result1.content[0].text).toBe(result2.content[0].text);
    });
  });
});

export default CryptoMcpServer;