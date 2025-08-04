interface SwapIntent {
  isSwapIntent: boolean;
  confidence: number;
  inputToken?: string;
  outputToken?: string;
  amount?: string;
  isPercentage?: boolean;
  missingParams?: string[];
}

interface TokenMapping {
  symbol: string;
  address: string;
  decimals: number;
}

// Import the token service for dynamic token fetching
import { tokenService } from './tokenService';

// Common Base chain token mappings
const BASE_TOKENS: Record<string, TokenMapping> = {
  'ETH': {
    symbol: 'ETH',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18
  },
  'WETH': {
    symbol: 'WETH',
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18
  },
  'USDC': {
    symbol: 'USDC',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6
  },
  'USDT': {
    symbol: 'USDT',
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    decimals: 6
  },
  'DAI': {
    symbol: 'DAI',
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    decimals: 18
  },
  'USDC.E': {
    symbol: 'USDbC',
    address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    decimals: 6
  },
  'AERO': {
    symbol: 'AERO',
    address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
    decimals: 18
  },
  'BRETT': {
    symbol: 'BRETT',
    address: '0x532f27101965dd16442E59d40670FaF5ebb142E4',
    decimals: 18
  },
  'DEGEN': {
    symbol: 'DEGEN',
    address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
    decimals: 18
  },
  'HIGHER': {
    symbol: 'HIGHER',
    address: '0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe',
    decimals: 18
  },
  'MORPHO': {
    symbol: 'MORPHO',
    address: '0xbaa5cc21fd487b8fcc2f632f3f4e8d37262a0842',
    decimals: 18
  }
};

export class SwapDetectionService {
  private static instance: SwapDetectionService;

  static getInstance(): SwapDetectionService {
    if (!SwapDetectionService.instance) {
      SwapDetectionService.instance = new SwapDetectionService();
    }
    return SwapDetectionService.instance;
  }

  /**
   * Detect swap intent from user message (async version with dynamic tokens)
   */
  async detectSwapIntentAsync(message: string): Promise<SwapIntent> {
    const lowerMessage = message.toLowerCase();
    
    // Get available tokens dynamically
    const availableTokens = await this.getAvailableTokens();
    const tokenPattern = new RegExp(
      `\\b(${availableTokens.join('|').toLowerCase()})\\b.*\\b(to|for|into|->|→)\\b.*\\b(${availableTokens.join('|').toLowerCase()})\\b`,
      'i'
    );
    const swapPhrasePattern = new RegExp(
      `\\b(${availableTokens.join('|').toLowerCase()})\\b`,
      'i'
    );
    
    // Check for explicit swap keywords - be more strict
    const explicitSwapKeywords = ['swap', 'exchange', 'convert', 'trade'];
    const buyBellKeywords = ['buy', 'sell'];
    const hasExplicitSwapKeyword = explicitSwapKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasBuySellKeyword = buyBellKeywords.some(keyword => lowerMessage.includes(keyword));
    
    // Check for token-to-token patterns
    const hasTokenPattern = tokenPattern.test(lowerMessage);
    
    // More specific swap phrases that clearly indicate trading intent
    const specificSwapPhrases = [
      'want to swap',
      'need to swap',
      'looking to swap', 
      'i want to trade',
      'i need to trade',
      'want to exchange',
      'need to exchange'
    ];
    const hasSpecificSwapPhrase = specificSwapPhrases.some(phrase => 
      lowerMessage.includes(phrase)
    );
    
    // Filter out educational/informational queries
    const educationalKeywords = [
      'how do', 'how does', 'what is', 'what are', 'explain', 'understand', 
      'learn', 'meaning', 'definition', 'work', 'works', 'difference',
      'help me understand', 'tell me about', 'info about', 'information'
    ];
    const isEducationalQuery = educationalKeywords.some(keyword => 
      lowerMessage.includes(keyword)
    );
    
    // If it's clearly an educational query, don't treat as swap intent
    if (isEducationalQuery) {
      return { isSwapIntent: false, confidence: 0 };
    }
    
    // More restrictive detection - require explicit swap intent
    const hasSwapIntent = hasExplicitSwapKeyword || hasTokenPattern || hasSpecificSwapPhrase;
    
    // Only allow buy/sell if it's clearly transactional and has token context
    if (hasBuySellKeyword && !hasSwapIntent) {
      const hasTokenContext = swapPhrasePattern.test(lowerMessage);
      const hasTransactionContext = /\b(\d+|\d+\.\d+|some|all|half)\b/i.test(lowerMessage);
      
      if (!hasTokenContext || !hasTransactionContext) {
        return { isSwapIntent: false, confidence: 0 };
      }
    }
    
    if (!hasSwapIntent && !hasBuySellKeyword) {
      return { isSwapIntent: false, confidence: 0 };
    }

    // Extract tokens and amounts using dynamic token list
    const result = await this.extractSwapParametersAsync(message, availableTokens);
    
    // For simple "I want to swap" or "swap tokens", use defaults
    if (hasExplicitSwapKeyword && !result.inputToken && !result.outputToken) {
      result.inputToken = 'ETH';
      result.outputToken = 'USDC';
      result.amount = '';
    }
    
    // Start with lower base confidence and require more evidence
    let confidence = 0.3;
    
    // Increase confidence based on explicit indicators
    if (hasExplicitSwapKeyword) confidence += 0.4;
    if (hasTokenPattern) confidence += 0.3;
    if (hasSpecificSwapPhrase) confidence += 0.3;
    if (result.inputToken) confidence += 0.15;
    if (result.outputToken) confidence += 0.15;
    if (result.amount) confidence += 0.2;
    
    // Require minimum confidence threshold of 0.7 for swap intent
    if (confidence < 0.7) {
      return { isSwapIntent: false, confidence: 0 };
    }
    
    const missingParams: string[] = [];
    if (!result.inputToken && !result.outputToken) {
      missingParams.push('tokens');
    }
    
    return {
      isSwapIntent: true,
      confidence,
      ...result,
      missingParams: missingParams.length > 0 ? missingParams : undefined
    };
  }

  /**
   * Detect swap intent from user message (original sync version for backward compatibility)
   */
  detectSwapIntent(message: string): SwapIntent {
    const lowerMessage = message.toLowerCase();
    
    // Check for explicit swap keywords - be more strict
    const explicitSwapKeywords = ['swap', 'exchange', 'convert', 'trade'];
    const buyBellKeywords = ['buy', 'sell'];
    const hasExplicitSwapKeyword = explicitSwapKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasBuySellKeyword = buyBellKeywords.some(keyword => lowerMessage.includes(keyword));
    
    // Check for token-to-token patterns with explicit directional words
    const tokenPattern = /\b(eth|weth|usdc|usdt|dai|aero|brett|degen|higher|morpho)\b.*\b(to|for|into|->|→)\b.*\b(eth|weth|usdc|usdt|dai|aero|brett|degen|higher|morpho)\b/i;
    const hasTokenPattern = tokenPattern.test(lowerMessage);
    
    // More specific swap phrases that clearly indicate trading intent
    const specificSwapPhrases = [
      'want to swap',
      'need to swap',
      'looking to swap', 
      'i want to trade',
      'i need to trade',
      'want to exchange',
      'need to exchange'
    ];
    const hasSpecificSwapPhrase = specificSwapPhrases.some(phrase => 
      lowerMessage.includes(phrase)
    );
    
    // Filter out educational/informational queries
    const educationalKeywords = [
      'how do', 'how does', 'what is', 'what are', 'explain', 'understand', 
      'learn', 'meaning', 'definition', 'work', 'works', 'difference',
      'help me understand', 'tell me about', 'info about', 'information'
    ];
    const isEducationalQuery = educationalKeywords.some(keyword => 
      lowerMessage.includes(keyword)
    );
    
    // If it's clearly an educational query, don't treat as swap intent
    if (isEducationalQuery) {
      return { isSwapIntent: false, confidence: 0 };
    }
    
    // More restrictive detection - require explicit swap intent
    const hasSwapIntent = hasExplicitSwapKeyword || hasTokenPattern || hasSpecificSwapPhrase;
    
    // Only allow buy/sell if it's clearly transactional and has token context
    if (hasBuySellKeyword && !hasSwapIntent) {
      const hasTokenContext = /\b(eth|weth|usdc|usdt|dai|aero|brett|degen|higher|morpho)\b/i.test(lowerMessage);
      const hasTransactionContext = /\b(\d+|\d+\.\d+|some|all|half)\b/i.test(lowerMessage);
      
      if (!hasTokenContext || !hasTransactionContext) {
        return { isSwapIntent: false, confidence: 0 };
      }
    }
    
    if (!hasSwapIntent && !hasBuySellKeyword) {
      return { isSwapIntent: false, confidence: 0 };
    }

    // Extract tokens and amounts
    const result = this.extractSwapParameters(message);
    
    // For simple "I want to swap" or "swap tokens", use defaults
    if (hasExplicitSwapKeyword && !result.inputToken && !result.outputToken) {
      result.inputToken = 'ETH';
      result.outputToken = 'USDC';
      result.amount = '';
    }
    
    // Start with lower base confidence and require more evidence
    let confidence = 0.3;
    
    // Increase confidence based on explicit indicators
    if (hasExplicitSwapKeyword) confidence += 0.4;
    if (hasTokenPattern) confidence += 0.3;
    if (hasSpecificSwapPhrase) confidence += 0.3;
    if (result.inputToken) confidence += 0.15;
    if (result.outputToken) confidence += 0.15;
    if (result.amount) confidence += 0.2;
    
    // Require minimum confidence threshold of 0.7 for swap intent
    if (confidence < 0.7) {
      return { isSwapIntent: false, confidence: 0 };
    }
    
    const missingParams: string[] = [];
    if (!result.inputToken && !result.outputToken) {
      missingParams.push('tokens');
    }
    
    return {
      isSwapIntent: true,
      confidence,
      ...result,
      missingParams: missingParams.length > 0 ? missingParams : undefined
    };
  }

  /**
   * Extract swap parameters from message (async version with dynamic tokens)
   */
  private async extractSwapParametersAsync(message: string, availableTokens: string[]): Promise<Partial<SwapIntent>> {
    const result: Partial<SwapIntent> = {};
    
    // Create dynamic patterns using available tokens
    const tokenList = availableTokens.join('|');
    const patterns = [
      // "I want to swap tokens AERO and ETH" or "swap tokens X and Y"
      new RegExp(`(?:want\\s+to\\s+)?swap\\s+(?:tokens\\s+)?(${tokenList})\\s+(?:and|for|to|with)\\s+(${tokenList})`, 'i'),
      // "swap USDC for AERO" or "swap USDC to AERO"
      new RegExp(`swap\\s+(${tokenList})\\s+(?:for|to|into)\\s+(${tokenList})`, 'i'),
      // "swap 1 ETH for USDC"
      new RegExp(`swap\\s+(\\d+(?:\\.\\d+)?)\\s+(${tokenList})\\s+(?:for|to|into)\\s+(${tokenList})`, 'i'),
      // "buy USDC with 1 ETH"
      new RegExp(`buy\\s+(${tokenList})\\s+with\\s+(\\d+(?:\\.\\d+)?)\\s+(${tokenList})`, 'i'),
      // "sell 1 ETH for USDC"
      new RegExp(`sell\\s+(\\d+(?:\\.\\d+)?)\\s+(${tokenList})\\s+(?:for|to|into)\\s+(${tokenList})`, 'i'),
      // "convert 1 ETH to USDC"
      new RegExp(`convert\\s+(\\d+(?:\\.\\d+)?)\\s+(${tokenList})\\s+to\\s+(${tokenList})`, 'i'),
      // "exchange 1 ETH for USDC"
      new RegExp(`exchange\\s+(\\d+(?:\\.\\d+)?)\\s+(${tokenList})\\s+(?:for|to|into)\\s+(${tokenList})`, 'i'),
      // "trade 1 ETH for USDC"
      new RegExp(`trade\\s+(\\d+(?:\\.\\d+)?)\\s+(${tokenList})\\s+(?:for|to|into)\\s+(${tokenList})`, 'i'),
      // "1 ETH to USDC"
      new RegExp(`(\\d+(?:\\.\\d+)?)\\s+(${tokenList})\\s+(?:to|for|into)\\s+(${tokenList})`, 'i'),
      // "ETH to USDC" or "ETH for USDC"
      new RegExp(`(${tokenList})\\s+(?:to|for|into|->|→)\\s+(${tokenList})`, 'i'),
      // "I want USDC" or "I need USDC" - moved to end for lower priority
      new RegExp(`(?:want|need|get)\\s+(?:some\\s+)?(${tokenList})$`, 'i'),
      // "switch to USDC"
      new RegExp(`switch\\s+to\\s+(${tokenList})`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        // Handle different pattern types based on the pattern structure
        if (pattern.source.includes('want\\s+to\\s+)?swap')) {
          result.inputToken = this.safeNormalizeToken(match[1], availableTokens);
          result.outputToken = this.safeNormalizeToken(match[2], availableTokens);
        } else if (pattern.source.includes('buy')) {
          result.outputToken = this.safeNormalizeToken(match[1], availableTokens);
          result.amount = match[2] || '';
          result.inputToken = this.safeNormalizeToken(match[3], availableTokens);
        } else if (pattern.source.includes('want|need|get')) {
          result.outputToken = this.safeNormalizeToken(match[1], availableTokens);
          if (!result.inputToken) {
            result.inputToken = 'ETH';
          }
        } else if (pattern.source.includes('switch\\s+to')) {
          result.outputToken = this.safeNormalizeToken(match[1], availableTokens);
          if (!result.inputToken) {
            result.inputToken = 'ETH';
          }
        } else if (pattern.source.startsWith('swap\\s+') && match.length === 3) {
          result.inputToken = this.safeNormalizeToken(match[1], availableTokens);
          result.outputToken = this.safeNormalizeToken(match[2], availableTokens);
        } else if (match.length === 2) {
          result.outputToken = this.safeNormalizeToken(match[1], availableTokens);
          if (!result.inputToken) {
            result.inputToken = 'ETH';
          }
        } else if (match.length === 3) {
          result.inputToken = this.safeNormalizeToken(match[1], availableTokens);
          result.outputToken = this.safeNormalizeToken(match[2], availableTokens);
        } else if (match.length === 4) {
          result.amount = match[1] || '';
          result.inputToken = this.safeNormalizeToken(match[2], availableTokens);
          result.outputToken = this.safeNormalizeToken(match[3], availableTokens);
        }
        break;
      }
    }

    // Check for percentage amounts
    const percentMatch = message.match(new RegExp(`(\\d+)%\\s+(?:of\\s+)?(${tokenList})`, 'i'));
    if (percentMatch) {
      result.amount = percentMatch[1] || '';
      result.isPercentage = true;
      if (!result.inputToken) {
        result.inputToken = this.safeNormalizeToken(percentMatch[2]);
      }
    }

    // Check for "all" keyword
    if (message.toLowerCase().includes('all')) {
      result.amount = '100';
      result.isPercentage = true;
    }

    return result;
  }

  /**
   * Extract swap parameters from message (original static version)
   */
  private extractSwapParameters(message: string): Partial<SwapIntent> {
    const result: Partial<SwapIntent> = {};
    
    // Pattern variations for swap detection - expanded and ordered by specificity
    const patterns = [
      // "I want to swap tokens AERO and ETH" or "swap tokens X and Y"
      /(?:want\s+to\s+)?swap\s+(?:tokens\s+)?(\w+)\s+(?:and|for|to|with)\s+(\w+)/i,
      // "swap USDC for AERO" or "swap USDC to AERO"
      /swap\s+(\w+)\s+(?:for|to|into)\s+(\w+)/i,
      // "swap 1 ETH for USDC"
      /swap\s+(\d+(?:\.\d+)?)\s+(\w+)\s+(?:for|to|into)\s+(\w+)/i,
      // "buy USDC with 1 ETH"
      /buy\s+(\w+)\s+with\s+(\d+(?:\.\d+)?)\s+(\w+)/i,
      // "sell 1 ETH for USDC"
      /sell\s+(\d+(?:\.\d+)?)\s+(\w+)\s+(?:for|to|into)\s+(\w+)/i,
      // "convert 1 ETH to USDC"
      /convert\s+(\d+(?:\.\d+)?)\s+(\w+)\s+to\s+(\w+)/i,
      // "exchange 1 ETH for USDC"
      /exchange\s+(\d+(?:\.\d+)?)\s+(\w+)\s+(?:for|to|into)\s+(\w+)/i,
      // "trade 1 ETH for USDC"
      /trade\s+(\d+(?:\.\d+)?)\s+(\w+)\s+(?:for|to|into)\s+(\w+)/i,
      // "1 ETH to USDC"
      /(\d+(?:\.\d+)?)\s+(\w+)\s+(?:to|for|into)\s+(\w+)/i,
      // "ETH to USDC" or "ETH for USDC"
      /(\w+)\s+(?:to|for|into|->|→)\s+(\w+)/i,
      // "I want USDC" or "I need USDC" - moved to end for lower priority
      /(?:want|need|get)\s+(?:some\s+)?(\w+)$/i,
      // "switch to USDC"
      /switch\s+to\s+(\w+)/i,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        // Check for specific patterns first
        if (pattern.source.includes('want\\s+to\\s+)?swap')) {
          // "I want to swap USDC and AERO" pattern
          result.inputToken = this.safeNormalizeToken(match[1]);
          result.outputToken = this.safeNormalizeToken(match[2]);
        } else if (pattern.source.includes('buy')) {
          // Buy pattern: buy [output] with [amount] [input]
          result.outputToken = this.safeNormalizeToken(match[1]);
          result.amount = match[2] || '';
          result.inputToken = this.safeNormalizeToken(match[3]);
        } else if (pattern.source.includes('want|need|get')) {
          // Want/need pattern: just output token
          result.outputToken = this.safeNormalizeToken(match[1]);
          // Default input token to ETH if not specified
          if (!result.inputToken) {
            result.inputToken = 'ETH';
          }
        } else if (pattern.source.includes('switch\\s+to')) {
          // Switch pattern: switch to [output]
          result.outputToken = this.safeNormalizeToken(match[1]);
          // Default input token to ETH if not specified
          if (!result.inputToken) {
            result.inputToken = 'ETH';
          }
        } else if (pattern.source.startsWith('swap\\s+') && match.length === 3) {
          // Swap pattern without amount: swap [input] to [output]
          result.inputToken = this.safeNormalizeToken(match[1]);
          result.outputToken = this.safeNormalizeToken(match[2]);
        } else if (match.length === 2) {
          // Single token pattern - assume it's the output
          result.outputToken = this.safeNormalizeToken(match[1]);
          if (!result.inputToken) {
            result.inputToken = 'ETH';
          }
        } else if (match.length === 3) {
          // Token to token pattern without amount
          result.inputToken = this.safeNormalizeToken(match[1]);
          result.outputToken = this.safeNormalizeToken(match[2]);
        } else if (match.length === 4) {
          // Standard pattern with amount
          result.amount = match[1] || '';
          result.inputToken = this.safeNormalizeToken(match[2]);
          result.outputToken = this.safeNormalizeToken(match[3]);
        }
        break;
      }
    }

    // Check for percentage amounts (e.g., "swap 50% of ETH")
    const percentMatch = message.match(/(\d+)%\s+(?:of\s+)?(\w+)/i);
    if (percentMatch) {
      result.amount = percentMatch[1] || '';
      result.isPercentage = true;
      if (!result.inputToken) {
        result.inputToken = this.safeNormalizeToken(percentMatch[2]);
      }
    }

    // Check for "all" keyword
    if (message.toLowerCase().includes('all')) {
      result.amount = '100';
      result.isPercentage = true;
    }

    return result;
  }

  /**
   * Safe token normalization with null checking
   */
  private safeNormalizeToken(token: string | undefined, availableTokens?: string[]): string {
    if (!token) {
      return 'ETH'; // Default fallback
    }
    return this.normalizeToken(token, availableTokens);
  }

  /**
   * Normalize token symbol
   */
  private normalizeToken(token: string, availableTokens?: string[]): string {
    const upper = token.toUpperCase();
    
    // If available tokens list is provided, check against it first
    if (availableTokens) {
      const matchingToken = availableTokens.find(t => t.toUpperCase() === upper);
      if (matchingToken) {
        return matchingToken.toUpperCase();
      }
    }
    
    // Check if it's a known token in hardcoded list
    if (BASE_TOKENS[upper]) {
      return upper;
    }
    
    // Common aliases
    const aliases: Record<string, string> = {
      'ETHEREUM': 'ETH',
      'ETHER': 'ETH',
      'BITCOIN': 'BTC',
      'TETHER': 'USDT',
      'USDCOIN': 'USDC',
      'STABLE': 'USDC', // Default stablecoin
    };
    
    return aliases[upper] || upper;
  }

  /**
   * Get token details (with fallback to dynamic tokens)
   */
  getTokenDetails(symbol: string): TokenMapping | null {
    // First check static mapping
    const staticToken = BASE_TOKENS[symbol.toUpperCase()];
    if (staticToken) {
      return staticToken;
    }
    
    // This is a synchronous method, so we can't await the dynamic token service
    // Return null and let the calling code handle the dynamic lookup
    return null;
  }

  /**
   * Get token details asynchronously using dynamic token service
   */
  async getTokenDetailsAsync(symbol: string): Promise<TokenMapping | null> {
    // First check static mapping
    const staticToken = BASE_TOKENS[symbol.toUpperCase()];
    if (staticToken) {
      return staticToken;
    }

    try {
      // Try dynamic token service
      const dynamicToken = await tokenService.getTokenBySymbol(symbol);
      if (dynamicToken && dynamicToken.address) {
        return {
          symbol: dynamicToken.symbol,
          address: dynamicToken.address,
          decimals: dynamicToken.decimals || 18
        };
      }
    } catch (error) {
      console.warn(`Failed to fetch token details for ${symbol}:`, error);
    }

    return null;
  }

  /**
   * Get all available token symbols
   */
  async getAvailableTokens(): Promise<string[]> {
    try {
      const tokens = await tokenService.getPopularTokens();
      return tokens.map(token => token.symbol);
    } catch (error) {
      console.warn('Failed to fetch available tokens:', error);
      return Object.keys(BASE_TOKENS);
    }
  }

  /**
   * Format swap message for confirmation
   */
  formatSwapConfirmation(
    inputToken: string,
    outputToken: string,
    amount: string,
    estimatedOutput?: string
  ): string {
    const inputDetails = this.getTokenDetails(inputToken);
    const outputDetails = this.getTokenDetails(outputToken);
    
    let message = `🔄 **Swap Confirmation**\n\n`;
    message += `**From:** ${amount} ${inputToken}\n`;
    message += `**To:** ${estimatedOutput ? estimatedOutput + ' ' : ''}${outputToken}\n`;
    
    if (inputDetails && outputDetails) {
      message += `\n**Route:** ${inputToken} → ${outputToken} on Base\n`;
    }
    
    return message;
  }

  /**
   * Generate clarifying questions for incomplete swap requests
   */
  generateClarifyingQuestion(missingParams: string[]): string {
    if (missingParams.includes('amount')) {
      return "How much would you like to swap? You can specify an amount (e.g., '1 ETH') or a percentage (e.g., '50%').";
    }
    
    if (missingParams.includes('input token') && missingParams.includes('output token')) {
      return "Which tokens would you like to swap? For example: 'swap ETH for USDC' or 'convert DAI to WETH'.";
    }
    
    if (missingParams.includes('input token')) {
      return "Which token would you like to swap from? Common options include ETH, USDC, DAI, etc.";
    }
    
    if (missingParams.includes('output token')) {
      return "Which token would you like to receive? Common options include ETH, USDC, DAI, etc.";
    }
    
    return "Please provide more details about your swap. For example: 'swap 1 ETH for USDC'.";
  }
}

export const swapDetectionService = SwapDetectionService.getInstance();