import { ChatOpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { openRouterService } from "./openRouterService.js";
import { mcpIntegration } from "./mcpIntegrationService.js";
import { aiLogger } from "../utils/logger.js";

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

export class EnhancedOpenRouterService {
  private agents: Map<string, AgentExecutor> = new Map();
  private memories: Map<string, BufferMemory> = new Map();
  private chains: Map<string, ConversationChain> = new Map();

  constructor() {
    this.initialize();
  }

  private async initialize() {
    await mcpIntegration.connect();
    aiLogger.info('Enhanced OpenRouter Service initialized with MCP integration');
  }

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

  private async getOrCreateAgent(sessionId: string, complexity: "low" | "medium" | "high" | "thinking"): Promise<AgentExecutor> {
    const cacheKey = `${sessionId}_${complexity}`;
    
    if (!this.agents.has(cacheKey)) {
      const llm = openRouterService.createLLM({
        queryComplexity: complexity,
        temperature: 0.7,
        maxTokens: 1000,
      });

      const tools = mcpIntegration.getLangChainTools();
      const memory = this.getOrCreateMemory(sessionId);

      const prompt = ChatPromptTemplate.fromMessages([
        ["system", `You are Nyx, a concise and action-oriented crypto assistant.

Available Tools:
- crypto_price: Get current cryptocurrency prices
- market_trends: Analyze market sentiment and trends
- portfolio_analysis: Evaluate portfolio risk and performance
- defi_rates: Find DeFi yield opportunities

Guidelines:
1. Be extremely concise - prefer actions over explanations
2. When users want to swap/trade, immediately provide the interface
3. Skip unnecessary questions - use reasonable defaults
4. Only ask for clarification if absolutely critical
5. Prioritize user action over information gathering
6. For swaps: Show interface first, explain later if needed`],
        new MessagesPlaceholder("chat_history"),
        ["human", "{input}"],
        new MessagesPlaceholder("agent_scratchpad"),
      ]);

      const agent = await createOpenAIFunctionsAgent({
        llm,
        tools,
        prompt,
      });

      const executor = new AgentExecutor({
        agent,
        tools,
        memory,
        verbose: true,
        returnIntermediateSteps: true,
        maxIterations: 3,
      });

      this.agents.set(cacheKey, executor);
    }

    return this.agents.get(cacheKey)!;
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
        verbose: true,
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

      aiLogger.info('Processing AI request', {
        sessionId: context.sessionId,
        complexity,
        enableCryptoTools: context.enableCryptoTools,
      });

      if (context.enableCryptoTools && this.shouldUseCryptoTools(context.userMessage)) {
        return await this.generateAgentResponse(context, complexity);
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
      'trend', 'analysis', 'risk', 'diversification', 'holdings',
      'investment', 'rates', 'protocol', 'chain', 'token'
    ];

    const lowerMessage = message.toLowerCase();
    return cryptoKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private async generateAgentResponse(
    context: EnhancedAIContext,
    complexity: "low" | "medium" | "high" | "thinking"
  ): Promise<EnhancedAIResponse> {
    const agent = await this.getOrCreateAgent(context.sessionId, complexity);

    let input = context.userMessage;

    if (context.walletData?.holdings && context.walletData.holdings.length > 0) {
      input += `\n\nUser's current portfolio: ${JSON.stringify(context.walletData.holdings)}`;
    }

    if (context.userProfile) {
      input += `\n\nUser profile: Experience: ${context.userProfile.experience}, Risk tolerance: ${context.userProfile.riskTolerance}`;
    }

    const result = await agent.invoke({
      input,
    });

    const toolsUsed: string[] = [];
    let cryptoData: any = {};
    const recommendations: string[] = [];

    if (result.intermediateSteps) {
      for (const step of result.intermediateSteps) {
        if (step.action) {
          toolsUsed.push(step.action.tool);
          
          if (step.observation) {
            try {
              const data = JSON.parse(step.observation);
              cryptoData[step.action.tool] = data;
              
              if (data.recommendations) {
                recommendations.push(...data.recommendations);
              }
            } catch (e) {
              // Not JSON, skip
            }
          }
        }
      }
    }

    return {
      message: result.output,
      toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
      cryptoData: Object.keys(cryptoData).length > 0 ? cryptoData : undefined,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
    };
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

  async getMarketAnalysis(sessionId: string): Promise<EnhancedAIResponse> {
    try {
      const promptResult = await mcpIntegration.getAnalysisPrompt('market_analysis');
      
      if (!promptResult.success || !promptResult.data) {
        throw new Error('Failed to get market analysis prompt');
      }

      const prompt = promptResult.data.messages[0].content.text;
      
      return await this.generateResponse({
        sessionId,
        userMessage: prompt,
        enableCryptoTools: true,
      });
    } catch (error) {
      aiLogger.error('Failed to get market analysis', { error });
      return {
        message: 'Unable to generate market analysis at this time.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getPortfolioReview(
    sessionId: string,
    holdings: Array<{ symbol: string; amount: number; purchasePrice?: number }>
  ): Promise<EnhancedAIResponse> {
    try {
      const analysisResult = await mcpIntegration.analyzePortfolio(holdings);
      
      if (!analysisResult.success || !analysisResult.data) {
        throw new Error('Failed to analyze portfolio');
      }

      const promptResult = await mcpIntegration.getAnalysisPrompt('portfolio_review');
      
      if (!promptResult.success || !promptResult.data) {
        throw new Error('Failed to get portfolio review prompt');
      }

      return {
        message: `Based on your portfolio analysis:\n\n${JSON.stringify(analysisResult.data, null, 2)}`,
        cryptoData: analysisResult.data,
        recommendations: analysisResult.data.recommendations,
        analysis: analysisResult.data,
      };
    } catch (error) {
      aiLogger.error('Failed to get portfolio review', { error });
      return {
        message: 'Unable to review portfolio at this time.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getDefiOpportunities(sessionId: string, chain?: string): Promise<EnhancedAIResponse> {
    try {
      const ratesResult = await mcpIntegration.getDefiRates(undefined, chain);
      
      if (!ratesResult.success || !ratesResult.data) {
        throw new Error('Failed to get DeFi rates');
      }

      const sortedRates = ratesResult.data.sort((a: any, b: any) => b.apy - a.apy);
      const topRates = sortedRates.slice(0, 5);

      return {
        message: `Top DeFi opportunities${chain ? ` on ${chain}` : ''}:\n\n${topRates.map((r: any) => 
          `${r.protocol} (${r.chain}): ${r.apy.toFixed(2)}% APY - Risk: ${r.risk}`
        ).join('\n')}`,
        cryptoData: { defi_rates: topRates },
        recommendations: topRates.map((r: any) => 
          `Consider ${r.protocol} on ${r.chain} for ${r.apy.toFixed(2)}% yield (${r.risk} risk)`
        ),
      };
    } catch (error) {
      aiLogger.error('Failed to get DeFi opportunities', { error });
      return {
        message: 'Unable to fetch DeFi opportunities at this time.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
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
      this.agents.delete(cacheKey);
      this.chains.delete(cacheKey);
    });
    
    this.memories.delete(sessionId);
    openRouterService.clearMemory(sessionId);
    
    aiLogger.info(`Cleared session: ${sessionId}`);
  }

  async getServiceStatus(): Promise<{
    openRouter: any;
    mcpConnection: any;
    activeSessions: number;
  }> {
    return {
      openRouter: openRouterService.getServiceInfo(),
      mcpConnection: mcpIntegration.getConnectionStatus(),
      activeSessions: this.memories.size,
    };
  }

  async testIntegration(): Promise<boolean> {
    const openRouterOk = await openRouterService.testConnection();
    const mcpOk = await mcpIntegration.testConnection();
    
    return openRouterOk && mcpOk;
  }
}

export const enhancedAIService = new EnhancedOpenRouterService();