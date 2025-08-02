import { getAddress } from 'viem';

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

export interface ConversationMemory {
  sessionId: string;
  messages: ChatMessage[];
  context: {
    topics: string[];
    mentionedTokens: Set<string>;
    userIntents: string[];
    lastActivity: Date;
  };
  summary?: string;
}

class ChatMemoryService {
  private readonly STORAGE_KEY_PREFIX = 'nyxusd_chat_';
  private readonly SESSION_STORAGE_KEY = 'nyxusd_session';
  private readonly PROFILE_STORAGE_KEY = 'nyxusd_profiles';
  private readonly MAX_MESSAGES_IN_MEMORY = 50;
  private readonly MAX_STORED_SESSIONS = 10;
  
  private currentSession: ConversationMemory | null = null;
  private userProfiles: Map<string, UserProfile> = new Map();

  constructor() {
    this.loadUserProfiles();
    this.initializeSession();
  }

  private initializeSession(): void {
    const sessionId = this.generateSessionId();
    this.currentSession = {
      sessionId,
      messages: [],
      context: {
        topics: [],
        mentionedTokens: new Set(),
        userIntents: [],
        lastActivity: new Date(),
      },
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadUserProfiles(): void {
    try {
      const stored = localStorage.getItem(this.PROFILE_STORAGE_KEY);
      if (stored) {
        const profiles = JSON.parse(stored);
        Object.entries(profiles).forEach(([address, profile]) => {
          this.userProfiles.set(address, profile as UserProfile);
        });
      }
    } catch (error) {
      console.error('Failed to load user profiles:', error);
    }
  }

  private saveUserProfiles(): void {
    try {
      const profiles: Record<string, UserProfile> = {};
      this.userProfiles.forEach((profile, address) => {
        profiles[address] = profile;
      });
      localStorage.setItem(this.PROFILE_STORAGE_KEY, JSON.stringify(profiles));
    } catch (error) {
      console.error('Failed to save user profiles:', error);
    }
  }

  public addMessage(message: ChatMessage): void {
    if (!this.currentSession) {
      this.initializeSession();
    }

    this.currentSession!.messages.push(message);
    this.currentSession!.context.lastActivity = new Date();

    // Extract context from message
    this.extractContext(message);

    // Trim messages if exceeding limit
    if (this.currentSession!.messages.length > this.MAX_MESSAGES_IN_MEMORY) {
      const trimCount = Math.floor(this.MAX_MESSAGES_IN_MEMORY / 3);
      this.currentSession!.messages = this.currentSession!.messages.slice(trimCount);
    }

    // Save to session storage
    this.saveCurrentSession();
  }

  private extractContext(message: ChatMessage): void {
    if (!this.currentSession) return;

    const content = message.content.toLowerCase();
    
    // Extract mentioned tokens
    const tokenPatterns = /\b(btc|bitcoin|eth|ethereum|sol|solana|bnb|usdt|usdc|dai|link|uni|aave|comp|mkr|snx|crv|sushi)\b/gi;
    const matches = content.match(tokenPatterns);
    if (matches) {
      matches.forEach(token => {
        this.currentSession!.context.mentionedTokens.add(token.toUpperCase());
      });
    }

    // Extract topics
    const topicKeywords = {
      'price': ['price', 'cost', 'worth', 'value'],
      'portfolio': ['portfolio', 'holdings', 'balance', 'assets'],
      'defi': ['defi', 'yield', 'farm', 'stake', 'liquidity', 'pool'],
      'market': ['market', 'trend', 'bull', 'bear', 'sentiment'],
      'technical': ['chart', 'indicator', 'resistance', 'support', 'ma', 'rsi'],
      'news': ['news', 'update', 'announcement', 'event'],
      'swap': ['swap', 'exchange', 'trade', 'convert'],
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        if (!this.currentSession!.context.topics.includes(topic)) {
          this.currentSession!.context.topics.push(topic);
        }
      }
    });

    // Extract user intents
    if (content.includes('?')) {
      this.currentSession!.context.userIntents.push('question');
    }
    if (content.includes('buy') || content.includes('sell')) {
      this.currentSession!.context.userIntents.push('trading');
    }
    if (content.includes('analyze') || content.includes('compare')) {
      this.currentSession!.context.userIntents.push('analysis');
    }
  }

  private saveCurrentSession(): void {
    if (!this.currentSession) return;

    try {
      const sessionKey = `${this.STORAGE_KEY_PREFIX}${this.currentSession.sessionId}`;
      sessionStorage.setItem(sessionKey, JSON.stringify(this.currentSession));
      
      // Also save a list of recent sessions
      const recentSessions = this.getRecentSessions();
      if (!recentSessions.includes(this.currentSession.sessionId)) {
        recentSessions.unshift(this.currentSession.sessionId);
        if (recentSessions.length > this.MAX_STORED_SESSIONS) {
          const removed = recentSessions.pop();
          if (removed) {
            sessionStorage.removeItem(`${this.STORAGE_KEY_PREFIX}${removed}`);
          }
        }
        sessionStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(recentSessions));
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  private getRecentSessions(): string[] {
    try {
      const stored = sessionStorage.getItem(this.SESSION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public loadSession(sessionId: string): ConversationMemory | null {
    try {
      const sessionKey = `${this.STORAGE_KEY_PREFIX}${sessionId}`;
      const stored = sessionStorage.getItem(sessionKey);
      if (stored) {
        const session = JSON.parse(stored);
        // Convert dates back to Date objects
        session.messages.forEach((msg: any) => {
          msg.timestamp = new Date(msg.timestamp);
        });
        session.context.lastActivity = new Date(session.context.lastActivity);
        session.context.mentionedTokens = new Set(session.context.mentionedTokens);
        return session;
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
    return null;
  }

  public getCurrentSession(): ConversationMemory | null {
    return this.currentSession;
  }

  public getRecentMessages(count: number = 10): ChatMessage[] {
    if (!this.currentSession) return [];
    return this.currentSession.messages.slice(-count);
  }

  public getConversationContext(): string {
    if (!this.currentSession || this.currentSession.messages.length === 0) {
      return '';
    }

    const recentMessages = this.getRecentMessages(5);
    const context = recentMessages
      .map(msg => `${msg.role}: ${msg.content.substring(0, 200)}`)
      .join('\n');

    const topics = this.currentSession.context.topics.join(', ');
    const tokens = Array.from(this.currentSession.context.mentionedTokens).join(', ');

    return `Recent conversation:\n${context}\n\nTopics discussed: ${topics}\nTokens mentioned: ${tokens}`;
  }

  public createOrUpdateUserProfile(walletAddress: string, updates?: Partial<UserProfile>): UserProfile {
    const normalizedAddress = getAddress(walletAddress);
    
    let profile = this.userProfiles.get(normalizedAddress);
    
    if (!profile) {
      profile = {
        walletAddress: normalizedAddress,
        preferences: {
          riskTolerance: 'moderate',
          experience: 'intermediate',
          interests: [],
          favoriteTokens: [],
        },
        history: {
          totalInteractions: 0,
          lastSeen: new Date(),
          firstSeen: new Date(),
          topQueries: [],
        },
      };
      this.userProfiles.set(normalizedAddress, profile);
    }

    if (updates) {
      // Deep merge updates
      if (updates.preferences) {
        profile.preferences = { ...profile.preferences, ...updates.preferences };
      }
      if (updates.portfolio) {
        profile.portfolio = { ...profile.portfolio, ...updates.portfolio };
      }
      if (updates.history) {
        profile.history = { ...profile.history, ...updates.history };
      }
    }

    profile.history.lastSeen = new Date();
    profile.history.totalInteractions++;

    this.saveUserProfiles();
    return profile;
  }

  public getUserProfile(walletAddress: string): UserProfile | null {
    try {
      const normalizedAddress = getAddress(walletAddress);
      return this.userProfiles.get(normalizedAddress) || null;
    } catch {
      return null;
    }
  }

  public updateUserPreferences(walletAddress: string, preferences: Partial<UserProfile['preferences']>): void {
    const profile = this.getUserProfile(walletAddress);
    if (profile) {
      profile.preferences = { ...profile.preferences, ...preferences };
      this.saveUserProfiles();
    }
  }

  public addToWatchlist(walletAddress: string, token: string): void {
    const profile = this.getUserProfile(walletAddress);
    if (profile) {
      if (!profile.portfolio) {
        profile.portfolio = { holdings: [], watchlist: [] };
      }
      if (!profile.portfolio.watchlist.includes(token)) {
        profile.portfolio.watchlist.push(token);
        this.saveUserProfiles();
      }
    }
  }

  public getMemoryPromptContext(walletAddress?: string): string {
    const sessionContext = this.getConversationContext();
    
    let userContext = '';
    if (walletAddress) {
      const profile = this.getUserProfile(walletAddress);
      if (profile) {
        userContext = `
User Profile:
- Wallet: ${profile.walletAddress.slice(0, 6)}...${profile.walletAddress.slice(-4)}
- Experience: ${profile.preferences.experience}
- Risk Tolerance: ${profile.preferences.riskTolerance}
- Interests: ${profile.preferences.interests.join(', ')}
- Favorite Tokens: ${profile.preferences.favoriteTokens.join(', ')}
- Total Interactions: ${profile.history.totalInteractions}
${profile.portfolio ? `- Watchlist: ${profile.portfolio.watchlist.join(', ')}` : ''}
`;
      }
    }

    return `${sessionContext}\n${userContext}`.trim();
  }

  public summarizeConversation(): string {
    if (!this.currentSession || this.currentSession.messages.length < 3) {
      return '';
    }

    const topics = this.currentSession.context.topics;
    const tokens = Array.from(this.currentSession.context.mentionedTokens);
    const messageCount = this.currentSession.messages.length;
    
    const userQuestions = this.currentSession.messages
      .filter(m => m.role === 'user' && m.content.includes('?'))
      .slice(-3)
      .map(m => m.content.substring(0, 100));

    return `Conversation summary (${messageCount} messages):
Topics: ${topics.join(', ')}
Tokens discussed: ${tokens.join(', ')}
Recent questions: ${userQuestions.join('; ')}`;
  }

  public clearSession(): void {
    if (this.currentSession) {
      const sessionKey = `${this.STORAGE_KEY_PREFIX}${this.currentSession.sessionId}`;
      sessionStorage.removeItem(sessionKey);
    }
    this.initializeSession();
  }

  public exportChatHistory(walletAddress?: string): any {
    const data: any = {
      currentSession: this.currentSession,
      exportDate: new Date().toISOString(),
    };

    if (walletAddress) {
      data.userProfile = this.getUserProfile(walletAddress);
    }

    const recentSessions = this.getRecentSessions();
    data.recentSessions = recentSessions.map(id => this.loadSession(id)).filter(Boolean);

    return data;
  }
}

export const chatMemoryService = new ChatMemoryService();