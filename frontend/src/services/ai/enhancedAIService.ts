import {
  ConversationStep,
  UserProfile,
  WalletData,
} from "../../providers/AIAssistantProvider";

export interface EnhancedAIRequest {
  message: string;
  sessionId: string;
  context: {
    conversationStep?: ConversationStep;
    userProfile?: Partial<UserProfile>;
    walletData?: Partial<WalletData>;
    memoryContext?: string;
    conversationSummary?: string;
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

export interface CryptoActionRequest {
  sessionId: string;
  action: 'price' | 'trends' | 'portfolio' | 'defi' | 'market_analysis';
  params?: {
    symbol?: string;
    timeframe?: string;
    holdings?: Array<{
      symbol: string;
      amount: number;
      purchasePrice?: number;
    }>;
    protocol?: string;
    chain?: string;
  };
}

export class EnhancedAIService {
  private baseUrl: string;
  private sessionId: string;
  private isProduction: boolean;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.sessionId = this.generateSessionId();
    // Check if we're in production (Vercel) or local development
    this.isProduction = import.meta.env.MODE === 'production' || window.location.hostname !== 'localhost';
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async sendMessage(
    message: string,
    context: EnhancedAIRequest['context'],
    enableCryptoTools: boolean = true
  ): Promise<EnhancedAIResponse> {
    try {
      // Use different endpoints for production (Vercel) vs local development
      const endpoint = this.isProduction 
        ? `${this.baseUrl}/chat`
        : `${this.baseUrl}/ai/enhanced/chat`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId: this.sessionId,
          context,
          enableCryptoTools,
        } as EnhancedAIRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Only log in development mode
      if (import.meta.env.MODE === 'development') {
        console.error('Failed to send message to enhanced AI:', error);
      }
      return {
        message: 'Sorry, I encountered an error processing your request.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async streamMessage(
    message: string,
    context: EnhancedAIRequest['context'],
    onChunk: (chunk: string) => void,
    enableCryptoTools: boolean = true
  ): Promise<void> {
    try {
      // For production, use the regular endpoint (no streaming support in Vercel functions)
      // For local, use the streaming endpoint
      const endpoint = this.isProduction
        ? `${this.baseUrl}/chat`
        : `${this.baseUrl}/ai/enhanced/chat/stream`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId: this.sessionId,
          context,
          enableCryptoTools,
        } as EnhancedAIRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // For production, just get the full response and call onChunk once
      if (this.isProduction) {
        const data = await response.json();
        if (data.message) {
          onChunk(data.message);
        }
        return;
      }

      // For local development, use streaming
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                onChunk(parsed.chunk);
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      // Only log in development mode
      if (import.meta.env.MODE === 'development') {
        console.error('Failed to stream message:', error);
      }
      throw error;
    }
  }

  async getCryptoPrice(symbol: string): Promise<EnhancedAIResponse> {
    return this.executeCryptoAction('price', { symbol });
  }

  async getMarketTrends(timeframe: string = '24h'): Promise<EnhancedAIResponse> {
    return this.executeCryptoAction('trends', { timeframe });
  }

  async analyzePortfolio(
    holdings: Array<{ symbol: string; amount: number; purchasePrice?: number }>
  ): Promise<EnhancedAIResponse> {
    return this.executeCryptoAction('portfolio', { holdings });
  }

  async getDefiOpportunities(chain?: string): Promise<EnhancedAIResponse> {
    return this.executeCryptoAction('defi', { chain });
  }

  async getMarketAnalysis(): Promise<EnhancedAIResponse> {
    return this.executeCryptoAction('market_analysis');
  }

  private async executeCryptoAction(
    action: CryptoActionRequest['action'],
    params?: CryptoActionRequest['params']
  ): Promise<EnhancedAIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/enhanced/crypto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          action,
          params,
        } as CryptoActionRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to execute crypto action ${action}:`, error);
      return {
        message: `Failed to execute ${action}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getPortfolioAnalysis(
    holdings: Array<{ symbol: string; amount: number; purchasePrice?: number }>
  ): Promise<EnhancedAIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/enhanced/portfolio/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          holdings,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get portfolio analysis:', error);
      return {
        message: 'Failed to analyze portfolio',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getDeFiOpportunities(chain?: string): Promise<EnhancedAIResponse> {
    try {
      const params = new URLSearchParams({
        sessionId: this.sessionId,
        ...(chain && { chain }),
      });

      const response = await fetch(`${this.baseUrl}/ai/enhanced/defi/opportunities?${params}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get DeFi opportunities:', error);
      return {
        message: 'Failed to fetch DeFi opportunities',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getMarketOverview(): Promise<EnhancedAIResponse> {
    try {
      const params = new URLSearchParams({
        sessionId: this.sessionId,
      });

      const response = await fetch(`${this.baseUrl}/ai/enhanced/market/analysis?${params}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get market overview:', error);
      return {
        message: 'Failed to fetch market analysis',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async resetSession(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/enhanced/reset/${this.sessionId}`, {
        method: 'POST',
      });

      if (response.ok) {
        this.sessionId = this.generateSessionId();
      }
    } catch (error) {
      console.error('Failed to reset session:', error);
    }
  }

  async checkHealth(): Promise<{
    status: string;
    service: string;
    openRouter: any;
    mcpConnection: any;
    integrationTest: boolean;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/enhanced/health`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to check health:', error);
      return {
        status: 'error',
        service: 'Enhanced AI',
        openRouter: null,
        mcpConnection: null,
        integrationTest: false,
      };
    }
  }

  async getAvailableTools(): Promise<{
    tools: Array<{
      name: string;
      description: string;
      params: string[];
    }>;
    mcp: {
      connected: boolean;
      server: string;
    };
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/enhanced/tools`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get available tools:', error);
      return {
        tools: [],
        mcp: {
          connected: false,
          server: 'unknown',
        },
      };
    }
  }

  getSessionId(): string {
    return this.sessionId;
  }

  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }
}

export const enhancedAIService = new EnhancedAIService();