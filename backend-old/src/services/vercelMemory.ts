import { kv } from '@vercel/kv';
import { put, list, del } from '@vercel/blob';
import { get as getEdgeConfig } from '@vercel/edge-config';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    toolsUsed?: string[];
    cryptoData?: any;
    recommendations?: string[];
    tokens?: {
      mentioned?: string[];
      prices?: Record<string, number>;
    };
  };
}

export interface ConversationContext {
  topics: string[];
  mentionedTokens: string[];
  userIntents: string[];
  lastActivity: Date;
  errorTraces?: Array<{
    error: string;
    timestamp: Date;
    context: string;
  }>;
}

export interface UserProfile {
  walletAddress: string;
  preferences: {
    riskTolerance: 'low' | 'moderate' | 'high';
    experience: 'beginner' | 'intermediate' | 'advanced';
    interests: string[];
    favoriteTokens: string[];
    defaultChain?: string;
  };
  history: {
    totalInteractions: number;
    lastSeen: Date;
    firstSeen: Date;
    topQueries: string[];
  };
  portfolio?: {
    holdings: Array<{
      symbol: string;
      amount: number;
      chain?: string;
    }>;
    watchlist: string[];
  };
}

export class VercelMemoryService {
  private readonly MAX_MESSAGES = 50;
  private readonly CONTEXT_WINDOW = 10; // Recent messages for context
  
  // KV cache-friendly stable prefixes
  private readonly PREFIXES = {
    session: 'sess:',
    profile: 'user:',
    context: 'ctx:',
    archive: 'arch:',
    error: 'err:',
  } as const;

  // TTL settings (in seconds)
  private readonly TTL = {
    session: 86400, // 24 hours
    profile: 2592000, // 30 days
    context: 604800, // 7 days
    error: 259200, // 3 days
  } as const;

  // Append-only message addition
  async appendMessage(sessionId: string, message: ChatMessage): Promise<void> {
    const key = `${this.PREFIXES.session}${sessionId}`;
    
    try {
      // Get existing messages (or initialize)
      const messages = await kv.get<ChatMessage[]>(key) || [];
      
      // Append new message (maintaining immutability)
      const updatedMessages = [...messages, message];
      
      // Trim if exceeds max (keep most recent)
      const trimmed = updatedMessages.slice(-this.MAX_MESSAGES);
      
      // Save back to KV with TTL
      await kv.set(key, trimmed, { ex: this.TTL.session });
      
      // Update context separately (for stable caching)
      await this.updateContext(sessionId, message);
    } catch (error) {
      console.error('Failed to append message:', error);
      // Store error for learning
      await this.storeError(sessionId, error as Error, 'appendMessage');
    }
  }

  // Update conversation context (separate from messages for caching)
  private async updateContext(sessionId: string, message: ChatMessage): Promise<void> {
    const key = `${this.PREFIXES.context}${sessionId}`;
    
    try {
      const context = await kv.get<ConversationContext>(key) || this.initContext();
      
      // Extract context from message
      const tokens = this.extractTokens(message.content);
      const topics = this.extractTopics(message.content);
      const intents = this.extractIntents(message.content);
      
      // Update context (append-only pattern)
      context.mentionedTokens = [...new Set([...context.mentionedTokens, ...tokens])];
      context.topics = [...new Set([...context.topics, ...topics])];
      context.userIntents = [...new Set([...context.userIntents, ...intents])];
      context.lastActivity = new Date();
      
      await kv.set(key, context, { ex: this.TTL.context });
    } catch (error) {
      console.error('Failed to update context:', error);
    }
  }

  // Get recent context for AI prompt (optimized for KV cache)
  async getPromptContext(sessionId: string): Promise<string> {
    try {
      // Get static context from Edge Config (instant global reads)
      const staticContext = await getEdgeConfig('aiPromptContext') || {};
      
      // Get conversation context
      const contextKey = `${this.PREFIXES.context}${sessionId}`;
      const context = await kv.get<ConversationContext>(contextKey);
      
      // Get recent messages (for immediate context)
      const messagesKey = `${this.PREFIXES.session}${sessionId}`;
      const messages = await kv.get<ChatMessage[]>(messagesKey) || [];
      const recentMessages = messages.slice(-this.CONTEXT_WINDOW);
      
      // Get error traces for learning
      const errorKey = `${this.PREFIXES.error}${sessionId}`;
      const errors = await kv.get<any[]>(errorKey) || [];
      
      // Build stable prompt prefix (for KV caching)
      return this.buildPromptContext({
        static: staticContext,
        context,
        recentMessages,
        errors: errors.slice(-3), // Last 3 errors
      });
    } catch (error) {
      console.error('Failed to get prompt context:', error);
      return '';
    }
  }

  // Store user profile with smart merging
  async saveUserProfile(walletAddress: string, updates: Partial<UserProfile>): Promise<void> {
    const key = `${this.PREFIXES.profile}${walletAddress}`;
    
    try {
      const existing = await kv.get<UserProfile>(key);
      
      // Merge updates (append-only for arrays)
      const profile: UserProfile = existing ? {
        ...existing,
        ...updates,
        preferences: {
          ...existing.preferences,
          ...(updates.preferences || {}),
          interests: [...new Set([
            ...(existing.preferences?.interests || []),
            ...(updates.preferences?.interests || [])
          ])],
          favoriteTokens: [...new Set([
            ...(existing.preferences?.favoriteTokens || []),
            ...(updates.preferences?.favoriteTokens || [])
          ])],
        },
        history: {
          ...existing.history,
          ...(updates.history || {}),
          totalInteractions: (existing.history?.totalInteractions || 0) + 1,
          lastSeen: new Date(),
        },
      } : updates as UserProfile;
      
      await kv.set(key, profile, { ex: this.TTL.profile });
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }
  }

  // Archive conversation to Blob Storage
  async archiveConversation(sessionId: string): Promise<string> {
    try {
      const messages = await kv.get<ChatMessage[]>(`${this.PREFIXES.session}${sessionId}`);
      const context = await kv.get<ConversationContext>(`${this.PREFIXES.context}${sessionId}`);
      
      if (!messages || messages.length === 0) {
        throw new Error('No conversation to archive');
      }
      
      // Compress for storage
      const compressed = this.compressConversation(messages, context);
      
      // Store in Blob
      const timestamp = new Date().toISOString();
      const blob = await put(
        `conversations/${sessionId}/${timestamp}.json`,
        JSON.stringify(compressed),
        { access: 'public' }
      );
      
      // Store reference in KV
      await kv.set(`${this.PREFIXES.archive}${sessionId}`, blob.url, { ex: this.TTL.profile });
      
      // Clean up active session
      await kv.del(`${this.PREFIXES.session}${sessionId}`);
      await kv.del(`${this.PREFIXES.context}${sessionId}`);
      
      return blob.url;
    } catch (error) {
      console.error('Failed to archive conversation:', error);
      throw error;
    }
  }

  // Store errors for learning
  private async storeError(sessionId: string, error: Error, context: string): Promise<void> {
    const key = `${this.PREFIXES.error}${sessionId}`;
    
    try {
      const errors = await kv.get<any[]>(key) || [];
      errors.push({
        error: error.message,
        stack: error.stack,
        timestamp: new Date(),
        context,
      });
      
      // Keep last 10 errors
      await kv.set(key, errors.slice(-10), { ex: this.TTL.error });
    } catch (err) {
      console.error('Failed to store error:', err);
    }
  }

  // Helper methods
  private initContext(): ConversationContext {
    return {
      topics: [],
      mentionedTokens: [],
      userIntents: [],
      lastActivity: new Date(),
      errorTraces: [],
    };
  }

  private extractTokens(content: string): string[] {
    const tokenPattern = /\b(ETH|BTC|USDC|USDT|DAI|WETH|MATIC|ARB|OP|NYXUSD)\b/gi;
    return [...new Set((content.match(tokenPattern) || []).map(t => t.toUpperCase()))];
  }

  private extractTopics(content: string): string[] {
    const topics: string[] = [];
    if (/\b(yield|farm|apy|apr)\b/i.test(content)) topics.push('yield-farming');
    if (/\b(stake|staking)\b/i.test(content)) topics.push('staking');
    if (/\b(swap|exchange|trade)\b/i.test(content)) topics.push('trading');
    if (/\b(cdp|collateral|borrow|loan)\b/i.test(content)) topics.push('cdp');
    if (/\b(bridge|cross-chain)\b/i.test(content)) topics.push('bridging');
    return topics;
  }

  private extractIntents(content: string): string[] {
    const intents: string[] = [];
    if (/\b(how|what|explain|tell)\b/i.test(content)) intents.push('inquiry');
    if (/\b(swap|convert|exchange)\b/i.test(content)) intents.push('swap');
    if (/\b(stake|deposit|provide)\b/i.test(content)) intents.push('deposit');
    if (/\b(withdraw|unstake|remove)\b/i.test(content)) intents.push('withdraw');
    if (/\b(best|highest|optimal)\b/i.test(content)) intents.push('optimize');
    return intents;
  }

  private buildPromptContext(data: any): string {
    // Build stable, cache-friendly prompt prefix
    const parts: string[] = [];
    
    // Static context (from Edge Config)
    if (data.static?.systemPrompt) {
      parts.push(data.static.systemPrompt);
    }
    
    // User context
    if (data.context) {
      parts.push(`Topics discussed: ${data.context.topics.join(', ')}`);
      parts.push(`Tokens mentioned: ${data.context.mentionedTokens.join(', ')}`);
      parts.push(`User intents: ${data.context.userIntents.join(', ')}`);
    }
    
    // Error context for learning
    if (data.errors?.length > 0) {
      parts.push('Previous errors to avoid:');
      data.errors.forEach((err: any) => {
        parts.push(`- ${err.context}: ${err.error}`);
      });
    }
    
    // Recent conversation
    if (data.recentMessages?.length > 0) {
      parts.push('\nRecent conversation:');
      data.recentMessages.forEach((msg: ChatMessage) => {
        parts.push(`${msg.role}: ${msg.content.substring(0, 200)}`);
      });
    }
    
    return parts.join('\n');
  }

  private compressConversation(messages: ChatMessage[], context: ConversationContext | null): any {
    // Preserve metadata while compressing content
    return {
      sessionMetadata: {
        messageCount: messages.length,
        startTime: messages[0]?.timestamp,
        endTime: messages[messages.length - 1]?.timestamp,
      },
      context: context || this.initContext(),
      summary: this.generateSummary(messages),
      keyMessages: [
        messages[0], // First message
        ...messages.filter(m => m.metadata?.isSwap), // Swap messages
        ...messages.slice(-5), // Last 5 messages
      ],
      allTokensMentioned: [...new Set(messages.flatMap(m => m.metadata?.tokens?.mentioned || []))],
      allTopics: context?.topics || [],
    };
  }

  private generateSummary(messages: ChatMessage[]): string {
    // Simple summary (in production, use AI)
    const userMessages = messages.filter(m => m.role === 'user');
    const swaps = messages.filter(m => m.metadata?.isSwap).length;
    const tokens = [...new Set(messages.flatMap(m => m.metadata?.tokens?.mentioned || []))];
    
    return `Conversation with ${userMessages.length} user messages, ${swaps} swaps discussed, tokens: ${tokens.join(', ')}`;
  }
}

// Export singleton instance
export const vercelMemory = new VercelMemoryService();