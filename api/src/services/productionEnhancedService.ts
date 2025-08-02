import { ChatOpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { Tool } from 'langchain/tools';
import { openRouterService } from "./openRouterService";
import { cryptoService } from "./cryptoService";
import { aiLogger } from "../utils/logger";

export interface EnhancedAIContext {
  sessionId: string;
  userMessage: string;
  conversationStep?: string;
  userProfile?: {
    experience?: string;
    riskTolerance?: string;
    investmentGoals?: string[];
  };
  walletData?: {
    address?: string;
    balance?: number;
    holdings?: Array<{
      symbol: string;
      amount: number;
      purchasePrice?: number;
    }>;
  };
  enableCryptoTools?: boolean;
}

export interface EnhancedAIResponse {
  message: string;
  toolsUsed?: string[];
  cryptoData?: any;
  recommendations?: string[];
  analysis?: any;
  error?: string;
}

// Custom crypto tools for LangChain
class CryptoPriceTool extends Tool {
  name = 'crypto_price';
  description = 'Get current cryptocurrency price. Input should be a symbol like BTC or ETH.';

  async _call(input: string): Promise<string> {
    try {
      const result = await cryptoService.getCryptoPrice(input.trim());
      return JSON.stringify(result);
    } catch (error) {
      return JSON.stringify({ error: 'Failed to get price' });
    }
  }
}

class MarketTrendsTool extends Tool {
  name = 'market_trends';
  description = 'Get market trends. Input should be a timeframe like 1h, 24h, 7d, or 30d.';

  async _call(input: string): Promise<string> {
    try {
      const result = await cryptoService.getMarketTrends(input.trim());
      return JSON.stringify(result);
    } catch (error) {
      return JSON.stringify({ error: 'Failed to get trends' });
    }
  }
}

class PortfolioAnalysisTool extends Tool {
  name = 'portfolio_analysis';
  description = 'Analyze portfolio. Input should be JSON array of holdings with symbol and amount.';

  async _call(input: string): Promise<string> {
    try {
      const holdings = JSON.parse(input);
      const result = await cryptoService.analyzePortfolio(holdings);
      return JSON.stringify(result);
    } catch (error) {
      return JSON.stringify({ error: 'Failed to analyze portfolio' });
    }
  }
}

class DefiRatesTool extends Tool {
  name = 'defi_rates';
  description = 'Get DeFi rates. Input should be JSON with optional protocol and chain fields.';

  async _call(input: string): Promise<string> {
    try {
      const params = input ? JSON.parse(input) : {};
      const result = await cryptoService.getDefiRates(params.protocol, params.chain);
      return JSON.stringify(result);
    } catch (error) {
      return JSON.stringify({ error: 'Failed to get DeFi rates' });
    }
  }
}

export class ProductionEnhancedService {
  private memories: Map<string, BufferMemory> = new Map();
  private chains: Map<string, ConversationChain> = new Map();

  private getOrCreateMemory(sessionId: string): BufferMemory {
    if (!this.memories.has(sessionId)) {
      const memory = new BufferMemory({
        returnMessages: true,
        memoryKey: "chat_history",
      });
      this.memories.set(sessionId, memory);
    }
    return this.memories.get(sessionId)!;
  }

  private getCryptoTools(): Tool[] {
    return [
      new CryptoPriceTool(),
      new MarketTrendsTool(),
      new PortfolioAnalysisTool(),
      new DefiRatesTool(),
    ];
  }

  private async getOrCreateChain(sessionId: string, complexity: "low" | "medium" | "high" | "thinking"): Promise<ConversationChain> {
    const cacheKey = `${sessionId}_${complexity}`;
    
    if (!this.chains.has(cacheKey)) {
      const llm = openRouterService.createLLM({
        queryComplexity: complexity,
        temperature: 0.7,
        maxTokens: 1000,
      });

      const memory = this.getOrCreateMemory(sessionId);

      const chain = new ConversationChain({
        llm,
        memory,
        verbose: false,
      });

      this.chains.set(cacheKey, chain);
    }

    return this.chains.get(cacheKey)!;
  }

  async generateResponse(context: EnhancedAIContext): Promise<EnhancedAIResponse> {
    try {
      const complexity = openRouterService.analyzeQueryComplexity(
        context.userMessage,
        context
      );

      aiLogger.info('Processing enhanced AI request', {
        sessionId: context.sessionId,
        complexity,
        enableCryptoTools: context.enableCryptoTools,
      });

      // Check if we should use crypto tools
      if (context.enableCryptoTools && this.shouldUseCryptoTools(context.userMessage)) {
        return await this.generateCryptoResponse(context, complexity);
      } else {
        return await this.generateChainResponse(context, complexity);
      }
    } catch (error) {
      aiLogger.error('Failed to generate AI response', { error });
      return {
        message: 'I apologize, but I encountered an error processing your request. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private shouldUseCryptoTools(message: string): boolean {
    const cryptoKeywords = [
      'price', 'btc', 'eth', 'bitcoin', 'ethereum', 'crypto',
      'market', 'portfolio', 'defi', 'yield', 'apy', 'tvl',
      'trend', 'analysis', 'risk', 'diversification', 'holdings'
    ];

    const lowerMessage = message.toLowerCase();
    return cryptoKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private async generateCryptoResponse(
    context: EnhancedAIContext,
    complexity: "low" | "medium" | "high" | "thinking"
  ): Promise<EnhancedAIResponse> {
    try {
      const tools = this.getCryptoTools();
      const toolsUsed: string[] = [];
      let cryptoData: any = {};

      // Process crypto-specific queries
      const lowerMessage = context.userMessage.toLowerCase();
      
      if (lowerMessage.includes('price')) {
        // Extract symbol from message
        const symbols = ['BTC', 'ETH', 'SOL', 'MATIC', 'AVAX'];
        for (const symbol of symbols) {
          if (lowerMessage.includes(symbol.toLowerCase())) {
            const priceData = await cryptoService.getCryptoPrice(symbol);
            cryptoData.price = priceData;
            toolsUsed.push('crypto_price');
            break;
          }
        }
      }

      if (lowerMessage.includes('trend') || lowerMessage.includes('market')) {
        const trendData = await cryptoService.getMarketTrends('24h');
        cryptoData.trends = trendData;
        toolsUsed.push('market_trends');
      }

      if (lowerMessage.includes('portfolio') && context.walletData?.holdings) {
        const analysis = await cryptoService.analyzePortfolio(context.walletData.holdings);
        cryptoData.portfolio = analysis;
        toolsUsed.push('portfolio_analysis');
      }

      if (lowerMessage.includes('defi') || lowerMessage.includes('yield')) {
        const rates = await cryptoService.getDefiRates();
        cryptoData.defi = rates;
        toolsUsed.push('defi_rates');
      }

      // Generate response with context
      const chain = await this.getOrCreateChain(context.sessionId, complexity);
      const enrichedMessage = `${context.userMessage}\n\nData: ${JSON.stringify(cryptoData, null, 2)}`;
      
      const result = await chain.invoke({
        input: enrichedMessage,
      });

      return {
        message: result.response,
        toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
        cryptoData: Object.keys(cryptoData).length > 0 ? cryptoData : undefined,
      };
    } catch (error) {
      aiLogger.error('Crypto response generation failed', { error });
      return await this.generateChainResponse(context, complexity);
    }
  }

  private async generateChainResponse(
    context: EnhancedAIContext,
    complexity: "low" | "medium" | "high" | "thinking"
  ): Promise<EnhancedAIResponse> {
    const chain = await this.getOrCreateChain(context.sessionId, complexity);

    let input = context.userMessage;

    if (context.walletData && Object.keys(context.walletData).length > 0) {
      input += `\n\n[Wallet Context: ${JSON.stringify(context.walletData)}]`;
    }

    if (context.userProfile) {
      input += `\n\n[User Profile: ${JSON.stringify(context.userProfile)}]`;
    }

    const result = await chain.invoke({
      input,
    });

    return {
      message: result.response,
    };
  }

  async streamResponse(
    context: EnhancedAIContext,
    onChunk: (chunk: string) => void
  ): Promise<EnhancedAIResponse> {
    try {
      const complexity = openRouterService.analyzeQueryComplexity(
        context.userMessage,
        context
      );

      const llm = openRouterService.createLLM({
        queryComplexity: complexity,
        temperature: 0.7,
        maxTokens: 1000,
        streaming: true,
      });

      const memory = this.getOrCreateMemory(context.sessionId);

      const chain = new ConversationChain({
        llm,
        memory,
      });

      let fullResponse = '';
      
      const result = await chain.invoke(
        { input: context.userMessage },
        {
          callbacks: [
            {
              handleLLMNewToken: (token: string) => {
                fullResponse += token;
                onChunk(token);
              },
            },
          ],
        }
      );

      return {
        message: fullResponse || result.response,
      };
    } catch (error) {
      aiLogger.error('Failed to stream response', { error });
      return {
        message: 'Failed to generate streaming response.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  clearSession(sessionId: string): void {
    const complexities = ["low", "medium", "high", "thinking"];
    
    complexities.forEach(complexity => {
      const cacheKey = `${sessionId}_${complexity}`;
      this.chains.delete(cacheKey);
    });
    
    this.memories.delete(sessionId);
    openRouterService.clearMemory(sessionId);
    
    aiLogger.info(`Cleared session: ${sessionId}`);
  }

  async getServiceStatus(): Promise<any> {
    return {
      openRouter: openRouterService.getServiceInfo(),
      cryptoService: { connected: true, cached: true },
      activeSessions: this.memories.size,
    };
  }

  async testIntegration(): Promise<boolean> {
    const openRouterOk = await openRouterService.testConnection();
    return openRouterOk;
  }
}

export const productionEnhancedService = new ProductionEnhancedService();