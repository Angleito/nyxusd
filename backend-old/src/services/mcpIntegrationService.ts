import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn, ChildProcess } from 'child_process';
import { Tool } from 'langchain/tools';
import { aiLogger } from '../utils/logger.js';
import path from 'path';

export interface MCPToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface CryptoToolParams {
  symbol?: string;
  timeframe?: string;
  holdings?: Array<{
    symbol: string;
    amount: number;
    purchasePrice?: number;
  }>;
  protocol?: string;
  chain?: string;
}

class MCPCryptoTool extends Tool {
  name: string;
  description: string;
  private mcpClient: MCPIntegrationService;
  private toolName: string;

  constructor(
    name: string,
    description: string,
    mcpClient: MCPIntegrationService,
    toolName: string
  ) {
    super();
    this.name = name;
    this.description = description;
    this.mcpClient = mcpClient;
    this.toolName = toolName;
  }

  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const result = await this.mcpClient.callTool(this.toolName, params);
      return JSON.stringify(result);
    } catch (error) {
      aiLogger.error(`MCP tool ${this.name} failed`, { error });
      return JSON.stringify({
        error: error instanceof Error ? error.message : 'Tool execution failed',
      });
    }
  }
}

export class MCPIntegrationService {
  private client: Client | null = null;
  private serverProcess: ChildProcess | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;

  constructor() {
    this.client = new Client(
      {
        name: 'nyx-ai-assistant',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );
  }

  async connect(): Promise<boolean> {
    if (this.isConnected) {
      return true;
    }

    try {
      const serverPath = path.join(
        process.cwd(),
        'dist/mcp/cryptoMcpServer.js'
      );

      this.serverProcess = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          NODE_ENV: 'production',
        },
      });

      this.serverProcess.stderr?.on('data', (data) => {
        aiLogger.info(`MCP Server: ${data.toString()}`);
      });

      this.serverProcess.on('error', (error) => {
        aiLogger.error('MCP Server process error', { error });
        this.handleDisconnection();
      });

      this.serverProcess.on('exit', (code) => {
        aiLogger.info(`MCP Server exited with code ${code}`);
        this.handleDisconnection();
      });

      const transport = new StdioClientTransport({
        child: this.serverProcess,
      });

      await this.client!.connect(transport);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      aiLogger.info('Connected to MCP Crypto Server');
      return true;
    } catch (error) {
      aiLogger.error('Failed to connect to MCP server', { error });
      await this.handleReconnection();
      return false;
    }
  }

  private async handleDisconnection() {
    this.isConnected = false;
    if (this.serverProcess && !this.serverProcess.killed) {
      this.serverProcess.kill();
    }
    this.serverProcess = null;
    await this.handleReconnection();
  }

  private async handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      aiLogger.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    
    aiLogger.info(`Attempting reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(async () => {
      await this.connect();
    }, delay);
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.close();
    }
    if (this.serverProcess && !this.serverProcess.killed) {
      this.serverProcess.kill();
    }
    this.isConnected = false;
    this.serverProcess = null;
    aiLogger.info('Disconnected from MCP server');
  }

  async callTool(toolName: string, params: CryptoToolParams): Promise<MCPToolResult> {
    if (!this.isConnected) {
      await this.connect();
    }

    if (!this.client || !this.isConnected) {
      return {
        success: false,
        error: 'MCP client not connected',
      };
    }

    try {
      const result = await this.client.request(
        {
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: params,
          },
        },
        { timeout: 10000 }
      );

      const content = result.content?.[0];
      if (content?.type === 'text') {
        return {
          success: true,
          data: JSON.parse(content.text),
        };
      }

      return {
        success: false,
        error: 'Invalid response format from MCP server',
      };
    } catch (error) {
      aiLogger.error(`MCP tool call failed: ${toolName}`, { error, params });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Tool execution failed',
      };
    }
  }

  async getCryptoPrice(symbol: string): Promise<MCPToolResult> {
    return this.callTool('get_crypto_price', { symbol });
  }

  async getMarketTrends(timeframe: string = '24h'): Promise<MCPToolResult> {
    return this.callTool('get_market_trends', { timeframe });
  }

  async analyzePortfolio(holdings: CryptoToolParams['holdings']): Promise<MCPToolResult> {
    return this.callTool('analyze_portfolio', { holdings });
  }

  async getDefiRates(protocol?: string, chain?: string): Promise<MCPToolResult> {
    return this.callTool('get_defi_rates', { 
      protocol: protocol || 'all', 
      chain: chain || 'all' 
    });
  }

  async getResource(uri: string): Promise<MCPToolResult> {
    if (!this.isConnected) {
      await this.connect();
    }

    if (!this.client || !this.isConnected) {
      return {
        success: false,
        error: 'MCP client not connected',
      };
    }

    try {
      const result = await this.client.request(
        {
          method: 'resources/read',
          params: { uri },
        },
        { timeout: 5000 }
      );

      const content = result.contents?.[0];
      if (content?.text) {
        return {
          success: true,
          data: JSON.parse(content.text),
        };
      }

      return {
        success: false,
        error: 'Invalid resource format',
      };
    } catch (error) {
      aiLogger.error(`Failed to read MCP resource: ${uri}`, { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Resource read failed',
      };
    }
  }

  async getPrompt(name: string): Promise<MCPToolResult> {
    if (!this.isConnected) {
      await this.connect();
    }

    if (!this.client || !this.isConnected) {
      return {
        success: false,
        error: 'MCP client not connected',
      };
    }

    try {
      const result = await this.client.request(
        {
          method: 'prompts/get',
          params: { name },
        },
        { timeout: 5000 }
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      aiLogger.error(`Failed to get MCP prompt: ${name}`, { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Prompt retrieval failed',
      };
    }
  }

  getLangChainTools(): Tool[] {
    const tools: Tool[] = [];

    tools.push(
      new MCPCryptoTool(
        'crypto_price',
        'Get current cryptocurrency price and market data. Input should be JSON with "symbol" field.',
        this,
        'get_crypto_price'
      )
    );

    tools.push(
      new MCPCryptoTool(
        'market_trends',
        'Get crypto market trends and sentiment. Input should be JSON with optional "timeframe" field (1h, 24h, 7d, 30d).',
        this,
        'get_market_trends'
      )
    );

    tools.push(
      new MCPCryptoTool(
        'portfolio_analysis',
        'Analyze crypto portfolio for risk and recommendations. Input should be JSON with "holdings" array containing objects with symbol, amount, and optional purchasePrice.',
        this,
        'analyze_portfolio'
      )
    );

    tools.push(
      new MCPCryptoTool(
        'defi_rates',
        'Get DeFi yield rates across protocols. Input should be JSON with optional "protocol" and "chain" fields.',
        this,
        'get_defi_rates'
      )
    );

    return tools;
  }

  async getMarketOverview(): Promise<MCPToolResult> {
    return this.getResource('crypto://market/overview');
  }

  async getTop100Prices(): Promise<MCPToolResult> {
    return this.getResource('crypto://prices/top100');
  }

  async getDefiTVL(): Promise<MCPToolResult> {
    return this.getResource('crypto://defi/tvl');
  }

  async getBitcoinHistory(): Promise<MCPToolResult> {
    return this.getResource('crypto://history/btc');
  }

  async getAnalysisPrompt(type: 'market_analysis' | 'portfolio_review' | 'defi_opportunities' | 'risk_assessment'): Promise<MCPToolResult> {
    return this.getPrompt(type);
  }

  getConnectionStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    serverRunning: boolean;
  } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      serverRunning: this.serverProcess !== null && !this.serverProcess.killed,
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.getCryptoPrice('BTC');
      return result.success;
    } catch (error) {
      return false;
    }
  }
}

export const mcpIntegration = new MCPIntegrationService();