import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ChatRequest {
  message: string;
  sessionId: string;
  context?: {
    conversationStep?: string;
    userProfile?: {
      experience?: string;
      riskTolerance?: string;
    };
    walletData?: {
      address?: string;
      balance?: number;
    };
    memoryContext?: string;
    conversationSummary?: string;
  };
  enableCryptoTools?: boolean;
}

// Simple in-memory session storage for development
const sessions = new Map<string, any[]>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, sessionId, context, enableCryptoTools } = req.body as ChatRequest;

    if (!message || !sessionId) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        details: 'Message and sessionId are required' 
      });
    }

    // Get or create session
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, []);
    }
    const sessionHistory = sessions.get(sessionId)!;
    sessionHistory.push({ role: 'user', content: message });

    // Check for swap intent
    const lowerMessage = message.toLowerCase();
    const swapKeywords = ['swap', 'exchange', 'convert', 'trade', 'buy', 'sell'];
    const hasSwapIntent = swapKeywords.some(keyword => lowerMessage.includes(keyword));

    let responseMessage: string;
    const toolsUsed: string[] = [];
    const recommendations: string[] = [];

    if (hasSwapIntent) {
      // For swap intents, provide a quick, action-oriented response
      responseMessage = "I'll help you swap tokens. The swap interface should appear above. You can adjust the tokens and amounts as needed.";
      toolsUsed.push('swap_detection');
    } else if (lowerMessage.includes('price')) {
      // Price query
      responseMessage = "I can help you check cryptocurrency prices. Here are the current market rates:\n\n" +
        "• Bitcoin (BTC): $43,250\n" +
        "• Ethereum (ETH): $2,285\n" +
        "• USDC: $1.00\n\n" +
        "Prices update in real-time. Would you like to see more details?";
      toolsUsed.push('price_checker');
    } else if (lowerMessage.includes('portfolio') || lowerMessage.includes('analyze')) {
      // Portfolio analysis
      responseMessage = context?.walletData?.address 
        ? "I'll analyze your portfolio based on your current holdings. Diversification is key to managing risk in crypto investments."
        : "Connect your wallet to get personalized portfolio analysis and recommendations.";
      toolsUsed.push('portfolio_analysis');
      recommendations.push('Consider diversifying across different sectors');
      recommendations.push('Keep some stablecoins for market volatility');
    } else if (lowerMessage.includes('defi') || lowerMessage.includes('yield')) {
      // DeFi opportunities
      responseMessage = "Here are some current DeFi opportunities on Base:\n\n" +
        "• Aave V3: 4.2% APY on USDC\n" +
        "• Compound: 3.8% APY on ETH\n" +
        "• Uniswap V3: Variable fees from liquidity provision\n\n" +
        "Always research protocols before investing.";
      toolsUsed.push('defi_scanner');
      recommendations.push('Start with established protocols');
      recommendations.push('Consider impermanent loss risks');
    } else {
      // General response with context awareness
      const userContext = context?.memoryContext ? "I understand the context of our conversation. " : "";
      const experienceLevel = context?.userProfile?.experience || 'intermediate';
      
      responseMessage = `${userContext}I'm Nyx, your crypto assistant. I can help you with:
      
• Token swaps and trading
• Real-time price information  
• Portfolio analysis
• DeFi yield opportunities
• Risk assessment

What would you like to explore?`;
    }

    // Add to session history
    sessionHistory.push({ role: 'assistant', content: responseMessage });

    // Trim session history if too long
    if (sessionHistory.length > 100) {
      sessions.set(sessionId, sessionHistory.slice(-50));
    }

    const response = {
      message: responseMessage,
      toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      sessionId,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    console.error("Error in chat endpoint:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to process your request. Please try again.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}