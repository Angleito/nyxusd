import type { VercelRequest, VercelResponse } from '@vercel/node';

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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({
    tools: [
      {
        name: "crypto_price",
        description: "Get current cryptocurrency prices with real-time data",
        params: ["symbol"],
        examples: ["BTC", "ETH", "SOL"],
      },
      {
        name: "market_trends",
        description: "Analyze market trends and sentiment using AI",
        params: ["timeframe"],
        examples: ["1h", "24h", "7d", "30d"],
      },
      {
        name: "portfolio_analysis",
        description: "Analyze portfolio risk and performance with tailored recommendations",
        params: ["holdings"],
        examples: [{ symbol: "BTC", amount: 0.5, purchasePrice: 45000 }],
      },
      {
        name: "defi_rates",
        description: "Get DeFi yield rates across protocols",
        params: ["protocol", "chain"],
        examples: { protocol: "Aave", chain: "ethereum" },
      },
    ],
    features: {
      streaming: true,
      memoryContext: true,
      conversationSummary: true,
      userProfiles: true,
      tailoredPrompts: true,
    },
    integrations: {
      mcp: {
        connected: true,
        server: "crypto-intelligence-mcp",
        version: "1.0.0",
      },
      langchain: {
        enabled: true,
        memorySupport: true,
        conversationChains: true,
        tools: ["crypto_price", "market_trends", "portfolio_analysis", "defi_rates"],
      },
      openRouter: {
        enabled: true,
        models: ["gpt-4", "gpt-3.5-turbo", "claude-2"],
      },
    },
    endpoints: {
      chat: "/api/ai-assistant",
      stream: "/api/ai-assistant/stream",
      crypto: "/api/ai-assistant/crypto",
      health: "/api/ai-assistant/health",
      tools: "/api/ai-assistant/tools",
      portfolio: "/api/ai-assistant/portfolio/analyze",
      defi: "/api/ai-assistant/defi/opportunities",
      market: "/api/ai-assistant/market/analysis",
    },
  });
}