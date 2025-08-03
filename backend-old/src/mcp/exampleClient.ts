#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

class CryptoMcpClient {
  private client: Client;

  constructor() {
    this.client = new Client(
      {
        name: 'crypto-mcp-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );
  }

  async connect() {
    const serverPath = './cryptoMcpServer.ts';
    const serverProcess = spawn('npx', ['ts-node', serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['ts-node', serverPath],
    });

    await this.client.connect(transport);
    console.log('Connected to Crypto MCP Server');
  }

  async listTools() {
    const result = await this.client.request(
      { method: 'tools/list' },
      { timeout: 5000 }
    );
    return result;
  }

  async getCryptoPrice(symbol: string) {
    const result = await this.client.request(
      {
        method: 'tools/call',
        params: {
          name: 'get_crypto_price',
          arguments: { symbol },
        },
      },
      { timeout: 5000 }
    );
    return result;
  }

  async getMarketTrends(timeframe: string = '24h') {
    const result = await this.client.request(
      {
        method: 'tools/call',
        params: {
          name: 'get_market_trends',
          arguments: { timeframe },
        },
      },
      { timeout: 5000 }
    );
    return result;
  }

  async analyzePortfolio(holdings: any[]) {
    const result = await this.client.request(
      {
        method: 'tools/call',
        params: {
          name: 'analyze_portfolio',
          arguments: { holdings },
        },
      },
      { timeout: 5000 }
    );
    return result;
  }

  async getDefiRates(protocol: string = 'all', chain: string = 'all') {
    const result = await this.client.request(
      {
        method: 'tools/call',
        params: {
          name: 'get_defi_rates',
          arguments: { protocol, chain },
        },
      },
      { timeout: 5000 }
    );
    return result;
  }

  async getMarketOverview() {
    const result = await this.client.request(
      {
        method: 'resources/read',
        params: {
          uri: 'crypto://market/overview',
        },
      },
      { timeout: 5000 }
    );
    return result;
  }

  async getPrompt(name: string) {
    const result = await this.client.request(
      {
        method: 'prompts/get',
        params: { name },
      },
      { timeout: 5000 }
    );
    return result;
  }

  async disconnect() {
    await this.client.close();
    console.log('Disconnected from Crypto MCP Server');
  }
}

async function main() {
  const client = new CryptoMcpClient();

  try {
    await client.connect();

    console.log('\n📊 Available Tools:');
    const tools = await client.listTools();
    console.log(JSON.stringify(tools, null, 2));

    console.log('\n💰 Bitcoin Price:');
    const btcPrice = await client.getCryptoPrice('BTC');
    console.log(JSON.stringify(btcPrice, null, 2));

    console.log('\n📈 Market Trends (24h):');
    const trends = await client.getMarketTrends('24h');
    console.log(JSON.stringify(trends, null, 2));

    console.log('\n🏦 Portfolio Analysis:');
    const portfolio = await client.analyzePortfolio([
      { symbol: 'BTC', amount: 0.5, purchasePrice: 45000 },
      { symbol: 'ETH', amount: 5, purchasePrice: 2800 },
      { symbol: 'SOL', amount: 100, purchasePrice: 120 },
    ]);
    console.log(JSON.stringify(portfolio, null, 2));

    console.log('\n🌾 DeFi Rates (Aave on Ethereum):');
    const defiRates = await client.getDefiRates('Aave', 'ethereum');
    console.log(JSON.stringify(defiRates, null, 2));

    console.log('\n🌍 Market Overview Resource:');
    const overview = await client.getMarketOverview();
    console.log(JSON.stringify(overview, null, 2));

    console.log('\n💡 Market Analysis Prompt:');
    const prompt = await client.getPrompt('market_analysis');
    console.log(JSON.stringify(prompt, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.disconnect();
  }
}

if (require.main === module) {
  main().catch(console.error);
}