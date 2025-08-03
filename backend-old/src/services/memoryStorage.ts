import { kv } from '@vercel/kv';
import { put, list, del } from '@vercel/blob';
import { get as getEdgeConfig } from '@vercel/edge-config';
import type { ConversationMemory, UserProfile } from './chatMemoryService';

export interface MemoryStorage {
  getConversation(sessionId: string): Promise<ConversationMemory | null>;
  saveConversation(sessionId: string, memory: ConversationMemory): Promise<void>;
  getUserProfile(walletAddress: string): Promise<UserProfile | null>;
  saveUserProfile(walletAddress: string, profile: UserProfile): Promise<void>;
  archiveConversation(sessionId: string, memory: ConversationMemory): Promise<string>;
  getStaticContext(key: string): Promise<any>;
}

export class VercelMemoryStorage implements MemoryStorage {
  private readonly kvPrefix = {
    session: 'session:',
    profile: 'user:',
    context: 'ctx:',
  };

  private readonly ttl = {
    session: 3600 * 24, // 24 hours
    profile: 3600 * 24 * 30, // 30 days
    context: 3600 * 24 * 7, // 7 days
  };

  async getConversation(sessionId: string): Promise<ConversationMemory | null> {
    try {
      return await kv.get<ConversationMemory>(`${this.kvPrefix.session}${sessionId}`);
    } catch (error) {
      console.error('Failed to get conversation from KV:', error);
      return null;
    }
  }

  async saveConversation(sessionId: string, memory: ConversationMemory): Promise<void> {
    try {
      const key = `${this.kvPrefix.session}${sessionId}`;
      
      // Implement append-only pattern for better caching
      const existing = await this.getConversation(sessionId);
      if (existing) {
        // Merge messages in append-only fashion
        memory.messages = [...existing.messages, ...memory.messages.slice(existing.messages.length)];
      }
      
      await kv.set(key, memory, { ex: this.ttl.session });
      
      // Store context separately for stable prefix caching
      await kv.set(`${this.kvPrefix.context}${sessionId}`, memory.context, { ex: this.ttl.context });
    } catch (error) {
      console.error('Failed to save conversation to KV:', error);
      throw error;
    }
  }

  async getUserProfile(walletAddress: string): Promise<UserProfile | null> {
    try {
      return await kv.get<UserProfile>(`${this.kvPrefix.profile}${walletAddress}`);
    } catch (error) {
      console.error('Failed to get user profile from KV:', error);
      return null;
    }
  }

  async saveUserProfile(walletAddress: string, profile: UserProfile): Promise<void> {
    try {
      const key = `${this.kvPrefix.profile}${walletAddress}`;
      await kv.set(key, profile, { ex: this.ttl.profile });
    } catch (error) {
      console.error('Failed to save user profile to KV:', error);
      throw error;
    }
  }

  async archiveConversation(sessionId: string, memory: ConversationMemory): Promise<string> {
    try {
      // Compress conversation for long-term storage
      const compressed = this.compressMemory(memory);
      const timestamp = new Date().toISOString();
      const filename = `conversations/${sessionId}/${timestamp}.json`;
      
      const blob = await put(filename, JSON.stringify(compressed), {
        access: 'public',
        addRandomSuffix: false,
      });
      
      // Store reference in KV
      await kv.set(`archive:${sessionId}`, blob.url, { ex: this.ttl.profile });
      
      return blob.url;
    } catch (error) {
      console.error('Failed to archive conversation:', error);
      throw error;
    }
  }

  async getStaticContext(key: string): Promise<any> {
    try {
      // Use Edge Config for static, frequently-accessed context
      return await getEdgeConfig(key);
    } catch (error) {
      console.error('Failed to get static context:', error);
      return null;
    }
  }

  private compressMemory(memory: ConversationMemory): any {
    // Preserve critical metadata while compressing messages
    const compressed = {
      sessionId: memory.sessionId,
      context: memory.context,
      summary: memory.summary || this.generateSummary(memory.messages),
      messageCount: memory.messages.length,
      firstMessage: memory.messages[0],
      lastMessages: memory.messages.slice(-5), // Keep last 5 messages
      timestamp: new Date().toISOString(),
    };
    
    return compressed;
  }

  private generateSummary(messages: any[]): string {
    // Simple summary generation (in production, use AI)
    const topics = new Set<string>();
    const intents = new Set<string>();
    
    messages.forEach(msg => {
      if (msg.content?.includes('CDP')) topics.add('CDP');
      if (msg.content?.includes('yield')) topics.add('Yield Farming');
      if (msg.content?.includes('stake')) topics.add('Staking');
      if (msg.content?.includes('swap')) intents.add('swap');
      if (msg.content?.includes('deposit')) intents.add('deposit');
    });
    
    return `Topics: ${Array.from(topics).join(', ')}. Intents: ${Array.from(intents).join(', ')}`;
  }
}

// Fallback for local development
export class LocalMemoryStorage implements MemoryStorage {
  private memory = new Map<string, any>();

  async getConversation(sessionId: string): Promise<ConversationMemory | null> {
    return this.memory.get(`session:${sessionId}`) || null;
  }

  async saveConversation(sessionId: string, memory: ConversationMemory): Promise<void> {
    this.memory.set(`session:${sessionId}`, memory);
  }

  async getUserProfile(walletAddress: string): Promise<UserProfile | null> {
    return this.memory.get(`user:${walletAddress}`) || null;
  }

  async saveUserProfile(walletAddress: string, profile: UserProfile): Promise<void> {
    this.memory.set(`user:${walletAddress}`, profile);
  }

  async archiveConversation(sessionId: string, memory: ConversationMemory): Promise<string> {
    const archived = JSON.stringify(memory);
    this.memory.set(`archive:${sessionId}`, archived);
    return `local://archive/${sessionId}`;
  }

  async getStaticContext(key: string): Promise<any> {
    return this.memory.get(`config:${key}`) || null;
  }
}

// Factory function to get appropriate storage
export function getMemoryStorage(): MemoryStorage {
  const isProduction = process.env['NODE_ENV'] === 'production';
  const hasVercelKV = process.env['KV_REST_API_URL'] && process.env['KV_REST_API_TOKEN'];
  
  if (isProduction && hasVercelKV) {
    return new VercelMemoryStorage();
  }
  
  return new LocalMemoryStorage();
}