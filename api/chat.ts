import type { VercelRequest, VercelResponse } from '@vercel/node';
import { coingeckoService } from './src/services/coingeckoService';

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
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, sessionId, context } = req.body as ChatRequest;

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
      
      // Extract token mentions for price context
      const tokenPattern = /\b(btc|bitcoin|eth|ethereum|usdc|usdt|dai|aave|uni|link|sol|avax|matic|doge|shib|pepe)\b/gi;
      const mentionedTokens = [...new Set(message.match(tokenPattern)?.map(t => t.toUpperCase()) || [])];
      
      if (mentionedTokens.length > 0) {
        try {
          const prices = await coingeckoService.getMultipleTokenPrices(mentionedTokens);
          if (Object.keys(prices).length > 0) {
            responseMessage += "\n\n" + coingeckoService.formatMultiplePrices(prices);
            toolsUsed.push('coingecko_prices');
          }
        } catch (error) {
          console.error('Error fetching token prices:', error);
        }
      }
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('worth')) {
      // Price query - fetch real prices from CoinGecko
      toolsUsed.push('price_checker', 'coingecko_api');
      
      // Extract specific tokens mentioned
      const tokenPattern = /\b(btc|bitcoin|eth|ethereum|usdc|usdt|dai|aave|uni|uniswap|link|chainlink|sol|solana|avax|avalanche|matic|polygon|doge|dogecoin|shib|shiba|pepe|arb|arbitrum|op|optimism)\b/gi;
      const mentionedTokens = [...new Set(message.match(tokenPattern)?.map(t => t.toUpperCase()) || [])];
      
      // Default tokens if none mentioned
      const tokensToFetch = mentionedTokens.length > 0 
        ? mentionedTokens 
        : ['BTC', 'ETH', 'USDC', 'SOL', 'MATIC'];
      
      try {
        const prices = await coingeckoService.getMultipleTokenPrices(tokensToFetch);
        
        if (Object.keys(prices).length > 0) {
          responseMessage = coingeckoService.formatMultiplePrices(prices);
          responseMessage += "\n\n💡 *Data from CoinGecko • Updates every minute*";
          responseMessage += "\n\nWould you like to see more details about any specific token?";
        } else {
          // Fallback if API fails
          responseMessage = "I'm having trouble fetching current prices. Please try again in a moment.";
        }
      } catch (error) {
        console.error('Error fetching prices:', error);
        responseMessage = "I'm experiencing issues connecting to price data. Please try again shortly.";
      }
    } else if (lowerMessage.includes('trending') || lowerMessage.includes('popular') || lowerMessage.includes('hot')) {
      // Trending tokens
      toolsUsed.push('trending_scanner', 'coingecko_api');
      
      try {
        const trending = await coingeckoService.getTrendingTokens();
        
        if (trending.length > 0) {
          responseMessage = "**🔥 Trending Tokens (Last 24h):**\n\n";
          responseMessage += trending.slice(0, 10).map((token, i) => 
            `${i + 1}. **${token.name}** (${token.symbol.toUpperCase()}) - Rank #${token.market_cap_rank || 'N/A'}`
          ).join('\n');
          responseMessage += "\n\n⚠️ *Trending tokens can be highly volatile. Always DYOR!*";
        } else {
          responseMessage = "Unable to fetch trending tokens at the moment. Please try again later.";
        }
      } catch (error) {
        console.error('Error fetching trending tokens:', error);
        responseMessage = "Failed to retrieve trending tokens. Please try again.";
      }
    } else if (lowerMessage.includes('portfolio') || lowerMessage.includes('analyze')) {
      // Portfolio analysis
      responseMessage = context?.walletData?.address 
        ? "I'll analyze your portfolio based on your current holdings. Let me fetch the latest market data...\n\n"
        : "Connect your wallet to get personalized portfolio analysis and recommendations.\n\n";
      
      // Fetch top market tokens for context
      try {
        const marketData = await coingeckoService.getMarketData(1, 10);
        if (marketData.length > 0) {
          responseMessage += "**Top 10 Cryptocurrencies by Market Cap:**\n";
          responseMessage += marketData.map((token, i) => 
            `${i + 1}. ${token.symbol.toUpperCase()} - $${token.current_price.toLocaleString()}`
          ).join('\n');
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
      
      toolsUsed.push('portfolio_analysis', 'market_data');
      recommendations.push('Consider diversifying across different sectors');
      recommendations.push('Keep some stablecoins for market volatility');
      recommendations.push('Review your portfolio allocation quarterly');
    } else if (lowerMessage.includes('defi') || lowerMessage.includes('yield') || lowerMessage.includes('apy')) {
      // DeFi opportunities with real token prices
      responseMessage = "Here are current DeFi opportunities on Base:\n\n";
      
      try {
        // Get prices for DeFi tokens
        const defiTokens = ['AAVE', 'UNI', 'USDC', 'ETH'];
        const prices = await coingeckoService.getMultipleTokenPrices(defiTokens);
        
        responseMessage += "**Popular DeFi Protocols:**\n";
        responseMessage += "• Aave V3: 4.2% APY on USDC lending\n";
        responseMessage += "• Compound: 3.8% APY on ETH\n";
        responseMessage += "• Uniswap V3: Variable fees from liquidity provision\n\n";
        
        if (Object.keys(prices).length > 0) {
          responseMessage += "**Current DeFi Token Prices:**\n";
          Object.entries(prices).forEach(([symbol, data]) => {
            const price = data.current_price.toLocaleString('en-US', { 
              style: 'currency', 
              currency: 'USD' 
            });
            responseMessage += `• ${symbol}: ${price}\n`;
          });
        }
        
        responseMessage += "\n⚠️ *Always research protocols and understand risks before investing.*";
      } catch (error) {
        console.error('Error fetching DeFi data:', error);
        responseMessage += "\nUnable to fetch current token prices.";
      }
      
      toolsUsed.push('defi_scanner', 'yield_aggregator');
      recommendations.push('Start with established protocols');
      recommendations.push('Consider impermanent loss risks');
      recommendations.push('Monitor gas fees on transactions');
    } else if (lowerMessage.includes('market') || lowerMessage.includes('overview')) {
      // Market overview
      toolsUsed.push('market_scanner', 'coingecko_api');
      
      try {
        const marketData = await coingeckoService.getMarketData(1, 20);
        
        if (marketData.length > 0) {
          const totalMarketCap = marketData.reduce((sum, token) => sum + (token.market_cap || 0), 0);
          const avgChange = marketData.reduce((sum, token) => sum + token.price_change_percentage_24h, 0) / marketData.length;
          
          responseMessage = "**📊 Market Overview:**\n\n";
          responseMessage += `Total Market Cap (Top 20): $${(totalMarketCap / 1e12).toFixed(2)}T\n`;
          responseMessage += `Average 24h Change: ${avgChange > 0 ? '📈' : '📉'} ${avgChange.toFixed(2)}%\n\n`;
          
          responseMessage += "**Top 5 by Market Cap:**\n";
          marketData.slice(0, 5).forEach(token => {
            const price = token.current_price.toLocaleString('en-US', { 
              style: 'currency', 
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: token.current_price < 1 ? 6 : 2
            });
            const changeEmoji = token.price_change_percentage_24h > 0 ? '📈' : '📉';
            responseMessage += `${token.market_cap_rank}. **${token.symbol.toUpperCase()}** - ${price} ${changeEmoji} ${token.price_change_percentage_24h.toFixed(2)}%\n`;
          });
          
          responseMessage += "\n*Data from CoinGecko • Updated every minute*";
        } else {
          responseMessage = "Unable to fetch market overview data. Please try again.";
        }
      } catch (error) {
        console.error('Error fetching market overview:', error);
        responseMessage = "Failed to retrieve market data. Please try again later.";
      }
    } else {
      // General response with context awareness
      const userContext = context?.memoryContext ? "I understand the context of our conversation. " : "";
      
      responseMessage = `${userContext}I'm Nyx, your AI-powered crypto assistant with real-time market data. I can help you with:
      
• 💱 Token swaps and trading
• 📊 Real-time price information from CoinGecko
• 📈 Portfolio analysis and recommendations
• 🌾 DeFi yield opportunities
• 🔥 Trending tokens and market overview
• ⚠️ Risk assessment and education

What would you like to explore today?`;
      
      // Add some current market context
      try {
        const topTokens = await coingeckoService.getMultipleTokenPrices(['BTC', 'ETH']);
        if (Object.keys(topTokens).length > 0) {
          responseMessage += "\n\n**Quick Market Update:**\n";
          Object.entries(topTokens).forEach(([symbol, data]) => {
            const price = data.current_price.toLocaleString('en-US', { 
              style: 'currency', 
              currency: 'USD' 
            });
            const changeEmoji = data.price_change_percentage_24h > 0 ? '📈' : '📉';
            responseMessage += `• ${symbol}: ${price} ${changeEmoji} ${data.price_change_percentage_24h.toFixed(2)}%\n`;
          });
        }
      } catch (error) {
        console.error('Error fetching market update:', error);
      }
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
      details: process.env['NODE_ENV'] === 'development' ? error.message : undefined,
    });
  }
}