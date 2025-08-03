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
   * Detect swap intent from user message
   */
  detectSwapIntent(message: string): SwapIntent {
    const lowerMessage = message.toLowerCase();
    
    // Check for swap keywords - more aggressive detection
    const swapKeywords = ['swap', 'exchange', 'convert', 'trade', 'buy', 'sell', 'change', 'switch'];
    const hasSwapKeyword = swapKeywords.some(keyword => lowerMessage.includes(keyword));
    
    // Also check for token-to-token patterns even without explicit swap keywords
    const tokenPattern = /\b(eth|weth|usdc|usdt|dai|aero|brett|degen|higher)\b.*\b(to|for|into|->|→)\b.*\b(eth|weth|usdc|usdt|dai|aero|brett|degen|higher)\b/i;
    const hasTokenPattern = tokenPattern.test(lowerMessage);
    
    // Check for phrases that imply swapping
    const swapPhrases = [
      'want to get',
      'need some',
      'looking to acquire',
      'want some',
      'get me',
      'i need'
    ];
    const hasSwapPhrase = swapPhrases.some(phrase => 
      lowerMessage.includes(phrase) && /\b(eth|weth|usdc|usdt|dai|aero|brett|degen|higher)\b/i.test(lowerMessage)
    );
    
    if (!hasSwapKeyword && !hasTokenPattern && !hasSwapPhrase) {
      return { isSwapIntent: false, confidence: 0 };
    }

    // Extract tokens and amounts
    const result = this.extractSwapParameters(message);
    
    // For simple "I want to swap" or "swap tokens", use defaults
    if (hasSwapKeyword && !result.inputToken && !result.outputToken) {
      // Set reasonable defaults to show UI immediately
      result.inputToken = 'ETH';
      result.outputToken = 'USDC';
      result.amount = '';
    }
    
    // Calculate confidence based on completeness
    let confidence = 0.5; // Higher base confidence for having swap intent
    
    if (result.inputToken) confidence += 0.15;
    if (result.outputToken) confidence += 0.15;
    if (result.amount) confidence += 0.2;
    
    // If we have at least one token mentioned, boost confidence
    if (result.inputToken || result.outputToken) {
      confidence = Math.max(confidence, 0.7);
    }
    
    // Check for missing parameters but don't block UI
    const missingParams: string[] = [];
    // Only mark as missing if we truly need them
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
   * Extract swap parameters from message
   */
  private extractSwapParameters(message: string): Partial<SwapIntent> {
    const result: Partial<SwapIntent> = {};
    
    // Pattern variations for swap detection - expanded and ordered by specificity
    const patterns = [
      // "I want to swap USDC and AERO" or "swap USDC and AERO"
      /(?:want\s+to\s+)?swap\s+(\w+)\s+(?:and|for|to|with)\s+(\w+)/i,
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
          result.inputToken = this.normalizeToken(match[1]);
          result.outputToken = this.normalizeToken(match[2]);
        } else if (pattern.source.includes('buy')) {
          // Buy pattern: buy [output] with [amount] [input]
          result.outputToken = this.normalizeToken(match[1]);
          result.amount = match[2];
          result.inputToken = this.normalizeToken(match[3]);
        } else if (pattern.source.includes('want|need|get')) {
          // Want/need pattern: just output token
          result.outputToken = this.normalizeToken(match[1]);
          // Default input token to ETH if not specified
          if (!result.inputToken) {
            result.inputToken = 'ETH';
          }
        } else if (pattern.source.includes('switch\\s+to')) {
          // Switch pattern: switch to [output]
          result.outputToken = this.normalizeToken(match[1]);
          // Default input token to ETH if not specified
          if (!result.inputToken) {
            result.inputToken = 'ETH';
          }
        } else if (pattern.source.startsWith('swap\\s+') && match.length === 3) {
          // Swap pattern without amount: swap [input] to [output]
          result.inputToken = this.normalizeToken(match[1]);
          result.outputToken = this.normalizeToken(match[2]);
        } else if (match.length === 2) {
          // Single token pattern - assume it's the output
          result.outputToken = this.normalizeToken(match[1]);
          if (!result.inputToken) {
            result.inputToken = 'ETH';
          }
        } else if (match.length === 3) {
          // Token to token pattern without amount
          result.inputToken = this.normalizeToken(match[1]);
          result.outputToken = this.normalizeToken(match[2]);
        } else if (match.length === 4) {
          // Standard pattern with amount
          result.amount = match[1];
          result.inputToken = this.normalizeToken(match[2]);
          result.outputToken = this.normalizeToken(match[3]);
        }
        break;
      }
    }

    // Check for percentage amounts (e.g., "swap 50% of ETH")
    const percentMatch = message.match(/(\d+)%\s+(?:of\s+)?(\w+)/i);
    if (percentMatch) {
      result.amount = percentMatch[1];
      result.isPercentage = true;
      if (!result.inputToken) {
        result.inputToken = this.normalizeToken(percentMatch[2]);
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
   * Normalize token symbol
   */
  private normalizeToken(token: string): string {
    const upper = token.toUpperCase();
    
    // Check if it's a known token
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
   * Get token details
   */
  getTokenDetails(symbol: string): TokenMapping | null {
    return BASE_TOKENS[symbol.toUpperCase()] || null;
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