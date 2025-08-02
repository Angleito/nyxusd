import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, sessionId, context, enableCryptoTools } = req.body;

    if (!OPENROUTER_API_KEY) {
      console.error('OpenRouter API key not found in environment variables');
      return res.status(500).json({
        error: "Configuration error",
        message: "OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.",
        debug: process.env.NODE_ENV === 'development' ? 'Key not found' : undefined
      });
    }

    // Build context-aware prompt
    let systemPrompt = "You are NYX, an AI assistant specialized in cryptocurrency, DeFi, and blockchain technology. You help users with investment strategies, portfolio analysis, and understanding DeFi protocols.";
    
    if (context?.userProfile) {
      systemPrompt += ` The user has ${context.userProfile.experience || 'some'} experience in crypto, ${context.userProfile.riskTolerance || 'moderate'} risk tolerance.`;
      if (context.userProfile.investmentGoals?.length) {
        systemPrompt += ` Their goals include: ${context.userProfile.investmentGoals.join(', ')}.`;
      }
    }

    if (context?.walletData?.holdings) {
      systemPrompt += ` User's portfolio includes: ${context.walletData.holdings.map((h: any) => `${h.amount} ${h.symbol}`).join(', ')}.`;
    }

    console.log('Calling OpenRouter API with message:', message);

    // Call OpenRouter API
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nyxusd-git-main-angleitos-projects.vercel.app',
        'X-Title': 'NYX USD Assistant',
      },
      body: JSON.stringify({
        model: 'qwen/qwen3-coder:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      
      // Parse error if possible
      let errorMessage = 'Failed to get AI response';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
      } catch {
        // Use text as-is if not JSON
      }
      
      return res.status(500).json({
        error: "AI service error",
        message: errorMessage,
        status: response.status,
        debug: process.env.NODE_ENV === 'development' ? errorText : undefined
      });
    }

    const data = await response.json();
    console.log('OpenRouter response received');
    
    const aiResponse = data.choices?.[0]?.message?.content || data.message || "I couldn't generate a response. Please try again.";

    // Structure response
    const result = {
      message: aiResponse,
      toolsUsed: enableCryptoTools ? ['analysis'] : undefined,
      recommendations: context?.userProfile ? [
        "Consider diversifying your portfolio across different sectors",
        "Research DeFi yield opportunities matching your risk profile",
        "Stay updated with market trends and protocol updates"
      ].filter(() => Math.random() > 0.5) : undefined,
    };

    res.json(result);
  } catch (error: any) {
    console.error("Error in enhanced chat endpoint:", error.message, error.stack);

    res.status(500).json({
      error: "Internal server error",
      message: error.message || "Failed to process your request. Please try again.",
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}